import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { GraduationCap, Hammer, School, ShieldCheck } from 'lucide-react'
import { Badge, Button, Card, Field, Flag, H2, Input, Notice, PageHeader, Select, Tabs, Textarea } from '../components/ui'
import { catalogue, DEMO_TODAY, elementById, sessions } from '../lib/data'
import { aud, dateLong, ref } from '../lib/format'
import { useStore } from '../lib/store'
import { useSessionLeft } from './WhatsOn'

type T = 'schools' | 'courses' | 'pathway'

function Schools() {
  const { dispatch, s } = useStore()
  const [stage, setStage] = useState('all')
  const [subject, setSubject] = useState('all')
  const [req, setReq] = useState<string | null>(null)
  const [f, setF] = useState({ teacher: '', school: '', email: '', students: 50, date: '', needs: '' })
  const subjects = [...new Set(catalogue.schoolProgrammes.flatMap(p => p.subjects))]
  const list = catalogue.schoolProgrammes.filter(p => (stage === 'all' || p.stage.includes(stage)) && (subject === 'all' || p.subjects.includes(subject)))
  const sent = s.schoolRequests[0]
  const submit = (pid: string) => {
    const p = catalogue.schoolProgrammes.find(x => x.id === pid)!
    dispatch({ type: 'addSchoolRequest', req: { id: ref('SCH'), teacher: f.teacher, school: f.school, email: f.email, programme: p.name, stage: p.stage, students: f.students, date: f.date, needs: f.needs, status: 'Requested', created: DEMO_TODAY } })
    setReq(null)
  }
  return (
    <div className="mt-6">
      <p className="max-w-3xl text-muted">Curriculum-linked excursions across heritage, sustainability and STEM, with multi-day options for secondary students. School demand books well ahead and is busiest outside tourism peaks. <Flag id="A-05" /></p>
      {sent && <div className="mt-4"><Notice tone="ok">Request <strong>{sent.id}</strong> for {sent.programme} sent. The Education Coordinator will confirm the date and send the pre-visit pack and risk assessment.</Notice></div>}
      <div className="mt-5 flex flex-wrap gap-3">
        <Select value={stage} onChange={e => setStage(e.target.value)} className="w-auto" aria-label="Stage">
          <option value="all">All stages</option>{['Stage 2', 'Stage 3', 'Stage 4', 'Stage 5', 'Stages 5–6'].map(x => <option key={x}>{x}</option>)}
        </Select>
        <Select value={subject} onChange={e => setSubject(e.target.value)} className="w-auto" aria-label="Subject">
          <option value="all">All subjects</option>{subjects.map(x => <option key={x}>{x}</option>)}
        </Select>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {list.map(p => (
          <Card key={p.id}>
            <div className="flex flex-wrap gap-1.5"><Badge tone="slate">{p.stage}</Badge>{p.subjects.map(x => <Badge key={x}>{x}</Badge>)}</div>
            <h3 className="mt-2 text-2xl font-semibold text-forest">{p.name}</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-muted">{p.outcomes.map(o => <li key={o}>{o}</li>)}</ul>
            <p className="mt-3 text-sm"><strong className="tabular">{aud(p.price)}</strong> per student · {p.duration} · supervision {p.ratio} · teachers free</p>
            {req === p.id ? (
              <div className="mt-4 grid gap-3 rounded-lg bg-parchment/60 p-4 sm:grid-cols-2">
                <Field label="Teacher name"><Input value={f.teacher} onChange={e => setF({ ...f, teacher: e.target.value })} /></Field>
                <Field label="School"><Input value={f.school} onChange={e => setF({ ...f, school: e.target.value })} /></Field>
                <Field label="School email"><Input type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></Field>
                <Field label="Number of students"><Input type="number" min={10} max={150} value={f.students} onChange={e => setF({ ...f, students: +e.target.value })} /></Field>
                <Field label="Preferred date"><Input type="date" min={DEMO_TODAY} value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></Field>
                <Field label="Access or learning needs (class level)"><Textarea rows={2} value={f.needs} onChange={e => setF({ ...f, needs: e.target.value })} placeholder="e.g. 2 wheelchair users" /></Field>
                <p className="text-xs text-muted sm:col-span-2"><ShieldCheck size={12} className="mr-1 inline" />We only need class-level numbers. Please don't send student names or medical details here.</p>
                <div className="flex gap-2 sm:col-span-2"><Button disabled={!f.teacher || !f.school || !f.email || !f.date} onClick={() => submit(p.id)}>Send request</Button><Button variant="ghost" onClick={() => setReq(null)}>Cancel</Button></div>
              </div>
            ) : <Button className="mt-4" variant="secondary" onClick={() => setReq(p.id)}>Request a date</Button>}
          </Card>
        ))}
      </div>
    </div>
  )
}

