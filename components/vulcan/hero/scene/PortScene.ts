import { BufferAttribute, CylinderGeometry, Group, Object3D, PlaneGeometry, Vector3 } from 'three'
import { Builder, RX, T, part, type Materials } from './core/builder'
import { localToLatLng, siteMatrix, smoothstep } from './core/math'
import { linear, linearFromSrgb, P, type Rgb } from './core/palette'
import type { PatchSampler } from './RegionPatch'
import { SITES } from './sites'
import type { FrameCtx, StageScene } from './stage'

const HALF = SITES.port.half
/** Quay face runs north–south; open water lies west of it. */
export const QUAY_X = -0.06
export const BERTH = { x: -0.118, z: 0.0 }

function landness(x: number, z: number, sampled: number) {
  const center = 1 - smoothstep(0.28, 0.46, Math.max(Math.abs(x), Math.abs(z)))
  const designed = x > QUAY_X ? 1 : 0
  return designed * center + sampled * (1 - center)
}

export function buildPort(m: Materials, sampler: PatchSampler | null, options: { quality: 'high' | 'low' }) {
  const site = SITES.port
  const frame = siteMatrix(site.lat, site.lng)
  const group = new Group()
  group.name = 'port'
  const b = new Builder()
  b.push(frame)

  const res = options.quality === 'high' ? 160 : 90
  const plane = new PlaneGeometry(HALF * 2, HALF * 2, res, res).rotateX(-Math.PI / 2)
  const pos = plane.getAttribute('position')
  const colors = new Float32Array(pos.count * 3)
  const seabed = linear('#0b1316')
  const apron = linear('#5d5f5a')
  const yard = linear('#57524a')
  let waterSum: Rgb = [0, 0, 0]
  let waterN = 0
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    let sample: Rgb = linear('#3b3f2f')
    let mask = x > QUAY_X ? 1 : 0
    if (sampler) {
      const ll = localToLatLng(site.lat, site.lng, x, z)
      const [r, g, bb, a] = sampler.sample(ll.lat, ll.lng)
      sample = linearFromSrgb(r, g, bb)
      mask = a
      if (a < 0.3) {
        waterSum = [waterSum[0] + sample[0], waterSum[1] + sample[1], waterSum[2] + sample[2]]
        waterN++
      }
    }
    const land = landness(x, z, mask)
    const ops = x > QUAY_X && x < 0.42 && Math.abs(z) < 0.36 ? 1 : 0
    pos.setY(i, land > 0.5 ? 0.0 : -0.016)
    let c: Rgb = land > 0.5 ? sample : seabed
    if (ops && land > 0.5) c = x < 0.0 ? apron : yard
    colors.set(c, i * 3)
  }
  plane.setAttribute('color', new BufferAttribute(colors, 3))
  plane.computeVertexNormals()
  b.addColored(plane, 'solid')

  const waterColor: Rgb = waterN ? [waterSum[0] / waterN, waterSum[1] / waterN, waterSum[2] / waterN] : linear(P.water)
  b.add(new PlaneGeometry(HALF * 2, HALF * 2, 1, 1).rotateX(-Math.PI / 2), waterColor, 'water', T(0, -0.0012, 0))

  b.box(0.04, 0.02, 0.72, QUAY_X + 0.02, -0.004, 0, P.concrete)
  b.box(0.002, 0.004, 0.72, QUAY_X + 0.001, 0.004, 0, '#8b8d86')
  for (let i = -6; i <= 6; i++) b.box(0.004, 0.006, 0.006, QUAY_X - 0.002, 0.002, i * 0.05, P.hullBlack)
  b.box(0.0015, 0.0015, 0.7, QUAY_X + 0.006, 0.0068, 0, P.steelLight, 'metal')
  b.box(0.0015, 0.0015, 0.7, QUAY_X + 0.032, 0.0068, 0, P.steelLight, 'metal')

  for (let r = 0; r < 3; r++) {
    const x = 0.09 + r * 0.075
    const ore = r === 1 ? '#7e3a26' : '#8e452c'
    const ridge = new CylinderGeometry(0.024, 0.024, 0.42, 3, 1).toNonIndexed()
    ridge.computeVertexNormals()
    b.add(ridge, ore, 'solid', T(x, 0.012, 0).multiply(RX(-Math.PI / 2)))
    for (const end of [-0.21, 0.21]) b.cone(0.021, 0.024, x, 0.012, end, ore, 'solid', 14, 0, 1, 1)
  }
  b.box(0.006, 0.006, 0.62, 0.0, 0.03, 0, P.steelDark)
  for (let i = -5; i <= 5; i++) b.box(0.003, 0.03, 0.003, 0.0, 0.015, i * 0.058, P.steelDark)
  b.box(0.1, 0.028, 0.06, 0.34, 0.014, -0.22, '#8e918a')
  b.box(0.1, 0.004, 0.064, 0.34, 0.03, -0.22, '#a4a69f')
  b.box(0.06, 0.03, 0.05, 0.34, 0.015, 0.2, P.paintWhite)
  b.box(0.04, 0.05, 0.05, 0.38, 0.025, -0.05, P.steel)
  for (let i = 0; i < 3; i++) b.box(0.012, 0.0015, 0.52, 0.42 + i * 0.012, 0.0025, 0.0, i === 1 ? '#2c2d2b' : '#5a5850')
  b.box(0.01, 0.002, 0.6, 0.29, 0.0012, 0, P.asphalt)
  for (const [x, z] of [[-0.02, -0.3], [-0.02, -0.1], [-0.02, 0.1], [-0.02, 0.3], [0.3, -0.33], [0.3, 0.33], [0.2, -0.33], [0.2, 0.33]] as const) {
    b.cyl(0.0012, 0.0012, 0.07, x, 0.035, z, P.steelDark, 'metal', 6)
    b.sphere(0.003, x, 0.071, z, [3.6, 3.1, 2.3], 'emissive', false, 8)
  }
  b.pop()
  group.add(b.build(m, { name: 'port-static' }))

  const loader = new Group()
  loader.matrixAutoUpdate = false
  const boom = new Object3D()
  const loaderBody = part(m, (lb) => {
    lb.box(0.004, 0.05, 0.004, QUAY_X + 0.006, 0.025, -0.012, P.orange)
    lb.box(0.004, 0.05, 0.004, QUAY_X + 0.006, 0.025, 0.012, P.orange)
    lb.box(0.004, 0.05, 0.004, QUAY_X + 0.032, 0.025, -0.012, P.orange)
    lb.box(0.004, 0.05, 0.004, QUAY_X + 0.032, 0.025, 0.012, P.orange)
    lb.box(0.034, 0.008, 0.03, QUAY_X + 0.019, 0.053, 0, P.orange)
    lb.box(0.014, 0.012, 0.014, QUAY_X + 0.03, 0.063, 0, P.paintWhite)
  }, 'loader')
  loader.add(loaderBody)
  boom.position.set(QUAY_X + 0.012, 0.058, 0)
  boom.add(part(m, (bb) => {
    bb.box(0.1, 0.005, 0.007, -0.05, 0, 0, P.orange)
    bb.box(0.004, 0.018, 0.004, -0.098, -0.01, 0, P.steelDark)
  }, 'loader-boom'))
  loader.add(boom)
  group.add(loader)

  const toWorld = (x: number, y: number, z: number) => new Vector3(x, y, z).applyMatrix4(frame)

  function update(ctx: FrameCtx) {
    const load = 1 - smoothstep(17.6, 18.2, ctx.t)
    const z = -0.06 + Math.sin(ctx.time * 0.25) * 0.05 * load
    loader.matrix.copy(frame).multiply(T(0, 0, z))
    loader.matrixWorldNeedsUpdate = true
    boom.rotation.z = -0.08 + Math.sin(ctx.time * 0.4) * 0.03 * load + smoothstep(17.6, 18.4, ctx.t) * 0.5
    boom.rotation.y = Math.sin(ctx.time * 0.3) * 0.08 * load
  }

  return {
    name: 'port',
    group,
    center: toWorld(0, 0, 0),
    range: 60,
    anchors: {
      kamsar: toWorld(0.3, 0.04, 0.2),
      guinea: toWorld(0.38, 0.03, -0.3),
      portStockpile: toWorld(0.165, 0.05, -0.1),
      shipLoader: () => toWorld(QUAY_X + 0.02, 0.075, -0.06),
    },
    update,
    frame,
    railEntry: toWorld(HALF - 0.02, 0.002, 0.0),
    quayPoint: toWorld(QUAY_X + 0.02, 0.01, -0.06),
    berth: toWorld(BERTH.x, 0, BERTH.z),
  } as StageScene & { frame: typeof frame; railEntry: Vector3; quayPoint: Vector3; berth: Vector3 }
}

