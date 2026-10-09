import { useEffect, useState } from 'react'
import { Database, Lock, ShieldAlert } from 'lucide-react'
import { STATUS_META, statusKey } from '../../components/EstateMap'
import { Badge, Button, Card, Notice, Select, Stat, Textarea } from '../../components/ui'
import { analytics, catalogue, loadPathway, type ElementStatus, type PathwayParticipant } from '../../lib/data'
import { dateLong, num } from '../../lib/format'
import { LAW_FLAGS } from '../../lib/content'
import { ROLES, useStore, type Role } from '../../lib/store'
import { ACCESS, TABS } from './Console'

export function Restoration() {
  const { s, dispatch, elementView } = useStore()
  const [sel, setSel] = useState('return-verandah')
  const [status, setStatus] = useState<ElementStatus>('in_restoration')
  const [story, setStory] = useState('The carpentry team has begun scarf-joint repairs. Eleven original posts are being kept, with new timber spliced in only where rot has set in.')
  const mine = s.adoptions.filter(a => a.elementId === sel)
  const pending = s.adoptions.filter(a => a.moderation === 'pending')
  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-xl font-semibold text-forest">Update an element: adopters are notified automatically</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_200px]">
          <Select value={sel} onChange={e => setSel(e.target.value)} aria-label="Element">{catalogue.elements.map((e, i) => <option key={e.id} value={e.id}>#{i + 1} {e.name}</option>)}</Select>
          <Select value={status} onChange={e => setStatus(e.target.value as ElementStatus)} aria-label="Status"><option value="available">Open for adoption</option><option value="in_restoration">In restoration</option><option value="restored">Restored</option></Select>
        </div>
        <Textarea className="mt-3" rows={3} value={story} onChange={e => setStory(e.target.value)} aria-label="Story for adopters" />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button onClick={() => dispatch({ type: 'setElementStatus', elementId: sel, status, story })}>Publish update &amp; notify adopters</Button>
          <span className="text-sm text-muted">{elementView(sel).adopted} units adopted · {mine.length ? <strong className="text-forest">includes the demo user, who will be notified in My Hillview</strong> : 'no demo-user adoptions on this element'}</span>
        </div>
      </Card>

      {pending.length > 0 && (
        <Card>
          <h3 className="text-xl font-semibold text-forest">Dedication moderation</h3>
          <ul className="mt-2 divide-y divide-stone/60">{pending.map(a => <li key={a.id} className="flex items-center gap-3 py-2 text-sm"><span className="flex-1 italic">“{a.dedication}”</span><Button variant="secondary" onClick={() => dispatch({ type: 'approveDedication', id: a.id })}>Approve</Button></li>)}</ul>
        </Card>
      )}

      <Card className="overflow-x-auto">
        <h3 className="text-xl font-semibold text-forest">All elements</h3>
        <table className="mt-3 w-full min-w-[640px] text-sm tabular">
          <thead><tr className="border-b border-stone text-left text-xs uppercase text-muted"><th className="py-1">#</th><th>Element</th><th>Zone</th><th className="text-right">Adopted</th><th className="text-right">Raised</th><th>Status</th></tr></thead>
          <tbody>
            {catalogue.elements.map((e, i) => {
              const v = elementView(e.id)
              const k = statusKey(v.status, v.adopted, v.units)
              return (
                <tr key={e.id} className="border-b border-stone/50">
                  <td className="py-1.5">{i + 1}</td><td className="font-semibold text-forest">{e.name}</td><td>{e.zone}</td>
                  <td className="text-right">{v.adopted}/{v.units}</td><td className="text-right">${num(v.adopted * e.price)}</td>
                  <td><span className="rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ background: STATUS_META[k].color }}>{STATUS_META[k].label}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

const P_STAGES = ['Applied', 'Volunteer', 'Trainee', 'Placement', 'Employed']

export function Education() {
  const { s, dispatch } = useStore()
  const [p, setP] = useState<PathwayParticipant[]>([])
  useEffect(() => { loadPathway().then(setP) }, [])
  const k = analytics.kpis
  const count = (st: string) => p.filter(x => x.stage === st).length
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="School students (year 1)" value={num(k.schoolStudents)} sub={`${k.schoolBookings} class bookings`} />
        <Stat label="Short-course learners" value={num(k.courseLearners)} sub={`${k.courseRuns} runs`} />
        <Stat label="Pathway participants" value={num(p.length + (s.pathwayApp ? 1 : 0))} sub={`${count('Placement') + count('Employed')} placed`} />
        <Stat label="Employed at 6 months" value={num(p.filter(x => x.employed6m).length)} sub="SDG 8.6 outcome" />
      </div>
      <Card>
        <h3 className="text-xl font-semibold text-forest">Pathway funnel (SDG 8.6)</h3>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          {['Volunteer', 'Trainee', 'Placement', 'Employed'].map(st => <div key={st} className="rounded-lg bg-parchment/60 p-3"><div className="font-serif text-3xl font-semibold text-forest">{count(st)}</div><div className="text-xs text-muted">{st}</div></div>)}
        </div>
      </Card>
      {s.pathwayApp && (
        <Card>
          <h3 className="text-xl font-semibold text-forest">New application (demo)</h3>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <span className="font-semibold">{s.pathwayApp.first} {s.pathwayApp.lastInitial}.</span><span>{s.pathwayApp.trade}</span><span>age {s.pathwayApp.age}</span>
            {s.pathwayApp.age < 18 && <Badge tone="ochre">Under 18 · guardian consent {s.pathwayApp.guardianConsent ? '✓' : '✗'}</Badge>}
            <Badge tone="slate">{s.pathwayApp.stage}</Badge>
            <Button className="ml-auto" disabled={s.pathwayApp.stage === 'Employed'} onClick={() => dispatch({ type: 'setPathwayStage', stage: P_STAGES[P_STAGES.indexOf(s.pathwayApp!.stage) + 1] })}>Advance stage</Button>
          </div>
        </Card>
      )}
      <Card className="overflow-x-auto">
        <h3 className="text-xl font-semibold text-forest">Participants</h3>
        <p className="text-xs text-muted">Separate data domain: never joined to donor or marketing records. First name and initial only.</p>
        <table className="mt-3 w-full min-w-[720px] text-sm tabular">
          <thead><tr className="border-b border-stone text-left text-xs uppercase text-muted"><th className="py-1">Name</th><th>Age</th><th>Trade</th><th>Stage</th><th className="text-right">Hours</th><th className="text-right">Competencies</th><th>Employer</th></tr></thead>
          <tbody>
            {p.map(x => (
              <tr key={x.id} className="border-b border-stone/50">
                <td className="py-1.5">{x.name}</td><td>{x.age} {x.under18 && <Badge tone="ochre">guardian ✓</Badge>}</td><td>{x.trade}</td><td>{x.stage}</td>
                <td className="text-right">{x.hours}</td><td className="text-right">{x.competencies}</td><td className="text-xs">{x.employer ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-muted">Staff supervising under-18s hold NSW Working with Children Checks. Employers are illustrative.</p>
      </Card>
      <Card className="overflow-x-auto">
        <h3 className="text-xl font-semibold text-forest">Recent school bookings (class level)</h3>
        <table className="mt-3 w-full min-w-[560px] text-sm tabular">
          <tbody>{analytics.schoolsRecent.slice(-10).reverse().map((r, i) => <tr key={i} className="border-b border-stone/50"><td className="py-1.5">{dateLong(r.date)}</td><td>{r.school}</td><td>{r.programme}</td><td className="text-right">{r.students} students</td></tr>)}</tbody>
        </table>
      </Card>
    </div>
  )
}

export function Governance({ masked }: { masked: boolean }) {
  const { s } = useStore()
  return (
    <div className="space-y-6">
      <Card className="overflow-x-auto">
        <h3 className="text-xl font-semibold text-forest">Role-based access</h3>
        <table className="mt-3 w-full min-w-[720px] text-center text-xs">
          <thead><tr><th className="text-left" />{TABS.map(t => <th key={t.id} className="px-1 py-1 font-semibold text-muted">{t.label}</th>)}</tr></thead>
          <tbody>
            {(Object.keys(ROLES) as Role[]).map(r => (
              <tr key={r} className="border-t border-stone/60">
                <td className="py-2 text-left font-semibold text-forest">{ROLES[r]}</td>
                {TABS.map(t => { const a = ACCESS[r][t.id]; return <td key={t.id}>{a === 'full' ? '●' : a === 'masked' ? '◐' : <Lock size={11} className="mx-auto text-muted/60" />}</td> })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-muted">● full · ◐ limited (sensitive fields hidden) · locked = no access</p>
      </Card>

      <Card>
        <h3 className="flex items-center gap-2 text-xl font-semibold text-forest"><Database size={18} /> Data domains</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {[['Supporters & giving', 'Profiles, consents, bookings, membership, gifts. Used by Development and the Director.'], ['Operations', 'Calendar, capacity, check-ins, forecast. Aggregates only, no gift data.'], ['Pathway (young people)', 'Applicants and trainees. Education team only. Never joined to fundraising data.']].map(([t, d], i) => (
            <div key={t} className={`rounded-lg p-3 text-sm ring-1 ${i === 2 ? 'bg-ochre-light/30 ring-ochre/40' : 'bg-parchment/50 ring-stone'}`}><p className="font-semibold text-forest">{t}</p><p className="mt-1 text-xs text-muted">{d}</p></div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-xl font-semibold text-forest">Consent ledger (demo user)</h3>
          {s.consentLog.length === 0 ? <p className="mt-2 text-sm text-muted">No consent changes yet.</p> : (
            <ul className="mt-2 max-h-64 divide-y divide-stone/60 overflow-y-auto text-sm">{s.consentLog.map((c, i) => <li key={i} className="py-1.5"><span className="text-xs text-muted">{new Date(c.time).toLocaleString('en-AU')}</span> · {c.key} → <strong>{c.value ? 'granted' : 'withdrawn'}</strong> via {c.source}</li>)}</ul>
          )}
        </Card>
        <Card>
          <h3 className="text-xl font-semibold text-forest">Audit log</h3>
          {masked ? <p className="mt-2 text-sm text-muted">Director only.</p> : s.audit.length === 0 ? <p className="mt-2 text-sm text-muted">Views, exports and changes will be logged here.</p> : (
            <ul className="mt-2 max-h-64 divide-y divide-stone/60 overflow-y-auto text-sm">{s.audit.map((a, i) => <li key={i} className="py-1.5"><span className="text-xs text-muted">{new Date(a.time).toLocaleTimeString('en-AU')} · {ROLES[a.role]}</span><br />{a.action}</li>)}</ul>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="flex items-center gap-2 text-xl font-semibold text-forest"><ShieldAlert size={18} className="text-ochre" /> Needs input from Law &amp; Cybersecurity</h3>
        <Notice tone="warn"><span className="text-xs">Flagged by the platform lead for co-design. Not legal advice.</span></Notice>
        <ul className="mt-3 divide-y divide-stone/60 text-sm">{LAW_FLAGS.map(f => <li key={f.item} className="flex gap-3 py-2"><Badge tone="slate">{f.area}</Badge><span>{f.item}</span></li>)}</ul>
      </Card>
    </div>
  )
}
