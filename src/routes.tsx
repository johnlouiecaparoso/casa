import { createBrowserRouter } from 'react-router'
import { SiteLayout } from './layouts/SiteLayout'
import { AdminLayout } from './layouts/AdminLayout'

import Home from './pages/Home'
import Rooms from './pages/Rooms'
import RoomDetail from './pages/RoomDetail'
import Availability from './pages/Availability'
import Experiences from './pages/Experiences'
import BookingFlow from './pages/BookingFlow'
import Confirmation from './pages/Confirmation'
import Reviews from './pages/Reviews'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import Account from './pages/Account'
import AccountBookings from './pages/AccountBookings'
import NotFound from './pages/NotFound'

import AdminDashboard from './pages/admin/Dashboard'
import AdminBookings from './pages/admin/Bookings'
import AdminCalendar from './pages/admin/Calendar'
import AdminRooms from './pages/admin/Rooms'
import AdminRoomTypes from './pages/admin/RoomTypes'
import AdminRates from './pages/admin/Rates'
import AdminAddons from './pages/admin/Addons'
import AdminPackages from './pages/admin/Packages'
import AdminReviews from './pages/admin/Reviews'
import AdminContent from './pages/admin/Content'
import AdminSettings from './pages/admin/Settings'
import AdminActivity from './pages/admin/Activity'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: SiteLayout,
    children: [
      { index: true, Component: Home },
      { path: 'rooms', Component: Rooms },
      { path: 'rooms/:slug', Component: RoomDetail },
      { path: 'availability', Component: Availability },
      { path: 'experiences', Component: Experiences },
      { path: 'booking', Component: BookingFlow },
      { path: 'booking/confirmation', Component: Confirmation },
      { path: 'reviews', Component: Reviews },
      { path: 'about', Component: About },
      { path: 'contact', Component: Contact },
      { path: 'login', Component: Login },
      { path: 'register', Component: Register },
      { path: 'account', Component: Account },
      { path: 'account/bookings', Component: AccountBookings },
      { path: '*', Component: NotFound },
    ],
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: 'bookings', Component: AdminBookings },
      { path: 'calendar', Component: AdminCalendar },
      { path: 'rooms', Component: AdminRooms },
      { path: 'room-types', Component: AdminRoomTypes },
      { path: 'rates', Component: AdminRates },
      { path: 'addons', Component: AdminAddons },
      { path: 'packages', Component: AdminPackages },
      { path: 'reviews', Component: AdminReviews },
      { path: 'content', Component: AdminContent },
      { path: 'settings', Component: AdminSettings },
      { path: 'activity', Component: AdminActivity },
    ],
  },
])
