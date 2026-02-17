'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Calendar, LineChart, Loader2 } from 'lucide-react'

const ALPHA_VANTAGE_API_KEY = '970KAXUCXIOWX55C'

interface CommodityConfig {
  name: string
  function: string
  symbol?: string
  intervals: string[]
  defaultInterval: string
  unit: string
}

const commodities: Record<string, CommodityConfig> = {
  'Gold': {
    name: 'Gold',
    function: 'GOLD_SILVER_SPOT',
    symbol: 'GOLD',
    intervals: ['daily', 'weekly', 'monthly'],
    defaultInterval: 'daily',
    unit: 'USD per troy ounce'
  },
  'Silver': {
    name: 'Silver',
    function: 'GOLD_SILVER_SPOT',
    symbol: 'SILVER',
    intervals: ['daily', 'weekly', 'monthly'],
    defaultInterval: 'daily',
    unit: 'USD per troy ounce'
  },
  'Crude Oil (WTI)': {
    name: 'Crude Oil (WTI)',
    function: 'WTI',
    intervals: ['daily', 'weekly', 'monthly'],
    defaultInterval: 'monthly',
    unit: 'USD per barrel'
  },
  'Crude Oil (Brent)': {
    name: 'Crude Oil (Brent)',
    function: 'BRENT',
    intervals: ['daily', 'weekly', 'monthly'],
    defaultInterval: 'monthly',
    unit: 'USD per barrel'
  },
  'Natural Gas': {
    name: 'Natural Gas',
    function: 'NATURAL_GAS',
    intervals: ['daily', 'weekly', 'monthly'],
    defaultInterval: 'monthly',
    unit: 'USD per MMBtu'
  },
  'Copper': {
    name: 'Copper',
    function: 'COPPER',
    intervals: ['monthly', 'quarterly', 'annual'],
    defaultInterval: 'monthly',
    unit: 'USD per metric ton'
  },
  'Aluminum': {
    name: 'Aluminum',
    function: 'ALUMINUM',
    intervals: ['monthly', 'quarterly', 'annual'],
    defaultInterval: 'monthly',
    unit: 'USD per metric ton'
  },
  'Wheat': {
    name: 'Wheat',
    function: 'WHEAT',
    intervals: ['monthly', 'quarterly', 'annual'],
    defaultInterval: 'monthly',
    unit: 'USD per bushel'
  },
  'Corn': {
    name: 'Corn',
    function: 'CORN',
    intervals: ['monthly', 'quarterly', 'annual'],
    defaultInterval: 'monthly',
    unit: 'USD per bushel'
  },
  'Cotton': {
    name: 'Cotton',
    function: 'COTTON',
    intervals: ['monthly', 'quarterly', 'annual'],
    defaultInterval: 'monthly',
    unit: 'USD per pound'
  },
  'Sugar': {
    name: 'Sugar',
    function: 'SUGAR',
    intervals: ['monthly', 'quarterly', 'annual'],
    defaultInterval: 'monthly',
    unit: 'USD per pound'
  },
  'Coffee': {
    name: 'Coffee',
    function: 'COFFEE',
    intervals: ['monthly', 'quarterly', 'annual'],
    defaultInterval: 'monthly',
    unit: 'USD per pound'
  },
}

interface PriceData {
  date: string
  value: number
}

interface MarketData {
  currentPrice?: number
  historicalData: PriceData[]
  change?: number
  changePercent?: number
}

