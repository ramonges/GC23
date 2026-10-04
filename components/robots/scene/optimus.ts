import { CatmullRomCurve3, CylinderGeometry, ExtrudeGeometry, Shape, TubeGeometry, Vector3 } from 'three'
import { barrel, capsule, drum, loft, merge, piece, rbox, sectionAt, type Section } from './geometry'
import type { PartSpec } from './placeholder'

/**
 * Procedural Tesla Optimus (Gen 2 silhouette), modelled at 1.73 m from public reference renders.
 * Feet rest on y = 0, the robot faces +z, and its left side (`_L`) is +x.
 */

const HEAD: Section[] = [
  { y: 1.495, w: 0.06, d: 0.07, z: 0.012 },
  { y: 1.515, w: 0.105, d: 0.13, z: 0.008 },
  { y: 1.55, w: 0.14, d: 0.178, z: 0.002 },
  { y: 1.6, w: 0.158, d: 0.205, z: -0.006 },
  { y: 1.65, w: 0.162, d: 0.212, z: -0.012 },
  { y: 1.69, w: 0.145, d: 0.19, z: -0.016 },
  { y: 1.715, w: 0.105, d: 0.135, z: -0.018 },
  { y: 1.73, w: 0.03, d: 0.04, z: -0.018 },
]
const VISOR_ARC: [number, number] = [Math.PI / 2 - 1.08, Math.PI / 2 + 1.08]

function head(): PartSpec[] {
  const ys = [1.505, 1.53, 1.56, 1.6, 1.64, 1.67, 1.69]
  const visor = ys.map((y) => {
    const s = sectionAt(HEAD, y)
    return { ...s, w: s.w * 1.018, d: s.d * 1.018 }
  })
  const edge = (s: Section, t: number) => {
    const e = 2 / (s.n ?? 2)
    const c = Math.cos(t)
    const sn = Math.sin(t)
    return new Vector3((s.w / 2) * 1.012 * Math.sign(c) * Math.abs(c) ** e, s.y, (s.z ?? 0) + (s.d / 2) * 1.012 * Math.sign(sn) * Math.abs(sn) ** e)
  }
  const top = visor[visor.length - 1]
  const bottom = visor[0]
  const rim = [
    ...visor.map((s) => edge(s, VISOR_ARC[0])),
    ...[0.25, 0.5, 0.75].map((f) => edge(top, VISOR_ARC[0] + (VISOR_ARC[1] - VISOR_ARC[0]) * f)),
    ...visor
      .slice()
      .reverse()
      .map((s) => edge(s, VISOR_ARC[1])),
    ...[0.75, 0.5, 0.25].map((f) => edge(bottom, VISOR_ARC[0] + (VISOR_ARC[1] - VISOR_ARC[0]) * f)),
  ]
  // The light strip carries on over the crown from the visor's upper corners.
  const crown = (side: 1 | -1) =>
    new CatmullRomCurve3([edge(top, side > 0 ? VISOR_ARC[0] : VISOR_ARC[1]), ...[1.705, 1.72].map((y) => edge(sectionAt(HEAD, y), Math.PI / 2 - side * 1.25)), edge(sectionAt(HEAD, 1.722), -Math.PI / 2 + side * 0.9)])
  return [
    { name: 'skull_shell', geometry: loft(HEAD, { n: 2.15, seg: 64 }), position: [0, 0, 0], finish: 'gloss', explode: [0, 1, 0] },
    { name: 'head_sensors', geometry: loft(visor, { n: 2.15, seg: 40, arc: VISOR_ARC }), position: [0, 0, 0], finish: 'glass', explode: [0, 0.6, 1] },
    {
      name: 'head_sensors',
      geometry: merge(new TubeGeometry(new CatmullRomCurve3(rim, true), 160, 0.0022, 6, true), new TubeGeometry(crown(1), 40, 0.0018, 6), new TubeGeometry(crown(-1), 40, 0.0018, 6)),
      position: [0, 0, 0],
      finish: 'glow',
      explode: [0, 0.6, 1],
    },
    {
      name: 'actuator_neck',
      geometry: loft(
        [
          { y: 1.405, w: 0.15, d: 0.14, z: -0.014 },
          { y: 1.44, w: 0.12, d: 0.118, z: -0.01 },
          { y: 1.475, w: 0.094, d: 0.1, z: -0.004 },
          { y: 1.52, w: 0.084, d: 0.094, z: 0.002 },
        ],
        { n: 2.4 },
      ),
      position: [0, 0, 0],
      finish: 'satin',
      explode: [0, 1, 0],
    },
  ]
}

