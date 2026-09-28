'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { EXPANSION } from '@/lib/vulcan/content'
import { EASE, Headline, Label, Reveal, Section } from './ui'

export default function ExpansionSection() {
  const reduced = useReducedMotion()
  const n = EXPANSION.path.length
  return (
    <Section id="expansion" theme="light">
      <Label light>Land and expand</Label>
      <Headline lines={EXPANSION.headline} className="mt-10 text-vulcan-ink" />

      <div className="relative mt-24 md:mt-32">
        <div aria-hidden className="absolute left-0 right-0 top-[38px] hidden h-px bg-vulcan-ink/10 md:block">
          <motion.div
            className="h-px origin-left bg-vulcan-ink/60"
            initial={reduced ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '0px 0px -20% 0px' }}
            transition={{ duration: 2.6, ease: EASE }}
          />
        </div>
        <ol className="grid grid-cols-1 gap-10 md:grid-cols-5 md:gap-6">
          {EXPANSION.path.map((step, i) => {
            const size = 10 + i * 9
            return (
              <Reveal key={step} delay={0.25 + i * 0.18}>
                <li className="list-none">
                  <div className="flex h-[76px] items-center">
                    <span
                      aria-hidden
                      className={`block rounded-full border ${i === n - 1 ? 'border-vulcan-signal bg-vulcan-signal/10' : 'border-vulcan-ink/40 bg-vulcan-paper'}`}
                      style={{ width: size, height: size }}
                    />
                  </div>
                  <div className="mt-4 font-mono text-[11px] tracking-[0.2em] text-vulcan-ink/50">0{i + 1}</div>
                  <div className="mt-2 font-grotesk text-[clamp(1.3rem,1.7vw,1.7rem)] font-medium leading-tight tracking-[-0.01em] text-vulcan-ink">{step}</div>
                </li>
              </Reveal>
            )
          })}
        </ol>
      </div>

      <Reveal delay={0.4} className="mt-24 md:mt-32">
        <div className="grid max-w-[46rem] grid-cols-3 border-t border-vulcan-ink/15">
          {EXPANSION.timeline.map((t, i) => (
            <div key={t} className="border-r border-vulcan-ink/10 pr-4 pt-5 last:border-r-0">
              <div className={`h-px w-8 ${i === 0 ? 'bg-vulcan-signal' : 'bg-vulcan-ink/30'}`} />
              <div className="mt-4 font-mono text-[12px] uppercase tracking-[0.2em] text-vulcan-ink">{t}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  )
}
