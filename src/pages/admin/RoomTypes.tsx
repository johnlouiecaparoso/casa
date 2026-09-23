import { useCasa } from '../../lib/store'
import { useSEO } from '../../lib/seo'
import { AdminPageHeader } from '../../layouts/AdminLayout'
import { Badge, Button, Card } from '../../components/ui'
import { peso } from '../../lib/format'

export default function AdminRoomTypes() {
  const { roomTypes, rooms } = useCasa()
  useSEO({ title: 'Room Types · Admin' })
  const count = (id: string) => rooms.filter((r) => r.roomTypeId === id).length

  return (
    <div>
      <AdminPageHeader title="Room types" subtitle="Manage the room categories guests can book" action={<Button size="sm">+ New room type</Button>} />
      <div className="grid gap-4 md:grid-cols-2">
        {roomTypes.map((rt) => (
          <Card key={rt.id} className="overflow-hidden">
            <div className="flex">
              <img src={rt.photos[0]} alt="" className="h-32 w-32 shrink-0 object-cover" />
              <div className="min-w-0 flex-1 p-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg text-ink">{rt.name}</h2>
                  {rt.featured && <Badge tone="gold">Featured</Badge>}
                  <Badge tone={rt.active ? 'sage' : 'neutral'}>{rt.active ? 'Active' : 'Hidden'}</Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{rt.description}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-ink-soft">
                  <span>{peso(rt.baseRate)}/night</span>
                  <span>{rt.maxGuests} guests</span>
                  <span>{rt.sizeSqm} m²</span>
                  <span>{count(rt.id)} rooms</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 border-t border-line px-4 py-2.5">
              <Button size="sm" variant="outline">Edit</Button>
              <Button size="sm" variant="ghost">Photos</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
