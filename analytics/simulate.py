"""
Synthetic Year-1 simulation for the Hillview Connect demo.

Simulates 11 Oct 2025 (grounds open) to 9 Oct 2026 (day before the demo date).
Daily visitation is driven by REAL calendars (NSW school holidays, public
holidays, Tulip Time) and BOM climate normals; behaviour after that
(registration, bookings, membership, giving) is synthetic and labelled so.

Output: plain Python structures consumed by run_all.py.
"""
from __future__ import annotations

import math
from collections import defaultdict
from datetime import date, timedelta

import numpy as np

import catalogue as C
import reference_data as R

SEED = 42
START = date(2025, 10, 11)
END = date(2026, 10, 9)
DEMO_TODAY = date(2026, 10, 10)

rng = np.random.default_rng(SEED)

FIRST = ["Olivia", "Jack", "Charlotte", "William", "Amelia", "Noah", "Isla", "Thomas", "Mia", "James",
         "Grace", "Lachlan", "Chloe", "Oliver", "Sophie", "Lucas", "Ruby", "Henry", "Zoe", "Ethan",
         "Linh", "Minh", "Mei", "Wei", "Priya", "Arjun", "Fatima", "Omar", "Sofia", "Luca",
         "Hannah", "Daniel", "Emily", "Samuel", "Ava", "Benjamin", "Harper", "Max", "Ella", "Leo",
         "Aisha", "Ravi", "Yuki", "Hiroshi", "Ana", "Mateo", "Niamh", "Connor", "Tahlia", "Kirra",
         "Georgia", "Hugo", "Matilda", "Archie", "Ivy", "Felix", "Lily", "Oscar", "Evie", "Jasper"]
LAST = ["Smith", "Jones", "Williams", "Brown", "Wilson", "Taylor", "Nguyen", "Tran", "Le", "Pham",
        "Chen", "Wang", "Li", "Zhang", "Patel", "Singh", "Kumar", "Martin", "Anderson", "Thompson",
        "White", "Harris", "Walker", "Ryan", "Kelly", "Murphy", "O'Brien", "Campbell", "Stewart", "Lee",
        "King", "Clarke", "Hughes", "Russo", "Romano", "Haddad", "Khan", "Ali", "Kim", "Park",
        "Tanaka", "Sato", "Fernandez", "Garcia", "Rossi", "Edwards", "Mitchell", "Scott", "Young", "Wright"]

TOWNS = [  # (town, postcode, region, weight)
    ("Bowral", "2576", "Southern Highlands", 10), ("Mittagong", "2575", "Southern Highlands", 7),
    ("Moss Vale", "2577", "Southern Highlands", 7), ("Sutton Forest", "2577", "Southern Highlands", 2),
    ("Robertson", "2577", "Southern Highlands", 2), ("Berrima", "2577", "Southern Highlands", 2),
    ("Bundanoon", "2578", "Southern Highlands", 3),
    ("Sydney", "2000", "Greater Sydney", 6), ("Paddington", "2021", "Greater Sydney", 4),
    ("Mosman", "2088", "Greater Sydney", 4), ("Chatswood", "2067", "Greater Sydney", 4),
    ("Parramatta", "2150", "Greater Sydney", 5), ("Epping", "2121", "Greater Sydney", 3),
    ("Strathfield", "2135", "Greater Sydney", 3), ("Cronulla", "2230", "Greater Sydney", 3),
    ("Camden", "2570", "Greater Sydney", 3), ("Campbelltown", "2560", "Greater Sydney", 4),
    ("Liverpool", "2170", "Greater Sydney", 3),
    ("Wollongong", "2500", "Illawarra", 6), ("Kiama", "2533", "Illawarra", 2),
    ("Canberra", "2600", "ACT", 6), ("Goulburn", "2580", "Regional NSW", 3),
]
_tw = np.array([t[3] for t in TOWNS], float)
_tw /= _tw.sum()


def daterange(a, b):
    d = a
    while d <= b:
        yield d
        d += timedelta(days=1)


def money(x):
    return round(float(x), 2)


# ---------------------------------------------------------------------------
# 1. Daily weather + visitation (ground truth for the synthetic history)
# ---------------------------------------------------------------------------
TRUE_EFFECTS = dict(base=96.0, weekend=2.1, school_holiday=1.45, public_holiday=1.6,
                    regional_event=1.3, rain=0.55, temp_k=0.0035, nb_shape=10.0)


