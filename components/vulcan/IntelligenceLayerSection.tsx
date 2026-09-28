'use client'

import { motion } from 'framer-motion'
import { INTELLIGENCE } from '@/lib/vulcan/content'
import { DrawPath, EASE, Headline, Label, Reveal, Section, useReducedMotion } from './ui'

function Diagram() {
  const reduced = useReducedMotion()
  const xs = [100, 300, 500, 700]
  return (
    <svg viewBox="0 0 800 460" className="h-auto w-full" role="img" aria-label="Production, suppliers, routes and markets flow into Vulcan Trade, which produces sourcing decisions">
      {xs.map((x, i) => (
        <g key={x}>
          <DrawPath d={`M${x} 70 C ${x} 170, 400 150, 400 232`} className="stroke-vulcan-ink/30" delay={0.3 + i * 0.12} duration={1.8} />
          {!reduced && (
            <circle r={2.5} className="fill-vulcan-signal" opacity={0}>
              <animateMotion dur="4.5s" begin={`${1.8 + i * 1.1}s`} repeatCount="indefinite" path={`M${x} 70 C ${x} 170, 400 150, 400 232`} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.55 1" />
              <animate attributeName="opacity" dur="4.5s" begin={`${1.8 + i * 1.1}s`} repeatCount="indefinite" values="0;1;1;0" keyTimes="0;0.1;0.85;1" />
            </circle>
          )}
          <rect x={x - 5} y={60} width={10} height={10} className="fill-vulcan-paper stroke-vulcan-ink/70" strokeWidth={1} />
          <text x={x} y={38} textAnchor="middle" className="fill-vulcan-ink font-mono text-[13px] uppercase tracking-[0.2em]">
            {INTELLIGENCE.inputs[i]}
          </text>
          {i < 3 && (
            <text x={x + 100} y={69} textAnchor="middle" className="fill-vulcan-ink/40 font-mono text-[14px]">
              +
            </text>
          )}
        </g>
      ))}
      <motion.circle
        cx={400}
        cy={260}
        r={28}
        className="fill-none stroke-vulcan-signal"
        strokeWidth={1}
        initial={reduced ? false : { opacity: 0, scale: 0.6 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, delay: 1.3, ease: EASE }}
        style={{ transformOrigin: '400px 260px' }}
      />
      <circle cx={400} cy={260} r={5} className="fill-vulcan-signal" />
      <text x={446} y={265} className="fill-vulcan-ink font-grotesk text-[20px] font-medium tracking-[-0.01em]">{INTELLIGENCE.core}</text>
      <DrawPath d="M400 290 L400 380" className="stroke-vulcan-ink/40" delay={1.6} duration={1} />
      <path d="M394 372 L400 382 L406 372" className="fill-none stroke-vulcan-ink/40" strokeWidth={1} />
      <text x={400} y={420} textAnchor="middle" className="fill-vulcan-ink font-mono text-[13px] uppercase tracking-[0.2em]">{INTELLIGENCE.output}</text>
    </svg>
  )
}

export default function IntelligenceLayerSection() {
  return (
    <Section id="product" theme="light" className="border-t border-vulcan-ink/10">
      <div className="grid grid-cols-12 gap-x-6 gap-y-16">
        <div className="col-span-12 lg:col-span-5">
          <Label light>The intelligence layer</Label>
          <Headline lines={INTELLIGENCE.headline} className="mt-10 text-vulcan-ink" />
        </div>
        <Reveal className="col-span-12 lg:col-span-6 lg:col-start-7" delay={0.1}>
          <Diagram />
        </Reveal>
      </div>
      <div className="mt-24 grid grid-cols-1 gap-6 md:mt-32 md:grid-cols-3">
        {INTELLIGENCE.values.map((v, i) => (
          <Reveal key={v.title} delay={i * 0.1}>
            <div className="group h-full border-t border-vulcan-ink/20 pt-6 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5">
              <div className="flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.22em] text-vulcan-ink">
                <span className="h-1.5 w-1.5 bg-vulcan-signal" />
                {v.title}
              </div>
              <p className="mt-4 max-w-[22rem] text-[clamp(1.2rem,1.5vw,1.45rem)] leading-snug text-vulcan-ink/70">{v.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
