'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useProgress } from '@react-three/drei'
import type { Robot } from '@/lib/robots/types'
import { ROBOTS, commodityColor, dominantCommodity, formatPct, getRobot, massByCommodity, partMass } from '@/lib/robots/data'
import { useExplorer } from './store'
import DonutChart from './ui/DonutChart'
import MethodologyModal from './ui/MethodologyModal'
import PartDetails from './ui/PartDetails'
import SourcingPanel from './ui/SourcingPanel'
import { CloseButton, EstimatedBadge, PanelLabel, Toggle } from './ui/primitives'
import type { SceneLayout } from './scene/Showroom'

const Showroom = dynamic(() => import('./scene/Showroom'), { ssr: false })

const LEFT_PANEL = 384
const RIGHT_PANEL = 420
const EASE = [0.22, 1, 0.36, 1] as const

function useMedia(query: string) {
  const [match, setMatch] = useState(false)
  useEffect(() => {
    const m = window.matchMedia(query)
    const on = () => setMatch(m.matches)
    on()
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [query])
  return match
}

export default function RobotExplorer() {
  const compact = useMedia('(max-width: 1023px)')
  const coarse = useMedia('(pointer: coarse)')
  const [ready, setReady] = useState(false)
  const selectedId = useExplorer((s) => s.selected)
  const robot = getRobot(selectedId)
  const methodologyOpen = useExplorer((s) => s.methodologyOpen)
  const setMethodology = useExplorer((s) => s.setMethodology)

  const layout = useMemo<SceneLayout>(() => ({ mobile: compact || coarse, leftInset: compact ? 0 : LEFT_PANEL, rightInset: compact ? 0 : RIGHT_PANEL }), [compact, coarse])

  useKeyboard()

  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-vulcan-ink font-grotesk text-vulcan-paper">
      <div className="absolute inset-0">
        <Showroom layout={layout} onReady={() => setReady(true)} />
      </div>

      <TopBar onMethodology={() => setMethodology(true)} />

      <AnimatePresence>{!robot && <ShowroomOverlay key="showroom" />}</AnimatePresence>
      <AnimatePresence>{robot && <DetailPanel key={robot.id} robot={robot} compact={compact} />}</AnimatePresence>
      {robot && !(compact || coarse) && <PartTooltip robot={robot} />}
      {robot && (compact || coarse) && <PartSheet robot={robot} />}
      <AnimatePresence>{robot && <SourcingDrawer key="sourcing" robot={robot} compact={compact} />}</AnimatePresence>

      <MethodologyModal open={methodologyOpen} onClose={() => setMethodology(false)} />
      <Loader ready={ready} />
    </div>
  )
}

