export const COMMODITY_COLORS: Record<string, string> = {
  Energy: '#F36B21',
  Metals: '#D9B45A',
  Agricultural: '#8DB36A',
  Industrial: '#7FA7B8',
  Livestock: '#D08A9E',
}

export const COMMODITY_FALLBACK = '#C6C8C1'

export const VESSEL_TYPES = [
  { key: 'tanker', label: 'Tanker', color: '#E5553B' },
  { key: 'oil_tanker', label: 'Oil tanker', color: '#C2412D' },
  { key: 'chemical_tanker', label: 'Chemical tanker', color: '#F36B21' },
  { key: 'bulk_carrier', label: 'Dry bulk carrier', color: '#7FA7B8' },
  { key: 'container', label: 'Container ship', color: '#A08BD0' },
  { key: 'general_cargo', label: 'General cargo', color: '#858981' },
  { key: 'lng_carrier', label: 'LNG carrier', color: '#5FB5C4' },
  { key: 'lpg_carrier', label: 'LPG carrier', color: '#5FAE98' },
] as const

export const VESSEL_COLORS: Record<string, string> = {
  ...Object.fromEntries(VESSEL_TYPES.map((v) => [v.key, v.color])),
  other: '#C6C8C1',
}
