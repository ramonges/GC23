'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

interface SurfacePoint {
  days: number
  strike: number
  iv: number
}

interface VolatilitySurface3DProps {
  points: SurfacePoint[]
  days: number[]
  strikes: number[]
  minIv: number
  maxIv: number
}

// 3D math helpers
type Vec3 = [number, number, number]

const rotateY = (v: Vec3, angle: number): Vec3 => {
  const c = Math.cos(angle), s = Math.sin(angle)
  return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c]
}

const rotateX = (v: Vec3, angle: number): Vec3 => {
  const c = Math.cos(angle), s = Math.sin(angle)
  return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c]
}

const project = (v: Vec3, width: number, height: number, fov: number): [number, number] => {
  const z = v[2] + 4 // camera distance
  const scale = fov / z
  return [width / 2 + v[0] * scale, height / 2 - v[1] * scale]
}

const ivToColor = (t: number): string => {
  // Cool blue -> green -> warm yellow -> red
  if (t < 0.25) {
    const s = t / 0.25
    return `rgb(${Math.round(30 + s * 20)}, ${Math.round(60 + s * 140)}, ${Math.round(200 - s * 50)})`
  } else if (t < 0.5) {
    const s = (t - 0.25) / 0.25
    return `rgb(${Math.round(50 + s * 150)}, ${Math.round(200 - s * 20)}, ${Math.round(150 - s * 100)})`
  } else if (t < 0.75) {
    const s = (t - 0.5) / 0.25
    return `rgb(${Math.round(200 + s * 55)}, ${Math.round(180 - s * 80)}, ${Math.round(50 - s * 30)})`
  } else {
    const s = (t - 0.75) / 0.25
    return `rgb(${Math.round(255)}, ${Math.round(100 - s * 70)}, ${Math.round(20 - s * 20)})`
  }
}