function useKeyboard() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useExplorer.getState()
      const target = e.target as HTMLElement
      if (target.closest('input, textarea, [role="dialog"]')) return
      if (e.key === 'Escape') {
        if (s.methodologyOpen) s.setMethodology(false)
        else if (s.pinnedPart) s.pinPart(null)
        else if (s.sourcingOpen) s.closeSourcing()
        else if (s.selected) s.select(null)
        return
      }
      if (!s.selected || e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key.toLowerCase()
      if (k === 'e') s.toggleExploded()
      else if (k === 'c') s.toggleColor()
      else if (k === 's') (s.sourcingOpen ? s.closeSourcing() : s.openSourcing())
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

function TopBar({ onMethodology }: { onMethodology: () => void }) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-40 bg-[linear-gradient(180deg,rgba(8,9,9,0.85),rgba(8,9,9,0))]">
      <div className="pointer-events-auto flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" aria-label="Vulcan Trade — home" className="flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/vulcan-trade-logo.png" alt="Vulcan Trade" width={837} height={120} className="h-5 w-auto sm:h-6" />
          </Link>
          <span className="hidden h-4 w-px bg-white/15 md:block" />
          <h1 className="hidden truncate font-mono text-[10px] uppercase tracking-[0.22em] text-vulcan-aluminum md:block">Robot Commodity Explorer</h1>
        </div>
        <div className="flex items-center gap-3">
          <EstimatedBadge onClick={onMethodology} />
          <Link href="/platform/map" className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-vulcan-muted transition-colors hover:text-vulcan-paper lg:inline">
            Map <span className="text-vulcan-signal">↗</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

function ShowroomOverlay() {
  const browsing = useExplorer((s) => s.browsing)
  const setBrowsing = useExplorer((s) => s.setBrowsing)
  const select = useExplorer((s) => s.select)
  return (
    <motion.div className="pointer-events-none absolute inset-0 z-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3 } }}>
      <div className="absolute left-4 top-24 max-w-[34rem] sm:left-6 lg:left-8 lg:top-28">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-vulcan-signal">Robot Commodity Explorer</p>
        <h2 className="mt-3 text-[clamp(2rem,4.2vw,3.6rem)] font-light leading-[1.02] tracking-[-0.03em]">
          What is a robot
          <br />
          made of?
        </h2>
        <p className="mt-4 max-w-[26rem] text-[15px] leading-relaxed text-vulcan-paper/65">
          Pick a robot to trace each part to its raw materials and the countries they most likely come from.
        </p>
      </div>
      <nav aria-label="Choose a robot" className="pointer-events-auto absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,rgba(8,9,9,0.92),rgba(8,9,9,0))] px-4 pb-5 pt-10 sm:px-6 lg:px-8">
        <ul className="flex gap-px overflow-x-auto [scrollbar-width:none]">
          {ROBOTS.map((r, i) => (
            <li key={r.id} className="min-w-[150px] flex-1">
              <button
                type="button"
                onMouseEnter={() => setBrowsing(r.id)}
                onMouseLeave={() => setBrowsing(null)}
                onFocus={() => setBrowsing(r.id)}
                onClick={() => select(r.id)}
                className={`group w-full border-t px-3 pb-2 pt-3 text-left transition-colors ${
                  browsing === r.id ? 'border-vulcan-signal bg-white/[0.04]' : 'border-white/15 hover:border-white/40'
                }`}
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-vulcan-muted">
                  <span className="text-vulcan-signal">{String(i + 1).padStart(2, '0')}</span> · {r.mass_kg} kg
                </span>
                <span className="mt-1 block truncate text-[15px] text-vulcan-paper">{r.name}</span>
                <span className="block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-vulcan-muted">{r.maker}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </motion.div>
  )
}

function DetailPanel({ robot, compact }: { robot: Robot; compact: boolean }) {
  const s = useExplorer()
  const slices = useMemo(() => massByCommodity(robot), [robot])
  const [expanded, setExpanded] = useState(false)

  const body = (
    <>
      <section>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vulcan-muted">{robot.maker}</p>
        <h2 className="mt-1 text-[30px] font-light leading-tight tracking-[-0.02em]">{robot.name}</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-vulcan-paper/65">{robot.blurb}</p>
        <dl className="mt-4 grid grid-cols-4 gap-px border border-white/10 bg-white/10">
          {[
            ['Height', `${robot.height_m} m`],
            ['Mass', `${robot.mass_kg} kg`],
            ['Battery', `${robot.battery_kwh} kWh`],
            ['DoF', robot.dof.split(' ')[0]],
          ].map(([k, v]) => (
            <div key={k} className="bg-vulcan-charcoal px-2.5 py-2">
              <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-vulcan-muted">{k}</dt>
              <dd className="mt-0.5 truncate text-[13px]">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="grid grid-cols-1 gap-1.5">
        <Toggle pressed={s.exploded} onClick={s.toggleExploded} kbd="E">
          Exploded view
        </Toggle>
        <Toggle pressed={s.colorByCommodity} onClick={s.toggleColor} kbd="C">
          Color by commodity
        </Toggle>
        <Toggle pressed={s.sourcingOpen} onClick={() => (s.sourcingOpen ? s.closeSourcing() : s.openSourcing())} kbd="S">
          Sourcing by country
        </Toggle>
      </section>

      <section>
        <PanelLabel right={<span className="normal-case tracking-normal text-vulcan-muted">est.</span>}>Mass by commodity</PanelLabel>
        <DonutChart slices={slices} massKg={robot.mass_kg} onSelect={(id) => s.openSourcing(id)} />
      </section>

      <PartList robot={robot} />
    </>
  )

  if (compact) {
    return (
      <motion.aside
        className="absolute inset-x-0 bottom-0 z-30 flex max-h-[78svh] flex-col border-t border-white/10 bg-vulcan-charcoal/95 backdrop-blur-md"
        initial={{ y: '100%' }}
        animate={{ y: 0, transition: { duration: 0.55, ease: EASE, delay: 0.25 } }}
        exit={{ y: '100%', transition: { duration: 0.3 } }}
        aria-label={`${robot.name} details`}
      >
        <div className="flex items-center gap-2 px-4 py-3">
          <BackButton />
          <button type="button" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded} className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left">
            <span className="min-w-0">
              <span className="block truncate text-[16px]">{robot.name}</span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.16em] text-vulcan-muted">
                {robot.mass_kg} kg · {slices.length} commodities
              </span>
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-vulcan-aluminum">{expanded ? 'Less ↓' : 'Details ↑'}</span>
          </button>
        </div>
        {!expanded && (
          <div className="grid grid-cols-3 gap-1.5 px-4 pb-4">
            <Toggle pressed={s.exploded} onClick={s.toggleExploded}>
              Explode
            </Toggle>
            <Toggle pressed={s.colorByCommodity} onClick={s.toggleColor}>
              Color
            </Toggle>
            <Toggle pressed={s.sourcingOpen} onClick={() => (s.sourcingOpen ? s.closeSourcing() : s.openSourcing())}>
              Source
            </Toggle>
          </div>
        )}
        {expanded && <div className="min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain px-4 pb-8 pt-2">{body}</div>}
      </motion.aside>
    )
  }

  return (
    <motion.aside
      className="absolute bottom-4 left-4 top-20 z-30 flex flex-col border border-white/10 bg-vulcan-charcoal/90 backdrop-blur-md lg:left-6"
      style={{ width: LEFT_PANEL - 24 }}
      initial={{ x: -LEFT_PANEL, opacity: 0 }}
      animate={{ x: 0, opacity: 1, transition: { duration: 0.6, ease: EASE, delay: 0.35 } }}
      exit={{ x: -LEFT_PANEL, opacity: 0, transition: { duration: 0.3 } }}
      aria-label={`${robot.name} details`}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <BackButton />
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-vulcan-muted">Drag to orbit · scroll to zoom</span>
      </div>
      <div className="min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain px-5 pb-6 pt-5">{body}</div>
    </motion.aside>
  )
}

function BackButton() {
  const select = useExplorer((s) => s.select)
  return (
    <button
      type="button"
      onClick={() => select(null)}
      className="flex h-8 items-center gap-2 border border-white/10 px-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-vulcan-aluminum transition-colors hover:border-white/30 hover:text-vulcan-paper"
    >
      <span aria-hidden>←</span> Showroom
    </button>
  )
}

function PartList({ robot }: { robot: Robot }) {
  const hovered = useExplorer((s) => s.hoveredPart)
  const pinned = useExplorer((s) => s.pinnedPart)
  const hoverPart = useExplorer((s) => s.hoverPart)
  const pinPart = useExplorer((s) => s.pinPart)
  const groups = useMemo(() => {
    const map = new Map<string, Robot['parts']>()
    for (const p of robot.parts) map.set(p.group, [...(map.get(p.group) ?? []), p])
    return Array.from(map)
  }, [robot])

  return (
    <section>
      <PanelLabel right={<span className="normal-case tracking-normal">{robot.parts.length} parts</span>}>Parts</PanelLabel>
      <div className="space-y-4">
        {groups.map(([group, parts]) => (
          <div key={group}>
            <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-vulcan-muted/80">{group}</p>
            <ul className="space-y-px" role="list">
              {parts.map((p) => {
                const active = pinned === p.meshName || hovered === p.meshName
                return (
                  <li key={p.meshName}>
                    <button
                      type="button"
                      data-part-list
                      aria-pressed={pinned === p.meshName}
                      onMouseEnter={() => hoverPart(p.meshName)}
                      onMouseLeave={() => useExplorer.getState().hoveredPart === p.meshName && hoverPart(null)}
                      onFocus={() => hoverPart(p.meshName)}
                      onBlur={() => useExplorer.getState().hoveredPart === p.meshName && hoverPart(null)}
                      onClick={() => pinPart(pinned === p.meshName ? null : p.meshName)}
                      className={`relative grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-2.5 px-2 py-1.5 text-left text-[12.5px] transition-colors focus:outline-none ${
                        active ? 'bg-white/[0.07] text-vulcan-paper' : 'text-vulcan-aluminum hover:bg-white/[0.03]'
                      }`}
                    >
                      {active && <span className="absolute inset-y-0 left-0 w-px bg-vulcan-signal" />}
                      <span className="h-1.5 w-1.5" style={{ backgroundColor: commodityColor(dominantCommodity(p)) }} aria-hidden />
                      <span className="truncate">{p.label}</span>
                      <span className="font-mono text-[10px] text-vulcan-muted">{formatPct(partMass(p))}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

function PartTooltip({ robot }: { robot: Robot }) {
  const hovered = useExplorer((s) => s.hoveredPart)
  const pinned = useExplorer((s) => s.pinnedPart)
  const openSourcing = useExplorer((s) => s.openSourcing)
  const pinPart = useExplorer((s) => s.pinPart)
  const ref = useRef<HTMLDivElement>(null)
  const pointer = useRef({ x: 0, y: 0, fromList: false })
  const name = hovered ?? pinned
  const part = name ? robot.parts.find((p) => p.meshName === name) : null

  const place = useCallback(() => {
    const el = ref.current
    if (!el) return
    const w = el.offsetWidth
    const h = el.offsetHeight
    let x: number
    let y: number
    if (pointer.current.fromList) {
      x = LEFT_PANEL + 12
      y = 96
    } else {
      x = pointer.current.x + 22
      y = pointer.current.y + 18
      if (x + w > window.innerWidth - 16) x = pointer.current.x - w - 22
      if (y + h > window.innerHeight - 16) y = Math.max(16, window.innerHeight - h - 16)
    }
    el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`
  }, [])

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const overList = !!(e.target as HTMLElement).closest?.('[data-part-list]')
      pointer.current = { x: e.clientX, y: e.clientY, fromList: overList }
      if (!useExplorer.getState().pinnedPart || useExplorer.getState().hoveredPart) place()
    }
    const focus = (e: FocusEvent) => {
      if ((e.target as HTMLElement).closest?.('[data-part-list]')) {
        pointer.current.fromList = true
        place()
      }
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('focusin', focus)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('focusin', focus)
    }
  }, [place])

  useEffect(() => {
    place()
  }, [name, place])

  return (
    <div ref={ref} className={`fixed left-0 top-0 z-50 w-[340px] ${pinned && !hovered ? '' : 'pointer-events-none'}`} aria-live="polite">
      <AnimatePresence mode="wait">
        {part && (
          <motion.div
            key={part.meshName}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ duration: 0.18 }}
            className="border border-white/15 bg-vulcan-ink/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-md"
          >
            {pinned === part.meshName && !hovered && (
              <div className="-mt-1 mb-2 flex justify-end">
                <CloseButton onClick={() => pinPart(null)} label="Unpin part" />
              </div>
            )}
            <PartDetails robot={robot} part={part} onCommodity={pinned && !hovered ? (id) => openSourcing(id) : undefined} />
            {!pinned && <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.18em] text-vulcan-muted">Click to pin</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PartSheet({ robot }: { robot: Robot }) {
  const pinned = useExplorer((s) => s.pinnedPart)
  const pinPart = useExplorer((s) => s.pinPart)
  const openSourcing = useExplorer((s) => s.openSourcing)
  const part = pinned ? robot.parts.find((p) => p.meshName === pinned) : null
  return (
    <AnimatePresence>
      {part && (
        <motion.div
          key="sheet"
          role="dialog"
          aria-label={part.label}
          className="fixed inset-x-0 bottom-0 z-50 max-h-[72svh] overflow-y-auto border-t border-white/15 bg-vulcan-ink/97 px-4 pb-8 pt-3 backdrop-blur-md"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="mx-auto h-1 w-10 bg-white/20" aria-hidden />
          </div>
          <div className="mb-2 flex justify-end">
            <CloseButton onClick={() => pinPart(null)} />
          </div>
          <PartDetails
            robot={robot}
            part={part}
            onCommodity={(id) => {
              pinPart(null)
              openSourcing(id)
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function SourcingDrawer({ robot, compact }: { robot: Robot; compact: boolean }) {
  const open = useExplorer((s) => s.sourcingOpen)
  const commodity = useExplorer((s) => s.sourcingCommodity)
  const openSourcing = useExplorer((s) => s.openSourcing)
  const close = useExplorer((s) => s.closeSourcing)
  if (!open) return null
  return (
    <motion.aside
      aria-label="Sourcing by country"
      className={
        compact
          ? 'fixed inset-x-0 bottom-0 z-[45] h-[80svh] border-t border-white/15 bg-vulcan-charcoal/97 backdrop-blur-md'
          : 'absolute bottom-4 right-4 top-20 z-30 border border-white/10 bg-vulcan-charcoal/92 backdrop-blur-md lg:right-6'
      }
      style={compact ? undefined : { width: RIGHT_PANEL - 24 }}
      initial={compact ? { y: '100%' } : { x: RIGHT_PANEL, opacity: 0 }}
      animate={compact ? { y: 0 } : { x: 0, opacity: 1 }}
      exit={compact ? { y: '100%' } : { x: RIGHT_PANEL, opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <SourcingPanel robot={robot} commodity={commodity} onCommodity={(id) => openSourcing(id)} onClose={close} />
    </motion.aside>
  )
}

function Loader({ ready }: { ready: boolean }) {
  const { progress, active } = useProgress()
  const done = ready && !active
  const pct = done ? 100 : Math.max(8, Math.min(96, progress))
  return (
    <AnimatePresence>
      {!done && (
        <motion.div className="absolute inset-0 z-[70] flex items-center justify-center bg-vulcan-ink" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.6 } }}>
          <div className="w-56">
            <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-vulcan-muted">
              <span>Loading showroom</span>
              <span className="text-vulcan-paper">{Math.round(pct)}%</span>
            </div>
            <div className="mt-3 h-px w-full bg-white/10">
              <div className="h-px bg-vulcan-signal transition-[width] duration-300" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
