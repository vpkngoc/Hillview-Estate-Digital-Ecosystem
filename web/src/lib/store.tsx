import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { catalogue, DEMO_TODAY, elementById, type ElementStatus, type Interaction } from './data'
import { addDays, gstOf, nowIso, ref } from './format'

/* ------------------------------------------------------------------ types */
export type Role = 'director' | 'development' | 'frontdesk' | 'education' | 'operations'
export const ROLES: Record<Role, string> = {
  director: 'Estate Director',
  development: 'Development Officer',
  frontdesk: 'Front-of-house',
  education: 'Education Coordinator',
  operations: 'Operations Manager',
}

export type ItemKind = 'grounds' | 'ticket' | 'course' | 'membership' | 'donation' | 'adoption'
export interface BasketItem {
  key: string
  kind: ItemKind
  name: string
  sessionId?: string
  productRef?: string
  date?: string
  time?: string
  qty: Record<string, number>
  prices: Record<string, number>
  taxable: boolean
  discountable: boolean
  extra?: Record<string, unknown>
}
export interface PricedItem extends BasketItem { gross: number; discount: number; amount: number; gst: number }
export interface Order {
  ref: string; date: string; items: PricedItem[]; total: number; gst: number; gifts: number; discount: number
  payer: { first: string; last: string; email: string }
}
export interface User { id: string; first: string; last: string; email: string; town: string; postcode: string; created: string; persona?: boolean }
export interface Notification { id: string; date: string; title: string; body: string; elementId?: string; read: boolean }
export interface Lead { id: string; name: string; email: string; package: string; kind: string; eventDate: string; guests: number; budget: string; stage: string; enquired: string; value: number; notes?: string }
export interface SchoolRequest { id: string; teacher: string; school: string; email: string; programme: string; stage: string; students: number; date: string; needs: string; status: string; created: string }
export interface PathwayApp { id: string; first: string; lastInitial: string; age: number; guardianName?: string; guardianConsent?: boolean; trade: string; availability: string; stage: string; created: string }
export interface Adoption { id: string; elementId: string; units: number; dedication: string; date: string; moderation: 'pending' | 'approved' }
export interface AuditEntry { time: string; role: Role; action: string }
export interface ConsentEntry { time: string; key: string; value: boolean; source: string }
export interface JournalPost { id: string; date: string; elementId: string; title: string; body: string }

export interface State {
  user: User | null
  consents: Record<string, boolean>
  consentLog: ConsentEntry[]
  basket: BasketItem[]
  orders: Order[]
  membership: { tier: string; since: string; expires: string } | null
  adoptions: Adoption[]
  elementState: Record<string, { status?: ElementStatus; extraAdopted: number }>
  notifications: Notification[]
  journal: JournalPost[]
  leads: Lead[]
  schoolRequests: SchoolRequest[]
  pathwayApp: PathwayApp | null
  mediaEnquiries: { id: string; name: string; outlet: string; email: string; topic: string; created: string }[]
  feedback: { id: string; name: string; locality: string; topic: string; message: string; created: string }[]
  volunteerSignups: { id: string; role: string; shift: string; created: string }[]
  sessionExtra: Record<string, number>
  role: Role
  audit: AuditEntry[]
  checkins: string[]
  leadStages: Record<string, string>
}

const initial: State = {
  user: null,
  consents: { newsletter: false, events: false, appeals: false, impact: false },
  consentLog: [],
  basket: [], orders: [], membership: null, adoptions: [], elementState: {}, notifications: [], journal: [],
  leads: [], schoolRequests: [], pathwayApp: null, mediaEnquiries: [], feedback: [], volunteerSignups: [],
  sessionExtra: {}, role: 'director', audit: [], checkins: [], leadStages: {},
}

export const SARAH: User = {
  id: 'S-DEMO', first: 'Sarah', last: 'Mitchell', email: 'sarah.mitchell@example.com', town: 'Bowral', postcode: '2576',
  created: DEMO_TODAY, persona: true,
}

/* --------------------------------------------------------------- pricing */
export const MEMBER_DISCOUNT = 0.15 // A-09

export function priceItems(items: BasketItem[], isMember: boolean): PricedItem[] {
  const memberInBasket = items.some(i => i.kind === 'membership')
  const disc = isMember || memberInBasket
  return items.map(i => {
    const gross = Object.entries(i.qty).reduce((s, [k, q]) => s + q * (i.prices[k] ?? 0), 0)
    const discount = disc && i.discountable ? Math.round(gross * MEMBER_DISCOUNT * 100) / 100 : 0
    const amount = Math.round((gross - discount) * 100) / 100
    return { ...i, gross, discount, amount, gst: i.taxable ? gstOf(amount) : 0 }
  })
}

