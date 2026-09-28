import {
  BoxGeometry,
  Color,
  DynamicDrawUsage,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
} from 'three'
import { FACTORY_ROBOT, HAUL_ROAD, pitHeight } from './dioramas'
import { EARTH_R, latLngToVec3, tangentFrame } from './math'

type Part = { dims: [number, number, number]; color: string }

export type SceneEntity = {
  id: string
  kind: 'truck' | 'ship' | 'robot'
  active: boolean
  visible: boolean
  loaded: boolean
  parts: Part[]
  offset: number
}

const TRUCK: Part[] = [
  { dims: [0.05, 0.016, 0.028], color: '#d9a33a' },
  { dims: [0.03, 0.016, 0.03], color: '#8a3a1d' },
  { dims: [0.014, 0.016, 0.024], color: '#e2b04a' },
]
const SHIP: Part[] = [
  { dims: [0.2, 0.022, 0.042], color: '#2a1c19' },
  { dims: [0.03, 0.012, 0.034], color: '#8b3a1f' },
  { dims: [0.03, 0.012, 0.034], color: '#8b3a1f' },
  { dims: [0.03, 0.012, 0.034], color: '#8b3a1f' },
  { dims: [0.03, 0.012, 0.034], color: '#8b3a1f' },
  { dims: [0.028, 0.03, 0.036], color: '#d6d7da' },
]
const ROBOT: Part[] = [
  { dims: [0.11, 0.05, 0.11], color: '#2e3136' },
  { dims: [0.075, 0.06, 0.075], color: '#e0621f' },
  { dims: [0.03, 1, 0.034], color: '#e0621f' },
  { dims: [0.024, 1, 0.028], color: '#c3c7cd' },
  { dims: [0.04, 0.034, 0.04], color: '#c3c7cd' },
  { dims: [0.014, 0.036, 0.014], color: '#2a2c30' },
]

const ROBOT_L1 = 0.22
const ROBOT_L2 = 0.18

