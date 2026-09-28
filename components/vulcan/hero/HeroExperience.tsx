'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { HERO_DURATION, HERO_LABELS, HERO_STAGES, TIMELINE_GROUPS, groupAt, stageAt } from '@/lib/vulcan/hero'
import { MINES } from '@/lib/vulcan/content'
import HeroOverlay, { HeroLabels } from './HeroOverlay'
import ProgressTimeline from './ProgressTimeline'
import SkipAnimation from './SkipAnimation'
import type { HeroScene } from './scene/ThreeScene'

export type HeroState = 'LOADING' | 'PLAYING' | 'USER_SCROLLING' | 'SCRUBBING' | 'PAUSED' | 'COMPLETE' | 'SKIPPED'
type Mode = 'pending' | '3d' | 'fallback'

const D = HERO_DURATION
const SCROLL_GAIN = 0.00016
const REVERSE_RANGE = 0.1
const SMOOTHING = 4.2
const LABEL_FADE = 0.45
const SITES_WAIT_T = 4.3
const OPENING_END = 4.4
const FINAL_AT = 36.4

const STILL_STAGES = HERO_STAGES.map((s) => s.id)

function detectWebGL2() {
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
}

export default function HeroExperience() {
  const rootRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const labelsRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const flowRef = useRef<HTMLDivElement>(null)
  const fadeRef = useRef<HTMLDivElement>(null)
  const loaderRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HeroScene | null>(null)

  const [mode, setMode] = useState<Mode>('pending')
  const [heroState, setHeroState] = useState<HeroState>('LOADING')
  const [stageIndex, setStageIndex] = useState(0)
  const [group, setGroup] = useState(0)
  const [posterHidden, setPosterHidden] = useState(false)
  const [capture, setCapture] = useState<number | null>(null)
  const [captureUi, setCaptureUi] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [mobile, setMobile] = useState(false)

  const stateRef = useRef<HeroState>('LOADING')
  const autoPaused = useRef(false)
  const target = useRef(0)
  const current = useRef(0)
  const maxReached = useRef(0)
  const interactionTimer = useRef<number>()
  const posterGone = useRef(false)

  const setState = useCallback((s: HeroState) => {
    stateRef.current = s
    setHeroState(s)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const cap = params.get('capture')
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setMobile(isMobile)
    setReduced(prefersReduced)
    if (cap !== null) {
      setCapture(Number(cap) || 0)
      setCaptureUi(params.get('ui') === '1')
      setMode('3d')
      return
    }
    setMode(!isMobile && !prefersReduced && detectWebGL2() ? '3d' : 'fallback')
  }, [])

  useEffect(() => {
    if (mode === 'pending') return
    let disposed = false
    let raf = 0
    let last = performance.now()
    let lastStage = -1
    let lastGroup = -1
    let lastStats = 0
    let inView = true
    let captureFrames = 0
    const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting))
    if (rootRef.current) io.observe(rootRef.current)

    const labelEls = () => Array.from(labelsRef.current?.querySelectorAll<HTMLElement>('[data-label]') ?? [])
    const fills = () => Array.from(timelineRef.current?.querySelectorAll<HTMLElement>('[data-fill]') ?? [])

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      const s = stateRef.current
      const scene = sceneRef.current
      const ready = mode === 'fallback' || (scene?.isReady() ?? false)

      if (capture !== null) {
        target.current = current.current = capture / D
      } else {
        if (s === 'PLAYING' || s === 'USER_SCROLLING' || s === 'SCRUBBING') target.current = Math.min(1, target.current + dt / D)
        if (!ready) target.current = Math.min(target.current, SITES_WAIT_T / D)
        current.current += (target.current - current.current) * (1 - Math.exp(-dt * SMOOTHING))
        if (Math.abs(target.current - current.current) < 1e-5) current.current = target.current
        maxReached.current = Math.max(maxReached.current, current.current)
        if (target.current >= 1 && current.current > 0.9993 && (s === 'PLAYING' || s === 'USER_SCROLLING' || s === 'SCRUBBING' || s === 'PAUSED')) {
          current.current = 1
          setState('COMPLETE')
        }
      }
      const t = current.current * D

      const si = HERO_STAGES.indexOf(stageAt(t))
      if (si !== lastStage) {
        lastStage = si
        setStageIndex(si)
      }
      const gi = groupAt(t)
      if (gi !== lastGroup) {
        lastGroup = gi
        setGroup(gi)
      }
      fills().forEach((el, i) => {
        const g = TIMELINE_GROUPS[i]
        el.style.width = `${Math.min(100, Math.max(0, ((t - g.start) / (g.end - g.start)) * 100)).toFixed(2)}%`
      })
      const flow = flowRef.current
      if (flow) {
        const stage = HERO_STAGES[si]
        const steps = stage.flow?.length ?? 1
        const step = Math.min(steps - 1, Math.floor(((t - stage.start) / (stage.end - stage.start)) * steps * 1.15))
        flow.querySelectorAll<HTMLElement>('[data-flow]').forEach((el, i) => {
          el.style.color = i <= step ? (i === step ? '#F1F0E8' : '#C6C8C1') : ''
        })
      }

      if (mode === '3d' && scene && inView && document.visibilityState === 'visible') {
        scene.render(t, now / 1000, dt, !reduced)
        if (!posterGone.current) {
          posterGone.current = true
          setPosterHidden(true)
        }
        const active = HERO_LABELS.map((l, i) => ({ l, i })).filter(({ l }) => t > l.from - 0.1 && t < l.to + 0.1)
        const projected = scene.project(active.map(({ l }) => l.anchor))
        const els = labelEls()
        els.forEach((el) => (el.style.opacity = '0'))
        for (const { l, i } of active) {
          const a = projected[l.anchor]
          const el = els[i]
          if (!el || !a) continue
          const o = Math.min(1, (t - l.from) / LABEL_FADE, (l.to - t) / LABEL_FADE)
          el.style.transform = `translate3d(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px, 0)`
          el.style.opacity = a.visible ? Math.max(0, o).toFixed(3) : '0'
        }
        if (now - lastStats > 400 && canvasRef.current) {
          lastStats = now
          const st = scene.stats()
          const d = canvasRef.current.dataset
          d.engine = st.engine
          d.drawCalls = String(st.drawCalls)
          d.triangles = String(st.triangles)
          d.camera = st.camera
          d.t = t.toFixed(2)
          d.state = stateRef.current
          d.stage = HERO_STAGES[si].id
        }
        if (capture !== null && scene.isReady()) {
          captureFrames++
          if (captureFrames === 40) (window as unknown as { __heroCapture: string }).__heroCapture = 'ready'
        }
      }
    }
    raf = requestAnimationFrame(tick)

    if (mode === '3d') {
      const boot = async () => {
        try {
          const { createHeroScene } = await import('./scene/ThreeScene')
          if (disposed || !canvasRef.current) return
          const markers = MINES.filter((m) => m.material !== 'iron').map((m) => ({ lat: m.lat, lng: m.lng, material: m.material!, primary: m.material === 'bauxite' }))
          const scene = await createHeroScene(canvasRef.current, {
            quality: 'high',
            markers,
            onProgress: (p) => {
              if (loaderRef.current) loaderRef.current.style.transform = `scaleX(${p})`
            },
          })
          if (disposed) return scene.dispose()
          const r = rootRef.current!.getBoundingClientRect()
          scene.resize(r.width, r.height)
          sceneRef.current = scene
          if (stateRef.current === 'LOADING' && capture === null) setState(window.scrollY > window.innerHeight * 0.5 ? 'SKIPPED' : 'PLAYING')
          scene.sitesPromise.catch((err) => console.warn('Hero sites failed to build', err))
        } catch (err) {
          console.warn('Hero 3D unavailable, using fallback.', err)
          if (!disposed) setMode('fallback')
        }
      }
      boot()
    } else if (mode === 'fallback') {
      if (window.scrollY > window.innerHeight * 0.5) setState('SKIPPED')
      else setState(reduced ? 'PAUSED' : 'PLAYING')
      setPosterHidden(true)
    }

    const ro = new ResizeObserver(() => {
      const r = rootRef.current?.getBoundingClientRect()
      if (r) sceneRef.current?.resize(r.width, r.height)
    })
    if (rootRef.current) ro.observe(rootRef.current)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      sceneRef.current?.dispose()
      sceneRef.current = null
    }
  }, [mode, capture, reduced, setState])

  const heroActive = () => {
    const s = stateRef.current
    return window.scrollY <= 4 && s !== 'COMPLETE' && s !== 'SKIPPED' && s !== 'LOADING'
  }

  const nudge = useCallback((delta: number) => {
    const min = Math.max(0, maxReached.current - REVERSE_RANGE)
    target.current = Math.min(1, Math.max(min, target.current + delta))
    const s = stateRef.current
    if (s !== 'PAUSED') {
      setState(delta >= 0 ? 'USER_SCROLLING' : 'SCRUBBING')
      window.clearTimeout(interactionTimer.current)
      interactionTimer.current = window.setTimeout(() => {
        if (stateRef.current === 'USER_SCROLLING' || stateRef.current === 'SCRUBBING') setState('PLAYING')
      }, 650)
    }
  }, [setState])

  useEffect(() => {
    if (mode === 'pending' || capture !== null) return
    const onWheel = (e: WheelEvent) => {
      if (reduced || !heroActive()) return
      e.preventDefault()
      const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1
      nudge(e.deltaY * scale * SCROLL_GAIN)
    }
    let touchY: number | null = null
    const onTouchStart = (e: TouchEvent) => (touchY = e.touches[0]?.clientY ?? null)
    const onTouchMove = (e: TouchEvent) => {
      if (reduced || touchY === null || !heroActive()) return
      const y = e.touches[0].clientY
      e.preventDefault()
      nudge((touchY - y) * SCROLL_GAIN * 2.2)
      touchY = y
    }
    const onKey = (e: KeyboardEvent) => {
      if (!heroActive() || (e.target as HTMLElement)?.closest('input, textarea')) return
      if (e.key === 'Escape') skip()
      else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault()
        nudge(0.04)
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        nudge(-0.04)
      } else if (e.key === ' ' && !(e.target as HTMLElement)?.closest('button, a')) {
        e.preventDefault()
        togglePause()
      }
    }
    const onVisibility = () => {
      if (document.visibilityState === 'hidden' && stateRef.current === 'PLAYING') {
        autoPaused.current = true
        setState('PAUSED')
      } else if (document.visibilityState === 'visible' && autoPaused.current) {
        autoPaused.current = false
        setState('PLAYING')
      }
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('keydown', onKey)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('visibilitychange', onVisibility)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, capture, reduced, nudge])

  const cut = useCallback((to: number, after?: () => void) => {
    const fade = fadeRef.current
    const apply = () => {
      target.current = current.current = to
      maxReached.current = Math.max(maxReached.current, to)
      after?.()
    }
    if (!fade || reduced) return apply()
    fade.style.opacity = '1'
    window.setTimeout(() => {
      apply()
      window.setTimeout(() => (fade.style.opacity = '0'), 60)
    }, 320)
  }, [reduced])

  const skip = useCallback(() => {
    cut(1, () => setState('SKIPPED'))
    const next = document.getElementById('problem')
    window.setTimeout(() => next?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }), reduced ? 0 : 380)
  }, [cut, reduced, setState])

  const seek = useCallback((g: number) => {
    const to = (TIMELINE_GROUPS[g].start + (g === 0 ? 0 : 0.2)) / D
    cut(to, () => {
      if (stateRef.current !== 'PAUSED') setState('PLAYING')
    })
  }, [cut, setState])

  const togglePause = useCallback(() => {
    const s = stateRef.current
    if (s === 'PAUSED') setState(current.current >= 0.999 ? 'COMPLETE' : 'PLAYING')
    else if (s === 'COMPLETE' || s === 'SKIPPED') {
      cut(0, () => setState('PLAYING'))
    } else setState('PAUSED')
  }, [cut, setState])

  const stage = HERO_STAGES[stageIndex]
  const showOpening = stage.id === 'opening' && heroState !== 'SKIPPED'
  const showFinal = heroState === 'COMPLETE' || heroState === 'SKIPPED' || (stage.id === 'robot' && current.current * D > FINAL_AT)
  const paused = heroState === 'PAUSED' || heroState === 'COMPLETE' || heroState === 'SKIPPED'
  const stillSuffix = mobile ? 'm' : 'd'

  return (
    <section
      ref={rootRef}
      id="top"
      data-theme="dark"
      data-hero-state={heroState}
      aria-label="Vulcan Trade — from material origin to finished robot"
      className={`relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-vulcan-ink [--hero-margin:6vw] lg:[--hero-margin:7vw] ${capture !== null && !captureUi ? 'hero-capture' : ''}`}
    >
      {mode === '3d' && <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />}
      {mode === 'fallback' && (
        <div aria-hidden className="absolute inset-0">
          {STILL_STAGES.map((id, i) => (
            <img
              key={id}
              src={`/hero/stills/${id}-${stillSuffix}.webp`}
              alt=""
              loading={Math.abs(i - stageIndex) <= 1 ? 'eager' : 'lazy'}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ease-out ${i === stageIndex ? 'opacity-100' : 'opacity-0'} ${
                !reduced && i === stageIndex && heroState !== 'PAUSED' ? 'vulcan-kenburns' : ''
              }`}
            />
          ))}
        </div>
      )}
      {mode !== 'fallback' && (
        <picture>
          <source media="(max-width: 767px)" srcSet="/hero/poster-mobile.webp" />
          <img
            src="/hero/poster.webp"
            alt=""
            aria-hidden
            fetchPriority="high"
            className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ${posterHidden ? 'opacity-0' : 'opacity-100'}`}
          />
        </picture>
      )}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(8,9,9,0.72)_0%,rgba(8,9,9,0.25)_38%,rgba(8,9,9,0)_60%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] bg-[linear-gradient(0deg,rgba(8,9,9,0.85),rgba(8,9,9,0))]" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(8,9,9,0.6),rgba(8,9,9,0))]" />

      <div className="hero-ui absolute inset-0">
        <HeroLabels ref={labelsRef} />
        <HeroOverlay stage={stage} showOpening={showOpening} showFinal={showFinal} flowRef={flowRef} />

        <div className="absolute inset-x-0 bottom-0 px-[var(--hero-margin)] pb-8 md:pb-10">
          <div className="md:pr-20">
            <ProgressTimeline ref={timelineRef} active={group} paused={paused} onSeek={seek} onTogglePause={togglePause} />
          </div>
        </div>
        <div className="absolute bottom-8 right-[calc(var(--hero-margin)-0.75rem)] hidden md:bottom-10 md:block">
          <SkipAnimation onSkip={skip} label={heroState === 'COMPLETE' || heroState === 'SKIPPED' ? 'Continue' : 'Skip animation'} />
        </div>
        <button
          type="button"
          onClick={skip}
          className="absolute right-5 top-28 font-mono text-[10px] uppercase tracking-[0.22em] text-vulcan-paper/70 md:hidden"
        >
          Skip ↓
        </button>
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden">
        <div
          ref={loaderRef}
          className={`h-px origin-left scale-x-0 bg-vulcan-signal transition-[transform,opacity] duration-700 ${heroState === 'LOADING' ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
      <div ref={fadeRef} aria-hidden className="pointer-events-none absolute inset-0 bg-vulcan-ink opacity-0 transition-opacity duration-300" />
      <p className="sr-only" aria-live="polite">
        {stage.number ? `${stage.number} ${stage.title}. ${stage.copy ?? ''}` : ''}
      </p>
    </section>
  )
}
