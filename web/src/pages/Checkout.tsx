import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CreditCard, Heart, ShieldCheck, Trash2 } from 'lucide-react'
import MockQR from '../components/MockQR'
import { Badge, Button, Card, Check, Empty, Field, Flag, Input, LinkButton, Notice, PageHeader } from '../components/ui'
import { catalogue, DEMO_TODAY, elementById } from '../lib/data'
import { addDays, aud, dateLong, ref } from '../lib/format'
import { MEMBER_DISCOUNT, SARAH, useStore, type Adoption, type Order } from '../lib/store'

export const CONSENT_TEXT: Record<string, string> = {
  newsletter: 'Send me the Hillview newsletter (monthly news, restoration updates).',
  events: 'Tell me about upcoming events and courses.',
  appeals: 'Contact me about fundraising appeals.',
  impact: 'Send me updates when something I supported is restored.',
}

export default function Checkout() {
  const { s, dispatch, priced, isMember } = useStore()
  const nav = useNavigate()
  const [form, setForm] = useState({ first: '', last: '', email: '', postcode: '' })
  const [consents, setConsents] = useState<Record<string, boolean>>({ ...s.consents })
  const [gift, setGift] = useState(0)
  const [busy, setBusy] = useState(false)

  const gross = priced.reduce((a, i) => a + i.gross, 0)
  const discount = priced.reduce((a, i) => a + i.discount, 0)
  const gst = priced.reduce((a, i) => a + i.gst, 0)
  const gifts = priced.filter(i => i.kind === 'donation' || i.kind === 'adoption').reduce((a, i) => a + i.amount, 0) + gift
  const total = priced.reduce((a, i) => a + i.amount, 0) + gift
  const user = s.user
  const detailsOk = !!user || (form.first && form.last && /.+@.+\..+/.test(form.email))

  const place = () => {
    setBusy(true)
    const u = user ?? { id: 'S-DEMO', first: form.first, last: form.last, email: form.email, town: '', postcode: form.postcode, created: DEMO_TODAY }
    if (!user) dispatch({ type: 'signIn', user: u })
    Object.entries(consents).forEach(([k, v]) => { if (v !== s.consents[k]) dispatch({ type: 'setConsent', key: k, value: v, source: 'Checkout' }) })
    const items = [...priced]
    if (gift > 0) items.push({ key: ref('GIFT'), kind: 'donation', name: 'Gift to the Restoration Fund', qty: { gift: 1 }, prices: { gift }, taxable: false, discountable: false, gross: gift, discount: 0, amount: gift, gst: 0, extra: { fund: 'restoration', fundName: 'Restoration Fund' } })
    const order: Order = { ref: ref('HV'), date: DEMO_TODAY, items, total, gst, gifts, discount, payer: { first: u.first, last: u.last, email: u.email } }
    const adoptions: Adoption[] = items.filter(i => i.kind === 'adoption').map(i => ({
      id: ref('AD'), elementId: String(i.extra?.element), units: Number(i.extra?.units ?? 1), dedication: String(i.extra?.dedication ?? ''), date: DEMO_TODAY,
      moderation: i.extra?.dedication ? 'pending' : 'approved',
    }))
    const m = items.find(i => i.kind === 'membership')
    const membership = m ? { tier: String(m.extra?.tier), since: DEMO_TODAY, expires: addDays(DEMO_TODAY, 365) } : null
    setTimeout(() => { dispatch({ type: 'placeOrder', order, adoptions, membership }); nav(`/confirmation/${order.ref}`) }, 500)
  }

  if (s.basket.length === 0) return (
    <>
      <PageHeader eyebrow="Basket" title="Your basket" />
      <div className="mx-auto max-w-3xl px-4 py-10"><Empty>Your basket is empty. <Link to="/whats-on">See what's on</Link> or <Link to="/support">adopt a piece of Hillview</Link>.</Empty></div>
    </>
  )

  return (
    <>
      <PageHeader eyebrow="Checkout" title="One basket, one payment" intro="Tickets, courses, membership and gifts together. Everything is saved to a single Hillview account." />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <h2 className="text-2xl font-semibold text-forest">Your basket</h2>
            <ul className="mt-4 divide-y divide-stone/70">
              {priced.map(i => (
                <li key={i.key} className="flex items-start gap-3 py-3 text-sm">
                  <div className="flex-1">
                    <p className="font-semibold">{i.name}</p>
                    <p className="text-xs text-muted">
                      {i.date && <>{dateLong(i.date)} · {i.time} · </>}
                      {Object.entries(i.qty).filter(([, q]) => q > 0).map(([k, q]) => `${q} × ${k}`).join(', ')}
                      {i.kind === 'donation' && <> · {String(i.extra?.fundName ?? '')}{i.extra?.recurring ? ' · monthly' : ''}</>}
                    </p>
                    {i.discount > 0 && <p className="text-xs text-leaf-dark">Friend price −{aud(i.discount, true)}</p>}
                  </div>
                  <span className="tabular">{i.amount ? aud(i.amount, true) : 'Free'}</span>
                  <button onClick={() => dispatch({ type: 'removeItem', key: i.key })} className="text-muted hover:text-alert" aria-label={`Remove ${i.name}`}><Trash2 size={16} /></button>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h3 className="flex items-center gap-2 text-xl font-semibold text-forest"><Heart size={18} className="text-ochre" /> Add a gift to the restoration?</h3>
            <p className="mt-1 text-sm text-muted">Optional. Gifts go to the Restoration Fund and carry no GST.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[0, 5, 10, 25].map(v => <Button key={v} variant={gift === v ? 'primary' : 'secondary'} onClick={() => setGift(v)}>{v ? aud(v) : 'No thanks'}</Button>)}
            </div>
          </Card>

          <Card>
            <h3 className="text-xl font-semibold text-forest">Your details</h3>
            {user ? (
              <p className="mt-2 text-sm">Booking as <strong>{user.first} {user.last}</strong> ({user.email}). <button className="text-forest underline" onClick={() => dispatch({ type: 'signOut' })}>Not you?</button></p>
            ) : (
              <>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field label="First name"><Input value={form.first} onChange={e => setForm({ ...form, first: e.target.value })} autoComplete="given-name" /></Field>
                  <Field label="Last name"><Input value={form.last} onChange={e => setForm({ ...form, last: e.target.value })} autoComplete="family-name" /></Field>
                  <Field label="Email"><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} autoComplete="email" /></Field>
                  <Field label="Postcode" hint="Helps us understand where visitors come from."><Input value={form.postcode} onChange={e => setForm({ ...form, postcode: e.target.value })} /></Field>
                </div>
                <p className="mt-3 text-sm">Demo shortcut: <button className="font-semibold text-forest underline" onClick={() => dispatch({ type: 'signIn', user: SARAH })}>continue as Sarah Mitchell (Bowral)</button></p>
              </>
            )}
          </Card>

          <Card>
            <h3 className="text-xl font-semibold text-forest">How we may contact you</h3>
            <p className="mt-1 text-xs text-muted">Each choice is separate and unticked. We'll always email booking confirmations. You can change these any time in My Hillview.</p>
            <div className="mt-3 space-y-2">
              {Object.keys(CONSENT_TEXT).map(k => <Check key={k} checked={!!consents[k]} onChange={v => setConsents({ ...consents, [k]: v })}>{CONSENT_TEXT[k]}</Check>)}
            </div>
            <p className="mt-3 text-xs text-muted"><ShieldCheck size={12} className="mr-1 inline" />Collection notice: The King's Foundation Australia collects your details to manage your bookings and, if you agree, to keep in touch. See <Link to="/privacy">Privacy &amp; data use</Link>.</p>
          </Card>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <h3 className="text-xl font-semibold text-forest">Summary</h3>
            <dl className="mt-3 space-y-1.5 text-sm tabular">
              <div className="flex justify-between"><dt>Items</dt><dd>{aud(gross, true)}</dd></div>
              {discount > 0 && <div className="flex justify-between text-leaf-dark"><dt>Friend discount ({MEMBER_DISCOUNT * 100}%)</dt><dd>−{aud(discount, true)}</dd></div>}
              {gift > 0 && <div className="flex justify-between"><dt>Restoration gift</dt><dd>{aud(gift, true)}</dd></div>}
              <div className="flex justify-between border-t border-stone pt-2 text-base font-semibold"><dt>Total</dt><dd>{aud(total, true)}</dd></div>
              <div className="flex justify-between text-xs text-muted"><dt>Includes GST <Flag id="A-19" /></dt><dd>{aud(gst, true)}</dd></div>
              {gifts > 0 && <div className="flex justify-between text-xs text-muted"><dt>Gifts (no GST)</dt><dd>{aud(gifts, true)}</dd></div>}
            </dl>
            {!isMember && !s.basket.some(b => b.kind === 'membership') && discount === 0 && gross > 0 &&
              <p className="mt-3 rounded-md bg-leaf/15 p-2 text-xs">Friends of Hillview save {MEMBER_DISCOUNT * 100}% on paid experiences. <Link to="/friends">Add a membership</Link> and the discount applies to this basket.</p>}
          </Card>
          <Card>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-forest"><CreditCard size={18} /> Payment</h3>
            <div className="mt-3 space-y-2 opacity-70">
              <Input disabled value="4242 4242 4242 4242" aria-label="Card number (demo)" />
              <div className="grid grid-cols-2 gap-2"><Input disabled value="12 / 29" aria-label="Expiry (demo)" /><Input disabled value="123" aria-label="CVC (demo)" /></div>
            </div>
            <Notice tone="warn"><span className="text-xs">Pretend checkout — no payment is taken. In production, card details go straight to a PCI-compliant payment provider and never touch Hillview's systems.</span></Notice>
            <Button className="mt-3 w-full" disabled={!detailsOk || busy} onClick={place}>{busy ? 'Processing…' : `Pay ${aud(total, true)} (demo)`}</Button>
          </Card>
        </div>
      </div>
    </>
  )
}

export function Confirmation() {
  const { ref: orderRef } = useParams()
  const { s, isMember } = useStore()
  const o = s.orders.find(x => x.ref === orderRef)
  if (!o) return <div className="mx-auto max-w-3xl px-4 py-16"><Empty>Order not found. <Link to="/me">Go to My Hillview</Link></Empty></div>
  const taxable = o.items.filter(i => i.taxable)
  const giftLines = o.items.filter(i => i.kind === 'donation' || i.kind === 'adoption')
  const tickets = o.items.filter(i => i.kind === 'ticket' || i.kind === 'grounds' || i.kind === 'course')
  const paidExperiences = s.orders.flatMap(x => x.items).filter(i => (i.kind === 'ticket' || i.kind === 'course') && i.amount > 0)
  const wouldSave = taxable.filter(i => i.discountable).reduce((a, i) => a + i.gross * MEMBER_DISCOUNT, 0)
  const joined = o.items.find(i => i.kind === 'membership')

  return (
    <>
      <PageHeader eyebrow="Confirmed" title={`Thank you, ${o.payer.first}`} intro={<>Order <strong>{o.ref}</strong> is saved to <Link to="/me" className="text-leaf">My Hillview</Link>. A confirmation email would be sent to {o.payer.email} (simulated).</>} />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {tickets.length > 0 && (
            <Card>
              <h2 className="text-2xl font-semibold text-forest">Your tickets</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {tickets.map(t => (
                  <div key={t.key} className="flex gap-3 rounded-lg bg-parchment/60 p-3">
                    <MockQR value={`${o.ref}:${t.key}`} size={84} />
                    <div className="text-sm">
                      <p className="font-semibold leading-tight">{t.name}</p>
                      <p className="text-xs text-muted">{t.date && dateLong(t.date)} · {t.time}</p>
                      <p className="text-xs text-muted">{(() => { const n = Object.values(t.qty).reduce((a, b) => a + b, 0); return t.kind === 'course' ? `${n} place${n > 1 ? 's' : ''}` : `${n} ${n === 1 ? 'person' : 'people'}` })()}</p>
                      {t.extra?.element ? <Link to={`/support?el=${t.extra.element}`} className="text-xs">You'll work on: {elementById(String(t.extra.element))?.name} →</Link> : null}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted">Mock codes for the demo. Front-of-house checks these in from the Console.</p>
            </Card>
          )}

          {joined && <Notice tone="ok">Welcome to <strong>Friends of Hillview</strong> ({joined.name.replace('Friends of Hillview — ', '')}). Your Friend price was applied to today's tickets and your 14-day priority booking window is now open.</Notice>}

          {!isMember && paidExperiences.length >= 1 && !joined && (
            <Card className="bg-forest text-cream ring-forest">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-leaf">You'd have saved {aud(wouldSave, true)} today</p>
              <h3 className="mt-1 text-3xl font-semibold">Become a Friend of Hillview</h3>
              <p className="mt-2 text-sm text-cream/85">Book 14 days before everyone else, save {MEMBER_DISCOUNT * 100}% on tours, workshops and courses, and join members-only evenings. From {aud(catalogue.membershipTiers[0].price)} a year.</p>
              <LinkButton to="/friends" variant="light" className="mt-4">See membership</LinkButton>
            </Card>
          )}

          <Card>
            <h3 className="text-xl font-semibold text-forest">Follow your impact</h3>
            <p className="mt-1 text-sm text-muted">Adopt a real piece of Hillview and we'll send you its restoration story.</p>
            <LinkButton to="/support" variant="give" className="mt-3">Open the Adopt-a-Stone map</LinkButton>
          </Card>
        </div>

        <Card className="text-sm lg:self-start">
          <h3 className="text-lg font-semibold text-forest">Tax invoice (simulated)</h3>
          <p className="text-xs text-muted">The King's Foundation Australia · ABN [to be confirmed] · {dateLong(o.date)}</p>
          <table className="mt-3 w-full tabular">
            <tbody>
              {taxable.map(i => <tr key={i.key}><td className="py-1 pr-2">{i.name}</td><td className="py-1 text-right">{aud(i.amount, true)}</td></tr>)}
              <tr className="border-t border-stone"><td className="py-1 font-semibold">Taxable total</td><td className="text-right font-semibold">{aud(taxable.reduce((a, i) => a + i.amount, 0), true)}</td></tr>
              <tr><td className="text-xs text-muted">GST included (1/11)</td><td className="text-right text-xs text-muted">{aud(o.gst, true)}</td></tr>
            </tbody>
          </table>
          {giftLines.length > 0 && (
            <>
              <h4 className="mt-5 font-semibold text-forest">Gift receipt <Badge tone="ochre">No GST</Badge></h4>
              <table className="mt-2 w-full tabular">
                <tbody>{giftLines.map(i => <tr key={i.key}><td className="py-1 pr-2">{i.name}</td><td className="text-right">{aud(i.amount, true)}</td></tr>)}</tbody>
              </table>
              <p className="mt-2 text-xs text-muted">This receipt does not claim tax-deductibility. Deductible Gift Recipient status to be confirmed. <Flag id="A-20" /></p>
            </>
          )}
          <p className="mt-4 border-t border-stone pt-2 text-base font-semibold">Paid {aud(o.total, true)} <span className="text-xs font-normal text-muted">(demo — no charge)</span></p>
        </Card>
      </div>
    </>
  )
}
