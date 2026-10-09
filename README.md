# Hillview Connect

**A student concept prototype** of one digital platform for Hillview Estate, Sutton Forest. It covers visiting, learning, supporting and running the estate, and was built for MQBS3010 Capstone (Macquarie Business School), Team 4E. It is **not an official product of The King's Foundation**. All supporters, bookings and payments are simulated.

The demo shows the team's three differentiators:

1. **Revenue loop.** Every touchpoint writes to one supporter record: free visit → paid experience → Friend of Hillview → donor / Adopt-a-Stone → impact update → return. The Console shows where the loop leaks.
2. **One ecosystem.** One calendar (no double-bookings), one basket and checkout, one supporter ID, one data layer feeding dashboards and the demand forecast.
3. **Transparency.** A public impact page and a press room built from the same numbers the board sees.

---

## Run it locally (VS Code)

You need **Node 18+** and **Python 3.10+**.

```bash
# 1. (optional) regenerate the data — only needed after changing figures
cd analytics
pip install -r requirements.txt
python run_all.py          # writes web/src/data/*.json and docs/ASSUMPTIONS_REGISTER.md

# 2. run the web app
cd ../web
npm install
npm run dev                # open the URL it prints (http://localhost:5173)
```

`npm run build` creates a static site in `web/dist/`.

## Deploy

- **Vercel:** import the GitHub repo, set **Root Directory = `web`**. The framework (Vite) is auto-detected. Done.
- **GitHub Pages:** push to `main`. The workflow in `.github/workflows/deploy.yml` builds `web/` and publishes it. In the repo, go to Settings → Pages → Source = GitHub Actions.

The app uses hash routing and relative asset paths, so it works from any static host or sub-path.

## Repository layout

```
analytics/                  Python pipeline ("software from the major")
  catalogue.py              ← every price, tier, capacity + the assumptions register (edit here)
  reference_data.py         real public data: NSW school terms, public holidays, Tulip Time, BOM climate
  simulate.py               synthetic Year-1 operations (visitors, supporters, bookings, gifts)
  segment_supporters.py     loop stage, RFM segmentation, lapse risk, cohort conversion
  forecast_demand.py        Negative Binomial GLM demand forecast + 8-week backtest
  run_all.py                runs everything, writes JSON for the app
web/                        Vite + React + TypeScript + Tailwind
  src/pages/                public site, My Hillview, checkout
  src/pages/console/        Estate Console (staff): overview, CRM, calendar, forecast, restoration, education, governance, assumptions
  src/lib/store.tsx         demo state (localStorage), pricing, GST, notifications
docs/
  PLATFORM_SPEC.md          requirements, activity inventory, personas, 51 user stories
  STORY_COVERAGE.md         which stories are built, partial or roadmap
  DECISION_LOG.md           design decisions and why
  ASSUMPTIONS_REGISTER.md   every placeholder figure, owner and confidence (generated)
  DEMO_SCRIPT.md            3-minute presentation walkthrough
```

## Changing a figure (e.g. when Finance confirms prices)

1. Edit the value in `analytics/catalogue.py` and update its `ASSUMPTIONS` entry (basis, confidence).
2. `python run_all.py`
3. Refresh the app. Prices, dashboards, plan-vs-actual and the register all update.

## What's real and what isn't

| Real (public sources, retrieved 10 Oct 2026) | Simulated / placeholder |
|---|---|
| NSW school terms and holidays 2025–26 (NSW Dept of Education) | All supporters, bookings, gifts, pathway participants |
| NSW public holidays 2026 (Visit NSW) | All prices, tiers, capacities, targets (flagged A-01…A-18) |
| Tulip Time 2026 dates (Wingecarribee Shire Council) | Visitation level (~35k/yr) and driver effect sizes |
| BOM climate normals, Moss Vale (068045) | Restoration appeal target ($1.5M placeholder) |
| Heritage facts about Hillview (SHR summary, council, NSW Governor) | Map positions (illustrative, not surveyed) |

In the app, **Review flags** (⚑ A-xx) mark every placeholder. Toggle them in the top banner.

## Demo tips

- **Reset demo** (top banner) clears everything you did.
- Sign in as **Sarah Mitchell** (demo persona) from My Hillview or at checkout.
- In the **Estate Console**, use the *Signed in as* menu to see how each role's access changes.
