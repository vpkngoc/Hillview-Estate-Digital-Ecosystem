import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Bell, LayoutDashboard, Menu, ShoppingBag, UserRound, X } from 'lucide-react'
import { useStore } from '../lib/store'
import { cx, Flag, useFlags } from './ui'

const NAV = [
  { to: '/whats-on', label: "What's on" },
  { to: '/learn', label: 'Learn' },
  { to: '/venue', label: 'Venue hire' },
  { to: '/friends', label: 'Friends' },
  { to: '/support', label: 'Adopt-a-Stone' },
  { to: '/impact', label: 'Impact' },
  { to: '/community', label: 'Community' },
  { to: '/press', label: 'Press' },
]

export function DemoBanner() {
  const { dispatch } = useStore()
  const { show, toggle } = useFlags()
  const [arm, setArm] = useState(false)
  useEffect(() => { if (arm) { const t = setTimeout(() => setArm(false), 4000); return () => clearTimeout(t) } }, [arm])
  return (
    <div className="bg-forest-deep text-[12px] text-cream/80">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-1.5">
        <span><strong className="text-leaf">Student concept prototype</strong> · MQBS3010 Team 4E · Not an official product of The King's Foundation · All data and payments are simulated</span>
        <span className="ml-auto flex items-center gap-3">
          <button onClick={toggle} className="underline-offset-2 hover:underline">Review flags: {show ? 'on' : 'off'}</button>
          <button onClick={() => { if (arm) { dispatch({ type: 'reset' }); setArm(false) } else setArm(true) }} className={arm ? 'font-semibold text-ochre-light' : 'underline-offset-2 hover:underline'}>{arm ? 'Click again to reset' : 'Reset demo'}</button>
        </span>
      </div>
    </div>
  )
}

export function Header() {
  const { s, unread } = useStore()
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const basketCount = s.basket.length
  return (
    <header className="sticky top-[env(safe-area-inset-top,0px)] z-40 border-b border-forest/30 bg-forest text-cream">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link to="/" className="no-underline" onClick={() => setOpen(false)}>
          <div className="font-serif text-2xl font-semibold leading-none text-cream">Hillview Estate</div>
          <div className="mt-0.5 whitespace-nowrap text-[10px] uppercase tracking-[0.18em] text-leaf">Sutton Forest<span className="hidden sm:inline"> · The King's Foundation Australia</span></div>
        </Link>
        <nav className="ml-4 hidden flex-1 items-center gap-0.5 xl:flex" aria-label="Main">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => cx('whitespace-nowrap rounded px-2 py-1 text-sm no-underline transition', isActive ? 'bg-cream/10 text-cream' : 'text-cream/75 hover:text-cream')}>{n.label}</NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <Link to="/me" className="relative rounded p-2 text-cream/85 hover:bg-cream/10" aria-label="My Hillview">
            {s.user ? <span className="flex items-center gap-1.5 text-sm"><UserRound size={18} /><span className="hidden sm:inline">{s.user.first}</span></span> : <UserRound size={18} />}
            {unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ochre px-1 text-[10px] font-bold"><Bell size={9} className="mr-0.5" />{unread}</span>}
          </Link>
          <Link to="/checkout" className="relative rounded p-2 text-cream/85 hover:bg-cream/10" aria-label={`Basket, ${basketCount} items`}>
            <ShoppingBag size={18} />
            {basketCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-leaf px-1 text-[10px] font-bold text-forest">{basketCount}</span>}
          </Link>
          <Link to="/console" className={cx('ml-1 hidden whitespace-nowrap items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold no-underline ring-1 sm:flex', loc.pathname.startsWith('/console') ? 'bg-leaf text-forest ring-leaf' : 'text-leaf ring-leaf/50 hover:bg-leaf/10')}>
            <LayoutDashboard size={14} /> Estate Console
          </Link>
          <button className="rounded p-2 xl:hidden" onClick={() => setOpen(o => !o)} aria-label="Menu" aria-expanded={open}>{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-cream/10 px-4 pb-4 xl:hidden" aria-label="Mobile">
          {[...NAV, { to: '/console', label: 'Estate Console (staff)' }].map(n => (
            <NavLink key={n.to} to={n.to} onClick={() => setOpen(false)} className="block border-b border-cream/10 py-2.5 text-cream/90 no-underline">{n.label}</NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}

export function Footer() {
  return (
    <footer className="mt-20 bg-forest-deep text-cream/75">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-sm sm:grid-cols-3">
        <div>
          <div className="font-serif text-2xl text-cream">Hillview Estate</div>
          <p className="mt-2">Sutton Forest, Southern Highlands, NSW. A State Heritage-listed former Governors' country residence (1882–1957), held on long-term lease by The King's Foundation Australia.</p>
        </div>
        <div>
          <p className="font-semibold text-cream">Acknowledgement of Country <Flag id="A-23" light /></p>
          <p className="mt-2">We acknowledge the Gundungurra people, Traditional Custodians of the land on which Hillview stands, and pay our respects to Elders past and present.</p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-cream">Hillview Connect</p>
          <p>One platform for visiting, learning and supporting — built as a student concept for MQBS3010 (Macquarie Business School), Team 4E.</p>
          <p><Link to="/privacy" className="text-leaf">Privacy &amp; data use</Link> · <Link to="/console/assumptions" className="text-leaf">Assumptions register</Link></p>
        </div>
      </div>
    </footer>
  )
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