export function buildEntities(frames: { pit: Matrix4; factory: Matrix4 }) {
  const entities: SceneEntity[] = [
    { id: 'truck-1', kind: 'truck', active: true, visible: false, loaded: false, parts: TRUCK, offset: 0 },
    { id: 'truck-2', kind: 'truck', active: true, visible: false, loaded: false, parts: TRUCK, offset: 0.5 },
    { id: 'ship', kind: 'ship', active: true, visible: false, loaded: false, parts: SHIP, offset: 0 },
    { id: 'robot-arm', kind: 'robot', active: true, visible: false, loaded: false, parts: ROBOT, offset: 0 },
  ]
  const count = entities.reduce((s, e) => s + e.parts.length, 0)
  const mesh = new InstancedMesh(
    new BoxGeometry(1, 1, 1),
    new MeshStandardMaterial({ flatShading: true, roughness: 0.6, metalness: 0.25 }),
    count,
  )
  mesh.name = 'entities'
  mesh.frustumCulled = false
  mesh.instanceMatrix.setUsage(DynamicDrawUsage)
  const c = new Color()
  let slot = 0
  const slots = new Map<string, number>()
  for (const e of entities) {
    slots.set(e.id, slot)
    for (const p of e.parts) mesh.setColorAt(slot++, c.set(p.color))
    e.loaded = true
  }
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true

  const zero = new Matrix4().makeScale(0, 0, 0)
  const m = new Matrix4()
  const base = new Matrix4()
  const tmp = new Matrix4()
  const q = new Quaternion()
  const v = new Vector3()
  const s = new Vector3()
  const Y = new Vector3(0, 1, 0)
  const Z = new Vector3(0, 0, 1)
  const sensorWorld = new Vector3()

  const partMatrix = (entityBase: Matrix4, local: Matrix4, dims: [number, number, number]) =>
    m.copy(entityBase).multiply(local).multiply(tmp.makeScale(dims[0], dims[1], dims[2]))

  const roadLengths = HAUL_ROAD.slice(1).map((p, i) => Math.hypot(p[0] - HAUL_ROAD[i][0], p[1] - HAUL_ROAD[i][1]))
  const roadTotal = roadLengths.reduce((a, b) => a + b, 0)
  function roadAt(f: number) {
    let d = f * roadTotal
    let i = 0
    while (i < roadLengths.length - 1 && d > roadLengths[i]) {
      d -= roadLengths[i]
      i++
    }
    const t = Math.min(1, d / roadLengths[i])
    const [ax, az] = HAUL_ROAD[i]
    const [bx, bz] = HAUL_ROAD[i + 1]
    return { x: ax + (bx - ax) * t, z: az + (bz - az) * t, heading: Math.atan2(-(bz - az), bx - ax) }
  }

  function writeTruck(e: SceneEntity, time: number) {
    const cycle = (time * 0.035 + e.offset) % 1
    const f = cycle < 0.5 ? cycle * 2 : 2 - cycle * 2
    const p = roadAt(f)
    const heading = cycle < 0.5 ? p.heading : p.heading + Math.PI
    const y = pitHeight(p.x, p.z) + 0.008
    base.copy(frames.pit).multiply(tmp.compose(v.set(p.x, y, p.z), q.setFromAxisAngle(Y, heading), s.set(1, 1, 1)))
    let k = slots.get(e.id)!
    const local = new Matrix4()
    mesh.setMatrixAt(k++, partMatrix(base, local.makeTranslation(0, 0.008, 0), e.parts[0].dims))
    mesh.setMatrixAt(k++, partMatrix(base, local.makeTranslation(-0.008, 0.022, 0), e.parts[1].dims))
    mesh.setMatrixAt(k++, partMatrix(base, local.makeTranslation(0.021, 0.022, 0), e.parts[2].dims))
  }

  function writeShip(e: SceneEntity, ship: { lat: number; lng: number; heading: number; altitude: number }) {
    const { up, east, south } = tangentFrame(ship.lat, ship.lng)
    base.makeBasis(east, up, south).setPosition(latLngToVec3(ship.lat, ship.lng, EARTH_R + ship.altitude, v))
    base.multiply(tmp.makeRotationY(ship.heading))
    let k = slots.get(e.id)!
    const local = new Matrix4()
    mesh.setMatrixAt(k++, partMatrix(base, local.makeTranslation(0, 0, 0), e.parts[0].dims))
    for (let i = 0; i < 4; i++) {
      mesh.setMatrixAt(k++, partMatrix(base, local.makeTranslation(0.05 - i * 0.034, 0.016, 0), e.parts[1 + i].dims))
    }
    mesh.setMatrixAt(k++, partMatrix(base, local.makeTranslation(-0.082, 0.026, 0), e.parts[5].dims))
  }

  function writeRobot(e: SceneEntity, time: number) {
    base.copy(frames.factory).multiply(tmp.makeTranslation(FACTORY_ROBOT.x, 0.024, FACTORY_ROBOT.z))
    const yaw = 0.7 * Math.sin(time * 0.35) - 0.4
    const shoulder = -0.55 + 0.14 * Math.sin(time * 0.7)
    const elbow = 1.35 + 0.2 * Math.sin(time * 0.9 + 1)
    const wrist = 0.55 + 0.25 * Math.sin(time * 1.3)
    let k = slots.get(e.id)!
    const local = new Matrix4()
    mesh.setMatrixAt(k++, partMatrix(base, local.makeTranslation(0, 0.025, 0), e.parts[0].dims))
    const turret = base.clone().multiply(tmp.makeTranslation(0, 0.05, 0)).multiply(new Matrix4().makeRotationY(yaw))
    mesh.setMatrixAt(k++, partMatrix(turret, local.makeTranslation(0, 0.03, 0), e.parts[1].dims))
    const shoulderM = turret.clone().multiply(tmp.makeTranslation(0, 0.06, 0)).multiply(new Matrix4().makeRotationAxis(Z, shoulder))
    mesh.setMatrixAt(k++, partMatrix(shoulderM, local.makeTranslation(0, ROBOT_L1 / 2, 0), [e.parts[2].dims[0], ROBOT_L1, e.parts[2].dims[2]]))
    const elbowM = shoulderM.clone().multiply(tmp.makeTranslation(0, ROBOT_L1, 0)).multiply(new Matrix4().makeRotationAxis(Z, elbow))
    mesh.setMatrixAt(k++, partMatrix(elbowM, local.makeTranslation(0, ROBOT_L2 / 2, 0), [e.parts[3].dims[0], ROBOT_L2, e.parts[3].dims[2]]))
    const wristM = elbowM.clone().multiply(tmp.makeTranslation(0, ROBOT_L2, 0)).multiply(new Matrix4().makeRotationAxis(Z, wrist))
    mesh.setMatrixAt(k++, partMatrix(wristM, local.makeTranslation(0, 0.017, 0), e.parts[4].dims))
    mesh.setMatrixAt(k++, partMatrix(wristM, local.makeTranslation(0, 0.052, 0), e.parts[5].dims))
    sensorWorld.set(0, 0.075, 0).applyMatrix4(wristM)
  }

  function update(time: number, ship: { lat: number; lng: number; heading: number; altitude: number }) {
    for (const e of entities) {
      if (!e.visible) {
        let k = slots.get(e.id)!
        for (let i = 0; i < e.parts.length; i++) mesh.setMatrixAt(k++, zero)
        continue
      }
      const t = e.active ? time : 0
      if (e.kind === 'truck') writeTruck(e, t)
      else if (e.kind === 'ship') writeShip(e, ship)
      else writeRobot(e, t)
    }
    mesh.instanceMatrix.needsUpdate = true
  }

  const byId = Object.fromEntries(entities.map((e) => [e.id, e])) as Record<string, SceneEntity>
  return { mesh, entities, byId, update, sensorWorld, count }
}
