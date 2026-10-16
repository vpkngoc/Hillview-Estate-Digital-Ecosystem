"""
Product catalogue and the assumptions register for Hillview Connect.

This is the single source of truth for prices, tiers and capacities.
The web app reads the JSON written from here, so changing a figure here
(and re-running `python run_all.py`) updates the whole demo.

EVERY commercial figure is a placeholder chosen by the platform lead
and flagged for Finance / Marketing review. Each carries an assumption id (A-xx)
that appears in the Assumptions Register (docs/ASSUMPTIONS_REGISTER.md and the
Console > Assumptions tab).
"""

GST_RATE = 0.10  # Australian GST, A New Tax System (Goods and Services Tax) Act 1999

# ---------------------------------------------------------------------------
# Assumptions register
# confidence: Low / Medium / High; owner = who must confirm
# ---------------------------------------------------------------------------
ASSUMPTIONS = [
    # Pricing ---------------------------------------------------------------
    dict(id="A-01", area="Pricing", item="House tour price (adult / concession / child 5–15)",
         value="$35 / $28 / $15, under-5 free", owner="Finance",
         basis="Placeholder set by Ngoc; benchmark against comparable NSW heritage house tours before final.",
         confidence="Low"),
    dict(id="A-02", area="Pricing", item="Heritage garden walk price", value="$25 / $20 / $10",
         owner="Finance", basis="Placeholder; positioned below house tour.", confidence="Low"),
    dict(id="A-03", area="Pricing", item="Craft taster workshop (3 hrs)", value="$120",
         owner="Finance", basis="Placeholder; half-day craft workshop range in regional NSW.", confidence="Low"),
    dict(id="A-04", area="Pricing", item="Heritage trades short courses", value="$180 (1 day) – $690 (3 days)",
         owner="Finance / Education", basis="Placeholder; non-accredited short courses, priced per day of tuition and materials.",
         confidence="Low"),
    dict(id="A-05", area="Pricing", item="Schools programme price per student", value="$28–$35 (day), $165 (3-day, no accommodation)",
         owner="Finance / Education", basis="Placeholder; typical NSW excursion range — confirm against school budget norms.",
         confidence="Low"),
    dict(id="A-06", area="Pricing", item="Wedding venue fee", value="$6,000 exclusive full-day hire; $1,800 garden ceremony session",
         owner="Finance", basis="Finance chapter: $6,000 anchored on National Trust Harper's Mansion, Berrima ($1,500 garden ceremony alone) and Southern Highlands venues at ~$1,500–$2,000 per session (Tagvenue). Ceremony-session price set by Analytics inside that range.", confidence="Medium"),
    dict(id="A-07", area="Pricing", item="Corporate packages", value="$95 pp day delegate; $260 pp retreat + workshop",
         owner="Finance", basis="Placeholder.", confidence="Low"),
    dict(id="A-08", area="Membership", item="Friends of Hillview tiers (annual, GST incl.)",
         value="Friend $90 · Household $130 · Supporter $350 · Patron Circle $1,500",
         owner="Marketing / Finance", basis="Finance chapter: $90 single membership, between Museums of History NSW's $75 single and $135 dual. Household, Supporter and Patron tiers remain platform placeholders for Marketing to confirm.",
         confidence="Medium"),
    dict(id="A-09", area="Membership", item="Member benefit rule",
         value="Priority booking (14 days), 15% off tours/workshops/courses, member-only events. NO free entry to paid events.",
         owner="Marketing", basis="Team decision to avoid revenue cannibalisation — deck slides still say free festival entry; update the deck.",
         confidence="Medium"),
    dict(id="A-10", area="Giving", item="Adopt-a-Stone price bands", value="$25 (edging tile) – $5,000 (iron gate restoration)",
         owner="Finance / Marketing", basis="Placeholder; bands set so 80% of units are under $150 to keep micro-donations accessible.",
         confidence="Low"),
    dict(id="A-11", area="Giving", item="Stage 1 Restoration Appeal target", value="$1,500,000",
         owner="Finance", basis="PLACEHOLDER — no public figure for Hillview restoration cost was found. Replace with Heritage master plan costing.",
         confidence="Low"),
    # Capacity / operations -----------------------------------------------
    dict(id="A-12", area="Operations", item="Grounds daily capacity (free registration)", value="600 people/day",
         owner="Operations", basis="Placeholder; constrained by parking and amenities, not yet assessed.", confidence="Low"),
    dict(id="A-13", area="Operations", item="Average party size", value="2.6 people", owner="Analytics",
         basis="Assumption for converting registrations to visitors.", confidence="Medium"),
    dict(id="A-14", area="Operations", item="Staffing ratios", value="1 guide per 80 visitors (+1 base); 1 front-of-house per 150 (+1 base)",
         owner="Operations", basis="Placeholder rule for the forecast-to-roster demo.", confidence="Low"),
    # Demand / simulation ---------------------------------------------------
    dict(id="A-15", area="Demand", item="Year 1 grounds visitation", value="≈35,000 visits (simulated)",
         owner="Analytics / Marketing", basis="Synthetic. Replace with a Tourism Research Australia / Destination NSW Southern Highlands baseline if sourced.",
         confidence="Low"),
    dict(id="A-16", area="Demand", item="Driver effects used to simulate history",
         value="Weekend ×2.1, school holiday ×1.45, public holiday ×1.6, Tulip Time ×1.3, rain day ×0.55",
         owner="Analytics", basis="Judgement-based; the model re-estimates these once real check-in data exists.", confidence="Low"),
    dict(id="A-17", area="Demand", item="Registration rate of grounds visitors", value="40% of parties register with email",
         owner="Analytics", basis="Assumption — free registration is optional.", confidence="Low"),
    dict(id="A-18", area="Finance", item="Year 1 revenue plan by stream", value="See Console > Overview. Finance's ten-year model gives Year 5 revenue of $987k (nine streams, $59k–$169k each); Year 1 by-stream figures still to be transferred",
         owner="Finance", basis="Placeholder targets so the dashboard can show actual vs plan. Must be replaced by Finance chapter numbers.",
         confidence="Low"),
    # Tax / legal -------------------------------------------------------------
    dict(id="A-19", area="Tax", item="GST treatment",
         value="Tickets, courses, venue, membership: taxable, 10% GST included. Donations & Adopt-a-Stone: no GST (gift, no material benefit).",
         owner="Finance / Law", basis="General GST principles — membership with benefits treated as taxable; schools programme assumed taxable (non-accredited). Verify with an accountant.",
         confidence="Medium"),
    dict(id="A-20", area="Tax", item="DGR status of The King's Foundation Australia", value="Unknown — receipts do NOT claim tax-deductibility",
         owner="Law / Finance", basis="Check the ABN Lookup / ACNC register before any tax-deductible claim.", confidence="Low"),
    dict(id="A-21", area="Reference", item="2025 NSW public holidays and Tulip Time 2025 dates", value="Compiled from knowledge / assumed pattern",
         owner="Analytics", basis="2026 dates sourced; 2025 dates to verify.", confidence="Medium"),
    dict(id="A-23", area="Community", item="Acknowledgement of Country wording", value="Gundungurra people as Traditional Custodians",
         owner="Community / Law", basis="Confirm wording and Traditional Custodian groups with Wingecarribee Shire Council guidance and local Aboriginal community.",
         confidence="Medium"),
    dict(id="A-22", area="Data", item="All supporters, bookings and gifts", value="Synthetic (seeded random generation)",
         owner="Analytics", basis="Demo only. Names are fictional; emails use the reserved example.com domain.", confidence="High"),
    dict(id="A-24", area="Finance", item="Return hurdle and discount rate", value="3% (higher of 3% and Australian GDP growth)",
         owner="Finance", basis="ABS: real GDP grew 2.1% in the year to the June quarter 2026, so 3% binds (Finance chapter).", confidence="High"),
    dict(id="A-25", area="Finance", item="Endowment allocation ($1M)", value="Media 35% ($350k) · Digital platform 25% ($250k) · Events 20% ($200k) · Schools 20% ($200k)",
         owner="Team / Finance", basis="Team decision; 30% spent in Year 0 and 75% by end of Year 2, media and platform front-loaded (Finance chapter).", confidence="Medium"),
    dict(id="A-26", area="Finance", item="Price escalation", value="3% a year", owner="Finance",
         basis="Set slightly below the 3.5% annual CPI reading for July 2026 (Finance chapter).", confidence="Medium"),
    dict(id="A-27", area="Finance", item="Heritage grants", value="Excluded from base case; $50k (Yr 1) + $150k (Yr 2) shown as upside",
         owner="Finance / Law", basis="NSW Caring for State Heritage 2025–27: up to $50k for a management document, up to $300k for works; competitive and restricted to conservation. Including it lifts 10-yr IRR from 20.7% to 26.1%.", confidence="Low"),
    dict(id="A-28", area="Finance", item="Weddings per year", value="≈12 in Year 1 (simulated), ramping to 25 by Year 5",
         owner="Finance / Analytics", basis="Finance names 25 weddings a year by Year 5 as the weakest single assumption; the simulation's Year 1 launch rate is an Analytics assumption.", confidence="Low"),
    dict(id="A-29", area="Marketing", item="Target segments and KPIs", value="Domestic heritage tourists · Schools · Local residents & donors; KPIs: booking conversion, CPA, renewal rate, donation revenue",
         owner="Marketing", basis="Marketing chapter (STP and KPI table). Website visits and CPA need GA4 and spend data the prototype does not hold.", confidence="Medium"),

]

