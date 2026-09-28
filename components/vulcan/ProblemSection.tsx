import { PROBLEM } from '@/lib/vulcan/content'
import { Label, Reveal, Section } from './ui'

export default function ProblemSection() {
  const [opaque, change] = PROBLEM.lead
  return (
    <Section id="problem" theme="light" className="md:py-48">
      <Label light>The problem</Label>

      <h2 className="mt-12 max-w-[14ch] font-grotesk text-[clamp(3rem,7vw,7.5rem)] font-medium leading-[0.96] tracking-[-0.035em] text-vulcan-ink [text-wrap:balance] md:mt-16">
        <Reveal y={22}>
          <span className="block">{opaque}</span>
        </Reveal>
        <Reveal y={22} delay={0.12}>
          <span className="mt-2 block text-vulcan-ink/40">
            {change.replace(/\.$/, "")}
            <span className="text-vulcan-signal">.</span>
          </span>
        </Reveal>
      </h2>

      <div className="mt-24 grid grid-cols-12 gap-x-6 gap-y-10 border-t border-vulcan-ink/15 pt-10 md:mt-32 md:pt-14">
        <Reveal className="col-span-12 md:col-span-7 lg:col-span-6" delay={0.1}>
          <p className="max-w-[20ch] font-grotesk text-[clamp(1.9rem,3vw,3.1rem)] font-medium leading-[1.08] tracking-[-0.02em] text-vulcan-ink [text-wrap:balance]">
            {PROBLEM.headline}
          </p>
        </Reveal>
        <Reveal className="col-span-12 md:col-span-5 lg:col-span-4 lg:col-start-9" delay={0.2}>
          <p className="max-w-[28rem] text-[clamp(1.1rem,1.35vw,1.3rem)] leading-relaxed text-vulcan-ink/65 md:pt-2">{PROBLEM.copy}</p>
        </Reveal>
      </div>
    </Section>
  )
}
