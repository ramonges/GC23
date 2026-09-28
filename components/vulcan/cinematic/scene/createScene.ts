import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  REVISION,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three'
import { MARITIME_ROUTE_INDEX, NODE_BY_ID } from '@/lib/vulcan/content'
import { sampleRoute } from '@/lib/vulcan/geo'
import { buildArcs, routePoints } from './arcs'
import { applyCamera, buildCameraKeys, holdPath, sampleCamera, shipProgress } from './camera'
import { LIFT, buildDioramas } from './dioramas'
import { buildAtmosphere, buildEarth } from './earth'
import { buildEntities } from './entities'
import { buildBeams, buildMarkers } from './markers'
import { EARTH_R, latLngToVec3, smoothstep, tangentFrame } from './math'
import { buildComposer } from './post'

export type CinematicFrame = {
  /** Path parameter derived from scroll progress: hero [0,1], cover [1,2], journey [2,3]. */
  s: number
  reducedMotion: boolean
}

export type AnchorId = 'excavation' | 'stockpile' | 'nextNode' | 'origin' | 'destination' | 'mode'
export type AnchorScreen = { x: number; y: number; visible: boolean }

export type SceneStats = {
  engine: string
  drawCalls: number
  drawCallsTotal: number
  triangles: number
  camera: string
  terrainResolution: number
  earthDetail: number
  markers: number
  entities: string
}

function buildStars(count: number) {
  const pos = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)
  const v = new Vector3()
  const c = new Color()
  let seed = 11
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  for (let i = 0; i < count; i++) {
    v.set(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).normalize().multiplyScalar(2200 + rand() * 1200)
    pos.set([v.x, v.y, v.z], i * 3)
    const warm = rand()
    c.setRGB(0.55 + warm * 0.25, 0.55 + warm * 0.12, 0.62 - warm * 0.1).multiplyScalar(0.35 + rand() * 0.65)
    col.set([c.r, c.g, c.b], i * 3)
  }
  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(pos, 3))
  geo.setAttribute('color', new BufferAttribute(col, 3))
  const stars = new Points(geo, new PointsMaterial({ size: 1.4, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.8, depthWrite: false }))
  stars.name = 'stars'
  stars.frustumCulled = false
  return stars
}

