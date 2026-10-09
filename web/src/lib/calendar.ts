import { analytics } from './data'
import type { State } from './store'

export interface Block { date: string; space: string; kind: string; title: string; status: string; source: 'seed' | 'local' }

/** One shared estate calendar (US-11): venue hire, school groups and public events
 *  all block the same spaces, so nothing is double-booked. */
export function sharedCalendar(s: State): Block[] {
  const seed: Block[] = analytics.venueUpcoming.map(b => ({ ...b, source: 'seed' as const }))
  const leads: Block[] = s.leads.filter(l => ['Deposit paid', 'Confirmed'].includes(l.stage)).map(l => ({
    date: l.eventDate, space: l.kind === 'Wedding' ? 'Main House' : l.kind === 'Corporate' ? 'Main House' : 'Gardens & Lawn',
    kind: l.kind, title: `${l.kind}: ${l.name}`, status: l.stage, source: 'local' as const,
  }))
  const schools: Block[] = s.schoolRequests.filter(r => r.status === 'Confirmed').map(r => ({
    date: r.date, space: 'Stables Courtyard', kind: 'School group', title: `${r.school} (${r.students} students)`, status: 'Confirmed', source: 'local' as const,
  }))
  return [...seed, ...leads, ...schools].sort((a, b) => a.date.localeCompare(b.date))
}

export function clashes(blocks: Block[]) {
  const m = new Map<string, Block[]>()
  blocks.forEach(b => { const k = `${b.date}|${b.space}`; m.set(k, [...(m.get(k) ?? []), b]) })
  return [...m.values()].filter(v => v.length > 1)
}
