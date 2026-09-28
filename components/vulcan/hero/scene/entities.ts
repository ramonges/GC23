import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  Object3D,
  PlaneGeometry,
  ShaderMaterial,
  SphereGeometry,
} from 'three'
import { Builder, RX, RZ, T, part, type Materials } from './core/builder'
import { linear, P } from './core/palette'

const HALF_PI = Math.PI / 2

function wheels(b: Builder, xs: number[], y: number, z: number, r: number, w: number) {
  for (const x of xs) {
    for (const s of [-1, 1]) {
      b.add(new CylinderGeometry(r, r, w, 14), P.hullBlack, 'solid', T(x, y, s * z).multiply(RX(HALF_PI)))
      b.add(new CylinderGeometry(r * 0.55, r * 0.55, w * 1.04, 10), P.steel, 'metal', T(x, y, s * z).multiply(RX(HALF_PI)))
    }
  }
}

/** Rigid haul truck with an ore load; x forward. */
export function haulTruck(m: Materials, loaded = true) {
  return part(m, (b) => {
    b.box(0.056, 0.007, 0.022, 0, 0.012, 0, P.steelDark)
    b.box(0.04, 0.004, 0.032, -0.008, 0.019, 0, P.yellow)
    b.box(0.04, 0.014, 0.003, -0.008, 0.027, 0.0145, P.yellow)
    b.box(0.04, 0.014, 0.003, -0.008, 0.027, -0.0145, P.yellow)
    b.box(0.003, 0.016, 0.032, -0.0275, 0.028, 0, P.yellow)
    b.box(0.006, 0.02, 0.032, 0.013, 0.03, 0, P.yellow)
    b.box(0.014, 0.012, 0.012, 0.022, 0.026, 0.009, P.yellow)
    b.box(0.0045, 0.006, 0.0105, 0.029, 0.028, 0.009, '#1a2124', 'glass')
    b.box(0.022, 0.0025, 0.034, 0.018, 0.0335, 0, P.yellow)
    b.box(0.012, 0.01, 0.018, 0.024, 0.017, -0.004, P.steelDark)
    b.box(0.001, 0.002, 0.004, 0.0305, 0.02, 0.012, [3.2, 2.9, 2.2], 'emissive')
    b.box(0.001, 0.002, 0.004, 0.0305, 0.02, -0.012, [3.2, 2.9, 2.2], 'emissive')
    if (loaded) b.add(new SphereGeometry(0.019, 14, 7, 0, Math.PI * 2, 0, HALF_PI), P.bauxite, 'solid', T(-0.008, 0.027, 0, 0, 1.05, 0.42, 0.8))
    wheels(b, [0.02, -0.012, -0.024], 0.009, 0.0135, 0.009, 0.007)
  }, 'haul-truck')
}

/** Flatbed tractor-trailer carrying aluminum billets; x forward. */
export function flatbedTruck(m: Materials) {
  return part(m, (b) => {
    b.box(0.022, 0.018, 0.02, 0.05, 0.018, 0, P.paintWhite)
    b.box(0.004, 0.009, 0.018, 0.061, 0.021, 0, '#1a2124', 'glass')
    b.box(0.03, 0.005, 0.016, 0.046, 0.008, 0, P.steelDark)
    b.box(0.09, 0.004, 0.022, -0.012, 0.013, 0, P.steelDark)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        b.add(new CylinderGeometry(0.0045, 0.0045, 0.08, 14), P.aluminum, 'metal', T(-0.012, 0.0195 + j * 0.0085, (i - 1) * 0.0072).multiply(RZ(HALF_PI)))
      }
    }
    b.box(0.001, 0.002, 0.004, 0.0612, 0.012, 0.007, [3.2, 2.9, 2.2], 'emissive')
    b.box(0.001, 0.002, 0.004, 0.0612, 0.012, -0.007, [3.2, 2.9, 2.2], 'emissive')
    b.box(0.001, 0.003, 0.02, -0.0575, 0.013, 0, [2.6, 0.25, 0.1], 'emissive')
    wheels(b, [0.052, 0.036, -0.036, -0.048], 0.0065, 0.0105, 0.006, 0.005)
  }, 'flatbed')
}

export type Excavator = { root: Group; house: Object3D; boom: Object3D; stick: Object3D; bucket: Object3D }

