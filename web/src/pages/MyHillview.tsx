import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Download, IdCard, LogOut, Trash2 } from 'lucide-react'
import MockQR from '../components/MockQR'
import { STATUS_META, statusKey } from '../components/EstateMap'
import { Badge, Button, Card, Check, Empty, LinkButton, Notice, PageHeader } from '../components/ui'
import { DEMO_TODAY, elementById, tierById } from '../lib/data'
import { aud, dateLong } from '../lib/format'
import { SARAH, useStore } from '../lib/store'
import { CONSENT_TEXT } from './Checkout'

const STEPS = ['Adopted', 'In restoration', 'Restored'] as const

export default function MyHillview() {
  const { s, dispatch, isMember, interactions, elementView, unread } = useStore()
  const [delReq, setDelReq] = useState(false)
  useEffect(() => { if (unread) { const t = setTimeout(() => dispatch({ type: 'readNotifications' }), 4000); return () => clearTimeout(t) } }, [unread, dispatch])

  if (!s.user) return (
    <>
      <PageHeader eyebrow="My Hillview" title="Your Hillview account" intro="One account for your visits, tickets, membership, gifts and courses." />
      <div className="mx-auto max-w-xl px-4 py-12">
        <Card>
          <h2 className="text-2xl font-semibold text-forest">Sign in</h2>
          <p className="mt-1 text-sm text-muted">Demo: sign-in is simulated. Accounts are created automatically the first time you book or give.</p>
          <Button className="mt-4 w-full" onClick={() => dispatch({ type: 'signIn', user: SARAH })}>Continue as Sarah Mitchell (demo persona, Bowral)</Button>
          <p className="mt-3 text-center text-sm text-muted">or <Link to="/whats-on">book a free visit</Link> to create your own</p>
        </Card>
      </div>
    </>
  )

  const u = s.user
  const tickets = s.orders.flatMap(o => o.items.filter(i => ['ticket', 'grounds', 'course'].includes(i.kind) && (i.date ?? '') >= DEMO_TODAY).map(i => ({ o, i })))
  const zones = new Set(s.adoptions.map(a => elementById(a.elementId)?.zone))
  const badges = [
    s.adoptions.length > 0 && 'First Stone',
    zones.size >= 3 && 'Three Zones',
    s.adoptions.some(a => elementView(a.elementId).status === 'restored') && 'Restorer',
    isMember && 'Founding Friend',
  ].filter(Boolean) as string[]

  const download = () => {
    const blob = new Blob([JSON.stringify({ profile: u, consents: s.consents, consentLog: s.consentLog, membership: s.membership, orders: s.orders, adoptions: s.adoptions, pathway: s.pathwayApp }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'my-hillview-data.json'
    a.click()
  }

  return (
    <>
      <PageHeader eyebrow="My Hillview" title={`Hello, ${u.first}`} intro={<>{u.email} · {u.town || u.postcode} · supporter record <code className="text-leaf">{u.id}</code></>}>
        <button onClick={() => dispatch({ type: 'signOut' })} className="mt-4 inline-flex items-center gap-1 text-sm text-cream/70 hover:text-cream"><LogOut size={14} /> Sign out</button>
      </PageHeader>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* notifications */}
          <Card>
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-forest"><Bell size={20} /> Updates {unread > 0 && <Badge tone="ochre">{unread} new</Badge>}</h2>
            {s.notifications.length === 0 ? <p className="mt-2 text-sm text-muted">When a piece of Hillview you adopted goes into restoration or is finished, you'll see it here first.</p> : (
              <ul className="mt-3 space-y-3">
                {s.notifications.map(n => (
                  <li key={n.id} className={`rounded-lg p-3 text-sm ${n.read ? 'bg-parchment/50' : 'bg-leaf/15 ring-1 ring-leaf-dark/30'}`}>
                    <p className="text-xs text-muted">{dateLong(n.date)}</p>
                    <p className="font-semibold text-forest">{n.title}</p>
                    <p className="mt-1 text-muted">{n.body}</p>
                    {n.elementId && <Link to={`/support?el=${n.elementId}`} className="text-xs">See it on the map →</Link>}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* adopted pieces */}
          <Card>
            <h2 className="text-2xl font-semibold text-forest">My pieces of Hillview</h2>
            {s.adoptions.length === 0 ? <div className="mt-3"><Empty>No adoptions yet. <Link to="/support">Open the map</Link></Empty></div> : (
              <ul className="mt-3 space-y-4">
                {s.adoptions.map(a => {
                  const e = elementById(a.elementId)!
                  const v = elementView(a.elementId)
                  const k = statusKey(v.status, v.adopted, v.units)
                  const step = v.status === 'restored' ? 2 : v.status === 'in_restoration' ? 1 : 0
                  return (
                    <li key={a.id} className="rounded-lg bg-parchment/50 p-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-semibold text-forest">{e.name} <span className="font-normal text-muted">· {a.units} {e.unit}{a.units > 1 ? 's' : ''}</span></p>
                        <span className="rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ background: STATUS_META[k].color }}>{STATUS_META[k].label}</span>
                      </div>
                      <ol className="mt-3 flex items-center gap-2 text-xs">
                        {STEPS.map((st, i) => <li key={st} className="flex flex-1 items-center gap-2"><span className={`h-2 flex-1 rounded-full ${i <= step ? 'bg-leaf-dark' : 'bg-stone'}`} /><span className={i <= step ? 'font-semibold text-forest' : 'text-muted'}>{st}</span></li>)}
                      </ol>
                      {a.dedication && <p className="mt-2 text-xs italic text-muted">“{a.dedication}” · {a.moderation === 'approved' ? 'approved for display' : 'awaiting moderation'}</p>}
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          {/* tickets */}
          <Card>
            <h2 className="text-2xl font-semibold text-forest">Upcoming</h2>
            {tickets.length === 0 ? <p className="mt-2 text-sm text-muted">Nothing booked. <Link to="/whats-on">See what's on</Link></p> : (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {tickets.map(({ o, i }) => (
                  <div key={o.ref + i.key} className="flex gap-3 rounded-lg bg-parchment/50 p-3 text-sm">
                    <MockQR value={`${o.ref}:${i.key}`} size={72} />
                    <div><p className="font-semibold leading-tight">{i.name}</p><p className="text-xs text-muted">{i.date && dateLong(i.date)} · {i.time}</p>{s.checkins.includes(`${o.ref}:${i.key}`) && <Badge tone="green">Checked in</Badge>}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* timeline */}
          <Card>
            <h2 className="text-2xl font-semibold text-forest">Everything in one place</h2>
            <p className="text-xs text-muted">Your single supporter record: the same view the estate team sees (US-01).</p>
            {interactions.length === 0 ? <p className="mt-2 text-sm text-muted">No activity yet.</p> : (
              <ol className="mt-3 border-l-2 border-stone pl-4">
                {[...interactions].reverse().map((r, idx) => (
                  <li key={idx} className="relative pb-3 text-sm">
                    <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-forest" />
                    <span className="text-xs text-muted">{dateLong(r[0])} · {r[1]}</span>
                    <p>{r[2]} {r[3] > 0 && <span className="text-muted">· {aud(r[3], true)}</span>}</p>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className={isMember ? 'bg-forest text-cream ring-forest' : ''}>
            <h2 className="flex items-center gap-2 text-2xl font-semibold"><IdCard size={20} /> Membership</h2>
            {isMember && s.membership ? (
              <>
                <p className="mt-2 font-serif text-3xl">{tierById(s.membership.tier)?.name}</p>
                <p className="text-sm text-cream/80">Friend of Hillview until {dateLong(s.membership.expires)}</p>
                <p className="mt-3 text-xs text-leaf">Priority booking open · 15% off paid experiences</p>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm text-muted">Not a Friend yet.</p>
                <LinkButton to="/friends" className="mt-3">Become a Friend</LinkButton>
              </>
            )}
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-forest">Badges</h2>
            {badges.length ? <div className="mt-2 flex flex-wrap gap-2">{badges.map(b => <Badge key={b} tone="ochre">{b}</Badge>)}</div> : <p className="mt-1 text-sm text-muted">Adopt a piece of Hillview to earn your first.</p>}
          </Card>

          {s.pathwayApp && (
            <Card>
              <h2 className="text-xl font-semibold text-forest">Youth pathway</h2>
              <p className="mt-1 text-sm">{s.pathwayApp.trade} · <Badge tone="slate">{s.pathwayApp.stage}</Badge></p>
              <Link to="/learn?tab=pathway" className="text-xs">View progress →</Link>
            </Card>
          )}

          <Card>
            <h2 className="text-xl font-semibold text-forest">Contact choices</h2>
            <div className="mt-3 space-y-2">
              {Object.keys(CONSENT_TEXT).map(k => <Check key={k} checked={!!s.consents[k]} onChange={v => dispatch({ type: 'setConsent', key: k, value: v, source: 'My Hillview' })}>{CONSENT_TEXT[k]}</Check>)}
            </div>
            {s.consentLog.length > 0 && <p className="mt-3 text-xs text-muted">Last change: {s.consentLog[0].key} → {s.consentLog[0].value ? 'yes' : 'no'} ({s.consentLog[0].source}). Every change is time-stamped.</p>}
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-forest">Your data</h2>
            <div className="mt-3 flex flex-col gap-2">
              <Button variant="secondary" onClick={download}><Download size={16} /> Download my data</Button>
              <Button variant="ghost" disabled={delReq} onClick={() => { setDelReq(true); dispatch({ type: 'audit', action: `Deletion request received from ${u.id}` }) }}><Trash2 size={16} /> {delReq ? 'Deletion requested' : 'Request deletion'}</Button>
              {delReq && <p className="text-xs text-muted">Logged. The privacy officer confirms your identity and responds within 30 days (demo).</p>}
            </div>
            <Notice tone="info"><span className="text-xs">Supports access and correction rights under APP 12 and 13.</span></Notice>
          </Card>
        </div>
      </div>
    </>
  )
}
