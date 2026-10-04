export type Confidence = 'high' | 'medium' | 'low'

export type Archetype = 'humanoid' | 'digitigrade' | 'droid' | 'desktop'

export type PartMaterial = {
  /** Sub-component the material belongs to, e.g. "NdFeB magnets". */
  component: string
  commodity: string
  grade: string
  /** Share of the whole robot's mass, in percent. */
  mass_pct: number
  confidence: Confidence
}

export type RobotPart = {
  /** Must equal the mesh name in the GLB (or the placeholder). */
  meshName: string
  label: string
  group: string
  materials: PartMaterial[]
}

export type RobotPalette = { shell: string; dark: string; accent: string; frame: string }

export type Robot = {
  id: string
  name: string
  maker: string
  archetype: Archetype
  height_m: number
  mass_kg: number
  battery_kwh: number
  dof: string
  blurb: string
  palette: RobotPalette
  /** Path to a Draco-compressed .glb under /public, or null to use the procedural placeholder. */
  model: string | null
  parts: RobotPart[]
}

export type SourcingEntry = {
  country: string
  role: 'mining' | 'refining'
  share_pct: number
  confidence: Confidence
  reasoning: string
}

export type Commodity = {
  label: string
  color: string
  group: string
  basis: string
  note: string
  sourcing: SourcingEntry[]
}

export type Country = { name: string; lat: number; lng: number }
