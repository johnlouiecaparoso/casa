import { Link } from 'react-router'
import { ArrowDownLeft, ArrowUpRight, BedDouble, TrendingUp } from 'lucide-react'
import { useCasa } from '../../lib/store'
import { useSEO } from '../../lib/seo'
import { AdminPageHeader } from '../../layouts/AdminLayout'
import { Badge, Card } from '../../components/ui'
import { peso, formatDate } from '../../lib/format'
import { bookingStatusLabel, bookingStatusTone } from '../../lib/status'
import { OCCUPYING_STATUSES, parseDate, rangesOverlap, toISODate } from '../../lib/booking-engine'

export default function Dashboard() {
  const { bookings, rooms, roomTypes } = useCasa()
  useSEO({ title: 'Staff Dashboard' })

  const today = toISODate(new Date())
  const arrivals = bookings.filter((b) => b.checkIn === today && b.status !== 'cancelled')
  const departures = bookings.filter((b) => b.checkOut === today && b.status !== 'cancelled')

  const bookableRooms = rooms.filter((r) => !['maintenance', 'out_of_service'].includes(r.status))
  const occupiedToday = bookings.filter(
    (b) => OCCUPYING_STATUSES.includes(b.status) && rangesOverlap(b.checkIn, b.checkOut, today, toISODate(new Date(Date.now() + 86400000))),
  ).length
  const occupancy = bookableRooms.length ? Math.round((occupiedToday / bookableRooms.length) * 100) : 0

  const revenueToday = [...arrivals, ...bookings.filter((b) => b.createdAt.slice(0, 10) === today)]
    .reduce((s, b) => s + b.total, 0)

  const active = bookings.filter((b) => ['confirmed', 'checked_in'].includes(b.status)).length
  const pending = bookings.filter((b) => b.status === 'pending').length

  const recent = [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6)
  const roomName = (id: string | null) => rooms.find((r) => r.id === id)?.number ?? '—'
  const typeName = (id: string) => roomTypes.find((r) => r.id === id)?.name ?? ''

  const stats = [
    { label: 'Arrivals today', value: arrivals.length, icon: ArrowDownLeft, tone: 'text-sage' },
    { label: 'Departures today', value: departures.length, icon: ArrowUpRight, tone: 'text-clay' },
    { label: 'Occupancy', value: `${occupancy}%`, icon: BedDouble, tone: 'text-ink' },
    { label: 'Revenue today', value: peso(revenueToday), icon: TrendingUp, tone: 'text-gold' },
  ]

  return (
    <div>
      <AdminPageHeader title="Today’s overview" subtitle={formatDate(today, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-ink-soft">{s.label}</span>
                <Icon className={`h-4 w-4 ${s.tone}`} />
              </div>
              <p className="mt-3 font-display text-3xl text-ink">{s.value}</p>
            </Card>
          )
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-ink">Arrivals</h2>
            <Badge tone="sage">{active} active · {pending} pending</Badge>
          </div>
          <ul className="mt-4 divide-y divide-line">
            {arrivals.length === 0 && <li className="py-6 text-center text-sm text-ink-soft">No arrivals scheduled today.</li>}
            {arrivals.map((b) => (
              <li key={b.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{b.guestName}</p>
                  <p className="text-xs text-ink-soft">{typeName(b.roomTypeId)} · Room {roomName(b.roomId)}</p>
                </div>
                <Badge tone={bookingStatusTone[b.status]}>{bookingStatusLabel[b.status]}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-lg text-ink">Departures</h2>
          <ul className="mt-4 divide-y divide-line">
            {departures.length === 0 && <li className="py-6 text-center text-sm text-ink-soft">No departures today.</li>}
            {departures.map((b) => (
              <li key={b.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{b.guestName}</p>
                  <p className="text-xs text-ink-soft">{typeName(b.roomTypeId)} · Room {roomName(b.roomId)}</p>
                </div>
                <span className="text-xs text-ink-soft">out 12:00 NN</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-display text-lg text-ink">Recent bookings</h2>
          <Link to="/admin/bookings" className="text-sm text-clay hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-y border-line bg-paper-deep/50 text-left font-mono text-[11px] uppercase tracking-wider text-ink-soft">
              <tr>
                <th className="px-5 py-2.5">Ref</th><th className="px-5 py-2.5">Guest</th>
                <th className="px-5 py-2.5">Room</th><th className="px-5 py-2.5">Dates</th>
                <th className="px-5 py-2.5">Total</th><th className="px-5 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {recent.map((b) => (
                <tr key={b.id} className="hover:bg-paper-deep/40">
                  <td className="px-5 py-3 font-mono text-xs text-ink-soft">{b.reference}</td>
                  <td className="px-5 py-3 text-ink">{b.guestName}</td>
                  <td className="px-5 py-3 text-ink-soft">{typeName(b.roomTypeId)}</td>
                  <td className="px-5 py-3 text-ink-soft">{formatDate(b.checkIn, { month: 'short', day: 'numeric' })}–{formatDate(b.checkOut, { day: 'numeric' })}</td>
                  <td className="px-5 py-3 text-ink">{peso(b.total)}</td>
                  <td className="px-5 py-3"><Badge tone={bookingStatusTone[b.status]}>{bookingStatusLabel[b.status]}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
