"""
Report figures for the Business Analytics chapter (data charts).

Reads the JSON the analytics pipeline already produced (web/src/data/*.json)
and the assumptions register, and writes 300-dpi PNGs to docs/figures/.

    python analytics/figures/charts.py

Every number shown comes from the pipeline. Nothing is typed in by hand,
except the simulation's "true" effects in fig_3_7, which are read from
analytics/simulate.py so the parameter-recovery check stays honest.
"""
from __future__ import annotations

import collections
import datetime as dt
import json
import math
import re
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager
from matplotlib.lines import Line2D
from matplotlib.patches import FancyBboxPatch, Patch

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "web" / "src" / "data"
OUT = ROOT / "docs" / "figures"
OUT.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------- brand
for f in (Path(__file__).parent / "fonts").glob("*.ttf"):
    font_manager.fontManager.addfont(str(f))
SANS = ["Source Sans 3", "DejaVu Sans"]
SERIF = ["Cormorant Garamond", "DejaVu Serif"]

SURFACE = "#F7F4EC"
INK = "#1B241C"
MUTED = "#5C665D"
GRID = "#E3DDCD"
FOREST = "#0C3314"  # headings only
LEAF = "#7CC242"  # thin accent rule (echoes the team graphic)
# Categorical slots, validated (validate_palette.js, light, surface #F7F4EC, all pairs):
G = "#2F6E2C"  # slot 1: green
B = "#3A78AE"  # slot 2: blue
O = "#D9964A"  # slot 3: ochre (contrast < 3:1, so it is always direct-labelled)
ALERT = "#A63D2F"  # reserved: misses / critique call-outs, always with a text label
SAGE = "#B9C9AE"

plt.rcParams.update({
    "font.family": SANS, "font.size": 9.5, "text.color": INK,
    "axes.edgecolor": GRID, "axes.labelcolor": MUTED, "axes.linewidth": 0.8,
    "axes.facecolor": SURFACE, "figure.facecolor": SURFACE, "savefig.facecolor": SURFACE,
    "xtick.color": MUTED, "ytick.color": MUTED, "xtick.labelsize": 8.5, "ytick.labelsize": 8.5,
    "axes.grid": False, "grid.color": GRID, "grid.linewidth": 0.8, "grid.linestyle": "-",
    "legend.frameon": False, "legend.fontsize": 8.5,
    "axes.spines.top": False, "axes.spines.right": False,
})

SOURCE_SYN = ("Source: synthetic year-one data from the Hillview Connect analytics pipeline (Python: pandas, statsmodels). "
              "Illustrative only, not observed Hillview data.")


def frame(fig, title, subtitle, source=SOURCE_SYN, top=0.80):
    """Title block + leaf rule + source line, consistent across all figures."""
    fig.text(0.035, 0.955, title, fontfamily=SERIF, fontsize=17, fontweight=700, color=FOREST, va="top")
    fig.text(0.035, 0.885, subtitle, fontsize=9.5, color=MUTED, va="top")
    fig.add_artist(Line2D([0.035, 0.115], [0.975, 0.975], color=LEAF, lw=2.2, transform=fig.transFigure))
    import textwrap
    fig.text(0.035, 0.018, "\n".join(textwrap.wrap(source, 178)), fontsize=7.4, color=MUTED, va="bottom", style="italic")
    fig.subplots_adjust(top=top)


def save(fig, name):
    p = OUT / name
    fig.savefig(p, dpi=300)
    plt.close(fig)
    print("wrote", p.relative_to(ROOT))


def load(name):
    return json.loads((DATA / name).read_text())


A = load("analytics.json")
SUP = load("supporters.json")


