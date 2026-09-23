import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useCasa } from '../lib/store'
import { useSEO } from '../lib/seo'
import { Button, Field, Input } from '../components/ui'
import { useToast } from '../components/Toast'

export default function Register() {
  const { login } = useCasa()
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  useSEO({ title: 'Create account' })

  return (
    <div className="mx-auto grid min-h-[80vh] max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-2 lg:px-8">
      <div className="mx-auto w-full max-w-md order-2 lg:order-1">
        <h1 className="font-display text-4xl text-ink">Create your account</h1>
        <p className="mt-2 text-ink-soft">Save your details for faster booking and track your stays.</p>
        <form
          className="mt-8 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            const result = await login(form.email || 'demo@casahotel.ph', form.password, form.name)
            if (!result.ok) { toast('error', result.error); return }
            toast('success', 'Welcome to Casa!')
            navigate('/account')
          }}
        >
          <Field label="Full name"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Juan dela Cruz" /></Field>
          <Field label="Email"><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" /></Field>
          <Field label="Password" hint="8+ characters"><Input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" /></Field>
          <Button type="submit" className="w-full" size="lg">Create account</Button>
        </form>
        <p className="mt-4 text-center text-sm text-ink-soft">
          Already have an account? <Link to="/login" className="font-medium text-clay hover:underline">Sign in</Link>
        </p>
        <p className="mt-6 rounded-xl bg-paper-deep p-4 text-center text-sm text-ink-soft">
          You never need an account to book — guest checkout is always available.
        </p>
      </div>
      <div className="order-1 hidden overflow-hidden rounded-3xl lg:order-2 lg:block">
        <img src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1000&h=1200&fit=crop&auto=format" alt="Casa room" className="h-full w-full object-cover" />
      </div>
    </div>
  )
}