function torso(): PartSpec[] {
  const chest: Section[] = [
    { y: 1.07, w: 0.262, d: 0.188 },
    { y: 1.15, w: 0.276, d: 0.198 },
    { y: 1.27, w: 0.298, d: 0.21 },
    { y: 1.36, w: 0.312, d: 0.216 },
    { y: 1.405, w: 0.3, d: 0.2 },
  ]
  const yoke: Section[] = [
    { y: 1.372, w: 0.326, d: 0.228 },
    { y: 1.402, w: 0.322, d: 0.224 },
    { y: 1.428, w: 0.262, d: 0.192 },
    { y: 1.443, w: 0.17, d: 0.142 },
    { y: 1.45, w: 0.11, d: 0.11 },
  ]
  const waist: Section[] = [
    { y: 0.972, w: 0.19, d: 0.142 },
    { y: 1.0, w: 0.232, d: 0.164 },
    { y: 1.04, w: 0.258, d: 0.176 },
    { y: 1.085, w: 0.266, d: 0.184 },
  ]
  const bay = new Shape()
  bay.moveTo(-0.1, -0.14)
  bay.lineTo(0.1, -0.14)
  bay.quadraticCurveTo(0.104, -0.14, 0.1, -0.13)
  bay.lineTo(0.062, 0.125)
  bay.quadraticCurveTo(0.06, 0.135, 0.05, 0.135)
  bay.lineTo(-0.05, 0.135)
  bay.quadraticCurveTo(-0.06, 0.135, -0.062, 0.125)
  bay.lineTo(-0.1, -0.13)
  bay.quadraticCurveTo(-0.104, -0.14, -0.1, -0.14)
  const bayPlate = new ExtrudeGeometry(bay, { depth: 0.022, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2, curveSegments: 6 })
  bayPlate.translate(0, 0, -0.022)

  const harness = (x: number) =>
    new TubeGeometry(new CatmullRomCurve3([new Vector3(x, 0.98, -0.03), new Vector3(x * 1.1, 1.12, -0.02), new Vector3(x * 1.05, 1.28, -0.02), new Vector3(x * 0.6, 1.4, -0.01)]), 32, 0.009, 8)
  const ribs = Array.from({ length: 6 }, (_, i) => piece(new CylinderGeometry(0.046, 0.046, 0.011, 24), [0, 0.965 + i * 0.016, -0.045]))

  return [
    { name: 'torso_shell', geometry: loft(chest, { n: 3.4, seg: 64 }), position: [0, 0, 0], finish: 'shell', explode: [0, 0.1, 1] },
    { name: 'torso_shell', geometry: loft(yoke, { n: 3, seg: 64 }), position: [0, 0, 0], finish: 'satin', explode: [0, 0.1, 1] },
    { name: 'torso_shell', geometry: loft(waist, { n: 3, seg: 56 }), position: [0, 0, 0], finish: 'satin', explode: [0, 0.1, 1] },
    {
      name: 'torso_frame',
      geometry: merge(...ribs, piece(rbox(0.05, 0.36, 0.05, 0.01), [0, 1.2, -0.05]), piece(rbox(0.26, 0.035, 0.05, 0.01), [0, 1.37, -0.04])),
      position: [0, 0, 0],
      finish: 'housing',
      explode: [0, 0, -1],
    },
    { name: 'battery_torso', geometry: piece(bayPlate, [0, 1.205, -0.086], [-0.045, 0, 0]), position: [0, 0, 0], finish: 'battery', explode: [0, -0.1, -1] },
    { name: 'battery_torso', geometry: merge(piece(rbox(0.2, 0.075, 0.075, 0.018), [0, 1.03, -0.085]), piece(rbox(0.21, 0.2, 0.09, 0.015), [0, 1.2, -0.04])), position: [0, 0, 0], finish: 'battery', explode: [0, -0.1, -1] },
    { name: 'compute_torso', geometry: merge(rbox(0.18, 0.1, 0.035, 0.006), piece(rbox(0.15, 0.08, 0.02, 0.004), [0, 0, -0.025])), position: [0, 1.3, 0.05], finish: 'board', explode: [0, 0.55, 0.85] },
    { name: 'wiring_harness', geometry: merge(harness(0.11), harness(-0.11)), position: [0, 0, 0], finish: 'cable', explode: [0, 0, -0.5] },
    {
      name: 'pelvis_frame',
      geometry: merge(rbox(0.22, 0.11, 0.15, 0.025), piece(rbox(0.1, 0.07, 0.115, 0.02), [0, -0.07, 0.012]), piece(rbox(0.16, 0.03, 0.1, 0.01), [0, 0.06, -0.005])),
      position: [0, 0.92, -0.008],
      finish: 'housing',
      explode: [0, -0.4, -0.6],
    },
  ]
}

