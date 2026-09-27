'use client'

import { useEffect, useRef, type RefObject } from 'react'
import { HUBS, MATERIAL_BY_ID, MINES, NODE_BY_ID, ROUTES, type NetworkNode, type NetworkRoute } from '@/lib/vulcan/content'
import { HERO_GLOBE, coverTransform, greatCircle, orthoVector, toVideoPixels } from '@/lib/vulcan/projection'

const SIGNAL = '255, 106, 26'
const ARC_SEGMENTS = 56

type Props = {
  videoRef: RefObject<HTMLVideoElement>
  stage: number
  reducedMotion: boolean
  objectPositionX: number
}

function routeVisibleAt(route: NetworkRoute, stage: number) {
  if (route.kind === 'delivery') return stage >= 3
  return stage >= 1
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`
}

function smooth(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export default function HeroOverlay({ videoRef, stage, reducedMotion, objectPositionX }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef(stage)
  const revealRef = useRef<number[]>(ROUTES.map(() => 0))
  const highlightRef = useRef({ processing: 0, manufacturing: 0 })
  const drawRef = useRef<(now: number) => void>(() => {})

  useEffect(() => {
    stageRef.current = stage
    if (reducedMotion) {
      revealRef.current = ROUTES.map((r) => (routeVisibleAt(r, stage) ? 1 : 0))
      highlightRef.current = { processing: stage >= 2 ? 1 : 0, manufacturing: stage >= 3 ? 1 : 0 }
      drawRef.current(performance.now())
    }
  }, [stage, reducedMotion])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = 1
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      drawRef.current(performance.now())
    }

    let last = performance.now()

    const draw = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      const video = videoRef.current
      const t = video && video.readyState >= 2 && !video.paused ? video.currentTime % HERO_GLOBE.periodSec : 0
      const { scale, offsetX, offsetY } = coverTransform(width, height, objectPositionX, 0.5)
      const toScreen = (p: { x: number; y: number }) => ({ x: offsetX + p.x * scale, y: offsetY + p.y * scale })
      const radiusPx = HERO_GLOBE.radius * scale
      const center = toScreen({ x: HERO_GLOBE.cx, y: HERO_GLOBE.cy })

      const currentStage = stageRef.current
      if (!reducedMotion) {
        const reveal = revealRef.current
        ROUTES.forEach((route, i) => {
          const target = routeVisibleAt(route, currentStage) ? 1 : 0
          const speed = target > reveal[i] ? 0.45 + (i % 5) * 0.08 : 1.6
          reveal[i] += Math.sign(target - reveal[i]) * Math.min(Math.abs(target - reveal[i]), speed * dt)
        })
        const hl = highlightRef.current
        const ease = (cur: number, target: number) => cur + (target - cur) * Math.min(1, dt * 2.2)
        hl.processing = ease(hl.processing, currentStage >= 2 ? 1 : 0)
        hl.manufacturing = ease(hl.manufacturing, currentStage >= 3 ? 1 : 0)
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      ctx.lineCap = 'round'

      const project = (lat: number, lng: number, altitude = 0) => {
        const v = orthoVector(lat, lng, t)
        const p = toScreen(toVideoPixels(v, altitude))
        const dx = p.x - center.x
        const dy = p.y - center.y
        const outsideDisk = dx * dx + dy * dy > radiusPx * radiusPx
        return { ...p, z: v.z, visible: v.z > 0 || (outsideDisk && v.z > -0.3) }
      }

      ROUTES.forEach((route, i) => {
        const progress = revealRef.current[i]
        if (progress <= 0.001) return
        const a = NODE_BY_ID[route.from]
        const b = NODE_BY_ID[route.to]
        const span = greatCircle(a, b, 1).angle
        const lift = Math.min(0.14, 0.03 + span * 0.08)
        const steps = Math.max(8, Math.round(ARC_SEGMENTS * Math.min(1, span / 1.2 + 0.2)))
        const delivery = route.kind === 'delivery'
        const baseAlpha = delivery ? 0.85 : 0.55
        ctx.lineWidth = delivery ? 1.4 : 1.1
        let prev: ReturnType<typeof project> | null = null
        const end = Math.max(1, Math.round(steps * progress))
        for (let s = 0; s <= end; s++) {
          const f = s / steps
          const g = greatCircle(a, b, f)
          const p = project(g.lat, g.lng, Math.sin(Math.PI * f) * lift)
          if (prev && prev.visible && p.visible) {
            const fade = Math.min(smooth(-0.15, 0.25, prev.z), smooth(-0.15, 0.25, p.z)) * 0.6 + 0.4
            ctx.strokeStyle = `rgba(${SIGNAL}, ${baseAlpha * fade})`
            ctx.beginPath()
            ctx.moveTo(prev.x, prev.y)
            ctx.lineTo(p.x, p.y)
            ctx.stroke()
          }
          prev = p
        }
        if (!reducedMotion && progress >= 0.999) {
          const phase = ((now / 1000) * 0.22 + i * 0.137) % 1
          const g = greatCircle(a, b, phase)
          const p = project(g.lat, g.lng, Math.sin(Math.PI * phase) * lift)
          if (p.visible) {
            ctx.fillStyle = `rgba(255, 214, 180, ${0.9 * smooth(-0.1, 0.2, p.z) + 0.1})`
            ctx.beginPath()
            ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      })

      const drawHub = (node: NetworkNode) => {
        const p = project(node.lat, node.lng)
        if (p.z < 0.04) return
        const alpha = smooth(0.04, 0.3, p.z)
        const hl = node.kind === 'processing' ? highlightRef.current.processing
          : node.kind === 'manufacturing' ? highlightRef.current.manufacturing : 0
        ctx.fillStyle = `rgba(236, 236, 240, ${0.7 * alpha})`
        if (node.kind === 'port') {
          ctx.fillRect(p.x - 1.6, p.y - 1.6, 3.2, 3.2)
        } else if (node.kind === 'processing') {
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(Math.PI / 4)
          ctx.fillRect(-2, -2, 4, 4)
          ctx.restore()
        } else {
          ctx.strokeStyle = `rgba(236, 236, 240, ${0.8 * alpha})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
          ctx.stroke()
        }
        if (hl > 0.01) {
          const pulse = reducedMotion ? 0.5 : (now / 1000 / 2.2 + node.lat * 0.01) % 1
          ctx.strokeStyle = `rgba(${SIGNAL}, ${hl * alpha * 0.9})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(p.x, p.y, 6, 0, Math.PI * 2)
          ctx.stroke()
          ctx.strokeStyle = `rgba(${SIGNAL}, ${hl * alpha * (1 - pulse) * 0.7})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, 6 + pulse * 14, 0, Math.PI * 2)
          ctx.stroke()
        }
      }
      HUBS.forEach(drawHub)

      MINES.forEach((mine, i) => {
        const p = project(mine.lat, mine.lng)
        if (p.z < 0.04) return
        const alpha = smooth(0.04, 0.3, p.z)
        const rgb = hexToRgb(MATERIAL_BY_ID[mine.material!].color)
        const period = 2.6
        const phase = reducedMotion ? 0.35 : ((now / 1000 + i * 0.41) % period) / period

        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 10)
        glow.addColorStop(0, `rgba(${rgb}, ${0.55 * alpha})`)
        glow.addColorStop(1, `rgba(${rgb}, 0)`)
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = `rgba(${rgb}, ${alpha})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2)
        ctx.fill()

        if (i % 2 === 0) {
          ctx.strokeStyle = `rgba(${rgb}, ${alpha * (1 - phase) * 0.8})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(p.x, p.y, 3 + phase * 16, 0, Math.PI * 2)
          ctx.stroke()
        }

        if (i % 3 === 0) {
          const nx = (p.x - center.x) / radiusPx
          const ny = (p.y - center.y) / radiusPx
          const len = 22 * p.z + 6
          const tipX = p.x + nx * len * 0.35
          const tipY = p.y + ny * len * 0.35 - len
          const beam = ctx.createLinearGradient(p.x, p.y, tipX, tipY)
          beam.addColorStop(0, `rgba(${rgb}, ${0.85 * alpha})`)
          beam.addColorStop(1, `rgba(${rgb}, 0)`)
          ctx.strokeStyle = beam
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(tipX, tipY)
          ctx.stroke()
        }
      })
    }

    drawRef.current = draw
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    let onScreen = true
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
    })
    io.observe(canvas)

    let raf = 0
    if (!reducedMotion) {
      const loop = (now: number) => {
        if (onScreen) draw(now)
        else last = now
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    }
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [videoRef, reducedMotion, objectPositionX])

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
}
