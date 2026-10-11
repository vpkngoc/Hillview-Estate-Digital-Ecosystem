"""
Report figures for the Business Analytics chapter (diagrams).

Builds each diagram as HTML/SVG in the brand style and renders it to a
300-dpi-equivalent PNG (740 CSS px wide at 3x = 2220 px, the same width as
the matplotlib charts) with headless Chromium via Playwright.

    python analytics/figures/diagrams.py
"""
from __future__ import annotations

import math
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs" / "figures"
FONTS = Path(__file__).parent / "fonts"
TMP = OUT / "_html"
TMP.mkdir(parents=True, exist_ok=True)

C = dict(surface="#F7F4EC", parchment="#EDE7D8", stone="#D9D2C1", grid="#E3DDCD", ink="#1B241C",
         muted="#5C665D", forest="#0C3314", road="#1F4D2B", leaf="#7CC242", leafdark="#4E8A1F",
         g="#2F6E2C", b="#3A78AE", o="#D9964A", alert="#A63D2F", sage="#B9C9AE")


def font_face():
    rules = []
    for f in sorted(FONTS.glob("*.ttf")):
        fam = "Source Sans 3" if f.name.startswith("source") else "Cormorant Garamond"
        w = f.name.split("-latin-")[1].split("-")[0]
        st = "italic" if "italic" in f.name else "normal"
        rules.append(f"@font-face{{font-family:'{fam}';src:url('{f.as_uri()}');font-weight:{w};font-style:{st};}}")
    return "\n".join(rules)


BASE_CSS = f"""
{font_face()}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{width:740px;background:{C['surface']};color:{C['ink']};font-family:'Source Sans 3',sans-serif;
     -webkit-font-smoothing:antialiased;padding:22px 26px 16px}}
.rule{{width:60px;height:3px;background:{C['leaf']};margin-bottom:12px}}
h1{{font-family:'Cormorant Garamond',serif;font-weight:700;font-size:25px;line-height:1.1;color:{C['forest']};letter-spacing:-0.005em}}
.sub{{font-size:13px;line-height:1.38;color:{C['muted']};margin-top:6px;max-width:690px}}
.src{{font-size:10.5px;font-style:italic;color:{C['muted']};margin-top:12px}}
svg text{{font-family:'Source Sans 3',sans-serif}}
.serif{{font-family:'Cormorant Garamond',serif}}
"""


