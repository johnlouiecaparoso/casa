import { useState } from 'react'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { useCasa } from '../lib/store'
import { useSEO } from '../lib/seo'
import { Button, Field, Input, Textarea, SectionLabel } from '../components/ui'
import { useToast } from '../components/Toast'

export default function Contact() {
  const { settings } = useCasa()
  const toast = useToast()
  const [sent, setSent] = useState(false)
  useSEO({ title: 'Contact', description: 'Get in touch with Casa boutique hotel.' })

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
      <div className="max-w-xl">
        <SectionLabel>Say hello</SectionLabel>
        <h1 className="mt-2 font-display text-4xl text-ink lg:text-5xl">Contact us</h1>
        <p className="mt-3 text-ink-soft">Questions about a stay, an event, or a special request? We’d love to help.</p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-5">
          {[
            { icon: MapPin, label: 'Address', value: settings.address },
            { icon: Phone, label: 'Phone', value: settings.phone },
            { icon: Mail, label: 'Email', value: settings.email },
            { icon: Clock, label: 'Front desk', value: 'Open daily · 7:00 AM – 10:00 PM' },
          ].map((c) => {
            const Icon = c.icon
            return (
              <div key={c.label} className="flex gap-4 rounded-2xl border border-line bg-card p-5">
                <Icon className="h-5 w-5 shrink-0 text-clay" />
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-ink-soft">{c.label}</p>
                  <p className="mt-1 text-ink">{c.value}</p>
                </div>
              </div>
            )
          })}
        </div>

        <form
          className="rounded-2xl border border-line bg-card p-6 sm:p-8"
          onSubmit={(e) => {
            e.preventDefault()
            setSent(true)
            toast('success', 'Thanks — we’ll be in touch within one business day.')
          }}
        >
          {sent ? (
            <div className="flex h-full flex-col items-center justify-center py-10 text-center">
              <p className="font-display text-2xl text-ink">Message received</p>
              <p className="mt-2 text-ink-soft">We’ll reply to your email shortly.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name"><Input required placeholder="Your name" /></Field>
                <Field label="Email"><Input type="email" required placeholder="you@email.com" /></Field>
              </div>
              <Field label="Subject"><Input placeholder="How can we help?" /></Field>
              <Field label="Message"><Textarea required placeholder="Tell us a little about what you need…" /></Field>
              <Button type="submit" className="w-full" size="lg">Send message</Button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