# ---------------------------------------------------------------------------
# Visit experiences (bookable sessions)
# ---------------------------------------------------------------------------
EXPERIENCES = [
    dict(id="grounds", name="Estate Grounds — free entry", kind="grounds", duration="9:00–16:30",
         blurb="Wander the elm and poplar carriageway, the rose garden and the views across Sutton Forest. Free, every day — register so we can welcome you.",
         prices={"adult": 0}, capacity=600, assumption="A-12", gst=False),
    dict(id="house-tour", name="The Governors' Retreat — guided house tour", kind="tour", duration="75 min",
         blurb="Sixteen NSW Governors summered here between 1882 and 1957. Walk the corridors and staircases of the only vice-regal country residence in Australia to survive intact.",
         prices={"adult": 35, "concession": 28, "child": 15}, capacity=20, assumption="A-01", gst=True),
    dict(id="garden-walk", name="Heritage Garden Walk", kind="tour", duration="60 min",
         blurb="From the Himalayan cedar paddock to the fan-shaped rose garden — a guided walk through gardens shaped by Charles Moore's advice and a century of change.",
         prices={"adult": 25, "concession": 20, "child": 10}, capacity=25, assumption="A-02", gst=True),
    dict(id="taster-lime", name="Craft Taster: Lime Plastering", kind="workshop", duration="3 hrs",
         blurb="Mix, trowel and finish traditional lime plaster alongside our restoration team.",
         prices={"adult": 120}, capacity=12, assumption="A-03", gst=True, element="core-walls"),
    dict(id="taster-stone", name="Craft Taster: Flat-Stone Walling", kind="workshop", duration="3 hrs",
         blurb="Learn the single-skin, stones-on-edge technique used in Hillview's garden walls.",
         prices={"adult": 120}, capacity=12, assumption="A-03", gst=True, element="stone-walls"),
]

