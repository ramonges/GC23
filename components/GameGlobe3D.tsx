'use client'

import { useEffect, useRef, memo } from 'react'
import Globe from 'globe.gl'

interface GameGlobe3DProps {
  unlockedCountries: Set<string>
  sites: Array<{ id: string; latitude: number; longitude: number; title: string; country?: string; operator?: string; [key: string]: any }>
  color: string
  onSiteSelect?: (site: any) => void
}

function getCountryCentroid(feature: any): [number, number] {
  const coords = feature?.geometry?.coordinates
  if (!coords) return [0, 0]
  const ring = feature.geometry.type === 'Polygon' ? coords[0] : coords[0]?.[0]
  if (!ring || ring.length === 0) return [0, 0]
  const sum = ring.reduce(
    (acc: [number, number], c: number[]) => [acc[0] + c[0], acc[1] + c[1]],
    [0, 0]
  )
  return [sum[0] / ring.length, sum[1] / ring.length]
}

function hexToRgba(hex: string, alpha: number): string {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!m) return `rgba(255,255,255,${alpha})`
  const r = parseInt(m[1], 16)
  const g = parseInt(m[2], 16)
  const b = parseInt(m[3], 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function GameGlobe3D({ unlockedCountries, sites, color, onSiteSelect }: GameGlobe3DProps) {
  const globeEl = useRef<HTMLDivElement>(null)
  const globeRef = useRef<any>(null)
  const countriesRef = useRef<any[]>([])
  const onSiteSelectRef = useRef(onSiteSelect)

  useEffect(() => {
    onSiteSelectRef.current = onSiteSelect
  }, [onSiteSelect])

  useEffect(() => {
    if (!globeEl.current) return

    const el = globeEl.current
    const rect = el.getBoundingClientRect()
    const globe = new Globe(el)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .showAtmosphere(true)
      .atmosphereColor('#3a228a')
      .atmosphereAltitude(0.25)
      .width(rect.width)
      .height(rect.height)

    globeRef.current = globe
    globe.controls().autoRotate = false
    globe.controls().enableZoom = true
    globe.pointOfView({ altitude: 2.5 })

    fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson')
      .then((res) => res.json())
      .then((geo) => {
        const features = geo.features || []
        countriesRef.current = features
        globe
          .polygonsData(features)
          .polygonSideColor(() => 'rgba(255,255,255,0.02)')
          .polygonStrokeColor(() => '#444')
          .polygonAltitude(0.01)
        globe
          .labelsData([])
          .labelLat((d: any) => d.lat)
          .labelLng((d: any) => d.lng)
          .labelText((d: any) => d.name)
          .labelSize(0.35)
          .labelAltitude(0.02)
          .labelColor(() => 'rgba(255,255,255,0.95)')
          .labelResolution(3)
      })

    globe
      .pointsData([])
      .pointAltitude(0.02)
      .pointColor('color')
      .pointRadius(0.12)
      .pointsMerge(false)
      .pointsTransitionDuration(400)
      .pointLabel((d: any) => `
        <div style="
          background: rgba(0, 0, 0, 0.95);
          border: 2px solid ${d.color};
          padding: 12px;
          border-radius: 8px;
          color: white;
          min-width: 200px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        ">
          <div style="font-size: 14px; font-weight: bold; margin-bottom: 6px; color: ${d.color};">
            ${d.data.title}
          </div>
          <div style="font-size: 12px;">
            <strong>Country:</strong> ${d.data.country || 'N/A'}
          </div>
          ${d.data.operator ? `<div style="font-size: 12px;"><strong>Operator:</strong> ${d.data.operator}</div>` : ''}
        </div>
      `)
      .onPointClick((point: any) => {
        if (onSiteSelectRef.current) onSiteSelectRef.current(point.data)
      })

    const resizeGlobe = () => {
      if (!globeRef.current || !el) return
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.height > 0) {
        globeRef.current.width(r.width)
        globeRef.current.height(r.height)
      }
    }
    const ro = new ResizeObserver(resizeGlobe)
    ro.observe(el)
    resizeGlobe()

    return () => {
      ro.disconnect()
      if (globeRef.current) {
        globeRef.current._destructor()
      }
    }
  }, [])

  // Update polygon colors and country labels when unlocked countries change
  useEffect(() => {
    const globe = globeRef.current
    if (!globe) return

    globe.polygonCapColor((d: any) => {
      const admin = d?.properties?.ADMIN || ''
      const isUnlocked = unlockedCountries.has(admin)
      if (isUnlocked) {
        return hexToRgba(color, 0.55)
      }
      return 'rgba(20, 20, 20, 0.92)'
    })

    const features = countriesRef.current
    const labelData = features
      .filter((f: any) => unlockedCountries.has(f?.properties?.ADMIN || ''))
      .map((f: any) => {
        const admin = f?.properties?.ADMIN || ''
        const [lng, lat] = f?.properties?.LABEL_X != null && f?.properties?.LABEL_Y != null
          ? [f.properties.LABEL_X, f.properties.LABEL_Y]
          : getCountryCentroid(f)
        return { lat, lng, name: admin }
      })
    globe.labelsData(labelData)
  }, [unlockedCountries, color])

  // Update points when sites change
  useEffect(() => {
    const globe = globeRef.current
    if (!globe) return

    const validSites = sites.filter((s) => s.latitude != null && s.longitude != null)
    const points = validSites.map((site) => ({
      lat: site.latitude,
      lng: site.longitude,
      color,
      data: site,
    }))
    globe.pointsData(points)
  }, [sites, color])

  return <div ref={globeEl} style={{ width: '100%', height: '100%' }} className="bg-black" />
}

export default memo(GameGlobe3D)
