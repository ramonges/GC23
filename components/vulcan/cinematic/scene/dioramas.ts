import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Quaternion,
  SRGBColorSpace,
  Vector3,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { DIORAMAS } from '@/lib/vulcan/content'
import { hash2, siteMatrix, smoothstep } from './math'

export const LIFT = 0.15

export const PIT_SIZE = 1.4
export const PIT_CENTER = { x: 0.12, z: 0.02 }
const PIT_RADIUS = 0.42
const STOCKPILE = { x: 0.5, z: -0.3, r: 0.13, h: 0.075 }

/** Haul road in pit-local coordinates: pit floor → spiral up the benches → exit WSW toward Kamsar. */
export const HAUL_ROAD: [number, number][] = [
  [0.12, 0.02], [0.28, 0.1], [0.36, -0.06], [0.24, -0.26], [-0.02, -0.28],
  [-0.24, -0.12], [-0.34, 0.06], [-0.5, 0.2], [-0.68, 0.34],
]

/** Port-local offset of the Kamsar berth, which is where the maritime route begins. */
export const PORT_BERTH = { x: -0.14, z: 0.14 }
export const FACTORY_ROBOT = { x: 0.2, z: 0.12 }
export const FACTORY_FURNACE = { x: -0.22, y: 0.06, z: -0.06 }

function distToRoad(x: number, z: number) {
  let best = Infinity
  for (let i = 0; i < HAUL_ROAD.length - 1; i++) {
    const [ax, az] = HAUL_ROAD[i]
    const [bx, bz] = HAUL_ROAD[i + 1]
    const dx = bx - ax
    const dz = bz - az
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)))
    best = Math.min(best, Math.hypot(x - (ax + dx * t), z - (az + dz * t)))
  }
  return best
}

function pitDepth(x: number, z: number) {
  const dx = x - PIT_CENTER.x
  const dz = (z - PIT_CENTER.z) * 1.2
  const r = Math.hypot(dx, dz)
  if (r >= PIT_RADIUS) return { h: 0, k: 0, r }
  const k = 1 - r / PIT_RADIUS
  return { h: -(Math.ceil(k * 5) / 5) * 0.12, k, r }
}

export function pitHeight(x: number, z: number) {
  const { h: depth, r } = pitDepth(x, z)
  let h = depth
  const sr = Math.hypot(x - STOCKPILE.x, z - STOCKPILE.z)
  if (sr < STOCKPILE.r) h += (1 - sr / STOCKPILE.r) * STOCKPILE.h
  const road = distToRoad(x, z)
  if (r > PIT_RADIUS + 0.1 && sr > STOCKPILE.r + 0.04 && road > 0.035) {
    h += 0.01 + hash2(Math.floor(x * 40), Math.floor(z * 40)) * 0.018
  }
  const edge = Math.max(Math.abs(x), Math.abs(z)) / (PIT_SIZE / 2)
  return h - smoothstep(0.84, 1, edge) * (LIFT + 0.03)
}

type Rgb = [number, number, number]

function colorize(geo: BufferGeometry, fn: (x: number, y: number, z: number) => Rgb) {
  const g = geo.index ? geo.toNonIndexed() : geo
  g.deleteAttribute('uv')
  const pos = g.getAttribute('position')
  const colors = new Float32Array(pos.count * 3)
  const c = new Color()
  for (let i = 0; i < pos.count; i += 3) {
    let x = 0
    let y = 0
    let z = 0
    for (let k = 0; k < 3; k++) {
      x += pos.getX(i + k) / 3
      y += pos.getY(i + k) / 3
      z += pos.getZ(i + k) / 3
    }
    const [r, gg, b] = fn(x, y, z)
    c.setRGB(r, gg, b, SRGBColorSpace)
    for (let k = 0; k < 3; k++) colors.set([c.r, c.g, c.b], (i + k) * 3)
  }
  g.setAttribute('color', new BufferAttribute(colors, 3))
  g.computeVertexNormals()
  return g
}

