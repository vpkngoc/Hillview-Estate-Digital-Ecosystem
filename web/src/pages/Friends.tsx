import { useNavigate } from 'react-router-dom'
import { Check as CheckIcon, X } from 'lucide-react'
import { Button, Card, Flag, H2, Notice, PageHeader, cx } from '../components/ui'
import { catalogue, tierById } from '../lib/data'
import { aud, dateLong } from '../lib/format'
import { useStore } from '../lib/store'

export default function Friends() {
  const { dispatch, isMember, s } = useStore()
  const nav = useNavigate()
  const join = (id: string) => {
    const t = tierById(id)!
    s.basket.filter(b => b.kind === 'membership').forEach(b => dispatch({ type: 'removeItem', key: b.key }))
    dispatch({ type: 'addItem', item: { key: `membership-${id}`, kind: 'membership', name: `Friends of Hillview — ${t.name}`, qty: { year: 1 }, prices: { year: t.price }, taxable: true, discountable: false, extra: { tier: id } } })
    nav('/checkout')
  }
  return (
    <>
      <PageHeader eyebrow="Membership" title="Friends of Hillview" intro={<>An annual membership for people who want to keep coming back and help the restoration as they do. <Flag id="A-08" light /> <Flag id="A-09" light /></>} />
      <div className="mx-auto max-w-6xl px-4 py-10">
        {isMember && s.membership && <Notice tone="ok">You're a <strong>{tierById(s.membership.tier)?.name}</strong> until {dateLong(s.membership.expires)}. Thank you.</Notice>}
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {catalogue.membershipTiers.map((t, i) => (
            <Card key={t.id} className={cx('flex flex-col', i === 1 && 'ring-2 ring-forest')}>
              {i === 1 && <span className="mb-2 self-start rounded-full bg-forest px-2 py-0.5 text-[11px] font-semibold text-cream">Most popular</span>}
              <h3 className="text-2xl font-semibold text-forest">{t.name}</h3>
              <p className="mt-1 font-serif text-4xl font-semibold text-forest tabular">{aud(t.price)}<span className="font-sans text-sm font-normal text-muted"> / year</span></p>
              <ul className="mt-4 flex-1 space-y-2 text-sm">
                {t.benefits.map(b => <li key={b} className="flex gap-2"><CheckIcon size={16} className="mt-0.5 shrink-0 text-leaf-dark" />{b}</li>)}
              </ul>
              <Button className="mt-5" variant={i === 1 ? 'primary' : 'secondary'} onClick={() => join(t.id)} disabled={isMember}>{isMember ? 'Already a Friend' : 'Join'}</Button>
            </Card>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">Prices include GST. Membership is treated as a taxable supply because it comes with benefits. <Flag id="A-19" /></p>

        <section className="mt-14 grid gap-6 md:grid-cols-2">
          <Card>
            <H2 className="text-2xl">What Friends get</H2>
            <ul className="mt-3 space-y-2 text-sm">
              {['Book tours, workshops and courses 14 days before public release', '15% off paid tours, workshops, courses and events', 'Members-only preview evenings (included)', 'Restoration newsletter and impact updates'].map(x => <li key={x} className="flex gap-2"><CheckIcon size={16} className="mt-0.5 text-leaf-dark" />{x}</li>)}
            </ul>
          </Card>
          <Card>
            <H2 className="text-2xl">What stays paid, and why</H2>
            <ul className="mt-3 space-y-2 text-sm">
              {['Tickets to public festivals and events are discounted, not free', 'Venue hire and accommodation are not discounted'].map(x => <li key={x} className="flex gap-2"><X size={16} className="mt-0.5 text-alert" />{x}</li>)}
            </ul>
            <p className="mt-3 text-sm text-muted">Every ticket funds the restoration. Keeping paid events paid means membership grows the estate's income instead of replacing it.</p>
          </Card>
        </section>
      </div>
    </>
  )
}
