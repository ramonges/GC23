import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, LineSegments, ShaderMaterial, Vector3 } from 'three'
import { MARITIME_ROUTE_INDEX, MATERIAL_BY_ID, NODE_BY_ID, ROUTES } from '@/lib/vulcan/content'
import { sampleRoute } from '@/lib/vulcan/geo'
import { LIFT } from './dioramas'
import { EARTH_R, latLngToVec3 } from './math'

const SIGNAL = new Color('#FF6A1A')

/** Hero-local reveal window per route kind, as fractions of the hero scroll segment. */
const REVEAL: Record<string, [number, number]> = {
  export: [0.26, 0.14],
  ocean: [0.3, 0.2],
  delivery: [0.76, 0.18],
}

export function routePoints(index: number) {
  const r = ROUTES[index]
  const a = NODE_BY_ID[r.from]
  const b = NODE_BY_ID[r.to]
  return [a, ...(r.via || []), b].map((p) => ({ lat: p.lat, lng: p.lng }))
}

/** Route ends that sit on a raised diorama start at the diorama's surface instead of the globe's. */
const DIORAMA_NODES = new Set(['boke', 'kamsar'])

export function routeAltitude(index: number, t: number, angle: number) {
  const r = ROUTES[index]
  const startLift = DIORAMA_NODES.has(r.from) ? LIFT * (1 - Math.min(1, t / 0.006)) : 0
  if (angle < 0.05) return LIFT + 0.035 + 0.04 * Math.sin(Math.PI * t)
  if (r.via) return startLift + 0.02 + Math.min(1, t * 30, (1 - t) * 30) * (0.35 + 0.5 * Math.sin(Math.PI * t))
  return startLift + Math.sin(Math.PI * t) * Math.min(12, 1.5 + angle * 8)
}

export function buildArcs() {
  const positions: number[] = []
  const ts: number[] = []
  const starts: number[] = []
  const durs: number[] = []
  const colors: number[] = []
  const seeds: number[] = []
  const maritime: number[] = []
  const v = new Vector3()
  const c = new Color()

  ROUTES.forEach((route, index) => {
    const sampled = sampleRoute(routePoints(index), 1)
    const segments = Math.max(10, Math.min(260, Math.round(sampled.angle * 140)))
    const { points, angle } = sampleRoute(routePoints(index), segments)
    const [start, dur] = REVEAL[route.kind]
    c.set(MATERIAL_BY_ID[route.material].color).lerp(SIGNAL, route.kind === 'delivery' ? 0.75 : 0.55)
    const seed = (index * 0.173) % 1
    for (let i = 0; i < points.length - 1; i++) {
      for (const p of [points[i], points[i + 1]]) {
        latLngToVec3(p.lat, p.lng, EARTH_R + routeAltitude(index, p.t, angle), v)
        positions.push(v.x, v.y, v.z)
        ts.push(p.t)
        starts.push(start + (index % 4) * 0.012)
        durs.push(dur)
        colors.push(c.r, c.g, c.b)
        seeds.push(seed)
        maritime.push(index === MARITIME_ROUTE_INDEX ? 1 : 0)
      }
    }
  })

  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  geo.setAttribute('aT', new BufferAttribute(new Float32Array(ts), 1))
  geo.setAttribute('aStart', new BufferAttribute(new Float32Array(starts), 1))
  geo.setAttribute('aDur', new BufferAttribute(new Float32Array(durs), 1))
  geo.setAttribute('aColor', new BufferAttribute(new Float32Array(colors), 3))
  geo.setAttribute('aSeed', new BufferAttribute(new Float32Array(seeds), 1))
  geo.setAttribute('aMaritime', new BufferAttribute(new Float32Array(maritime), 1))

  const material = new ShaderMaterial({
    vertexShader: /* glsl */ `
      attribute float aT;
      attribute float aStart;
      attribute float aDur;
      attribute vec3 aColor;
      attribute float aSeed;
      attribute float aMaritime;
      varying float vT;
      varying float vStart;
      varying float vDur;
      varying vec3 vColor;
      varying float vSeed;
      varying float vMaritime;
      void main() {
        vT = aT; vStart = aStart; vDur = aDur; vColor = aColor; vSeed = aSeed; vMaritime = aMaritime;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uHeroU;
      uniform float uTime;
      uniform float uMotion;
      uniform float uMaritimeMode;
      uniform float uMaritimeT;
      varying float vT;
      varying float vStart;
      varying float vDur;
      varying vec3 vColor;
      varying float vSeed;
      varying float vMaritime;
      void main() {
        float reveal = clamp((uHeroU - vStart) / vDur, 0.0, 1.0);
        float focus = vMaritime * uMaritimeMode;
        reveal = mix(reveal, uMaritimeT, focus);
        if (vT > reveal + 0.0001) discard;
        float head = uMotion > 0.5 ? fract(uTime * 0.09 + vSeed) : -1.0;
        float pulse = smoothstep(0.035, 0.0, abs(vT - head));
        float tip = focus * smoothstep(0.02, 0.0, abs(vT - uMaritimeT));
        float dim = 1.0 - 0.75 * uMaritimeMode * (1.0 - vMaritime);
        float a = (0.5 + pulse * 0.9 + focus * 0.6 + tip * 1.5) * dim;
        gl_FragColor = vec4(vColor * a * 1.3, a);
      }
    `,
    uniforms: {
      uHeroU: { value: 0 },
      uTime: { value: 0 },
      uMotion: { value: 1 },
      uMaritimeMode: { value: 0 },
      uMaritimeT: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const lines = new LineSegments(geo, material)
  lines.name = 'arcs'
  lines.frustumCulled = false
  return { lines, material }
}
