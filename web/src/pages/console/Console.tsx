import { Navigate, NavLink, useParams } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BarChart3, ClipboardList, Hammer, GraduationCap, LineChart as LineIcon, Lock, ScrollText, ShieldCheck, Users } from 'lucide-react'
import { Badge, Card, Flag, Notice, Stat, cx } from '../../components/ui'
import { analytics, catalogue } from '../../lib/data'
import { aud, compact, monthLabel, num, pct } from '../../lib/format'
import { liveTotals, ROLES, useStore, type Role } from '../../lib/store'
import Supporters from './Supporters'
import { Forecast, Operations } from './Operations'
import { Education, Governance, Restoration } from './Mission'

export type TabId = 'overview' | 'supporters' | 'operations' | 'forecast' | 'restoration' | 'education' | 'governance' | 'assumptions'
export const TABS: { id: TabId; label: string; icon: typeof Users }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'supporters', label: 'Supporters (CRM)', icon: Users },
  { id: 'operations', label: 'Calendar & venue', icon: ClipboardList },
  { id: 'forecast', label: 'Demand forecast', icon: LineIcon },
  { id: 'restoration', label: 'Restoration', icon: Hammer },
  { id: 'education', label: 'Education & pathway', icon: GraduationCap },
  { id: 'governance', label: 'Privacy & governance', icon: ShieldCheck },
  { id: 'assumptions', label: 'Assumptions register', icon: ScrollText },
]

/** Role-based access (US-49). 'masked' = can open, sensitive fields hidden. */
export const ACCESS: Record<Role, Partial<Record<TabId, 'full' | 'masked'>>> = {
  director: { overview: 'full', supporters: 'full', operations: 'full', forecast: 'full', restoration: 'full', education: 'full', governance: 'full', assumptions: 'full' },
  development: { overview: 'full', supporters: 'full', restoration: 'full', governance: 'masked', assumptions: 'full' },
  frontdesk: { operations: 'full', supporters: 'masked' },
  education: { education: 'full', operations: 'full', assumptions: 'full' },
  operations: { overview: 'masked', operations: 'full', forecast: 'full', restoration: 'full', assumptions: 'full' },
}

const INK = '#1B241C', GRID = '#E3DDCD'

