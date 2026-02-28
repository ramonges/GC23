'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { supabase } from '@/lib/supabase'
import { matchCountry } from '@/lib/countries'
import { Clock, Gamepad2, ChevronDown } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

const COMMODITIES = [
  { id: 'oil', label: 'Oil', color: '#FF6B35' },
  { id: 'gas', label: 'Natural Gas', color: '#3B82F6' },
  { id: 'uranium', label: 'Uranium', color: '#10B981' },
  { id: 'coal', label: 'Coal', color: '#F59E0B' },
  { id: 'gold', label: 'Gold', color: '#FFD700' },
] as const

const GAME_DURATION_SEC = 15 * 60 // 15 minutes

// Map DB country to Natural Earth ADMIN (for site filtering)
const dbCountryToCanonical: Record<string, string> = {
  'United States': 'United States of America',
  'USA': 'United States of America',
  'US': 'United States of America',
  'Congo (DRC)': 'Democratic Republic of the Congo',
  'DRC': 'Democratic Republic of the Congo',
  'Democratic Republic of Congo': 'Democratic Republic of the Congo',
  'UK': 'United Kingdom',
  'Great Britain': 'United Kingdom',
  'England': 'United Kingdom',
  'Ivory Coast': 'Ivory Coast',
  "Côte d'Ivoire": 'Ivory Coast',
  'UAE': 'United Arab Emirates',
  'Czech Republic': 'Czechia',
  'Burma': 'Myanmar',
  'Serbia': 'Republic of Serbia',
  'Tanzania': 'United Republic of Tanzania',
  'Congo': 'Republic of the Congo',
  'Bahamas': 'The Bahamas',
  'Swaziland': 'eSwatini',
  'Eswatini': 'eSwatini',
  'Cape Verde': 'Cabo Verde',
  'Viet Nam': 'Vietnam',
}

function canonicalForDb(dbCountry: string): string {
  return dbCountryToCanonical[dbCountry?.trim() || ''] ?? (dbCountry?.trim() || '')
}

interface Site {
  id: string
  title: string
  latitude: number
  longitude: number
  country: string
  [key: string]: any
}

function MapStyle({ unlocked, geoData }: { unlocked: Set<string>; geoData: any }) {
  const map = useMap()
  useEffect(() => {
    if (!geoData) return
    map.fitBounds(L.geoJSON(geoData).getBounds(), { padding: [20, 20] })
  }, [map, geoData])
  return null
}

