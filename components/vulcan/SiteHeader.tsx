'use client'

import { useEffect, useState } from 'react'
import { CONTACT_HREF } from '@/lib/vulcan/content'
import { usePrefersReducedMotion } from '@/lib/vulcan/hooks'

type Tone = 'hero' | 'dark' | 'light'

const NAV = [
  { label: 'Platform', href: '/platform' },
  { label: 'Map', href: '/platform/map' },
]

export default function SiteHeader() {
  const [tone, setTone] = useState<Tone>('hero')
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const probe = 36
      const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-theme]'))
      const under = sections.find((s) => {
        const r = s.getBoundingClientRect()
        return r.top <= probe && r.bottom > probe
      })
      if (!under || under.id === 'top') setTone('hero')
      else setTone(under.dataset.theme === 'light' ? 'light' : 'dark')
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  const light = tone === 'light'
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,color] duration-700 ${
        tone === 'hero'
          ? 'border-b border-transparent text-vulcan-paper'
          : light
            ? 'border-b border-vulcan-ink/10 bg-vulcan-paper/85 text-vulcan-ink backdrop-blur-md'
            : 'border-b border-white/10 bg-vulcan-ink/75 text-vulcan-paper backdrop-blur-md'
      }`}
    >
      <div className="mx-auto flex items-center justify-between px-[6vw] py-5 lg:px-[7vw] md:py-7">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
          }}
          className="block"
          aria-label="Vulcan Trade — back to top"
        >
          {/* The wordmark is white; on light sections it is inverted, with a hue rotation keeping the accent square violet. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/vulcan-trade-logo.png"
            alt="Vulcan Trade — Supply-chain intelligence"
            width={837}
            height={120}
            className={`h-6 w-auto transition-[filter] duration-700 md:h-8 ${light ? 'invert hue-rotate-180' : ''}`}
          />
        </a>
        <div className="flex flex-col items-end gap-2.5">
          <nav aria-label="Primary" className="flex items-center gap-5 font-mono text-[11px] uppercase tracking-[0.22em] md:gap-8">
            {NAV.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`hidden whitespace-nowrap transition-colors duration-500 sm:inline ${light ? 'text-vulcan-ink/70 hover:text-vulcan-ink' : 'text-vulcan-paper/70 hover:text-white'}`}
              >
                {l.label}
              </a>
            ))}
            <a
              href={CONTACT_HREF}
              className={`group whitespace-nowrap transition-colors duration-500 ${light ? 'hover:text-vulcan-ink/60' : 'hover:text-white'}`}
            >
              Get in touch <span className="text-vulcan-signal">↗</span>
            </a>
          </nav>
          <div className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] ${light ? 'text-vulcan-ink/55' : 'text-vulcan-aluminum/75'}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/baltic-exchange.png" alt="" width={16} height={16} className="h-4 w-4 rounded-[2px]" />
            <span>Endorsed by Baltic Exchange</span>
          </div>
        </div>
      </div>
    </header>
  )
}
