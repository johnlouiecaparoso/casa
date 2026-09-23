import { useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Users, Maximize, BedDouble, Check } from 'lucide-react'
import { useCasa } from '../lib/store'
import { useSEO } from '../lib/seo'
import { AvailabilitySearch } from '../components/AvailabilitySearch'
import { Badge, Button, Card, EmptyState, SectionLabel } from '../components/ui'
import { peso, formatRange } from '../lib/format'
import { nightsBetween, searchAvailability, toISODate, validateDates } from '../lib/booking-engine'
import { useDraft } from '../lib/booking-draft'

export default function Availability() {
  const [params] = useSearchParams()
  const { roomTypes, rooms, bookings } = useCasa()
  const { update } = useDraft()
  const navigate = useNavigate()
  useSEO({ title: 'Check Availability', description: 'Search available rooms at Casa for your dates.' })

  const checkIn = params.get('in') ?? ''
  const checkOut = params.get('out') ?? ''
  const guests = Number(params.get('guests') ?? 2)
  const hasSearch = Boolean(checkIn && checkOut)
  const validation = hasSearch ? validateDates(checkIn, checkOut) : { valid: false }
  const nights = hasSearch && validation.valid ? nightsBetween(checkIn, checkOut) : 0

  const results = useMemo(
    () => (validation.valid ? searchAvailability(checkIn, checkOut, guests, roomTypes, rooms, bookings) : []),
    [checkIn, checkOut, guests, roomTypes, rooms, bookings, validation.valid],
  )

  const select = (roomTypeId: string) => {
    update({ roomTypeId, checkIn, checkOut, guests })
    navigate('/booking')
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-14 lg:px-8">
      <SectionLabel>Find your stay</SectionLabel>
      <h1 className="mt-2 font-display text-4xl text-ink lg:text-5xl">Check availability</h1>

      <Card className="mt-6 p-4 sm:p-5">
        <AvailabilitySearch initial={{ checkIn: checkIn || undefined, checkOut: checkOut || undefined, guests }} />
      </Card>

      {hasSearch && !validation.valid && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {validation.error}
        </p>
      )}

      {validation.valid && (
        <>
          <p className="mt-8 text-sm text-ink-soft">
            Showing availability for <span className="font-medium text-ink">{formatRange(checkIn, checkOut)}</span> ·{' '}
            {nights} {nights === 1 ? 'night' : 'nights'} · {guests} {guests === 1 ? 'guest' : 'guests'}
          </p>

          <div className="mt-5 space-y-4">
            {results.map((res) => {
              const rt = res.roomType
              const total = rt.baseRate * nights
              return (
                <Card key={rt.id} className={`overflow-hidden ${res.available ? '' : 'opacity-70'}`}>
                  <div className="grid gap-0 sm:grid-cols-[220px_1fr]">
                    <Link to={`/rooms/${rt.slug}`} className="aspect-[4/3] overflow-hidden bg-paper-deep sm:aspect-auto">
                      <img src={rt.photos[0]} alt={rt.name} loading="lazy" className="h-full w-full object-cover" />
                    </Link>
                    <div className="flex flex-col p-5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <Link to={`/rooms/${rt.slug}`}><h3 className="font-display text-xl text-ink hover:text-clay">{rt.name}</h3></Link>
                          <p className="mt-0.5 text-sm text-ink-soft">{rt.tagline}</p>
                        </div>
                        {res.available ? (
                          <Badge tone="sage">{res.roomsAvailable} available</Badge>
                        ) : (
                          <Badge tone="red">{res.reason}</Badge>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
                        <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {rt.maxGuests}</span>
                        <span className="inline-flex items-center gap-1"><Maximize className="h-3.5 w-3.5" /> {rt.sizeSqm} m²</span>
                        <span className="inline-flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {rt.bedType}</span>
                      </div>
                      <div className="mt-auto flex items-end justify-between pt-4">
                        <div>
                          <p className="font-display text-2xl text-ink">{peso(total)}</p>
                          <p className="font-mono text-xs text-ink-soft">{peso(rt.baseRate)} × {nights} nights (before add-ons & tax)</p>
                        </div>
                        <Button onClick={() => select(rt.id)} disabled={!res.available}>
                          {res.available ? 'Select' : 'Unavailable'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
            {results.every((r) => !r.available) && (
              <EmptyState
                title="No rooms for these dates"
                body="Try adjusting your dates or guest count — our villas book out fast on weekends."
              />
            )}
          </div>
          <p className="mt-6 flex items-center gap-1.5 text-xs text-ink-soft">
            <Check className="h-3.5 w-3.5 text-sage" /> Availability is checked against live room inventory and existing bookings.
          </p>
        </>
      )}

      {!hasSearch && (
        <p className="mt-8 text-ink-soft">Pick your dates above to see what’s open. Today is {toISODate(new Date())}.</p>
      )}
    </div>
  )
}
