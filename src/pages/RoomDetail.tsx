import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Users, Maximize, BedDouble, ShieldCheck, ArrowLeft, Check } from 'lucide-react'
import { useCasa, useRoomType } from '../lib/store'
import { useSEO } from '../lib/seo'
import { AmenityIcon } from '../components/AmenityIcon'
import { Button, ButtonLink, Card, SectionLabel, Stars } from '../components/ui'
import { peso } from '../lib/format'
import { useDraft } from '../lib/booking-draft'
import { toISODate } from '../lib/booking-engine'

function addDays(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return toISODate(d)
}

export default function RoomDetail() {
  const { slug } = useParams()
  const rt = useRoomType(slug)
  const { amenities, reviews } = useCasa()
  const { update } = useDraft()
  const navigate = useNavigate()
  const [active, setActive] = useState(0)
  const [checkIn, setCheckIn] = useState(addDays(3))
  const [checkOut, setCheckOut] = useState(addDays(5))
  const [guests, setGuests] = useState(2)

  useSEO({
    title: rt?.name ?? 'Room',
    description: rt?.description,
    image: rt?.photos[0],
    structuredData: rt && {
      '@context': 'https://schema.org',
      '@type': 'HotelRoom',
      name: rt.name,
      description: rt.description,
      occupancy: { '@type': 'QuantitativeValue', maxValue: rt.maxGuests },
    },
  })

  if (!rt) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-display text-3xl text-ink">Room not found</h1>
        <ButtonLink to="/rooms" className="mt-6">Browse rooms</ButtonLink>
      </div>
    )
  }

  const roomAmenities = amenities.filter((a) => rt.amenityIds.includes(a.id))
  const roomReviews = reviews.filter((r) => r.approved && r.roomTypeId === rt.id)

  const book = () => {
    update({ roomTypeId: rt.id, checkIn, checkOut, guests })
    navigate('/booking')
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <Link to="/rooms" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-clay">
        <ArrowLeft className="h-4 w-4" /> All rooms
      </Link>

      {/* Gallery */}
      <div className="mt-4 grid gap-3 lg:grid-cols-[2fr_1fr]">
        <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-paper-deep lg:aspect-[16/11]">
          <img src={rt.photos[active]} alt={`${rt.name} view ${active + 1}`} className="h-full w-full object-cover" />
        </div>
        <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
          {rt.photos.map((p, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`aspect-square overflow-hidden rounded-xl bg-paper-deep transition lg:aspect-[16/9] ${active === i ? 'ring-2 ring-clay ring-offset-2 ring-offset-paper' : 'opacity-80 hover:opacity-100'}`}
              aria-label={`View photo ${i + 1}`}
            >
              <img src={p} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        {/* Details */}
        <div>
          <SectionLabel>{rt.tagline}</SectionLabel>
          <h1 className="mt-2 font-display text-4xl text-ink lg:text-5xl">{rt.name}</h1>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
            <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" /> Up to {rt.maxGuests} guests</span>
            <span className="inline-flex items-center gap-1.5"><Maximize className="h-4 w-4" /> {rt.sizeSqm} m²</span>
            <span className="inline-flex items-center gap-1.5"><BedDouble className="h-4 w-4" /> {rt.bedType}</span>
          </div>
          <p className="mt-6 text-lg leading-relaxed text-ink-soft">{rt.description}</p>

          <h2 className="mt-10 font-display text-2xl text-ink">In this room</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {roomAmenities.map((a) => (
              <div key={a.id} className="flex items-center gap-2.5 rounded-xl border border-line bg-card px-3.5 py-3 text-sm text-ink">
                <AmenityIcon icon={a.icon} className="h-4 w-4 text-clay" />
                {a.name}
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-line bg-paper-deep p-5">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sage" />
            <div>
              <p className="font-medium text-ink">Flexible cancellation</p>
              <p className="mt-1 text-sm text-ink-soft">{rt.cancellationPolicy}</p>
            </div>
          </div>

          {roomReviews.length > 0 && (
            <>
              <h2 className="mt-10 font-display text-2xl text-ink">What guests say</h2>
              <div className="mt-4 space-y-4">
                {roomReviews.map((r) => (
                  <figure key={r.id} className="rounded-2xl border border-line bg-card p-5">
                    <div className="flex items-center justify-between">
                      <Stars rating={r.rating} />
                      <span className="text-sm text-ink-soft">{r.guestName}</span>
                    </div>
                    <blockquote className="mt-3 font-display text-lg text-ink">“{r.title}”</blockquote>
                    <p className="mt-1.5 text-sm text-ink-soft">{r.body}</p>
                  </figure>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Booking card */}
        <div>
          <Card className="sticky top-24 p-6">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-3xl text-ink">{peso(rt.baseRate)}</span>
              <span className="text-ink-soft">/ night</span>
            </div>
            <p className="mt-1 font-mono text-xs text-ink-soft">
              Weekend {peso(rt.weekendRate)} · Holiday {peso(rt.holidayRate)}
            </p>

            <div className="mt-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="rounded-xl border border-line bg-card px-3 py-2">
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-ink-soft">Check-in</span>
                  <input type="date" value={checkIn} min={toISODate(new Date())} onChange={(e) => setCheckIn(e.target.value)} className="w-full bg-transparent text-sm text-ink focus:outline-none" />
                </label>
                <label className="rounded-xl border border-line bg-card px-3 py-2">
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-ink-soft">Check-out</span>
                  <input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} className="w-full bg-transparent text-sm text-ink focus:outline-none" />
                </label>
              </div>
              <label className="block rounded-xl border border-line bg-card px-3 py-2">
                <span className="block font-mono text-[10px] uppercase tracking-wider text-ink-soft">Guests</span>
                <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full bg-transparent text-sm text-ink focus:outline-none">
                  {Array.from({ length: rt.maxGuests }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                  ))}
                </select>
              </label>
            </div>

            <Button onClick={book} className="mt-5 w-full" size="lg">Reserve this room</Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-soft">
              <Check className="h-3.5 w-3.5 text-sage" /> No payment charged in demo
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
