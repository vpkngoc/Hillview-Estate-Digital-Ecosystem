import { ArrowRight, BookOpen, Footprints, HandHeart, Hammer } from 'lucide-react'
import { Link } from 'react-router-dom'
import EstateMap, { MapLegend } from '../components/EstateMap'
import { Card, Flag, H2, LinkButton, Progress } from '../components/ui'
import { analytics, catalogue, DEMO_TODAY, productFor, sessions } from '../lib/data'
import { aud, dateLong, num } from '../lib/format'
import { liveTotals, useStore } from '../lib/store'

export const APPEAL_TARGET = 1_500_000 // A-11 placeholder

function HeroArt() {
  return (
    <svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#0C3314" /><stop offset="1" stopColor="#1E4A22" /></linearGradient>
      </defs>
      <rect width="1200" height="420" fill="url(#sky)" />
      <path d="M0 250 C 200 200, 380 230, 560 210 S 900 170, 1200 220 V 420 H 0 Z" fill="#24552A" opacity=".7" />
      <path d="M0 300 C 240 260, 420 300, 640 270 S 980 250, 1200 290 V 420 H 0 Z" fill="#2F6533" opacity=".85" />
      {/* house silhouette on the hilltop */}
      <g transform="translate(820 196)" fill="#163C1A">
        <path d="M0 40 V 18 L 30 2 L 60 18 V 40 Z" /><path d="M58 40 V 22 L 92 8 L 126 22 V 40 Z" /><rect x="-30" y="28" width="30" height="12" />
        <rect x="18" y="-6" width="5" height="14" /><rect x="96" y="-2" width="5" height="12" />
      </g>
      {/* elm and poplar avenue */}
      {[640, 680, 715, 748, 778, 805].map((x, i) => <g key={x} fill="#183F1C"><rect x={x - 2} y={236 - i * 6} width="4" height="22" /><ellipse cx={x} cy={232 - i * 6} rx={13 - i} ry={17 - i} /></g>)}
      {[660, 730, 792].map((x, i) => <rect key={x} x={x} y={208 - i * 9} width="7" height="44" rx="3.5" fill="#183F1C" />)}
      <path d="M0 350 C 300 320, 520 360, 760 335 S 1050 330, 1200 345 V 420 H 0 Z" fill="#3B7A3A" />
      <path d="M0 395 C 260 375, 600 400, 900 385 S 1120 390, 1200 395 V 420 H 0 Z" fill="#4E8A3F" />
    </svg>
  )
}

