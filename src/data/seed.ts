import type {
  Addon,
  Amenity,
  AuditLog,
  Booking,
  HotelSettings,
  Review,
  Room,
  RoomType,
  StayPackage,
} from '../types'

const img = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format`

export const settings: HotelSettings = {
  name: 'Casa',
  tagline: 'Your quiet escape, close to home.',
  address: '14 Aguho Lane, Tagaytay Ridge, Cavite 4120, Philippines',
  phone: '+63 917 555 0142',
  email: 'stay@casahotel.ph',
  taxRate: 0.12,
  social: [
    { label: 'Instagram', url: 'https://instagram.com' },
    { label: 'Facebook', url: 'https://facebook.com' },
    { label: 'Pinterest', url: 'https://pinterest.com' },
  ],
}

export const amenities: Amenity[] = [
  { id: 'am-wifi', name: 'Fast Wi-Fi', icon: 'Wifi' },
  { id: 'am-tv', name: 'Smart TV', icon: 'Tv' },
  { id: 'am-ac', name: 'Air Conditioning', icon: 'Snowflake' },
  { id: 'am-balcony', name: 'Private Balcony', icon: 'Trees' },
  { id: 'am-king', name: 'King Bed', icon: 'BedDouble' },
  { id: 'am-coffee', name: 'Coffee & Tea Bar', icon: 'Coffee' },
  { id: 'am-bath', name: 'Soaking Bathtub', icon: 'Bath' },
  { id: 'am-pool', name: 'Private Pool', icon: 'Waves' },
  { id: 'am-breakfast', name: 'Breakfast Included', icon: 'Croissant' },
  { id: 'am-safe', name: 'In-room Safe', icon: 'Lock' },
  { id: 'am-minibar', name: 'Mini Bar', icon: 'Wine' },
  { id: 'am-workspace', name: 'Work Desk', icon: 'Laptop' },
  { id: 'am-living', name: 'Living Area', icon: 'Sofa' },
  { id: 'am-parking', name: 'Free Parking', icon: 'Car' },
  { id: 'am-blackout', name: 'Blackout Curtains', icon: 'Moon' },
  { id: 'am-toiletries', name: 'Artisan Toiletries', icon: 'Sparkles' },
]

export const roomTypes: RoomType[] = [
  {
    id: 'rt-deluxe-king',
    slug: 'deluxe-king',
    name: 'Deluxe King',
    tagline: 'A serene retreat for two',
    description:
      'Our signature room pairs a plush king bed with a private balcony overlooking the ridge. Warm timber, soft linens, and quiet corners make it the perfect couples’ escape close to home.',
    baseRate: 4500,
    weekendRate: 4800,
    holidayRate: 5500,
    maxGuests: 2,
    sizeSqm: 32,
    bedType: 'King bed',
    photos: [img('1611892440504-42a792e24d32'), img('1618773928121-c32242e63f39'), img('1584622650111-993a426fbf0a')],
    amenityIds: ['am-king', 'am-balcony', 'am-wifi', 'am-tv', 'am-ac', 'am-coffee', 'am-safe', 'am-toiletries'],
    featured: true,
    active: true,
    cancellationPolicy: 'Free cancellation until 48 hours before check-in.',
    cancellationHours: 48,
  },
  {
    id: 'rt-family-suite',
    slug: 'family-suite',
    name: 'Family Suite',
    tagline: 'Room to gather, space to rest',
    description:
      'A generous suite with two beds and a sunlit living area — designed for families and weekend travellers who want space to spread out without leaving comfort behind.',
    baseRate: 6800,
    weekendRate: 7300,
    holidayRate: 8200,
    maxGuests: 4,
    sizeSqm: 48,
    bedType: 'King + Queen bed',
    photos: [img('1582719478250-c89cae4dc85b'), img('1560448204-e02f11c3d0e2'), img('1522771739844-6a9f6d5f14af')],
    amenityIds: ['am-living', 'am-balcony', 'am-wifi', 'am-tv', 'am-ac', 'am-coffee', 'am-minibar', 'am-safe', 'am-workspace'],
    featured: true,
    active: true,
    cancellationPolicy: 'Free cancellation until 72 hours before check-in.',
    cancellationHours: 72,
  },
  {
    id: 'rt-pool-villa',
    slug: 'pool-villa',
    name: 'Pool Villa',
    tagline: 'Your own private water’s edge',
    description:
      'The crown of Casa. A standalone villa with a private plunge pool, deep soaking tub, and breakfast served to your terrace each morning. Absolute privacy, absolute calm.',
    baseRate: 9500,
    weekendRate: 10500,
    holidayRate: 12000,
    maxGuests: 4,
    sizeSqm: 72,
    bedType: 'King bed',
    photos: [img('1571003123894-1f0594d2b5d9'), img('1520250497591-112f2f40a3f4'), img('1584622650111-993a426fbf0a')],
    amenityIds: ['am-pool', 'am-bath', 'am-breakfast', 'am-king', 'am-balcony', 'am-wifi', 'am-tv', 'am-ac', 'am-minibar', 'am-toiletries'],
    featured: true,
    active: true,
    cancellationPolicy: 'Free cancellation until 7 days before check-in.',
    cancellationHours: 168,
  },
  {
    id: 'rt-garden-queen',
    slug: 'garden-queen',
    name: 'Garden Queen',
    tagline: 'Wake up to the garden',
    description:
      'An intimate ground-floor room opening onto Casa’s pocket garden. Bright, uncomplicated, and gently priced — ideal for a solo reset or a first stay.',
    baseRate: 3400,
    weekendRate: 3700,
    holidayRate: 4200,
    maxGuests: 2,
    sizeSqm: 26,
    bedType: 'Queen bed',
    photos: [img('1631049307264-da0ec9d70304'), img('1595576508898-0ad5c879a061'), img('1522708323590-d24dbb6b0267')],
    amenityIds: ['am-wifi', 'am-tv', 'am-ac', 'am-coffee', 'am-safe', 'am-parking'],
    featured: false,
    active: true,
    cancellationPolicy: 'Free cancellation until 48 hours before check-in.',
    cancellationHours: 48,
  },
]

export const rooms: Room[] = [
  { id: 'r-101', roomTypeId: 'rt-deluxe-king', number: '101', floor: 1, status: 'available' },
  { id: 'r-102', roomTypeId: 'rt-deluxe-king', number: '102', floor: 1, status: 'occupied' },
  { id: 'r-103', roomTypeId: 'rt-deluxe-king', number: '103', floor: 1, status: 'maintenance' },
  { id: 'r-104', roomTypeId: 'rt-deluxe-king', number: '104', floor: 1, status: 'available' },
  { id: 'r-201', roomTypeId: 'rt-family-suite', number: '201', floor: 2, status: 'available' },
  { id: 'r-202', roomTypeId: 'rt-family-suite', number: '202', floor: 2, status: 'reserved' },
  { id: 'r-203', roomTypeId: 'rt-family-suite', number: '203', floor: 2, status: 'available' },
  { id: 'v-01', roomTypeId: 'rt-pool-villa', number: 'V1', floor: 1, status: 'available' },
  { id: 'v-02', roomTypeId: 'rt-pool-villa', number: 'V2', floor: 1, status: 'cleaning' },
  { id: 'v-03', roomTypeId: 'rt-pool-villa', number: 'V3', floor: 1, status: 'available' },
  { id: 'g-01', roomTypeId: 'rt-garden-queen', number: 'G1', floor: 1, status: 'available' },
  { id: 'g-02', roomTypeId: 'rt-garden-queen', number: 'G2', floor: 1, status: 'available' },
  { id: 'g-03', roomTypeId: 'rt-garden-queen', number: 'G3', floor: 1, status: 'out_of_service' },
]

export const addons: Addon[] = [
  { id: 'ad-breakfast', slug: 'breakfast', name: 'Casa Breakfast', description: 'Chef’s daily spread — tropical fruit, fresh pandesal, brewed Benguet coffee.', price: 500, pricing: 'per_guest', image: img('1533089860892-a7c6f0a88666', 800, 600), active: true },
  { id: 'ad-transfer', slug: 'airport-transfer', name: 'Airport Transfer', description: 'Private air-conditioned transfer to and from the airport.', price: 1200, pricing: 'per_booking', image: img('1449965408869-eaa3f722e40d', 800, 600), active: true },
  { id: 'ad-spa', slug: 'couples-spa', name: 'Couples Spa Ritual', description: '90-minute side-by-side hilot massage with local coconut oil.', price: 2500, pricing: 'per_booking', image: img('1540555700478-4be289fbecef', 800, 600), active: true },
  { id: 'ad-setup', slug: 'romantic-setup', name: 'Romantic Room Setup', description: 'Rose petals, candles, and a chilled bottle of sparkling wine on arrival.', price: 1500, pricing: 'per_booking', image: img('1519225421980-715cb0215aed', 800, 600), active: true },
  { id: 'ad-checkout', slug: 'late-checkout', name: 'Late Checkout', description: 'Linger until 3pm — no rush to leave your escape.', price: 800, pricing: 'per_booking', image: img('1445019980597-93fa8acb246c', 800, 600), active: true },
  { id: 'ad-dinner', slug: 'dinner-for-two', name: 'Dinner for Two', description: 'A four-course set dinner on the terrace under the stars.', price: 2200, pricing: 'per_booking', image: img('1414235077428-338989a2e8c0', 800, 600), active: true },
]

export const packages: StayPackage[] = [
  {
    id: 'pk-weekend',
    name: 'Weekend Escape',
    description: 'Two unhurried nights with breakfast for two and a late checkout to stretch out Sunday.',
    nights: 2,
    roomTypeId: 'rt-deluxe-king',
    includedAddonIds: ['ad-breakfast', 'ad-checkout'],
    price: 10800,
    image: img('1618773928121-c32242e63f39', 900, 700),
    active: true,
  },
  {
    id: 'pk-romantic',
    name: 'Romantic Getaway',
    description: 'One night with a romantic room setup, dinner for two, and breakfast the morning after.',
    nights: 1,
    roomTypeId: 'rt-pool-villa',
    includedAddonIds: ['ad-setup', 'ad-dinner', 'ad-breakfast'],
    price: 14500,
    image: img('1520250497591-112f2f40a3f4', 900, 700),
    active: true,
  },
  {
    id: 'pk-family',
    name: 'Family Long Weekend',
    description: 'Three nights in the Family Suite with breakfast for four and airport transfers.',
    nights: 3,
    roomTypeId: 'rt-family-suite',
    includedAddonIds: ['ad-breakfast', 'ad-transfer'],
    price: 22900,
    image: img('1582719478250-c89cae4dc85b', 900, 700),
    active: true,
  },
]

export const reviews: Review[] = [
  { id: 'rv-1', guestName: 'Mika R.', roomTypeId: 'rt-deluxe-king', rating: 5, title: 'Exactly the reset we needed', body: 'The balcony at sunrise, the coffee bar, the quiet. We drove up from Manila on a whim and left feeling like we’d been away for a week.', date: '2026-09-02', approved: true },
  { id: 'rv-2', guestName: 'Paolo & Jen', roomTypeId: 'rt-pool-villa', rating: 5, title: 'The villa is worth every peso', body: 'Private pool, breakfast on the terrace, complete privacy. Best anniversary we’ve had.', date: '2026-08-21', approved: true, photo: img('1571003123894-1f0594d2b5d9', 600, 400) },
  { id: 'rv-3', guestName: 'The Santos Family', roomTypeId: 'rt-family-suite', rating: 4, title: 'Great for the kids', body: 'Loads of space and the staff were so warm with our little ones. Would have loved a slightly bigger tub.', date: '2026-08-10', approved: true },
  { id: 'rv-4', guestName: 'Aldous T.', roomTypeId: 'rt-garden-queen', rating: 5, title: 'Solo trip, fully recharged', body: 'Simple, spotless, and the garden view in the morning is genuinely lovely. Will be back.', date: '2026-07-28', approved: true },
  { id: 'rv-5', guestName: 'Carmen V.', roomTypeId: 'rt-deluxe-king', rating: 5, title: 'Thoughtful in every detail', body: 'From the toiletries to the turndown, everything felt considered. A rare find so close to the city.', date: '2026-07-15', approved: true },
  { id: 'rv-6', guestName: 'Anonymous', roomTypeId: 'rt-family-suite', rating: 2, title: 'AC was noisy', body: 'Room was nice but the aircon kept us up.', date: '2026-09-14', approved: false },
]

// A few seeded bookings so the availability engine and admin dashboard have data.
const today = new Date('2026-09-23')
const d = (offset: number) => {
  const x = new Date(today)
  x.setDate(x.getDate() + offset)
  return x.toISOString().slice(0, 10)
}

export const bookings: Booking[] = [
  {
    id: 'bk-1', reference: 'CASA-00118', roomTypeId: 'rt-deluxe-king', roomId: 'r-102',
    checkIn: d(-1), checkOut: d(2), guests: 2, status: 'checked_in',
    guestName: 'Liza Manalo', email: 'liza@example.com', phone: '+63 917 000 1111',
    addons: [{ addonId: 'ad-breakfast', quantity: 2 }],
    nightlyTotal: 14100, addonsTotal: 3000, subtotal: 17100, tax: 2052, total: 19152,
    createdAt: d(-10), userId: 'demo-customer',
  },
  {
    id: 'bk-2', reference: 'CASA-00121', roomTypeId: 'rt-family-suite', roomId: 'r-202',
    checkIn: d(0), checkOut: d(3), guests: 4, status: 'confirmed',
    guestName: 'The Reyes Family', email: 'reyes@example.com', phone: '+63 918 222 3333',
    addons: [{ addonId: 'ad-breakfast', quantity: 4 }, { addonId: 'ad-transfer', quantity: 1 }],
    nightlyTotal: 21900, addonsTotal: 7200, subtotal: 29100, tax: 3492, total: 32592,
    createdAt: d(-6),
  },
  {
    id: 'bk-3', reference: 'CASA-00124', roomTypeId: 'rt-pool-villa', roomId: 'v-02',
    checkIn: d(5), checkOut: d(7), guests: 2, status: 'confirmed',
    guestName: 'Demo Guest', email: 'demo@casahotel.ph', phone: '+63 917 555 0142',
    specialRequests: 'Celebrating an anniversary — any little touch appreciated.',
    addons: [{ addonId: 'ad-setup', quantity: 1 }, { addonId: 'ad-dinner', quantity: 1 }],
    nightlyTotal: 21000, addonsTotal: 3700, subtotal: 24700, tax: 2964, total: 27664,
    createdAt: d(-3), userId: 'demo-customer',
  },
  {
    id: 'bk-4', reference: 'CASA-00109', roomTypeId: 'rt-deluxe-king', roomId: 'r-101',
    checkIn: d(-20), checkOut: d(-18), guests: 2, status: 'checked_out',
    guestName: 'Demo Guest', email: 'demo@casahotel.ph', phone: '+63 917 555 0142',
    addons: [{ addonId: 'ad-breakfast', quantity: 2 }],
    nightlyTotal: 9000, addonsTotal: 2000, subtotal: 11000, tax: 1320, total: 12320,
    createdAt: d(-30), userId: 'demo-customer',
  },
  {
    id: 'bk-5', reference: 'CASA-00126', roomTypeId: 'rt-garden-queen', roomId: 'g-01',
    checkIn: d(1), checkOut: d(2), guests: 1, status: 'pending',
    guestName: 'Migs Cruz', email: 'migs@example.com', phone: '+63 919 444 5555',
    addons: [],
    nightlyTotal: 3400, addonsTotal: 0, subtotal: 3400, tax: 408, total: 3808,
    createdAt: d(0),
  },
]

export const auditLogs: AuditLog[] = [
  { id: 'al-1', actor: 'admin@casahotel.ph', action: 'Confirmed booking', target: 'CASA-00124', at: d(-3) + 'T09:12:00' },
  { id: 'al-2', actor: 'admin@casahotel.ph', action: 'Set room 103 to Maintenance', target: 'Room 103', at: d(-2) + 'T14:40:00' },
  { id: 'al-3', actor: 'admin@casahotel.ph', action: 'Approved review', target: 'rv-5', at: d(-1) + 'T08:05:00' },
  { id: 'al-4', actor: 'system', action: 'Guest booking created', target: 'CASA-00126', at: d(0) + 'T07:30:00' },
]
