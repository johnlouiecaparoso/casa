import {
  Wifi, Tv, Snowflake, Trees, BedDouble, Coffee, Bath, Waves, Croissant, Lock,
  Wine, Laptop, Sofa, Car, Moon, Sparkles, type LucideIcon,
} from 'lucide-react'

const map: Record<string, LucideIcon> = {
  Wifi, Tv, Snowflake, Trees, BedDouble, Coffee, Bath, Waves, Croissant, Lock,
  Wine, Laptop, Sofa, Car, Moon, Sparkles,
}

export function AmenityIcon({ icon, className = 'h-4 w-4' }: { icon: string; className?: string }) {
  const Icon = map[icon] ?? Sparkles
  return <Icon className={className} aria-hidden="true" />
}