/** Hydraulic excavator: tracks, slewing house, boom → stick → bucket. */
export function excavator(m: Materials): Excavator {
  const root = new Group()
  root.add(part(m, (b) => {
    for (const s of [-1, 1]) {
      b.box(0.05, 0.01, 0.011, 0, 0.005, s * 0.014, P.hullBlack)
      b.box(0.042, 0.004, 0.008, 0, 0.011, s * 0.014, P.steelDark)
    }
    b.cyl(0.01, 0.012, 0.006, 0, 0.014, 0, P.steelDark)
  }, 'tracks'))
  const house = new Group()
  house.position.set(0, 0.017, 0)
  house.add(part(m, (b) => {
    b.box(0.04, 0.014, 0.03, -0.004, 0.007, 0, P.yellow)
    b.box(0.012, 0.016, 0.03, -0.022, 0.008, 0, P.steelDark)
    b.box(0.013, 0.016, 0.012, 0.012, 0.015, 0.009, P.yellow)
    b.box(0.011, 0.01, 0.0125, 0.013, 0.017, 0.009, '#1a2124', 'glass')
    b.box(0.003, 0.004, 0.003, -0.016, 0.017, -0.008, P.steelDark)
  }, 'house'))
  root.add(house)
  const boom = new Group()
  boom.position.set(0.016, 0.012, -0.002)
  boom.add(part(m, (b) => b.box(0.05, 0.007, 0.007, 0.025, 0, 0, P.yellow).cyl(0.002, 0.002, 0.03, 0.012, -0.005, 0, P.steel, 'metal', 8, RZ(1.2)), 'boom'))
  house.add(boom)
  const stick = new Group()
  stick.position.set(0.05, 0, 0)
  stick.add(part(m, (b) => b.box(0.034, 0.005, 0.006, 0.017, 0, 0, P.yellow), 'stick'))
  boom.add(stick)
  const bucket = new Group()
  bucket.position.set(0.034, 0, 0)
  bucket.add(part(m, (b) => {
    b.box(0.012, 0.012, 0.013, 0.004, -0.004, 0, P.steelDark)
    b.box(0.004, 0.004, 0.013, 0.01, -0.01, 0, P.steel, 'metal')
  }, 'bucket'))
  stick.add(bucket)
  return { root, house, boom, stick, bucket }
}

/** Lofted bulk-carrier hull: boxy midbody, fine bow, rounded stern. x forward, waterline at y = 0. */
function hullGeometry(L: number, B: number, D: number, draft: number) {
  const stations = 48
  const ring = 14
  const top = D - draft
  const positions: number[] = []
  const colors: number[] = []
  const below = linear(P.hullRed)
  const above = linear(P.hullBlack)
  const boot = linear('#3a3d3b')
  const deck = linear(P.deck)
  const colorFor = (y: number) => (y < -0.003 ? below : y < 0.0006 ? boot : above)
  const halfWidth = (u: number) => {
    const bow = u > 0.8 ? Math.pow(Math.cos(((u - 0.8) / 0.2) * HALF_PI), 0.9) : 1
    const stern = u < 0.08 ? 0.72 + 0.28 * Math.sin((u / 0.08) * HALF_PI) : 1
    return Math.max(0.0006, (B / 2) * bow * stern)
  }
  const section = (u: number) => {
    const w = halfWidth(u)
    const keelRise = u > 0.9 ? ((u - 0.9) / 0.1) * D * 0.35 : 0
    const pts: [number, number][] = []
    for (let k = 0; k <= ring; k++) {
      const a = (k / ring) * Math.PI
      pts.push([Math.cos(a) * w, top - Math.pow(Math.sin(a), 0.35) * (D - keelRise)])
    }
    return pts
  }
  const rows = Array.from({ length: stations + 1 }, (_, i) => ({ x: (i / stations - 0.5) * L, w: halfWidth(i / stations), pts: section(i / stations) }))
  const tri = (a: number[], b: number[], c: number[], color?: number[]) => {
    for (const v of [a, b, c]) {
      positions.push(v[0], v[1], v[2])
      colors.push(...(color ?? colorFor(v[1])))
    }
  }
  for (let i = 0; i < stations; i++) {
    const a = rows[i]
    const b = rows[i + 1]
    for (let k = 0; k < ring; k++) {
      const p = [a.x, a.pts[k][1], a.pts[k][0]]
      const q = [b.x, b.pts[k][1], b.pts[k][0]]
      const r = [b.x, b.pts[k + 1][1], b.pts[k + 1][0]]
      const s = [a.x, a.pts[k + 1][1], a.pts[k + 1][0]]
      tri(p, r, q)
      tri(p, s, r)
    }
    tri([a.x, top, -a.w], [b.x, top, b.w], [b.x, top, -b.w], deck)
    tri([a.x, top, -a.w], [a.x, top, a.w], [b.x, top, b.w], deck)
  }
  const st = rows[0]
  const c = [st.x, top - D * 0.5, 0]
  for (let k = 0; k < ring; k++) tri(c, [st.x, st.pts[k + 1][1], st.pts[k + 1][0]], [st.x, st.pts[k][1], st.pts[k][0]], above)
  tri(c, [st.x, top, st.pts[0][0]], [st.x, top, st.pts[ring][0]], above)
  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  geo.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3))
  geo.computeVertexNormals()
  return geo
}

