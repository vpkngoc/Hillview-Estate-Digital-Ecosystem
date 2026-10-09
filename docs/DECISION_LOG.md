# Decision log: Hillview Connect

| ID | Date | Decision | Why | Who |
|---|---|---|---|---|
| D-01 | 10 Oct 2026 | Vite + React + TypeScript static app instead of Next.js | One developer, no backend needed for a demo; simplest to run in VS Code; deploys unchanged to Vercel or GitHub Pages | Ngoc |
| D-02 | 10 Oct 2026 | Python owns all figures (`analytics/catalogue.py`) and generates the app's data | Single source of truth; Finance changes flow through with one command; Python is the major's software | Ngoc |
| D-03 | 10 Oct 2026 | Pretend checkout (no payment provider) | Demo only; avoids PCI scope and external dependencies | Ngoc |
| D-04 | 10 Oct 2026 | GST-inclusive pricing, 1/11 shown on tax invoice; donations and Adopt-a-Stone GST-free; receipts make no tax-deductibility claim | Australian GST basics; DGR status unconfirmed (A-19, A-20) | Ngoc, to be verified by Finance/Law |
| D-05 | 10 Oct 2026 | Membership: priority booking (14 days), 15% off, members-only events; **no free entry to paid events** | Avoids revenue cannibalisation (earlier team decision); deck slides still need updating | Team |
| D-06 | 10 Oct 2026 | Youth pathway 16–24; guardian consent for 16–17; pathway data kept in a separate domain, never joined to fundraising data | Align with Australian law (child safety, privacy); reduces risk with young people's data | Ngoc, Law to confirm |
| D-07 | 10 Oct 2026 | Schools collect class-level numbers only, never student names | Data minimisation (APP 3) | Ngoc |
| D-08 | 10 Oct 2026 | Forecast model: Negative Binomial GLM with real calendar drivers + BOM climate normals; Monte-Carlo prediction interval; 8-week backtest vs day-of-week baseline | Explainable effects (multipliers), handles over-dispersed counts, honest validation | Ngoc |
| D-09 | 10 Oct 2026 | Loop funnel compares each stage to its natural reference group (e.g. Friend vs paid visitors, Donor vs all registered) | Stages aren't strictly sequential; "% of previous row" gave misleading values above 100% | Ngoc |
| D-10 | 10 Oct 2026 | Adopt-a-Stone map is an illustrative SVG plan based on published heritage descriptions, labelled "not to scale" | No surveyed plan available; avoid implying accuracy | Ngoc |
| D-11 | 10 Oct 2026 | Text wordmark "Hillview Estate" instead of the King's Foundation crest; disclaimer banner on every page | Avoid presenting a student concept as an official product | Ngoc |
| D-12 | 10 Oct 2026 | Fonts self-hosted (Cormorant Garamond + Source Sans 3) | Matches the Canva deck's serif; no external requests | Ngoc |