export default function CommodityMarketLevels() {
  const [selectedCommodity, setSelectedCommodity] = useState<string>('')
  const [selectedInterval, setSelectedInterval] = useState<string>('')
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Set default interval when commodity changes
  useEffect(() => {
    if (selectedCommodity && commodities[selectedCommodity]) {
      setSelectedInterval(commodities[selectedCommodity].defaultInterval)
    }
  }, [selectedCommodity])

  // Fetch data when commodity or interval changes
  useEffect(() => {
    if (selectedCommodity && selectedInterval) {
      fetchCommodityData(selectedCommodity, selectedInterval)
    }
  }, [selectedCommodity, selectedInterval])

  const parseApiResponse = (data: any, config: CommodityConfig): MarketData => {
    const result: MarketData = { historicalData: [] }

    // Check for API errors
    if (data['Error Message']) {
      throw new Error(data['Error Message'])
    }
    
    // Check for rate limit or API notes
    if (data['Note']) {
      throw new Error('API rate limit exceeded. Please try again in a moment.')
    }

    // Handle Gold/Silver spot price response (if we're fetching spot)
    if (data['Realtime Currency Exchange Rate']) {
      const spotData = data['Realtime Currency Exchange Rate']
      const price = parseFloat(spotData['5. Exchange Rate'] || '0')
      if (price > 0) {
        result.currentPrice = price
      }
    }

    // Handle historical data - Alpha Vantage returns data in 'data' array
    if (data['data'] && Array.isArray(data['data'])) {
      result.historicalData = data['data']
        .filter((item: any) => {
          if (!item) return false
          const date = item.date || item[0]
          const value = item.value !== undefined ? item.value : item[1]
          return date && value !== undefined && value !== null && value !== ''
        })
        .slice(0, 100)
        .map((item: any) => {
          const date = item.date || item[0] || ''
          const valueStr = String(item.value !== undefined ? item.value : item[1] || '0')
          const value = parseFloat(valueStr.replace(/[^0-9.-]/g, ''))
          return { date, value }
        })
        .filter((item: PriceData) => !isNaN(item.value) && item.value > 0 && item.date)
        .sort((a, b) => a.date.localeCompare(b.date))
    }

    // If no data found, throw error
    if (result.historicalData.length === 0 && !result.currentPrice) {
      throw new Error('No data available for this commodity and interval')
    }

    // Calculate change and current price from historical data
    if (result.historicalData.length >= 2) {
      const latest = result.historicalData[result.historicalData.length - 1].value
      const previous = result.historicalData[result.historicalData.length - 2].value
      result.change = latest - previous
      result.changePercent = ((latest - previous) / previous) * 100
      if (!result.currentPrice) {
        result.currentPrice = latest
      }
    } else if (result.historicalData.length === 1) {
      result.currentPrice = result.historicalData[0].value
    }

    return result
  }

  const fetchCommodityData = async (commodityName: string, interval: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const config = commodities[commodityName]
      if (!config) return

      let url = ''
      
      // Handle Gold/Silver - use historical endpoint
      if (config.function === 'GOLD_SILVER_SPOT') {
        url = `https://www.alphavantage.co/query?function=GOLD_SILVER_HISTORY&symbol=${config.symbol}&interval=${interval}&apikey=${ALPHA_VANTAGE_API_KEY}`
      } else {
        // Other commodities - fetch historical directly
        url = `https://www.alphavantage.co/query?function=${config.function}&interval=${interval}&apikey=${ALPHA_VANTAGE_API_KEY}`
      }

      const response = await fetch(url)
      const data = await response.json()

      const parsedData = parseApiResponse(data, config)
      setMarketData(parsedData)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch commodity data')
      console.error('Error fetching commodity data:', err)
    } finally {
      setLoading(false)
    }
  }

  const maxValue = marketData && marketData.historicalData && marketData.historicalData.length > 0
    ? Math.max(...marketData.historicalData.map(d => d.value))
    : 0
  const minValue = marketData && marketData.historicalData && marketData.historicalData.length > 0
    ? Math.min(...marketData.historicalData.map(d => d.value))
    : 0

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-0 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
        <h1 className="text-3xl font-bold text-black mb-2">Commodity Market Levels</h1>
        <p className="text-gray-600">Real-time and historical commodity price data</p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-6xl w-full mx-auto px-8 py-6">
          {/* Selection Controls */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Commodity</label>
                <select
                  value={selectedCommodity}
                  onChange={(e) => setSelectedCommodity(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white"
                >
                  <option value="">Choose a commodity...</option>
                  {Object.keys(commodities).map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              {selectedCommodity && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Interval</label>
                  <select
                    value={selectedInterval}
                    onChange={(e) => setSelectedInterval(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white"
                  >
                    {commodities[selectedCommodity]?.intervals.map((interval) => (
                      <option key={interval} value={interval}>
                        {interval.charAt(0).toUpperCase() + interval.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Current Price Card */}
          {marketData?.currentPrice !== undefined && selectedCommodity && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Current Price</div>
                  <div className="text-4xl font-bold text-black">
                    ${marketData.currentPrice.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {commodities[selectedCommodity]?.unit}
                  </div>
                </div>
                {marketData.change !== undefined && (
                  <div className={`flex items-center gap-2 ${marketData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {marketData.change >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                    <div>
                      <div className="text-lg font-semibold">
                        {marketData.change >= 0 ? '+' : ''}{marketData.change.toFixed(2)}
                      </div>
                      <div className="text-sm">
                        ({marketData.changePercent !== undefined ? (marketData.changePercent >= 0 ? '+' : '') + marketData.changePercent.toFixed(2) : '0.00'}%)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-black" />
              <p className="text-gray-600">Loading commodity data...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Historical Data Chart */}
          {marketData && marketData.historicalData && marketData.historicalData.length > 0 && !loading && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-black flex items-center gap-2">
                  <LineChart size={20} />
                  Historical Price Data
                </h2>
                <div className="text-sm text-gray-600">
                  {marketData.historicalData.length} data points
                </div>
              </div>

              {/* Line Chart */}
              <div className="relative h-80 w-full">
                <svg className="w-full h-full" viewBox="0 0 800 320" preserveAspectRatio="none">
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={`grid-${i}`}
                      x1="40"
                      y1={60 + i * 50}
                      x2="760"
                      y2={60 + i * 50}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Y-axis labels */}
                  {[0, 1, 2, 3, 4].map((i) => {
                    const value = maxValue - (i * (maxValue - minValue) / 4)
                    return (
                      <text
                        key={`y-label-${i}`}
                        x="35"
                        y={65 + i * 50}
                        textAnchor="end"
                        className="text-xs fill-gray-500"
                        fontSize="10"
                      >
                        ${value.toFixed(2)}
                      </text>
                    )
                  })}

                  {/* Chart area */}
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#000000" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Data points and line */}
                  {(() => {
                    const chartData = marketData.historicalData.slice(-50) // Show last 50 points
                    const padding = 40
                    const chartWidth = 720
                    const chartHeight = 200
                    const stepX = chartWidth / (chartData.length - 1 || 1)
                    
                    // Generate path for line
                    const pathData = chartData.map((point, idx) => {
                      const x = padding + idx * stepX
                      const y = padding + chartHeight - ((point.value - minValue) / (maxValue - minValue || 1)) * chartHeight
                      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`
                    }).join(' ')

                    // Generate area path (for gradient fill)
                    const areaPath = `${pathData} L ${padding + (chartData.length - 1) * stepX} ${padding + chartHeight} L ${padding} ${padding + chartHeight} Z`

                    return (
                      <>
                        {/* Gradient fill */}
                        <path
                          d={areaPath}
                          fill="url(#gradient)"
                        />
                        {/* Main line */}
                        <path
                          d={pathData}
                          fill="none"
                          stroke="#000000"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Data points */}
                        {chartData.map((point, idx) => {
                          const x = padding + idx * stepX
                          const y = padding + chartHeight - ((point.value - minValue) / (maxValue - minValue || 1)) * chartHeight
                          return (
                            <circle
                              key={idx}
                              cx={x}
                              cy={y}
                              r="3"
                              fill="#000000"
                              className="hover:r-4 transition-all cursor-pointer"
                            >
                              <title>{`${point.date}: $${point.value.toFixed(2)}`}</title>
                            </circle>
                          )
                        })}
                      </>
                    )
                  })()}

                  {/* X-axis */}
                  <line
                    x1="40"
                    y1="260"
                    x2="760"
                    y2="260"
                    stroke="#000000"
                    strokeWidth="2"
                  />

                  {/* X-axis labels (show first, middle, last) */}
                  {(() => {
                    const chartData = marketData.historicalData.slice(-50)
                    if (chartData.length === 0) return null
                    
                    const labels = [
                      { idx: 0, date: chartData[0].date },
                      { idx: Math.floor(chartData.length / 2), date: chartData[Math.floor(chartData.length / 2)].date },
                      { idx: chartData.length - 1, date: chartData[chartData.length - 1].date }
                    ]
                    
                    const stepX = 720 / (chartData.length - 1 || 1)
                    
                    return labels.map((label, i) => {
                      const x = 40 + label.idx * stepX
                      return (
                        <text
                          key={`x-label-${i}`}
                          x={x}
                          y="280"
                          textAnchor="middle"
                          className="text-xs fill-gray-500"
                          fontSize="10"
                        >
                          {label.date}
                        </text>
                      )
                    })
                  })()}
                </svg>
              </div>

              {/* Data Table */}
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-black mb-3">Recent Prices</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-gray-600 font-medium">Date</th>
                        <th className="text-right py-2 text-gray-600 font-medium">Price ({commodities[selectedCommodity]?.unit})</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marketData.historicalData.slice(-10).reverse().map((point, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-2 text-gray-700">{point.date}</td>
                          <td className="text-right py-2 font-medium">${point.value.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!selectedCommodity && !loading && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <LineChart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Select a commodity to view market data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
