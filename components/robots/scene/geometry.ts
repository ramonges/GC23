import { BufferGeometry, CapsuleGeometry, CylinderGeometry, Euler, Float32BufferAttribute, Matrix4, Quaternion, SphereGeometry, Vector3 } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export type V3 = [number, number, number]

export function piece(g: BufferGeometry, pos: V3 = [0, 0, 0], rot: V3 = [0, 0, 0]) {
  const m = new Matrix4().compose(new Vector3(...pos), new Quaternion().setFromEuler(new Euler(...rot)), new Vector3(1, 1, 1))
  const out = g.clone()
  out.applyMatrix4(m)
  return out
}

export function merge(...geoms: BufferGeometry[]) {
  const nonIndexed = geoms.map((g) => (g.index ? g.toNonIndexed() : g))
  for (const g of nonIndexed) {
    if (!g.getAttribute('uv')) g.setAttribute('uv', g.getAttribute('position').clone())
  }
  return mergeGeometries(nonIndexed, false)!
}

export const rbox = (w: number, h: number, d: number, r = 0.012) => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2))
export const capsule = (r: number, len: number) => new CapsuleGeometry(r, len, 6, 16)
/** Joint drum lying along X. */
export const drum = (r: number, len: number) => piece(new CylinderGeometry(r, r, len, 28), [0, 0, 0], [0, 0, Math.PI / 2])
/** Cylinder lying along Z. */
export const barrel = (r: number, len: number, seg = 32) => piece(new CylinderGeometry(r, r, len, seg), [0, 0, 0], [Math.PI / 2, 0, 0])
export const ellipsoid = (rx: number, ry: number, rz: number) => {
  const g = new SphereGeometry(1, 40, 28)
  g.scale(rx, ry, rz)
  return g
}

/** Horizontal cross-section of a loft: a superellipse of width `w` (x) and depth `d` (z) at height `y`. */
export type Section = { y: number; w: number; d: number; x?: number; z?: number; n?: number }

/**
 * Skins a stack of superellipse sections (bottom to top). `n` = 2 is an ellipse; higher values square the corners.
 * `arc` limits the sweep to part of the ring (angle 0 = +x, π/2 = +z) and leaves the shell open.
 */
export function loft(sections: Section[], opts: { seg?: number; n?: number; arc?: [number, number]; caps?: boolean } = {}) {
  const seg = opts.seg ?? 48
  const closed = !opts.arc
  const [a0, a1] = opts.arc ?? [0, Math.PI * 2]
  const cols = closed ? seg : seg + 1
  const pos: number[] = []
  const uv: number[] = []
  const idx: number[] = []
  const point = (s: Section, i: number): V3 => {
    const t = a0 + ((a1 - a0) * i) / seg
    const e = 2 / (s.n ?? opts.n ?? 2)
    const c = Math.cos(t)
    const sn = Math.sin(t)
    return [(s.x ?? 0) + (s.w / 2) * Math.sign(c) * Math.abs(c) ** e, s.y, (s.z ?? 0) + (s.d / 2) * Math.sign(sn) * Math.abs(sn) ** e]
  }
  sections.forEach((s, j) => {
    for (let i = 0; i < cols; i++) {
      pos.push(...point(s, i))
      uv.push(i / seg, j / (sections.length - 1))
    }
  })
  for (let j = 0; j < sections.length - 1; j++) {
    for (let i = 0; i < seg; i++) {
      const a = j * cols + i
      const b = j * cols + ((i + 1) % cols)
      const c = (j + 1) * cols + i
      const d = (j + 1) * cols + ((i + 1) % cols)
      idx.push(a, c, b, b, c, d)
    }
  }
  if (closed && opts.caps !== false) {
    for (const [s, up] of [
      [sections[0], false],
      [sections[sections.length - 1], true],
    ] as const) {
      const center = pos.length / 3
      pos.push(s.x ?? 0, s.y, s.z ?? 0)
      uv.push(0.5, 0.5)
      for (let i = 0; i < seg; i++) {
        pos.push(...point(s, i))
        uv.push(0, 0)
      }
      for (let i = 0; i < seg; i++) {
        const p = center + 1 + i
        const q = center + 1 + ((i + 1) % seg)
        if (up) idx.push(center, q, p)
        else idx.push(center, p, q)
      }
    }
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

/** Linear interpolation of a section stack at height `y`. */
export function sectionAt(sections: Section[], y: number): Section {
  const i = Math.max(0, sections.findIndex((s) => s.y >= y) - 1)
  const a = sections[i]
  const b = sections[Math.min(i + 1, sections.length - 1)]
  const t = b.y === a.y ? 0 : Math.min(1, Math.max(0, (y - a.y) / (b.y - a.y)))
  const l = (p: number, q: number) => p + (q - p) * t
  return { y, w: l(a.w, b.w), d: l(a.d, b.d), x: l(a.x ?? 0, b.x ?? 0), z: l(a.z ?? 0, b.z ?? 0), n: l(a.n ?? 2, b.n ?? 2) }
}
