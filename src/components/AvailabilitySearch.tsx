import { useState } from 'react'
import { useNavigate } from 'react-router'
import { CalendarDays, Users, Search } from 'lucide-react'
import { Button } from './ui'
import { toISODate, validateDates } from '../lib/booking-engine'
import { useToast } from './Toast'

function addDays(base: Date, n: number) {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d
}

export function AvailabilitySearch({
  variant = 'panel',
  initial,
}: {
  variant?: 'panel' | 'bar'
  initial?: { checkIn?: string; checkOut?: string; guests?: number }
}) {
  const navigate = useNavigate()
  const toast = useToast()
  const today = new Date()
  const [checkIn, setCheckIn] = useState(initial?.checkIn ?? toISODate(addDays(today, 3)))
  const [checkOut, setCheckOut] = useState(initial?.checkOut ?? toISODate(addDays(today, 5)))
  const [guests, setGuests] = useState(initial?.guests ?? 2)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const v = validateDates(checkIn, checkOut)
    if (!v.valid) {
      toast('error', v.error ?? 'Please check your dates.')
      return
    }
    navigate(`/availability?in=${checkIn}&out=${checkOut}&guests=${guests}`)
  }

  const fieldWrap =
    variant === 'panel'
      ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.7fr_auto]'
      : 'grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.7fr_auto] items-end'

  const cellClass =
    'flex flex-col gap-1 rounded-xl border border-line bg-card px-3.5 py-2.5 focus-within:border-clay focus-within:ring-2 focus-within:ring-clay/20 transition'

  return (
    <form onSubmit={submit} className={fieldWrap} aria-label="Search availability">
      <div className={cellClass}>
        <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
          <CalendarDays className="h-3.5 w-3.5" /> Check-in
        </span>
        <input
          type="date"
          value={checkIn}
          min={toISODate(today)}
          onChange={(e) => setCheckIn(e.target.value)}
          className="bg-transparent text-sm text-ink focus:outline-none"
          aria-label="Check-in date"
        />
      </div>
      <div className={cellClass}>
        <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
          <CalendarDays className="h-3.5 w-3.5" /> Check-out
        </span>
        <input
          type="date"
          value={checkOut}
          min={checkIn}
          onChange={(e) => setCheckOut(e.target.value)}
          className="bg-transparent text-sm text-ink focus:outline-none"
          aria-label="Check-out date"
        />
      </div>
      <div className={cellClass}>
        <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
          <Users className="h-3.5 w-3.5" /> Guests
        </span>
        <select
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="bg-transparent text-sm text-ink focus:outline-none"
          aria-label="Number of guests"
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? 'guest' : 'guests'}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" size="lg" className="h-full">
        <Search className="h-4 w-4" /> Search
      </Button>
    </form>
  )
}
