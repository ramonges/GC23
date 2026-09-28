import { ASK, CONTACT_HREF } from '@/lib/vulcan/content'
import { Arrow, Headline, Label, Reveal, Section } from './ui'

export default function AskSection() {
  return (
    <Section id="ask" theme="dark">
      <div className="grid grid-cols-12 gap-x-6">
        <div className="col-span-12 lg:col-span-10">
          <Label>The ask</Label>
          <Headline lines={ASK.headline} className="mt-10" />
        </div>
        <Reveal className="col-span-12 mt-12 md:col-span-8 lg:col-span-5 lg:col-start-7" delay={0.15}>
          <p className="text-[clamp(1.15rem,1.45vw,1.4rem)] leading-relaxed text-vulcan-paper/70">{ASK.copy}</p>
          <a
            href={CONTACT_HREF}
            className="group mt-12 inline-flex items-center gap-10 border-b border-vulcan-paper/40 pb-3 font-mono text-[13px] uppercase tracking-[0.22em] text-vulcan-paper transition-colors duration-500 hover:border-vulcan-paper"
          >
            Start a conversation
            <Arrow />
          </a>
        </Reveal>
      </div>
    </Section>
  )
}
