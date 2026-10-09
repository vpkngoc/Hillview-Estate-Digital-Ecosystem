"""
Visitor engine analytics (Engine B): daily visitor demand forecast.

Model: Negative Binomial GLM (log link) on daily grounds visitors with
drivers = day of week, NSW school holidays, NSW public holidays, regional
events (Tulip Time etc.), rain day, temperature distance from 23 °C, and a
log-time awareness trend.

For future days the weather is unknown, so we integrate over BOM climate
normals (rain probability and mean max temperature for the month) by
Monte-Carlo simulation, which also produces the 80% prediction interval.

Validation: the last 8 weeks of history are held out, the model is re-fitted
on the earlier data and scored (MAE, MAPE) — reported in the Console.

NOTE: history is synthetic in the demo; in production the same pipeline would
train on real check-in counts from the booking platform.
"""
from __future__ import annotations

import math
from datetime import date, timedelta

import numpy as np
import pandas as pd
import statsmodels.api as sm
import statsmodels.formula.api as smf

import reference_data as R

FORMULA = ("visitors ~ C(dow) + school_holiday + public_holiday + regional_event + rain"
           " + temp_dev2 + np.log1p(t)")
DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


def _prep(df):
    df = df.copy()
    df["temp_dev2"] = (df["tmax"] - 23.0) ** 2
    return df


def fit(df, alpha=None):
    df = _prep(df)
    if alpha is None:
        # estimate NB dispersion with a discrete NB model, then use it in the GLM
        nb = smf.negativebinomial(FORMULA, df).fit(disp=0, maxiter=200)
        alpha = float(nb.params["alpha"])
    model = smf.glm(FORMULA, df, family=sm.families.NegativeBinomial(alpha=alpha)).fit()
    return model, alpha


def _future_frame(start: date, days: int, t0: date):
    rows = []
    for i in range(days):
        d = start + timedelta(days=i)
        tmax, raindays = R.BOM_MOSS_VALE[d.month]
        dim = (date(d.year + (d.month == 12), d.month % 12 + 1, 1) - timedelta(days=1)).day
        rows.append(dict(date=d, dow=d.weekday(), school_holiday=int(R.is_school_holiday(d)),
                         public_holiday=int(R.is_public_holiday(d)),
                         regional_event=int(R.regional_event(d) is not None),
                         event_name=R.regional_event(d), clim_tmax=tmax, p_rain=raindays / dim,
                         t=(d - t0).days))
    return pd.DataFrame(rows)


def forecast(model, alpha, start: date, days: int, t0: date, sims=2000, seed=7, cap=600):
    rng = np.random.default_rng(seed)
    fut = _future_frame(start, days, t0)
    out = []
    for _, r in fut.iterrows():
        rain = (rng.random(sims) < r.p_rain).astype(int)
        tmax = rng.normal(r.clim_tmax, 3.5, sims)
        X = pd.DataFrame(dict(dow=r.dow, school_holiday=r.school_holiday, public_holiday=r.public_holiday,
                              regional_event=r.regional_event, rain=rain, tmax=tmax, t=r.t))
        mu = model.predict(_prep(X)).to_numpy()
        # NB draw: gamma-Poisson mixture with shape 1/alpha
        lam = rng.gamma(1 / alpha, mu * alpha)
        y = np.minimum(rng.poisson(lam), cap)
        exp = float(mu.mean())
        lo, hi = np.percentile(y, [10, 90])
        out.append(dict(
            date=r.date.isoformat(), dow=DOW[r.dow], expected=round(exp), lo80=int(lo), hi80=int(hi),
            schoolHoliday=bool(r.school_holiday), publicHoliday=bool(r.public_holiday),
            regionalEvent=r.event_name, rainChance=round(100 * r.p_rain), climTmax=r.clim_tmax,
            guides=1 + math.ceil(hi / 80), frontOfHouse=1 + math.ceil(hi / 150),
        ))
    return out


def driver_effects(model):
    p = model.params
    ci = model.conf_int()

    def eff(name, label, note):
        return dict(driver=label, multiplier=round(float(np.exp(p[name])), 2),
                    lo=round(float(np.exp(ci.loc[name, 0])), 2), hi=round(float(np.exp(ci.loc[name, 1])), 2),
                    note=note)

    sat = "C(dow)[T.5]"
    sun = "C(dow)[T.6]"
    effects = [
        eff(sat, "Saturday vs Monday", "Weekend demand from Sydney and Canberra day-trippers"),
        eff(sun, "Sunday vs Monday", ""),
        eff("school_holiday", "NSW school holidays", "Source: NSW Dept of Education term dates"),
        eff("public_holiday", "NSW public holiday", "Source: Visit NSW"),
        eff("regional_event", "Regional event (e.g., Tulip Time)", "Source: Wingecarribee Shire Council"),
        eff("rain", "Rain day (≥1 mm)", "Source: BOM Moss Vale climate normals"),
    ]
    k = float(p["temp_dev2"])
    effects.append(dict(driver="Cold day (12 °C vs 23 °C)", multiplier=round(math.exp(k * 121), 2),
                        lo=None, hi=None, note="Quadratic temperature effect, peak comfort ≈23 °C"))
    return effects


def backtest(df, holdout_days=56):
    train, test = df.iloc[:-holdout_days], df.iloc[-holdout_days:]
    m, a = fit(train)
    pred = m.predict(_prep(test))
    mae = float(np.mean(np.abs(pred - test.visitors)))
    mape = float(np.mean(np.abs(pred - test.visitors) / np.maximum(test.visitors, 1))) * 100
    naive = train.groupby("dow").visitors.mean()
    naive_pred = test.dow.map(naive)
    naive_mae = float(np.mean(np.abs(naive_pred - test.visitors)))
    return dict(holdoutDays=holdout_days, mae=round(mae, 1), mape=round(mape, 1),
                naiveDowMae=round(naive_mae, 1),
                series=[dict(date=d, actual=int(a_), predicted=round(float(p_)))
                        for d, a_, p_ in zip(test.date, test.visitors, pred)])
