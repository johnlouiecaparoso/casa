import { useCasa } from '../../lib/store'
import { useSEO } from '../../lib/seo'
import { AdminPageHeader } from '../../layouts/AdminLayout'
import { Card } from '../../components/ui'

export default function AdminActivity() {
  const { auditLogs } = useCasa()
  useSEO({ title: 'Activity · Admin' })

  return (
    <div>
      <AdminPageHeader title="Activity log" subtitle="Audit trail of staff and system actions" />
      <Card className="overflow-hidden">
        <ul className="divide-y divide-line">
          {auditLogs.map((log) => (
            <li key={log.id} className="flex items-start gap-4 px-5 py-4">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-clay" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink"><span className="font-medium">{log.action}</span> — {log.target}</p>
                <p className="text-xs text-ink-soft">{log.actor}</p>
              </div>
              <time className="shrink-0 font-mono text-xs text-ink-soft">
                {new Date(log.at).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </time>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
