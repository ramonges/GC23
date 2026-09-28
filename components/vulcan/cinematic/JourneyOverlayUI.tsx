import { forwardRef } from 'react'
import { JOURNEY_STAGES } from '@/lib/vulcan/content'
import type { AnchorId } from './scene/createScene'

export const JOURNEY_LABELS: { id: AnchorId; text: string; stage: number }[] = [
  { id: 'excavation', text: 'Excavation zone', stage: 0 },
  { id: 'stockpile', text: 'Ore stockpile', stage: 0 },
  { id: 'nextNode', text: 'Next node: Kamsar Port', stage: 0 },
  { id: 'origin', text: 'Origin: Kamsar Port, GN', stage: 1 },
  { id: 'destination', text: 'Destination: Qingdao, CN', stage: 1 },
  { id: 'mode', text: 'Mode: Dry bulk shipping', stage: 1 },
]

export const JourneyLabels = forwardRef<HTMLDivElement>(function JourneyLabels(_props, ref) {
  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 z-10 hidden md:block" style={{ opacity: 'var(--site-copy-opacity)' }}>
      {JOURNEY_LABELS.map((l) => (
        <div
          key={l.id}
          data-anchor={l.id}
          data-stage={l.stage}
          className="absolute left-0 top-0 flex items-center gap-2 opacity-0 will-change-transform"
        >
          <span className="relative flex h-2 w-2 -translate-x-1 -translate-y-1">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-vulcan-signal/60 motion-reduce:hidden" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-vulcan-signal" />
          </span>
          <span className="-translate-y-1 h-px w-6 bg-white/40" />
          <span className="-translate-y-1 whitespace-nowrap border border-white/15 bg-vulcan-ink/70 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white backdrop-blur-sm">
            {l.text}
          </span>
        </div>
      ))}
    </div>
  )
})

export function JourneyCopy({ activeStage }: { activeStage: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-5 pb-8 sm:px-8 md:bottom-auto md:left-0 md:right-auto md:top-28 md:max-w-md md:px-12 md:pb-0"
      style={{ opacity: 'var(--site-copy-opacity)' }}
    >
      <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-vulcan-aluminum">
        <span className="text-vulcan-signal">03</span>
        <span className="h-px w-8 bg-white/20" />
        <span>The journey · from mine to machine</span>
      </div>
      <div className="mt-6 grid">
        {JOURNEY_STAGES.map((s, i) => (
          <article
            key={s.id}
            aria-hidden={i !== activeStage}
            className="[grid-area:1/1]"
            style={{
              opacity: `var(--journey-stage-${i})`,
              transform: `translateY(calc((1 - var(--journey-stage-${i})) * 12px))`,
            }}
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-vulcan-signal">Stage {s.step}</div>
            <h2 className="mt-3 font-grotesk text-3xl font-medium tracking-[-0.02em] text-white md:text-5xl">{s.title}</h2>
            <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-vulcan-aluminum">{s.place}</div>
            <p className="mt-4 text-base leading-relaxed text-white/80">{s.copy}</p>
            {s.chips && (
              <div className="mt-5 flex flex-wrap gap-2">
                {s.chips.map((c) => (
                  <span key={c} className="border border-white/15 bg-vulcan-ink/70 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
      <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.2em] text-vulcan-aluminum/60">
        Stylized scene · route, cost, and risk labels are illustrative
      </p>
    </div>
  )
}