EVENTS = [
    dict(id="ev-open-site", name="Restoration Open Site Day", date="2026-10-24", time="10:00–15:00", kind="event",
         blurb="Hard-hat tours of live restoration work, meet the tradespeople, and see Adopt-a-Stone elements up close.",
         prices={"adult": 15, "child": 0}, capacity=300, gst=True, assumption="A-03"),
    dict(id="ev-twilight-talk", name="Twilight Talk: Summers with the Governors", date="2026-11-05", time="18:00–19:30", kind="event",
         blurb="An evening talk on vice-regal life in the Southern Highlands, 1882–1957.",
         prices={"adult": 30}, capacity=80, gst=True, assumption="A-03"),
    dict(id="ev-friends-preview", name="Friends' Preview Evening: Roses in Bloom", date="2026-11-13", time="17:30–19:30", kind="member-event",
         blurb="A members-only evening in the rose garden before it opens to the public. Friends of Hillview only.",
         prices={"member": 0}, capacity=120, gst=False, membersOnly=True, assumption="A-09"),
    dict(id="ev-garden-open", name="Spring Garden Open Day", date="2026-11-15", time="9:30–16:00", kind="event",
         blurb="The whole garden open, with guided walks every hour, local nurseries and a plant clinic.",
         prices={"adult": 20, "child": 0}, capacity=400, gst=True, assumption="A-03"),
    dict(id="ev-trades-showcase", name="Heritage Trades Showcase", date="2026-11-21", time="10:00–15:00", kind="event",
         blurb="Trainees and master tradespeople demonstrate stonemasonry, carpentry and blacksmithing. Free with registration.",
         prices={"adult": 0}, capacity=350, gst=False, assumption="A-03"),
    dict(id="ev-makers-market", name="Christmas Makers' Market", date="2026-11-28", time="9:00–15:00", kind="event",
         blurb="Southern Highlands makers, growers and bakers on the front lawn.",
         prices={"adult": 5, "child": 0}, capacity=800, gst=True, assumption="A-03"),
]

