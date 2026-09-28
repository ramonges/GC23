import { PerspectiveCamera, Vector3 } from 'three'
import { DIORAMAS } from '@/lib/vulcan/content'
import { EARTH_R, easeInOut, latLngToVec3, smoothstep, tangentFrame, vec3ToLatLng } from './math'

const DEG = Math.PI / 180

export type CameraKey = {
  s: number
  lat: number
  lng: number
  dist: number
  pitch: number
  heading: number
  /** 0 = orbit the Earth's center, 1 = orbit a point on the surface. */
  target: number
  /** Height of the look-at point above the globe surface when orbiting a surface point. */
  height: number
  shift: number
  /** Follow the ship's current position instead of a fixed lat/lng. */
  track?: 'ship'
}

export type CameraState = Omit<CameraKey, 's' | 'track'>

/** Ship position along the Kamsar → Qingdao lane as a function of the path parameter; the camera keys share it. */
const SHIP_TIMELINE: [number, number][] = [
  [2.37, 0],
  [2.44, 0.01],
  [2.56, 0.3],
  [2.7, 0.64],
  [2.77, 1],
]

export function shipProgress(s: number) {
  if (s <= SHIP_TIMELINE[0][0]) return 0
  for (let i = 0; i < SHIP_TIMELINE.length - 1; i++) {
    const [s0, t0] = SHIP_TIMELINE[i]
    const [s1, t1] = SHIP_TIMELINE[i + 1]
    if (s <= s1) {
      const f = (s - s0) / (s1 - s0)
      const eased = i === 0 ? f * f : i === SHIP_TIMELINE.length - 2 ? 1 - (1 - f) * (1 - f) : f
      return t0 + (t1 - t0) * eased
    }
  }
  return 1
}

/**
 * The path parameter `s` spans 0→3: hero stages on [0,1], the section cover (camera hidden) on [1,2],
 * and the three journey stages on [2,3]. It is derived from the single scroll-progress value.
 */
export function buildCameraKeys(pathAt: (t: number) => { lat: number; lng: number }, mobile: boolean): CameraKey[] {
  const far = mobile ? 1.5 : 1
  const near = mobile ? 1.2 : 1
  const heroShift = mobile ? 0 : 0.17
  const closeShift = mobile ? 0 : 0.12
  const pit = DIORAMAS.pit
  const port = DIORAMAS.port
  const factory = DIORAMAS.factory
  const robot = { lat: factory.lat - 0.069, lng: factory.lng + 0.143 }
  const sea2 = pathAt(0.3)
  const sea3 = pathAt(0.64)
  return [
    { s: 0.0, lat: 8, lng: -8, dist: 560 * far, pitch: 90, heading: 0, target: 0, height: 0, shift: heroShift },
    { s: 0.33, lat: -6, lng: 20, dist: 525 * far, pitch: 90, heading: 0, target: 0, height: 0, shift: heroShift },
    { s: 0.66, lat: 14, lng: 76, dist: 500 * far, pitch: 90, heading: 0, target: 0, height: 0, shift: heroShift },
    { s: 1.0, lat: 28, lng: 114, dist: 470 * far, pitch: 90, heading: 0, target: 0, height: 0, shift: heroShift },
    { s: 1.98, lat: pit.lat, lng: pit.lng, dist: 3.3 * near, pitch: 50, heading: 150, target: 1, height: 0.15, shift: closeShift },
    { s: 2.0, lat: pit.lat, lng: pit.lng, dist: 3.3 * near, pitch: 50, heading: 150, target: 1, height: 0.15, shift: closeShift },
    { s: 2.27, lat: pit.lat, lng: pit.lng, dist: 2.3 * near, pitch: 36, heading: 198, target: 1, height: 0.15, shift: closeShift },
    { s: 2.35, lat: port.lat, lng: port.lng, dist: 1.5 * near, pitch: 34, heading: 150, target: 1, height: 0.15, shift: closeShift },
    { s: 2.4, lat: port.lat, lng: port.lng, dist: 1.1 * near, pitch: 26, heading: 105, target: 1, height: 0.15, shift: closeShift, track: 'ship' },
    { s: 2.47, lat: port.lat, lng: port.lng, dist: 9 * near, pitch: 52, heading: 95, target: 1, height: 0.15, shift: closeShift, track: 'ship' },
    { s: 2.56, lat: sea2.lat, lng: sea2.lng, dist: 170 * far, pitch: 78, heading: 165, target: 1, height: 0.15, shift: closeShift },
    { s: 2.7, lat: sea3.lat, lng: sea3.lng, dist: 200 * far, pitch: 82, heading: 170, target: 1, height: 0.15, shift: closeShift },
    { s: 2.8, lat: factory.lat, lng: factory.lng, dist: 16 * near, pitch: 55, heading: 20, target: 1, height: 0.15, shift: closeShift },
    { s: 2.9, lat: robot.lat, lng: robot.lng, dist: 1.9 * near, pitch: 26, heading: 40, target: 1, height: 0.34, shift: closeShift },
    { s: 3.0, lat: robot.lat, lng: robot.lng, dist: 1.55 * near, pitch: 18, heading: 70, target: 1, height: 0.34, shift: closeShift },
  ]
}

