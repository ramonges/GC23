/**
 * Builds public/models/robots/microduck.glb from the Microduck part meshes and the official MJCF.
 * See components/robots/README.md for usage.
 */
import fs from 'node:fs'
import { Document, NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS, KHRDracoMeshCompression } from '@gltf-transform/extensions'
import { weld, draco, prune, dedup } from '@gltf-transform/functions'
import draco3d from 'draco3dgltf'
import { XMLParser } from 'fast-xml-parser'

const SRC = process.argv[2]
const MJCF = process.argv[3]
const OUT = process.argv[4]

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'draco3d.encoder': await draco3d.createEncoderModule(),
})
const src = await io.read(SRC)
const srcMeshes = new Map(src.getRoot().listMeshes().map((m) => [m.getName().replace(/\.stl$/, ''), m]))

const xml = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '', isArray: (n, _p, _leaf, isAttr) => !isAttr && ['body', 'geom', 'joint', 'material', 'site'].includes(n) }).parse(fs.readFileSync(MJCF, 'utf8'))
const mj = xml.mujoco
const mats = new Map(mj.asset.material.map((m) => [m.name, m.rgba.split(' ').map(Number)]))

// STAND keyframe from scene.xml, in joint tree order.
const STAND = [0, -0.08726646259971647, -0.457924, -0.00494, 0.452984, 0.3490658503988659, 0.3490658503988659, 0, 0, 0, 0.08726646259971647, 0.457924, 0.00494, -0.452984]
const JOINTS = ['left_hip_yaw', 'left_hip_roll', 'left_hip_pitch', 'left_knee', 'left_ankle', 'neck_pitch', 'head_pitch', 'head_yaw', 'head_roll', 'right_hip_yaw', 'right_hip_roll', 'right_hip_pitch', 'right_knee', 'right_ankle']
const pose = new Map(JOINTS.map((j, i) => [j, STAND[i]]))

const vec = (s, d) => (s ? s.split(/\s+/).map(Number) : d)
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

function partFor(body, mesh, pos) {
  const side = (l, r) => (body.endsWith('_2') || body.includes('right') || body === 'bearing_roll' ? r : l)
  if (body === 'trunk_base') {
    if (mesh === 'left_shell' || mesh === 'right_shell') return 'body_shell'
    if (mesh === 'np_f970' || mesh === 'power_support') return 'battery_pack'
    if (mesh === 'xl330') return pos[1] > 0 ? 'actuator_hip_L' : 'actuator_hip_R'
    return 'trunk_frame'
  }
  if (body === 'yaw2roll' || body === 'bearing_roll') return mesh === 'xl330' ? side('actuator_hip_L', 'actuator_hip_R') : side('hip_frame_L', 'hip_frame_R')
  if (body.startsWith('hip_l')) return side('hip_frame_L', 'hip_frame_R')
  if (body.startsWith('upper_leg')) {
    if (mesh === 'xl330') return Math.abs(pos[0]) > 0.01 ? side('actuator_knee_L', 'actuator_knee_R') : side('actuator_hip_L', 'actuator_hip_R')
    return side('thigh_L', 'thigh_R')
  }
  if (body.startsWith('leg')) return mesh === 'xl330' ? side('actuator_ankle_L', 'actuator_ankle_R') : side('shin_L', 'shin_R')
  if (body.startsWith('ankle')) return side('foot_L', 'foot_R')
  if (body === 'neck' || body === 'neck_pitch' || body === 'yaw_roll_motion') return mesh === 'xl330' ? 'actuator_neck' : 'neck_frame'
  if (body === 'jaw_soft') {
    if (mesh === 'xl330') return 'actuator_head'
    if (['lens', 'm12_lens_holder', 'noenoeil'].includes(mesh)) return 'head_sensors'
    if (['pcb__raspberry_pi_zero_2_w', 'elec_rpi_robot_hat_pcb'].includes(mesh)) return 'compute_head'
    if (mesh === 'speaker') return 'speaker'
    if (mesh === 'jaw_soft' || mesh === 'soft_mouth_top') return 'beak_soft'
    return 'head_shell'
  }
  throw new Error(`unmapped ${body}/${mesh}`)
}

function finish(mesh) {
  if (mesh.startsWith('seeed_bearing')) return { roughness: 0.28, metallic: 0.9 }
  if (mesh === 'xl330') return { roughness: 0.45, metallic: 0.1 }
  if (mesh === 'lens') return { roughness: 0.1, metallic: 0.4 }
  if (mesh.startsWith('pcb') || mesh.startsWith('elec')) return { roughness: 0.5, metallic: 0.2 }
  if (mesh === 'jaw_soft' || mesh === 'soft_mouth_top' || mesh.startsWith('sole')) return { roughness: 0.85, metallic: 0 }
  return { roughness: 0.62, metallic: 0 }
}

// MuJoCo is Z-up with the duck facing +X and its left on +Y; the explorer is Y-up, facing +Z, left on +X.
const toThree = ([x, y, z]) => [y, z, x]

