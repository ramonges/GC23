'use client'

import { useState, useEffect } from 'react'
import { 
  Ship, MapPin, Package, Route, Clock, DollarSign, AlertTriangle, CheckCircle, 
  ChevronRight, Navigation, Info
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { ShippingRoute } from '@/lib/types'

const Globe3D = dynamic(() => import('./Globe3DClient'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-xl">Loading 3D Earth...</p>
      </div>
    </div>
  ),
})

// Major ports with region for route detection
const majorPorts = [
  { name: 'Port Hedland', country: 'Australia', lat: -20.3, lng: 118.6, region: 'Oceania' },
  { name: 'Newcastle', country: 'Australia', lat: -32.9, lng: 151.8, region: 'Oceania' },
  { name: 'Tubarao', country: 'Brazil', lat: -20.3, lng: -40.3, region: 'South America' },
  { name: 'Santos', country: 'Brazil', lat: -23.9, lng: -46.3, region: 'South America' },
  { name: 'Richards Bay', country: 'South Africa', lat: -28.8, lng: 32.1, region: 'South Africa' },
  { name: 'Bolivar', country: 'Colombia', lat: 12.2, lng: -72.2, region: 'South America' },
  { name: 'Qingdao', country: 'China', lat: 36.1, lng: 120.4, region: 'East Asia' },
  { name: 'Shanghai', country: 'China', lat: 31.2, lng: 121.5, region: 'East Asia' },
  { name: 'Ningbo', country: 'China', lat: 29.9, lng: 121.6, region: 'East Asia' },
  { name: 'Beilun/Baoshan', country: 'China', lat: 29.9, lng: 121.8, region: 'East Asia' },
  { name: 'Ras Tanura', country: 'Saudi Arabia', lat: 26.6, lng: 50.2, region: 'Middle East' },
  { name: 'Jubail', country: 'Saudi Arabia', lat: 27.0, lng: 49.7, region: 'Middle East' },
  { name: 'Fujairah', country: 'UAE', lat: 25.1, lng: 56.3, region: 'Middle East' },
  { name: 'Singapore', country: 'Singapore', lat: 1.3, lng: 103.8, region: 'Southeast Asia' },
  { name: 'Rotterdam', country: 'Netherlands', lat: 51.9, lng: 4.5, region: 'North Europe' },
  { name: 'Antwerp', country: 'Belgium', lat: 51.2, lng: 4.4, region: 'North Europe' },
  { name: 'Hamburg', country: 'Germany', lat: 53.6, lng: 10.0, region: 'North Europe' },
  { name: 'Houston', country: 'United States', lat: 29.8, lng: -95.0, region: 'US Gulf' },
  { name: 'New Orleans', country: 'United States', lat: 29.9, lng: -90.1, region: 'US Gulf' },
  { name: 'New York', country: 'United States', lat: 40.7, lng: -74.0, region: 'US East Coast' },
]

// Commodities with standard parcel sizes (industry standard)
type CommodityConfig = {
  unit: string
  parcels: { size: number; label: string }[]
  vesselTypes: string[]
  loadingRateMtHr: number
  dischargeRateMtHr: number
  bblPerMt?: number // for crude: 1 bbl ≈ 0.136 MT
}

