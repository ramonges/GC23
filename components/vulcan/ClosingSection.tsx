import Reveal from './Reveal'
import { CONTACT_HREF } from '@/lib/vulcan/content'

export default function ClosingSection() {
  return (
    <section id="closing" className="relative border-t border-white/10 bg-vulcan-ink px-5 py-28 sm:px-8 md:px-12 md:py-40">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="max-w-3xl text-xl leading-relaxed text-vulcan-aluminum md:text-2xl">
            The final product is visible. The supply chain behind it usually is not.
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="mt-10 max-w-6xl font-grotesk text-5xl font-medium uppercase leading-[0.98] tracking-[-0.03em] text-white md:text-7xl lg:text-[6.2rem]">
            Every robot begins with a <span className="text-vulcan-signal">material decision.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.16} className="mt-14 flex flex-col gap-3 sm:flex-row">
          <a
            href="/platform"
            className="group inline-flex items-center justify-between gap-8 bg-white px-6 py-4 font-mono text-xs uppercase tracking-[0.18em] text-vulcan-ink transition-colors duration-500 hover:bg-vulcan-signal hover:text-white"
          >
            See the intelligence layer
            <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </a>
          <a
            href={CONTACT_HREF}
            className="group inline-flex items-center justify-between gap-8 border border-white/25 px-6 py-4 font-mono text-xs uppercase tracking-[0.18em] text-white transition-colors duration-500 hover:border-vulcan-signal hover:text-vulcan-signal"
          >
            Talk to Vulcan Trade
            <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </a>
        </Reveal>
      </div>
    </section>
  )
}
