import heroGlobe from './heroGlobe.json'

export type HeroGlobeConfig = typeof heroGlobe

export const HERO_GLOBE: HeroGlobeConfig = heroGlobe

const DEG = Math.PI / 180

type Vec3 = { x: number; y: number; z: number }

/** Unit vector for a lat/lng in the rendered camera frame at loop time `t` (seconds). */
export function orthoVector(latDeg: number, lngDeg: number, t: number, cfg: HeroGlobeConfig = HERO_GLOBE): Vec3 {
  const lat = latDeg * DEG
  const lat0 = cfg.viewLatDeg * DEG
  const lonc = cfg.startLonDeg * DEG - 2 * Math.PI * (t / cfg.periodSec)
  const dl = lngDeg * DEG - lonc
  const gx = Math.cos(lat) * Math.sin(dl)
  const gy = Math.cos(lat0) * Math.sin(lat) - Math.sin(lat0) * Math.cos(lat) * Math.cos(dl)
  const gz = Math.sin(lat0) * Math.sin(lat) + Math.cos(lat0) * Math.cos(lat) * Math.cos(dl)
  const roll = cfg.rollDeg * DEG
  return {
    x: gx * Math.cos(roll) - gy * Math.sin(roll),
    y: gx * Math.sin(roll) + gy * Math.cos(roll),
    z: gz,
  }
}

/** Screen position in rendered-video pixels for a camera-frame vector lifted to `altitude` (fraction of radius). */
export function toVideoPixels(v: Vec3, altitude = 0, cfg: HeroGlobeConfig = HERO_GLOBE) {
  const k = cfg.radius * (1 + altitude)
  return { x: cfg.cx + v.x * k, y: cfg.cy - v.y * k }
}

/** Spherical interpolation between two lat/lng points, returning [lat, lng] in degrees. */
export function greatCircle(a: { lat: number; lng: number }, b: { lat: number; lng: number }, f: number) {
  const φ1 = a.lat * DEG
  const λ1 = a.lng * DEG
  const φ2 = b.lat * DEG
  const λ2 = b.lng * DEG
  const d = 2 * Math.asin(Math.sqrt(
    Math.sin((φ2 - φ1) / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2,
  ))
  if (d < 1e-9) return { lat: a.lat, lng: a.lng, angle: 0 }
  const A = Math.sin((1 - f) * d) / Math.sin(d)
  const B = Math.sin(f * d) / Math.sin(d)
  const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2)
  const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2)
  const z = A * Math.sin(φ1) + B * Math.sin(φ2)
  return {
    lat: Math.atan2(z, Math.sqrt(x * x + y * y)) / DEG,
    lng: Math.atan2(y, x) / DEG,
    angle: d,
  }
}

/**
 * Map rendered-video pixels to element pixels for a `<video>` using object-fit: cover.
 * `posX`/`posY` mirror CSS object-position as fractions (0.5 = center).
 */
export function coverTransform(
  elementWidth: number,
  elementHeight: number,
  posX = 0.5,
  posY = 0.5,
  cfg: HeroGlobeConfig = HERO_GLOBE,
) {
  const scale = Math.max(elementWidth / cfg.width, elementHeight / cfg.height)
  return {
    scale,
    offsetX: (elementWidth - cfg.width * scale) * posX,
    offsetY: (elementHeight - cfg.height * scale) * posY,
  }
}
