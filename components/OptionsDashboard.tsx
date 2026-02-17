'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'

const VolatilitySurface3D = dynamic(() => import('./VolatilitySurface3D'), { ssr: false })

const ALPHA_VANTAGE_API_KEY = '970KAXUCXIOWX55C'

type OptionContract = {
  contractID: string
  symbol: string
  expiration: string
  strike: number
  type: 'call' | 'put'
  last: number
  mark: number
  bid: number
  ask: number
  volume: number
  open_interest: number
  implied_volatility: number
  delta: number
  gamma: number
  theta: number
  vega: number
  rho: number
  in_the_money: boolean
}

type CommoditySymbol = {
  symbol: string
  label: string
  category: string
}

const COMMODITY_SYMBOLS: CommoditySymbol[] = [
  { symbol: 'USO', label: 'USO - United States Oil Fund (WTI)', category: 'Energy' },
  { symbol: 'BNO', label: 'BNO - Brent Oil Fund', category: 'Energy' },
  { symbol: 'UNG', label: 'UNG - United States Natural Gas Fund', category: 'Energy' },
  { symbol: 'GLD', label: 'GLD - SPDR Gold Trust', category: 'Metals' },
  { symbol: 'SLV', label: 'SLV - iShares Silver Trust', category: 'Metals' },
  { symbol: 'COPX', label: 'COPX - Global X Copper Miners ETF', category: 'Metals' },
  { symbol: 'WEAT', label: 'WEAT - Teucrium Wheat Fund', category: 'Agriculture' },
  { symbol: 'CORN', label: 'CORN - Teucrium Corn Fund', category: 'Agriculture' },
  { symbol: 'SOYB', label: 'SOYB - Teucrium Soybean Fund', category: 'Agriculture' },
  { symbol: 'CANE', label: 'CANE - Teucrium Sugar Fund', category: 'Agriculture' },
]

const Card = ({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-5 ${className}`}>
    <h3 className="text-sm font-semibold text-black mb-4 uppercase tracking-wide">{title}</h3>
    {children}
  </div>
)

const formatNumber = (n: number, decimals = 2) => {
  if (n === undefined || n === null || isNaN(n)) return '-'
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

const formatPercent = (n: number) => {
  if (n === undefined || n === null || isNaN(n)) return '-'
  return (n * 100).toFixed(2) + '%'
}

const linePath = (
  points: Array<{ x: number; y: number }>,
  width: number,
  height: number,
  padding: number
) => {
  if (points.length === 0) return ''
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const scaleX = (v: number) =>
    padding + ((v - minX) / (maxX - minX || 1)) * (width - padding * 2)
  const scaleY = (v: number) =>
    height - padding - ((v - minY) / (maxY - minY || 1)) * (height - padding * 2)
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${scaleX(p.x)},${scaleY(p.y)}`)
    .join(' ')
}