# ---------------------------------------------------------------------------
# Heritage trades short courses (taught on the live restoration)
# ---------------------------------------------------------------------------
COURSES = [
    dict(id="c-lime", name="Lime Plastering & Rendering", days=2, price=480, capacity=10, element="core-walls",
         dates=["2026-10-17", "2026-11-14"], level="Beginner",
         blurb="Repair historic plaster on the brick-and-stone core of the house using hot-mixed lime."),
    dict(id="c-stone", name="Conservation Stonemasonry: Flat-Stone Walling", days=3, price=690, capacity=8, element="stone-walls",
         dates=["2026-10-27", "2026-11-24"], level="Beginner–Intermediate",
         blurb="Rebuild sections of the garden's single-skin stone walls with master masons."),
    dict(id="c-verandah", name="Heritage Carpentry: Verandah Repair", days=2, price=520, capacity=10, element="return-verandah",
         dates=["2026-10-31", "2026-11-28"], level="Intermediate",
         blurb="Scarf-joint repairs to verandah posts and railings — on the real return verandah."),
    dict(id="c-iron", name="Blacksmithing: Gates & Ironwork", days=1, price=280, capacity=6, element="iron-gates",
         dates=["2026-11-07", "2026-12-05"], level="Beginner",
         blurb="Forge-work fundamentals with a focus on conserving historic ironwork."),
    dict(id="c-roof", name="Corrugated Iron Roofing Conservation", days=2, price=460, capacity=8, element="roof",
         dates=["2026-11-10"], level="Intermediate",
         blurb="Assess, repair and replace historic corrugated iron the conservation way."),
    dict(id="c-rose", name="Heritage Horticulture: Historic Rose Care", days=1, price=180, capacity=14, element="rose-garden",
         dates=["2026-10-20", "2026-11-17"], level="All levels",
         blurb="Pruning, propagation and care of heritage roses in the fan-shaped rose garden."),
]

# ---------------------------------------------------------------------------
# Schools programme (NSW curriculum stages)
# ---------------------------------------------------------------------------
SCHOOL_PROGRAMMES = [
    dict(id="s-governors", name="Life at the Governors' Retreat", stage="Stage 2 (Years 3–4)", subjects=["History"],
         price=28, duration="1 day", ratio="1:10",
         outcomes=["Use sources to explain how people lived in the past", "Compare a heritage home with homes today"]),
    dict(id="s-sustainable", name="Sustainable Estate: Soils, Water & Gardens", stage="Stage 3 (Years 5–6)",
         subjects=["Science & Technology", "Sustainability"], price=30, duration="1 day", ratio="1:10",
         outcomes=["Investigate how gardens use water and soil", "Design a sustainable garden bed"]),
    dict(id="s-detectives", name="Heritage Detectives: Reading a Building", stage="Stage 4 (Years 7–8)",
         subjects=["History", "Geography"], price=32, duration="1 day", ratio="1:15",
         outcomes=["Interpret built heritage as evidence", "Explain why places are heritage-listed"]),
    dict(id="s-materials", name="Making It Last: Materials Science in Restoration", stage="Stage 5 (Years 9–10)",
         subjects=["Science", "STEM"], price=35, duration="1 day", ratio="1:15",
         outcomes=["Test properties of lime, timber and iron", "Evaluate conservation choices"]),
    dict(id="s-trades-3day", name="Heritage Trades Discovery (3 days)", stage="Stages 5–6 (Years 9–12)",
         subjects=["Industrial Technology", "Work Studies"], price=165, duration="3 days", ratio="1:12",
         outcomes=["Hands-on trade skills on a live site", "Explore heritage trades careers and pathways"]),
]

