'use client'

import type { ReactNode } from 'react'
import type { Confidence } from '@/lib/robots/types'

const CONF: Record<Confidence, { label: string; cls: string; bars: number }> = {
  high: { label: 'High', cls: 'text-vulcan-paper border-white/25', bars: 3 },
  medium: { label: 'Medium', cls: 'text-vulcan-aluminum border-white/15', bars: 2 },
  low: { label: 'Low', cls: 'text-vulcan-muted border-white/10', bars: 1 },
}

export function ConfidenceTag({ level, compact = false }: { level: Confidence; compact?: boolean }) {
  const c = CONF[level]
  return (
    <span
      title={`${c.label} confidence estimate`}
      className={`inline-flex items-center gap-1.5 border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] ${c.cls}`}
    >
      <span aria-hidden className="flex items-end gap-[2px]">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`w-[3px] ${i < c.bars ? 'bg-current' : 'bg-white/15'}`} style={{ height: 4 + i * 2 }} />
        ))}
      </span>
      {!compact && <span>{c.label}</span>}
      <span className="sr-only">confidence</span>
    </span>
  )
}

export function EstimatedBadge({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-2 border border-vulcan-signal/40 bg-vulcan-signal/[0.08] px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-vulcan-paper transition-colors hover:border-vulcan-signal"
    >
      <span className="h-1.5 w-1.5 bg-vulcan-signal" aria-hidden />
      <span className="sm:hidden" aria-hidden>
        Estimated
      </span>
      <span className="sr-only sm:not-sr-only">Estimated, not manufacturer-disclosed</span>
      <span className="hidden text-vulcan-muted transition-colors group-hover:text-vulcan-paper sm:inline">· Methodology</span>
    </button>
  )
}

export function Toggle({ pressed, onClick, children, kbd }: { pressed: boolean; onClick: () => void; children: ReactNode; kbd?: string }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`flex h-9 items-center justify-between gap-3 border px-3 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors ${
        pressed ? 'border-vulcan-paper bg-vulcan-paper text-vulcan-ink' : 'border-white/10 bg-vulcan-charcoal text-vulcan-aluminum hover:border-white/25 hover:text-vulcan-paper'
      }`}
    >
      <span>{children}</span>
      {kbd && <kbd className={`font-mono text-[9px] ${pressed ? 'text-vulcan-ink/60' : 'text-vulcan-muted'}`}>{kbd}</kbd>}
    </button>
  )
}

export function PanelLabel({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-vulcan-muted">
      <span>{children}</span>
      {right}
    </div>
  )
}

export function CloseButton({ onClick, label = 'Close' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center border border-white/10 text-vulcan-muted transition-colors hover:border-white/30 hover:text-vulcan-paper"
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M3 3l10 10M13 3L3 13" />
      </svg>
    </button>
  )
}