const commodities: Record<string, CommodityConfig> = {
  'Crude Oil': {
    unit: 'bbls',
    bblPerMt: 7.33,
    parcels: [
      { size: 500000, label: '500k bbls (VLCC full)' },
      { size: 270000, label: '270k bbls (VLCC partial / Suezmax)' },
      { size: 135000, label: '135k bbls (Aframax)' },
      { size: 80000, label: '80k bbls (Panamax)' },
    ],
    vesselTypes: ['VLCC', 'Suezmax', 'Aframax'],
    loadingRateMtHr: 12500,
    dischargeRateMtHr: 10000,
  },
  'LNG': {
    unit: 'cbm',
    parcels: [
      { size: 170000, label: '170k m³ (Q-Flex)' },
      { size: 145000, label: '145k m³ (standard LNG)' },
      { size: 80000, label: '80k m³ (small-scale)' },
    ],
    vesselTypes: ['LNG Carrier'],
    loadingRateMtHr: 8000,
    dischargeRateMtHr: 6000,
  },
  'Iron Ore': {
    unit: 'MT',
    parcels: [
      { size: 300000, label: '300k MT (Valemax/VLOC)' },
      { size: 180000, label: '180k MT (Capesize)' },
      { size: 80000, label: '80k MT (Panamax)' },
      { size: 35000, label: '35k MT (Supramax)' },
    ],
    vesselTypes: ['Capesize', 'Panamax', 'Supramax'],
    loadingRateMtHr: 6000,
    dischargeRateMtHr: 5000,
  },
  'Coal': {
    unit: 'MT',
    parcels: [
      { size: 150000, label: '150k MT (Capesize)' },
      { size: 75000, label: '75k MT (Panamax)' },
      { size: 55000, label: '55k MT (Supramax)' },
      { size: 30000, label: '30k MT (Handymax)' },
    ],
    vesselTypes: ['Capesize', 'Panamax', 'Supramax', 'Handymax'],
    loadingRateMtHr: 3500,
    dischargeRateMtHr: 3000,
  },
  'Grain': {
    unit: 'MT',
    parcels: [
      { size: 70000, label: '70k MT (Panamax grain)' },
      { size: 55000, label: '55k MT (Supramax)' },
      { size: 35000, label: '35k MT (Handymax)' },
      { size: 25000, label: '25k MT (Handysize)' },
    ],
    vesselTypes: ['Panamax', 'Supramax', 'Handymax', 'Handysize'],
    loadingRateMtHr: 2000,
    dischargeRateMtHr: 1800,
  },
  'Copper': {
    unit: 'MT',
    parcels: [
      { size: 55000, label: '55k MT (Supramax)' },
      { size: 30000, label: '30k MT (Handymax)' },
      { size: 15000, label: '15k MT (Handysize)' },
    ],
    vesselTypes: ['Supramax', 'Handymax', 'Handysize'],
    loadingRateMtHr: 1500,
    dischargeRateMtHr: 1200,
  },
  'Bauxite': {
    unit: 'MT',
    parcels: [
      { size: 190000, label: '190k MT (Capesize)' },
      { size: 80000, label: '80k MT (Panamax)' },
      { size: 55000, label: '55k MT (Supramax)' },
    ],
    vesselTypes: ['Capesize', 'Panamax', 'Supramax'],
    loadingRateMtHr: 5000,
    dischargeRateMtHr: 4000,
  },
}

// Vessel classes - realistic 2024-2025 specs
type VesselConfig = {
  dwtMin: number
  dwtMax: number
  speed: number // knots laden
  fuelAtSea: number // MT/day
  fuelInPort: number // MT/day
  tceRate: number // $/day mid-market
  portCostPerCall: number // $ total
  demurrageRate: number // $/day
  canalPanama: boolean
  canalSuez: boolean
  commodities: string[]
}

