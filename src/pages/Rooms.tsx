import { useState } from 'react'
import { useCasa } from '../lib/store'
import { useSEO } from '../lib/seo'
import { RoomCard } from '../components/RoomCard'
import { SectionLabel } from '../components/ui'

export default function Rooms() {
  const { roomTypes } = useCasa()
  const [sort, setSort] = useState<'featured' | 'low' | 'high'>('featured')
  useSEO({ title: 'Rooms & Villas', description: 'Browse Casa’s deluxe rooms, family suites and pool villas.' })

  const list = [...roomTypes.filter((r) => r.active)].sort((a, b) => {
    if (sort === 'low') return a.baseRate - b.baseRate
    if (sort === 'high') return b.baseRate - a.baseRate
    return Number(b.featured) - Number(a.featured)
  })

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SectionLabel>Stay with us</SectionLabel>
          <h1 className="mt-2 font-display text-4xl text-ink lg:text-5xl">Rooms & Villas</h1>
          <p className="mt-3 max-w-xl text-ink-soft">
            Eleven rooms and villas, each with its own character. Choose the space that fits your escape.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-full border border-line bg-card px-3 py-2 text-ink focus:border-clay focus:outline-none"
          >
            <option value="featured">Featured</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </label>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {list.map((rt) => (
          <RoomCard key={rt.id} rt={rt} />
        ))}
      </div>
    </div>
  )
}
