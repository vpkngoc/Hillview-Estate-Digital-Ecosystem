import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarDays, ChevronLeft, ChevronRight, Lock, Users } from 'lucide-react'
import { Badge, Button, Card, Flag, Notice, PageHeader, Progress, cx } from '../components/ui'
import { catalogue, DEMO_TODAY, productFor, sessions, type Session } from '../lib/data'
import { addDays, aud, dateLong, dateShort, daysBetween } from '../lib/format'
import { MEMBER_DISCOUNT, useStore, type BasketItem } from '../lib/store'

export const PUBLIC_RELEASE_DAYS = 42 // Friends can book 14 days earlier (A-09)

type Filter = 'all' | 'free' | 'tour' | 'workshop' | 'event' | 'course'
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Everything' }, { id: 'free', label: 'Free' }, { id: 'tour', label: 'Tours' },
  { id: 'workshop', label: 'Workshops' }, { id: 'event', label: 'Events' }, { id: 'course', label: 'Short courses' },
]
const PRICE_LABEL: Record<string, string> = { adult: 'Adult', concession: 'Concession', child: 'Child (5–15)', member: 'Friend' }

function kindOf(ref: string) {
  const p = productFor(ref)!
  if (ref === 'grounds') return 'free'
  if (p.kind === 'member-event' || p.kind === 'event') return 'event'
  return p.kind as Filter
}

export function useSessionLeft() {
  const { s } = useStore()
  return (x: Session) => Math.max(0, x.capacity - x.booked - (s.sessionExtra[x.id] ?? 0))
}

