import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  Color,
  FrontSide,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  Vector3,
} from 'three'
import { EARTH_R } from './math'

const DEG = 180 / Math.PI
const FOOTPRINT: [number, number][] = [[0, 0], [1.2, 0], [-1.2, 0], [0, 1.2], [0, -1.2], [0.8, 0.8], [-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8]]

function loadImageData(src: string) {
  return new Promise<ImageData>((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return reject(new Error('2d context unavailable'))
      ctx.drawImage(img, 0, 0)
      resolve(ctx.getImageData(0, 0, canvas.width, canvas.height))
    }
    img.onerror = () => reject(new Error(`failed to load ${src}`))
    img.src = src
  })
}

function sample(data: ImageData, lat: number, lng: number) {
  const x = Math.floor(((lng + 180) / 360) * data.width) % data.width
  const y = Math.min(data.height - 1, Math.max(0, Math.floor(((90 - lat) / 180) * data.height)))
  const i = (y * data.width + (x < 0 ? x + data.width : x)) * 4
  return [data.data[i] / 255, data.data[i + 1] / 255, data.data[i + 2] / 255]
}

/** Map a Blue Marble sample to the site's restrained mineral palette, quantized for low-poly banding. */
function stylize(r: number, g: number, b: number): [number, number, number] {
  const lum = 0.299 * r + 0.587 * g + 0.114 * b
  if (b > r * 1.25 && b > g * 1.05 && lum < 0.45) {
    const k = 0.8 + lum * 1.4
    return [0.05 * k, 0.078 * k, 0.11 * k]
  }
  if (lum > 0.7) return [0.66, 0.68, 0.71]
  const q = (x: number) => Math.round(x * 12) / 12
  const d = 0.62
  return [
    q((r * d + lum * (1 - d)) * 1.06 * 0.8),
    q((g * d + lum * (1 - d)) * 0.96 * 0.8),
    q((b * d + lum * (1 - d)) * 0.82 * 0.8),
  ]
}

export async function buildEarth(detail: number) {
  const data = await loadImageData('/hero/earth-lowres.webp')
  const geo = new IcosahedronGeometry(EARTH_R, detail)
  geo.deleteAttribute('uv')
  const pos = geo.getAttribute('position')
  const colors = new Float32Array(pos.count * 3)
  const c = new Color()
  const v = new Vector3()
  const t = new Vector3()
  for (let i = 0; i < pos.count; i += 3) {
    v.set(0, 0, 0)
    for (let k = 0; k < 3; k++) v.add(t.fromBufferAttribute(pos, i + k))
    v.normalize()
    const lat = Math.asin(v.y) * DEG
    const lng = Math.atan2(-v.z, v.x) * DEG
    let sr = 0
    let sg = 0
    let sb = 0
    for (const [dl, dg] of FOOTPRINT) {
      const [r0, g0, b0] = sample(data, lat + dl, lng + dg / Math.max(0.25, Math.cos((lat * Math.PI) / 180)))
      sr += r0
      sg += g0
      sb += b0
    }
    const [r, g, b] = stylize(sr / FOOTPRINT.length, sg / FOOTPRINT.length, sb / FOOTPRINT.length)
    c.setRGB(r, g, b, SRGBColorSpace)
    for (let k = 0; k < 3; k++) colors.set([c.r, c.g, c.b], (i + k) * 3)
  }
  geo.setAttribute('color', new BufferAttribute(colors, 3))
  const earth = new Mesh(
    geo,
    new MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.94, metalness: 0 }),
  )
  earth.name = 'earth'
  return earth
}

const atmosphereVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

export function buildAtmosphere() {
  const scale = 1.07
  const limb = Math.sqrt(1 - 1 / (scale * scale))
  const glow = new Mesh(
    new SphereGeometry(EARTH_R * scale, 64, 48),
    new ShaderMaterial({
      vertexShader: atmosphereVertex,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uLimb;
        uniform float uFade;
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          float x = clamp(-dot(vNormal, vView) / uLimb, 0.0, 1.0);
          gl_FragColor = vec4(uColor * pow(x, 3.2) * 0.38 * uFade, 1.0);
        }
      `,
      uniforms: { uColor: { value: new Color(0.42, 0.52, 0.78) }, uLimb: { value: limb }, uFade: { value: 1 } },
      side: BackSide,
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
    }),
  )
  glow.name = 'atmosphere'

  const haze = new Mesh(
    new SphereGeometry(EARTH_R * 1.004, 64, 48),
    new ShaderMaterial({
      vertexShader: atmosphereVertex,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uFade;
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          float f = pow(1.0 - clamp(dot(vNormal, vView), 0.0, 1.0), 3.5);
          gl_FragColor = vec4(uColor * f * 0.2 * uFade, 1.0);
        }
      `,
      uniforms: { uColor: { value: new Color(0.5, 0.58, 0.76) }, uFade: { value: 1 } },
      side: FrontSide,
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
    }),
  )
  haze.name = 'haze'
  return { glow, haze }
}
