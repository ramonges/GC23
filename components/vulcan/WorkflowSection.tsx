'use client'

import { motion } from 'framer-motion'
import { WORKFLOW } from '@/lib/vulcan/content'
import { EASE, Label, Reveal, Section, useReducedMotion } from './ui'

export default function WorkflowSection() {
  const reduced = useReducedMotion()
  return (
    <Section id="how-it-works" theme="dark">
      <Label>How it works</Label>
      <div className="relative mt-16 md:mt-24">
        <div aria-hidden className="absolute left-0 right-0 top-[7px] hidden h-px bg-white/15 md:block">
          <motion.div
            className="h-px origin-left bg-vulcan-paper/50"
            initial={reduced ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '0px 0px -20% 0px' }}
            transition={{ duration: 2.4, ease: EASE }}
          />
          {!reduced && (
            <motion.span
              className="absolute -top-[3px] block h-[7px] w-[7px] rounded-full bg-vulcan-signal"
              animate={{ left: ['0%', '100%'] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.8 }}
            />
          )}
        </div>
        <div className="grid grid-cols-1 gap-14 md:grid-cols-3 md:gap-8">
          {WORKFLOW.map((s, i) => (
            <Reveal key={s.title} delay={0.2 + i * 0.15} className="relative">
              <span aria-hidden className="hidden h-[15px] w-[15px] border border-white/40 bg-vulcan-ink md:block" />
              <div className="mt-0 flex items-baseline gap-4 md:mt-12">
                <span className="font-mono text-[12px] tracking-[0.2em] text-vulcan-signal">{s.number}</span>
                <h3 className="font-grotesk text-[clamp(2.2rem,3.6vw,3.8rem)] font-medium uppercase leading-none tracking-[-0.02em]">{s.title}</h3>
              </div>
              <p className="mt-6 max-w-[21rem] text-[clamp(1.1rem,1.35vw,1.3rem)] leading-relaxed text-vulcan-paper/65">{s.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  )
}
