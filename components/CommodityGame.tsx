'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import { matchCountry, allCountries } from '@/lib/countries'
import { Clock, Gamepad2 } from 'lucide-react'

const GameGlobe3D = dynamic(() => import('./GameGlobe3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div className="text-white">Loading 3D globe...</div>
    </div>
  ),
})

// Same commodity categories as EarthMap (map with commodities)
const commodityCategories = {
  Energy: ['Crude Oil', 'Natural Gas', 'Uranium', 'Coal'],
  Metals: ['Gold', 'Silver', 'Copper', 'Steel', 'Lithium', 'Iron Ore', 'Platinum', 'Silicon', 'Titanium'],
  Agricultural: ['Soybeans', 'Wheat', 'Coffee', 'Cotton', 'Rice', 'Sugar', 'Cocoa', 'Corn'],
  Industrial: ['Cobalt', 'Aluminium', 'Zinc', 'Nickel', 'Rhodium', 'Palladium', 'Magnesium'],
  Livestock: ['Beef', 'Poultry', 'Eggs', 'Salmon', 'Live Cattle', 'Feeder Cattle', 'Lean Hogs'],
}

const COMMODITY_COLORS: Record<string, string> = {
  'Crude Oil': '#FF6B35',
  'Natural Gas': '#3B82F6',
  'Uranium': '#10B981',
  'Coal': '#F59E0B',
  'Gold': '#FFD700',
  'Silver': '#C0C0C0',
  'Copper': '#B87333',
  'Steel': '#6B7280',
  'Lithium': '#8B5CF6',
  'Iron Ore': '#6B7280',
  'Platinum': '#E5E4E2',
  'Silicon': '#4B5563',
  'Titanium': '#A8A8A8',
  'Soybeans': '#90EE90',
  'Wheat': '#F5DEB3',
  'Coffee': '#6F4E37',
  'Cotton': '#F5F5F5',
  'Rice': '#FFF8DC',
  'Sugar': '#FFE4E1',
  'Cocoa': '#8B4513',
  'Corn': '#FFD700',
  'Cobalt': '#0047AB',
  'Aluminium': '#C0C0C0',
  'Zinc': '#7F8B8B',
  'Nickel': '#7285A5',
  'Rhodium': '#E8E8E8',
  'Palladium': '#CED0DD',
  'Magnesium': '#B8860B',
  'Beef': '#8B4513',
  'Poultry': '#FFD700',
  'Eggs': '#FFF8DC',
  'Salmon': '#FA8072',
  'Live Cattle': '#8B4513',
  'Feeder Cattle': '#A0522D',
  'Lean Hogs': '#DEB887',
}

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

// Flatten commodityCategories (same as map) into game options
// All data from commodity_locations (big table used by EarthMap)
const GAME_COMMODITIES = (() => {
  const list: { id: string; label: string; color: string; commodityType: string; commodityName: string }[] = []
  for (const [cat, names] of Object.entries(commodityCategories)) {
    for (const name of names) {
      list.push({
        id: `${cat}-${name}`,
        label: name,
        color: COMMODITY_COLORS[name] || '#6B7280',
        commodityType: cat,
        commodityName: name,
      })
    }
  }
  return list
})()

export interface GameCommodity {
  id: string
  label: string
  color: string
  commodityType: string
  commodityName: string
}

interface Site {
  id: string
  title: string
  latitude: number
  longitude: number
  country: string
  [key: string]: any
}

