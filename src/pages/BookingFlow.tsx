import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Check, ChevronLeft, Minus, Plus, Loader2 } from 'lucide-react'
import { useCasa } from '../lib/store'
import { useSEO } from '../lib/seo'
import { useDraft } from '../lib/booking-draft'
import { Button, Card, Field, Input, Select, Textarea } from '../components/ui'
import { useToast } from '../components/Toast'
import { peso, formatRange } from '../lib/format'
import { addonPricingLabel } from '../lib/status'
import { quotePrice, searchAvailability, validateDates } from '../lib/booking-engine'
import { sendBookingConfirmation } from '../services/notifications'

const STEPS = ['Room', 'Add-ons', 'Details', 'Review'] as const

export default function BookingFlow() {
  const { roomTypes, addons, rooms, bookings, settings, createBooking } = useCasa()
  const { draft, update, updateGuest, setAddon, reset } = useDraft()
  const navigate = useNavigate()
  const toast = useToast()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  useSEO({ title: 'Book your stay' })

  const rt = roomTypes.find((r) => r.id === draft.roomTypeId)

  const quote = useMemo(() => {
    if (!rt || !draft.checkIn || !draft.checkOut) return null
    return quotePrice(rt, draft.checkIn, draft.checkOut, draft.guests, draft.addons, addons, settings.taxRate)
  }, [rt, draft, addons, settings.taxRate])

  // Guard: without dates/room, send to availability.
  if (!rt || !draft.checkIn || !draft.checkOut || !quote) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <h1 className="font-display text-3xl text-ink">Let’s start with your dates</h1>
        <p className="mt-2 text-ink-soft">Choose a room and dates to begin your booking.</p>
        <Button className="mt-6" onClick={() => navigate('/availability')}>Check availability</Button>
      </div>
    )
  }

  const validateDetails = () => {
    const e: Record<string, string> = {}
    if (!draft.guest.name.trim()) e.name = 'Please enter your name.'
    if (!/^\S+@\S+\.\S+$/.test(draft.guest.email)) e.email = 'Enter a valid email.'
    if (draft.guest.phone.trim().length < 7) e.phone = 'Enter a contact number.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => {
    if (step === 2 && !validateDetails()) return
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const confirm = async () => {
    setSubmitting(true)
    // Re-validate dates and re-check availability at the last moment.
    const dv = validateDates(draft.checkIn, draft.checkOut)
    if (!dv.valid) {
      setSubmitting(false)
      toast('error', dv.error ?? 'Please recheck your dates.')
      return
    }
    const avail = searchAvailability(draft.checkIn, draft.checkOut, draft.guests, roomTypes, rooms, bookings)
    const thisRoom = avail.find((a) => a.roomType.id === rt.id)
    if (!thisRoom?.available) {
      setSubmitting(false)
      toast('error', 'This room just sold out for your dates. Please choose another.')
      setStep(0)
      return
    }

    const result = createBooking({
      roomTypeId: rt.id,
      checkIn: draft.checkIn,
      checkOut: draft.checkOut,
      guests: draft.guests,
      guestName: draft.guest.name,
      email: draft.guest.email,
      phone: draft.guest.phone,
      specialRequests: draft.guest.specialRequests || undefined,
      arrivalTime: draft.guest.arrivalTime || undefined,
      travelPurpose: draft.guest.travelPurpose || undefined,
      addons: draft.addons,
      nightlyTotal: quote.nightlyTotal,
      addonsTotal: quote.addonsTotal,
      subtotal: quote.subtotal,
      tax: quote.tax,
      total: quote.total,
    })

    if (!result.ok) {
      setSubmitting(false)
      toast('error', result.error)
      setStep(0)
      return
    }
    await sendBookingConfirmation(result.booking, rt.name)
    reset()
    setSubmitting(false)
    navigate('/booking/confirmation', { state: { booking: result.booking } })
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
      {/* Stepper */}
      <ol className="flex items-center gap-2 text-sm">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                i < step ? 'bg-sage text-white' : i === step ? 'bg-clay text-white' : 'bg-paper-deep text-ink-soft'
              }`}
            >
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={i === step ? 'font-medium text-ink' : 'text-ink-soft'}>{label}</span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-line sm:w-10" />}
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div>
          {step === 0 && <StepRoom rt={rt} onEdit={() => navigate('/availability')} />}
          {step === 1 && (
            <StepAddons
              addons={addons.filter((a) => a.active)}
              selected={draft.addons}
              guests={draft.guests}
              nights={quote.nights}
              onChange={setAddon}
            />
          )}
          {step === 2 && (
            <StepDetails
              guest={draft.guest}
              guests={draft.guests}
              maxGuests={rt.maxGuests}
              errors={errors}
              onGuest={updateGuest}
              onGuestCount={(g) => update({ guests: g })}
            />
          )}
          {step === 3 && <StepReview quote={quote} rt={rt} draft={draft} addons={addons} />}

          <div className="mt-8 flex items-center justify-between">
            <Button variant="ghost" onClick={back} disabled={step === 0}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={next} size="lg">Continue</Button>
            ) : (
              <Button onClick={confirm} size="lg" disabled={submitting}>
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Confirming…</> : 'Confirm booking'}
              </Button>
            )}
          </div>
        </div>

        {/* Sticky summary */}
        <div>
          <Card className="sticky top-24 overflow-hidden">
            <img src={rt.photos[0]} alt={rt.name} className="aspect-[16/9] w-full object-cover" />
            <div className="p-5">
              <h3 className="font-display text-xl text-ink">{rt.name}</h3>
              <p className="mt-1 text-sm text-ink-soft">{formatRange(draft.checkIn, draft.checkOut)} · {draft.guests} guests</p>
              <PriceSummary quote={quote} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StepRoom({ rt, onEdit }: { rt: NonNullable<ReturnType<typeof useCasa>['roomTypes'][number]>; onEdit: () => void }) {
  const { amenities } = useCasa()
  const list = amenities.filter((a) => rt.amenityIds.includes(a.id))
  return (
    <div>
      <h2 className="font-display text-2xl text-ink">Your room</h2>
      <p className="mt-1 text-ink-soft">Review your selection or change your dates.</p>
      <div className="mt-5 rounded-2xl border border-line bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl text-ink">{rt.name}</h3>
            <p className="text-sm text-ink-soft">{rt.tagline}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onEdit}>Change dates / room</Button>
        </div>
        <p className="mt-4 text-sm text-ink-soft">{rt.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {list.slice(0, 6).map((a) => (
            <span key={a.id} className="rounded-full bg-paper-deep px-3 py-1 text-xs text-ink-soft">{a.name}</span>
          ))}
        </div>
        <p className="mt-4 rounded-xl bg-paper-deep px-4 py-3 text-sm text-ink-soft">{rt.cancellationPolicy}</p>
      </div>
    </div>
  )
}

function StepAddons({
  addons, selected, guests, nights, onChange,
}: {
  addons: ReturnType<typeof useCasa>['addons']
  selected: { addonId: string; quantity: number }[]
  guests: number
  nights: number
  onChange: (id: string, qty: number) => void
}) {
  const qtyOf = (id: string) => selected.find((s) => s.addonId === id)?.quantity ?? 0
  return (
    <div>
      <h2 className="font-display text-2xl text-ink">Add experiences</h2>
      <p className="mt-1 text-ink-soft">Optional touches to make your stay special.</p>
      <div className="mt-5 space-y-3">
        {addons.map((a) => {
          const qty = qtyOf(a.id)
          const unit = a.pricing === 'per_guest' ? a.price * guests * nights : a.pricing === 'per_night' ? a.price * nights : a.price
          return (
            <div key={a.id} className={`flex items-center gap-4 rounded-2xl border p-4 transition ${qty > 0 ? 'border-clay bg-clay/5' : 'border-line bg-card'}`}>
              <img src={a.image} alt={a.name} loading="lazy" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate font-medium text-ink">{a.name}</h3>
                  <span className="shrink-0 font-mono text-sm text-ink">{peso(unit)}</span>
                </div>
                <p className="mt-0.5 line-clamp-1 text-sm text-ink-soft">{a.description}</p>
                <p className="font-mono text-[11px] text-ink-soft">{peso(a.price)} {addonPricingLabel[a.pricing]}</p>
              </div>
              {a.pricing === 'per_booking' || a.pricing === 'per_guest' || a.pricing === 'per_night' ? (
                <button
                  onClick={() => onChange(a.id, qty > 0 ? 0 : 1)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${qty > 0 ? 'bg-clay text-white' : 'border border-ink/25 text-ink hover:border-ink'}`}
                >
                  {qty > 0 ? 'Added' : 'Add'}
                </button>
              ) : (
                <div className="flex shrink-0 items-center gap-2">
                  <button onClick={() => onChange(a.id, Math.max(0, qty - 1))} className="rounded-full border border-line p-1.5 hover:border-ink" aria-label="Decrease"><Minus className="h-3.5 w-3.5" /></button>
                  <span className="w-5 text-center text-sm">{qty}</span>
                  <button onClick={() => onChange(a.id, qty + 1)} className="rounded-full border border-line p-1.5 hover:border-ink" aria-label="Increase"><Plus className="h-3.5 w-3.5" /></button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StepDetails({
  guest, guests, maxGuests, errors, onGuest, onGuestCount,
}: {
  guest: ReturnType<typeof useDraft>['draft']['guest']
  guests: number
  maxGuests: number
  errors: Record<string, string>
  onGuest: (patch: Partial<ReturnType<typeof useDraft>['draft']['guest']>) => void
  onGuestCount: (g: number) => void
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-ink">Guest details</h2>
      <p className="mt-1 text-ink-soft">We’ll send your confirmation here. No account required.</p>
      <div className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" error={errors.name}><Input value={guest.name} onChange={(e) => onGuest({ name: e.target.value })} placeholder="Juan dela Cruz" /></Field>
          <Field label="Number of guests">
            <Select value={guests} onChange={(e) => onGuestCount(Number(e.target.value))}>
              {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
            </Select>
          </Field>
          <Field label="Email" error={errors.email}><Input type="email" value={guest.email} onChange={(e) => onGuest({ email: e.target.value })} placeholder="you@email.com" /></Field>
          <Field label="Phone" error={errors.phone}><Input value={guest.phone} onChange={(e) => onGuest({ phone: e.target.value })} placeholder="+63 9XX XXX XXXX" /></Field>
          <Field label="Estimated arrival" hint="optional"><Input type="time" value={guest.arrivalTime} onChange={(e) => onGuest({ arrivalTime: e.target.value })} /></Field>
          <Field label="Travel purpose" hint="optional">
            <Select value={guest.travelPurpose} onChange={(e) => onGuest({ travelPurpose: e.target.value })}>
              <option value="">Select…</option>
              <option>Staycation</option><option>Anniversary</option><option>Honeymoon</option>
              <option>Family trip</option><option>Business</option><option>Other</option>
            </Select>
          </Field>
        </div>
        <Field label="Special requests" hint="optional">
          <Textarea value={guest.specialRequests} onChange={(e) => onGuest({ specialRequests: e.target.value })} placeholder="Early check-in, dietary notes, celebrations…" />
        </Field>
      </div>
    </div>
  )
}

function StepReview({ quote, rt, draft, addons }: { quote: ReturnType<typeof quotePrice>; rt: NonNullable<ReturnType<typeof useCasa>['roomTypes'][number]>; draft: ReturnType<typeof useDraft>['draft']; addons: ReturnType<typeof useCasa>['addons'] }) {
  return (
    <div>
      <h2 className="font-display text-2xl text-ink">Review & confirm</h2>
      <p className="mt-1 text-ink-soft">Please review your booking before confirming.</p>
      <div className="mt-5 space-y-4">
        <Card className="p-5">
          <h3 className="font-mono text-xs uppercase tracking-wider text-ink-soft">Stay</h3>
          <p className="mt-2 font-display text-lg text-ink">{rt.name}</p>
          <p className="text-sm text-ink-soft">{formatRange(draft.checkIn, draft.checkOut)} · {quote.nights} nights · {draft.guests} guests</p>
        </Card>
        <Card className="p-5">
          <h3 className="font-mono text-xs uppercase tracking-wider text-ink-soft">Guest</h3>
          <p className="mt-2 text-ink">{draft.guest.name}</p>
          <p className="text-sm text-ink-soft">{draft.guest.email} · {draft.guest.phone}</p>
          {draft.guest.specialRequests && <p className="mt-2 text-sm text-ink-soft">“{draft.guest.specialRequests}”</p>}
        </Card>
        {quote.addonLines.length > 0 && (
          <Card className="p-5">
            <h3 className="font-mono text-xs uppercase tracking-wider text-ink-soft">Add-ons</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {quote.addonLines.map((l) => (
                <li key={l.addon.id} className="flex justify-between">
                  <span className="text-ink">{l.addon.name}{l.quantity > 1 ? ` ×${l.quantity}` : ''}</span>
                  <span className="text-ink-soft">{peso(l.total)}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  )
}

function PriceSummary({ quote }: { quote: ReturnType<typeof quotePrice> }) {
  return (
    <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
      <div className="flex justify-between">
        <span className="text-ink-soft">Room · {quote.nights} nights</span>
        <span className="text-ink">{peso(quote.nightlyTotal)}</span>
      </div>
      {quote.addonLines.map((l) => (
        <div key={l.addon.id} className="flex justify-between">
          <span className="text-ink-soft">{l.addon.name}{l.quantity > 1 ? ` ×${l.quantity}` : ''}</span>
          <span className="text-ink">{peso(l.total)}</span>
        </div>
      ))}
      <div className="flex justify-between border-t border-line pt-2">
        <span className="text-ink-soft">Subtotal</span>
        <span className="text-ink">{peso(quote.subtotal)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-ink-soft">Tax ({Math.round(quote.taxRate * 100)}%)</span>
        <span className="text-ink">{peso(quote.tax)}</span>
      </div>
      <div className="flex items-baseline justify-between border-t border-line pt-3">
        <span className="font-medium text-ink">Total</span>
        <span className="font-display text-2xl text-ink">{peso(quote.total)}</span>
      </div>
    </div>
  )
}
