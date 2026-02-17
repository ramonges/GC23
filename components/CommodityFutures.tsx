'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { TrendingUp, TrendingDown, Plus, X, Loader2, LineChart, Info, AlertTriangle, BarChart3 } from 'lucide-react'

// Proxied through /api/fred to avoid CORS issues
const FRED_PROXY = '/api/fred'

// Commodity groups with FRED series at different frequencies (proxy for term structure)
// For each commodity we have regional benchmarks that can be compared
type SeriesDef = {
  id: string
  label: string
  unit: string
  region: string
  frequency: 'daily' | 'monthly' | 'quarterly' | 'annual'
}

type CommodityGroup = {
  name: string
  icon: string
  series: SeriesDef[]
}

const commodityGroups: Record<string, CommodityGroup> = {
  'Crude Oil': {
    name: 'Crude Oil',
    icon: '🛢️',
    series: [
      { id: 'DCOILWTICO', label: 'WTI Cushing (Daily)', unit: '$/bbl', region: 'North America', frequency: 'daily' },
      { id: 'DCOILBRENTEU', label: 'Brent Europe (Daily)', unit: '$/bbl', region: 'Europe', frequency: 'daily' },
      { id: 'POILWTIUSDM', label: 'WTI (Monthly, IMF)', unit: '$/bbl', region: 'North America', frequency: 'monthly' },
      { id: 'POILBREUSDM', label: 'Brent (Monthly, IMF)', unit: '$/bbl', region: 'Europe', frequency: 'monthly' },
      { id: 'POILDUBUSDM', label: 'Dubai Crude (Monthly, IMF)', unit: '$/bbl', region: 'Middle East', frequency: 'monthly' },
      { id: 'POILWTIUSDQ', label: 'WTI (Quarterly, IMF)', unit: '$/bbl', region: 'North America', frequency: 'quarterly' },
      { id: 'POILBREUSDQ', label: 'Brent (Quarterly, IMF)', unit: '$/bbl', region: 'Europe', frequency: 'quarterly' },
      { id: 'POILDUBUSDQ', label: 'Dubai Crude (Quarterly, IMF)', unit: '$/bbl', region: 'Middle East', frequency: 'quarterly' },
    ],
  },
  'Natural Gas': {
    name: 'Natural Gas',
    icon: '🔥',
    series: [
      { id: 'DHHNGSP', label: 'Henry Hub (Daily)', unit: '$/MMBtu', region: 'North America', frequency: 'daily' },
      { id: 'PNGASUSUSDM', label: 'Henry Hub (Monthly, IMF)', unit: '$/MMBtu', region: 'North America', frequency: 'monthly' },
      { id: 'PNGASEUUSDM', label: 'EU Natural Gas (Monthly, IMF)', unit: '$/MMBtu', region: 'Europe', frequency: 'monthly' },
      { id: 'PNGASJPUSDM', label: 'LNG Asia/Japan (Monthly, IMF)', unit: '$/MMBtu', region: 'Asia', frequency: 'monthly' },
      { id: 'PNGASUSUSDQ', label: 'Henry Hub (Quarterly, IMF)', unit: '$/MMBtu', region: 'North America', frequency: 'quarterly' },
      { id: 'PNGASEUUSDQ', label: 'EU Natural Gas (Quarterly, IMF)', unit: '$/MMBtu', region: 'Europe', frequency: 'quarterly' },
    ],
  },
  'Metals': {
    name: 'Metals',
    icon: '🔩',
    series: [
      { id: 'PCOPPUSDM', label: 'Copper (Monthly, IMF)', unit: '$/MT', region: 'Global (LME)', frequency: 'monthly' },
      { id: 'PALUMUSDM', label: 'Aluminum (Monthly, IMF)', unit: '$/MT', region: 'Global (LME)', frequency: 'monthly' },
      { id: 'PIORECRUSDM', label: 'Iron Ore (Monthly, IMF)', unit: '$/MT', region: 'Global', frequency: 'monthly' },
      { id: 'PNICKUSDM', label: 'Nickel (Monthly, IMF)', unit: '$/MT', region: 'Global (LME)', frequency: 'monthly' },
      { id: 'PZINCUSDM', label: 'Zinc (Monthly, IMF)', unit: '$/MT', region: 'Global (LME)', frequency: 'monthly' },
      { id: 'PCOPPUSDQ', label: 'Copper (Quarterly, IMF)', unit: '$/MT', region: 'Global (LME)', frequency: 'quarterly' },
      { id: 'PALUMUSDQ', label: 'Aluminum (Quarterly, IMF)', unit: '$/MT', region: 'Global (LME)', frequency: 'quarterly' },
    ],
  },
  'Agriculture': {
    name: 'Agriculture',
    icon: '🌾',
    series: [
      { id: 'PWHEAMTUSDM', label: 'Wheat (Monthly, IMF)', unit: '$/MT', region: 'Global', frequency: 'monthly' },
      { id: 'PMAIZMTUSDM', label: 'Corn/Maize (Monthly, IMF)', unit: '$/MT', region: 'Global', frequency: 'monthly' },
      { id: 'PSOYBUSDM', label: 'Soybeans (Monthly, IMF)', unit: '$/MT', region: 'Global', frequency: 'monthly' },
      { id: 'PCOFFOTMUSDM', label: 'Coffee Arabica (Monthly, IMF)', unit: 'cents/lb', region: 'Global', frequency: 'monthly' },
      { id: 'PCOCOUSDM', label: 'Cocoa (Monthly, IMF)', unit: '$/MT', region: 'Global', frequency: 'monthly' },
      { id: 'PSUGAISAUSDM', label: 'Sugar (Monthly, IMF)', unit: 'cents/lb', region: 'Global', frequency: 'monthly' },
      { id: 'PWHEAMTUSDQ', label: 'Wheat (Quarterly, IMF)', unit: '$/MT', region: 'Global', frequency: 'quarterly' },
      { id: 'PMAIZMTUSDQ', label: 'Corn/Maize (Quarterly, IMF)', unit: '$/MT', region: 'Global', frequency: 'quarterly' },
    ],
  },
  'Energy Index': {
    name: 'Energy & Broad Index',
    icon: '📊',
    series: [
      { id: 'PNRGINDEXM', label: 'Global Energy Index (Monthly, IMF)', unit: 'Index', region: 'Global', frequency: 'monthly' },
      { id: 'PALLFNFINDEXM', label: 'All Commodities Index (Monthly, IMF)', unit: 'Index', region: 'Global', frequency: 'monthly' },
      { id: 'PURANUSDM', label: 'Uranium (Monthly, IMF)', unit: '$/lb', region: 'Global', frequency: 'monthly' },
      { id: 'OVXCLS', label: 'CBOE Crude Oil Volatility (Daily)', unit: 'Index', region: 'North America', frequency: 'daily' },
    ],
  },
}