const vesselClasses: Record<string, VesselConfig> = {
  'VLCC': { dwtMin: 200000, dwtMax: 320000, speed: 14.5, fuelAtSea: 88, fuelInPort: 7, tceRate: 35000, portCostPerCall: 105000, demurrageRate: 70000, canalPanama: false, canalSuez: true, commodities: ['Crude Oil'] },
  'Suezmax': { dwtMin: 120000, dwtMax: 200000, speed: 14, fuelAtSea: 62, fuelInPort: 6, tceRate: 28000, portCostPerCall: 80000, demurrageRate: 47500, canalPanama: false, canalSuez: true, commodities: ['Crude Oil'] },
  'Aframax': { dwtMin: 80000, dwtMax: 120000, speed: 14, fuelAtSea: 47, fuelInPort: 5, tceRate: 22000, portCostPerCall: 62500, demurrageRate: 35000, canalPanama: false, canalSuez: true, commodities: ['Crude Oil'] },
  'MR Tanker': { dwtMin: 25000, dwtMax: 55000, speed: 13.5, fuelAtSea: 28, fuelInPort: 3, tceRate: 15000, portCostPerCall: 35000, demurrageRate: 18000, canalPanama: true, canalSuez: true, commodities: ['Crude Oil'] },
  'LNG Carrier': { dwtMin: 145000, dwtMax: 217000, speed: 19, fuelAtSea: 145, fuelInPort: 12, tceRate: 75000, portCostPerCall: 120000, demurrageRate: 95000, canalPanama: false, canalSuez: true, commodities: ['LNG'] },
  'Capesize': { dwtMin: 100000, dwtMax: 400000, speed: 14, fuelAtSea: 60, fuelInPort: 5, tceRate: 18000, portCostPerCall: 70000, demurrageRate: 30000, canalPanama: false, canalSuez: true, commodities: ['Iron Ore', 'Coal', 'Bauxite'] },
  'Panamax': { dwtMin: 65000, dwtMax: 90000, speed: 13.5, fuelAtSea: 35, fuelInPort: 4, tceRate: 12000, portCostPerCall: 45000, demurrageRate: 18500, canalPanama: true, canalSuez: true, commodities: ['Iron Ore', 'Coal', 'Grain', 'Bauxite'] },
  'Supramax': { dwtMin: 50000, dwtMax: 65000, speed: 13, fuelAtSea: 26, fuelInPort: 3, tceRate: 10000, portCostPerCall: 32500, demurrageRate: 13000, canalPanama: true, canalSuez: true, commodities: ['Iron Ore', 'Coal', 'Grain', 'Copper', 'Bauxite'] },
  'Handymax': { dwtMin: 35000, dwtMax: 50000, speed: 12.5, fuelAtSea: 21, fuelInPort: 2.5, tceRate: 8500, portCostPerCall: 25000, demurrageRate: 9500, canalPanama: true, canalSuez: true, commodities: ['Coal', 'Grain', 'Copper'] },
  'Handysize': { dwtMin: 25000, dwtMax: 50000, speed: 12, fuelAtSea: 21, fuelInPort: 2.5, tceRate: 8000, portCostPerCall: 25000, demurrageRate: 9000, canalPanama: true, canalSuez: true, commodities: ['Grain', 'Copper'] },
}

// Route definitions with typical commodity, distance (nm), canal flags
const routeDefinitions: Record<string, { name: string; distanceNm: number; viaSuez?: boolean; viaPanama?: boolean; typicalCommodity: string }> = {
  'C1': { name: 'Asia (Far East) ↔ North Europe', distanceNm: 10500, viaSuez: true, typicalCommodity: 'Iron Ore, Containers' },
  'C2': { name: 'Asia (Far East) ↔ Mediterranean', distanceNm: 8500, viaSuez: true, typicalCommodity: 'Iron Ore, Coal' },
  'C3': { name: 'Tubarao (Brazil) → Beilun/Baoshan (China)', distanceNm: 11000, viaPanama: false, viaSuez: true, typicalCommodity: 'Iron Ore' },
  'C4': { name: 'Richards Bay → Rotterdam', distanceNm: 7200, typicalCommodity: 'Coal' },
  'C5': { name: 'Western Australia → Qingdao (China)', distanceNm: 3700, typicalCommodity: 'Iron Ore, Coal' },
  'C7': { name: 'Bolivar (Colombia) → Rotterdam', distanceNm: 4700, viaPanama: true, typicalCommodity: 'Coal' },
  'C10': { name: 'Europe ↔ North America (Transatlantic)', distanceNm: 3500, typicalCommodity: 'Grain, Oil' },
  'TD3C': { name: 'Middle East Gulf → China (VLCC crude)', distanceNm: 6500, viaSuez: true, typicalCommodity: 'Crude Oil' },
  'TD20': { name: 'West Africa → Continent (Suezmax)', distanceNm: 5200, viaSuez: true, typicalCommodity: 'Crude Oil' },
  'P2': { name: 'Skaw–Gibraltar → Far East (grain)', distanceNm: 10500, viaSuez: true, typicalCommodity: 'Grain' },
  'S1': { name: 'US Gulf → Skaw–Passero', distanceNm: 4200, typicalCommodity: 'Grain, Coal' },
}

// Default route when no specific match
const DEFAULT_ROUTE = { name: 'Custom route', distanceNm: 5000, typicalCommodity: 'Various' }

