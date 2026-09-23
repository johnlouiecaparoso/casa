import { useCasa } from '../../lib/store'
import { useSEO } from '../../lib/seo'
import { AdminPageHeader } from '../../layouts/AdminLayout'
import { Card } from '../../components/ui'
import { peso } from '../../lib/format'

export default function AdminRates() {
  const { roomTypes } = useCasa()
  useSEO({ title: 'Rates · Admin' })

  return (
    <div>
      <AdminPageHeader title="Rate management" subtitle="Nightly rates are applied automatically based on the stay dates" />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-paper-deep/50 text-left font-mono text-[11px] uppercase tracking-wider text-ink-soft">
              <tr>
                <th className="px-5 py-3">Room type</th>
                <th className="px-5 py-3">Weekday (Sun–Thu)</th>
                <th className="px-5 py-3">Weekend (Fri–Sat)</th>
                <th className="px-5 py-3">Holiday</th>
                <th className="px-5 py-3">Cancellation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {roomTypes.map((rt) => (
                <tr key={rt.id} className="hover:bg-paper-deep/40">
                  <td className="px-5 py-3 font-medium text-ink">{rt.name}</td>
                  <td className="px-5 py-3 text-ink">{peso(rt.baseRate)}</td>
                  <td className="px-5 py-3 text-clay-deep">{peso(rt.weekendRate)}</td>
                  <td className="px-5 py-3 text-clay-deep">{peso(rt.holidayRate)}</td>
                  <td className="px-5 py-3 text-ink-soft">{rt.cancellationHours}h before</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="mt-4 rounded-xl border border-line bg-card p-4 text-sm text-ink-soft">
        The pricing engine is modular: weekend and holiday rules are applied per-night in <code className="font-mono text-xs text-clay-deep">nightlyRate()</code>. New rules (seasonal windows, length-of-stay discounts) can be added without changing the booking flow.
      </p>
    </div>
  )
}
