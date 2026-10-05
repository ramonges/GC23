/**
 * Builds public/models/robots/reachy_mini.glb from Pollen's official MJCF (pollen-robotics/reachy_mini,
 * src/reachy_mini/descriptions/reachy_mini/mjcf). See components/robots/README.md for usage.
 */
import fs from 'node:fs'
import path from 'node:path'
import { Document, NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS, KHRDracoMeshCompression } from '@gltf-transform/extensions'
import { draco, prune, dedup, weld } from '@gltf-transform/functions'
import draco3d from 'draco3dgltf'
import { XMLParser } from 'fast-xml-parser'
import { MeshoptSimplifier, compose, creaseNormals, readStl, rot, add, srgbToLinear as lin, vec, weldAndSimplify } from './mesh-utils.mjs'

const MJCF = process.argv[2]
const OUT = process.argv[3]

const xml = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '', isArray: (n, _p, _leaf, isAttr) => !isAttr && ['body', 'geom', 'joint', 'mesh', 'material'].includes(n) }).parse(fs.readFileSync(MJCF, 'utf8'))
const mj = xml.mujoco
const meshdir = path.join(path.dirname(MJCF), [mj.compiler].flat()[0]?.meshdir ?? '')
const meshFiles = new Map([mj.asset].flat().flatMap((a) => a.mesh ?? []).map((m) => [m.name ?? path.basename(m.file, '.stl'), path.join(meshdir, m.file)]))
const mats = new Map([mj.asset].flat().flatMap((a) => a.material ?? []).map((m) => [m.name, vec(m.rgba, [0.8, 0.8, 0.8, 1])]))

// Screws are invisible at explorer scale; everything else is kept.
const SKIP = /^(phs_|bts2_)/
const SERVO = /^(dc15_a01_|b3b_eh)/
const SENSORS = new Set(['arducam', 'pp01102_arducam_carter', 'm12_fisheye_lens_1_8mm', 'big_lens_d40', 'small_lens_d30'])
const BUDGET = { stewart_link_rod: 2500, antenna: 4000, arducam: 3000, bearing_85x110x13: 3000, dc15_a01_horn_dummy: 1500, dc15_a01_case_f_dummy: 1800, dc15_a01_case_b_dummy: 1500, dc15_a01_case_m_dummy: 1000 }
const DEFAULT_BUDGET = 9000

// Zero pose is the CAD assembly pose, which closes the Stewart platform's loops.
const placed = []
const bodies = {}
function walk(body, parent) {
  const T = compose(parent, vec(body.pos, [0, 0, 0]), vec(body.quat, [1, 0, 0, 0]))
  if (body.name) bodies[body.name] = T
  for (const g of body.geom ?? []) {
    if (g.class !== 'visual' || !g.mesh) continue
    placed.push({ body: body.name, mesh: g.mesh, material: g.material, T: compose(T, vec(g.pos, [0, 0, 0]), vec(g.quat, [1, 0, 0, 0])) })
  }
  for (const c of body.body ?? []) walk(c, T)
}
walk([mj.worldbody].flat().flatMap((w) => w.body ?? []).find((b) => b.name === 'body_foot_3dprint'), { p: [0, 0, 0], q: [1, 0, 0, 0] })

const STEWART = ['', '_2', '_3', '_4', '_5', '_6'].map((s, i) => ({ body: `dc15_a01_horn_dummy${s}`, rod: `stewart_link_rod${s}`, part: `actuator_head_${i + 1}` }))
const yawHorn = placed.find((g) => g.body === 'body_foot_3dprint' && g.mesh === 'dc15_a01_horn_dummy')
const nearest = (p, anchors) => anchors.reduce((best, a) => (Math.hypot(...a.p.map((v, i) => v - p[i])) < Math.hypot(...best.p.map((v, i) => v - p[i])) ? a : best))
const bodyServos = [...STEWART.map((s) => ({ p: bodies[s.body].p, part: s.part })), { p: yawHorn.T.p, part: 'actuator_body' }]
const antennaServos = [
  { p: bodies.dc15_a01_horn_dummy_7.p, part: 'actuator_antenna_R' },
  { p: bodies.dc15_a01_horn_dummy_8.p, part: 'actuator_antenna_L' },
]

function partFor(g) {
  const stewart = STEWART.find((s) => s.body === g.body || s.rod === g.body)
  if (stewart) return stewart.part
  switch (g.body) {
    case 'body_foot_3dprint':
      return g.mesh === 'dc15_a01_horn_dummy' ? 'actuator_body' : 'base_shell'
    case 'body_down_3dprint':
      if (SERVO.test(g.mesh)) return nearest(g.T.p, bodyServos).part
      return g.mesh === '5w_speaker' ? 'speaker' : 'base_shell'
    case 'xl_330':
      if (SERVO.test(g.mesh)) return nearest(g.T.p, antennaServos).part
      return SENSORS.has(g.mesh) ? 'head_sensors' : 'head_shell'
    case 'dc15_a01_horn_dummy_7':
      return g.mesh === 'dc15_a01_horn_dummy' ? 'actuator_antenna_R' : 'antenna_R'
    case 'dc15_a01_horn_dummy_8':
      return g.mesh === 'dc15_a01_horn_dummy' ? 'actuator_antenna_L' : 'antenna_L'
  }
  throw new Error(`unmapped ${g.body}/${g.mesh}`)
}