export default function CommodityGame() {
  const [commodity, setCommodity] = useState<(typeof COMMODITIES)[number]['id'] | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SEC)
  const [countryInput, setCountryInput] = useState('')
  const [unlockedCountries, setUnlockedCountries] = useState<Set<string>>(new Set())
  const [sites, setSites] = useState<Site[]>([])
  const [geoData, setGeoData] = useState<any>(null)
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // Load world countries GeoJSON
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson')
      .then((r) => r.json())
      .then(setGeoData)
      .catch(console.error)
  }, [])

  // Timer
  useEffect(() => {
    if (!gameStarted || timeLeft <= 0) return
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [gameStarted, timeLeft])

  // Fetch sites when commodity + unlocked countries change
  const fetchSites = useCallback(async () => {
    if (!commodity || unlockedCountries.size === 0) {
      setSites([])
      return
    }
    const canonicals = Array.from(unlockedCountries)
    try {
      if (commodity === 'gold') {
        const { data, error } = await supabase.from('gold_mines').select('*')
        if (error) throw error
        const rows = (data || []).filter((r: any) => {
          const dbC = r.country?.trim() || ''
          const canon = canonicalForDb(dbC) || dbC
          return canonicals.some((u) => u === canon || u === dbC)
        })
        setSites(
          rows.map((r: any) => ({
            id: r.id,
            title: r.mine_name || r.name || 'Gold Mine',
            latitude: Number(r.latitude ?? r.lat),
            longitude: Number(r.longitude ?? r.lng),
            country: r.country,
            ...r,
          }))
        )
      } else if (commodity === 'coal') {
        const { data, error } = await supabase.from('coal_mines').select('*')
        if (error) throw error
        const rows = (data || []).filter((r: any) => {
          const dbC = r.country?.trim() || ''
          const canon = canonicalForDb(dbC) || dbC
          return canonicals.some((u) => u === canon || u === dbC)
        })
        setSites(
          rows.map((r: any) => ({
            id: r.id,
            title: r.mine_name || 'Coal Mine',
            latitude: Number(r.latitude ?? r.lat),
            longitude: Number(r.longitude ?? r.lng),
            country: r.country,
            ...r,
          }))
        )
      } else {
        const commodityMap = { oil: 'Crude Oil', gas: 'Natural Gas', uranium: 'Uranium' }
        const name = commodityMap[commodity as keyof typeof commodityMap]
        let q = supabase.from('commodity_locations').select('*').eq('commodity_name', name)
        const { data, error } = await q
        if (error) throw error
        const rows = (data || []).filter((r: any) => {
          const dbC = r.country?.trim() || ''
          const canon = canonicalForDb(dbC) || dbC
          return canonicals.some((u) => u === canon || u === dbC)
        })
        setSites(
          rows.map((r: any) => ({
            id: r.id,
            title: r.title || 'Site',
            latitude: Number(r.latitude ?? r.lat),
            longitude: Number(r.longitude ?? r.lng),
            country: r.country,
            ...r,
          }))
        )
      }
    } catch (e) {
      console.error(e)
      setSites([])
    }
  }, [commodity, unlockedCountries])

  useEffect(() => {
    fetchSites()
  }, [fetchSites])

  const handleUnlock = () => {
    const matched = matchCountry(countryInput)
    if (!matched) {
      setMessage('Country not recognized. Try another spelling.')
      setTimeout(() => setMessage(null), 2000)
      return
    }
    if (unlockedCountries.has(matched)) {
      setMessage('Already unlocked!')
      setTimeout(() => setMessage(null), 1500)
      setCountryInput('')
      return
    }
    setUnlockedCountries((s) => new Set([...s, matched]))
    setMessage(`✓ ${matched} unlocked!`)
    setTimeout(() => setMessage(null), 1500)
    setCountryInput('')
  }

  const startGame = () => {
    if (!commodity) return
    setGameStarted(true)
    setTimeLeft(GAME_DURATION_SEC)
    setUnlockedCountries(new Set())
    setSites([])
    setSelectedSite(null)
  }

  const resetGame = () => {
    setGameStarted(false)
    setTimeLeft(GAME_DURATION_SEC)
    setUnlockedCountries(new Set())
    setCountryInput('')
    setSites([])
    setSelectedSite(null)
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const color = commodity ? COMMODITIES.find((c) => c.id === commodity)?.color : '#666'

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-100">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-xl font-bold text-black flex items-center gap-2">
            <Gamepad2 size={24} />
            Commodity Game
          </h1>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Commodity:</label>
            <select
              value={commodity || ''}
              onChange={(e) => {
                setCommodity((e.target.value || null) as any)
                resetGame()
              }}
              disabled={gameStarted}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium"
            >
              <option value="">Select...</option>
              {COMMODITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          {commodity && !gameStarted && (
            <button
              onClick={startGame}
              className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800"
            >
              Start Game (15 min)
            </button>
          )}
          {gameStarted && (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <Clock size={18} />
                <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
              </div>
              <span className="text-sm text-gray-500">
                {unlockedCountries.size} countries unlocked
              </span>
            </>
          )}
        </div>
      </div>

      {/* Input bar (when game started) */}
      {gameStarted && (
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <input
            type="text"
            value={countryInput}
            onChange={(e) => setCountryInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            placeholder="Type a country name..."
            className="flex-1 max-w-md px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
            disabled={timeLeft <= 0}
          />
          <button
            onClick={handleUnlock}
            disabled={timeLeft <= 0}
            className="px-4 py-2 bg-black text-white rounded-lg font-medium disabled:opacity-50"
          >
            Unlock
          </button>
          {message && (
            <span className="text-sm font-medium text-green-600 animate-pulse">{message}</span>
          )}
        </div>
      )}

      {/* Map area */}
      <div className="flex-1 min-h-0 relative">
        {!commodity ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <p className="text-gray-500 text-lg">Select a commodity and start the game</p>
          </div>
        ) : !gameStarted ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <p className="text-gray-500 text-lg">Click &quot;Start Game&quot; to begin</p>
          </div>
        ) : (
          <MapContainer
            center={[20, 0]}
            zoom={2}
            className="w-full h-full"
            style={{ minHeight: 400 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {geoData && (
              <GeoJSON
                key={`${unlockedCountries.size}-${commodity}`}
                data={geoData}
                style={(feature) => {
                  const admin = feature?.properties?.ADMIN || feature?.properties?.NAME || ''
                  const isUnlocked = unlockedCountries.has(admin)
                  return {
                    fillColor: isUnlocked ? color : '#1a1a1a',
                    fillOpacity: isUnlocked ? 0.6 : 0.85,
                    color: isUnlocked ? color : '#333',
                    weight: 1,
                  }
                }}
              />
            )}
            {sites.map((site) => (
              <Marker
                key={site.id}
                position={[site.latitude, site.longitude]}
                eventHandlers={{ click: () => setSelectedSite(site) }}
                icon={L.divIcon({
                  className: 'custom-marker',
                  html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
                  iconSize: [12, 12],
                  iconAnchor: [6, 6],
                })}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <p className="font-bold text-base mb-1">{site.title}</p>
                    <p className="text-sm text-gray-600">{site.country}</p>
                    {site.operator && (
                      <p className="text-sm mt-1">
                        <strong>Operator:</strong> {site.operator}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
            <MapStyle unlocked={unlockedCountries} geoData={geoData} />
          </MapContainer>
        )}

        {/* Selected site panel */}
        {selectedSite && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 p-4 max-h-64 overflow-y-auto z-[1000]">
            <button
              onClick={() => setSelectedSite(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-black"
            >
              ×
            </button>
            <h3 className="font-bold text-lg mb-2 pr-6">{selectedSite.title}</h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-gray-500">Country:</span> {selectedSite.country}
              </p>
              {selectedSite.operator && (
                <p>
                  <span className="text-gray-500">Operator:</span> {selectedSite.operator}
                </p>
              )}
              {selectedSite.address && (
                <p>
                  <span className="text-gray-500">Address:</span> {selectedSite.address}
                </p>
              )}
              {selectedSite.annual_capacity_troy_oz && (
                <p>
                  <span className="text-gray-500">Annual capacity:</span>{' '}
                  {selectedSite.annual_capacity_troy_oz.toLocaleString()} troy oz
                </p>
              )}
              {selectedSite.annual_capacity_tonnes && (
                <p>
                  <span className="text-gray-500">Annual capacity:</span>{' '}
                  {selectedSite.annual_capacity_tonnes?.toLocaleString()} tonnes
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
