import { catalogue, type ElementStatus } from '../lib/data'
import { useStore } from '../lib/store'

/** Pin positions on an ILLUSTRATIVE site plan (not surveyed). Layout follows the
 *  published heritage description: serpentine elm/poplar drive climbing to the house,
 *  cedar paddock east & south of the drive, flower garden on the western side,
 *  outbuildings forming a rear courtyard, caretaker's house south of the main house. */
const PINS: Record<string, [number, number]> = {
  roof: [600, 158], 'core-walls': [560, 214], weatherboards: [668, 206], 'return-verandah': [488, 276],
  'verandah-rail': [540, 296], windows: [690, 262], staircase: [612, 246],
  'adc-quarters': [440, 92], stables: [760, 82], cottage: [858, 128], caretaker: [626, 410],
  'elm-drive': [214, 520], cedars: [500, 548], 'rose-garden': [322, 214], 'tile-edging': [236, 160],
  'stone-walls': [150, 318], archways: [318, 444], pergolas: [214, 252], pool: [390, 300], 'iron-gates': [86, 596],
}

export const STATUS_META: Record<ElementStatus | 'full', { label: string; color: string }> = {
  available: { label: 'Open for adoption', color: '#B5733A' },
  full: { label: 'Fully adopted — awaiting works', color: '#0C3314' },
  in_restoration: { label: 'In restoration', color: '#5F7F96' },
  restored: { label: 'Restored', color: '#4E8A1F' },
}

export function statusKey(status: ElementStatus, adopted: number, units: number): ElementStatus | 'full' {
  return status === 'available' && adopted >= units ? 'full' : status
}

const tree = (x: number, y: number, r = 9, fill = '#5E8B4A') => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={fill} opacity={0.9} />
const cedar = (x: number, y: number) => <path key={`c${x}-${y}`} d={`M${x} ${y - 14} L${x + 8} ${y + 6} L${x - 8} ${y + 6} Z`} fill="#3F6B3A" />

