import { Link, useNavigate } from 'react-router'
import { Calendar, LogOut, ArrowRight, Compass } from 'lucide-react'
import { useCasa } from '../lib/store'
import { useSEO } from '../lib/seo'
import { Badge, Button, ButtonLink, Card, EmptyState } from '../components/ui'
import { peso, formatRange } from '../lib/format'
import { bookingStatusLabel, bookingStatusTone } from '../lib/status'
import { parseDate } from '../lib/booking-engine'

export default function Account() {
  const { user, bookings, roomTypes, logout, loginDemo } = useCasa()
  const navigate = useNavigate()
  useSEO({ title: 'My account' })

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <h1 className="font-display text-3xl text-ink">Sign in to view your account</h1>
        <div className="mt-6 flex justify-center gap-3">
          <ButtonLink to="/login">Sign in</ButtonLink>
          <Button variant="outline" onClick={() => { loginDemo('customer'); navigate('/account') }}>
            <Compass className="h-4 w-4" /> Explore as demo guest
          </Button>
        </div>
      </div>
    )
  }

  const mine = bookings.filter((b) => b.userId === user.id || b.email === user.email)
  const now = new Date()
  const upcoming = mine
    .filter((b) => parseDate(b.checkOut) >= now && b.status !== 'cancelled')
    .sort((a, b) => parseDate(a.checkIn).getTime() - parseDate(b.checkIn).getTime())
  const next = upcoming[0]
  const rtOf = (id: string) => roomTypes.find((r) => r.id === id)

  return (
    <div className="mx-auto max-w-5xl px-5 py-14 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-clay">Welcome back</p>
          <h1 className="mt-1 font-display text-4xl text-ink">{user.name}</h1>
          <p className="text-ink-soft">{user.email}</p>
        </div>
        <Button variant="ghost" onClick={() => { logout(); navigate('/') }}><LogOut className="h-4 w-4" /> Sign out</Button>
      </div>

      <h2 className="mt-10 font-display text-2xl text-ink">Your next stay</h2>
      {next ? (
        <Card className="mt-4 overflow-hidden lg:grid lg:grid-cols-[280px_1fr]">
          <div className="aspect-[16/10] bg-paper-deep lg:aspect-auto">
            <img src={rtOf(next.roomTypeId)?.photos[0]} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <Badge tone={bookingStatusTone[next.status]}>{bookingStatusLabel[next.status]}</Badge>
              <span className="font-mono text-sm text-ink-soft">{next.reference}</span>
            </div>
            <h3 className="mt-3 font-display text-2xl text-ink">{rtOf(next.roomTypeId)?.name}</h3>
            <p className="mt-1 flex items-center gap-2 text-ink-soft"><Calendar className="h-4 w-4" /> {formatRange(next.checkIn, next.checkOut)} · {next.guests} guests</p>
            <p className="mt-4 font-display text-xl text-ink">{peso(next.total)}</p>
            <ButtonLink to="/account/bookings" className="mt-5" variant="outline" size="sm">Manage booking <ArrowRight className="h-4 w-4" /></ButtonLink>
          </div>
        </Card>
      ) : (
        <EmptyState
          title="No upcoming stays"
          body="Your next escape is one search away."
          action={<ButtonLink to="/availability">Check availability</ButtonLink>}
        />
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { n: mine.length, l: 'Total bookings' },
          { n: upcoming.length, l: 'Upcoming' },
          { n: mine.filter((b) => b.status === 'checked_out').length, l: 'Completed stays' },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-line bg-card p-6">
            <p className="font-display text-4xl text-clay">{s.n}</p>
            <p className="mt-1 text-sm text-ink-soft">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Link to="/account/bookings" className="inline-flex items-center gap-1 font-medium text-clay hover:gap-2 transition-all">
          View all bookings & leave reviews <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