function arm(s: 'L' | 'R'): PartSpec[] {
  const k = s === 'L' ? 1 : -1
  const x = 0.198 * k
  const upper: Section[] = [
    { y: 1.125, w: 0.08, d: 0.084 },
    { y: 1.15, w: 0.088, d: 0.092 },
    { y: 1.3, w: 0.1, d: 0.105 },
    { y: 1.405, w: 0.106, d: 0.114 },
    { y: 1.432, w: 0.09, d: 0.1 },
    { y: 1.444, w: 0.05, d: 0.06 },
  ]
  const fore: Section[] = [
    { y: 0.95, w: 0.052, d: 0.058 },
    { y: 0.97, w: 0.06, d: 0.066 },
    { y: 1.04, w: 0.075, d: 0.08 },
    { y: 1.105, w: 0.08, d: 0.086 },
  ]
  const ribs = Array.from({ length: 6 }, (_, i) => piece(rbox(0.016, 0.0105, 0.058, 0.004), [0.034 * k, 1.022 + i * 0.0155, 0.004]))
  const fingers = [
    { z: -0.031, len: 0.034 },
    { z: -0.0105, len: 0.042 },
    { z: 0.0105, len: 0.04 },
    { z: 0.031, len: 0.032 },
  ]
  const curl = -0.28 * k
  return [
    { name: `actuator_shoulder_${s}`, geometry: merge(piece(drum(0.044, 0.07), [-0.05 * k, 0, 0]), piece(rbox(0.022, 0.078, 0.078, 0.008), [0.052 * k, -0.005, -0.008])), position: [x, 1.39, 0], finish: 'satin' },
    { name: `upper_arm_${s}`, geometry: loft(upper, { n: 3.2 }), position: [x, 0, 0], finish: 'shell' },
    { name: `actuator_elbow_${s}`, geometry: merge(new CylinderGeometry(0.04, 0.04, 0.02, 28), drum(0.03, 0.085)), position: [x, 1.113, 0], finish: 'satin' },
    { name: `forearm_${s}`, geometry: loft(fore, { n: 3 }), position: [x, 0, 0.004], finish: 'shell' },
    { name: `forearm_${s}`, geometry: merge(...ribs), position: [x, 0, 0], finish: 'satin' },
    {
      name: `forearm_${s}`,
      geometry: merge(piece(new CylinderGeometry(0.011, 0.011, 0.065, 16), [0.008 * k, 0.915, -0.016]), piece(new CylinderGeometry(0.011, 0.011, 0.065, 16), [0.008 * k, 0.915, 0.018]), piece(rbox(0.04, 0.02, 0.05, 0.006), [0, 0.952, 0])),
      position: [x, 0, 0],
      finish: 'housing',
    },
    { name: `forearm_${s}`, geometry: piece(new CylinderGeometry(0.0055, 0.0055, 0.09, 12), [-0.008 * k, 0.9, 0.0]), position: [x, 0, 0], finish: 'chrome' },
    { name: `hand_${s}`, geometry: merge(piece(rbox(0.034, 0.03, 0.046, 0.008), [0, 0.866, 0]), piece(rbox(0.03, 0.1, 0.086, 0.013), [-0.005 * k, 0.8, 0.004])), position: [x, 0, 0], finish: 'satin' },
    { name: `hand_${s}`, geometry: piece(rbox(0.013, 0.092, 0.082, 0.005), [0.014 * k, 0.804, 0.004]), position: [x, 0, 0], finish: 'shell' },
    {
      name: `hand_${s}`,
      geometry: merge(
        ...fingers.map((f) => piece(capsule(0.0085, f.len), [0.004 * k, 0.745 - f.len / 2, f.z], [0, 0, curl * 0.5])),
        piece(capsule(0.0105, 0.04), [-0.008 * k, 0.785, 0.052], [-0.55, 0, curl]),
      ),
      position: [x, 0, 0],
      finish: 'shell',
    },
    {
      name: `hand_${s}`,
      geometry: merge(...fingers.map((f) => piece(capsule(0.0078, 0.022), [-0.008 * k, 0.726 - f.len, f.z], [0, 0, curl * 1.6]))),
      position: [x, 0, 0],
      finish: 'satin',
    },
  ]
}

