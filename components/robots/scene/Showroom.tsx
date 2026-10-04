'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { CameraControls, Environment, Html, Lightformer } from '@react-three/drei'
import CameraControlsImpl from 'camera-controls'
import { Box3, Group, MathUtils, MeshStandardMaterial, Vector3 } from 'three'
import type { Robot } from '@/lib/robots/types'
import { ROBOTS } from '@/lib/robots/data'
import { useExplorer } from '../store'
import RobotModel from './RobotModel'
import { ARC, FRONT, SHOWROOM_CAMERA, detailDistance, focusPoint, pedestalFor, slotFor } from './layout'

const INK = '#080909'
const IDLE_STOP_MS = 30_000
let lastActivity = typeof performance !== 'undefined' ? performance.now() : 0

export type SceneLayout = { mobile: boolean; leftInset: number; rightInset: number }

export default function Showroom({ layout, onReady }: { layout: SceneLayout; onReady: () => void }) {
  useEffect(() => {
    const bump = () => (lastActivity = performance.now())
    window.addEventListener('pointermove', bump, { passive: true })
    window.addEventListener('keydown', bump)
    return () => {
      window.removeEventListener('pointermove', bump)
      window.removeEventListener('keydown', bump)
    }
  }, [])

  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      shadows={layout.mobile ? 'basic' : 'soft'}
      camera={{ fov: 38, near: 0.05, far: 80, position: SHOWROOM_CAMERA.position.toArray() }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.setClearColor(INK)
      }}
      onPointerMissed={() => useExplorer.getState().pinPart(null)}
    >
      <color attach="background" args={[INK]} />
      <fog attach="fog" args={[INK, 11, 24]} />
      <Studio mobile={layout.mobile} />
      <Floor />
      <Suspense fallback={null}>
        {ROBOTS.map((r, i) => (
          <Station key={r.id} robot={r} index={i} />
        ))}
        <Ready onReady={onReady} />
      </Suspense>
      <CameraRig layout={layout} />
    </Canvas>
  )
}

function Ready({ onReady }: { onReady: () => void }) {
  const done = useRef(false)
  useFrame(() => {
    if (done.current) return
    done.current = true
    onReady()
  })
  return null
}

function Studio({ mobile }: { mobile: boolean }) {
  const size = mobile ? 512 : 2048
  return (
    <>
      <hemisphereLight args={['#dfe6ea', '#121415', 0.35]} />
      <directionalLight
        position={[4, 7.5, 6]}
        intensity={2.1}
        castShadow
        shadow-mapSize={[size, size]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-3}
        shadow-camera-near={1}
        shadow-camera-far={25}
      />
      <directionalLight position={[-6, 4, -5]} intensity={1.1} color="#9DB3BE" />
      <spotLight position={[0, 6, 4]} angle={0.5} penumbra={1} intensity={18} distance={14} color="#F1F0E8" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[10, 6, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[-6, 2, 2]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={1.1} position={[6, 2, 1]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} />
        <Lightformer form="ring" intensity={0.8} color="#F36B21" position={[0, 1.5, -8]} scale={2} />
      </Environment>
    </>
  )
}

function Floor() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[30, 96]} />
        <meshStandardMaterial color="#0D0F10" roughness={0.88} metalness={0.05} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[ARC.center.x, 0.002, ARC.center.z]}>
        <ringGeometry args={[ARC.radius - 0.004, ARC.radius + 0.004, 256, 1, Math.PI + 0.62, Math.PI - 1.24]} />
        <meshBasicMaterial color="#303431" toneMapped={false} />
      </mesh>
    </group>
  )
}

