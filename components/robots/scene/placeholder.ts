import { BoxGeometry, BufferGeometry, CatmullRomCurve3, CylinderGeometry, SphereGeometry, TubeGeometry, Vector3 } from 'three'
import type { Archetype } from '@/lib/robots/types'
import { capsule, drum, ellipsoid, merge, piece, rbox, type V3 } from './geometry'
import { optimus } from './optimus'

export type Finish =
  | 'shell'
  | 'frame'
  | 'dark'
  | 'actuator'
  | 'rubber'
  | 'glass'
  | 'accent'
  | 'battery'
  | 'board'
  | 'cable'
  | 'gloss'
  | 'satin'
  | 'housing'
  | 'chrome'
  | 'glow'

/** Several specs may share a name: they render as separate meshes but hover, pin and explode as one part. */
export type PartSpec = {
  name: string
  geometry: BufferGeometry
  position: [number, number, number]
  rotation?: [number, number, number]
  finish: Finish
  /** Direction the part travels in exploded view; derived from its offset to the robot centre when omitted. */
  explode?: [number, number, number]
}

function scaleSpecs(specs: PartSpec[], s: number) {
  return specs.map((p) => {
    p.geometry.scale(s, s, s)
    p.position = [p.position[0] * s, p.position[1] * s, p.position[2] * s]
    return p
  })
}

function humanoidTorso(opts: { headStyle: 'visor' | 'dome' | 'bar' | 'round'; shoulderY: number; pelvisY: number }): PartSpec[] {
  const { shoulderY, pelvisY, headStyle } = opts
  const torsoY = (shoulderY + pelvisY) / 2 + 0.02
  const torsoH = shoulderY - pelvisY + 0.02
  const specs: PartSpec[] = [
    { name: 'pelvis_frame', geometry: rbox(0.3, 0.12, 0.17, 0.03), position: [0, pelvisY, -0.005], finish: 'dark', explode: [0, -0.4, -0.6] },
    {
      name: 'torso_frame',
      geometry: merge(rbox(0.06, torsoH, 0.06), piece(rbox(0.42, 0.05, 0.06), [0, torsoH / 2 - 0.03, 0.01]), piece(rbox(0.28, 0.04, 0.06), [0, -torsoH / 2 + 0.03, 0.01])),
      position: [0, torsoY, -0.07],
      finish: 'frame',
      explode: [0, 0, -1],
    },
    { name: 'battery_torso', geometry: rbox(0.24, torsoH * 0.68, 0.12, 0.015), position: [0, torsoY - 0.03, -0.005], finish: 'battery', explode: [0, -0.15, -0.9] },
    { name: 'compute_torso', geometry: merge(rbox(0.18, 0.1, 0.035, 0.006), piece(new BoxGeometry(0.15, 0.08, 0.02), [0, 0, -0.025])), position: [0, shoulderY - 0.06, 0.03], finish: 'board', explode: [0, 0.55, 0.85] },
    {
      name: 'torso_shell',
      geometry: merge(piece(rbox(0.36, torsoH * 0.95, 0.05, 0.022), [0, 0, 0.09]), piece(rbox(0.34, torsoH * 0.9, 0.04, 0.02), [0, 0, -0.12])),
      position: [0, torsoY, 0],
      finish: 'shell',
      explode: [0, 0.05, 1],
    },
  ]
  const tube = (x: number) =>
    new TubeGeometry(new CatmullRomCurve3([new Vector3(x, -torsoH / 2, -0.02), new Vector3(x * 1.08, 0, 0.0), new Vector3(x * 0.9, torsoH / 2 - 0.02, -0.02)]), 24, 0.011, 8)
  specs.push({ name: 'wiring_harness', geometry: merge(tube(0.155), tube(-0.155)), position: [0, torsoY, 0], finish: 'cable', explode: [0, 0, -0.5] })

  const headY = shoulderY + 0.22
  specs.push({ name: 'actuator_neck', geometry: new CylinderGeometry(0.038, 0.042, 0.07, 24), position: [0, shoulderY + 0.07, 0], finish: 'actuator', explode: [0, 1, 0] })
  if (headStyle === 'bar') {
    specs.push({ name: 'skull_shell', geometry: rbox(0.16, 0.12, 0.15, 0.03), position: [0, headY - 0.02, 0], finish: 'shell', explode: [0, 1, 0] })
    specs.push({ name: 'head_sensors', geometry: merge(rbox(0.26, 0.05, 0.08, 0.02), piece(new CylinderGeometry(0.035, 0.035, 0.04, 20), [0, 0.045, 0])), position: [0, headY + 0.055, 0.01], finish: 'glass', explode: [0, 1, 0.5] })
  } else {
    const skull = headStyle === 'round' ? ellipsoid(0.105, 0.125, 0.11) : headStyle === 'dome' ? ellipsoid(0.095, 0.115, 0.105) : ellipsoid(0.1, 0.13, 0.115)
    specs.push({ name: 'skull_shell', geometry: skull, position: [0, headY, 0], finish: 'shell', explode: [0, 1, 0] })
    const face =
      headStyle === 'dome'
        ? merge(piece(new CylinderGeometry(0.045, 0.05, 0.05, 24), [0, 0.12, -0.01]), piece(rbox(0.12, 0.05, 0.02, 0.01), [0, 0, 0.1]))
        : headStyle === 'round'
          ? piece(rbox(0.14, 0.06, 0.02, 0.01), [0, 0, 0.105])
          : piece(rbox(0.16, 0.075, 0.03, 0.014), [0, 0, 0.1])
    specs.push({ name: 'head_sensors', geometry: face, position: [0, headY + 0.005, 0], finish: 'glass', explode: [0, 0.7, 1] })
  }
  return specs
}

