'use client'

import { useState, useEffect } from 'react'
import { 
  Ship, 
  MapPin, 
  Package, 
  Route, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Download,
  ArrowRight,
  ChevronRight,
  Navigation,
  ChevronDown
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

// Major ports database
const majorPorts = [
  // Australia
  { name: 'Port Hedland', country: 'Australia', lat: -20.3, lng: 118.6, region: 'Oceania' },
  { name: 'Newcastle', country: 'Australia', lat: -32.9, lng: 151.8, region: 'Oceania' },
  { name: 'Sydney', country: 'Australia', lat: -33.9, lng: 151.2, region: 'Oceania' },
  { name: 'Melbourne', country: 'Australia', lat: -37.8, lng: 144.9, region: 'Oceania' },
  
  // China
  { name: 'Qingdao', country: 'China', lat: 36.1, lng: 120.4, region: 'East Asia' },
  { name: 'Shanghai', country: 'China', lat: 31.2, lng: 121.5, region: 'East Asia' },
  { name: 'Ningbo', country: 'China', lat: 29.9, lng: 121.6, region: 'East Asia' },
  { name: 'Tianjin', country: 'China', lat: 39.1, lng: 117.2, region: 'East Asia' },
  { name: 'Dalian', country: 'China', lat: 38.9, lng: 121.6, region: 'East Asia' },
  
  // Middle East
  { name: 'Ras Tanura', country: 'Saudi Arabia', lat: 26.6, lng: 50.2, region: 'Middle East' },
  { name: 'Jubail', country: 'Saudi Arabia', lat: 27.0, lng: 49.7, region: 'Middle East' },
  { name: 'Fujairah', country: 'UAE', lat: 25.1, lng: 56.3, region: 'Middle East' },
  
  // Singapore
  { name: 'Jurong Island', country: 'Singapore', lat: 1.3, lng: 103.7, region: 'Southeast Asia' },
  { name: 'Singapore', country: 'Singapore', lat: 1.3, lng: 103.8, region: 'Southeast Asia' },
  
  // Europe
  { name: 'Rotterdam', country: 'Netherlands', lat: 51.9, lng: 4.5, region: 'North Europe' },
  { name: 'Antwerp', country: 'Belgium', lat: 51.2, lng: 4.4, region: 'North Europe' },
  { name: 'Hamburg', country: 'Germany', lat: 53.6, lng: 10.0, region: 'North Europe' },
  
  // North America
  { name: 'Houston', country: 'United States', lat: 29.8, lng: -95.0, region: 'North America' },
  { name: 'New York', country: 'United States', lat: 40.7, lng: -74.0, region: 'North America' },
  { name: 'Los Angeles', country: 'United States', lat: 34.1, lng: -118.2, region: 'North America' },
  
  // South America
  { name: 'Santos', country: 'Brazil', lat: -23.9, lng: -46.3, region: 'South America' },
  { name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9, lng: -43.2, region: 'South America' },
]

// Commodities with vessel type suggestions
const commodities = {
  'Crude Oil': { vesselTypes: ['VLCC', 'Suezmax', 'Aframax'], unit: 'barrels', defaultSize: 270000 },
  'Natural Gas': { vesselTypes: ['LNG Carrier'], unit: 'cbm', defaultSize: 170000 },
  'Iron Ore': { vesselTypes: ['Capesize', 'Panamax', 'Handysize'], unit: 'tons', defaultSize: 170000 },
  'Coal': { vesselTypes: ['Capesize', 'Panamax', 'Handysize'], unit: 'tons', defaultSize: 150000 },
  'Grain': { vesselTypes: ['Panamax', 'Handysize', 'Supramax'], unit: 'tons', defaultSize: 60000 },
  'Copper': { vesselTypes: ['Handysize', 'Supramax'], unit: 'tons', defaultSize: 50000 },
  'Bauxite': { vesselTypes: ['Capesize', 'Panamax'], unit: 'tons', defaultSize: 180000 },
}

// Vessel classes with specifications
const vesselClasses = {
  'VLCC': { dwt: 300000, speed: 14, fuelConsumption: 90, freightRate: 13 },
  'Suezmax': { dwt: 160000, speed: 14.5, fuelConsumption: 60, freightRate: 9 },
  'Aframax': { dwt: 115000, speed: 14.5, fuelConsumption: 45, freightRate: 7 },
  'Capesize': { dwt: 180000, speed: 14, fuelConsumption: 55, freightRate: 8 },
  'Panamax': { dwt: 80000, speed: 14.5, fuelConsumption: 35, freightRate: 5 },
  'Handysize': { dwt: 35000, speed: 13.5, fuelConsumption: 18, freightRate: 3 },
  'Supramax': { dwt: 60000, speed: 14, fuelConsumption: 28, freightRate: 4 },
  'LNG Carrier': { dwt: 165000, speed: 19, fuelConsumption: 200, freightRate: 15 },
}

// Route detection logic based on origin/destination regions
function detectRoute(origin: typeof majorPorts[0], destination: typeof majorPorts[0]): string {
  const originRegion = origin.region
  const destRegion = destination.region
  
  // C5: Australia ↔ East Asia
  if ((originRegion === 'Oceania' && destRegion === 'East Asia') || 
      (originRegion === 'East Asia' && destRegion === 'Oceania')) {
    return 'C5'
  }
  
  // C1: Asia ↔ North Europe
  if ((originRegion === 'East Asia' && destRegion === 'North Europe') ||
      (originRegion === 'North Europe' && destRegion === 'East Asia')) {
    return 'C1'
  }
  
  // C2: Asia ↔ Mediterranean
  if ((originRegion === 'East Asia' && destRegion === 'Mediterranean') ||
      (originRegion === 'Mediterranean' && destRegion === 'East Asia')) {
    return 'C2'
  }
  
  // C3: Asia ↔ North America West Coast
  if ((originRegion === 'East Asia' && destRegion === 'North America') && 
      (destination.name.includes('Los Angeles') || destination.name.includes('Seattle'))) {
    return 'C3'
  }
  
  // C4: Asia ↔ North America East Coast
  if ((originRegion === 'East Asia' && destRegion === 'North America') && 
      (destination.name.includes('New York') || destination.name.includes('Houston'))) {
    return 'C4'
  }
  
  // C6: Asia ↔ Indian Subcontinent
  if ((originRegion === 'East Asia' && destRegion === 'Indian Subcontinent') ||
      (originRegion === 'Indian Subcontinent' && destRegion === 'East Asia')) {
    return 'C6'
  }
  
  // C7: Asia ↔ East Africa
  if ((originRegion === 'East Asia' && destRegion === 'East Africa') ||
      (originRegion === 'East Africa' && destRegion === 'East Asia')) {
    return 'C7'
  }
  
  // C10: Europe ↔ North America
  if ((originRegion === 'North Europe' && destRegion === 'North America') ||
      (originRegion === 'North America' && destRegion === 'North Europe')) {
    return 'C10'
  }
  
  // Default to C5 for Australia-China
  return 'C5'
}

// Calculate distance between two points (nautical miles)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3440 // Earth radius in nautical miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Generate waypoints along a great circle route
function generateWaypoints(lat1: number, lng1: number, lat2: number, lng2: number): Array<{ lat: number; lng: number }> {
  const waypoints: Array<{ lat: number; lng: number }> = []
  const steps = 20 // Number of waypoints
  
  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps
    const lat = lat1 + (lat2 - lat1) * fraction
    const lng = lng1 + (lng2 - lng1) * fraction
    waypoints.push({ lat, lng })
  }
  
  return waypoints
}

