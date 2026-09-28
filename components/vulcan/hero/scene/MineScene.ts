import {
  BufferAttribute,
  Color,
  Group,
  InstancedMesh,
  Matrix4,
  PlaneGeometry,
  Quaternion,
  Vector3,
} from 'three'
import { Builder, T, type Materials } from './core/builder'
import { clamp01, fbm, hash2, localToLatLng, siteMatrix, smoothstep, windowed } from './core/math'
import { linear, linearFromSrgb, P, type Rgb } from './core/palette'
import { excavator, haulTruck, type Excavator } from './entities'
import { Particles } from './fx'
import type { PatchSampler } from './RegionPatch'
import { SITES } from './sites'
import type { FrameCtx, StageScene } from './stage'

const PIT = { x: 0.06, z: 0.02, rx: 0.42, rz: 0.34, depth: 0.15, steps: 7 }
const HALF = SITES.mine.half
const ROAD_W = 0.02
const STOCKPILES = [
  { x: 0.64, z: -0.46, r: 0.13, h: 0.075 },
  { x: 0.4, z: -0.56, r: 0.09, h: 0.05 },
]
export const CRUSHER = { x: 0.57, z: -0.17 }

/** Floor → spiral up the benches → rim → crusher. */
const SPIRAL: [number, number][] = [
  [0.06, 0.02], [0.17, 0.09], [0.25, -0.04], [0.14, -0.17], [-0.08, -0.17], [-0.22, -0.02],
  [-0.2, 0.19], [0.0, 0.3], [0.26, 0.28], [0.44, 0.13], [0.5, -0.04], [CRUSHER.x - 0.04, CRUSHER.z + 0.02],
]
/** Crusher → around the pit → footprint edge toward the storage yard (WSW). */
export const EXIT_ROAD: [number, number][] = [
  [CRUSHER.x, CRUSHER.z], [0.68, 0.08], [0.56, 0.42], [0.14, 0.54], [-0.34, 0.52], [-0.62, 0.5], [-HALF, 0.5],
]

function polyInfo(poly: [number, number][]) {
  const cum = [0]
  for (let i = 1; i < poly.length; i++) cum.push(cum[i - 1] + Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]))
  return cum
}
const SPIRAL_CUM = polyInfo(SPIRAL)
const EXIT_CUM = polyInfo(EXIT_ROAD)

function closest(poly: [number, number][], cum: number[], x: number, z: number) {
  let best = { d: Infinity, s: 0 }
  for (let i = 0; i < poly.length - 1; i++) {
    const [ax, az] = poly[i]
    const [bx, bz] = poly[i + 1]
    const dx = bx - ax
    const dz = bz - az
    const t = clamp01(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz))
    const d = Math.hypot(x - (ax + dx * t), z - (az + dz * t))
    if (d < best.d) best = { d, s: (cum[i] + (cum[i + 1] - cum[i]) * t) / cum[cum.length - 1] }
  }
  return best
}

function pitR(x: number, z: number) {
  return Math.hypot((x - PIT.x) / PIT.rx, (z - PIT.z) / PIT.rz)
}

function benchLevel(x: number, z: number) {
  const r = pitR(x, z)
  if (r >= 1) return 0
  const k = (1 - r) * PIT.steps + (fbm(x * 9 + 3, z * 9, 2) - 0.5) * 0.4
  const lvl = Math.floor(k) + smoothstep(0.8, 1, k - Math.floor(k))
  return Math.min(PIT.steps, Math.max(0, lvl))
}

const spiralHeight = (s: number) => -PIT.depth * Math.max(0, 1 - s / 0.9)