function Station({ robot, index }: { robot: Robot; index: number }) {
  const group = useRef<Group>(null)
  const spin = useRef<Group>(null)
  const pedestalMat = useRef<MeshStandardMaterial>(null)
  const ringMat = useRef<MeshStandardMaterial>(null)
  const opacity = useRef(1)
  const slot = useMemo(() => slotFor(index, ROBOTS.length), [index])
  const ped = pedestalFor(robot)
  const selected = useExplorer((s) => s.selected)
  const browsing = useExplorer((s) => s.browsing)
  const select = useExplorer((s) => s.select)
  const setBrowsing = useExplorer((s) => s.setBrowsing)
  const reduced = useRef(false)
  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const isSelected = selected === robot.id
  const hidden = selected !== null && !isSelected
  const highlighted = browsing === robot.id && selected === null
  const target = useMemo(() => new Vector3(), [])

  useFrame((state, dt) => {
    const g = group.current
    const s = spin.current
    if (!g || !s) return
    let moving = false
    if (isSelected) target.copy(FRONT)
    else if (hidden) target.copy(slot.position).add(new Vector3(Math.sign(slot.position.x || (index % 2 ? 1 : -1)) * 7, 0, -2))
    else target.copy(slot.position)
    const k = 1 - Math.exp(-dt * 3.2)
    if (g.position.distanceToSquared(target) > 1e-6) {
      g.position.lerp(target, k)
      moving = true
    }
    const faceGoal = isSelected ? 0 : slot.facing
    if (Math.abs(g.rotation.y - faceGoal) > 1e-4) {
      g.rotation.y = MathUtils.lerp(g.rotation.y, faceGoal, k)
      moving = true
    }
    const idle = selected === null && !reduced.current && performance.now() - lastActivity < IDLE_STOP_MS
    if (idle && !highlighted) {
      s.rotation.y += dt * 0.28
      moving = true
    } else {
      const rest = isSelected || highlighted ? Math.round(s.rotation.y / (Math.PI * 2)) * Math.PI * 2 : s.rotation.y
      if (Math.abs(s.rotation.y - rest) > 1e-4) {
        s.rotation.y = MathUtils.lerp(s.rotation.y, rest, 1 - Math.exp(-dt * 4))
        moving = true
      }
    }
    const opGoal = hidden ? 0 : 1
    if (Math.abs(opacity.current - opGoal) > 1e-3) {
      opacity.current += (opGoal - opacity.current) * (1 - Math.exp(-dt * (hidden ? 5 : 3)))
      moving = true
    } else opacity.current = opGoal
    for (const m of [pedestalMat.current, ringMat.current]) {
      if (!m) continue
      m.transparent = opacity.current < 0.999
      m.opacity = opacity.current
    }
    if (ringMat.current) {
      const glow = highlighted ? 1.4 : 0.12
      ringMat.current.emissiveIntensity = MathUtils.lerp(ringMat.current.emissiveIntensity, glow, k * 2)
      if (Math.abs(ringMat.current.emissiveIntensity - glow) > 0.01) moving = true
    }
    g.visible = opacity.current > 0.01
    if (moving) state.invalidate()
  })

  const interactiveShowroom = selected === null
  return (
    <group
      ref={group}
      position={slot.position}
      rotation-y={slot.facing}
      onPointerOver={(e) => {
        if (!interactiveShowroom) return
        e.stopPropagation()
        setBrowsing(robot.id)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        if (!interactiveShowroom) return
        if (useExplorer.getState().browsing === robot.id) setBrowsing(null)
        document.body.style.cursor = ''
      }}
      onClick={(e) => {
        if (!interactiveShowroom) return
        e.stopPropagation()
        document.body.style.cursor = ''
        select(robot.id)
      }}
    >
      <mesh position-y={ped.height / 2} castShadow receiveShadow>
        <cylinderGeometry args={[ped.radius, ped.radius * 1.04, ped.height, 64]} />
        <meshStandardMaterial ref={pedestalMat} color="#17191A" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position-y={ped.height + 0.002} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[ped.radius - 0.012, ped.radius, 96]} />
        <meshStandardMaterial ref={ringMat} color="#000000" emissive="#F36B21" emissiveIntensity={0.12} toneMapped={false} />
      </mesh>
      <group ref={spin} position-y={ped.height}>
        <RobotModel robot={robot} interactive={isSelected} opacity={opacity} />
      </group>
      {selected === null && (
        <Html position={[0, -0.02, ped.radius + 0.12]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
          <div
            className={`whitespace-nowrap text-center font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 ${
              highlighted ? 'text-vulcan-paper' : 'text-vulcan-muted'
            }`}
          >
            <span className="text-vulcan-signal">{String(index + 1).padStart(2, '0')}</span> {robot.name}
          </div>
        </Html>
      )}
    </group>
  )
}

