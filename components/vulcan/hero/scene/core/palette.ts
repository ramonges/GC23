/** Scene palette: the site palette plus a few neutral industrial tones. */
export const P = {
  black: '#080909',
  charcoal: '#111313',
  softCharcoal: '#1B1E1C',
  warmWhite: '#F1F0E8',
  muted: '#858981',
  grid: '#303431',
  orange: '#F36B21',
  bauxite: '#A9482C',
  copper: '#B86F42',
  aluminum: '#C6C8C1',
  ocean: '#536A72',
  vegetation: '#384531',

  laterite: '#7d3a22',
  ochre: '#a8683a',
  soil: '#5a4a38',
  road: '#8a7a64',
  gravel: '#6c6a62',
  concrete: '#7b7d76',
  concreteLight: '#a3a59c',
  asphalt: '#2d302e',
  steelDark: '#2a2e2c',
  steel: '#565b57',
  steelLight: '#8d918b',
  paintWhite: '#d9d8cf',
  hullRed: '#5a2419',
  hullBlack: '#1a1c1b',
  deck: '#6b3a26',
  yellow: '#c9962f',
  treeDark: '#26311f',
  tree: '#33402a',
  water: '#0f181b',
} as const

export type Rgb = [number, number, number]

/** Linear-light RGB triple for an sRGB hex, matching three.js ColorManagement. */
export function linear(hex: string, scale = 1): Rgb {
  const n = parseInt(hex.slice(1), 16)
  const f = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return [f((n >> 16) & 255) * scale, f((n >> 8) & 255) * scale, f(n & 255) * scale]
}

export function linearFromSrgb(r: number, g: number, b: number): Rgb {
  const f = (s: number) => (s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4))
  return [f(r), f(g), f(b)]
}