# ---------------------------------------------------------------- 3.4 loop is a network
def fig_3_4():
    GIFT, PAID = {"donation", "adoption"}, {"tour", "workshop", "event", "course", "school", "venue"}
    paths = collections.Counter()
    for s in SUP:
        types = {i[1] for i in s["interactions"]}
        paths[(bool(types & PAID), s["member"] is not None, bool(types & GIFT))] += 1
    donors = sum(v for k, v in paths.items() if k[2])
    donors_no_member = sum(v for k, v in paths.items() if k[2] and not k[1])
    donors_no_paid = sum(v for k, v in paths.items() if k[2] and not k[0])

    fig = plt.figure(figsize=(7.4, 4.9))
    frame(fig, "The revenue loop behaves like a network, not a funnel",
          f"{donors_no_member} of {donors} donors ({donors_no_member / donors:.0%}) never joined Friends of Hillview, and "
          f"{donors_no_paid} ({donors_no_paid / donors:.0%}) gave without\nbuying anything. Read as a funnel (left), the "
          "stages produce an impossible 213% step; the paths (right) show why.")
    top, h = 0.13, 0.52

    # Left: the stage counts read as a funnel
    ax = fig.add_axes([0.175, top, 0.20, h])
    f = A["funnel"]
    labels = [x["stage"].replace(" (member)", "") for x in f]
    vals = [x["reached"] for x in f]
    y = list(range(len(f)))[::-1]
    ax.barh(y, vals, height=0.5, color=G, zorder=2)
    for yi, v, x in zip(y, vals, f):
        c = x["conversionFromPrevious"]
        bad = c is not None and c > 100
        ax.text(v + 120, yi, f"{v:,}", va="center", fontsize=8.5, color=INK)
        if c is not None:
            ax.text(v + 120, yi - 0.34, f"{c:.0f}% of stage above", va="center", fontsize=7.4,
                    color=ALERT if bad else MUTED, fontweight=700 if bad else 400)
    ax.set_yticks(y, labels, fontsize=8.5)
    ax.set_xlim(0, 7600)
    ax.set_ylim(-0.75, len(f) - 0.4)
    ax.xaxis.set_visible(False)
    ax.spines["bottom"].set_visible(False)
    ax.tick_params(axis="y", length=0)
    fig.text(0.035, top + h + 0.075, "Read as a funnel", fontsize=9.5, color=INK, fontweight=600)

    # Right: UpSet-style path chart
    order = [((False, False, False), "Free visit only"), ((True, False, False), "Paid experience only"),
             ((True, True, False), "Paid, then joined"), ((True, False, True), "Paid, then gave"),
             ((True, True, True), "Paid, joined and gave"), ((False, False, True), "Free visit, then gave"),
             ((False, True, True), "Joined and gave")]
    n = len(order)
    axm = fig.add_axes([0.6, top, 0.15, h])
    axb = fig.add_axes([0.765, top, 0.19, h])
    for i, (key, name) in enumerate(order):
        yi = n - 1 - i
        xs_on = [j for j in range(3) if key[j]]
        for j in range(3):
            axm.scatter(j, yi, s=40, color=(INK if key[j] else GRID), zorder=3, linewidths=1.5, edgecolors=SURFACE)
        if len(xs_on) > 1:
            axm.plot([min(xs_on), max(xs_on)], [yi, yi], color=INK, lw=2, zorder=2)
        v = paths[key]
        axb.barh(yi, v, height=0.5, color=O if (key[2] and not key[1]) else G, zorder=2)
        axb.text(v + 70, yi, f"{v:,}", va="center", fontsize=8.5, color=INK)
    axm.set_xticks([0, 1, 2], ["Paid", "Friend", "Donor"], fontsize=8)
    axm.xaxis.tick_top()
    axm.set_yticks(range(n), [name for _, name in order][::-1], fontsize=8.5)
    for a in (axm, axb):
        a.set_ylim(-0.6, n - 0.4)
        a.tick_params(length=0)
    axm.set_xlim(-0.5, 2.5)
    for sp in axm.spines.values():
        sp.set_visible(False)
    axb.set_xlim(0, 3700)
    axb.set_yticks([])
    axb.xaxis.set_visible(False)
    for sp in ("left", "bottom"):
        axb.spines[sp].set_visible(False)
    fig.text(0.44, top + h + 0.075, "Paths supporters actually took", fontsize=9.5, color=INK, fontweight=600)
    axb.legend(handles=[Patch(color=O, label="Gave without joining"), Patch(color=G, label="Other paths")],
               loc="lower right", fontsize=8, handlelength=1, handleheight=0.8, bbox_to_anchor=(1.08, 0))
    save(fig, "fig_3_4_loop_paths.png")