# ---------------------------------------------------------------------------
# Venue hire packages (premium tier)
# ---------------------------------------------------------------------------
VENUE_PACKAGES = [
    dict(id="v-wedding", name="Exclusive Full-Day Hire: Ceremony & Reception", kind="Wedding", from_price=6000, peak_price=6000,
         guests="up to 120", unit="venue fee", blurb="Ceremony under the elms, reception in the house and courtyard."),
    dict(id="v-intimate", name="Rose Garden Ceremony (session)", kind="Wedding", from_price=1800, peak_price=1800,
         guests="up to 40", unit="venue fee", blurb="A ceremony session in the fan-shaped rose garden."),
    dict(id="v-dayDelegate", name="Corporate Day Delegate", kind="Corporate", from_price=95, peak_price=95,
         guests="15–60", unit="per person", blurb="Meeting rooms, catering and a garden walk."),
    dict(id="v-retreat", name="Leadership Retreat + Craft Workshop", kind="Corporate", from_price=260, peak_price=260,
         guests="10–30", unit="per person", blurb="Strategy sessions paired with a hands-on heritage craft workshop."),
    dict(id="v-celebration", name="Private Celebration", kind="Private", from_price=3500, peak_price=3500,
         guests="up to 80", unit="venue fee", blurb="Birthdays and anniversaries in a historic setting."),
]

SPACES = ["Main House", "Gardens & Lawn", "Stables Courtyard"]

# ---------------------------------------------------------------------------
# Friends of Hillview membership
# ---------------------------------------------------------------------------
MEMBERSHIP_TIERS = [
    dict(id="friend", name="Friend", price=90,
         benefits=["14-day priority booking", "15% off tours, workshops & courses", "Friends' preview evenings", "Restoration newsletter"]),
    dict(id="household", name="Household Friend", price=130,
         benefits=["Everything in Friend for 2 adults + children under 16", "Family activity days"]),
    dict(id="supporter", name="Supporter", price=350,
         benefits=["Everything in Household", "Annual behind-the-scenes restoration tour", "Recognition on the Supporters' Wall (opt-in)"]),
    dict(id="patron", name="Patron Circle", price=1500,
         benefits=["Everything in Supporter", "Private Patrons' dinner in the house", "Twice-yearly briefing with the Estate Director"]),
]

FUNDS = [
    dict(id="restoration", name="Restoration Fund", blurb="Conserves the house, outbuildings and garden fabric."),
    dict(id="bursary", name="Education Bursary Fund", blurb="Funds places for young people and concession learners."),
    dict(id="general", name="Where it's needed most", blurb="Lets the Estate direct your gift to the greatest need."),
]

