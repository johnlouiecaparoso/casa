import type { RoomStatus } from '../../types'
import { useCasa } from '../../lib/store'
import { useSEO } from '../../lib/seo'
import { AdminPageHeader } from '../../layouts/AdminLayout'
import { Badge, Card } from '../../components/ui'
import { roomStatusLabel, roomStatusTone } from '../../lib/status'

const STATUSES: RoomStatus[] = ['available', 'occupied', 'reserved', 'cleaning', 'maintenance', 'out_of_service']

export default function AdminRooms() {
  const { rooms, roomTypes, setRoomStatus } = useCasa()
  useSEO({ title: 'Rooms · Admin' })
  const typeName = (id: string) => roomTypes.find((r) => r.id === id)?.name ?? ''

  const grouped = roomTypes.map((rt) => ({ rt, list: rooms.filter((r) => r.roomTypeId === rt.id) }))

  return (
    <div>
      <AdminPageHeader title="Physical rooms" subtitle={`${rooms.length} rooms across ${roomTypes.length} types`} />
      <div className="space-y-6">
        {grouped.map(({ rt, list }) => (
          <Card key={rt.id} className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <h2 className="font-display text-lg text-ink">{rt.name}</h2>
              <span className="font-mono text-xs text-ink-soft">{list.length} rooms</span>
            </div>
            <div className="divide-y divide-line">
              {list.map((room) => (
                <div key={room.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div className="flex items-center gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-paper-deep font-display text-lg text-ink">{room.number}</span>
                    <div>
                      <p className="text-sm font-medium text-ink">Room {room.number}</p>
                      <p className="text-xs text-ink-soft">{typeName(room.roomTypeId)} · Floor {room.floor}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={roomStatusTone[room.status]}>{roomStatusLabel[room.status]}</Badge>
                    <select
                      value={room.status}
                      onChange={(e) => setRoomStatus(room.id, e.target.value as RoomStatus)}
                      className="rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs text-ink focus:border-clay focus:outline-none"
                      aria-label={`Set status for room ${room.number}`}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{roomStatusLabel[s]}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
