import { Matrix4, Vector3 } from 'three'

export const EARTH_R = 100
const DEG = Math.PI / 180

export function latLngToVec3(lat: number, lng: number, r = EARTH_R, out = new Vector3()) {
  const φ = lat * DEG
  const λ = lng * DEG
  return out.set(r * Math.cos(φ) * Math.cos(λ), r * Math.sin(φ), -r * Math.cos(φ) * Math.sin(λ))
}

export function vec3ToLatLng(v: Vector3) {
  const r = v.length() || 1
  return { lat: Math.asin(Math.max(-1, Math.min(1, v.y / r))) / DEG, lng: Math.atan2(-v.z, v.x) / DEG }
}

/** Local tangent frame at a lat/lng: x = east, y = up, z = south (right-handed). */
export function tangentFrame(lat: number, lng: number) {
  const φ = lat * DEG
  const λ = lng * DEG
  const up = new Vector3(Math.cos(φ) * Math.cos(λ), Math.sin(φ), -Math.cos(φ) * Math.sin(λ))
  const east = new Vector3(-Math.sin(λ), 0, -Math.cos(λ))
  const north = new Vector3(-Math.sin(φ) * Math.cos(λ), Math.cos(φ), Math.sin(φ) * Math.sin(λ))
  return { up, east, north, south: north.clone().negate() }
}

export function siteMatrix(lat: number, lng: number, altitude = 0) {
  const { up, east, south } = tangentFrame(lat, lng)
  return new Matrix4().makeBasis(east, up, south).setPosition(up.clone().multiplyScalar(EARTH_R + altitude))
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

export function smoothstep(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export function hash2(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}
