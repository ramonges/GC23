import { CylinderGeometry, Group, Matrix4, Mesh, MeshBasicMaterial, SphereGeometry, Vector3 } from 'three'
import { RX, T, part, type Materials } from './core/builder'
import { clamp01, easeInOut, smoothstep } from './core/math'
import { P } from './core/palette'
import { poseArm, robotArm } from './entities'

const HALF_PI = Math.PI / 2

/** Finished mobile manipulator: base, lidar, torso, six-axis arm, wrist camera and status light. */
export function buildFinalRobot(m: Materials) {
  const root = new Group()
  root.name = 'final-robot'
  const body = new Group()
  root.add(body)
  body.add(part(m, (b) => {
    b.box(0.1, 0.024, 0.07, 0, 0.022, 0, '#2a2e2c')
    b.box(0.102, 0.012, 0.072, 0, 0.03, 0, P.aluminum, 'metal')
    b.box(0.09, 0.004, 0.06, 0, 0.0365, 0, '#1f2321')
    b.box(0.004, 0.008, 0.05, 0.051, 0.018, 0, P.steelDark)
    for (const [x, z] of [[0.034, 0.038], [-0.034, 0.038], [0.034, -0.038], [-0.034, -0.038]] as const) {
      b.add(new CylinderGeometry(0.012, 0.012, 0.01, 22), P.hullBlack, 'solid', T(x, 0.012, z).multiply(RX(HALF_PI)))
      b.add(new CylinderGeometry(0.006, 0.006, 0.0105, 16), P.steelLight, 'metal', T(x, 0.012, z).multiply(RX(HALF_PI)))
    }
    b.cyl(0.009, 0.01, 0.009, 0.036, 0.043, 0, P.steelDark, 'solid', 24)
    b.cyl(0.018, 0.02, 0.05, -0.012, 0.063, 0, P.aluminum, 'metal', 28)
    b.cyl(0.021, 0.021, 0.004, -0.012, 0.09, 0, P.steelDark, 'solid', 28)
  }, 'robot-body'))

  const lidarMat = new MeshBasicMaterial({ color: 0x000000 })
  const lidar = new Mesh(new CylinderGeometry(0.0092, 0.0092, 0.002, 28), lidarMat)
  lidar.position.set(0.036, 0.046, 0)
  body.add(lidar)
  const statusMat = new MeshBasicMaterial({ color: 0x000000 })
  const status = new Mesh(new SphereGeometry(0.0032, 14, 10), statusMat)
  status.position.set(-0.04, 0.0395, 0.026)
  body.add(status)

  const housing = part(m, (b) => {
    b.cyl(0.02, 0.02, 0.012, 0, 0.006, 0, P.aluminum, 'metal', 28)
    b.cyl(0.021, 0.021, 0.002, 0, 0.012, 0, P.steelLight, 'metal', 28)
  }, 'robot-housing')
  housing.position.set(-0.012, 0.092, 0)
  body.add(housing)

  const arm = robotArm(m, { scale: 0.62, body: P.warmWhite, accent: '#2a2e2c' })
  arm.root.position.set(-0.012, 0.104, 0)
  body.add(arm.root)
  const lensMat = new MeshBasicMaterial({ color: 0x000000 })
  const camera = part(m, (b) => b.box(0.012, 0.008, 0.012, 0, 0.004, 0.012, P.steelDark), 'wrist-camera')
  const lens = new Mesh(new CylinderGeometry(0.0028, 0.0028, 0.002, 16), lensMat)
  lens.rotation.x = HALF_PI
  lens.position.set(0, 0.004, 0.0185)
  camera.add(lens)
  arm.wrist.add(camera)

  /** `local` is robot progress 0→1 across the finale; `faceYaw` is the yaw that points the robot at the camera. */
  function animate(local: number, faceYaw: number, time: number, motion: boolean) {
    const unfold = easeInOut(smoothstep(0.15, 0.45, local))
    const idle = motion ? Math.sin(time * 0.9) * 0.05 : 0
    poseArm(
      arm,
      -0.6 + unfold * 1.0 + idle,
      0.9 - unfold * 1.35,
      2.2 - unfold * 1.6 + idle * 0.5,
      1.1 - unfold * 0.9,
      smoothstep(0.52, 0.62, local),
    )
    const sensor = smoothstep(0.35, 0.45, local)
    lensMat.color.setRGB(0.6 * sensor, 1.7 * sensor, 2.4 * sensor)
    lidarMat.color.setRGB(0.5 * sensor, 1.3 * sensor, 1.8 * sensor)
    body.rotation.y = faceYaw * easeInOut(smoothstep(0.62, 0.85, local))
    const on = smoothstep(0.86, 0.9, local)
    const pulse = motion ? 0.85 + 0.15 * Math.sin(time * 3) : 1
    statusMat.color.setRGB(4.5 * on * pulse, 1.4 * on * pulse, 0.3 * on * pulse)
    housing.visible = local > 0.12
    return clamp01(local)
  }

  const tip = new Vector3()
  function toolWorld() {
    return arm.tool.getWorldPosition(tip)
  }
  return { root, animate, toolWorld, housingOffset: new Vector3(-0.012, 0.092, 0), bodyMatrix: () => body.matrixWorld as Matrix4 }
}
