'use client'

import { useEffect, useRef, type ElementType, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type Props = {
  children: ReactNode
  as?: ElementType
  className?: string
  delay?: number
  y?: number
}

export default function Reveal({ children, as: Tag = 'div', className, delay = 0, y = 28 }: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.3,
          delay,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        },
      )
    }, el)
    return () => ctx.revert()
  }, [delay, y])

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
