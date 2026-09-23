import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { BookingAddonLine } from '../types'

export interface BookingDraft {
  checkIn: string
  checkOut: string
  guests: number
  roomTypeId: string | null
  addons: BookingAddonLine[]
  guest: {
    name: string
    email: string
    phone: string
    specialRequests: string
    arrivalTime: string
    travelPurpose: string
  }
}

const empty: BookingDraft = {
  checkIn: '',
  checkOut: '',
  guests: 2,
  roomTypeId: null,
  addons: [],
  guest: { name: '', email: '', phone: '', specialRequests: '', arrivalTime: '', travelPurpose: '' },
}

interface DraftCtx {
  draft: BookingDraft
  update: (patch: Partial<BookingDraft>) => void
  updateGuest: (patch: Partial<BookingDraft['guest']>) => void
  setAddon: (addonId: string, quantity: number) => void
  reset: () => void
}

const Ctx = createContext<DraftCtx | null>(null)

export function BookingDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<BookingDraft>(empty)

  const value = useMemo<DraftCtx>(
    () => ({
      draft,
      update: (patch) => setDraft((d) => ({ ...d, ...patch })),
      updateGuest: (patch) => setDraft((d) => ({ ...d, guest: { ...d.guest, ...patch } })),
      setAddon: (addonId, quantity) =>
        setDraft((d) => {
          const rest = d.addons.filter((a) => a.addonId !== addonId)
          return { ...d, addons: quantity > 0 ? [...rest, { addonId, quantity }] : rest }
        }),
      reset: () => setDraft(empty),
    }),
    [draft],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useDraft() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useDraft must be used within BookingDraftProvider')
  return ctx
}
