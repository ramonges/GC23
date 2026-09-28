import { PerspectiveCamera, Vector3 } from 'three'
import { EARTH_R, monotoneCubic, smoothstep, tangentFrame, vec3ToLatLng } from './core/math'
import { SITES, type LatLng } from './sites'

const DEG = Math.PI / 180

export type Focus = { center: LatLng } | { site: LatLng; height?: number } | { point: () => Vector3 }

export type CameraKey = { t: number; focus: Focus; dist: number; pitch: number; heading: number; shift?: number }

type Channels = { lat: number; lng: number; target: number; height: number; dist: number; pitch: number; heading: number; shift: number }

export function buildCameraKeys(p: {
  leadTruck: () => Vector3
  ship: () => Vector3
  flatbed: () => Vector3
  component: () => Vector3
  robot: Vector3
  inboundMid: Vector3
  railMid: Vector3
  quay: Vector3
}): CameraKey[] {
  const mine = SITES.mine
  const port = SITES.port
  const ref = SITES.refinery
  const sm = SITES.smelter
  const fac = SITES.factory
  const S = 0.16
  const C = 0.13
  return [
    { t: 0, focus: { center: { lat: 16, lng: -40 } }, dist: 610, pitch: 90, heading: 0, shift: 0.2 },
    { t: 4.2, focus: { center: { lat: 12.5, lng: -22 } }, dist: 520, pitch: 90, heading: 0, shift: 0.19 },
    { t: 5.6, focus: { center: { lat: 11.4, lng: -15.5 } }, dist: 300, pitch: 90, heading: 0, shift: 0.14 },
    { t: 6.7, focus: { site: mine, height: 0 }, dist: 48, pitch: 84, heading: 180, shift: 0.1 },
    { t: 7.6, focus: { site: mine, height: 0 }, dist: 9, pitch: 70, heading: 172, shift: C },
    { t: 8.4, focus: { site: mine, height: 0 }, dist: 3.2, pitch: 55, heading: 160, shift: C },
    { t: 10.3, focus: { site: mine, height: -0.03 }, dist: 2.3, pitch: 40, heading: 130, shift: C },
    { t: 12.1, focus: { site: { lat: mine.lat - 0.1, lng: mine.lng - 0.12 }, height: 0 }, dist: 2.0, pitch: 38, heading: 235, shift: C },
    { t: 13.3, focus: { point: p.leadTruck }, dist: 0.85, pitch: 55, heading: 75, shift: C },
    { t: 14.9, focus: { point: p.leadTruck }, dist: 0.8, pitch: 32, heading: 235, shift: C },
    { t: 15.9, focus: { point: () => p.railMid }, dist: 1.25, pitch: 44, heading: 205, shift: C },
    { t: 16.9, focus: { site: port }, dist: 1.45, pitch: 40, heading: 118, shift: C },
    { t: 18.3, focus: { point: () => p.quay }, dist: 0.8, pitch: 28, heading: 150, shift: C },
    { t: 19.4, focus: { point: p.ship }, dist: 1.1, pitch: 30, heading: 55, shift: C },
    { t: 20.3, focus: { point: p.ship }, dist: 22, pitch: 66, heading: 40, shift: C },
    { t: 21.3, focus: { point: p.ship }, dist: 185, pitch: 88, heading: 0, shift: S },
    { t: 22.4, focus: { point: p.ship }, dist: 160, pitch: 86, heading: 0, shift: S },
    { t: 23.2, focus: { site: { lat: 29.6, lng: -90.2 } }, dist: 26, pitch: 72, heading: 200, shift: C },
    { t: 24.1, focus: { site: ref }, dist: 2.5, pitch: 46, heading: 210, shift: C },
    { t: 26.8, focus: { site: ref }, dist: 1.8, pitch: 33, heading: 262, shift: C },
    { t: 27.9, focus: { site: sm }, dist: 2.0, pitch: 40, heading: 200, shift: C },
    { t: 29.7, focus: { site: sm }, dist: 1.4, pitch: 30, heading: 150, shift: C },
    { t: 30.6, focus: { point: p.flatbed }, dist: 0.8, pitch: 40, heading: 225, shift: C },
    { t: 31.5, focus: { point: () => p.inboundMid }, dist: 3.4, pitch: 70, heading: 210, shift: C },
    { t: 32.4, focus: { site: fac }, dist: 1.7, pitch: 50, heading: 200, shift: C },
    { t: 33.4, focus: { site: fac, height: 0.02 }, dist: 0.8, pitch: 34, heading: 196, shift: C },
    { t: 34.8, focus: { point: p.component }, dist: 0.42, pitch: 24, heading: 180, shift: 0.1 },
    { t: 35.8, focus: { point: () => p.robot }, dist: 0.36, pitch: 16, heading: 160, shift: 0.1 },
    { t: 37.0, focus: { point: () => p.robot }, dist: 0.42, pitch: 14, heading: 132, shift: 0.12 },
    { t: 38.5, focus: { point: () => p.robot }, dist: 0.7, pitch: 15, heading: 108, shift: 0.16 },
  ]
}

