import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, Group, Points, ShaderMaterial } from 'three'
import { EARTH_R, latLngToVec3 } from './core/math'
import { linear } from './core/palette'
import { RouteLine, terrainPath } from './fx'
import type { LatLng } from './sites'

export type OriginMarker = { lat: number; lng: number; material: string; primary: boolean }

const GLOBAL_ROUTES: LatLng[][] = [
  [{ lat: -24.27, lng: -69.07 }, { lat: -23.65, lng: -70.4 }, { lat: -20, lng: -100 }, { lat: 5, lng: -160 }, { lat: 25, lng: 150 }, { lat: 31.14, lng: 121.58 }],
  [{ lat: -10.72, lng: 25.47 }, { lat: -6.82, lng: 39.29 }, { lat: 2, lng: 70 }, { lat: 5, lng: 95 }, { lat: 8, lng: 110 }, { lat: 31.14, lng: 121.58 }],
  [{ lat: -2.85, lng: 122.15 }, { lat: 10, lng: 124 }, { lat: 31.14, lng: 121.58 }],
  [{ lat: -28.86, lng: 122.55 }, { lat: -32, lng: 115.8 }, { lat: -15, lng: 108 }, { lat: 3.97, lng: 103.43 }],
  [{ lat: 46.49, lng: -81.0 }, { lat: 42.33, lng: -83.05 }],
  [{ lat: -23.5, lng: -68.25 }, { lat: -23.65, lng: -70.4 }, { lat: -30, lng: -60 }, { lat: -34, lng: 18 }, { lat: 51.95, lng: 4.14 }],
]

export function buildNetwork(markers: OriginMarker[]) {
  const group = new Group()
  group.name = 'network'
  const n = markers.length
  const position = new Float32Array(n * 3)
  const color = new Float32Array(n * 3)
  const primary = new Float32Array(n)
  const phase = new Float32Array(n)
  const orange = linear('#F36B21')
  const muted = linear('#858981')
  markers.forEach((m, i) => {
    const v = latLngToVec3(m.lat, m.lng, EARTH_R + 0.4)
    position.set([v.x, v.y, v.z], i * 3)
    color.set(m.primary ? orange : muted, i * 3)
    primary[i] = m.primary ? 1 : 0
    phase[i] = (i * 0.173) % 1
  })
  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(position, 3))
  geo.setAttribute('aColor', new BufferAttribute(color, 3))
  geo.setAttribute('aPrimary', new BufferAttribute(primary, 1))
  geo.setAttribute('aPhase', new BufferAttribute(phase, 1))
  const material = new ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uFocus: { value: 0 }, uFade: { value: 1 }, uPixelRatio: { value: 1 }, uMotion: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute vec3 aColor;
      attribute float aPrimary;
      attribute float aPhase;
      uniform float uFocus;
      uniform float uFade;
      uniform float uPixelRatio;
      varying vec3 vColor;
      varying float vPrimary;
      varying float vPhase;
      varying float vAlpha;
      void main() {
        vColor = aColor;
        vPrimary = aPrimary;
        vPhase = aPhase;
        vAlpha = uFade * mix(mix(0.75, 0.16, uFocus), mix(1.0, 1.25, uFocus), aPrimary);
        gl_PointSize = mix(7.0, 30.0, aPrimary) * uPixelRatio * step(0.01, vAlpha);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uMotion;
      varying vec3 vColor;
      varying float vPrimary;
      varying float vPhase;
      varying float vAlpha;
      void main() {
        vec2 p = (gl_PointCoord - 0.5) * 2.0;
        float r = length(p);
        float i;
        if (vPrimary > 0.5) {
          float core = smoothstep(0.22, 0.12, r);
          float ph = uMotion > 0.5 ? fract(uTime * 0.45 + vPhase) : 0.5;
          float ring = smoothstep(0.05, 0.0, abs(r - mix(0.2, 0.95, ph))) * (1.0 - ph);
          i = core * 1.6 + ring * 0.8 + exp(-r * r * 12.0) * 0.4;
        } else {
          i = smoothstep(0.7, 0.35, r) * 0.9;
        }
        if (i < 0.01) discard;
        gl_FragColor = vec4(vColor * i * vAlpha, i * vAlpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    fog: false,
  })
  const points = new Points(geo, material)
  points.frustumCulled = false
  points.renderOrder = 5
  group.add(points)

  const routes = GLOBAL_ROUTES.map((r) => new RouteLine(terrainPath(r, { step: 0.4, lift: 0.3, arc: 5 }), { color: '#858981', opacity: 0.32 }))
  routes.forEach((r) => group.add(r.lines))

  function update(t: number, time: number, altitude: number, motion: boolean) {
    const fade = Math.min(1, Math.max(0, (altitude - 20) / 60))
    material.uniforms.uTime.value = time
    material.uniforms.uMotion.value = motion ? 1 : 0
    material.uniforms.uFocus.value = Math.min(1, Math.max(0, (t - 3.6) / 2))
    material.uniforms.uFade.value = fade
    routes.forEach((r, i) => {
      r.material.uniforms.uReveal.value = Math.min(1, Math.max(0, (t - 0.4 - i * 0.25) / 2.4))
      r.material.uniforms.uTime.value = time
      r.material.uniforms.uOpacity.value = 0.32 * fade * (1 - Math.min(1, Math.max(0, (t - 3.8) / 2)) * 0.75)
    })
  }

  return { group, update, material, color: new Color() }
}
