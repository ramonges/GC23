/** Shared helpers for the MJCF + STL assembly scripts (assemble-g1.mjs, assemble-reachy-mini.mjs). */
import fs from 'node:fs'
import { MeshoptSimplifier } from 'meshoptimizer'

export const vec = (s, d) => (s ? String(s).split(/\s+/).map(Number) : d)
export const qmul = ([aw, ax, ay, az], [bw, bx, by, bz]) => [aw * bw - ax * bx - ay * by - az * bz, aw * bx + ax * bw + ay * bz - az * by, aw * by - ax * bz + ay * bw + az * bx, aw * bz + ax * by - ay * bx + az * bw]
export const qnorm = (q) => {
  const l = Math.hypot(...q)
  return q.map((v) => v / l)
}
export const rot = (q, v) => {
  const p = qmul(qmul(q, [0, ...v]), [q[0], -q[1], -q[2], -q[3]])
  return [p[1], p[2], p[3]]
}
export const add = (a, b) => a.map((v, i) => v + b[i])
export const compose = (T, pos, quat) => ({ p: add(T.p, rot(T.q, pos)), q: qnorm(qmul(T.q, quat)) })
export const axisAngle = (axis, a) => [Math.cos(a / 2), ...axis.map((v) => v * Math.sin(a / 2))]
export const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)

export function readStl(file) {
  const buf = fs.readFileSync(file)
  const n = buf.readUInt32LE(80)
  if (84 + 50 * n !== buf.length) throw new Error(`${file} is not a binary STL`)
  const pos = new Float32Array(n * 9)
  for (let t = 0; t < n; t++) for (let k = 0; k < 9; k++) pos[t * 9 + k] = buf.readFloatLE(84 + t * 50 + 12 + k * 4)
  return pos
}

/** Welds a triangle soup by position and, if it has more than `budget` triangles, simplifies it. */
export function weldAndSimplify(soup, budget, error = 0.002) {
  const map = new Map()
  const verts = []
  const idx = new Uint32Array(soup.length / 3)
  for (let i = 0; i < soup.length; i += 3) {
    const key = `${soup[i].toFixed(6)},${soup[i + 1].toFixed(6)},${soup[i + 2].toFixed(6)}`
    let v = map.get(key)
    if (v === undefined) {
      v = verts.length / 3
      map.set(key, v)
      verts.push(soup[i], soup[i + 1], soup[i + 2])
    }
    idx[i / 3] = v
  }
  const positions = new Float32Array(verts)
  if (!budget || idx.length / 3 <= budget) return { positions, indices: idx }
  const [out] = MeshoptSimplifier.simplify(idx, positions, 3, budget * 3, error, ['LockBorder'])
  return { positions, indices: out }
}

/** Unwelds an indexed mesh and gives each corner the area-weighted normal of adjacent faces within the crease angle. */
export function creaseNormals({ positions, indices }, creaseDeg = 38) {
  const cos = Math.cos((creaseDeg * Math.PI) / 180)
  const triCount = indices.length / 3
  const fn = new Float32Array(triCount * 3)
  const area = new Float32Array(triCount)
  const byVertex = new Map()
  for (let t = 0; t < triCount; t++) {
    const [a, b, c] = [indices[t * 3], indices[t * 3 + 1], indices[t * 3 + 2]]
    const p = (i) => [positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]]
    const [pa, pb, pc] = [p(a), p(b), p(c)]
    const u = [pb[0] - pa[0], pb[1] - pa[1], pb[2] - pa[2]]
    const w = [pc[0] - pa[0], pc[1] - pa[1], pc[2] - pa[2]]
    const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]]
    const l = Math.hypot(...n) || 1
    fn.set([n[0] / l, n[1] / l, n[2] / l], t * 3)
    area[t] = l
    for (const v of [a, b, c]) (byVertex.get(v) ?? byVertex.set(v, []).get(v)).push(t)
  }
  const pos = new Float32Array(indices.length * 3)
  const nrm = new Float32Array(indices.length * 3)
  for (let t = 0; t < triCount; t++) {
    for (let k = 0; k < 3; k++) {
      const v = indices[t * 3 + k]
      const o = (t * 3 + k) * 3
      pos.set([positions[v * 3], positions[v * 3 + 1], positions[v * 3 + 2]], o)
      let nx = 0, ny = 0, nz = 0
      for (const f of byVertex.get(v)) {
        const d = fn[f * 3] * fn[t * 3] + fn[f * 3 + 1] * fn[t * 3 + 1] + fn[f * 3 + 2] * fn[t * 3 + 2]
        if (d < cos) continue
        nx += fn[f * 3] * area[f]
        ny += fn[f * 3 + 1] * area[f]
        nz += fn[f * 3 + 2] * area[f]
      }
      const l = Math.hypot(nx, ny, nz) || 1
      nrm.set([nx / l, ny / l, nz / l], o)
    }
  }
  return { pos, nrm }
}

export { MeshoptSimplifier }