export default function PhysicalDeliveryModeling() {
  const [step, setStep] = useState(1)
  const [selectedCommodity, setSelectedCommodity] = useState<string>('')
  const [originPort, setOriginPort] = useState<string>('')
  const [destinationPort, setDestinationPort] = useState<string>('')
  const [vesselClass, setVesselClass] = useState<string>('')
  const [parcelSize, setParcelSize] = useState<number>(0)
  const [detectedRoute, setDetectedRoute] = useState<string>('')
  const [calculatedData, setCalculatedData] = useState<any>(null)
  const [showMap, setShowMap] = useState(false)

  // Get vessel types for selected commodity
  const availableVesselTypes = selectedCommodity && commodities[selectedCommodity as keyof typeof commodities]
    ? commodities[selectedCommodity as keyof typeof commodities].vesselTypes
    : []

  // Detect route when origin and destination are selected
  useEffect(() => {
    if (originPort && destinationPort) {
      const origin = majorPorts.find(p => p.name === originPort)
      const destination = majorPorts.find(p => p.name === destinationPort)
      if (origin && destination) {
        const route = detectRoute(origin, destination)
        setDetectedRoute(route)
      }
    }
  }, [originPort, destinationPort])

  // Calculate all metrics when all inputs are provided
  useEffect(() => {
    if (selectedCommodity && originPort && destinationPort && vesselClass && parcelSize > 0) {
      const origin = majorPorts.find(p => p.name === originPort)
      const destination = majorPorts.find(p => p.name === destinationPort)
      const vessel = vesselClasses[vesselClass as keyof typeof vesselClasses]
      const commodity = commodities[selectedCommodity as keyof typeof commodities]
      
      if (origin && destination && vessel && commodity) {
        const distance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng)
        const sailingDays = Math.round(distance / (vessel.speed * 24))
        
        // Port times (days)
        const loadingDays = Math.max(1, Math.ceil(parcelSize / (commodity.unit === 'barrels' ? 50000 : 8000)))
        const dischargeDays = Math.max(1, Math.ceil(parcelSize / (commodity.unit === 'barrels' ? 40000 : 6000)))
        const waitingOrigin = 0.5
        const waitingDestination = 0.5
        
        // Costs
        const freightRate = vessel.freightRate * parcelSize / (commodity.unit === 'barrels' ? 1000 : 1000)
        const bunkerCost = vessel.fuelConsumption * sailingDays * 650 // $650/MT bunker price
        const portCharges = (loadingDays + dischargeDays) * 15000
        const canalFees = detectedRoute === 'C1' || detectedRoute === 'C2' ? 500000 : 0
        const agency = 25000
        const demurrage = (waitingOrigin + waitingDestination) * 50000
        const totalCost = freightRate + bunkerCost + portCharges + canalFees + agency + demurrage
        const costPerUnit = totalCost / parcelSize
        
        // Reliability based on route and vessel
        let reliability = 85
        if (detectedRoute === 'C1' || detectedRoute === 'C2') reliability -= 5 // Canal risk
        if (vesselClass === 'VLCC') reliability += 5 // Larger vessels more reliable
        
        setCalculatedData({
          distance,
          sailingDays,
          loadingDays,
          dischargeDays,
          waitingOrigin,
          waitingDestination,
          totalDays: sailingDays + loadingDays + dischargeDays + waitingOrigin + waitingDestination,
          costs: {
            freight: freightRate,
            bunker: bunkerCost,
            port: portCharges,
            canal: canalFees,
            agency,
            demurrage,
            total: totalCost,
            perUnit: costPerUnit
          },
          reliability,
          origin,
          destination,
          vessel,
          commodity
        })
      }
    }
  }, [selectedCommodity, originPort, destinationPort, vesselClass, parcelSize, detectedRoute])

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      setShowMap(true)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
      if (step === 4) setShowMap(false)
    }
  }

  const reset = () => {
    setStep(1)
    setSelectedCommodity('')
    setOriginPort('')
    setDestinationPort('')
    setVesselClass('')
    setParcelSize(0)
    setDetectedRoute('')
    setCalculatedData(null)
    setShowMap(false)
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-0 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
        <h1 className="text-3xl font-bold text-black mb-2">Physical Delivery Modeling</h1>
        <p className="text-gray-600">Model real-world delivery outcomes for physical commodities</p>
      </div>

      {!showMap ? (
        <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain">
          <div className="max-w-4xl w-full mx-auto px-8 py-8 pb-16">
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-6">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm ${
                    step >= s ? 'bg-black border-black text-white' : 'border-gray-300 text-gray-400'
                  }`}>
                    {step > s ? <CheckCircle size={16} /> : s}
                  </div>
                  {s < 4 && (
                    <div className={`flex-1 h-0.5 mx-2 ${step > s ? 'bg-black' : 'bg-gray-300'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Select Commodity */}
            {step === 1 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                  <Package size={20} />
                  Step 1: Select Commodity
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Commodity Type</label>
                    <select
                      value={selectedCommodity}
                      onChange={(e) => {
                        setSelectedCommodity(e.target.value)
                        if (e.target.value) {
                          const defaultSize = commodities[e.target.value as keyof typeof commodities].defaultSize
                          setParcelSize(defaultSize)
                        }
                      }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white"
                    >
                      <option value="">Select commodity...</option>
                      {Object.keys(commodities).map((commodity) => (
                        <option key={commodity} value={commodity}>
                          {commodity}
                        </option>
                      ))}
                    </select>
                    {selectedCommodity && (
                      <div className="mt-2 text-xs text-gray-500">
                        Suggested vessels: {commodities[selectedCommodity as keyof typeof commodities].vesselTypes.join(', ')}
                      </div>
                    )}
                  </div>
                  {selectedCommodity && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Parcel Size</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={parcelSize}
                          onChange={(e) => setParcelSize(Number(e.target.value))}
                          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                          placeholder="Enter parcel size"
                        />
                        <div className="px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-600 flex items-center">
                          {commodities[selectedCommodity as keyof typeof commodities].unit}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleNext}
                    disabled={!selectedCommodity}
                    className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                  >
                    Next <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Select Origin & Destination */}
            {step === 2 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                  <MapPin size={20} />
                  Step 2: Select Origin & Destination
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Origin Port</label>
                      <select
                        value={originPort}
                        onChange={(e) => setOriginPort(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white"
                      >
                        <option value="">Select origin port...</option>
                        {majorPorts.map((port) => (
                          <option key={port.name} value={port.name}>
                            {port.name}, {port.country}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Destination Port</label>
                      <select
                        value={destinationPort}
                        onChange={(e) => setDestinationPort(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white"
                      >
                        <option value="">Select destination port...</option>
                        {majorPorts.filter(p => p.name !== originPort).map((port) => (
                          <option key={port.name} value={port.name}>
                            {port.name}, {port.country}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {detectedRoute && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Route size={16} className="text-blue-600" />
                        <span className="font-semibold text-blue-900 text-sm">Route {detectedRoute}</span>
                      </div>
                      <div className="text-xs text-blue-700 mt-1">
                        {detectedRoute === 'C5' && 'Australia ↔ East Asia'}
                        {detectedRoute === 'C1' && 'Asia (Far East) ↔ North Europe'}
                        {detectedRoute === 'C2' && 'Asia (Far East) ↔ Mediterranean'}
                        {detectedRoute === 'C3' && 'Asia ↔ North America West Coast'}
                        {detectedRoute === 'C4' && 'Asia ↔ North America East Coast'}
                        {detectedRoute === 'C6' && 'Asia ↔ Indian Subcontinent'}
                        {detectedRoute === 'C7' && 'Asia ↔ East Africa'}
                        {detectedRoute === 'C10' && 'Europe ↔ North America (Transatlantic)'}
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={handleBack}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!originPort || !destinationPort}
                    className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                  >
                    Next <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Select Vessel */}
            {step === 3 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                  <Ship size={20} />
                  Step 3: Select Vessel Class
                </h2>
                {availableVesselTypes.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vessel Class</label>
                      <select
                        value={vesselClass}
                        onChange={(e) => setVesselClass(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white"
                      >
                        <option value="">Select vessel class...</option>
                        {availableVesselTypes.map((vType) => {
                          const vessel = vesselClasses[vType as keyof typeof vesselClasses]
                          return (
                            <option key={vType} value={vType}>
                              {vType} - {vessel.dwt.toLocaleString()} DWT, {vessel.speed} knots, {vessel.fuelConsumption} MT/day
                            </option>
                          )
                        })}
                      </select>
                    </div>
                    {vesselClass && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-sm font-medium text-black mb-2">{vesselClass}</div>
                        <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                          <div>
                            <span className="font-medium">DWT:</span> {vesselClasses[vesselClass as keyof typeof vesselClasses].dwt.toLocaleString()} tons
                          </div>
                          <div>
                            <span className="font-medium">Speed:</span> {vesselClasses[vesselClass as keyof typeof vesselClasses].speed} knots
                          </div>
                          <div>
                            <span className="font-medium">Fuel:</span> {vesselClasses[vesselClass as keyof typeof vesselClasses].fuelConsumption} MT/day
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Please select a commodity first
                  </div>
                )}
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={handleBack}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!vesselClass}
                    className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                  >
                    Next <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review & Calculate */}
            {step === 4 && calculatedData && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                  <CheckCircle size={20} />
                  Step 4: Review & View Results
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">Commodity</div>
                      <div className="font-semibold">{selectedCommodity}</div>
                      <div className="text-xs text-gray-600 mt-0.5">{parcelSize.toLocaleString()} {calculatedData.commodity.unit}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">Route</div>
                      <div className="font-semibold">{detectedRoute}</div>
                      <div className="text-xs text-gray-600 mt-0.5">{calculatedData.distance.toFixed(0)} nm</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">Vessel</div>
                      <div className="font-semibold">{vesselClass}</div>
                      <div className="text-xs text-gray-600 mt-0.5">{calculatedData.vessel.dwt.toLocaleString()} DWT</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">Total Cost</div>
                      <div className="font-semibold">${(calculatedData.costs.total / 1000000).toFixed(2)}M</div>
                      <div className="text-xs text-gray-600 mt-0.5">${calculatedData.costs.perUnit.toFixed(2)}/unit</div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold text-sm mb-3">Timeline Breakdown</h3>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">Origin Port</div>
                        <div className="text-xl font-bold">{(calculatedData.loadingDays + calculatedData.waitingOrigin).toFixed(1)}</div>
                        <div className="text-xs text-gray-500">days</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">At Sea</div>
                        <div className="text-xl font-bold">{calculatedData.sailingDays}</div>
                        <div className="text-xs text-gray-500">days</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">Arrival Port</div>
                        <div className="text-xl font-bold">{(calculatedData.dischargeDays + calculatedData.waitingDestination).toFixed(1)}</div>
                        <div className="text-xs text-gray-500">days</div>
                      </div>
                      <div className="bg-black text-white rounded-lg p-3">
                        <div className="text-xs text-gray-300 mb-1">Total</div>
                        <div className="text-xl font-bold">{calculatedData.totalDays.toFixed(1)}</div>
                        <div className="text-xs text-gray-400">days</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold text-sm mb-3">Cost Breakdown</h3>
                    <div className="space-y-1.5">
                      {Object.entries(calculatedData.costs).filter(([key]) => key !== 'total' && key !== 'perUnit').map(([key, value]) => (
                        <div key={key} className="flex justify-between py-1.5 border-b border-gray-100 text-sm">
                          <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <span className="font-medium">${((value as number) / 1000).toFixed(0)}k</span>
                        </div>
                      ))}
                      <div className="flex justify-between py-2 font-bold border-t-2 border-gray-300 mt-2">
                        <span>Total:</span>
                        <span>${(calculatedData.costs.total / 1000000).toFixed(2)}M</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={handleBack}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 text-sm"
                  >
                    View on Map <Navigation size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Map Header with Results */}
          {calculatedData && (
            <div className="bg-white border-b border-gray-200 px-8 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-black">
                    {originPort} → {destinationPort}
                  </h2>
                  <div className="text-sm text-gray-600">
                    {selectedCommodity} • {vesselClass} • Route {detectedRoute}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Total Cost</div>
                    <div className="text-xl font-bold">${(calculatedData.costs.total / 1000000).toFixed(2)}M</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Transit Days</div>
                    <div className="text-xl font-bold">{calculatedData.totalDays}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Reliability</div>
                    <div className="text-xl font-bold">{calculatedData.reliability}%</div>
                  </div>
                  <button
                    onClick={reset}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    New Scenario
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Earth Map */}
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
                  waypoints: generateWaypoints(
                    calculatedData.origin.lat,
                    calculatedData.origin.lng,
                    calculatedData.destination.lat,
                    calculatedData.destination.lng
                  )
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
