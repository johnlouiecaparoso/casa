import { useEffect } from 'react'

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export function useSEO(opts: {
  title: string
  description?: string
  image?: string
  structuredData?: object
}) {
  useEffect(() => {
    document.title = `${opts.title} · Casa`
    if (opts.description) {
      setMeta('name', 'description', opts.description)
      setMeta('property', 'og:description', opts.description)
    }
    setMeta('property', 'og:title', `${opts.title} · Casa`)
    setMeta('property', 'og:type', 'website')
    if (opts.image) setMeta('property', 'og:image', opts.image)
    setLink('canonical', window.location.origin + window.location.pathname)

    let script: HTMLScriptElement | null = null
    if (opts.structuredData) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.text = JSON.stringify(opts.structuredData)
      document.head.appendChild(script)
    }
    return () => {
      if (script) document.head.removeChild(script)
    }
  }, [opts.title, opts.description, opts.image, opts.structuredData])
}
