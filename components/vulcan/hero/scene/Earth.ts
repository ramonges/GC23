import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  FrontSide,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Points,
  PointsMaterial,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  Texture,
  Vector2,
  Vector3,
  type WebGLProgramParametersWithUniforms,
} from 'three'
import { EARTH_R } from './core/math'

export type Footprint = { inverse: Matrix4; half: Vector2 }

/** Shared shader chunk: cut a site's footprint out of the globe/terrain so the site can sit below grade. */
export function injectFootprints(shader: WebGLProgramParametersWithUniforms, footprints: Footprint[]) {
  shader.uniforms.uFootInv = { value: footprints.map((f) => f.inverse) }
  shader.uniforms.uFootHalf = { value: footprints.map((f) => f.half) }
  const n = footprints.length
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vFootWorld;')
    .replace('#include <begin_vertex>', '#include <begin_vertex>\nvFootWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;')
  shader.fragmentShader = shader.fragmentShader
    .replace(
      '#include <common>',
      `#include <common>
varying vec3 vFootWorld;
uniform mat4 uFootInv[${n}];
uniform vec2 uFootHalf[${n}];`,
    )
    .replace(
      '#include <clipping_planes_fragment>',
      `#include <clipping_planes_fragment>
for (int i = 0; i < ${n}; i++) {
  vec3 fl = (uFootInv[i] * vec4(vFootWorld, 1.0)).xyz;
  if (abs(fl.x) < uFootHalf[i].x && abs(fl.z) < uFootHalf[i].y && fl.y < 1.0) discard;
}`,
    )
}

export function buildEarth(map: Texture, footprints: Footprint[], envMap: Texture | null) {
  map.colorSpace = SRGBColorSpace
  map.anisotropy = 8
  const material = new MeshStandardMaterial({ map, roughness: 0.9, metalness: 0, envMap, envMapIntensity: 0.28 })
  const uniforms = { uGrid: { value: 1 } }
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vObjDir;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObjDir = normalize(position);')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vObjDir;\nuniform float uGrid;\nfloat landMask = 1.0;')
      .replace(
        '#include <map_fragment>',
        `vec4 earthTexel = texture2D(map, vMapUv);
landMask = earthTexel.a;
diffuseColor.rgb *= earthTexel.rgb;`,
      )
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = mix(0.7, 0.95, landMask);')
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
{
  float lat = asin(clamp(vObjDir.y, -1.0, 1.0)) * 57.29578;
  float lng = atan(-vObjDir.z, vObjDir.x) * 57.29578;
  vec2 g = vec2(lat, lng) / 15.0;
  vec2 fw = max(fwidth(g), vec2(1e-4));
  vec2 d = abs(fract(g - 0.5) - 0.5) / fw;
  float line = 1.0 - min(min(d.x, d.y), 1.0);
  totalEmissiveRadiance += vec3(0.62, 0.64, 0.58) * line * uGrid * 0.018;
}`,
      )
    injectFootprints(shader, footprints)
  }
  const earth = new Mesh(new SphereGeometry(EARTH_R, 384, 192), material)
  earth.name = 'earth'
  earth.receiveShadow = true
  return { earth, uniforms }
}

const noiseGlsl = /* glsl */ `
  float hash3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float noise3(vec3 x) {
    vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash3(i), hash3(i + vec3(1,0,0)), f.x), mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x), mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm3(vec3 p) { float s = 0.0; float a = 0.5; for (int i = 0; i < 6; i++) { s += a * noise3(p); p *= 2.03; a *= 0.5; } return s; }