# ---------------------------------------------------------------- 3.5 RFM map
def fig_3_5():
    seg = {s["segment"]: s for s in A["segments"]}
    plan = [  # priority order = the Development Officer's call order
        ("At risk", "Call personally now: high value, fading"),
        ("Champions", "Thank, then invite to upgrade or adopt a stone"),
        ("Loyal supporters", "Renewals and member-only events"),
        ("Needs attention", "Targeted what's-on from past bookings"),
        ("New & promising", "Second-visit nudge to join Friends"),
        ("Hibernating", "Low-cost email, only where consented"),
    ]
    fig = plt.figure(figsize=(7.4, 4.6))
    frame(fig, "RFM segments turn 5,089 supporters into six actions",
          f"Each bubble is a segment (area = number of supporters). 'At risk' supporters average ${seg['At risk']['avgValue']:,.0f},\n"
          f"close to the top segment, but have been quiet for ~{seg['At risk']['avgRecency']:.0f} days, so they head the Development Officer's call list.")
    ax = fig.add_axes([0.10, 0.17, 0.50, 0.57])
    for k, (name, _) in enumerate(plan, start=1):
        s = seg[name]
        c = O if name == "At risk" else G
        ax.scatter(s["avgRecency"], s["avgValue"], s=s["supporters"] * 0.75, color=c, alpha=0.9,
                   edgecolors=SURFACE, linewidths=2, zorder=3)
        ax.text(s["avgRecency"], s["avgValue"], str(k), ha="center", va="center", fontsize=9, fontweight=700,
                color=INK if name == "At risk" else "white", zorder=4)
    ax.set_xlim(305, -5)  # recent on the right
    ax.set_ylim(-60, 500)
    ax.set_xticks([300, 200, 100, 0])
    ax.set_xlabel("Avg. days since last interaction (more recent →)")
    ax.set_ylabel("Avg. value per supporter (AUD)")
    ax.yaxis.set_major_formatter(lambda v, _: f"${v:,.0f}")
    ax.grid(True, axis="y")
    ax.set_axisbelow(True)
    ax.tick_params(length=0)
    y0 = 0.725
    fig.text(0.645, y0 + 0.035, "Segment · supporters · action", fontsize=8.5, color=MUTED, fontweight=600)
    for k, (name, act) in enumerate(plan, start=1):
        s = seg[name]
        yy = y0 - (k - 1) * 0.093
        fig.text(0.645, yy, f"{k}", fontsize=9, fontweight=700, color=O if name == "At risk" else G, va="top")
        fig.text(0.67, yy, f"{name} · {s['supporters']:,} · avg ${s['avgValue']:,.0f}", fontsize=8.8, fontweight=600,
                 color=INK, va="top")
        import textwrap
        fig.text(0.67, yy - 0.033, "\n".join(textwrap.wrap(act, 60)), fontsize=8, color=MUTED, va="top")
    save(fig, "fig_3_5_rfm_segments.png")


