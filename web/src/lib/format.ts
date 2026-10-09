export const aud = (n: number, cents = false) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 }).format(n)

export const num = (n: number) => new Intl.NumberFormat('en-AU').format(Math.round(n))

export const compact = (n: number) =>
  new Intl.NumberFormat('en-AU', { notation: 'compact', maximumFractionDigits: 1 }).format(n)

export const pct = (n: number, dp = 0) => `${n.toFixed(dp)}%`

const parse = (iso: string) => new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''))

export const dateLong = (iso: string) =>
  parse(iso).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
export const dateShort = (iso: string) => parse(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
export const dayName = (iso: string) => parse(iso).toLocaleDateString('en-AU', { weekday: 'short' })
export const monthLabel = (ym: string) => parse(ym + '-01').toLocaleDateString('en-AU', { month: 'short', year: '2-digit' })

export const addDays = (iso: string, n: number) => {
  const d = parse(iso)
  d.setDate(d.getDate() + n)
  // format in local time (toISOString would shift to UTC and lose a day in AEST/AEDT)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export const daysBetween = (a: string, b: string) => Math.round((parse(b).getTime() - parse(a).getTime()) / 86400000)

/** GST component of a GST-inclusive amount (1/11th). */
export const gstOf = (inclusive: number) => Math.round((inclusive / 11) * 100) / 100

export const ref = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`

export const nowIso = () => new Date().toISOString()
