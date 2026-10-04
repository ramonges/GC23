'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import type { Robot } from '@/lib/robots/types'
import { COMMODITIES, COUNTRIES, SOURCING_NOTE, formatPct, massByCommodity } from '@/lib/robots/data'
import { CloseButton, ConfidenceTag, PanelLabel } from './primitives'

const SourcingGlobe = dynamic(() => import('../scene/SourcingGlobe'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-white/[0.02]" />,
})

export default function SourcingPanel({ robot, commodity, onCommodity, onClose }: { robot: Robot; commodity: string | null; onCommodity: (id: string) => void; onClose: () => void }) {
  const slices = useMemo(() => massByCommodity(robot), [robot])
  const active = commodity && COMMODITIES[commodity] ? commodity : slices[0].id
  const data = COMMODITIES[active]
  const [focusCountry, setFocusCountry] = useState<string | null>(null)
  const mining = data.sourcing.filter((s) => s.role === 'mining').sort((a, b) => b.share_pct - a.share_pct)
  const refining = data.sourcing.filter((s) => s.role === 'refining').sort((a, b) => b.share_pct - a.share_pct)
  const focus = focusCountry ?? mining[0]?.country ?? refining[0]?.country ?? null
  const slice = slices.find((s) => s.id === active)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 pb-4 pt-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-vulcan-muted">Likely sourcing</p>
          <h2 className="mt-1 text-[22px] font-light leading-tight tracking-[-0.01em] text-vulcan-paper">{data.label}</h2>
          {slice && (
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-vulcan-muted">
              {formatPct(slice.pct)} of {robot.name} mass
            </p>
          )}
        </div>
        <CloseButton onClick={onClose} label="Close sourcing" />
      </div>

      <div className="flex gap-1.5 overflow-x-auto border-b border-white/10 px-5 py-3 [scrollbar-width:none]" role="tablist" aria-label="Commodity">
        {slices.map((s) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={s.id === active}
            onClick={() => {
              setFocusCountry(null)
              onCommodity(s.id)
            }}
            className={`flex flex-shrink-0 items-center gap-1.5 border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
              s.id === active ? 'border-vulcan-paper text-vulcan-paper' : 'border-white/10 text-vulcan-muted hover:border-white/25 hover:text-vulcan-aluminum'
            }`}
          >
            <span className="h-1.5 w-1.5" style={{ backgroundColor: s.color }} aria-hidden />
            {COMMODITIES[s.id]?.label.split(' ')[0] ?? s.id}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="relative h-[220px] border-b border-white/10">
          <SourcingGlobe markers={data.sourcing.map((s) => ({ ...s, highlighted: focusCountry ? s.country === focusCountry : undefined }))} focus={focus} />
          <div className="pointer-events-none absolute bottom-3 left-5 flex gap-4 font-mono text-[9px] uppercase tracking-[0.18em] text-vulcan-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-vulcan-signal" /> Mining
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-vulcan-paper" /> Refining
            </span>
          </div>
        </div>

        <div className="space-y-6 px-5 py-5">
          {[
            { title: 'Mining', rows: mining, color: 'bg-vulcan-signal' },
            { title: 'Refining & processing', rows: refining, color: 'bg-vulcan-paper' },
          ].map((col) => (
            <section key={col.title}>
              <PanelLabel>{col.title}</PanelLabel>
              <ul className="space-y-px">
                {col.rows.map((r) => (
                  <li key={`${r.role}-${r.country}`}>
                    <button
                      type="button"
                      onMouseEnter={() => setFocusCountry(r.country)}
                      onFocus={() => setFocusCountry(r.country)}
                      onMouseLeave={() => setFocusCountry(null)}
                      onBlur={() => setFocusCountry(null)}
                      className="w-full px-2 py-2 text-left transition-colors hover:bg-white/[0.04] focus:bg-white/[0.04] focus:outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-28 flex-shrink-0 truncate text-[13px] text-vulcan-paper">{COUNTRIES[r.country]?.name ?? r.country}</span>
                        <span className="relative h-1 flex-1 bg-white/[0.06]">
                          <span className={`absolute inset-y-0 left-0 ${col.color}`} style={{ width: `${r.share_pct}%` }} />
                        </span>
                        <span className="w-9 text-right font-mono text-[11px] text-vulcan-aluminum">{r.share_pct}%</span>
                        <ConfidenceTag level={r.confidence} compact />
                      </div>
                      <p className="mt-1 text-[11.5px] leading-snug text-vulcan-muted">{r.reasoning}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <div className="space-y-2 border-t border-white/10 pt-4 text-[11.5px] leading-relaxed text-vulcan-muted">
            <p>{data.note}</p>
            <p>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-vulcan-aluminum">Basis</span> · {data.basis}
            </p>
            <p>Shares are of world production, not of this robot’s supply chain. {SOURCING_NOTE}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