const CHART_COLORS = [
  '#2563EB', '#DC2626', '#16A34A', '#D97706', '#7C3AED',
  '#DB2777', '#0891B2', '#65A30D', '#EA580C', '#6366F1',
]

type ObsPoint = { date: string; value: number }
type LoadedSeries = {
  def: SeriesDef
  data: ObsPoint[]
  color: string
}

function formatPrice(value: number, unit: string): string {
  if (unit === 'Index') return value.toFixed(1)
  if (value >= 1000) return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return value.toFixed(2)
}

export default function CommodityFutures() {
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [selectedSeries, setSelectedSeries] = useState<string[]>([])
  const [loadedSeries, setLoadedSeries] = useState<LoadedSeries[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'1Y' | '3Y' | '5Y' | '10Y' | 'MAX'>('3Y')
  const colorIdx = useRef(0)

  const groupConfig = selectedGroup ? commodityGroups[selectedGroup] : null

  // Fetch a single FRED series
  const fetchSeries = useCallback(async (seriesId: string): Promise<ObsPoint[]> => {
    const now = new Date()
    let startDate = new Date()
    if (timeRange === '1Y') startDate.setFullYear(now.getFullYear() - 1)
    else if (timeRange === '3Y') startDate.setFullYear(now.getFullYear() - 3)
    else if (timeRange === '5Y') startDate.setFullYear(now.getFullYear() - 5)
    else if (timeRange === '10Y') startDate.setFullYear(now.getFullYear() - 10)
    else startDate = new Date('1990-01-01')

    const start = startDate.toISOString().split('T')[0]
    const end = now.toISOString().split('T')[0]
    const url = `${FRED_PROXY}?series_id=${seriesId}&observation_start=${start}&observation_end=${end}`
    const resp = await fetch(url)
    if (!resp.ok) throw new Error(`FRED API error for ${seriesId} (${resp.status})`)
    const json = await resp.json()
    if (json.error_message) throw new Error(json.error_message)
    if (json.error) throw new Error(json.error)
    const obs: ObsPoint[] = (json.observations || [])
      .filter((o: any) => o.value !== '.' && o.value !== '' && o.value != null)
      .map((o: any) => ({ date: o.date, value: parseFloat(o.value) }))
      .filter((o: ObsPoint) => !isNaN(o.value))
    return obs
  }, [timeRange])

  // Load all selected series
  useEffect(() => {
    if (selectedSeries.length === 0) { setLoadedSeries([]); return }
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const allDefs = Object.values(commodityGroups).flatMap(g => g.series)
        const results: LoadedSeries[] = []
        colorIdx.current = 0
        for (const sid of selectedSeries) {
          const def = allDefs.find(s => s.id === sid)
          if (!def) continue
          const data = await fetchSeries(sid)
          if (cancelled) return
          results.push({ def, data, color: CHART_COLORS[colorIdx.current % CHART_COLORS.length] })
          colorIdx.current++
        }
        if (!cancelled) setLoadedSeries(results)
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [selectedSeries, fetchSeries])

  const toggleSeries = (id: string) => {
    setSelectedSeries(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const removeSeries = (id: string) => {
    setSelectedSeries(prev => prev.filter(s => s !== id))
  }

  const clearAll = () => { setSelectedSeries([]); setLoadedSeries([]) }

  // Contango / Backwardation detection (comparing two series of same commodity)
  const getStructureSignal = (): { label: string; color: string; desc: string } | null => {
    if (loadedSeries.length < 2) return null
    // Compare latest values of first two series
    const a = loadedSeries[0]
    const b = loadedSeries[1]
    if (a.data.length === 0 || b.data.length === 0) return null
    const aLatest = a.data[a.data.length - 1].value
    const bLatest = b.data[b.data.length - 1].value
    // For term structure: if longer-dated > near-dated → contango
    // Since we compare benchmarks (e.g. monthly vs quarterly, or different regions), interpret as spread
    const spread = bLatest - aLatest
    const pct = ((spread) / aLatest * 100).toFixed(2)
    if (Math.abs(spread) < 0.01) return { label: 'Flat', color: 'text-gray-600', desc: `${a.def.label} ≈ ${b.def.label} (spread: $${spread.toFixed(2)})` }
    if (spread > 0) return { label: 'Contango', color: 'text-amber-600', desc: `${b.def.label} is $${spread.toFixed(2)} (${pct}%) above ${a.def.label} — market in contango (forward > spot)` }
    return { label: 'Backwardation', color: 'text-blue-600', desc: `${a.def.label} is $${Math.abs(spread).toFixed(2)} (${Math.abs(parseFloat(pct))}%) above ${b.def.label} — market in backwardation (spot > forward)` }
  }

  const structureSignal = getStructureSignal()

  // Chart rendering
  const renderChart = () => {
    if (loadedSeries.length === 0) return null
    // Merge all dates and normalize
    const allDates = Array.from(new Set(loadedSeries.flatMap(s => s.data.map(d => d.date)))).sort()
    if (allDates.length === 0) return null

    // SVG dimensions
    const W = 900, H = 360
    const padL = 80, padR = 30, padT = 30, padB = 50
    const cw = W - padL - padR
    const ch = H - padT - padB

    // Global Y range (normalize if units differ, else absolute)
    const unitsSet = new Set(loadedSeries.map(s => s.def.unit))
    const normalize = unitsSet.size > 1

    const seriesPaths = loadedSeries.map(s => {
      const pts = s.data
      if (pts.length === 0) return null
      let yMin = Math.min(...pts.map(p => p.value))
      let yMax = Math.max(...pts.map(p => p.value))
      if (normalize) {
        // Normalize to 100 at start
        const base = pts[0].value || 1
        const normPts = pts.map(p => ({ date: p.date, value: (p.value / base) * 100 }))
        yMin = Math.min(...normPts.map(p => p.value))
        yMax = Math.max(...normPts.map(p => p.value))
        return { ...s, pts: normPts, yMin, yMax }
      }
      return { ...s, pts, yMin, yMax }
    }).filter(Boolean) as Array<LoadedSeries & { pts: ObsPoint[]; yMin: number; yMax: number }>

    // Global Y bounds
    let gMin = Math.min(...seriesPaths.map(s => s.yMin))
    let gMax = Math.max(...seriesPaths.map(s => s.yMax))
    const yPad = (gMax - gMin) * 0.08 || 1
    gMin -= yPad; gMax += yPad

    const xScale = (date: string) => {
      const idx = allDates.indexOf(date)
      return padL + (idx / (allDates.length - 1 || 1)) * cw
    }
    const yScale = (v: number) => padT + ch - ((v - gMin) / (gMax - gMin || 1)) * ch

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
        {/* Grid */}
        {[0, 1, 2, 3, 4].map(i => {
          const y = padT + i * (ch / 4)
          const val = gMax - i * (gMax - gMin) / 4
          const label = normalize ? val.toFixed(0) : (val >= 1000 ? val.toLocaleString('en-US', { maximumFractionDigits: 0 }) : val.toFixed(2))
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e5e7eb" strokeWidth="1" />
              <text x={padL - 8} y={y + 4} textAnchor="end" fontSize="11" className="fill-gray-500">{normalize ? label : `$${label}`}</text>
            </g>
          )
        })}
        {/* X labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
          const idx = Math.min(Math.floor(frac * (allDates.length - 1)), allDates.length - 1)
          const d = allDates[idx]
          return <text key={i} x={xScale(d)} y={H - 8} textAnchor="middle" fontSize="10" className="fill-gray-500">{d}</text>
        })}
        {/* X axis */}
        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="#000" strokeWidth="1.5" />
        {/* Series lines */}
        {seriesPaths.map((s, si) => {
          if (s.pts.length < 2) return null
          const d = s.pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.date)} ${yScale(p.value)}`).join(' ')
          return <path key={si} d={d} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        })}
      </svg>
    )
  }

  // Spread chart (only when exactly 2 series with same units)
  const renderSpreadChart = () => {
    if (loadedSeries.length !== 2) return null
    if (loadedSeries[0].def.unit !== loadedSeries[1].def.unit) return null
    const a = loadedSeries[0], b = loadedSeries[1]
    // Build date-matched spread
    const bMap = new Map(b.data.map(d => [d.date, d.value]))
    const spread: ObsPoint[] = a.data
      .filter(d => bMap.has(d.date))
      .map(d => ({ date: d.date, value: bMap.get(d.date)! - d.value }))
    if (spread.length < 2) return null

    const W = 900, H = 200
    const padL = 80, padR = 30, padT = 20, padB = 40
    const cw = W - padL - padR, ch = H - padT - padB
    let yMin = Math.min(...spread.map(s => s.value))
    let yMax = Math.max(...spread.map(s => s.value))
    const yPad = (yMax - yMin) * 0.1 || 1
    yMin -= yPad; yMax += yPad
    const xScale = (i: number) => padL + (i / (spread.length - 1 || 1)) * cw
    const yScale = (v: number) => padT + ch - ((v - yMin) / (yMax - yMin || 1)) * ch
    const zeroY = yScale(0)
    const d = spread.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(p.value)}`).join(' ')

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-black mb-1 flex items-center gap-2"><BarChart3 size={18} /> Spread: {b.def.label} − {a.def.label}</h3>
        <p className="text-xs text-gray-500 mb-3">Positive = contango (forward premium), negative = backwardation</p>
        <div className="h-48 w-full">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
            {zeroY >= padT && zeroY <= padT + ch && (
              <line x1={padL} y1={zeroY} x2={W - padR} y2={zeroY} stroke="#9CA3AF" strokeWidth="1" strokeDasharray="4 2" />
            )}
            {[0, 1, 2, 3].map(i => {
              const y = padT + i * (ch / 3)
              const val = yMax - i * (yMax - yMin) / 3
              return <text key={i} x={padL - 8} y={y + 4} textAnchor="end" fontSize="10" className="fill-gray-500">${val.toFixed(2)}</text>
            })}
            {/* Contango region (above zero) */}
            {(() => {
              const areaAbove = spread.map((p, i) => {
                const x = xScale(i)
                const y = Math.min(yScale(Math.max(p.value, 0)), zeroY)
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
              }).join(' ')
              return <path d={`${areaAbove} L ${xScale(spread.length - 1)} ${zeroY} L ${xScale(0)} ${zeroY} Z`} fill="rgba(217, 119, 6, 0.12)" />
            })()}
            {/* Backwardation region (below zero) */}
            {(() => {
              const areaBelow = spread.map((p, i) => {
                const x = xScale(i)
                const y = Math.max(yScale(Math.min(p.value, 0)), zeroY)
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
              }).join(' ')
              return <path d={`${areaBelow} L ${xScale(spread.length - 1)} ${zeroY} L ${xScale(0)} ${zeroY} Z`} fill="rgba(37, 99, 235, 0.12)" />
            })()}
            <path d={d} fill="none" stroke="#111827" strokeWidth="2" strokeLinejoin="round" />
            {/* X labels */}
            {[0, 0.5, 1].map((frac, i) => {
              const idx = Math.min(Math.floor(frac * (spread.length - 1)), spread.length - 1)
              return <text key={i} x={xScale(idx)} y={H - 6} textAnchor="middle" fontSize="9" className="fill-gray-500">{spread[idx].date}</text>
            })}
            <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="#000" strokeWidth="1" />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 flex-1 overflow-y-auto">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-black mb-2">Commodity Futures & Curves</h1>
        <p className="text-gray-600">Compare benchmarks across regions, detect contango vs backwardation — powered by <a href="https://fred.stlouisfed.org/" target="_blank" rel="noopener noreferrer" className="underline">FRED</a></p>
      </div>

      <div className="max-w-6xl w-full mx-auto px-8 py-6 space-y-6">
        {/* Group Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Commodity Group</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(commodityGroups).map(([key, g]) => (
              <button
                key={key}
                onClick={() => { setSelectedGroup(key); setSelectedSeries([]); setLoadedSeries([]) }}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedGroup === key ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-700 hover:border-gray-500'}`}
              >
                {g.icon} {g.name}
              </button>
            ))}
          </div>
        </div>

        {/* Series Selection */}
        {groupConfig && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Select Series to Compare</label>
              {selectedSeries.length > 0 && (
                <button onClick={clearAll} className="text-xs text-red-600 hover:underline">Clear all</button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {groupConfig.series.map((s, i) => {
                const isActive = selectedSeries.includes(s.id)
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSeries(s.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm text-left transition-all ${isActive ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-700 hover:border-gray-400'}`}
                  >
                    {isActive ? <X size={14} /> : <Plus size={14} />}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{s.label}</div>
                      <div className={`text-xs ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>{s.region} • {s.unit}</div>
                    </div>
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-gray-500 mt-3"><Info size={12} className="inline mr-1" />Select 2+ series to compare curves and detect contango/backwardation. Mix regions (e.g. WTI vs Brent vs Dubai) for cross-benchmark analysis.</p>
          </div>
        )}

        {/* Time Range */}
        {selectedSeries.length > 0 && (
          <div className="flex items-center gap-2">
            {(['1Y', '3Y', '5Y', '10Y', 'MAX'] as const).map(t => (
              <button key={t} onClick={() => setTimeRange(t)} className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${timeRange === t ? 'bg-black text-white' : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-500'}`}>{t}</button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-black" />
            <p className="text-gray-600 text-sm">Loading data from FRED...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
            <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Structure Signal */}
        {structureSignal && !loading && (
          <div className={`bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3`}>
            {structureSignal.label === 'Contango' ? <TrendingUp size={22} className="text-amber-600" /> : structureSignal.label === 'Backwardation' ? <TrendingDown size={22} className="text-blue-600" /> : <LineChart size={22} className="text-gray-600" />}
            <div>
              <div className={`font-bold text-lg ${structureSignal.color}`}>{structureSignal.label}</div>
              <div className="text-sm text-gray-600">{structureSignal.desc}</div>
            </div>
          </div>
        )}

        {/* Main Chart */}
        {loadedSeries.length > 0 && !loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black flex items-center gap-2"><LineChart size={20} /> Price Comparison</h2>
              {loadedSeries.some(s => s.def.unit !== loadedSeries[0].def.unit) && (
                <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">Mixed units — values normalized to 100 at start</span>
              )}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mb-4">
              {loadedSeries.map(s => (
                <div key={s.def.id} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-gray-700">{s.def.label}</span>
                  {s.data.length > 0 && (
                    <span className="text-xs font-semibold">{s.def.unit === 'Index' ? '' : '$'}{formatPrice(s.data[s.data.length - 1].value, s.def.unit)}</span>
                  )}
                  <button onClick={() => removeSeries(s.def.id)} className="text-gray-400 hover:text-red-500"><X size={12} /></button>
                </div>
              ))}
            </div>
            <div className="h-80 w-full">
              {renderChart()}
            </div>
          </div>
        )}

        {/* Spread Chart */}
        {!loading && renderSpreadChart()}

        {/* Summary Table */}
        {loadedSeries.length > 0 && !loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-black mb-3">Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-600">Series</th>
                    <th className="text-left py-2 text-gray-600">Region</th>
                    <th className="text-right py-2 text-gray-600">Latest</th>
                    <th className="text-right py-2 text-gray-600">Min</th>
                    <th className="text-right py-2 text-gray-600">Max</th>
                    <th className="text-right py-2 text-gray-600">Change (period)</th>
                    <th className="text-right py-2 text-gray-600">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {loadedSeries.map(s => {
                    const d = s.data
                    if (d.length === 0) return null
                    const latest = d[d.length - 1].value
                    const first = d[0].value
                    const min = Math.min(...d.map(p => p.value))
                    const max = Math.max(...d.map(p => p.value))
                    const change = latest - first
                    const changePct = ((change) / first * 100)
                    const isUp = change >= 0
                    return (
                      <tr key={s.def.id} className="border-b border-gray-100">
                        <td className="py-2 flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />{s.def.label}</td>
                        <td className="py-2 text-gray-600">{s.def.region}</td>
                        <td className="py-2 text-right font-medium">{s.def.unit === 'Index' ? '' : '$'}{formatPrice(latest, s.def.unit)}</td>
                        <td className="py-2 text-right text-gray-600">{s.def.unit === 'Index' ? '' : '$'}{formatPrice(min, s.def.unit)}</td>
                        <td className="py-2 text-right text-gray-600">{s.def.unit === 'Index' ? '' : '$'}{formatPrice(max, s.def.unit)}</td>
                        <td className={`py-2 text-right font-medium ${isUp ? 'text-green-600' : 'text-red-600'}`}>{isUp ? '+' : ''}{change.toFixed(2)} ({isUp ? '+' : ''}{changePct.toFixed(1)}%)</td>
                        <td className="py-2 text-right text-gray-500">{d.length}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedGroup && !loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <LineChart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Select a commodity group to start comparing futures curves</p>
          </div>
        )}
      </div>
    </div>
  )
}