function Overview({ masked }: { masked: boolean }) {
  const { s } = useStore()
  const live = liveTotals(s)
  const plan = catalogue.revenuePlan
  const actual: Record<string, number> = {}
  analytics.revenueByMonth.forEach(m => Object.entries(m).forEach(([k, v]) => { if (k !== 'month' && k !== 'gst') actual[k] = (actual[k] ?? 0) + Number(v) }))
  Object.entries(live.byStream).forEach(([k, v]) => { if (k !== 'Grounds') actual[k] = (actual[k] ?? 0) + v })
  const streams = Object.keys(plan).map(k => ({ stream: k, actual: Math.round(actual[k] ?? 0), plan: plan[k], pct: Math.round(((actual[k] ?? 0) / plan[k]) * 100) }))
  const totA = streams.reduce((a, x) => a + x.actual, 0), totP = streams.reduce((a, x) => a + x.plan, 0)
  const gst = analytics.revenueByMonth.reduce((a, m) => a + m.gst, 0) + live.gst
  const monthly = analytics.revenueByMonth.map(m => {
    const giving = Number(m['Donations'] ?? 0) + Number(m['Adopt-a-Stone'] ?? 0)
    const total = Object.entries(m).filter(([k]) => k !== 'month' && k !== 'gst').reduce((a, [, v]) => a + Number(v), 0)
    return { month: m.month, earned: Math.round(total - giving), giving: Math.round(giving) }
  })
  // loop funnel incl. the demo user
  const u = s.user ? 1 : 0
  const paidLive = s.orders.some(o => o.items.some(i => ['ticket', 'course'].includes(i.kind) && i.amount > 0)) ? 1 : 0
  const memLive = s.membership ? 1 : 0
  const giftsLive = s.orders.flatMap(o => o.items).filter(i => i.kind === 'donation' || i.kind === 'adoption').length
  const add = [u, paidLive, memLive, giftsLive >= 1 ? 1 : 0, giftsLive >= 2 ? 1 : 0]
  const fun = analytics.funnel.map((f, i) => ({ ...f, reached: f.reached + add[i] }))
  // Stages are not strictly sequential (people can give without joining), so each stage
  // is compared with its natural reference group rather than the row above.
  const REF = [null, 0, 1, 0, 3] as const
  const REF_LABEL = ['', 'of registered', 'of paid', 'of registered', 'of donors']
  const funnel = fun.map((f, i) => ({ ...f, conv: REF[i] == null ? 100 : Math.round((f.reached / fun[REF[i] as number].reached) * 1000) / 10, refLabel: REF_LABEL[i] }))
  const leakIdx = [1, 2].reduce((m, i) => (funnel[i].conv < funnel[m].conv ? i : m), 1)
  const leakFrom = funnel[REF[leakIdx] as number].stage

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue, year 1 (incl. GST)" value={aud(totA)} sub={`${pct((totA / totP) * 100)} of plan ${aud(totP)}`} flag="A-18" />
        <Stat label="Supporters on one record" value={num(analytics.kpis.supporters + u)} sub={`${num(analytics.kpis.registeredVisits)} registered visits`} />
        <Stat label="Friends (active)" value={num(analytics.kpis.members + memLive)} sub="Friends of Hillview" />
        <Stat label="GST collected" value={aud(gst)} sub="1/11 of taxable sales" flag="A-19" />
      </div>

      <Card>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-xl font-semibold text-forest">The revenue loop: where supporters drop off</h3>
          <span className="text-xs text-muted">Supporters who have ever reached each stage</span>
        </div>
        <div className="mt-4 space-y-2">
          {funnel.map((f, i) => (
            <div key={f.stage} className="grid grid-cols-[130px_1fr_130px] items-center gap-3 text-sm sm:grid-cols-[170px_1fr_190px]">
              <span className="font-semibold text-forest">{f.stage}</span>
              <div className="h-7 rounded bg-parchment"><div className="h-full rounded" style={{ width: `${Math.max(2, (f.reached / funnel[0].reached) * 100)}%`, background: i === leakIdx ? '#B5733A' : '#2F5A2E' }} /></div>
              <span className="tabular">{num(f.reached)} {i > 0 && <span className={cx('text-xs', i === leakIdx ? 'font-semibold text-ochre' : 'text-muted')}>{f.conv}% {f.refLabel}</span>}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm"><Badge tone="ochre">Biggest leak</Badge> <strong>{leakFrom} → {funnel[leakIdx].stage}</strong>: only {funnel[leakIdx].conv}% convert. Action: test a post-visit membership offer showing what they'd have saved, and a members-only evening invitation to recent ticket buyers.</p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-xl font-semibold text-forest">Revenue by stream vs plan <Flag id="A-18" /></h3>
          <div className="mt-3 h-80">
            <ResponsiveContainer>
              <BarChart data={streams} layout="vertical" margin={{ left: 10, right: 40 }}>
                <CartesianGrid horizontal={false} stroke={GRID} />
                <XAxis type="number" tickFormatter={v => `$${compact(v)}`} tick={{ fontSize: 11, fill: INK }} />
                <YAxis type="category" dataKey="stream" width={150} tick={{ fontSize: 11, fill: INK }} />
                <Tooltip formatter={(v: number) => aud(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar isAnimationActive={false} dataKey="plan" name="Plan" fill="#D9D2C1" radius={[0, 3, 3, 0]} />
                <Bar isAnimationActive={false} dataKey="actual" name="Actual" radius={[0, 3, 3, 0]}>
                  {streams.map(x => <Cell key={x.stream} fill={x.pct >= 100 ? '#4E8A1F' : x.pct >= 85 ? '#2F5A2E' : '#B5733A'} />)}
                  <LabelList dataKey="pct" position="right" formatter={(v: number) => `${v}%`} style={{ fontSize: 10, fill: INK }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="text-xl font-semibold text-forest">Monthly income: earned vs philanthropy</h3>
          <div className="mt-3 h-80">
            <ResponsiveContainer>
              <BarChart data={monthly}>
                <CartesianGrid vertical={false} stroke={GRID} />
                <XAxis dataKey="month" tickFormatter={monthLabel} tick={{ fontSize: 10, fill: INK }} />
                <YAxis tickFormatter={v => `$${compact(v)}`} tick={{ fontSize: 10, fill: INK }} width={48} />
                <Tooltip labelFormatter={monthLabel} formatter={(v: number) => aud(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar isAnimationActive={false} dataKey="earned" name="Earned (tickets, courses, venue, membership)" stackId="a" fill="#2F5A2E" />
                <Bar isAnimationActive={false} dataKey="giving" name="Philanthropy (gifts, Adopt-a-Stone)" stackId="a" fill="#B5733A" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {!masked && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="text-xl font-semibold text-forest">Cohort conversion by month first seen</h3>
            <div className="mt-3 h-64">
              <ResponsiveContainer>
                <LineChart data={analytics.cohorts}>
                  <CartesianGrid vertical={false} stroke={GRID} />
                  <XAxis dataKey="cohort" tickFormatter={monthLabel} tick={{ fontSize: 10, fill: INK }} />
                  <YAxis unit="%" tick={{ fontSize: 10, fill: INK }} width={40} />
                  <Tooltip labelFormatter={monthLabel} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line isAnimationActive={false} dataKey="paidPct" name="Paid experience" stroke="#2F5A2E" strokeWidth={2} dot={false} />
                  <Line isAnimationActive={false} dataKey="donorPct" name="Gave a gift" stroke="#B5733A" strokeWidth={2} dot={false} />
                  <Line isAnimationActive={false} dataKey="memberPct" name="Became a Friend" stroke="#5F7F96" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted">Recent cohorts have had less time to convert. Compare like with like.</p>
          </Card>
          <Card>
            <h3 className="text-xl font-semibold text-forest">Supporter segments (RFM)</h3>
            <table className="mt-3 w-full text-sm tabular">
              <thead><tr className="border-b border-stone text-left text-xs uppercase text-muted"><th className="py-1">Segment</th><th className="text-right">Supporters</th><th className="text-right">Avg value</th><th className="text-right">Avg days since</th></tr></thead>
              <tbody>{analytics.segments.map(x => <tr key={x.segment} className="border-b border-stone/50"><td className="py-1.5">{x.segment}</td><td className="text-right">{num(x.supporters)}</td><td className="text-right">{aud(x.avgValue)}</td><td className="text-right">{x.avgRecency}</td></tr>)}</tbody>
            </table>
            <p className="mt-2 text-xs text-muted">Recency, frequency and monetary value scored 1–5 by quintile (Python: analytics/segment_supporters.py).</p>
          </Card>
        </div>
      )}
    </div>
  )
}

function Assumptions() {
  const conf = { Low: 'red', Medium: 'ochre', High: 'green' } as const
  return (
    <div className="space-y-6">
      <Notice tone="warn">Every commercial figure in the demo is a placeholder set by the platform lead and flagged for review. When Finance or Marketing confirm a figure, update <code>analytics/catalogue.py</code>, re-run <code>python run_all.py</code>, and the whole platform updates.</Notice>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead><tr className="border-b border-stone text-xs uppercase tracking-wide text-muted"><th className="py-2">ID</th><th>Area</th><th>Item</th><th>Value used</th><th>Owner</th><th>Confidence</th><th>Basis / action</th></tr></thead>
          <tbody>
            {catalogue.assumptions.map(a => (
              <tr key={a.id} className="border-b border-stone/60 align-top">
                <td className="py-2 pr-2 font-semibold text-ochre">{a.id}</td><td className="pr-2">{a.area}</td><td className="pr-2 font-semibold">{a.item}</td>
                <td className="pr-2">{a.value}</td><td className="pr-2">{a.owner}</td><td className="pr-2"><Badge tone={conf[a.confidence as keyof typeof conf]}>{a.confidence}</Badge></td><td className="text-muted">{a.basis}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card>
        <h3 className="text-xl font-semibold text-forest">Real reference data used</h3>
        <ul className="mt-2 space-y-1 text-sm">{catalogue.sources.map(x => <li key={x.id}><strong>{x.id}</strong> · <a href={x.url} target="_blank" rel="noreferrer">{x.name}</a></li>)}</ul>
      </Card>
    </div>
  )
}

export default function Console() {
  const { tab = 'overview' } = useParams()
  const { s, dispatch } = useStore()
  const t = tab as TabId
  if (!TABS.some(x => x.id === t)) return <Navigate to="/console" replace />
  const access = ACCESS[s.role][t]
  const allowed = TABS.filter(x => ACCESS[s.role][x.id])

  const body = !access ? (
    <Card className="text-center">
      <Lock className="mx-auto text-muted" />
      <h3 className="mt-2 text-xl font-semibold text-forest">Not available to {ROLES[s.role]}</h3>
      <p className="mt-1 text-sm text-muted">Access is limited by role so each person sees only what their job needs (privacy by design). Switch role above to explore.</p>
    </Card>
  ) : t === 'overview' ? <Overview masked={access === 'masked'} />
    : t === 'supporters' ? <Supporters masked={access === 'masked'} />
      : t === 'operations' ? <Operations />
        : t === 'forecast' ? <Forecast />
          : t === 'restoration' ? <Restoration />
            : t === 'education' ? <Education />
              : t === 'governance' ? <Governance masked={access === 'masked'} />
                : <Assumptions />

  return (
    <div className="bg-[#F1EEE5]">
      <div className="border-b border-stone bg-white/70">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ochre">Staff only · simulated data</p>
            <h1 className="text-2xl font-semibold text-forest">Estate Console</h1>
          </div>
          <label className="ml-auto flex items-center gap-2 text-sm">
            <span className="text-muted">Signed in as</span>
            <select value={s.role} onChange={e => dispatch({ type: 'setRole', role: e.target.value as Role })} className="rounded-md border border-stone bg-white px-2 py-1.5 font-semibold text-forest">
              {(Object.keys(ROLES) as Role[]).map(r => <option key={r} value={r}>{ROLES[r]}</option>)}
            </select>
          </label>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Console">
          {TABS.map(x => {
            const ok = ACCESS[s.role][x.id]
            return (
              <NavLink key={x.id} to={`/console/${x.id}`} className={({ isActive }) => cx('flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm no-underline', isActive ? 'bg-forest text-cream' : ok ? 'text-ink hover:bg-white' : 'text-muted/60')}>
                <x.icon size={16} /> {x.label} {!ok && <Lock size={12} className="ml-auto" />}{ok === 'masked' && <span className="ml-auto text-[10px]">limited</span>}
              </NavLink>
            )
          })}
          <p className="mt-4 hidden text-xs text-muted lg:block">{allowed.length} of {TABS.length} areas available to {ROLES[s.role]}.</p>
        </nav>
        <div className="min-w-0">{body}</div>
      </div>
    </div>
  )
}


