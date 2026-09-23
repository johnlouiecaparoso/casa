import { useSEO } from '../lib/seo'
import { ButtonLink } from '../components/ui'

export default function NotFound() {
  useSEO({ title: 'Page not found' })
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-5 text-center">
      <p className="font-display text-7xl text-clay">404</p>
      <h1 className="mt-4 font-display text-3xl text-ink">This room doesn’t exist.</h1>
      <p className="mt-2 text-ink-soft">The page you’re looking for may have been moved or checked out.</p>
      <ButtonLink to="/" className="mt-6">Back home</ButtonLink>
    </div>
  )
}
