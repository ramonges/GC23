export type LatLng = { lat: number; lng: number }

const DEG = Math.PI / 180

/** Spherical interpolation between two lat/lng points (degrees). `angle` is the arc length in radians. */
export function greatCircle(a: LatLng, b: LatLng, f: number) {
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
 * Sample a route through optional waypoints as a sequence of lat/lng points with a 0→1 parameter,
 * spaced proportionally to arc length so animated reveals move at constant speed.
 */
export function sampleRoute(points: LatLng[], samples: number) {
  const legs = points.slice(1).map((p, i) => greatCircle(points[i], p, 1).angle)
  const total = legs.reduce((s, x) => s + x, 0) || 1
  const out: { lat: number; lng: number; t: number }[] = []
  for (let i = 0; i <= samples; i++) {
    const t = i / samples
    let dist = t * total
    let leg = 0
    while (leg < legs.length - 1 && dist > legs[leg]) {
      dist -= legs[leg]
      leg++
    }
    const f = legs[leg] > 0 ? Math.min(1, dist / legs[leg]) : 0
    const g = greatCircle(points[leg], points[leg + 1], f)
    out.push({ lat: g.lat, lng: g.lng, t })
  }
  return { points: out, angle: total }
}
