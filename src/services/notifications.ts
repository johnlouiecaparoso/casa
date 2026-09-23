// Notification service abstraction.
//
// In production this routes to Resend (email) and, in a later phase, an SMS
// provider. In demo mode it logs to the console so the booking flow works
// end-to-end without any integration configured. Nothing in the app depends on
// a concrete provider — only on this interface.

import type { Booking } from '../types'
import { peso } from '../lib/format'

export type Channel = 'email' | 'sms'

export interface NotificationMessage {
  to: string
  channel: Channel
  subject: string
  body: string
}

export interface NotificationProvider {
  send(message: NotificationMessage): Promise<{ ok: boolean }>
}

class ConsoleProvider implements NotificationProvider {
  async send(message: NotificationMessage) {
    // eslint-disable-next-line no-console
    console.info(`[notifications:${message.channel}] → ${message.to}\n${message.subject}\n${message.body}`)
    return { ok: true }
  }
}

// A real deployment would select ResendProvider when import.meta.env.VITE_RESEND_API_KEY exists.
const provider: NotificationProvider = new ConsoleProvider()

export async function sendBookingConfirmation(booking: Booking, roomTypeName: string) {
  return provider.send({
    to: booking.email,
    channel: 'email',
    subject: `Your Casa stay is confirmed — ${booking.reference}`,
    body: [
      `Hi ${booking.guestName},`,
      `Your ${roomTypeName} is booked for ${booking.checkIn} → ${booking.checkOut}.`,
      `${booking.guests} guest(s). Total ${peso(booking.total)}.`,
      `Reference: ${booking.reference}`,
      `We can’t wait to host you at Casa.`,
    ].join('\n'),
  })
}

export async function sendCancellation(booking: Booking) {
  return provider.send({
    to: booking.email,
    channel: 'email',
    subject: `Booking cancelled — ${booking.reference}`,
    body: `Hi ${booking.guestName}, your booking ${booking.reference} has been cancelled.`,
  })
}

// Reminder-email architecture stub — scheduled 24h before check-in in production.
export async function scheduleCheckInReminder(booking: Booking) {
  return provider.send({
    to: booking.email,
    channel: 'email',
    subject: `See you soon at Casa — ${booking.reference}`,
    body: `A gentle reminder that your stay begins on ${booking.checkIn}.`,
  })
}
