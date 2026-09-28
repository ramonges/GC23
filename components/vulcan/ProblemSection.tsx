import { PROBLEM } from '@/lib/vulcan/content'
import { Label, Reveal, Section } from './ui'

export default function ProblemSection() {
  const [opaque, building] = PROBLEM.broader
  return (
    <Section id="problem" theme="light">
      <div className="grid grid-cols-12 gap-x-6 gap-y-8">
        <div className="col-span-12 lg:col-span-8">
          <Label light>The problem</Label>
          <Reveal y={22}>
            <h2 className="mt-8 max-w-[18ch] font-grotesk text-[clamp(2.6rem,5.4vw,5.75rem)] font-medium leading-[0.98] tracking-[-0.032em] text-vulcan-ink [text-wrap:balance]">
              {PROBLEM.headline}
            </h2>
          </Reveal>
        </div>
        <Reveal className="col-span-12 self-end md:col-span-8 lg:col-span-4" delay={0.12}>
          <p className="max-w-[28rem] text-[clamp(1.1rem,1.35vw,1.3rem)] leading-relaxed text-vulcan-ink/65">{PROBLEM.copy}</p>
        </Reveal>
      </div>

      <Reveal className="mt-16 border-t border-vulcan-ink/15 pt-10 md:mt-20" delay={0.1}>
        <p className="max-w-[34ch] font-grotesk text-[clamp(1.7rem,2.8vw,2.9rem)] font-medium leading-[1.1] tracking-[-0.02em] text-vulcan-ink [text-wrap:balance]">
          {opaque} <span className="text-vulcan-ink/45">{building}</span>
        </p>
      </Reveal>

      <ul className="mt-10 grid grid-cols-1 gap-px bg-vulcan-ink/10 sm:grid-cols-2 lg:grid-cols-4">
        {PROBLEM.risks.map((r, i) => (
          <li key={r.title} className="bg-vulcan-paper">
            <Reveal delay={0.15 + i * 0.08} className="h-full py-6 pr-6 sm:px-6 lg:first:pl-0">
              <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-vulcan-ink">
                <span aria-hidden className="h-1.5 w-1.5 shrink-0 bg-vulcan-signal" />
                {r.title}
              </div>
              <p className="mt-3 text-[15px] leading-snug text-vulcan-ink/60">{r.text}</p>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}