function leg(s: 'L' | 'R'): PartSpec[] {
  const k = s === 'L' ? 1 : -1
  const x = 0.084 * k
  const thigh: Section[] = [
    { y: 0.5, w: 0.094, d: 0.108, z: 0.006 },
    { y: 0.58, w: 0.114, d: 0.134, z: 0.004 },
    { y: 0.7, w: 0.142, d: 0.166 },
    { y: 0.8, w: 0.158, d: 0.18, z: -0.004 },
    { y: 0.855, w: 0.162, d: 0.178, z: -0.006 },
  ]
  const knee: Section[] = [
    { y: 0.425, w: 0.064, d: 0.072, z: 0.012 },
    { y: 0.455, w: 0.08, d: 0.09, z: 0.012 },
    { y: 0.505, w: 0.084, d: 0.094, z: 0.01 },
    { y: 0.53, w: 0.07, d: 0.08, z: 0.01 },
  ]
  const foot = new Shape()
  foot.moveTo(-0.085, 0)
  foot.lineTo(0.15, 0)
  foot.quadraticCurveTo(0.178, 0.002, 0.176, 0.02)
  foot.quadraticCurveTo(0.17, 0.038, 0.14, 0.042)
  foot.lineTo(0.05, 0.062)
  foot.quadraticCurveTo(0.0, 0.086, -0.04, 0.086)
  foot.quadraticCurveTo(-0.086, 0.084, -0.09, 0.05)
  foot.quadraticCurveTo(-0.092, 0.004, -0.085, 0)
  const footGeom = new ExtrudeGeometry(foot, { depth: 0.082, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 3, curveSegments: 10 })
  footGeom.translate(0, 0, -0.041)
  const pair = (y: number, z: number, r: number, h: number) =>
    merge(piece(new CylinderGeometry(r, r, h, 20), [0.022 * k, y, z]), piece(new CylinderGeometry(r, r, h, 20), [-0.018 * k, y, z]))
  return [
    {
      name: `actuator_hip_${s}`,
      geometry: merge(piece(barrel(0.066, 0.12, 40), [0.072 * k, 0.915, -0.135]), piece(drum(0.04, 0.09), [0.088 * k, 0.9, 0.0]), piece(rbox(0.08, 0.075, 0.1, 0.018), [0.088 * k, 0.86, 0.018])),
      position: [0, 0, 0],
      finish: 'housing',
    },
    { name: `thigh_${s}`, geometry: loft(thigh, { n: 3.2 }), position: [x, 0, 0], finish: 'shell' },
    {
      name: `actuator_knee_${s}`,
      geometry: merge(drum(0.04, 0.078), piece(new CylinderGeometry(0.022, 0.022, 0.16, 20), [0, 0.12, -0.07]), piece(rbox(0.06, 0.06, 0.05, 0.012), [0, 0.045, -0.055])),
      position: [x, 0.5, -0.022],
      finish: 'housing',
    },
    { name: `shin_${s}`, geometry: merge(loft(knee, { n: 2.6 }), piece(rbox(0.04, 0.3, 0.03, 0.012), [0, 0.28, 0.022])), position: [x, 0, 0], finish: 'shell' },
    { name: `shin_${s}`, geometry: pair(0.27, -0.008, 0.0065, 0.3), position: [x, 0, 0], finish: 'chrome' },
    { name: `actuator_ankle_${s}`, geometry: pair(0.34, -0.032, 0.021, 0.15), position: [x, 0, 0], finish: 'satin' },
    { name: `actuator_ankle_${s}`, geometry: merge(pair(0.205, -0.032, 0.0072, 0.13), piece(drum(0.026, 0.06), [0, 0.118, -0.008])), position: [x, 0, 0], finish: 'chrome' },
    { name: `foot_${s}`, geometry: piece(footGeom, [0, 0.008, 0.0], [0, -Math.PI / 2, 0]), position: [x, 0, 0.012], finish: 'satin' },
    { name: `foot_${s}`, geometry: rbox(0.096, 0.012, 0.262, 0.005), position: [x, 0.006, 0.058], finish: 'housing' },
  ]
}

export function optimus(): PartSpec[] {
  return [...head(), ...torso(), ...arm('L'), ...arm('R'), ...leg('L'), ...leg('R')]
}
