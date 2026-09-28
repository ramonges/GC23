import { Group, Matrix4, Object3D, PerspectiveCamera, Vector3 } from 'three'

export type FrameCtx = {
  /** Timeline position in seconds. */
  t: number
  /** Wall-clock seconds, for idle loops. */
  time: number
  dt: number
  motion: boolean
  camera: PerspectiveCamera
}

export type Anchor = Vector3 | (() => Vector3)

export interface StageScene {
  name: string
  group: Group
  center: Vector3
  /** Distance from the camera within which the scene is drawn. */
  range: number
  anchors: Record<string, Anchor>
  update(ctx: FrameCtx): void
}

const basis = new Matrix4()
const fwd = new Vector3()
const up = new Vector3()
const right = new Vector3()

/** Orient an object on the globe: local x along `dir`, local y along the surface normal. */
export function placeOnGlobe(obj: Object3D, pos: Vector3, dir: Vector3) {
  up.copy(pos).normalize()
  fwd.copy(dir).addScaledVector(up, -dir.dot(up)).normalize()
  right.crossVectors(fwd, up).normalize()
  basis.makeBasis(fwd, up, right).setPosition(pos)
  obj.matrixAutoUpdate = false
  obj.matrix.copy(basis)
  obj.matrixWorldNeedsUpdate = true
}

export function resolveAnchor(a: Anchor) {
  return typeof a === 'function' ? a() : a
}
