import { Matrix4, Quaternion, Vector3 } from 'three'

export const EARTH_R = 100
/** Height of the regional terrain and site ground above the globe sphere. */
export const GROUND = 0.02
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

/** Matrix from a site's local frame (x east, y up, z south; units = scene units) to world space. */
export function siteMatrix(lat: number, lng: number, altitude = GROUND, rotation = 0) {
  const { up, east, south } = tangentFrame(lat, lng)
  return new Matrix4()
    .makeBasis(east, up, south)
    .setPosition(up.clone().multiplyScalar(EARTH_R + altitude))
    .multiply(new Matrix4().makeRotationY(rotation))
}

/** Convert a site-local (x east, z south) offset to lat/lng, valid for the small distances used by sites. */
export function localToLatLng(lat: number, lng: number, x: number, z: number) {
  const dLat = (-z / EARTH_R) / DEG
  const dLng = (x / (EARTH_R * Math.cos(lat * DEG))) / DEG
  return { lat: lat + dLat, lng: lng + dLng }
}

export const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x))
export const clamp01 = (x: number) => clamp(x, 0, 1)
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export function smoothstep(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3)

/** Rises 0→1 over [a, a+fade] and falls back over [b-fade, b]. */
export function windowed(t: number, a: number, b: number, fade = 0.6) {
  return smoothstep(a, a + fade, t) * (1 - smoothstep(b - fade, b, t))
}

export function hash2(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}

export function valueNoise(x: number, y: number) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const a = hash2(xi, yi)
  const b = hash2(xi + 1, yi)
  const c = hash2(xi, yi + 1)
  const d = hash2(xi + 1, yi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

export function fbm(x: number, y: number, octaves = 4) {
  let sum = 0
  let amp = 0.5
  let f = 1
  for (let i = 0; i < octaves; i++) {
    sum += valueNoise(x * f, y * f) * amp
    f *= 2
    amp *= 0.5
  }
  return sum
}

/** Monotone cubic (Fritsch–Carlson) interpolation: smooth velocity through keys without overshoot. */
export function monotoneCubic(xs: number[], ys: number[], x: number) {
  const n = xs.length
  if (x <= xs[0]) return ys[0]
  if (x >= xs[n - 1]) return ys[n - 1]
  let i = 0
  while (i < n - 2 && x > xs[i + 1]) i++
  const d: number[] = []
  const m: number[] = []
  for (let k = 0; k < n - 1; k++) d.push((ys[k + 1] - ys[k]) / (xs[k + 1] - xs[k]))
  m.push(d[0])
  for (let k = 1; k < n - 1; k++) m.push(d[k - 1] * d[k] <= 0 ? 0 : (d[k - 1] + d[k]) / 2)
  m.push(d[n - 2])
  for (let k = 0; k < n - 1; k++) {
    if (d[k] === 0) {
      m[k] = 0
      m[k + 1] = 0
      continue
    }
    const a = m[k] / d[k]
    const b = m[k + 1] / d[k]
    const s = a * a + b * b
    if (s > 9) {
      const t = 3 / Math.sqrt(s)
      m[k] = t * a * d[k]
      m[k + 1] = t * b * d[k]
    }
  }
  const h = xs[i + 1] - xs[i]
  const t = (x - xs[i]) / h
  const t2 = t * t
  const t3 = t2 * t
  return (
    (2 * t3 - 3 * t2 + 1) * ys[i] +
    (t3 - 2 * t2 + t) * h * m[i] +
    (-2 * t3 + 3 * t2) * ys[i + 1] +
    (t3 - t2) * h * m[i + 1]
  )
}

const Y = new Vector3(0, 1, 0)
/** Transform placing a unit-height, Y-aligned primitive between two points. */
export function between(a: Vector3, b: Vector3, radiusScale = 1) {
  const dir = b.clone().sub(a)
  const len = dir.length()
  const q = new Quaternion().setFromUnitVectors(Y, dir.clone().normalize())
  return new Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), q, new Vector3(radiusScale, len, radiusScale))
}
