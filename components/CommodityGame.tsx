'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import { matchCountry, allCountries } from '@/lib/countries'
import { Clock, Gamepad2, Trophy } from 'lucide-react'

const GameGlobe3D = dynamic(() => import('./GameGlobe3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div className="text-white">Loading 3D globe...</div>
    </div>
  ),
})

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

const GAME_DURATION_SEC = 15 * 60

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

interface LeaderboardEntry {
  id: string
  player_name: string
  commodity: string
  score: number
  time_seconds: number
  created_at: string
}

const TIERS = [
  { name: 'Master Diamond', minPercent: 100, color: 'from-cyan-400 to-blue-500', text: 'text-cyan-300', bg: 'bg-cyan-500/20', border: 'border-cyan-400/40', icon: '💎', label: '100%' },
  { name: 'Platinum', minPercent: 90, color: 'from-slate-300 to-slate-400', text: 'text-slate-300', bg: 'bg-slate-400/20', border: 'border-slate-300/40', icon: '⚪', label: '90%+' },
  { name: 'Gold', minPercent: 85, color: 'from-yellow-400 to-amber-500', text: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-400/40', icon: '🥇', label: '85%+' },
  { name: 'Silver', minPercent: 75, color: 'from-gray-300 to-gray-400', text: 'text-gray-400', bg: 'bg-gray-400/20', border: 'border-gray-300/40', icon: '🥈', label: '75%+' },
  { name: 'Bronze', minPercent: 0, color: 'from-orange-400 to-orange-600', text: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-400/40', icon: '🥉', label: '< 75%' },
] as const

function getTier(score: number, totalCountries: number) {
  const percent = totalCountries > 0 ? (score / totalCountries) * 100 : 0
  return TIERS.find((t) => percent >= t.minPercent) || TIERS[TIERS.length - 1]
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
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
  const [showAllCountriesTable, setShowAllCountriesTable] = useState(false)
  const gameOverHandledRef = useRef(false)

  // Game-over state: results + name input
  const [gameOverPopup, setGameOverPopup] = useState<{
    score: number
    topPercent: number | null
    countries: string[]
    elapsedSeconds: number
  } | null>(null)
  const [playerName, setPlayerName] = useState('')
  const [nameSaved, setNameSaved] = useState(false)
  const [savingName, setSavingName] = useState(false)

  // Leaderboard popup
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)

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
    const elapsedSeconds = GAME_DURATION_SEC - timeLeft

    try {
      const commodityLabel = (commodity ?? GAME_COMMODITIES[0])?.commodityName ?? 'Crude Oil'
      const { data: allScores } = await supabase
        .from('commodity_game_leaderboard')
        .select('score')
        .eq('commodity', commodityLabel)

      const scores = (allScores || []).map((r: any) => r.score)
      const total = scores.length
      const betterOrEqual = scores.filter((s: number) => s >= score).length
      const topPercent = total > 0 ? Math.round((betterOrEqual / total) * 100) : 100

      setGameOverPopup({ score, topPercent, countries, elapsedSeconds })
    } catch (e) {
      console.warn('Could not compute percentile:', e)
      setGameOverPopup({ score, topPercent: null, countries, elapsedSeconds })
    }
  }, [commodity, unlockedCountries, timeLeft])

  useEffect(() => {
    if (!gameStarted || timeLeft !== 0 || !commodity || gameOverHandledRef.current) return
    handleFinishGame()
  }, [gameStarted, timeLeft, commodity, handleFinishGame])

  const handleSaveName = async () => {
    if (!playerName.trim() || !gameOverPopup || savingName) return
    setSavingName(true)
    const commodityLabel = (commodity ?? GAME_COMMODITIES[0])?.commodityName ?? 'Crude Oil'
    try {
      await supabase.from('commodity_game_leaderboard').insert({
        player_name: playerName.trim(),
        commodity: commodityLabel,
        score: gameOverPopup.score,
        time_seconds: gameOverPopup.elapsedSeconds,
      })
      setNameSaved(true)
    } catch (e) {
      console.warn('Could not save to leaderboard:', e)
    } finally {
      setSavingName(false)
    }
  }

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true)
    try {
      const { data } = await supabase
        .from('commodity_game_leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .order('time_seconds', { ascending: true })
        .limit(50)
      setLeaderboard((data as LeaderboardEntry[]) || [])
    } catch (e) {
      console.warn('Could not fetch leaderboard:', e)
    } finally {
      setLeaderboardLoading(false)
    }
  }

  const openLeaderboard = () => {
    setShowLeaderboard(true)
    fetchLeaderboard()
  }

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
    setPlayerName('')
    setNameSaved(false)
  }

  const color = (commodity ?? GAME_COMMODITIES[0])?.color ?? '#666'
  const elapsedTier = gameOverPopup ? getTier(gameOverPopup.score, allCountries.length) : null

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
              <span className="font-mono font-bold text-lg">{formatDuration(timeLeft)}</span>
            </div>
          )}
          <span className="text-sm text-gray-500">
            {unlockedCountries.size} / {allCountries.length} countries unlocked
          </span>

          {/* Leaderboard button - top right */}
          <button
            onClick={openLeaderboard}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-black rounded-lg font-semibold hover:from-yellow-300 hover:to-amber-400 transition-all shadow-md hover:shadow-lg"
          >
            <Trophy size={18} />
            Leaderboard
          </button>
        </div>
      </div>

      {/* Input bar */}
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

      {/* 3D Globe */}
      <div className="flex-1 min-h-0 relative">
        <div className="w-full h-full min-h-[400px]">
          <GameGlobe3D
            unlockedCountries={unlockedCountries}
            sites={sites}
            color={color}
            onSiteSelect={setSelectedSite}
          />
        </div>

        {/* Game-over popup with name input */}
        {gameOverPopup && (
          <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
              <h2 className="text-2xl font-bold text-black mb-2 text-center">Results</h2>

              {/* Tier badge */}
              {elapsedTier && (
                <div className="flex justify-center mb-4">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${elapsedTier.bg} border ${elapsedTier.border}`}>
                    <span className="text-xl">{elapsedTier.icon}</span>
                    <span className={`font-bold ${elapsedTier.text}`}>{elapsedTier.name}</span>
                  </div>
                </div>
              )}

              <p className="text-lg text-gray-700 mb-1 text-center">
                You unlocked <strong>{gameOverPopup.score}</strong> / {allCountries.length} countries
              </p>
              <p className="text-sm text-gray-500 mb-2 text-center">
                Time: <strong>{formatDuration(gameOverPopup.elapsedSeconds)}</strong>
              </p>
              {gameOverPopup.topPercent != null && (
                <p className="text-lg font-bold text-green-600 mb-4 text-center">
                  Top {gameOverPopup.topPercent}% of players!
                </p>
              )}

              {/* Name input for leaderboard */}
              {!nameSaved ? (
                <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Enter your name for the leaderboard:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                      placeholder="Your name..."
                      maxLength={30}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={!playerName.trim() || savingName}
                      className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-black rounded-lg font-semibold text-sm disabled:opacity-50 hover:from-yellow-300 hover:to-amber-400 transition-all"
                    >
                      {savingName ? 'Saving...' : 'Submit'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-200 text-center">
                  <p className="text-sm font-medium text-green-700">Saved to leaderboard as <strong>{playerName}</strong>!</p>
                </div>
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

        {/* Leaderboard popup */}
        {showLeaderboard && (
          <div className="absolute inset-0 z-[4000] flex items-center justify-center bg-black/70 p-4">
            <div className="bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Trophy size={24} className="text-yellow-400" />
                  Leaderboard
                </h3>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="text-gray-400 hover:text-white text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Tier legend */}
              <div className="flex flex-wrap gap-2 mb-4">
                {TIERS.map((tier) => (
                  <div key={tier.name} className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${tier.bg} border ${tier.border}`}>
                    <span className="text-sm">{tier.icon}</span>
                    <span className={`text-xs font-medium ${tier.text}`}>{tier.name}</span>
                    <span className="text-xs text-gray-500">
                      {tier.label}
                    </span>
                  </div>
                ))}
              </div>

              {leaderboardLoading ? (
                <div className="flex-1 flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-12">
                  <p className="text-gray-500">No scores yet. Be the first!</p>
                </div>
              ) : (
                <div className="overflow-y-auto flex-1 -mx-2 px-2">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-700">
                        <th className="pb-3 pl-2">#</th>
                        <th className="pb-3">Player</th>
                        <th className="pb-3">Commodity</th>
                        <th className="pb-3 text-right">Score</th>
                        <th className="pb-3 text-right">Time</th>
                        <th className="pb-3 text-right pr-2">Tier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((entry, i) => {
                        const tier = getTier(entry.score, allCountries.length)
                        return (
                          <tr key={entry.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                            <td className="py-3 pl-2 text-gray-400 font-mono text-sm">{i + 1}</td>
                            <td className="py-3 text-white font-medium">{entry.player_name}</td>
                            <td className="py-3 text-gray-400 text-sm">{entry.commodity}</td>
                            <td className="py-3 text-right text-white font-bold">{entry.score}</td>
                            <td className="py-3 text-right text-gray-300 font-mono text-sm">{formatDuration(entry.time_seconds)}</td>
                            <td className="py-3 text-right pr-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tier.bg} ${tier.text} border ${tier.border}`}>
                                {tier.icon} {tier.name}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
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
