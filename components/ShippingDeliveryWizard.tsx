'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Package, MapPin, Ship, Route, Clock, DollarSign, ChevronRight, ChevronLeft,
  CheckCircle, AlertTriangle, Navigation, Truck, Anchor,
} from 'lucide-react'
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
const INLAND_COST_PER_KM_Truck = 0.15 // $/ton-km
const INLAND_COST_PER_KM_Rail = 0.08
const INLAND_COST_PER_KM_Pipeline = 0.05
const VLSFO_USD = 550

function parcelToMt(commodity: string, parcelSize: number): number {
  const c = commoditySpecs[commodity]
  if (!c) return parcelSize
  if (c.unit === 'bbls') return parcelSize / (c.bblPerMt || 7.33)
  if (c.unit === 'mmbtu') return parcelSize * 0.02
  return parcelSize
}

export default function ShippingDeliveryWizard() {
  const [step, setStep] = useState(1)
  const [commodities, setCommodities] = useState<{ name: string; source: string }[]>([])
  const [selectedCommodity, setSelectedCommodity] = useState('')
  const [originCountry, setOriginCountry] = useState('')
  const [assets, setAssets] = useState<Asset[]>([])
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [nearestPort, setNearestPort] = useState<{ port: Port; distanceKm: number } | null>(null)
  const [inlandMode, setInlandMode] = useState<'truck' | 'rail' | 'pipeline'>('truck')
  const [volume, setVolume] = useState(0)
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

  // Fetch commodities that exist in DB
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
      setCommodities(list)
    }
    load()
  }, [])

  // Fetch assets when commodity + country selected
  useEffect(() => {
    if (!selectedCommodity || !originCountry) {
      setAssets([])
      setSelectedAsset(null)
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
      } else {
        const typeMap: Record<string, string> = {
          'Crude Oil': 'Energy', 'Natural Gas': 'Energy', 'Uranium': 'Energy',
          'Iron Ore': 'Metals', 'Copper': 'Metals',
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
      } else {
        const typeMap: Record<string, string> = {
          'Crude Oil': 'Energy', 'Natural Gas': 'Energy', 'Uranium': 'Energy',
          'Iron Ore': 'Metals', 'Copper': 'Metals',
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
    const inlandCostPerTon = inlandMode === 'truck' ? INLAND_COST_PER_KM_Truck : inlandMode === 'rail' ? INLAND_COST_PER_KM_Rail : INLAND_COST_PER_KM_Pipeline
    const inlandCost = inlandDist * inlandCostPerTon * parcelMt
    const inlandDays = Math.ceil(inlandDist / 500) // rough: 500 km/day

    const seaDistNm = haversineDistanceKm(nearestPort.port.lat, nearestPort.port.lng, destinationPort.lat, destinationPort.lng) / 1.852
    const sailingDays = seaDistNm / (vessel.speed * 24)
    const loadingHrs = parcelMt / commodity.loadingRateMtHr
    const dischargeHrs = parcelMt / commodity.dischargeRateMtHr
    const loadingDays = Math.max(1, Math.ceil(loadingHrs / 24) + 0.5)
    const dischargeDays = Math.max(1, Math.ceil(dischargeHrs / 24) + 0.5)
    const totalDays = inlandDays + 1 + loadingDays + sailingDays + 1.5 + dischargeDays

    const hireCost = vessel.tceRate * totalDays
    const bunkerSea = vessel.fuelAtSea * sailingDays * VLSFO_USD
    const bunkerPort = vessel.fuelInPort * (loadingDays + dischargeDays + 2.5) * VLSFO_USD
    const bunkerCost = bunkerSea + bunkerPort
    const portCost = vessel.portCostPerCall * 2

    let canalCost = 0
    const oReg = nearestPort.port.region
    const dReg = destinationPort.region
    if (vessel.canalSuez && ((oReg === 'East Asia' && dReg === 'North Europe') || (oReg === 'North Europe' && dReg === 'East Asia'))) canalCost += 550000
    if (vessel.canalPanama && ((oReg === 'US Gulf' && dReg === 'East Asia') || (oReg === 'East Asia' && dReg === 'US Gulf'))) canalCost += 450000

    const freightTotal = hireCost + bunkerCost + portCost + canalCost
    const totalCost = inlandCost + freightTotal
    const unitCost = commodity.unit === 'bbls' ? totalCost / volume : totalCost / parcelMt

    setCostBreakdown({
      inlandCost, inlandDist, inlandDays, inlandMode,
      parcelMt, volume,
      sailingDays, loadingDays, dischargeDays, totalDays,
      seaDistNm,
      freight: hireCost, bunker: bunkerCost, port: portCost, canal: canalCost,
      totalCost, unitCost, unitLabel: commodity.unit,
      originPort: nearestPort.port, destinationPort,
      vessel, commodity,
    })
  }, [selectedAsset, nearestPort, destinationPort, vesselClass, volume, inlandMode])

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
    setVesselClass('')
    setDestinationPort(null)
    setCostBreakdown(null)
    setShowMap(false)
    setMapFullScreen(false)
  }

  const canProceedStep1 = !!selectedCommodity
  const canProceedStep2 = !!originCountry && !!selectedAsset
  const canProceedStep3 = true
  const canProceedStep4 = false // blending optional
  const canProceedStep5 = volume > 0 && !!vesselClass
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

  return (
    <div className={showMap && mapFullScreen ? 'h-screen flex flex-col overflow-hidden' : 'bg-gray-50 min-h-screen'}>
      <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
        <h1 className="text-3xl font-bold text-black mb-2">Physical Delivery Cost Model</h1>
        <p className="text-gray-600">End-to-end delivered cost from mine/field → port → destination. Uses commodity_locations, coal_mines, gold_mines.</p>
      </div>

      {!showMap ? (
        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            {Array.from({ length: STEPS }, (_, i) => i + 1).map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm ${step >= s ? 'bg-black border-black text-white' : 'border-gray-300 text-gray-400'}`}>
                  {step > s ? <CheckCircle size={16} /> : s}
                </div>
                {s < STEPS && <div className={`flex-1 h-0.5 mx-1 ${step > s ? 'bg-black' : 'bg-gray-300'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Commodity */}
          {step === 1 && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><Package size={20} />Commodity</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commodity (from DB)</label>
                <select
                  value={selectedCommodity}
                  onChange={(e) => { setSelectedCommodity(e.target.value); setOriginCountry(''); setSelectedAsset(null) }}
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-black"
                >
                  <option value="">Select...</option>
                  {commodities.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
                {spec && (
                  <p className="mt-2 text-sm text-gray-500">Unit: {spec.unit} • Vessels: {spec.vesselTypes.join(', ')}</p>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={handleNext} disabled={!canProceedStep1} className="px-6 py-2.5 bg-black text-white rounded-lg disabled:opacity-50 flex items-center gap-2">Next <ChevronRight size={18} /></button>
              </div>
            </div>
          )}

          {/* Step 2: Origin country & asset */}
          {step === 2 && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><MapPin size={20} />Origin country & asset</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Origin country</label>
                  <select
                    value={originCountry}
                    onChange={(e) => { setOriginCountry(e.target.value); setSelectedAsset(null) }}
                    className="w-full px-4 py-2.5 border rounded-lg"
                  >
                    <option value="">Select...</option>
                    {originCountries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                {originCountry && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mine/field</label>
                    <select
                      value={selectedAsset?.id || ''}
                      onChange={(e) => {
                        const a = assets.find(x => x.id === e.target.value)
                        setSelectedAsset(a || null)
                      }}
                      className="w-full px-4 py-2.5 border rounded-lg"
                    >
                      <option value="">Select...</option>
                      {assets.map((a) => (
                        <option key={a.id} value={a.id}>{a.title} {a.region ? `(${a.region})` : ''}</option>
                      ))}
                    </select>
                    {selectedAsset && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                        <div>Operator: {selectedAsset.operator || '—'}</div>
                        {selectedAsset.grade && <div>Grade: {selectedAsset.grade}</div>}
                        {selectedAsset.api_gravity != null && <div>API: {selectedAsset.api_gravity}</div>}
                        {selectedAsset.production_capacity && <div>Capacity: {Number(selectedAsset.production_capacity).toLocaleString()}/yr</div>}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={handleBack} className="px-6 py-2.5 border rounded-lg">Back</button>
                <button onClick={handleNext} disabled={!canProceedStep2} className="px-6 py-2.5 bg-black text-white rounded-lg disabled:opacity-50 flex items-center gap-2">Next <ChevronRight size={18} /></button>
              </div>
            </div>
          )}

          {/* Step 3: Nearest port + inland */}
          {step === 3 && selectedAsset && nearestPort && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><Anchor size={20} />Nearest export port & inland transport</h2>
              <div className="p-4 bg-blue-50 rounded-lg mb-4">
                <div className="font-medium">Nearest port: {nearestPort.port.name}, {nearestPort.port.country}</div>
                <div className="text-sm text-gray-600">{nearestPort.distanceKm.toFixed(0)} km from {selectedAsset.title}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Inland transport mode</label>
                <select value={inlandMode} onChange={(e) => setInlandMode(e.target.value as any)} className="w-full px-4 py-2.5 border rounded-lg">
                  <option value="truck">Truck</option>
                  <option value="rail">Rail</option>
                  <option value="pipeline">Pipeline</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Est. cost: ${(nearestPort.distanceKm * (inlandMode === 'truck' ? INLAND_COST_PER_KM_Truck : inlandMode === 'rail' ? INLAND_COST_PER_KM_Rail : INLAND_COST_PER_KM_Pipeline) * 1000).toFixed(0)}/1,000 MT
                </p>
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={handleBack} className="px-6 py-2.5 border rounded-lg">Back</button>
                <button onClick={handleNext} className="px-6 py-2.5 bg-black text-white rounded-lg flex items-center gap-2">Next <ChevronRight size={18} /></button>
              </div>
            </div>
          )}

          {/* Step 4: Blending (skip/optional) */}
          {step === 4 && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">Optional blending</h2>
              <p className="text-gray-600 text-sm">Blending module can be added when storage/blending assets are in dataset. Skip for now.</p>
              <div className="mt-6 flex justify-between">
                <button onClick={handleBack} className="px-6 py-2.5 border rounded-lg">Back</button>
                <button onClick={handleNext} className="px-6 py-2.5 bg-black text-white rounded-lg flex items-center gap-2">Next <ChevronRight size={18} /></button>
              </div>
            </div>
          )}

          {/* Step 5: Volume & vessel */}
          {step === 5 && spec && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><Ship size={20} />Volume & vessel</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Volume</label>
                  <select value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full px-4 py-2.5 border rounded-lg">
                    <option value={0}>Select...</option>
                    {parcelOptions.map((p) => (
                      <option key={p.size} value={p.size}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vessel class</label>
                  <select value={vesselClass} onChange={(e) => setVesselClass(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg">
                    <option value="">Select...</option>
                    {availableVessels.map((v) => (
                      <option key={v} value={v}>{v} — {vesselClasses[v].dwtMin.toLocaleString()}-{vesselClasses[v].dwtMax.toLocaleString()} DWT</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={handleBack} className="px-6 py-2.5 border rounded-lg">Back</button>
                <button onClick={handleNext} disabled={!canProceedStep5} className="px-6 py-2.5 bg-black text-white rounded-lg disabled:opacity-50 flex items-center gap-2">Next <ChevronRight size={18} /></button>
              </div>
            </div>
          )}

          {/* Step 6: Charter type */}
          {step === 6 && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">Charter type</h2>
              <div className="space-y-2">
                {(['voyage', 'time', 'bareboat'] as CharterType[]).map((t) => (
                  <label key={t} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="charter" checked={charterType === t} onChange={() => setCharterType(t)} />
                    <span className="capitalize">{t} charter</span>
                    {t === 'voyage' && <span className="text-xs text-gray-500">— $/ton or lumpsum + port costs</span>}
                    {t === 'time' && <span className="text-xs text-gray-500">— $/day hire + bunker</span>}
                    {t === 'bareboat' && <span className="text-xs text-gray-500">— $/day + crew/insurance</span>}
                  </label>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={handleBack} className="px-6 py-2.5 border rounded-lg">Back</button>
                <button onClick={handleNext} className="px-6 py-2.5 bg-black text-white rounded-lg flex items-center gap-2">Next <ChevronRight size={18} /></button>
              </div>
            </div>
          )}

          {/* Step 7: Freight rate */}
          {step === 7 && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">Freight rate</h2>
              <div className="space-y-2 mb-4">
                <label className="flex items-center gap-2"><input type="radio" checked={freightRate === 'market'} onChange={() => setFreightRate('market')} /> Use market rate (TCE-based)</label>
                <label className="flex items-center gap-2"><input type="radio" checked={freightRate === 'custom'} onChange={() => setFreightRate('custom')} /> Enter negotiated rate</label>
              </div>
              {freightRate === 'custom' && (
                <div>
                  <input type="number" value={customRate || ''} onChange={(e) => setCustomRate(Number(e.target.value))} placeholder="$/MT or lumpsum" className="w-full px-4 py-2 border rounded-lg" />
                </div>
              )}
              <div className="mt-6 flex justify-between">
                <button onClick={handleBack} className="px-6 py-2.5 border rounded-lg">Back</button>
                <button onClick={handleNext} className="px-6 py-2.5 bg-black text-white rounded-lg flex items-center gap-2">Next <ChevronRight size={18} /></button>
              </div>
            </div>
          )}

          {/* Step 8: Destination & penalties */}
          {step === 8 && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><Route size={20} />Destination & late penalties</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Destination port</label>
                  <select
                    value={destinationPort ? `${destinationPort.name}-${destinationPort.country}` : ''}
                    onChange={(e) => {
                      const v = e.target.value
                      const p = majorPorts.find(x => `${x.name}-${x.country}` === v)
                      setDestinationPort(p || null)
                    }}
                    className="w-full px-4 py-2.5 border rounded-lg"
                  >
                    <option value="">Select...</option>
                    {majorPorts.filter(p => !nearestPort || p.name !== nearestPort.port.name).map((p) => (
                      <option key={`${p.name}-${p.country}`} value={`${p.name}-${p.country}`}>{p.name}, {p.country}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Late penalty ($/day)</label>
                    <input type="number" value={latePenaltyPerDay || ''} onChange={(e) => setLatePenaltyPerDay(Number(e.target.value))} placeholder="0" className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Grace period (days)</label>
                    <input type="number" value={gracePeriodDays || ''} onChange={(e) => setGracePeriodDays(Number(e.target.value))} placeholder="0" className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                </div>
              </div>
              {costBreakdown && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                  <h3 className="font-semibold mb-3">Cost build-up (preview)</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span>Inland (asset → port)</span><span>${(costBreakdown.inlandCost/1000).toFixed(1)}k</span></div>
                    <div className="flex justify-between"><span>Freight (hire)</span><span>${(costBreakdown.freight/1000).toFixed(0)}k</span></div>
                    <div className="flex justify-between"><span>Bunker</span><span>${(costBreakdown.bunker/1000).toFixed(0)}k</span></div>
                    <div className="flex justify-between"><span>Port costs</span><span>${(costBreakdown.port/1000).toFixed(0)}k</span></div>
                    <div className="flex justify-between font-bold"><span>Total</span><span>${(costBreakdown.totalCost/1e6).toFixed(2)}M</span></div>
                    <div className="text-gray-600">${costBreakdown.unitCost.toFixed(2)}/{costBreakdown.unitLabel}</div>
                  </div>
                </div>
              )}
              <div className="mt-6 flex justify-between">
                <button onClick={handleBack} className="px-6 py-2.5 border rounded-lg">Back</button>
                <button onClick={handleNext} disabled={!canProceedStep8} className="px-6 py-2.5 bg-black text-white rounded-lg disabled:opacity-50 flex items-center gap-2">View on map <Navigation size={18} /></button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={`flex flex-col ${mapFullScreen ? 'flex-1 min-h-0' : ''}`}>
          <div className="bg-white border-b px-8 py-4 flex justify-between items-center flex-shrink-0">
            <div>
              <h2 className="text-xl font-semibold">{selectedAsset?.title} → {destinationPort?.name}</h2>
              <p className="text-sm text-gray-600">{selectedCommodity} • {vesselClass} • ${costBreakdown ? (costBreakdown.totalCost/1e6).toFixed(2) : '—'}M total</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMapFullScreen(!mapFullScreen)} className="px-4 py-2 border rounded-lg text-sm">
                {mapFullScreen ? 'Minimize' : 'Full screen'}
              </button>
              <button onClick={reset} className="px-4 py-2 border rounded-lg text-sm">New scenario</button>
            </div>
          </div>
          <div className="flex-1 flex min-h-0 relative">
            {costBreakdown && (
              <div className={`absolute left-4 top-4 z-10 bg-white rounded-xl border shadow-lg p-4 max-w-xs ${mapFullScreen ? 'bottom-4' : 'max-h-[80vh] overflow-y-auto'}`}>
                <h3 className="font-semibold mb-3">Cost breakdown</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Inland</span><span>${(costBreakdown.inlandCost/1000).toFixed(1)}k</span></div>
                  <div className="flex justify-between"><span>Freight</span><span>${(costBreakdown.freight/1000).toFixed(0)}k</span></div>
                  <div className="flex justify-between"><span>Bunker</span><span>${(costBreakdown.bunker/1000).toFixed(0)}k</span></div>
                  <div className="flex justify-between"><span>Port</span><span>${(costBreakdown.port/1000).toFixed(0)}k</span></div>
                  <div className="flex justify-between"><span>Canal</span><span>${(costBreakdown.canal/1000).toFixed(0)}k</span></div>
                  <div className="flex justify-between font-bold border-t pt-2 mt-2"><span>Total</span><span>${(costBreakdown.totalCost/1e6).toFixed(2)}M</span></div>
                  <div className="text-gray-600">${costBreakdown.unitCost.toFixed(2)}/{costBreakdown.unitLabel}</div>
                  <div className="text-xs text-gray-500 mt-2">ETA: {costBreakdown.totalDays.toFixed(0)} days</div>
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
