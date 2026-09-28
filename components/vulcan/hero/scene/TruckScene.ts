import { Group, Matrix4, Vector3 } from 'three'
import { Builder, part, type Materials } from './core/builder'
import { EARTH_R, GROUND, clamp01, localToLatLng, siteMatrix, smoothstep, vec3ToLatLng, windowed } from './core/math'
import { linear, P } from './core/palette'
import { haulTruck } from './entities'
import { Particles, RouteLine, cumulativeLengths, pathPose, ribbon, terrainPath } from './fx'
import { EXIT_ROAD, mineHeight } from './MineScene'
import { SITES } from './sites'
import { placeOnGlobe, type FrameCtx, type StageScene } from './stage'

/** Yard layout is rotated so local +x points at Kamsar. */
export const YARD_ROTATION = -2.58

function hopperCar(m: Materials, loaded = true) {
  return part(m, (b) => {
    b.box(0.03, 0.012, 0.011, 0, 0.011, 0, P.steelDark)
    b.box(0.028, 0.004, 0.0105, 0, 0.004, 0, P.hullBlack)
    if (loaded) b.box(0.026, 0.003, 0.009, 0, 0.018, 0, P.bauxite)
  }, 'hopper')
}

function locomotive(m: Materials) {
  return part(m, (b) => {
    b.box(0.036, 0.013, 0.012, 0, 0.011, 0, P.orange)
    b.box(0.01, 0.006, 0.0125, 0.013, 0.02, 0, P.paintWhite)
    b.box(0.034, 0.004, 0.0115, 0, 0.004, 0, P.hullBlack)
    b.box(0.001, 0.003, 0.004, 0.0182, 0.013, 0, [3.4, 3.1, 2.4], 'emissive')
  }, 'locomotive')
}

