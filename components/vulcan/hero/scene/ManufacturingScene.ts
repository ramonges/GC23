import { CylinderGeometry, Group, Matrix4, Object3D, Vector3 } from 'three'
import { Builder, RX, T, part, type Materials } from './core/builder'
import { clamp01, easeInOut, siteMatrix, smoothstep, windowed } from './core/math'
import { P } from './core/palette'
import { poseArm, robotArm, type RobotArm } from './entities'
import { buildFinalRobot } from './RobotScene'
import { SITES } from './sites'
import type { FrameCtx, StageScene } from './stage'

const HALF_PI = Math.PI / 2
const COOL: [number, number, number] = [2.1, 2.35, 2.6]
export const FACTORY_ROTATION = 0.2
export const ROBOT_SPOT = { x: 0.43, z: 0.0 }
const LINE_Y = 0.024

export function buildManufacturing(m: Materials) {
  const site = SITES.factory
  const frame = siteMatrix(site.lat, site.lng, undefined, FACTORY_ROTATION)
  const group = new Group()
  group.name = 'factory'
  const b = new Builder()
  b.push(frame)

  b.box(1.3, 0.012, 1.0, 0, -0.003, 0, '#62645e')
  b.box(1.0, 0.004, 0.62, 0, 0.002, 0, '#a6a8a1')
  for (const z of [-0.1, 0.1]) b.box(0.84, 0.0006, 0.004, -0.02, 0.0043, z, '#d7d6cd')
  b.box(1.0, 0.03, 0.006, 0, 0.015, -0.31, P.paintWhite)
  b.box(1.0, 0.03, 0.006, 0, 0.015, 0.31, P.paintWhite)
  b.box(0.006, 0.03, 0.62, -0.5, 0.015, 0, P.paintWhite)
  b.box(0.006, 0.012, 0.62, 0.5, 0.006, 0, P.paintWhite)
  for (let i = 0; i < 7; i++) {
    const x = -0.45 + i * 0.15
    for (const z of [-0.3, 0.3]) b.box(0.006, 0.09, 0.006, x, 0.045, z, P.steelLight, 'metal')
    b.box(0.006, 0.006, 0.6, x, 0.09, 0, P.steelLight, 'metal')
    b.box(0.03, 0.002, 0.3, x, 0.086, 0, COOL, 'emissive')
  }
  b.box(0.92, 0.004, 0.004, -0.02, 0.09, -0.3, P.steelLight, 'metal')
  b.box(0.92, 0.004, 0.004, -0.02, 0.09, 0.3, P.steelLight, 'metal')

  b.box(0.74, 0.012, 0.03, -0.02, 0.012, 0, '#2b2e2c')
  b.box(0.74, 0.003, 0.034, -0.02, 0.0195, 0, '#3b3f3c')
  b.box(0.74, 0.004, 0.003, -0.02, 0.02, -0.017, P.aluminum, 'metal')
  b.box(0.74, 0.004, 0.003, -0.02, 0.02, 0.017, P.aluminum, 'metal')
  for (let i = 0; i < 18; i++) b.box(0.004, 0.012, 0.004, -0.38 + i * 0.042, 0.006, -0.014, P.steelDark)

  b.box(0.08, 0.05, 0.06, -0.33, 0.025, -0.14, P.steel)
  for (const y of [0.018, 0.034]) b.add(new CylinderGeometry(0.009, 0.009, 0.066, 20), P.steelLight, 'metal', T(-0.33, y, -0.14).multiply(RX(HALF_PI)))
  b.box(0.09, 0.003, 0.05, -0.25, 0.022, -0.14, P.aluminum, 'metal')

  b.box(0.12, 0.03, 0.04, -0.17, 0.02, -0.15, P.paintWhite)
  b.add(new CylinderGeometry(0.012, 0.012, 0.06, 20), P.steelDark, 'solid', T(-0.23, 0.022, -0.15).multiply(new Matrix4().makeRotationZ(HALF_PI)))
  for (let i = 0; i < 4; i++) b.box(0.12, 0.004, 0.006, -0.06, 0.006 + i * 0.0045, -0.14 + (i % 2) * 0.01, P.aluminum, 'metal')

  for (let i = 0; i < 3; i++) {
    const x = 0.02 + i * 0.07
    b.box(0.05, 0.045, 0.045, x, 0.0225, -0.15, P.paintWhite)
    b.box(0.03, 0.02, 0.0012, x, 0.028, -0.127, [0.9, 1.05, 1.2], 'emissive')
    b.box(0.052, 0.004, 0.047, x, 0.047, -0.15, P.steelDark)
    b.box(0.006, 0.003, 0.0012, x + 0.018, 0.04, -0.127, [0.3, 1.8, 0.8], 'emissive')
  }

  b.box(0.004, 0.06, 0.05, 0.28, 0.03, -0.028, P.steelLight, 'metal')
  b.box(0.004, 0.06, 0.05, 0.28, 0.03, 0.028, P.steelLight, 'metal')
  b.box(0.012, 0.006, 0.06, 0.28, 0.062, 0, P.steelLight, 'metal')

  b.cyl(0.05, 0.05, 0.004, ROBOT_SPOT.x, 0.004, ROBOT_SPOT.z, '#cfcfc6', 'solid', 48)
  b.cyl(0.051, 0.051, 0.0009, ROBOT_SPOT.x, 0.0065, ROBOT_SPOT.z, '#6c6f6a', 'solid', 48)

  b.box(0.22, 0.05, 0.12, -0.35, 0.025, 0.42, '#8e918a')
  b.box(0.225, 0.004, 0.125, -0.35, 0.052, 0.42, '#a4a69f')
  b.box(0.1, 0.001, 0.4, -0.58, 0.0035, 0.2, P.asphalt)
  b.pop()
  group.add(b.build(m, { name: 'factory-static' }))

  const scanner = part(m, (sb) => sb.box(0.008, 0.002, 0.056, 0, 0, 0, COOL, 'emissive'), 'qc-scan')
  const scanHolder = new Object3D()
  scanHolder.matrixAutoUpdate = false
  scanHolder.add(scanner)
  group.add(scanHolder)

  const arms: { arm: RobotArm; holder: Object3D; phase: number }[] = []
  const armSpots = [
    { x: 0.08, z: -0.06, yaw: HALF_PI },
    { x: 0.16, z: 0.06, yaw: -HALF_PI },
    { x: 0.2, z: -0.06, yaw: HALF_PI },
    { x: 0.04, z: 0.06, yaw: -HALF_PI },
  ]
  armSpots.forEach((s, i) => {
    const arm = robotArm(m, { scale: 0.42, body: P.warmWhite, accent: '#2a2e2c' })
    const holder = new Object3D()
    holder.matrixAutoUpdate = false
    holder.matrix.copy(frame).multiply(T(s.x, 0.004, s.z, s.yaw))
    holder.add(arm.root)
    group.add(holder)
    arms.push({ arm, holder, phase: i * 1.3 })
  })

  const partKinds = [
    () => part(m, (pb) => {
      pb.box(0.026, 0.004, 0.018, 0, 0.002, 0, P.aluminum, 'metal')
      pb.box(0.004, 0.012, 0.018, -0.011, 0.008, 0, P.aluminum, 'metal')
      pb.box(0.004, 0.012, 0.018, 0.011, 0.008, 0, P.aluminum, 'metal')
    }, 'frame'),
    () => part(m, (pb) => {
      pb.cyl(0.008, 0.008, 0.014, 0, 0.007, 0, P.aluminum, 'metal', 20)
      pb.cyl(0.0085, 0.0085, 0.002, 0, 0.013, 0, P.steelLight, 'metal', 20)
    }, 'housing'),
    () => part(m, (pb) => pb.box(0.03, 0.006, 0.012, 0, 0.003, 0, '#c9cbc4', 'metal'), 'bar'),
  ]
  const conveyorParts = Array.from({ length: 12 }, (_, i) => {
    const p = partKinds[i % 3]()
    p.matrixAutoUpdate = false
    group.add(p)
    return p
  })

  const hero = part(m, (pb) => {
    pb.cyl(0.02, 0.02, 0.012, 0, 0.006, 0, P.aluminum, 'metal', 28)
    pb.cyl(0.021, 0.021, 0.002, 0, 0.012, 0, P.steelLight, 'metal', 28)
  }, 'hero-component')
  hero.matrixAutoUpdate = false
  group.add(hero)

  const robot = buildFinalRobot(m)
  const robotHolder = new Object3D()
  robotHolder.matrixAutoUpdate = false
  robotHolder.matrix.copy(frame).multiply(T(ROBOT_SPOT.x, 0.006, ROBOT_SPOT.z, Math.PI))
  robotHolder.add(robot.root)
  group.add(robotHolder)

  const heroPos = new Vector3()
  const tmp = new Matrix4()
  const local = new Vector3()
  const inv = new Matrix4()

  function heroLocal(t: number) {
    const along = clamp01((t - 33.2) / 2.3)
    if (t < 35.5) return new Vector3(-0.36 + easeInOut(along) * 0.68, LINE_Y, 0)
    const k = easeInOut(clamp01((t - 35.5) / 0.9))
    const start = new Vector3(0.32, LINE_Y, 0)
    const end = new Vector3(ROBOT_SPOT.x + 0.012, 0.098, ROBOT_SPOT.z)
    const p = start.lerp(end, k)
    p.y += Math.sin(k * Math.PI) * 0.03
    return p
  }

  function update(ctx: FrameCtx) {
    const clock = ctx.motion ? ctx.time : 0
    arms.forEach(({ arm, phase }) => {
      const c = clock * 0.9 + phase
      poseArm(arm, Math.sin(c * 0.5) * 0.8, -0.3 + Math.sin(c) * 0.25, 1.3 + Math.sin(c + 0.8) * 0.3, 0.6 + Math.sin(c * 1.3) * 0.3, (Math.sin(c) + 1) / 2)
    })
    const scanX = 0.28 + Math.sin(clock * 1.4) * 0.018
    scanHolder.matrix.copy(frame).multiply(T(scanX, 0.058, 0))
    scanHolder.matrixWorldNeedsUpdate = true

    conveyorParts.forEach((p, i) => {
      const f = ((ctx.t * 0.035 + i / conveyorParts.length) % 1 + 1) % 1
      const x = -0.36 + f * 0.62
      p.matrix.copy(frame).multiply(T(x, LINE_Y, (i % 2 ? 1 : -1) * 0.004, i * 0.4))
      p.matrixWorldNeedsUpdate = true
      p.visible = f > 0.02 && f < 0.97
    })

    const hl = heroLocal(ctx.t)
    hero.matrix.copy(frame).multiply(T(hl.x, hl.y, hl.z))
    hero.matrixWorldNeedsUpdate = true
    hero.visible = ctx.t > 32.6 && ctx.t < 36.45
    heroPos.copy(hl).applyMatrix4(frame)

    const robotLocal = clamp01((ctx.t - 35.3) / 3.2)
    inv.copy(robotHolder.matrix).invert()
    local.copy(ctx.camera.position).applyMatrix4(inv)
    const faceYaw = Math.atan2(-local.z, local.x)
    robot.animate(robotLocal, faceYaw, ctx.time, ctx.motion)
    tmp.identity()
  }

  const toWorld = (x: number, y: number, z: number) => new Vector3(x, y, z).applyMatrix4(frame)
  return {
    name: 'factory',
    group,
    center: toWorld(0, 0, 0),
    range: 60,
    anchors: {
      rolling: toWorld(-0.33, 0.08, -0.14),
      extrusion: toWorld(-0.17, 0.06, -0.15),
      machining: toWorld(0.09, 0.07, -0.15),
      assembly: toWorld(0.12, 0.09, 0.0),
      qualityControl: toWorld(0.28, 0.08, 0),
      component: () => heroPos.clone(),
      robot: toWorld(ROBOT_SPOT.x, 0.16, ROBOT_SPOT.z),
      factoryMarker: toWorld(0, 0.1, 0),
    },
    update,
    frame,
    heroPos,
    robotWorld: toWorld(ROBOT_SPOT.x, 0.07, ROBOT_SPOT.z),
    entry: toWorld(-0.58, 0.0, 0.4),
  } as StageScene & { frame: Matrix4; heroPos: Vector3; robotWorld: Vector3; entry: Vector3 }
}
