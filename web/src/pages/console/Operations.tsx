import { useMemo, useState } from 'react'
import { Area, CartesianGrid, ComposedChart, Legend, Line, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertTriangle, CheckCircle2, CloudRain } from 'lucide-react'
import { Badge, Button, Card, Flag, Notice, Stat, cx } from '../../components/ui'
import { analytics, catalogue, DEMO_TODAY } from '../../lib/data'
import { addDays, aud, dateLong, dateShort, dayName, num } from '../../lib/format'
import { clashes, sharedCalendar } from '../../lib/calendar'
import { useStore } from '../../lib/store'

const INK = '#1B241C', GRID = '#E3DDCD'
const STAGES = ['Enquiry', 'Site visit', 'Quote sent', 'Deposit paid', 'Confirmed']
const KIND_COLOR: Record<string, string> = { Wedding: '#B5733A', Corporate: '#5F7F96', 'School group': '#4E8A1F', 'Public event': '#0C3314', Private: '#8FAF7E' }

export function Operations() {
  const { s, dispatch } = useStore()
  const blocks = useMemo(() => sharedCalendar(s), [s])
  const clash = clashes(blocks)
  const days = Array.from({ length: 28 }, (_, i) => addDays(DEMO_TODAY, i))
  const today = s.orders.flatMap(o => o.items.filter(i => ['ticket', 'grounds', 'course'].includes(i.kind)).map(i => ({ key: `${o.ref}:${i.key}`, o, i })))
  const pipeline = [
    ...s.leads.map(l => ({ id: l.id, name: l.name, package: l.package, kind: l.kind, eventDate: l.eventDate, enquired: l.enquired, stage: l.stage, value: l.value, local: true })),
    ...analytics.venuePipeline.map(l => ({ ...l, stage: s.leadStages[l.id] ?? l.stage, local: false })),
  ]
  const move = (id: string, dir: 1 | -1, cur: string) => {
    const i = STAGES.indexOf(cur) + dir
    if (i >= 0 && i < STAGES.length) { dispatch({ type: 'moveLead', id, stage: STAGES[i] }); dispatch({ type: 'audit', action: `Moved venue lead ${id} to ${STAGES[i]}` }) }
  }
  const pendingSchools = s.schoolRequests

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-xl font-semibold text-forest">Shared estate calendar: next 4 weeks</h3>
          {clash.length ? <Badge tone="red"><AlertTriangle size={12} className="mr-1" />{clash.length} clash(es)</Badge> : <Badge tone="green"><CheckCircle2 size={12} className="mr-1" />No double-bookings</Badge>}
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] border-separate border-spacing-0.5 text-[11px]">
            <thead><tr><th className="w-36" />{days.map(d => <th key={d} className={cx('px-0.5 font-semibold', ['Sat', 'Sun'].includes(dayName(d)) ? 'text-ochre' : 'text-muted')}>{dayName(d)[0]}<br />{+d.slice(8)}</th>)}</tr></thead>
            <tbody>
              {catalogue.spaces.map(sp => (
                <tr key={sp}>
                  <td className="pr-2 text-xs font-semibold text-forest">{sp}</td>
                  {days.map(d => {
                    const b = blocks.filter(x => x.date === d && x.space === sp)
                    return <td key={d} title={b.map(x => `${x.title} (${x.status})`).join('\n')} className="h-9 rounded" style={{ background: b.length ? KIND_COLOR[b[0].kind] ?? '#2F5A2E' : '#F3EFE6', outline: b.length > 1 ? '2px solid #A63D2F' : undefined }}>{b.some(x => x.source === 'local') && <span className="block text-center font-bold text-white">●</span>}</td>
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">{Object.entries(KIND_COLOR).map(([k, c]) => <span key={k} className="flex items-center gap-1"><span className="h-3 w-3 rounded" style={{ background: c }} />{k}</span>)}<span>● = created in this demo</span></div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-xl font-semibold text-forest">Front-of-house check-in</h3>
          <p className="text-xs text-muted">Scan or search arrivals. Check-ins feed attendance data for the forecast model.</p>
          {today.length === 0 ? <p className="mt-3 text-sm text-muted">No bookings made in this demo yet. Book something on the public site and it appears here.</p> : (
            <ul className="mt-3 divide-y divide-stone/60">
              {today.map(({ key, o, i }) => {
                const done = s.checkins.includes(key)
                return (
                  <li key={key} className="flex items-center gap-3 py-2 text-sm">
                    <div className="flex-1"><p className="font-semibold">{o.payer.first} {o.payer.last} · {i.name}</p><p className="text-xs text-muted">{i.date && dateLong(i.date)} {i.time} · {Object.values(i.qty).reduce((a, b) => a + b, 0)} people · {o.ref}</p></div>
                    {done ? <Badge tone="green">Checked in</Badge> : <Button variant="secondary" onClick={() => dispatch({ type: 'checkin', key })}>Check in</Button>}
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
        <Card>
          <h3 className="text-xl font-semibold text-forest">School requests</h3>
          {pendingSchools.length === 0 ? <p className="mt-2 text-sm text-muted">No new requests in this demo. Try Learn → Schools on the public site.</p> : (
            <ul className="mt-3 divide-y divide-stone/60">
              {pendingSchools.map(r => (
                <li key={r.id} className="flex items-center gap-3 py-2 text-sm">
                  <div className="flex-1"><p className="font-semibold">{r.school} · {r.students} students</p><p className="text-xs text-muted">{r.programme} · {dateLong(r.date)}</p></div>
                  {r.status === 'Confirmed' ? <Badge tone="green">Confirmed</Badge> : <Button onClick={() => dispatch({ type: 'setSchoolStatus', id: r.id, status: 'Confirmed' })}>Confirm</Button>}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted">Confirming adds the group to the shared calendar (Stables Courtyard).</p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-xl font-semibold text-forest">Venue hire pipeline</h3>
          <span className="text-sm text-muted tabular">Weighted pipeline {aud(pipeline.reduce((a, l) => a + l.value * [0.1, 0.25, 0.45, 0.8, 1][STAGES.indexOf(l.stage)], 0))} <Flag id="A-06" /></span>
        </div>
        <div className="mt-4 grid gap-3 overflow-x-auto md:grid-cols-5">
          {STAGES.map(st => {
            const ls = pipeline.filter(l => l.stage === st)
            return (
              <div key={st} className="min-w-[180px] rounded-lg bg-parchment/60 p-2">
                <p className="mb-2 flex justify-between text-xs font-semibold uppercase text-muted"><span>{st}</span><span>{ls.length}</span></p>
                <div className="space-y-2">
                  {ls.slice(0, 6).map(l => (
                    <div key={l.id} className={cx('rounded-md bg-white p-2 text-xs ring-1', l.local ? 'ring-leaf-dark' : 'ring-stone')}>
                      <p className="font-semibold text-forest">{l.name}</p>
                      <p className="text-muted">{l.kind} · {dateShort(l.eventDate)} · {aud(l.value)}</p>
                      <div className="mt-1 flex justify-between"><button className="text-muted hover:text-forest disabled:opacity-30" disabled={st === STAGES[0]} onClick={() => move(l.id, -1, l.stage)}>←</button><button className="font-semibold text-forest disabled:opacity-30" disabled={st === STAGES[4]} onClick={() => move(l.id, 1, l.stage)}>advance →</button></div>
                    </div>
                  ))}
                  {ls.length > 6 && <p className="text-center text-xs text-muted">+{ls.length - 6} more</p>}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

export function Forecast() {
  const fc = analytics.forecast
  const bt = analytics.backtest
  const [roster, setRoster] = useState<'hi' | 'exp'>('hi')
  const peak = fc.reduce((m, d) => (d.expected > m.expected ? d : m), fc[0])
  const weekTotals = Array.from({ length: 8 }, (_, w) => fc.slice(w * 7, w * 7 + 7).reduce((a, d) => a + d.expected, 0))
  const data = fc.map(d => ({ ...d, band: [d.lo80, d.hi80] as [number, number] }))
  const spans: { x1: string; x2: string; label: string }[] = []
  fc.forEach((d, i) => {
    if (d.schoolHoliday && (i === 0 || !fc[i - 1].schoolHoliday)) spans.push({ x1: d.date, x2: d.date, label: 'School holidays' })
    if (d.schoolHoliday && spans.length) spans[spans.length - 1].x2 = d.date
  })

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Expected visits, next 8 weeks" value={num(fc.reduce((a, d) => a + d.expected, 0))} sub={`${dateShort(fc[0].date)} – ${dateShort(fc[fc.length - 1].date)}`} />
        <Stat label="Busiest day" value={num(peak.expected)} sub={`${peak.dow} ${dateShort(peak.date)}${peak.publicHoliday ? ' · public holiday' : ''}`} />
        <Stat label="Backtest error (MAPE)" value={`${bt.mape}%`} sub={`MAE ${bt.mae} visitors/day vs ${bt.naiveDowMae} for a day-of-week average`} />
        <Stat label="Model" value="NB GLM" sub={`Negative binomial, α = ${analytics.alpha}`} />
      </div>

      <Card>
        <h3 className="text-xl font-semibold text-forest">Daily grounds visitors: forecast with 80% interval</h3>
        <div className="mt-3 h-80">
          <ResponsiveContainer>
            <ComposedChart data={data}>
              <CartesianGrid vertical={false} stroke={GRID} />
              {spans.map(sp => <ReferenceArea key={sp.x1} x1={sp.x1} x2={sp.x2} fill="#7CC242" fillOpacity={0.08} />)}
              <XAxis dataKey="date" tickFormatter={dateShort} interval={6} tick={{ fontSize: 10, fill: INK }} />
              <YAxis tick={{ fontSize: 10, fill: INK }} width={40} />
              <Tooltip labelFormatter={(d: string) => dateLong(d)} formatter={(v: number | number[], n: string) => Array.isArray(v) ? [`${v[0]}–${v[1]}`, '80% interval'] : [num(v), n]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area isAnimationActive={false} dataKey="band" name="80% interval" fill="#8FAF7E" fillOpacity={0.35} stroke="none" />
              <Line isAnimationActive={false} dataKey="expected" name="Expected visitors" stroke="#0C3314" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted">Weekends roughly double demand. Shaded bands mark NSW school holidays (summer holidays start 18 Dec, outside this window). Rain risk comes from BOM climate normals for Moss Vale.</p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <h3 className="text-xl font-semibold text-forest">What drives demand</h3>
          <p className="text-xs text-muted">Multiplicative effects estimated by the model (95% CI)</p>
          <table className="mt-3 w-full text-sm tabular">
            <tbody>
              {analytics.drivers.map(d => (
                <tr key={d.driver} className="border-b border-stone/60">
                  <td className="py-2">{d.driver}<span className="block text-[11px] text-muted">{d.note}</span></td>
                  <td className="text-right font-semibold" style={{ color: d.multiplier >= 1 ? '#2F5A2E' : '#A63D2F' }}>×{d.multiplier.toFixed(2)}</td>
                  <td className="pl-2 text-right text-xs text-muted">{d.lo != null ? `${d.lo}–${d.hi}` : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Notice tone="warn"><span className="text-xs">History is <strong>simulated</strong> from assumed effects, so the model is recovering known values. It shows the pipeline works; once real check-ins exist it re-estimates from actual data. <Flag id="A-16" /></span></Notice>
        </Card>
        <Card>
          <h3 className="text-xl font-semibold text-forest">Backtest: last {bt.holdoutDays} days held out</h3>
          <div className="mt-3 h-56">
            <ResponsiveContainer>
              <ComposedChart data={bt.series}>
                <CartesianGrid vertical={false} stroke={GRID} />
                <XAxis dataKey="date" tickFormatter={dateShort} interval={6} tick={{ fontSize: 10, fill: INK }} />
                <YAxis tick={{ fontSize: 10, fill: INK }} width={36} />
                <Tooltip labelFormatter={(d: string) => dateLong(d)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line isAnimationActive={false} dataKey="actual" name="Actual (simulated)" stroke="#B5733A" dot={false} />
                <Line isAnimationActive={false} dataKey="predicted" name="Model" stroke="#0C3314" strokeDasharray="4 3" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted">The model roughly halves the error of a simple day-of-week average ({bt.mae} vs {bt.naiveDowMae} visitors/day).</p>
        </Card>
      </div>

      <Card className="overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xl font-semibold text-forest">Roster plan <Flag id="A-14" /></h3>
          <div className="flex gap-1 text-xs">
            <Button variant={roster === 'hi' ? 'primary' : 'secondary'} onClick={() => setRoster('hi')}>Plan to upper bound</Button>
            <Button variant={roster === 'exp' ? 'primary' : 'secondary'} onClick={() => setRoster('exp')}>Plan to expected</Button>
          </div>
        </div>
        <table className="mt-3 w-full min-w-[720px] text-sm tabular">
          <thead><tr className="border-b border-stone text-left text-xs uppercase text-muted"><th className="py-1">Date</th><th>Signals</th><th className="text-right">Expected</th><th className="text-right">80% range</th><th className="text-right">Guides</th><th className="text-right">Front-of-house</th></tr></thead>
          <tbody>
            {fc.slice(0, 21).map(d => {
              const base = roster === 'hi' ? d.hi80 : d.expected
              return (
                <tr key={d.date} className={cx('border-b border-stone/50', ['Sat', 'Sun'].includes(d.dow) && 'bg-parchment/40')}>
                  <td className="py-1.5">{d.dow} {dateShort(d.date)}</td>
                  <td className="space-x-1">{d.publicHoliday && <Badge tone="ochre">Public holiday</Badge>}{d.schoolHoliday && <Badge tone="green">School hols</Badge>}{d.regionalEvent && <Badge tone="slate">{d.regionalEvent}</Badge>}<span className="text-xs text-muted"><CloudRain size={11} className="mx-0.5 inline" />{d.rainChance}%</span></td>
                  <td className="text-right font-semibold">{d.expected}</td><td className="text-right text-muted">{d.lo80}–{d.hi80}</td>
                  <td className="text-right">{1 + Math.ceil(base / 80)}</td><td className="text-right">{1 + Math.ceil(base / 150)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-muted">Weekly totals: {weekTotals.map((w, i) => `W${i + 1} ${num(w)}`).join(' · ')}</p>
      </Card>
    </div>
  )
}
