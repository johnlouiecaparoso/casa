import { useMemo } from 'react'
import { useCasa } from '../lib/store'
import { useSEO } from '../lib/seo'
import { SectionLabel, Stars } from '../components/ui'
import { formatDate } from '../lib/format'

export default function Reviews() {
  const { reviews, roomTypes } = useCasa()
  useSEO({ title: 'Guest Reviews', description: 'Real reviews from Casa guests.' })
  const approved = reviews.filter((r) => r.approved)
  const avg = useMemo(
    () => (approved.length ? approved.reduce((s, r) => s + r.rating, 0) / approved.length : 0),
    [approved],
  )
  const typeName = (id: string) => roomTypes.find((rt) => rt.id === id)?.name ?? 'Casa'

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <SectionLabel>Kind words</SectionLabel>
          <h1 className="mt-2 font-display text-4xl text-ink lg:text-5xl">Guest Reviews</h1>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-line bg-card px-6 py-4">
          <span className="font-display text-5xl text-ink">{avg.toFixed(1)}</span>
          <div>
            <Stars rating={Math.round(avg)} />
            <p className="mt-1 text-sm text-ink-soft">{approved.length} verified reviews</p>
          </div>
        </div>
      </div>
      <div className="mt-10 columns-1 gap-6 sm:columns-2 lg:columns-3">
        {approved.map((r) => (
          <figure key={r.id} className="mb-6 break-inside-avoid rounded-2xl border border-line bg-card p-6">
            <div className="flex items-center justify-between">
              <Stars rating={r.rating} />
              <span className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">{typeName(r.roomTypeId)}</span>
            </div>
            <blockquote className="mt-4 font-display text-lg text-ink">“{r.title}”</blockquote>
            <p className="mt-2 text-sm text-ink-soft">{r.body}</p>
            {r.photo && <img src={r.photo} alt="" loading="lazy" className="mt-4 aspect-video w-full rounded-xl object-cover" />}
            <figcaption className="mt-4 text-sm text-ink-soft">— {r.guestName} · {formatDate(r.date)}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