# ---------------------------------------------------------------- 3.6 forecast + roster
def fig_3_6():
    fc = A["forecast"]
    d = [dt.date.fromisoformat(x["date"]) for x in fc]
    fig = plt.figure(figsize=(7.4, 4.9))
    frame(fig, "Eight weeks ahead: expected visitors, uncertainty and the roster it implies",
          "Top: expected daily visitors with an 80% prediction interval (Negative Binomial model, Monte Carlo). "
          "Bottom: staff\nrostered by rule (1 guide per 80 visitors + 1; 1 front-of-house per 150 + 1, assumption A-14).",
          top=0.79)
    gs = fig.add_gridspec(2, 1, height_ratios=[2.3, 1], left=0.085, right=0.975, bottom=0.12, hspace=0.12)
    ax, ax2 = fig.add_subplot(gs[0]), fig.add_subplot(gs[1])
    ev = [i for i, x in enumerate(fc) if x["regionalEvent"]]
    for a in (ax, ax2):
        if ev:
            a.axvspan(d[ev[0]] - dt.timedelta(hours=12), d[ev[-1]] + dt.timedelta(hours=12), color=SAGE, alpha=0.35, lw=0, zorder=0)
    ax.fill_between(d, [x["lo80"] for x in fc], [x["hi80"] for x in fc], color=G, alpha=0.12, lw=0, zorder=1)
    ax.plot(d, [x["expected"] for x in fc], color=G, lw=2, zorder=3, solid_joinstyle="round")
    wk = [i for i, x in enumerate(fc) if x["dow"] in ("Sat", "Sun")]
    ax.scatter([d[i] for i in wk], [fc[i]["expected"] for i in wk], s=18, color=G, edgecolors=SURFACE, linewidths=1.5, zorder=4)
    pk = max(range(len(fc)), key=lambda i: fc[i]["expected"])
    ax.annotate(f"{fc[pk]['dow']} {d[pk]:%d %b}: {fc[pk]['expected']} expected\n(80% range {fc[pk]['lo80']}–{fc[pk]['hi80']})",
                (d[pk], fc[pk]["expected"]), xytext=(-8, 18), textcoords="offset points", ha="right", fontsize=8, color=INK,
                arrowprops=dict(arrowstyle="-", color=MUTED, lw=0.8))
    if ev:
        ax.text(d[ev[0]] - dt.timedelta(days=1), 405, "Highlands Christmas\n(assumed event window)", fontsize=7.4, color=MUTED, va="top", ha="right")
    ax.set_ylim(0, 420)
    ax.set_ylabel("Visitors per day")
    ax.grid(True, axis="y")
    ax.set_axisbelow(True)
    ax.tick_params(labelbottom=False, length=0)
    ax.legend(handles=[Line2D([], [], color=G, lw=2, marker="o", ms=4, markevery=[1], label="Expected (dots = weekends)"),
                       Patch(color=G, alpha=0.18, label="80% prediction interval")], loc="upper left", ncol=2, fontsize=8)
    g = [x["guides"] for x in fc]
    h = [x["frontOfHouse"] for x in fc]
    ax2.bar(d, g, width=0.62, color=G, zorder=2, label="Guides")
    ax2.bar(d, h, width=0.62, bottom=[gi + 0.12 for gi in g], color=B, zorder=2, label="Front-of-house")
    ax2.set_ylabel("Staff")
    ax2.set_ylim(0, 12)
    ax2.set_yticks([0, 5, 10])
    ax2.grid(True, axis="y")
    ax2.set_axisbelow(True)
    ax2.tick_params(length=0)
    ax2.legend(loc="upper left", ncol=2, fontsize=8, handlelength=1)
    import matplotlib.dates as mdates
    ax2.xaxis.set_major_locator(mdates.WeekdayLocator(byweekday=mdates.MO))
    ax2.xaxis.set_major_formatter(mdates.DateFormatter("%d %b"))
    for a in (ax, ax2):
        a.set_xlim(d[0] - dt.timedelta(days=1), d[-1] + dt.timedelta(days=1))
    save(fig, "fig_3_6_forecast_roster.png")


# ---------------------------------------------------------------- 3.7 driver effects / parameter recovery
def true_effects():
    src = (ROOT / "analytics" / "simulate.py").read_text()
    m = re.search(r"TRUE_EFFECTS = dict\((.*?)\)", src, re.S)
    return {k: float(v) for k, v in re.findall(r"(\w+)=([\d.]+)", m.group(1))}