export function buildInland(
  m: Materials,
  flatten: { lat: number; lng: number; r: number }[],
  portRailEntry: Vector3,
  quayPoint: Vector3,
): StageScene & { routeLine: RouteLine } {
  const group = new Group()
  group.name = 'inland'
  const mine = SITES.mine
  const yard = SITES.yard
  const mineFrame = siteMatrix(mine.lat, mine.lng)
  const yardFrame = siteMatrix(yard.lat, yard.lng, GROUND, YARD_ROTATION)
  const yardToWorld = (x: number, y: number, z: number) => new Vector3(x, y, z).applyMatrix4(yardFrame)

  const insideMine = EXIT_ROAD.map(([x, z]) => new Vector3(x, mineHeight(x, z) + 0.0015, z).applyMatrix4(mineFrame))
  const [ex, ez] = EXIT_ROAD[EXIT_ROAD.length - 1]
  const exitLL = localToLatLng(mine.lat, mine.lng, ex, ez)
  const yardEntryLL = vec3ToLatLng(yardToWorld(-0.25, 0, -0.04))
  const roadLL = [
    exitLL,
    { lat: exitLL.lat - 0.012, lng: exitLL.lng - 0.05 },
    { lat: exitLL.lat - 0.04, lng: exitLL.lng - 0.085 },
    { lat: yardEntryLL.lat + 0.022, lng: yardEntryLL.lng + 0.05 },
    yardEntryLL,
  ]
  const outside = terrainPath(roadLL, { step: 0.002, lift: 0.0015, flatten })
  const roadPath = [...insideMine, ...outside.slice(1)]
  const roadCum = cumulativeLengths(roadPath)

  const b = new Builder()
  b.addColored(ribbon(outside, 0.026, linear('#8a765e'), linear('#b3a286')), 'solid')

  const railStartLL = vec3ToLatLng(yardToWorld(0.23, 0, 0.11))
  const railEndLL = vec3ToLatLng(portRailEntry)
  const railMid = { lat: (railStartLL.lat + railEndLL.lat) / 2 + 0.018, lng: (railStartLL.lng + railEndLL.lng) / 2 - 0.01 }
  const rail = terrainPath([railStartLL, railMid, railEndLL], { step: 0.0015, lift: 0.0012, flatten })
  const railCum = cumulativeLengths(rail)
  b.addColored(ribbon(rail, 0.016, linear('#5a5850')), 'solid')
  b.addColored(ribbon(rail.map((p) => p.clone().multiplyScalar(1 + 0.0008 / EARTH_R)), 0.0065, linear('#2c2d2b'), linear('#9a9e97')), 'metal')

  b.push(yardFrame)
  b.box(0.5, 0.004, 0.32, 0, 0.0005, 0, '#5d584e')
  for (let i = 0; i < 3; i++) b.cone(0.032, 0.036, -0.02, 0.018, -0.105 + i * 0.058, i === 1 ? '#96402a' : P.bauxite, 'solid', 16, 0, 5.4, 0.9)
  b.box(0.012, 0.028, 0.014, -0.02, 0.016, -0.076, P.steel)
  b.tube(new Vector3(-0.02, 0.03, -0.076), new Vector3(0.06, 0.036, -0.1), 0.0025, P.steelLight)
  for (const z of [0.09, 0.11, 0.13]) {
    b.box(0.44, 0.002, 0.008, 0.01, 0.002, z, '#595750')
    b.box(0.44, 0.0015, 0.0012, 0.01, 0.0035, z - 0.0022, P.steelLight, 'metal')
    b.box(0.44, 0.0015, 0.0012, 0.01, 0.0035, z + 0.0022, P.steelLight, 'metal')
  }
  b.cyl(0.02, 0.02, 0.05, 0.12, 0.045, 0.11, P.steelLight, 'metal', 20)
  b.cone(0.02, 0.018, 0.12, 0.011, 0.11, P.steelDark, 'metal', 20)
  for (const [x, z] of [[0.105, 0.095], [0.135, 0.095], [0.105, 0.125], [0.135, 0.125]] as const) b.box(0.003, 0.03, 0.003, x, 0.015, z, P.steelDark)
  b.box(0.06, 0.028, 0.04, -0.19, 0.014, 0.1, P.paintWhite)
  b.box(0.035, 0.018, 0.022, 0.2, 0.009, -0.11, '#b1b3ac')
  for (const [x, z] of [[-0.23, -0.14], [0.23, -0.14], [-0.23, 0.15], [0.23, 0.15]] as const) {
    b.cyl(0.001, 0.001, 0.05, x, 0.025, z, P.steelDark, 'metal', 6)
    b.sphere(0.0026, x, 0.051, z, [3.4, 3.0, 2.3], 'emissive', false, 8)
  }
  b.pop()
  group.add(b.build(m, { name: 'inland-static' }))

  for (let i = 0; i < 10; i++) {
    const car = hopperCar(m, i % 3 !== 0)
    car.matrixAutoUpdate = false
    car.matrix.copy(yardFrame).multiply(new Matrix4().makeTranslation(-0.17 + i * 0.033, 0.003, 0.09))
    group.add(car)
  }

  const trucks = Array.from({ length: 4 }, () => haulTruck(m, true))
  trucks.forEach((t) => group.add(t))
  const train = [locomotive(m), ...Array.from({ length: 9 }, () => hopperCar(m, true))]
  train.forEach((c) => group.add(c))

  const specks = new Particles(trucks.length * 6, { color: '#d86a3c', soft: 3 })
  group.add(specks.points)

  const routePts = [...roadPath, ...rail, quayPoint].map((p) => p.clone().multiplyScalar(1 + 0.006 / EARTH_R))
  const routeLine = new RouteLine(routePts, { color: '#F36B21', opacity: 0.85 })
  group.add(routeLine.lines)

  const tmp = new Vector3()
  const leadPos = new Vector3()

  function update(ctx: FrameCtx) {
    const lead = clamp01((ctx.t - 11.2) / 4.6)
    trucks.forEach((truck, i) => {
      const f = clamp01(lead * 0.98 - i * 0.075)
      const { pos, dir } = pathPose(roadPath, roadCum, f)
      pos.addScaledVector(tmp.copy(pos).normalize(), 0.0045)
      placeOnGlobe(truck, pos, dir)
      truck.visible = lead - i * 0.075 > -0.02
      if (i === 0) leadPos.copy(pos)
      for (let k = 0; k < 6; k++) {
        const bob = Math.sin(ctx.time * 3 + k * 1.7 + i) * 0.002
        const p = pos.clone().addScaledVector(dir, -0.012 + (k % 3) * 0.006).addScaledVector(tmp.copy(pos).normalize(), 0.03 + bob + (k > 2 ? 0.004 : 0))
        specks.set(i * 6 + k, p, truck.visible ? 0.55 * windowed(ctx.t, 11.8, 17.2, 0.4) : 0, 0.0035)
      }
    })
    specks.commit()

    const trainF = clamp01((ctx.t - 13.8) / 5.6) * 0.92
    train.forEach((car, i) => {
      const f = clamp01(trainF + 0.08 - i * 0.012)
      const { pos, dir } = pathPose(rail, railCum, f)
      pos.addScaledVector(tmp.copy(pos).normalize(), 0.0015)
      placeOnGlobe(car, pos, dir)
    })

    routeLine.material.uniforms.uReveal.value = smoothstep(12.4, 16.4, ctx.t)
    routeLine.material.uniforms.uTime.value = ctx.time
    routeLine.material.uniforms.uOpacity.value = 0.85 * (1 - smoothstep(16.6, 17.4, ctx.t))
  }

  return {
    name: 'inland',
    group,
    center: yardToWorld(0, 0, 0),
    range: 60,
    anchors: {
      convoy: () => leadPos.clone().addScaledVector(leadPos.clone().normalize(), 0.03),
      storage: yardToWorld(-0.02, 0.04, -0.047),
      railConnection: rail[Math.floor(rail.length * 0.55)].clone().multiplyScalar(1 + 0.004 / EARTH_R),
      coastalRoute: quayPoint.clone().multiplyScalar(1 + 0.02 / EARTH_R),
      leadTruck: () => leadPos,
    },
    update,
    routeLine,
  }
}
