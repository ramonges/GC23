'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { ChevronRight, CheckCircle, ChevronDown, Navigation, FileSpreadsheet, FileText } from 'lucide-react'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import {
  majorPorts,
  commoditySpecs,
  vesselClasses,
  findNearestPort,
  generateSeaWaypoints,
  haversineDistanceKm,
  CharterType,
  Port,
  balticRoutes,
} from '@/lib/shippingConfig'
import {
  fetchCommodityQuote,
  volumeToSpecUnits,
  commodityQtyForQuote,
  formatUsd,
  formatUsdFull,
  type MarketQuote,
  type PriceUnit,
} from '@/lib/marketPrices'
import type { ShippingRoute } from '@/lib/types'

const Globe3D = dynamic(() => import('./Globe3DClient'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-black">
      <div className="text-center text-white">Loading 3D Earth...</div>
    </div>
  ),
})

// Commodities available in DB: from commodity_locations + coal_mines + gold_mines
const COMMODITY_SOURCES = [
  { name: 'Crude Oil', source: 'commodity_locations' as const, type: 'Energy' },
  { name: 'Natural Gas', source: 'commodity_locations' as const, type: 'Energy' },
  { name: 'Uranium', source: 'commodity_locations' as const, type: 'Energy' },
  { name: 'Coal', source: 'coal_mines' as const },
  { name: 'Gold', source: 'gold_mines' as const },
  { name: 'Iron Ore', source: 'commodity_locations' as const, type: 'Metals' },
  { name: 'Copper', source: 'commodity_locations' as const, type: 'Metals' },
  { name: 'Sugar', source: 'sugar_plants' as const, type: 'Agricultural' },
]

interface Asset {
  id: string
  title: string
  latitude: number
  longitude: number
  country: string
  region?: string
  operator?: string
  grade?: string
  api_gravity?: number
  sulfur_content?: number
  production_capacity?: number
  current_production?: number
  nearest_port?: string
  coal_type?: string
  calorific_value_kcal_kg?: number
  sulfur_percent?: number
  annual_capacity_tonnes?: number
  [key: string]: any
}

const STEPS = 8
const INLAND_COST_PER_KM_Truck = 0.15
const INLAND_COST_PER_KM_Rail = 0.08
const INLAND_COST_PER_KM_Conveyor = 0.04
const INLAND_COST_PER_KM_Pipeline = 0.05
const VLSFO_USD = 550

type InlandModeOption = 'truck' | 'rail' | 'conveyor' | 'pipeline'

// Solids: truck/rail/conveyor (mines); liquids/gas: pipeline
const INLAND_MODES_BY_COMMODITY: Record<string, InlandModeOption[]> = {
  'Coal': ['truck', 'rail', 'conveyor'],
  'Gold': ['truck', 'rail'],
  'Iron Ore': ['truck', 'rail', 'conveyor'],
  'Copper': ['truck', 'rail'],
  'Uranium': ['truck', 'rail'],
  'Sugar': ['truck', 'rail', 'conveyor'],
  'Crude Oil': ['truck', 'rail', 'pipeline'],
  'Natural Gas': ['truck', 'rail', 'pipeline'],
}

const INCOTERMS = ['CIF', 'FOB', 'CFR', 'DES', 'DAP'] as const

const DEFAULT_QUANTITY_UNIT: Record<string, string> = {
  'Crude Oil': 'bbl',
  'Natural Gas': 'mmbtu',
  'Uranium': 'MT',
  'Coal': 'MT',
  'Gold': 'oz',
  'Iron Ore': 'MT',
  'Copper': 'MT',
  'Sugar': 'MT',
}

function unitOptionsFor(commodity: string): string[] {
  const def = DEFAULT_QUANTITY_UNIT[commodity] || 'MT'
  if (commodity === 'Crude Oil') return ['bbl', 'MT']
  if (commodity === 'Natural Gas') return ['mmbtu', 'MT']
  if (commodity === 'Gold') return ['oz', 'MT']
  return [def]
}

function displaySpecUnit(specUnit?: string): string {
  if (specUnit === 'bbls') return 'bbl'
  return specUnit || 'MT'
}

const API_GRAVITY_RANGES = [
  { id: 'any', label: 'Any API gravity' },
  { id: 'heavy', label: 'Heavy · < 25° API' },
  { id: 'medium', label: 'Medium · 25–35° API' },
  { id: 'light', label: 'Light · 35–45° API' },
  { id: 'condensate', label: 'Very light / Condensate · > 45° API' },
] as const

function applyApiGravityFilter(query: any, range: string) {
  if (!range || range === 'any') return query
  query = query.not('api_gravity', 'is', null)
  if (range === 'heavy') return query.lt('api_gravity', 25)
  if (range === 'medium') return query.gte('api_gravity', 25).lt('api_gravity', 35)
  if (range === 'light') return query.gte('api_gravity', 35).lte('api_gravity', 45)
  if (range === 'condensate') return query.gt('api_gravity', 45)
  return query
}

function assetMatchesApiRange(apiGravity: any, range: string): boolean {
  if (!range || range === 'any') return true
  const n = Number(apiGravity)
  if (apiGravity == null || apiGravity === '' || Number.isNaN(n)) return false
  if (range === 'heavy') return n < 25
  if (range === 'medium') return n >= 25 && n < 35
  if (range === 'light') return n >= 35 && n <= 45
  if (range === 'condensate') return n > 45
  return true
}

function parcelToMt(commodity: string, parcelSize: number): number {
  const c = commoditySpecs[commodity]
  if (!c) return parcelSize
  if (c.unit === 'bbls') return parcelSize / (c.bblPerMt || 7.33)
  if (c.unit === 'mmbtu') return parcelSize * 0.02
  return parcelSize
}

const COMMODITY_TYPE_MAP: Record<string, string> = {
  'Crude Oil': 'Energy',
  'Natural Gas': 'Energy',
  'Uranium': 'Energy',
  'Iron Ore': 'Metals',
  'Copper': 'Metals',
  'Sugar': 'Agricultural',
}

function inlandRatePerKmFor(mode: InlandModeOption): number {
  if (mode === 'truck') return INLAND_COST_PER_KM_Truck
  if (mode === 'rail') return INLAND_COST_PER_KM_Rail
  if (mode === 'conveyor') return INLAND_COST_PER_KM_Conveyor
  return INLAND_COST_PER_KM_Pipeline
}

function defaultInlandModeFor(commodity: string): InlandModeOption {
  return (INLAND_MODES_BY_COMMODITY[commodity] || ['truck'])[0]
}

function defaultVesselFor(commodity: string): string | null {
  const spec = commoditySpecs[commodity]
  const fromSpec = spec?.vesselTypes?.find((v) => vesselClasses[v])
  if (fromSpec) return fromSpec
  return Object.keys(vesselClasses).find((v) => vesselClasses[v].commodities.includes(commodity)) || null
}

const INLAND_ONLY_SEA_NM = 25

function normalizeCountryName(country?: string): string {
  if (!country) return ''
  const n = country.toLowerCase().replace(/[^a-z]/g, '')
  if (n === 'us' || n === 'usa' || n === 'unitedstatesofamerica') return 'unitedstates'
  if (n === 'uk' || n === 'gb' || n === 'greatbritain' || n === 'britain') return 'unitedkingdom'
  return n
}

function countryQueryValues(country?: string): string[] {
  if (!country) return []
  const n = normalizeCountryName(country)
  if (n === 'unitedstates') return ['United States', 'USA', 'US', 'United States of America']
  if (n === 'unitedkingdom') return ['United Kingdom', 'UK', 'Great Britain']
  return [country]
}

function countriesMatch(a?: string, b?: string): boolean {
  const na = normalizeCountryName(a)
  const nb = normalizeCountryName(b)
  return !!na && na === nb
}

function isInlandOnlySeaLeg(from: Port, to: Port): boolean {
  if (from.name === to.name && from.country === to.country) return true
  return haversineDistanceKm(from.lat, from.lng, to.lat, to.lng) / 1.852 < INLAND_ONLY_SEA_NM
}

function resolveDeliveryRoute(
  asset: Pick<Asset, 'latitude' | 'longitude' | 'country'>,
  destination: Port,
): { inlandOnly: boolean; inlandKm: number; handoff: Port } {
  const nearest = findNearestPort(asset.latitude, asset.longitude)
  if (isInlandOnlySeaLeg(nearest.port, destination) || countriesMatch(asset.country, destination.country)) {
    return {
      inlandOnly: true,
      inlandKm: haversineDistanceKm(asset.latitude, asset.longitude, destination.lat, destination.lng),
      handoff: destination,
    }
  }
  return { inlandOnly: false, inlandKm: nearest.distanceKm, handoff: nearest.port }
}

