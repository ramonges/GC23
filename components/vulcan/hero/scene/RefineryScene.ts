import { CylinderGeometry, Group, SphereGeometry, Vector3 } from 'three'
import { Builder, RZ, T, type Materials } from './core/builder'
import { siteMatrix, smoothstep, windowed } from './core/math'
import { linear, P, type Rgb } from './core/palette'
import { Particles } from './fx'
import { SITES } from './sites'
import type { FrameCtx, StageScene } from './stage'

const HALF_PI = Math.PI / 2

export function buildRefinery(m: Materials): StageScene {
  const site = SITES.refinery
  const frame = siteMatrix(site.lat, site.lng, undefined, 0.35)
  const group = new Group()
  group.name = 'refinery'
  const b = new Builder()
  b.push(frame)

  b.box(1.34, 0.012, 1.02, 0, -0.003, 0, '#595a54')
  for (const z of [-0.16, 0.1]) b.box(1.3, 0.001, 0.022, 0, 0.0035, z, P.asphalt)
  for (const x of [-0.38, 0.06, 0.34]) b.box(0.022, 0.001, 0.98, x, 0.0036, 0, P.asphalt)

  b.add(new SphereGeometry(0.1, 28, 14, 0, Math.PI * 2, 0, HALF_PI), P.bauxite, 'solid', T(-0.52, 0.003, -0.34, 0, 1.2, 0.42, 0.9))
  b.tube(new Vector3(-0.45, 0.035, -0.3), new Vector3(-0.3, 0.07, -0.3), 0.004, P.steel)

  for (let i = 0; i < 8; i++) {
    const x = -0.29 + (i % 4) * 0.05
    const z = i < 4 ? -0.34 : -0.27
    b.cyl(0.019, 0.019, 0.15, x, 0.078, z, P.steelLight, 'metal', 20)
    b.sphere(0.019, x, 0.153, z, P.steelLight, 'metal', true, 16)
    b.cyl(0.021, 0.021, 0.004, x, 0.1, z, P.steelDark, 'metal', 20)
  }
  b.box(0.22, 0.003, 0.11, -0.215, 0.12, -0.305, '#6a6d67')
  for (let i = 0; i < 3; i++) b.add(new CylinderGeometry(0.01, 0.01, 0.12, 16), P.steelLight, 'metal', T(-0.2, 0.02 + i * 0.022, -0.21).multiply(RZ(HALF_PI)))

  for (let i = 0; i < 4; i++) {
    const x = -0.02 + (i % 2) * 0.19
    const z = -0.04 + Math.floor(i / 2) * 0.18
    b.cyl(0.078, 0.08, 0.022, x, 0.011, z, P.concrete, 'solid', 40)
    b.cyl(0.072, 0.072, 0.002, x, 0.0225, z, '#3a2a22', 'water', 40)
    b.cyl(0.006, 0.006, 0.04, x, 0.03, z, P.steel, 'metal', 10)
    b.box(0.15, 0.004, 0.008, x, 0.03, z, P.steelLight, 'metal', i * 0.7)
  }

  for (let i = 0; i < 10; i++) {
    const x = -0.36 + i * 0.05
    b.cyl(0.021, 0.021, 0.12, x, 0.063, 0.31, P.paintWhite, 'solid', 20)
    b.cyl(0.0215, 0.0215, 0.003, x, 0.124, 0.31, P.steel, 'metal', 20)
  }
  b.box(0.52, 0.003, 0.02, -0.135, 0.126, 0.31, '#6a6d67')

  for (let k = 0; k < 2; k++) {
    const z = -0.34 + k * 0.08
    b.add(new CylinderGeometry(0.017, 0.017, 0.3, 24), '#a8a79f', 'metal', T(0.33, 0.03, z).multiply(RZ(HALF_PI - 0.03)))
    for (const x of [0.22, 0.33, 0.44]) b.box(0.014, 0.022, 0.03, x, 0.011, z, P.concrete)
    b.box(0.05, 0.1, 0.05, 0.51, 0.05, z, P.steel)
    b.cyl(0.012, 0.016, 0.05, 0.51, 0.125, z, P.steelLight, 'metal', 16)
    b.cyl(0.006, 0.008, 0.2, 0.56, 0.1, z + 0.02, '#8b8e88', 'solid', 14)
    b.cyl(0.0062, 0.0062, 0.006, 0.56, 0.19, z + 0.02, P.orange, 'solid', 14)
  }

  for (const z of [0.2, 0.39]) b.sphere(0.085, 0.46, 0.003, z, '#e5e4dc', 'solid', true, 32)
  b.tube(new Vector3(0.5, 0.08, -0.26), new Vector3(0.46, 0.09, 0.14), 0.004, P.steel)

  for (let i = 0; i < 6; i++) {
    const x = -0.56 + (i % 2) * 0.08
    const z = 0.08 + Math.floor(i / 2) * 0.09
    b.cyl(0.032, 0.032, 0.045, x, 0.0225, z, '#b7b8b0', 'metal', 28)
    b.add(new SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, HALF_PI), '#b7b8b0', 'metal', T(x, 0.045, z, 0, 0.032, 0.01, 0.032))
  }

  for (let i = 0; i < 13; i++) {
    const x = -0.46 + i * 0.08
    b.box(0.004, 0.06, 0.004, x, 0.03, -0.16 - 0.022, P.steelDark)
    b.box(0.004, 0.06, 0.004, x, 0.03, -0.16 + 0.022, P.steelDark)
    b.box(0.004, 0.004, 0.05, x, 0.06, -0.16, P.steelDark)
  }
  for (let k = 0; k < 4; k++) b.tube(new Vector3(-0.47, 0.066 + (k % 2) * 0.008, -0.175 + k * 0.01), new Vector3(0.5, 0.066 + (k % 2) * 0.008, -0.175 + k * 0.01), 0.0035, k === 1 ? '#8a6d4a' : P.steelLight)
  b.pipe([[-0.2, 0.07, -0.16], [-0.2, 0.07, -0.08], [-0.02, 0.05, -0.04]], 0.003, P.steelLight)
  b.pipe([[0.17, 0.07, -0.16], [0.17, 0.05, 0.14]], 0.003, P.steelLight)
  b.pipe([[-0.1, 0.06, -0.16], [-0.1, 0.06, 0.25]], 0.003, P.steelLight)

  b.box(0.12, 0.04, 0.07, -0.08, 0.02, 0.43, P.paintWhite)
  b.box(0.08, 0.03, 0.05, 0.12, 0.015, 0.44, '#b1b3ac')
  b.box(0.06, 0.05, 0.05, -0.56, 0.025, -0.1, P.steel)
  for (const [x, z] of [[-0.62, -0.45], [0.62, -0.45], [-0.62, 0.45], [0.62, 0.45], [0, -0.45], [0, 0.45]] as const) {
    b.cyl(0.0012, 0.0012, 0.08, x, 0.04, z, P.steelDark, 'metal', 6)
    b.sphere(0.003, x, 0.081, z, [3.6, 3.1, 2.3], 'emissive', false, 8)
  }
  b.pop()
  group.add(b.build(m, { name: 'refinery-static' }))

  const steamSources = [
    new Vector3(0.56, 0.2, -0.32),
    new Vector3(0.56, 0.2, -0.24),
    new Vector3(-0.24, 0.16, -0.31),
    new Vector3(-0.14, 0.16, -0.31),
  ]
  const steam = new Particles(steamSources.length * 18, { color: '#d8d8d2', soft: 1.8 })
  group.add(steam.points)

  const process: Vector3[] = [
    new Vector3(-0.52, 0.04, -0.34),
    new Vector3(-0.3, 0.09, -0.3),
    new Vector3(-0.2, 0.13, -0.3),
    new Vector3(-0.02, 0.05, -0.04),
    new Vector3(0.17, 0.05, 0.14),
    new Vector3(-0.1, 0.13, 0.31),
    new Vector3(0.2, 0.06, -0.3),
    new Vector3(0.46, 0.09, 0.2),
  ]
  const pcum = [0]
  for (let i = 1; i < process.length; i++) pcum.push(pcum[i - 1] + process[i].distanceTo(process[i - 1]))
  const flow = new Particles(60, { color: '#ffffff', soft: 2.8 })
  group.add(flow.points)
  const ore: Rgb = linear('#c9542c')
  const alumina: Rgb = linear('#f2f1ea')
  const p = new Vector3()

  function update(ctx: FrameCtx) {
    steamSources.forEach((src, s) => {
      for (let i = 0; i < 18; i++) {
        const age = ((ctx.time * 0.18 + i / 18 + s * 0.13) % 1 + 1) % 1
        p.set(src.x + Math.sin(i * 2.1 + ctx.time * 0.3) * 0.01 + age * 0.05, src.y + age * 0.16, src.z + Math.cos(i * 1.3) * 0.01)
        steam.set(s * 18 + i, p.applyMatrix4(frame), Math.sin(age * Math.PI) * 0.16, 0.02 + age * 0.05)
      }
    })
    steam.commit()
    const total = pcum[pcum.length - 1]
    for (let i = 0; i < flow.count; i++) {
      const f = ((ctx.t * 0.09 + i / flow.count) % 1 + 1) % 1
      const d = f * total
      let k = 0
      while (k < pcum.length - 2 && pcum[k + 1] < d) k++
      p.copy(process[k]).lerp(process[k + 1], (d - pcum[k]) / (pcum[k + 1] - pcum[k]))
      const c = smoothstep(0.25, 0.75, f)
      flow.setColor(i, [ore[0] + (alumina[0] - ore[0]) * c, ore[1] + (alumina[1] - ore[1]) * c, ore[2] + (alumina[2] - ore[2]) * c])
      flow.set(i, p.applyMatrix4(frame), 0.85, 0.006 - c * 0.002)
    }
    flow.commit(true)
  }

  const toWorld = (x: number, y: number, z: number) => new Vector3(x, y, z).applyMatrix4(frame)
  return {
    name: 'refinery',
    group,
    center: toWorld(0, 0, 0),
    range: 60,
    anchors: {
      digestion: toWorld(-0.215, 0.19, -0.305),
      clarification: toWorld(0.075, 0.05, 0.05),
      precipitation: toWorld(-0.135, 0.15, 0.31),
      calcination: toWorld(0.33, 0.08, -0.3),
    },
    update,
  }
}
