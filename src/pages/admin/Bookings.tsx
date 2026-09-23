import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { BookingStatus } from '../../types'
import { useCasa } from '../../lib/store'
import { useSEO } from '../../lib/seo'
import { AdminPageHeader } from '../../layouts/AdminLayout'
import { Badge, Card, EmptyState, Input, Select } from '../../components/ui'
import { peso, formatRange } from '../../lib/format'
import { bookingStatusLabel, bookingStatusTone } from '../../lib/status'

const STATUSES: BookingStatus[] = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show']

export default function AdminBookings() {
  const { bookings, roomTypes, rooms, setBookingStatus } = useCasa()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<'all' | BookingStatus>('all')
  useSEO({ title: 'Bookings · Admin' })

  const typeName = (id: string) => roomTypes.find((r) => r.id === id)?.name ?? ''
  const roomNum = (id: string | null) => rooms.find((r) => r.id === id)?.number ?? '—'

  const list = useMemo(
    () =>
      [...bookings]
        .filter((b) => (filter === 'all' ? true : b.status === filter))
        .filter((b) =>
          q ? [b.reference, b.guestName, b.email].join(' ').toLowerCase().includes(q.toLowerCase()) : true,
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [bookings, filter, q],
  )

  return (
    <div>
      <AdminPageHeader title="Bookings" subtitle={`${bookings.length} total`} />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ref, name, email…" className="pl-9" />
        </div>
        <Select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="w-48">
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{bookingStatusLabel[s]}</option>)}
        </Select>
      </div>

      {list.length === 0 ? (
        <EmptyState title="No bookings match" body="Try a different search or filter." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-paper-deep/50 text-left font-mono text-[11px] uppercase tracking-wider text-ink-soft">
                <tr>
                  <th className="px-4 py-3">Ref</th><th className="px-4 py-3">Guest</th>
                  <th className="px-4 py-3">Room</th><th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Guests</th><th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {list.map((b) => (
                  <tr key={b.id} className="align-top hover:bg-paper-deep/40">
                    <td className="px-4 py-3 font-mono text-xs text-ink-soft">{b.reference}</td>
                    <td className="px-4 py-3">
                      <p className="text-ink">{b.guestName}</p>
                      <p className="text-xs text-ink-soft">{b.email}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{typeName(b.roomTypeId)}<br /><span className="text-xs">Rm {roomNum(b.roomId)}</span></td>
                    <td className="px-4 py-3 text-ink-soft">{formatRange(b.checkIn, b.checkOut)}</td>
                    <td className="px-4 py-3 text-ink-soft">{b.guests}</td>
                    <td className="px-4 py-3 text-ink">{peso(b.total)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        <Badge tone={bookingStatusTone[b.status]}>{bookingStatusLabel[b.status]}</Badge>
                        <select
                          value={b.status}
                          onChange={(e) => setBookingStatus(b.id, e.target.value as BookingStatus)}
                          className="rounded-lg border border-line bg-card px-2 py-1 text-xs text-ink focus:border-clay focus:outline-none"
                          aria-label={`Change status for ${b.reference}`}
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{bookingStatusLabel[s]}</option>)}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