/* --------------------------------------------------------------- reducer */
type Action =
  | { type: 'signIn'; user: User }
  | { type: 'signOut' }
  | { type: 'setConsent'; key: string; value: boolean; source: string }
  | { type: 'addItem'; item: BasketItem }
  | { type: 'removeItem'; key: string }
  | { type: 'clearBasket' }
  | { type: 'placeOrder'; order: Order; adoptions: Adoption[]; membership: State['membership'] }
  | { type: 'setElementStatus'; elementId: string; status: ElementStatus; story: string }
  | { type: 'readNotifications' }
  | { type: 'addLead'; lead: Lead }
  | { type: 'moveLead'; id: string; stage: string }
  | { type: 'addSchoolRequest'; req: SchoolRequest }
  | { type: 'setSchoolStatus'; id: string; status: string }
  | { type: 'applyPathway'; app: PathwayApp }
  | { type: 'setPathwayStage'; stage: string }
  | { type: 'addMedia'; item: State['mediaEnquiries'][number] }
  | { type: 'addFeedback'; item: State['feedback'][number] }
  | { type: 'addVolunteer'; item: State['volunteerSignups'][number] }
  | { type: 'setRole'; role: Role }
  | { type: 'audit'; action: string }
  | { type: 'checkin'; key: string }
  | { type: 'approveDedication'; id: string }
  | { type: 'reset' }

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'signIn': return { ...s, user: a.user }
    case 'signOut': return { ...s, user: null }
    case 'setConsent':
      return { ...s, consents: { ...s.consents, [a.key]: a.value }, consentLog: [{ time: nowIso(), key: a.key, value: a.value, source: a.source }, ...s.consentLog] }
    case 'addItem': return { ...s, basket: [...s.basket.filter(b => b.key !== a.item.key), a.item] }
    case 'removeItem': return { ...s, basket: s.basket.filter(b => b.key !== a.key) }
    case 'clearBasket': return { ...s, basket: [] }
    case 'placeOrder': {
      const sessionExtra = { ...s.sessionExtra }
      a.order.items.forEach(i => {
        if (i.sessionId) sessionExtra[i.sessionId] = (sessionExtra[i.sessionId] ?? 0) + Object.values(i.qty).reduce((x, y) => x + y, 0)
      })
      const elementState = { ...s.elementState }
      a.adoptions.forEach(ad => {
        const cur = elementState[ad.elementId] ?? { extraAdopted: 0 }
        elementState[ad.elementId] = { ...cur, extraAdopted: cur.extraAdopted + ad.units }
      })
      return {
        ...s, basket: [], orders: [a.order, ...s.orders], sessionExtra, elementState,
        adoptions: [...a.adoptions, ...s.adoptions], membership: a.membership ?? s.membership,
      }
    }
    case 'setElementStatus': {
      const el = elementById(a.elementId)!
      const cur = s.elementState[a.elementId] ?? { extraAdopted: 0 }
      const mine = s.adoptions.filter(x => x.elementId === a.elementId)
      const label = a.status === 'in_restoration' ? 'is now being restored' : a.status === 'restored' ? 'has been restored' : 'is open for adoption'
      const notifications = mine.length
        ? [{ id: ref('N'), date: DEMO_TODAY, title: `Your ${el.name.toLowerCase()} ${label}`, body: a.story, elementId: el.id, read: false }, ...s.notifications]
        : s.notifications
      return {
        ...s, notifications,
        elementState: { ...s.elementState, [a.elementId]: { ...cur, status: a.status } },
        journal: [{ id: ref('J'), date: DEMO_TODAY, elementId: el.id, title: `${el.name}: ${label}`, body: a.story }, ...s.journal],
        audit: [{ time: nowIso(), role: s.role, action: `Changed status of "${el.name}" to ${a.status} (${mine.length ? 'adopters notified' : 'no local adopters'})` }, ...s.audit],
      }
    }
    case 'readNotifications': return { ...s, notifications: s.notifications.map(n => ({ ...n, read: true })) }
    case 'addLead': return { ...s, leads: [a.lead, ...s.leads] }
    case 'moveLead': return { ...s, leadStages: { ...s.leadStages, [a.id]: a.stage }, leads: s.leads.map(l => l.id === a.id ? { ...l, stage: a.stage } : l) }
    case 'addSchoolRequest': return { ...s, schoolRequests: [a.req, ...s.schoolRequests] }
    case 'setSchoolStatus': return { ...s, schoolRequests: s.schoolRequests.map(r => r.id === a.id ? { ...r, status: a.status } : r) }
    case 'applyPathway': return { ...s, pathwayApp: a.app }
    case 'setPathwayStage': return s.pathwayApp ? { ...s, pathwayApp: { ...s.pathwayApp, stage: a.stage } } : s
    case 'addMedia': return { ...s, mediaEnquiries: [a.item, ...s.mediaEnquiries] }
    case 'addFeedback': return { ...s, feedback: [a.item, ...s.feedback] }
    case 'addVolunteer': return { ...s, volunteerSignups: [a.item, ...s.volunteerSignups] }
    case 'setRole': return { ...s, role: a.role, audit: [{ time: nowIso(), role: a.role, action: `Signed in to Console as ${ROLES[a.role]}` }, ...s.audit] }
    case 'audit': return { ...s, audit: [{ time: nowIso(), role: s.role, action: a.action }, ...s.audit].slice(0, 200) }
    case 'checkin': return { ...s, checkins: [...s.checkins, a.key], audit: [{ time: nowIso(), role: s.role, action: `Checked in booking ${a.key}` }, ...s.audit] }
    case 'approveDedication': return { ...s, adoptions: s.adoptions.map(x => x.id === a.id ? { ...x, moderation: 'approved' } : x) }
    case 'reset': return initial
  }
}

