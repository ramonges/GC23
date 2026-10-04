import { Vector3 } from 'three'
import type { Robot } from '@/lib/robots/types'

/** Robots stand on a concave arc facing the camera. */
const ARC_CENTER = new Vector3(0, 0, 4.5)
const ARC_RADIUS = 7
const ARC_SPREAD = (84 * Math.PI) / 180

/** Where the selected robot ends up: alone, centred, closer to the camera. */
export const FRONT = new Vector3(0, 0, 2.4)

export function slotFor(index: number, count: number) {
  const t = count === 1 ? 0.5 : index / (count - 1)
  const a = -ARC_SPREAD / 2 + t * ARC_SPREAD
  const position = new Vector3(ARC_CENTER.x + Math.sin(a) * ARC_RADIUS, 0, ARC_CENTER.z - Math.cos(a) * ARC_RADIUS)
  return { position, facing: -a }
}

export function pedestalFor(robot: Robot) {
  if (robot.height_m < 0.4) return { height: 0.78, radius: 0.24 }
  if (robot.height_m < 1) return { height: 0.32, radius: 0.36 }
  return { height: 0.12, radius: 0.46 }
}

/** Point the camera should look at for a robot standing at `base`. */
export function focusPoint(robot: Robot, base: Vector3) {
  const ped = pedestalFor(robot)
  return base.clone().add(new Vector3(0, ped.height + robot.height_m * 0.55, 0))
}

export function detailDistance(robot: Robot) {
  return Math.max(0.75, robot.height_m * 1.9 + 0.5)
}

export const SHOWROOM_CAMERA = { position: new Vector3(0, 1.75, 7.6), target: new Vector3(0, 0.85, -0.6) }
export const ARC = { center: ARC_CENTER, radius: ARC_RADIUS }
