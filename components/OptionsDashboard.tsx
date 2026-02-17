'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'

type OptionRow = {
  symbol: string
  expiration: string
  strike: number
  type: 'call' | 'put'
  date: string
  impliedVolatility: number
  openInterest: number
  volume: number
}

type AssetConfig = {
  label: string
  file: string
}

const ASSETS: Record<string, AssetConfig> = {
  USO: {
    label: 'USO - United States Oil Fund (WTI)',
    file: '/data/USO.csv',
  },
  BNO: {
    label: 'BNO - United States Brent Oil Fund (Brent)',
    file: '/data/BNO.csv',
  },
}

const numberOrZero = (value: string) => {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const parseCsv = (text: string): OptionRow[] => {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length < 2) return []

  const headers = lines[0].split(',')
  const indexOf = (name: string) => headers.indexOf(name)

  const symbolIdx = indexOf('symbol')
  const expirationIdx = indexOf('expiration')
  const strikeIdx = indexOf('strike')
  const typeIdx = indexOf('type')
  const dateIdx = indexOf('date')
  const ivIdx = indexOf('implied_volatility')
  const openInterestIdx = indexOf('open_interest')
  const volumeIdx = indexOf('volume')

  return lines.slice(1).map((line) => {
    const cols = line.split(',')
    return {
      symbol: cols[symbolIdx] || '',
      expiration: cols[expirationIdx] || '',
      strike: numberOrZero(cols[strikeIdx]),
      type: (cols[typeIdx] as 'call' | 'put') || 'call',
      date: cols[dateIdx] || '',
      impliedVolatility: numberOrZero(cols[ivIdx]),
      openInterest: numberOrZero(cols[openInterestIdx]),
      volume: numberOrZero(cols[volumeIdx]),
    }
  })
}

