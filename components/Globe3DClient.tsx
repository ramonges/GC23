'use client'

import { useEffect, useRef, memo } from 'react'
import Globe from 'globe.gl'
import { CommodityData, RefineryData, ShippingRoute, VesselData } from '@/lib/types'
import { COMMODITY_COLORS, COMMODITY_FALLBACK, VESSEL_COLORS } from '@/lib/map-theme'

const STYLED_EARTH = '/hero/earth-color.webp'
const SATELLITE_EARTH = '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
const TOPOLOGY = '//unpkg.com/three-globe/example/img/earth-topology.png'
const ATMOSPHERE = '#8FA6B2'
const BORDER = 'rgba(241, 240, 232, 0.16)'
const pointRadius = (d: { type?: string }) => (d.type === 'refinery' ? 0.22 : 0.13)
const MONO = "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace"

interface Globe3DClientProps {
  markers: CommodityData[]
  showCities?: boolean
  routes?: ShippingRoute[]
  refineries?: RefineryData[]
  vessels?: VesselData[]
  satelliteMode?: boolean
  onPointSelect?: (point: CommodityData | RefineryData | null, type: 'commodity' | 'refinery') => void
  onVesselClick?: (vessel: VesselData) => void
  onRouteClick?: (route: ShippingRoute) => void
}


