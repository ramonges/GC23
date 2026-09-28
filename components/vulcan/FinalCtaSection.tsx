import { CONTACT_HREF, FINAL_CTA } from '@/lib/vulcan/content'
import { Arrow, Headline, Reveal, Section } from './ui'

export default function FinalCtaSection() {
  return (
    <Section id="contact" theme="dark">
      <div className="grid grid-cols-12 gap-x-6 gap-y-10">
        <div className="col-span-12 lg:col-span-8">
          <Headline lines={FINAL_CTA.headline} />
        </div>
        <Reveal className="col-span-12 self-end md:col-span-8 lg:col-span-4" delay={0.15}>
          <p className="max-w-[26rem] text-[clamp(1.1rem,1.35vw,1.3rem)] leading-relaxed text-vulcan-paper/70">{FINAL_CTA.copy}</p>
          <a
            href={CONTACT_HREF}
            className="group mt-10 inline-flex items-center gap-10 bg-vulcan-paper px-6 py-4 font-mono text-[12px] uppercase tracking-[0.22em] text-vulcan-ink transition-colors duration-500 hover:bg-white"
          >
            {FINAL_CTA.cta}
            <Arrow />
          </a>
          <div className="mt-6 flex gap-8 font-mono text-[12px] uppercase tracking-[0.22em]">
            <a href="/platform" className="group inline-flex items-center gap-3 border-b border-white/25 pb-1.5 text-vulcan-paper/80 transition-colors hover:border-white/60 hover:text-white">
              Open the platform <Arrow />
            </a>
            <a href="/platform/map" className="group inline-flex items-center gap-3 border-b border-white/25 pb-1.5 text-vulcan-paper/80 transition-colors hover:border-white/60 hover:text-white">
              Open the map <Arrow />
            </a>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
