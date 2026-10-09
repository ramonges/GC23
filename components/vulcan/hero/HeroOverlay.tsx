'use client'

import { forwardRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CONTACT_HREF } from '@/lib/vulcan/content'
import { HERO_FINAL, HERO_LABELS, HERO_OPENING, type HeroStage } from '@/lib/vulcan/hero'
import MaterialLegend from './MaterialLegend'

const EASE = [0.22, 1, 0.36, 1] as const
const enter = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } }

export const HeroLabels = forwardRef<HTMLDivElement>(function HeroLabels(_props, ref) {
  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
      {HERO_LABELS.map((l, i) => (
        <div key={`${l.anchor}-${i}`} data-label={i} className="absolute left-0 top-0 opacity-0 will-change-transform">
          <span className={`absolute -left-[3px] -top-[3px] h-[7px] w-[7px] rounded-full ${l.tone === 'signal' ? 'bg-vulcan-signal' : 'border border-vulcan-paper/80 bg-vulcan-ink/60'}`} />
          <span className={`absolute left-0 top-0 h-px w-7 origin-left -rotate-[35deg] ${l.tone === 'signal' ? 'bg-vulcan-signal/80' : 'bg-vulcan-paper/40'}`} />
          <span className="absolute left-[22px] top-[-30px] whitespace-nowrap font-mono text-[11px] uppercase leading-[1.5] tracking-[0.18em] text-vulcan-paper">
            {l.text}
            {l.lines?.map((line) => (
              <span key={line} className="block text-vulcan-muted">{line}</span>
            ))}
          </span>
        </div>
      ))}
    </div>
  )
})

function DataCard({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="w-[17.5rem] border-t border-white/15 font-mono text-[11px] uppercase tracking-[0.16em]">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-6 border-b border-white/10 py-2.5">
          <dt className="text-vulcan-muted">{k}</dt>
          <dd className="text-right text-vulcan-paper">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

type Props = {
  stage: HeroStage
  showOpening: boolean
  showFinal: boolean
  flowRef: React.Ref<HTMLDivElement>
}

export default function HeroOverlay({ stage, showOpening, showFinal, flowRef }: Props) {
  return (
    <>
      <AnimatePresence>
        {showOpening && (
          <motion.div
            key="opening"
            {...enter}
            transition={{ duration: 1.2, ease: EASE }}
            className="pointer-events-none absolute inset-x-0 top-0 flex h-full flex-col justify-center px-[var(--hero-margin)] pb-40"
          >
            <h1 className="max-w-[11ch] font-grotesk text-[clamp(3.4rem,8.2vw,9.25rem)] font-medium leading-[0.94] tracking-[-0.035em] text-vulcan-paper">
              {HERO_OPENING.headline.map((l) => (
                <span key={l} className="block">{l}</span>
              ))}
            </h1>
            <p className="mt-8 max-w-[31rem] text-[clamp(1.1rem,1.5vw,1.5rem)] font-light leading-snug text-vulcan-paper/80">{HERO_OPENING.copy}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showOpening && (
          <motion.div
            key="legend"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.3 }}
            className="pointer-events-none absolute bottom-[7.25rem] left-[var(--hero-margin)] right-[calc(var(--hero-margin)+3.5rem)] hidden md:block"
          >
            <MaterialLegend />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {stage.number && !showFinal && (
          <motion.div
            key={stage.id}
            {...enter}
            transition={{ duration: 0.9, ease: EASE }}
            className="pointer-events-none absolute bottom-32 left-[var(--hero-margin)] max-w-[36rem] md:bottom-36"
          >
            <div className="flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.22em]">
              <span className="text-vulcan-signal">{stage.number}</span>
              <span className="h-px w-8 bg-white/25" />
              <span className="text-vulcan-paper">{stage.title}</span>
            </div>
            {stage.headline && (
              <p className="mt-5 font-grotesk text-[clamp(3rem,6vw,6.25rem)] font-medium leading-[0.95] tracking-[-0.03em] text-vulcan-paper">{stage.headline}</p>
            )}
            {stage.copy && (
              <p className={`mt-4 font-grotesk font-light leading-[1.2] tracking-[-0.01em] text-vulcan-paper/90 ${stage.headline ? 'text-[clamp(1.2rem,1.6vw,1.6rem)] text-vulcan-muted' : 'text-[clamp(1.45rem,2.3vw,2.4rem)]'}`}>
                {stage.copy}
              </p>
            )}
            {stage.flow && (
              <div ref={flowRef} data-step="0" className="mt-6 flex flex-wrap items-center gap-3 font-mono text-[12px] uppercase tracking-[0.2em]">
                {stage.flow.map((f, i) => (
                  <span key={f} className="flex items-center gap-3">
                    {i > 0 && <span className="text-vulcan-signal">→</span>}
                    <span data-flow={i} className="text-vulcan-muted transition-colors duration-700">{f}</span>
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {(stage.card || stage.metrics) && !showFinal && (
          <motion.div
            key={`${stage.id}-card`}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
            className="pointer-events-none absolute bottom-36 right-[calc(var(--hero-margin)+3.5rem)] hidden lg:block"
          >
            {stage.card && <DataCard rows={stage.card} />}
            {stage.metrics && (
              <div className="flex gap-2">
                {stage.metrics.map(([k, v]) => (
                  <div key={k} className="w-[9.5rem] border border-white/15 bg-vulcan-ink/40 px-3 py-2.5 font-mono uppercase backdrop-blur-sm">
                    <div className="text-[10px] tracking-[0.18em] text-vulcan-muted">{k}</div>
                    <div className={`mt-1 text-[12px] tracking-[0.16em] ${v === 'Elevated' || v === 'High' ? 'text-vulcan-signal' : 'text-vulcan-paper'}`}>{v}</div>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-vulcan-muted/70">Illustrative</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFinal && (
          <motion.div
            key="final"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: EASE }}
            className="absolute inset-x-0 top-0 flex h-full flex-col justify-center px-[var(--hero-margin)] pb-36"
          >
            <h2 className="max-w-[12ch] font-grotesk text-[clamp(3.2rem,7.4vw,8.5rem)] font-medium leading-[0.94] tracking-[-0.035em] text-vulcan-paper">
              {HERO_FINAL.headline.map((l) => (
                <span key={l} className="block">{l}</span>
              ))}
            </h2>
            <p className="mt-8 max-w-[30rem] text-[clamp(1.1rem,1.4vw,1.4rem)] font-light leading-snug text-vulcan-paper/80">{HERO_FINAL.copy}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a href="/robots" className="group inline-flex items-center justify-between gap-10 bg-vulcan-paper px-6 py-4 font-mono text-[12px] uppercase tracking-[0.2em] text-vulcan-ink transition-colors duration-500 hover:bg-white">
                Explore the robots
                <span aria-hidden className="text-vulcan-signal transition-transform duration-500 group-hover:translate-x-1">→</span>
              </a>
              <a href={CONTACT_HREF} className="group inline-flex items-center justify-between gap-10 border border-white/25 px-6 py-4 font-mono text-[12px] uppercase tracking-[0.2em] text-vulcan-paper transition-colors duration-500 hover:border-white/60">
                Talk to the team
                <span aria-hidden className="text-vulcan-signal transition-transform duration-500 group-hover:translate-x-1">→</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
