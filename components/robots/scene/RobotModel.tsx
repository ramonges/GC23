'use client'

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Outlines, useGLTF } from '@react-three/drei'
import { Box3, BufferGeometry, Color, Euler, Matrix4, Mesh, MeshStandardMaterial, Object3D, Quaternion, Vector3, type Material } from 'three'
import type { Robot } from '@/lib/robots/types'
import { commodityColor, dominantCommodity } from '@/lib/robots/data'
import { useExplorer } from '../store'
import { buildPlaceholder, type Finish } from './placeholder'

export const DRACO_DECODER_PATH = '/draco/'
const SIGNAL = new Color('#F36B21')
const BLACK = new Color('#000000')

type RenderPart = {
  name: string
  geometry: BufferGeometry
  position: Vector3
  quaternion: Quaternion
  scale: Vector3
  material: MeshStandardMaterial
  baseColor: Color
  explode: Vector3
}

function finishMaterial(finish: Finish, palette: Robot['palette']) {
  const p: Record<Finish, ConstructorParameters<typeof MeshStandardMaterial>[0]> = {
    shell: { color: palette.shell, roughness: 0.48, metalness: 0.04 },
    frame: { color: palette.frame, roughness: 0.34, metalness: 0.85 },
    dark: { color: palette.dark, roughness: 0.62, metalness: 0.12 },
    actuator: { color: '#2C3033', roughness: 0.36, metalness: 0.72 },
    rubber: { color: '#1A1B1C', roughness: 0.92, metalness: 0 },
    glass: { color: '#0A0B0C', roughness: 0.06, metalness: 0.35, envMapIntensity: 1.6 },
    accent: { color: palette.accent, roughness: 0.4, metalness: 0.1 },
    battery: { color: '#30363A', roughness: 0.5, metalness: 0.25 },
    board: { color: '#1E3A33', roughness: 0.45, metalness: 0.3 },
    cable: { color: '#8E5A3A', roughness: 0.55, metalness: 0.2 },
  }
  return new MeshStandardMaterial(p[finish])
}

function usePlaceholderParts(robot: Robot): RenderPart[] {
  return useMemo(() => {
    const specs = buildPlaceholder(robot.archetype, robot.id, robot.height_m)
    return finalize(
      specs.map((s) => ({
        name: s.name,
        geometry: s.geometry,
        position: new Vector3(...s.position),
        quaternion: new Quaternion().setFromEuler(new Euler(...(s.rotation ?? [0, 0, 0]))),
        scale: new Vector3(1, 1, 1),
        material: finishMaterial(s.finish, robot.palette),
        explode: s.explode ? new Vector3(...s.explode) : new Vector3(),
      })),
    )
  }, [robot])
}

function toStandard(m: Material | Material[]): MeshStandardMaterial {
  const src = Array.isArray(m) ? m[0] : m
  if (src instanceof MeshStandardMaterial) return src.clone()
  const any = src as unknown as { color?: Color; map?: MeshStandardMaterial['map'] }
  return new MeshStandardMaterial({ color: any.color ?? new Color('#bbbbbb'), map: any.map ?? null, roughness: 0.5 })
}

function useGlbParts(robot: Robot): RenderPart[] {
  const { scene } = useGLTF(robot.model!, DRACO_DECODER_PATH)
  return useMemo(() => {
    const names = new Set(robot.parts.map((p) => p.meshName))
    scene.updateMatrixWorld(true)
    const out: Omit<RenderPart, 'baseColor'>[] = []
    scene.traverse((o) => {
      const mesh = o as Mesh
      if (!mesh.isMesh) return
      // Multi-material meshes import as a group of primitives; attribute them to the nearest named ancestor.
      let named: Object3D | null = mesh
      while (named && !names.has(named.name)) named = named.parent
      const position = new Vector3()
      const quaternion = new Quaternion()
      const scale = new Vector3()
      mesh.matrixWorld.decompose(position, quaternion, scale)
      out.push({ name: named?.name ?? mesh.name, geometry: mesh.geometry, position, quaternion, scale, material: toStandard(mesh.material), explode: new Vector3() })
    })
    return finalize(out)
  }, [scene, robot])
}

/** Fill in base colours and derive explode directions from each part's offset to the model centre. */
function finalize(parts: Omit<RenderPart, 'baseColor'>[]): RenderPart[] {
  const box = new Box3()
  const tmp = new Box3()
  const centers = parts.map((p) => {
    p.geometry.computeBoundingBox()
    tmp.copy(p.geometry.boundingBox!).applyMatrix4(new Matrix4().compose(p.position, p.quaternion, p.scale))
    box.union(tmp)
    return tmp.getCenter(new Vector3())
  })
  const center = box.getCenter(new Vector3())
  const size = box.getSize(new Vector3())
  return parts.map((p, i) => {
    if (p.explode.lengthSq() === 0) {
      const d = centers[i].clone().sub(center)
      d.y *= 0.6
      if (d.lengthSq() < 1e-6) d.set(0, 0, 1)
      p.explode.copy(d.divideScalar(Math.max(size.y, 1e-3) * 0.5))
    } else {
      p.explode.normalize().multiplyScalar(0.55)
    }
    return { ...p, baseColor: p.material.color.clone() }
  })
}