function normalizeAsset(row: any, source: string): Asset | null {
  const lat = Number(row.latitude ?? row.lat)
  const lng = Number(row.longitude ?? row.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (source === 'coal_mines') {
    return {
      id: String(row.id),
      title: row.mine_name || 'Coal Mine',
      latitude: lat,
      longitude: lng,
      country: row.country,
      region: row.region,
      operator: row.operator,
      grade: row.coal_type || row.grade,
      coal_type: row.coal_type,
      calorific_value_kcal_kg: row.calorific_value_kcal_kg,
      sulfur_percent: row.sulfur_percent,
      annual_capacity_tonnes: row.annual_capacity_tonnes,
      nearest_port: row.nearest_port,
      production_capacity: row.annual_capacity_tonnes,
    }
  }
  if (source === 'gold_mines') {
    return {
      id: String(row.id),
      title: row.mine_name || row.name || 'Gold Mine',
      latitude: lat,
      longitude: lng,
      country: row.country,
      region: row.region,
      operator: row.operator,
      production_capacity: row.annual_capacity_troy_oz,
    }
  }
  if (source === 'sugar_plants') {
    return {
      id: String(row.id),
      title: row.mill_name || 'Sugar Mill',
      latitude: lat,
      longitude: lng,
      country: row.country,
      region: row.region,
      operator: row.operator,
      grade: row.primary_grade,
      production_capacity: row.annual_output_tonnes,
      current_production: row.annual_output_tonnes,
    }
  }
  return {
    id: String(row.id),
    title: row.title || 'Site',
    latitude: lat,
    longitude: lng,
    country: row.country,
    region: row.region,
    operator: row.operator,
    grade: row.grade,
    api_gravity: row.api_gravity,
    sulfur_content: row.sulfur_content,
    production_capacity: row.production_capacity,
    current_production: row.current_production,
  }
}

type DeliveryStatus = 'meets' | 'risk' | 'insufficient'

interface RankedSource {
  asset: Asset
  exportPort: Port | null
  inlandMode: InlandModeOption
  inlandDistanceKm: number | null
  inlandDays: number | null
  inlandCostPerMt: number | null
  freightCostPerMt: number | null
  deliveredCostPerMt: number | null
  transitDays: number | null
  unitLabel: string
  status: DeliveryStatus
  rankReason: string
  inlandOnly: boolean
}

function marketCostParams(quote: MarketQuote | null, quantityUnit: string, displayVolume: number) {
  return {
    commodityPrice: quote?.price ?? null,
    commodityPriceUnit: quote?.unit ?? null,
    commodityPriceLabel: quote?.label,
    commodityPriceDate: quote?.date,
    quantityUnit,
    displayVolume,
  }
}

function requiredDeliveryDeadline(laycanStart: string, laycanEnd: string): Date | null {
  const raw = laycanEnd || laycanStart
  if (!raw) return null
  const d = new Date(`${raw}T23:59:59`)
  return Number.isNaN(d.getTime()) ? null : d
}

function computeModeledCost(params: {
  selectedCommodity: string
  volume: number
  nearestPort: { port: Port; distanceKm: number }
  destinationPort: Port
  vesselClass: string
  inlandMode: InlandModeOption
  loadingRateMtDay: number
  dischargeRateMtDay: number
  portDuesPerMt: number
  stevedoringPerMt: number
  wharfagePerMt: number
  surveyorFee: boolean
  inspectionFee: boolean
  fumigationFee: boolean
  marineInsurancePct: number
  contingencyPct: number
  latePenaltyPerDay: number
  expectedDelayDays: number
  blendingMode: 'none' | 'fixed' | 'optimise'
  stockpileCost: number
  blendingFee: number
  maxStorageDays: number
  dischargePortDues: number
  dischargeUnloadGrab: number
  dischargeCustomsClearance: number
  canalToll: 'suez' | 'panama' | 'none'
  commodityPrice?: number | null
  commodityPriceUnit?: PriceUnit | null
  commodityPriceLabel?: string
  commodityPriceDate?: string
  quantityUnit?: string
  displayVolume?: number
}) {
  const commodity = commoditySpecs[params.selectedCommodity]
  if (!commodity || params.volume <= 0) return null

  const parcelMt = parcelToMt(params.selectedCommodity, params.volume)
  const inlandDist = params.nearestPort.distanceKm
  const inlandCostPerTon = inlandRatePerKmFor(params.inlandMode)
  const inlandCost = inlandDist * inlandCostPerTon * parcelMt
  const inlandDays = Math.ceil(inlandDist / 500)
  const commodityQty = params.commodityPrice && params.commodityPriceUnit
    ? commodityQtyForQuote(params.selectedCommodity, params.volume, params.commodityPriceUnit)
    : 0
  const commodityCost = params.commodityPrice && commodityQty > 0 ? params.commodityPrice * commodityQty : 0
  const displayUnit = params.quantityUnit || (commodity.unit === 'bbls' ? 'bbl' : commodity.unit)
  const displayQty = params.displayVolume && params.displayVolume > 0
    ? params.displayVolume
    : (displayUnit === 'MT' ? parcelMt : params.volume)

  const seaDistNm = haversineDistanceKm(
    params.nearestPort.port.lat,
    params.nearestPort.port.lng,
    params.destinationPort.lat,
    params.destinationPort.lng,
  ) / 1.852
  const inlandOnly = seaDistNm < INLAND_ONLY_SEA_NM
  const vessel = !inlandOnly && params.vesselClass ? vesselClasses[params.vesselClass] : null
  if (!inlandOnly && !vessel) return null

  if (inlandOnly) {
    const lateRisk = params.expectedDelayDays > 0 && params.latePenaltyPerDay > 0 ? Math.min(params.expectedDelayDays, 7) * params.latePenaltyPerDay : 0
    const blendingTotal = params.blendingMode !== 'none' ? params.stockpileCost + params.blendingFee + (params.maxStorageDays > 0 ? params.maxStorageDays * 500 : 0) : 0
    const marineIns = (inlandCost + commodityCost) * (params.marineInsurancePct / 100)
    const subtotal = inlandCost + marineIns + lateRisk + blendingTotal
    const contingency = subtotal * (params.contingencyPct / 100)
    const totalCost = commodityCost + subtotal + contingency
    const unitCost = displayQty > 0 ? totalCost / displayQty : 0
    const perMt = parcelMt > 0 ? 1 / parcelMt : 0
    return {
      inlandCost, inlandDist, inlandDays, inlandMode: params.inlandMode,
      parcelMt, volume: params.volume,
      sailingDays: 0, loadingDays: 0, dischargeDays: 0, totalDays: inlandDays,
      seaDistNm: 0,
      freight: 0, bunker: 0, port: 0, canal: 0,
      dischargePortCost: 0, marineIns, lateRisk, blendingTotal,
      contingency,
      commodityCost, commodityQty,
      commodityPrice: params.commodityPrice || 0,
      commodityPriceUnit: params.commodityPriceUnit || null,
      commodityPriceLabel: params.commodityPriceLabel || '',
      commodityPriceDate: params.commodityPriceDate || '',
      totalCost, unitCost, unitLabel: displayUnit === 'bbls' ? 'bbl' : displayUnit,
      originPort: params.nearestPort.port, destinationPort: params.destinationPort,
      vessel: null, commodity, inlandOnly: true,
      inlandCostPerMt: inlandCost * perMt,
      freightCostPerMt: 0,
    }
  }

  if (!vessel) return null

  const sailingDays = seaDistNm / (vessel.speed * 24)
  const loadRate = params.loadingRateMtDay > 0 ? params.loadingRateMtDay : commodity.loadingRateMtHr * 24
  const dischRate = params.dischargeRateMtDay > 0 ? params.dischargeRateMtDay : commodity.dischargeRateMtHr * 24
  const loadingDays = Math.max(0.5, parcelMt / loadRate) + 0.5
  const dischargeDays = Math.max(0.5, parcelMt / dischRate) + 0.5
  const totalDays = inlandDays + 1 + loadingDays + sailingDays + 1.5 + dischargeDays

  const hireCost = vessel.tceRate * totalDays
  const bunkerSea = vessel.fuelAtSea * sailingDays * VLSFO_USD
  const bunkerPort = vessel.fuelInPort * (loadingDays + dischargeDays + 2.5) * VLSFO_USD
  const bunkerCost = bunkerSea + bunkerPort
  let portCost = vessel.portCostPerCall * 2
  if (params.portDuesPerMt || params.stevedoringPerMt || params.wharfagePerMt) {
    portCost = parcelMt * (params.portDuesPerMt + params.stevedoringPerMt + params.wharfagePerMt)
    if (params.surveyorFee) portCost += 5000
    if (params.inspectionFee) portCost += 3000
    if (params.fumigationFee) portCost += 8000
  }

  let canalCost = 0
  const oReg = params.nearestPort.port.region
  const dReg = params.destinationPort.region
  const needsSuez = vessel.canalSuez && ((oReg === 'East Asia' && dReg === 'North Europe') || (oReg === 'North Europe' && dReg === 'East Asia'))
  const needsPanama = vessel.canalPanama && ((oReg === 'US Gulf' && dReg === 'East Asia') || (oReg === 'East Asia' && dReg === 'US Gulf'))
  if (params.canalToll === 'suez' || (params.canalToll === 'none' && needsSuez)) canalCost += 550000
  if (params.canalToll === 'panama' || (params.canalToll === 'none' && needsPanama)) canalCost += 450000

  const dischargePortCost = parcelMt * (params.dischargePortDues + params.dischargeUnloadGrab + params.dischargeCustomsClearance)
  const marineIns = (inlandCost + hireCost + bunkerCost + portCost + canalCost + commodityCost) * (params.marineInsurancePct / 100)
  const lateRisk = params.expectedDelayDays > 0 && params.latePenaltyPerDay > 0 ? Math.min(params.expectedDelayDays, 7) * params.latePenaltyPerDay : 0
  const blendingTotal = params.blendingMode !== 'none' ? params.stockpileCost + params.blendingFee + (params.maxStorageDays > 0 ? params.maxStorageDays * 500 : 0) : 0
  const freightTotal = hireCost + bunkerCost + portCost + canalCost
  const subtotal = inlandCost + freightTotal + dischargePortCost + marineIns + lateRisk + blendingTotal
  const contingency = subtotal * (params.contingencyPct / 100)
  const totalCost = commodityCost + subtotal + contingency
  const unitCost = displayQty > 0 ? totalCost / displayQty : 0
  const perMt = parcelMt > 0 ? 1 / parcelMt : 0

  return {
    inlandCost, inlandDist, inlandDays, inlandMode: params.inlandMode,
    parcelMt, volume: params.volume,
    sailingDays, loadingDays, dischargeDays, totalDays,
    seaDistNm,
    freight: hireCost, bunker: bunkerCost, port: portCost, canal: canalCost,
    dischargePortCost, marineIns, lateRisk, blendingTotal,
    contingency,
    commodityCost, commodityQty,
    commodityPrice: params.commodityPrice || 0,
    commodityPriceUnit: params.commodityPriceUnit || null,
    commodityPriceLabel: params.commodityPriceLabel || '',
    commodityPriceDate: params.commodityPriceDate || '',
    totalCost, unitCost, unitLabel: displayUnit === 'bbls' ? 'bbl' : displayUnit,
    originPort: params.nearestPort.port, destinationPort: params.destinationPort,
    vessel, commodity, inlandOnly: false,
    inlandCostPerMt: inlandCost * perMt,
    freightCostPerMt: (hireCost + bunkerCost + canalCost) * perMt,
  }
}

function rankEligibleSources(
  assets: Asset[],
  params: Omit<Parameters<typeof computeModeledCost>[0], 'nearestPort'> & { deadline: Date | null },
): { lowestCost: RankedSource[]; flow: RankedSource[] } {
  const scored: RankedSource[] = assets.map((asset) => {
    if (!Number.isFinite(asset.latitude) || !Number.isFinite(asset.longitude)) {
      return {
        asset, exportPort: null, inlandMode: params.inlandMode,
        inlandDistanceKm: null, inlandDays: null, inlandCostPerMt: null,
        freightCostPerMt: null, deliveredCostPerMt: null, transitDays: null,
        unitLabel: commoditySpecs[params.selectedCommodity]?.unit || 'MT',
        status: 'insufficient', rankReason: 'Insufficient data', inlandOnly: false,
      }
    }
    const route = resolveDeliveryRoute(asset, params.destinationPort)
    const inlandModeForAsset = (route.inlandOnly && (INLAND_MODES_BY_COMMODITY[params.selectedCommodity] || []).includes('pipeline'))
      ? 'pipeline'
      : params.inlandMode
    const modeled = computeModeledCost({
      ...params,
      inlandMode: inlandModeForAsset,
      nearestPort: { port: route.handoff, distanceKm: route.inlandKm },
    })
    if (!modeled) {
      return {
        asset, exportPort: route.handoff, inlandMode: params.inlandMode,
        inlandDistanceKm: route.inlandKm, inlandDays: Math.ceil(route.inlandKm / 500),
        inlandCostPerMt: null, freightCostPerMt: route.inlandOnly ? 0 : null, deliveredCostPerMt: null, transitDays: null,
        unitLabel: commoditySpecs[params.selectedCommodity]?.unit || 'MT',
        status: 'insufficient', rankReason: 'Insufficient data', inlandOnly: route.inlandOnly,
      }
    }
    let status: DeliveryStatus = 'meets'
    if (params.deadline) {
      const arrival = new Date()
      arrival.setDate(arrival.getDate() + Math.ceil(modeled.totalDays))
      if (arrival > params.deadline) status = 'risk'
    }
    return {
      asset,
      exportPort: route.handoff,
      inlandMode: inlandModeForAsset,
      inlandDistanceKm: modeled.inlandDist,
      inlandDays: modeled.inlandDays,
      inlandCostPerMt: modeled.inlandCostPerMt,
      freightCostPerMt: modeled.freightCostPerMt,
      deliveredCostPerMt: modeled.unitCost,
      transitDays: modeled.totalDays,
      unitLabel: modeled.unitLabel,
      status,
      rankReason: '',
      inlandOnly: route.inlandOnly,
    }
  })

  const complete = scored.filter((s) => s.status !== 'insufficient' && s.deliveredCostPerMt != null)
  const feasible = complete.filter((s) => s.status === 'meets')
  const primary = feasible.length >= 10 ? feasible : complete
  const leftover = feasible.length >= 10 ? [] : scored.filter((s) => !primary.includes(s))

  const byCost = [...primary].sort((a, b) => {
    const ac = a.deliveredCostPerMt ?? Number.POSITIVE_INFINITY
    const bc = b.deliveredCostPerMt ?? Number.POSITIVE_INFINITY
    if (a.status !== b.status) return a.status === 'meets' ? -1 : 1
    return ac - bc
  })
  const byFlow = [...primary].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'meets' ? -1 : 1
    const ad = a.inlandDistanceKm ?? Number.POSITIVE_INFINITY
    const bd = b.inlandDistanceKm ?? Number.POSITIVE_INFINITY
    if (ad !== bd) return ad - bd
    const at = a.inlandDays ?? Number.POSITIVE_INFINITY
    const bt = b.inlandDays ?? Number.POSITIVE_INFINITY
    if (at !== bt) return at - bt
    return (a.inlandCostPerMt ?? Number.POSITIVE_INFINITY) - (b.inlandCostPerMt ?? Number.POSITIVE_INFINITY)
  })

  const fill = (ranked: RankedSource[], reasonForFirst: string, reasonForRest: string) => {
    const top = ranked.slice(0, 10)
    if (top.length < 10) {
      leftover
        .filter((s) => !top.some((t) => t.asset.id === s.asset.id))
        .sort((a, b) => (a.deliveredCostPerMt ?? Number.POSITIVE_INFINITY) - (b.deliveredCostPerMt ?? Number.POSITIVE_INFINITY))
        .slice(0, 10 - top.length)
        .forEach((s) => top.push(s))
    }
    return top.map((s, i) => ({
      ...s,
      rankReason: s.status === 'insufficient'
        ? 'Insufficient data'
        : s.status === 'risk'
          ? 'Does not meet delivery window'
          : s.inlandOnly
            ? (i === 0 ? `${reasonForFirst} · inland delivery` : 'Inland delivery · no ocean freight')
            : i === 0 ? reasonForFirst : reasonForRest,
    }))
  }

  return {
    lowestCost: fill(byCost, 'Lowest delivered cost', 'Estimated delivered cost'),
    flow: fill(byFlow, 'Shortest inland route', 'Shorter inland route'),
  }
}

