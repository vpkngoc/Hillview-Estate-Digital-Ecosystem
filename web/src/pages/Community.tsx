import { useState } from 'react'
import { MessageSquare, Users } from 'lucide-react'
import { Badge, Button, Card, Field, Input, Notice, PageHeader, Select, Textarea } from '../components/ui'
import { DEMO_TODAY } from '../lib/data'
import { dateLong, ref } from '../lib/format'
import { REFERENCE_GROUP, VOLUNTEER_ROLES } from '../lib/content'
import { useStore } from '../lib/store'

export default function Community() {
  const { s, dispatch } = useStore()
  const [f, setF] = useState({ name: '', locality: 'Sutton Forest', topic: 'Traffic & parking', message: '' })
  const [done, setDone] = useState(false)
  return (
    <>
      <PageHeader eyebrow="Community" title="Growing with our neighbours" intro="As Hillview adds weddings, events and courses, the Community Reference Group gives local residents a standing voice. Neighbours can also volunteer." />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-2">
        <Card>
          <h2 className="flex items-center gap-2 text-2xl font-semibold text-forest"><Users size={20} /> Community Reference Group</h2>
          <p className="mt-2 text-sm text-muted">{REFERENCE_GROUP.members}</p>
          <ul className="mt-4 divide-y divide-stone/70">
            {REFERENCE_GROUP.meetings.map(m => (
              <li key={m.date} className="py-3 text-sm"><span className="text-xs text-muted">{dateLong(m.date)}</span> <Badge tone={m.status === 'Upcoming' ? 'green' : 'neutral'}>{m.status}</Badge><p className="mt-1">{m.topic}</p></li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">Meeting topics are illustrative.</p>
        </Card>
        <Card>
          <h2 className="flex items-center gap-2 text-2xl font-semibold text-forest"><MessageSquare size={20} /> Raise something with us</h2>
          {done ? <Notice tone="ok">Thank you. Your feedback is logged and will go to the next Reference Group meeting, and you'll get a reply within 10 working days.</Notice> : (
            <div className="mt-3 space-y-3">
              <Field label="Name"><Input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Locality"><Select value={f.locality} onChange={e => setF({ ...f, locality: e.target.value })}>{['Sutton Forest', 'Moss Vale', 'Bowral', 'Mittagong', 'Exeter', 'Other Wingecarribee'].map(x => <option key={x}>{x}</option>)}</Select></Field>
                <Field label="Topic"><Select value={f.topic} onChange={e => setF({ ...f, topic: e.target.value })}>{['Traffic & parking', 'Noise', 'Local jobs', 'Events', 'Heritage', 'Other'].map(x => <option key={x}>{x}</option>)}</Select></Field>
              </div>
              <Field label="Message"><Textarea rows={4} value={f.message} onChange={e => setF({ ...f, message: e.target.value })} /></Field>
              <Button disabled={!f.name || !f.message} onClick={() => { dispatch({ type: 'addFeedback', item: { id: ref('FB'), ...f, created: DEMO_TODAY } }); setDone(true) }}>Submit</Button>
            </div>
          )}
        </Card>
        <section className="lg:col-span-2">
          <h2 className="text-3xl font-semibold text-forest">Volunteer at Hillview</h2>
          <p className="mt-1 text-sm text-muted">Volunteering is also step one of the youth pathway. Hours you log here count toward a traineeship.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VOLUNTEER_ROLES.map(r => {
              const signed = s.volunteerSignups.some(v => v.role === r.id)
              return (
                <Card key={r.id} className="flex flex-col">
                  <h3 className="text-xl font-semibold text-forest">{r.name}</h3>
                  <p className="text-xs font-semibold text-ochre">{r.when}</p>
                  <p className="mt-2 flex-1 text-sm text-muted">{r.blurb}</p>
                  <Button className="mt-3" variant={signed ? 'secondary' : 'primary'} disabled={signed} onClick={() => dispatch({ type: 'addVolunteer', item: { id: ref('VOL'), role: r.id, shift: r.when, created: DEMO_TODAY } })}>{signed ? 'Signed up ✓' : 'Sign up'}</Button>
                </Card>
              )
            })}
          </div>
        </section>
      </div>
    </>
  )
}