function CameraRig({ layout }: { layout: SceneLayout }) {
  const ref = useRef<CameraControls>(null)
  const selected = useExplorer((s) => s.selected)
  const browsing = useExplorer((s) => s.browsing)
  const sourcingOpen = useExplorer((s) => s.sourcingOpen)
  const { size, camera } = useThree()
  const portrait = size.width / size.height < 1.1
  const [mobileFocus, setMobileFocus] = useState(ROBOTS[0].id)

  useEffect(() => {
    if (browsing) setMobileFocus(browsing)
  }, [browsing])

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const robot = ROBOTS.find((r) => r.id === selected)
    if (robot) {
      const focus = focusPoint(robot, FRONT)
      const d = detailDistance(robot) * (portrait ? 1.35 : 1)
      c.minDistance = robot.height_m * 0.7
      c.maxDistance = d * 2.6
      c.minPolarAngle = 0.2
      c.maxPolarAngle = Math.PI * 0.62
      c.minAzimuthAngle = -Infinity
      c.maxAzimuthAngle = Infinity
      c.mouseButtons.wheel = CameraControlsImpl.ACTION.DOLLY
      c.mouseButtons.right = CameraControlsImpl.ACTION.TRUCK
      c.touches.two = CameraControlsImpl.ACTION.TOUCH_DOLLY_TRUCK
      const half = robot.height_m * 0.45
      c.setBoundary(new Box3(focus.clone().subScalar(half), focus.clone().addScalar(half)))
      c.setLookAt(focus.x, focus.y + robot.height_m * 0.12, focus.z + d, focus.x, focus.y, focus.z, true)
    } else {
      c.setBoundary(undefined)
      c.minDistance = 1
      c.maxDistance = 30
      c.minPolarAngle = 1.05
      c.maxPolarAngle = 1.5
      c.mouseButtons.wheel = CameraControlsImpl.ACTION.NONE
      c.mouseButtons.right = CameraControlsImpl.ACTION.NONE
      c.touches.two = CameraControlsImpl.ACTION.NONE
      if (portrait) {
        const i = ROBOTS.findIndex((r) => r.id === mobileFocus)
        const r = ROBOTS[i]
        const base = slotFor(i, ROBOTS.length).position
        const focus = focusPoint(r, base)
        const toward = ARC.center.clone().sub(base).setY(0).normalize()
        const d = Math.max(1.4, r.height_m * 2.5 + 0.8)
        const eye = focus.clone().add(toward.multiplyScalar(d)).add(new Vector3(0, r.height_m * 0.25, 0))
        const az = Math.atan2(eye.x - focus.x, eye.z - focus.z)
        c.minAzimuthAngle = az - 0.5
        c.maxAzimuthAngle = az + 0.5
        c.setLookAt(eye.x, eye.y, eye.z, focus.x, focus.y, focus.z, true)
      } else {
        c.minAzimuthAngle = -0.35
        c.maxAzimuthAngle = 0.35
        const t = SHOWROOM_CAMERA.target
        const fit = MathUtils.clamp(1.75 / (size.width / size.height), 1, 1.45)
        const p = SHOWROOM_CAMERA.position.clone().sub(t).multiplyScalar(fit).add(t)
        c.setLookAt(p.x, p.y, p.z, t.x, t.y, t.z, true)
      }
    }
  }, [selected, portrait, mobileFocus, size.width, size.height])

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const robot = ROBOTS.find((r) => r.id === selected)
    if (!robot || layout.mobile) {
      c.setFocalOffset(0, 0, 0, true)
      return
    }
    const d = detailDistance(robot)
    const fov = ((camera as unknown as { fov: number }).fov * Math.PI) / 180
    const worldPerPx = (2 * d * Math.tan(fov / 2)) / size.height
    const right = sourcingOpen ? layout.rightInset : 0
    const shiftPx = (layout.leftInset - right) / 2
    c.setFocalOffset(-shiftPx * worldPerPx, 0, 0, true)
  }, [selected, sourcingOpen, layout, size, camera])

  return <CameraControls ref={ref} makeDefault smoothTime={0.55} draggingSmoothTime={0.12} />
}