export default function VolatilitySurface3D({ points, days, strikes, minIv, maxIv }: VolatilitySurface3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rotY, setRotY] = useState(-0.6)
  const [rotXAngle, setRotXAngle] = useState(0.5)
  const dragging = useRef(false)
  const lastMouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  // Build grid lookup
  const gridLookup = useCallback(() => {
    const map = new Map<string, number>()
    points.forEach(p => map.set(`${p.days}|${p.strike}`, p.iv))
    return map
  }, [points])

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const W = rect.width
    const H = rect.height
    const fov = Math.min(W, H) * 0.8

    ctx.clearRect(0, 0, W, H)

    // Background
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, W, H)

    const lookup = gridLookup()
    const nDays = days.length
    const nStrikes = strikes.length
    if (nDays < 2 || nStrikes < 2) return

    // Normalize to [-1, 1] range for 3D coords
    const toScene = (dayIdx: number, strikeIdx: number, iv: number): Vec3 => {
      const x = (dayIdx / (nDays - 1)) * 2 - 1
      const z = (strikeIdx / (nStrikes - 1)) * 2 - 1
      const y = ((iv - minIv) / (maxIv - minIv || 1)) * 1.2
      return [x * 1.3, y - 0.3, z * 1.3]
    }

    // Build mesh quads
    const quads: Array<{
      verts: Vec3[]
      projected: [number, number][]
      avgZ: number
      t: number // IV normalized
    }> = []

    for (let di = 0; di < nDays - 1; di++) {
      for (let si = 0; si < nStrikes - 1; si++) {
        const iv00 = lookup.get(`${days[di]}|${strikes[si]}`)
        const iv10 = lookup.get(`${days[di + 1]}|${strikes[si]}`)
        const iv01 = lookup.get(`${days[di]}|${strikes[si + 1]}`)
        const iv11 = lookup.get(`${days[di + 1]}|${strikes[si + 1]}`)

        if (iv00 === undefined || iv10 === undefined || iv01 === undefined || iv11 === undefined) continue

        const v00 = toScene(di, si, iv00)
        const v10 = toScene(di + 1, si, iv10)
        const v01 = toScene(di, si + 1, iv01)
        const v11 = toScene(di + 1, si + 1, iv11)

        const verts = [v00, v10, v11, v01]

        // Apply rotation
        const rotated = verts.map(v => {
          let r = rotateY(v, rotY)
          r = rotateX(r, rotXAngle)
          return r
        })

        const projected = rotated.map(v => project(v, W, H, fov))
        const avgZ = rotated.reduce((s, v) => s + v[2], 0) / 4
        const avgIv = (iv00 + iv10 + iv01 + iv11) / 4
        const t = (avgIv - minIv) / (maxIv - minIv || 1)

        quads.push({ verts: rotated, projected, avgZ, t })
      }
    }

    // Painter's algorithm: draw far quads first
    quads.sort((a, b) => b.avgZ - a.avgZ)

    quads.forEach(quad => {
      ctx.beginPath()
      ctx.moveTo(quad.projected[0][0], quad.projected[0][1])
      for (let i = 1; i < quad.projected.length; i++) {
        ctx.lineTo(quad.projected[i][0], quad.projected[i][1])
      }
      ctx.closePath()
      ctx.fillStyle = ivToColor(quad.t)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'
      ctx.lineWidth = 0.5
      ctx.stroke()
    })

    // Draw axes
    const axes: Array<{ from: Vec3; to: Vec3; label: string; color: string }> = [
      { from: [-1.3, -0.3, -1.3], to: [1.3, -0.3, -1.3], label: 'Days to Expiry', color: '#888' },
      { from: [-1.3, -0.3, -1.3], to: [-1.3, -0.3, 1.3], label: 'Strike', color: '#888' },
      { from: [-1.3, -0.3, -1.3], to: [-1.3, 0.9, -1.3], label: 'IV', color: '#888' },
    ]

    axes.forEach(axis => {
      let f = rotateY(axis.from, rotY)
      f = rotateX(f, rotXAngle)
      let t = rotateY(axis.to, rotY)
      t = rotateX(t, rotXAngle)
      const pf = project(f, W, H, fov)
      const pt = project(t, W, H, fov)

      ctx.beginPath()
      ctx.moveTo(pf[0], pf[1])
      ctx.lineTo(pt[0], pt[1])
      ctx.strokeStyle = axis.color
      ctx.lineWidth = 1
      ctx.stroke()

      // Label
      ctx.font = '11px sans-serif'
      ctx.fillStyle = '#aaa'
      ctx.textAlign = 'center'
      ctx.fillText(axis.label, pt[0], pt[1] + 14)
    })

    // Draw some tick labels on axes
    // Days axis ticks
    const dayTicks = [0, Math.floor(nDays / 2), nDays - 1]
    dayTicks.forEach(di => {
      if (di >= nDays) return
      let v: Vec3 = [(di / (nDays - 1)) * 2 - 1, -0.3, -1.3]
      v = [v[0] * 1.3, v[1], v[2]]
      v = rotateY(v, rotY)
      v = rotateX(v, rotXAngle)
      const p = project(v, W, H, fov)
      ctx.font = '10px sans-serif'
      ctx.fillStyle = '#777'
      ctx.textAlign = 'center'
      ctx.fillText(`${days[di]}d`, p[0], p[1] + 12)
    })

    // Strike axis ticks
    const strikeTicks = [0, Math.floor(nStrikes / 2), nStrikes - 1]
    strikeTicks.forEach(si => {
      if (si >= nStrikes) return
      let v: Vec3 = [-1.3, -0.3, (si / (nStrikes - 1)) * 2 - 1]
      v = [v[0], v[1], v[2] * 1.3]
      v = rotateY(v, rotY)
      v = rotateX(v, rotXAngle)
      const p = project(v, W, H, fov)
      ctx.font = '10px sans-serif'
      ctx.fillStyle = '#777'
      ctx.textAlign = 'right'
      ctx.fillText(`$${strikes[si]}`, p[0] - 6, p[1] + 4)
    })

    // IV axis ticks
    const ivSteps = 4
    for (let i = 0; i <= ivSteps; i++) {
      const ivVal = minIv + (i / ivSteps) * (maxIv - minIv)
      const y = ((ivVal - minIv) / (maxIv - minIv || 1)) * 1.2 - 0.3
      let v: Vec3 = [-1.3, y, -1.3]
      v = rotateY(v, rotY)
      v = rotateX(v, rotXAngle)
      const p = project(v, W, H, fov)
      ctx.font = '10px sans-serif'
      ctx.fillStyle = '#777'
      ctx.textAlign = 'right'
      ctx.fillText(`${(ivVal * 100).toFixed(0)}%`, p[0] - 6, p[1] + 4)
    }

    // Legend
    const legendW = 120
    const legendH = 12
    const legendX = W - legendW - 16
    const legendY = H - 32
    for (let i = 0; i < legendW; i++) {
      ctx.fillStyle = ivToColor(i / legendW)
      ctx.fillRect(legendX + i, legendY, 1, legendH)
    }
    ctx.font = '10px sans-serif'
    ctx.fillStyle = '#888'
    ctx.textAlign = 'left'
    ctx.fillText(`${(minIv * 100).toFixed(0)}%`, legendX, legendY + legendH + 12)
    ctx.textAlign = 'right'
    ctx.fillText(`${(maxIv * 100).toFixed(0)}%`, legendX + legendW, legendY + legendH + 12)
    ctx.textAlign = 'center'
    ctx.fillText('Implied Volatility', legendX + legendW / 2, legendY - 4)

  }, [rotY, rotXAngle, points, days, strikes, minIv, maxIv, gridLookup])

  useEffect(() => {
    render()
  }, [render])

  useEffect(() => {
    const handleResize = () => render()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [render])

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return
    const dx = e.clientX - lastMouse.current.x
    const dy = e.clientY - lastMouse.current.y
    setRotY(prev => prev + dx * 0.008)
    setRotXAngle(prev => Math.max(-1.2, Math.min(1.2, prev + dy * 0.008)))
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }

  const onMouseUp = () => {
    dragging.current = false
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full rounded-lg cursor-grab active:cursor-grabbing"
        style={{ height: 360 }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      />
      <div className="absolute top-3 right-3 text-[10px] text-gray-500 bg-black/60 px-2 py-1 rounded">
        Drag to rotate
      </div>
    </div>
  )
}
