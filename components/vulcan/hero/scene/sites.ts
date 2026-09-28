import { Vector3 } from 'three'
import { EARTH_R, latLngToVec3 } from './core/math'

export type LatLng = { lat: number; lng: number }

/**
 * Site anchors. Locations name real regions (Boké, Kamsar, the US Gulf) but the facilities are illustrative,
 * modeled at a stylized scale where 1 scene unit ≈ 64 km.
 */
export const SITES = {
  mine: { lat: 11.1, lng: -13.8, half: 0.78 },
  yard: { lat: 10.74, lng: -14.44 },
  port: { lat: 10.65, lng: -14.585, half: 0.5 },
  refinery: { lat: 30.05, lng: -90.75 },
  smelter: { lat: 30.47, lng: -90.07 },
  factory: { lat: 31.02, lng: -89.28 },
} as const

export type Patch = { id: string; lat: [number, number]; lng: [number, number]; texture: string; segments: number }

export const PATCHES: Patch[] = [
  { id: 'guinea', lat: [8.5, 13.5], lng: [-16.5, -11.5], texture: '/hero/patch-guinea.webp', segments: 320 },
  { id: 'gulf', lat: [28, 33], lng: [-93, -87], texture: '/hero/patch-gulf.webp', segments: 256 },
]

/** Fixed world-space sun: Guinea and the US Gulf are both lit, from the west, with no light-direction changes. */
export const SUN_DIR = latLngToVec3(24, -74, 1, new Vector3()).normalize()

/** Kamsar → Atlantic → Windward Passage → Yucatán Channel → Mississippi mouth. */
export const MARITIME_ROUTE: LatLng[] = [
  { lat: 10.65, lng: -14.655 },
  { lat: 10.55, lng: -15.2 },
  { lat: 10.2, lng: -17.5 },
  { lat: 13, lng: -26 },
  { lat: 18, lng: -45 },
  { lat: 20.2, lng: -65 },
  { lat: 20.1, lng: -73.6 },
  { lat: 18.9, lng: -78.5 },
  { lat: 21.7, lng: -85.7 },
  { lat: 25.6, lng: -88.2 },
  { lat: 28.95, lng: -89.35 },
]

/** Muted alternative: Kamsar → Rotterdam → US Gulf. */
export const ALT_ROUTE: LatLng[] = [
  { lat: 10.65, lng: -14.655 },
  { lat: 14, lng: -18.5 },
  { lat: 28, lng: -16 },
  { lat: 43.5, lng: -10.5 },
  { lat: 49.3, lng: -4.5 },
  { lat: 51.9, lng: 3.9 },
  { lat: 49.3, lng: -6.5 },
  { lat: 40, lng: -40 },
  { lat: 28.5, lng: -70 },
  { lat: 24.3, lng: -81.5 },
  { lat: 26, lng: -86.5 },
  { lat: 28.95, lng: -89.35 },
]

export function surface(lat: number, lng: number, altitude = 0.02) {
  return latLngToVec3(lat, lng, EARTH_R + altitude)
}
