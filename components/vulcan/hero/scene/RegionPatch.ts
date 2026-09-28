import { BufferAttribute, BufferGeometry, Mesh, MeshStandardMaterial, SRGBColorSpace, Texture } from 'three'
import { injectFootprints, type Footprint } from './Earth'
import { EARTH_R, GROUND, fbm, latLngToVec3, smoothstep } from './core/math'
import type { Patch } from './sites'

/** CPU-side sampler over a downscaled copy of a patch texture, for blending site ground into the terrain. */
export class PatchSampler {
  constructor(
    readonly patch: Patch,
    private data: Uint8ClampedArray,
    private size: number,
  ) {}

  static fromImage(patch: Patch, image: CanvasImageSource & { width: number; height: number }, size = 1024) {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!
    ctx.drawImage(image, 0, 0, size, size)
    return new PatchSampler(patch, ctx.getImageData(0, 0, size, size).data, size)
  }

  contains(lat: number, lng: number) {
    const p = this.patch
    return lat >= p.lat[0] && lat <= p.lat[1] && lng >= p.lng[0] && lng <= p.lng[1]
  }

  /** sRGB 0..1 color and land mask (alpha), bilinear. */
  sample(lat: number, lng: number): [number, number, number, number] {
    const p = this.patch
    const fx = ((lng - p.lng[0]) / (p.lng[1] - p.lng[0])) * (this.size - 1)
    const fy = ((p.lat[1] - lat) / (p.lat[1] - p.lat[0])) * (this.size - 1)
    const x0 = Math.max(0, Math.min(this.size - 2, Math.floor(fx)))
    const y0 = Math.max(0, Math.min(this.size - 2, Math.floor(fy)))
    const tx = Math.min(1, Math.max(0, fx - x0))
    const ty = Math.min(1, Math.max(0, fy - y0))
    const out: [number, number, number, number] = [0, 0, 0, 0]
    for (let c = 0; c < 4; c++) {
      const i = (y: number, x: number) => this.data[(y * this.size + x) * 4 + c] / 255
      const a = i(y0, x0) * (1 - tx) + i(y0, x0 + 1) * tx
      const b = i(y0 + 1, x0) * (1 - tx) + i(y0 + 1, x0 + 1) * tx
      out[c] = a * (1 - ty) + b * ty
    }
    return out
  }
}

/** Gentle relief, flattened around sites so every facility sits flush with the ground. */
export function patchHeight(lat: number, lng: number, flatten: { lat: number; lng: number; r: number }[]) {
  let h = (fbm(lng * 1.7 + 11, lat * 1.7 - 3, 4) - 0.45) * 0.05
  h = Math.max(-0.004, h)
  for (const s of flatten) {
    const d = Math.hypot((lat - s.lat) * 1.745, (lng - s.lng) * 1.745 * Math.cos((s.lat * Math.PI) / 180))
    h *= smoothstep(s.r, s.r * 1.8, d)
  }
  return h
}

export function buildPatch(
  patch: Patch,
  texture: Texture,
  footprints: Footprint[],
  flatten: { lat: number; lng: number; r: number }[],
  segments: number,
  envMap: Texture | null,
) {
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  const n = segments
  const positions = new Float32Array((n + 1) * (n + 1) * 3)
  const uvs = new Float32Array((n + 1) * (n + 1) * 2)
  const index: number[] = []
  const v = latLngToVec3(0, 0)
  for (let j = 0; j <= n; j++) {
    for (let i = 0; i <= n; i++) {
      const u = i / n
      const w = j / n
      const lat = patch.lat[0] + (patch.lat[1] - patch.lat[0]) * w
      const lng = patch.lng[0] + (patch.lng[1] - patch.lng[0]) * u
      const edge = Math.min(u, 1 - u, w, 1 - w)
      const skirt = smoothstep(0.006, 0, edge) * 0.06
      latLngToVec3(lat, lng, EARTH_R + GROUND + patchHeight(lat, lng, flatten) - skirt, v)
      const k = j * (n + 1) + i
      positions.set([v.x, v.y, v.z], k * 3)
      uvs.set([u, w], k * 2)
      if (i < n && j < n) index.push(k, k + 1, k + n + 1, k + 1, k + n + 2, k + n + 1)
    }
  }
  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(positions, 3))
  geo.setAttribute('uv', new BufferAttribute(uvs, 2))
  geo.setIndex(index)
  geo.computeVertexNormals()
  geo.computeBoundingSphere()

  const material = new MeshStandardMaterial({ map: texture, roughness: 0.92, metalness: 0, envMap, envMapIntensity: 0.28 })
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vPatchUv;\nvarying vec3 vDetailPos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPatchUv = uv;\nvDetailPos = position;')
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec2 vPatchUv;
varying vec3 vDetailPos;
float patchLand = 1.0;
float dHash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float dNoise(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(dHash(i), dHash(i + vec3(1,0,0)), f.x), mix(dHash(i + vec3(0,1,0)), dHash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(dHash(i + vec3(0,0,1)), dHash(i + vec3(1,0,1)), f.x), mix(dHash(i + vec3(0,1,1)), dHash(i + vec3(1,1,1)), f.x), f.y), f.z);
}`,
      )
      .replace(
        '#include <clipping_planes_fragment>',
        `#include <clipping_planes_fragment>
{
  float edge = min(min(vPatchUv.x, 1.0 - vPatchUv.x), min(vPatchUv.y, 1.0 - vPatchUv.y));
  float keep = smoothstep(0.0, 0.05, edge);
  if (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) > keep) discard;
}`,
      )
      .replace(
        '#include <map_fragment>',
        `vec4 patchTexel = texture2D(map, vMapUv);
patchLand = patchTexel.a;
float detail = dNoise(vDetailPos * 28.0) * 0.5 + dNoise(vDetailPos * 71.0) * 0.3 + dNoise(vDetailPos * 173.0) * 0.2;
float detailFade = 1.0 - smoothstep(4.0, 22.0, length(vViewPosition));
diffuseColor.rgb *= patchTexel.rgb * mix(1.0, 0.84 + detail * 0.32, detailFade * patchLand);`,
      )
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = mix(0.7, 0.93, patchLand);')
    injectFootprints(shader, footprints)
  }
  const mesh = new Mesh(geo, material)
  mesh.name = `patch-${patch.id}`
  mesh.receiveShadow = true
  return mesh
}