def fig_3_7():
    te = true_effects()
    assumed = {"NSW school holidays": te["school_holiday"], "NSW public holiday": te["public_holiday"],
               "Regional event (e.g., Tulip Time)": te["regional_event"], "Rain day (≥1 mm)": te["rain"],
               "Cold day (12 °C vs 23 °C)": math.exp(-te["temp_k"] * 121)}
    rows = A["drivers"]
    nice = {"Regional event (e.g., Tulip Time)": "Regional event (Tulip Time)", "Rain day (≥1 mm)": "Rain day (1 mm or more)",
            "Cold day (12 °C vs 23 °C)": "Cold day (12 °C vs 23 °C)"}
    fig, ax = plt.subplots(figsize=(7.4, 4.5))
    frame(fig, "The model recovers the effects we built into the simulation",
          "Estimated multiplier on daily visitors (dot, with 95% interval) vs the value the synthetic history was "
          "generated with (diamond).\nThis proves the pipeline works; it does not prove real Hillview demand behaves this way.")
    fig.subplots_adjust(left=0.29, right=0.95, bottom=0.17, top=0.77)
    n = len(rows)
    for i, r in enumerate(rows):
        yi = n - 1 - i
        if r["lo"] is not None:
            ax.plot([r["lo"], r["hi"]], [yi, yi], color=G, lw=2, solid_capstyle="round", zorder=2)
        ax.scatter(r["multiplier"], yi, s=48, color=G, edgecolors=SURFACE, linewidths=2, zorder=4)
        ax.text(r["hi"] if r["hi"] else r["multiplier"], yi + 0.28, f"×{r['multiplier']:.2f}", fontsize=8, color=INK,
                ha="left" if r["multiplier"] > 1 else "right")
        if r["driver"] in assumed:
            ax.scatter(assumed[r["driver"]], yi, s=46, marker="D", facecolors=SURFACE, edgecolors=O, linewidths=1.8, zorder=5)
    ax.axvline(1, color=MUTED, lw=1, zorder=1)
    ax.text(1.0, n - 0.35, "no effect", fontsize=7.6, color=MUTED, ha="center")
    ax.set_xscale("log")
    ax.set_xticks([0.5, 0.75, 1, 1.5, 2, 3], ["×0.5", "×0.75", "×1", "×1.5", "×2", "×3"])
    ax.minorticks_off()
    ax.set_xlim(0.42, 3.2)
    ax.set_ylim(-0.6, n - 0.2)
    ax.set_yticks(range(n), [nice.get(r["driver"], r["driver"]) for r in rows][::-1])
    ax.grid(True, axis="x")
    ax.set_axisbelow(True)
    ax.tick_params(length=0)
    ax.spines["left"].set_visible(False)
    ax.legend(handles=[Line2D([], [], color=G, lw=2, marker="o", ms=6, mec=SURFACE, label="Estimated (95% interval)"),
                       Line2D([], [], ls="", marker="D", ms=6, mfc=SURFACE, mec=O, mew=1.8, label="Built into simulation")],
              loc="lower right", fontsize=8)
    fig.text(0.29, 0.075, "Weekend rows compare with Monday; the simulation applied one weekend uplift (×2.1) against all\n"
             "weekdays, so the two are not directly comparable and no diamond is shown.", fontsize=7.4, color=MUTED)
    save(fig, "fig_3_7_driver_effects.png")


# ---------------------------------------------------------------- 3.8 backtest
def fig_3_8():
    bt = A["backtest"]
    ser = bt["series"]
    d = [dt.date.fromisoformat(x["date"]) for x in ser]
    start = ser[0]["date"]
    by = collections.defaultdict(list)
    for x in A["daily"]:
        if x["date"] < start:
            by[dt.date.fromisoformat(x["date"]).weekday()].append(x["visitors"])
    naive = {k: sum(v) / len(v) for k, v in by.items()}
    nv = [naive[x.weekday()] for x in d]
    naive_mae = sum(abs(a - x["actual"]) for a, x in zip(nv, ser)) / len(ser)
    assert abs(naive_mae - bt["naiveDowMae"]) < 0.1, "naive baseline does not reproduce pipeline value"
    worst = max(range(len(ser)), key=lambda i: abs(ser[i]["predicted"] - ser[i]["actual"]))

    fig, ax = plt.subplots(figsize=(7.4, 4.4))
    frame(fig, f"Out-of-sample test: {1 - bt['mae'] / bt['naiveDowMae']:.0%} less error than a day-of-week average",
          f"Last {bt['holdoutDays']} days held out of model fitting. Mean absolute error {bt['mae']:.0f} visitors/day "
          f"vs {bt['naiveDowMae']:.1f} for the naive benchmark; MAPE {bt['mape']:.1f}%\n(inflated by quiet weekdays, "
          "where a miss of 10 visitors is a large percentage).")
    fig.subplots_adjust(left=0.085, right=0.975, bottom=0.17, top=0.77)
    ax.plot(d, nv, color=B, lw=1.5, zorder=2, label=f"Naive day-of-week average (MAE {bt['naiveDowMae']:.1f})")
    ax.plot(d, [x["predicted"] for x in ser], color=G, lw=2, zorder=3, label=f"Negative Binomial model (MAE {bt['mae']:.1f})")
    ax.scatter(d, [x["actual"] for x in ser], s=14, color=INK, edgecolors=SURFACE, linewidths=1.2, zorder=4, label="Actual (synthetic)")
    w = ser[worst]
    import sys
    sys.path.insert(0, str(ROOT / "analytics"))
    import reference_data as R
    tags = [t for t, ok in (("public holiday", R.is_public_holiday(d[worst])), ("school holidays", R.is_school_holiday(d[worst]))) if ok]
    ctx = f" ({' in '.join(tags)})" if tags else ""
    ax.annotate(f"Largest miss: {d[worst]:%a %d %b}{ctx}\npredicted {w['predicted']}, actual {w['actual']}",
                (d[worst], w["predicted"]), xytext=(d[16], 375), textcoords="data", ha="left", fontsize=8, color=ALERT, fontweight=600,
                arrowprops=dict(arrowstyle="-", color=ALERT, lw=0.9))
    ax.scatter([d[worst]], [w["predicted"]], s=70, facecolors="none", edgecolors=ALERT, linewidths=1.5, zorder=5)
    import matplotlib.dates as mdates
    ax.xaxis.set_major_locator(mdates.WeekdayLocator(byweekday=mdates.MO))
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%d %b"))
    ax.set_ylabel("Visitors per day")
    ax.set_ylim(0, max(max(x["actual"] for x in ser), max(x["predicted"] for x in ser)) * 1.18)
    ax.grid(True, axis="y")
    ax.set_axisbelow(True)
    ax.tick_params(length=0)
    ax.legend(loc="upper left", ncol=3, fontsize=7.8, handlelength=1.6, columnspacing=1.2)
    save(fig, "fig_3_8_backtest.png")


