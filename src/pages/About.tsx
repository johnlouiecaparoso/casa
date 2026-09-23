import { useSEO } from '../lib/seo'
import { ButtonLink, SectionLabel } from '../components/ui'

export default function About() {
  useSEO({ title: 'About Casa', description: 'The story behind Casa boutique hotel in Tagaytay.' })
  return (
    <div>
      <section className="relative h-[52vh] min-h-80 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=2000&h=1200&fit=crop&auto=format" alt="Casa lounge" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink/45" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-10 lg:px-8">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-paper/80">Our story</span>
          <h1 className="mt-3 max-w-2xl font-display text-4xl text-paper lg:text-6xl">Built for the pause between everything.</h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <div className="prose-casa space-y-6 text-lg leading-relaxed text-ink-soft">
          <p>
            <span className="font-display text-xl text-ink">Casa began with a simple frustration:</span> the best escapes always
            seemed to be a flight and a fortune away. We wanted somewhere you could reach on a Friday
            evening and feel changed by Sunday.
          </p>
          <p>
            So we built eleven rooms on a quiet ridge in Tagaytay — close enough to be easy, far enough
            to feel like leaving. Every room faces the light. Every corner invites you to slow down.
          </p>
          <p>
            We cook with what the region grows, we work with local artisans and healers, and we keep
            things small on purpose. Casa isn’t trying to be everything. It’s trying to be your quiet
            escape, close to home.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            { n: '11', l: 'Rooms & villas' },
            { n: '4.9', l: 'Average rating' },
            { n: '90 min', l: 'From Makati' },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-line bg-card p-6 text-center">
              <p className="font-display text-4xl text-clay">{s.n}</p>
              <p className="mt-1 text-sm text-ink-soft">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-paper-deep py-16">
        <div className="mx-auto max-w-7xl px-5 text-center lg:px-8">
          <SectionLabel>Come stay</SectionLabel>
          <h2 className="mt-2 font-display text-3xl text-ink lg:text-4xl">Your room is waiting.</h2>
          <ButtonLink to="/availability" className="mt-6" size="lg">Check availability</ButtonLink>
        </div>
      </section>
    </div>
  )
}
