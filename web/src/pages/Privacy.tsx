import { Card, Notice, PageHeader } from '../components/ui'

const ROWS = [
  ['Bookings & tickets', 'Name, email, postcode, party size', 'Deliver your booking; manage capacity', 'Booking terms (contract)'],
  ['Friends membership', 'As above + tier, renewal date', 'Membership benefits and renewal', 'Contract'],
  ['Gifts & Adopt-a-Stone', 'As above + amount, fund, dedication', 'Receipts, stewardship, impact updates', 'Your gift + your consent for updates'],
  ['Marketing', 'Email + your contact choices', 'Newsletter, events, appeals', 'Opt-in consent (Spam Act 2003)'],
  ['Schools', 'Teacher contact, school, class size, needs at class level', 'Plan the excursion safely', 'Request from the school'],
  ['Youth pathway', 'First name, initial, age band, trade, guardian consent (16–17)', 'Run the pathway; report outcomes in aggregate', 'Application; kept separate from all donor data'],
]

export default function Privacy() {
  return (
    <>
      <PageHeader eyebrow="Privacy by design" title="Privacy & data use" intro="What we collect, why, and how you stay in control. Written to align with the Australian Privacy Principles (Privacy Act 1988)." />
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
        <Notice tone="warn">Draft for the Law & Cybersecurity team to review. This is not legal advice and not a final privacy policy.</Notice>
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead><tr className="border-b border-stone text-xs uppercase tracking-wide text-muted"><th className="py-2">Activity</th><th>What we collect</th><th>Why</th><th>Basis</th></tr></thead>
            <tbody>{ROWS.map(r => <tr key={r[0]} className="border-b border-stone/60 align-top">{r.map((c, i) => <td key={i} className={`py-2 pr-3 ${i === 0 ? 'font-semibold text-forest' : ''}`}>{c}</td>)}</tr>)}</tbody>
          </table>
        </Card>
        <div className="grid gap-4 md:grid-cols-3">
          <Card><h3 className="text-xl font-semibold text-forest">Minimum by default</h3><p className="mt-1 text-sm text-muted">No dates of birth, home addresses or ID numbers unless a service truly needs them. Schools send class numbers, not student names.</p></Card>
          <Card><h3 className="text-xl font-semibold text-forest">Separate domains</h3><p className="mt-1 text-sm text-muted">Pathway (young people) data is stored apart from supporter and fundraising data. Staff see only what their role needs.</p></Card>
          <Card><h3 className="text-xl font-semibold text-forest">You're in control</h3><p className="mt-1 text-sm text-muted">Change contact choices, download your data or request deletion from My Hillview at any time. Every change is logged.</p></Card>
        </div>
      </div>
    </>
  )
}
