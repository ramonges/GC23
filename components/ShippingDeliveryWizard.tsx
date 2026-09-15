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

function parcelToMt(commodity: string, parcelSize: number): number {
  const c = commoditySpecs[commodity]
  if (!c) return parcelSize
  if (c.unit === 'bbls') return parcelSize / (c.bblPerMt || 7.33)
  if (c.unit === 'mmbtu') return parcelSize * 0.02
  return parcelSize
}

const STEP_LABELS = ['Commodity', 'Origin', 'Inland', 'Blending', 'Vessel', 'Charter', 'Freight', 'Destination'] as const

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'
const primaryBtnClass =
  'px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2'
const secondaryBtnClass =
  'px-4 py-2 bg-white border border-gray-300 text-black rounded-lg hover:bg-gray-50 text-sm font-medium'

function FormCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
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
      return
    }
    setQuantityUnit(DEFAULT_QUANTITY_UNIT[selectedCommodity] || displaySpecUnit(commoditySpecs[selectedCommodity]?.unit))
  }, [selectedCommodity])

  // Reset region when country changes
  useEffect(() => { setOriginRegion('') }, [originCountry])

  // Fetch assets when commodity + country selected
  useEffect(() => {
    if (!selectedCommodity || !originCountry) {
      setAssets([])
      setSelectedAsset(null)
      setOriginRegion('')
      return
    }
    async function loadAssets() {
      const list: Asset[] = []
      const src = commodities.find(c => c.name === selectedCommodity)?.source
      if (src === 'coal_mines') {
        const { data } = await supabase.from('coal_mines').select('*').eq('country', originCountry).not('latitude', 'is', null)
        for (const r of data || []) {
          list.push({
            id: r.id,
            title: r.mine_name || 'Coal Mine',
            latitude: Number(r.latitude),
            longitude: Number(r.longitude),
            country: r.country,
            region: r.region,
            operator: r.operator,
            grade: r.coal_type || r.grade,
            coal_type: r.coal_type,
            calorific_value_kcal_kg: r.calorific_value_kcal_kg,
            sulfur_percent: r.sulfur_percent,
            annual_capacity_tonnes: r.annual_capacity_tonnes,
            nearest_port: r.nearest_port,
            production_capacity: r.annual_capacity_tonnes,
          })
        }
      } else if (src === 'gold_mines') {
        const { data } = await supabase.from('gold_mines').select('*').eq('country', originCountry).not('latitude', 'is', null)
        for (const r of data || []) {
          list.push({
            id: r.id,
            title: r.mine_name || r.name || 'Gold Mine',
            latitude: Number(r.latitude ?? r.lat),
            longitude: Number(r.longitude ?? r.lng),
            country: r.country,
            region: r.region,
            operator: r.operator,
            production_capacity: r.annual_capacity_troy_oz,
          })
        }
      } else if (src === 'sugar_plants') {
        const { data } = await supabase.from('sugar_plants').select('*').eq('country', originCountry).not('latitude', 'is', null)
        for (const r of data || []) {
          list.push({
            id: r.id,
            title: r.mill_name || 'Sugar Mill',
            latitude: Number(r.latitude),
            longitude: Number(r.longitude),
            country: r.country,
            region: r.region,
            operator: r.operator,
            grade: r.primary_grade,
            production_capacity: r.annual_output_tonnes,
            current_production: r.annual_output_tonnes,
          })
        }
      } else {
        const typeMap: Record<string, string> = {
          'Crude Oil': 'Energy',
          'Natural Gas': 'Energy',
          'Uranium': 'Energy',
          'Iron Ore': 'Metals',
          'Copper': 'Metals',
          'Sugar': 'Agricultural',
        }
        const type = typeMap[selectedCommodity] || 'Energy'
        const { data } = await supabase.from('commodity_locations').select('*')
          .eq('commodity_type', type).eq('commodity_name', selectedCommodity)
          .eq('country', originCountry).not('latitude', 'is', null)
        for (const r of data || []) {
          list.push({
            id: r.id,
            title: r.title || 'Site',
            latitude: Number(r.latitude),
            longitude: Number(r.longitude),
            country: r.country,
            region: r.region,
            operator: r.operator,
            grade: r.grade,
            api_gravity: r.api_gravity,
            sulfur_content: r.sulfur_content,
            production_capacity: r.production_capacity,
            current_production: r.current_production,
          })
        }
      }
      setAssets(list)
      setSelectedAsset(null)
    }
    loadAssets()
  }, [selectedCommodity, originCountry, commodities])

  // Nearest port when asset selected
  useEffect(() => {
    if (!selectedAsset) {
      setNearestPort(null)
      return
    }
    const np = findNearestPort(selectedAsset.latitude, selectedAsset.longitude)
    setNearestPort(np)
  }, [selectedAsset])

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
        const typeMap: Record<string, string> = {
          'Crude Oil': 'Energy',
          'Natural Gas': 'Energy',
          'Uranium': 'Energy',
          'Iron Ore': 'Metals',
          'Copper': 'Metals',
          'Sugar': 'Agricultural',
        }
        const type = typeMap[selectedCommodity] || 'Energy'
        const { data } = await supabase.from('commodity_locations').select('country')
          .eq('commodity_type', type).eq('commodity_name', selectedCommodity)
        countries = [...new Set((data || []).map((r: any) => r.country))]
      }
      setOriginCountries(countries.sort())
    }
    load()
  }, [selectedCommodity, commodities])

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
    if (!selectedAsset || !nearestPort || !destinationPort || !vesselClass || volume <= 0) {
      setCostBreakdown(null)
      return
    }
    const vessel = vesselClasses[vesselClass]
    const commodity = commoditySpecs[selectedCommodity]
    if (!vessel || !commodity) return

    const parcelMt = parcelToMt(selectedCommodity, volume)
    const inlandDist = nearestPort.distanceKm
    const inlandCostPerTon = inlandMode === 'truck' ? INLAND_COST_PER_KM_Truck : inlandMode === 'rail' ? INLAND_COST_PER_KM_Rail : inlandMode === 'conveyor' ? INLAND_COST_PER_KM_Conveyor : INLAND_COST_PER_KM_Pipeline
    const inlandCost = inlandDist * inlandCostPerTon * parcelMt
    const inlandDays = Math.ceil(inlandDist / 500) // rough: 500 km/day

    const seaDistNm = haversineDistanceKm(nearestPort.port.lat, nearestPort.port.lng, destinationPort.lat, destinationPort.lng) / 1.852
    const sailingDays = seaDistNm / (vessel.speed * 24)
    const loadRate = loadingRateMtDay > 0 ? loadingRateMtDay : commodity.loadingRateMtHr * 24
    const dischRate = dischargeRateMtDay > 0 ? dischargeRateMtDay : commodity.dischargeRateMtHr * 24
    const loadingDays = Math.max(0.5, parcelMt / loadRate) + 0.5
    const dischargeDays = Math.max(0.5, parcelMt / dischRate) + 0.5
    const totalDays = inlandDays + 1 + loadingDays + sailingDays + 1.5 + dischargeDays

    const hireCost = vessel.tceRate * totalDays
    const bunkerSea = vessel.fuelAtSea * sailingDays * VLSFO_USD
    const bunkerPort = vessel.fuelInPort * (loadingDays + dischargeDays + 2.5) * VLSFO_USD
    const bunkerCost = bunkerSea + bunkerPort
    let portCost = vessel.portCostPerCall * 2
    if (portDuesPerMt || stevedoringPerMt || wharfagePerMt) {
      portCost = parcelMt * (portDuesPerMt + stevedoringPerMt + wharfagePerMt)
      if (surveyorFee) portCost += 5000
      if (inspectionFee) portCost += 3000
      if (fumigationFee) portCost += 8000
    }

    let canalCost = 0
    const oReg = nearestPort.port.region
    const dReg = destinationPort.region
    const needsSuez = vessel.canalSuez && ((oReg === 'East Asia' && dReg === 'North Europe') || (oReg === 'North Europe' && dReg === 'East Asia'))
    const needsPanama = vessel.canalPanama && ((oReg === 'US Gulf' && dReg === 'East Asia') || (oReg === 'East Asia' && dReg === 'US Gulf'))
    if (canalToll === 'suez' || (canalToll === 'none' && needsSuez)) canalCost += 550000
    if (canalToll === 'panama' || (canalToll === 'none' && needsPanama)) canalCost += 450000

    const dischargePortCost = parcelMt * (dischargePortDues + dischargeUnloadGrab + dischargeCustomsClearance)
    const marineIns = (inlandCost + hireCost + bunkerCost + portCost + canalCost) * (marineInsurancePct / 100)
    const lateRisk = expectedDelayDays > 0 && latePenaltyPerDay > 0 ? Math.min(expectedDelayDays, 7) * latePenaltyPerDay : 0
    const blendingTotal = blendingMode !== 'none' ? stockpileCost + blendingFee + (maxStorageDays > 0 ? maxStorageDays * 500 : 0) : 0
    const freightTotal = hireCost + bunkerCost + portCost + canalCost
    const subtotal = inlandCost + freightTotal + dischargePortCost + marineIns + lateRisk + blendingTotal
    const contingency = subtotal * (contingencyPct / 100)
    const totalCost = subtotal + contingency
    const unitCost = commodity.unit === 'bbls' ? totalCost / volume : totalCost / parcelMt

    setCostBreakdown({
      inlandCost, inlandDist, inlandDays, inlandMode,
      parcelMt, volume,
      sailingDays, loadingDays, dischargeDays, totalDays,
      seaDistNm,
      freight: hireCost, bunker: bunkerCost, port: portCost, canal: canalCost,
      dischargePortCost, marineIns, lateRisk, blendingTotal: blendingMode !== 'none' ? stockpileCost + blendingFee + (maxStorageDays > 0 ? maxStorageDays * 500 : 0) : 0,
      contingency,
      totalCost, unitCost, unitLabel: commodity.unit,
      originPort: nearestPort.port, destinationPort,
      vessel, commodity,
    })
  }, [selectedAsset, nearestPort, destinationPort, vesselClass, volume, inlandMode, loadingRateMtDay, dischargeRateMtDay, portDuesPerMt, stevedoringPerMt, wharfagePerMt, surveyorFee, inspectionFee, fumigationFee, marineInsurancePct, contingencyPct, latePenaltyPerDay, expectedDelayDays, blendingMode, stockpileCost, blendingFee, maxStorageDays, dischargePortDues, dischargeUnloadGrab, dischargeCustomsClearance, canalToll])

  const handleNext = () => {
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
    setVesselClass('')
    setDestinationPort(null)
    setCostBreakdown(null)
    setShowMap(false)
    setMapFullScreen(false)
  }

  const canProceedStep1 = !!selectedCommodity && volume > 0
  const canProceedStep2 = !!originCountry && !!selectedAsset
  const canProceedStep3 = true
  const canProceedStep4 = false // blending optional
  const canProceedStep5 = !!vesselClass
  const canProceedStep6 = true
  const canProceedStep7 = true
  const canProceedStep8 = !!destinationPort

  const routes: ShippingRoute[] = []
  if (selectedAsset && nearestPort && destinationPort) {
    routes.push({
      id: 'inland',
      name: 'Asset → Port',
      startLat: selectedAsset.latitude,
      startLng: selectedAsset.longitude,
      endLat: nearestPort.port.lat,
      endLng: nearestPort.port.lng,
      color: '#F59E0B',
      waypoints: [],
    })
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

  const costItems = costBreakdown ? [
    { label: 'Inland', value: costBreakdown.inlandCost },
    { label: 'Port', value: costBreakdown.port },
    { label: 'Bunker', value: costBreakdown.bunker },
    { label: 'Freight', value: costBreakdown.freight },
    { label: 'Discharge', value: costBreakdown.dischargePortCost ?? 0 },
    { label: 'Canal', value: costBreakdown.canal },
    { label: 'Insurance', value: costBreakdown.marineIns ?? 0 },
    { label: 'Late risk', value: costBreakdown.lateRisk ?? 0 },
    { label: 'Blending', value: costBreakdown.blendingTotal ?? 0 },
    { label: 'Contingency', value: costBreakdown.contingency ?? 0 },
  ].filter(i => i.value > 0) : []

  const inlandRatePerKm =
    inlandMode === 'truck' ? INLAND_COST_PER_KM_Truck
    : inlandMode === 'rail' ? INLAND_COST_PER_KM_Rail
    : inlandMode === 'conveyor' ? INLAND_COST_PER_KM_Conveyor
    : INLAND_COST_PER_KM_Pipeline

  const costBuildUpCard = (
    <FormCard title="Cost build-up">
      {costBreakdown ? (
        <div>
          <div className="space-y-2 text-sm">
            {costItems.map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-500">{label}</span>
                <span className="text-black font-medium">${(value / 1000).toFixed(1)}k</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="text-xs text-gray-500 mb-1">Delivered cost / {costBreakdown.unitLabel}</div>
            <div className="text-2xl font-bold text-black">${costBreakdown.unitCost.toFixed(2)}</div>
            <div className="text-sm text-gray-500 mt-1">
              Total transaction cost ${(costBreakdown.totalCost / 1e6).toFixed(2)}M
            </div>
          </div>
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
        <p className="text-gray-500 text-sm">Complete origin, destination, vessel and volume to see cost breakdown.</p>
      )}
    </FormCard>
  )

  const calculatedInfoCard = (selectedCommodity || nearestPort) ? (
    <FormCard title="Calculated">
      <div className="space-y-3">
        {selectedCommodity && spec && (
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Commodity</div>
            <div className="text-base font-bold text-black">{selectedCommodity}</div>
            <p className="text-xs text-gray-500 mt-1">
              Source: database · Unit: {spec.unit} · Compatible vessels: {spec.vesselTypes.join(', ')}
            </p>
          </div>
        )}
        {nearestPort && selectedAsset && (
          <div className="grid grid-cols-1 gap-3 pt-1">
            <KpiPanel
              label="Nearest export port"
              value={`${nearestPort.port.name}, ${nearestPort.port.country}`}
            />
            <KpiPanel
              label="Distance"
              value={`${nearestPort.distanceKm.toFixed(0)} km`}
              hint={selectedAsset.title}
            />
            <KpiPanel
              label="Estimated inland cost"
              value={`$${(nearestPort.distanceKm * inlandRatePerKm).toFixed(2)} / MT`}
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

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
                <div>
                  <label className={labelClass}>Quantity</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      value={volume || ''}
                      onChange={(e) => setVolume(Number(e.target.value) || 0)}
                      placeholder="Quantity"
                      className={inputClass}
                    />
                    <select
                      value={quantityUnit}
                      onChange={(e) => setQuantityUnit(e.target.value)}
                      className={`${inputClass} w-28 flex-shrink-0`}
                    >
                      {unitOptionsFor(selectedCommodity).map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
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

          {/* Step 2: Origin country & asset */}
          {step === 2 && (
            <FormCard title="Origin">
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Origin country</label>
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
                    <label className={labelClass}>Mine/field</label>
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
                        <div className="grid grid-cols-2 gap-3">
                          <KpiPanel label="Operator" value={selectedAsset.operator || '—'} />
                          {selectedAsset.grade && <KpiPanel label="Grade" value={String(selectedAsset.grade)} />}
                          {(selectedAsset.api_gravity != null || selectedAsset.calorific_value_kcal_kg) && (
                            <KpiPanel
                              label={selectedAsset.calorific_value_kcal_kg ? 'Calorific value' : 'API gravity'}
                              value={selectedAsset.calorific_value_kcal_kg ? `${selectedAsset.calorific_value_kcal_kg} kcal/kg` : String(selectedAsset.api_gravity)}
                            />
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
                      </div>
                    )}
                  </div>
                )}
              </div>
              <StepActions onBack={handleBack} onNext={handleNext} nextDisabled={!canProceedStep2} />
            </FormCard>
          )}

          {/* Step 3: Nearest port + inland */}
          {step === 3 && selectedAsset && nearestPort && (
            <FormCard title="Inland">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                <KpiPanel label="Nearest export port" value={`${nearestPort.port.name}, ${nearestPort.port.country}`} />
                <KpiPanel label="Distance" value={`${nearestPort.distanceKm.toFixed(0)} km`} hint={selectedAsset.title} />
                <KpiPanel label="Estimated inland cost" value={`$${(nearestPort.distanceKm * inlandRatePerKm).toFixed(2)} / MT`} />
              </div>
              <div className="mb-4">
                <label className={labelClass}>Inland transport mode</label>
                <select value={inlandMode} onChange={(e) => setInlandMode(e.target.value as any)} className={inputClass}>
                  {allowedInlandModes.includes('truck') && <option value="truck">Truck</option>}
                  {allowedInlandModes.includes('rail') && <option value="rail">Rail</option>}
                  {allowedInlandModes.includes('conveyor') && <option value="conveyor">Conveyor</option>}
                  {allowedInlandModes.includes('pipeline') && <option value="pipeline">Pipeline</option>}
                </select>
              </div>
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
              <StepActions onBack={handleBack} onNext={handleNext} />
            </FormCard>
          )}

          {/* Step 4: Blending */}
          {step === 4 && (
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
              <StepActions onBack={handleBack} onNext={handleNext} />
            </FormCard>
          )}

          {/* Step 5: Vessel */}
          {step === 5 && spec && (
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
              <StepActions onBack={handleBack} onNext={handleNext} nextDisabled={!canProceedStep5} />
            </FormCard>
          )}

          {/* Step 6: Charter type */}
          {step === 6 && (
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

          {/* Step 7: Freight rate */}
          {step === 7 && (
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
              <StepActions onBack={handleBack} onNext={handleNext} />
            </FormCard>
          )}

          {/* Step 8: Destination & penalties */}
          {step === 8 && (
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
              <div className="mt-6 flex justify-between">
                <button type="button" onClick={handleBack} className={secondaryBtnClass}>Back</button>
                <button type="button" onClick={handleNext} disabled={!canProceedStep8} className={primaryBtnClass}>View on map <Navigation size={16} /></button>
              </div>
            </FormCard>
          )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-8 self-start">
            {calculatedInfoCard}
            {costBuildUpCard}
          </aside>
          </div>
        </div>
      ) : (
        <div className={`flex flex-col bg-gray-50 ${mapFullScreen ? 'flex-1 min-h-0' : ''}`}>
          <div className="border-b border-gray-200 px-8 py-4 flex flex-wrap justify-between items-center gap-3 flex-shrink-0 bg-white">
            <div>
              <h2 className="text-xl font-semibold text-black">{selectedAsset?.title} → {nearestPort?.port.name} → {destinationPort?.name}</h2>
              <p className="text-sm text-gray-500">{selectedCommodity} • {vesselClass} • {inlandMode} • ${costBreakdown ? (costBreakdown.totalCost/1e6).toFixed(2) : '—'}M</p>
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
                <div className="space-y-1.5 text-sm">
                  {costItems.map(({ label, value }) => (
                    <div key={label} className="flex justify-between"><span className="text-gray-500">{label}</span><span className="text-black font-medium">${(value/1000).toFixed(1)}k</span></div>
                  ))}
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="text-xs text-gray-500 mb-1">Delivered cost / {costBreakdown.unitLabel}</div>
                    <div className="text-2xl font-bold text-black">${costBreakdown.unitCost.toFixed(2)}</div>
                    <div className="text-sm text-gray-500 mt-1">Total transaction cost ${(costBreakdown.totalCost/1e6).toFixed(2)}M</div>
                    <div className="text-xs text-gray-500 mt-2">ETA: {costBreakdown.totalDays.toFixed(0)} days</div>
                  </div>
                </div>
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