const areaPath = (
  points: Array<{ x: number; y: number }>,
  width: number,
  height: number,
  padding: number
) => {
  if (points.length === 0) return ''
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const scaleX = (v: number) =>
    padding + ((v - minX) / (maxX - minX || 1)) * (width - padding * 2)
  const scaleY = (v: number) =>
    height - padding - ((v - minY) / (maxY - minY || 1)) * (height - padding * 2)
  const line = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${scaleX(p.x)},${scaleY(p.y)}`)
    .join(' ')
  const lastX = scaleX(points[points.length - 1].x)
  const firstX = scaleX(points[0].x)
  return `${line} L${lastX},${height - padding} L${firstX},${height - padding} Z`
}

export default function OptionsDashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState('USO')
  const [contracts, setContracts] = useState<OptionContract[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedExpiration, setSelectedExpiration] = useState('')
  const [optionType, setOptionType] = useState<'all' | 'call' | 'put'>('all')
  const [dataDate, setDataDate] = useState('')

  useEffect(() => {
    fetchOptions(selectedSymbol)
  }, [selectedSymbol])

  const fetchOptions = async (symbol: string) => {
    setLoading(true)
    setError(null)
    setContracts([])

    try {
      const url = `https://www.alphavantage.co/query?function=HISTORICAL_OPTIONS&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      const response = await fetch(url)
      const data = await response.json()

      if (data['Error Message']) {
        throw new Error(data['Error Message'])
      }
      if (data['Note'] || data['Information']) {
        throw new Error(data['Note'] || data['Information'])
      }

      const rawContracts = data['data'] || []
      if (rawContracts.length === 0) {
        throw new Error('No options data available for this symbol')
      }

      const parsed: OptionContract[] = rawContracts.map((c: any) => ({
        contractID: c.contractID || '',
        symbol: c.symbol || symbol,
        expiration: c.expiration || '',
        strike: parseFloat(c.strike) || 0,
        type: c.type === 'put' ? 'put' : 'call',
        last: parseFloat(c.last) || 0,
        mark: parseFloat(c.mark) || 0,
        bid: parseFloat(c.bid) || 0,
        ask: parseFloat(c.ask) || 0,
        volume: parseInt(c.volume) || 0,
        open_interest: parseInt(c.open_interest) || 0,
        implied_volatility: parseFloat(c.implied_volatility) || 0,
        delta: parseFloat(c.delta) || 0,
        gamma: parseFloat(c.gamma) || 0,
        theta: parseFloat(c.theta) || 0,
        vega: parseFloat(c.vega) || 0,
        rho: parseFloat(c.rho) || 0,
        in_the_money: c.in_the_money === 'TRUE' || c.in_the_money === true,
      }))

      setContracts(parsed)
      setDataDate(data['indicator']?.date || new Date().toISOString().split('T')[0])

      // Auto-select nearest expiration
      const exps = Array.from(new Set(parsed.map(c => c.expiration))).sort()
      if (exps.length > 0) {
        setSelectedExpiration(exps[0])
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch options data')
    } finally {
      setLoading(false)
    }
  }

  // All unique expirations sorted
  const expirations = useMemo(() => {
    return Array.from(new Set(contracts.map(c => c.expiration))).sort()
  }, [contracts])

  // Contracts for the selected expiration
  const expirationContracts = useMemo(() => {
    if (!selectedExpiration) return []
    let filtered = contracts.filter(c => c.expiration === selectedExpiration)
    if (optionType !== 'all') {
      filtered = filtered.filter(c => c.type === optionType)
    }
    return filtered.sort((a, b) => a.strike - b.strike)
  }, [contracts, selectedExpiration, optionType])

  // Calls and puts for selected expiration (for charts)
  const calls = useMemo(() =>
    contracts.filter(c => c.expiration === selectedExpiration && c.type === 'call').sort((a, b) => a.strike - b.strike),
    [contracts, selectedExpiration]
  )
  const puts = useMemo(() =>
    contracts.filter(c => c.expiration === selectedExpiration && c.type === 'put').sort((a, b) => a.strike - b.strike),
    [contracts, selectedExpiration]
  )

  // Volatility smile data
  const smileData = useMemo(() => {
    const callPoints = calls
      .filter(c => c.implied_volatility > 0)
      .map(c => ({ x: c.strike, y: c.implied_volatility }))
    const putPoints = puts
      .filter(c => c.implied_volatility > 0)
      .map(c => ({ x: c.strike, y: c.implied_volatility }))
    return { calls: callPoints, puts: putPoints }
  }, [calls, puts])

  // Term structure: average IV by expiration
  const termStructure = useMemo(() => {
    const today = new Date()
    const grouped = new Map<string, number[]>()
    contracts.forEach(c => {
      if (c.implied_volatility > 0) {
        const list = grouped.get(c.expiration) || []
        list.push(c.implied_volatility)
        grouped.set(c.expiration, list)
      }
    })
    return Array.from(grouped.entries())
      .map(([exp, ivs]) => {
        const daysToExp = Math.max(0, Math.round((new Date(exp).getTime() - today.getTime()) / 86400000))
        return { x: daysToExp, y: ivs.reduce((s, v) => s + v, 0) / ivs.length }
      })
      .sort((a, b) => a.x - b.x)
  }, [contracts])

  // Volatility surface data
  const surfaceData = useMemo(() => {
    if (contracts.length === 0) return null
    const today = new Date()
    const points: Array<{ days: number; strike: number; iv: number }> = []
    contracts.forEach(c => {
      if (c.implied_volatility > 0) {
        const days = Math.max(0, Math.round((new Date(c.expiration).getTime() - today.getTime()) / 86400000))
        points.push({ days, strike: c.strike, iv: c.implied_volatility })
      }
    })
    if (points.length === 0) return null

    const allDays = Array.from(new Set(points.map(p => p.days))).sort((a, b) => a - b)
    const allStrikes = Array.from(new Set(points.map(p => p.strike))).sort((a, b) => a - b)
    // Sample to keep chart manageable
    const sampleArr = <T,>(arr: T[], max: number): T[] => {
      if (arr.length <= max) return arr
      const step = Math.ceil(arr.length / max)
      return arr.filter((_, i) => i % step === 0)
    }
    const days = sampleArr(allDays, 20)
    const strikes = sampleArr(allStrikes, 25)
    const filtered = points.filter(p => days.includes(p.days) && strikes.includes(p.strike))
    const ivs = filtered.map(p => p.iv)
    return {
      points: filtered,
      days,
      strikes,
      minIv: Math.min(...ivs),
      maxIv: Math.max(...ivs),
    }
  }, [contracts])

  // Open interest by strike
  const openInterestData = useMemo(() => {
    const callOI = calls.filter(c => c.open_interest > 0).map(c => ({ strike: c.strike, oi: c.open_interest }))
    const putOI = puts.filter(c => c.open_interest > 0).map(c => ({ strike: c.strike, oi: c.open_interest }))
    return { calls: callOI, puts: putOI }
  }, [calls, puts])

  // Summary stats
  const stats = useMemo(() => {
    if (expirationContracts.length === 0) return null
    const totalVolume = expirationContracts.reduce((s, c) => s + c.volume, 0)
    const totalOI = expirationContracts.reduce((s, c) => s + c.open_interest, 0)
    const callVolume = expirationContracts.filter(c => c.type === 'call').reduce((s, c) => s + c.volume, 0)
    const putVolume = expirationContracts.filter(c => c.type === 'put').reduce((s, c) => s + c.volume, 0)
    const avgIV = expirationContracts.filter(c => c.implied_volatility > 0)
    const meanIV = avgIV.length > 0 ? avgIV.reduce((s, c) => s + c.implied_volatility, 0) / avgIV.length : 0
    return { totalVolume, totalOI, callVolume, putVolume, meanIV, putCallRatio: callVolume > 0 ? putVolume / callVolume : 0 }
  }, [expirationContracts])

  const currentSymbolConfig = COMMODITY_SYMBOLS.find(s => s.symbol === selectedSymbol)

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-black">Commodities Options</h2>
            <p className="text-gray-600 mt-1">
              Options chain analytics via Alpha Vantage {dataDate && `• Data: ${dataDate}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
            >
              {COMMODITY_SYMBOLS.map((s) => (
                <option key={s.symbol} value={s.symbol}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-black" />
            <p className="text-gray-600">Loading options chain for {selectedSymbol}...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Data loaded */}
        {!loading && !error && contracts.length > 0 && (
          <>
            {/* Controls Row */}
            <div className="flex flex-wrap items-center gap-4 bg-white rounded-xl border border-gray-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-600">Expiration</label>
                <select
                  value={selectedExpiration}
                  onChange={(e) => setSelectedExpiration(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {expirations.map((exp) => (
                    <option key={exp} value={exp}>{exp}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-600">Type</label>
                <select
                  value={optionType}
                  onChange={(e) => setOptionType(e.target.value as 'all' | 'call' | 'put')}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="all">All</option>
                  <option value="call">Calls</option>
                  <option value="put">Puts</option>
                </select>
              </div>
              <div className="flex-1" />
              <div className="text-sm text-gray-500">
                {contracts.length} contracts • {expirations.length} expirations
              </div>
            </div>

            {/* Stats Row */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {[
                  { label: 'Total Volume', value: stats.totalVolume.toLocaleString() },
                  { label: 'Open Interest', value: stats.totalOI.toLocaleString() },
                  { label: 'Call Volume', value: stats.callVolume.toLocaleString() },
                  { label: 'Put Volume', value: stats.putVolume.toLocaleString() },
                  { label: 'Put/Call Ratio', value: formatNumber(stats.putCallRatio) },
                  { label: 'Avg IV', value: formatPercent(stats.meanIV) },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-center">
                    <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
                    <div className="text-lg font-bold text-black">{stat.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* 3D Volatility Surface + Volatility Smile - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="3D Volatility Surface">
                {surfaceData ? (
                  <VolatilitySurface3D
                    points={surfaceData.points}
                    days={surfaceData.days}
                    strikes={surfaceData.strikes}
                    minIv={surfaceData.minIv}
                    maxIv={surfaceData.maxIv}
                  />
                ) : (
                  <p className="text-gray-500 text-sm">Insufficient data for volatility surface.</p>
                )}
              </Card>

              <Card title="Volatility Smile / Skew">
                {(smileData.calls.length > 0 || smileData.puts.length > 0) ? (
                  <div>
                    <svg viewBox="0 0 640 300" className="w-full h-64">
                      <defs>
                        <linearGradient id="callGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#000000" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="putGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#f97316" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {smileData.calls.length > 0 && (
                        <>
                          <path d={areaPath(smileData.calls, 640, 300, 32)} fill="url(#callGrad)" />
                          <path d={linePath(smileData.calls, 640, 300, 32)} fill="none" stroke="#000000" strokeWidth={2} />
                        </>
                      )}
                      {smileData.puts.length > 0 && (
                        <>
                          <path d={areaPath(smileData.puts, 640, 300, 32)} fill="url(#putGrad)" />
                          <path d={linePath(smileData.puts, 640, 300, 32)} fill="none" stroke="#f97316" strokeWidth={2} />
                        </>
                      )}
                    </svg>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-black" /> Calls IV</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-orange-500" /> Puts IV</span>
                      <span className="ml-auto">Strike price &rarr;</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No IV data available for this expiration.</p>
                )}
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="IV Term Structure">
                {termStructure.length > 1 ? (
                  <div>
                    <svg viewBox="0 0 640 300" className="w-full h-64">
                      <defs>
                        <linearGradient id="termGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d={areaPath(termStructure, 640, 300, 32)} fill="url(#termGrad)" />
                      <path d={linePath(termStructure, 640, 300, 32)} fill="none" stroke="#2563eb" strokeWidth={2} />
                      {termStructure.map((p, i) => {
                        const xs = termStructure.map(t => t.x)
                        const ys = termStructure.map(t => t.y)
                        const scX = 32 + ((p.x - Math.min(...xs)) / (Math.max(...xs) - Math.min(...xs) || 1)) * (640 - 64)
                        const scY = 300 - 32 - ((p.y - Math.min(...ys)) / (Math.max(...ys) - Math.min(...ys) || 1)) * (300 - 64)
                        return (
                          <circle key={i} cx={scX} cy={scY} r="3" fill="#2563eb">
                            <title>{p.x} days: IV {formatPercent(p.y)}</title>
                          </circle>
                        )
                      })}
                    </svg>
                    <p className="text-xs text-gray-500 mt-2">Average implied volatility by days to expiry</p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Insufficient data for term structure.</p>
                )}
              </Card>

              <Card title="Open Interest by Strike">
                {(openInterestData.calls.length > 0 || openInterestData.puts.length > 0) ? (
                  <div>
                    <svg viewBox="0 0 640 300" className="w-full h-64">
                      {(() => {
                        const allStrikes = Array.from(new Set([
                          ...openInterestData.calls.map(c => c.strike),
                          ...openInterestData.puts.map(p => p.strike)
                        ])).sort((a, b) => a - b)
                        const maxOI = Math.max(
                          ...openInterestData.calls.map(c => c.oi),
                          ...openInterestData.puts.map(p => p.oi),
                          1
                        )
                        const barW = Math.max(2, (640 - 64) / allStrikes.length / 2 - 1)
                        return allStrikes.map((strike, i) => {
                          const x = 32 + (i / (allStrikes.length - 1 || 1)) * (640 - 64)
                          const callOI = openInterestData.calls.find(c => c.strike === strike)?.oi || 0
                          const putOI = openInterestData.puts.find(p => p.strike === strike)?.oi || 0
                          const callH = (callOI / maxOI) * (300 - 64)
                          const putH = (putOI / maxOI) * (300 - 64)
                          return (
                            <g key={strike}>
                              <rect
                                x={x - barW - 0.5}
                                y={300 - 32 - callH}
                                width={barW}
                                height={callH}
                                fill="#000000"
                                opacity={0.8}
                              >
                                <title>Call OI @ {strike}: {callOI.toLocaleString()}</title>
                              </rect>
                              <rect
                                x={x + 0.5}
                                y={300 - 32 - putH}
                                width={barW}
                                height={putH}
                                fill="#f97316"
                                opacity={0.8}
                              >
                                <title>Put OI @ {strike}: {putOI.toLocaleString()}</title>
                              </rect>
                            </g>
                          )
                        })
                      })()}
                    </svg>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-black" /> Calls</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-500" /> Puts</span>
                      <span className="ml-auto">Strike price &rarr;</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No open interest data for this expiration.</p>
                )}
              </Card>
            </div>

            {/* Options Chain Table */}
            <Card title={`Option Chain — ${selectedSymbol} ${selectedExpiration}`} className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-600">
                      <th className="text-left py-2 px-2 font-medium">Type</th>
                      <th className="text-right py-2 px-2 font-medium">Strike</th>
                      <th className="text-right py-2 px-2 font-medium">Last</th>
                      <th className="text-right py-2 px-2 font-medium">Bid</th>
                      <th className="text-right py-2 px-2 font-medium">Ask</th>
                      <th className="text-right py-2 px-2 font-medium">Volume</th>
                      <th className="text-right py-2 px-2 font-medium">OI</th>
                      <th className="text-right py-2 px-2 font-medium">IV</th>
                      <th className="text-right py-2 px-2 font-medium">Delta</th>
                      <th className="text-right py-2 px-2 font-medium">Gamma</th>
                      <th className="text-right py-2 px-2 font-medium">Theta</th>
                      <th className="text-center py-2 px-2 font-medium">ITM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expirationContracts.slice(0, 50).map((c, i) => (
                      <tr key={c.contractID || i} className={`border-b border-gray-100 hover:bg-gray-50 ${c.in_the_money ? 'bg-gray-50' : ''}`}>
                        <td className="py-1.5 px-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${c.type === 'call' ? 'bg-black text-white' : 'bg-orange-500 text-white'}`}>
                            {c.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="text-right py-1.5 px-2 font-medium">{formatNumber(c.strike)}</td>
                        <td className="text-right py-1.5 px-2">{formatNumber(c.last)}</td>
                        <td className="text-right py-1.5 px-2">{formatNumber(c.bid)}</td>
                        <td className="text-right py-1.5 px-2">{formatNumber(c.ask)}</td>
                        <td className="text-right py-1.5 px-2">{c.volume.toLocaleString()}</td>
                        <td className="text-right py-1.5 px-2">{c.open_interest.toLocaleString()}</td>
                        <td className="text-right py-1.5 px-2">{formatPercent(c.implied_volatility)}</td>
                        <td className="text-right py-1.5 px-2">{formatNumber(c.delta, 4)}</td>
                        <td className="text-right py-1.5 px-2">{formatNumber(c.gamma, 4)}</td>
                        <td className="text-right py-1.5 px-2">{formatNumber(c.theta, 4)}</td>
                        <td className="text-center py-1.5 px-2">
                          {c.in_the_money ? <span className="text-green-600 font-bold">Y</span> : <span className="text-gray-400">-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {expirationContracts.length > 50 && (
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Showing 50 of {expirationContracts.length} contracts
                  </p>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