export function mineHeight(x: number, z: number) {
  let h = -(benchLevel(x, z) / PIT.steps) * PIT.depth
  const sp = closest(SPIRAL, SPIRAL_CUM, x, z)
  if (sp.d < ROAD_W * 2.2) h = h + (spiralHeight(sp.s) - h) * smoothstep(ROAD_W * 2.2, ROAD_W * 0.9, sp.d)
  for (const s of STOCKPILES) {
    const d = Math.hypot(x - s.x, z - s.z) / s.r
    if (d < 1) h += Math.pow(1 - d, 1.25) * s.h * (0.92 + fbm(x * 40, z * 40, 2) * 0.16)
  }
  if (pitR(x, z) > 1.05) h += (fbm(x * 14, z * 14, 3) - 0.5) * 0.008
  const edge = Math.max(Math.abs(x), Math.abs(z)) / HALF
  return h * (1 - smoothstep(0.86, 1, edge))
}

const BANDS: Rgb[] = ['#8f452d', '#a0643f', '#7a3b26', '#a8744b', '#6e3624', '#8c5537'].map((c) => linear(c))

export function buildMine(m: Materials, sampler: PatchSampler | null, options: { quality: 'high' | 'low' }): StageScene {
  const site = SITES.mine
  const frame = siteMatrix(site.lat, site.lng)
  const group = new Group()
  group.name = 'mine'
  const b = new Builder()
  b.push(frame)

  const res = options.quality === 'high' ? 220 : 120
  const plane = new PlaneGeometry(HALF * 2, HALF * 2, res, res).rotateX(-Math.PI / 2)
  const pos = plane.getAttribute('position')
  for (let i = 0; i < pos.count; i++) pos.setY(i, mineHeight(pos.getX(i), pos.getZ(i)))
  plane.computeVertexNormals()
  const nrm = plane.getAttribute('normal')
  const colors = new Float32Array(pos.count * 3)
  const road = linear('#9b8266')
  const roadEdge = linear('#7d6650')
  const soil = linear('#6b4430')
  const soil2 = linear('#5a3a28')
  const oreColor = linear('#8f3b22')
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const r = pitR(x, z)
    const slope = Math.pow(Math.max(0, nrm.getY(i)), 6)
    const n = fbm(x * 30, z * 30, 3)
    let c: Rgb
    if (r < 1.02) {
      const band = BANDS[Math.floor(benchLevel(x, z)) % BANDS.length]
      const k = (0.58 + 0.42 * slope) * (0.94 + n * 0.12)
      c = [band[0] * k, band[1] * k, band[2] * k]
    } else {
      const clearing = smoothstep(1.62, 1.28, r) + smoothstep(0.16, 0.05, Math.min(...STOCKPILES.map((s) => Math.hypot(x - s.x, z - s.z) - s.r)))
      const cleared: Rgb = soil.map((v, j) => v + (soil2[j] - v) * n) as Rgb
      let ground: Rgb = cleared
      if (sampler) {
        const ll = localToLatLng(site.lat, site.lng, x, z)
        const [sr, sg, sb] = sampler.sample(ll.lat, ll.lng)
        ground = linearFromSrgb(sr, sg, sb)
      }
      const w = clamp01(clearing)
      c = [ground[0] + (cleared[0] - ground[0]) * w, ground[1] + (cleared[1] - ground[1]) * w, ground[2] + (cleared[2] - ground[2]) * w]
    }
    for (const s of STOCKPILES) {
      if (Math.hypot(x - s.x, z - s.z) < s.r) c = oreColor.map((v) => v * (0.85 + n * 0.3)) as Rgb
    }
    const rd = Math.min(closest(SPIRAL, SPIRAL_CUM, x, z).d, closest(EXIT_ROAD, EXIT_CUM, x, z).d)
    if (rd < ROAD_W) c = rd < ROAD_W * 0.7 ? road : roadEdge
    colors.set(c, i * 3)
  }
  plane.setAttribute('color', new BufferAttribute(colors, 3))
  b.addColored(plane, 'solid')

  const ch = (x: number, z: number) => mineHeight(x, z)
  b.box(0.07, 0.05, 0.06, CRUSHER.x + 0.03, ch(CRUSHER.x, CRUSHER.z) + 0.025, CRUSHER.z - 0.02, P.steel)
  b.cone(0.028, 0.03, CRUSHER.x - 0.005, ch(CRUSHER.x, CRUSHER.z) + 0.06, CRUSHER.z - 0.02, P.steelDark, 'metal', 12)
  b.box(0.05, 0.03, 0.04, 0.72, ch(0.72, -0.28) + 0.015, -0.28, P.paintWhite)
  b.box(0.04, 0.025, 0.07, 0.3, ch(0.3, -0.62) + 0.012, -0.64, P.steelLight)
  b.box(0.035, 0.018, 0.02, 0.24, ch(0.24, -0.68) + 0.009, -0.7, '#b2b4ad')
  b.cyl(0.016, 0.016, 0.03, 0.78, ch(0.78, -0.12) + 0.015, -0.12, P.steelLight, 'metal', 18)
  for (let i = 0; i < 4; i++) b.box(0.026, 0.012, 0.012, 0.7 + (i % 2) * 0.03, ch(0.7, 0.26) + 0.006, 0.24 + Math.floor(i / 2) * 0.016, i % 2 ? P.paintWhite : '#b8b9b2')

  const from = new Vector3(CRUSHER.x + 0.01, ch(CRUSHER.x, CRUSHER.z) + 0.045, CRUSHER.z - 0.05)
  const to = new Vector3(STOCKPILES[0].x, STOCKPILES[0].h + 0.02, STOCKPILES[0].z + 0.02)
  const convDir = to.clone().sub(from)
  const convLen = convDir.length()
  for (let i = 0; i <= 8; i++) {
    const p = from.clone().addScaledVector(convDir, i / 8)
    const gy = ch(p.x, p.z)
    if (p.y - gy > 0.006) b.box(0.003, p.y - gy, 0.003, p.x, gy + (p.y - gy) / 2, p.z, P.steelDark)
  }
  b.tube(from, to, 0.004, P.steel, 'metal', 6)
  b.tube(from.clone().add(new Vector3(0, 0.004, 0)), to.clone().add(new Vector3(0, 0.004, 0)), 0.0025, '#3c2a22', 'solid', 6)
  for (const [x, z] of [[0.66, -0.3], [0.2, -0.6], [0.72, 0.3], [-0.2, 0.62]] as const) {
    b.cyl(0.0012, 0.0012, 0.05, x, ch(x, z) + 0.025, z, P.steelDark, 'metal', 6)
    b.sphere(0.0028, x, ch(x, z) + 0.051, z, [3.4, 3.0, 2.3], 'emissive', false, 8)
  }
  b.pop()
  group.add(b.build(m, { name: 'mine-static' }))

  const treeBuilder = new Builder()
  treeBuilder.cone(0.012, 0.026, 0, 0.019, 0, '#ffffff', 'solid', 7)
  treeBuilder.cone(0.009, 0.02, 0, 0.03, 0, '#ffffff', 'solid', 7)
  treeBuilder.cyl(0.0015, 0.002, 0.008, 0, 0.004, 0, '#6d5a47', 'solid', 5)
  const treeGeo = treeBuilder.merged('solid')!
  const maxTrees = options.quality === 'high' ? 1400 : 500
  const trees = new InstancedMesh(treeGeo, m.solid, maxTrees)
  trees.castShadow = true
  trees.receiveShadow = true
  const tm = new Matrix4()
  const tq = new Quaternion()
  const tc = new Color()
  let placed = 0
  for (let i = 0; i < maxTrees * 4 && placed < maxTrees; i++) {
    const x = (hash2(i, 1.3) * 2 - 1) * HALF * 1.18
    const z = (hash2(i, 7.1) * 2 - 1) * HALF * 1.18
    if (pitR(x, z) < 1.5) continue
    if (STOCKPILES.some((s) => Math.hypot(x - s.x, z - s.z) < s.r + 0.1)) continue
    if (Math.hypot(x - CRUSHER.x, z - CRUSHER.z) < 0.2) continue
    if (Math.hypot(x - 0.72, z - 0.28) < 0.08) continue
    if (closest(EXIT_ROAD, EXIT_CUM, x, z).d < 0.05) continue
    if (fbm(x * 6 + 5, z * 6, 3) < 0.46) continue
    const inside = Math.max(Math.abs(x), Math.abs(z)) < HALF * 0.86
    const y = inside ? mineHeight(x, z) : 0
    const s = 0.7 + hash2(i, 3.3) * 0.7
    tm.compose(new Vector3(x, y, z), tq.setFromAxisAngle(new Vector3(0, 1, 0), hash2(i, 9) * 6.28), new Vector3(s, s * (0.85 + hash2(i, 4) * 0.4), s))
    trees.setMatrixAt(placed, frame.clone().multiply(tm))
    tc.set(hash2(i, 5) > 0.5 ? P.tree : P.treeDark).multiplyScalar(0.85 + hash2(i, 6) * 0.3)
    trees.setColorAt(placed, tc)
    placed++
  }
  trees.count = placed
  trees.frustumCulled = false
  group.add(trees)

  const excavators: Excavator[] = [excavator(m), excavator(m)]
  const exPos = [
    { x: 0.1, z: 0.06, yaw: 2.4 },
    { x: -0.12, z: 0.13, yaw: -0.6 },
  ]
  excavators.forEach((e, i) => {
    const p = exPos[i]
    const holder = new Group()
    holder.matrixAutoUpdate = false
    holder.matrix.copy(frame).multiply(T(p.x, mineHeight(p.x, p.z), p.z, p.yaw))
    holder.add(e.root)
    group.add(holder)
  })

  const trucks = [haulTruck(m, true), haulTruck(m, true), haulTruck(m, false)]
  trucks.forEach((t) => group.add(t))
  const dustPer = 36
  const dust = new Particles(trucks.length * dustPer, { color: '#9c7a5c', soft: 2.6 })
  const dustAge = new Float32Array(trucks.length * dustPer).fill(99)
  const dustPos: Vector3[] = Array.from({ length: trucks.length * dustPer }, () => new Vector3())
  const dustVel: Vector3[] = Array.from({ length: trucks.length * dustPer }, () => new Vector3())
  let dustCursor = 0
  group.add(dust.points)

  const orePer = 26
  const ore = new Particles(orePer, { color: '#d0643a', additive: false, soft: 3 })
  group.add(ore.points)

  const spiralPts = SPIRAL.map(([x, z]) => new Vector3(x, 0, z))
  const spiralCum = SPIRAL_CUM
  const truckLocal = (f: number) => {
    const total = spiralCum[spiralCum.length - 1]
    const d = clamp01(f) * total
    let i = 0
    while (i < spiralPts.length - 2 && spiralCum[i + 1] < d) i++
    const seg = spiralCum[i + 1] - spiralCum[i]
    const p = spiralPts[i].clone().lerp(spiralPts[i + 1], (d - spiralCum[i]) / seg)
    const dir = spiralPts[i + 1].clone().sub(spiralPts[i]).normalize()
    return { p, dir }
  }

  const tmpM = new Matrix4()
  const q = new Quaternion()
  const world = new Vector3()
  const Y = new Vector3(0, 1, 0)
  const truckWorld: Vector3[] = trucks.map(() => new Vector3())

  function update(ctx: FrameCtx) {
    const clock = ctx.motion ? ctx.time : 0
    excavators.forEach((e, i) => {
      const c = clock * 0.55 + i * 2.1
      const dig = (Math.sin(c) + 1) / 2
      e.house.rotation.y = Math.sin(c * 0.5) * 0.9
      e.boom.rotation.z = -0.25 - dig * 0.35
      e.stick.rotation.z = -0.9 + dig * 0.55
      e.bucket.rotation.z = -0.6 + Math.sin(c + 0.6) * 0.6
    })

    trucks.forEach((t, i) => {
      const cycle = ((ctx.t * 0.05 + i / trucks.length) % 1 + 1) % 1
      const up = cycle < 0.5
      const f = up ? cycle * 2 : 2 - cycle * 2
      const { p, dir } = truckLocal(f)
      const heading = Math.atan2(-(up ? dir.z : -dir.z), up ? dir.x : -dir.x)
      p.y = mineHeight(p.x, p.z) + 0.0045
      tmpM.compose(p, q.setFromAxisAngle(Y, heading), new Vector3(1, 1, 1))
      t.matrixAutoUpdate = false
      t.matrix.copy(frame).multiply(tmpM)
      t.matrixWorldNeedsUpdate = true
      truckWorld[i].copy(p).applyMatrix4(frame)
      if (ctx.motion && ctx.dt > 0) {
        for (let k = 0; k < 2; k++) {
          const idx = dustCursor++ % dust.count
          dustAge[idx] = 0
          const rear = new Vector3(-0.03 * (up ? 1 : -1), 0.004, (Math.random() - 0.5) * 0.02)
            .applyAxisAngle(Y, heading)
            .add(p)
          dustPos[idx].copy(rear)
          dustVel[idx].set((Math.random() - 0.5) * 0.01, 0.006 + Math.random() * 0.006, (Math.random() - 0.5) * 0.01)
        }
      }
    })

    for (let i = 0; i < dust.count; i++) {
      dustAge[i] += ctx.dt
      const age = dustAge[i]
      if (age > 3.2) {
        dust.set(i, world.set(0, 0, 0), 0, 0)
        continue
      }
      dustPos[i].addScaledVector(dustVel[i], ctx.dt)
      world.copy(dustPos[i]).applyMatrix4(frame)
      const a = Math.sin(Math.min(1, age / 3.2) * Math.PI) * 0.22
      dust.set(i, world, a, 0.012 + age * 0.012)
    }
    dust.commit()

    for (let i = 0; i < orePer; i++) {
      const f = ((ctx.t * 0.22 + i / orePer) % 1 + 1) % 1
      world.copy(from).lerp(to, f)
      world.y += 0.006 + Math.sin(f * Math.PI) * 0.002
      world.applyMatrix4(frame)
      ore.set(i, world, 0.9 * smoothstep(0, 0.05, f) * (1 - smoothstep(0.92, 1, f)), 0.0045)
    }
    ore.commit()

  }

  const toWorld = (x: number, y: number, z: number) => new Vector3(x, y, z).applyMatrix4(frame)
  const spiralMid = SPIRAL[7]
  return {
    name: 'mine',
    group,
    center: toWorld(0, 0, 0),
    range: 60,
    anchors: {
      mineRegion: toWorld(PIT.x, 0.02, PIT.z),
      openPit: toWorld(PIT.x, 0.01, PIT.z - PIT.rz - 0.02),
      extraction: () => toWorld(exPos[0].x, mineHeight(exPos[0].x, exPos[0].z) + 0.05, exPos[0].z),
      stockpile: toWorld(STOCKPILES[0].x, STOCKPILES[0].h + 0.03, STOCKPILES[0].z),
      haulRoad: toWorld(spiralMid[0], mineHeight(spiralMid[0], spiralMid[1]) + 0.012, spiralMid[1]),
    },
    update,
    ...{ exitWorld: toWorld(-HALF, 0, 0.5), truckWorld },
  } as StageScene & { exitWorld: Vector3; truckWorld: Vector3[] }
}

export function mineExitLatLng() {
  return EXIT_ROAD.map(([x, z]) => localToLatLng(SITES.mine.lat, SITES.mine.lng, x, z))
}
