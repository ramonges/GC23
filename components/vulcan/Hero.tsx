'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import HeroOverlay from './HeroOverlay'
import { CYCLING_MATERIALS, HERO_STAGES, NODE_BY_ID } from '@/lib/vulcan/content'
import { useIsDesktop, usePrefersReducedMotion } from '@/lib/vulcan/hooks'

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

  if (reducedMotion) {
    return <span className="text-vulcan-signal">{CYCLING_MATERIALS.join(' ')}</span>
  }
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

export default function Hero() {
  const wrapRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stage, setStage] = useState(0)
  const [videoReady, setVideoReady] = useState(false)
  const [mountVideo, setMountVideo] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const isDesktop = useIsDesktop()
  const pinned = isDesktop

  useEffect(() => {
    if (!isDesktop || reducedMotion) {
      setMountVideo(false)
      setVideoReady(false)
      return
    }
    const idle = (window as any).requestIdleCallback as ((cb: () => void, o?: { timeout: number }) => number) | undefined
    const id = idle ? idle(() => setMountVideo(true), { timeout: 1200 }) : window.setTimeout(() => setMountVideo(true), 400)
    return () => {
      if (idle) (window as any).cancelIdleCallback?.(id)
      else window.clearTimeout(id)
    }
  }, [isDesktop, reducedMotion])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !mountVideo) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {})
      else video.pause()
    })
    io.observe(video)
    return () => io.disconnect()
  }, [mountVideo])

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap || !pinned) return
    gsap.registerPlugin(ScrollTrigger)
    const trigger = ScrollTrigger.create({
      trigger: wrap,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const next = Math.min(HERO_STAGES.length - 1, Math.floor(self.progress * HERO_STAGES.length))
        setStage((prev) => (prev === next ? prev : next))
      },
    })
    return () => trigger.kill()
  }, [pinned])

  const goToStage = useCallback((i: number) => {
    const wrap = wrapRef.current
    if (!wrap || !pinned) {
      setStage(i)
      return
    }
    const top = wrap.getBoundingClientRect().top + window.scrollY
    const range = wrap.offsetHeight - window.innerHeight
    window.scrollTo({
      top: top + range * ((i + 0.5) / HERO_STAGES.length),
      behavior: reducedMotion ? 'auto' : 'smooth',
    })
  }, [pinned, reducedMotion])

  const skip = useCallback(() => {
    document.getElementById('problem')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [reducedMotion])

  const current = HERO_STAGES[stage]
  const focus = NODE_BY_ID[STAGE_FOCUS[stage]]
  const textTransition = reducedMotion ? { duration: 0 } : { duration: 0.9, ease: EASE }

  return (
    <section
      id="top"
      ref={wrapRef}
      aria-label="Vulcan Trade introduction"
      className="relative h-[100svh] md:h-[400vh]"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-vulcan-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero/earth-poster.webp"
          srcSet="/hero/earth-poster-mobile.webp 960w, /hero/earth-poster.webp 1920w"
          sizes="100vw"
          alt=""
          aria-hidden
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-[70%_50%] md:object-center"
        />
        {mountVideo && (
          <video
            ref={videoRef}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1600ms] ${videoReady ? 'opacity-100' : 'opacity-0'}`}
            poster="/hero/earth-poster.webp"
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            aria-hidden
            onPlaying={() => setVideoReady(true)}
          >
            <source src="/hero/earth-loop.webm" type="video/webm" />
            <source src="/hero/earth-loop.mp4" type="video/mp4" />
          </video>
        )}

        <HeroOverlay
          videoRef={videoRef}
          stage={stage}
          reducedMotion={reducedMotion}
          objectPositionX={isDesktop ? 0.5 : 0.7}
        />

        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-vulcan-ink/90 via-vulcan-ink/35 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-vulcan-ink via-vulcan-ink/55 to-transparent" />
        <div aria-hidden className="vulcan-grid pointer-events-none absolute inset-0 opacity-[0.35]" />

        <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-6 sm:px-8 md:px-12 md:pb-10">
          <div className="max-w-[46rem] pb-6 md:pb-16">
            <div className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-vulcan-aluminum">
              <span className="h-px w-8 bg-vulcan-signal" />
              <span>{current.number} / {current.label}</span>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={textTransition}
              >
                {stage === 0 ? (
                  <h1 className="font-grotesk text-[2.6rem] font-medium leading-[1.02] tracking-[-0.03em] text-white sm:text-6xl md:text-7xl lg:text-[5.4rem]">
                    {current.headline}
                  </h1>
                ) : (
                  <p className="font-grotesk text-[2.6rem] font-medium leading-[1.02] tracking-[-0.03em] text-white sm:text-6xl md:text-7xl lg:text-[5.4rem]">
                    {current.headline}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
            <p className="mt-5 font-grotesk text-xl font-light text-white/90 md:text-2xl">
              <CyclingMaterial reducedMotion={reducedMotion} />
            </p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={`${current.id}-line`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={textTransition}
                className="mt-3 max-w-xl text-base leading-relaxed text-vulcan-aluminum md:text-lg"
              >
                {current.line}
              </motion.p>
            </AnimatePresence>
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
                        onClick={() => goToStage(i)}
                        aria-current={active ? 'step' : undefined}
                        className={`w-full whitespace-nowrap border px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.16em] transition-colors duration-500 md:text-[11px] ${
                          active
                            ? 'border-vulcan-signal text-white'
                            : 'border-transparent text-vulcan-aluminum/70 hover:text-white'
                        }`}
                      >
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
                onClick={skip}
                className="group flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-vulcan-aluminum transition-colors hover:text-white"
              >
                Skip animation
                <span aria-hidden className="vulcan-chevron inline-block text-vulcan-signal">⌄</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
