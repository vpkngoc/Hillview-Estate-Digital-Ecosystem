// Typed access to the JSON produced by analytics/run_all.py
import catalogueJson from '../data/catalogue.json'
import sessionsJson from '../data/sessions.json'
import analyticsJson from '../data/analytics.json'

export type Prices = Record<string, number>
export interface Experience { id: string; name: string; kind: string; duration: string; blurb: string; prices: Prices; capacity: number; assumption?: string; gst: boolean; element?: string }
export interface EventItem { id: string; name: string; date: string; time: string; kind: string; blurb: string; prices: Prices; capacity: number; gst: boolean; membersOnly?: boolean; assumption?: string }
export interface Course { id: string; name: string; days: number; price: number; capacity: number; element: string; dates: string[]; level: string; blurb: string }
export interface SchoolProgramme { id: string; name: string; stage: string; subjects: string[]; price: number; duration: string; ratio: string; outcomes: string[] }
export interface VenuePackage { id: string; name: string; kind: string; from_price: number; peak_price: number; guests: string; unit: string; blurb: string }
export interface Tier { id: string; name: string; price: number; benefits: string[] }
export interface Fund { id: string; name: string; blurb: string }
export type ElementStatus = 'available' | 'in_restoration' | 'restored'
export interface AdoptElement { id: string; zone: string; name: string; unit: string; price: number; units: number; status: ElementStatus; adopted: number }
export interface Assumption { id: string; area: string; item: string; value: string; owner: string; basis: string; confidence: string }
export interface Source { id: string; name: string; url: string }
export interface Session { id: string; ref: string; date: string; time: string; capacity: number; booked: number }

export interface FinanceRef {
  hurdle: number; gdpGrowth: number; priceEscalation: number
  allocation: { item: string; share: number }[]; results: { measure: string; value: string }[]
  breakEven: string; gate: string; platformRisk: string
}

export interface Catalogue {
  gstRate: number; experiences: Experience[]; events: EventItem[]; courses: Course[]; schoolProgrammes: SchoolProgramme[]
  venuePackages: VenuePackage[]; spaces: string[]; membershipTiers: Tier[]; funds: Fund[]; elements: AdoptElement[]
  revenuePlan: Record<string, number>; finance?: FinanceRef; marketing?: { segments: string[]; mediaBudget: number }; assumptions: Assumption[]; sources: Source[]; demoToday: string; simStart: string; simEnd: string
}

export interface ForecastDay { date: string; dow: string; expected: number; lo80: number; hi80: number; schoolHoliday: boolean; publicHoliday: boolean; regionalEvent: string | null; rainChance: number; climTmax: number; guides: number; frontOfHouse: number }
export interface Analytics {
  daily: { date: string; visitors: number; rain: number; tmax: number }[]
  revenueByMonth: ({ month: string; gst: number } & Record<string, number | string>)[]
  funnel: { stage: string; reached: number; conversionFromPrevious: number | null }[]
  cohorts: { cohort: string; size: number; paidPct: number; memberPct: number; donorPct: number }[]
  segments: { segment: string; supporters: number; avgValue: number; avgRecency: number }[]
  forecast: ForecastDay[]
  drivers: { driver: string; multiplier: number; lo: number | null; hi: number | null; note: string }[]
  backtest: { holdoutDays: number; mae: number; mape: number; naiveDowMae: number; series: { date: string; actual: number; predicted: number }[] }
  alpha: number
  kpis: Record<string, number>
  venueUpcoming: { date: string; space: string; kind: string; title: string; status: string }[]
  venuePipeline: { id: string; name: string; package: string; kind: string; eventDate: string; enquired: string; stage: string; value: number }[]
  schoolsRecent: { date: string; school: string; programme: string; students: number; amount: number }[]
  givingByFund: { fund: string; amount: number }[]
  monthlyVisitors: { month: string; visitors: number }[]
}

export type Interaction = [string, string, string, number, Record<string, unknown> | null]
export interface Supporter {
  id: string; first: string; last: string; email: string; town: string; postcode: string; region: string; created: string; tags: string[]
  consents: Record<string, boolean>; member: { tier: string; since: string; expires: string } | null
  stage: string; R: number; F: number; M: number; segment: string; recency: number; value: number; lapseRisk: string | null
  interactions: Interaction[]
}
export interface PathwayParticipant { id: string; name: string; age: number; under18: boolean; guardianConsent: boolean; stage: string; trade: string; start: string; hours: number; competencies: number; employer: string | null; employed6m: boolean }

export const catalogue = catalogueJson as unknown as Catalogue
export const sessions = sessionsJson as unknown as Session[]
export const analytics = analyticsJson as unknown as Analytics
export const DEMO_TODAY = catalogue.demoToday

// Lookup any bookable thing by session.ref
export function productFor(ref: string): { name: string; kind: string; prices: Prices; gst: boolean; membersOnly?: boolean; element?: string; blurb: string } | undefined {
  const x = catalogue.experiences.find(e => e.id === ref)
  if (x) return x
  const ev = catalogue.events.find(e => e.id === ref)
  if (ev) return ev
  const c = catalogue.courses.find(e => e.id === ref)
  if (c) return { name: c.name, kind: 'course', prices: { adult: c.price }, gst: true, element: c.element, blurb: c.blurb }
  return undefined
}

export const elementById = (id: string) => catalogue.elements.find(e => e.id === id)
export const tierById = (id: string) => catalogue.membershipTiers.find(t => t.id === id)
export const fundById = (id: string) => catalogue.funds.find(f => f.id === id)

// Lazy-load the large CRM dataset only in the Console
export const loadSupporters = () => import('../data/supporters.json').then(m => m.default as unknown as Supporter[])
export const loadPathway = () => import('../data/pathway.json').then(m => m.default as unknown as PathwayParticipant[])
