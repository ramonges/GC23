/**
 * Builds public/models/robots/g1.glb from Unitree's g1_23dof.xml and its STL meshes
 * (unitreerobotics/unitree_ros, robots/g1_description). See components/robots/README.md for usage.
 */
import fs from 'node:fs'
import path from 'node:path'
import { Document, NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS, KHRDracoMeshCompression } from '@gltf-transform/extensions'
import { draco, prune, dedup, weld } from '@gltf-transform/functions'
import draco3d from 'draco3dgltf'
import { MeshoptSimplifier } from 'meshoptimizer'
import { XMLParser } from 'fast-xml-parser'

const MJCF = process.argv[2]
const OUT = process.argv[3]
const MESHDIR = path.join(path.dirname(MJCF), 'meshes')

const xml = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '', isArray: (n, _p, _leaf, isAttr) => !isAttr && ['body', 'geom', 'joint', 'mesh'].includes(n) }).parse(fs.readFileSync(MJCF, 'utf8'))
const mj = xml.mujoco
const meshFiles = new Map([mj.asset].flat().flatMap((a) => a.mesh ?? []).map((m) => [m.name, path.join(MESHDIR, path.basename(m.file))]))

// The MJCF has no keyframe; zero pose puts the forearms straight out, so relax the elbows.
const pose = new Map([
  ['left_elbow_joint', 1.2],
  ['right_elbow_joint', 1.2],
  ['left_shoulder_roll_joint', 0.2],
  ['right_shoulder_roll_joint', -0.2],
])

const PART = {
  pelvis: 'pelvis',
  pelvis_contour_link: 'pelvis',
  torso_link: 'torso',
  logo_link: 'torso',
  head_link: 'head',
  waist_yaw_link: 'waist',
  waist_support_link: 'waist',
}
for (const [s, side] of [['L', 'left'], ['R', 'right']]) {
  Object.assign(PART, {
    [`${side}_hip_pitch_link`]: `hip_pitch_${s}`,
    [`${side}_hip_roll_link`]: `hip_roll_${s}`,
    [`${side}_hip_yaw_link`]: `thigh_${s}`,
    [`${side}_knee_link`]: `shin_${s}`,
    [`${side}_ankle_pitch_link`]: `ankle_${s}`,
    [`${side}_ankle_roll_link`]: `foot_${s}`,
    [`${side}_shoulder_pitch_link`]: `shoulder_pitch_${s}`,
    [`${side}_shoulder_roll_link`]: `shoulder_roll_${s}`,
    [`${side}_shoulder_yaw_link`]: `upper_arm_${s}`,
    [`${side}_elbow_link`]: `forearm_${s}`,
    [`${side}_wrist_roll_rubber_hand`]: `hand_${s}`,
  })
}

// Triangle budget per source mesh; anything not listed keeps its full resolution.
const BUDGET = { left_wrist_roll_rubber_hand: 9000, right_wrist_roll_rubber_hand: 9000, pelvis_contour_link: 12000, torso_link: 22000, pelvis: 10000, head_link: 12000, left_knee_link: 9000, right_knee_link: 9000, left_ankle_roll_link: 6000, right_ankle_roll_link: 6000 }

const vec = (s, d) => (s ? String(s).split(/\s+/).map(Number) : d)
const qmul = ([aw, ax, ay, az], [bw, bx, by, bz]) => [aw * bw - ax * bx - ay * by - az * bz, aw * bx + ax * bw + ay * bz - az * by, aw * by - ax * bz + ay * bw + az * bx, aw * bz + ax * by - ay * bx + az * bw]
const qnorm = (q) => {
  const l = Math.hypot(...q)
  return q.map((v) => v / l)
}
const rot = (q, v) => {
  const p = qmul(qmul(q, [0, ...v]), [q[0], -q[1], -q[2], -q[3]])
  return [p[1], p[2], p[3]]
}
const add = (a, b) => a.map((v, i) => v + b[i])
const compose = (T, pos, quat) => ({ p: add(T.p, rot(T.q, pos)), q: qnorm(qmul(T.q, quat)) })
const axisAngle = (axis, a) => [Math.cos(a / 2), ...axis.map((v) => v * Math.sin(a / 2))]
// MuJoCo is Z-up with the robot facing +X and its left on +Y; the explorer is Y-up, facing +Z, left on +X.
const toThree = ([x, y, z]) => [y, z, x]

function readStl(file) {
  const buf = fs.readFileSync(file)
  const n = buf.readUInt32LE(80)
  if (84 + 50 * n !== buf.length) throw new Error(`${file} is not a binary STL`)
  const pos = new Float32Array(n * 9)
  for (let t = 0; t < n; t++) for (let k = 0; k < 9; k++) pos[t * 9 + k] = buf.readFloatLE(84 + t * 50 + 12 + k * 4)
  return pos
}

