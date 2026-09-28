'use client'

import { forwardRef } from 'react'
import { TIMELINE_GROUPS } from '@/lib/vulcan/hero'

type Props = {
  active: number
  paused: boolean
  onSeek: (group: number) => void
  onTogglePause: () => void
}

/** Fill widths are written per frame by HeroExperience via `data-fill` children, not React state. */
const ProgressTimeline = forwardRef<HTMLDivElement, Props>(function ProgressTimeline({ active, paused, onSeek, onTogglePause }, ref) {
  return (
    <div ref={ref} className="flex items-end gap-5">
      <button
        type="button"
        onClick={onTogglePause}
        aria-label={paused ? 'Play animation' : 'Pause animation'}
        className="mb-[3px] grid h-7 w-7 shrink-0 place-items-center border border-white/15 text-vulcan-paper/80 transition-colors hover:border-white/40 hover:text-white"
      >
        {paused ? (
          <svg width="8" height="10" viewBox="0 0 8 10" aria-hidden><path d="M0 0L8 5L0 10Z" fill="currentColor" /></svg>
        ) : (
          <svg width="8" height="10" viewBox="0 0 8 10" aria-hidden><path d="M0 0H2.5V10H0ZM5.5 0H8V10H5.5Z" fill="currentColor" /></svg>
        )}
      </button>
      <ol className="grid flex-1 grid-cols-4 gap-3 md:gap-6">
        {TIMELINE_GROUPS.map((g, i) => (
          <li key={g.label}>
            <button type="button" onClick={() => onSeek(i)} aria-current={i === active ? 'step' : undefined} className="group block w-full text-left">
              <span
                className={`block font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-700 md:text-[11px] ${
                  i === active ? 'text-vulcan-paper' : 'text-vulcan-muted group-hover:text-vulcan-paper/80'
                }`}
              >
                <span className={i === active ? 'text-vulcan-signal' : ''}>{g.number}</span>
                <span className="hidden sm:inline"> {g.label}</span>
              </span>
              <span className="relative mt-2.5 block h-px w-full bg-white/15">
                <span data-fill className="absolute inset-y-0 left-0 block w-0 bg-vulcan-signal" />
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
})

export default ProgressTimeline