const formatDate = (value: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const uniqueSorted = (values: number[]) =>
  Array.from(new Set(values)).sort((a, b) => a - b)

const sampleArray = <T,>(values: T[], maxItems: number) => {
  if (values.length <= maxItems) return values
  const step = Math.ceil(values.length / maxItems)
  return values.filter((_, index) => index % step === 0)
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
  const scaleX = (value: number) =>
    padding + ((value - minX) / (maxX - minX || 1)) * (width - padding * 2)
  const scaleY = (value: number) =>
    height - padding - ((value - minY) / (maxY - minY || 1)) * (height - padding * 2)

  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${scaleX(point.x)},${scaleY(point.y)}`)
    .join(' ')
}

const Card = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-black">{title}</h3>
    </div>
    {children}
  </div>
)

export default function OptionsDashboard() {
  const [asset, setAsset] = useState<'USO' | 'BNO'>('USO')
  const [rows, setRows] = useState<OptionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedExpiration, setSelectedExpiration] = useState<string>('')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(ASSETS[asset].file)
        if (!response.ok) {
          throw new Error(`Missing CSV at ${ASSETS[asset].file}`)
        }
        const text = await response.text()
        const parsed = parseCsv(text)
        setRows(parsed)
      } catch (err: any) {
        setRows([])
        setError(err?.message || 'Failed to load CSV')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [asset])

  const latestDate = useMemo(() => {
    if (rows.length === 0) return ''
    return rows
      .map((row) => row.date)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
  }, [rows])

  const latestRows = useMemo(() => {
    if (!latestDate) return []
    return rows.filter((row) => row.date === latestDate)
  }, [rows, latestDate])

  const expirations = useMemo(() => {
    return Array.from(new Set(latestRows.map((row) => row.expiration))).sort()
  }, [latestRows])

  useEffect(() => {
    if (expirations.length > 0) {
      setSelectedExpiration((current) => (current && expirations.includes(current) ? current : expirations[0]))
    }
  }, [expirations])

  const surfaceData = useMemo(() => {
    if (latestRows.length === 0) return null
    const originDate = new Date(latestDate)
    const values = new Map<string, number[]>()
    latestRows.forEach((row) => {
      const expiry = new Date(row.expiration)
      const daysToExpiry = Math.max(0, Math.round((expiry.getTime() - originDate.getTime()) / 86400000))
      const key = `${daysToExpiry}|${row.strike}`
      const list = values.get(key) || []
      list.push(row.impliedVolatility)
      values.set(key, list)
    })

    const points = Array.from(values.entries()).map(([key, list]) => {
      const [days, strike] = key.split('|').map(Number)
      const avgIv = list.reduce((sum, item) => sum + item, 0) / list.length
      return { days, strike, iv: avgIv }
    })

    const days = uniqueSorted(points.map((p) => p.days))
    const strikes = uniqueSorted(points.map((p) => p.strike))
    const limitedDays = sampleArray(days, 20)
    const limitedStrikes = sampleArray(strikes, 30)
    const filtered = points.filter((point) => limitedDays.includes(point.days) && limitedStrikes.includes(point.strike))
    const ivs = filtered.map((point) => point.iv)
    return {
      points: filtered,
      days: limitedDays,
      strikes: limitedStrikes,
      minIv: Math.min(...ivs),
      maxIv: Math.max(...ivs),
    }
  }, [latestRows, latestDate])

  const smileData = useMemo(() => {
    if (!selectedExpiration) return { calls: [], puts: [], minIv: 0, maxIv: 1 }
    const filtered = latestRows.filter((row) => row.expiration === selectedExpiration)
    const calls = filtered
      .filter((row) => row.type === 'call')
      .sort((a, b) => a.strike - b.strike)
      .map((row) => ({ x: row.strike, y: row.impliedVolatility }))
    const puts = filtered
      .filter((row) => row.type === 'put')
      .sort((a, b) => a.strike - b.strike)
      .map((row) => ({ x: row.strike, y: row.impliedVolatility }))
    const ivs = [...calls, ...puts].map((point) => point.y)
    return {
      calls,
      puts,
      minIv: ivs.length ? Math.min(...ivs) : 0,
      maxIv: ivs.length ? Math.max(...ivs) : 1,
    }
  }, [latestRows, selectedExpiration])

  const termStructure = useMemo(() => {
    if (latestRows.length === 0) return []
    const originDate = new Date(latestDate)
    const grouped = new Map<number, number[]>()
    latestRows.forEach((row) => {
      const expiry = new Date(row.expiration)
      const days = Math.max(0, Math.round((expiry.getTime() - originDate.getTime()) / 86400000))
      const list = grouped.get(days) || []
      list.push(row.impliedVolatility)
      grouped.set(days, list)
    })
    return Array.from(grouped.entries())
      .map(([days, list]) => ({
        x: days,
        y: list.reduce((sum, item) => sum + item, 0) / list.length,
      }))
      .sort((a, b) => a.x - b.x)
  }, [latestRows, latestDate])

  const putCallRatio = useMemo(() => {
    if (rows.length === 0) return []
    const grouped = new Map<string, { calls: number; puts: number }>()
    rows.forEach((row) => {
      const entry = grouped.get(row.date) || { calls: 0, puts: 0 }
      if (row.type === 'call') {
        entry.calls += row.openInterest || row.volume
      } else {
        entry.puts += row.openInterest || row.volume
      }
      grouped.set(row.date, entry)
    })
    return Array.from(grouped.entries())
      .map(([date, value]) => ({
        x: new Date(date).getTime(),
        ratio: value.calls === 0 ? 0 : value.puts / value.calls,
        date,
      }))
      .sort((a, b) => a.x - b.x)
      .slice(-30)
  }, [rows])

  const handleAssetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setAsset(event.target.value as 'USO' | 'BNO')
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-8 py-10 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-black">Commodities Options</h2>
            <p className="text-gray-600 mt-1">
              Volatility analytics from options chains ({formatDate(latestDate)})
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-600">Asset</label>
            <select
              value={asset}
              onChange={handleAssetChange}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
            >
              {Object.entries(ASSETS).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-gray-600">
            Loading {ASSETS[asset].file}...
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-2xl border border-red-200 p-6 text-red-600">
            {error}. Drop the CSV at <span className="font-semibold">{ASSETS[asset].file}</span> with the header shown
            in the sample.
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-gray-600">
            No rows found. Confirm the CSV uses the sample header and is not empty.
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Surface de volatilité">
                {surfaceData ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Strike</span>
                      <span>Days to Expiry</span>
                    </div>
                    <svg viewBox="0 0 640 320" className="w-full h-72">
                      {surfaceData.points.map((point) => {
                        const xIndex = surfaceData.days.indexOf(point.days)
                        const yIndex = surfaceData.strikes.indexOf(point.strike)
                        const cellWidth = 640 / Math.max(surfaceData.days.length, 1)
                        const cellHeight = 320 / Math.max(surfaceData.strikes.length, 1)
                        const t =
                          (point.iv - surfaceData.minIv) / (surfaceData.maxIv - surfaceData.minIv || 1)
                        const hue = 220 - 220 * t
                        const color = `hsl(${hue}, 70%, 55%)`
                        return (
                          <rect
                            key={`${point.days}-${point.strike}`}
                            x={xIndex * cellWidth}
                            y={320 - (yIndex + 1) * cellHeight}
                            width={cellWidth}
                            height={cellHeight}
                            fill={color}
                          />
                        )
                      })}
                    </svg>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Low IV: {surfaceData.minIv.toFixed(2)}</span>
                      <span>High IV: {surfaceData.maxIv.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Surface data unavailable.</p>
                )}
              </Card>

              <Card title="Volatility Smile / Skew">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="text-xs text-gray-500">Expiration</span>
                  <select
                    value={selectedExpiration}
                    onChange={(event) => setSelectedExpiration(event.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg bg-white text-black text-sm"
                  >
                    {expirations.map((expiration) => (
                      <option key={expiration} value={expiration}>
                        {expiration}
                      </option>
                    ))}
                  </select>
                </div>
                <svg viewBox="0 0 640 320" className="w-full h-72">
                  <path
                    d={linePath(smileData.calls, 640, 320, 32)}
                    fill="none"
                    stroke="#111827"
                    strokeWidth={2}
                  />
                  <path
                    d={linePath(smileData.puts, 640, 320, 32)}
                    fill="none"
                    stroke="#f97316"
                    strokeWidth={2}
                  />
                </svg>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-black"></span> Calls
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-orange-500"></span> Puts
                  </span>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Term Structure">
                <svg viewBox="0 0 640 320" className="w-full h-72">
                  <path
                    d={linePath(termStructure, 640, 320, 32)}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth={2}
                  />
                </svg>
                <p className="text-xs text-gray-500 mt-3">
                  Average implied volatility by days to expiry (latest snapshot).
                </p>
              </Card>

              <Card title="Put / Call Ratio">
                <svg viewBox="0 0 640 320" className="w-full h-72">
                  <path
                    d={linePath(
                      putCallRatio.map((point) => ({ x: point.x, y: point.ratio })),
                      640,
                      320,
                      32
                    )}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                </svg>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                  <span>Last 30 trading days</span>
                  <span>
                    Latest ratio: {putCallRatio.length > 0 ? putCallRatio[putCallRatio.length - 1].ratio.toFixed(2) : '-'}
                  </span>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