function arms(o: { shoulderY: number; x: number; hand: 'dexterous' | 'gripper' | 'blunt'; thin?: boolean }): PartSpec[] {
  const out: PartSpec[] = []
  const r = o.thin ? 0.036 : 0.046
  for (const [s, sign] of [['L', 1], ['R', -1]] as const) {
    const x = o.x * sign
    const y0 = o.shoulderY - 0.01
    out.push(
      { name: `actuator_shoulder_${s}`, geometry: drum(0.055, 0.1), position: [x, y0, 0], finish: 'actuator' },
      { name: `upper_arm_${s}`, geometry: capsule(r, 0.15), position: [x + 0.02 * sign, y0 - 0.15, 0], finish: 'shell' },
      { name: `actuator_elbow_${s}`, geometry: drum(0.045, 0.09), position: [x + 0.02 * sign, y0 - 0.3, 0], finish: 'actuator' },
      { name: `forearm_${s}`, geometry: capsule(r * 0.92, 0.14), position: [x + 0.02 * sign, y0 - 0.44, 0.01], finish: 'shell' },
    )
    const hy = y0 - 0.6
    if (o.hand === 'blunt') {
      out.push({ name: `end_effector_${s}`, geometry: ellipsoid(0.035, 0.05, 0.035), position: [x + 0.02 * sign, hy + 0.03, 0.01], finish: 'dark' })
    } else {
      const fingers = o.hand === 'gripper' ? [-0.02, 0.02] : [-0.024, -0.008, 0.008, 0.024]
      const geom = merge(
        rbox(0.075, 0.085, 0.03, 0.01),
        ...fingers.map((fx) => piece(rbox(o.hand === 'gripper' ? 0.018 : 0.013, 0.065, 0.016, 0.006), [fx, -0.07, 0])),
        piece(rbox(0.014, 0.05, 0.016, 0.006), [0.045 * sign, -0.02, 0.012], [0, 0, 0.5 * sign]),
      )
      out.push({ name: `hand_${s}`, geometry: geom, position: [x + 0.02 * sign, hy, 0.01], finish: 'dark' })
    }
  }
  return out
}

function straightLegs(pelvisY: number): PartSpec[] {
  const out: PartSpec[] = []
  for (const [s, sign] of [['L', 1], ['R', -1]] as const) {
    const x = 0.1 * sign
    out.push(
      { name: `actuator_hip_${s}`, geometry: drum(0.066, 0.12), position: [x, pelvisY - 0.06, 0], finish: 'actuator' },
      { name: `thigh_${s}`, geometry: capsule(0.068, 0.22), position: [x, pelvisY - 0.26, 0], finish: 'shell' },
      { name: `actuator_knee_${s}`, geometry: drum(0.058, 0.11), position: [x, pelvisY - 0.47, 0], finish: 'actuator' },
      { name: `shin_${s}`, geometry: capsule(0.052, 0.25), position: [x, pelvisY - 0.68, 0], finish: 'shell' },
      { name: `actuator_ankle_${s}`, geometry: drum(0.042, 0.09), position: [x, 0.1, 0], finish: 'actuator' },
      { name: `foot_${s}`, geometry: merge(rbox(0.1, 0.05, 0.25, 0.02), piece(rbox(0.1, 0.02, 0.25, 0.008), [0, -0.03, 0])), position: [x, 0.04, 0.04], finish: 'dark' },
    )
  }
  return out
}

