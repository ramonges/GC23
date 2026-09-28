import { Group, Vector3 } from 'three'
import { Builder, type Materials } from './core/builder'
import { EARTH_R, clamp01, easeInOut, siteMatrix, smoothstep, vec3ToLatLng, windowed } from './core/math'
import { linear } from './core/palette'
import { flatbedTruck } from './entities'
import { RouteLine, cumulativeLengths, pathPose, ribbon, terrainPath } from './fx'
import { SMELTER_ROTATION } from './SmelterScene'
import { SITES } from './sites'
import { placeOnGlobe, type FrameCtx, type StageScene } from './stage'

export function buildInbound(m: Materials, flatten: { lat: number; lng: number; r: number }[], factoryEntry: Vector3) {
  const group = new Group()
  group.name = 'inbound'
  const smelterFrame = siteMatrix(SITES.smelter.lat, SITES.smelter.lng, undefined, SMELTER_ROTATION)
  const start = new Vector3(0.5, 0.004, 0.2).applyMatrix4(smelterFrame)
  const exit = new Vector3(0.7, 0.0, 0.2).applyMatrix4(smelterFrame)
  const a = vec3ToLatLng(exit)
  const z = vec3ToLatLng(factoryEntry)
  const road = terrainPath(
    [a, { lat: a.lat + (z.lat - a.lat) * 0.35 + 0.05, lng: a.lng + (z.lng - a.lng) * 0.3 }, { lat: a.lat + (z.lat - a.lat) * 0.7 - 0.03, lng: a.lng + (z.lng - a.lng) * 0.72 }, z],
    { step: 0.004, lift: 0.0015, flatten },
  )
  const b = new Builder()
  b.addColored(ribbon(road, 0.03, linear('#3a3c39'), linear('#b8b7ae')), 'solid')
  group.add(b.build(m, { name: 'inbound-road' }))

  const path = [start, ...road]
  const cum = cumulativeLengths(path)
  const truck = flatbedTruck(m)
  group.add(truck)
  const route = new RouteLine(path.map((p) => p.clone().multiplyScalar(1 + 0.01 / EARTH_R)), { color: '#F36B21', opacity: 0.85 })
  group.add(route.lines)
  const truckPos = new Vector3()

  function update(ctx: FrameCtx) {
    const f = easeInOut(clamp01((ctx.t - 29.8) / 3.0))
    const { pos, dir } = pathPose(path, cum, f)
    pos.addScaledVector(pos.clone().normalize(), 0.003)
    truckPos.copy(pos)
    placeOnGlobe(truck, pos, dir)
    route.material.uniforms.uReveal.value = smoothstep(29.6, 32.2, ctx.t)
    route.material.uniforms.uTime.value = ctx.time
    route.material.uniforms.uOpacity.value = 0.85 * (1 - smoothstep(33.4, 34.2, ctx.t))
  }

  return {
    name: 'inbound',
    group,
    center: start.clone(),
    range: 60,
    anchors: {
      flatbed: () => truckPos.clone().multiplyScalar(1 + 0.03 / EARTH_R),
      destination: factoryEntry.clone().multiplyScalar(1 + 0.06 / EARTH_R),
    },
    update,
    truckPos,
    roadMid: road[Math.floor(road.length / 2)],
  } as StageScene & { truckPos: Vector3; roadMid: Vector3 }
}
