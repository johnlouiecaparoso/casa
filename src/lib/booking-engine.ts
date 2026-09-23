// Casa booking engine — the core business logic.
//
// These functions are intentionally pure and framework-free so the same rules
// can run in the browser (demo mode) or be ported to Postgres RPC / edge
// functions with Supabase. They cover the "Critical Booking Rules": date
// validation, capacity checks, availability against real inventory, overlap
// detection, night/rate/add-on/total calculation.

import type { Addon, Booking, BookingAddonLine, Room, RoomType } from '../types'

export const OCCUPYING_STATUSES: Booking['status'][] = [
  'pending',
  'confirmed',
  'checked_in',
]

export const BOOKABLE_ROOM_STATUSES: Room['status'][] = [
  'available',
  'reserved',
  'occupied',
  'cleaning',
]
// Rooms in maintenance / out_of_service are excluded from availability.

export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const ms = parseDate(checkOut).getTime() - parseDate(checkIn).getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

export function eachNight(checkIn: string, checkOut: string): Date[] {
  const out: Date[] = []
  const start = parseDate(checkIn)
  const n = nightsBetween(checkIn, checkOut)
  for (let i = 0; i < n; i++) {
    const day = new Date(start)
    day.setDate(day.getDate() + i)
    out.push(day)
  }
  return out
}

/**
 * Two half-open date intervals [aIn, aOut) and [bIn, bOut) overlap.
 * A checkout day equal to the next check-in day does NOT overlap — that day is
 * free for the new guest to arrive. This is the crux of turnover handling.
 */
export function rangesOverlap(aIn: string, aOut: string, bIn: string, bOut: string): boolean {
  return parseDate(aIn) < parseDate(bOut) && parseDate(bIn) < parseDate(aOut)
}

export interface DateValidation {
  valid: boolean
  error?: string
}

export function validateDates(checkIn: string, checkOut: string, today = new Date()): DateValidation {
  if (!checkIn || !checkOut) return { valid: false, error: 'Please choose both dates.' }
  const ci = parseDate(checkIn)
  const co = parseDate(checkOut)
  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (ci < midnight) return { valid: false, error: 'Check-in cannot be in the past.' }
  if (co <= ci) return { valid: false, error: 'Check-out must be after check-in.' }
  if (nightsBetween(checkIn, checkOut) > 30) {
    return { valid: false, error: 'Stays are limited to 30 nights.' }
  }
  return { valid: true }
}

/** Physical rooms of a type that are eligible to hold a booking. */
export function bookableRooms(roomTypeId: string, rooms: Room[]): Room[] {
  return rooms.filter(
    (r) => r.roomTypeId === roomTypeId && BOOKABLE_ROOM_STATUSES.includes(r.status),
  )
}

/**
 * Find a specific free room of a type for the requested range, or null.
 * Excludes the room ids already taken by overlapping active bookings.
 */
export function findAvailableRoom(
  roomTypeId: string,
  checkIn: string,
  checkOut: string,
  rooms: Room[],
  bookings: Booking[],
  ignoreBookingId?: string,
): Room | null {
  const candidates = bookableRooms(roomTypeId, rooms)
  const taken = new Set(
    bookings
      .filter(
        (b) =>
          b.id !== ignoreBookingId &&
          b.roomId &&
          b.roomTypeId === roomTypeId &&
          OCCUPYING_STATUSES.includes(b.status) &&
          rangesOverlap(b.checkIn, b.checkOut, checkIn, checkOut),
      )
      .map((b) => b.roomId as string),
  )
  return candidates.find((r) => !taken.has(r.id)) ?? null
}

export interface AvailabilityResult {
  roomType: RoomType
  roomsAvailable: number
  available: boolean
  reason?: string
}

