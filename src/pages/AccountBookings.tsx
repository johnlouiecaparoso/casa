import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Calendar, X } from 'lucide-react'
import type { Booking } from '../types'
import { useCasa } from '../lib/store'
import { useSEO } from '../lib/seo'
import { Badge, Button, ButtonLink, Card, EmptyState, Field, Textarea } from '../components/ui'
import { useToast } from '../components/Toast'
import { peso, formatRange } from '../lib/format'
import { bookingStatusLabel, bookingStatusTone } from '../lib/status'
import { canCancel, parseDate, withinFreeCancellation } from '../lib/booking-engine'
import { sendCancellation } from '../services/notifications'

type Tab = 'upcoming' | 'past'

export default function AccountBookings() {
  const { user, bookings, roomTypes } = useCasa()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('upcoming')
  useSEO({ title: 'My bookings' })

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <h1 className="font-display text-3xl text-ink">Sign in to view bookings</h1>
        <ButtonLink to="/login" className="mt-6">Sign in</ButtonLink>
      </div>
    )
  }

  const mine = bookings.filter((b) => b.userId === user.id || b.email === user.email)
  const now = new Date()
  const upcoming = mine.filter((b) => parseDate(b.checkOut) >= now && b.status !== 'cancelled')
  const past = mine.filter((b) => parseDate(b.checkOut) < now || b.status === 'cancelled')
  const list = (tab === 'upcoming' ? upcoming : past).sort(
    (a, b) => parseDate(b.checkIn).getTime() - parseDate(a.checkIn).getTime(),
  )

  return (
    <div className="mx-auto max-w-4xl px-5 py-14 lg:px-8">
      <h1 className="font-display text-4xl text-ink">My bookings</h1>

      <div className="mt-6 inline-flex rounded-full border border-line bg-card p-1">
        {(['upcoming', 'past'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-5 py-2 text-sm font-medium capitalize transition ${tab === t ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'}`}
          >
            {t} ({t === 'upcoming' ? upcoming.length : past.length})
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {list.length === 0 ? (
          <EmptyState
            title={tab === 'upcoming' ? 'No upcoming stays' : 'No past stays yet'}
            action={tab === 'upcoming' ? <Button onClick={() => navigate('/availability')}>Book a stay</Button> : undefined}
          />
        ) : (
          list.map((b) => <BookingRow key={b.id} booking={b} roomTypes={roomTypes} />)
        )}
      </div>
    </div>
  )
}

function BookingRow({ booking, roomTypes }: { booking: Booking; roomTypes: ReturnType<typeof useCasa>['roomTypes'] }) {
  const { cancelBooking, addReview, reviews } = useCasa()
  const toast = useToast()
  const [showCancel, setShowCancel] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const rt = roomTypes.find((r) => r.id === booking.roomTypeId)!
  const cancellable = canCancel(booking)
  const free = cancellable && withinFreeCancellation(booking, rt)
  const reviewable = booking.status === 'checked_out'
  const alreadyReviewed = reviews.some((r) => r.roomTypeId === booking.roomTypeId && r.guestName === booking.guestName)

  return (
    <Card className="overflow-hidden sm:grid sm:grid-cols-[160px_1fr]">
      <div className="aspect-[16/10] bg-paper-deep sm:aspect-auto">
        <img src={rt.photos[0]} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge tone={bookingStatusTone[booking.status]}>{bookingStatusLabel[booking.status]}</Badge>
          <span className="font-mono text-sm text-ink-soft">{booking.reference}</span>
        </div>
        <h3 className="mt-2 font-display text-xl text-ink">{rt.name}</h3>
        <p className="mt-1 flex items-center gap-2 text-sm text-ink-soft">
          <Calendar className="h-4 w-4" /> {formatRange(booking.checkIn, booking.checkOut)} · {booking.guests} guests
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="font-display text-lg text-ink">{peso(booking.total)}</span>
          <div className="flex gap-2">
            {reviewable && !alreadyReviewed && (
              <Button size="sm" variant="outline" onClick={() => setShowReview(true)}>Leave a review</Button>
            )}
            {alreadyReviewed && <span className="text-xs text-sage">Review submitted ✦</span>}
            {cancellable && (
              <Button size="sm" variant="ghost" onClick={() => setShowCancel(true)}>Cancel</Button>
            )}
          </div>
        </div>
        {booking.status === 'cancelled' && booking.cancellationReason && (
          <p className="mt-3 rounded-lg bg-paper-deep px-3 py-2 text-xs text-ink-soft">Cancelled: {booking.cancellationReason}</p>
        )}
      </div>

      {showCancel && (
        <CancelDialog
          free={free}
          policy={rt.cancellationPolicy}
          onClose={() => setShowCancel(false)}
          onConfirm={(reason) => {
            cancelBooking(booking.id, reason)
            sendCancellation(booking)
            setShowCancel(false)
            toast('success', `Booking ${booking.reference} cancelled.`)
          }}
        />
      )}
      {showReview && (
        <ReviewDialog
          onClose={() => setShowReview(false)}
          onSubmit={(rating, title, body) => {
            addReview({ guestName: booking.guestName, roomTypeId: booking.roomTypeId, rating, title, body })
            setShowReview(false)
            toast('success', 'Thanks! Your review is pending approval.')
          }}
        />
      )}
    </Card>
  )
}

function Dialog({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-2xl animate-fade-up">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl text-ink">{title}</h3>
          <button onClick={onClose} aria-label="Close"><X className="h-5 w-5 text-ink-soft hover:text-ink" /></button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

function CancelDialog({ free, policy, onClose, onConfirm }: { free: boolean; policy: string; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState('')
  return (
    <Dialog title="Cancel booking" onClose={onClose}>
      <p className={`rounded-lg px-3 py-2 text-sm ${free ? 'bg-sage/12 text-sage' : 'bg-clay/10 text-clay-deep'}`}>
        {free ? 'You’re within the free cancellation window — no charge.' : 'Heads up: you’re past the free cancellation window.'}
      </p>
      <p className="mt-2 text-xs text-ink-soft">{policy}</p>
      <Field label="Reason (optional)"><Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Change of plans…" /></Field>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Keep booking</Button>
        <Button onClick={() => onConfirm(reason || 'Cancelled by guest')}>Confirm cancellation</Button>
      </div>
    </Dialog>
  )
}

function ReviewDialog({ onClose, onSubmit }: { onClose: () => void; onSubmit: (rating: number, title: string, body: string) => void }) {
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  return (
    <Dialog title="Leave a review" onClose={onClose}>
      <div className="flex items-center gap-3">
        <span className="text-sm text-ink-soft">Rating</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`} className="p-0.5">
              <svg viewBox="0 0 20 20" className={`h-6 w-6 ${n <= rating ? 'fill-gold' : 'fill-line'}`}><path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 15.9 4.8 17.6l1-5.8L1.5 7.7l5.9-.9z" /></svg>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <Field label="Title"><input className="w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm focus:border-clay focus:outline-none" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A wonderful stay" /></Field>
        <Field label="Your review"><Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Tell other guests about your experience…" /></Field>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSubmit(rating, title || 'Great stay', body || 'Highly recommended.')}>Submit review</Button>
      </div>
    </Dialog>
  )
}