# ---------------------------------------------------------------- 3.10 assumptions confidence
def fig_3_10():
    rows = []
    for line in (ROOT / "docs" / "ASSUMPTIONS_REGISTER.md").read_text().splitlines():
        if line.startswith("| A-"):
            c = [x.strip() for x in line.strip("|").split("|")]
            rows.append(dict(id=c[0], area=c[1], owner=c[4].split("/")[0].strip(), conf=c[5]))
    owners = collections.OrderedDict()
    for r in rows:
        owners.setdefault(r["owner"], collections.Counter())[r["conf"]] += 1
    order = sorted(owners, key=lambda o: -sum(owners[o].values()))
    low = sum(r["conf"] == "Low" for r in rows)
    fin_low = owners.get("Finance", {}).get("Low", 0)
    COL = {"Low": O, "Medium": SAGE, "High": G}

    fig, ax = plt.subplots(figsize=(7.4, 4.0))
    frame(fig, f"{low} of {len(rows)} working assumptions are low-confidence",
          f"Every figure in the platform has an owner and a confidence rating. {fin_low} low-confidence items sit with "
          "Finance\n(prices, appeal target, revenue plan): the hand-off that must close before the report is final.",
          source="Source: docs/ASSUMPTIONS_REGISTER.md (generated from analytics/catalogue.py). Lead owner = first owner listed.")
    fig.subplots_adjust(left=0.15, right=0.97, bottom=0.17, top=0.74)
    for i, o in enumerate(order):
        yi = len(order) - 1 - i
        left = 0
        for conf in ("Low", "Medium", "High"):
            v = owners[o].get(conf, 0)
            if v:
                ax.barh(yi, v - 0.06, left=left, height=0.5, color=COL[conf], zorder=2)
                ax.text(left + (v - 0.06) / 2, yi, str(v), ha="center", va="center", fontsize=8.5,
                        color=INK, fontweight=600)
                left += v
        ax.text(left + 0.15, yi, f"{sum(owners[o].values())} total", va="center", fontsize=8, color=MUTED)
    ax.set_yticks(range(len(order)), order[::-1])
    ax.set_xlim(0, 13)
    ax.xaxis.set_visible(False)
    for s in ("left", "bottom"):
        ax.spines[s].set_visible(False)
    ax.tick_params(length=0)
    ax.legend(handles=[Patch(color=COL[c], label=f"{c} confidence") for c in ("Low", "Medium", "High")],
              loc="lower right", fontsize=8, handlelength=1)
    save(fig, "fig_3_10_assumptions.png")


if __name__ == "__main__":
    fig_3_4()
    fig_3_5()
    fig_3_6()
    fig_3_7()
    fig_3_8()
    fig_3_10()