function detectRoute(origin: typeof majorPorts[0], dest: typeof majorPorts[0]): string {
  const o = origin.region
  const d = dest.region
  if (o === 'Oceania' && d === 'East Asia') return 'C5'
  if (o === 'East Asia' && d === 'Oceania') return 'C5'
  if (o === 'South America' && d === 'East Asia') return 'C3'
  if (o === 'East Asia' && d === 'South America') return 'C3'
  if (o === 'South Africa' && d === 'North Europe') return 'C4'
  if (o === 'South America' && d === 'North Europe') return 'C7'
  if (o === 'East Asia' && d === 'North Europe') return 'C1'
  if (o === 'North Europe' && d === 'East Asia') return 'C1'
  if (o === 'Middle East' && d === 'East Asia') return 'TD3C'
  if (o === 'East Asia' && d === 'Middle East') return 'TD3C'
  if ((o === 'North Europe' || o === 'Mediterranean') && d === 'US Gulf') return 'C10'
  if (o === 'US Gulf' && (d === 'North Europe' || d === 'Mediterranean')) return 'S1'
  return 'C5'
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3440
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function generateWaypoints(lat1: number, lng1: number, lat2: number, lng2: number): Array<{ lat: number; lng: number }> {
  const w: Array<{ lat: number; lng: number }> = []
  for (let i = 0; i <= 20; i++) {
    const t = i / 20
    w.push({ lat: lat1 + (lat2-lat1)*t, lng: lng1 + (lng2-lng1)*t })
  }
  return w
}

// Convert parcel to MT for calculations
function parcelToMt(commodity: string, parcelSize: number): number {
  const c = commodities[commodity]
  if (!c) return parcelSize
  if (c.unit === 'bbls') return parcelSize / (c.bblPerMt || 7.33)
  if (c.unit === 'cbm') return parcelSize * 0.45 // LNG cbm to MT approx
  return parcelSize
}

export default function PhysicalDeliveryModeling() {
  const [step, setStep] = useState(1)
  const [selectedCommodity, setSelectedCommodity] = useState('')
  const [originPort, setOriginPort] = useState('')
  const [destinationPort, setDestinationPort] = useState('')
  const [vesselClass, setVesselClass] = useState('')
  const [parcelSize, setParcelSize] = useState(0)
  const [detectedRoute, setDetectedRoute] = useState('')
  const [calculatedData, setCalculatedData] = useState<any>(null)
  const [showMap, setShowMap] = useState(false)
  const [vesselAgeEco, setVesselAgeEco] = useState(false) // below 14 years = 0.85 fuel multiplier

  const commodityConfig = selectedCommodity ? commodities[selectedCommodity] : null
  const vesselConfig = vesselClass ? vesselClasses[vesselClass] : null
  const availableVessels = commodityConfig ? Object.keys(vesselClasses).filter(v => vesselClasses[v].commodities.includes(selectedCommodity)) : []
  const allVessels = Object.keys(vesselClasses)

  // Commodity/vessel mismatch warning
  const isUnusualCombo = vesselConfig && selectedCommodity && !vesselConfig.commodities.includes(selectedCommodity)

  useEffect(() => {
    if (originPort && destinationPort) {
      const o = majorPorts.find(p => p.name === originPort)
      const d = majorPorts.find(p => p.name === destinationPort)
      if (o && d) setDetectedRoute(detectRoute(o, d))
    }
  }, [originPort, destinationPort])

  useEffect(() => {
    if (!selectedCommodity || !originPort || !destinationPort || !vesselClass || parcelSize <= 0) return
    const origin = majorPorts.find(p => p.name === originPort)
    const dest = majorPorts.find(p => p.name === destinationPort)
    const vessel = vesselClasses[vesselClass]
    const commodity = commodities[selectedCommodity]
    if (!origin || !dest || !vessel || !commodity) return

    const routeDef = routeDefinitions[detectedRoute] || { ...DEFAULT_ROUTE, distanceNm: calculateDistance(origin.lat, origin.lng, dest.lat, dest.lng) }
    const distanceNm = routeDef.distanceNm
    const sailingDays = distanceNm / (vessel.speed * 24)

    const parcelMt = parcelToMt(selectedCommodity, parcelSize)
    const fuelMult = vesselAgeEco ? 0.85 : 1
    const loadingHrs = (commodity.unit === 'bbls' ? parcelSize / 7.33 : parcelMt) / commodity.loadingRateMtHr
    const dischargeHrs = parcelMt / commodity.dischargeRateMtHr
    const loadingDays = Math.max(1, Math.ceil(loadingHrs / 24) + 0.5) // +berthing
    const dischargeDays = Math.max(1, Math.ceil(dischargeHrs / 24) + 0.5)
    const waitingOrigin = 1
    const waitingDest = 1.5
    const totalDays = waitingOrigin + loadingDays + sailingDays + waitingDest + dischargeDays

    // Costs (2025 realistic)
    const VLSFO = 550
    const hireCost = vessel.tceRate * totalDays
    const bunkerSea = vessel.fuelAtSea * fuelMult * sailingDays * VLSFO
    const bunkerPort = vessel.fuelInPort * fuelMult * (loadingDays + dischargeDays + waitingOrigin + waitingDest) * VLSFO
    const bunkerCost = bunkerSea + bunkerPort
    const portCost = vessel.portCostPerCall * 2 // load + discharge
    let canalCost = 0
    if (routeDef.viaSuez && vessel.canalSuez) canalCost += 550000
    if (routeDef.viaPanama && vessel.canalPanama) canalCost += 450000
    const agencyCost = 25000
    const demurrageExpected = 0
    const demurrageRisk = 1 * vessel.demurrageRate // 1 day risk scenario

    const totalCost = hireCost + bunkerCost + portCost + canalCost + agencyCost + demurrageExpected

    // $/unit
    let costPerUnit = 0
    let unitLabel = commodity.unit
    if (commodity.unit === 'bbls') {
      costPerUnit = totalCost / parcelSize
      unitLabel = 'bbl'
    } else if (commodity.unit === 'cbm') {
      costPerUnit = totalCost / (parcelSize * 0.45) // MT equivalent
      unitLabel = 'MT LNG'
    } else {
      costPerUnit = totalCost / parcelMt
      unitLabel = 'MT'
    }

    const tceEquivalent = totalCost / totalDays

    setCalculatedData({
      distance: distanceNm,
      sailingDays,
      loadingDays,
      dischargeDays,
      waitingOrigin,
      waitingDest,
      totalDays,
      costs: {
        freight: hireCost,
        bunker: bunkerCost,
        port: portCost,
        canal: canalCost,
        agency: agencyCost,
        demurrage: demurrageExpected,
        total: totalCost,
        perUnit: costPerUnit,
        unitLabel,
        demurrageRisk1Day: demurrageRisk,
      },
      tceEquivalent,
      origin,
      destination: dest,
      vessel,
      commodity,
      routeDef,
    })
  }, [selectedCommodity, originPort, destinationPort, vesselClass, parcelSize, detectedRoute, vesselAgeEco])

  const handleNext = () => { if (step < 4) setStep(step + 1); else setShowMap(true) }
  const handleBack = () => { if (step > 1) setStep(step - 1); if (step === 4) setShowMap(false) }
  const reset = () => { setStep(1); setSelectedCommodity(''); setOriginPort(''); setDestinationPort(''); setVesselClass(''); setParcelSize(0); setDetectedRoute(''); setCalculatedData(null); setShowMap(false) }

  // Benchmarks for context
  const getBenchmark = () => {
    if (!selectedCommodity || !calculatedData) return null
    if (selectedCommodity === 'Crude Oil') return { range: '$0.80–$4.50/bbl', route: 'TD3C VLCC' }
    if (selectedCommodity === 'Iron Ore') return { range: '$6–$25/MT', route: 'C3/C5 Capesize' }
    if (selectedCommodity === 'Grain') return { range: '$25–$55/MT', route: 'P2 Panamax' }
    if (selectedCommodity === 'Coal') return { range: '$8–$30/MT', route: 'C4/C5 Capesize' }
    return null
  }

  const benchmark = getBenchmark()

  return (
    <div className={showMap ? "h-full flex flex-col overflow-hidden" : "bg-gray-50"}>
      <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
        <h1 className="text-3xl font-bold text-black mb-2">Physical Delivery Modeling</h1>
        <p className="text-gray-600">Voyage charter cost model — industry-standard parcels, vessels & routes</p>
      </div>

      {!showMap ? (
        <div>
          <div className="max-w-4xl w-full mx-auto px-8 py-8 pb-16">
            <div className="flex items-center justify-between mb-6">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm ${step >= s ? 'bg-black border-black text-white' : 'border-gray-300 text-gray-400'}`}>
                    {step > s ? <CheckCircle size={16} /> : s}
                  </div>
                  {s < 4 && <div className={`flex-1 h-0.5 mx-2 ${step > s ? 'bg-black' : 'bg-gray-300'}`} />}
                </div>
              ))}
            </div>

            {/* Step 1: Commodity & Parcel */}
            {step === 1 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2"><Package size={20} />Step 1: Commodity & Standard Parcel</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Commodity</label>
                    <select
                      value={selectedCommodity}
                      onChange={(e) => { setSelectedCommodity(e.target.value); setParcelSize(0); setVesselClass('') }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white"
                    >
                      <option value="">Select commodity...</option>
                      {Object.keys(commodities).map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  {commodityConfig && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Standard Parcel Size</label>
                      <select
                        value={parcelSize}
                        onChange={(e) => setParcelSize(Number(e.target.value))}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white"
                      >
                        <option value={0}>Select parcel...</option>
                        {commodityConfig.parcels.map((p) => (
                          <option key={p.size} value={p.size}>{p.label} ({p.size.toLocaleString()} {commodityConfig.unit})</option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">Suggested vessels: {commodityConfig.vesselTypes.join(', ')}</p>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-end">
                  <button onClick={handleNext} disabled={!selectedCommodity || parcelSize <= 0} className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 text-sm">Next <ChevronRight size={18} /></button>
                </div>
              </div>
            )}

            {/* Step 2: Origin & Destination */}
            {step === 2 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2"><MapPin size={20} />Step 2: Origin & Destination</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Origin</label>
                      <select value={originPort} onChange={(e) => setOriginPort(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white">
                        <option value="">Select...</option>
                        {majorPorts.map((p) => <option key={p.name} value={p.name}>{p.name}, {p.country}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                      <select value={destinationPort} onChange={(e) => setDestinationPort(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white">
                        <option value="">Select...</option>
                        {majorPorts.filter(p => p.name !== originPort).map((p) => <option key={p.name} value={p.name}>{p.name}, {p.country}</option>)}
                      </select>
                    </div>
                  </div>
                  {detectedRoute && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2"><Route size={16} className="text-blue-600" /><span className="font-semibold text-blue-900 text-sm">Route {detectedRoute}</span></div>
                      <div className="text-xs text-blue-700 mt-1">{(routeDefinitions[detectedRoute] || DEFAULT_ROUTE).name} — typical: {(routeDefinitions[detectedRoute] || DEFAULT_ROUTE).typicalCommodity}</div>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-between">
                  <button onClick={handleBack} className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Back</button>
                  <button onClick={handleNext} disabled={!originPort || !destinationPort} className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 text-sm">Next <ChevronRight size={18} /></button>
                </div>
              </div>
            )}

            {/* Step 3: Vessel */}
            {step === 3 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2"><Ship size={20} />Step 3: Vessel Class</h2>
                {commodityConfig ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vessel Class</label>
                      <select value={vesselClass} onChange={(e) => setVesselClass(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white">
                        <option value="">Select...</option>
                        {allVessels.map((v) => {
                          const vc = vesselClasses[v]
                          const isTypical = vc.commodities.includes(selectedCommodity)
                          return <option key={v} value={v}>{v} — {vc.dwtMin.toLocaleString()}-{vc.dwtMax.toLocaleString()} DWT, {vc.speed} kn, TCE ~${(vc.tceRate/1000).toFixed(0)}k/day{!isTypical ? ' (unusual for this commodity)' : ''}</option>
                        })}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">Typical for {selectedCommodity}: {availableVessels.join(', ')}</p>
                    </div>
                    {vesselClass && (
                      <>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={vesselAgeEco} onChange={(e) => setVesselAgeEco(e.target.checked)} className="rounded" />
                          <span className="text-sm">Eco vessel (below 14 years) — 15% lower fuel consumption</span>
                        </label>
                        {isUnusualCombo && (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                            <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-800">Unusual combination: {vesselClass} is not typically used for {selectedCommodity}. Results may not reflect market norms.</div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Select a commodity first.</p>
                )}
                <div className="mt-6 flex justify-between">
                  <button onClick={handleBack} className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Back</button>
                  <button onClick={handleNext} disabled={!vesselClass} className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 text-sm">Next <ChevronRight size={18} /></button>
                </div>
              </div>
            )}

            {/* Step 4: Results */}
            {step === 4 && calculatedData && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2"><CheckCircle size={20} />Step 4: Results</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">Commodity</div>
                      <div className="font-semibold">{selectedCommodity}</div>
                      <div className="text-xs text-gray-600">{parcelSize.toLocaleString()} {calculatedData.commodity.unit}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">Route</div>
                      <div className="font-semibold">{detectedRoute}</div>
                      <div className="text-xs text-gray-600">{calculatedData.distance.toFixed(0)} nm</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">Vessel</div>
                      <div className="font-semibold">{vesselClass}</div>
                      <div className="text-xs text-gray-600">TCE ~${(calculatedData.vessel.tceRate/1000).toFixed(0)}k/day</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">Total Cost</div>
                      <div className="font-semibold">${(calculatedData.costs.total/1e6).toFixed(2)}M</div>
                      <div className="text-xs text-gray-600">${calculatedData.costs.perUnit.toFixed(2)}/{calculatedData.costs.unitLabel}</div>
                    </div>
                  </div>

                  {benchmark && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                      <Info size={16} className="text-slate-600" />
                      <span className="text-sm text-slate-700">Benchmark ({benchmark.route}): {benchmark.range}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold text-sm mb-3">Timeline</h3>
                    <div className="grid grid-cols-5 gap-2">
                      <div className="bg-blue-50 rounded p-2 text-center"><div className="text-xs text-gray-600">Origin</div><div className="font-bold">{(calculatedData.loadingDays + calculatedData.waitingOrigin).toFixed(1)}d</div></div>
                      <div className="bg-green-50 rounded p-2 text-center"><div className="text-xs text-gray-600">At Sea</div><div className="font-bold">{calculatedData.sailingDays.toFixed(1)}d</div></div>
                      <div className="bg-orange-50 rounded p-2 text-center"><div className="text-xs text-gray-600">Discharge</div><div className="font-bold">{(calculatedData.dischargeDays + calculatedData.waitingDest).toFixed(1)}d</div></div>
                      <div className="bg-black text-white rounded p-2 text-center"><div className="text-xs text-gray-300">Total</div><div className="font-bold">{calculatedData.totalDays.toFixed(1)}d</div></div>
                      <div className="bg-gray-100 rounded p-2 text-center"><div className="text-xs text-gray-600">TCE equiv</div><div className="font-bold">${(calculatedData.tceEquivalent/1000).toFixed(0)}k/d</div></div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold text-sm mb-3">Cost Breakdown</h3>
                    <div className="space-y-1.5">
                      {[
                        ['Freight (hire)', calculatedData.costs.freight],
                        ['Bunker', calculatedData.costs.bunker],
                        ['Port costs', calculatedData.costs.port],
                        ['Canal', calculatedData.costs.canal],
                        ['Agency', calculatedData.costs.agency],
                      ].map(([label, val]) => (
                        <div key={label} className="flex justify-between py-1 text-sm"><span className="text-gray-600">{label}</span><span className="font-medium">${((val as number)/1000).toFixed(0)}k</span></div>
                      ))}
                      <div className="flex justify-between py-2 font-bold border-t mt-2"><span>Total</span><span>${(calculatedData.costs.total/1e6).toFixed(2)}M</span></div>
                      <div className="text-xs text-gray-500 mt-1">Risk: +1 day demurrage ≈ +${(calculatedData.costs.demurrageRisk1Day/1000).toFixed(0)}k</div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-between">
                  <button onClick={handleBack} className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Back</button>
                  <button onClick={handleNext} className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 text-sm">View on Map <Navigation size={18} /></button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {calculatedData && (
            <div className="bg-white border-b border-gray-200 px-8 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-black">{originPort} → {destinationPort}</h2>
                  <div className="text-sm text-gray-600">{selectedCommodity} • {vesselClass} • Route {detectedRoute} • ${(calculatedData.costs.total/1e6).toFixed(2)}M</div>
                </div>
                <button onClick={reset} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">New Scenario</button>
              </div>
            </div>
          )}
          <div className="flex-1 relative">
            {calculatedData && (
              <Globe3D
                markers={[]}
                showCities={false}
                routes={[{
                  id: detectedRoute,
                  name: `${originPort} → ${destinationPort}`,
                  startLat: calculatedData.origin.lat,
                  startLng: calculatedData.origin.lng,
                  endLat: calculatedData.destination.lat,
                  endLng: calculatedData.destination.lng,
                  color: '#3B82F6',
                  waypoints: generateWaypoints(calculatedData.origin.lat, calculatedData.origin.lng, calculatedData.destination.lat, calculatedData.destination.lng)
                }]}
                refineries={[]}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