function digitigradeLegs(pelvisY: number, scale = 1): PartSpec[] {
  const out: PartSpec[] = []
  const k = scale
  for (const [s, sign] of [['L', 1], ['R', -1]] as const) {
    const x = 0.11 * sign * k
    const hip: V3 = [x, pelvisY - 0.05 * k, 0]
    const knee: V3 = [x, pelvisY * 0.62, 0.16 * k]
    const ankle: V3 = [x, 0.13 * k, -0.07 * k]
    const mid = (a: V3, b: V3): V3 => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]
    const len = (a: V3, b: V3) => Math.hypot(a[1] - b[1], a[2] - b[2])
    const tilt = (a: V3, b: V3) => -Math.atan2(a[2] - b[2], a[1] - b[1])
    out.push(
      { name: `actuator_hip_${s}`, geometry: drum(0.066 * k, 0.12 * k), position: hip, finish: 'actuator' },
      { name: `thigh_${s}`, geometry: capsule(0.06 * k, len(hip, knee) - 0.1 * k), position: mid(hip, knee), rotation: [tilt(hip, knee), 0, 0], finish: 'shell' },
      { name: `actuator_knee_${s}`, geometry: drum(0.055 * k, 0.11 * k), position: knee, finish: 'actuator' },
      { name: `shin_${s}`, geometry: capsule(0.045 * k, len(knee, ankle) - 0.08 * k), position: mid(knee, ankle), rotation: [tilt(knee, ankle), 0, 0], finish: 'shell' },
      { name: `actuator_ankle_${s}`, geometry: drum(0.04 * k, 0.085 * k), position: ankle, finish: 'actuator' },
      { name: `foot_${s}`, geometry: rbox(0.085 * k, 0.045 * k, 0.2 * k, 0.015 * k), position: [x, 0.03 * k, 0.0], finish: 'dark' },
    )
  }
  return out
}

function humanoid(variant: string): PartSpec[] {
  const headStyle = variant === 'neo' ? 'round' : variant === 'g1' ? 'dome' : 'visor'
  return [
    ...humanoidTorso({ headStyle, shoulderY: 1.43, pelvisY: 0.97 }),
    ...arms({ shoulderY: 1.43, x: 0.235, hand: variant === 'g1' ? 'gripper' : 'dexterous' }),
    ...straightLegs(0.97),
  ]
}

function digitigrade(): PartSpec[] {
  return [...humanoidTorso({ headStyle: 'bar', shoulderY: 1.45, pelvisY: 1.02 }), ...arms({ shoulderY: 1.45, x: 0.24, hand: 'blunt', thin: true }), ...digitigradeLegs(1.02)]
}

function droid(): PartSpec[] {
  const plate = (w: number, h: number, d: number, p: V3) => piece(rbox(w, h, d, 0.012), p)
  const legs = digitigradeLegs(0.36, 0.38).map((p) => ({ ...p, position: [Math.sign(p.position[0]) * 0.075, p.position[1], p.position[2]] as V3 }))
  return [
    { name: 'pelvis_frame', geometry: rbox(0.17, 0.05, 0.12, 0.012), position: [0, 0.35, -0.02], finish: 'dark', explode: [0, -1, -0.4] },
    {
      name: 'torso_shell',
      geometry: merge(plate(0.24, 0.02, 0.28, [0, 0.08, 0]), plate(0.02, 0.15, 0.28, [0.11, 0, 0]), plate(0.02, 0.15, 0.28, [-0.11, 0, 0]), plate(0.22, 0.15, 0.02, [0, 0, 0.13]), plate(0.22, 0.15, 0.02, [0, 0, -0.13])),
      position: [0, 0.43, 0],
      finish: 'shell',
      explode: [0, 0.2, 1],
    },
    { name: 'battery_torso', geometry: rbox(0.16, 0.07, 0.18, 0.01), position: [0, 0.4, -0.01], finish: 'battery', explode: [-1, -0.2, -0.3] },
    { name: 'compute_torso', geometry: rbox(0.12, 0.03, 0.09, 0.005), position: [0, 0.46, 0.03], finish: 'board', explode: [1, 0.3, 0.3] },
    {
      name: 'wiring_harness',
      geometry: new TubeGeometry(new CatmullRomCurve3([new Vector3(-0.07, -0.05, -0.08), new Vector3(0, 0.02, -0.1), new Vector3(0.07, 0.08, -0.06), new Vector3(0, 0.13, 0)]), 30, 0.008, 8),
      position: [0, 0.4, 0],
      finish: 'cable',
      explode: [0, 0, -1],
    },
    { name: 'actuator_neck', geometry: merge(new CylinderGeometry(0.03, 0.035, 0.07, 20), piece(drum(0.028, 0.06), [0, 0.04, 0])), position: [0, 0.53, 0.02], finish: 'actuator', explode: [0, 1, 0] },
    { name: 'skull_shell', geometry: rbox(0.25, 0.15, 0.2, 0.045), position: [0, 0.62, 0.06], finish: 'shell', explode: [0, 1, 0.25] },
    {
      name: 'head_sensors',
      geometry: merge(piece(new CylinderGeometry(0.03, 0.03, 0.02, 24), [0.055, 0, 0], [Math.PI / 2, 0, 0]), piece(new CylinderGeometry(0.03, 0.03, 0.02, 24), [-0.055, 0, 0], [Math.PI / 2, 0, 0])),
      position: [0, 0.625, 0.165],
      finish: 'glass',
      explode: [0, 0.4, 1],
    },
    ...legs,
  ]
}

