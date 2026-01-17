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

    // Initialize Globe with high-resolution textures
    const globe = new Globe(globeEl.current)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg') // Higher res day texture
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .showAtmosphere(true)
      .atmosphereColor('#3a228a')
      .atmosphereAltitude(0.25)
      .width(window.innerWidth)
      .height(window.innerHeight - 150) // Account for header and filters

    globeRef.current = globe

    // Set initial rotation - DISABLED auto-rotate, only manual control
    globe.controls().autoRotate = false
    globe.controls().enableZoom = true

    // Point of view
    globe.pointOfView({ altitude: 2.5 })

    // Load country boundaries and labels (using 50m for better detail)
    fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(countries => {
        // Add country polygons with better detail
        globe
          .polygonsData(countries.features)
          .polygonCapColor(() => 'rgba(255, 255, 255, 0.05)')
          .polygonSideColor(() => 'rgba(255, 255, 255, 0.02)')
          .polygonStrokeColor(() => '#555')
          .polygonAltitude(0.01)

        // Add country labels - positioned above surface
        const countryLabels = countries.features.map((country: any) => {
          const coordinates = country.properties.LABEL_X && country.properties.LABEL_Y
            ? [country.properties.LABEL_X, country.properties.LABEL_Y]
            : getCountryCentroid(country)

          return {
            lat: coordinates[1],
            lng: coordinates[0],
            name: country.properties.NAME,
            size: 0.6, // Slightly larger for readability
            altitude: 0.02, // Elevated above surface
          }
        })

        globe
          .labelsData(countryLabels)
          .labelLat((d: any) => d.lat)
          .labelLng((d: any) => d.lng)
          .labelText((d: any) => d.name)
          .labelSize((d: any) => d.size)
          .labelAltitude((d: any) => d.altitude) // Lift labels above surface
          .labelDotRadius(0.08) // Tiny dot under label for better visibility
          .labelDotOrientation('bottom') // Dot below the text
          .labelColor(() => 'rgba(255, 255, 255, 0.75)') // Slightly more opaque
          .labelResolution(3) // Higher resolution text
      })

    // Load cities data for zoom-in detail
    fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_populated_places_simple.geojson')
      .then(res => res.json())
      .then(cities => {
        // Filter for major cities (population > 500k or capitals)
        const majorCities = cities.features
          .filter((city: any) => {
            const pop = city.properties.pop_max || 0
            const isCapital = city.properties.adm0cap === 1
            return pop > 500000 || isCapital
          })
          .map((city: any) => ({
            lat: city.geometry.coordinates[1],
            lng: city.geometry.coordinates[0],
            name: city.properties.name,
            population: city.properties.pop_max,
            isCapital: city.properties.adm0cap === 1,
            size: 0.4,
            altitude: 0.01
          }))

        // Store cities for conditional rendering
        let currentAltitude = 2.5
        
        // Update cities visibility based on zoom level
        globe.onZoom((coords: any) => {
          currentAltitude = coords.altitude
          
          // Show cities when zoomed in (altitude < 2)
          if (currentAltitude < 2) {
            globe
              .htmlElementsData(majorCities)
              .htmlElement((d: any) => {
                const el = document.createElement('div')
                el.innerHTML = `
                  <div style="
                    color: rgba(255, 255, 255, 0.9);
                    font-size: ${d.isCapital ? '11px' : '9px'};
                    font-weight: ${d.isCapital ? 'bold' : 'normal'};
                    text-shadow: 0 0 3px rgba(0,0,0,0.8), 0 0 6px rgba(0,0,0,0.6);
                    pointer-events: none;
                    white-space: nowrap;
                    background: ${d.isCapital ? 'rgba(0, 102, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)'};
                    padding: 2px 5px;
                    border-radius: 3px;
                    border: ${d.isCapital ? '1px solid rgba(0, 102, 255, 0.5)' : 'none'};
                  ">
                    ${d.isCapital ? '★ ' : ''}${d.name}
                  </div>
                `
                return el
              })
              .htmlLat((d: any) => d.lat)
              .htmlLng((d: any) => d.lng)
              .htmlAltitude((d: any) => d.altitude)
          } else {
            // Hide cities when zoomed out
            globe.htmlElementsData([])
          }
        })
      })

    // Convert markers to globe points
    const points = markers.map(marker => ({
      lat: marker.latitude,
      lng: marker.longitude,
      size: 0.05, // Much smaller altitude
      color: getCommodityColor(marker.commodity_type),
      label: marker.title,
      data: marker
    }))

    // Add points
    globe
      .pointsData(points)
      .pointAltitude('size')
      .pointColor('color')
      .pointRadius(0.15) // Smaller radius for subtle points
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

  const getCountryCentroid = (country: any) => {
    // Simple centroid calculation for polygon/multipolygon
    const coords = country.geometry.type === 'Polygon'
      ? country.geometry.coordinates[0]
      : country.geometry.coordinates[0][0]

    if (!coords || coords.length === 0) return [0, 0]

    const sum = coords.reduce((acc: number[], coord: number[]) => {
      return [acc[0] + coord[0], acc[1] + coord[1]]
    }, [0, 0])

    return [sum[0] / coords.length, sum[1] / coords.length]
  }

  return (
    <div ref={globeEl} style={{ width: '100%', height: '100%' }} className="bg-black" />
  )
}