function Courses() {
  const { dispatch } = useStore()
  const nav = useNavigate()
  const leftOf = useSessionLeft()
  const enrol = (sid: string) => {
    const sess = sessions.find(x => x.id === sid)!
    const c = catalogue.courses.find(x => x.id === sess.ref)!
    dispatch({ type: 'addItem', item: { key: sid, kind: 'course', name: c.name, sessionId: sid, productRef: c.id, date: sess.date, time: `${c.days}-day course`, qty: { adult: 1 }, prices: { adult: c.price }, taxable: true, discountable: true, extra: { element: c.element, course: c.id } } })
    nav('/checkout')
  }
  return (
    <div className="mt-6">
      <p className="max-w-3xl text-muted">Short courses taught on the live restoration and supervised by master tradespeople. Every course is linked to a real part of the estate, so what you practise on is what gets restored. <Flag id="A-04" /></p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {catalogue.courses.map(c => {
          const el = elementById(c.element)!
          const runs = sessions.filter(x => x.ref === c.id && x.date >= DEMO_TODAY)
          return (
            <Card key={c.id} className="flex flex-col">
              <div className="flex flex-wrap gap-1.5"><Badge tone="slate">{c.days} day{c.days > 1 ? 's' : ''}</Badge><Badge>{c.level}</Badge></div>
              <h3 className="mt-2 text-2xl font-semibold text-forest">{c.name}</h3>
              <p className="mt-1 flex-1 text-sm text-muted">{c.blurb}</p>
              <p className="mt-3 text-sm"><Hammer size={14} className="mr-1 inline text-ochre" />You'll work on: <Link to={`/support?el=${el.id}`}>{el.name}</Link></p>
              <p className="mt-1 text-sm"><strong className="tabular">{aud(c.price)}</strong> · Friends {aud(c.price * 0.85)} · bursary places available</p>
              <div className="mt-3 space-y-2">
                {runs.map(r => {
                  const left = leftOf(r)
                  return (
                    <div key={r.id} className="flex items-center justify-between gap-2 rounded-md bg-parchment/60 px-3 py-2 text-sm">
                      <span>{dateLong(r.date)} <span className="text-xs text-muted">· {left} places left</span></span>
                      <Button disabled={left === 0} onClick={() => enrol(r.id)}>Enrol</Button>
                    </div>
                  )
                })}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

const PATHWAY_STAGES = ['Applied', 'Volunteer', 'Trainee', 'Placement', 'Employed']

function Pathway() {
  const { dispatch, s } = useStore()
  const [f, setF] = useState({ first: s.user?.first ?? '', lastInitial: s.user?.last?.[0] ?? '', age: 19, trade: 'Stonemasonry', availability: 'Weekdays', guardianName: '', guardianConsent: false })
  const under18 = f.age < 18
  const ok = f.first && f.lastInitial && f.age >= 16 && f.age <= 24 && (!under18 || (f.guardianName && f.guardianConsent))
  const app = s.pathwayApp
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
      <div>
        <p className="max-w-2xl text-muted">A three-step route into skilled heritage work for young people aged 16–24, supporting UN SDG target 8.6 (reducing the share of young people not in employment, education or training).</p>
        <ol className="mt-5 grid gap-3 sm:grid-cols-3">
          {[['Volunteer', 'Garden, guiding or site crew. Build hours and confidence.'], ['Trainee', 'Paid traineeship on the live restoration with master tradespeople.'], ['Paid placement', 'Placement with an employer on our industry advisory board, who have committed to hiring graduates.']].map(([t, d], i) => (
            <li key={t} className="rounded-xl bg-white/80 p-4 ring-1 ring-stone"><span className="font-serif text-3xl font-semibold text-ochre">{i + 1}</span><p className="font-semibold text-forest">{t}</p><p className="mt-1 text-xs text-muted">{d}</p></li>
          ))}
        </ol>
        <Notice tone="info"><span className="text-xs">Applicants aged 16–17 need a parent or guardian's consent. Staff and volunteers who supervise them hold NSW Working with Children Checks. Pathway records are kept separately from donor and marketing data and are never used for fundraising.</span></Notice>
      </div>
      <Card>
        {app ? (
          <>
            <h3 className="text-2xl font-semibold text-forest">Your application</h3>
            <p className="mt-1 text-sm text-muted">{app.trade} · submitted {dateLong(app.created)}</p>
            <ol className="mt-4 space-y-2">
              {PATHWAY_STAGES.map((st, i) => {
                const cur = PATHWAY_STAGES.indexOf(app.stage)
                return <li key={st} className="flex items-center gap-2 text-sm"><span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${i <= cur ? 'bg-forest text-cream' : 'bg-parchment text-muted'}`}>{i + 1}</span><span className={i === cur ? 'font-semibold text-forest' : 'text-muted'}>{st}</span></li>
              })}
            </ol>
            <p className="mt-3 text-xs text-muted">The Education Coordinator moves your application forward from the Console.</p>
          </>
        ) : (
          <>
            <h3 className="flex items-center gap-2 text-2xl font-semibold text-forest"><GraduationCap /> Apply</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="First name"><Input value={f.first} onChange={e => setF({ ...f, first: e.target.value })} /></Field>
              <Field label="Last name initial"><Input maxLength={1} value={f.lastInitial} onChange={e => setF({ ...f, lastInitial: e.target.value.toUpperCase() })} /></Field>
              <Field label="Age" hint="16–24"><Input type="number" min={16} max={24} value={f.age} onChange={e => setF({ ...f, age: +e.target.value })} /></Field>
              <Field label="Trade of interest"><Select value={f.trade} onChange={e => setF({ ...f, trade: e.target.value })}>{['Stonemasonry', 'Lime plastering', 'Heritage carpentry', 'Blacksmithing', 'Horticulture'].map(x => <option key={x}>{x}</option>)}</Select></Field>
              <Field label="Availability"><Select value={f.availability} onChange={e => setF({ ...f, availability: e.target.value })}>{['Weekdays', 'Weekends', 'School holidays', 'Flexible'].map(x => <option key={x}>{x}</option>)}</Select></Field>
            </div>
            {under18 && (
              <div className="mt-3 space-y-2 rounded-md bg-ochre-light/30 p-3">
                <Field label="Parent / guardian name"><Input value={f.guardianName} onChange={e => setF({ ...f, guardianName: e.target.value })} /></Field>
                <label className="flex gap-2 text-sm"><input type="checkbox" className="accent-[#0C3314]" checked={f.guardianConsent} onChange={e => setF({ ...f, guardianConsent: e.target.checked })} /> My parent/guardian consents to this application</label>
              </div>
            )}
            <Button className="mt-4" disabled={!ok} onClick={() => dispatch({ type: 'applyPathway', app: { id: ref('PW'), first: f.first, lastInitial: f.lastInitial, age: f.age, trade: f.trade, availability: f.availability, guardianName: under18 ? f.guardianName : undefined, guardianConsent: under18 ? f.guardianConsent : undefined, stage: 'Applied', created: DEMO_TODAY } })}>Submit application</Button>
            <p className="mt-2 text-xs text-muted">We collect the minimum needed: no address, no date of birth, no ID numbers at this stage.</p>
          </>
        )}
      </Card>
    </div>
  )
}

export default function Learn() {
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as T) ?? 'schools'
  return (
    <>
      <PageHeader eyebrow="Education hub" title="Learn at Hillview" intro="Three tiers: a schools programme, heritage trades short courses, and a youth pathway into skilled, paid work." />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Tabs<T> tabs={[{ id: 'schools', label: <span className="flex items-center gap-1.5"><School size={15} />Schools</span> }, { id: 'courses', label: <span className="flex items-center gap-1.5"><Hammer size={15} />Short courses</span> }, { id: 'pathway', label: <span className="flex items-center gap-1.5"><GraduationCap size={15} />Youth pathway</span> }]}
          value={tab} onChange={t => setParams({ tab: t })} />
        {tab === 'schools' && <Schools />}
        {tab === 'courses' && <Courses />}
        {tab === 'pathway' && <Pathway />}
      </div>
    </>
  )
}