export default function CommodityGame() {
  const [commodity, setCommodity] = useState<GameCommodity | null>(GAME_COMMODITIES[0] ?? null)
  const [gameStarted, setGameStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SEC)
  const [countryInput, setCountryInput] = useState('')
  const [unlockedCountries, setUnlockedCountries] = useState<Set<string>>(new Set())
  const [sites, setSites] = useState<Site[]>([])
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [gameOverPopup, setGameOverPopup] = useState<{
    score: number
    topPercent: number | null
    countries: string[]
  } | null>(null)
  const [showAllCountriesTable, setShowAllCountriesTable] = useState(false)
  const gameOverHandledRef = useRef(false)

  // Timer starts when user unlocks first country
  useEffect(() => {
    if (!gameStarted || timeLeft <= 0) return
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [gameStarted, timeLeft])

  const handleFinishGame = useCallback(async () => {
    if (unlockedCountries.size === 0 || gameOverHandledRef.current) return
    gameOverHandledRef.current = true

    const score = unlockedCountries.size
    const countries = Array.from(unlockedCountries).sort()
    const commodityLabel = (commodity ?? GAME_COMMODITIES[0])?.commodityName ?? 'Crude Oil'

    try {
      await supabase.from('commodity_game_scores').insert({
        commodity: commodityLabel,
        score,
      })
    } catch (e) {
      console.warn('Could not save score:', e)
    }

    try {
      const { data: allScores } = await supabase
        .from('commodity_game_scores')
        .select('score')
        .eq('commodity', commodityLabel)

      const scores = (allScores || []).map((r: any) => r.score)
      const total = scores.length
      const betterOrEqual = scores.filter((s) => s >= score).length
      const topPercent = total > 0 ? Math.round((betterOrEqual / total) * 100) : 100

      setGameOverPopup({ score, topPercent, countries })
    } catch (e) {
      console.warn('Could not compute percentile:', e)
      setGameOverPopup({ score, topPercent: null, countries })
    }
  }, [commodity, unlockedCountries])

  // When clock reaches 0: trigger finish
  useEffect(() => {
    if (!gameStarted || timeLeft !== 0 || !commodity || gameOverHandledRef.current) return
    handleFinishGame()
  }, [gameStarted, timeLeft, commodity, handleFinishGame])

  // Fetch sites from commodity_locations only (big table used by EarthMap)
  const fetchSites = useCallback(async () => {
    if (!commodity || unlockedCountries.size === 0) {
      setSites([])
      return
    }
    const canonicals = Array.from(unlockedCountries)
    try {
      const PAGE_SIZE = 1000
      let allData: any[] = []
      let from = 0
      let keepFetching = true

      while (keepFetching) {
        const { data, error } = await supabase
          .from('commodity_locations')
          .select('*')
          .eq('commodity_type', commodity.commodityType)
          .eq('commodity_name', commodity.commodityName)
          .not('latitude', 'is', null)
          .not('longitude', 'is', null)
          .range(from, from + PAGE_SIZE - 1)

        if (error) throw error
        const rows = data || []
        allData = allData.concat(rows)
        from += PAGE_SIZE
        if (rows.length < PAGE_SIZE) keepFetching = false
      }

      const filtered = allData.filter((r: any) => {
        const dbC = r.country?.trim() || ''
        const canon = canonicalForDb(dbC) || dbC
        return canonicals.some((u) => u === canon || u === dbC)
      })

      setSites(
        filtered.map((r: any) => ({
          id: r.id,
          title: r.title || 'Site',
          latitude: Number(r.latitude ?? r.lat),
          longitude: Number(r.longitude ?? r.lng),
          country: r.country,
          ...r,
        }))
      )
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
    // Start timer on first unlock
    if (!gameStarted) {
      gameOverHandledRef.current = false
      setGameStarted(true)
      setTimeLeft(GAME_DURATION_SEC)
    }
  }

  const resetGame = () => {
    setGameStarted(false)
    setTimeLeft(GAME_DURATION_SEC)
    setUnlockedCountries(new Set())
    setCountryInput('')
    setSites([])
    setSelectedSite(null)
    setGameOverPopup(null)
    setShowAllCountriesTable(false)
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const color = (commodity ?? GAME_COMMODITIES[0])?.color ?? '#666'

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
            <label className="text-sm font-medium text-gray-600">Show:</label>
            <select
              value={commodity?.id ?? ''}
              onChange={(e) => {
                const c = GAME_COMMODITIES.find((x) => x.id === e.target.value)
                setCommodity(c ?? null)
              }}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium"
            >
              <option value="">Select commodity...</option>
              {GAME_COMMODITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          {gameStarted && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
              <Clock size={18} />
              <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
            </div>
          )}
          <span className="text-sm text-gray-500">
            {unlockedCountries.size} / {allCountries.length} countries unlocked
          </span>
        </div>
      </div>

      {/* Input bar - always visible */}
      {!gameOverPopup && (
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-wrap">
          <input
            type="text"
            value={countryInput}
            onChange={(e) => setCountryInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            placeholder="Type a country name to unlock it..."
            className="flex-1 min-w-[200px] max-w-md px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
            disabled={timeLeft <= 0 && gameStarted}
          />
          <button
            onClick={handleUnlock}
            disabled={timeLeft <= 0 && gameStarted}
            className="px-4 py-2 bg-black text-white rounded-lg font-medium disabled:opacity-50"
          >
            Unlock
          </button>
          <button
            onClick={() => handleFinishGame()}
            disabled={unlockedCountries.size === 0}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50"
          >
            Finish
          </button>
          {message && (
            <span className="text-sm font-medium text-green-600 animate-pulse">{message}</span>
          )}
        </div>
      )}

      {/* 3D Globe - always visible */}
      <div className="flex-1 min-h-0 relative">
        <div className="w-full h-full min-h-[400px]">
          <GameGlobe3D
            unlockedCountries={unlockedCountries}
            sites={sites}
            color={color}
            onSiteSelect={setSelectedSite}
          />
        </div>

        {/* End-of-game popup (when clock reaches 0 or Finish clicked) */}
        {gameOverPopup && (
          <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
              <h2 className="text-2xl font-bold text-black mb-4 text-center">Results</h2>
              <p className="text-lg text-gray-700 mb-2 text-center">
                You unlocked <strong>{gameOverPopup.score}</strong> / {allCountries.length} countries.
              </p>
              {gameOverPopup.topPercent != null ? (
                <p className="text-xl font-bold text-green-600 mb-4 text-center">
                  You&apos;re in the <strong>Top {gameOverPopup.topPercent}%</strong> of players!
                </p>
              ) : (
                <p className="text-gray-500 mb-4 text-center">Ranking will be available once more players have played.</p>
              )}
              {gameOverPopup.countries.length > 0 && (
                <div className="mb-4 flex-1 min-h-0 overflow-hidden">
                  <p className="text-sm font-medium text-gray-600 mb-2">Countries unlocked:</p>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto text-sm text-gray-700">
                    {gameOverPopup.countries.join(', ')}
                  </div>
                </div>
              )}
              <button
                onClick={() => setShowAllCountriesTable(true)}
                className="px-6 py-2 mb-3 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 w-full"
              >
                View all countries (found / missed)
              </button>
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 w-full"
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {/* All countries table overlay */}
        {gameOverPopup && showAllCountriesTable && (
          <div className="absolute inset-0 z-[3000] flex items-center justify-center bg-black/70 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-black">All countries — black = found, red = missed</h3>
                <button
                  onClick={() => setShowAllCountriesTable(false)}
                  className="text-gray-500 hover:text-black text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <div className="overflow-y-auto flex-1 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-4">
                  {allCountries.map((c) => {
                    const found = gameOverPopup!.countries.includes(c)
                    return (
                      <div
                        key={c}
                        className={`text-sm py-1 ${found ? 'text-black font-medium' : 'text-red-600'}`}
                      >
                        {c}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected site panel */}
        {selectedSite && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 p-4 max-h-64 overflow-y-auto z-[1000]">
            <button
              onClick={() => setSelectedSite(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-black text-xl"
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
              {selectedSite.annual_capacity_troy_oz != null && (
                <p>
                  <span className="text-gray-500">Annual capacity:</span>{' '}
                  {selectedSite.annual_capacity_troy_oz.toLocaleString()} troy oz
                </p>
              )}
              {selectedSite.annual_capacity_tonnes != null && (
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