def climate(d):
    tmax, raindays = R.BOM_MOSS_VALE[d.month]
    dim = (date(d.year + (d.month == 12), d.month % 12 + 1, 1) - timedelta(days=1)).day
    return tmax, raindays / dim


def expected_visitors(d, rain, tmax, t_days):
    e = TRUE_EFFECTS
    mu = e["base"] * (0.55 + 0.5 * (1 - math.exp(-t_days / 120)))
    if d.weekday() >= 5:
        mu *= e["weekend"]
    if R.is_school_holiday(d):
        mu *= e["school_holiday"]
    if R.is_public_holiday(d):
        mu *= e["public_holiday"]
    if R.regional_event(d):
        mu *= e["regional_event"]
    if rain:
        mu *= e["rain"]
    mu *= math.exp(-e["temp_k"] * (tmax - 23) ** 2)
    return mu


def simulate_daily():
    rows = []
    for d in daterange(START, END):
        clim_t, p_rain = climate(d)
        tmax = float(rng.normal(clim_t, 3.5))
        rain = bool(rng.random() < p_rain)
        t = (d - START).days
        mu = expected_visitors(d, rain, tmax, t)
        lam = rng.gamma(TRUE_EFFECTS["nb_shape"], mu / TRUE_EFFECTS["nb_shape"])
        visitors = int(min(rng.poisson(lam), 600))
        rows.append(dict(date=d.isoformat(), visitors=visitors, tmax=round(tmax, 1), rain=int(rain),
                         school_holiday=int(R.is_school_holiday(d)), public_holiday=int(R.is_public_holiday(d)),
                         regional_event=int(R.regional_event(d) is not None), dow=d.weekday(), t=t))
    return rows


# ---------------------------------------------------------------------------
# 2. Supporters and their interactions
# ---------------------------------------------------------------------------
class World:
    def __init__(self):
        self.supporters = []           # list of dicts
        self.by_id = {}
        self.inter = defaultdict(list)  # sid -> list of [date, type, label, amount, extra]
        self.adopted = {e["id"]: 0 for e in C.ADOPT_ELEMENTS}
        self.member = {}               # sid -> dict(tier, since, expires)
        self.paid_visits = defaultdict(int)
        self.used_emails = set()
        self.volunteer_hours = 0

    def new_supporter(self, d, tags=()):
        i = len(self.supporters) + 1
        sid = f"S{i:05d}"
        first = FIRST[rng.integers(len(FIRST))]
        last = LAST[rng.integers(len(LAST))]
        base = f"{first}.{last}".lower().replace("'", "")
        email = f"{base}@example.com"
        k = 2
        while email in self.used_emails:
            email = f"{base}{k}@example.com"
            k += 1
        self.used_emails.add(email)
        town, pc, region, _ = TOWNS[rng.choice(len(TOWNS), p=_tw)]
        s = dict(id=sid, first=first, last=last, email=email, town=town, postcode=pc, region=region,
                 created=d.isoformat(), tags=list(tags),
                 consents=dict(newsletter=bool(rng.random() < .55), events=bool(rng.random() < .45),
                               appeals=bool(rng.random() < .30), impact=bool(rng.random() < .60)))
        self.supporters.append(s)
        self.by_id[sid] = s
        return sid

    def add(self, sid, d, typ, label, amount=0.0, extra=None):
        self.inter[sid].append([d.isoformat(), typ, label, money(amount), extra])

    def is_member(self, sid, d):
        m = self.member.get(sid)
        return m is not None and m["since"] <= d.isoformat() <= m["expires"]


def party():
    adults = 1 + int(rng.random() < .8)
    kids = int(rng.poisson(.5))
    return adults, kids


def past_event_days():
    """Synthetic past programme of events: two per month (illustrative)."""
    names = ["Restoration Open Site Day", "Twilight Talk", "Garden Open Day", "Makers' Market",
             "Heritage Trades Showcase", "Winter Fireside Talk"]
    out = {}
    d = START
    k = 0
    while d <= END:
        # second and last Saturday of the month
        sats = [x for x in daterange(d.replace(day=1), (d.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1))
                if x.weekday() == 5]
        for s in (sats[1], sats[-1]):
            if START <= s <= END:
                out[s] = names[k % len(names)]
                k += 1
        d = (d.replace(day=28) + timedelta(days=4)).replace(day=1)
    return out