const placed = []
const sites = {}
function walk(body, parent) {
  let T = compose(parent, vec(body.pos, [0, 0, 0]), vec(body.quat, [1, 0, 0, 0]))
  for (const j of body.joint ?? []) T = { p: T.p, q: qnorm(qmul(T.q, axisAngle(vec(j.axis, [0, 0, 1]), pose.get(j.name) ?? 0))) }
  for (const g of body.geom ?? []) {
    if (g.class !== 'visual') continue
    const G = compose(T, vec(g.pos, [0, 0, 0]), vec(g.quat, [1, 0, 0, 0]))
    placed.push({ body: body.name, mesh: g.mesh, material: g.material, part: partFor(body.name, g.mesh, vec(g.pos, [0, 0, 0])), T: G })
  }
  for (const s of body.site ?? []) sites[s.name] = toThree(compose(T, vec(s.pos, [0, 0, 0]), [1, 0, 0, 0]).p)
  for (const c of body.body ?? []) walk(c, T)
}
walk(mj.worldbody.body[0], { p: [0, 0, 0], q: [1, 0, 0, 0] })

// Bake every placed geom into world space, then group by part and material.
const buckets = new Map()
let minY = Infinity
for (const g of placed) {
  const prim = srcMeshes.get(g.mesh).listPrimitives()[0]
  const P = prim.getAttribute('POSITION').getArray()
  const N = prim.getAttribute('NORMAL')?.getArray()
  const I = prim.getIndices()?.getArray()
  const pos = new Float32Array(P.length)
  const nrm = N ? new Float32Array(N.length) : null
  for (let i = 0; i < P.length; i += 3) {
    const w = toThree(add(g.T.p, rot(g.T.q, [P[i], P[i + 1], P[i + 2]])))
    pos.set(w, i)
    minY = Math.min(minY, w[1])
    if (nrm) nrm.set(toThree(rot(g.T.q, [N[i], N[i + 1], N[i + 2]])), i)
  }
  const key = `${g.part}|${g.material}|${g.mesh.startsWith('seeed') ? 'seeed' : g.mesh === 'xl330' ? 'xl330' : g.mesh}`
  const b = buckets.get(key) ?? { part: g.part, material: g.material, mesh: g.mesh, chunks: [] }
  b.chunks.push({ pos, nrm, idx: I })
  buckets.set(key, b)
}

const doc = new Document()
const buffer = doc.createBuffer()
const materials = new Map()
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
function material(name, mesh) {
  const key = `${name}|${finish(mesh).roughness}`
  if (materials.has(key)) return materials.get(key)
  if (!mats.has(name)) throw new Error(`MJCF has no material ${name}`)
  const [r, g, b, a] = mats.get(name)
  const f = finish(mesh)
  const m = doc.createMaterial(name.replace(/_material$/, '')).setBaseColorFactor([lin(r), lin(g), lin(b), a]).setRoughnessFactor(f.roughness).setMetallicFactor(f.metallic)
  materials.set(key, m)
  return m
}

const parts = new Map()
const root = doc.createNode('microduck')
for (const b of buckets.values()) {
  const count = b.chunks.reduce((s, c) => s + c.pos.length, 0)
  const pos = new Float32Array(count)
  const hasN = b.chunks.every((c) => c.nrm)
  const nrm = hasN ? new Float32Array(count) : null
  const idx = []
  let off = 0
  for (const c of b.chunks) {
    for (let i = 0; i < c.pos.length; i += 3) c.pos[i + 1] -= minY
    pos.set(c.pos, off)
    if (nrm) nrm.set(c.nrm, off)
    const base = off / 3
    if (c.idx) for (const v of c.idx) idx.push(v + base)
    else for (let v = 0; v < c.pos.length / 3; v++) idx.push(v + base)
    off += c.pos.length
  }
  const prim = doc
    .createPrimitive()
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(pos).setBuffer(buffer))
    .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(idx)).setBuffer(buffer))
    .setMaterial(material(b.material, b.mesh))
  if (nrm) prim.setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(nrm).setBuffer(buffer))
  if (!parts.has(b.part)) {
    const mesh = doc.createMesh(b.part)
    const node = doc.createNode(b.part).setMesh(mesh)
    root.addChild(node)
    parts.set(b.part, mesh)
  }
  parts.get(b.part).addPrimitive(prim)
}
doc.createScene('microduck').addChild(root)

let maxY = 0
for (const b of buckets.values()) for (const c of b.chunks) for (let i = 1; i < c.pos.length; i += 3) maxY = Math.max(maxY, c.pos[i])

doc.createExtension(KHRDracoMeshCompression).setRequired(true)
await doc.transform(dedup(), weld(), prune(), draco({ quantizePosition: 14, quantizeNormal: 10 }))
await io.write(OUT, doc)
console.log('height', maxY.toFixed(4), 'parts', [...parts.keys()].sort().join(' '))
console.log('mouth_tip', sites.mouth_tip?.map((v) => v.toFixed(3)), 'head_camera', sites.head_camera?.map((v) => v.toFixed(3)), 'minY', minY.toFixed(4))
console.log('geoms', placed.length, 'xl330', placed.filter((g) => g.mesh === 'xl330').map((g) => g.part).join(','))