function channels(k: CameraKey): Channels {
  const f = k.focus
  if ('center' in f) return { lat: f.center.lat, lng: f.center.lng, target: 0, height: 0, dist: Math.log(k.dist), pitch: k.pitch, heading: k.heading, shift: k.shift ?? 0.13 }
  if ('site' in f) return { lat: f.site.lat, lng: f.site.lng, target: 1, height: 0.02 + (f.height ?? 0), dist: Math.log(k.dist), pitch: k.pitch, heading: k.heading, shift: k.shift ?? 0.13 }
  const p = f.point()
  const ll = vec3ToLatLng(p)
  return { lat: ll.lat, lng: ll.lng, target: 1, height: p.length() - EARTH_R, dist: Math.log(k.dist), pitch: k.pitch, heading: k.heading, shift: k.shift ?? 0.13 }
}

const NAMES: (keyof Channels)[] = ['lat', 'lng', 'target', 'height', 'dist', 'pitch', 'heading', 'shift']

export function sampleCamera(keys: CameraKey[], t: number): Channels {
  const times = keys.map((k) => k.t)
  const ch = keys.map(channels)
  for (let i = 1; i < ch.length; i++) {
    ch[i].lng = ch[i - 1].lng + ((((ch[i].lng - ch[i - 1].lng) % 360) + 540) % 360) - 180
    ch[i].heading = ch[i - 1].heading + ((((ch[i].heading - ch[i - 1].heading) % 360) + 540) % 360) - 180
  }
  const out = {} as Channels
  for (const n of NAMES) out[n] = monotoneCubic(times, ch.map((c) => c[n]), t)
  out.dist = Math.exp(out.dist)
  return out
}

const T = new Vector3()
const horiz = new Vector3()
const dir = new Vector3()

export function applyCamera(camera: PerspectiveCamera, c: Channels, size: { width: number; height: number }, mobile: boolean) {
  const { up, east, north } = tangentFrame(c.lat, c.lng)
  T.copy(up).multiplyScalar((EARTH_R + c.height) * c.target)
  const pitch = c.pitch * DEG
  const heading = c.heading * DEG
  horiz.copy(north).multiplyScalar(Math.cos(heading)).addScaledVector(east, Math.sin(heading))
  dir.copy(up).multiplyScalar(Math.sin(pitch)).addScaledVector(horiz, Math.cos(pitch))
  camera.position.copy(T).addScaledVector(dir, c.dist)
  camera.up.copy(up).lerp(north, smoothstep(72, 89, c.pitch)).normalize()
  camera.lookAt(T)
  const altitude = camera.position.length() - EARTH_R
  camera.near = Math.min(20, Math.max(0.002, Math.min(altitude, c.dist) * 0.04))
  camera.far = 8000
  if (mobile) camera.setViewOffset(size.width, size.height, 0, size.height * 0.1, size.width, size.height)
  else camera.setViewOffset(size.width, size.height, -size.width * c.shift, 0, size.width, size.height)
  camera.updateProjectionMatrix()
  return { altitude, target: T.clone() }
}
