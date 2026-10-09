import { Box3, CylinderGeometry, Group, Matrix4, Mesh, MeshStandardMaterial, Object3D, Texture, Vector3 } from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { HERO_LINEUP, LINEUP_AT } from '@/lib/vulcan/hero'
import { easeInOut, smoothstep, tangentFrame, vec3ToLatLng } from './core/math'
import type { FrameCtx, StageScene } from './stage'

/** Scene units per metre: Optimus stands about 0.15 tall, next to the 0.1-tall robot built in the factory. */
const SCALE = 0.085
const SPACING = 0.13
/** The row stands on the factory slab, past the hall's open end, facing the camera along local +x. */
export const LINEUP_X = 0.585
const SLAB_Y = 0.003
const STAGGER = 0.22

type Slot = { holder: Object3D; model: Group; pedestal: Mesh; top: number; loaded: boolean }

/** The six robots from /robots, built from the same GLBs and loaded only once the globe is ready. */
export function buildLineup(frame: Matrix4, envMap: Texture) {
  const group = new Group()
  group.name = 'lineup'
  // ThreeScene drives `group.visible` by camera distance, so timing visibility lives one level down.
  const row = new Group()
  row.visible = false
  group.add(row)

  const plinthMat = new MeshStandardMaterial({ color: '#17191b', roughness: 0.55, metalness: 0.2, envMap, envMapIntensity: 0.6 })
  const count = HERO_LINEUP.length
  const slots: Slot[] = HERO_LINEUP.map((_, i) => {
    const holder = new Object3D()
    holder.visible = false
    holder.matrixAutoUpdate = false
    const z = ((count - 1) / 2 - i) * SPACING
    holder.matrix.copy(frame).multiply(new Matrix4().makeTranslation(LINEUP_X, SLAB_Y, z)).multiply(new Matrix4().makeRotationY(Math.PI / 2))
    const pedestal = new Mesh(new CylinderGeometry(1, 1, 1, 48), plinthMat)
    pedestal.castShadow = pedestal.receiveShadow = true
    const model = new Group()
    holder.add(pedestal, model)
    row.add(holder)
    return { holder, model, pedestal, top: 0, loaded: false }
  })

  let started = false
  function load() {
    if (started) return
    started = true
    const draco = new DRACOLoader().setDecoderPath('/draco/')
    const loader = new GLTFLoader().setDRACOLoader(draco)
    HERO_LINEUP.forEach((robot, i) => {
      loader.loadAsync(robot.model).then((gltf) => {
        const root = gltf.scene
        root.traverse((o) => {
          const mesh = o as Mesh
          if (!mesh.isMesh) return
          mesh.castShadow = mesh.receiveShadow = true
          for (const mat of [mesh.material].flat() as MeshStandardMaterial[]) {
            mat.envMap = envMap
            // The factory's bright room reflection blooms on polished metal (Reachy 2's frame).
            mat.envMapIntensity = mat.metalness > 0.5 ? 0.3 : 0.7
            // Under the hero's sun and bloom, near-white shells (Reachy 2) glow; cap them at a light grey.
            const peak = Math.max(mat.color.r, mat.color.g, mat.color.b)
            if (peak > 0.6) mat.color.multiplyScalar(0.6 / peak)
          }
        })
        const size = new Box3().setFromObject(root).getSize(new Vector3())
        const slot = slots[i]
        // Desk-sized robots stand on a tall pedestal, as in the /robots showroom.
        const height = size.y < 0.5 ? 0.6 : 0.05
        const radius = Math.max(size.x, size.z) / 2 + 0.08
        slot.pedestal.scale.set(radius * SCALE, height * SCALE, radius * SCALE)
        slot.pedestal.position.y = (height * SCALE) / 2
        slot.top = height * SCALE
        root.scale.setScalar(SCALE)
        slot.model.add(root)
        slot.loaded = true
      }, (err) => console.warn('[hero] lineup model failed', robot.model, err))
    })
  }

  function update(ctx: FrameCtx) {
    row.visible = ctx.t > LINEUP_AT - 0.2
    if (!row.visible) return
    slots.forEach((s, i) => {
      const a = easeInOut(smoothstep(LINEUP_AT + i * STAGGER, LINEUP_AT + 0.7 + i * STAGGER, ctx.t))
      s.holder.visible = s.loaded && a > 0.001
      if (!s.holder.visible) return
      s.model.position.y = s.top
      s.model.scale.setScalar(Math.max(1e-4, a))
      const sway = ctx.motion ? Math.sin(ctx.time * 0.4 + i) * 0.12 : 0
      s.model.rotation.y = (1 - a) * -1.2 + sway * a
      s.holder.matrixWorldNeedsUpdate = true
    })
  }

  const centerLocal = new Vector3(LINEUP_X, 0.06, 0)
  const focus = centerLocal.clone().applyMatrix4(frame)
  const { east, north } = tangentFrame(vec3ToLatLng(focus).lat, vec3ToLatLng(focus).lng)
  const facing = new Vector3(1, 0, 0).transformDirection(frame)
  /** Camera heading (degrees from north) that looks straight down the robots' facing direction. */
  const heading = (Math.atan2(facing.dot(east), facing.dot(north)) * 180) / Math.PI
  return {
    name: 'lineup',
    group,
    center: centerLocal.clone().applyMatrix4(frame),
    range: 60,
    anchors: {},
    update,
    load,
    focus,
    heading,
  } as StageScene & { load: () => void; focus: Vector3; heading: number }
}
