"""
Donor engine analytics (Engine A): loop stage, RFM segmentation, lapse risk.

RFM = Recency (days since last interaction), Frequency (number of
interactions), Monetary (total paid + given). Each is scored 1–5 by quintile
and mapped to named segments that the Development Officer can act on.
"""
from __future__ import annotations

from datetime import date

import numpy as np
import pandas as pd

LOOP_STAGES = ["Registered visitor", "Paid experience", "Friend (member)", "Donor", "Repeat donor"]
PAID = {"tour", "workshop", "event", "course", "school", "venue"}
GIFT = {"donation", "adoption"}


def loop_stage(rows, is_member):
    gifts = sum(1 for r in rows if r[1] in GIFT)
    if gifts >= 2:
        return "Repeat donor"
    if gifts == 1:
        return "Donor"
    if is_member:
        return "Friend (member)"
    if any(r[1] in PAID for r in rows):
        return "Paid experience"
    return "Registered visitor"


def rfm_segment(r, f, m):
    if r >= 4 and f >= 4 and m >= 4:
        return "Champions"
    if f >= 4 and m >= 3:
        return "Loyal supporters"
    if r >= 4 and f <= 2:
        return "New & promising"
    if r <= 2 and f >= 3:
        return "At risk"
    if r <= 2 and f <= 2:
        return "Hibernating"
    return "Needs attention"


def segment(world, today: date):
    recs = []
    for s in world.supporters:
        rows = world.inter.get(s["id"], [])
        last = max((r[0] for r in rows), default=s["created"])
        m = world.member.get(s["id"])
        is_member = m is not None and m["expires"] >= today.isoformat()
        recs.append(dict(id=s["id"], recency=(today - date.fromisoformat(last)).days,
                         frequency=len(rows), monetary=sum(r[3] for r in rows),
                         stage=loop_stage(rows, is_member), member=is_member,
                         everPaid=any(r[1] in PAID for r in rows), everMember=m is not None,
                         gifts=sum(1 for r in rows if r[1] in GIFT),
                         expires=m["expires"] if m else None))
    df = pd.DataFrame(recs)
    # quintile scores (rank first to break ties)
    df["R"] = pd.qcut(df["recency"].rank(method="first"), 5, labels=[5, 4, 3, 2, 1]).astype(int)
    df["F"] = pd.qcut(df["frequency"].rank(method="first"), 5, labels=[1, 2, 3, 4, 5]).astype(int)
    df["M"] = pd.qcut(df["monetary"].rank(method="first"), 5, labels=[1, 2, 3, 4, 5]).astype(int)
    df["segment"] = [rfm_segment(r, f, m) for r, f, m in zip(df.R, df.F, df.M)]

    # Lapse risk for members: renewal due within 60 days and quiet for 120+ days
    def lapse(row):
        if not isinstance(row["expires"], str):
            return None
        days_to_exp = (date.fromisoformat(row["expires"]) - today).days
        if days_to_exp < 0:
            return "Lapsed"
        if days_to_exp <= 60 and row["recency"] >= 120:
            return "High"
        if days_to_exp <= 60 or row["recency"] >= 180:
            return "Medium"
        return "Low"
    df["lapseRisk"] = df.apply(lapse, axis=1)
    return df


def funnel(df):
    """How many supporters have EVER reached each loop stage (stages are not strictly sequential:
    a visitor can give without joining). Conversion is relative to the previous stage."""
    counts = [len(df), int(df.everPaid.sum()), int(df.everMember.sum()), int(df.gifts.ge(1).sum()), int(df.gifts.ge(2).sum())]
    out = []
    for i, st in enumerate(LOOP_STAGES):
        conv = None if i == 0 else round(100 * counts[i] / max(counts[i - 1], 1), 1)
        out.append(dict(stage=st, reached=counts[i], conversionFromPrevious=conv))
    return out


def cohort_conversion(world, df):
    """Share of each monthly acquisition cohort that reached paid / member / donor."""
    created = {s["id"]: s["created"][:7] for s in world.supporters}
    order = {s: i for i, s in enumerate(LOOP_STAGES)}
    tmp = df.assign(cohort=df["id"].map(created))
    out = []
    for c, g in tmp.groupby("cohort"):
        n = len(g)
        out.append(dict(cohort=c, size=int(n),
                        paidPct=round(100 * g.everPaid.mean(), 1),
                        memberPct=round(100 * g.everMember.mean(), 1),
                        donorPct=round(100 * g.gifts.ge(1).mean(), 1)))
    return out


def segment_summary(df):
    g = df.groupby("segment").agg(supporters=("id", "count"), avgValue=("monetary", "mean"),
                                  avgRecency=("recency", "mean")).reset_index()
    g["avgValue"] = g["avgValue"].round(0)
    g["avgRecency"] = g["avgRecency"].round(0)
    return g.sort_values("supporters", ascending=False).to_dict("records")
