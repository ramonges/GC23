import { Group, Vector3 } from 'three'
import type { Materials } from './core/builder'
import { EARTH_R, GROUND, monotoneCubic, siteMatrix, smoothstep, windowed } from './core/math'
import { bulkCarrier } from './entities'
import { RouteLine, cumulativeLengths, pathPose, terrainPath } from './fx'
import { BERTH } from './PortScene'
import { ALT_ROUTE, MARITIME_ROUTE, SITES } from './sites'
import { placeOnGlobe, type FrameCtx, type StageScene } from './stage'

/** Ship distance-along-path keys (seconds → fraction), shared with the camera so it can track the vessel. */
const SHIP_KEYS: [number, number][] = [
  [0, 0],
  [17.9, 0],
  [19.4, 0.0042],
  [21.2, 0.42],
  [23.1, 0.985],
  [23.6, 1],
]

export function buildShip(m: Materials): StageScene & { shipPos: Vector3; progress: (t: number) => number; route: RouteLine } {
  const group = new Group()
  group.name = 'ship'
  const portFrame = siteMatrix(SITES.port.lat, SITES.port.lng, GROUND - 0.0012)
  const harbour = [
    [BERTH.x, BERTH.z],
    [BERTH.x - 0.004, BERTH.z + 0.12],
    [BERTH.x - 0.03, BERTH.z + 0.26],
    [BERTH.x - 0.12, BERTH.z + 0.36],
    [BERTH.x - 0.26, BERTH.z + 0.41],
  ].map(([x, z]) => new Vector3(x, 0, z).applyMatrix4(portFrame))
  const last = harbour[harbour.length - 1].clone().normalize()
  const lastLL = { lat: (Math.asin(last.y) * 180) / Math.PI, lng: (Math.atan2(-last.z, last.x) * 180) / Math.PI }
  const sea = terrainPath([lastLL, ...MARITIME_ROUTE.slice(1)], { step: 0.05, lift: -0.0012 })
  const path = [...harbour, ...sea.slice(1)]
  const cum = cumulativeLengths(path)

  const ship = bulkCarrier(m)
  group.add(ship.root)

  const lift = (p: Vector3, h: number) => p.clone().multiplyScalar(1 + h / EARTH_R)
  const route = new RouteLine(
    path.map((p, i) => lift(p, 0.02 + Math.min(1, i / 60) * 0.25)),
    { color: '#F36B21', opacity: 0.8 },
  )
  group.add(route.lines)
  const alt = new RouteLine(
    terrainPath(ALT_ROUTE, { step: 0.08, lift: 0.26 }),
    { color: '#858981', opacity: 0.28, dashed: true },
  )
  group.add(alt.lines)

  const times = SHIP_KEYS.map((k) => k[0])
  const fracs = SHIP_KEYS.map((k) => k[1])
  const progress = (t: number) => monotoneCubic(times, fracs, t)
  const shipPos = new Vector3()
  const prevPos = new Vector3()

  function update(ctx: FrameCtx) {
    const f = progress(ctx.t)
    const { pos, dir } = pathPose(path, cum, f)
    prevPos.copy(shipPos)
    shipPos.copy(pos)
    const ahead = pathPose(path, cum, Math.min(1, f + 0.0006)).pos
    const heading = f < 0.0005 ? path[1].clone().sub(path[0]) : ahead.sub(pos).lengthSq() > 1e-10 ? ahead.sub(pos) : dir
    placeOnGlobe(ship.root, pos, heading.normalize())
    const speed = ctx.dt > 0 ? prevPos.distanceTo(shipPos) / ctx.dt : 0
    ship.wakeMat.uniforms.uStrength.value = Math.min(1, speed * 6) * (1 - smoothstep(20.2, 20.8, ctx.t))
    ship.wakeMat.uniforms.uTime.value = ctx.time
    ship.root.visible = ctx.t < 21.6

    route.material.uniforms.uReveal.value = f
    route.material.uniforms.uTime.value = ctx.time
    route.material.uniforms.uOpacity.value = 0.8 * windowed(ctx.t, 18.2, 24.4, 0.5)
    alt.material.uniforms.uOpacity.value = 0.26 * windowed(ctx.t, 20.0, 23.8, 0.8)
    alt.material.uniforms.uReveal.value = smoothstep(20.0, 22.0, ctx.t)
  }

  const mouth = MARITIME_ROUTE[MARITIME_ROUTE.length - 1]
  return {
    name: 'ship',
    group,
    center: harbour[0].clone(),
    range: 1e9,
    anchors: {
      carrier: () => shipPos.clone().multiplyScalar(1 + 0.035 / EARTH_R),
      shipPosition: () => lift(shipPos, 0.3),
      origin: lift(harbour[0], 0.3),
      destination: new Vector3().copy(terrainPath([mouth, mouth], { lift: 0.3 })[0]),
    },
    update,
    shipPos,
    progress,
    route,
  }
}

