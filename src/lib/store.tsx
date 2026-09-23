import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Booking, Review, Room, RoomStatus } from '../types'
import * as seed from '../data/seed'
import { findAvailableRoom } from './booking-engine'
import { genReference } from './format'
import { supabase } from './supabase'

function genReferenceSeq(bookings: Booking[]): string {
  const max = bookings.reduce((m, b) => {
    const n = Number(b.reference.replace('CASA-', ''))
    return Number.isFinite(n) ? Math.max(m, n) : m
  }, 100)
  return genReference(max + 1)
}

/**
 * CasaStore is the demo-mode data layer. Every mutation goes through here so it
 * can be swapped for Supabase calls without touching components — the method
 * shapes intentionally mirror what the Supabase service would expose.
 */

export type DemoRole = 'guest' | 'customer' | 'admin'

interface DemoUser {
  id: string
  name: string
  email: string
  role: DemoRole
}

type SupabaseProfile = { id: string; name: string | null; email: string; role: DemoRole }

const mapRoomType = (row: any): typeof seed.roomTypes[number] => ({ ...row, baseRate: row.base_rate, weekendRate: row.weekend_rate, holidayRate: row.holiday_rate, maxGuests: row.max_guests, sizeSqm: row.size_sqm, bedType: row.bed_type, amenityIds: row.amenity_ids, cancellationPolicy: row.cancellation_policy, cancellationHours: row.cancellation_hours })
const mapRoom = (row: any): Room => ({ ...row, roomTypeId: row.room_type_id })
const mapAddon = (row: any): typeof seed.addons[number] => ({ ...row })
const mapPackage = (row: any): typeof seed.packages[number] => ({ ...row, includedAddonIds: row.included_addon_ids, roomTypeId: row.room_type_id })
const mapReview = (row: any): Review => ({ ...row, guestName: row.guest_name, roomTypeId: row.room_type_id })
const mapBooking = (row: any): Booking => ({ ...row, roomTypeId: row.room_type_id, roomId: row.room_id, checkIn: row.check_in, checkOut: row.check_out, guestName: row.guest_name, specialRequests: row.special_requests, arrivalTime: row.arrival_time, travelPurpose: row.travel_purpose, nightlyTotal: row.nightly_total, addonsTotal: row.addons_total, createdAt: row.created_at, cancelledAt: row.cancelled_at, cancellationReason: row.cancellation_reason, userId: row.user_id })
const mapSettings = (row: any): typeof seed.settings => ({ name: row.name, tagline: row.tagline, address: row.address, phone: row.phone, email: row.email, taxRate: row.tax_rate, social: row.social })
const mapAuditLog = (row: any) => ({ id: row.id, actor: row.actor, action: row.action, target: row.target, at: row.at })

interface StoreState {
  bookings: Booking[]
  reviews: Review[]
  rooms: Room[]
  user: DemoUser | null
}

interface CreateBookingInput {
  roomTypeId: string
  checkIn: string
  checkOut: string
  guests: number
  guestName: string
  email: string
  phone: string
  specialRequests?: string
  arrivalTime?: string
  travelPurpose?: string
  addons: Booking['addons']
  nightlyTotal: number
  addonsTotal: number
  subtotal: number
  tax: number
  total: number
}

interface CasaContext extends StoreState {
  createBooking: (input: CreateBookingInput) => { ok: true; booking: Booking } | { ok: false; error: string }
  cancelBooking: (id: string, reason: string) => void
  addReview: (r: Omit<Review, 'id' | 'approved' | 'date'>) => void
  setReviewApproval: (id: string, approved: boolean) => void
  deleteReview: (id: string) => void
  setBookingStatus: (id: string, status: Booking['status']) => void
  setRoomStatus: (id: string, status: RoomStatus) => void
  login: (email: string, password?: string, name?: string) => Promise<{ ok: true } | { ok: false; error: string }>
  logout: () => void
  loginDemo: (role: DemoRole) => void
  // reference data (read-only in demo)
  roomTypes: typeof seed.roomTypes
  addons: typeof seed.addons
  packages: typeof seed.packages
  amenities: typeof seed.amenities
  settings: typeof seed.settings
  auditLogs: typeof seed.auditLogs
}

