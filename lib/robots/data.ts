import robotsJson from '@/data/robots/robots.json'
import commoditiesJson from '@/data/robots/commodities.json'
import type { Commodity, Country, Robot, RobotPart } from './types'

export const ROBOTS = robotsJson.robots as Robot[]
export const COMMODITIES = commoditiesJson.commodities as Record<string, Commodity>
export const COUNTRIES = commoditiesJson.countries as Record<string, Country>
export const SOURCING_NOTE = commoditiesJson.source

export const getRobot = (id: string | null) => (id ? ROBOTS.find((r) => r.id === id) ?? null : null)

export function commodityColor(id: string) {
  return COMMODITIES[id]?.color ?? '#C6C8C1'
}

export function partMass(part: RobotPart) {
  return part.materials.reduce((s, m) => s + m.mass_pct, 0)
}

/** Commodity with the largest mass inside a part. */
export function dominantCommodity(part: RobotPart) {
  const totals = new Map<string, number>()
  for (const m of part.materials) totals.set(m.commodity, (totals.get(m.commodity) ?? 0) + m.mass_pct)
  let best = ''
  let max = -1
  totals.forEach((v, k) => {
    if (v > max) {
      max = v
      best = k
    }
  })
  return best
}

export type CommoditySlice = { id: string; label: string; color: string; pct: number; kg: number }

export function massByCommodity(robot: Robot): CommoditySlice[] {
  const totals = new Map<string, number>()
  for (const p of robot.parts) for (const m of p.materials) totals.set(m.commodity, (totals.get(m.commodity) ?? 0) + m.mass_pct)
  return Array.from(totals, ([id, pct]) => ({
    id,
    label: COMMODITIES[id]?.label ?? id,
    color: commodityColor(id),
    pct,
    kg: (pct / 100) * robot.mass_kg,
  })).sort((a, b) => b.pct - a.pct)
}

/** Lowest confidence among a part's materials, used as the part-level tag. */
export function partConfidence(part: RobotPart) {
  const order = { high: 0, medium: 1, low: 2 } as const
  return part.materials.reduce<'high' | 'medium' | 'low'>((w, m) => (order[m.confidence] > order[w] ? m.confidence : w), 'high')
}

export function groupMaterials(part: RobotPart) {
  const groups = new Map<string, RobotPart['materials']>()
  for (const m of part.materials) {
    const list = groups.get(m.component) ?? []
    list.push(m)
    groups.set(m.component, list)
  }
  return Array.from(groups, ([component, materials]) => ({
    component,
    materials: [...materials].sort((a, b) => b.mass_pct - a.mass_pct),
    pct: materials.reduce((s, m) => s + m.mass_pct, 0),
  })).sort((a, b) => b.pct - a.pct)
}

export function formatPct(pct: number) {
  if (pct >= 10) return `${pct.toFixed(0)}%`
  if (pct >= 1) return `${pct.toFixed(1)}%`
  if (pct >= 0.1) return `${pct.toFixed(2)}%`
  return '<0.1%'
}

export function formatKg(kg: number) {
  if (kg >= 1) return `${kg.toFixed(kg >= 10 ? 0 : 1)} kg`
  return `${Math.max(1, Math.round(kg * 1000))} g`
}
