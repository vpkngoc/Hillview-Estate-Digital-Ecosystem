import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, Flag, H2, Notice, PageHeader, Progress, Stat } from '../components/ui'
import { STATUS_META, statusKey } from '../components/EstateMap'
import { analytics, catalogue } from '../lib/data'
import pathway from '../data/pathway.json'
import { aud, compact, monthLabel, num } from '../lib/format'
import { liveTotals, useStore } from '../lib/store'
import { APPEAL_TARGET } from './Home'

export default function Impact() {
  const { s, elementView } = useStore()
  const live = liveTotals(s)
  const k = analytics.kpis
  const raised = k.restorationRaised + live.restoration
  const els = catalogue.elements.map(e => { const v = elementView(e.id); return statusKey(v.status, v.adopted, v.units) })
  const statusCounts = (['available', 'full', 'in_restoration', 'restored'] as const).map(x => ({ k: x, n: els.filter(e => e === x).length }))
  const p = pathway as { stage: string; employed6m: boolean; hours: number }[]
  const placed = p.filter(x => x.stage === 'Placement' || x.stage === 'Employed').length
  const liveFund: Record<string, number> = {}
  s.orders.flatMap(o => o.items).forEach(i => {
    if (i.kind === 'adoption') liveFund['Restoration Fund (Adopt-a-Stone)'] = (liveFund['Restoration Fund (Adopt-a-Stone)'] ?? 0) + i.amount
    if (i.kind === 'donation') { const n = String(i.extra?.fundName ?? 'Restoration Fund'); liveFund[n] = (liveFund[n] ?? 0) + i.amount }
  })
  const funds = analytics.givingByFund.map(f => ({ ...f, amount: f.amount + (liveFund[f.fund] ?? 0) }))
  const ink = '#1B241C', grid = '#E3DDCD'

  return (
    <>
      <PageHeader eyebrow="Transparency" title="Our impact, in the open" intro="The same numbers our board sees, published for supporters, journalists and the community. Figures update from the platform itself; nobody types them in." />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Notice tone="warn">Demo data: these figures come from a <strong>simulated first year of operation</strong> (11 Oct 2025 – 9 Oct 2026) plus anything you do in this demo. <Flag id="A-22" /></Notice>

        <section className="mt-8">
          <Card>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-2xl font-semibold text-forest">Stage 1 Restoration Appeal <Flag id="A-11" /></h2>
              <span className="font-serif text-3xl font-semibold text-forest tabular">{aud(raised)} <span className="font-sans text-sm font-normal text-muted">of {aud(APPEAL_TARGET)}</span></span>
            </div>
            <div className="mt-3"><Progress value={raised} max={APPEAL_TARGET} tone="ochre" /></div>
          </Card>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Visits to the estate" value={compact(k.visits)} sub="Free grounds, year 1" />
          <Stat label="Pieces of Hillview adopted" value={num(k.unitsAdopted + live.units)} sub={`${k.elementsRestored} elements restored`} />
          <Stat label="Students through the schools programme" value={num(k.schoolStudents)} sub={`${k.schoolBookings} class bookings`} />
          <Stat label="Heritage trades learners" value={num(k.courseLearners)} sub={`${k.courseRuns} course runs`} />
          <Stat label="Young people on the pathway" value={num(p.length)} sub={`${placed} in placements or jobs`} />
          <Stat label="Employed six months on" value={num(p.filter(x => x.employed6m).length)} sub="SDG 8.6 outcome" />
          <Stat label="Volunteer hours" value={num(k.volunteerHours)} />
          <Stat label="Supporters who gave" value={num(k.donors)} sub={`${aud(k.totalGiving + live.giving)} given in total`} />
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="text-xl font-semibold text-forest">Where gifts went</h3>
            <p className="text-xs text-muted">Donations and Adopt-a-Stone, by fund chosen by the giver</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer>
                <BarChart data={funds} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid horizontal={false} stroke={grid} />
                  <XAxis type="number" tickFormatter={v => `$${compact(v)}`} tick={{ fontSize: 11, fill: ink }} />
                  <YAxis type="category" dataKey="fund" width={170} tick={{ fontSize: 11, fill: ink }} />
                  <Tooltip formatter={(v: number) => aud(v)} />
                  <Bar isAnimationActive={false} dataKey="amount" fill="#B5733A" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <h3 className="text-xl font-semibold text-forest">Restoration progress: {catalogue.elements.length} adoptable elements</h3>
            <div className="mt-4 flex h-8 overflow-hidden rounded-md">
              {statusCounts.filter(x => x.n).map(x => <div key={x.k} style={{ width: `${(x.n / els.length) * 100}%`, background: STATUS_META[x.k].color }} title={`${STATUS_META[x.k].label}: ${x.n}`} />)}
            </div>
            <ul className="mt-3 space-y-1 text-sm">
              {statusCounts.map(x => <li key={x.k} className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: STATUS_META[x.k].color }} />{STATUS_META[x.k].label}<span className="ml-auto tabular">{x.n}</span></li>)}
            </ul>
            <h3 className="mt-6 text-xl font-semibold text-forest">Monthly visits</h3>
            <div className="mt-2 h-40">
              <ResponsiveContainer>
                <BarChart data={analytics.monthlyVisitors}>
                  <CartesianGrid vertical={false} stroke={grid} />
                  <XAxis dataKey="month" tickFormatter={monthLabel} tick={{ fontSize: 10, fill: ink }} />
                  <YAxis tick={{ fontSize: 10, fill: ink }} width={40} />
                  <Tooltip labelFormatter={monthLabel} formatter={(v: number) => num(v)} />
                  <Bar isAnimationActive={false} dataKey="visitors" fill="#2F5A2E" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        <section className="mt-12">
          <H2 className="text-2xl">How we count</H2>
          <ul className="mt-3 grid gap-3 text-sm text-muted md:grid-cols-2">
            <li><strong className="text-ink">Visits</strong>: daily grounds headcount (registrations plus walk-ins counted at the gate).</li>
            <li><strong className="text-ink">Raised</strong>: gifts to the Restoration Fund plus all Adopt-a-Stone gifts, recognised when received.</li>
            <li><strong className="text-ink">Pathway outcomes</strong>: participants in placements or jobs; "employed six months on" is confirmed with the employer.</li>
            <li><strong className="text-ink">Privacy</strong>: only totals are published. No individual's data appears here.</li>
          </ul>
        </section>
      </div>
    </>
  )
}
