import { useMemo, useState } from 'react'
import { Badge, Button, Card, Field, Flag, Input, Notice, PageHeader, Select, Textarea, cx } from '../components/ui'
import { catalogue, DEMO_TODAY } from '../lib/data'
import { addDays, aud, dateLong, dayName, ref } from '../lib/format'
import { sharedCalendar } from '../lib/calendar'
import { useStore } from '../lib/store'

export default function Venue() {
  const { s, dispatch } = useStore()
  const blocks = useMemo(() => sharedCalendar(s), [s])
  const [pkg, setPkg] = useState(catalogue.venuePackages[0].id)
  const [f, setF] = useState({ name: s.user ? `${s.user.first} ${s.user.last}` : '', email: s.user?.email ?? '', date: '', guests: 80, budget: '$10k–$15k', notes: '' })
  const [sent, setSent] = useState<string | null>(null)
  const days = Array.from({ length: 56 }, (_, i) => addDays(DEMO_TODAY, i))
  const busy = (d: string) => blocks.filter(b => b.date === d && b.space === 'Main House')
  const p = catalogue.venuePackages.find(x => x.id === pkg)!
  const dateBusy = f.date && busy(f.date).length > 0

  const submit = () => {
    const id = ref('L')
    const value = p.unit === 'per person' ? p.from_price * f.guests : p.peak_price
    dispatch({ type: 'addLead', lead: { id, name: f.name, email: f.email, package: p.name, kind: p.kind, eventDate: f.date, guests: f.guests, budget: f.budget, stage: 'Enquiry', enquired: DEMO_TODAY, value, notes: f.notes } })
    setSent(id)
  }

  return (
    <>
      <PageHeader eyebrow="Venue hire" title="Weddings, retreats and celebrations" intro={<>A heritage house, a historic garden and wide views across the Southern Highlands. Every booking helps fund the restoration. <Flag id="A-06" light /> <Flag id="A-07" light /></>} />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {catalogue.venuePackages.map(v => (
            <button key={v.id} onClick={() => setPkg(v.id)} className={cx('rounded-xl p-5 text-left ring-1 transition', pkg === v.id ? 'bg-forest text-cream ring-forest' : 'bg-white/80 ring-stone hover:ring-forest')}>
              <Badge tone={pkg === v.id ? 'green' : 'neutral'}>{v.kind}</Badge>
              <h3 className="mt-2 text-2xl font-semibold">{v.name}</h3>
              <p className={cx('mt-1 text-sm', pkg === v.id ? 'text-cream/80' : 'text-muted')}>{v.blurb}</p>
              <p className="mt-3 text-sm font-semibold tabular">from {aud(v.from_price)} {v.unit} · {v.guests}</p>
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_400px]">
          <Card>
            <h2 className="text-2xl font-semibold text-forest">Availability: Main House, next 8 weeks</h2>
            <p className="mt-1 text-sm text-muted">Shown from the estate's shared calendar, which also holds school groups and public events, so a date can't be booked twice.</p>
            <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <div key={d} className="py-1 font-semibold text-muted">{d}</div>)}
              {Array.from({ length: (new Date(DEMO_TODAY + 'T00:00:00').getDay() + 6) % 7 }).map((_, i) => <div key={`pad${i}`} />)}
              {days.map(d => {
                const b = busy(d)
                const sel = f.date === d
                return (
                  <button key={d} title={b.map(x => x.title).join(', ') || 'Available'} onClick={() => !b.length && setF({ ...f, date: d })}
                    className={cx('rounded-md py-2 tabular ring-1', sel ? 'bg-ochre text-white ring-ochre' : b.length ? 'cursor-not-allowed bg-stone/60 text-muted line-through ring-stone' : 'bg-white ring-stone hover:ring-forest')}>
                    {+d.slice(8)}<span className="block text-[9px]">{d.slice(5, 7) === DEMO_TODAY.slice(5, 7) ? '' : new Date(d + 'T00:00:00').toLocaleDateString('en-AU', { month: 'short' })}</span>
                  </button>
                )
              })}
            </div>
            <p className="mt-3 text-xs text-muted">Grey = already booked (wedding, corporate day or event). Pick any date further ahead in the form.</p>
          </Card>

          <Card>
            {sent ? (
              <Notice tone="ok">Thanks! Enquiry <strong>{sent}</strong> has gone to our events team. You'll hear from us within two working days with a tailored quote. (It now appears in the Console's venue pipeline.)</Notice>
            ) : (
              <>
                <h3 className="text-2xl font-semibold text-forest">Make an enquiry</h3>
                <p className="text-sm text-muted">{p.name}</p>
                <div className="mt-3 space-y-3">
                  <Field label="Your name"><Input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></Field>
                  <Field label="Email"><Input type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Preferred date"><Input type="date" min={DEMO_TODAY} value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></Field>
                    <Field label="Guests"><Input type="number" min={2} max={200} value={f.guests} onChange={e => setF({ ...f, guests: +e.target.value })} /></Field>
                  </div>
                  {dateBusy && <p className="text-xs text-alert">{dayName(f.date)} {dateLong(f.date)} is already booked. Choose another date.</p>}
                  <Field label="Budget band"><Select value={f.budget} onChange={e => setF({ ...f, budget: e.target.value })}>{['Under $5k', '$5k–$10k', '$10k–$15k', '$15k–$25k', '$25k+'].map(x => <option key={x}>{x}</option>)}</Select></Field>
                  <Field label="Anything else?"><Textarea rows={3} value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} /></Field>
                  <Button className="w-full" disabled={!f.name || !f.email || !f.date || !!dateBusy} onClick={submit}>Send enquiry</Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