# ---------------------------------------------------------------------------
# Adopt-a-Stone elements (based on published heritage descriptions of Hillview;
# positions on the map are illustrative, NOT surveyed).
# status: available | in_restoration | restored
# ---------------------------------------------------------------------------
ADOPT_ELEMENTS = [
    # Main house
    dict(id="roof", zone="Main House", name="Corrugated iron roof sheets", unit="sheet", price=120, units=180, status="available"),
    dict(id="core-walls", zone="Main House", name="Brick & stone core walls (lime plaster)", unit="square metre", price=90, units=220, status="in_restoration"),
    dict(id="weatherboards", zone="Main House", name="Timber weatherboards", unit="board", price=75, units=300, status="available"),
    dict(id="return-verandah", zone="Main House", name="Return verandah posts", unit="post", price=500, units=24, status="in_restoration"),
    dict(id="verandah-rail", zone="Main House", name="Verandah railings", unit="railing section", price=250, units=40, status="available"),
    dict(id="windows", zone="Main House", name="Timber window sashes", unit="sash", price=1200, units=36, status="available"),
    dict(id="staircase", zone="Main House", name="Staircase balusters", unit="baluster", price=150, units=60, status="available"),
    # Outbuildings
    dict(id="adc-quarters", zone="Outbuildings", name="ADC Quarters roof & joinery", unit="share", price=200, units=60, status="restored"),
    dict(id="stables", zone="Outbuildings", name="Stables doors & stalls", unit="share", price=150, units=80, status="available"),
    dict(id="cottage", zone="Outbuildings", name="Stableman's cottage (1898)", unit="share", price=150, units=70, status="available"),
    dict(id="caretaker", zone="Outbuildings", name="Caretaker's house verandah", unit="share", price=100, units=50, status="available"),
    # Garden & landscape
    dict(id="elm-drive", zone="Garden & Landscape", name="Elm & poplar carriageway trees", unit="tree care", price=350, units=48, status="available"),
    dict(id="cedars", zone="Garden & Landscape", name="Himalayan cedar paddock", unit="tree care", price=350, units=16, status="available"),
    dict(id="rose-garden", zone="Garden & Landscape", name="Fan-shaped rose garden", unit="rose bed", price=150, units=40, status="in_restoration"),
    dict(id="tile-edging", zone="Garden & Landscape", name="Terracotta tile path edging", unit="tile", price=25, units=600, status="available"),
    dict(id="stone-walls", zone="Garden & Landscape", name="Flat-stone garden walls", unit="stone", price=50, units=500, status="in_restoration"),
    dict(id="archways", zone="Garden & Landscape", name="Stone archways on the drive", unit="stone block", price=100, units=120, status="available"),
    dict(id="pergolas", zone="Garden & Landscape", name="Brick & timber pergolas", unit="beam", price=300, units=30, status="available"),
    dict(id="pool", zone="Garden & Landscape", name="Contemplative pool & fish pond", unit="share", price=200, units=50, status="restored"),
    dict(id="iron-gates", zone="Garden & Landscape", name="Historic entrance iron gates", unit="whole gate restoration", price=5000, units=2, status="available"),
]

# Year 1 revenue plan by stream (A-18 placeholder)
REVENUE_PLAN_Y1 = {
    "House & garden tours": 120_000,
    "Workshops & events": 80_000,
    "Heritage trades courses": 60_000,
    "Schools programme": 45_000,
    "Venue hire": 380_000,
    "Membership": 50_000,
    "Donations": 140_000,
    "Adopt-a-Stone": 50_000,
}


# ---------------------------------------------------------------------------
# Finance chapter base case (reference values shown in the Console; A-24 to A-28)
# ---------------------------------------------------------------------------
FINANCE = dict(
    hurdle=0.03, gdpGrowth=0.021, priceEscalation=0.03,
    allocation=[dict(item="Media & awareness", share=0.35), dict(item="Digital platform", share=0.25),
                dict(item="Events & programming", share=0.20), dict(item="Schools programme", share=0.20)],
    results=[dict(measure="NPV at 3%, Years 0–5", value="($209,000)"), dict(measure="IRR, Years 0–5", value="(6.5%)"),
             dict(measure="NPV at 3%, Years 0–10", value="$1,123,000"), dict(measure="IRR, Years 0–10", value="20.7%"),
             dict(measure="First operating surplus", value="Year 2"), dict(measure="Payback (cumulative cash positive)", value="Year 6"),
             dict(measure="Year 5 revenue", value="$987,000"), dict(measure="Year 5 operating surplus", value="$353,000")],
    breakEven="Revenue can fall ~30% below base case before the 10-year IRR drops under 3%",
    gate="Year 2 decision gate: if cumulative revenue < 70% of plan, move remaining media and events budget to the best-performing stream",
    platformRisk="A 50% overrun on the $250k platform cuts NPV by $172k; a 100% overrun still leaves IRR at 14.0%",
)

# ---------------------------------------------------------------------------
# Marketing chapter: segments and KPI table (A-29)
# ---------------------------------------------------------------------------
MARKETING = dict(
    segments=["Domestic heritage tourists", "Schools", "Local residents & donors"],
    mediaBudget=350_000,
)
