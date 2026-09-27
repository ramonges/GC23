'use client'

import Link from 'next/link'
import { CONTACT_EMAIL, CONTACT_HREF } from '@/lib/vulcan/content'

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-vulcan-ink px-5 py-12 sm:px-8 md:px-12">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.4fr_1fr_auto] md:items-end">
        <div>
          <div className="font-grotesk text-sm font-semibold tracking-[0.28em] text-white">VULCAN TRADE</div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-vulcan-aluminum">
            Supply-chain intelligence for the materials that build the future.
          </p>
          <p className="mt-6 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-vulcan-aluminum/60">
            Earth imagery: NASA Blue Marble &amp; Black Marble · Country shapes: Natural Earth · Journey imagery: illustrations
          </p>
        </div>
        <div className="space-y-2 font-mono text-[11px] uppercase tracking-[0.18em]">
          <a href={CONTACT_HREF} className="block text-white hover:text-vulcan-signal">{CONTACT_EMAIL} ↗</a>
          <Link href="/platform" className="block text-vulcan-aluminum hover:text-white">Platform</Link>
          <Link href="/writer" className="block text-vulcan-aluminum hover:text-white">Admin login</Link>
        </div>
        <div className="flex flex-col items-start gap-4 md:items-end">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-white hover:text-vulcan-signal"
          >
            Back to top ↑
          </button>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-vulcan-aluminum/60">
            © {new Date().getFullYear()} Vulcan Trade
          </p>
        </div>
      </div>
    </footer>
  )
}