/** Availability for every active room type over a date range + guest count. */
export function searchAvailability(
  checkIn: string,
  checkOut: string,
  guests: number,
  roomTypes: RoomType[],
  rooms: Room[],
  bookings: Booking[],
): AvailabilityResult[] {
  return roomTypes
    .filter((rt) => rt.active)
    .map((rt) => {
      const candidates = bookableRooms(rt.id, rooms)
      const overlapping = bookings.filter(
        (b) =>
          b.roomTypeId === rt.id &&
          OCCUPYING_STATUSES.includes(b.status) &&
          rangesOverlap(b.checkIn, b.checkOut, checkIn, checkOut),
      )
      const takenRoomIds = new Set(overlapping.map((b) => b.roomId).filter(Boolean))
      // Bookings not yet assigned a physical room still consume inventory.
      const unassigned = overlapping.filter((b) => !b.roomId).length
      const roomsAvailable = Math.max(0, candidates.length - takenRoomIds.size - unassigned)

      let reason: string | undefined
      if (guests > rt.maxGuests) reason = `Sleeps up to ${rt.maxGuests} guests`
      else if (roomsAvailable === 0) reason = 'No rooms left for these dates'

      return {
        roomType: rt,
        roomsAvailable,
        available: !reason,
        reason,
      }
    })
}

// ---- Rate & pricing ----------------------------------------------------------

// A tiny holiday calendar (PH). Extend without touching the pricing math.
const HOLIDAYS = new Set([
  '2026-12-24', '2026-12-25', '2026-12-30', '2026-12-31', '2027-01-01',
  '2026-04-01', '2026-04-02', '2026-04-03',
])

export function nightlyRate(rt: RoomType, day: Date): number {
  const iso = toISODate(day)
  if (HOLIDAYS.has(iso)) return rt.holidayRate
  const dow = day.getDay() // 0 Sun ... 6 Sat
  const isWeekend = dow === 5 || dow === 6 // Fri & Sat nights
  return isWeekend ? rt.weekendRate : rt.baseRate
}

export interface NightlyLine {
  date: string
  rate: number
}

export function nightlyBreakdown(rt: RoomType, checkIn: string, checkOut: string): NightlyLine[] {
  return eachNight(checkIn, checkOut).map((day) => ({
    date: toISODate(day),
    rate: nightlyRate(rt, day),
  }))
}

export function addonLineTotal(
  addon: Addon,
  quantity: number,
  guests: number,
  nights: number,
): number {
  switch (addon.pricing) {
    case 'per_booking':
      return addon.price * quantity
    case 'per_guest':
      return addon.price * guests * nights
    case 'per_night':
      return addon.price * nights * quantity
    case 'per_unit':
      return addon.price * quantity
  }
}

export interface PriceQuote {
  nights: number
  nightly: NightlyLine[]
  nightlyTotal: number
  addonLines: { addon: Addon; quantity: number; total: number }[]
  addonsTotal: number
  subtotal: number
  taxRate: number
  tax: number
  total: number
}

/** The single source of truth for a booking price. Never trust client totals. */
export function quotePrice(
  rt: RoomType,
  checkIn: string,
  checkOut: string,
  guests: number,
  addonLines: BookingAddonLine[],
  addonCatalog: Addon[],
  taxRate: number,
): PriceQuote {
  const nights = nightsBetween(checkIn, checkOut)
  const nightly = nightlyBreakdown(rt, checkIn, checkOut)
  const nightlyTotal = nightly.reduce((s, n) => s + n.rate, 0)

  const lines = addonLines
    .map((line) => {
      const addon = addonCatalog.find((a) => a.id === line.addonId)
      if (!addon) return null
      return { addon, quantity: line.quantity, total: addonLineTotal(addon, line.quantity, guests, nights) }
    })
    .filter((l): l is { addon: Addon; quantity: number; total: number } => l !== null)

  const addonsTotal = lines.reduce((s, l) => s + l.total, 0)
  const subtotal = nightlyTotal + addonsTotal
  const tax = Math.round(subtotal * taxRate)
  const total = subtotal + tax

  return { nights, nightly, nightlyTotal, addonLines: lines, addonsTotal, subtotal, taxRate, tax, total }
}

export function canCancel(booking: Booking, now = new Date()): boolean {
  if (!['pending', 'confirmed'].includes(booking.status)) return false
  return parseDate(booking.checkIn).getTime() > now.getTime()
}

export function withinFreeCancellation(booking: Booking, rt: RoomType, now = new Date()): boolean {
  const deadline = parseDate(booking.checkIn).getTime() - rt.cancellationHours * 3600 * 1000
  return now.getTime() <= deadline
}
