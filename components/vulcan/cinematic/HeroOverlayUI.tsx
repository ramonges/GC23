'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CYCLING_MATERIALS, HERO_STAGES, NODE_BY_ID } from '@/lib/vulcan/content'

const EASE = [0.22, 1, 0.36, 1] as const
const STAGE_FOCUS = ['boke', 'kamsar', 'shandong', 'yamanashi']

function formatCoord(value: number, pos: string, neg: string) {
  return `${Math.abs(value).toFixed(2)}° ${value >= 0 ? pos : neg}`
}

function CyclingMaterial({ reducedMotion }: { reducedMotion: boolean }) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (reducedMotion) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % CYCLING_MATERIALS.length), 2400)
    return () => window.clearInterval(id)
  }, [reducedMotion])

  if (reducedMotion) return <span className="text-vulcan-signal">{CYCLING_MATERIALS.join(' ')}</span>
  return (
    <span className="relative inline-flex h-[1.3em] overflow-hidden align-bottom leading-[1.3]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={CYCLING_MATERIALS[index]}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="text-vulcan-signal"
        >
          {CYCLING_MATERIALS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

type Props = {
  stage: number
  interactive: boolean
  reducedMotion: boolean
  onStage: (i: number) => void
  onSkip: () => void
}

export default function HeroOverlayUI({ stage, interactive, reducedMotion, onStage, onSkip }: Props) {
  const focus = NODE_BY_ID[STAGE_FOCUS[stage]]
  return (
    <div
      className="absolute inset-x-0 bottom-0 z-10 px-5 pb-6 sm:px-8 md:px-12 md:pb-10"
      style={{ opacity: 'var(--title-opacity)', pointerEvents: interactive ? 'auto' : 'none' }}
    >
      <div className="relative max-w-[46rem] pb-6 md:pb-16">
        <div className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-vulcan-aluminum">
          <span className="h-px w-8 bg-vulcan-signal" />
          <span>{HERO_STAGES[stage].number} / {HERO_STAGES[stage].label}</span>
        </div>
        <div className="grid">
          {HERO_STAGES.map((s, i) => {
            const Tag = i === 0 ? 'h1' : 'p'
            return (
              <div
                key={s.id}
                aria-hidden={i !== stage}
                className="[grid-area:1/1]"
                style={{
                  opacity: `var(--hero-stage-${i})`,
                  transform: `translateY(calc((1 - var(--hero-stage-${i})) * 14px))`,
                }}
              >
                <Tag className="font-grotesk text-[2.6rem] font-medium leading-[1.02] tracking-[-0.03em] text-white sm:text-6xl md:text-7xl lg:text-[5.4rem]">
                  {s.headline}
                </Tag>
              </div>
            )
          })}
        </div>
        <p className="mt-5 font-grotesk text-xl font-light text-white/90 md:text-2xl">
          <CyclingMaterial reducedMotion={reducedMotion} />
        </p>
        <div className="mt-3 grid max-w-xl">
          {HERO_STAGES.map((s, i) => (
            <p
              key={s.id}
              aria-hidden={i !== stage}
              className="text-base leading-relaxed text-vulcan-aluminum [grid-area:1/1] md:text-lg"
              style={{ opacity: `var(--hero-stage-${i})` }}
            >
              {s.line}
            </p>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 items-end gap-4 border-t border-white/10 pt-4 md:grid-cols-[1fr_auto_1fr]">
        <div className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-vulcan-aluminum/80 md:block">
          {focus && (
            <span className="block truncate">
              {focus.name} · {formatCoord(focus.lat, 'N', 'S')} · {formatCoord(focus.lng, 'E', 'W')}
            </span>
          )}
        </div>
        <nav aria-label="Story stages" className="md:justify-self-center">
          <ol className="grid grid-cols-2 gap-2 md:flex md:gap-1">
            {HERO_STAGES.map((s, i) => {
              const active = i === stage
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => onStage(i)}
                    aria-current={active ? 'step' : undefined}
                    className={`relative w-full whitespace-nowrap px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.16em] transition-colors duration-500 md:text-[11px] ${
                      active ? 'text-white' : 'text-vulcan-aluminum/70 hover:text-white'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="vulcan-stage-outline"
                        aria-hidden
                        className="absolute inset-0 border border-vulcan-signal"
                        transition={reducedMotion ? { duration: 0 } : { duration: 0.7, ease: EASE }}
                      />
                    )}
                    <span className={active ? 'text-vulcan-signal' : ''}>{s.number}</span> {s.label}
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>
        <div className="hidden md:flex md:justify-end">
          <button
            type="button"
            onClick={onSkip}
            className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-vulcan-aluminum transition-colors hover:text-white"
          >
            Skip animation
            <span aria-hidden className="vulcan-chevron inline-block text-vulcan-signal">⌄</span>
          </button>
        </div>
      </div>
    </div>
  )
}