def pick_element(member):
    els = [e for e in C.ADOPT_ELEMENTS if e["status"] != "restored"]
    w = np.array([1 / math.sqrt(e["price"]) * (1.6 if member else 1) for e in els])
    w /= w.sum()
    return els[rng.choice(len(els), p=w)]


def simulate_world(daily):
    W = World()
    events = past_event_days()
    tier_ids = [t["id"] for t in C.MEMBERSHIP_TIERS]
    tier_p = [.50, .35, .12, .03]
    tier_price = {t["id"]: t["price"] for t in C.MEMBERSHIP_TIERS}
    tier_name = {t["id"]: t["name"] for t in C.MEMBERSHIP_TIERS}
    engaged = []  # supporters likely to return

    for row in daily:
        d = date.fromisoformat(row["date"])
        parties = row["visitors"] / 2.6
        n_reg = int(rng.binomial(int(round(parties)), .40))
        for _ in range(n_reg):
            r_return = min(.38, .04 + row["t"] / 900)
            if engaged and rng.random() < r_return:
                sid = engaged[rng.integers(len(engaged))]
            else:
                sid = W.new_supporter(d)
                engaged.append(sid)
            W.add(sid, d, "visit", "Estate grounds visit")
            member = W.is_member(sid, d)
            disc = .85 if member else 1.0
            adults, kids = party()
            # paid experience?
            if d in events and rng.random() < .55:
                price = 20
                W.add(sid, d, "event", events[d], (adults * price) * disc, {"tickets": adults + kids})
                W.paid_visits[sid] += 1
            elif rng.random() < .34:
                roll = rng.random()
                if roll < .62 and d.weekday() >= 2:
                    amt = (adults * 35 + kids * 15) * disc
                    W.add(sid, d, "tour", "The Governors' Retreat — house tour", amt, {"tickets": adults + kids})
                elif roll < .90:
                    amt = (adults * 25 + kids * 10) * disc
                    W.add(sid, d, "tour", "Heritage Garden Walk", amt, {"tickets": adults + kids})
                elif d.weekday() == 5:
                    W.add(sid, d, "workshop", "Craft Taster workshop", adults * 120 * disc, {"tickets": adults})
                else:
                    amt = (adults * 35 + kids * 15) * disc
                    W.add(sid, d, "tour", "The Governors' Retreat — house tour", amt, {"tickets": adults + kids})
                W.paid_visits[sid] += 1
                # membership conversion after paid experience
                if not member and sid not in W.member:
                    p_join = .09 + (.16 if W.paid_visits[sid] >= 2 else 0)
                    if rng.random() < p_join:
                        tid = tier_ids[rng.choice(4, p=tier_p)]
                        W.member[sid] = dict(tier=tid, since=d.isoformat(),
                                             expires=(d + timedelta(days=365)).isoformat())
                        W.add(sid, d, "membership", f"Friends of Hillview — {tier_name[tid]}", tier_price[tid], {"tier": tid})
                        if rng.random() < .25:
                            engaged.append(sid)  # members return more
            # giving
            p_don = .10 if member else .03
            if rng.random() < p_don:
                amt = float(np.clip(rng.lognormal(math.log(45), .7), 10, 2000))
                fund = rng.choice(["restoration", "bursary", "general"], p=[.6, .15, .25])
                W.add(sid, d, "donation", "One-off gift", round(amt), {"fund": str(fund)})
            p_adopt = .09 if member else .025
            if rng.random() < p_adopt:
                e = pick_element(member)
                n = int(1 + rng.poisson(.4))
                n = min(n, e["units"] - W.adopted[e["id"]])
                if n > 0:
                    W.adopted[e["id"]] += n
                    W.add(sid, d, "adoption", f"Adopt-a-Stone: {e['name']}", n * e["price"],
                          {"element": e["id"], "units": n})

    # Additional pre-booked event ticket buyers (events are ticketed through the platform)
    for d, name in events.items():
        for _ in range(int(rng.integers(55, 130))):
            if engaged and rng.random() < .6:
                sid = engaged[rng.integers(len(engaged))]
            else:
                sid = W.new_supporter(d - timedelta(days=int(rng.integers(1, 30))))
                engaged.append(sid)
            adults, kids = party()
            disc = .85 if W.is_member(sid, d) else 1.0
            W.add(sid, d, "event", name, adults * 20 * disc, {"tickets": adults + kids})
            W.paid_visits[sid] += 1

    # Regular monthly givers (members only)
    members = list(W.member.keys())
    for sid in rng.choice(members, size=max(1, len(members) // 12), replace=False):
        since = date.fromisoformat(W.member[sid]["since"]) + timedelta(days=int(rng.integers(5, 40)))
        amt = float(rng.choice([15, 20, 25, 50]))
        d = since
        while d <= END:
            W.add(sid, d, "donation", "Monthly gift", amt, {"fund": "restoration", "recurring": True})
            d = (d.replace(day=1) + timedelta(days=32)).replace(day=min(since.day, 28))

    # Appeals to consented supporters: Christmas 2025 and EOFY June 2026
    for appeal_day, name, rate, median in [(date(2025, 12, 8), "Christmas Appeal gift", .05, 80),
                                           (date(2026, 6, 15), "End of Financial Year Appeal gift", .07, 110)]:
        for s in W.supporters:
            if s["consents"]["appeals"] and s["created"] < appeal_day.isoformat() and rng.random() < rate:
                d = appeal_day + timedelta(days=int(rng.integers(0, 14)))
                W.add(s["id"], d, "donation", name, round(float(np.clip(rng.lognormal(math.log(median), .8), 20, 5000))),
                      {"fund": "restoration"})

    # Major donors / Patron cultivation (illustrative)
    for k, gift in enumerate([50_000, 25_000, 15_000, 10_000, 10_000, 5_000]):
        sid = W.new_supporter(START + timedelta(days=int(rng.integers(20, 300))), tags=["major donor"])
        d = date.fromisoformat(W.supporters[-1]["created"]) + timedelta(days=int(rng.integers(10, 40)))
        if d <= END:
            W.add(sid, d, "donation", "Major gift", gift, {"fund": "restoration"})
        W.member[sid] = dict(tier="patron", since=d.isoformat(), expires=(d + timedelta(days=365)).isoformat())
        W.add(sid, d, "membership", "Friends of Hillview — Patron Circle", 1500, {"tier": "patron"})

    # Heritage trades course pilot (from Feb 2026, two runs a month)
    course_runs = []
    d = date(2026, 2, 7)
    k = 0
    while d <= END:
        c = C.COURSES[k % len(C.COURSES)]
        n = int(rng.binomial(c["capacity"], .72))
        course_runs.append((d, c, n))
        for _ in range(n):
            if engaged and rng.random() < .45:
                sid = engaged[rng.integers(len(engaged))]
            else:
                sid = W.new_supporter(d - timedelta(days=int(rng.integers(7, 40))), tags=["learner"])
            disc = .85 if W.is_member(sid, d) else 1.0
            W.add(sid, d, "course", c["name"], c["price"] * disc, {"course": c["id"]})
            s = W.by_id[sid]
            if "learner" not in s["tags"]:
                s["tags"].append("learner")
        d += timedelta(days=14)
        k += 1

    # Schools programme pilot (Term 1 2026 onward, ~2 bookings per school week)
    schools = []
    school_names = ["Bowral Public School (illustrative)", "Moss Vale High (illustrative)", "Mittagong PS (illustrative)",
                    "Chevalier College (illustrative)", "Southern Highlands Christian (illustrative)",
                    "Campbelltown East PS (illustrative)", "Parramatta West PS (illustrative)", "Wollongong HS (illustrative)",
                    "Goulburn South PS (illustrative)", "Canberra Grammar (illustrative)", "Camden PS (illustrative)",
                    "Liverpool Boys HS (illustrative)", "Robertson PS (illustrative)", "Bundanoon PS (illustrative)"]
    teacher_ids = {}
    for d in daterange(date(2026, 2, 9), END):
        if d.weekday() >= 5 or R.is_school_holiday(d) or R.is_public_holiday(d):
            continue
        if rng.random() < .17:
            sch = school_names[rng.integers(len(school_names))]
            if sch not in teacher_ids:
                teacher_ids[sch] = W.new_supporter(d - timedelta(days=30), tags=["teacher"])
            prog = C.SCHOOL_PROGRAMMES[rng.integers(len(C.SCHOOL_PROGRAMMES))]
            students = int(rng.integers(22, 75))
            amt = students * prog["price"]
            W.add(teacher_ids[sch], d, "school", f"{prog['name']} — {sch}", amt,
                  {"students": students, "programme": prog["id"]})
            schools.append(dict(date=d.isoformat(), school=sch, programme=prog["name"], students=students, amount=amt))

    # Venue hire
    venue = []
    for d in daterange(START, END):
        peak = d.month in (10, 11, 12, 1, 2, 3, 4)
        if d.weekday() == 5 and rng.random() < (.68 if peak else .30):
            pk = C.VENUE_PACKAGES[0] if rng.random() < .75 else C.VENUE_PACKAGES[1]
            amt = pk["peak_price"] if peak else pk["from_price"]
            venue.append((d, pk, amt, "Main House"))
        elif d.weekday() in (1, 2, 3) and rng.random() < .14:
            pk = C.VENUE_PACKAGES[2] if rng.random() < .6 else C.VENUE_PACKAGES[3]
            n = int(rng.integers(12, 40))
            venue.append((d, pk, n * pk["from_price"], "Main House"))
        elif d.weekday() == 6 and rng.random() < .10:
            venue.append((d, C.VENUE_PACKAGES[4], 3500, "Gardens & Lawn"))
    for d, pk, amt, space in venue:
        sid = W.new_supporter(d - timedelta(days=int(rng.integers(90, 300))), tags=["venue client"])
        W.add(sid, d, "venue", f"{pk['kind']}: {pk['name']}", amt, {"package": pk["id"]})

    # Volunteers (hours only; personal details live in the pathway file)
    W.volunteer_hours = int(sum(rng.integers(40, 160) for _ in range(46)))

    return W, course_runs, schools, venue


STREAM = {"tour": "House & garden tours", "workshop": "Workshops & events", "event": "Workshops & events",
          "course": "Heritage trades courses", "school": "Schools programme", "venue": "Venue hire",
          "membership": "Membership", "donation": "Donations", "adoption": "Adopt-a-Stone"}
TAXABLE = {"tour", "workshop", "event", "course", "school", "venue", "membership"}


def revenue_by_month(W):
    out = defaultdict(lambda: defaultdict(float))
    gst = defaultdict(float)
    for sid, rows in W.inter.items():
        for d, typ, label, amt, extra in rows:
            if typ in STREAM and amt > 0:
                m = d[:7]
                out[m][STREAM[typ]] += amt
                if typ in TAXABLE:
                    gst[m] += amt / 11  # GST component of a GST-inclusive price
    months = sorted(out.keys())
    return [dict(month=m, **{k: round(v) for k, v in out[m].items()}, gst=round(gst[m])) for m in months]


def pathway_participants():
    """Separate data domain (US-51). Synthetic, first name + initial only."""
    stages = ["Volunteer"] * 18 + ["Trainee"] * 12 + ["Placement"] * 7 + ["Employed"] * 6
    trades = ["Stonemasonry", "Lime plastering", "Heritage carpentry", "Blacksmithing", "Horticulture"]
    employers = ["Highlands Heritage Builders", "Southern Tablelands Stoneworks", "Sutton Joinery Co.",
                 "Wingecarribee Landscapes", "Bowral Restoration Group"]
    out = []
    for i, st in enumerate(stages):
        age = int(rng.integers(16, 25))
        start = START + timedelta(days=int(rng.integers(0, 330)))
        out.append(dict(
            id=f"P{i + 1:03d}", name=f"{FIRST[rng.integers(len(FIRST))]} {LAST[rng.integers(len(LAST))][0]}.",
            age=age, under18=age < 18, guardianConsent=age < 18, stage=st, trade=trades[rng.integers(len(trades))],
            start=start.isoformat(), hours=int(rng.integers(20, 120) if st == "Volunteer" else rng.integers(150, 700)),
            competencies=int(rng.integers(1, 4) if st == "Volunteer" else rng.integers(4, 12)),
            employer=(f"{employers[rng.integers(len(employers))]} (illustrative)" if st in ("Placement", "Employed") else None),
            employed6m=(st == "Employed"),
        ))
    return out
