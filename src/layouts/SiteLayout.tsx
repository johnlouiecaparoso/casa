import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { Menu, X, User, MapPin, Phone, Mail } from 'lucide-react'
import { useCasa } from '../lib/store'
import { ButtonLink } from '../components/ui'

const nav = [
  { to: '/rooms', label: 'Rooms' },
  { to: '/experiences', label: 'Experiences' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

function Logo({ onDark = false }: { onDark?: boolean }) {
  return (
    <Link to="/" className="flex items-baseline gap-1.5">
      <span className={`font-display text-2xl tracking-tight ${onDark ? 'text-paper' : 'text-ink'}`}>Casa</span>
      <span className="h-1.5 w-1.5 rounded-full bg-clay" aria-hidden="true" />
    </Link>
  )
}

function Header() {
  const { user } = useCasa()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-line bg-paper/85 backdrop-blur-md' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `text-sm transition-colors hover:text-clay ${isActive ? 'text-clay' : 'text-ink'}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to={user ? '/account' : '/login'}
            className="inline-flex items-center gap-1.5 text-sm text-ink hover:text-clay"
          >
            <User className="h-4 w-4" />
            {user ? user.name.split(' ')[0] : 'Sign in'}
          </Link>
          <ButtonLink to="/availability" size="sm">
            Book a stay
          </ButtonLink>
        </div>
        <button
          className="lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-line bg-paper lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4" aria-label="Mobile">
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} className="rounded-lg px-2 py-2.5 text-ink hover:bg-ink/5">
                {n.label}
              </NavLink>
            ))}
            <Link to={user ? '/account' : '/login'} className="rounded-lg px-2 py-2.5 text-ink hover:bg-ink/5">
              {user ? 'My account' : 'Sign in'}
            </Link>
            <ButtonLink to="/availability" className="mt-2">
              Book a stay
            </ButtonLink>
          </nav>
        </div>
      )}
    </header>
  )
}

function Footer() {
  const { settings } = useCasa()
  return (
    <footer className="mt-24 bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-4 lg:px-8">
        <div>
          <Logo onDark />
          <p className="mt-4 max-w-xs text-sm text-paper/60">{settings.tagline}</p>
          <div className="mt-6 flex gap-4">
            {settings.social.map((s) => (
              <a key={s.label} href={s.url} className="text-sm text-paper/70 underline-offset-4 hover:text-paper hover:underline" target="_blank" rel="noreferrer">
                {s.label}
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-paper/50">Explore</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-paper/80">
            {nav.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="hover:text-paper">{n.label}</Link>
              </li>
            ))}
            <li><Link to="/availability" className="hover:text-paper">Check availability</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-paper/50">Visit</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-paper/80">
            <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-clay" /> {settings.address}</li>
            <li className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-clay" /> {settings.phone}</li>
            <li className="flex gap-2"><Mail className="h-4 w-4 shrink-0 text-clay" /> {settings.email}</li>
          </ul>
        </div>
        <div>
          <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-paper/50">Policies</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-paper/80">
            <li>Free cancellation windows apply per room</li>
            <li>Check-in 2:00 PM · Check-out 12:00 NN</li>
            <li>No smoking indoors</li>
            <li><Link to="/admin" className="text-clay hover:underline">Staff dashboard →</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-paper/50 sm:flex-row lg:px-8">
          <p>© {new Date().getFullYear()} Casa Boutique Hotel · Tagaytay, Philippines</p>
          <p>A portfolio demo — no real bookings are processed.</p>
        </div>
      </div>
    </footer>
  )
}

export function SiteLayout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
