import { parseDate } from './booking-engine'

export const peso = (n: number) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(n)

export const formatDate = (iso: string, opts?: Intl.DateTimeFormatOptions) =>
  parseDate(iso).toLocaleDateString('en-PH', opts ?? { month: 'short', day: 'numeric', year: 'numeric' })

export const formatDateShort = (iso: string) =>
  parseDate(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })

export const formatRange = (checkIn: string, checkOut: string) => {
  const a = parseDate(checkIn)
  const b = parseDate(checkOut)
  const sameMonth = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
  if (sameMonth) {
    return `${a.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}–${b.getDate()}, ${b.getFullYear()}`
  }
  return `${formatDateShort(checkIn)} – ${formatDate(checkOut)}`
}

export const genReference = (seq: number) => `CASA-${String(seq).padStart(5, '0')}`