function Globe3DClient({ markers, showCities = true, routes = [], refineries = [], vessels = [], satelliteMode = false, onPointSelect, onVesselClick, onRouteClick }: Globe3DClientProps) {
  const globeEl = useRef<HTMLDivElement>(null)
  const globeRef = useRef<any>(null)
  const currentAltitudeRef = useRef<number>(2.5)
  const onPointSelectRef = useRef(onPointSelect)
  const onVesselClickRef = useRef(onVesselClick)
  const onRouteClickRef = useRef(onRouteClick)
  const showCitiesRef = useRef(showCities)
  const vesselsRef = useRef<VesselData[]>([])

  useEffect(() => {
    onPointSelectRef.current = onPointSelect
  }, [onPointSelect])
  useEffect(() => {
    onVesselClickRef.current = onVesselClick
  }, [onVesselClick])
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
      .globeImageUrl(STYLED_EARTH)
      .bumpImageUrl(TOPOLOGY)
      .backgroundColor('#080909')
      .showAtmosphere(true)
      .atmosphereColor(ATMOSPHERE)
      .atmosphereAltitude(0.13)
      .width(rect.width)
      .height(rect.height)

    globeRef.current = globe

    // The styled texture keeps oceans near-black; a faint slate emissive gives the sphere volume against the ink background.
    const material = globe.globeMaterial() as any
    material.emissive?.set('#1a262c')
    material.emissiveIntensity = 0.55
    material.shininess = 6

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
          .polygonCapColor(() => 'rgba(241, 240, 232, 0.015)')
          .polygonSideColor(() => 'rgba(0, 0, 0, 0)')
          .polygonStrokeColor(() => BORDER)
          .polygonAltitude(0.004)

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
          .labelDotRadius((d: any) => d.size * 0.06)
          .labelDotOrientation('bottom')
          .labelColor(() => 'rgba(241, 240, 232, 0.6)')
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

        const updateCityDisplay = (altitude: number) => {
          let citiesToShow: any[] = []

          if (showCitiesRef.current) {
            if (altitude < 0.5) citiesToShow = allMajor
            else if (altitude < 0.8) citiesToShow = mediumCities
            else if (altitude < 1.2) citiesToShow = majorCities
            else if (altitude < 1.5) citiesToShow = megaCities
          }

          const cityItems = citiesToShow.map((c: any) => ({ ...c, _type: 'city' }))
          const vesselItems = vesselsRef.current.map(v => ({
            lat: v.latitude,
            lng: v.longitude,
            altitude: 0.01,
            _type: 'vessel',
            _data: v,
            _color: VESSEL_COLORS[v.ship_category || 'other'] || VESSEL_COLORS.other,
            _course: v.course ?? v.heading ?? 0,
          }))

          const allItems = [...cityItems, ...vesselItems]

          globe
            .htmlElementsData(allItems)
            .htmlElement((d: any) => {
              if (d._type === 'vessel') {
                const el = document.createElement('div')
                const color = d._color
                const rotation = d._course || 0
                el.style.cursor = 'pointer'
                el.style.pointerEvents = 'auto'
                el.innerHTML = `
                  <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
                    <svg viewBox="0 0 24 24" width="16" height="16" style="filter: drop-shadow(0 0 4px rgba(8,9,9,0.9)); transform: rotate(${rotation}deg);">
                      <path d="M12 2 L16 10 L20 18 L12 15 L4 18 L8 10 Z" fill="${color}" stroke="rgba(8,9,9,0.85)" stroke-width="1.2"/>
                    </svg>
                  </div>
                `
                el.onclick = (e) => {
                  e.stopPropagation()
                  if (onVesselClickRef.current) onVesselClickRef.current(d._data)
                }
                return el
              }
              const el = document.createElement('div')
              el.innerHTML = `
                <div style="
                  display: flex;
                  align-items: center;
                  gap: 4px;
                  color: ${d.isCapital ? 'rgba(241, 240, 232, 0.92)' : 'rgba(198, 200, 193, 0.75)'};
                  font-family: ${MONO};
                  font-size: ${d.isCapital ? '9px' : '8px'};
                  letter-spacing: 0.12em;
                  text-transform: uppercase;
                  text-shadow: 0 0 4px rgba(8, 9, 9, 0.95);
                  pointer-events: none;
                  white-space: nowrap;
                ">
                  <span style="width: 3px; height: 3px; background: ${d.isCapital ? '#F36B21' : 'rgba(198, 200, 193, 0.7)'};"></span>
                  ${d.name}
                </div>
              `
              return el
            })
            .htmlLat((d: any) => d.lat)
            .htmlLng((d: any) => d.lng)
            .htmlAltitude((d: any) => d.altitude || 0.01)
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
      .pointRadius(pointRadius)
      .pointResolution(6)
      .pointsMerge(false)
      .pointsTransitionDuration(400) // Smooth transition when points change
      .pointLabel((d: any) => {
        const row = (k: string, v: string) =>
          `<div style="display:flex;justify-content:space-between;gap:16px;padding:6px 0;border-top:1px solid rgba(241,240,232,0.08)"><span style="color:#858981">${k}</span><span style="color:#F1F0E8;text-align:right">${v}</span></div>`
        const title = d.type === 'refinery' ? d.data.name : d.data.title
        const rows =
          d.type === 'refinery'
            ? [
                row('Operator', d.data.operator || '—'),
                row('Location', `${d.data.city || ''}${d.data.city && d.data.country ? ', ' : ''}${d.data.country || ''}`),
                row('Capacity', `${d.capacity.toLocaleString()} bpd`),
                row('Crude', d.data.crude_types_accepted.map((t: string) => (t === 'extra_heavy' ? 'Extra heavy' : t[0].toUpperCase() + t.slice(1))).join(', ')),
              ]
            : [
                row('Owner', d.data.owner || '—'),
                row('Commodity', d.data.commodity_name || '—'),
                d.data.address ? row('Location', d.data.address) : '',
                d.data.supply_volume > 0 ? row('Supply', `${d.data.supply_volume.toLocaleString()} t`) : '',
                d.data.long_term_contract ? row('Contract', `Long-term${d.data.contract_with ? ` · ${d.data.contract_with}` : ''}`) : '',
              ]
        return `
          <div style="background:rgba(8,9,9,0.94);border:1px solid rgba(241,240,232,0.14);padding:14px 16px;min-width:260px;max-width:320px;font-family:var(--font-grotesk),system-ui,sans-serif;font-size:12px;color:#F1F0E8;backdrop-filter:blur(8px)">
            <div style="display:flex;align-items:center;gap:8px;font-family:${MONO};font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#858981">
              <span style="width:6px;height:6px;background:${d.color}"></span>${d.type === 'refinery' ? 'Refinery' : d.data.commodity_type || 'Site'}
            </div>
            <div style="margin:8px 0 10px;font-size:16px;line-height:1.25;font-weight:500">${title}</div>
            ${rows.join('')}
          </div>`
      })
      .onPointClick((point: any) => {
        // Show info panel without changing zoom
        if (onPointSelectRef.current) {
          onPointSelectRef.current(point.data, point.type as 'commodity' | 'refinery')
        }

        // Highlight effect - briefly make the point larger
        globe.pointRadius((d: any) => {
          if (d === point) return pointRadius(d) * 2.5
          return pointRadius(d)
        })
        setTimeout(() => {
          globe.pointRadius(pointRadius)
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
        if (d === closestPoint) return pointRadius(d) * 2.5
        return pointRadius(d)
      })

      // Reset after animation
      setTimeout(() => {
        globe.pointRadius((d: any) => pointRadius(d))
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
      .arcStroke((d: any) => d.stroke ?? 0.6)
      .arcDashLength(0.35)
      .arcDashGap(0.12)
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

  // Update points (commodities + refineries) and arcs
  useEffect(() => {
    const globe = globeRef.current
    if (!globe) return

    const validMarkers = markers.filter(m => m.latitude != null && m.longitude != null)
    const points = validMarkers.map(marker => ({
      lat: marker.latitude,
      lng: marker.longitude,
      size: 0.018,
      color: getCommodityColor(marker.commodity_type),
      label: marker.title,
      data: marker,
      type: 'commodity'
    }))

    const refineryPoints = refineries.map(refinery => {
      let color = '#858981'
      if (refinery.crude_types_accepted.includes('extra_heavy')) color = '#E5553B'
      else if (refinery.crude_types_accepted.includes('medium')) color = '#D9B45A'
      else if (refinery.crude_types_accepted.includes('light')) color = '#8DB36A'
      return {
        lat: refinery.latitude,
        lng: refinery.longitude,
        size: 0.03,
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
        stroke: 0.6,
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

  // Handle vessel data updates - refresh the HTML layer
  useEffect(() => {
    vesselsRef.current = vessels
    if (globeRef.current && globeRef.current.updateCityDisplay) {
      globeRef.current.updateCityDisplay(currentAltitudeRef.current)
    }
  }, [vessels])

  // Handle satellite mode toggle
  useEffect(() => {
    const globe = globeRef.current
    if (!globe) return

    globe.globeImageUrl(satelliteMode ? SATELLITE_EARTH : STYLED_EARTH)
    globe.bumpImageUrl(TOPOLOGY)
    globe.atmosphereColor(ATMOSPHERE)
    globe.atmosphereAltitude(satelliteMode ? 0.12 : 0.13)
    globe.polygonStrokeColor(() => (satelliteMode ? 'rgba(241, 240, 232, 0.28)' : BORDER))
  }, [satelliteMode])

  const getCommodityColor = (type: string) => COMMODITY_COLORS[type] || COMMODITY_FALLBACK

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
    <div ref={globeEl} style={{ width: '100%', height: '100%' }} className="bg-vulcan-ink" />
  )
}

// Memoize to prevent re-renders when parent state changes (like selectedPoint)
export default memo(Globe3DClient, (prevProps, nextProps) => {
  return (
    prevProps.markers === nextProps.markers &&
    prevProps.showCities === nextProps.showCities &&
    prevProps.routes === nextProps.routes &&
    prevProps.refineries === nextProps.refineries &&
    prevProps.vessels === nextProps.vessels &&
    prevProps.satelliteMode === nextProps.satelliteMode
  )
})
