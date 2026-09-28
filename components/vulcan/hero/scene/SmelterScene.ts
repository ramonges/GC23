import { CylinderGeometry, Group, Vector3 } from 'three'
import { Builder, RX, RZ, T, type Materials } from './core/builder'
import { siteMatrix, windowed } from './core/math'
import { P } from './core/palette'
import { Particles } from './fx'
import { SITES } from './sites'
import type { FrameCtx, StageScene } from './stage'

const HALF_PI = Math.PI / 2
const MOLTEN: [number, number, number] = [7.5, 3.6, 1.2]
const CELL_GLOW: [number, number, number] = [3.2, 1.35, 0.42]

export const SMELTER_ROTATION = -0.35
export const CAST_BAY = { x: 0.47, z: 0.34 }

function pylon(b: Builder, x: number, z: number, h: number) {
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    b.tube(new Vector3(x + dx * 0.012, 0, z + dz * 0.012), new Vector3(x + dx * 0.003, h, z + dz * 0.003), 0.0012, P.steelLight, 'metal', 4)
  }
  for (const y of [h * 0.35, h * 0.7]) b.box(0.03 - y * 0.08, 0.0015, 0.0015, x, y, z, P.steelLight, 'metal')
  b.box(0.05, 0.002, 0.002, x, h * 0.92, z, P.steelLight, 'metal')
  b.box(0.036, 0.002, 0.002, x, h * 0.8, z, P.steelLight, 'metal')
}