`

export function buildClouds(sun: Vector3) {
  const material = new ShaderMaterial({
    uniforms: { uSun: { value: sun.clone() }, uTime: { value: 0 }, uOpacity: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      varying vec3 vNormalW;
      void main() {
        vDir = normalize(position);
        vNormalW = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uSun;
      uniform float uTime;
      uniform float uOpacity;
      varying vec3 vDir;
      varying vec3 vNormalW;
      ${noiseGlsl}
      void main() {
        vec3 p = vDir * 6.0 + vec3(uTime * 0.006, 0.0, uTime * 0.003);
        float warp = fbm3(p * 0.6);
        vec3 q = p + warp * 1.6;
        float n = fbm3(q * vec3(1.0, 2.2, 1.0));
        float band = 1.0 - smoothstep(0.5, 0.95, abs(vDir.y));
        float c = smoothstep(0.6, 0.86, n) * (0.35 + 0.65 * band);
        float light = clamp(dot(vNormalW, uSun) * 1.2 + 0.05, 0.0, 1.0);
        gl_FragColor = vec4(vec3(0.74, 0.76, 0.74) * light, c * 0.3 * uOpacity);
      }
    `,
    transparent: true,
    depthWrite: false,
  })
  const clouds = new Mesh(new SphereGeometry(EARTH_R * 1.028, 192, 96), material)
  clouds.name = 'clouds'
  return { clouds, material }
}

const atmosphereVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vWorld;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

export function buildAtmosphere(sun: Vector3) {
  const scale = 1.06
  const limb = Math.sqrt(1 - 1 / (scale * scale))
  const glowMat = new ShaderMaterial({
    vertexShader: atmosphereVertex,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform vec3 uSun;
      uniform float uLimb;
      uniform float uFade;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float x = clamp(-dot(vNormal, vView) / uLimb, 0.0, 1.0);
        float lit = clamp(dot(-vNormal, uSun) * 0.8 + 0.35, 0.0, 1.0);
        gl_FragColor = vec4(uColor * pow(x, 3.4) * 0.42 * lit * uFade, 1.0);
      }
    `,
    uniforms: { uColor: { value: new Color('#9fb3bd') }, uSun: { value: sun.clone() }, uLimb: { value: limb }, uFade: { value: 1 } },
    side: BackSide,
    blending: AdditiveBlending,
    transparent: true,
    depthWrite: false,
  })
  const glow = new Mesh(new SphereGeometry(EARTH_R * scale, 96, 64), glowMat)
  glow.name = 'atmosphere'

  const hazeMat = new ShaderMaterial({
    vertexShader: atmosphereVertex,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform vec3 uSun;
      uniform float uFade;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float f = pow(1.0 - clamp(dot(vNormal, vView), 0.0, 1.0), 3.2);
        float lit = clamp(dot(vNormal, uSun) * 0.9 + 0.25, 0.0, 1.0);
        gl_FragColor = vec4(uColor * f * 0.34 * lit * uFade, 1.0);
      }
    `,
    uniforms: { uColor: { value: new Color('#8ea3ad') }, uSun: { value: sun.clone() }, uFade: { value: 1 } },
    side: FrontSide,
    blending: AdditiveBlending,
    transparent: true,
    depthWrite: false,
  })
  const haze = new Mesh(new SphereGeometry(EARTH_R * 1.003, 128, 96), hazeMat)
  haze.name = 'haze'
  return { glow, haze, glowMat, hazeMat }
}

export function buildStars(count: number) {
  const pos = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)
  const v = new Vector3()
  const c = new Color()
  let seed = 7
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < count; i++) {
    v.set(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).normalize().multiplyScalar(2600 + rand() * 900)
    pos.set([v.x, v.y, v.z], i * 3)
    const k = Math.pow(rand(), 3) * 0.8 + 0.12
    c.setRGB(0.85 * k, 0.86 * k, 0.82 * k)
    col.set([c.r, c.g, c.b], i * 3)
  }
  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(pos, 3))
  geo.setAttribute('color', new BufferAttribute(col, 3))
  const stars = new Points(geo, new PointsMaterial({ size: 1.3, sizeAttenuation: false, vertexColors: true, depthWrite: false, fog: false }))
  stars.name = 'stars'
  stars.frustumCulled = false
  return stars
}
