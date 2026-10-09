import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Hammer, HeartHandshake, Sparkles } from 'lucide-react'
import EstateMap, { MapLegend, STATUS_META, statusKey } from '../components/EstateMap'
import { Badge, Button, Card, Field, Flag, H2, Input, Notice, PageHeader, Progress, Tabs, Textarea, cx } from '../components/ui'
import { catalogue, elementById } from '../lib/data'
import { aud, dateLong, ref } from '../lib/format'
import { JOURNAL_SEED } from '../lib/content'
import { useStore } from '../lib/store'

function ElementPanel({ id }: { id: string }) {
  const { elementView, dispatch } = useStore()
  const nav = useNavigate()
  const e = elementById(id)!
  const v = elementView(id)
  const k = statusKey(v.status, v.adopted, v.units)
  const left = v.units - v.adopted
  const [units, setUnits] = useState(1)
  const [dedication, setDedication] = useState('')
  const courses = catalogue.courses.filter(c => c.element === id)
  const add = (go: boolean) => {
    dispatch({
      type: 'addItem', item: {
        key: ref('ADOPT'), kind: 'adoption', name: `Adopt-a-Stone: ${e.name} (${units} ${e.unit}${units > 1 ? 's' : ''})`,
        qty: { unit: units }, prices: { unit: e.price }, taxable: false, discountable: false,
        extra: { element: e.id, units, dedication: dedication.trim() },
      },
    })
    if (go) nav('/checkout')
  }
  return (
    <Card className="h-full">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{e.zone} · #{catalogue.elements.indexOf(e) + 1}</p>
      <h3 className="mt-1 text-2xl font-semibold leading-tight text-forest">{e.name}</h3>
      <span className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ background: STATUS_META[k].color }}>{STATUS_META[k].label}</span>
      <div className="mt-4 text-sm">
        <div className="mb-1 flex justify-between tabular"><span>{v.adopted} of {v.units} {e.unit}s adopted</span><span>{Math.round((v.adopted / v.units) * 100)}%</span></div>
        <Progress value={v.adopted} max={v.units} tone="ochre" />
      </div>
      {courses.length > 0 && <p className="mt-3 text-xs text-muted"><Hammer size={12} className="mr-1 inline" />Learners work on this in: {courses.map(c => c.name).join(', ')}.</p>}
      {k === 'restored' ? (
        <Notice tone="ok"><span className="text-sm">Restored, with thanks to everyone who adopted a share. Choose another piece to keep the work going.</span></Notice>
      ) : left <= 0 ? (
        <Notice tone="info"><span className="text-sm">Fully adopted. Works will be scheduled and adopters notified.</span></Notice>
      ) : (
        <div className="mt-4 space-y-3">
          <Field label={`How many ${e.unit}s?`} hint={<>{aud(e.price)} per {e.unit} · no GST · <Flag id="A-10" /></>}>
            <Input type="number" min={1} max={Math.min(left, 20)} value={units} onChange={ev => setUnits(Math.max(1, Math.min(left, +ev.target.value)))} />
          </Field>
          <Field label="Dedication (optional)" hint="Up to 80 characters. Shown publicly only after moderation and only if you agree.">
            <Textarea rows={2} maxLength={80} value={dedication} onChange={ev => setDedication(ev.target.value)} placeholder="In memory of… / For the Mitchell family" />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button variant="give" onClick={() => add(true)}>Adopt for {aud(units * e.price)}</Button>
            <Button variant="secondary" onClick={() => add(false)}>Add to basket</Button>
          </div>
        </div>
      )}
    </Card>
  )
}

