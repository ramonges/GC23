import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  LineSegments,
  Points,
  ShaderMaterial,
  Vector3,
} from 'three'
import { HUBS, MATERIAL_BY_ID, MINES, type MaterialId, type NodeKind } from '@/lib/vulcan/content'
import { EARTH_R, latLngToVec3 } from './math'

export const MARKER_KIND = { mine: 0, port: 1, processing: 2, manufacturing: 3, ship: 4, sensor: 5, glow: 6 } as const

export type MarkerEntity = {
  id: string
  material?: MaterialId
  region: string
  world: Vector3
  kind: number
  active: boolean
  visible: boolean
  loaded: boolean
  index: number
}

const KIND_BY_NODE: Record<NodeKind, number> = {
  mine: MARKER_KIND.mine,
  port: MARKER_KIND.port,
  processing: MARKER_KIND.processing,
  manufacturing: MARKER_KIND.manufacturing,
}

const SIZE: Record<number, number> = { 0: 12, 1: 6, 2: 8, 3: 9, 4: 11, 5: 10, 6: 70 }

const vertexShader = /* glsl */ `
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aKind;
  attribute float aPhase;
  attribute float aState;
  attribute float aVisible;
  uniform float uTime;
  uniform float uMotion;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vKind;
  varying float vPhase;
  varying float vState;
  varying float vAlpha;
  varying float vRing;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float dist = -mv.z;
    float nearFade = aKind < 3.5 ? smoothstep(2.5, 7.0, dist) : 1.0;
    if (aKind > 3.5 && aKind < 4.5) nearFade = smoothstep(6.0, 18.0, dist);
    vAlpha = aVisible * nearFade;
    vColor = aColor;
    vKind = aKind;
    vState = aState;
    vPhase = uMotion > 0.5 ? fract(uTime * 0.4 + aPhase) : 0.45;
    vRing = aKind < 0.5 ? 1.0 + 1.8 * aState : (aKind < 3.5 ? 1.0 + 1.4 * aState : 1.0);
    gl_PointSize = aSize * uPixelRatio * vRing * step(0.001, vAlpha);
    gl_Position = projectionMatrix * mv;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uMotion;
  varying vec3 vColor;
  varying float vKind;
  varying float vPhase;
  varying float vState;
  varying float vAlpha;
  varying float vRing;
  void main() {
    vec2 p = (gl_PointCoord - 0.5) * 2.0 * vRing;
    float r = length(p);
    float intensity = 0.0;
    if (vKind < 0.5) {
      intensity = smoothstep(0.42, 0.18, r) * 1.6 + exp(-r * r * 2.2) * 0.55;
      float ringR = mix(0.5, vRing, vPhase);
      intensity += smoothstep(0.09, 0.0, abs(r - ringR)) * (1.0 - vPhase) * vState * 0.9;
    } else if (vKind < 1.5) {
      float sq = max(abs(p.x), abs(p.y));
      intensity = smoothstep(0.5, 0.35, sq) * 0.8;
    } else if (vKind < 2.5) {
      float dm = abs(p.x) + abs(p.y);
      intensity = smoothstep(0.6, 0.45, dm) * 0.85;
      intensity += smoothstep(0.08, 0.0, abs(r - mix(0.8, vRing, vPhase))) * (1.0 - vPhase) * vState;
    } else if (vKind < 3.5) {
      intensity = smoothstep(0.12, 0.0, abs(r - 0.55)) * 0.95;
      intensity += smoothstep(0.08, 0.0, abs(r - mix(0.8, vRing, vPhase))) * (1.0 - vPhase) * vState;
    } else if (vKind < 4.5) {
      intensity = smoothstep(0.5, 0.2, r) * 1.8 + exp(-r * r * 3.0) * 0.6;
    } else if (vKind < 5.5) {
      float blink = uMotion > 0.5 ? step(0.45, fract(uTime * 1.3)) : 1.0;
      intensity = (smoothstep(0.4, 0.1, r) * 2.2 + exp(-r * r * 4.0) * 0.8) * (0.25 + 0.75 * blink);
    } else {
      intensity = exp(-r * r * 3.2) * 1.2;
    }
    if (intensity < 0.01) discard;
    gl_FragColor = vec4(vColor * intensity, clamp(intensity, 0.0, 1.0) * vAlpha);
    gl_FragColor.rgb *= vAlpha;
  }
`

