import { Link, useLocation } from 'react-router'
import { CheckCircle2, Calendar, Users, Mail, Home } from 'lucide-react'
import type { Booking } from '../types'
import { useCasa } from '../lib/store'
import { useSEO } from '../lib/seo'
import { Button, ButtonLink, Card } from '../components/ui'
import { peso, formatRange } from '../lib/format'

export default function Confirmation() {
  const location = useLocation()
  const booking = (location.state as { booking?: Booking } | null)?.booking
  const { roomTypes, addons } = useCasa()
  useSEO({ title: 'Booking confirmed' })

  if (!booking) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <h1 className="font-display text-3xl text-ink">No booking to show</h1>
        <ButtonLink to="/availability" className="mt-6">Start a booking</ButtonLink>
      </div>
    )
  }

  const rt = roomTypes.find((r) => r.id === booking.roomTypeId)
  const addonLines = booking.addons
    .map((a) => ({ addon: addons.find((x) => x.id === a.addonId), quantity: a.quantity }))
    .filter((l) => l.addon)

  return (
    <div className="mx-auto max-w-2xl px-5 py-14 lg:px-8">
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-sage" />
        <h1 className="mt-5 font-display text-4xl text-ink">You’re booked!</h1>
        <p className="mt-2 text-ink-soft">A confirmation has been sent to {booking.email}.</p>
        <p className="mt-4 inline-block rounded-full bg-ink px-5 py-2 font-mono text-sm tracking-wider text-paper">
          {booking.reference}
        </p>
      </div>

      <Card className="mt-8 overflow-hidden">
        {rt && <img src={rt.photos[0]} alt={rt.name} className="aspect-[16/9] w-full object-cover" />}
        <div className="space-y-4 p-6">
          <div>
            <h2 className="font-display text-2xl text-ink">{rt?.name}</h2>
            <p className="text-sm text-ink-soft">{rt?.tagline}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Detail icon={Calendar} label="Dates" value={formatRange(booking.checkIn, booking.checkOut)} />
            <Detail icon={Users} label="Guests" value={`${booking.guests} guests`} />
            <Detail icon={Mail} label="Contact" value={booking.email} />
            <Detail icon={Home} label="Guest" value={booking.guestName} />
          </div>

          {addonLines.length > 0 && (
            <div className="border-t border-line pt-4">
              <p className="font-mono text-xs uppercase tracking-wider text-ink-soft">Add-ons</p>
              <ul className="mt-2 text-sm text-ink">
                {addonLines.map((l) => (
                  <li key={l.addon!.id}>{l.addon!.name}{l.quantity > 1 ? ` ×${l.quantity}` : ''}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-1.5 border-t border-line pt-4 text-sm">
            <Row label="Room" value={peso(booking.nightlyTotal)} />
            {booking.addonsTotal > 0 && <Row label="Add-ons" value={peso(booking.addonsTotal)} />}
            <Row label="Tax" value={peso(booking.tax)} />
            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <span className="font-medium text-ink">Total paid on arrival</span>
              <span className="font-display text-2xl text-ink">{peso(booking.total)}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ButtonLink to="/account/bookings" variant="dark">View my bookings</ButtonLink>
        <ButtonLink to="/" variant="outline">Back home</ButtonLink>
        <Button variant="ghost" onClick={() => window.print()}>Print</Button>
      </div>
    </div>
  )
}

function Detail({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="flex gap-3 rounded-xl bg-paper-deep px-4 py-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
      <div>
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">{label}</p>
        <p className="text-sm text-ink">{value}</p>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-soft">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  )
}
