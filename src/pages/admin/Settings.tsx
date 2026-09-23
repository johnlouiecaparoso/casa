import { useState } from 'react'
import { useCasa } from '../../lib/store'
import { useSEO } from '../../lib/seo'
import { AdminPageHeader } from '../../layouts/AdminLayout'
import { Button, Card, Field, Input } from '../../components/ui'
import { useToast } from '../../components/Toast'

export default function AdminSettings() {
  const { settings } = useCasa()
  const toast = useToast()
  useSEO({ title: 'Settings · Admin' })
  const [form, setForm] = useState({
    name: settings.name,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    tax: String(settings.taxRate * 100),
  })

  return (
    <div>
      <AdminPageHeader title="Hotel settings" subtitle="Contact details, tax and policies" />
      <form
        className="max-w-2xl space-y-6"
        onSubmit={(e) => { e.preventDefault(); toast('success', 'Settings saved (demo).') }}
      >
        <Card className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Hotel name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Tax rate (%)"><Input type="number" value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })} /></Field>
            <div className="sm:col-span-2"><Field label="Address"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field></div>
            <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Email"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="font-display text-lg text-ink">Integrations</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center justify-between rounded-lg bg-paper-deep px-4 py-2.5"><span>Supabase (Auth · DB · Storage)</span><span className="font-mono text-xs text-ink-soft">ready to connect</span></li>
            <li className="flex items-center justify-between rounded-lg bg-paper-deep px-4 py-2.5"><span>Resend (transactional email)</span><span className="font-mono text-xs text-ink-soft">abstraction in place</span></li>
            <li className="flex items-center justify-between rounded-lg bg-paper-deep px-4 py-2.5"><span>SMS (Phase 2)</span><span className="font-mono text-xs text-ink-soft">interface prepared</span></li>
          </ul>
        </Card>
        <Button type="submit" size="lg">Save settings</Button>
      </form>
    </div>
  )
}