export function buildMarkers(options: { mobile: boolean }) {
  const entities: MarkerEntity[] = []
  const add = (e: Omit<MarkerEntity, 'index' | 'loaded'>) => {
    entities.push({ ...e, index: entities.length, loaded: false })
  }
  const keepHubOnMobile = new Set(['kamsar', 'qingdao', 'shandong', 'shanghai', 'yamanashi', 'augsburg', 'antofagasta', 'porthedland'])

  MINES.forEach((m) => add({
    id: m.id, material: m.material, region: m.country, world: latLngToVec3(m.lat, m.lng, EARTH_R + 0.35),
    kind: MARKER_KIND.mine, active: true, visible: true,
  }))
  HUBS.forEach((h) => {
    if (options.mobile && !keepHubOnMobile.has(h.id)) return
    add({
      id: h.id, region: h.country, world: latLngToVec3(h.lat, h.lng, EARTH_R + 0.3),
      kind: KIND_BY_NODE[h.kind], active: false, visible: true,
    })
  })
  add({ id: 'ship', region: 'Atlantic', world: new Vector3(), kind: MARKER_KIND.ship, active: true, visible: false })
  add({ id: 'sensor', region: 'China', world: new Vector3(), kind: MARKER_KIND.sensor, active: true, visible: false })
  add({ id: 'furnace', region: 'China', world: new Vector3(), kind: MARKER_KIND.glow, active: true, visible: false })

  const n = entities.length
  const position = new Float32Array(n * 3)
  const color = new Float32Array(n * 3)
  const size = new Float32Array(n)
  const kind = new Float32Array(n)
  const phase = new Float32Array(n)
  const state = new Float32Array(n)
  const visible = new Float32Array(n)
  const c = new Color()
  entities.forEach((e, i) => {
    position.set([e.world.x, e.world.y, e.world.z], i * 3)
    if (e.material) c.set(MATERIAL_BY_ID[e.material].color)
    else if (e.kind === MARKER_KIND.ship) c.setRGB(1, 0.72, 0.45)
    else if (e.kind === MARKER_KIND.sensor) c.setRGB(1, 0.32, 0.08)
    else if (e.kind === MARKER_KIND.glow) c.setRGB(1, 0.42, 0.12)
    else c.setRGB(0.9, 0.9, 0.94)
    color.set([c.r, c.g, c.b], i * 3)
    size[i] = SIZE[e.kind]
    kind[i] = e.kind
    phase[i] = (i * 0.137) % 1
    state[i] = e.active ? 1 : 0
    visible[i] = e.visible ? 1 : 0
  })

  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(position, 3))
  geo.setAttribute('aColor', new BufferAttribute(color, 3))
  geo.setAttribute('aSize', new BufferAttribute(size, 1))
  geo.setAttribute('aKind', new BufferAttribute(kind, 1))
  geo.setAttribute('aPhase', new BufferAttribute(phase, 1))
  geo.setAttribute('aState', new BufferAttribute(state, 1))
  geo.setAttribute('aVisible', new BufferAttribute(visible, 1))

  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: { uTime: { value: 0 }, uMotion: { value: 1 }, uPixelRatio: { value: 1 } },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const points = new Points(geo, material)
  points.name = 'markers'
  points.frustumCulled = false
  entities.forEach((e) => (e.loaded = true))

  const byId = Object.fromEntries(entities.map((e) => [e.id, e])) as Record<string, MarkerEntity>

  /** Ease marker state toward each entity's `active`/`visible` flags and push only what changed. */
  function sync(dt: number, snap: boolean) {
    const stateAttr = geo.getAttribute('aState') as BufferAttribute
    const visAttr = geo.getAttribute('aVisible') as BufferAttribute
    let dirtyState = false
    let dirtyVis = false
    const k = snap ? 1 : Math.min(1, dt * 2.5)
    for (const e of entities) {
      const cur = stateAttr.getX(e.index)
      const target = e.active ? 1 : 0
      if (Math.abs(cur - target) > 0.001) {
        stateAttr.setX(e.index, cur + (target - cur) * k)
        dirtyState = true
      }
      const v = visAttr.getX(e.index)
      const vt = e.visible ? 1 : 0
      if (Math.abs(v - vt) > 0.001) {
        visAttr.setX(e.index, v + (vt - v) * (snap ? 1 : Math.min(1, dt * 4)))
        dirtyVis = true
      }
    }
    if (dirtyState) stateAttr.needsUpdate = true
    if (dirtyVis) visAttr.needsUpdate = true
  }

  function setWorld(id: string, world: Vector3) {
    const e = byId[id]
    if (!e) return
    e.world.copy(world)
    const attr = geo.getAttribute('position') as BufferAttribute
    attr.setXYZ(e.index, world.x, world.y, world.z)
    attr.needsUpdate = true
  }

  return { points, entities, byId, sync, setWorld, material }
}

export function buildBeams() {
  const beamMines = MINES.filter((_, i) => i % 3 === 0)
  const position = new Float32Array(beamMines.length * 6)
  const color = new Float32Array(beamMines.length * 6)
  const t = new Float32Array(beamMines.length * 2)
  const c = new Color()
  const v = new Vector3()
  beamMines.forEach((m, i) => {
    latLngToVec3(m.lat, m.lng, EARTH_R + 0.3, v)
    position.set([v.x, v.y, v.z], i * 6)
    latLngToVec3(m.lat, m.lng, EARTH_R + 7, v)
    position.set([v.x, v.y, v.z], i * 6 + 3)
    c.set(MATERIAL_BY_ID[m.material!].color)
    color.set([c.r, c.g, c.b, c.r, c.g, c.b], i * 6)
    t.set([0, 1], i * 2)
  })
  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(position, 3))
  geo.setAttribute('aColor', new BufferAttribute(color, 3))
  geo.setAttribute('aT', new BufferAttribute(t, 1))
  const material = new ShaderMaterial({
    vertexShader: /* glsl */ `
      attribute vec3 aColor;
      attribute float aT;
      varying vec3 vColor;
      varying float vT;
      varying float vFade;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vFade = smoothstep(20.0, 60.0, -mv.z);
        vColor = aColor;
        vT = aT;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uStrength;
      varying vec3 vColor;
      varying float vT;
      varying float vFade;
      void main() {
        float a = (1.0 - vT) * uStrength * vFade;
        gl_FragColor = vec4(vColor * a * 1.4, a);
      }
    `,
    uniforms: { uStrength: { value: 1 } },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const lines = new LineSegments(geo, material)
  lines.name = 'beams'
  lines.frustumCulled = false
  return { lines, material }
}