/** Reduced motion holds the camera on one keyframe per stage instead of travelling between them. */
export function holdPath(s: number) {
  if (s < 1) return [0, 0.33, 0.66, 1][Math.min(3, Math.floor(s * 4))]
  if (s < 2) return s < 1.5 ? 1 : 1.98
  const v = s - 2
  if (v < 0.35) return 2.18
  if (v < 0.76) return 2.62
  return 2.95
}

const a = new Vector3()
const b = new Vector3()

export function sampleCamera(keys: CameraKey[], s: number, ship: { lat: number; lng: number }): CameraState {
  let i = 0
  while (i < keys.length - 2 && s > keys[i + 1].s) i++
  const resolve = (k: CameraKey) => (k.track === 'ship' ? { ...k, lat: ship.lat, lng: ship.lng } : k)
  const k0 = resolve(keys[i])
  const k1 = resolve(keys[i + 1])
  const f = easeInOut(Math.min(1, Math.max(0, (s - k0.s) / Math.max(1e-6, k1.s - k0.s))))
  latLngToVec3(k0.lat, k0.lng, 1, a)
  latLngToVec3(k1.lat, k1.lng, 1, b)
  const angle = a.angleTo(b)
  const dir = angle < 1e-5
    ? a.clone()
    : a.clone().multiplyScalar(Math.sin((1 - f) * angle) / Math.sin(angle)).addScaledVector(b, Math.sin(f * angle) / Math.sin(angle))
  const { lat, lng } = vec3ToLatLng(dir)
  let dh = ((k1.heading - k0.heading + 540) % 360) - 180
  return {
    lat,
    lng,
    dist: Math.exp(Math.log(k0.dist) + (Math.log(k1.dist) - Math.log(k0.dist)) * f),
    pitch: k0.pitch + (k1.pitch - k0.pitch) * f,
    heading: k0.heading + dh * f,
    target: k0.target + (k1.target - k0.target) * f,
    height: k0.height + (k1.height - k0.height) * f,
    shift: k0.shift + (k1.shift - k0.shift) * f,
  }
}

const T = new Vector3()
const horiz = new Vector3()
const offsetDir = new Vector3()

export function applyCamera(camera: PerspectiveCamera, st: CameraState, size: { width: number; height: number }, mobile: boolean) {
  const { up, east, north } = tangentFrame(st.lat, st.lng)
  T.copy(up).multiplyScalar((EARTH_R + st.height) * st.target)
  const pitch = st.pitch * DEG
  const heading = st.heading * DEG
  horiz.copy(north).multiplyScalar(Math.cos(heading)).addScaledVector(east, Math.sin(heading))
  offsetDir.copy(up).multiplyScalar(Math.sin(pitch)).addScaledVector(horiz, Math.cos(pitch))
  camera.position.copy(T).addScaledVector(offsetDir, st.dist)
  camera.up.copy(up).lerp(north, smoothstep(70, 89, st.pitch)).normalize()
  camera.lookAt(T)

  const altitude = camera.position.length() - EARTH_R
  camera.near = Math.min(20, Math.max(0.004, altitude * 0.02))
  camera.far = 6000
  if (mobile) camera.setViewOffset(size.width, size.height, 0, size.height * (st.target < 0.5 ? 0.12 : 0.2), size.width, size.height)
  else camera.setViewOffset(size.width, size.height, -size.width * st.shift, 0, size.width, size.height)
  camera.updateProjectionMatrix()
  return altitude
}
