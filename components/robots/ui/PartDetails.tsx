'use client'

import type { Robot, RobotPart } from '@/lib/robots/types'
import { COMMODITIES, commodityColor, formatKg, formatPct, groupMaterials, partConfidence, partMass } from '@/lib/robots/data'
import { ConfidenceTag } from './primitives'

export default function PartDetails({ robot, part, onCommodity }: { robot: Robot; part: RobotPart; onCommodity?: (id: string) => void }) {
  const pct = partMass(part)
  const groups = groupMaterials(part)
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vulcan-muted">{part.group}</p>
          <h3 className="mt-1 text-[17px] font-medium leading-tight text-vulcan-paper">{part.label}</h3>
          <p className="mt-1 font-mono text-[10px] text-vulcan-muted">{part.meshName}</p>
        </div>
        <div className="text-right">
          <p className="text-[20px] font-light leading-none text-vulcan-paper">{formatPct(pct)}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-vulcan-muted">of mass · ≈ {formatKg((pct / 100) * robot.mass_kg)}</p>
          <div className="mt-2 flex justify-end">
            <ConfidenceTag level={partConfidence(part)} />
          </div>
        </div>
      </div>
      <ul className="mt-4 space-y-3 border-t border-white/10 pt-3">
        {groups.map((g) => (
          <li key={g.component}>
            <p className="mb-1.5 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-vulcan-aluminum">
              <span>{g.component}</span>
              <span className="text-vulcan-muted">{formatPct(g.pct)}</span>
            </p>
            <ul className="space-y-1">
              {g.materials.map((m, i) => (
                <li key={i} className="grid grid-cols-[auto_1fr_auto] items-start gap-x-2.5 text-[12px] leading-snug">
                  <span className="mt-[5px] h-1.5 w-1.5" style={{ backgroundColor: commodityColor(m.commodity) }} aria-hidden />
                  <span>
                    {onCommodity ? (
                      <button type="button" onClick={() => onCommodity(m.commodity)} className="text-left text-vulcan-paper underline-offset-2 hover:underline">
                        {COMMODITIES[m.commodity]?.label ?? m.commodity}
                      </button>
                    ) : (
                      <span className="text-vulcan-paper">{COMMODITIES[m.commodity]?.label ?? m.commodity}</span>
                    )}
                    <span className="block text-vulcan-muted">{m.grade}</span>
                  </span>
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <span className="font-mono text-[11px] text-vulcan-aluminum">{formatPct(m.mass_pct)}</span>
                    <ConfidenceTag level={m.confidence} compact />
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}