const hex = (h: string): Rgb => {
  const n = parseInt(h.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

function solid(geo: BufferGeometry, color: string, local: Matrix4) {
  geo.applyMatrix4(local)
  const rgb = hex(color)
  return colorize(geo, () => rgb)
}

const Y_AXIS = new Vector3(0, 1, 0)

const at = (x: number, y: number, z: number, sx = 1, sy = 1, sz = 1, ry = 0) =>
  new Matrix4().compose(new Vector3(x, y, z), new Quaternion().setFromAxisAngle(Y_AXIS, ry), new Vector3(sx, sy, sz))

function buildPit(resolution: number) {
  const plane = new PlaneGeometry(PIT_SIZE, PIT_SIZE, resolution, resolution)
  plane.rotateX(-Math.PI / 2)
  const pos = plane.getAttribute('position')
  for (let i = 0; i < pos.count; i++) pos.setY(i, pitHeight(pos.getX(i), pos.getZ(i)))
  const ochre = hex('#b8672f')
  const rust = hex('#7c3319')
  const laterite = hex('#9a4724')
  const forest = hex('#1d2a1b')
  const forest2 = hex('#26361f')
  const road = hex('#c69b6b')
  const pile = hex('#8c3b1c')
  const terrain = colorize(plane, (x, _y, z) => {
    const { k, r } = pitDepth(x, z)
    if (distToRoad(x, z) < 0.022) return road
    if (Math.hypot(x - STOCKPILE.x, z - STOCKPILE.z) < STOCKPILE.r) return pile
    if (r < PIT_RADIUS) {
      const band = Math.ceil(k * 5) % 2 === 0 ? 1 : 0.86
      return ochre.map((c, i) => (c + (rust[i] - c) * k) * band) as Rgb
    }
    if (r < PIT_RADIUS + 0.1) return laterite
    return hash2(Math.floor(x * 30), Math.floor(z * 30)) > 0.5 ? forest : forest2
  })
  const parts = [terrain]
  parts.push(solid(new BoxGeometry(0.08, 0.03, 0.05), '#44464b', at(-0.56, 0.02, 0.3, 1, 1, 1, 0.5)))
  parts.push(solid(new BoxGeometry(0.34, 0.006, 0.012), '#2f3136', at(-0.66, 0.004, 0.42, 1, 1, 1, 0.5)))
  return parts
}

function portHeight(x: number, z: number) {
  const skirt = smoothstep(0.84, 1, Math.max(Math.abs(x), Math.abs(z)) / 0.5) * (LIFT + 0.03)
  return portSurface(x, z) - skirt
}

function portSurface(x: number, z: number) {
  const d = x - z
  if (d < -0.1) return 0
  const ridge = (cx: number, cz: number) => {
    const u = (x - cx) * 0.707 + (z - cz) * 0.707
    const w = (x - cx) * 0.707 - (z - cz) * 0.707
    return Math.max(0, 1 - Math.hypot(u / 0.2, w / 0.05)) * 0.05
  }
  return 0.028 + ridge(0.16, -0.08) + ridge(0.26, 0.06)
}

function buildPort(resolution: number) {
  const plane = new PlaneGeometry(1, 1, resolution, resolution)
  plane.rotateX(-Math.PI / 2)
  const pos = plane.getAttribute('position')
  for (let i = 0; i < pos.count; i++) pos.setY(i, portHeight(pos.getX(i), pos.getZ(i)))
  const water = hex('#0c1824')
  const water2 = hex('#10202e')
  const quay = hex('#5b5e64')
  const ground = hex('#6e5a44')
  const ore = hex('#8a3a1d')
  const terrain = colorize(plane, (x, _y, z) => {
    const d = x - z
    if (d < -0.1) return hash2(Math.floor(x * 20), Math.floor(z * 20)) > 0.5 ? water : water2
    if (d < -0.04) return quay
    return portSurface(x, z) > 0.034 ? ore : ground
  })
  const parts = [terrain]
  const along = Math.PI / 4
  parts.push(solid(new BoxGeometry(0.36, 0.012, 0.03), '#3a3c41', at(0.08, 0.05, -0.02, 1, 1, 1, along)))
  for (const [x, z] of [[-0.05, -0.03], [0.02, -0.1]] as const) {
    parts.push(solid(new BoxGeometry(0.02, 0.12, 0.02), '#c9cdd3', at(x, 0.09, z)))
    parts.push(solid(new BoxGeometry(0.16, 0.012, 0.018), '#e0621f', at(x - 0.04, 0.15, z + 0.04, 1, 1, 1, -along)))
  }
  parts.push(solid(new BoxGeometry(0.1, 0.05, 0.07), '#3f4247', at(0.32, 0.055, -0.3, 1, 1, 1, along)))
  parts.push(solid(new BoxGeometry(0.44, 0.006, 0.012), '#2f3136', at(0.3, 0.032, -0.2, 1, 1, 1, along)))
  return parts
}

function buildFactory() {
  const parts: BufferGeometry[] = []
  parts.push(solid(new BoxGeometry(1, LIFT + 0.05, 0.8), '#4b4f56', at(0, 0.02 - (LIFT + 0.05) / 2, 0)))
  parts.push(solid(new BoxGeometry(0.36, 0.14, 0.22), '#383b41', at(-0.22, 0.09, -0.18)))
  parts.push(solid(new BoxGeometry(0.38, 0.012, 0.24), '#5a5e66', at(-0.22, 0.166, -0.18)))
  parts.push(solid(new CylinderGeometry(0.022, 0.028, 0.34, 7), '#4a4d53', at(-0.36, 0.19, -0.27)))
  for (let i = 0; i < 3; i++) {
    parts.push(solid(new BoxGeometry(0.1, 0.07, 0.3), '#3a3d43', at(-0.42 + i * 0.13, 0.055, 0.22)))
    parts.push(solid(new BoxGeometry(0.1, 0.006, 0.3), '#8a8f98', at(-0.42 + i * 0.13, 0.093, 0.22)))
  }
  parts.push(solid(new BoxGeometry(0.44, 0.012, 0.05), '#1f2124', at(0.0, 0.026, 0.0)))
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 3; j++) {
      parts.push(solid(new BoxGeometry(0.04, 0.012, 0.02), '#b9bec6', at(-0.14 + i * 0.05, 0.038, -0.018 + j * 0.018)))
    }
  }
  parts.push(solid(new BoxGeometry(0.14, 0.004, 0.14), '#e0621f', at(FACTORY_ROBOT.x, 0.022, FACTORY_ROBOT.z)))
  parts.push(solid(new ConeGeometry(0.05, 0.03, 6), '#8c3b1c', at(-0.02, 0.035, -0.28)))
  return parts
}

