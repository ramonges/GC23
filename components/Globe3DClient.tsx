'use client'

import { useEffect, useRef } from 'react'
import Globe from 'globe.gl'

interface CommodityData {
  id: string
  title: string
  owner: string
  address: string
  contact: string
  long_term_contract: boolean
  contract_with: string
  supply_volume: number
  storage_volume: number
  latitude: number
  longitude: number
  commodity_type: string
  commodity_name: string
  company?: string
}

interface Globe3DClientProps {
  markers: CommodityData[]
}

export default function Globe3DClient({ markers }: Globe3DClientProps) {
  const globeEl = useRef<HTMLDivElement>(null)
  const globeRef = useRef<any>(null)

  useEffect(() => {
    if (!globeEl.current) return

    // Initialize Globe
    const globe = Globe()
      (globeEl.current)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .showAtmosphere(true)
      .atmosphereColor('#3a228a')
      .atmosphereAltitude(0.25)
      .width(window.innerWidth)
      .height(window.innerHeight - 150) // Account for header and filters

    globeRef.current = globe

    // Set initial rotation
    globe.controls().autoRotate = true
    globe.controls().autoRotateSpeed = 0.5

    // Point of view
    globe.pointOfView({ altitude: 2.5 })

    // Convert markers to globe points
    const points = markers.map(marker => ({
      lat: marker.latitude,
      lng: marker.longitude,
      size: 0.3,
      color: getCommodityColor(marker.commodity_type),
      label: marker.title,
      data: marker
    }))

    // Add points
    globe
      .pointsData(points)
      .pointAltitude('size')
      .pointColor('color')
      .pointRadius(0.4)
      .pointsMerge(false)
      .pointLabel((d: any) => `
        <div style="
          background: rgba(0, 0, 0, 0.95);
          border: 2px solid ${d.color};
          padding: 15px;
          border-radius: 12px;
          color: white;
          min-width: 300px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        ">
          <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: ${d.color};">
            ${d.data.title}
          </div>
          <div style="font-size: 14px; margin-bottom: 8px;">
            <strong>Owner:</strong> ${d.data.owner}
          </div>
          <div style="font-size: 14px; margin-bottom: 8px;">
            <strong>Type:</strong> ${d.data.commodity_type} - ${d.data.commodity_name}
          </div>
          <div style="font-size: 14px; margin-bottom: 8px;">
            <strong>Location:</strong> ${d.data.address}
          </div>
          ${d.data.supply_volume > 0 ? `
            <div style="font-size: 14px; margin-bottom: 8px;">
              <strong>Supply:</strong> ${d.data.supply_volume.toLocaleString()} metric tonnes
            </div>
          ` : ''}
          ${d.data.long_term_contract ? `
            <div style="font-size: 14px; color: #10B981;">
              ✓ Long-term Contract
              ${d.data.contract_with ? ` with ${d.data.contract_with}` : ''}
            </div>
          ` : ''}
        </div>
      `)
      .onPointClick((point: any) => {
        // Zoom to clicked point
        globe.pointOfView({
          lat: point.lat,
          lng: point.lng,
          altitude: 1.5
        }, 1000)
      })

    // Handle window resize
    const handleResize = () => {
      if (globeRef.current) {
        globeRef.current.width(window.innerWidth)
        globeRef.current.height(window.innerHeight - 150)
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (globeRef.current) {
        globeRef.current._destructor()
      }
    }
  }, [markers])

  const getCommodityColor = (type: string) => {
    const colors: Record<string, string> = {
      'Energy': '#FF6B35',
      'Metals': '#FFD700',
      'Agricultural': '#10B981',
      'Industrial': '#3B82F6',
      'Livestock': '#EC4899'
    }
    return colors[type] || '#FFFFFF'
  }

  return (
    <div ref={globeEl} style={{ width: '100%', height: '100%' }} className="bg-black" />
  )
}
