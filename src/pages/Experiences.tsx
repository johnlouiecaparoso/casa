import { useCasa } from '../lib/store'
import { useSEO } from '../lib/seo'
import { ButtonLink, SectionLabel } from '../components/ui'
import { peso } from '../lib/format'
import { addonPricingLabel } from '../lib/status'

export default function Experiences() {
  const { addons } = useCasa()
  useSEO({ title: 'Experiences & Add-ons', description: 'Enhance your Casa stay with breakfast, spa, dinner and more.' })

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
      <div className="max-w-xl">
        <SectionLabel>Make it yours</SectionLabel>
        <h1 className="mt-2 font-display text-4xl text-ink lg:text-5xl">Experiences & Add-ons</h1>
        <p className="mt-3 text-ink-soft">
          Small touches that turn a stay into a memory. Add any of these during booking.
        </p>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {addons.filter((a) => a.active).map((a) => (
          <article key={a.id} className="group overflow-hidden rounded-2xl border border-line bg-card">
            <div className="aspect-[16/10] overflow-hidden bg-paper-deep">
              <img src={a.image} alt={a.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="p-5">
              <h3 className="font-display text-xl text-ink">{a.name}</h3>
              <p className="mt-2 text-sm text-ink-soft">{a.description}</p>
              <div className="mt-4 flex items-baseline gap-1.5 border-t border-line pt-4">
                <span className="font-display text-xl text-ink">{peso(a.price)}</span>
                <span className="font-mono text-xs text-ink-soft">{addonPricingLabel[a.pricing]}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-12 rounded-2xl border border-line bg-paper-deep p-8 text-center">
        <h2 className="font-display text-2xl text-ink">Ready to plan your stay?</h2>
        <p className="mt-2 text-ink-soft">Pick your dates and add these during checkout.</p>
        <ButtonLink to="/availability" className="mt-5">Check availability</ButtonLink>
      </div>
    </div>
  )
}
