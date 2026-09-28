import { CONTACT_HREF, LINKEDIN_HREF } from '@/lib/vulcan/content'

const EXPLORE = [
  { label: 'The problem', href: '#problem' },
  { label: 'The solution', href: '#solution' },
  { label: 'Team', href: '#team' },
  { label: 'Contact', href: '#contact' },
  { label: 'Platform', href: '/platform' },
  { label: 'Map', href: '/platform/map' },
]

export default function SiteFooter() {
  return (
    <footer data-theme="dark" className="border-t border-white/10 bg-vulcan-ink px-[6vw] pb-10 pt-16 text-vulcan-paper lg:px-[7vw]">
      <div className="mx-auto grid max-w-[1800px] grid-cols-12 gap-x-6 gap-y-12">
        <div className="col-span-12 lg:col-span-6">
          <div className="font-grotesk text-sm font-semibold tracking-[0.3em]">VULCAN TRADE</div>
          <p className="mt-8 max-w-[26rem] font-grotesk text-[clamp(1.6rem,2.4vw,2.4rem)] font-light leading-tight tracking-[-0.015em] text-vulcan-paper/85">
            Supply-chain intelligence for the materials that build the future.
          </p>
        </div>
        <nav className="col-span-6 lg:col-span-2 lg:col-start-9" aria-label="Explore">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-vulcan-muted">Explore</div>
          <ul className="mt-6 space-y-3">
            {EXPLORE.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="text-vulcan-paper/80 transition-colors hover:text-white">{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="col-span-6 lg:col-span-2">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-vulcan-muted">Get in touch</div>
          <ul className="mt-6 space-y-3">
            <li><a href={CONTACT_HREF} className="text-vulcan-paper/80 transition-colors hover:text-white">Email</a></li>
            <li><a href={LINKEDIN_HREF} target="_blank" rel="noreferrer" className="text-vulcan-paper/80 transition-colors hover:text-white">LinkedIn</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-16 flex max-w-[1800px] items-center justify-between border-t border-white/10 pt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-vulcan-muted">
        <span>© Vulcan Trade</span>
        <a href="#top" className="transition-colors hover:text-vulcan-paper">Back to top ↑</a>
      </div>
    </footer>
  )
}
