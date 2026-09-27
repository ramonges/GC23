'use client'

import { useEffect, useState } from 'react'
import { CONTACT_HREF } from '@/lib/vulcan/content'
import { usePrefersReducedMotion } from '@/lib/vulcan/hooks'

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById('top')
      const threshold = hero ? hero.offsetHeight - window.innerHeight * 0.5 : window.innerHeight
      setScrolled(window.scrollY > threshold)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-700 ${
        scrolled ? 'border-b border-white/10 bg-vulcan-ink/80 backdrop-blur-md' : 'border-b border-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-5 py-4 sm:px-8 md:px-12 md:py-6">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
          }}
          className="group flex items-center gap-3"
          aria-label="Vulcan Trade — back to top"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6 text-vulcan-signal">
            <path d="M12 2 22 20H2L12 2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 9 17 18H7l5-9Z" fill="currentColor" />
          </svg>
          <span className="flex flex-col leading-none">
            <span className="font-grotesk text-sm font-semibold tracking-[0.28em] text-white">VULCAN TRADE</span>
            <span className="mt-1.5 font-mono text-[9px] tracking-[0.24em] text-vulcan-aluminum">SUPPLY-CHAIN INTELLIGENCE</span>
          </span>
        </a>
        <a
          href={CONTACT_HREF}
          className="whitespace-nowrap border border-white/25 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white sm:px-4 sm:text-[11px] sm:tracking-[0.18em] transition-colors duration-500 hover:border-vulcan-signal hover:text-vulcan-signal"
        >
          Get in touch ↗
        </a>
      </div>
    </header>
  )
}
