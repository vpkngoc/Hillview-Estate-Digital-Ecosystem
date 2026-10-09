# Hillview Estate Digital Platform — Requirements & User Stories

**Version:** v0.2 · 10 Oct 2026 (v0.1 questions answered; see section 10 and `docs/DECISION_LOG.md`)
**Owner:** Ngoc (Technology / online interface lead), Team 4E, MQBS3010
**Working name:** *Hillview Connect* (placeholder, see Open Question Q11)
**Status:** Draft for the team to review. This is the list we design and test against, so "is this good?" gets answered by the requirements and not by instinct.

> Demo disclaimer, which must appear in the build: *"Student concept prototype prepared for MQBS3010. Not an official product of The King's Foundation. All transactional data is synthetic."*

---

## 0. Materials reread for this spec

| Source | What it gives us |
|---|---|
| MQBS3010 assessment brief | $1M endowment, 0–5 yrs, return ≥ max(AU GDP growth, 3%), no debt, grants/donations need a rationale, "Develop a technological / online interface…" is an explicit remit item, software from your major must be used |
| Team 4E Agility Challenge deck (14 slides) | SDG 8, three aims, tiered access model, revenue sequencing Y1→Y3+, Education Hub (schools / heritage trades / volunteer→trainee→placement), Community Reference Group + stakeholder map, two engines (Donor: CRM→lifecycle dashboard; Visitor: unified booking→data→demand forecast), Adopt-a-Stone, Friends membership, earned/partnered/owned media, budget split (Digital Platform 25% = $250k) |
| Wingecarribee Shire Council Hillview page | TKFA launched Oct 2024; long-term lease; Hillview is the "flagship regeneration project in Australia"; planned "vibrant cultural and educational hub" with heritage crafts workshops, community events, guided tours |
| King's Foundation site | Mission "building sustainable communities and transforming lives"; "inspired by nature and tradition"; education areas (Building Arts & Crafts, Traditional Arts, Horticulture, Farming & Rural Skills, STEM, Hospitality); donations via external JustGiving page |
| Dumfries House page | Free grounds daily; guided house tours; visitor centre & shop; STEM multi-day school programmes; Introduction to Hospitality; venue hire (weddings, birthdays, corporate); The Lodge accommodation; Donate = external JustGiving link; newsletter |
| Hillview heritage sources (Wikipedia SHR summary, NSW Governor's speech 14 Apr 2025) | NSW State Heritage Register no. 442 (listed 1999); Governors' country residence 1882–1957; ~60 ha site; main house plus ADC quarters, stables, caretaker's cottage; Charles Moore–influenced gardens, elm & poplar serpentine drive, rose garden, Himalayan cedar paddock, contemplation pool; to become a hub for culture, education and training |

*Heritage facts above come from secondary sources. Verify them against the NSW State Heritage Inventory before they appear in the press-room fact sheet.*

---

## 1. The problem we are solving

TKFA holds a State Heritage-listed estate that has substantial restoration costs and no established trading revenue. The Dumfries House model runs visiting, education, venue hire, accommodation and giving through **separate channels**; even its Donate button leaves the site for JustGiving. Hillview starts from zero, so it can be built as **one system from day one**.

### Our three differentiators (the platform must make each visible in the demo)

**D1 — The revenue loop.** Every touchpoint writes to **one supporter record**, so a free visitor can be followed and nurtured all the way to donor:

```
 Discover ──▶ Free grounds visit ──▶ Paid experience ──▶ Friend of Hillview ──▶ Donor / Adopt-a-Stone
 (earned/      (registered,           (tour, workshop,     (annual membership)     (gift tied to a
  owned media)  capacity-managed)      course, event)                               real element)
     ▲                                                                                   │
     └──── Return visit · referral · upgrade (patron/bequest) ◀── Impact update ◀───────┘
                                                              ("your stone is now restored")
```

Feeder loops into the same record:
- **Education loop:** school excursion → family return visit; short course → volunteer → trainee → paid placement → alumni ambassador (SDG 8.6).
- **Venue loop:** wedding or corporate guests become first-time visitors.

**D2 — One ecosystem.** One calendar (no wedding/school-group clashes), one checkout (tickets, courses, membership and a donation in a single basket), one supporter ID, one data layer feeding dashboards and forecasting.

**D3 — Transparency.** A public impact page and restoration ledger (funds raised vs target, where money went, elements restored, learners trained, people placed in jobs), plus a press room. Media and donors read the same verified numbers.

### Design principles (non-negotiable)
1. **Grounds stay free.** Free registration is optional and exists only for capacity management and to start the loop.
2. **No cannibalisation.** Member benefits must not undercut paid revenue (see Q3).
3. **Privacy by design**, aligned with the Australian Privacy Principles (Privacy Act 1988). Collect the minimum, keep consent explicit and granular, give access by role. Co-designed with Law/Cyber.
4. **Real numbers only on public pages**; demo data is labelled as synthetic.
5. **Brand fidelity:** dignified, warm, nature-led; British/Australian spelling ("programme", "centre").
6. **Accessibility:** WCAG 2.1 AA target (contrast, keyboard navigation, alt text).

---

## 2. Activity & programme inventory

Tier key: **F** = Free · **T** = Ticketed · **P** = Premium · **Ph** = Philanthropic · **G** = Grant/partner funded · **Int** = internal
Source key: **Deck** = our Agility deck · **DH** = Dumfries House model · **HV** = Hillview public material · **New** = our proposal

| ID | Activity / programme | Pillar | Tier | Phase | Module | Source |
|---|---|---|---|---|---|---|
| A01 | Free estate grounds access (gardens, elm drive, parkland) | Visit | F | Y1 | M2 | Deck, DH |
| A02 | Guided house tours (vice-regal history, interiors) | Visit | T | Y1 | M2 | Deck, DH, HV |
| A03 | Heritage garden tours (Charles Moore gardens, rose garden, cedar paddock) | Visit | T | Y1 | M2 | New (HV assets) |
| A04 | Year-round events calendar: seasonal festivals, open days, talks, markets | Events | T/F | Y1 | M2 | Deck, HV |
| A05 | Public workshops & curated experiences (half-day craft tasters) | Visit/Edu | T | Y1–Y3 | M2 | Deck, HV |
| A06 | Weddings | Venue | P | Y1 | M3 | Deck, DH |
| A07 | Corporate hire: meetings, retreats, day-delegate packages | Venue | P | Y1 | M3 | Deck, DH |
| A08 | Private celebrations (birthdays, anniversaries) | Venue | P | Y1 | M3 | DH |
| A09 | Schools programme: curriculum-aligned excursions (heritage, sustainability, STEM) | Education | T | Y2 | M4 | Deck, DH |
| A10 | Multi-day primary & secondary programmes | Education | T | Y2 | M4 | Deck, DH |
| A11 | Heritage trades short courses: conservation stonemasonry, lime plastering, heritage carpentry, blacksmithing, horticulture, taught on the live restoration | Education | T/G | Y1–Y3 | M4 | Deck, HV |
| A12 | Youth pathway: Volunteer → Trainee → Paid placement | Education/SDG 8.6 | G/Ph | Y2+ | M5 | Deck |
| A13 | Industry advisory board (employers commit to hiring graduates) | Education | Int | Y2+ | M5 | Deck |
| A14 | Friends of Hillview annual membership (tiers) | Supporters | Ph/T | Y1–Y2 | M6 | Deck |
| A15 | One-off & regular donations to named funds | Supporters | Ph | Y1 | M7 | Deck, DH |
| A16 | Adopt-a-Stone: map-based micro-donations tied to physical elements | Supporters | Ph | Y1 | M7 | Deck |
| A17 | Major donors, patrons, bequests | Supporters | Ph | Y2+ | M8 | New |
| A18 | Grants & funding-source pipeline (restoration capital) | Finance | G | Y1 | M8 | Brief, Ngoc's offer |
| A19 | Community Reference Group (Sutton Forest / Moss Vale / Bowral / wider Wingecarribee) | Community | Int | Y1 | M9 | Deck (relocalised) |
| A20 | Stakeholder power/interest map | Community | Int | Y1 | M9 | Deck |
| A21 | Volunteer programme (garden, guiding, events): sign-up, rosters, hours | Community/Edu | F | Y1 | M9 | New (stage 1 of A12) |
| A22 | Public impact dashboard & restoration ledger | Transparency | F | Y1 | M10 | New (D3) |
| A23 | Restoration journal: tradesperson stories, progress photos, 3D captures | Media (owned) | F | Y1 | M10 | Deck |
| A24 | Press room / media kit; documentary partner access | Media (earned/partnered) | F | Y1 | M11 | Deck |
| A25 | Visitor demand forecasting (school terms, weather, regional events) → staffing & inventory | Operations | Int | Y1 | M12 | Deck |
| A26 | Revenue & loop-conversion dashboard vs business plan | Operations/Finance | Int | Y1 | M12 | New |
| A27 | Accommodation pilot (enquiry only in demo) | Venue/Visit | P | Y3+ | M3 | Deck, DH (The Lodge) |
| A28 | Shop / estate produce / gift vouchers | Retail | T | Y2+ | M2 | DH (could) |

---

## 3. System map: modules

| Module | Name | Surfaces | Demo priority |
|---|---|---|---|
| M1 | Identity & Supporter Record (single ID, consent) | all | **Core** |
| M2 | Bookings & Shared Calendar (grounds, tours, events, workshops, one basket) | Public, Console | **Core** |
| M3 | Venue Hire CRM (enquiry → confirmed) | Public, Console | Core-lite |
| M4 | Education Hub (schools, short courses) | Public, Console | **Core** |
| M5 | Pathway Tracker (volunteer → trainee → placement, employer board) | Portal, Console | Core-lite |
| M6 | Membership — Friends of Hillview | Public, Portal | **Core** |
| M7 | Giving — donations + Adopt-a-Stone map | Public, Portal | **Core (hero feature)** |
| M8 | Donor CRM & lifecycle analytics | Console | **Core** |
| M9 | Community & Volunteers | Public, Console | Lite |
| M10 | Transparency & Impact | Public | **Core** |
| M11 | Press Room | Public | Lite |
| M12 | Operations Intelligence (revenue dashboard, demand forecast) | Console | **Core** |
| M13 | Privacy & Governance (roles, consent ledger, audit) | Console | **Core** |

Three surfaces:
- **Public site:** what's on, book, join, give, impact, press.
- **My Hillview:** the supporter portal, showing one person's tickets, membership, adopted stones, updates and consents.
- **Estate Console:** staff/board view with dashboards, CRM, calendar, forecast, role switcher.

---

## 4. Personas

| # | Persona | Goal |
|---|---|---|
| P1 | **Day-tripper / local family** (Sydney or Southern Highlands) | A good day out, ideally free, easy to plan |
| P2 | **Teacher / school excursion coordinator** | A curriculum-aligned, low-admin, safe excursion |
| P3 | **Adult learner** (hobbyist or tradesperson upskilling) | Learn a heritage craft on real fabric |
| P4 | **Young person seeking work** (pathway applicant) | A route into paid, skilled work |
| P5 | **Couple / private event host** | Book a heritage venue with confidence |
| P6 | **Corporate client** | Meeting or retreat with purpose |
| P7 | **Friend of Hillview** (member) | Belong, get value, support the estate |
| P8 | **Small donor / Adopt-a-Stone giver** | Give something tangible and see it happen |
| P9 | **Major donor / patron** | Legacy and recognition, stewarded personally |
| P10 | **Journalist / documentary partner** | Accurate facts, images, access, stories |
| P11 | **Local resident / Reference Group member** | A voice on growth (traffic, noise, local jobs) |
| P12 | **Advisory-board employer** | Job-ready graduates |
| P13 | **Estate operations manager** | Right staff on the right day, no double-bookings |
| P14 | **Development (fundraising) officer** | Know every supporter and grow the relationship |
| P15 | **Education coordinator** | Run courses & pathway, evidence outcomes |
| P16 | **Board member / finance** | Track performance against the plan and the 3% hurdle |
| P17 | **Privacy officer** (Law/Cyber teammate's lens) | Lawful, minimal, secure data handling |

---

## 5. User stories

Priority: **MUST** = in the 16 Oct demo · **SHOULD** = shown as a designed screen or mock if time allows · **COULD** = roadmap only (described in the chapter)

### M1 Identity & Supporter Record
- **US-01 MUST** As P1, I want one Hillview account that holds my tickets, membership, donations and courses, so I don't juggle separate systems.
  *AC:* "My Hillview" shows every interaction on one timeline; guest checkout is allowed, and matching on email links it to the same supporter record.
- **US-02 MUST** As any supporter, I want to choose what I'm contacted about (newsletter, events, appeals, impact updates) when I give my details, so I stay in control.
  *AC:* separate, unticked consent options; each consent stored with a timestamp and source; withdrawable from My Hillview.
- **US-03 SHOULD** As a supporter, I want to download or request deletion of my data.

### M2 Bookings & Shared Calendar
- **US-04 MUST** As P1, I want to see everything on at Hillview on a date (free grounds, tours, workshops, events) in one calendar, so I can plan a visit.
  *AC:* filter by type, price (free/paid), audience (family/adult/school); remaining capacity shown.
- **US-05 MUST** As P1, I want to register a free grounds visit in under a minute, so I can visit at no cost while the estate can manage numbers.
  *AC:* no payment step; name, email, party size, consent; daily capacity cap.
- **US-06 MUST** As P1, I want to book a house tour and a workshop and add a donation in one checkout, so I pay once.
  *AC:* multi-item basket; member pricing auto-applied when logged in; optional "add a gift to the restoration"; confirmation with QR (mock).
- **US-07 SHOULD** As P7, I want a priority booking window before general release, so membership feels worth it.
- **US-08 MUST** As P13 (front-of-house), I want to check in arrivals by QR or name search, so attendance feeds the data layer.
- **US-09 COULD** As P1, I want to buy gift vouchers and estate produce online.

### M3 Venue Hire CRM
- **US-10 MUST** As P5, I want to see indicative available dates and send an enquiry with date, guest numbers and budget band, so I get a tailored quote.
  *AC:* dates already used by events or school bookings are shown as unavailable; the enquiry creates a lead in the Console pipeline.
- **US-11 MUST** As P13, I want every confirmed booking (venue, school group, event) to block the shared estate calendar by space (house, garden, stables), so we never double-book.
- **US-12 SHOULD** As the events manager, I want a pipeline (Enquiry → Site visit → Quote → Deposit → Confirmed → Delivered) with values, so I can forecast premium revenue.
- **US-13 SHOULD** As P6, I want packaged options (day-delegate, leadership retreat + workshop), so booking is simple.
- **US-14 COULD** As P1, I want to enquire about overnight stays (accommodation pilot, Y3+).

### M4 Education Hub
- **US-15 MUST** As P2, I want to browse excursions by NSW stage and subject (History, Geography, Science & Technology, sustainability) and request a date for my class, so I can plan the excursion.
  *AC:* each programme shows duration, price per student, supervision ratio and learning outcomes; the request collects class-level numbers only, not student names (see US-49).
- **US-16 SHOULD** As P2, I want to download a pre-visit pack and risk assessment, so admin is quick.
- **US-17 MUST** As P3, I want to enrol in a heritage trades short course and see which part of the building I'll work on, so I know I'm learning on the live restoration.
  *AC:* course page links to the matching element on the Adopt-a-Stone map.
- **US-18 SHOULD** As P3, I want to apply for a bursary or concession place.
- **US-19 COULD** As P3, I want a digital certificate and alumni profile.

### M5 Pathway Tracker (SDG 8.6)
- **US-20 MUST** As P4, I want to apply to the Volunteer → Trainee → Placement pathway and see which stage I'm at, so I know what's next.
  *AC:* application form; stage tracker in My Hillview; volunteer hours count toward eligibility.
- **US-21 SHOULD** As P15, I want to log competencies and supervised hours per trainee, so progression is evidence-based.
- **US-22 SHOULD** As P12, I want to see job-ready trainees who have opted in and post placement offers, so the advisory board's commitment turns into hires.
- **US-23 MUST** As P16, I want pathway outcomes (applied, active, completed, placed, still employed at 6 months), so SDG 8.6 impact is measurable.

### M6 Membership — Friends of Hillview
- **US-24 MUST** As P1 after a second visit, I want to join Friends of Hillview at a tier that suits me, so I get benefits and support the estate.
  *AC:* tiers, annual price and benefits shown; benefit rules are configurable (pending Q3); the system nudges the visitor to join after their 2nd paid visit.
- **US-25 SHOULD** As P7, I want renewal reminders and auto-renew, so my membership doesn't lapse.
- **US-26 SHOULD** As P7, I want to gift a membership.

### M7 Giving — Donations & Adopt-a-Stone (hero feature)
- **US-27 MUST** As P8, I want to adopt a specific element (a stone, a verandah post, a window, a garden bed) on an interactive map of Hillview, so my gift is tangible.
  *AC:* map with element states (Available → Adopted → In restoration → Restored); price bands by element type; a dedication message, moderated before display; an adoption certificate.
- **US-28 MUST** As P8, I want an update when my element moves to "In restoration" and to "Restored", with a photo and the tradesperson's story, so I see the impact of my gift.
  *AC:* a status change in the Console triggers a notification on the supporter's My Hillview timeline (email mocked).
- **US-29 MUST** As P8, I want to give one-off or monthly to a named fund (Restoration / Education bursaries / Where most needed), so I choose where my money goes.
  *AC:* receipt issued; it does **not** claim tax-deductibility unless DGR status is confirmed (Q7).
- **US-30 SHOULD** As P8, I want to see collective progress (e.g., "Verandah: 64% adopted") and earn supporter badges, so giving feels social (the "gamified" element from the deck).
- **US-31 COULD** As P9, I want to make a bequest enquiry confidentially.

### M8 Donor CRM & Lifecycle Analytics
- **US-32 MUST** As P14, I want a single supporter view with all interactions (visits, purchases, courses, membership, gifts, adoptions, consents), so I know the relationship before I make contact.
- **US-33 MUST** As P14, I want supporters segmented by loop stage and RFM (recency, frequency, monetary), so appeals go to the right people.
  *AC:* segments computed on synthetic data; filterable; exports include only supporters with matching consent.
- **US-34 MUST** As P16, I want a revenue-loop funnel (Visitor → Paid → Member → Donor → Repeat donor) with monthly conversion rates, so we can see where the loop leaks.
- **US-35 SHOULD** As P14, I want a lapse-risk flag on members and donors, so I can act before they churn.
- **US-36 SHOULD** As P14, I want a major-donor pipeline (Identify → Cultivate → Solicit → Steward).
- **US-37 SHOULD** As P16, I want a funding-source tracker (funder, amount range, deadline, eligibility, fit score), so Finance gets clean, comparable options (links to the funding research).

### M9 Community & Volunteers
- **US-38 SHOULD** As P11, I want to see Community Reference Group meeting dates and minutes and submit feedback (e.g., event-day traffic), so I have a voice as the estate grows.
- **US-39 SHOULD** As a volunteer, I want to sign up for shifts (garden, guiding, events) and log hours, so my contribution counts toward the pathway.
- **US-40 COULD** As the community manager, I want an internal power/interest stakeholder map with an engagement plan per group.
- **US-41 COULD** As P11, I want a local-resident offer (e.g., residents' open days).

### M10 Transparency & Impact
- **US-42 MUST** As P10 or any member of the public, I want a public impact page showing funds raised vs restoration target, allocation by fund, elements restored, learners trained, people placed in work, visitors and volunteer hours, so I can trust the Foundation.
  *AC:* figures come from platform data, never hand-typed; "last updated" stamp; methodology notes; synthetic data clearly labelled in the demo.
- **US-43 SHOULD** As P8 or P10, I want a restoration journal (posts linked to map elements), so progress is visible and shareable.

### M11 Press Room
- **US-44 MUST** As P10, I want a press room with a verified fact sheet, approved images, latest releases and a media-enquiry form, so I can report accurately.
- **US-45 COULD** As a documentary partner, I want a filming schedule and access-request form.

### M12 Operations Intelligence
- **US-46 MUST** As P13, I want an 8-week daily visitor forecast driven by NSW school terms and holidays, weather and the regional events calendar, so I can roster staff and stock.
  *AC:* chart of forecast with an uncertainty band; contribution of each driver shown; the model is built in Python and its output exported to the dashboard.
- **US-47 SHOULD** As P13, I want a suggested staffing level per day derived from the forecast.
- **US-48 MUST** As P16, I want revenue by stream (grounds, tours, workshops, courses, schools, venue, membership, donations, adoptions) against the business-plan targets, so we can track the return hurdle.

### M13 Privacy & Governance
- **US-49 MUST** As P17, I want role-based access (front-of-house sees bookings but not gift amounts; the education team sees trainees but not donors), so each person sees only what they need.
  *AC:* role switcher in the demo Console visibly changes what each role can see.
- **US-50 SHOULD** As P17, I want an audit log of who viewed or exported supporter data.
- **US-51 MUST** As P17, I want school bookings to collect class-level data only and pathway applicants' data kept separate from donor data, so we minimise risk with young people's information.

**Count:** 51 stories: 25 MUST, 19 SHOULD, 7 COULD. Build status per story: see `docs/STORY_COVERAGE.md`.

---

## 6. Proposed demo scope & golden path

The demo should follow **one supporter through the whole loop** (synthetic persona "Sarah, Bowral"):

1. Sarah sees a restoration journal post (owned media) → **What's On** → registers a **free grounds visit** (US-04/05)
2. Returns and books **house tour + lime-plastering taster**, adds $10 to restoration (US-06)
3. Gets the nudge to **join Friends of Hillview** (US-24)
4. **Adopts a verandah post** on the map (US-27)
5. Staff mark the post **In restoration** in the Console → Sarah's timeline updates with a trades story (US-28)
6. Console: Sarah appears in the **single supporter view** and moves through the **loop funnel** (US-32/34); role switcher shows privacy controls (US-49)
7. Public **impact page** updates: funds raised, elements restored (US-42)
8. Ops tab: **demand forecast** and **revenue vs plan** (US-46/48)

### Data plan
| Data | Real (public) or synthetic | Note |
|---|---|---|
| Heritage facts, site elements | Real (SHR listing, histories) | verify before use |
| NSW school term dates | Real (NSW Dept of Education publishes them) | forecasting driver |
| Weather history (Moss Vale / Bowral) | Real (Bureau of Meteorology climate data) | forecasting driver |
| Regional events (e.g., Bowral's Tulip Time) | Real calendar, to be confirmed | forecasting driver |
| Regional visitation baseline | Real if a Tourism Research Australia / Destination NSW figure for Southern Highlands can be sourced; otherwise assumption | goes in assumptions register |
| Prices, tiers, capacities | From the Finance/Marketing chapters | must match the financial model |
| Supporters, bookings, gifts | **Synthetic** (generated ~2–5k records with seeded behaviour) | labelled in UI |

### Stack (decided, see DECISION_LOG D-01)
- **Front end:** Vite + React + TypeScript + Tailwind CSS, HashRouter, static build. Deploys unchanged to Vercel or GitHub Pages (workflow included)
- **Data:** JSON generated by the Python pipeline; demo actions kept in the browser (localStorage) with a Reset button; pretend checkout
- **Analytics:** Python (pandas, statsmodels) for the simulation, RFM segmentation and Negative Binomial demand forecast with backtest. This is the evidence for "software from your major"
- **Map:** hand-drawn SVG site plan with clickable, status-coloured pins (illustrative, not surveyed)
- Repo: `/web` (app), `/analytics` (Python pipeline), `/docs` (this spec, decision log, assumptions register, story coverage, demo script)

---

## 7. Privacy & data governance notes (for Law/Cyber co-design)
- Australian Privacy Principles: APP 3 (collect only what's necessary), APP 5 (notification at collection), APP 6 (use/disclosure), APP 7 (direct marketing opt-out), APP 11 (security), APP 12/13 (access/correction).
- Spam Act 2003 for marketing emails (consent + unsubscribe).
- Children and young people: school bookings at class level only; if the pathway accepts under-18s, Working with Children Check and child-safe standards apply to staff (Q8).
- Payment data never stored on the platform (tokenised via the payment provider).
- *I'm not a lawyer. The Law/Cyber teammate should confirm these mappings.*

---

## 8. Brand guidance for the build
- **Palette (from our deck, exact hex values to confirm from the Canva brand kit, Q12):** deep forest green background (~#0E3B1B), leaf-green accent (~#7CC242), ivory/cream text (~#F5F1E6), with natural photography (foliage, grounds).
- **Type:** elegant high-contrast serif for headings (deck appears to use a Cormorant-style serif) with a clean sans for UI body text; a script face only for the wordmark moment.
- **Tone:** warm, dignified, nature-led ("inspired by nature and tradition"); short and direct; "programme", "centre".
- **Logo:** the official King's Foundation crest only with permission; otherwise use a text wordmark "Hillview Estate". The demo disclaimer is always visible.

---

## 9. Inconsistencies found in the current deck (affect the platform)
1. **Membership benefit:** slides "Subscription Access" and "Friends of the Hill View" say members get **free festival/event entry**. The team previously agreed to change this to priority access, discounts and member-only events, because free entry cannibalises ticket revenue. The platform needs one rule (Q3).
2. **Wrong locale:** the Community slide names **Cumnock and East Ayrshire**, which is Dumfries House's community. For Hillview it should be Sutton Forest, Moss Vale, Bowral and the wider Wingecarribee Shire.
3. **Naming:** slide 2 says "Friends of **Dumfries House**"; slide 11 says "Friends of the **Hill View**". Standardise to "Friends of Hillview".
4. **"King's Hall opening in 2027":** no public source found linking a King's Hall to Hillview. If this was carried over from Dumfries House, remove it or source it (Q10).
5. **Media 35% of budget** sits alongside the partnership-not-impression slide; the team previously flagged a large media allocation as hard to defend. That's Finance/Marketing's call, but it changes the Digital Platform's share (currently 25% = $250k).
6. **Lease date:** the deck says TKFA "took the lease… in April 2025". Public sources show TKFA acquired the leasehold in 2024 and held a reception on 14 Apr 2025. Verify the exact wording.

---

## 10. Open questions: answered 10 Oct 2026

| Q | Answer | How it's handled |
|---|---|---|
| Q1 Stack | Ngoc codes alone; my call | Vite + React static app (simpler than Next.js for a solo, backend-free demo) |
| Q2 Demo use | Both live and screenshots; hard date 16 Oct | Shareable demo link + screenshot set |
| Q3 Membership | Designer sets figures, flagged | Tiers $75/$130/$350/$1,500; benefits = priority booking + 15% off + member-only events, NO free paid-event entry (A-08, A-09) |
| Q4 Prices | Use designer's figures, flag for Finance | All in `analytics/catalogue.py`, each with an A-xx flag |
| Q5 Adopt-a-Stone | Designer's figures, flag; research map | 20 elements from published heritage descriptions; bands $25–$5,000 (A-10) |
| Q6 Payments | Pretend checkout | No payment provider; notice on checkout |
| Q7 Tax | Go with GST | GST-inclusive prices, 1/11 shown on tax invoice; gifts no GST; no deductibility claim (A-19, A-20) |
| Q8 Pathway ages | Align with Australian law | 16–24; guardian consent for 16–17; WWCC note; separate data domain |
| Q9 Law/Cyber | Flag areas needing input | 11 flags in Console → Privacy & governance; draft Privacy page |
| Q10–Q15 | Name "Hillview Connect"; brand from Canva deck + Foundation site; Python | Applied |

### Still open
- Finance to replace A-01…A-11 and A-18 with chapter figures, then re-run `python run_all.py`.
- Law/Cyber to review the governance flags and Privacy page.
- Confirm Acknowledgement of Country wording (A-23).
- Deck fixes from section 9 (free festival entry, Cumnock/East Ayrshire, naming, King's Hall 2027, lease date).