export function buildDioramas(options: { mobile: boolean }) {
  const res = options.mobile ? 36 : 64
  const frames = {
    pit: siteMatrix(DIORAMAS.pit.lat, DIORAMAS.pit.lng, LIFT),
    port: siteMatrix(DIORAMAS.port.lat, DIORAMAS.port.lng, LIFT).multiply(
      new Matrix4().makeTranslation(-PORT_BERTH.x, 0, -PORT_BERTH.z),
    ),
    factory: siteMatrix(DIORAMAS.factory.lat, DIORAMAS.factory.lng, LIFT),
  }
  const place = (geos: BufferGeometry[], frame: Matrix4) => geos.map((g) => g.applyMatrix4(frame))
  const merged = mergeGeometries([
    ...place(buildPit(res), frames.pit),
    ...place(buildPort(Math.round(res * 0.6)), frames.port),
    ...place(buildFactory(), frames.factory),
  ])
  if (!merged) throw new Error('diorama merge failed')
  const mesh = new Mesh(
    merged,
    new MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9, metalness: 0.05 }),
  )
  mesh.name = 'dioramas'
  mesh.frustumCulled = false

  const toWorld = (frame: Matrix4, x: number, y: number, z: number) => new Vector3(x, y, z).applyMatrix4(frame)
  const exit = HAUL_ROAD[HAUL_ROAD.length - 1]
  const anchors = {
    excavation: toWorld(frames.pit, PIT_CENTER.x, pitHeight(PIT_CENTER.x, PIT_CENTER.z) + 0.03, PIT_CENTER.z),
    stockpile: toWorld(frames.pit, STOCKPILE.x, STOCKPILE.h + 0.02, STOCKPILE.z),
    nextNode: toWorld(frames.pit, exit[0], 0.03, exit[1]),
    origin: toWorld(frames.port, PORT_BERTH.x, 0.04, PORT_BERTH.z),
    furnace: toWorld(frames.factory, FACTORY_FURNACE.x, FACTORY_FURNACE.y, FACTORY_FURNACE.z),
  }
  const sites = [frames.pit, frames.port, frames.factory].map((f) => new Vector3().setFromMatrixPosition(f))
  const triangles = merged.getAttribute('position').count / 3
  return { mesh, frames, anchors, sites, triangles, resolution: res }
}
