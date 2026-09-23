import { Link } from 'react-router'
import { ArrowRight, Waves, Croissant, Sparkles, Sofa, Wifi, MapPin, Star } from 'lucide-react'
import { useCasa } from '../lib/store'
import { useSEO } from '../lib/seo'
import { AvailabilitySearch } from '../components/AvailabilitySearch'
import { RoomCard } from '../components/RoomCard'
import { Button, ButtonLink, Card, SectionLabel, Stars } from '../components/ui'
import { peso, formatDate } from '../lib/format'

const experiences = [
  { icon: Waves, title: 'Infinity Pool', body: 'A quiet ridge-edge pool that catches the afternoon light.' },
  { icon: Croissant, title: 'Casa Breakfast', body: 'Local produce, brewed Benguet coffee, served slow.' },
  { icon: Sparkles, title: 'Hilot Spa', body: 'Traditional Filipino massage in our garden cabana.' },
  { icon: Sofa, title: 'The Lounge', body: 'Books, records, and a fireplace for cooler evenings.' },
  { icon: Wifi, title: 'Stay Connected', body: 'Fast fibre throughout, for the days you can’t fully unplug.' },
]

export default function Home() {
  const { roomTypes, packages, reviews, settings } = useCasa()
  const featured = roomTypes.filter((r) => r.featured).slice(0, 3)
  const approved = reviews.filter((r) => r.approved).slice(0, 3)

  useSEO({
    title: 'Boutique Hotel & Staycations',
    description: `${settings.tagline} A boutique hotel in Tagaytay for staycations, couples and families.`,
    image: roomTypes[0].photos[0],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Hotel',
      name: 'Casa',
      description: settings.tagline,
      address: { '@type': 'PostalAddress', streetAddress: settings.address },
      telephone: settings.phone,
      priceRange: '₱₱₱',
      starRating: { '@type': 'Rating', ratingValue: '5' },
    },
  })

  return (
    <>
      {/* Hero */}
      <section className="relative">
        <div className="relative min-h-[92vh] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=2000&h=1400&fit=crop&auto=format"
            alt="Casa boutique hotel pool at dusk"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-ink/20 to-ink/70" />
          <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-end px-5 pb-10 pt-28 lg:px-8">
            <div className="max-w-2xl animate-fade-up">
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-paper/80">
                Tagaytay · Philippines
              </span>
              <h1 className="mt-4 font-display text-5xl leading-[1.05] text-paper sm:text-6xl lg:text-7xl">
                Your quiet escape, close to home.
              </h1>
              <p className="mt-5 max-w-lg text-lg text-paper/85">
                A boutique hotel of eleven rooms and villas, made for staycations, slow weekends,
                and the people you take them with.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink to="/availability" size="lg">
                  Check availability
                </ButtonLink>
                <ButtonLink to="/rooms" size="lg" variant="outline" className="border-paper/40 !text-paper hover:bg-paper/10">
                  Explore rooms <ArrowRight className="h-4 w-4" />
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
        {/* Availability search overlapping hero */}
        <div className="relative z-10 mx-auto -mt-14 max-w-5xl px-5 pb-2 lg:px-8">
          <Card className="p-4 shadow-xl sm:p-5">
            <AvailabilitySearch variant="bar" />
          </Card>
        </div>
      </section>

      {/* Featured rooms */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionLabel>The rooms</SectionLabel>
            <h2 className="mt-2 max-w-md font-display text-3xl text-ink lg:text-4xl">
              Rooms designed for rest, not just sleep.
            </h2>
          </div>
          <Link to="/rooms" className="inline-flex items-center gap-1 text-sm font-medium text-clay hover:gap-2 transition-all">
            All rooms <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((rt) => (
            <RoomCard key={rt.id} rt={rt} />
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="bg-paper-deep py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-md">
            <SectionLabel>The experience</SectionLabel>
            <h2 className="mt-2 font-display text-3xl text-ink lg:text-4xl">
              Everything you need. Nothing you don’t.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {experiences.map((e) => {
              const Icon = e.icon
              return (
                <div key={e.title} className="rounded-2xl border border-line bg-card p-5">
                  <Icon className="h-6 w-6 text-clay" />
                  <h3 className="mt-4 font-display text-lg text-ink">{e.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-soft">{e.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionLabel>Staycation packages</SectionLabel>
            <h2 className="mt-2 font-display text-3xl text-ink lg:text-4xl">Curated stays, one price.</h2>
          </div>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {packages.filter((p) => p.active).map((p) => (
            <article key={p.id} className="group overflow-hidden rounded-2xl border border-line bg-card">
              <div className="aspect-[16/10] overflow-hidden bg-paper-deep">
                <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-xl text-ink">{p.name}</h3>
                  <span className="font-mono text-xs text-ink-soft">{p.nights}N</span>
                </div>
                <p className="mt-2 text-sm text-ink-soft">{p.description}</p>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                  <span className="font-display text-xl text-ink">{peso(p.price)}</span>
                  <ButtonLink to="/availability" variant="outline" size="sm">Book package</ButtonLink>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-ink py-20 text-paper">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-clay">Guest reviews</span>
              <h2 className="mt-2 font-display text-3xl lg:text-4xl">Loved by weekenders.</h2>
            </div>
            <Link to="/reviews" className="hidden items-center gap-1 text-sm text-paper/80 hover:text-paper sm:inline-flex">
              Read all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {approved.map((r) => (
              <figure key={r.id} className="rounded-2xl border border-paper/15 bg-white/5 p-6">
                <Stars rating={r.rating} />
                <blockquote className="mt-4 font-display text-lg leading-snug">“{r.title}”</blockquote>
                <p className="mt-2 text-sm text-paper/70">{r.body}</p>
                <figcaption className="mt-4 text-sm text-paper/60">— {r.guestName} · {formatDate(r.date)}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionLabel>Where to find us</SectionLabel>
            <h2 className="mt-2 font-display text-3xl text-ink lg:text-4xl">A short drive, a world away.</h2>
            <p className="mt-4 flex items-start gap-2 text-ink-soft">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-clay" /> {settings.address}
            </p>
            <ul className="mt-6 space-y-3 text-sm text-ink-soft">
              {['10 min to Tagaytay Rotonda', '15 min to Sky Ranch', '20 min to Picnic Grove', '90 min from Makati'].map((n) => (
                <li key={n} className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-gold" /> {n}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex gap-3">
              <ButtonLink to="/contact" variant="dark">Get directions</ButtonLink>
              <Button variant="outline" onClick={() => window.open('tel:' + settings.phone)}>Call {settings.phone}</Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-line">
            <img
              src="https://images.unsplash.com/photo-1518509562904-e7ef99cddc28?w=1200&h=1000&fit=crop&auto=format"
              alt="View near Casa in Tagaytay"
              loading="lazy"
              className="aspect-[6/5] w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />
    </>
  )
}

function Newsletter() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-4 lg:px-8">
      <div className="overflow-hidden rounded-3xl bg-clay px-6 py-12 text-center text-white sm:px-12 sm:py-16">
        <h2 className="font-display text-3xl sm:text-4xl">Slow news, quarterly.</h2>
        <p className="mx-auto mt-3 max-w-md text-white/85">
          Seasonal offers, new experiences, and the occasional recipe from our kitchen.
        </p>
        <form
          className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault()
            const input = (e.currentTarget.elements.namedItem('email') as HTMLInputElement)
            input.value = ''
            input.placeholder = 'Thank you — you’re on the list ✦'
          }}
        >
          <input
            name="email"
            type="email"
            required
            placeholder="you@email.com"
            className="flex-1 rounded-full border border-white/30 bg-white/10 px-5 py-3 text-white placeholder:text-white/60 focus:border-white focus:outline-none"
          />
          <button className="rounded-full bg-ink px-6 py-3 font-medium text-paper transition hover:bg-ink/90">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  )
}