type Props = {
  robot: Robot
  interactive: boolean
  opacity: MutableRefObject<number>
}

export default function RobotModel(props: Props) {
  return props.robot.model ? <GlbRobot {...props} /> : <PlaceholderRobot {...props} />
}

function PlaceholderRobot(props: Props) {
  return <PartsRenderer {...props} parts={usePlaceholderParts(props.robot)} />
}

function GlbRobot(props: Props) {
  return <PartsRenderer {...props} parts={useGlbParts(props.robot)} />
}

function PartsRenderer({ robot, interactive, opacity, parts }: Props & { parts: RenderPart[] }) {
  const meshRefs = useRef<(Mesh | null)[]>([])
  const explodeAmt = useRef(0)
  const hoveredPart = useExplorer((s) => (interactive ? s.hoveredPart : null))
  const pinnedPart = useExplorer((s) => (interactive ? s.pinnedPart : null))
  const exploded = useExplorer((s) => interactive && s.exploded)
  const colorBy = useExplorer((s) => interactive && s.colorByCommodity)
  const hoverPart = useExplorer((s) => s.hoverPart)
  const pinPart = useExplorer((s) => s.pinPart)

  const byName = useMemo(() => new Map(robot.parts.map((p) => [p.meshName, p])), [robot])
  const tints = useMemo(() => parts.map((p) => {
    const data = byName.get(p.name)
    return data ? new Color(commodityColor(dominantCommodity(data))) : p.baseColor
  }), [parts, byName])

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return
    const meshNames = new Set(parts.map((p) => p.name))
    const missingData = Array.from(meshNames).filter((n) => !byName.has(n))
    const missingMesh = robot.parts.filter((p) => !meshNames.has(p.meshName)).map((p) => p.meshName)
    if (missingData.length) console.warn(`[robots] ${robot.id}: meshes without data`, missingData)
    if (missingMesh.length) console.warn(`[robots] ${robot.id}: data without meshes`, missingMesh)
  }, [parts, byName, robot])

  useEffect(() => () => parts.forEach((p) => p.material.dispose()), [parts])

  const active = pinnedPart ?? hoveredPart
  const spread = robot.height_m * 0.42
  const target = new Color()
  const tmp = new Vector3()

  useFrame((state, dt) => {
    const k = 1 - Math.exp(-dt * 9)
    let moving = false
    const goal = exploded ? 1 : 0
    explodeAmt.current += (goal - explodeAmt.current) * (1 - Math.exp(-dt * 5))
    if (Math.abs(goal - explodeAmt.current) < 1e-3) explodeAmt.current = goal
    else moving = true
    const op = opacity.current
    parts.forEach((p, i) => {
      const mesh = meshRefs.current[i]
      if (!mesh) return
      tmp.copy(p.explode).multiplyScalar(explodeAmt.current * spread)
      mesh.position.copy(p.position).add(tmp)
      const mat = p.material
      target.copy(colorBy ? tints[i] : p.baseColor)
      const isActive = active === p.name
      if (active && !isActive) target.multiplyScalar(0.32)
      if (Math.abs(mat.color.r - target.r) + Math.abs(mat.color.g - target.g) + Math.abs(mat.color.b - target.b) > 0.002) {
        mat.color.lerp(target, k)
        moving = true
      } else mat.color.copy(target)
      const glow = isActive ? 0.45 : 0
      if (Math.abs(mat.emissiveIntensity - glow) > 0.01) {
        mat.emissive.copy(isActive ? SIGNAL : BLACK)
        mat.emissiveIntensity += (glow - mat.emissiveIntensity) * k
        moving = true
      } else {
        mat.emissiveIntensity = glow
        if (!isActive) mat.emissive.copy(BLACK)
      }
      const transparent = op < 0.999
      if (mat.transparent !== transparent) {
        mat.transparent = transparent
        mat.needsUpdate = true
      }
      mat.opacity = op
      mat.depthWrite = op > 0.5
      mesh.visible = op > 0.01
    })
    if (moving) state.invalidate()
  })

  const handlers = (name: string) =>
    interactive && byName.has(name)
      ? {
          onPointerOver: (e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation()
            if (e.pointerType === 'mouse') hoverPart(name)
          },
          onPointerOut: (e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation()
            if (useExplorer.getState().hoveredPart === name) hoverPart(null)
          },
          onClick: (e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation()
            pinPart(useExplorer.getState().pinnedPart === name ? null : name)
          },
        }
      : {}

  return (
    <group>
      {parts.map((p, i) => (
        <mesh
          key={`${p.name}-${i}`}
          ref={(m) => {
            meshRefs.current[i] = m
          }}
          name={p.name}
          geometry={p.geometry}
          material={p.material}
          position={p.position}
          quaternion={p.quaternion}
          scale={p.scale}
          castShadow
          receiveShadow
          {...handlers(p.name)}
        >
          {active === p.name && <Outlines thickness={robot.height_m * 0.0045} color="#F36B21" screenspace={false} />}
        </mesh>
      ))}
    </group>
  )
}

export function preloadRobotModel(url: string) {
  useGLTF.preload(url, DRACO_DECODER_PATH)
}
