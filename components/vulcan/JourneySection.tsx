'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Reveal from './Reveal'
import SectionLabel from './SectionLabel'
import { CONTACT_HREF } from '@/lib/vulcan/content'

type Marker = { x: number; y: number; label: string; align?: 'left' | 'right' }

type Vignette = {
  id: string
  step: string
  title: string
  place: string
  copy: string
  image: string
  alt: string
  route: string
  markers: Marker[]
  chips?: string[]
  textPosition?: 'top' | 'bottom'
}

const VIGNETTES: Vignette[] = [
  {
    id: 'extraction',
    step: '01',
    title: 'Extraction',
    place: 'Boké, Guinea',
    copy: 'Bauxite is stripped from laterite plateaus in Guinea’s Boké region, stockpiled, and railed to the coast — the first node of the aluminum chain.',
    image: '/journey/extraction.webp',
    alt: 'Illustration of an open-pit bauxite mine at dusk with haul roads and an ore stockpile',
    route: 'M 50 44 C 56 58, 66 72, 74 84 S 84 97, 90 100',
    markers: [
      { x: 80, y: 34, label: 'Excavation zone' },
      { x: 88, y: 56, label: 'Ore stockpile' },
      { x: 72, y: 82, label: 'Next node: Kamsar Port', align: 'left' },
    ],
  },
  {
    id: 'maritime',
    step: '02',
    title: 'Maritime transit',
    place: 'Kamsar, Guinea → Qingdao, China',
    copy: 'Loaded at the export terminal, bauxite moves in dry-bulk carriers around the Cape toward refineries in China.',
    image: '/journey/maritime.webp',
    alt: 'Illustration of a loaded dry-bulk carrier departing an ore export port at blue hour',
    route: 'M 58 60 C 46 46, 30 38, 10 35',
    markers: [
      { x: 70, y: 40, label: 'Origin: Kamsar Port, GN' },
      { x: 10, y: 35, label: 'Destination: Qingdao, CN' },
      { x: 50, y: 72, label: 'Mode: Dry bulk shipping' },
    ],
    textPosition: 'bottom',
  },
  {
    id: 'transformation',
    step: '03',
    title: 'Transformation → product',
    place: 'Refinery, smelter, assembly line',
    copy: 'Bauxite is refined to alumina, smelted to aluminum, cast, machined, and finally assembled into the arm of an industrial robot.',
    image: '/journey/transformation.webp',
    alt: 'Illustration of an industrial robotic arm in an assembly hall with a smelter glow and aluminum ingots behind it',
    route: 'M 44 46 C 55 54, 66 58, 76 60 S 80 76, 80 90',
    markers: [
      { x: 43, y: 38, label: 'Smelter' },
      { x: 88, y: 55, label: 'Aluminum ingot' },
      { x: 70, y: 90, label: 'Robotic arm', align: 'left' },
    ],
    chips: ['Bauxite → Alumina → Aluminum', 'Delivered cost · modeled', 'Supply risk · elevated', 'Alternative routes · 3'],
  },
]

function RouteLine({ d }: { d: string }) {
  const pathRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    const path = pathRef.current
    if (!path) return
    const length = path.getTotalLength()
    path.style.strokeDasharray = `${length}`
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      path.style.strokeDashoffset = '0'
      return
    }
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.fromTo(
        path,
        { strokeDashoffset: length },
        {
          strokeDashoffset: 0,
          duration: 2.4,
          ease: 'power2.inOut',
          scrollTrigger: { trigger: path, start: 'top 80%', once: true },
        },
      )
    })
    return () => ctx.revert()
  }, [d])

  return (
    <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
      <path d={d} fill="none" stroke="rgba(255,106,26,0.25)" strokeWidth={6} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      <path ref={pathRef} d={d} fill="none" stroke="#FF6A1A" strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
    </svg>
  )
}

function MarkerLabel({ marker }: { marker: Marker }) {
  const right = marker.align !== 'left'
  return (
    <div
      className="pointer-events-none absolute flex items-center gap-2"
      style={{
        left: `${marker.x}%`,
        top: `${marker.y}%`,
        transform: right ? 'translate(-4px, -50%)' : 'translate(calc(-100% + 4px), -50%)',
        flexDirection: right ? 'row' : 'row-reverse',
      }}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-vulcan-signal/60 motion-reduce:hidden" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-vulcan-signal" />
      </span>
      <span className="h-px w-6 bg-white/40" />
      <span className="whitespace-nowrap border border-white/15 bg-vulcan-ink/70 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white backdrop-blur-sm">
        {marker.label}
      </span>
    </div>
  )
}

