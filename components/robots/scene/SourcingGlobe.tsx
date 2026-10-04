'use client'

import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useTexture } from '@react-three/drei'
import { AdditiveBlending, BackSide, Group, Quaternion, SRGBColorSpace, Vector3 } from 'three'
import type { SourcingEntry } from '@/lib/robots/types'
import { COUNTRIES } from '@/lib/robots/data'

const R = 1

function toVec(lat: number, lng: number, r = R) {
  const phi = ((90 - lat) * Math.PI) / 180
  const theta = ((lng + 180) * Math.PI) / 180
  return new Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta))
}

export type GlobeMarker = SourcingEntry & { highlighted?: boolean }

export default function SourcingGlobe({ markers, focus }: { markers: GlobeMarker[]; focus: string | null }) {
  return (
    <Canvas frameloop="demand" dpr={[1, 2]} camera={{ fov: 30, position: [0, 0, 4.1] }} gl={{ antialias: true }}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 2, 4]} intensity={1.6} />
      <Suspense fallback={null}>
        <Globe markers={markers} focus={focus} />
      </Suspense>
      <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.5} />
    </Canvas>
  )
}

function Globe({ markers, focus }: { markers: GlobeMarker[]; focus: string | null }) {
  const tex = useTexture('/hero/earth-color.webp')
  tex.colorSpace = SRGBColorSpace
  const group = useRef<Group>(null)
  const goal = useMemo(() => {
    const c = focus ? COUNTRIES[focus] : null
    if (!c) return { x: 0.3, y: 0 }
    const v = toVec(c.lat, c.lng)
    return { x: (c.lat * Math.PI) / 180 * 0.85, y: -Math.atan2(v.x, v.z) }
  }, [focus])

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const k = 1 - Math.exp(-dt * 3.5)
    let dy = goal.y - g.rotation.y
    dy = Math.atan2(Math.sin(dy), Math.cos(dy))
    const dx = goal.x - g.rotation.x
    if (Math.abs(dy) + Math.abs(dx) > 1e-4) {
      g.rotation.y += dy * k
      g.rotation.x += dx * k
      state.invalidate()
    }
  })

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[R, 96, 64]} />
        <meshStandardMaterial map={tex} roughness={0.9} metalness={0} emissive="#1a262c" emissiveIntensity={0.6} />
      </mesh>
      <mesh scale={1.06}>
        <sphereGeometry args={[R, 64, 48]} />
        <meshBasicMaterial color="#8FA6B2" transparent opacity={0.08} side={BackSide} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      {markers.map((m, i) => {
        const c = COUNTRIES[m.country]
        if (!c) return null
        const mining = m.role === 'mining'
        const base = toVec(c.lat, c.lng, R * 1.002)
        const h = 0.04 + (m.share_pct / 100) * 0.55
        const tip = toVec(c.lat, c.lng, R + h)
        const mid = base.clone().lerp(tip, 0.5)
        const up = base.clone().normalize()
        const offset = mining ? 0 : 0.025
        const side = new Vector3(0, 1, 0).cross(up).normalize().multiplyScalar(offset)
        return (
          <group key={`${m.country}-${m.role}-${i}`} position={side}>
            <mesh position={mid} quaternion={quatFromUp(up)}>
              <cylinderGeometry args={[0.012, 0.012, h, 10]} />
              <meshBasicMaterial color={mining ? '#F36B21' : '#C6C8C1'} toneMapped={false} transparent opacity={m.highlighted === false ? 0.25 : 1} />
            </mesh>
            <mesh position={tip}>
              <sphereGeometry args={[0.02, 12, 8]} />
              <meshBasicMaterial color={mining ? '#F36B21' : '#F1F0E8'} toneMapped={false} transparent opacity={m.highlighted === false ? 0.25 : 1} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function quatFromUp(up: Vector3) {
  return new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), up)
}
