import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  LineSegments,
  NormalBlending,
  Points,
  ShaderMaterial,
  Vector3,
} from 'three'
import { EARTH_R, GROUND, latLngToVec3 } from './core/math'
import { linear, type Rgb } from './core/palette'
import { patchHeight } from './RegionPatch'
import type { LatLng } from './sites'

/** Soft, world-sized particles. Callers write positions/alpha/size each frame. */
export class Particles {
  readonly points: Points
  readonly position: Float32Array
  readonly alpha: Float32Array
  readonly size: Float32Array
  readonly color: Float32Array
  readonly material: ShaderMaterial

  constructor(readonly count: number, options: { color: string | Rgb; additive?: boolean; soft?: number }) {
    this.position = new Float32Array(count * 3)
    this.alpha = new Float32Array(count)
    this.size = new Float32Array(count).fill(0.01)
    this.color = new Float32Array(count * 3)
    const rgb = typeof options.color === 'string' ? linear(options.color) : options.color
    for (let i = 0; i < count; i++) this.color.set(rgb, i * 3)
    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(this.position, 3))
    geo.setAttribute('aAlpha', new BufferAttribute(this.alpha, 1))
    geo.setAttribute('aSize', new BufferAttribute(this.size, 1))
    geo.setAttribute('aColor', new BufferAttribute(this.color, 3))
    this.material = new ShaderMaterial({
      uniforms: { uScale: { value: 800 }, uSoft: { value: options.soft ?? 2.2 } },
      vertexShader: /* glsl */ `
        attribute float aAlpha;
        attribute float aSize;
        attribute vec3 aColor;
        uniform float uScale;
        varying float vAlpha;
        varying vec3 vColor;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vAlpha = aAlpha;
          vColor = aColor;
          gl_PointSize = clamp(aSize * uScale / max(0.001, -mv.z), 0.0, 180.0) * step(0.002, aAlpha);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uSoft;
        varying float vAlpha;
        varying vec3 vColor;
        void main() {
          vec2 p = gl_PointCoord - 0.5;
          float r = dot(p, p) * 4.0;
          float a = exp(-r * uSoft) * vAlpha;
          if (a < 0.003) discard;
          gl_FragColor = vec4(vColor * a, a);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: options.additive ? AdditiveBlending : NormalBlending,
      fog: false,
    })
    if (!options.additive) {
      this.material.fragmentShader = this.material.fragmentShader.replace('gl_FragColor = vec4(vColor * a, a);', 'gl_FragColor = vec4(vColor, a);')
    }
    this.points = new Points(geo, this.material)
    this.points.frustumCulled = false
    this.points.renderOrder = 3
  }

  set(i: number, p: Vector3, alpha: number, size: number) {
    this.position[i * 3] = p.x
    this.position[i * 3 + 1] = p.y
    this.position[i * 3 + 2] = p.z
    this.alpha[i] = alpha
    this.size[i] = size
  }

  setColor(i: number, rgb: Rgb) {
    this.color.set(rgb, i * 3)
  }

  commit(colors = false) {
    const g = this.points.geometry
    g.getAttribute('position').needsUpdate = true
    g.getAttribute('aAlpha').needsUpdate = true
    g.getAttribute('aSize').needsUpdate = true
    if (colors) g.getAttribute('aColor').needsUpdate = true
  }

  setViewport(heightPx: number, fovDeg: number) {
    this.material.uniforms.uScale.value = heightPx / (2 * Math.tan((fovDeg * Math.PI) / 360))
  }
}

/** Polyline in world space that draws itself (uReveal) with a travelling highlight. */
export class RouteLine {
  readonly lines: LineSegments
  readonly material: ShaderMaterial
  readonly points: Vector3[]
  private cumulative: number[]

  constructor(points: Vector3[], options: { color: string; opacity?: number; pulse?: boolean; dashed?: boolean }) {
    this.points = points
    const pos: number[] = []
    const ts: number[] = []
    this.cumulative = [0]
    for (let i = 1; i < points.length; i++) this.cumulative.push(this.cumulative[i - 1] + points[i].distanceTo(points[i - 1]))
    const total = this.cumulative[this.cumulative.length - 1] || 1
    for (let i = 0; i < points.length - 1; i++) {
      pos.push(points[i].x, points[i].y, points[i].z, points[i + 1].x, points[i + 1].y, points[i + 1].z)
      ts.push(this.cumulative[i] / total, this.cumulative[i + 1] / total)
    }
    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
    geo.setAttribute('aT', new BufferAttribute(new Float32Array(ts), 1))
    this.material = new ShaderMaterial({
      uniforms: {
        uColor: { value: new Color(options.color) },
        uOpacity: { value: options.opacity ?? 0.8 },
        uReveal: { value: 1 },
        uTime: { value: 0 },
        uPulse: { value: options.pulse ? 1 : 0 },
        uDash: { value: options.dashed ? 1 : 0 },
        uLength: { value: total },
      },
      vertexShader: /* glsl */ `
        attribute float aT;
        varying float vT;
        void main() { vT = aT; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform float uReveal;
        uniform float uTime;
        uniform float uPulse;
        uniform float uDash;
        uniform float uLength;
        varying float vT;
        void main() {
          if (vT > uReveal) discard;
          float dash = uDash > 0.5 ? step(0.45, fract(vT * uLength * 1.6)) : 1.0;
          if (dash < 0.5) discard;
          float head = smoothstep(0.03, 0.0, uReveal - vT) * step(uReveal, 0.999);
          float pulse = uPulse * smoothstep(0.03, 0.0, abs(vT - fract(uTime * 0.12)));
          float a = uOpacity * (0.75 + head * 0.9 + pulse * 0.6);
          gl_FragColor = vec4(uColor * a, a);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      fog: false,
    })
    this.lines = new LineSegments(geo, this.material)
    this.lines.frustumCulled = false
    this.lines.renderOrder = 4
  }

  /** Position at fraction f along the line, by arc length. */
  at(f: number, out = new Vector3()) {
    const total = this.cumulative[this.cumulative.length - 1]
    const d = Math.min(1, Math.max(0, f)) * total
    let i = 0
    while (i < this.cumulative.length - 2 && this.cumulative[i + 1] < d) i++
    const seg = this.cumulative[i + 1] - this.cumulative[i] || 1
    return out.copy(this.points[i]).lerp(this.points[i + 1], (d - this.cumulative[i]) / seg)
  }
}

/** Sample a lat/lng polyline into dense world points on the terrain (or lifted above it). */
export function terrainPath(
  path: LatLng[],
  options: { step?: number; lift?: number; flatten?: { lat: number; lng: number; r: number }[]; arc?: number } = {},
) {
  const step = options.step ?? 0.01
  const out: Vector3[] = []
  const lengths: number[] = []
  for (let i = 0; i < path.length - 1; i++) {
    const a = latLngToVec3(path[i].lat, path[i].lng, 1)
    const b = latLngToVec3(path[i + 1].lat, path[i + 1].lng, 1)
    lengths.push(a.angleTo(b))
  }
  const total = lengths.reduce((s, x) => s + x, 0)
  let travelled = 0
  for (let i = 0; i < path.length - 1; i++) {
    const n = Math.max(2, Math.ceil(lengths[i] / ((step * Math.PI) / 180)))
    for (let k = i === 0 ? 0 : 1; k <= n; k++) {
      const f = k / n
      const lat = path[i].lat + (path[i + 1].lat - path[i].lat) * f
      const lng = path[i].lng + (path[i + 1].lng - path[i].lng) * f
      const u = (travelled + lengths[i] * f) / (total || 1)
      const h = options.flatten ? patchHeight(lat, lng, options.flatten) : 0
      const arc = options.arc ? Math.sin(Math.PI * u) * options.arc : 0
      out.push(latLngToVec3(lat, lng, EARTH_R + GROUND + h + (options.lift ?? 0.003) + arc))
    }
    travelled += lengths[i]
  }
  return out
}

/** Flat ribbon (road / rail bed) following a world-space path on the globe. */
export function ribbon(points: Vector3[], width: number, color: Rgb, edge?: Rgb) {
  const pos: number[] = []
  const col: number[] = []
  const up = new Vector3()
  const dir = new Vector3()
  const side = new Vector3()
  const left: Vector3[] = []
  const right: Vector3[] = []
  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    const q = points[Math.min(points.length - 1, i + 1)]
    const o = points[Math.max(0, i - 1)]
    dir.copy(q).sub(o).normalize()
    up.copy(p).normalize()
    side.crossVectors(dir, up).normalize().multiplyScalar(width / 2)
    left.push(p.clone().add(side))
    right.push(p.clone().sub(side))
  }
  for (let i = 0; i < points.length - 1; i++) {
    const quad = [left[i], right[i], right[i + 1], left[i], right[i + 1], left[i + 1]]
    for (const v of quad) {
      pos.push(v.x, v.y, v.z)
      col.push(...color)
    }
    if (edge) {
      const inner = (a: Vector3, b: Vector3, f: number) => a.clone().lerp(b, f)
      for (const [a, b] of [[left, right], [right, left]] as const) {
        const e0 = inner(a[i], b[i], 0.12).addScaledVector(up.copy(a[i]).normalize(), 0.0004)
        const e1 = inner(a[i + 1], b[i + 1], 0.12).addScaledVector(up.copy(a[i + 1]).normalize(), 0.0004)
        const e2 = inner(a[i], b[i], 0.16).addScaledVector(up.copy(a[i]).normalize(), 0.0004)
        const e3 = inner(a[i + 1], b[i + 1], 0.16).addScaledVector(up.copy(a[i + 1]).normalize(), 0.0004)
        for (const v of [e0, e2, e3, e0, e3, e1]) {
          pos.push(v.x, v.y, v.z)
          col.push(...edge)
        }
      }
    }
  }
  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  geo.setAttribute('color', new BufferAttribute(new Float32Array(col), 3))
  geo.computeVertexNormals()
  return geo
}

/** Position + heading along a dense world path at fraction f, for vehicles. */
export function pathPose(points: Vector3[], cumulative: number[], f: number) {
  const total = cumulative[cumulative.length - 1]
  const d = Math.min(1, Math.max(0, f)) * total
  let i = 0
  while (i < cumulative.length - 2 && cumulative[i + 1] < d) i++
  const seg = cumulative[i + 1] - cumulative[i] || 1
  const pos = points[i].clone().lerp(points[i + 1], (d - cumulative[i]) / seg)
  const dir = points[Math.min(points.length - 1, i + 1)].clone().sub(points[i]).normalize()
  return { pos, dir }
}

export function cumulativeLengths(points: Vector3[]) {
  const c = [0]
  for (let i = 1; i < points.length; i++) c.push(c[i - 1] + points[i].distanceTo(points[i - 1]))
  return c
}
