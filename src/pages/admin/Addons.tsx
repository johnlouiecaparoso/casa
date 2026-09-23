import { useCasa } from '../../lib/store'
import { useSEO } from '../../lib/seo'
import { AdminPageHeader } from '../../layouts/AdminLayout'
import { Badge, Button, Card } from '../../components/ui'
import { peso } from '../../lib/format'
import { addonPricingLabel } from '../../lib/status'

export default function AdminAddons() {
  const { addons } = useCasa()
  useSEO({ title: 'Experiences · Admin' })

  return (
    <div>
      <AdminPageHeader title="Experiences & add-ons" subtitle={`${addons.length} experiences`} action={<Button size="sm">+ New add-on</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {addons.map((a) => (
          <Card key={a.id} className="overflow-hidden">
            <img src={a.image} alt="" className="aspect-[16/9] w-full object-cover" />
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg text-ink">{a.name}</h2>
                <Badge tone={a.active ? 'sage' : 'neutral'}>{a.active ? 'Active' : 'Off'}</Badge>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{a.description}</p>
              <p className="mt-2 font-mono text-xs text-ink-soft">{peso(a.price)} · {addonPricingLabel[a.pricing]}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline">Edit</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
