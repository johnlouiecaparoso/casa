import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Compass, LayoutDashboard } from 'lucide-react'
import { useCasa } from '../lib/store'
import { useSEO } from '../lib/seo'
import { Button, Field, Input } from '../components/ui'
import { useToast } from '../components/Toast'

export default function Login() {
  const { login, loginDemo } = useCasa()
  const navigate = useNavigate()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  useSEO({ title: 'Sign in' })

  return (
    <div className="mx-auto grid min-h-[80vh] max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-2 lg:px-8">
      <div className="hidden overflow-hidden rounded-3xl lg:block">
        <img src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1000&h=1200&fit=crop&auto=format" alt="Casa room" className="h-full w-full object-cover" />
      </div>

      <div className="mx-auto w-full max-w-md">
        <h1 className="font-display text-4xl text-ink">Welcome back</h1>
        <p className="mt-2 text-ink-soft">Sign in to manage your stays and reviews.</p>

        <form
          className="mt-8 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            const result = await login(email || 'demo@casahotel.ph', password)
            if (!result.ok) { toast('error', result.error); return }
            toast('success', 'Signed in.')
            navigate('/account')
          }}
        >
          <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" /></Field>
          <Field label="Password" hint="Forgot?"><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></Field>
          <Button type="submit" className="w-full" size="lg">Sign in</Button>
        </form>

        <p className="mt-4 text-center text-sm text-ink-soft">
          New to Casa? <Link to="/register" className="font-medium text-clay hover:underline">Create an account</Link>
        </p>

        <div className="my-8 flex items-center gap-3 text-xs uppercase tracking-widest text-ink-soft">
          <span className="h-px flex-1 bg-line" /> Explore the demo <span className="h-px flex-1 bg-line" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button variant="outline" onClick={() => { loginDemo('customer'); navigate('/account') }}>
            <Compass className="h-4 w-4" /> Explore Casa
          </Button>
          <Button variant="dark" onClick={() => { loginDemo('admin'); navigate('/admin') }}>
            <LayoutDashboard className="h-4 w-4" /> Staff Dashboard
          </Button>
        </div>
        <p className="mt-3 text-center text-xs text-ink-soft">No account needed — demo data, read-only staff mode.</p>
      </div>
    </div>
  )
}
