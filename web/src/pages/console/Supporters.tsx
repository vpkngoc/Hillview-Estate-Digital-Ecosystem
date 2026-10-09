import { useEffect, useMemo, useState } from 'react'
import { Download, Search, X } from 'lucide-react'
import { Badge, Button, Card, Input, Notice, Select } from '../../components/ui'
import { loadSupporters, tierById, type Supporter } from '../../lib/data'
import { aud, dateLong, num } from '../../lib/format'
import { useStore } from '../../lib/store'

const PAGE = 25
const GIFT = new Set(['donation', 'adoption'])

function Detail({ p, masked, onClose }: { p: Supporter; masked: boolean; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <aside className="h-full w-full max-w-lg overflow-y-auto bg-cream p-6 shadow-xl" onClick={e => e.stopPropagation()} aria-label="Supporter detail">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted">{p.id} {p.id === 'S-DEMO' && <Badge tone="green">live demo user</Badge>}</p>
            <h3 className="text-3xl font-semibold text-forest">{p.first} {p.last}</h3>
            <p className="text-sm text-muted">{masked ? '•••@•••' : p.email} · {p.town} {p.postcode} · first seen {dateLong(p.created)}</p>
          </div>
          <button onClick={onClose} aria-label="Close"><X /></button>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <Badge tone="dark">{p.stage}</Badge>
          {!masked && <Badge tone="ochre">{p.segment}</Badge>}
          {p.member && <Badge tone="green">{tierById(p.member.tier)?.name} until {dateLong(p.member.expires)}</Badge>}
          {p.lapseRisk && p.lapseRisk !== 'Low' && <Badge tone="red">Lapse risk: {p.lapseRisk}</Badge>}
          {p.tags.map(t => <Badge key={t}>{t}</Badge>)}
        </div>
        {!masked && (
          <div className="mt-4 grid grid-cols-4 gap-2 text-center text-sm">
            {[['R', p.R], ['F', p.F], ['M', p.M], ['Value', aud(p.value)]].map(([k, v]) => <div key={k} className="rounded-md bg-white p-2 ring-1 ring-stone"><div className="text-xs text-muted">{k}</div><div className="font-semibold tabular">{v}</div></div>)}
          </div>
        )}
        <h4 className="mt-6 font-semibold text-forest">Contact consents</h4>
        <div className="mt-1 flex flex-wrap gap-1.5 text-xs">{Object.entries(p.consents).map(([k, v]) => <Badge key={k} tone={v ? 'green' : 'neutral'}>{k}: {v ? 'yes' : 'no'}</Badge>)}</div>
        <h4 className="mt-6 font-semibold text-forest">Every interaction ({p.interactions.length})</h4>
        <ol className="mt-2 border-l-2 border-stone pl-4">
          {[...p.interactions].reverse().map((r, i) => (
            <li key={i} className="relative pb-2.5 text-sm">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full" style={{ background: GIFT.has(r[1]) ? '#B5733A' : '#2F5A2E' }} />
              <span className="text-xs text-muted">{dateLong(r[0])} · {r[1]}</span>
              <p>{r[2]}{r[3] > 0 && <span className="text-muted"> · {masked && GIFT.has(r[1]) ? 'amount hidden' : aud(r[3])}</span>}</p>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  )
}

export default function Supporters({ masked }: { masked: boolean }) {
  const { s, dispatch, interactions, isMember } = useStore()
  const [data, setData] = useState<Supporter[] | null>(null)
  const [q, setQ] = useState('')
  const [seg, setSeg] = useState('all')
  const [stage, setStage] = useState('all')
  const [risk, setRisk] = useState('all')
  const [consent, setConsent] = useState('any')
  const [page, setPage] = useState(0)
  const [open, setOpen] = useState<Supporter | null>(null)
  useEffect(() => { loadSupporters().then(setData) }, [])

  const all = useMemo(() => {
    if (!data) return []
    if (!s.user) return data
    const gifts = interactions.filter(r => GIFT.has(r[1])).length
    const paid = interactions.some(r => ['tour', 'event', 'workshop', 'course'].includes(r[1]) && r[3] > 0)
    const me: Supporter = {
      id: 'S-DEMO', first: s.user.first, last: s.user.last, email: s.user.email, town: s.user.town, postcode: s.user.postcode, region: 'Southern Highlands',
      created: s.user.created, tags: ['live demo'], consents: s.consents, member: isMember ? s.membership : null,
      stage: gifts >= 2 ? 'Repeat donor' : gifts === 1 ? 'Donor' : isMember ? 'Friend (member)' : paid ? 'Paid experience' : 'Registered visitor',
      R: 5, F: Math.min(5, 1 + interactions.length), M: 3, segment: 'New & promising', recency: 0,
      value: interactions.reduce((a, r) => a + r[3], 0), lapseRisk: isMember ? 'Low' : null, interactions,
    }
    return [me, ...data]
  }, [data, s.user, s.consents, s.membership, interactions, isMember])

  const segs = useMemo(() => [...new Set(all.map(x => x.segment))].sort(), [all])
  const stages = ['Registered visitor', 'Paid experience', 'Friend (member)', 'Donor', 'Repeat donor']
  const filtered = useMemo(() => all.filter(x =>
    (seg === 'all' || x.segment === seg) && (stage === 'all' || x.stage === stage) &&
    (risk === 'all' || x.lapseRisk === risk) && (consent === 'any' || x.consents[consent]) &&
    (!q || `${x.first} ${x.last} ${x.email} ${x.town} ${x.id}`.toLowerCase().includes(q.toLowerCase()))
  ), [all, seg, stage, risk, consent, q])
  const rows = filtered.slice(page * PAGE, page * PAGE + PAGE)

  const exportCsv = () => {
    const ok = filtered.filter(x => x.consents.appeals)
    const csv = ['id,first,last,email,town,segment,stage', ...ok.map(x => [x.id, x.first, x.last, x.email, x.town, x.segment, x.stage].join(','))].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'appeal-list.csv'
    a.click()
    dispatch({ type: 'audit', action: `Exported appeal list: ${ok.length} of ${filtered.length} filtered supporters (only those with appeals consent)` })
  }
  const view = (x: Supporter) => { setOpen(x); dispatch({ type: 'audit', action: `Viewed supporter record ${x.id}${masked ? ' (limited view)' : ''}` }) }

  if (!data) return <Card>Loading supporter records…</Card>
  return (
    <div className="space-y-4">
      {masked && <Notice tone="info">Limited view for front-of-house: gift amounts, value scores and full email addresses are hidden.</Notice>}
      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <label className="relative min-w-[200px] flex-1"><Search size={16} className="absolute left-2.5 top-2.5 text-muted" /><Input className="pl-8" placeholder="Search name, email, town, ID" value={q} onChange={e => { setQ(e.target.value); setPage(0) }} /></label>
          {!masked && <Select className="w-auto" value={seg} onChange={e => { setSeg(e.target.value); setPage(0) }} aria-label="Segment"><option value="all">All segments</option>{segs.map(x => <option key={x}>{x}</option>)}</Select>}
          <Select className="w-auto" value={stage} onChange={e => { setStage(e.target.value); setPage(0) }} aria-label="Loop stage"><option value="all">All loop stages</option>{stages.map(x => <option key={x}>{x}</option>)}</Select>
          {!masked && <Select className="w-auto" value={risk} onChange={e => { setRisk(e.target.value); setPage(0) }} aria-label="Lapse risk"><option value="all">Any lapse risk</option>{['High', 'Medium', 'Low', 'Lapsed'].map(x => <option key={x}>{x}</option>)}</Select>}
          <Select className="w-auto" value={consent} onChange={e => { setConsent(e.target.value); setPage(0) }} aria-label="Consent"><option value="any">Any consent</option>{['newsletter', 'events', 'appeals', 'impact'].map(x => <option key={x} value={x}>Consented: {x}</option>)}</Select>
          {!masked && <Button variant="secondary" onClick={exportCsv}><Download size={16} />Export appeal list</Button>}
        </div>
        <p className="mt-3 text-sm text-muted">{num(filtered.length)} supporters · exports include only people who opted in to appeals</p>
      </Card>
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-parchment/60 text-xs uppercase tracking-wide text-muted">
            <tr><th className="px-4 py-2">Supporter</th><th>Town</th><th>Loop stage</th>{!masked && <th>Segment</th>}<th className="text-right">Interactions</th>{!masked && <th className="pr-4 text-right">Value</th>}<th className="pr-4">Flags</th></tr>
          </thead>
          <tbody>
            {rows.map(x => (
              <tr key={x.id} onClick={() => view(x)} className={`cursor-pointer border-t border-stone/60 hover:bg-white ${x.id === 'S-DEMO' ? 'bg-leaf/10' : ''}`}>
                <td className="px-4 py-2"><span className="font-semibold text-forest">{x.first} {x.last}</span><span className="block text-xs text-muted">{x.id}</span></td>
                <td>{x.town}</td><td>{x.stage}</td>{!masked && <td>{x.segment}</td>}
                <td className="text-right tabular">{x.interactions.length}</td>{!masked && <td className="pr-4 text-right tabular">{aud(x.value)}</td>}
                <td className="pr-4">{x.member && <Badge tone="green">Friend</Badge>} {!masked && x.lapseRisk === 'High' && <Badge tone="red">lapse</Badge>} {x.tags.slice(0, 1).map(t => <Badge key={t}>{t}</Badge>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-stone px-4 py-2 text-sm">
          <span className="text-muted">Page {page + 1} of {Math.max(1, Math.ceil(filtered.length / PAGE))}</span>
          <span className="flex gap-2"><Button variant="ghost" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button><Button variant="ghost" disabled={(page + 1) * PAGE >= filtered.length} onClick={() => setPage(p => p + 1)}>Next</Button></span>
        </div>
      </Card>
      {open && <Detail p={open} masked={masked} onClose={() => setOpen(null)} />}
    </div>
  )
}
