"""
Real, public reference data used as forecasting drivers.

Every block records its source. Re-check sources before the final submission;
dates were retrieved 10 Oct 2026.
"""
from datetime import date

# ---------------------------------------------------------------------------
# NSW public school holidays (Eastern division)
# Source: NSW Department of Education, "Future and past NSW term and vacation
# dates" and "2026 calendar" pages (education.nsw.gov.au), retrieved 10 Oct 2026.
# ---------------------------------------------------------------------------
SCHOOL_HOLIDAYS = [
    (date(2025, 9, 29), date(2025, 10, 10)),   # Spring 2025
    (date(2025, 12, 22), date(2026, 1, 26)),   # Summer 2025-26
    (date(2026, 4, 7), date(2026, 4, 17)),     # Autumn 2026
    (date(2026, 7, 6), date(2026, 7, 17)),     # Winter 2026
    (date(2026, 9, 28), date(2026, 10, 9)),    # Spring 2026
    (date(2026, 12, 18), date(2027, 1, 27)),   # Summer 2026-27
]

# ---------------------------------------------------------------------------
# NSW public holidays
# 2026: Visit NSW "Public holidays" page, retrieved 10 Oct 2026.
# 2025: compiled from general knowledge — VERIFY against nsw.gov.au (flag A-REF-02).
# ---------------------------------------------------------------------------
PUBLIC_HOLIDAYS = [
    date(2025, 10, 6), date(2025, 12, 25), date(2025, 12, 26),
    date(2026, 1, 1), date(2026, 1, 26), date(2026, 4, 3), date(2026, 4, 4),
    date(2026, 4, 5), date(2026, 4, 6), date(2026, 4, 27), date(2026, 6, 8),
    date(2026, 10, 5), date(2026, 12, 25), date(2026, 12, 28),
]

# ---------------------------------------------------------------------------
# Regional events calendar (Southern Highlands)
# Tulip Time 2026: Wingecarribee Shire Council events directory,
#   11 Sep – 5 Oct 2026, Corbett Gardens, Bowral (retrieved 10 Oct 2026).
# Tulip Time 2025 dates are ASSUMED to follow the same pattern (flag A-REF-03).
# Highlands Christmas: named by council, dates not published -> assumed window.
# ---------------------------------------------------------------------------
REGIONAL_EVENTS = [
    ("Tulip Time 2025 (assumed dates)", date(2025, 9, 12), date(2025, 10, 6)),
    ("Tulip Time Flower Festival 2026", date(2026, 9, 11), date(2026, 10, 5)),
    ("Highlands Christmas (assumed window)", date(2025, 12, 1), date(2025, 12, 21)),
    ("Highlands Christmas (assumed window)", date(2026, 12, 1), date(2026, 12, 20)),
]

# ---------------------------------------------------------------------------
# Climate normals — Bureau of Meteorology, Moss Vale (Hoskins Street),
# station 068045 (closed Feb 2022). Mean max temp 1907–1975; rainfall days
# 1870–2021. Closest long-record station to Sutton Forest. Retrieved 10 Oct 2026.
# ---------------------------------------------------------------------------
BOM_MOSS_VALE = {
    # month: (mean max °C, mean days rain >= 1mm)
    1: (25.8, 8.4), 2: (25.2, 8.5), 3: (23.1, 8.5), 4: (19.2, 7.4),
    5: (15.3, 7.2), 6: (12.3, 7.8), 7: (11.8, 7.0), 8: (13.4, 7.0),
    9: (16.7, 7.3), 10: (19.9, 7.9), 11: (22.6, 8.1), 12: (25.0, 7.9),
}

SOURCES = [
    {"id": "SRC-01", "name": "NSW Department of Education — term and vacation dates",
     "url": "https://education.nsw.gov.au/schooling/calendars/future-and-past-nsw-term-and-vacation-dates"},
    {"id": "SRC-02", "name": "Visit NSW — Public holidays",
     "url": "https://www.visitnsw.com/travel-information/public-holidays"},
    {"id": "SRC-03", "name": "Wingecarribee Shire Council — Tulip Time Flower Festival 2026",
     "url": "https://www.wsc.nsw.gov.au/events-directory/Tulip-Time-Flower-Festival-2026"},
    {"id": "SRC-04", "name": "Bureau of Meteorology — Climate statistics, Moss Vale (068045)",
     "url": "http://www.bom.gov.au/climate/averages/tables/cw_068045.shtml"},
    {"id": "SRC-05", "name": "Hillview, Sutton Forest — NSW State Heritage Register summary (Wikipedia)",
     "url": "https://en.wikipedia.org/wiki/Hillview,_Sutton_Forest"},
    {"id": "SRC-06", "name": "Wingecarribee Shire Council — Hillview Estate",
     "url": "https://www.wsc.nsw.gov.au/Plan-and-Build/Community-Interest-Items/Hillview-Estate"},
    {"id": "SRC-07", "name": "NSW Governor — Reception for TKFA and the Hillview Regeneration Project (14 Apr 2025)",
     "url": "https://www.governor.nsw.gov.au/governor/selected-speeches-and-messages/show/3783"},
    {"id": "SRC-08", "name": "The King's Foundation — Dumfries House",
     "url": "https://kings-foundation.org/visit/dumfries-house/"},
]


def in_ranges(d, ranges):
    return any(a <= d <= b for a, b in ranges)


def is_school_holiday(d):
    return in_ranges(d, SCHOOL_HOLIDAYS)


def is_public_holiday(d):
    return d in PUBLIC_HOLIDAYS


def regional_event(d):
    for name, a, b in REGIONAL_EVENTS:
        if a <= d <= b:
            return name
    return None
