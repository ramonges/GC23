'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { PROBLEM } from '@/lib/vulcan/content'
import { DrawPath, EASE, Headline, Label, Reveal, Section } from './ui'

const LAYOUTS = [
  [[30, 40], [70, 110], [120, 30], [180, 95], [210, 45], [150, 125]],
  [[20, 90], [60, 30], [110, 115], [160, 40], [200, 110], [230, 60]],
  [[40, 120], [80, 50], [130, 95], [175, 25], [205, 120], [225, 75]],
]
const HUB = [120, 75]

function SourceDiagram({ variant }: { variant: number }) {
  const reduced = useReducedMotion()
  const nodes = LAYOUTS[variant]
  return (
    <svg viewBox="0 0 240 150" className="h-auto w-full" aria-hidden>
      {nodes.map(([x, y], i) => (
        <DrawPath key={`l${i}`} d={`M${x} ${y} L${HUB[0]} ${HUB[1]}`} className="stroke-vulcan-ink/25" delay={0.6 + i * 0.12} duration={1.4} />
      ))}
      {nodes.map(([x, y], i) => (
        <motion.circle
          key={`n${i}`}
          cx={x}
          cy={y}
          r={3}
          className="fill-vulcan-paper stroke-vulcan-ink/60"
          strokeWidth={1}
          initial={reduced ? false : { opacity: 0, scale: 0.4 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 + i * 0.08, ease: EASE }}
        />
      ))}
      <motion.rect
        x={HUB[0] - 6}
        y={HUB[1] - 6}
        width={12}
        height={12}
        className="fill-vulcan-signal"
        initial={reduced ? false : { opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 1.6, ease: EASE }}
        style={{ transformOrigin: `${HUB[0]}px ${HUB[1]}px` }}
      />
    </svg>
  )
}

export default function ProblemSection() {
  return (
    <Section id="problem" theme="light">
      <div className="grid grid-cols-12 gap-x-6">
        <div className="col-span-12 lg:col-span-10">
          <Label light>The problem</Label>
          <Headline lines={PROBLEM.headline} className="mt-10 text-vulcan-ink" />
        </div>
        <Reveal className="col-span-12 mt-10 md:col-span-7 lg:col-span-5 lg:col-start-7" delay={0.15}>
          <p className="text-[clamp(1.15rem,1.45vw,1.4rem)] leading-relaxed text-vulcan-ink/70">{PROBLEM.copy}</p>
        </Reveal>
      </div>
      <div className="mt-24 grid grid-cols-1 gap-px bg-vulcan-ink/10 md:mt-32 md:grid-cols-3">
        {PROBLEM.columns.map((c, i) => (
          <Reveal key={c.label} delay={i * 0.1} className="bg-vulcan-paper p-6 pt-8 md:p-10">
            <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-vulcan-ink">{c.label}</div>
            <div className="mt-2 text-lg text-vulcan-ink/60">{c.text}</div>
            <div className="mt-10 max-w-[20rem]">
              <SourceDiagram variant={i} />
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