export function buildSmelter(m: Materials): StageScene {
  const site = SITES.smelter
  const frame = siteMatrix(site.lat, site.lng, undefined, SMELTER_ROTATION)
  const group = new Group()
  group.name = 'smelter'
  const b = new Builder()
  b.push(frame)

  b.box(1.36, 0.012, 1.0, 0, -0.003, 0, '#56574f')
  b.box(1.3, 0.001, 0.024, 0, 0.0035, 0.2, P.asphalt)
  b.box(0.024, 0.001, 0.96, 0.3, 0.0035, 0, P.asphalt)

  const hallLen = 0.96
  b.box(hallLen, 0.055, 0.1, -0.1, 0.0275, -0.24, '#4a4d4a')
  b.add(new CylinderGeometry(0.058, 0.058, hallLen, 3, 1), '#5e615d', 'solid', T(-0.1, 0.066, -0.24).multiply(RZ(HALF_PI)).multiply(RX(Math.PI)))
  b.box(hallLen * 0.98, 0.003, 0.008, -0.1, 0.086, -0.24, [2.0, 0.85, 0.3], 'emissive')

  b.box(hallLen, 0.004, 0.1, -0.1, 0.002, -0.05, '#2d2f2d')
  b.box(hallLen, 0.024, 0.004, -0.1, 0.012, -0.1, '#4a4d4a')
  b.box(hallLen, 0.024, 0.004, -0.1, 0.012, 0.0, '#4a4d4a')
  for (let i = 0; i < 12; i++) {
    const x = -0.56 + i * 0.084
    b.box(0.004, 0.07, 0.004, x, 0.035, -0.1, P.steelDark)
    b.box(0.004, 0.07, 0.004, x, 0.035, 0.0, P.steelDark)
    b.box(0.004, 0.004, 0.104, x, 0.07, -0.05, P.steelDark)
  }
  for (let i = 0; i < 30; i++) {
    const x = -0.56 + i * 0.031
    b.box(0.022, 0.012, 0.052, x, 0.01, -0.05, P.steelDark)
    b.box(0.018, 0.0015, 0.044, x, 0.0165, -0.05, CELL_GLOW, 'emissive')
    b.box(0.004, 0.008, 0.004, x, 0.022, -0.068, P.steelLight, 'metal')
    b.box(0.004, 0.008, 0.004, x, 0.022, -0.032, P.steelLight, 'metal')
  }
  b.box(hallLen, 0.006, 0.008, -0.1, 0.03, -0.068, P.aluminum, 'metal')
  b.box(hallLen, 0.006, 0.008, -0.1, 0.03, -0.032, P.aluminum, 'metal')

  b.box(0.16, 0.04, 0.12, -0.5, 0.02, 0.33, P.paintWhite)
  for (let i = 0; i < 6; i++) {
    const x = -0.36 + (i % 3) * 0.05
    const z = 0.28 + Math.floor(i / 3) * 0.07
    b.box(0.028, 0.03, 0.022, x, 0.015, z, '#5d625d')
    for (let f = 0; f < 4; f++) b.box(0.03, 0.02, 0.002, x, 0.012, z - 0.012 + f * 0.008, '#454a46')
  }
  for (const x of [-0.39, -0.24]) {
    b.box(0.003, 0.05, 0.003, x, 0.025, 0.24, P.steelLight, 'metal')
    b.box(0.003, 0.05, 0.003, x, 0.025, 0.42, P.steelLight, 'metal')
    b.box(0.003, 0.003, 0.18, x, 0.05, 0.33, P.steelLight, 'metal')
  }
  b.pipe([[-0.24, 0.035, 0.25], [-0.2, 0.035, 0.1], [-0.2, 0.03, 0.0]], 0.006, P.aluminum)

  const pyl: [number, number][] = [[-0.66, 0.46], [-0.66, 0.25], [-0.52, 0.12]]
  for (const [x, z] of pyl) pylon(b, x, z, 0.1)
  for (let i = 0; i < pyl.length - 1; i++) {
    const [x0, z0] = pyl[i]
    const [x1, z1] = pyl[i + 1]
    for (const off of [-0.022, 0.022]) {
      const a = new Vector3(x0 + off, 0.092, z0)
      const c = new Vector3(x1 + off, 0.092, z1)
      const mid = a.clone().lerp(c, 0.5)
      mid.y -= 0.012
      b.tube(a, mid, 0.0005, P.steelDark, 'metal', 4)
      b.tube(mid, c, 0.0005, P.steelDark, 'metal', 4)
    }
  }

  b.box(0.18, 0.07, 0.14, 0.45, 0.035, 0.12, P.steel)
  b.box(0.185, 0.004, 0.145, 0.45, 0.072, 0.12, '#6c706b')
  b.box(0.36, 0.008, 0.016, 0.24, 0.004, 0.0, P.steelDark)
  b.box(0.35, 0.002, 0.008, 0.24, 0.0085, 0.0, MOLTEN, 'emissive')
  b.box(0.012, 0.008, 0.2, 0.42, 0.004, 0.08, P.steelDark)
  b.box(0.008, 0.002, 0.19, 0.42, 0.0085, 0.08, MOLTEN, 'emissive')
  b.box(0.3, 0.006, 0.04, 0.45, 0.003, 0.25, P.steelDark)
  for (let s = 0; s < 8; s++) {
    const x = 0.33 + (s % 4) * 0.06
    const z = 0.32 + Math.floor(s / 4) * 0.07
    for (let l = 0; l < 4; l++) {
      for (let k = 0; k < 3; k++) {
        b.box(0.014, 0.006, 0.03, x - 0.016 + k * 0.016, 0.004 + l * 0.0062, z, P.aluminum, 'metal', l % 2 ? HALF_PI : 0)
      }
    }
  }
  for (let i = 0; i < 5; i++) b.add(new CylinderGeometry(0.004, 0.004, 0.1, 12), P.aluminum, 'metal', T(0.1, 0.006 + (i % 2) * 0.007, 0.36 + i * 0.009).multiply(RZ(HALF_PI)))
  for (const [x, z] of [[-0.64, -0.45], [0.64, -0.45], [-0.64, 0.45], [0.64, 0.45], [0.1, 0.45]] as const) {
    b.cyl(0.0012, 0.0012, 0.08, x, 0.04, z, P.steelDark, 'metal', 6)
    b.sphere(0.003, x, 0.081, z, [3.6, 3.1, 2.3], 'emissive', false, 8)
  }
  b.pop()
  group.add(b.build(m, { name: 'smelter-static' }))

  const heat = new Particles(70, { color: '#ff9a4a', additive: true, soft: 2.4 })
  group.add(heat.points)
  const heatSources: Vector3[] = []
  for (let i = 0; i < 50; i++) heatSources.push(new Vector3(-0.56 + (i % 30) * 0.031, 0.02, -0.05))
  for (let i = 0; i < 20; i++) heatSources.push(new Vector3(0.08 + i * 0.018, 0.012, 0.0))
  const ingots = new Particles(16, { color: '#dfe1da', soft: 5 })
  group.add(ingots.points)
  const p = new Vector3()

  function update(ctx: FrameCtx) {
    heatSources.forEach((src, i) => {
      const age = ((ctx.time * 0.35 + i * 0.137) % 1 + 1) % 1
      p.set(src.x + Math.sin(i + ctx.time) * 0.004, src.y + age * 0.05, src.z)
      heat.set(i, p.applyMatrix4(frame), Math.sin(age * Math.PI) * 0.1, 0.012 + age * 0.02)
    })
    heat.commit()
    for (let i = 0; i < 16; i++) {
      const f = ((ctx.t * 0.08 + i / 16) % 1 + 1) % 1
      p.set(0.31 + f * 0.28, 0.009, 0.25)
      ingots.set(i, p.applyMatrix4(frame), 0.9, 0.007)
    }
    ingots.commit()
  }

  const toWorld = (x: number, y: number, z: number) => new Vector3(x, y, z).applyMatrix4(frame)
  return {
    name: 'smelter',
    group,
    center: toWorld(0, 0, 0),
    range: 60,
    anchors: {
      electrolysis: toWorld(-0.2, 0.08, -0.05),
      casting: toWorld(0.45, 0.09, 0.12),
      power: toWorld(-0.31, 0.06, 0.33),
    },
    update,
  }
}
