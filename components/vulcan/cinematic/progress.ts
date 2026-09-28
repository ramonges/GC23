import { HERO_STAGES, JOURNEY_STAGES } from '@/lib/vulcan/content'

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
function smoothstep(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

export const JOURNEY_WINDOWS: [number, number][] = [
  [0, 0.345],
  [0.345, 0.765],
  [0.765, 1.0],
]

export type Layout = {
  wrapTop: number
  wrapHeight: number
  heroTop: number
  heroHeight: number
  coverTop: number
  coverHeight: number
  journeyTop: number
  journeyHeight: number
  viewport: number
}

export type ProgressState = {
  /** Scroll progress through the whole cinematic track, 0→1. */
  progress: number
  /** Scene path parameter: hero [0,1], cover [1,2], journey [2,3]. */
  s: number
  heroU: number
  journeyV: number
  covered: boolean
  offscreen: boolean
  heroStage: number
  titleOpacity: number
  siteCopyOpacity: number
  heroStageOpacity: number[]
  journeyStageOpacity: number[]
}

/** Every scene and DOM value on the page is a pure function of scroll position through this layout. */
export function computeProgress(scrollY: number, l: Layout): ProgressState {
  const vh = l.viewport
  const heroRange = Math.max(1, l.heroHeight - vh)
  const heroU = clamp01((scrollY - l.heroTop) / heroRange)
  const heroEnd = l.heroTop + heroRange
  const journeyRange = Math.max(1, l.journeyHeight - vh)
  const journeyV = clamp01((scrollY - l.journeyTop) / journeyRange)

  let s: number
  if (scrollY < heroEnd) s = heroU
  else if (scrollY < l.journeyTop) s = 1 + clamp01((scrollY - heroEnd) / Math.max(1, l.journeyTop - heroEnd))
  else s = 2 + journeyV

  const progress = clamp01((scrollY - l.wrapTop) / Math.max(1, l.wrapHeight - vh))
  const covered = scrollY >= l.coverTop && scrollY + vh <= l.coverTop + l.coverHeight
  const offscreen = scrollY > l.wrapTop + l.wrapHeight

  const n = HERO_STAGES.length
  const heroStageOpacity = HERO_STAGES.map((_, i) => {
    const c = (i + 0.5) / n
    if (i === 0 && heroU <= c) return 1
    if (i === n - 1 && heroU >= c) return 1
    return clamp01(1 - (Math.abs(heroU - c) - 0.085) / 0.04)
  })
  const journeyStageOpacity = JOURNEY_STAGES.map((_, i) => {
    const [start, end] = JOURNEY_WINDOWS[i]
    const fadeIn = i === 0 ? 1 : smoothstep(start - 0.012, start + 0.012, journeyV)
    const fadeOut = i === JOURNEY_STAGES.length - 1 ? 1 : 1 - smoothstep(end - 0.012, end + 0.012, journeyV)
    return fadeIn * fadeOut
  })

  return {
    progress,
    s,
    heroU,
    journeyV,
    covered,
    offscreen,
    heroStage: Math.min(n - 1, Math.floor(heroU * n)),
    titleOpacity: s < 1 ? 1 - smoothstep(0.93, 1, heroU) : 0,
    siteCopyOpacity: s >= 2 ? smoothstep(2, 2.025, s) : 0,
    heroStageOpacity,
    journeyStageOpacity,
  }
}
