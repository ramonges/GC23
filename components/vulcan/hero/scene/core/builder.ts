import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Quaternion,
  SphereGeometry,
  Texture,
  Vector3,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { between } from './math'
import { linear, type Rgb } from './palette'

export type MatKind = 'solid' | 'metal' | 'water' | 'emissive' | 'glass'

export type Materials = Record<MatKind, MeshStandardMaterial | MeshBasicMaterial>

export function createMaterials(envMap: Texture | null): Materials {
  return {
    solid: new MeshStandardMaterial({ vertexColors: true, roughness: 0.86, metalness: 0.04, envMap, envMapIntensity: 0.28 }),
    metal: new MeshStandardMaterial({ vertexColors: true, roughness: 0.38, metalness: 0.7, envMap, envMapIntensity: 0.75 }),
    water: new MeshStandardMaterial({ vertexColors: true, roughness: 0.7, metalness: 0, envMap, envMapIntensity: 0.28 }),
    glass: new MeshStandardMaterial({ vertexColors: true, roughness: 0.12, metalness: 0.2, envMap, envMapIntensity: 1.1 }),
    emissive: new MeshBasicMaterial({ vertexColors: true }),
  }
}

const Y_AXIS = new Vector3(0, 1, 0)
const X_AXIS = new Vector3(1, 0, 0)
const Z_AXIS = new Vector3(0, 0, 1)

export const T = (x: number, y: number, z: number, ry = 0, sx = 1, sy = 1, sz = 1) =>
  new Matrix4().compose(new Vector3(x, y, z), new Quaternion().setFromAxisAngle(Y_AXIS, ry), new Vector3(sx, sy, sz))

export const RX = (a: number) => new Matrix4().makeRotationAxis(X_AXIS, a)
export const RZ = (a: number) => new Matrix4().makeRotationAxis(Z_AXIS, a)

function prepare(geo: BufferGeometry) {
  if (!geo.getAttribute('normal')) geo.computeVertexNormals()
  const g = geo.index ? geo.toNonIndexed() : geo
  for (const name of Object.keys(g.attributes)) if (!['position', 'normal', 'color'].includes(name)) g.deleteAttribute(name)
  return g
}

function paint(geo: BufferGeometry, rgb: Rgb) {
  const count = geo.getAttribute('position').count
  const colors = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) colors.set(rgb, i * 3)
  geo.setAttribute('color', new BufferAttribute(colors, 3))
}

/** Accumulates static geometry per material so a whole site renders in a handful of draw calls. */
export class Builder {
  private parts: Record<MatKind, BufferGeometry[]> = { solid: [], metal: [], water: [], emissive: [], glass: [] }
  private stack: Matrix4[] = [new Matrix4()]

  push(m: Matrix4) {
    this.stack.push(this.stack[this.stack.length - 1].clone().multiply(m))
    return this
  }

  pop() {
    this.stack.pop()
    return this
  }

  get current() {
    return this.stack[this.stack.length - 1]
  }

  add(geo: BufferGeometry, color: string | Rgb, kind: MatKind = 'solid', local?: Matrix4) {
    const g = prepare(geo)
    if (typeof color === 'string') paint(g, linear(color))
    else if (!g.getAttribute('color')) paint(g, color)
    g.applyMatrix4(local ? this.current.clone().multiply(local) : this.current)
    this.parts[kind].push(g)
    return this
  }

  /** Geometry that already carries a `color` attribute (e.g. terrain). */
  addColored(geo: BufferGeometry, kind: MatKind = 'solid', local?: Matrix4) {
    const g = prepare(geo)
    g.applyMatrix4(local ? this.current.clone().multiply(local) : this.current)
    this.parts[kind].push(g)
    return this
  }

  box(w: number, h: number, d: number, x: number, y: number, z: number, color: string | Rgb, kind: MatKind = 'solid', ry = 0) {
    return this.add(new BoxGeometry(w, h, d), color, kind, T(x, y, z, ry))
  }

  cyl(rTop: number, rBot: number, h: number, x: number, y: number, z: number, color: string | Rgb, kind: MatKind = 'solid', seg = 16, rot?: Matrix4) {
    const m = T(x, y, z)
    if (rot) m.multiply(rot)
    return this.add(new CylinderGeometry(rTop, rBot, h, seg, 1), color, kind, m)
  }

  cone(r: number, h: number, x: number, y: number, z: number, color: string | Rgb, kind: MatKind = 'solid', seg = 10, ry = 0, sx = 1, sz = 1) {
    return this.add(new ConeGeometry(r, h, seg, 1), color, kind, T(x, y, z, ry, sx, 1, sz))
  }

  sphere(r: number, x: number, y: number, z: number, color: string | Rgb, kind: MatKind = 'solid', dome = false, seg = 18) {
    const geo = new SphereGeometry(r, seg, Math.round(seg / 2), 0, Math.PI * 2, 0, dome ? Math.PI / 2 : Math.PI)
    return this.add(geo, color, kind, T(x, y, z))
  }

  tube(a: Vector3, b: Vector3, r: number, color: string | Rgb, kind: MatKind = 'metal', seg = 8) {
    return this.add(new CylinderGeometry(1, 1, 1, seg, 1), color, kind, between(a, b, r))
  }

  /** A run of pipes through consecutive points. */
  pipe(points: [number, number, number][], r: number, color: string | Rgb, kind: MatKind = 'metal') {
    for (let i = 0; i < points.length - 1; i++) {
      this.tube(new Vector3(...points[i]), new Vector3(...points[i + 1]), r, color, kind)
    }
    return this
  }

  build(materials: Materials, options: { shadows?: boolean; name?: string } = {}) {
    const group = new Group()
    group.name = options.name || 'site'
    for (const kind of Object.keys(this.parts) as MatKind[]) {
      const list = this.parts[kind]
      if (!list.length) continue
      const merged = mergeGeometries(list)
      if (!merged) continue
      merged.computeBoundingSphere()
      const mesh = new Mesh(merged, materials[kind])
      mesh.name = `${group.name}-${kind}`
      if (options.shadows !== false && kind !== 'emissive') {
        mesh.castShadow = kind !== 'water'
        mesh.receiveShadow = true
      }
      group.add(mesh)
    }
    return group
  }

  /** Build a single merged mesh (for an articulated part). */
  buildPart(materials: Materials, kind: MatKind = 'solid') {
    const list = this.parts[kind]
    const merged = mergeGeometries(list)!
    const mesh = new Mesh(merged, materials[kind])
    if (kind !== 'emissive') {
      mesh.castShadow = true
      mesh.receiveShadow = true
    }
    return mesh
  }

  merged(kind: MatKind = 'solid') {
    return mergeGeometries(this.parts[kind])
  }

  isEmpty() {
    return Object.values(this.parts).every((l) => l.length === 0)
  }
}

/** Build an articulated part (a Group of per-material meshes) from a builder callback. */
export function part(materials: Materials, fn: (b: Builder) => void, name = 'part') {
  const b = new Builder()
  fn(b)
  return b.build(materials, { name })
}