const Ctx = createContext<CasaContext | null>(null)

const LS_KEY = 'casa.store.v1'

function load(): Partial<StoreState> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function CasaProvider({ children }: { children: ReactNode }) {
  const persisted = load()
  const [bookings, setBookings] = useState<Booking[]>(persisted.bookings ?? seed.bookings)
  const [reviews, setReviews] = useState<Review[]>(persisted.reviews ?? seed.reviews)
  const [rooms, setRooms] = useState<Room[]>(persisted.rooms ?? seed.rooms)
  const [user, setUser] = useState<DemoUser | null>(persisted.user ?? null)

  useEffect(() => {
    if (!supabase) return
    let active = true
    const hydrate = async () => {
      const [{ data: authData }, reference, bookingResult, reviewResult, roomResult] = await Promise.all([
        supabase.auth.getUser(),
        Promise.all([
          supabase.from('room_types').select('*').eq('active', true),
          supabase.from('addons').select('*').eq('active', true),
          supabase.from('packages').select('*').eq('active', true),
          supabase.from('amenities').select('*'),
          supabase.from('hotel_settings').select('*').eq('id', 'default').maybeSingle(),
          supabase.from('audit_logs').select('*').order('at', { ascending: false }),
        ]),
        supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').order('date', { ascending: false }),
        supabase.from('rooms').select('*').order('number'),
      ])
      if (!active) return
      const [roomTypesResult, addonsResult, packagesResult, amenitiesResult, settingsResult, auditResult] = reference
      if (!roomTypesResult.error && roomTypesResult.data?.length) Object.assign(seed, { roomTypes: roomTypesResult.data.map(mapRoomType) })
      if (!addonsResult.error && addonsResult.data?.length) Object.assign(seed, { addons: addonsResult.data.map(mapAddon) })
      if (!packagesResult.error && packagesResult.data?.length) Object.assign(seed, { packages: packagesResult.data.map(mapPackage) })
      if (!amenitiesResult.error && amenitiesResult.data?.length) Object.assign(seed, { amenities: amenitiesResult.data })
      if (!settingsResult.error && settingsResult.data) Object.assign(seed, { settings: mapSettings(settingsResult.data) })
      if (!auditResult.error && auditResult.data) Object.assign(seed, { auditLogs: auditResult.data.map(mapAuditLog) })
      if (!roomResult.error && roomResult.data?.length) setRooms(roomResult.data.map(mapRoom))
      if (!reviewResult.error && reviewResult.data) setReviews(reviewResult.data.map(mapReview))
      if (!bookingResult.error && bookingResult.data) setBookings(bookingResult.data.map(mapBooking))
      if (authData.user) {
        const { data: profile } = await supabase.from('profiles').select('id, name, email, role').eq('id', authData.user.id).maybeSingle<SupabaseProfile>()
        if (profile) setUser({ id: profile.id, name: profile.name ?? profile.email.split('@')[0], email: profile.email, role: profile.role })
      }
    }
    void hydrate()
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) return setUser(null)
      const { data: profile } = await supabase!.from('profiles').select('id, name, email, role').eq('id', session.user.id).maybeSingle<SupabaseProfile>()
      if (profile) setUser({ id: profile.id, name: profile.name ?? profile.email.split('@')[0], email: profile.email, role: profile.role })
    })
    return () => { active = false; listener.subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ bookings, reviews, rooms, user }))
  }, [bookings, reviews, rooms, user])

  const createBooking = useCallback<CasaContext['createBooking']>(
    (input) => {
      // Re-check availability at the moment of creation (race-condition guard).
      const room = findAvailableRoom(input.roomTypeId, input.checkIn, input.checkOut, rooms, bookings)
      if (!room) {
        return { ok: false, error: 'Sorry — that room was just taken for your dates. Please pick another.' }
      }
      const reference = genReferenceSeq(bookings)
      const booking: Booking = {
        id: `bk-${Date.now()}`,
        reference,
        roomId: room.id,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        userId: user?.id ?? null,
        ...input,
      }
      setBookings((prev) => [booking, ...prev])
      void supabase?.from('bookings').insert({
        id: booking.id, reference: booking.reference, room_type_id: booking.roomTypeId, room_id: booking.roomId,
        check_in: booking.checkIn, check_out: booking.checkOut, guests: booking.guests, status: booking.status,
        guest_name: booking.guestName, email: booking.email, phone: booking.phone, special_requests: booking.specialRequests,
        arrival_time: booking.arrivalTime, travel_purpose: booking.travelPurpose, addons: booking.addons,
        nightly_total: booking.nightlyTotal, addons_total: booking.addonsTotal, subtotal: booking.subtotal,
        tax: booking.tax, total: booking.total, created_at: booking.createdAt, user_id: booking.userId,
      })
      return { ok: true, booking }
    },
    [rooms, bookings, user],
  )

  const cancelBooking = useCallback((id: string, reason: string) => {
    void supabase?.from('bookings').update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancellation_reason: reason }).eq('id', id)
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, status: 'cancelled', cancelledAt: new Date().toISOString(), cancellationReason: reason }
          : b,
      ),
    )
  }, [])

  const addReview = useCallback<CasaContext['addReview']>((r) => {
    const review = { ...r, id: `rv-${Date.now()}`, approved: false, date: new Date().toISOString().slice(0, 10) }
    void supabase?.from('reviews').insert({ id: review.id, guest_name: review.guestName, room_type_id: review.roomTypeId, rating: review.rating, title: review.title, body: review.body, date: review.date, approved: false, photo: review.photo })
    setReviews((prev) => [
      review,
      ...prev,
    ])
  }, [])

  const setReviewApproval = useCallback((id: string, approved: boolean) => {
    void supabase?.from('reviews').update({ approved }).eq('id', id)
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, approved } : r)))
  }, [])

  const deleteReview = useCallback((id: string) => {
    void supabase?.from('reviews').delete().eq('id', id)
    setReviews((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const setBookingStatus = useCallback((id: string, status: Booking['status']) => {
    void supabase?.from('bookings').update({ status }).eq('id', id)
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
  }, [])

  const setRoomStatus = useCallback((id: string, status: RoomStatus) => {
    void supabase?.from('rooms').update({ status }).eq('id', id)
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
  }, [])

  const login = useCallback(async (email: string, password = '', name?: string) => {
    if (supabase && password) {
      const result = name
        ? await supabase.auth.signUp({ email, password, options: { data: { name } } })
        : await supabase.auth.signInWithPassword({ email, password })
      if (result.error) return { ok: false as const, error: result.error.message }
      return { ok: true as const }
    }
    setUser({ id: 'demo-customer', name: name ?? email.split('@')[0], email, role: 'customer' })
    return { ok: true as const }
  }, [])

  const loginDemo = useCallback((role: DemoRole) => {
    if (role === 'admin') {
      setUser({ id: 'demo-admin', name: 'Casa Staff', email: 'admin@casahotel.ph', role: 'admin' })
    } else {
      setUser({ id: 'demo-customer', name: 'Demo Guest', email: 'demo@casahotel.ph', role: 'customer' })
    }
  }, [])

  const logout = useCallback(() => { setUser(null); void supabase?.auth.signOut() }, [])

  const value = useMemo<CasaContext>(
    () => ({
      bookings, reviews, rooms, user,
      createBooking, cancelBooking, addReview, setReviewApproval, deleteReview,
      setBookingStatus, setRoomStatus, login, logout, loginDemo,
      roomTypes: seed.roomTypes, addons: seed.addons, packages: seed.packages,
      amenities: seed.amenities, settings: seed.settings, auditLogs: seed.auditLogs,
    }),
    [bookings, reviews, rooms, user, createBooking, cancelBooking, addReview, setReviewApproval, deleteReview, setBookingStatus, setRoomStatus, login, logout, loginDemo],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCasa() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCasa must be used within CasaProvider')
  return ctx
}

export function useRoomType(id?: string) {
  return seed.roomTypes.find((rt) => rt.id === id || rt.slug === id)
}
