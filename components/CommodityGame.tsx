'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import { matchCountry } from '@/lib/countries'
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
const GAME_COMMODITIES = (() => {
  const list: { id: string; label: string; color: string; commodityType: string; commodityName: string; source: 'commodity_locations' | 'gold_mines' }[] = []
  for (const [cat, names] of Object.entries(commodityCategories)) {
    for (const name of names) {
      list.push({
        id: `${cat}-${name}`,
        label: name,
        color: COMMODITY_COLORS[name] || '#6B7280',
        commodityType: cat,
        commodityName: name,
        source: name === 'Gold' ? 'gold_mines' : 'commodity_locations',
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
  source: 'commodity_locations' | 'gold_mines'
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
  const [gameOverPopup, setGameOverPopup] = useState<{ score: number; topPercent: number | null } | null>(null)
  const gameOverHandledRef = useRef(false)

  // Timer
  useEffect(() => {
    if (!gameStarted || timeLeft <= 0) return
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [gameStarted, timeLeft])

  // When clock reaches 0: save score, compute percentile, show popup
  useEffect(() => {
    if (!gameStarted || timeLeft !== 0 || !commodity || gameOverHandledRef.current) return
    gameOverHandledRef.current = true

    const score = unlockedCountries.size
    const commodityLabel = commodity.commodityName

    async function finishGame() {
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

        setGameOverPopup({ score, topPercent })
      } catch (e) {
        console.warn('Could not compute percentile:', e)
        setGameOverPopup({ score, topPercent: null })
      }
    }

    finishGame()
  }, [gameStarted, timeLeft, commodity, unlockedCountries.size])

  // Fetch sites when commodity + unlocked countries change (same logic as EarthMap)
  const fetchSites = useCallback(async () => {
    if (!commodity || unlockedCountries.size === 0) {
      setSites([])
      return
    }
    const canonicals = Array.from(unlockedCountries)
    try {
      if (commodity.source === 'gold_mines') {
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
      } else {
        const { data, error } = await supabase
          .from('commodity_locations')
          .select('*')
          .eq('commodity_type', commodity.commodityType)
          .eq('commodity_name', commodity.commodityName)
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
    gameOverHandledRef.current = false
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
    setGameOverPopup(null)
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const color = commodity?.color ?? '#666'

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
              value={commodity?.id ?? ''}
              onChange={(e) => {
                const c = GAME_COMMODITIES.find((x) => x.id === e.target.value)
                setCommodity(c ?? null)
                resetGame()
              }}
              disabled={gameStarted}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium"
            >
              <option value="">Select...</option>
              {GAME_COMMODITIES.map((c) => (
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

      {/* 3D Globe */}
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
          <div className="w-full h-full min-h-[400px]">
            <GameGlobe3D
              unlockedCountries={unlockedCountries}
              sites={sites}
              color={color}
              onSiteSelect={setSelectedSite}
            />
          </div>
        )}

        {/* End-of-game popup (when clock reaches 0) */}
        {gameOverPopup && (
          <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
              <h2 className="text-2xl font-bold text-black mb-4">Time&apos;s up!</h2>
              <p className="text-lg text-gray-700 mb-2">
                You unlocked <strong>{gameOverPopup.score}</strong> countries.
              </p>
              {gameOverPopup.topPercent != null ? (
                <p className="text-xl font-bold text-green-600 mb-6">
                  You&apos;re in the <strong>Top {gameOverPopup.topPercent}%</strong> of players!
                </p>
              ) : (
                <p className="text-gray-500 mb-6">Ranking will be available once more players have played.</p>
              )}
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800"
              >
                Play Again
              </button>
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
