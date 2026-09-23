import { useState } from 'react'
import { useCasa } from '../../lib/store'
import { useSEO } from '../../lib/seo'
import { AdminPageHeader } from '../../layouts/AdminLayout'
import { Button, Card, Field, Input, Textarea } from '../../components/ui'
import { useToast } from '../../components/Toast'

export default function AdminContent() {
  const { roomTypes, settings } = useCasa()
  const toast = useToast()
  useSEO({ title: 'Content · Admin' })
  const [hero, setHero] = useState({ heading: settings.tagline, subtitle: 'A boutique hotel of eleven rooms and villas.' })

  return (
    <div>
      <AdminPageHeader title="Content management" subtitle="Edit homepage content and hotel information" />
      <form
        className="space-y-6"
        onSubmit={(e) => { e.preventDefault(); toast('success', 'Content saved (demo).') }}
      >
        <Card className="p-6">
          <h2 className="font-display text-lg text-ink">Hero</h2>
          <div className="mt-4 space-y-4">
            <Field label="Heading"><Input value={hero.heading} onChange={(e) => setHero({ ...hero, heading: e.target.value })} /></Field>
            <Field label="Subtitle"><Textarea value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} /></Field>
            <Field label="Hero image URL"><Input defaultValue="https://images.unsplash.com/photo-1566073771259-6a8506099945" /></Field>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg text-ink">Featured rooms</h2>
          <p className="mt-1 text-sm text-ink-soft">Choose which rooms appear on the homepage.</p>
          <div className="mt-4 space-y-2">
            {roomTypes.map((rt) => (
              <label key={rt.id} className="flex items-center gap-3 rounded-xl border border-line bg-card px-4 py-2.5">
                <input type="checkbox" defaultChecked={rt.featured} className="h-4 w-4 accent-[var(--color-clay)]" />
                <span className="text-sm text-ink">{rt.name}</span>
              </label>
            ))}
          </div>
        </Card>

        <Button type="submit" size="lg">Save changes</Button>
      </form>
    </div>
  )
}