const STEP_LABELS = ['Commodity', 'Destination', 'Sources', 'Inland', 'Blending', 'Vessel', 'Charter', 'Freight'] as const

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black'
const unitSelectClass =
  'w-24 flex-shrink-0 px-3 py-2 border border-gray-300 rounded-lg bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-black'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'
const primaryBtnClass =
  'px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2'
const secondaryBtnClass =
  'px-4 py-2 bg-white border border-gray-300 text-black rounded-lg hover:bg-gray-50 text-sm font-medium'

function FormCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 min-w-0">
      <h3 className="text-sm font-semibold text-black mb-4 uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  )
}

function KpiPanel({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-lg font-bold text-black leading-tight">{value}</div>
      {hint && <div className="text-xs text-gray-500 mt-0.5">{hint}</div>}
    </div>
  )
}

function StepNav({ step }: { step: number }) {
  return (
    <nav className="bg-white rounded-xl border border-gray-200 px-5 py-3">
      <ol className="flex flex-wrap items-end text-sm">
        {STEP_LABELS.map((label, i) => {
          const s = i + 1
          const isActive = step === s
          const isComplete = step > s
          return (
            <li key={label} className="flex items-center">
              {i > 0 && <span className="text-gray-300 mx-2 select-none">·</span>}
              <span
                className={
                  isActive
                    ? 'font-semibold text-black border-b-2 border-black pb-0.5'
                    : isComplete
                      ? 'text-gray-600'
                      : 'text-gray-400'
                }
              >
                {isComplete && <CheckCircle size={12} className="inline-block mr-1 -mt-0.5" />}
                {label}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function StepActions({
  onBack,
  onNext,
  nextDisabled,
  nextLabel = 'Continue',
  showBack = true,
}: {
  onBack?: () => void
  onNext: () => void
  nextDisabled?: boolean
  nextLabel?: string
  showBack?: boolean
}) {
  return (
    <div className={`mt-6 flex ${showBack ? 'justify-between' : 'justify-end'}`}>
      {showBack && onBack && (
        <button type="button" onClick={onBack} className={secondaryBtnClass}>
          Back
        </button>
      )}
      <button type="button" onClick={onNext} disabled={nextDisabled} className={primaryBtnClass}>
        {nextLabel} <ChevronRight size={16} />
      </button>
    </div>
  )
}

export default function ShippingDeliveryWizard() {
  const [step, setStep] = useState(1)
  const [commodities, setCommodities] = useState<{ name: string; source: string }[]>(
    COMMODITY_SOURCES.map((c) => ({ name: c.name, source: c.source }))
  )
  const [selectedCommodity, setSelectedCommodity] = useState('')
  const [originCountry, setOriginCountry] = useState('')
  const [assets, setAssets] = useState<Asset[]>([])
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [nearestPort, setNearestPort] = useState<{ port: Port; distanceKm: number } | null>(null)
  const [inlandMode, setInlandMode] = useState<'truck' | 'rail' | 'conveyor' | 'pipeline'>('truck')
  const [volume, setVolume] = useState(0)
  const [quantityUnit, setQuantityUnit] = useState('MT')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [sourceMode, setSourceMode] = useState<'manual' | 'auto'>('manual')
  const [autoRankTab, setAutoRankTab] = useState<'cost' | 'flow'>('cost')
  const [autoLoading, setAutoLoading] = useState(false)
  const [rankedLowestCost, setRankedLowestCost] = useState<RankedSource[]>([])
  const [rankedFlow, setRankedFlow] = useState<RankedSource[]>([])
  const [selectedApiGravity, setSelectedApiGravity] = useState('any')
  const [vesselClass, setVesselClass] = useState('')
  const [charterType, setCharterType] = useState<CharterType>('voyage')
  const [freightRate, setFreightRate] = useState<'market' | 'custom'>('market')
  const [customRate, setCustomRate] = useState(0)
  const [destinationPort, setDestinationPort] = useState<Port | null>(null)
  const [latePenaltyPerDay, setLatePenaltyPerDay] = useState(0)
  const [gracePeriodDays, setGracePeriodDays] = useState(0)
  const [showMap, setShowMap] = useState(false)
  const [mapFullScreen, setMapFullScreen] = useState(false)
  const [costBreakdown, setCostBreakdown] = useState<any>(null)
  const [marketQuote, setMarketQuote] = useState<MarketQuote | null>(null)
  const [marketQuoteLoading, setMarketQuoteLoading] = useState(false)
  // Step 1 extras
  const [incoterm, setIncoterm] = useState<string>('CIF')
  const [currency, setCurrency] = useState('USD')
  const [marineInsurancePct, setMarineInsurancePct] = useState(0.15)
  const [contingencyPct, setContingencyPct] = useState(2)
  const [laycanStart, setLaycanStart] = useState('')
  const [laycanEnd, setLaycanEnd] = useState('')
  // Step 2: region filter, quality overrides
  const [originRegion, setOriginRegion] = useState('')
  const [qualityOverrideCal, setQualityOverrideCal] = useState<number | ''>('')
  const [qualityOverrideMoisture, setQualityOverrideMoisture] = useState<number | ''>('')
  const [qualityOverrideSulfur, setQualityOverrideSulfur] = useState<number | ''>('')
  const [qualityOverrideAsh, setQualityOverrideAsh] = useState<number | ''>('')
  // Step 3: port charges, fees
  const [loadingRateMtDay, setLoadingRateMtDay] = useState(0)
  const [portDuesPerMt, setPortDuesPerMt] = useState(0)
  const [stevedoringPerMt, setStevedoringPerMt] = useState(0)
  const [wharfagePerMt, setWharfagePerMt] = useState(0)
  const [surveyorFee, setSurveyorFee] = useState(false)
  const [inspectionFee, setInspectionFee] = useState(false)
  const [fumigationFee, setFumigationFee] = useState(false)
  // Step 4: blending
  const [blendingMode, setBlendingMode] = useState<'none' | 'fixed' | 'optimise'>('none')
  const [stockpileCost, setStockpileCost] = useState(0)
  const [blendingFee, setBlendingFee] = useState(0)
  const [maxStorageDays, setMaxStorageDays] = useState(0)
  // Step 6: charter extras
  const [addressCommissionPct, setAddressCommissionPct] = useState(2.5)
  const [brokeragePct, setBrokeragePct] = useState(1.25)
  const [dispatchRate, setDispatchRate] = useState(0)
  const [warRiskPct, setWarRiskPct] = useState(0)
  const [piInsurancePerDay, setPiInsurancePerDay] = useState(0)
  const [hmInsurancePerDay, setHmInsurancePerDay] = useState(0)
  const [canalToll, setCanalToll] = useState<'suez' | 'panama' | 'none'>('none')
  // Step 7: TCE inputs
  const [voyageDistanceNm, setVoyageDistanceNm] = useState(0)
  const [roundtripDays, setRoundtripDays] = useState(0)
  const [ecaZonePct, setEcaZonePct] = useState(0)
  const [vesselSpeed, setVesselSpeed] = useState(0)
  const [vlsfoConsumption, setVlsfoConsumption] = useState(0)
  const [mdoConsumption, setMdoConsumption] = useState(0)
  const [portConsumption, setPortConsumption] = useState(0)
  // Step 8: demurrage, discharge
  const [dischargeRateMtDay, setDischargeRateMtDay] = useState(0)
  const [demurrageRatePerDay, setDemurrageRatePerDay] = useState(0)
  const [demurrageGraceDays, setDemurrageGraceDays] = useState(0)
  const [dispatchDemurrage, setDispatchDemurrage] = useState(0)
  const [expectedDelayDays, setExpectedDelayDays] = useState(0)
  const [dischargePortDues, setDischargePortDues] = useState(0)
  const [dischargeUnloadGrab, setDischargeUnloadGrab] = useState(0)
  const [dischargeCustomsClearance, setDischargeCustomsClearance] = useState(0)

  // Fetch commodities that exist in DB; keep the known DB-backed list if the query returns nothing
  useEffect(() => {
    async function load() {
      const list: { name: string; source: string }[] = []
      const { data: cl } = await supabase.from('commodity_locations').select('commodity_name').not('latitude', 'is', null)
      const names = [...new Set((cl || []).map((r: any) => r.commodity_name).filter(Boolean))]
      for (const n of ['Crude Oil', 'Natural Gas', 'Uranium', 'Iron Ore', 'Copper']) {
        if (names.includes(n)) list.push({ name: n, source: 'commodity_locations' })
      }
      const { count: coalCount } = await supabase.from('coal_mines').select('*', { count: 'exact', head: true }).not('latitude', 'is', null)
      if ((coalCount ?? 0) > 0) list.push({ name: 'Coal', source: 'coal_mines' })
      const { count: goldCount } = await supabase.from('gold_mines').select('*', { count: 'exact', head: true }).not('latitude', 'is', null)
      if ((goldCount ?? 0) > 0) list.push({ name: 'Gold', source: 'gold_mines' })
      const { count: sugarCount } = await supabase.from('sugar_plants').select('*', { count: 'exact', head: true }).not('latitude', 'is', null)
      if ((sugarCount ?? 0) > 0) list.push({ name: 'Sugar', source: 'sugar_plants' })
      for (const n of ['Sugar']) {
        if (names.includes(n) && !list.some(x => x.name === n)) list.push({ name: n, source: 'commodity_locations' })
      }
      setCommodities(list.length > 0 ? list : COMMODITY_SOURCES.map((c) => ({ name: c.name, source: c.source })))
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedCommodity) {
      setQuantityUnit('MT')
      setSelectedApiGravity('any')
      return
    }
    setQuantityUnit(DEFAULT_QUANTITY_UNIT[selectedCommodity] || displaySpecUnit(commoditySpecs[selectedCommodity]?.unit))
    if (selectedCommodity !== 'Crude Oil') setSelectedApiGravity('any')
  }, [selectedCommodity])

  useEffect(() => {
    if (!selectedCommodity) {
      setMarketQuote(null)
      setMarketQuoteLoading(false)
      return
    }
    let cancelled = false
    setMarketQuoteLoading(true)
    fetchCommodityQuote(selectedCommodity, destinationPort?.country)
      .then((quote) => {
        if (!cancelled) setMarketQuote(quote)
      })
      .catch(() => {
        if (!cancelled) setMarketQuote(null)
      })
      .finally(() => {
        if (!cancelled) setMarketQuoteLoading(false)
      })
    return () => { cancelled = true }
  }, [selectedCommodity, destinationPort?.country])

  // Reset region when country changes
  useEffect(() => { setOriginRegion('') }, [originCountry])

  // Fetch assets when commodity + country selected (manual mode)
  useEffect(() => {
    if (sourceMode === 'auto') return
    if (!selectedCommodity || !originCountry) {
      setAssets([])
      setSelectedAsset(null)
      setOriginRegion('')
      return
    }
    async function loadAssets() {
      const list: Asset[] = []
      const src = commodities.find(c => c.name === selectedCommodity)?.source || 'commodity_locations'
      if (src === 'coal_mines' || src === 'gold_mines' || src === 'sugar_plants') {
        const { data } = await supabase.from(src).select('*').eq('country', originCountry).not('latitude', 'is', null)
        for (const r of data || []) {
          const asset = normalizeAsset(r, src)
          if (asset) list.push(asset)
        }
      } else {
        const type = COMMODITY_TYPE_MAP[selectedCommodity] || 'Energy'
        let assetQuery = supabase.from('commodity_locations').select('*')
          .eq('commodity_type', type).eq('commodity_name', selectedCommodity)
          .eq('country', originCountry).not('latitude', 'is', null)
        if (selectedCommodity === 'Crude Oil') {
          assetQuery = applyApiGravityFilter(assetQuery, selectedApiGravity)
        }
        const { data } = await assetQuery
        for (const r of data || []) {
          if (selectedCommodity === 'Crude Oil' && !assetMatchesApiRange(r.api_gravity, selectedApiGravity)) continue
          const asset = normalizeAsset(r, src)
          if (asset) list.push(asset)
        }
      }
      setAssets(list)
      setSelectedAsset(null)
    }
    loadAssets()
  }, [selectedCommodity, originCountry, commodities, selectedApiGravity, sourceMode])

  // Route asset to destination: inland-only when the destination is local
  useEffect(() => {
    if (!selectedAsset) {
      setNearestPort(null)
      return
    }
    if (!destinationPort) {
      setNearestPort(findNearestPort(selectedAsset.latitude, selectedAsset.longitude))
      return
    }
    const route = resolveDeliveryRoute(selectedAsset, destinationPort)
    setNearestPort({ port: route.handoff, distanceKm: route.inlandKm })
    const allowed = INLAND_MODES_BY_COMMODITY[selectedCommodity] || ['truck']
    if (route.inlandOnly && allowed.includes('pipeline')) {
      setInlandMode('pipeline')
    }
  }, [selectedAsset, destinationPort, selectedCommodity])

  // Keep inland mode valid for current commodity (e.g. no pipeline for coal)
  const allowedInlandModes = (INLAND_MODES_BY_COMMODITY[selectedCommodity] || ['truck', 'rail']) as InlandModeOption[]
  useEffect(() => {
    const allowed = INLAND_MODES_BY_COMMODITY[selectedCommodity] || ['truck', 'rail']
    if (selectedCommodity && !allowed.includes(inlandMode as InlandModeOption)) {
      setInlandMode(allowed[0] as 'truck' | 'rail' | 'conveyor' | 'pipeline')
    }
  }, [selectedCommodity, inlandMode])

  // Regions from assets when country selected
  const originRegions = [...new Set(assets.map(a => a.region).filter(Boolean))] as string[]
  const filteredAssets = originRegion ? assets.filter(a => a.region === originRegion) : assets

  // Countries from assets/commodity
  const [originCountries, setOriginCountries] = useState<string[]>([])
  useEffect(() => {
    if (!selectedCommodity) {
      setOriginCountries([])
      return
    }
    async function load() {
      const src = commodities.find(c => c.name === selectedCommodity)?.source
      let countries: string[] = []
      if (src === 'coal_mines') {
        const { data } = await supabase.from('coal_mines').select('country').not('latitude', 'is', null)
        countries = [...new Set((data || []).map((r: any) => r.country))]
      } else if (src === 'gold_mines') {
        const { data } = await supabase.from('gold_mines').select('country').not('latitude', 'is', null)
        countries = [...new Set((data || []).map((r: any) => r.country))]
      } else if (src === 'sugar_plants') {
        const { data } = await supabase.from('sugar_plants').select('country').not('latitude', 'is', null)
        countries = [...new Set((data || []).map((r: any) => r.country))]
      } else {
        const type = COMMODITY_TYPE_MAP[selectedCommodity] || 'Energy'
        let countryQuery = supabase.from('commodity_locations').select('country')
          .eq('commodity_type', type).eq('commodity_name', selectedCommodity)
        if (selectedCommodity === 'Crude Oil') {
          countryQuery = applyApiGravityFilter(countryQuery, selectedApiGravity)
        }
        const { data } = await countryQuery
        countries = [...new Set((data || []).map((r: any) => r.country))]
      }
      setOriginCountries(countries.sort())
    }
    load()
  }, [selectedCommodity, commodities, selectedApiGravity])

  const spec = selectedCommodity ? commoditySpecs[selectedCommodity] : null

  // Default loading/discharge rates when commodity changes
  useEffect(() => {
    if (spec) {
      setLoadingRateMtDay(spec.loadingRateMtHr * 24)
      setDischargeRateMtDay(spec.dischargeRateMtHr * 24)
    }
  }, [selectedCommodity])
  const vesselConfig = vesselClass ? vesselClasses[vesselClass] : null
  const parcelOptions = spec?.parcels || []
  const availableVessels = spec ? Object.keys(vesselClasses).filter(v => vesselClasses[v].commodities.includes(selectedCommodity)) : []

  // Cost calculation
  useEffect(() => {
    if (!selectedAsset || !nearestPort || !destinationPort || volume <= 0) {
      setCostBreakdown(null)
      return
    }
    const inlandDelivery = isInlandOnlySeaLeg(nearestPort.port, destinationPort)
    if (!inlandDelivery && !vesselClass) {
      setCostBreakdown(null)
      return
    }
    const specVolume = volumeToSpecUnits(selectedCommodity, volume, quantityUnit)
    if (specVolume <= 0) {
      setCostBreakdown(null)
      return
    }
    const modeled = computeModeledCost({
      selectedCommodity,
      volume: specVolume,
      nearestPort,
      destinationPort,
      vesselClass,
      inlandMode,
      loadingRateMtDay,
      dischargeRateMtDay,
      portDuesPerMt,
      stevedoringPerMt,
      wharfagePerMt,
      surveyorFee,
      inspectionFee,
      fumigationFee,
      marineInsurancePct,
      contingencyPct,
      latePenaltyPerDay,
      expectedDelayDays,
      blendingMode,
      stockpileCost,
      blendingFee,
      maxStorageDays,
      dischargePortDues,
      dischargeUnloadGrab,
      dischargeCustomsClearance,
      canalToll,
      ...marketCostParams(marketQuote, quantityUnit, volume),
    })
    if (!modeled) return
    setCostBreakdown(modeled)
  }, [selectedAsset, nearestPort, destinationPort, vesselClass, volume, quantityUnit, inlandMode, loadingRateMtDay, dischargeRateMtDay, portDuesPerMt, stevedoringPerMt, wharfagePerMt, surveyorFee, inspectionFee, fumigationFee, marineInsurancePct, contingencyPct, latePenaltyPerDay, expectedDelayDays, blendingMode, stockpileCost, blendingFee, maxStorageDays, dischargePortDues, dischargeUnloadGrab, dischargeCustomsClearance, canalToll, selectedCommodity, marketQuote])

  // Automatic source ranking against the selected destination
  useEffect(() => {
    if (sourceMode !== 'auto') {
      setRankedLowestCost([])
      setRankedFlow([])
      setAutoLoading(false)
      return
    }
    if (!selectedCommodity || !destinationPort || volume <= 0) {
      setRankedLowestCost([])
      setRankedFlow([])
      return
    }
    const vesselName = defaultVesselFor(selectedCommodity)
    if (!vesselName) {
      setRankedLowestCost([])
      setRankedFlow([])
      return
    }
    const destPort = destinationPort
    const commodityName = selectedCommodity
    let cancelled = false
    setRankedLowestCost([])
    setRankedFlow([])
    async function load() {
      setAutoLoading(true)
      try {
        const src = commodities.find(c => c.name === commodityName)?.source || 'commodity_locations'
        const seen = new Set<string>()
        const list: Asset[] = []
        const addRows = (rows: any[] | null) => {
          for (const r of rows || []) {
            if (commodityName === 'Crude Oil' && !assetMatchesApiRange(r.api_gravity, selectedApiGravity)) continue
            const asset = normalizeAsset(r, src)
            if (!asset || seen.has(asset.id)) continue
            seen.add(asset.id)
            list.push(asset)
          }
        }
        if (src === 'coal_mines' || src === 'gold_mines' || src === 'sugar_plants') {
          const { data } = await supabase.from(src).select('*').not('latitude', 'is', null).limit(1000)
          addRows(data)
          for (const country of countryQueryValues(destPort.country)) {
            const { data: local } = await supabase.from(src).select('*').eq('country', country).not('latitude', 'is', null).limit(1000)
            addRows(local)
          }
        } else {
          const type = COMMODITY_TYPE_MAP[commodityName] || 'Energy'
          const base = () => {
            let q = supabase.from('commodity_locations').select('*')
              .eq('commodity_type', type).eq('commodity_name', commodityName)
              .not('latitude', 'is', null)
            if (commodityName === 'Crude Oil') q = applyApiGravityFilter(q, selectedApiGravity)
            return q
          }
          const { data } = await base().limit(1000)
          addRows(data)
          for (const country of countryQueryValues(destPort.country)) {
            const { data: local } = await base().eq('country', country).limit(1000)
            addRows(local)
          }
        }
        if (cancelled) return
        const ranked = rankEligibleSources(list, {
          selectedCommodity: commodityName,
          volume: volumeToSpecUnits(commodityName, volume, quantityUnit),
          destinationPort: destPort,
          vesselClass: vesselName,
          inlandMode: defaultInlandModeFor(commodityName),
          loadingRateMtDay,
          dischargeRateMtDay,
          portDuesPerMt,
          stevedoringPerMt,
          wharfagePerMt,
          surveyorFee,
          inspectionFee,
          fumigationFee,
          marineInsurancePct,
          contingencyPct,
          latePenaltyPerDay,
          expectedDelayDays,
          blendingMode,
          stockpileCost,
          blendingFee,
          maxStorageDays,
          dischargePortDues,
          dischargeUnloadGrab,
          dischargeCustomsClearance,
          canalToll,
          deadline: requiredDeliveryDeadline(laycanStart, laycanEnd),
          ...marketCostParams(marketQuote, quantityUnit, volume),
        })
        if (cancelled) return
        setRankedLowestCost(ranked.lowestCost)
        setRankedFlow(ranked.flow)
      } catch (err) {
        console.error(err)
        if (!cancelled) {
          setRankedLowestCost([])
          setRankedFlow([])
        }
      } finally {
        if (!cancelled) setAutoLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [
    sourceMode, selectedCommodity, selectedApiGravity, destinationPort, volume, quantityUnit, commodities,
    loadingRateMtDay, dischargeRateMtDay, portDuesPerMt, stevedoringPerMt, wharfagePerMt,
    surveyorFee, inspectionFee, fumigationFee, marineInsurancePct, contingencyPct,
    latePenaltyPerDay, expectedDelayDays, blendingMode, stockpileCost, blendingFee,
    maxStorageDays, dischargePortDues, dischargeUnloadGrab, dischargeCustomsClearance,
    canalToll, laycanStart, laycanEnd, marketQuote,
  ])

  const inlandOnly = !!(nearestPort && destinationPort && isInlandOnlySeaLeg(nearestPort.port, destinationPort))

  const handleNext = () => {
    if (inlandOnly && step >= 5) {
      setShowMap(true)
      setMapFullScreen(true)
      return
    }
    if (step < STEPS) setStep(step + 1)
    else {
      setShowMap(true)
      setMapFullScreen(true)
    }
  }
  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }
  const reset = () => {
    setStep(1)
    setSelectedCommodity('')
    setOriginCountry('')
    setSelectedAsset(null)
    setNearestPort(null)
    setVolume(0)
    setQuantityUnit('MT')
    setShowAdvanced(false)
    setSourceMode('manual')
    setSelectedApiGravity('any')
    setRankedLowestCost([])
    setRankedFlow([])
    setAutoRankTab('cost')
    setVesselClass('')
    setDestinationPort(null)
    setCostBreakdown(null)
    setShowMap(false)
    setMapFullScreen(false)
  }

  const canProceedStep1 = !!selectedCommodity && volume > 0
  const canProceedStep2 = !!destinationPort
  const canProceedStep3 = !!selectedAsset && (sourceMode === 'auto' || !!originCountry)
  const canProceedStep4 = true
  const canProceedStep5 = true
  const canProceedStep6 = inlandOnly || !!vesselClass
  const canProceedStep7 = true
  const canProceedStep8 = true

  const routes: ShippingRoute[] = []
  if (selectedAsset && nearestPort && destinationPort) {
    routes.push({
      id: 'inland',
      name: inlandOnly ? 'Asset → Destination' : 'Asset → Port',
      startLat: selectedAsset.latitude,
      startLng: selectedAsset.longitude,
      endLat: inlandOnly ? destinationPort.lat : nearestPort.port.lat,
      endLng: inlandOnly ? destinationPort.lng : nearestPort.port.lng,
      color: '#F59E0B',
      waypoints: [],
    })
    if (!inlandOnly) {
      routes.push({
        id: 'sea',
        name: `${nearestPort.port.name} → ${destinationPort.name}`,
        startLat: nearestPort.port.lat,
        startLng: nearestPort.port.lng,
        endLat: destinationPort.lat,
        endLng: destinationPort.lng,
        color: '#3B82F6',
        waypoints: generateSeaWaypoints(nearestPort.port.lat, nearestPort.port.lng, destinationPort.lat, destinationPort.lng),
      })
    }
  }

  const markers = selectedAsset ? [{
    id: selectedAsset.id,
    title: selectedAsset.title,
    latitude: selectedAsset.latitude,
    longitude: selectedAsset.longitude,
    commodity_type: selectedCommodity === 'Coal' || selectedCommodity === 'Crude Oil' || selectedCommodity === 'Natural Gas' ? 'Energy' : 'Metals',
    commodity_name: selectedCommodity,
    owner: selectedAsset.operator || '',
    address: selectedAsset.region || selectedAsset.country || '',
    country: selectedAsset.country,
  }] : []

  const commodityLineDetail = costBreakdown?.commodityPrice
    ? `$${Number(costBreakdown.commodityPrice).toFixed(2)}/${costBreakdown.commodityPriceUnit || 'unit'} × ${Number(costBreakdown.commodityQty || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} ${costBreakdown.commodityPriceUnit || ''}${costBreakdown.commodityPriceDate ? ` · ${costBreakdown.commodityPriceDate}` : ''}`
    : marketQuoteLoading
      ? 'Fetching market price…'
      : 'Market price unavailable'

  const costItems = costBreakdown ? [
    {
      label: costBreakdown.commodityPriceLabel ? `${selectedCommodity} (${costBreakdown.commodityPriceLabel})` : selectedCommodity || 'Commodity',
      value: costBreakdown.commodityCost ?? 0,
      detail: commodityLineDetail,
      always: true,
    },
    {
      label: 'Inland',
      value: costBreakdown.inlandCost,
      detail: costBreakdown.inlandDist != null ? `${Number(costBreakdown.inlandDist).toFixed(0)} km · ${costBreakdown.inlandMode}` : undefined,
      always: true,
    },
    ...(!costBreakdown.inlandOnly ? [
      { label: 'Port', value: costBreakdown.port, always: false },
      { label: 'Bunker', value: costBreakdown.bunker, always: false },
      { label: 'Freight', value: costBreakdown.freight, always: false },
      { label: 'Discharge', value: costBreakdown.dischargePortCost ?? 0, always: false },
      { label: 'Canal', value: costBreakdown.canal, always: false },
    ] : []),
    { label: 'Insurance', value: costBreakdown.marineIns ?? 0, always: true },
    { label: 'Late risk', value: costBreakdown.lateRisk ?? 0, always: false },
    { label: 'Blending', value: costBreakdown.blendingTotal ?? 0, always: false },
    { label: 'Contingency', value: costBreakdown.contingency ?? 0, always: true },
  ].filter((i) => i.always || i.value > 0) : []

  const costLines = (
    <div className="space-y-2 text-sm">
      {costItems.map(({ label, value, detail }) => (
        <div key={label}>
          <div className="flex justify-between gap-3">
            <span className="text-gray-500">{label}</span>
            <span className="text-black font-medium">{formatUsd(value)}</span>
          </div>
          {detail && <div className="text-[11px] text-gray-400 mt-0.5">{detail}</div>}
        </div>
      ))}
    </div>
  )

  const costTotals = costBreakdown ? (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <div className="text-xs text-gray-500 mb-1">Delivered cost / {costBreakdown.unitLabel}</div>
      <div className="text-2xl font-bold text-black">${Number(costBreakdown.unitCost).toFixed(2)}</div>
      <div className="text-sm text-black font-medium mt-2">
        Total transaction cost {formatUsd(costBreakdown.totalCost)}
      </div>
      <div className="text-xs text-gray-500 mt-0.5">{formatUsdFull(costBreakdown.totalCost)} estimated</div>
      {costBreakdown.commodityPrice ? (
        <div className="text-xs text-gray-400 mt-2">
          Includes commodity at market price ({costBreakdown.commodityPriceLabel || 'FRED'})
        </div>
      ) : marketQuoteLoading ? (
        <div className="text-xs text-gray-400 mt-2">Waiting for market price…</div>
      ) : null}
    </div>
  ) : null

  const inlandRatePerKm =
    inlandMode === 'truck' ? INLAND_COST_PER_KM_Truck
    : inlandMode === 'rail' ? INLAND_COST_PER_KM_Rail
    : inlandMode === 'conveyor' ? INLAND_COST_PER_KM_Conveyor
    : INLAND_COST_PER_KM_Pipeline

  const costBuildUpCard = (
    <FormCard title="Cost build-up">
      {costBreakdown ? (
        <div>
          {costLines}
          {costTotals}
          {costBreakdown.totalDays > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <KpiPanel label="ETA" value={`${costBreakdown.totalDays.toFixed(0)} days`} />
              {costBreakdown.seaDistNm > 0 && (
                <KpiPanel label="Sea distance" value={`${costBreakdown.seaDistNm.toFixed(0)} nm`} />
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">
          {inlandOnly
            ? 'Complete origin, destination and volume to see the inland cost breakdown.'
            : 'Complete origin, destination, vessel and volume to see cost breakdown.'}
        </p>
      )}
    </FormCard>
  )

  const calculatedInfoCard = (selectedCommodity || destinationPort || nearestPort) ? (
    <FormCard title="Route">
      <div className="space-y-3">
        {selectedCommodity && (
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Commodity</div>
            <div className="text-base font-bold text-black">{selectedCommodity}</div>
          </div>
        )}
        {destinationPort && (
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Destination</div>
            <div className="text-base font-bold text-black">{destinationPort.name}, {destinationPort.country}</div>
          </div>
        )}
        {selectedAsset && (
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Production asset</div>
            <div className="text-base font-bold text-black">{selectedAsset.title}</div>
          </div>
        )}
        {nearestPort && selectedAsset && (
          <div className="grid grid-cols-1 gap-3 pt-1">
            <KpiPanel
              label={inlandOnly ? 'Inland delivery to' : 'Recommended export port'}
              value={`${nearestPort.port.name}, ${nearestPort.port.country}`}
            />
            <KpiPanel
              label="Distance"
              value={`${nearestPort.distanceKm.toFixed(0)} km`}
            />
            <KpiPanel
              label="Estimated inland cost"
              value={`$${(nearestPort.distanceKm * inlandRatePerKm).toFixed(2)} / MT`}
              hint={`Estimated · ${nearestPort.distanceKm.toFixed(0)} km · ${inlandMode}`}
            />
          </div>
        )}
      </div>
    </FormCard>
  ) : null

  return (
    <div className={showMap && mapFullScreen ? 'h-[calc(100vh-73px)] flex flex-col overflow-hidden bg-gray-50' : 'bg-gray-50'}>
      {!showMap ? (
        <div className="max-w-7xl mx-auto px-8 py-8 pb-16 space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-black">Physical Delivery Modeling</h2>
            <p className="text-gray-600 mt-1">Model the full delivered cost from production asset to destination</p>
          </div>

          <StepNav step={step} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6 min-w-0">

          {/* Step 1: Commodity */}
          {step === 1 && (
            <FormCard title="Commodity">
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Commodity</label>
                  <select
                    value={selectedCommodity}
                    onChange={(e) => { setSelectedCommodity(e.target.value); setOriginCountry(''); setSelectedAsset(null) }}
                    className={inputClass}
                  >
                    <option value="">Select...</option>
                    {commodities.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  {spec && (
                    <p className="mt-1.5 text-xs text-gray-500">
                      Source: database · Unit: {quantityUnit || displaySpecUnit(spec.unit)}{spec.vesselTypes?.length ? ` · Compatible vessels: ${spec.vesselTypes.join(', ')}` : ''}
                    </p>
                  )}
                </div>
                {selectedCommodity === 'Crude Oil' && (
                  <div>
                    <label className={labelClass}>API Gravity</label>
                    <select
                      value={selectedApiGravity}
                      onChange={(e) => setSelectedApiGravity(e.target.value)}
                      className={inputClass}
                    >
                      {API_GRAVITY_RANGES.map((r) => (
                        <option key={r.id} value={r.id}>{r.label}</option>
                      ))}
                    </select>
                    <p className="mt-1.5 text-xs text-gray-500">Filters available production assets by API gravity</p>
                  </div>
                )}
                <div>
                  <label className={labelClass}>Quantity</label>
                  <div className="flex gap-2 items-stretch">
                    <input
                      type="number"
                      min={0}
                      value={volume || ''}
                      onChange={(e) => setVolume(Number(e.target.value) || 0)}
                      placeholder="Quantity"
                      className={`${inputClass} min-w-0 flex-1`}
                    />
                    <select
                      value={quantityUnit}
                      onChange={(e) => setQuantityUnit(e.target.value)}
                      className={unitSelectClass}
                    >
                      {unitOptionsFor(selectedCommodity).map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                  {marketQuote && (
                    <p className="mt-1.5 text-xs text-gray-500">
                      Market {marketQuote.label}: ${marketQuote.price.toFixed(2)}/{marketQuote.unit}
                      {marketQuote.date ? ` · ${marketQuote.date}` : ''}
                      {volume > 0 ? ` · commodity ${formatUsd(marketQuote.price * commodityQtyForQuote(selectedCommodity, volumeToSpecUnits(selectedCommodity, volume, quantityUnit), marketQuote.unit))}` : ''}
                    </p>
                  )}
                  {selectedCommodity && !marketQuote && !marketQuoteLoading && (
                    <p className="mt-1.5 text-xs text-gray-500">Market price unavailable for this commodity</p>
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-black"
                  >
                    Advanced assumptions
                    <ChevronDown size={16} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                  </button>
                  {showAdvanced && (
                    <div className="mt-3 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Incoterms</label>
                          <select value={incoterm} onChange={(e) => setIncoterm(e.target.value)} className={inputClass}>
                            {INCOTERMS.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Currency</label>
                          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass}>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Marine insurance %</label>
                          <input type="number" step={0.05} value={marineInsurancePct} onChange={(e) => setMarineInsurancePct(Number(e.target.value))} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Contingency buffer %</label>
                          <input type="number" step={0.5} value={contingencyPct} onChange={(e) => setContingencyPct(Number(e.target.value))} className={inputClass} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <StepActions onNext={handleNext} nextDisabled={!canProceedStep1} showBack={false} />
            </FormCard>
          )}

          {/* Step 2: Destination */}
          {step === 2 && (
            <FormCard title="Destination">
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Destination port</label>
                  <select
                    value={destinationPort ? `${destinationPort.name}-${destinationPort.country}` : ''}
                    onChange={(e) => {
                      const v = e.target.value
                      const p = majorPorts.find(x => `${x.name}-${x.country}` === v)
                      setDestinationPort(p || null)
                    }}
                    className={inputClass}
                  >
                    <option value="">Select...</option>
                    {majorPorts.filter(p => !nearestPort || p.name !== nearestPort.port.name).map((p) => (
                      <option key={`${p.name}-${p.country}`} value={`${p.name}-${p.country}`}>{p.name}, {p.country}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1.5">Required delivery</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">From</label>
                      <input type="date" value={laycanStart} onChange={(e) => setLaycanStart(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">To</label>
                      <input type="date" value={laycanEnd} onChange={(e) => setLaycanEnd(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Discharge rate (MT/day)</label>
                  <input type="number" value={dischargeRateMtDay || ''} onChange={(e) => setDischargeRateMtDay(Number(e.target.value))} placeholder="Default from commodity" className={inputClass} />
                </div>
                <div className="text-sm font-medium text-gray-700">Demurrage terms</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="number" placeholder="Rate $/day" value={demurrageRatePerDay || ''} onChange={(e) => setDemurrageRatePerDay(Number(e.target.value))} className={inputClass} />
                  <input type="number" placeholder="Grace period days" value={demurrageGraceDays || ''} onChange={(e) => setDemurrageGraceDays(Number(e.target.value))} className={inputClass} />
                  <input type="number" placeholder="Dispatch rate" value={dispatchDemurrage || ''} onChange={(e) => setDispatchDemurrage(Number(e.target.value))} className={inputClass} />
                </div>
                <div className="text-sm font-medium text-gray-700">Late delivery</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="number" placeholder="Penalty $/day" value={latePenaltyPerDay || ''} onChange={(e) => setLatePenaltyPerDay(Number(e.target.value))} className={inputClass} />
                  <input type="number" placeholder="Expected delay risk (days)" value={expectedDelayDays || ''} onChange={(e) => setExpectedDelayDays(Number(e.target.value))} className={inputClass} />
                </div>
                <div className="text-sm font-medium text-gray-700">Discharge port charges ($/MT)</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input type="number" placeholder="Port dues" value={dischargePortDues || ''} onChange={(e) => setDischargePortDues(Number(e.target.value))} className={inputClass} />
                  <input type="number" placeholder="Unload/grab" value={dischargeUnloadGrab || ''} onChange={(e) => setDischargeUnloadGrab(Number(e.target.value))} className={inputClass} />
                  <input type="number" placeholder="Customs & clearance" value={dischargeCustomsClearance || ''} onChange={(e) => setDischargeCustomsClearance(Number(e.target.value))} className={inputClass} />
                </div>
              </div>
              <StepActions onBack={handleBack} onNext={handleNext} nextDisabled={!canProceedStep2} />
            </FormCard>
          )}

          {/* Step 3: Sources */}
          {step === 3 && (
            <FormCard title="Sources">
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>How would you like to select the source?</label>
                  <div className="space-y-2">
                    <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer ${sourceMode === 'auto' ? 'border-black bg-gray-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="radio" name="sourceMode" className="mt-1" checked={sourceMode === 'auto'} onChange={() => setSourceMode('auto')} />
                      <div>
                        <div className="text-sm font-medium text-black">Find the best sources automatically</div>
                        <div className="text-xs text-gray-500">Compare eligible production assets by delivered cost</div>
                      </div>
                    </label>
                    <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer ${sourceMode === 'manual' ? 'border-black bg-gray-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="radio" name="sourceMode" className="mt-1" checked={sourceMode === 'manual'} onChange={() => setSourceMode('manual')} />
                      <div>
                        <div className="text-sm font-medium text-black">Select manually</div>
                        <div className="text-xs text-gray-500">Choose a specific country, region and production asset</div>
                      </div>
                    </label>
                  </div>
                </div>

                {sourceMode === 'auto' && (
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-black">Best sources</div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Ranked to {destinationPort ? `${destinationPort.name}, ${destinationPort.country}` : 'the selected destination'} using estimated / modelled inland and freight costs.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {([
                        { id: 'cost' as const, label: 'Lowest Cost' },
                        { id: 'flow' as const, label: 'Flow' },
                      ]).map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setAutoRankTab(tab.id)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${autoRankTab === tab.id ? 'border-black bg-gray-50 text-black' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                    {autoLoading && <p className="text-sm text-gray-500">Comparing eligible production assets…</p>}
                    {!autoLoading && (autoRankTab === 'cost' ? rankedLowestCost : rankedFlow).length === 0 && (
                      <p className="text-sm text-gray-500">No eligible production assets found for this commodity, specification and destination.</p>
                    )}
                    {!autoLoading && (autoRankTab === 'cost' ? rankedLowestCost : rankedFlow).length > 0 && (
                      <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="min-w-full text-xs">
                          <thead className="bg-gray-50 text-gray-500">
                            <tr>
                              <th className="text-left font-medium px-3 py-2">Rank</th>
                              <th className="text-left font-medium px-3 py-2">Source</th>
                              <th className="text-left font-medium px-3 py-2">Country</th>
                              <th className="text-left font-medium px-3 py-2">Export Port</th>
                              <th className="text-left font-medium px-3 py-2">Inland</th>
                              {autoRankTab === 'cost' && <th className="text-left font-medium px-3 py-2">Freight</th>}
                              {autoRankTab === 'cost' && <th className="text-left font-medium px-3 py-2">Delivered</th>}
                              <th className="text-left font-medium px-3 py-2">Transit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(autoRankTab === 'cost' ? rankedLowestCost : rankedFlow).map((row, i) => {
                              const selected = selectedAsset?.id === row.asset.id
                              const statusLabel = row.status === 'insufficient' ? 'Insufficient data' : row.status === 'risk' ? 'Delivery risk' : 'Meets delivery'
                              return (
                                <tr
                                  key={row.asset.id}
                                  onClick={() => {
                                    if (!Number.isFinite(row.asset.latitude) || !Number.isFinite(row.asset.longitude)) return
                                    setSelectedAsset(row.asset)
                                    if (row.asset.country) setOriginCountry(row.asset.country)
                                    setOriginRegion(row.asset.region || '')
                                    if (row.inlandOnly && (INLAND_MODES_BY_COMMODITY[selectedCommodity] || []).includes('pipeline')) {
                                      setInlandMode('pipeline')
                                    }
                                  }}
                                  className={`cursor-pointer border-t border-gray-100 ${selected ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                                >
                                  <td className="px-3 py-2 align-top font-medium text-black">{i + 1}</td>
                                  <td className="px-3 py-2 align-top">
                                    <div className="font-medium text-black">{row.asset.title}</div>
                                    <div className="text-gray-500">{row.asset.region || '—'}</div>
                                    <div className="text-gray-500">{row.rankReason}</div>
                                    <div className="text-gray-500">{statusLabel}</div>
                                  </td>
                                  <td className="px-3 py-2 align-top text-black">{row.asset.country || '—'}</td>
                                  <td className="px-3 py-2 align-top text-black">{row.exportPort ? row.exportPort.name : '—'}</td>
                                  <td className="px-3 py-2 align-top text-black">
                                    {row.inlandCostPerMt == null ? '—' : `$${row.inlandCostPerMt.toFixed(2)}/MT`}
                                    <div className="text-gray-500">
                                      {row.inlandDistanceKm != null ? `${row.inlandDistanceKm.toFixed(0)} km · ${row.inlandMode}` : 'Insufficient data'}
                                    </div>
                                  </td>
                                  {autoRankTab === 'cost' && (
                                    <td className="px-3 py-2 align-top text-black">
                                      {row.inlandOnly ? '$0.00/MT' : row.freightCostPerMt == null ? '—' : `$${row.freightCostPerMt.toFixed(2)}/MT`}
                                      <div className="text-gray-500">{row.inlandOnly ? 'Inland' : 'Estimated'}</div>
                                    </td>
                                  )}
                                  {autoRankTab === 'cost' && (
                                    <td className="px-3 py-2 align-top text-black">
                                      {row.deliveredCostPerMt == null ? '—' : `$${row.deliveredCostPerMt.toFixed(2)}/${row.unitLabel === 'bbls' ? 'bbl' : row.unitLabel}`}
                                      <div className="text-gray-500">Estimated</div>
                                    </td>
                                  )}
                                  <td className="px-3 py-2 align-top text-black">
                                    {row.transitDays == null ? '—' : `${row.transitDays.toFixed(0)} days`}
                                    <div className="text-gray-500">Estimated</div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {sourceMode === 'manual' && (
                  <>
                <div>
                  <label className={labelClass}>Country</label>
                  <select
                    value={originCountry}
                    onChange={(e) => { setOriginCountry(e.target.value); setSelectedAsset(null) }}
                    className={inputClass}
                  >
                    <option value="">Select...</option>
                    {originCountries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                {originRegions.length > 0 && (
                  <div>
                    <label className={labelClass}>Region</label>
                    <select
                      value={originRegion}
                      onChange={(e) => { setOriginRegion(e.target.value); setSelectedAsset(null) }}
                      className={inputClass}
                    >
                      <option value="">All regions</option>
                      {originRegions.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                )}
                {originCountry && (
                  <div>
                    <label className={labelClass}>Production asset</label>
                    <select
                      value={selectedAsset?.id || ''}
                      onChange={(e) => {
                        const a = filteredAssets.find(x => x.id === e.target.value)
                        setSelectedAsset(a || null)
                      }}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      {filteredAssets.map((a) => (
                        <option key={a.id} value={a.id}>{a.title} {a.region ? `(${a.region})` : ''}</option>
                      ))}
                    </select>
                    {selectedAsset && (
                      <div className="mt-3 space-y-3">
                        <div className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 space-y-3">
                          <div>
                            <div className="text-xs text-gray-500 mb-0.5">Production asset</div>
                            <div className="text-base font-bold text-black">{selectedAsset.title}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-0.5">Operator</div>
                            <div className="text-base font-bold text-black">{selectedAsset.operator || '—'}</div>
                          </div>
                        </div>
                        {selectedCommodity === 'Crude Oil' ? (
                          <div className="grid grid-cols-2 gap-3">
                            <KpiPanel
                              label="API Gravity"
                              value={selectedAsset.api_gravity != null && selectedAsset.api_gravity !== '' ? `${selectedAsset.api_gravity}°` : '—'}
                            />
                            <KpiPanel
                              label="Sulfur %"
                              value={selectedAsset.sulfur_content != null && selectedAsset.sulfur_content !== '' ? String(selectedAsset.sulfur_content) : '—'}
                            />
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-2 gap-3">
                              {selectedAsset.grade && <KpiPanel label="Grade" value={String(selectedAsset.grade)} />}
                              {(selectedAsset.calorific_value_kcal_kg != null) && (
                                <KpiPanel label="Calorific value" value={`${selectedAsset.calorific_value_kcal_kg} kcal/kg`} />
                              )}
                              {selectedAsset.production_capacity && (
                                <KpiPanel label="Capacity" value={`${Number(selectedAsset.production_capacity).toLocaleString()}/yr`} />
                              )}
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1.5">Quality overrides (optional)</div>
                              <div className="grid grid-cols-2 gap-3">
                                <input type="number" placeholder="Calorific" value={qualityOverrideCal} onChange={(e) => setQualityOverrideCal(e.target.value ? Number(e.target.value) : '')} className={inputClass} />
                                <input type="number" placeholder="Moisture %" value={qualityOverrideMoisture} onChange={(e) => setQualityOverrideMoisture(e.target.value ? Number(e.target.value) : '')} className={inputClass} />
                                <input type="number" placeholder="Sulfur %" value={qualityOverrideSulfur} onChange={(e) => setQualityOverrideSulfur(e.target.value ? Number(e.target.value) : '')} className={inputClass} />
                                <input type="number" placeholder="Ash %" value={qualityOverrideAsh} onChange={(e) => setQualityOverrideAsh(e.target.value ? Number(e.target.value) : '')} className={inputClass} />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
                  </>
                )}
              </div>
              <StepActions
                onBack={handleBack}
                onNext={handleNext}
                nextDisabled={!canProceedStep3}
                nextLabel="Use this source"
              />
            </FormCard>
          )}

          {/* Step 4: Nearest port + inland */}
          {step === 4 && selectedAsset && nearestPort && (
            <FormCard title="Inland">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                <KpiPanel label={inlandOnly ? 'Inland delivery to' : 'Recommended export port'} value={`${nearestPort.port.name}, ${nearestPort.port.country}`} />
                <KpiPanel label="Distance" value={`${nearestPort.distanceKm.toFixed(0)} km`} hint={selectedAsset.title} />
                <KpiPanel label="Estimated inland cost" value={`$${(nearestPort.distanceKm * inlandRatePerKm).toFixed(2)} / MT`} hint={`Estimated · ${nearestPort.distanceKm.toFixed(0)} km · ${inlandMode}`} />
              </div>
              {inlandOnly && (
                <p className="text-sm text-gray-500 mb-4">Inland delivery · no vessel, bunker, or ocean freight.</p>
              )}
              <div className="mb-4">
                <label className={labelClass}>Inland transport mode</label>
                <select value={inlandMode} onChange={(e) => setInlandMode(e.target.value as any)} className={inputClass}>
                  {allowedInlandModes.includes('truck') && <option value="truck">Truck</option>}
                  {allowedInlandModes.includes('rail') && <option value="rail">Rail</option>}
                  {allowedInlandModes.includes('conveyor') && <option value="conveyor">Conveyor</option>}
                  {allowedInlandModes.includes('pipeline') && <option value="pipeline">Pipeline</option>}
                </select>
              </div>
              {!inlandOnly && (
              <div className="space-y-3 mb-4">
                <div className="text-sm font-medium text-gray-700">Port charges ($/MT)</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="number" placeholder="Loading rate MT/day" value={loadingRateMtDay || ''} onChange={(e) => setLoadingRateMtDay(Number(e.target.value) || 0)} className={inputClass} />
                  <input type="number" placeholder="Port dues" value={portDuesPerMt || ''} onChange={(e) => setPortDuesPerMt(Number(e.target.value) || 0)} className={inputClass} />
                  <input type="number" placeholder="Stevedoring" value={stevedoringPerMt || ''} onChange={(e) => setStevedoringPerMt(Number(e.target.value) || 0)} className={inputClass} />
                  <input type="number" placeholder="Wharfage" value={wharfagePerMt || ''} onChange={(e) => setWharfagePerMt(Number(e.target.value) || 0)} className={inputClass} />
                </div>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={surveyorFee} onChange={(e) => setSurveyorFee(e.target.checked)} className="rounded border-gray-300" />
                    <span>Surveyor</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={inspectionFee} onChange={(e) => setInspectionFee(e.target.checked)} className="rounded border-gray-300" />
                    <span>Inspection</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={fumigationFee} onChange={(e) => setFumigationFee(e.target.checked)} className="rounded border-gray-300" />
                    <span>Fumigation</span>
                  </label>
                </div>
              </div>
              )}
              <StepActions onBack={handleBack} onNext={handleNext} />
            </FormCard>
          )}
          {step === 4 && !(selectedAsset && nearestPort) && (
            <FormCard title="Inland">
              <p className="text-sm text-gray-500">Select a production asset to calculate inland routing to the recommended export port.</p>
              <StepActions onBack={handleBack} onNext={handleNext} />
            </FormCard>
          )}

          {/* Step 5: Blending */}
          {step === 5 && (
            <FormCard title="Blending">
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Blending mode</label>
                  <div className="space-y-2">
                    {(['none', 'fixed', 'optimise'] as const).map((m) => (
                      <label key={m} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${blendingMode === m ? 'border-black bg-gray-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <input type="radio" name="blend" checked={blendingMode === m} onChange={() => setBlendingMode(m)} />
                        <span className="text-sm text-black">{m === 'none' ? 'No blending' : m === 'fixed' ? 'Fixed ratio' : 'Optimise to spec'}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {blendingMode !== 'none' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Stockpile cost ($)</label>
                      <input type="number" value={stockpileCost || ''} onChange={(e) => setStockpileCost(Number(e.target.value) || 0)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Blending fee ($)</label>
                      <input type="number" value={blendingFee || ''} onChange={(e) => setBlendingFee(Number(e.target.value) || 0)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Max storage days</label>
                      <input type="number" value={maxStorageDays || ''} onChange={(e) => setMaxStorageDays(Number(e.target.value) || 0)} className={inputClass} />
                    </div>
                  </div>
                )}
              </div>
              <StepActions
                onBack={handleBack}
                onNext={handleNext}
                nextLabel={inlandOnly ? 'View on map' : 'Continue'}
              />
            </FormCard>
          )}

          {/* Step 6: Vessel */}
          {step === 6 && inlandOnly && (
            <FormCard title="Vessel">
              <p className="text-sm text-gray-500">Inland delivery · vessel and ocean freight are not required.</p>
              <StepActions onBack={handleBack} onNext={handleNext} nextLabel="View on map" />
            </FormCard>
          )}
          {step === 6 && spec && !inlandOnly && (
            <FormCard title="Vessel">
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Vessel class</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableVessels.map((v) => {
                      const vc = vesselClasses[v]
                      const baltic = balticRoutes.find(b => b.vesselClass === v)
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setVesselClass(v)}
                          className={`p-4 rounded-xl border text-left transition ${vesselClass === v ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                        >
                          <div className="font-medium text-black">{v}</div>
                          <div className="text-sm text-gray-500">{vc.dwtMin.toLocaleString()}-{vc.dwtMax.toLocaleString()} DWT</div>
                          {baltic && <div className="text-xs text-gray-500 mt-1">~${baltic.avg30dUsdPerMt}/MT (30d avg)</div>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
              <StepActions onBack={handleBack} onNext={handleNext} nextDisabled={!canProceedStep6} />
            </FormCard>
          )}

          {/* Step 7: Charter type */}
          {step === 7 && !inlandOnly && (
            <FormCard title="Charter">
              <div className="space-y-2 mb-4">
                {(['voyage', 'time', 'bareboat'] as CharterType[]).map((t) => (
                  <label key={t} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${charterType === t ? 'border-black bg-gray-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="charter" checked={charterType === t} onChange={() => setCharterType(t)} />
                    <div>
                      <span className="capitalize font-medium text-black text-sm">{t} charter</span>
                      <div className="text-xs text-gray-500">
                        {t === 'voyage' && '— $/ton or lumpsum + port costs'}
                        {t === 'time' && '— $/day hire + bunker'}
                        {t === 'bareboat' && '— $/day + crew/insurance'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className={labelClass}>Address commission %</label>
                  <input type="number" step={0.25} value={addressCommissionPct} onChange={(e) => setAddressCommissionPct(Number(e.target.value))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Brokerage %</label>
                  <input type="number" step={0.25} value={brokeragePct} onChange={(e) => setBrokeragePct(Number(e.target.value))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Canal toll</label>
                  <select value={canalToll} onChange={(e) => setCanalToll(e.target.value as any)} className={inputClass}>
                    <option value="none">Auto / None</option>
                    <option value="suez">Suez</option>
                    <option value="panama">Panama</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>War risk premium %</label>
                  <input type="number" step={0.1} value={warRiskPct} onChange={(e) => setWarRiskPct(Number(e.target.value))} className={inputClass} />
                </div>
              </div>
              <StepActions onBack={handleBack} onNext={handleNext} />
            </FormCard>
          )}

          {/* Step 8: Freight rate */}
          {step === 8 && !inlandOnly && (
            <FormCard title="Freight">
              <div className="space-y-2 mb-4">
                <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${freightRate === 'market' ? 'border-black bg-gray-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" checked={freightRate === 'market'} onChange={() => setFreightRate('market')} />
                  <span className="text-sm text-black">Use market rate (TCE-based)</span>
                </label>
                <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${freightRate === 'custom' ? 'border-black bg-gray-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" checked={freightRate === 'custom'} onChange={() => setFreightRate('custom')} />
                  <span className="text-sm text-black">Enter negotiated rate</span>
                </label>
              </div>
              {freightRate === 'market' && vesselClass && (
                <div className="mb-4 bg-gray-50 rounded-xl border border-gray-200 p-4">
                  <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-semibold">Baltic benchmarks (30d avg)</div>
                  {balticRoutes.filter(b => b.vesselClass === vesselClass).map((r) => (
                    <div key={r.id} className="flex justify-between text-sm py-1">
                      <span className="text-gray-500">{r.name}</span>
                      <span className="text-black font-medium">${r.avg30dUsdPerMt}/MT</span>
                    </div>
                  ))}
                </div>
              )}
              {freightRate === 'custom' && (
                <div className="mb-4">
                  <input type="number" value={customRate || ''} onChange={(e) => setCustomRate(Number(e.target.value))} placeholder="$/MT or lumpsum" className={inputClass} />
                </div>
              )}
              <div className="mt-6 flex justify-between">
                <button type="button" onClick={handleBack} className={secondaryBtnClass}>Back</button>
                <button type="button" onClick={handleNext} className={primaryBtnClass}>View on map <Navigation size={16} /></button>
              </div>
            </FormCard>
          )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-8 self-start min-w-0">
            {calculatedInfoCard}
            {costBuildUpCard}
          </aside>
          </div>
        </div>
      ) : (
        <div className={`flex flex-col bg-gray-50 ${mapFullScreen ? 'flex-1 min-h-0' : ''}`}>
          <div className="border-b border-gray-200 px-8 py-4 flex flex-wrap justify-between items-center gap-3 flex-shrink-0 bg-white">
            <div>
              <h2 className="text-xl font-semibold text-black">
                {inlandOnly
                  ? `${selectedAsset?.title} → ${destinationPort?.name}`
                  : `${selectedAsset?.title} → ${nearestPort?.port.name} → ${destinationPort?.name}`}
              </h2>
              <p className="text-sm text-gray-500">
                {selectedCommodity} • {inlandOnly ? inlandMode : vesselClass} • {inlandOnly ? 'inland' : inlandMode} • {costBreakdown ? formatUsd(costBreakdown.totalCost) : '—'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => window.print()} className={`${secondaryBtnClass} flex items-center gap-2`}><FileText size={16} /> PDF</button>
              <button onClick={() => costBreakdown && navigator.clipboard.writeText('component,amount\n' + costItems.map(i => `${i.label},${i.value}`).join('\n') + `\nTotal,${costBreakdown.totalCost}`)} className={`${secondaryBtnClass} flex items-center gap-2`}><FileSpreadsheet size={16} /> Excel</button>
              <button onClick={() => setMapFullScreen(!mapFullScreen)} className={secondaryBtnClass}>{mapFullScreen ? 'Minimize' : 'Full screen'}</button>
              <button onClick={reset} className={primaryBtnClass}>New scenario</button>
            </div>
          </div>
          <div className="flex-1 flex min-h-0 relative">
            {costBreakdown && (
              <div className={`absolute left-4 top-4 z-10 bg-white rounded-xl border border-gray-200 shadow-sm p-4 max-w-xs ${mapFullScreen ? 'bottom-4 overflow-y-auto' : 'max-h-[80vh] overflow-y-auto'}`}>
                <h3 className="text-sm font-semibold text-black mb-3 uppercase tracking-wide">Cost build-up</h3>
                {costLines}
                {costTotals}
                {costBreakdown.totalDays > 0 && (
                  <div className="text-xs text-gray-500 mt-3">ETA: {costBreakdown.totalDays.toFixed(0)} days</div>
                )}
              </div>
            )}
            <div className="flex-1 relative min-w-0">
              <Globe3D
                markers={markers}
                showCities={false}
                routes={routes}
                refineries={[]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
