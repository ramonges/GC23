import { SOLUTION } from '@/lib/vulcan/content'
import { Label, Reveal, Section } from './ui'

export default function SolutionSection() {
  return (
    <Section id="solution" theme="soft">
      <div className="grid grid-cols-12 gap-x-6 gap-y-8">
        <div className="col-span-12 lg:col-span-8">
          <Label>The solution</Label>
          <Reveal y={22}>
            <h2 className="mt-8 max-w-[17ch] font-grotesk text-[clamp(2.6rem,5.4vw,5.75rem)] font-medium leading-[0.98] tracking-[-0.032em] [text-wrap:balance]">
              {SOLUTION.headline}
            </h2>
          </Reveal>
        </div>
        <Reveal className="col-span-12 self-end md:col-span-8 lg:col-span-4" delay={0.12}>
          <p className="max-w-[30rem] text-[clamp(1.1rem,1.35vw,1.3rem)] leading-relaxed text-vulcan-paper/65">{SOLUTION.copy}</p>
        </Reveal>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 md:mt-20 md:grid-cols-3 md:gap-6">
        {SOLUTION.values.map((v, i) => (
          <Reveal key={v.title} delay={i * 0.1}>
            <div className="h-full border-t border-white/15 pt-6 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5">
              <div className="flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.22em]">
                <span className="text-vulcan-signal">0{i + 1}</span>
                {v.title}
              </div>
              <p className="mt-4 max-w-[20rem] text-[clamp(1.15rem,1.45vw,1.4rem)] leading-snug text-vulcan-paper/70">{v.text}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-16 md:mt-20" delay={0.1}>
        <p className="max-w-[46rem] border-l border-vulcan-signal/70 pl-6 text-[clamp(1.05rem,1.3vw,1.25rem)] leading-relaxed text-vulcan-paper/80">
          {SOLUTION.positioning}
        </p>
      </Reveal>
    </Section>
  )
}
