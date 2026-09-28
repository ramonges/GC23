'use client'

import { animate, motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'

export const EASE = [0.22, 1, 0.36, 1] as const

/** Reduced-motion preference that is `false` until mount, so server and first client render match. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduced
}

type Theme = 'light' | 'dark' | 'soft'

const THEME: Record<Theme, string> = {
  light: 'bg-vulcan-paper text-vulcan-ink',
  dark: 'bg-vulcan-ink text-vulcan-paper',
  soft: 'bg-vulcan-charcoal text-vulcan-paper',
}

export function Section({ id, theme, children, className = '' }: { id: string; theme: Theme; children: ReactNode; className?: string }) {
  return (
    <section id={id} data-theme={theme === 'light' ? 'light' : 'dark'} className={`relative px-[6vw] py-20 md:py-28 lg:px-[7vw] ${THEME[theme]} ${className}`}>
      <div className="mx-auto max-w-[1800px]">{children}</div>
    </section>
  )
}

export function Label({ index, children, light = false }: { index?: string; children: ReactNode; light?: boolean }) {
  return (
    <div className={`flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.22em] ${light ? 'text-vulcan-ink/60' : 'text-vulcan-muted'}`}>
      {index && <span className="text-vulcan-signal">{index}</span>}
      {index && <span className={`h-px w-8 ${light ? 'bg-vulcan-ink/20' : 'bg-white/20'}`} />}
      <span>{children}</span>
    </div>
  )
}

export function Headline({ lines, className = '', as: Tag = 'h2' }: { lines: string[]; className?: string; as?: 'h2' | 'h3' }) {
  return (
    <Tag className={`font-grotesk text-[clamp(2.6rem,5.6vw,6.25rem)] font-medium leading-[0.98] tracking-[-0.032em] ${className}`}>
      {lines.map((l, i) => (
        <Reveal key={l} delay={i * 0.08} y={22}>
          <span className="block">{l}</span>
        </Reveal>
      ))}
    </Tag>
  )
}

export function Reveal({ children, delay = 0, y = 18, className }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 1.1, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/** SVG path that draws once when scrolled into view. */
export function DrawPath({ d, className, delay = 0, duration = 1.6, strokeWidth = 1 }: { d: string; className?: string; delay?: number; duration?: number; strokeWidth?: number }) {
  const reduced = useReducedMotion()
  return (
    <motion.path
      d={d}
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      vectorEffect="non-scaling-stroke"
      initial={reduced ? false : { pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true, margin: '0px 0px -15% 0px' }}
      transition={{ duration, delay, ease: EASE }}
    />
  )
}

export function CountUp({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  const reduced = useReducedMotion()
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView) return
    if (reduced) return setN(value)
    const controls = animate(0, value, { duration: 1.8, ease: EASE, onUpdate: (v) => setN(v) })
    return () => controls.stop()
  }, [inView, reduced, value])
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {Math.round(n)}
      {suffix}
    </span>
  )
}

export function Arrow({ className = '' }: { className?: string }) {
  return (
    <span aria-hidden className={`inline-block text-vulcan-signal transition-transform duration-500 group-hover:translate-x-1 ${className}`}>
      →
    </span>
  )
}