/* ------------------------------------------------------------ persistence */
const KEY = 'hillview-connect-demo-v1'
function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...initial, ...JSON.parse(raw) }
  } catch { /* storage unavailable — run in memory */ }
  return initial
}

/* ---------------------------------------------------------------- context */
interface Ctx {
  s: State
  dispatch: (a: Action) => void
  isMember: boolean
  priced: PricedItem[]
  interactions: Interaction[]
  elementView: (id: string) => { status: ElementStatus; adopted: number; units: number }
  unread: number
}
const StoreCtx = createContext<Ctx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, dispatch] = useReducer(reducer, undefined, load)
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* ignore */ }
  }, [s])

  const isMember = !!s.membership && s.membership.expires >= DEMO_TODAY
  const priced = useMemo(() => priceItems(s.basket, isMember), [s.basket, isMember])

  // The demo user's interactions in the same shape as the CRM seed (one supporter record — US-01)
  const interactions = useMemo<Interaction[]>(() => {
    const out: Interaction[] = []
    for (const o of [...s.orders].reverse()) {
      for (const i of o.items) {
        const t = i.kind === 'grounds' ? 'visit' : i.kind === 'ticket' ? (i.productRef?.startsWith('ev-') ? 'event' : i.productRef?.startsWith('taster') ? 'workshop' : 'tour') : i.kind
        out.push([i.date ?? o.date, t, i.name, i.amount, { order: o.ref, ...(i.extra ?? {}) }])
      }
    }
    if (s.pathwayApp) out.push([s.pathwayApp.created, 'pathway', `Pathway application — ${s.pathwayApp.trade}`, 0, { stage: s.pathwayApp.stage }])
    return out
  }, [s.orders, s.pathwayApp])

  const elementView = (id: string) => {
    const base = elementById(id)!
    const st = s.elementState[id]
    return { status: st?.status ?? base.status, adopted: Math.min(base.units, base.adopted + (st?.extraAdopted ?? 0)), units: base.units }
  }

  const value: Ctx = { s, dispatch, isMember, priced, interactions, elementView, unread: s.notifications.filter(n => !n.read).length }
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const c = useContext(StoreCtx)
  if (!c) throw new Error('useStore outside provider')
  return c
}

/* -------------------------------------------------- live totals helpers */
export function liveTotals(s: State) {
  let restoration = 0, giving = 0, revenue = 0, gst = 0, units = 0
  const byStream: Record<string, number> = {}
  const STREAM: Record<string, string> = {
    grounds: 'Grounds', ticket: 'House & garden tours', course: 'Heritage trades courses', membership: 'Membership',
    donation: 'Donations', adoption: 'Adopt-a-Stone',
  }
  for (const o of s.orders) for (const i of o.items) {
    let stream = STREAM[i.kind]
    if (i.kind === 'ticket' && (i.productRef?.startsWith('ev-') || i.productRef?.startsWith('taster'))) stream = 'Workshops & events'
    byStream[stream] = (byStream[stream] ?? 0) + i.amount
    gst += i.gst
    if (i.kind === 'donation' || i.kind === 'adoption') {
      giving += i.amount
      if (i.kind === 'adoption' || i.extra?.fund === 'restoration') restoration += i.amount
      if (i.kind === 'adoption') units += Number(i.extra?.units ?? 0)
    } else revenue += i.amount
  }
  return { restoration, giving, revenue, gst, units, byStream }
}

export const membershipExpiry = (since: string) => addDays(since, 365)
export { catalogue }
