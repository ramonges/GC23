'use client'

import { useEffect, useRef, memo } from 'react'
import Globe from 'globe.gl'
import { CommodityData, RefineryData, ShippingRoute } from '@/lib/types'

interface Globe3DClientProps {
  markers: CommodityData[]
  showCities?: boolean
  routes?: ShippingRoute[]
  refineries?: RefineryData[]
  satelliteMode?: boolean
  onPointSelect?: (point: CommodityData | RefineryData | null, type: 'commodity' | 'refinery') => void
  onRouteClick?: (route: ShippingRoute) => void
}

function Globe3DClient({ markers, showCities = true, routes = [], refineries = [], satelliteMode = false, onPointSelect, onRouteClick }: Globe3DClientProps) {
  const globeEl = useRef<HTMLDivElement>(null)
  const globeRef = useRef<any>(null)
  const currentAltitudeRef = useRef<number>(2.5)
  const onPointSelectRef = useRef(onPointSelect)
  const onRouteClickRef = useRef(onRouteClick)
  const showCitiesRef = useRef(showCities)

  useEffect(() => {
    onPointSelectRef.current = onPointSelect
  }, [onPointSelect])
  useEffect(() => {
    onRouteClickRef.current = onRouteClick
  }, [onRouteClick])
  useEffect(() => {
    showCitiesRef.current = showCities
  }, [showCities])

  // Initialize globe ONCE on mount - never recreate
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

        // Add country labels - sized based on country area
        const countryLabels = countries.features
          .map((country: any) => {
            const coordinates = country.properties.LABEL_X && country.properties.LABEL_Y
              ? [country.properties.LABEL_X, country.properties.LABEL_Y]
              : getCountryCentroid(country)

            // Calculate country area (rough approximation from geometry)
            const area = calculateCountryArea(country.geometry)
            
            // Scale label size based on country area
            // Small countries: 0.2-0.4, Medium: 0.4-0.7, Large: 0.7-1.2
            let labelSize = 0.3
            if (area > 5000000) labelSize = 1.0      // Very large (Russia, Canada, USA, China, Brazil)
            else if (area > 2000000) labelSize = 0.85 // Large (Australia, India, Argentina)
            else if (area > 1000000) labelSize = 0.7  // Large-medium (Algeria, Saudi Arabia)
            else if (area > 500000) labelSize = 0.6   // Medium-large (Libya, Iran, Mongolia)
            else if (area > 200000) labelSize = 0.5   // Medium (France, Spain, Germany)
            else if (area > 50000) labelSize = 0.4    // Small-medium (UK, Italy, Poland)
            else if (area > 10000) labelSize = 0.3    // Small (Belgium, Netherlands)
            else labelSize = 0.2                      // Very small (Luxembourg, Monaco)

            return {
              lat: coordinates[1],
              lng: coordinates[0],
              name: country.properties.NAME,
              size: labelSize,
              altitude: 0.02,
              area: area
            }
          })
          // Filter out very small countries/territories at far zoom for clarity
          .filter((country: any) => country.area > 1000) // Hide micro-states when zoomed out

        globe
          .labelsData(countryLabels)
          .labelLat((d: any) => d.lat)
          .labelLng((d: any) => d.lng)
          .labelText((d: any) => d.name)
          .labelSize((d: any) => d.size)
          .labelAltitude((d: any) => d.altitude)
          .labelDotRadius((d: any) => d.size * 0.1) // Dot size proportional to label
          .labelDotOrientation('bottom')
          .labelColor(() => 'rgba(255, 255, 255, 0.75)')
          .labelResolution(3)
      })

    // Load cities data for zoom-in detail
    fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_populated_places_simple.geojson')
      .then(res => res.json())
      .then(cities => {
        // Categorize cities by size
        const allCities = cities.features.map((city: any) => ({
          lat: city.geometry.coordinates[1],
          lng: city.geometry.coordinates[0],
          name: city.properties.name,
          population: city.properties.pop_max || 0,
          isCapital: city.properties.adm0cap === 1,
          size: 0.4,
          altitude: 0.01
        }))

        // Different city tiers
        const megaCities = allCities.filter((c: any) => c.population > 5000000 || c.isCapital) // 10M+ or capitals
        const majorCities = allCities.filter((c: any) => c.population > 2000000) // 2M+
        const mediumCities = allCities.filter((c: any) => c.population > 1000000) // 1M+
        const allMajor = allCities.filter((c: any) => c.population > 500000) // 500K+

        // Store city update function - uses ref so it always reads current showCities value
        const updateCityDisplay = (altitude: number) => {
          // Check if cities should be shown at all
          if (!showCitiesRef.current) {
            globe.htmlElementsData([])
            return
          }

          let citiesToShow: any[] = []

          // Progressive city display based on zoom
          if (altitude < 0.5) {
            citiesToShow = allMajor
          } else if (altitude < 0.8) {
            citiesToShow = mediumCities
          } else if (altitude < 1.2) {
            citiesToShow = majorCities
          } else if (altitude < 1.5) {
            citiesToShow = megaCities
          } else {
            citiesToShow = []
          }

          if (citiesToShow.length > 0) {
            globe
              .htmlElementsData(citiesToShow)
              .htmlElement((d: any) => {
                const el = document.createElement('div')
                el.innerHTML = `
                  <div style="
                    color: rgba(255, 255, 255, 0.9);
                    font-size: ${d.isCapital ? '10px' : '8px'};
                    font-weight: ${d.isCapital ? 'bold' : 'normal'};
                    text-shadow: 0 0 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.7);
                    pointer-events: none;
                    white-space: nowrap;
                    background: ${d.isCapital ? 'rgba(0, 102, 255, 0.3)' : 'rgba(0, 0, 0, 0.4)'};
                    padding: 2px 4px;
                    border-radius: 3px;
                    border: ${d.isCapital ? '1px solid rgba(0, 102, 255, 0.6)' : 'none'};
                    position: relative;
                    z-index: 0;
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
            globe.htmlElementsData([])
          }
        }

        // Update cities visibility based on zoom level
        globe.onZoom((coords: any) => {
          currentAltitudeRef.current = coords.altitude
          updateCityDisplay(coords.altitude)
        })

        // Store update function on globe for external access
        globeRef.current.updateCityDisplay = updateCityDisplay
      })

    // Configure points layer with empty initial data - will be updated by separate effect
    globe
      .pointsData([])
      .pointAltitude('size')
      .pointColor('color')
      .pointRadius((d: any) => d.type === 'refinery' ? 0.25 : 0.15) // Larger radius for refineries
      .pointsMerge(false)
      .pointsTransitionDuration(400) // Smooth transition when points change
      .pointLabel((d: any) => `
        <div style="
          background: rgba(0, 0, 0, 0.95);
          border: 2px solid ${d.color};
          padding: 15px;
          border-radius: 12px;
          color: white;
          min-width: 300px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          position: relative;
          z-index: 9999;
        ">
          <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: ${d.color};">
            ${d.type === 'refinery' ? d.data.name : d.data.title}
          </div>
          ${d.type === 'refinery' ? `
            <div style="font-size: 14px; margin-bottom: 8px;">
              <strong>Operator:</strong> ${d.data.operator || 'N/A'}
            </div>
            <div style="font-size: 14px; margin-bottom: 8px;">
              <strong>Location:</strong> ${d.data.city || ''}${d.data.city && d.data.country ? ', ' : ''}${d.data.country}
            </div>
            <div style="font-size: 14px; margin-bottom: 8px;">
              <strong>Capacity:</strong> ${d.capacity.toLocaleString()} bpd
            </div>
            <div style="font-size: 14px; margin-bottom: 8px;">
              <strong>Crude Types:</strong> ${d.data.crude_types_accepted.map((t: string) => {
                if (t === 'light') return 'Light';
                if (t === 'medium') return 'Medium';
                if (t === 'extra_heavy') return 'Extra Heavy';
                return t;
              }).join(', ')}
            </div>
          ` : `
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
          `}
        </div>
      `)
      .onPointClick((point: any) => {
        // Show info panel without changing zoom
        if (onPointSelectRef.current) {
          onPointSelectRef.current(point.data, point.type as 'commodity' | 'refinery')
        }

        // Highlight effect - briefly make the point larger
        globe.pointRadius((d: any) => {
          if (d === point) return (d.type === 'refinery' ? 0.25 : 0.15) * 2.5
          return d.type === 'refinery' ? 0.25 : 0.15
        })
        setTimeout(() => {
          globe.pointRadius((d: any) => d.type === 'refinery' ? 0.25 : 0.15)
        }, 1500)
      })

    // Click on globe (not on a point) - find nearest point and show info
    globe.onGlobeClick(({ lat, lng }: { lat: number, lng: number }) => {
      const currentPoints = (globe.pointsData() || []) as Array<{ lat: number; lng: number; data: any; type: string }>
      if (currentPoints.length === 0) return

      // Calculate distance to each point using Haversine formula
      const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371 // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLng = (lng2 - lng1) * Math.PI / 180
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        return R * c
      }

      // Find the closest point
      let closestPoint = currentPoints[0]
      let closestDistance = haversineDistance(lat, lng, closestPoint.lat, closestPoint.lng)

      for (const point of currentPoints) {
        const distance = haversineDistance(lat, lng, point.lat, point.lng)
        if (distance < closestDistance) {
          closestDistance = distance
          closestPoint = point
        }
      }

      // Show info panel for the closest point without changing zoom
      if (onPointSelectRef.current) {
        onPointSelectRef.current(closestPoint.data, closestPoint.type as 'commodity' | 'refinery')
      }

      // Highlight the point with a pulse effect
      globe.pointRadius((d: any) => {
        if (d === closestPoint) return (d.type === 'refinery' ? 0.25 : 0.15) * 2.5
        return d.type === 'refinery' ? 0.25 : 0.15
      })

      // Reset after animation
      setTimeout(() => {
        globe.pointRadius((d: any) => d.type === 'refinery' ? 0.25 : 0.15)
      }, 1500)
    })

    // Configure arcs layer with empty initial data - will be updated by separate effect
    globe
      .arcsData([])
      .arcStartLat((d: any) => d.startLat)
      .arcStartLng((d: any) => d.startLng)
      .arcEndLat((d: any) => d.endLat)
      .arcEndLng((d: any) => d.endLng)
      .arcColor((d: any) => d.color)
      .arcStroke((d: any) => d.stroke ?? 2.5)
      .arcDashLength(0.5)
      .arcDashGap(0.08)
      .arcDashAnimateTime(2500)
      .arcsTransitionDuration(500)
      .onArcClick((arc: any) => {
        if (arc.route && onRouteClickRef.current) {
          onRouteClickRef.current(arc.route)
        }
      })

    // Use ResizeObserver to fit globe to container (handles mobile, keyboard, etc.)
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
  }, []) // Run once on mount - globe is never recreated

  // Update only points and arcs when data changes - smooth transition, no globe reset
  useEffect(() => {
    const globe = globeRef.current
    if (!globe) return

    const validMarkers = markers.filter(m => m.latitude != null && m.longitude != null)
    const points = validMarkers.map(marker => ({
      lat: marker.latitude,
      lng: marker.longitude,
      size: 0.05,
      color: getCommodityColor(marker.commodity_type),
      label: marker.title,
      data: marker,
      type: 'commodity'
    }))

    const refineryPoints = refineries.map(refinery => {
      let color = '#6B7280'
      if (refinery.crude_types_accepted.includes('extra_heavy')) color = '#EF4444'
      else if (refinery.crude_types_accepted.includes('medium')) color = '#F59E0B'
      else if (refinery.crude_types_accepted.includes('light')) color = '#10B981'
      return {
        lat: refinery.latitude,
        lng: refinery.longitude,
        size: 0.08,
        color,
        label: refinery.name,
        data: refinery,
        type: 'refinery',
        capacity: refinery.capacity_bpd
      }
    })

    const allPoints = [...points, ...refineryPoints]

    const arcs: any[] = []
    routes.forEach(route => {
      const arcBase = {
        color: route.color,
        name: route.name,
        id: route.id,
        route,
        stroke: 2.5,
      }
      if (route.waypoints && route.waypoints.length > 0) {
        const pts = [
          { lat: route.startLat, lng: route.startLng },
          ...route.waypoints,
          { lat: route.endLat, lng: route.endLng }
        ]
        for (let i = 0; i < pts.length - 1; i++) {
          arcs.push({
            ...arcBase,
            startLat: pts[i].lat,
            startLng: pts[i].lng,
            endLat: pts[i + 1].lat,
            endLng: pts[i + 1].lng,
          })
        }
      } else {
        arcs.push({
          ...arcBase,
          startLat: route.startLat,
          startLng: route.startLng,
          endLat: route.endLat,
          endLng: route.endLng,
        })
      }
    })

    globe.pointsData(allPoints)
    globe.arcsData(arcs)
  }, [markers, routes, refineries])

  // Handle showCities toggle
  useEffect(() => {
    if (globeRef.current && globeRef.current.updateCityDisplay) {
      globeRef.current.updateCityDisplay(currentAltitudeRef.current)
    }
  }, [showCities])

  // Handle satellite mode toggle
  useEffect(() => {
    const globe = globeRef.current
    if (!globe) return

    if (satelliteMode) {
      globe.bumpImageUrl('')
      globe.atmosphereColor('#1a3a5c')
      globe.atmosphereAltitude(0.12)
      globe.polygonCapColor(() => 'rgba(100, 200, 255, 0.03)')
      globe.polygonSideColor(() => 'rgba(100, 200, 255, 0.01)')
      globe.polygonStrokeColor(() => 'rgba(100, 200, 255, 0.2)')
    } else {
      globe.bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      globe.atmosphereColor('#3a228a')
      globe.atmosphereAltitude(0.25)
      globe.polygonCapColor(() => 'rgba(255, 255, 255, 0.05)')
      globe.polygonSideColor(() => 'rgba(255, 255, 255, 0.02)')
      globe.polygonStrokeColor(() => '#555')
    }
  }, [satelliteMode])

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

  const calculateCountryArea = (geometry: any) => {
    // Rough area calculation based on bounding box
    try {
      let allCoords: number[][] = []
      
      if (geometry.type === 'Polygon') {
        allCoords = geometry.coordinates[0]
      } else if (geometry.type === 'MultiPolygon') {
        allCoords = geometry.coordinates[0][0]
      }

      if (allCoords.length === 0) return 0

      const lats = allCoords.map((c: number[]) => c[1])
      const lngs = allCoords.map((c: number[]) => c[0])

      const minLat = Math.min(...lats)
      const maxLat = Math.max(...lats)
      const minLng = Math.min(...lngs)
      const maxLng = Math.max(...lngs)

      // Approximate area in km² (very rough)
      const latDiff = maxLat - minLat
      const lngDiff = maxLng - minLng
      const area = Math.abs(latDiff * lngDiff) * 12100 // Rough conversion to km²

      return area
    } catch (e) {
      return 10000 // Default small size
    }
  }

  return (
    <div ref={globeEl} style={{ width: '100%', height: '100%' }} className="bg-black" />
  )
}

// Memoize to prevent re-renders when parent state changes (like selectedPoint)
export default memo(Globe3DClient, (prevProps, nextProps) => {
  return (
    prevProps.markers === nextProps.markers &&
    prevProps.showCities === nextProps.showCities &&
    prevProps.routes === nextProps.routes &&
    prevProps.refineries === nextProps.refineries &&
    prevProps.satelliteMode === nextProps.satelliteMode
  )
})
