import { useState } from 'react'
import { Download, FileText, Film, Newspaper } from 'lucide-react'
import { Badge, Button, Card, Field, Input, Notice, PageHeader, Select } from '../components/ui'
import { catalogue, DEMO_TODAY } from '../lib/data'
import { dateLong, ref } from '../lib/format'
import { PRESS_RELEASES } from '../lib/content'
import { useStore } from '../lib/store'

const FACTS: [string, string, string][] = [
  ['Location', 'Sutton Forest, Southern Highlands, NSW (Wingecarribee Shire)', 'SRC-06'],
  ['Built', 'c. 1872–75 as “Prospect” for Charles Richardson', 'SRC-05'],
  ['Vice-regal use', 'Country residence of NSW Governors 1882–1957; used by sixteen Governors', 'SRC-05'],
  ['Significance', 'The only Governor’s country residence in Australia to survive intact', 'SRC-05'],
  ['Heritage listing', 'NSW State Heritage Register, item 442, listed 2 April 1999', 'SRC-05'],
  ['Site', 'About 60 hectares; main house of 38 habitable rooms (c. 940 m²) with ADC Quarters, stables, cottage and caretaker’s house', 'SRC-05'],
  ['Garden', 'Elm and Lombardy poplar carriageway, Himalayan cedar paddock, fan-shaped rose garden; garden layout influenced by Charles Moore', 'SRC-05'],
  ['Custodian', 'The King’s Foundation Australia (launched October 2024) holds a long-term lease; Hillview is its flagship Australian regeneration project', 'SRC-06'],
  ['Model', 'Inspired by the regeneration of Dumfries House, Scotland, headquarters of The King’s Foundation', 'SRC-07'],
]

export default function Press() {
  const { dispatch, s } = useStore()
  const [f, setF] = useState({ name: '', outlet: '', email: '', topic: 'Interview request' })
  const sent = s.mediaEnquiries[0]
  const src = (id: string) => catalogue.sources.find(x => x.id === id)
  return (
    <>
      <PageHeader eyebrow="Media" title="Press room" intro="Verified facts, approved images and a direct line to our media team. Journalists, documentary partners and bloggers welcome." />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <Card>
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-forest"><FileText size={20} /> Fact sheet</h2>
            <p className="mt-1 text-xs text-muted">Every line is sourced. Please verify with the media team before publication.</p>
            <dl className="mt-4 divide-y divide-stone/70 text-sm">
              {FACTS.map(([k, v, sid]) => (
                <div key={k} className="grid gap-1 py-2.5 sm:grid-cols-[160px_1fr]">
                  <dt className="font-semibold text-forest">{k}</dt>
                  <dd>{v} <a href={src(sid)?.url} target="_blank" rel="noreferrer" className="ml-1 text-xs text-muted">[{sid}]</a></dd>
                </div>
              ))}
            </dl>
            <details className="mt-4 text-xs text-muted"><summary className="cursor-pointer font-semibold">Sources</summary>
              <ul className="mt-2 space-y-1">{catalogue.sources.map(x => <li key={x.id}>{x.id}: <a href={x.url} target="_blank" rel="noreferrer">{x.name}</a></li>)}</ul>
            </details>
          </Card>

          <Card>
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-forest"><Newspaper size={20} /> Releases</h2>
            <ul className="mt-3 divide-y divide-stone/70">
              {PRESS_RELEASES.map(r => (
                <li key={r.title} className="py-3 text-sm"><span className="text-xs text-muted">{dateLong(r.date)}</span> <Badge tone="ochre">{r.status}</Badge><p className="mt-1 font-semibold">{r.title}</p></li>
              ))}
            </ul>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <h3 className="flex items-center gap-2 text-xl font-semibold text-forest"><Download size={18} /> Media kit</h3>
              <p className="mt-1 text-sm text-muted">Approved photography of the house and gardens, restoration b-roll, wordmark and usage guidelines.</p>
              <Button variant="secondary" className="mt-3" disabled>Download (placeholder)</Button>
            </Card>
            <Card>
              <h3 className="flex items-center gap-2 text-xl font-semibold text-forest"><Film size={18} /> Documentary partners</h3>
              <p className="mt-1 text-sm text-muted">We're open to a partnered content series that follows the restoration. Request filming access below, including dates and crew size.</p>
            </Card>
          </div>
        </div>

        <Card className="lg:self-start">
          <h3 className="text-xl font-semibold text-forest">Media enquiry</h3>
          {sent ? <Notice tone="ok">Thanks {sent.name}. Your enquiry ({sent.id}) is with the media team.</Notice> : (
            <div className="mt-3 space-y-3">
              <Field label="Name"><Input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></Field>
              <Field label="Outlet"><Input value={f.outlet} onChange={e => setF({ ...f, outlet: e.target.value })} /></Field>
              <Field label="Email"><Input type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></Field>
              <Field label="Topic"><Select value={f.topic} onChange={e => setF({ ...f, topic: e.target.value })}>{['Interview request', 'Filming / documentary access', 'Image request', 'Fact check', 'Other'].map(x => <option key={x}>{x}</option>)}</Select></Field>
              <Button className="w-full" disabled={!f.name || !f.email} onClick={() => dispatch({ type: 'addMedia', item: { id: ref('MED'), ...f, created: DEMO_TODAY } })}>Send</Button>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