export type Ship = { root: Group; wake: Mesh; wakeMat: ShaderMaterial; length: number }

export function bulkCarrier(m: Materials): Ship {
  const L = 0.3
  const B = 0.046
  const D = 0.026
  const draft = 0.014
  const top = D - draft
  const root = new Group()
  root.add(part(m, (b) => {
    b.addColored(hullGeometry(L, B, D, draft), 'solid')
    for (let i = 0; i < 7; i++) {
      const x = -0.07 + i * 0.03
      b.box(0.022, 0.004, 0.032, x, top + 0.002, 0, '#6e3524')
      b.box(0.021, 0.0015, 0.031, x, top + 0.0045, 0, '#7c3d29')
    }
    for (let i = 0; i < 4; i++) {
      const x = -0.055 + i * 0.045
      b.cyl(0.0022, 0.0026, 0.02, x, top + 0.01, 0.011, P.paintWhite, 'solid', 10)
      b.box(0.004, 0.004, 0.006, x, top + 0.021, 0.011, P.paintWhite)
      b.add(new CylinderGeometry(0.0011, 0.0014, 0.034, 6), P.paintWhite, 'solid', T(x + 0.012, top + 0.024, 0.004).multiply(RZ(-1.1)))
    }
    const ax = -0.122
    b.box(0.034, 0.012, 0.04, ax, top + 0.006, 0, P.paintWhite)
    b.box(0.028, 0.009, 0.036, ax + 0.002, top + 0.0165, 0, P.paintWhite)
    b.box(0.022, 0.008, 0.052, ax + 0.004, top + 0.025, 0, P.paintWhite)
    b.box(0.0005, 0.003, 0.046, ax + 0.0152, top + 0.0255, 0, '#1b2326', 'glass')
    for (let t = 0; t < 2; t++) b.box(0.0004, 0.0018, 0.03, ax + 0.017 - t * 0.003, top + 0.007 + t * 0.0095, 0, [0.9, 0.85, 0.7], 'emissive')
    b.box(0.01, 0.018, 0.012, ax - 0.012, top + 0.03, 0, P.steelDark)
    b.box(0.0105, 0.004, 0.0125, ax - 0.012, top + 0.034, 0, P.orange)
    b.cyl(0.0007, 0.0007, 0.022, ax + 0.004, top + 0.04, 0, P.steelLight, 'metal', 6)
    b.box(0.006, 0.002, 0.004, 0.141, top + 0.003, 0, P.steelDark)
    b.sphere(0.0016, ax + 0.004, top + 0.029, -0.027, [4, 0.3, 0.2], 'emissive')
    b.sphere(0.0016, ax + 0.004, top + 0.029, 0.027, [0.3, 3.6, 0.9], 'emissive')
    b.sphere(0.0014, ax + 0.004, top + 0.052, 0, [3.5, 3.4, 3.1], 'emissive')
    b.sphere(0.0014, 0.14, top + 0.012, 0, [3.5, 3.4, 3.1], 'emissive')
  }, 'bulk-carrier'))

  const wakeMat = new ShaderMaterial({
    uniforms: { uStrength: { value: 0 }, uTime: { value: 0 } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uStrength;
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        float along = vUv.x;
        float spread = mix(0.08, 0.5, along);
        float across = abs(vUv.y - 0.5);
        float edge = smoothstep(spread, spread * 0.55, across);
        float arms = smoothstep(0.035, 0.0, abs(across - spread * 0.9));
        float ripple = 0.65 + 0.35 * sin(along * 60.0 - uTime * 3.0);
        float a = (edge * 0.35 + arms * 0.6) * (1.0 - along) * ripple * uStrength;
        gl_FragColor = vec4(vec3(0.8, 0.84, 0.82) * a, a);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
  })
  const wake = new Mesh(new PlaneGeometry(0.6, 0.24).rotateX(-HALF_PI).rotateY(Math.PI).translate(-L / 2 - 0.3, 0.0015, 0), wakeMat)
  wake.renderOrder = 2
  root.add(wake)
  return { root, wake, wakeMat, length: L }
}

export type RobotArm = {
  root: Group
  turret: Object3D
  shoulder: Object3D
  elbow: Object3D
  wrist: Object3D
  fingers: [Object3D, Object3D]
  tool: Object3D
}

/** Six-axis industrial arm. `scale` 1 ≈ 0.2 units reach. */
export function robotArm(m: Materials, options: { scale?: number; body?: string; accent?: string } = {}): RobotArm {
  const s = options.scale ?? 1
  const body = options.body ?? P.paintWhite
  const accent = options.accent ?? P.steelDark
  const root = new Group()
  root.scale.setScalar(s)
  root.add(part(m, (b) => {
    b.cyl(0.028, 0.032, 0.012, 0, 0.006, 0, accent, 'solid', 24)
    b.cyl(0.022, 0.026, 0.02, 0, 0.022, 0, body, 'solid', 24)
  }, 'arm-base'))
  const turret = new Group()
  turret.position.y = 0.032
  turret.add(part(m, (b) => {
    b.cyl(0.02, 0.022, 0.02, 0, 0.01, 0, body, 'solid', 24)
    b.box(0.03, 0.028, 0.034, 0.004, 0.03, 0, body)
    b.add(new CylinderGeometry(0.014, 0.014, 0.04, 20), accent, 'solid', T(0.006, 0.04, 0).multiply(RX(HALF_PI)))
  }, 'arm-turret'))
  root.add(turret)
  const shoulder = new Group()
  shoulder.position.set(0.006, 0.04, 0)
  shoulder.add(part(m, (b) => {
    b.box(0.022, 0.1, 0.02, 0, 0.05, 0.0, body)
    b.add(new CylinderGeometry(0.012, 0.012, 0.03, 20), accent, 'solid', T(0, 0.1, 0).multiply(RX(HALF_PI)))
  }, 'arm-upper'))
  turret.add(shoulder)
  const elbow = new Group()
  elbow.position.set(0, 0.1, 0)
  elbow.add(part(m, (b) => {
    b.box(0.018, 0.018, 0.02, 0, 0.004, 0, body)
    b.cyl(0.0085, 0.01, 0.085, 0, 0.05, 0, body, 'solid', 18)
    b.cyl(0.009, 0.009, 0.01, 0, 0.095, 0, accent, 'solid', 18)
  }, 'arm-fore'))
  shoulder.add(elbow)
  const wrist = new Group()
  wrist.position.set(0, 0.1, 0)
  wrist.add(part(m, (b) => {
    b.add(new CylinderGeometry(0.008, 0.008, 0.018, 18), accent, 'solid', RX(HALF_PI))
    b.cyl(0.007, 0.007, 0.012, 0, 0.012, 0, P.steelLight, 'metal', 18)
    b.box(0.018, 0.004, 0.01, 0, 0.02, 0, P.steelDark)
  }, 'arm-wrist'))
  elbow.add(wrist)
  const tool = new Group()
  tool.position.set(0, 0.022, 0)
  wrist.add(tool)
  const finger = (side: number) => {
    const f = new Group()
    f.position.set(side * 0.005, 0, 0)
    f.add(part(m, (b) => b.box(0.003, 0.014, 0.008, 0, 0.007, 0, P.steelLight, 'metal'), 'finger'))
    tool.add(f)
    return f
  }
  return { root, turret, shoulder, elbow, wrist, fingers: [finger(-1), finger(1)], tool }
}

/** Pose helper: angles in radians; grip 0 = open, 1 = closed. */
export function poseArm(arm: RobotArm, yaw: number, shoulder: number, elbow: number, wrist: number, grip = 0) {
  arm.turret.rotation.y = yaw
  arm.shoulder.rotation.z = shoulder
  arm.elbow.rotation.z = elbow
  arm.wrist.rotation.z = wrist
  const g = 0.0075 - grip * 0.0045
  arm.fingers[0].position.x = -g
  arm.fingers[1].position.x = g
}
