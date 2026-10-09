import { Vector3 } from 'three'
import type { Robot } from '@/lib/robots/types'

/** Robots stand on a concave arc facing the camera. */
const ARC_CENTER = new Vector3(0, 0, 4.5)
const ARC_RADIUS = 7.5
/** Neighbours stand a fixed angle apart, so a shorter line-up stays centred instead of stretching. */
const ARC_STEP = (12.5 * Math.PI) / 180
const ARC_MAX_SPREAD = (70 * Math.PI) / 180

/** Where the selected robot ends up: alone, centred, closer to the camera. */
export const FRONT = new Vector3(0, 0, 2.4)

export function slotFor(index: number, count: number) {
  const spread = Math.min(ARC_MAX_SPREAD, ARC_STEP * (count - 1))
  const t = count === 1 ? 0.5 : index / (count - 1)
  const a = -spread / 2 + t * spread
  const position = new Vector3(ARC_CENTER.x + Math.sin(a) * ARC_RADIUS, 0, ARC_CENTER.z - Math.cos(a) * ARC_RADIUS)
  return { position, facing: -a }
}

/** The robot's largest dimension: its height, or its length for robots longer than they are tall. */
export function extent(robot: Robot) {
  return Math.max(robot.height_m, robot.length_m ?? 0)
}

export function pedestalFor(robot: Robot) {
  const fit = (robot.length_m ?? 0) / 2 + 0.06
  if (robot.length_m) return { height: 0.14, radius: Math.max(0.46, fit) }
  if (robot.height_m < 0.4) return { height: 0.78, radius: Math.max(0.24, fit) }
  if (robot.height_m < 1) return { height: 0.32, radius: Math.max(0.36, fit) }
  return { height: 0.12, radius: Math.max(0.46, fit) }
}

/** Point the camera should look at for a robot standing at `base`. */
export function focusPoint(robot: Robot, base: Vector3) {
  const ped = pedestalFor(robot)
  return base.clone().add(new Vector3(0, ped.height + robot.height_m * 0.55, 0))
}

export function detailDistance(robot: Robot) {
  return Math.max(0.75, extent(robot) * 1.9 + 0.5)
}

export const SHOWROOM_CAMERA = { position: new Vector3(0, 2.05, 8.2), target: new Vector3(0, 1.42, -0.9) }
export const ARC = { center: ARC_CENTER, radius: ARC_RADIUS }