function VignetteBlock({ v }: { v: Vignette }) {
  return (
    <article className="border-t border-white/10">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-vulcan-ink">
        <Image src={v.image} alt={v.alt} fill sizes="100vw" className="object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-vulcan-ink/85 via-vulcan-ink/20 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-vulcan-ink/70 to-transparent" />
        <div className="hidden md:block">
          <RouteLine d={v.route} />
          {v.markers.map((m) => (
            <MarkerLabel key={m.label} marker={m} />
          ))}
        </div>

        <div
          className={`absolute left-5 hidden max-w-md sm:left-8 md:left-12 md:block ${
            v.textPosition === 'bottom' ? 'md:bottom-12' : 'md:top-24 lg:top-28'
          }`}
        >
          <Reveal>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-vulcan-signal">Stage {v.step}</div>
            <h3 className="mt-4 font-grotesk text-4xl font-medium tracking-[-0.02em] text-white lg:text-5xl">{v.title}</h3>
            <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-vulcan-aluminum">{v.place}</div>
            <p className="mt-5 text-base leading-relaxed text-white/80">{v.copy}</p>
          </Reveal>
          {v.chips && (
            <Reveal delay={0.1} className="mt-6 flex max-w-sm flex-wrap gap-2">
              {v.chips.map((c) => (
                <span key={c} className="border border-white/15 bg-vulcan-ink/70 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm">
                  {c}
                </span>
              ))}
            </Reveal>
          )}
        </div>
        <div className="absolute bottom-3 right-4 font-mono text-[9px] uppercase tracking-[0.2em] text-white/50">Illustration</div>
      </div>

      <div className="px-5 py-8 sm:px-8 md:hidden">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-vulcan-signal">Stage {v.step}</div>
        <h3 className="mt-3 font-grotesk text-3xl font-medium tracking-[-0.02em] text-white">{v.title}</h3>
        <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-vulcan-aluminum">{v.place}</div>
        <p className="mt-4 text-base leading-relaxed text-white/80">{v.copy}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {(v.chips || v.markers.map((m) => m.label)).map((c) => (
            <span key={c} className="border border-white/15 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/90">
              {c}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

export default function JourneySection() {
  return (
    <section id="journey" className="relative border-t border-white/10 bg-vulcan-ink">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 md:px-12 md:py-32">
        <Reveal>
          <SectionLabel index="03">The journey</SectionLabel>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-8 max-w-4xl font-grotesk text-5xl font-medium leading-[1] tracking-[-0.03em] text-white md:text-7xl">
            From mine to machine.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-vulcan-aluminum">
            One tonne of bauxite, followed from the pit in Guinea to the arm of an industrial robot.
          </p>
        </Reveal>
      </div>

      {VIGNETTES.map((v) => (
        <VignetteBlock key={v.id} v={v} />
      ))}

      <p className="px-5 pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-vulcan-aluminum/70 sm:px-8 md:px-12">
        Imagery is illustrative · route, cost, and risk labels are illustrative unless connected to live data
      </p>

      <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8 md:px-12 md:py-40">
        <Reveal>
          <p className="max-w-3xl text-xl leading-relaxed text-vulcan-aluminum md:text-2xl">
            The final product is visible. The supply chain behind it usually is not.
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="mt-10 max-w-6xl font-grotesk text-5xl font-medium uppercase leading-[0.98] tracking-[-0.03em] text-white md:text-7xl lg:text-[6.2rem]">
            Every robot begins with a <span className="text-vulcan-signal">material decision.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.16} className="mt-14 flex flex-col gap-3 sm:flex-row">
          <a
            href="/platform"
            className="group inline-flex items-center justify-between gap-8 bg-white px-6 py-4 font-mono text-xs uppercase tracking-[0.18em] text-vulcan-ink transition-colors duration-500 hover:bg-vulcan-signal hover:text-white"
          >
            See the intelligence layer
            <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </a>
          <a
            href={CONTACT_HREF}
            className="group inline-flex items-center justify-between gap-8 border border-white/25 px-6 py-4 font-mono text-xs uppercase tracking-[0.18em] text-white transition-colors duration-500 hover:border-vulcan-signal hover:text-vulcan-signal"
          >
            Talk to Vulcan Trade
            <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </a>
        </Reveal>
      </div>
    </section>
  )
}
