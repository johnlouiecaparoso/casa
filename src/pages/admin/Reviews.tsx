import { useCasa } from '../../lib/store'
import { useSEO } from '../../lib/seo'
import { AdminPageHeader } from '../../layouts/AdminLayout'
import { Badge, Button, Card, Stars } from '../../components/ui'
import { formatDate } from '../../lib/format'
import { useToast } from '../../components/Toast'

export default function AdminReviews() {
  const { reviews, roomTypes, setReviewApproval, deleteReview } = useCasa()
  const toast = useToast()
  useSEO({ title: 'Reviews · Admin' })
  const typeName = (id: string) => roomTypes.find((r) => r.id === id)?.name ?? ''
  const pending = reviews.filter((r) => !r.approved)
  const approved = reviews.filter((r) => r.approved)

  return (
    <div>
      <AdminPageHeader title="Review moderation" subtitle={`${pending.length} awaiting approval`} />

      {pending.length > 0 && (
        <>
          <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-clay">Pending</h2>
          <div className="mb-8 grid gap-4 md:grid-cols-2">
            {pending.map((r) => (
              <Card key={r.id} className="p-5">
                <div className="flex items-center justify-between">
                  <Stars rating={r.rating} />
                  <span className="text-xs text-ink-soft">{typeName(r.roomTypeId)}</span>
                </div>
                <p className="mt-3 font-display text-lg text-ink">“{r.title}”</p>
                <p className="mt-1 text-sm text-ink-soft">{r.body}</p>
                <p className="mt-2 text-xs text-ink-soft">— {r.guestName} · {formatDate(r.date)}</p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={() => { setReviewApproval(r.id, true); toast('success', 'Review approved.') }}>Approve</Button>
                  <Button size="sm" variant="ghost" onClick={() => { deleteReview(r.id); toast('info', 'Review deleted.') }}>Delete</Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-sage">Published</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {approved.map((r) => (
          <Card key={r.id} className="p-5">
            <div className="flex items-center justify-between">
              <Stars rating={r.rating} />
              <Badge tone="sage">Live</Badge>
            </div>
            <p className="mt-3 font-display text-lg text-ink">“{r.title}”</p>
            <p className="mt-1 text-sm text-ink-soft">{r.body}</p>
            <p className="mt-2 text-xs text-ink-soft">— {r.guestName} · {typeName(r.roomTypeId)}</p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setReviewApproval(r.id, false); toast('info', 'Review hidden.') }}>Hide</Button>
              <Button size="sm" variant="ghost" onClick={() => { deleteReview(r.id); toast('info', 'Review deleted.') }}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