export default function EstateMap({ selected, onSelect, compact = false }: { selected?: string; onSelect?: (id: string) => void; compact?: boolean }) {
  const { elementView } = useStore()
  const drive = 'M70 610 C 170 560, 150 500, 250 470 S 380 420, 360 370 S 420 300, 470 300 S 560 330, 620 300'
  return (
    <svg viewBox="0 0 1000 640" className="h-auto w-full rounded-xl" role="img" aria-label="Illustrative site plan of Hillview Estate with adoptable elements">
      <defs>
        <pattern id="grass" width="14" height="14" patternUnits="userSpaceOnUse">
          <rect width="14" height="14" fill="#E4EAD6" /><path d="M2 12 l2 -4 M9 6 l2 -4" stroke="#D2DCBF" strokeWidth="1" />
        </pattern>
        <pattern id="paddock" width="18" height="18" patternUnits="userSpaceOnUse">
          <rect width="18" height="18" fill="#DCE5C9" /><circle cx="4" cy="4" r="1" fill="#C3D1A8" />
        </pattern>
      </defs>
      <rect width="1000" height="640" fill="url(#grass)" />
      {/* views */}
      <text x="960" y="620" textAnchor="end" fontSize="13" fill="#5C665D" fontStyle="italic">Views over Sutton Forest countryside →</text>
      {/* cedar paddock east & south of drive */}
      <path d="M300 520 Q 420 480 700 500 L 720 620 L 260 625 Z" fill="url(#paddock)" stroke="#B9C7A0" />
      {[340, 390, 440, 490, 540, 590, 640, 680].map((x, i) => cedar(x, 560 + (i % 2) * 30))}
      <text x="560" y="612" fontSize="12" fill="#3F6B3A" textAnchor="middle">Himalayan cedar paddock</text>
      {/* western flower garden */}
      <path d="M120 120 L 440 110 L 440 340 L 120 350 Z" fill="#EEF1E2" stroke="#C9D3B4" />
      <text x="130" y="138" fontSize="12" fill="#5C665D">Western flower garden &amp; shrubbery</text>
      {/* tile-edged walkways */}
      <path d="M150 170 H 420 M 280 160 V 335 M 150 280 H 420" stroke="#C98A5B" strokeWidth="3" strokeDasharray="2 3" />
      {/* fan-shaped rose garden */}
      <path d="M322 250 L 280 190 A 60 60 0 0 1 364 190 Z" fill="#E7B9B7" stroke="#B5736F" />
      {[0, 1, 2, 3].map(i => <line key={i} x1="322" y1="250" x2={290 + i * 22} y2={192 - (i === 1 || i === 2 ? 6 : 0)} stroke="#B5736F" />)}
      {/* contemplative pool */}
      <ellipse cx="390" cy="300" rx="32" ry="16" fill="#A9C4D3" stroke="#7E9EB0" />
      {/* pergolas */}
      <rect x="180" y="238" width="70" height="28" fill="none" stroke="#8C6B4A" strokeWidth="3" />
      {[192, 206, 220, 234].map(x => <line key={x} x1={x} y1="238" x2={x} y2="266" stroke="#8C6B4A" strokeWidth="2" />)}
      {/* low stone walls */}
      <path d="M120 330 L 440 320" stroke="#9A9284" strokeWidth="6" strokeLinecap="round" />
      {/* serpentine drive with elms & poplars */}
      <path d={drive} stroke="#D8CDB4" strokeWidth="16" fill="none" strokeLinecap="round" />
      <path d={drive} stroke="#C6B994" strokeWidth="1.5" fill="none" strokeDasharray="6 6" />
      {[[120, 560], [175, 520], [215, 488], [270, 452], [330, 420], [355, 350], [410, 312], [470, 322], [150, 600], [240, 510], [300, 470]].map(([x, y], i) =>
        i % 3 === 2 ? <rect key={i} x={x - 3} y={y - 14} width="6" height="22" rx="3" fill="#6C9455" /> : tree(x, y, 10))}
      {/* stone archways */}
      {[[300, 456], [352, 392]].map(([x, y], i) => <path key={i} d={`M${x - 12} ${y + 8} V ${y - 2} A 12 12 0 0 1 ${x + 12} ${y - 2} V ${y + 8}`} fill="none" stroke="#857C6C" strokeWidth="5" />)}
      {/* entrance gates */}
      <g transform="translate(70 600)"><rect x="-22" y="-6" width="44" height="12" fill="none" stroke="#2B2B2B" strokeWidth="2" /><line x1="0" y1="-6" x2="0" y2="6" stroke="#2B2B2B" strokeWidth="2" /></g>
      <text x="40" y="632" fontSize="11" fill="#5C665D">Entrance gates</text>
      {/* evergreen oak on upper drive */}
      {tree(440, 360, 16, '#4F7A3E')}
      {/* main house */}
      <g>
        <path d="M470 150 H 710 V 290 H 470 Z" fill="#F4EFE4" stroke="#7C7462" strokeWidth="2" />
        <path d="M478 158 H 702 V 282 H 478 Z" fill="#E9E1CF" />
        <path d="M520 180 H 600 V 230 H 560 V 260 H 520 Z" fill="#D6C7AA" stroke="#8C7B5E" />
        <path d="M470 290 H 600 M 470 290 V 200" stroke="#B5733A" strokeWidth="7" opacity="0.55" />
        <text x="640" y="182" fontSize="13" fontWeight={600} fill="#0C3314" textAnchor="middle">Main House</text>
      </g>
      {/* rear courtyard & outbuildings */}
      <path d="M700 60 H 900 V 160 H 700 Z" fill="#EFE9DA" stroke="#C7BC9F" strokeDasharray="4 4" />
      <text x="800" y="155" fontSize="11" fill="#5C665D" textAnchor="middle">Rear courtyard</text>
      <rect x="725" y="62" width="70" height="38" fill="#E2D6BC" stroke="#7C7462" />
      <text x="760" y="56" fontSize="11" fill="#0C3314" textAnchor="middle">Stables</text>
      <rect x="828" y="100" width="56" height="36" fill="#E2D6BC" stroke="#7C7462" />
      <text x="856" y="96" fontSize="11" fill="#0C3314" textAnchor="middle">Cottage (1898)</text>
      <rect x="805" y="66" width="40" height="22" fill="#E2D6BC" stroke="#7C7462" />
      <text x="866" y="80" fontSize="10" fill="#5C665D">Garages</text>
      <rect x="400" y="70" width="80" height="40" fill="#E2D6BC" stroke="#7C7462" />
      <text x="440" y="64" fontSize="11" fill="#0C3314" textAnchor="middle">ADC Quarters</text>
      <rect x="590" y="388" width="70" height="40" fill="#E2D6BC" stroke="#7C7462" />
      <text x="625" y="444" fontSize="11" fill="#0C3314" textAnchor="middle">Caretaker's house</text>
      {/* compass + note */}
      <g transform="translate(950 40)"><path d="M0 -18 L6 6 L0 0 L-6 6 Z" fill="#0C3314" /><text y="22" fontSize="11" textAnchor="middle" fill="#0C3314">N</text></g>
      {!compact && <text x="20" y="24" fontSize="12" fill="#5C665D" fontStyle="italic">Illustrative plan — not to scale. Based on published heritage descriptions.</text>}

      {/* pins */}
      {catalogue.elements.map((e, i) => {
        const [x, y] = PINS[e.id] ?? [0, 0]
        const v = elementView(e.id)
        const k = statusKey(v.status, v.adopted, v.units)
        const sel = selected === e.id
        return (
          <g key={e.id} transform={`translate(${x} ${y})`} className={onSelect ? 'cursor-pointer' : ''}
            onClick={() => onSelect?.(e.id)} role={onSelect ? 'button' : undefined} tabIndex={onSelect ? 0 : -1}
            onKeyDown={ev => { if (ev.key === 'Enter' || ev.key === ' ') onSelect?.(e.id) }}
            aria-label={`${e.name}: ${STATUS_META[k].label}`}>
            {k === 'in_restoration' && <circle r="18" fill={STATUS_META[k].color} opacity="0.25"><animate attributeName="r" values="13;20;13" dur="2.4s" repeatCount="indefinite" /></circle>}
            <circle r={sel ? 15 : 12} fill={STATUS_META[k].color} stroke={sel ? '#7CC242' : '#fff'} strokeWidth={sel ? 4 : 2} />
            <text y="4" textAnchor="middle" fontSize="11" fontWeight={700} fill="#fff">{i + 1}</text>
          </g>
        )
      })}
    </svg>
  )
}

export function MapLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
      {(['available', 'full', 'in_restoration', 'restored'] as const).map(k => (
        <span key={k} className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full" style={{ background: STATUS_META[k].color }} />{STATUS_META[k].label}</span>
      ))}
    </div>
  )
}