export default function Home() {
  const { s } = useStore()
  const live = liveTotals(s)
  const raised = analytics.kpis.restorationRaised + live.restoration
  const upcoming = sessions.filter(x => x.date >= DEMO_TODAY && x.ref !== 'grounds').slice(0, 4)
  const k = analytics.kpis

  return (
    <>
      <section className="relative overflow-hidden text-cream">
        <HeroArt />
        <div className="relative mx-auto max-w-6xl px-4 pb-28 pt-16 sm:pb-36 sm:pt-24">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-leaf">Sutton Forest · Southern Highlands · NSW</p>
          <h1 className="mt-3 max-w-3xl text-5xl font-semibold leading-[1.05] sm:text-6xl">A living classroom for heritage, craft and community</h1>
          <p className="mt-5 max-w-xl text-lg text-cream/85">Sixteen NSW Governors summered at Hillview between 1882 and 1957. The King's Foundation Australia is now restoring it, and every visit, course and gift helps.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton to="/whats-on" variant="light">Plan a free visit <ArrowRight size={16} /></LinkButton>
            <LinkButton to="/support" variant="give">Adopt a piece of Hillview</LinkButton>
          </div>
        </div>
      </section>

      {/* appeal bar */}
      <section className="relative z-10 mx-auto -mt-14 max-w-6xl px-4">
        <Card className="grid gap-4 bg-white sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-serif text-2xl font-semibold text-forest">Stage 1 Restoration Appeal <Flag id="A-11" /></p>
              <p className="text-sm text-muted tabular"><strong className="text-forest">{aud(raised)}</strong> of {aud(APPEAL_TARGET)}</p>
            </div>
            <div className="mt-3"><Progress value={raised} max={APPEAL_TARGET} tone="ochre" /></div>
            <p className="mt-2 text-xs text-muted">{num(k.unitsAdopted + live.units)} pieces of Hillview adopted · {k.elementsRestored} elements restored · {k.elementsInRestoration} in restoration now · <Link to="/impact">See where every dollar goes</Link></p>
          </div>
          <LinkButton to="/support" variant="primary">Give to the appeal</LinkButton>
        </Card>
      </section>

      {/* three ways in */}
      <section className="mx-auto mt-16 max-w-6xl px-4">
        <H2>Three ways to be part of Hillview</H2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {[
            { icon: Footprints, t: 'Visit', d: 'The grounds are free, every day. Add a house tour, a garden walk or a seasonal event when you come.', to: '/whats-on', cta: "See what's on" },
            { icon: BookOpen, t: 'Learn', d: 'School excursions, heritage trades short courses taught on the live restoration, and a paid pathway into skilled work.', to: '/learn', cta: 'Explore learning' },
            { icon: HandHeart, t: 'Support', d: 'Become a Friend of Hillview, or adopt a real stone, post or rose bed and follow it as it is restored.', to: '/support', cta: 'Ways to support' },
          ].map(x => (
            <Card key={x.t} className="flex flex-col">
              <x.icon className="text-leaf-dark" size={28} />
              <h3 className="mt-3 text-2xl font-semibold text-forest">{x.t}</h3>
              <p className="mt-2 flex-1 text-sm text-muted">{x.d}</p>
              <Link to={x.to} className="mt-4 text-sm font-semibold">{x.cta} →</Link>
            </Card>
          ))}
        </div>
      </section>

      {/* the journey */}
      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="rounded-2xl bg-parchment/70 p-6 sm:p-10">
          <H2>Every visit helps restore Hillview</H2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-5">
            {[
              ['Come for free', 'Register a grounds visit in under a minute.'],
              ['Book an experience', 'Tours, workshops and events fund the estate.'],
              ['Become a Friend', 'Priority booking, 15% off and members-only evenings.'],
              ['Adopt a piece', 'Your gift is tied to a real part of the building.'],
              ['See it restored', 'Get the photo and the tradesperson’s story when it’s done.'],
            ].map(([t, d], i) => (
              <li key={t} className="relative rounded-xl bg-white/80 p-4 ring-1 ring-stone/70">
                <span className="font-serif text-3xl font-semibold text-ochre">{i + 1}</span>
                <p className="mt-1 font-semibold text-forest">{t}</p>
                <p className="mt-1 text-xs text-muted">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* what's on next */}
      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="flex items-end justify-between gap-4">
          <H2>Coming up</H2>
          <Link to="/whats-on" className="text-sm font-semibold">Full calendar →</Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {upcoming.map(x => {
            const p = productFor(x.ref)!
            return (
              <Card key={x.id}>
                <p className="text-xs font-semibold uppercase tracking-wide text-ochre">{dateLong(x.date)} · {x.time}</p>
                <p className="mt-2 font-serif text-xl font-semibold leading-tight text-forest">{p.name}</p>
                <p className="mt-2 line-clamp-3 text-sm text-muted">{p.blurb}</p>
              </Card>
            )
          })}
        </div>
      </section>

      {/* adopt teaser */}
      <section className="mx-auto mt-16 grid max-w-6xl items-center gap-8 px-4 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ochre">Adopt-a-Stone</p>
          <H2 className="mt-2">Put your name to a real piece of Hillview</H2>
          <p className="mt-3 text-muted">Twenty parts of the house, outbuildings and garden are on the map, from a $25 terracotta edging tile to the historic iron gates. Watch your piece move from <em>adopted</em> to <em>in restoration</em> to <em>restored</em>.</p>
          <div className="mt-5 flex gap-3"><LinkButton to="/support">Open the map</LinkButton><Flag id="A-10" /></div>
          <div className="mt-4"><MapLegend /></div>
        </div>
        <Link to="/support" aria-label="Open Adopt-a-Stone map"><EstateMap compact /></Link>
      </section>

      {/* history */}
      <section className="mx-auto mt-16 max-w-6xl px-4">
        <Card className="grid gap-6 md:grid-cols-[auto_1fr]">
          <Hammer className="text-ochre" size={32} />
          <div>
            <h3 className="text-2xl font-semibold text-forest">About the estate</h3>
            <p className="mt-2 text-sm text-muted">Built c. 1872–75 as “Prospect”, the house was bought by the NSW Government in 1882 and became the Governors’ country residence until 1957. It is the only Governor’s country residence in Australia to survive intact, and has been on the NSW State Heritage Register since 1999. The King’s Foundation Australia, launched in October 2024, holds a long-term lease and is restoring Hillview as a cultural and educational hub, inspired by Dumfries House in Scotland.</p>
            <p className="mt-2 text-xs text-muted">Sources: NSW State Heritage Register summary; Wingecarribee Shire Council. <Link to="/press">Fact sheet →</Link></p>
          </div>
        </Card>
      </section>
    </>
  )
}
