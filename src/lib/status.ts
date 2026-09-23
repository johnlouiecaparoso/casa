import type { BookingStatus, RoomStatus } from '../types'

export const bookingStatusLabel: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  checked_in: 'Checked in',
  checked_out: 'Checked out',
  cancelled: 'Cancelled',
  no_show: 'No-show',
}

export const bookingStatusTone: Record<BookingStatus, 'neutral' | 'clay' | 'sage' | 'gold' | 'red' | 'ink'> = {
  pending: 'gold',
  confirmed: 'sage',
  checked_in: 'clay',
  checked_out: 'neutral',
  cancelled: 'red',
  no_show: 'red',
}

export const roomStatusLabel: Record<RoomStatus, string> = {
  available: 'Available',
  occupied: 'Occupied',
  reserved: 'Reserved',
  cleaning: 'Cleaning',
  maintenance: 'Maintenance',
  out_of_service: 'Out of service',
}

export const roomStatusTone: Record<RoomStatus, 'neutral' | 'clay' | 'sage' | 'gold' | 'red' | 'ink'> = {
  available: 'sage',
  occupied: 'clay',
  reserved: 'gold',
  cleaning: 'neutral',
  maintenance: 'red',
  out_of_service: 'red',
}

export const addonPricingLabel: Record<string, string> = {
  per_booking: 'per booking',
  per_guest: 'per guest / night',
  per_night: 'per night',
  per_unit: 'per unit',
}