/** Welds the triangle soup by position, simplifies it to `budget` triangles and returns indexed positions. */
function weldAndSimplify(soup, budget) {
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
  const [out] = MeshoptSimplifier.simplify(idx, positions, 3, budget * 3, 0.002, ['LockBorder'])
  return { positions, indices: out }
}

/** Unwelds an indexed mesh and gives each corner the average normal of adjacent faces within the crease angle. */
function creaseNormals({ positions, indices }, creaseDeg = 38) {
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

const placed = []
function walk(body, parent) {
  let T = compose(parent, vec(body.pos, [0, 0, 0]), vec(body.quat, [1, 0, 0, 0]))
  for (const j of body.joint ?? []) {
    if (j.type === 'free') continue
    T = { p: T.p, q: qnorm(qmul(T.q, axisAngle(vec(j.axis, [0, 0, 1]), pose.get(j.name) ?? 0))) }
  }
  for (const g of body.geom ?? []) {
    if (g.type !== 'mesh' || String(g.group) !== '1') continue
    placed.push({ mesh: g.mesh, rgba: vec(g.rgba, [0.7, 0.7, 0.7, 1]), T: compose(T, vec(g.pos, [0, 0, 0]), vec(g.quat, [1, 0, 0, 0])) })
  }
  for (const c of body.body ?? []) walk(c, T)
}
walk([mj.worldbody].flat().flatMap((w) => w.body ?? []).find((b) => b.name === 'pelvis'), { p: [0, 0, 0], q: [1, 0, 0, 0] })

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'draco3d.encoder': await draco3d.createEncoderModule(),
})
await MeshoptSimplifier.ready

const doc = new Document()
const buffer = doc.createBuffer()
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
// The MJCF's two greys stand for the G1's satin silver shells and its dark grey joints, head and feet.
const FINISH = { light: { color: [0.62, 0.64, 0.66], roughness: 0.42, metallic: 0.35 }, dark: { color: [0.13, 0.135, 0.14], roughness: 0.55, metallic: 0.15 } }
const materials = {}
const material = (rgba) => {
  const key = rgba[0] > 0.45 ? 'light' : 'dark'
  const f = FINISH[key]
  materials[key] ??= doc.createMaterial(key === 'light' ? 'silver' : 'graphite').setBaseColorFactor([...f.color.map(lin), 1]).setRoughnessFactor(f.roughness).setMetallicFactor(f.metallic)
  return materials[key]
}

const built = placed.map((g) => {
  const soup = readStl(meshFiles.get(g.mesh))
  const world = new Float32Array(soup.length)
  for (let i = 0; i < soup.length; i += 3) world.set(toThree(add(g.T.p, rot(g.T.q, [soup[i], soup[i + 1], soup[i + 2]]))), i)
  const simplified = weldAndSimplify(world, BUDGET[g.mesh])
  return { ...g, part: PART[g.mesh], tris: soup.length / 9, ...creaseNormals(simplified) }
})
for (const g of built) if (!g.part) throw new Error(`unmapped mesh ${g.mesh}`)
let minY = Infinity
for (const g of built) for (let i = 1; i < g.pos.length; i += 3) minY = Math.min(minY, g.pos[i])

const root = doc.createNode('g1')
const parts = new Map()
let maxY = 0
let tris = 0
for (const g of built) {
  for (let i = 1; i < g.pos.length; i += 3) {
    g.pos[i] -= minY
    maxY = Math.max(maxY, g.pos[i])
  }
  tris += g.pos.length / 9
  const prim = doc
    .createPrimitive()
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(g.pos).setBuffer(buffer))
    .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(g.nrm).setBuffer(buffer))
    .setMaterial(material(g.rgba))
  if (!parts.has(g.part)) {
    const mesh = doc.createMesh(g.part)
    root.addChild(doc.createNode(g.part).setMesh(mesh))
    parts.set(g.part, mesh)
  }
  parts.get(g.part).addPrimitive(prim)
}
doc.createScene('g1').addChild(root)

doc.createExtension(KHRDracoMeshCompression).setRequired(true)
await doc.transform(dedup(), weld(), prune(), draco({ quantizePosition: 14, quantizeNormal: 10 }))
await io.write(OUT, doc)
console.log('height', maxY.toFixed(4), 'triangles', tris, 'of', built.reduce((s, g) => s + g.tris, 0))
console.log('parts', [...parts.keys()].join(' '))
