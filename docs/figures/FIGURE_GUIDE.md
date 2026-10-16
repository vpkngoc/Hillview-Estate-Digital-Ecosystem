# Figure guide: Business Analytics chapter (Chapter 3)

Ten figures, 2220 px wide (16 cm at 300 dpi + margin). Insert each as a **picture in the body** (no appendices) with the caption below, then **discuss it in the text**. Marks go to that discussion, not to the figure. Figures don't count toward the 1,500 words.

- **Rebuild:** `python analytics/figures/charts.py` (data charts) and `python analytics/figures/diagrams.py` (diagrams). Run `python analytics/run_all.py` first if Finance changes any figure.
- **Numbering:** assumes the chapter is Chapter 3 (report order: Intro → Marketing → **BA** → Law → Finance ops → Finance capital → Conclusion). If that changes, renumber the captions and the "see Figure 3.9" note inside Figure 3.2.
- **Synthetic data:** every data chart already carries a "synthetic, illustrative" source line. Keep it.

| Fig | File | Goes in | Word caption |
|---|---|---|---|
| 3.1 | fig_3_1_revenue_loop.png | 3.1 Opening | Figure 3.1. The revenue loop and the business model that switches it on (author's diagram) |
| 3.2 | fig_3_2_architecture.png | 3.2 One record | Figure 3.2. Hillview Connect architecture: thirteen modules, one supporter record |
| 3.3 | fig_3_3_sdg8_logic_model.png | 3.3 Seeing | Figure 3.3. SDG 8 logic model: outputs the platform captures vs outcomes needing follow-up |
| 3.4 | fig_3_4_loop_paths.png | 3.4 Understanding | Figure 3.4. Supporter paths: the loop behaves as a network, not a funnel (synthetic year one) |
| 3.5 | fig_3_5_rfm_segments.png | 3.4 Understanding | Figure 3.5. RFM segmentation and the action attached to each segment (synthetic year one) |
| 3.6 | fig_3_6_forecast_roster.png | 3.5 Anticipating | Figure 3.6. Eight-week visitor forecast with 80% prediction interval, and the implied roster |
| 3.7 | fig_3_7_driver_effects.png | 3.5 Anticipating | Figure 3.7. Estimated demand drivers vs values built into the simulation (parameter recovery) |
| 3.8 | fig_3_8_backtest.png | 3.5 Anticipating | Figure 3.8. 56-day hold-out backtest: Negative Binomial model vs naive day-of-week benchmark |
| 3.9 | fig_3_9_privacy_by_design.png | 3.6 Guardrails | Figure 3.9. Role-based access and separated data domains in the prototype |
| 3.10 | fig_3_10_assumptions.png | 3.6 Guardrails / 3.7 Teamwork | Figure 3.10. Assumptions register by owner and confidence |
| (3.11) | *your own VS Code screenshot* | 3.5 | Figure 3.11. Python forecasting code and pipeline output (software evidence) |

---

## What to say about each figure (claim → evidence → so what → but)

**3.1 Revenue loop × business model.** The systems-thinking frame for the chapter: every touchpoint writes to one record, so a free visitor can be followed through to member and donor. The team's eight milestones each switch a stage on.
- **Critique:** in the team graphic, "Monitor metrics" is the *last* milestone. In this chapter it is the core from milestone 1, because nothing after milestone 1 can be evaluated without it.
- **Teamwork point:** giving (stage E) has no milestone of its own in the business model, even though Adopt-a-Stone is the hero feature. Raise it with the team.
- **Hand-off:** the loop is a hypothesis; Figure 3.4 tests it.

**3.2 Architecture.** Single customer view vs the Dumfries House pattern, where the Donate button leaves the site for JustGiving and supporter data is lost. The two engines map onto teammates' chapters (labels on each group).
- **Alternative:** an off-the-shelf stack (ticketing + nonprofit CRM + external giving page) is cheaper to start but recreates the silo. This prototype is "a model of the workings of such an interface" (brief), not a production build.

**3.3 SDG 8 logic model.** Outputs (green) are captured automatically; most outcomes (dashed) need follow-up data, consent or partners.
- **Position:** the public impact page should report outputs and label outcomes as pending, not claim them.
- **Check:** verify the SDG target wording and indicator 8.6.1 (youth NEET) on the UN SDG metadata site before citing.

**3.4 Network, not funnel.**
- **Evidence:** 332 of 373 donors (89%) never joined Friends; 128 (34%) gave without buying anything. Read as a funnel, the stages produce an impossible 213% step.
- **So what (Marketing):** membership is not the gateway to giving, so put the Adopt-a-Stone prompt at the free-visit and checkout stages. **(Finance):** don't forecast donations as a percentage of members.
- **But:** the paths reflect how the simulation seeded giving. Real year-one data must confirm it.
- **AI critique:** the first funnel metric (AI-scaffolded) reported >100% conversion; it was caught and replaced (decision log D-09).

**3.5 RFM.**
- **Evidence:** "At risk" is 659 supporters at $234 average, close to the top segment, quiet for ~253 days, so they are called first. "Hibernating" is 1,054 supporters at $13, so low-cost email only, and only where consented. (Updated after Finance's $6,000 venue fee lowered venue-client spend.)
- **But:** RFM scores are quintile-relative and blind to mission value (a 200-hour volunteer scores low on M).
- **Why RFM:** chosen over CLV models (need years of repeat history) and k-means (unstable, hard for a small team to act on).

**3.6 Forecast + roster (predictive → prescriptive).**
- **Evidence:** weekends drive demand. Example: Sat 28 Nov, 202 expected (80% range 104–312).
- **The trade-off for Finance:** rostering to the mean risks under-staffing; rostering to the top band costs wages.

**3.7 Parameter recovery (your strongest critique).** The model recovers the simulated effects: school holidays ×1.46 vs ×1.45 built in; rain ×0.54 vs ×0.55; public holiday ×1.84 (interval 1.51–2.24) vs ×1.6. That proves the *pipeline* works, not that real demand behaves this way. Once real check-ins exist, the same code re-estimates the effects.

**3.8 Backtest.**
- **Evidence:** MAE 31 vs 58.5 for the naive benchmark (47% less error). MAPE 26.3% is inflated by quiet weekdays, so lead with MAE.
- **Show the failure:** the largest miss is **Mon 5 Oct (public holiday in school holidays): predicted 248, actual 402**. Three of the four largest misses fall in the spring school holidays, so the model under-predicts when effects stack.
- **Implication:** roster to the upper band on holiday peaks, and test an interaction term once there is real data.
- **Correction to the blueprint:** use 5 Oct, not 22 Aug, as the example miss.

**3.9 Privacy by design.** The role matrix mirrors the organisation's departments: the same negotiation over "who needs to see what" that the team had. The three separated domains follow decisions D-06 and D-07. The APP mapping is yours; cite the Law & Cybersecurity chapter for the legal analysis.

**3.10 Assumptions register.**
- **Evidence:** 17 of 29 assumptions are low-confidence after integrating Chapters 2 and 5–6; Finance's benchmarks moved membership ($90) and venue hire ($6,000) from low to medium.
- **Teamwork:** the register works as an interface contract between departments: every number has an owner and a confidence rating.
- **Position:** this is how the plan turns "we can't know yet" into managed uncertainty.

**(3.11) Software evidence.** Take this screenshot yourself in VS Code (e.g. `forecast_demand.py` beside the terminal output of `python run_all.py`), so the evidence is authentically yours.
