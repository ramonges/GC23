import {
  ACESFilmicToneMapping,
  AmbientLight,
  Color,
  DirectionalLight,
  FogExp2,
  HalfFloatType,
  HemisphereLight,
  Matrix4,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PMREMGenerator,
  REVISION,
  Scene,
  Texture,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { createMaterials } from './core/builder'
import { EARTH_R, GROUND, siteMatrix, smoothstep } from './core/math'
import { buildAtmosphere, buildClouds, buildEarth, buildStars, type Footprint } from './Earth'
import { buildInbound } from './InboundScene'
import { buildManufacturing } from './ManufacturingScene'
import { buildMine } from './MineScene'
import { buildNetwork, type OriginMarker } from './Network'
import { buildPort } from './PortScene'
import { buildRefinery } from './RefineryScene'
import { buildPatch, PatchSampler } from './RegionPatch'
import { buildShip } from './ShipScene'
import { PATCHES, SITES, SUN_DIR } from './sites'
import { buildSmelter } from './SmelterScene'
import { resolveAnchor, type Anchor, type FrameCtx, type StageScene } from './stage'
import { applyCamera, buildCameraKeys, sampleCamera, type CameraKey } from './timeline'
import { buildInland } from './TruckScene'

const GrainShader = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uGrain: { value: 0.028 }, uVignette: { value: 0.75 }, uCenter: { value: new Vector2(0.58, 0.5) } },
  vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uGrain;
    uniform float uVignette;
    uniform vec2 uCenter;
    varying vec2 vUv;
    float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      vec2 d = vUv - uCenter;
      c.rgb *= 1.0 - uVignette * dot(d, d);
      c.rgb += (rand(vUv * 911.0 + fract(uTime * 7.0)) - 0.5) * uGrain;
      gl_FragColor = c;
    }
  `,
}

export type Quality = 'high' | 'medium'
export type ScreenAnchor = { x: number; y: number; visible: boolean }

function loadTexture(loader: TextureLoader, url: string) {
  return new Promise<Texture>((resolve, reject) => loader.load(url, resolve, undefined, reject))
}

export async function createHeroScene(canvas: HTMLCanvasElement, options: { quality: Quality; markers: OriginMarker[]; onProgress?: (p: number) => void }) {
  const high = options.quality === 'high'
  const renderer = new WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', alpha: false })
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = PCFSoftShadowMap
  renderer.info.autoReset = false

  const scene = new Scene()
  const space = new Color('#070808')
  const haze = new Color('#262c2d')
  scene.background = space.clone()
  scene.fog = new FogExp2(haze.clone(), 0)
  const camera = new PerspectiveCamera(30, 1, 0.01, 8000)
  scene.add(camera)

  const pmrem = new PMREMGenerator(renderer)
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  const materials = createMaterials(envMap)

  const sun = new DirectionalLight('#fff1dc', 3.6)
  sun.castShadow = true
  sun.shadow.mapSize.set(high ? 2048 : 1024, high ? 2048 : 1024)
  sun.shadow.bias = -0.0004
  sun.shadow.normalBias = 0.004
  const sc = sun.shadow.camera
  sc.near = 0.05
  sc.far = 20
  scene.add(sun, sun.target)
  scene.add(new HemisphereLight('#c2cbcc', '#3d352a', 0.65))
  scene.add(new AmbientLight('#ffffff', 0.06))

  const loader = new TextureLoader()
  options.onProgress?.(0.1)
  const earthTex = await loadTexture(loader, '/hero/earth-color.webp')
  options.onProgress?.(0.55)

  const footprintOf = (lat: number, lng: number, half: number): Footprint => ({
    inverse: siteMatrix(lat, lng, GROUND).invert(),
    half: new Vector2(half, half),
  })
  const footprints = [footprintOf(SITES.mine.lat, SITES.mine.lng, SITES.mine.half), footprintOf(SITES.port.lat, SITES.port.lng, SITES.port.half)]
  const { earth, uniforms: earthUniforms } = buildEarth(earthTex, footprints, envMap)
  const clouds = buildClouds(SUN_DIR)
  const atmo = buildAtmosphere(SUN_DIR)
  const stars = buildStars(high ? 1600 : 900)
  const network = buildNetwork(options.markers)
  scene.add(stars, earth, atmo.haze, clouds.clouds, atmo.glow, network.group)

  const scenes: StageScene[] = []
  const footprintOwners: StageScene[] = []
  const footprintHalf = footprints.map((f) => f.half.clone())
  const anchors: Record<string, Anchor> = {}
  let keys: CameraKey[] = [
    { t: 0, focus: { center: { lat: 16, lng: -40 } }, dist: 610, pitch: 90, heading: 0, shift: 0.2 },
    { t: 4.2, focus: { center: { lat: 12.5, lng: -22 } }, dist: 520, pitch: 90, heading: 0, shift: 0.19 },
  ]
  let sitesReady = false

  const flatten = [
    { lat: SITES.mine.lat, lng: SITES.mine.lng, r: 1.25 },
    { lat: SITES.port.lat, lng: SITES.port.lng, r: 0.8 },
    { lat: SITES.yard.lat, lng: SITES.yard.lng, r: 0.4 },
    { lat: SITES.refinery.lat, lng: SITES.refinery.lng, r: 1.0 },
    { lat: SITES.smelter.lat, lng: SITES.smelter.lng, r: 1.0 },
    { lat: SITES.factory.lat, lng: SITES.factory.lng, r: 1.0 },
  ]

  async function buildSites() {
    const [guineaTex, gulfTex] = await Promise.all(PATCHES.map((p) => loadTexture(loader, p.texture)))
    options.onProgress?.(0.85)
    const guinea = PatchSampler.fromImage(PATCHES[0], guineaTex.image as HTMLImageElement)
    scene.add(buildPatch(PATCHES[0], guineaTex, footprints, flatten, high ? PATCHES[0].segments : 200, envMap))
    scene.add(buildPatch(PATCHES[1], gulfTex, footprints, flatten, high ? PATCHES[1].segments : 160, envMap))
    await new Promise((r) => setTimeout(r, 0))

    const quality = high ? 'high' : 'low'
    const mine = buildMine(materials, guinea, { quality }) as StageScene & { truckWorld: Vector3[] }
    const port = buildPort(materials, guinea, { quality })
    const inland = buildInland(materials, flatten, port.railEntry, port.quayPoint)
    const ship = buildShip(materials)
    await new Promise((r) => setTimeout(r, 0))
    const refinery = buildRefinery(materials)
    const smelter = buildSmelter(materials)
    const factory = buildManufacturing(materials)
    const inbound = buildInbound(materials, flatten, factory.entry)
    footprintOwners.push(mine, port)
    for (const s of [mine, inland, port, ship, refinery, smelter, inbound, factory]) {
      scenes.push(s)
      scene.add(s.group)
      Object.assign(anchors, s.anchors)
    }
    anchors.destination2 = inbound.anchors.destination
    keys = buildCameraKeys({
      leadTruck: () => resolveAnchor(inland.anchors.leadTruck),
      ship: () => ship.shipPos,
      flatbed: () => inbound.truckPos,
      component: () => factory.heroPos,
      robot: factory.robotWorld,
      inboundMid: inbound.roadMid,
      railMid: resolveAnchor(inland.anchors.railConnection),
      quay: port.quayPoint,
    })
    renderer.compile(scene, camera)
    sitesReady = true
    options.onProgress?.(1)
  }
  const sitesPromise = buildSites()

  const composer = new EffectComposer(renderer, new WebGLRenderTarget(1, 1, { type: HalfFloatType, samples: high ? 4 : 2 }))
  const renderPass = new RenderPass(scene, camera)
  const bloom = new UnrealBloomPass(new Vector2(256, 256), 0.55, 0.42, 1.0)
  const grain = new ShaderPass(GrainShader)
  composer.addPass(renderPass)
  composer.addPass(bloom)
  composer.addPass(new OutputPass())
  composer.addPass(grain)

  const size = { width: 1, height: 1 }
  const mobile = false
  const pixelRatio = Math.min(window.devicePixelRatio || 1, high ? 1.75 : 1.25)
  function resize(width: number, height: number) {
    size.width = Math.max(1, Math.round(width))
    size.height = Math.max(1, Math.round(height))
    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(size.width, size.height, false)
    composer.setPixelRatio(pixelRatio)
    composer.setSize(size.width, size.height)
    camera.aspect = size.width / size.height
    network.material.uniforms.uPixelRatio.value = pixelRatio
  }

  const ctx: FrameCtx = { t: 0, time: 0, dt: 0, motion: true, camera }
  let lastStats = { drawCalls: 0, triangles: 0 }
  const shadowFocus = new Vector3()

  function render(t: number, time: number, dt: number, motion: boolean) {
    ctx.t = t
    ctx.time = time
    ctx.dt = dt
    ctx.motion = motion
    for (const s of scenes) s.update(ctx)

    const cam = sampleCamera(keys, t)
    const { altitude, target } = applyCamera(camera, cam, size, mobile)
    for (const s of scenes) {
      if (s.range < 1e8) s.group.visible = s.center.distanceTo(camera.position) < s.range
    }
    footprints.forEach((f, i) => {
      const owner = footprintOwners[i]
      if (owner?.group.visible) f.half.copy(footprintHalf[i])
      else f.half.set(0, 0)
    })

    const low = 1 - smoothstep(4, 40, altitude)
    scene.background = (scene.background as Color).copy(space).lerp(haze, low * 0.85)
    ;(scene.fog as FogExp2).density = low * 0.16
    clouds.material.uniforms.uTime.value = time
    clouds.material.uniforms.uOpacity.value = smoothstep(22, 80, altitude)
    const atmoFade = smoothstep(6, 40, altitude)
    atmo.glowMat.uniforms.uFade.value = atmoFade
    atmo.hazeMat.uniforms.uFade.value = atmoFade
    earthUniforms.uGrid.value = smoothstep(30, 140, altitude)
    network.update(t, time, altitude, motion)

    shadowFocus.copy(target.lengthSq() > 1 ? target : camera.position.clone().setLength(EARTH_R))
    sun.target.position.copy(shadowFocus)
    sun.position.copy(shadowFocus).addScaledVector(SUN_DIR, 8)
    const extent = Math.min(2.2, Math.max(0.35, cam.dist * 0.9))
    sc.left = -extent
    sc.right = extent
    sc.top = extent
    sc.bottom = -extent
    sc.updateProjectionMatrix()
    sun.shadow.needsUpdate = true
    renderer.shadowMap.enabled = altitude < 12

    grain.uniforms.uTime.value = time
    renderer.info.reset()
    composer.render(dt)
    lastStats = { drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles }
  }

  const ndc = new Vector3()
  const toPoint = new Vector3()
  function project(ids: string[]) {
    const out: Record<string, ScreenAnchor> = {}
    for (const id of ids) {
      const a = anchors[id]
      if (!a) {
        out[id] = { x: 0, y: 0, visible: false }
        continue
      }
      const p = resolveAnchor(a)
      ndc.copy(p).project(camera)
      toPoint.copy(p).sub(camera.position)
      const len = toPoint.length()
      toPoint.divideScalar(len)
      const b = camera.position.dot(toPoint)
      const disc = b * b - (camera.position.lengthSq() - EARTH_R * EARTH_R)
      const hit = disc > 0 ? -b - Math.sqrt(disc) : Infinity
      const occluded = hit > 0 && hit < len - 0.05
      out[id] = {
        x: (ndc.x * 0.5 + 0.5) * size.width,
        y: (-ndc.y * 0.5 + 0.5) * size.height,
        visible: ndc.z < 1 && !occluded && Math.abs(ndc.x) < 0.98 && Math.abs(ndc.y) < 0.95,
      }
    }
    return out
  }

  function dispose() {
    composer.dispose()
    pmrem.dispose()
    renderer.dispose()
    scene.traverse((o) => {
      const mesh = o as unknown as { geometry?: { dispose(): void }; material?: { dispose(): void } }
      mesh.geometry?.dispose()
      mesh.material?.dispose()
    })
  }

  return {
    render,
    resize,
    project,
    dispose,
    sitesPromise,
    isReady: () => sitesReady,
    stats: () => ({ ...lastStats, engine: `three.js r${REVISION}`, camera: camera.position.toArray().map((v) => v.toFixed(2)).join(',') }),
    matrix: new Matrix4(),
  }
}

export type HeroScene = Awaited<ReturnType<typeof createHeroScene>>
