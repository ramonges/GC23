'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import HeroOverlayUI from './HeroOverlayUI'
import { JourneyCopy, JourneyLabels } from './JourneyOverlayUI'
import { computeProgress, type Layout } from './progress'
import type { CinematicScene } from './scene/createScene'
import { HERO_STAGES, JOURNEY_STAGES } from '@/lib/vulcan/content'
import { usePrefersReducedMotion } from '@/lib/vulcan/hooks'

const STATS_INTERVAL_MS = 300

function measure(el: HTMLElement) {
  const r = el.getBoundingClientRect()
  return { top: r.top + window.scrollY, height: r.height }
}

export default function CinematicExperience({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const coverRef = useRef<HTMLDivElement>(null)
  const journeyRef = useRef<HTMLDivElement>(null)
  const labelsRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<CinematicScene | null>(null)
  const layoutRef = useRef<Layout | null>(null)
  const reducedMotion = usePrefersReducedMotion()
  const reducedRef = useRef(reducedMotion)
  reducedRef.current = reducedMotion

  const [ready, setReady] = useState(false)
  const [heroStage, setHeroStage] = useState(0)
  const [journeyStage, setJourneyStage] = useState(0)
  const [heroInteractive, setHeroInteractive] = useState(true)

  const relayout = useCallback(() => {
    const wrap = wrapRef.current
    const hero = heroRef.current
    const cover = coverRef.current
    const journey = journeyRef.current
    if (!wrap || !hero || !cover || !journey) return
    const w = measure(wrap)
    const h = measure(hero)
    const c = measure(cover)
    const j = measure(journey)
    layoutRef.current = {
      wrapTop: w.top,
      wrapHeight: w.height,
      heroTop: h.top,
      heroHeight: h.height,
      coverTop: c.top,
      coverHeight: c.height,
      journeyTop: j.top,
      journeyHeight: j.height,
      viewport: window.innerHeight,
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const sticky = stickyRef.current
    const wrap = wrapRef.current
    if (!canvas || !sticky || !wrap) return
    let disposed = false
    let raf = 0
    let lastStats = 0
    let lastHeroStage = -1
    let lastJourneyStage = -1
    let lastInteractive = true
    const labelEls = () => Array.from(labelsRef.current?.querySelectorAll<HTMLElement>('[data-anchor]') ?? [])

    relayout()
    const ro = new ResizeObserver(() => {
      relayout()
      const r = sticky.getBoundingClientRect()
      sceneRef.current?.resize(r.width, r.height)
    })
    ro.observe(sticky)
    ro.observe(wrap)

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const layout = layoutRef.current
      if (!layout) return
      const p = computeProgress(window.scrollY, layout)

      const style = wrap.style
      style.setProperty('--cinematic-progress', p.progress.toFixed(4))
      style.setProperty('--title-opacity', p.titleOpacity.toFixed(3))
      style.setProperty('--site-copy-opacity', p.siteCopyOpacity.toFixed(3))
      p.heroStageOpacity.forEach((o, i) => style.setProperty(`--hero-stage-${i}`, o.toFixed(3)))
      p.journeyStageOpacity.forEach((o, i) => style.setProperty(`--journey-stage-${i}`, o.toFixed(3)))

      if (p.heroStage !== lastHeroStage) {
        lastHeroStage = p.heroStage
        setHeroStage(p.heroStage)
      }
      const js = p.journeyStageOpacity.indexOf(Math.max(...p.journeyStageOpacity))
      if (js !== lastJourneyStage) {
        lastJourneyStage = js
        setJourneyStage(js)
      }
      const interactive = p.titleOpacity > 0.05
      if (interactive !== lastInteractive) {
        lastInteractive = interactive
        setHeroInteractive(interactive)
      }

      const scene = sceneRef.current
      if (!scene || p.covered || p.offscreen || document.visibilityState !== 'visible') return
      scene.render({ s: p.s, reducedMotion: reducedRef.current }, now / 1000)

      if (p.siteCopyOpacity > 0.01) {
        const anchors = scene.projectAnchors()
        for (const el of labelEls()) {
          const a = anchors[el.dataset.anchor as keyof typeof anchors]
          const stageOpacity = p.journeyStageOpacity[Number(el.dataset.stage)] ?? 0
          el.style.transform = `translate3d(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px, 0)`
          el.style.opacity = a.visible ? stageOpacity.toFixed(3) : '0'
        }
      }

      if (now - lastStats > STATS_INTERVAL_MS) {
        lastStats = now
        const stats = scene.stats()
        if (stats) {
          const d = canvas.dataset
          d.engine = stats.engine
          d.drawCalls = String(stats.drawCalls)
          d.drawCallsTotal = String(stats.drawCallsTotal)
          d.triangles = String(stats.triangles)
          d.camera = stats.camera
          d.progress = p.progress.toFixed(4)
          d.path = p.s.toFixed(3)
          d.stage = p.s < 1 ? `hero-${p.heroStage + 1}` : p.s < 2 ? 'cover' : JOURNEY_STAGES[js].id
          d.terrainResolution = String(stats.terrainResolution)
          d.earthDetail = String(stats.earthDetail)
          d.markers = String(stats.markers)
          d.entities = stats.entities
        }
      }
    }
    raf = requestAnimationFrame(tick)

    const boot = async () => {
      try {
        const { createCinematicScene } = await import('./scene/createScene')
        if (disposed) return
        const mobile = window.matchMedia('(max-width: 767px)').matches
        const scene = await createCinematicScene(canvas, { mobile })
        if (disposed) {
          scene.dispose()
          return
        }
        const r = sticky.getBoundingClientRect()
        scene.resize(r.width, r.height)
        const layout = layoutRef.current
        const p = layout ? computeProgress(window.scrollY, layout) : null
        scene.render({ s: p?.s ?? 0, reducedMotion: reducedRef.current }, performance.now() / 1000)
        sceneRef.current = scene
        requestAnimationFrame(() => !disposed && setReady(true))
      } catch (err) {
        console.warn('Cinematic scene unavailable; keeping poster frame.', err)
      }
    }
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number
      cancelIdleCallback?: (id: number) => void
    }
    const bootId = w.requestIdleCallback ? w.requestIdleCallback(boot, { timeout: 600 }) : window.setTimeout(boot, 120)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      if (w.cancelIdleCallback) w.cancelIdleCallback(bootId)
      else window.clearTimeout(bootId)
      sceneRef.current?.dispose()
      sceneRef.current = null
    }
  }, [relayout])

  const scrollToHeroStage = useCallback((i: number) => {
    const layout = layoutRef.current
    if (!layout) return
    const range = layout.heroHeight - layout.viewport
    const u = i === 0 ? 0 : (i + 0.5) / HERO_STAGES.length
    window.scrollTo({ top: layout.heroTop + range * u, behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [reducedMotion])

  const skip = useCallback(() => {
    document.getElementById('problem')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [reducedMotion])

  const initialVars = {
    '--cinematic-progress': 0,
    '--title-opacity': 1,
    '--site-copy-opacity': 0,
    ...Object.fromEntries(HERO_STAGES.map((_, i) => [`--hero-stage-${i}`, i === 0 ? 1 : 0])),
    ...Object.fromEntries(JOURNEY_STAGES.map((_, i) => [`--journey-stage-${i}`, i === 0 ? 1 : 0])),
  } as React.CSSProperties

  return (
    <div ref={wrapRef} className="relative" style={initialVars}>
      <div ref={stickyRef} className="cinematic-sticky sticky top-0 z-0 h-[100svh] w-full overflow-hidden bg-vulcan-ink">
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" data-engine="three.js" />
        <picture>
          <source media="(max-width: 767px)" srcSet="/hero/poster-mobile.webp" />
          <img
            src="/hero/poster.webp"
            alt=""
            aria-hidden
            fetchPriority="high"
            className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ${ready ? 'opacity-0' : 'opacity-100'}`}
          />
        </picture>
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-vulcan-ink/80 via-vulcan-ink/20 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-vulcan-ink/90 via-vulcan-ink/30 to-transparent" />
        <div aria-hidden className="vulcan-grid pointer-events-none absolute inset-0 opacity-30" />

        <HeroOverlayUI
          stage={heroStage}
          interactive={heroInteractive}
          reducedMotion={reducedMotion}
          onStage={scrollToHeroStage}
          onSkip={skip}
        />
        <JourneyLabels ref={labelsRef} />
        <JourneyCopy activeStage={journeyStage} />
      </div>

      <div className="pointer-events-none relative -mt-[100svh]">
        <div id="top" ref={heroRef} aria-hidden className="h-[400svh]" />
        <div ref={coverRef} className="pointer-events-auto relative">{children}</div>
        <div id="journey" ref={journeyRef} aria-hidden className="h-[360svh]" />
      </div>
    </div>
  )
}
