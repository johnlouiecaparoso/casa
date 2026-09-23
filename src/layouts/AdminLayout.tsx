import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import {
  LayoutDashboard, CalendarCheck, CalendarRange, DoorClosed, Layers, Tag,
  Sparkles, Package, Star, FileText, Settings, ScrollText, Menu, X, LogOut, ArrowUpRight,
} from 'lucide-react'
import { useCasa } from '../lib/store'
import { Button } from '../components/ui'

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/admin/calendar', label: 'Calendar', icon: CalendarRange },
  { to: '/admin/rooms', label: 'Rooms', icon: DoorClosed },
  { to: '/admin/room-types', label: 'Room Types', icon: Layers },
  { to: '/admin/rates', label: 'Rates', icon: Tag },
  { to: '/admin/addons', label: 'Experiences', icon: Sparkles },
  { to: '/admin/packages', label: 'Packages', icon: Package },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/content', label: 'Content', icon: FileText },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/activity', label: 'Activity', icon: ScrollText },
]

export function AdminLayout() {
  const { user, loginDemo, logout } = useCasa()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  // Demo-friendly: auto-enter staff mode when visiting admin.
  useEffect(() => {
    if (!user || user.role !== 'admin') loginDemo('admin')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Link to="/admin" className="flex items-baseline gap-1.5">
          <span className="font-display text-xl text-paper">Casa</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-clay">Staff</span>
        </Link>
        <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X className="h-5 w-5 text-paper" />
        </button>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2" aria-label="Admin">
        {links.map((l) => {
          const Icon = l.icon
          return (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive ? 'bg-clay text-white' : 'text-paper/70 hover:bg-white/5 hover:text-paper'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {l.label}
            </NavLink>
          )
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <Link to="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-paper/70 hover:text-paper">
          <ArrowUpRight className="h-4 w-4" /> View public site
        </Link>
        <button
          onClick={() => { logout(); navigate('/') }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-paper/70 hover:text-paper"
        >
          <LogOut className="h-4 w-4" /> Exit staff mode
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-paper-deep lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-screen bg-ink lg:block">{Sidebar}</aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-line bg-ink px-4 py-3 lg:hidden">
        <Link to="/admin" className="font-display text-lg text-paper">Casa <span className="font-mono text-[10px] text-clay">STAFF</span></Link>
        <button onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-6 w-6 text-paper" /></button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-ink">{Sidebar}</div>
        </div>
      )}

      <div className="min-w-0">
        <div className="flex items-center justify-between border-b border-line bg-card px-5 py-3">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">Read-only demo · seeded data</p>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-sm text-ink-soft">{user?.email}</span>
            <span className="h-8 w-8 rounded-full bg-clay/15 text-center font-display leading-8 text-clay-deep">C</span>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export function AdminPageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl text-ink lg:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export { Button }
