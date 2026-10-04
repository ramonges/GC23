'use client'

import { useState } from 'react'
import type { CommoditySlice } from '@/lib/robots/data'
import { formatKg, formatPct } from '@/lib/robots/data'

const SIZE = 168
const R = 70
const STROKE = 16
const C = 2 * Math.PI * R

export default function DonutChart({ slices, massKg, onSelect }: { slices: CommoditySlice[]; massKg: number; onSelect: (id: string) => void }) {
  const [hover, setHover] = useState<string | null>(null)
  const shown = hover ? slices.find((s) => s.id === hover) : null
  let acc = 0
  return (
    <div>
      <div className="flex items-center gap-5">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-[148px] w-[148px] flex-shrink-0 -rotate-90" role="img" aria-label="Estimated mass by commodity">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={STROKE} />
          {slices.map((s) => {
            const len = (s.pct / 100) * C
            const gap = slices.length > 1 ? Math.min(1.2, len * 0.3) : 0
            const el = (
              <circle
                key={s.id}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth={hover === s.id ? STROKE + 4 : STROKE}
                strokeDasharray={`${Math.max(0, len - gap)} ${C}`}
                strokeDashoffset={-acc}
                opacity={hover && hover !== s.id ? 0.35 : 1}
                className="cursor-pointer transition-[opacity,stroke-width] duration-200"
                onMouseEnter={() => setHover(s.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelect(s.id)}
              />
            )
            acc += len
            return el
          })}
        </svg>
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vulcan-muted">{shown ? shown.label : 'Est. total mass'}</p>
          <p className="mt-1 text-[28px] font-light leading-none tracking-[-0.02em] text-vulcan-paper">{shown ? formatPct(shown.pct) : `${massKg} kg`}</p>
          <p className="mt-1.5 font-mono text-[10px] text-vulcan-muted">{shown ? `≈ ${formatKg(shown.kg)}` : `${slices.length} commodities`}</p>
        </div>
      </div>
      <ul className="mt-4 grid grid-cols-1 gap-px">
        {slices.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onSelect(s.id)}
              onMouseEnter={() => setHover(s.id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(s.id)}
              onBlur={() => setHover(null)}
              className={`grid w-full grid-cols-[auto_1fr_auto_auto] items-center gap-x-2.5 px-1.5 py-1 text-left text-[12px] transition-colors ${
                hover === s.id ? 'bg-white/[0.05]' : ''
              }`}
            >
              <span className="h-1.5 w-1.5" style={{ backgroundColor: s.color }} aria-hidden />
              <span className="truncate text-vulcan-aluminum">{s.label}</span>
              <span className="font-mono text-[10px] text-vulcan-muted">{formatKg(s.kg)}</span>
              <span className="w-12 text-right font-mono text-[11px] text-vulcan-paper">{formatPct(s.pct)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
