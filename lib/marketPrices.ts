export type PriceUnit = 'bbl' | 'MT' | 'mmbtu' | 'oz'

export type MarketQuote = {
  price: number
  unit: PriceUnit
  label: string
  date: string
  source: string
}

const BBL_PER_MT = 7.33
const OZ_PER_MT = 32150.746568628
const LB_PER_MT = 2204.62262

type SeriesDef = {
  seriesId: string
  unit: PriceUnit
  label: string
  /** Convert a raw FRED observation into USD in `unit`. */
  convert?: (raw: number) => number
}

function isUnitedStates(country?: string): boolean {
  if (!country) return true
  const n = country.toLowerCase().replace(/[^a-z]/g, '')
  return n === 'us' || n === 'usa' || n === 'unitedstates' || n === 'unitedstatesofamerica'
}

function seriesFor(commodity: string, destCountry?: string): SeriesDef | null {
  if (commodity === 'Crude Oil') {
    if (isUnitedStates(destCountry)) {
      return { seriesId: 'DCOILWTICO', unit: 'bbl', label: 'WTI Cushing' }
    }
    return { seriesId: 'DCOILBRENTEU', unit: 'bbl', label: 'Brent' }
  }
  if (commodity === 'Natural Gas') {
    return { seriesId: 'DHHNGSP', unit: 'mmbtu', label: 'Henry Hub' }
  }
  if (commodity === 'Copper') {
    return { seriesId: 'PCOPPUSDM', unit: 'MT', label: 'Copper (IMF)' }
  }
  if (commodity === 'Iron Ore') {
    return { seriesId: 'PIORECRUSDM', unit: 'MT', label: 'Iron ore (IMF)' }
  }
  if (commodity === 'Coal') {
    return { seriesId: 'PCOALAUUSDM', unit: 'MT', label: 'Thermal coal (IMF)' }
  }
  if (commodity === 'Gold') {
    return { seriesId: 'GOLDPMGBD228NLBM', unit: 'oz', label: 'Gold (London PM)' }
  }
  if (commodity === 'Sugar') {
    return {
      seriesId: 'PSUGAISAUSDM',
      unit: 'MT',
      label: 'Sugar (IMF)',
      convert: (raw) => (raw / 100) * LB_PER_MT,
    }
  }
  if (commodity === 'Uranium') {
    return {
      seriesId: 'PURANUSDM',
      unit: 'MT',
      label: 'Uranium (IMF)',
      convert: (raw) => raw * LB_PER_MT,
    }
  }
  return null
}

function latestObservation(observations: { date?: string; value?: string }[] | undefined): { date: string; value: number } | null {
  if (!observations?.length) return null
  for (let i = observations.length - 1; i >= 0; i--) {
    const raw = observations[i]?.value
    if (raw == null || raw === '.' || raw === '') continue
    const value = Number(raw)
    if (!Number.isFinite(value) || value <= 0) continue
    const date = observations[i].date || ''
    return { date, value }
  }
  return null
}

export async function fetchCommodityQuote(commodity: string, destCountry?: string): Promise<MarketQuote | null> {
  const def = seriesFor(commodity, destCountry)
  if (!def) return null

  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 120)
  const url = `/api/fred?series_id=${encodeURIComponent(def.seriesId)}&observation_start=${start.toISOString().slice(0, 10)}&observation_end=${end.toISOString().slice(0, 10)}`
  const resp = await fetch(url)
  if (!resp.ok) return null
  const json = await resp.json()
  const last = latestObservation(json.observations)
  if (!last) return null
  const price = def.convert ? def.convert(last.value) : last.value
  if (!Number.isFinite(price) || price <= 0) return null
  return {
    price,
    unit: def.unit,
    label: def.label,
    date: last.date,
    source: 'FRED',
  }
}

export function volumeToSpecUnits(commodity: string, volume: number, quantityUnit: string): number {
  if (!Number.isFinite(volume) || volume <= 0) return 0
  if (commodity === 'Crude Oil') {
    if (quantityUnit === 'MT') return volume * BBL_PER_MT
    return volume
  }
  if (commodity === 'Gold') {
    if (quantityUnit === 'oz') return volume / OZ_PER_MT
    return volume
  }
  if (commodity === 'Natural Gas') {
    if (quantityUnit === 'MT') return volume / 0.02
    return volume
  }
  return volume
}

export function commodityQtyForQuote(commodity: string, specVolume: number, quoteUnit: PriceUnit): number {
  if (!Number.isFinite(specVolume) || specVolume <= 0) return 0
  if (commodity === 'Crude Oil') {
    if (quoteUnit === 'bbl') return specVolume
    if (quoteUnit === 'MT') return specVolume / BBL_PER_MT
  }
  if (commodity === 'Gold') {
    if (quoteUnit === 'oz') return specVolume * OZ_PER_MT
    return specVolume
  }
  if (commodity === 'Natural Gas') {
    if (quoteUnit === 'mmbtu') return specVolume
    if (quoteUnit === 'MT') return specVolume * 0.02
  }
  return specVolume
}

export function formatUsd(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `$${(n / 1e6).toFixed(2)}M`
  if (abs >= 1_000) return `$${(n / 1000).toFixed(1)}k`
  return `$${n.toFixed(2)}`
}

export function formatUsdFull(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}
