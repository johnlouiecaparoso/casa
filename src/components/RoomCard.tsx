import { Link } from 'react-router'
import { Users, Maximize, BedDouble, ArrowRight } from 'lucide-react'
import type { RoomType } from '../types'
import { peso } from '../lib/format'
import { Badge } from './ui'

export function RoomCard({ rt, roomsAvailable }: { rt: RoomType; roomsAvailable?: number }) {
  return (
    <Link
      to={`/rooms/${rt.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-paper-deep">
        <img
          src={rt.photos[0]}
          alt={`${rt.name} at Casa`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {rt.featured && (
          <span className="absolute left-3 top-3">
            <Badge tone="ink">Featured</Badge>
          </span>
        )}
        {roomsAvailable !== undefined && (
          <span className="absolute right-3 top-3">
            <Badge tone={roomsAvailable > 0 ? 'sage' : 'red'}>
              {roomsAvailable > 0 ? `${roomsAvailable} left` : 'Sold out'}
            </Badge>
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-clay">{rt.tagline}</p>
        <h3 className="mt-1 font-display text-xl text-ink">{rt.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{rt.description}</p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-soft">
          <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {rt.maxGuests} guests</span>
          <span className="inline-flex items-center gap-1"><Maximize className="h-3.5 w-3.5" /> {rt.sizeSqm} m²</span>
          <span className="inline-flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {rt.bedType}</span>
        </div>
        <div className="mt-5 flex items-end justify-between border-t border-line pt-4">
          <p>
            <span className="font-display text-2xl text-ink">{peso(rt.baseRate)}</span>
            <span className="text-sm text-ink-soft"> / night</span>
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-clay transition-transform group-hover:translate-x-0.5">
            View <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}
