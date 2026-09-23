// Casa domain model. Mirrors the intended Supabase/PostgreSQL schema so the
// demo data service can later be swapped for real Supabase queries 1:1.

export type UUID = string

export type RoomStatus =
  | 'available'
  | 'occupied'
  | 'reserved'
  | 'cleaning'
  | 'maintenance'
  | 'out_of_service'

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'no_show'

export type AddonPricing = 'per_booking' | 'per_guest' | 'per_night' | 'per_unit'

export interface Amenity {
  id: UUID
  name: string
  icon: string // lucide icon key
}

export interface RoomType {
  id: UUID
  slug: string
  name: string
  tagline: string
  description: string
  baseRate: number // PHP per night
  weekendRate: number
  holidayRate: number
  maxGuests: number
  sizeSqm: number
  bedType: string
  photos: string[]
  amenityIds: UUID[]
  featured: boolean
  active: boolean
  cancellationPolicy: string
  cancellationHours: number // free cancellation window before check-in
}

export interface Room {
  id: UUID
  roomTypeId: UUID
  number: string
  floor: number
  status: RoomStatus
}

export interface Addon {
  id: UUID
  slug: string
  name: string
  description: string
  price: number
  pricing: AddonPricing
  image: string
  active: boolean
}

export interface StayPackage {
  id: UUID
  name: string
  description: string
  nights: number
  roomTypeId: UUID
  includedAddonIds: UUID[]
  price: number // package price per stay
  image: string
  active: boolean
}

export interface Review {
  id: UUID
  guestName: string
  roomTypeId: UUID
  rating: number
  title: string
  body: string
  date: string // ISO
  approved: boolean
  photo?: string
}

export interface BookingAddonLine {
  addonId: UUID
  quantity: number
}

export interface Booking {
  id: UUID
  reference: string // CASA-00124
  roomTypeId: UUID
  roomId: UUID | null
  checkIn: string // ISO date (yyyy-MM-dd)
  checkOut: string
  guests: number
  status: BookingStatus
  guestName: string
  email: string
  phone: string
  specialRequests?: string
  arrivalTime?: string
  travelPurpose?: string
  addons: BookingAddonLine[]
  nightlyTotal: number
  addonsTotal: number
  subtotal: number
  tax: number
  total: number
  createdAt: string
  cancelledAt?: string
  cancellationReason?: string
  userId?: string | null
}

export interface HotelSettings {
  name: string
  tagline: string
  address: string
  phone: string
  email: string
  taxRate: number // e.g. 0.12
  social: { label: string; url: string }[]
}

export interface AuditLog {
  id: UUID
  actor: string
  action: string
  target: string
  at: string
}
