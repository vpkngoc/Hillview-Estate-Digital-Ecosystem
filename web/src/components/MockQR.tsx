/** A deterministic QR-like pattern for demo tickets. NOT a scannable QR code. */
export default function MockQR({ value, size = 96 }: { value: string; size?: number }) {
  let h = 2166136261
  for (const c of value) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) }
  const n = 21
  const cells: [number, number][] = []
  let x = h >>> 0
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5
    const finder = (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7)
    if (!finder && (x >>> 0) % 2 === 0) cells.push([r, c])
  }
  const finder = (ox: number, oy: number) => (
    <g key={`${ox}${oy}`}><rect x={ox} y={oy} width="7" height="7" fill="#0C3314" /><rect x={ox + 1} y={oy + 1} width="5" height="5" fill="#fff" /><rect x={ox + 2} y={oy + 2} width="3" height="3" fill="#0C3314" /></g>
  )
  return (
    <svg width={size} height={size} viewBox={`-1 -1 ${n + 2} ${n + 2}`} role="img" aria-label={`Mock ticket code ${value}`}>
      <rect x="-1" y="-1" width={n + 2} height={n + 2} fill="#fff" />
      {cells.map(([r, c]) => <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#0C3314" />)}
      {finder(0, 0)}{finder(n - 7, 0)}{finder(0, n - 7)}
    </svg>
  )
}
