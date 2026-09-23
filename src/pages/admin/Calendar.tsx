import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { Booking } from '../../types'
import { useCasa } from '../../lib/store'
import { useSEO } from '../../lib/seo'
import { AdminPageHeader } from '../../layouts/AdminLayout'
import { Badge, Button, Card } from '../../components/ui'
import { peso, formatRange, formatDate } from '../../lib/format'
import { bookingStatusLabel, bookingStatusTone } from '../../lib/status'
import { OCCUPYING_STATUSES, parseDate, rangesOverlap, toISODate } from '../../lib/booking-engine'

const DAYS = 14

export default function AdminCalendar() {
  const { rooms, roomTypes, bookings, addons } = useCasa()
  const [offset, setOffset] = useState(0)
  const [selected, setSelected] = useState<Booking | null>(null)
  useSEO({ title: 'Calendar · Admin' })

  const start = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + offset * DAYS)
    d.setHours(0, 0, 0, 0)
    return d
  }, [offset])

  const days = useMemo(
    () => Array.from({ length: DAYS }, (_, i) => {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      return d
    }),
    [start],
  )

  const typeName = (id: string) => roomTypes.find((r) => r.id === id)?.name ?? ''

  const bookingFor = (roomId: string, day: Date) => {
    const iso = toISODate(day)
    const nextIso = toISODate(new Date(day.getTime() + 86400000))
    return bookings.find(
      (b) =>
        b.roomId === roomId &&
        OCCUPYING_STATUSES.includes(b.status) &&
        rangesOverlap(b.checkIn, b.checkOut, iso, nextIso),
    )
  }

  return (
    <div>
      <AdminPageHeader
        title="Booking calendar"
        subtitle={`${formatDate(toISODate(days[0]))} – ${formatDate(toISODate(days[DAYS - 1]))}`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setOffset((o) => o - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => setOffset(0)}>Today</Button>
            <Button variant="outline" size="sm" onClick={() => setOffset((o) => o + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        }
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[840px]">
            {/* header row */}
            <div className="grid border-b border-line bg-paper-deep/50" style={{ gridTemplateColumns: `120px repeat(${DAYS}, 1fr)` }}>
              <div className="px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-ink-soft">Room</div>
              {days.map((d) => {
                const weekend = d.getDay() === 0 || d.getDay() === 6
                return (
                  <div key={d.toISOString()} className={`px-1 py-2 text-center text-[11px] ${weekend ? 'text-clay' : 'text-ink-soft'}`}>
                    <div className="font-mono uppercase">{d.toLocaleDateString('en-PH', { weekday: 'short' }).slice(0, 2)}</div>
                    <div className="font-medium text-ink">{d.getDate()}</div>
                  </div>
                )
              })}
            </div>

            {rooms.map((room) => (
              <div key={room.id} className="grid border-b border-line" style={{ gridTemplateColumns: `120px repeat(${DAYS}, 1fr)` }}>
                <div className="px-3 py-2.5">
                  <p className="text-sm font-medium text-ink">Rm {room.number}</p>
                  <p className="text-[11px] text-ink-soft">{typeName(room.roomTypeId)}</p>
                </div>
                {days.map((d) => {
                  const blocked = ['maintenance', 'out_of_service'].includes(room.status)
                  const b = bookingFor(room.id, d)
                  const isStart = b && b.checkIn === toISODate(d)
                  return (
                    <div key={d.toISOString()} className="border-l border-line/70 p-1">
                      {blocked ? (
                        <div className="h-8 rounded bg-[repeating-linear-gradient(45deg,#e2d7c2,#e2d7c2_4px,transparent_4px,transparent_8px)]" title="Blocked" />
                      ) : b ? (
                        <button
                          onClick={() => setSelected(b)}
                          className={`h-8 w-full rounded px-1 text-left text-[10px] font-medium text-white transition hover:opacity-90 ${
                            b.status === 'checked_in' ? 'bg-clay' : b.status === 'pending' ? 'bg-gold' : 'bg-sage'
                          }`}
                          title={`${b.guestName} · ${b.reference}`}
                        >
                          {isStart && <span className="line-clamp-1">{b.guestName.split(' ')[0]}</span>}
                        </button>
                      ) : (
                        <div className="h-8" />
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-ink-soft">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-sage" /> Confirmed</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-clay" /> Checked in</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-gold" /> Pending</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-[repeating-linear-gradient(45deg,#c9b597,#c9b597_2px,transparent_2px,transparent_4px)]" /> Blocked</span>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-2xl animate-fade-up">
            <div className="flex items-start justify-between">
              <div>
                <Badge tone={bookingStatusTone[selected.status]}>{bookingStatusLabel[selected.status]}</Badge>
                <h3 className="mt-2 font-display text-2xl text-ink">{selected.guestName}</h3>
                <p className="font-mono text-sm text-ink-soft">{selected.reference}</p>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Close"><X className="h-5 w-5 text-ink-soft hover:text-ink" /></button>
            </div>
            <dl className="mt-5 space-y-2 text-sm">
              <Row label="Room" value={`${typeName(selected.roomTypeId)} · Rm ${rooms.find((r) => r.id === selected.roomId)?.number ?? '—'}`} />
              <Row label="Dates" value={formatRange(selected.checkIn, selected.checkOut)} />
              <Row label="Guests" value={String(selected.guests)} />
              <Row label="Contact" value={selected.email} />
              {selected.addons.length > 0 && (
                <Row label="Add-ons" value={selected.addons.map((a) => addons.find((x) => x.id === a.addonId)?.name).filter(Boolean).join(', ')} />
              )}
              <Row label="Total" value={peso(selected.total)} />
            </dl>
            {selected.specialRequests && (
              <p className="mt-4 rounded-lg bg-paper-deep px-3 py-2 text-sm text-ink-soft">“{selected.specialRequests}”</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  )
}
