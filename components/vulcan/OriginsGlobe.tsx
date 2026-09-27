'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import Globe, { type GlobeMethods } from 'react-globe.gl'
import { MeshPhongMaterial } from 'three'
import {
  HUBS,
  MATERIAL_BY_ID,
  MINES,
  NODE_BY_ID,
  ROUTES,
  type MaterialId,
  type NetworkNode,
} from '@/lib/vulcan/content'

const SIGNAL = '#FF6A1A'

type Props = {
  activeMaterial: MaterialId | null
  selected: NetworkNode | null
  onSelect: (node: NetworkNode | null) => void
  reducedMotion: boolean
}

function withAlpha(hex: string, alpha: number) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string)
}

function tooltipHtml(node: NetworkNode) {
  const material = node.material ? MATERIAL_BY_ID[node.material].label : '—'
  const rows: [string, string][] = [
    ['Location', `${node.name}, ${node.country}`],
    ['Material', material],
    ['Facility type', node.facility],
    ['Next route', node.nextRoute || '—'],
  ]
  return `<div class="vulcan-tooltip">${rows
    .map(([k, v]) => `<div class="vulcan-tooltip-row"><span>${k}</span><strong>${escapeHtml(v)}</strong></div>`)
    .join('')}</div>`
}

export default function OriginsGlobe({ activeMaterial, selected, onSelect, reducedMotion }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<GlobeMethods>()
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [countries, setCountries] = useState<object[]>([])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch('/globe/countries.json')
      .then((r) => r.json())
      .then((geo) => {
        if (!cancelled) setCountries(geo.features)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const material = useMemo(
    () => new MeshPhongMaterial({ color: '#17171b', emissive: '#0c0c0f', shininess: 6, specular: '#22222a' }),
    [],
  )

  const onGlobeReady = useCallback(() => {
    const globe = globeRef.current
    if (!globe) return
    globe.pointOfView({ lat: 6, lng: 12, altitude: 1.75 }, 0)
    const controls = globe.controls()
    controls.enableZoom = false
    controls.autoRotate = !reducedMotion
    controls.autoRotateSpeed = 0.35
    const stop = () => {
      controls.autoRotate = false
    }
    controls.addEventListener('start', stop)
  }, [reducedMotion])

  const onKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    const globe = globeRef.current
    if (!globe) return
    const step: Record<string, [number, number]> = {
      ArrowLeft: [0, -20],
      ArrowRight: [0, 20],
      ArrowUp: [10, 0],
      ArrowDown: [-10, 0],
    }
    const delta = step[e.key]
    if (!delta) return
    e.preventDefault()
    globe.controls().autoRotate = false
    const pov = globe.pointOfView()
    globe.pointOfView(
      { lat: Math.max(-70, Math.min(70, pov.lat + delta[0])), lng: pov.lng + delta[1], altitude: pov.altitude },
      reducedMotion ? 0 : 700,
    )
  }, [reducedMotion])

  const points = useMemo(() => [...MINES, ...HUBS], [])
  const rings = useMemo(
    () => MINES.filter((m) => (activeMaterial ? m.material === activeMaterial : true)),
    [activeMaterial],
  )
  const arcs = useMemo(
    () => ROUTES.map((r, index) => ({ ...r, index, a: NODE_BY_ID[r.from], b: NODE_BY_ID[r.to] })),
    [],
  )

  const isDimmed = (m?: MaterialId) => !!activeMaterial && m !== activeMaterial

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="application"
      aria-label="Interactive globe of material origins. Drag or use arrow keys to rotate."
      onKeyDown={onKeyDown}
      className="absolute inset-0 cursor-grab outline-none active:cursor-grabbing focus-visible:ring-1 focus-visible:ring-vulcan-signal/60"
    >
      {size.width > 0 && (
        <Globe
          ref={globeRef}
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0,0,0,0)"
          globeMaterial={material}
          showAtmosphere
          atmosphereColor="#8d95a8"
          atmosphereAltitude={0.14}
          onGlobeReady={onGlobeReady}
          hexPolygonsData={countries}
          hexPolygonResolution={3}
          hexPolygonMargin={0.62}
          hexPolygonUseDots
          hexPolygonColor={() => 'rgba(200, 204, 214, 0.36)'}
          hexPolygonAltitude={0.004}
          pointsData={points}
          pointLat={(d: object) => (d as NetworkNode).lat}
          pointLng={(d: object) => (d as NetworkNode).lng}
          pointAltitude={(d: object) => {
            const n = d as NetworkNode
            if (n.kind !== 'mine') return 0.012
            if (selected?.id === n.id) return 0.14
            return isDimmed(n.material) ? 0.01 : 0.06
          }}
          pointRadius={(d: object) => ((d as NetworkNode).kind === 'mine' ? 0.62 : 0.34)}
          pointColor={(d: object) => {
            const n = d as NetworkNode
            if (n.kind !== 'mine') return 'rgba(230, 230, 236, 0.75)'
            if (selected?.id === n.id) return SIGNAL
            const color = MATERIAL_BY_ID[n.material!].color
            return isDimmed(n.material) ? withAlpha(color, 0.18) : color
          }}
          pointLabel={(d: object) => tooltipHtml(d as NetworkNode)}
          onPointClick={(d: object) => onSelect(d as NetworkNode)}
          onGlobeClick={() => onSelect(null)}
          pointsTransitionDuration={reducedMotion ? 0 : 600}
          ringsData={reducedMotion ? [] : rings}
          ringLat={(d: object) => (d as NetworkNode).lat}
          ringLng={(d: object) => (d as NetworkNode).lng}
          ringColor={(d: object) => {
            const color = MATERIAL_BY_ID[(d as NetworkNode).material!].color
            return (t: number) => withAlpha(color, 0.7 * (1 - t))
          }}
          ringMaxRadius={3.2}
          ringPropagationSpeed={1.6}
          ringRepeatPeriod={1800}
          arcsData={arcs}
          arcStartLat={(d: object) => (d as (typeof arcs)[number]).a.lat}
          arcStartLng={(d: object) => (d as (typeof arcs)[number]).a.lng}
          arcEndLat={(d: object) => (d as (typeof arcs)[number]).b.lat}
          arcEndLng={(d: object) => (d as (typeof arcs)[number]).b.lng}
          arcColor={(d: object) => {
            const r = d as (typeof arcs)[number]
            const dim = isDimmed(r.material)
            const color = MATERIAL_BY_ID[r.material].color
            return [withAlpha(color, dim ? 0.06 : 0.85), withAlpha(SIGNAL, dim ? 0.06 : 0.9)]
          }}
          arcStroke={0.5}
          arcAltitudeAutoScale={0.32}
          arcDashLength={reducedMotion ? 1 : 0.4}
          arcDashGap={reducedMotion ? 0 : 1.1}
          arcDashInitialGap={(d: object) => ((d as (typeof arcs)[number]).index % 5) * 0.3}
          arcDashAnimateTime={reducedMotion ? 0 : 4200}
        />
      )}
    </div>
  )
}