export async function createCinematicScene(canvas: HTMLCanvasElement, options: { mobile: boolean }) {
  const { mobile } = options
  const renderer = new WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance', alpha: false })
  renderer.info.autoReset = false
  renderer.setClearColor(0x000000, 1)
  renderer.toneMappingExposure = 1.05

  const scene = new Scene()
  scene.background = new Color('#0b0b0d')
  const camera = new PerspectiveCamera(mobile ? 42 : 32, 1, 0.01, 6000)
  scene.add(camera)

  const earthDetail = mobile ? 26 : 44
  const earth = await buildEarth(earthDetail)
  const { glow, haze } = buildAtmosphere()
  const stars = buildStars(mobile ? 700 : 1800)
  const markers = buildMarkers({ mobile })
  const beams = buildBeams()
  const arcs = buildArcs()
  const dioramas = buildDioramas({ mobile })
  const entities = buildEntities(dioramas.frames)
  scene.add(stars, earth, haze, glow, dioramas.mesh, entities.mesh, arcs.lines, beams.lines, markers.points)

  scene.add(new AmbientLight('#b9b2a8', 0.42))
  const sun = new DirectionalLight('#fff1e0', 3.2)
  sun.position.set(-0.7, 0.6, 0.45).multiplyScalar(10)
  camera.add(sun)

  const maritime = sampleRoute(routePoints(MARITIME_ROUTE_INDEX), 600).points
  const pathAt = (t: number) => {
    const f = Math.min(1, Math.max(0, t)) * (maritime.length - 1)
    const i = Math.min(maritime.length - 2, Math.floor(f))
    const a = maritime[i]
    const b = maritime[i + 1]
    const k = f - i
    return { lat: a.lat + (b.lat - a.lat) * k, lng: a.lng + (b.lng - a.lng) * k, next: b }
  }
  const keys = buildCameraKeys(pathAt, mobile)
  const post = buildComposer(renderer, scene, camera, { mobile })

  const size = { width: 1, height: 1 }
  const pixelRatio = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2)
  markers.material.uniforms.uPixelRatio.value = pixelRatio
  function resize(width: number, height: number) {
    size.width = Math.max(1, width)
    size.height = Math.max(1, height)
    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(size.width, size.height, false)
    camera.aspect = size.width / size.height
    post.setSize(size.width, size.height, pixelRatio)
  }

  const qingdao = NODE_BY_ID.qingdao
  const anchorWorld: Record<AnchorId, Vector3> = {
    excavation: dioramas.anchors.excavation,
    stockpile: dioramas.anchors.stockpile,
    nextNode: dioramas.anchors.nextNode,
    origin: dioramas.anchors.origin,
    destination: latLngToVec3(qingdao.lat, qingdao.lng, EARTH_R + 0.6),
    mode: new Vector3(),
  }
  markers.setWorld('furnace', dioramas.anchors.furnace)

  const shipState = { lat: 0, lng: 0, heading: 0, altitude: LIFT }
  const shipWorld = new Vector3()
  const tmp = new Vector3()
  let lastTime = 0

  function updateShip(t: number) {
    const p = pathAt(t)
    shipState.lat = p.lat
    shipState.lng = p.lng
    shipState.altitude = LIFT - 0.008 + (0.014 - LIFT + 0.008) * smoothstep(0.0015, 0.008, t)
    const { east, south } = tangentFrame(p.lat, p.lng)
    const here = latLngToVec3(p.lat, p.lng, EARTH_R, tmp.clone())
    const ahead = latLngToVec3(p.next.lat, p.next.lng, EARTH_R, new Vector3()).sub(here)
    shipState.heading = Math.atan2(-ahead.dot(south), ahead.dot(east))
    latLngToVec3(p.lat, p.lng, EARTH_R + shipState.altitude + 0.04, shipWorld)
    anchorWorld.mode.copy(shipWorld)
    markers.setWorld('ship', shipWorld)
  }

  let lastStats: SceneStats | null = null

  function render(frame: CinematicFrame, timeSec: number) {
    const dt = Math.min(0.1, Math.max(0, timeSec - lastTime))
    lastTime = timeSec
    const motion = !frame.reducedMotion
    const s = frame.reducedMotion ? holdPath(frame.s) : frame.s
    const heroU = Math.min(1, s)
    const time = motion ? timeSec : 0

    const shipT = shipProgress(s)
    const maritimeMode = smoothstep(2.33, 2.37, s) * (1 - smoothstep(2.76, 2.8, s))
    updateShip(shipT)

    const cam = sampleCamera(keys, s, shipState)
    const altitude = applyCamera(camera, cam, size, mobile)
    const atmosphereFade = smoothstep(12, 60, altitude)
    glow.material.uniforms.uFade.value = atmosphereFade
    haze.material.uniforms.uFade.value = atmosphereFade

    const inJourney = s >= 1.9
    for (const e of markers.entities) {
      if (e.kind === 2) e.active = heroU >= 0.5 || inJourney
      if (e.kind === 3) e.active = heroU >= 0.75 || inJourney
    }
    markers.byId.ship.visible = s > 2.36 && s < 2.8
    markers.byId.sensor.visible = s > 2.78
    markers.byId.furnace.visible = s > 2.76
    markers.sync(dt, !motion)

    entities.byId['truck-1'].visible = s > 1.9 && s < 2.4
    entities.byId['truck-2'].visible = s > 1.9 && s < 2.4
    entities.byId.ship.visible = s > 2.3 && s < 2.62
    entities.byId['robot-arm'].visible = s > 2.74
    for (const e of entities.entities) e.active = motion
    entities.update(timeSec, shipState)
    markers.setWorld('sensor', entities.sensorWorld)

    const nearSite = dioramas.sites.some((p) => p.distanceTo(camera.position) < 90)
    dioramas.mesh.visible = nearSite
    entities.mesh.visible = nearSite

    markers.material.uniforms.uTime.value = time
    markers.material.uniforms.uMotion.value = motion ? 1 : 0
    arcs.material.uniforms.uTime.value = time
    arcs.material.uniforms.uMotion.value = motion ? 1 : 0
    arcs.material.uniforms.uHeroU.value = heroU
    arcs.material.uniforms.uMaritimeMode.value = maritimeMode
    arcs.material.uniforms.uMaritimeT.value = shipT
    beams.material.uniforms.uStrength.value = inJourney ? 0.5 : 1
    post.grain.uniforms.uTime.value = time
    post.grain.uniforms.uGrain.value = altitude < 30 ? 0.035 : 0.045

    renderer.info.reset()
    post.composer.render(dt)

    lastStats = {
      engine: `three.js r${REVISION}`,
      drawCalls: post.renderPass.calls,
      drawCallsTotal: renderer.info.render.calls,
      triangles: post.renderPass.triangles,
      camera: `${camera.position.x.toFixed(1)},${camera.position.y.toFixed(1)},${camera.position.z.toFixed(1)}`,
      terrainResolution: dioramas.resolution,
      earthDetail,
      markers: markers.entities.length,
      entities: entities.entities.map((e) => `${e.id}:${e.visible ? 'visible' : 'hidden'}:${e.loaded ? 'loaded' : 'pending'}`).join(' '),
    }
  }

  const ndc = new Vector3()
  const toPoint = new Vector3()
  function projectAnchors(): Record<AnchorId, AnchorScreen> {
    const out = {} as Record<AnchorId, AnchorScreen>
    const camPos = camera.position
    for (const id of Object.keys(anchorWorld) as AnchorId[]) {
      const p = anchorWorld[id]
      ndc.copy(p).project(camera)
      toPoint.copy(p).sub(camPos)
      const len = toPoint.length()
      toPoint.divideScalar(len)
      const b = camPos.dot(toPoint)
      const c = camPos.lengthSq() - EARTH_R * EARTH_R
      const disc = b * b - c
      const hit = disc > 0 ? -b - Math.sqrt(disc) : Infinity
      const occluded = hit > 0 && hit < len - 0.08
      out[id] = {
        x: (ndc.x * 0.5 + 0.5) * size.width,
        y: (-ndc.y * 0.5 + 0.5) * size.height,
        visible: ndc.z < 1 && !occluded && Math.abs(ndc.x) < 1.05 && Math.abs(ndc.y) < 1.05,
      }
    }
    return out
  }

  function dispose() {
    post.composer.dispose()
    renderer.dispose()
    scene.traverse((obj) => {
      const mesh = obj as unknown as { geometry?: { dispose: () => void }; material?: { dispose: () => void } }
      mesh.geometry?.dispose()
      mesh.material?.dispose()
    })
  }

  return { render, resize, projectAnchors, dispose, stats: () => lastStats }
}

export type CinematicScene = Awaited<ReturnType<typeof createCinematicScene>>
