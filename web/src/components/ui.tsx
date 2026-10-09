import { createContext, useContext, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { catalogue } from '../lib/data'

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')
export { cx }

/* ---- Review flags (placeholder figures awaiting Finance/Marketing/Law) ---- */
const FlagCtx = createContext<{ show: boolean; toggle: () => void }>({ show: true, toggle: () => {} })
export function FlagProvider({ children }: { children: ReactNode }) {
  const [show, set] = useState(() => { try { return localStorage.getItem('hv-flags') !== 'off' } catch { return true } })
  const toggle = () => set(v => { try { localStorage.setItem('hv-flags', v ? 'off' : 'on') } catch { /* */ } return !v })
  return <FlagCtx.Provider value={{ show, toggle }}>{children}</FlagCtx.Provider>
}
export const useFlags = () => useContext(FlagCtx)

export function Flag({ id, light = false }: { id: string; light?: boolean }) {
  const { show } = useFlags()
  if (!show) return null
  const a = catalogue.assumptions.find(x => x.id === id)
  return (
    <Link to="/console/assumptions" title={a ? `${a.item}: ${a.value} — owner: ${a.owner}. ${a.basis}` : id}
      className={cx('inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide align-middle no-underline',
        light ? 'bg-ochre-light/30 text-ochre-light ring-1 ring-ochre-light/50' : 'bg-ochre-light/50 text-ochre ring-1 ring-ochre/30')}>
      <span aria-hidden>⚑</span>{id}
    </Link>
  )
}

/* ---- Buttons ---- */
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'give' | 'light'
const btn: Record<BtnVariant, string> = {
  primary: 'bg-forest text-cream hover:bg-moss',
  secondary: 'bg-transparent text-forest ring-1 ring-forest/40 hover:bg-forest/5',
  ghost: 'bg-transparent text-forest hover:bg-forest/5',
  give: 'bg-ochre text-white hover:bg-[#9c6230]',
  light: 'bg-cream text-forest hover:bg-white',
}
export function Button({ variant = 'primary', className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  return <button {...p} className={cx('inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40', btn[variant], className)} />
}
export function LinkButton({ to, variant = 'primary', className, children }: { to: string; variant?: BtnVariant; className?: string; children: ReactNode }) {
  return <Link to={to} className={cx('inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold no-underline transition', btn[variant], className)}>{children}</Link>
}

/* ---- Surfaces ---- */
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  const hasBg = /(^|\s)bg-/.test(className ?? '')
  return <div className={cx('rounded-xl p-5 ring-1 ring-stone/70 shadow-[0_1px_0_rgba(12,51,20,.04)]', !hasBg && 'bg-white/80', className)}>{children}</div>
}
export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'green' | 'ochre' | 'slate' | 'red' | 'dark'; children: ReactNode }) {
  const t = {
    neutral: 'bg-parchment text-ink/80', green: 'bg-leaf/20 text-leaf-dark', ochre: 'bg-ochre-light/50 text-ochre',
    slate: 'bg-slate/15 text-slate', red: 'bg-alert/10 text-alert', dark: 'bg-forest text-cream',
  }[tone]
  return <span className={cx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', t)}>{children}</span>
}

export function PageHeader({ eyebrow, title, intro, children }: { eyebrow?: string; title: string; intro?: ReactNode; children?: ReactNode }) {
  return (
    <section className="bg-forest text-cream leaf-pattern">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-leaf">{eyebrow}</p>}
        <h1 className="text-4xl font-semibold sm:text-5xl">{title}</h1>
        {intro && <div className="mt-4 max-w-2xl text-base text-cream/85 sm:text-lg">{intro}</div>}
        {children}
      </div>
    </section>
  )
}

export function H2({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cx('text-3xl font-semibold text-forest', className)}>{children}</h2>
}

export function Stat({ label, value, sub, flag }: { label: string; value: ReactNode; sub?: ReactNode; flag?: string }) {
  return (
    <div className="rounded-xl bg-white/80 p-4 ring-1 ring-stone/70">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted">{label} {flag && <Flag id={flag} />}</div>
      <div className="mt-1 font-serif text-3xl font-semibold text-forest tabular">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </div>
  )
}

export function Progress({ value, max, tone = 'leaf' }: { value: number; max: number; tone?: 'leaf' | 'ochre' | 'slate' }) {
  const p = Math.max(0, Math.min(100, (value / Math.max(max, 1)) * 100))
  const c = { leaf: 'bg-leaf-dark', ochre: 'bg-ochre', slate: 'bg-slate' }[tone]
  return <div className="h-2 w-full overflow-hidden rounded-full bg-parchment" role="progressbar" aria-valuenow={Math.round(p)} aria-valuemin={0} aria-valuemax={100}><div className={cx('h-full rounded-full', c)} style={{ width: `${p}%` }} /></div>
}

/* ---- Forms ---- */
export function Field({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  )
}
const inputCls = 'w-full rounded-md border border-stone bg-white px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-forest focus:outline-none'
export const Input = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={cx(inputCls, p.className)} />
export const Select = (p: SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={cx(inputCls, p.className)} />
export const Textarea = (p: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} className={cx(inputCls, p.className)} />

export function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-sm">
      <input type="checkbox" className="mt-1 h-4 w-4 accent-[#0C3314]" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span>{children}</span>
    </label>
  )
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: ReactNode }[]; value: T; onChange: (t: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-stone" role="tablist">
      {tabs.map(t => (
        <button key={t.id} role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)}
          className={cx('-mb-px border-b-2 px-3 py-2 text-sm font-semibold transition', value === t.id ? 'border-forest text-forest' : 'border-transparent text-muted hover:text-forest')}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'warn' | 'ok'; children: ReactNode }) {
  const t = { info: 'bg-slate/10 text-ink ring-slate/30', warn: 'bg-ochre-light/40 text-ink ring-ochre/30', ok: 'bg-leaf/15 text-ink ring-leaf-dark/30' }[tone]
  return <div className={cx('rounded-lg px-4 py-3 text-sm ring-1', t)}>{children}</div>
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-dashed border-stone p-6 text-center text-sm text-muted">{children}</div>
}