// MuJoCo is Z-up with the robot facing +X and its left on +Y; the explorer is Y-up, facing +Z, left on +X.
const toThree = ([x, y, z]) => [y, z, x]

const FINISH = (mesh, rgba) => {
  // The CAD's antennas are pure black, which disappears against the explorer's dark room.
  if (mesh === 'antenna') return { key: 'antenna', color: [0.09, 0.095, 0.1], roughness: 0.35, metallic: 0.3 }
  if (rgba[3] < 0.9) return { key: 'glass', color: [0.05, 0.06, 0.07], roughness: 0.05, metallic: 0.4 }
  if (mesh === 'stewart_link_rod' || mesh.startsWith('stewart_link_ball') || mesh.startsWith('bearing')) return { key: `metal_${rgba.slice(0, 3).join()}`, color: rgba.slice(0, 3), roughness: 0.3, metallic: 0.85 }
  if (mesh.endsWith('_3dprint')) return { key: `print_${rgba.slice(0, 3).join()}`, color: rgba.slice(0, 3), roughness: 0.62, metallic: 0 }
  return { key: `plastic_${rgba.slice(0, 3).join()}`, color: rgba.slice(0, 3), roughness: 0.45, metallic: 0.05 }
}

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'draco3d.encoder': await draco3d.createEncoderModule(),
})
await MeshoptSimplifier.ready
const doc = new Document()
const buffer = doc.createBuffer()
const materials = {}
function material(mesh, name) {
  const f = FINISH(mesh, mats.get(name) ?? [0.8, 0.8, 0.8, 1])
  materials[f.key] ??= doc.createMaterial(f.key).setBaseColorFactor([...f.color.map(lin), 1]).setRoughnessFactor(f.roughness).setMetallicFactor(f.metallic)
  return materials[f.key]
}

const stlCache = new Map()
const built = []
for (const g of placed) {
  if (SKIP.test(g.mesh)) continue
  if (!stlCache.has(g.mesh)) stlCache.set(g.mesh, readStl(meshFiles.get(g.mesh)))
  const soup = stlCache.get(g.mesh)
  const world = new Float32Array(soup.length)
  for (let i = 0; i < soup.length; i += 3) world.set(toThree(add(g.T.p, rot(g.T.q, [soup[i], soup[i + 1], soup[i + 2]]))), i)
  built.push({ ...g, part: partFor(g), tris: soup.length / 9, ...creaseNormals(weldAndSimplify(world, BUDGET[g.mesh] ?? DEFAULT_BUDGET, 0.001)) })
}
let minY = Infinity
for (const g of built) for (let i = 1; i < g.pos.length; i += 3) minY = Math.min(minY, g.pos[i])

const root = doc.createNode('reachy_mini')
const parts = new Map()
let maxY = 0
let tris = 0
const centroid = {}
for (const g of built) {
  for (let i = 1; i < g.pos.length; i += 3) {
    g.pos[i] -= minY
    maxY = Math.max(maxY, g.pos[i])
  }
  tris += g.pos.length / 9
  const c = (centroid[g.part] ??= [0, 0, 0, 0])
  for (let i = 0; i < g.pos.length; i += 3) c.splice(0, 4, c[0] + g.pos[i], c[1] + g.pos[i + 1], c[2] + g.pos[i + 2], c[3] + 1)
  const prim = doc
    .createPrimitive()
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(g.pos).setBuffer(buffer))
    .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(g.nrm).setBuffer(buffer))
    .setMaterial(material(g.mesh, g.material))
  if (!parts.has(g.part)) {
    const mesh = doc.createMesh(g.part)
    root.addChild(doc.createNode(g.part).setMesh(mesh))
    parts.set(g.part, mesh)
  }
  parts.get(g.part).addPrimitive(prim)
}
doc.createScene('reachy_mini').addChild(root)

doc.createExtension(KHRDracoMeshCompression).setRequired(true)
await doc.transform(dedup(), weld(), prune(), draco({ quantizePosition: 14, quantizeNormal: 10 }))
await io.write(OUT, doc)
console.log('height', maxY.toFixed(4), 'triangles', tris, 'of', built.reduce((s, g) => s + g.tris, 0))
for (const [part, [x, y, z, n]] of Object.entries(centroid)) console.log(part.padEnd(20), [x / n, y / n, z / n].map((v) => v.toFixed(3)).join(' '))