function GiveForm() {
  const { dispatch } = useStore()
  const nav = useNavigate()
  const [fund, setFund] = useState(catalogue.funds[0].id)
  const [amount, setAmount] = useState(50)
  const [monthly, setMonthly] = useState(false)
  const f = catalogue.funds.find(x => x.id === fund)!
  const add = () => {
    dispatch({
      type: 'addItem', item: {
        key: ref('DON'), kind: 'donation', name: `${monthly ? 'Monthly gift' : 'Gift'} — ${f.name}`, qty: { gift: 1 }, prices: { gift: amount },
        taxable: false, discountable: false, extra: { fund, fundName: f.name, recurring: monthly },
      },
    })
    nav('/checkout')
  }
  return (
    <Card>
      <h3 className="flex items-center gap-2 text-2xl font-semibold text-forest"><HeartHandshake className="text-ochre" /> Give to a fund</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {catalogue.funds.map(x => (
          <button key={x.id} onClick={() => setFund(x.id)} className={cx('rounded-lg p-3 text-left text-sm ring-1 transition', fund === x.id ? 'bg-forest text-cream ring-forest' : 'bg-white ring-stone hover:ring-forest')}>
            <span className="font-semibold">{x.name}</span><span className={cx('mt-1 block text-xs', fund === x.id ? 'text-cream/80' : 'text-muted')}>{x.blurb}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {[25, 50, 100, 250].map(v => <Button key={v} variant={amount === v ? 'primary' : 'secondary'} onClick={() => setAmount(v)}>{aud(v)}</Button>)}
        <Input type="number" min={5} className="w-28" value={amount} onChange={e => setAmount(Math.max(5, +e.target.value))} aria-label="Custom amount" />
        <label className="ml-2 flex items-center gap-2 text-sm"><input type="checkbox" className="accent-[#0C3314]" checked={monthly} onChange={e => setMonthly(e.target.checked)} /> Make it monthly</label>
      </div>
      <Button variant="give" className="mt-4" onClick={add}>Give {aud(amount)}{monthly ? ' a month' : ''}</Button>
      <p className="mt-2 text-xs text-muted">Gifts carry no GST. Receipts do not claim tax-deductibility until DGR status is confirmed. <Flag id="A-20" /></p>
    </Card>
  )
}

export default function Support() {
  const [params] = useSearchParams()
  const [sel, setSel] = useState(params.get('el') ?? 'return-verandah')
  const [tab, setTab] = useState<'map' | 'list'>('map')
  const { elementView, s } = useStore()
  const zones = useMemo(() => [...new Set(catalogue.elements.map(e => e.zone))], [])
  const journal = [...s.journal, ...JOURNAL_SEED]

  return (
    <>
      <PageHeader eyebrow="Support" title="Adopt a piece of Hillview" intro="Every gift is tied to a real part of the house, outbuildings or garden. Choose a piece on the map, and we'll tell you when it goes into restoration and when it's finished." />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Tabs tabs={[{ id: 'map', label: 'Map' }, { id: 'list', label: 'All elements' }]} value={tab} onChange={setTab} />
        {tab === 'map' ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
            <div>
              <EstateMap selected={sel} onSelect={setSel} />
              <div className="mt-3"><MapLegend /></div>
            </div>
            <ElementPanel id={sel} key={sel} />
          </div>
        ) : (
          <div className="mt-6 space-y-8">
            {zones.map(z => {
              const els = catalogue.elements.filter(e => e.zone === z)
              const tot = els.reduce((a, e) => a + e.units, 0)
              const ad = els.reduce((a, e) => a + elementView(e.id).adopted, 0)
              return (
                <section key={z}>
                  <div className="flex items-baseline justify-between"><h2 className="text-2xl font-semibold text-forest">{z}</h2><span className="text-sm text-muted tabular">{Math.round((ad / tot) * 100)}% adopted together</span></div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {els.map(e => {
                      const v = elementView(e.id)
                      const k = statusKey(v.status, v.adopted, v.units)
                      return (
                        <button key={e.id} onClick={() => { setSel(e.id); setTab('map') }} className="rounded-lg bg-white p-3 text-left ring-1 ring-stone hover:ring-forest">
                          <div className="flex items-center justify-between gap-2"><span className="font-semibold text-forest">{e.name}</span><span className="h-3 w-3 shrink-0 rounded-full" style={{ background: STATUS_META[k].color }} title={STATUS_META[k].label} /></div>
                          <div className="mt-1 text-xs text-muted">{aud(e.price)} per {e.unit} · {v.adopted}/{v.units}</div>
                          <div className="mt-2"><Progress value={v.adopted} max={v.units} tone="ochre" /></div>
                        </button>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        )}

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <GiveForm />
          <Card>
            <h3 className="flex items-center gap-2 text-2xl font-semibold text-forest"><Sparkles className="text-leaf-dark" /> Supporter badges</h3>
            <p className="mt-1 text-sm text-muted">Small rewards for giving, shown on your My Hillview page. They are never ranked against other people.</p>
            <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              {[['First Stone', 'Adopt your first piece'], ['Three Zones', 'Adopt in house, outbuildings and garden'], ['Restorer', 'A piece you adopted is restored'], ['Founding Friend', 'Join Friends of Hillview in its first year']].map(([b, d]) => (
                <li key={b} className="rounded-md bg-parchment/70 p-2"><Badge tone="ochre">{b}</Badge><span className="mt-1 block text-xs text-muted">{d}</span></li>
              ))}
            </ul>
          </Card>
        </div>

        <section className="mt-14">
          <H2>Restoration journal</H2>
          <p className="mt-1 text-sm text-muted">Progress notes from the site. Seeded posts are illustrative.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {journal.slice(0, 6).map(j => (
              <Card key={j.id}>
                <p className="text-xs font-semibold uppercase tracking-wide text-ochre">{dateLong(j.date)} · {elementById(j.elementId)?.name}</p>
                <h3 className="mt-1 text-xl font-semibold text-forest">{j.title}</h3>
                <p className="mt-2 text-sm text-muted">{j.body}</p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