def page(title, sub, body, src, extra_css=""):
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{BASE_CSS}{extra_css}</style></head>
<body><div class="rule"></div><h1>{title}</h1><div class="sub">{sub}</div>{body}<div class="src">{src}</div></body></html>"""


def render(pages):
    with sync_playwright() as p:
        br = p.chromium.launch()
        ctx = br.new_context(viewport={"width": 740, "height": 400}, device_scale_factor=3)
        pg = ctx.new_page()
        for name, html in pages:
            f = TMP / (name + ".html")
            f.write_text(html, encoding="utf-8")
            pg.goto(f.as_uri())
            pg.wait_for_timeout(250)
            pg.screenshot(path=str(OUT / (name + ".png")), full_page=True)
            print("wrote", (OUT / (name + ".png")).relative_to(ROOT))
        br.close()


# ---------------------------------------------------------------- 3.1 revenue loop x business model
def fig_3_1():
    cx, cy, r = 370, 207, 130
    stages = [  # (letter, name, detail, angle, label placement)
        ("A", "Discover", "restoration journal, press, partners", -90, "top"),
        ("B", "Free grounds visit", "registered, capacity-managed", -30, "right"),
        ("C", "Paid experience", "tour, workshop, course, event, venue", 30, "right"),
        ("D", "Friend of Hillview", "annual membership", 90, "bottom"),
        ("E", "Donor / Adopt-a-Stone", "gift tied to a real element", 150, "left"),
        ("F", "Impact update", "“your stone is now restored”", 210, "left"),
    ]
    el = []
    el.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{C["road"]}" stroke-width="30"/>')
    el.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{C["surface"]}" stroke-width="1.6" stroke-dasharray="7 6"/>')
    for a in (-60, 0, 60, 120, 180, 240):
        t = math.radians(a)
        x, y = cx + r * math.cos(t), cy + r * math.sin(t)
        el.append(f'<path d="M -3.5 -5 L 3 0 L -3.5 5" fill="none" stroke="{C["surface"]}" stroke-width="2.4" '
                  f'stroke-linecap="round" stroke-linejoin="round" transform="translate({x:.1f},{y:.1f}) rotate({a + 90})"/>')
    for L, name, det, a, pos in stages:
        t = math.radians(a)
        x, y = cx + r * math.cos(t), cy + r * math.sin(t)
        el.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="22" fill="{C["surface"]}" stroke="{C["road"]}" stroke-width="4.5"/>')
        el.append(f'<text x="{x:.1f}" y="{y + 6.5:.1f}" text-anchor="middle" class="serif" font-size="20" font-weight="700" fill="{C["forest"]}">{L}</text>')
        if pos == "top":
            tx, ty, anc = x, y - 52, "middle"
        elif pos == "bottom":
            tx, ty, anc = x, y + 44, "middle"
        elif pos == "right":
            tx, ty, anc = x + 34, y - 3, "start"
        else:
            tx, ty, anc = x - 34, y - 3, "end"
        el.append(f'<text x="{tx:.1f}" y="{ty:.1f}" text-anchor="{anc}" font-size="13.5" font-weight="600" fill="{C["ink"]}">{name}</text>')
        el.append(f'<text x="{tx:.1f}" y="{ty + 16:.1f}" text-anchor="{anc}" font-size="11.5" fill="{C["muted"]}">{det}</text>')
    # return path label
    el.append(f'<text x="268" y="77" text-anchor="end" font-size="11" font-style="italic" fill="{C["muted"]}">return visit · referral · upgrade</text>')
    # core
    el.append(f'<circle cx="{cx}" cy="{cy}" r="82" fill="{C["parchment"]}"/>')
    el.append(f'<text x="{cx}" y="{cy - 38}" text-anchor="middle" font-size="9.5" font-weight="600" letter-spacing="1.4" fill="{C["muted"]}">ONE SUPPORTER RECORD</text>')
    el.append(f'<text x="{cx}" y="{cy - 14}" text-anchor="middle" class="serif" font-size="22" font-weight="700" fill="{C["forest"]}">Hillview Connect</text>')
    el.append(f'<text x="{cx}" y="{cy + 5}" text-anchor="middle" font-size="11" fill="{C["ink"]}">every visit, booking,</text>')
    el.append(f'<text x="{cx}" y="{cy + 19}" text-anchor="middle" font-size="11" fill="{C["ink"]}">membership and gift</text>')
    el.append(f'<text x="{cx}" y="{cy + 33}" text-anchor="middle" font-size="11" fill="{C["ink"]}">writes to one ID</text>')
    el.append(f'<rect x="{cx - 64}" y="{cy + 43}" width="128" height="20" rx="10" fill="{C["forest"]}"/>')
    el.append(f'<text x="{cx}" y="{cy + 57}" text-anchor="middle" font-size="10" font-weight="600" fill="{C["surface"]}">8 · metrics live from day one</text>')

    # milestone strip (team business model, in the team's order)
    y0 = 417
    el.append(f'<text x="27" y="{y0}" font-size="12" font-weight="600" fill="{C["ink"]}">Team business model milestones, in the team’s order, and the loop stage each one switches on</text>')
    ry = y0 + 20
    el.append(f'<rect x="24" y="{ry}" width="692" height="22" rx="11" fill="{C["road"]}"/>')
    el.append(f'<line x1="36" y1="{ry + 11}" x2="704" y2="{ry + 11}" stroke="{C["surface"]}" stroke-width="1.6" stroke-dasharray="7 6"/>')
    ms = [("Grounds", "open", "B · free visit"), ("Events &amp;", "weddings", "feeds B · guests"),
          ("Subscription", "access", "D · Friend"), ("Hotel", "opens", "C · premium stay"),
          ("Education", "program", "feeds C · pathway"), ("Tour", "starts", "C · paid tour"),
          ("Re-", "investment", "F · impact update"), ("Monitor", "metrics", "Core · day one")]
    step = (692 - 86) / 7
    for i, (l1, l2, tag) in enumerate(ms):
        x = 24 + 43 + i * step
        last = i == 7
        el.append(f'<circle cx="{x:.1f}" cy="{ry + 11}" r="15" fill="{C["forest"] if last else C["surface"]}" stroke="{C["road"]}" stroke-width="4"/>')
        el.append(f'<text x="{x:.1f}" y="{ry + 16}" text-anchor="middle" class="serif" font-size="15" font-weight="700" fill="{C["surface"] if last else C["forest"]}">{i + 1}</text>')
        el.append(f'<text x="{x:.1f}" y="{ry + 46}" text-anchor="middle" font-size="11" font-weight="600" fill="{C["ink"]}">{l1}</text>')
        el.append(f'<text x="{x:.1f}" y="{ry + 59}" text-anchor="middle" font-size="11" font-weight="600" fill="{C["ink"]}">{l2}</text>')
        el.append(f'<text x="{x:.1f}" y="{ry + 77}" text-anchor="middle" font-size="10.5" font-weight="{700 if last else 400}" fill="{C["leafdark"] if not last else C["forest"]}">{tag}</text>')
    svg = f'<svg width="688" height="{ry + 88}" viewBox="22 0 696 {ry + 88}" style="display:block;margin-top:10px">{"".join(el)}</svg>'
    html = page("The revenue loop and the business model that switches it on",
                "Every touchpoint writes to one supporter record, so a free visitor can be followed through to member and donor. "
                "The team’s milestones (bottom) switch loop stages on in sequence; monitoring sits at the centre of the loop "
                "from the first milestone, not after the last.",
                svg, "Sources: Hillview Connect platform specification v0.2 (revenue loop); Team 4E business model graphic. "
                     "Diagram by the author.")
    return "fig_3_1_revenue_loop", html


# ---------------------------------------------------------------- 3.2 architecture
def fig_3_2():
    css = f"""
    .stack{{margin-top:16px;display:grid;grid-template-columns:92px 1fr;row-gap:10px;column-gap:12px;align-items:stretch}}
    .lab{{font-size:10.5px;font-weight:700;letter-spacing:.09em;color:{C['muted']};text-transform:uppercase;padding-top:8px;line-height:1.25}}
    .row{{display:grid;gap:8px}}
    .card{{background:#fff;border:1px solid {C['stone']};border-radius:8px;padding:8px 10px}}
    .card h3{{font-size:13px;font-weight:700;color:{C['forest']}}}
    .card p{{font-size:11px;color:{C['muted']};line-height:1.3;margin-top:2px}}
    .grp{{background:{C['parchment']};border-radius:8px;padding:8px 9px}}
    .grp h3{{font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:700;color:{C['forest']};line-height:1}}
    .grp .feeds{{font-size:10px;color:{C['leafdark']};font-weight:600;margin:3px 0 6px}}
    .m{{display:flex;gap:6px;align-items:baseline;font-size:11.3px;line-height:1.28;padding:3px 0;border-top:1px solid {C['stone']}}}
    .m b{{font-size:9.5px;color:{C['muted']};min-width:24px}}
    .core{{background:{C['road']};border-radius:8px;padding:10px 12px;color:{C['surface']};display:grid;grid-template-columns:1fr 1fr;gap:14px}}
    .core h3{{font-size:13.5px;font-weight:700}} .core p{{font-size:11px;line-height:1.3;opacity:.92;margin-top:2px}}
    .core b{{color:{C['leaf']}}}
    .ana{{border:1.5px solid {C['road']};border-radius:8px;padding:9px 12px}}
    .flow{{display:flex;align-items:center;gap:6px;flex-wrap:nowrap;margin-top:6px}}
    .step{{flex:1;background:#fff;border:1px solid {C['stone']};border-radius:6px;padding:4px 6px;font-size:10.8px;line-height:1.22;text-align:center;align-self:stretch;display:flex;flex-direction:column;justify-content:center}}
    .arr{{color:{C['muted']};font-size:13px}}
    .note{{font-size:10.5px;color:{C['muted']};margin-top:7px;line-height:1.3}}
    .conn{{grid-column:2;height:0;position:relative}}
    """
    surfaces = [("Public site", "What’s on, book, join, give, impact, press. Visitors, families, schools, donors, media."),
                ("My Hillview portal", "One person’s tickets, membership, adopted stones, updates and consents."),
                ("Estate Console", "Staff and board dashboards, CRM, calendar, forecast. Access gated by role.")]
    groups = [
        ("Visitor engine", "feeds Finance (operations) · Marketing",
         [("M2", "Bookings &amp; shared calendar, one basket"), ("M3", "Venue hire pipeline"), ("M4", "Education hub: schools, short courses"),
          ("M12", "Operations intelligence: forecast, revenue vs plan")]),
        ("Donor engine", "feeds Marketing · Finance (capital)",
         [("M6", "Friends of Hillview membership"), ("M7", "Giving and Adopt-a-Stone map"), ("M8", "Donor CRM, RFM segments, loop funnel")]),
        ("Mission &amp; trust", "feeds SDG 8 reporting · Law &amp; Cyber",
         [("M5", "Pathway tracker: volunteer → trainee → placement"), ("M9", "Community &amp; volunteers"),
          ("M10", "Public impact ledger"), ("M11", "Press room, verified fact sheet")]),
    ]
    body = '<div class="stack">'
    body += '<div class="lab">Who uses it<br>3 surfaces</div><div class="row" style="grid-template-columns:repeat(3,1fr)">'
    body += "".join(f'<div class="card"><h3>{h}</h3><p>{t}</p></div>' for h, t in surfaces) + "</div>"
    body += '<div class="lab">What it does<br>11 modules</div><div class="row" style="grid-template-columns:1.12fr .98fr 1.1fr">'
    for h, feeds, mods in groups:
        body += f'<div class="grp"><h3>{h}</h3><div class="feeds">{feeds}</div>'
        body += "".join(f'<div class="m"><b>{k}</b><span>{v}</span></div>' for k, v in mods) + "</div>"
    body += "</div>"
    body += ('<div class="lab">Data core<br>2 modules</div><div class="core">'
             '<div><h3><b>M1</b> Identity &amp; supporter record</h3><p>One ID per person across every module; guest checkout matched by email; '
             'granular, timestamped, withdrawable consent.</p></div>'
             '<div><h3><b>M13</b> Privacy &amp; governance</h3><p>Role-based access, consent ledger, audit log. Youth pathway and school data '
             'held in separate domains (see Figure 3.9).</p></div></div>')
    body += ('<div class="lab">Analytics<br>Python</div><div class="ana">'
             '<div style="font-size:12.5px;font-weight:700;color:' + C['forest'] + '">Analytics pipeline (pandas, statsmodels): one command rebuilds every figure</div>'
             '<div class="flow"><div class="step">Reference data<span style="color:' + C['muted'] + '">school terms, holidays, climate, events</span></div><span class="arr">+</span><div class="step">Assumptions<span style="color:' + C['muted'] + '">owner + confidence per figure</span></div><span class="arr">→</span><div class="step">Simulation<span style="color:' + C['muted'] + '">synthetic year one</span></div><span class="arr">→</span><div class="step">RFM + paths<span style="color:' + C['muted'] + '">segments, loop</span></div><span class="arr">→</span><div class="step">NB forecast<span style="color:' + C['muted'] + '">+ backtest</span></div><span class="arr">→</span><div class="step">Dashboards<span style="color:' + C['muted'] + '">Console, impact page</span></div></div>'
             '<div class="note">Once the estate trades, real check-ins and bookings replace the simulation; the same pipeline re-estimates every model.</div></div>')
    body += "</div>"
    html = page("Hillview Connect: one supporter record under three surfaces",
                "Thirteen modules grouped into two commercial engines and a mission layer, all writing to a single data core. "
                "Each group names the report chapter that relies on its data.",
                body, "Source: Hillview Connect platform specification v0.2 (modules M1–M13). Diagram by the author.", css)
    return "fig_3_2_architecture", html


# ---------------------------------------------------------------- 3.3 SDG 8 logic model
def fig_3_3():
    css = f"""
    .lm{{margin-top:14px;display:grid;grid-template-columns:96px 1fr 1fr 1.15fr 1.15fr;gap:6px}}
    .hd{{font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:{C['muted']};padding:0 2px 2px}}
    .tg{{background:{C['road']};color:{C['surface']};border-radius:8px;padding:8px 9px}}
    .tg .n{{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:700;line-height:1;color:{C['leaf']}}}
    .tg .t{{font-size:10.8px;line-height:1.28;margin-top:4px}}
    .c{{background:#fff;border:1px solid {C['stone']};border-radius:8px;padding:7px 8px;font-size:11.2px;line-height:1.32}}
    .chip{{display:block;border-radius:6px;padding:4px 7px;margin-bottom:5px;font-size:11px;line-height:1.28}}
    .auto{{background:{C['g']};color:#fff}}
    .follow{{background:#fff;border:1.5px dashed {C['o']};color:{C['ink']}}}
    .key{{display:flex;gap:18px;margin-top:10px;font-size:11px;color:{C['muted']};align-items:center}}
    .key span.s{{display:inline-block;width:26px;height:13px;border-radius:4px;vertical-align:-2px;margin-right:6px}}
    """
    rows = [
        ("8.6", "Reduce the share of young people not in employment, education or training",
         "Education bursary fund (donations); master tradespeople; the live restoration as classroom",
         "Volunteer → trainee → paid placement pathway (ages 16–24)",
         ["Applicants and active trainees by stage", "Supervised hours and competencies logged"],
         [("auto", "Placed in paid work"), ("follow", "Still employed at 6 months (follow-up contact, consented)")]),
        ("8.9", "Sustainable tourism that creates jobs and promotes local culture and products",
         "Free grounds, house and gardens, events programme, volunteers",
         "Free registered visits; tours, workshops, events; venue hire",
         ["Visits, bookings and repeat visits", "Volunteer hours; local share of visitors (postcode)"],
         [("follow", "Regional visitor spend (survey or partner data)"), ("follow", "Local jobs supported (operator records)")]),
        ("8.3", "Decent job creation, entrepreneurship and growth of small enterprises",
         "Heritage trades short courses, venue, Adopt-a-Stone capital",
         "Short courses on real fabric; employer advisory board",
         ["Courses run, learners trained", "Restoration elements funded and restored"],
         [("follow", "Learners using skills in paid trade work"), ("follow", "Local trades businesses engaged")]),
    ]
    body = '<div class="lm"><div class="hd">SDG 8 target</div><div class="hd">Inputs</div><div class="hd">Activities</div>' \
           '<div class="hd">Outputs</div><div class="hd">Outcomes</div>'
    for n, t, inp, act, outs, outc in rows:
        body += f'<div class="tg"><div class="n">{n}</div><div class="t">{t}</div></div>'
        body += f'<div class="c">{inp}</div><div class="c">{act}</div>'
        body += '<div class="c">' + "".join(f'<span class="chip auto">{o}</span>' for o in outs) + "</div>"
        body += '<div class="c">' + "".join(f'<span class="chip {k}">{o}</span>' for k, o in outc) + "</div>"
    body += "</div>"
    body += (f'<div class="key"><div><span class="s" style="background:{C["g"]}"></span>Captured automatically by the platform</div>'
             f'<div><span class="s" style="background:#fff;border:1.5px dashed {C["o"]}"></span>Needs follow-up data, consent or a partner</div></div>')
    html = page("Measuring SDG 8: what the platform can prove, and what it cannot",
                "A logic model links each SDG 8 target to what the estate puts in, what it does, and what changes. "
                "Outputs are captured automatically; most outcomes need follow-up data, so the impact page reports outputs "
                "and labels outcomes as pending.",
                body, "Sources: UN SDG 8 targets 8.3, 8.6, 8.9 (paraphrased; verify wording against the UN SDG indicator "
                      "framework); logic-model structure after the W.K. Kellogg Foundation guide. Diagram by the author.", css)
    return "fig_3_3_sdg8_logic_model", html


# ---------------------------------------------------------------- 3.9 privacy by design
def fig_3_9():
    roles = ["Estate Director", "Development Officer", "Front-of-house", "Education Coordinator", "Operations Manager"]
    keys = ["director", "development", "frontdesk", "education", "operations"]
    tabs = ["Overview", "Supporters (CRM)", "Calendar &amp; venue", "Demand forecast", "Restoration", "Education &amp; pathway",
            "Privacy &amp; governance", "Assumptions"]
    tids = ["overview", "supporters", "operations", "forecast", "restoration", "education", "governance", "assumptions"]
    # Mirrors ACCESS in web/src/pages/console/Console.tsx
    ACCESS = {
        "director": {t: "full" for t in tids},
        "development": dict(overview="full", supporters="full", restoration="full", governance="masked", assumptions="full"),
        "frontdesk": dict(operations="full", supporters="masked"),
        "education": dict(education="full", operations="full", assumptions="full"),
        "operations": dict(overview="masked", operations="full", forecast="full", restoration="full", assumptions="full"),
    }
    css = f"""
    table{{border-collapse:separate;border-spacing:4px;margin-top:12px;margin-left:-4px}}
    th{{font-size:10.5px;font-weight:600;color:{C['muted']};text-align:center;vertical-align:bottom;line-height:1.2;padding:0 2px 4px;width:66px}}
    th.r{{text-align:left;width:150px}}
    td.r{{font-size:12px;font-weight:600;color:{C['ink']};padding-right:6px;white-space:nowrap}}
    td.c{{height:26px;border-radius:6px;text-align:center;font-size:10.5px;font-weight:600}}
    .full{{background:{C['g']};color:#fff}}
    .masked{{background:#fff;border:1.5px solid {C['g']};color:{C['g']}}}
    .none{{background:{C['parchment']};color:{C['muted']};font-weight:400}}
    .dom{{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:14px}}
    .d{{border-radius:8px;padding:8px 10px;font-size:11.2px;line-height:1.32;background:#fff;border:1px solid {C['stone']}}}
    .d h3{{font-size:12.5px;color:{C['forest']};margin-bottom:2px}}
    .d .app{{font-size:10px;color:{C['leafdark']};font-weight:700;margin-top:4px}}
    .hd2{{font-size:12px;font-weight:600;margin-top:14px;color:{C['ink']}}}
    """
    body = '<table><tr><th class="r"></th>' + "".join(f"<th>{t}</th>" for t in tabs) + "</tr>"
    for rl, k in zip(roles, keys):
        body += f'<tr><td class="r">{rl}</td>'
        for t in tids:
            a = ACCESS[k].get(t)
            body += {"full": '<td class="c full">Full</td>', "masked": '<td class="c masked">Masked</td>'}.get(a, '<td class="c none">—</td>')
        body += "</tr>"
    body += "</table>"
    body += '<div class="hd2">Three data domains kept separate (never merged into one profile)</div><div class="dom">'
    body += ('<div class="d"><h3>Supporters &amp; giving</h3>Visits, bookings, membership, gifts. Granular, unticked consent options; '
             'exports include only supporters whose consent matches.<div class="app">APP 3 · APP 5 · APP 7</div></div>')
    body += ('<div class="d"><h3>Youth pathway (16–24)</h3>Applications, hours, competencies. Guardian consent under 18; '
             'never used for fundraising.<div class="app">APP 6 · child-safe practice</div></div>')
    body += ('<div class="d"><h3>Schools</h3>Class-level numbers only: no student names are collected. '
             'Pre-visit packs and risk forms go to the teacher, not to students.<div class="app">APP 3 · child-safe practice</div></div></div>')
    html = page("Privacy by design: each role sees only what its job needs",
                "Console access by role, as built in the prototype (‘Masked’ = can open, sensitive fields such as gift "
                "amounts hidden). Below: the three data domains the design keeps apart.",
                body, "Sources: Hillview Connect prototype (role access rules, decision log D-06, D-07); Australian Privacy "
                      "Principles (OAIC). APP mapping is the author’s and is to be confirmed in the Law &amp; Cybersecurity chapter.",
                css)
    return "fig_3_9_privacy_by_design", html


if __name__ == "__main__":
    render([fig_3_1(), fig_3_2(), fig_3_3(), fig_3_9()])