function desktop(): PartSpec[] {
  const servos: PartSpec[] = []
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6
    const x = Math.sin(a) * 0.042
    const z = Math.cos(a) * 0.042
    servos.push({
      name: `actuator_head_${i + 1}`,
      geometry: merge(rbox(0.022, 0.018, 0.03, 0.004), piece(new CylinderGeometry(0.003, 0.003, 0.05, 8), [0, 0.03, 0], [0, 0, (i % 2 ? 1 : -1) * 0.35])),
      position: [x, 0.132, z],
      rotation: [0, a, 0],
      finish: 'actuator',
    })
  }
  return [
    { name: 'base_shell', geometry: new CylinderGeometry(0.068, 0.085, 0.105, 48), position: [0, 0.0525, 0], finish: 'shell', explode: [0, -0.4, 1] },
    { name: 'battery_base', geometry: rbox(0.07, 0.03, 0.05, 0.006), position: [0, 0.03, -0.015], finish: 'battery', explode: [-1, -0.3, 0] },
    { name: 'compute_base', geometry: rbox(0.085, 0.012, 0.056, 0.003), position: [0, 0.07, 0], finish: 'board', explode: [1, 0, 0] },
    { name: 'speaker', geometry: new CylinderGeometry(0.024, 0.024, 0.012, 32), position: [0, 0.05, 0.072], rotation: [Math.PI / 2 - 0.25, 0, 0], finish: 'dark', explode: [0, 0, 1] },
    { name: 'actuator_body', geometry: new CylinderGeometry(0.05, 0.05, 0.016, 40), position: [0, 0.114, 0], finish: 'actuator', explode: [0, 0.2, -1] },
    {
      name: 'wiring_harness',
      geometry: new TubeGeometry(new CatmullRomCurve3([new Vector3(0.02, 0.02, -0.02), new Vector3(0.03, 0.06, -0.04), new Vector3(0.0, 0.1, -0.03)]), 16, 0.004, 6),
      position: [0, 0, 0],
      finish: 'cable',
      explode: [0, 0, -1],
    },
    ...servos,
    { name: 'head_shell', geometry: ellipsoid(0.075, 0.056, 0.07), position: [0, 0.2, 0], finish: 'shell', explode: [0, 1, 0] },
    {
      name: 'head_sensors',
      geometry: merge(piece(new CylinderGeometry(0.017, 0.017, 0.012, 24), [0.03, 0, 0], [Math.PI / 2, 0, 0]), piece(new CylinderGeometry(0.017, 0.017, 0.012, 24), [-0.03, 0, 0], [Math.PI / 2, 0, 0])),
      position: [0, 0.205, 0.066],
      finish: 'glass',
      explode: [0, 0.5, 1],
    },
    { name: 'actuator_antenna_L', geometry: rbox(0.018, 0.016, 0.022, 0.004), position: [0.036, 0.25, -0.012], finish: 'actuator', explode: [1, 1, 0] },
    { name: 'actuator_antenna_R', geometry: rbox(0.018, 0.016, 0.022, 0.004), position: [-0.036, 0.25, -0.012], finish: 'actuator', explode: [-1, 1, 0] },
    { name: 'antenna_L', geometry: merge(new CylinderGeometry(0.0025, 0.0025, 0.07, 8), piece(new SphereGeometry(0.006, 12, 8), [0, 0.036, 0])), position: [0.048, 0.29, -0.012], rotation: [0, 0, -0.3], finish: 'accent', explode: [1, 1, 0] },
    { name: 'antenna_R', geometry: merge(new CylinderGeometry(0.0025, 0.0025, 0.07, 8), piece(new SphereGeometry(0.006, 12, 8), [0, 0.036, 0])), position: [-0.048, 0.29, -0.012], rotation: [0, 0, 0.3], finish: 'accent', explode: [-1, 1, 0] },
  ]
}

/** Procedural stand-in whose mesh names match robots.json, so a real GLB can replace it 1:1. */
export function buildPlaceholder(archetype: Archetype, robotId: string, height: number): PartSpec[] {
  switch (archetype) {
    case 'humanoid':
      if (robotId === 'optimus') return scaleSpecs(optimus(), height / 1.73)
      return scaleSpecs(humanoid(robotId), height / 1.75)
    case 'digitigrade':
      return scaleSpecs(digitigrade(), height / 1.75)
    case 'droid':
      return scaleSpecs(droid(), height / 0.66)
    case 'desktop':
      return scaleSpecs(desktop(), height / 0.28)
  }
}
