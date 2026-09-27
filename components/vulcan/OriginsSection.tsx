'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'framer-motion'
import Reveal from './Reveal'
import SectionLabel from './SectionLabel'
import { MATERIALS, MATERIAL_BY_ID, type MaterialId, type NetworkNode } from '@/lib/vulcan/content'
import { usePrefersReducedMotion } from '@/lib/vulcan/hooks'

const OriginsGlobe = dynamic(() => import('./OriginsGlobe'), {
  ssr: false,
  loading: () => <GlobePlaceholder label="Loading globe" />,
})

function GlobePlaceholder({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="aspect-square w-[min(70%,32rem)] rounded-full border border-white/10 bg-[radial-gradient(circle_at_40%_35%,rgba(255,255,255,0.05),transparent_60%)]" />
      <span className="absolute font-mono text-[11px] uppercase tracking-[0.2em] text-vulcan-aluminum/70">{label}</span>
    </div>
  )
}

export default function OriginsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [near, setNear] = useState(false)
  const [activeMaterial, setActiveMaterial] = useState<MaterialId | null>(null)
  const [selected, setSelected] = useState<NetworkNode | null>(null)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin: '800px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section
      id="origins"
      ref={sectionRef}
      className="relative border-t border-white/10 bg-vulcan-ink px-5 py-24 sm:px-8 md:px-12 md:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-end">
          <div>
            <Reveal>
              <SectionLabel index="02">Material origins</SectionLabel>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-8 font-grotesk text-5xl font-medium leading-[1] tracking-[-0.03em] text-white md:text-7xl">
                Where the machine is mined.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <p className="max-w-lg text-lg leading-relaxed text-vulcan-aluminum">
              Seven materials, a handful of regions, and the ports and refineries between them. Rotate the network to see where industrial production actually starts.
            </p>
          </Reveal>
        </div>

        <div className="relative mt-12 h-[72vh] min-h-[520px] overflow-hidden border border-white/10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03),transparent_70%)] md:mt-16 md:h-[80vh]">
          {near ? <OriginsGlobe activeMaterial={activeMaterial} selected={selected} onSelect={setSelected} reducedMotion={reducedMotion} /> : <GlobePlaceholder label="Interactive globe" />}

          <div className="pointer-events-none absolute right-4 top-4 font-mono text-[10px] uppercase tracking-[0.2em] text-vulcan-aluminum/70 md:right-6 md:top-6">
            Drag or use arrow keys to rotate
          </div>

          <div className="absolute bottom-4 left-4 z-10 md:bottom-6 md:left-6">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-vulcan-aluminum/80">Materials</div>
            <ul className="space-y-0.5 border border-white/10 bg-vulcan-ink/75 p-2 backdrop-blur-sm">
              {MATERIALS.map((m) => {
                const active = activeMaterial === m.id
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => setActiveMaterial(active ? null : m.id)}
                      aria-pressed={active}
                      className={`flex w-full items-center gap-2.5 border px-2 py-1 text-left font-mono text-[11px] uppercase tracking-[0.12em] transition-colors duration-500 ${
                        active ? 'border-vulcan-signal text-vulcan-signal' : 'border-transparent text-white/80 hover:text-white'
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: m.color }} />
                      {m.label}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <AnimatePresence>
            {selected && (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: reducedMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute bottom-4 right-4 z-10 w-[min(20rem,calc(100%-2rem))] border border-white/15 bg-vulcan-ink/90 p-4 backdrop-blur-md md:bottom-6 md:right-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-vulcan-signal">Selected node</div>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="font-mono text-[11px] text-vulcan-aluminum hover:text-white"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
                <dl className="mt-3 space-y-2 text-sm">
                  {[
                    ['Location', `${selected.name}, ${selected.country}`],
                    ['Material', selected.material ? MATERIAL_BY_ID[selected.material].label : '—'],
                    ['Facility type', selected.facility],
                    ['Next route', selected.nextRoute || '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[6.5rem_1fr] gap-2">
                      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-vulcan-aluminum">{k}</dt>
                      <dd className="text-white">{v}</dd>
                    </div>
                  ))}
                </dl>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-vulcan-aluminum/70">
          Illustrative network · underlying data varies by source
        </p>
      </div>
    </section>
  )
}