function TicketPicker({ session, onDone }: { session: Session; onDone: () => void }) {
  const { dispatch, isMember, s } = useStore()
  const nav = useNavigate()
  const p = productFor(session.ref)!
  const left = useSessionLeft()(session)
  const isGrounds = session.ref === 'grounds'
  const [qty, setQty] = useState<Record<string, number>>(() => Object.fromEntries(Object.keys(p.prices).map((k, i) => [k, i === 0 ? (isGrounds ? 2 : 1) : 0])))
  const total = Object.entries(qty).reduce((a, [k, q]) => a + q * p.prices[k], 0)
  const count = Object.values(qty).reduce((a, b) => a + b, 0)
  const memberPrice = isMember || s.basket.some(b => b.kind === 'membership')
  const discountable = p.gst && total > 0

  const add = (go: boolean) => {
    const kind = session.ref === 'grounds' ? 'grounds' : p.kind === 'course' ? 'course' : 'ticket'
    const item: BasketItem = {
      key: session.id, kind, name: isGrounds ? 'Estate grounds — free registration' : p.name, sessionId: session.id,
      productRef: session.ref, date: session.date, time: session.time, qty: { ...qty }, prices: p.prices,
      taxable: p.gst, discountable, extra: p.element ? { element: p.element } : undefined,
    }
    dispatch({ type: 'addItem', item })
    onDone()
    if (go) nav('/checkout')
  }

  return (
    <div className="mt-4 rounded-lg bg-parchment/60 p-4">
      {isGrounds ? (
        <label className="flex items-center gap-3 text-sm">
          <Users size={16} /> People in your party
          <input type="number" min={1} max={Math.min(12, left)} value={qty.adult} onChange={e => setQty({ adult: Math.max(1, +e.target.value) })} className="w-20 rounded-md border border-stone px-2 py-1" />
        </label>
      ) : (
        <div className="grid gap-2 sm:grid-cols-3">
          {Object.keys(p.prices).map(k => (
            <label key={k} className="flex items-center justify-between gap-2 rounded-md bg-white px-3 py-2 text-sm ring-1 ring-stone">
              <span>{PRICE_LABEL[k] ?? k} <span className="text-muted">{p.prices[k] ? aud(p.prices[k]) : 'Free'}</span></span>
              <input type="number" min={0} max={left} value={qty[k]} onChange={e => setQty(q => ({ ...q, [k]: Math.max(0, +e.target.value) }))} className="w-14 rounded border border-stone px-1.5 py-0.5" aria-label={`${PRICE_LABEL[k] ?? k} tickets`} />
            </label>
          ))}
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="text-sm">
          {total > 0 ? <>Total <strong className="tabular">{aud(memberPrice && discountable ? total * (1 - MEMBER_DISCOUNT) : total)}</strong>{memberPrice && discountable && <span className="ml-1 text-xs text-leaf-dark">Friend price applied</span>}{p.gst && <span className="ml-1 text-xs text-muted">incl. GST</span>}</> : <strong>Free</strong>}
        </span>
        <span className="ml-auto flex gap-2">
          <Button variant="secondary" disabled={count === 0 || count > left} onClick={() => add(false)}>Add to basket</Button>
          <Button disabled={count === 0 || count > left} onClick={() => add(true)}>{isGrounds ? 'Register & continue' : 'Book now'}</Button>
        </span>
      </div>
      {count > left && <p className="mt-2 text-xs text-alert">Only {left} places left.</p>}
    </div>
  )
}

function SessionRow({ x }: { x: Session }) {
  const { isMember } = useStore()
  const [open, setOpen] = useState(false)
  const p = productFor(x.ref)!
  const left = useSessionLeft()(x)
  const lead = daysBetween(DEMO_TODAY, x.date)
  const priorityLocked = lead > PUBLIC_RELEASE_DAYS && !isMember && x.ref !== 'grounds'
  const membersOnly = !!p.membersOnly
  const from = Math.min(...Object.values(p.prices).filter(v => v > 0), Infinity)
  const k = kindOf(x.ref)
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start gap-4">
        <div className="w-20 shrink-0 text-sm">
          <div className="font-semibold text-forest">{x.time}</div>
          <Badge tone={k === 'free' ? 'green' : k === 'course' ? 'slate' : k === 'event' ? 'ochre' : 'neutral'}>{k === 'free' ? 'Free' : k}</Badge>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-serif text-xl font-semibold leading-tight text-forest">{p.name} {membersOnly && <Badge tone="dark">Friends only</Badge>}</p>
          <p className="mt-1 text-sm text-muted">{p.blurb}</p>
          <div className="mt-2 flex max-w-xs items-center gap-2 text-xs text-muted">
            <Progress value={x.capacity - left} max={x.capacity} tone={left < x.capacity * 0.15 ? 'ochre' : 'leaf'} />
            <span className="whitespace-nowrap tabular">{left} of {x.capacity} left</span>
          </div>
        </div>
        <div className="text-right text-sm">
          {membersOnly ? <span className="font-semibold">Included for Friends</span>
            : Number.isFinite(from) ? <><div className="font-semibold tabular">from {aud(from)}</div><div className="text-xs text-leaf-dark">Friends {aud(from * (1 - MEMBER_DISCOUNT))}</div></>
              : <div className="font-semibold">Free</div>}
          <div className="mt-2">
            {membersOnly && !isMember ? <Link to="/friends" className="text-xs font-semibold">Join to attend →</Link>
              : priorityLocked ? <span className="inline-flex items-center gap-1 text-xs text-muted"><Lock size={12} /> Friends' priority · public from {dateShort(addDays(x.date, -PUBLIC_RELEASE_DAYS))}</span>
                : left === 0 ? <Badge tone="red">Sold out</Badge>
                  : <Button variant={open ? 'secondary' : 'primary'} onClick={() => setOpen(o => !o)}>{open ? 'Close' : x.ref === 'grounds' ? 'Register' : 'Book'}</Button>}
          </div>
        </div>
      </div>
      {open && <TicketPicker session={x} onDone={() => setOpen(false)} />}
    </Card>
  )
}

export default function WhatsOn() {
  const [week, setWeek] = useState(0)
  const [filter, setFilter] = useState<Filter>('all')
  const start = addDays(DEMO_TODAY, week * 7)
  const end = addDays(start, 6)
  const list = useMemo(() => sessions.filter(x => x.date >= start && x.date <= end && (filter === 'all' || kindOf(x.ref) === filter)), [start, end, filter])
  const byDay = useMemo(() => {
    const m = new Map<string, Session[]>()
    list.forEach(x => m.set(x.date, [...(m.get(x.date) ?? []), x]))
    return [...m.entries()]
  }, [list])

  return (
    <>
      <PageHeader eyebrow="Visit" title="What's on at Hillview" intro={<>Everything on one calendar: free grounds entry, guided tours, workshops, events and short courses. One basket, one checkout. <Flag id="A-01" light /> <Flag id="A-12" light /></>} />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Notice tone="info">The grounds are <strong>free every day</strong>. Registering helps us manage numbers and parking, and you'll get one Hillview account for all your bookings.</Notice>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg bg-white p-1 ring-1 ring-stone">
            <button className="rounded p-1.5 hover:bg-parchment disabled:opacity-30" disabled={week === 0} onClick={() => setWeek(w => w - 1)} aria-label="Previous week"><ChevronLeft size={18} /></button>
            <span className="flex items-center gap-2 px-2 text-sm font-semibold"><CalendarDays size={16} />{dateShort(start)} – {dateShort(end)}</span>
            <button className="rounded p-1.5 hover:bg-parchment disabled:opacity-30" disabled={week === 7} onClick={() => setWeek(w => w + 1)} aria-label="Next week"><ChevronRight size={18} /></button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} className={cx('rounded-full px-3 py-1 text-sm ring-1 transition', filter === f.id ? 'bg-forest text-cream ring-forest' : 'bg-white text-ink ring-stone hover:ring-forest')}>{f.label}</button>
            ))}
          </div>
        </div>
        <div className="mt-6 space-y-8">
          {byDay.length === 0 && <p className="text-muted">Nothing matches this filter this week.</p>}
          {byDay.map(([d, xs]) => (
            <section key={d}>
              <h2 className="mb-3 border-b border-stone pb-1 text-2xl font-semibold text-forest">{dateLong(d)}</h2>
              <div className="space-y-3">{xs.map(x => <SessionRow key={x.id} x={x} />)}</div>
            </section>
          ))}
        </div>
        <p className="mt-10 text-xs text-muted">Friends of Hillview can book up to 8 weeks ahead; everyone else up to {PUBLIC_RELEASE_DAYS / 7} weeks ahead. Friends get 15% off paid tours, workshops, courses and events — paid events are discounted, not free, so every ticket keeps funding the restoration. {catalogue.experiences.length} experience types · prices include GST.</p>
      </div>
    </>
  )
}
