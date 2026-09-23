import { useCasa } from '../../lib/store'
import { useSEO } from '../../lib/seo'
import { AdminPageHeader } from '../../layouts/AdminLayout'
import { Badge, Button, Card } from '../../components/ui'
import { peso } from '../../lib/format'

export default function AdminPackages() {
  const { packages, roomTypes, addons } = useCasa()
  useSEO({ title: 'Packages · Admin' })
  const typeName = (id: string) => roomTypes.find((r) => r.id === id)?.name ?? ''
  const addonName = (id: string) => addons.find((a) => a.id === id)?.name ?? ''

  return (
    <div>
      <AdminPageHeader title="Stay packages" subtitle={`${packages.length} packages`} action={<Button size="sm">+ New package</Button>} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <img src={p.image} alt="" className="aspect-[16/9] w-full object-cover" />
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg text-ink">{p.name}</h2>
                <Badge tone={p.active ? 'sage' : 'neutral'}>{p.active ? 'Active' : 'Off'}</Badge>
              </div>
              <p className="mt-1 text-sm text-ink-soft">{p.description}</p>
              <dl className="mt-3 space-y-1 text-xs text-ink-soft">
                <div className="flex justify-between"><dt>Room</dt><dd className="text-ink">{typeName(p.roomTypeId)}</dd></div>
                <div className="flex justify-between"><dt>Nights</dt><dd className="text-ink">{p.nights}</dd></div>
                <div className="flex justify-between"><dt>Includes</dt><dd className="text-right text-ink">{p.includedAddonIds.map(addonName).join(', ')}</dd></div>
                <div className="flex justify-between border-t border-line pt-1"><dt>Price</dt><dd className="font-display text-base text-ink">{peso(p.price)}</dd></div>
              </dl>
              <Button size="sm" variant="outline" className="mt-3">Edit</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
