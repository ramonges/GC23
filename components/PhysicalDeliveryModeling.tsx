'use client'

import { useState } from 'react'
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
  Plus,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface RouteOption {
  id: string
  name: string
  distance: number
  days: number
  cost: number
  risk: 'low' | 'medium' | 'high'
  via: string[]
  emissions: number
}

interface TimelineBreakdown {
  preDeparture: {
    waiting: number
    berthing: number
    loading: number
    documentation: number
  }
  sailing: {
    days: number
    fuelBurn: number
    weatherBuffer: number
  }
  arrival: {
    anchorage: number
    discharge: number
    congestion: number
  }
  postDischarge?: {
    storage: number
    onwardTransport: number
  }
}

interface CostBreakdown {
  freight: number
  bunker: number
  canal: number
  port: number
  agency: number
  demurrage: number
  storage: number
  total: number
  perUnit: number
}

interface Scenario {
  id: string
  name: string
  origin: string
  destination: string
  commodity: string
  grade: string
  parcelSize: number
  vessel: string
  vesselClass: string
  route: RouteOption
  timeline: TimelineBreakdown
  cost: CostBreakdown
  reliability: number
  riskDrivers: string[]
  eta: {
    earliest: string
    mostLikely: string
    latest: string
  }
}

export default function PhysicalDeliveryModeling() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  // Mock data for two scenarios
  const mockScenarios: Scenario[] = [
    {
      id: 'scenario-1',
      name: 'Iron Ore C5 - Australia to China',
      origin: 'Port Hedland, Australia',
      destination: 'Qingdao, China',
      commodity: 'Iron Ore',
      grade: '62% Fe',
      parcelSize: 170000, // tons
      vessel: 'MV Cape Harmony',
      vesselClass: 'Capesize',
      route: {
        id: 'route-1',
        name: 'Direct Route via South China Sea',
        distance: 3450,
        days: 12,
        cost: 2850000,
        risk: 'low',
        via: ['South China Sea'],
        emissions: 2450
      },
      timeline: {
        preDeparture: {
          waiting: 0.5,
          berthing: 0.2,
          loading: 2.5,
          documentation: 0.3
        },
        sailing: {
          days: 12,
          fuelBurn: 85,
          weatherBuffer: 0.5
        },
        arrival: {
          anchorage: 0.3,
          discharge: 3.0,
          congestion: 0.5
        },
        postDischarge: {
          storage: 0,
          onwardTransport: 0
        }
      },
      cost: {
        freight: 2400000,
        bunker: 320000,
        canal: 0,
        port: 85000,
        agency: 15000,
        demurrage: 0,
        storage: 0,
        total: 2820000,
        perUnit: 16.59
      },
      reliability: 87,
      riskDrivers: ['Low congestion risk', 'Favorable weather window', 'No canal exposure'],
      eta: {
        earliest: '2025-02-15',
        mostLikely: '2025-02-18',
        latest: '2025-02-22'
      }
    },
    {
      id: 'scenario-2',
      name: 'Crude Oil - Middle East to Singapore',
      origin: 'Ras Tanura, Saudi Arabia',
      destination: 'Jurong Island, Singapore',
      commodity: 'Crude Oil',
      grade: 'Arab Light',
      parcelSize: 270000, // barrels
      vessel: 'MV Sea Voyager',
      vesselClass: 'VLCC',
      route: {
        id: 'route-2',
        name: 'Via Strait of Hormuz & Malacca',
        distance: 4850,
        days: 18,
        cost: 4200000,
        risk: 'medium',
        via: ['Strait of Hormuz', 'Malacca Strait'],
        emissions: 3850
      },
      timeline: {
        preDeparture: {
          waiting: 1.0,
          berthing: 0.5,
          loading: 1.5,
          documentation: 0.5
        },
        sailing: {
          days: 18,
          fuelBurn: 120,
          weatherBuffer: 1.0
        },
        arrival: {
          anchorage: 0.5,
          discharge: 2.0,
          congestion: 1.0
        },
        postDischarge: {
          storage: 0,
          onwardTransport: 0
        }
      },
      cost: {
        freight: 3500000,
        bunker: 480000,
        canal: 0,
        port: 120000,
        agency: 25000,
        demurrage: 50000,
        storage: 0,
        total: 4175000,
        perUnit: 15.46
      },
      reliability: 72,
      riskDrivers: ['Strait of Hormuz geopolitical risk', 'Malacca Strait congestion', 'Monsoon season'],
      eta: {
        earliest: '2025-02-20',
        mostLikely: '2025-02-25',
        latest: '2025-03-02'
      }
    }
  ]

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const selectedData = selectedScenario 
    ? mockScenarios.find(s => s.id === selectedScenario) 
    : mockScenarios[0]

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-black mb-2">Physical Delivery Modeling</h1>
        <p className="text-gray-600">Model real-world delivery outcomes for physical commodities</p>
      </div>

      <div className="flex-1 flex gap-6 p-6">
        {/* Left Panel - Scenarios */}
        <div className="w-80 flex flex-col gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-black mb-4">Scenarios</h2>
            <div className="space-y-3">
              {mockScenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => setSelectedScenario(scenario.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedScenario === scenario.id
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="font-semibold mb-1">{scenario.name}</div>
                  <div className={`text-sm ${selectedScenario === scenario.id ? 'text-gray-300' : 'text-gray-600'}`}>
                    {scenario.origin} → {scenario.destination}
                  </div>
                  <div className={`text-xs mt-2 ${selectedScenario === scenario.id ? 'text-gray-400' : 'text-gray-500'}`}>
                    {scenario.vesselClass} • {scenario.reliability}% reliability
                  </div>
                </button>
              ))}
              <button className="w-full p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 text-gray-600 hover:text-black transition-all flex items-center justify-center gap-2">
                <Plus size={20} />
                <span>New Scenario</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6">
          {selectedData && (
            <>
              {/* Quick Summary Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="text-sm text-gray-600 mb-1">Total Cost</div>
                  <div className="text-2xl font-bold text-black">
                    ${(selectedData.cost.total / 1000000).toFixed(2)}M
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ${selectedData.cost.perUnit.toFixed(2)} per unit
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="text-sm text-gray-600 mb-1">Transit Days</div>
                  <div className="text-2xl font-bold text-black">
                    {selectedData.timeline.sailing.days}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    + {selectedData.timeline.preDeparture.loading + selectedData.timeline.arrival.discharge} days port
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="text-sm text-gray-600 mb-1">Reliability</div>
                  <div className="text-2xl font-bold text-black">
                    {selectedData.reliability}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    {selectedData.reliability >= 80 ? (
                      <CheckCircle size={12} className="text-green-500" />
                    ) : selectedData.reliability >= 60 ? (
                      <AlertTriangle size={12} className="text-yellow-500" />
                    ) : (
                      <AlertTriangle size={12} className="text-red-500" />
                    )}
                    {selectedData.reliability >= 80 ? 'Low Risk' : selectedData.reliability >= 60 ? 'Medium Risk' : 'High Risk'}
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="text-sm text-gray-600 mb-1">ETA Range</div>
                  <div className="text-lg font-bold text-black">
                    {selectedData.eta.mostLikely}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {selectedData.eta.earliest} - {selectedData.eta.latest}
                  </div>
                </div>
              </div>

              {/* Detailed Sections */}
              <div className="space-y-4">
                {/* Inputs Section */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <button
                    onClick={() => toggleSection('inputs')}
                    className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-all"
                  >
                    <h2 className="text-xl font-semibold text-black">1. Inputs</h2>
                    {expandedSection === 'inputs' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {expandedSection === 'inputs' && (
                    <div className="px-6 pb-6 space-y-6 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-6 pt-6">
                        <div>
                          <h3 className="font-semibold text-black mb-3 flex items-center gap-2">
                            <MapPin size={18} />
                            1.1 Origin
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div><span className="text-gray-600">Port:</span> <span className="font-medium">{selectedData.origin}</span></div>
                            <div className="text-gray-500">• Default loading rate: 8,500 tons/hour</div>
                            <div className="text-gray-500">• Historical congestion: Low</div>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-black mb-3 flex items-center gap-2">
                            <MapPin size={18} />
                            1.2 Destination
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div><span className="text-gray-600">Port:</span> <span className="font-medium">{selectedData.destination}</span></div>
                            <div className="text-gray-500">• Discharge speed: 6,000 tons/hour</div>
                            <div className="text-gray-500">• Typical waiting: 0.3-0.5 days</div>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-black mb-3 flex items-center gap-2">
                            <Package size={18} />
                            1.3 Commodity
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div><span className="text-gray-600">Type:</span> <span className="font-medium">{selectedData.commodity}</span></div>
                            <div><span className="text-gray-600">Grade:</span> <span className="font-medium">{selectedData.grade}</span></div>
                            <div><span className="text-gray-600">Parcel Size:</span> <span className="font-medium">{selectedData.parcelSize.toLocaleString()} {selectedData.commodity === 'Iron Ore' ? 'tons' : 'barrels'}</span></div>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-black mb-3 flex items-center gap-2">
                            <Ship size={18} />
                            1.4 Vessel
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div><span className="text-gray-600">Vessel:</span> <span className="font-medium">{selectedData.vessel}</span></div>
                            <div><span className="text-gray-600">Class:</span> <span className="font-medium">{selectedData.vesselClass}</span></div>
                            <div className="text-gray-500">• Cruising speed: 14 knots (eco mode)</div>
                            <div className="text-gray-500">• Fuel consumption: {selectedData.timeline.sailing.fuelBurn} MT/day</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Route Engine Section */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <button
                    onClick={() => toggleSection('route')}
                    className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-all"
                  >
                    <h2 className="text-xl font-semibold text-black">2. Route Engine</h2>
                    {expandedSection === 'route' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {expandedSection === 'route' && (
                    <div className="px-6 pb-6 space-y-4 border-t border-gray-200 pt-6">
                      <div>
                        <h3 className="font-semibold text-black mb-3 flex items-center gap-2">
                          <Route size={18} />
                          2.1 Selected Route
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{selectedData.route.name}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              selectedData.route.risk === 'low' ? 'bg-green-100 text-green-700' :
                              selectedData.route.risk === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {selectedData.route.risk.toUpperCase()} RISK
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-gray-600">Distance:</span> <span className="font-medium">{selectedData.route.distance.toLocaleString()} nm</span></div>
                            <div><span className="text-gray-600">Sailing Days:</span> <span className="font-medium">{selectedData.route.days}</span></div>
                            <div><span className="text-gray-600">Via:</span> <span className="font-medium">{selectedData.route.via.join(', ')}</span></div>
                            <div><span className="text-gray-600">Emissions:</span> <span className="font-medium">{selectedData.route.emissions.toLocaleString()} CO₂ tons</span></div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-black mb-3">2.2 Dynamic Constraints</h3>
                        <div className="space-y-2 text-sm">
                          {selectedData.riskDrivers.map((risk, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-gray-700">
                              <div className={`w-2 h-2 rounded-full ${
                                risk.toLowerCase().includes('low') || risk.toLowerCase().includes('favorable') ? 'bg-green-500' :
                                risk.toLowerCase().includes('medium') ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`} />
                              {risk}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Timeline Breakdown */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <button
                    onClick={() => toggleSection('timeline')}
                    className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-all"
                  >
                    <h2 className="text-xl font-semibold text-black">3. Timeline Breakdown</h2>
                    {expandedSection === 'timeline' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {expandedSection === 'timeline' && (
                    <div className="px-6 pb-6 space-y-4 border-t border-gray-200 pt-6">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm text-gray-600 mb-2">3.1 Pre-Departure</div>
                          <div className="space-y-1 text-sm">
                            <div>Waiting: {selectedData.timeline.preDeparture.waiting}d</div>
                            <div>Berthing: {selectedData.timeline.preDeparture.berthing}d</div>
                            <div>Loading: {selectedData.timeline.preDeparture.loading}d</div>
                            <div>Docs: {selectedData.timeline.preDeparture.documentation}d</div>
                            <div className="font-semibold mt-2 pt-2 border-t border-gray-300">
                              Total: {Object.values(selectedData.timeline.preDeparture).reduce((a, b) => a + b, 0).toFixed(1)}d
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm text-gray-600 mb-2">3.2 Sailing</div>
                          <div className="space-y-1 text-sm">
                            <div>Days: {selectedData.timeline.sailing.days}d</div>
                            <div>Fuel: {selectedData.timeline.sailing.fuelBurn} MT/day</div>
                            <div>Weather buffer: {selectedData.timeline.sailing.weatherBuffer}d</div>
                            <div className="font-semibold mt-2 pt-2 border-t border-gray-300">
                              Total: {(selectedData.timeline.sailing.days + selectedData.timeline.sailing.weatherBuffer).toFixed(1)}d
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm text-gray-600 mb-2">3.3 Arrival</div>
                          <div className="space-y-1 text-sm">
                            <div>Anchorage: {selectedData.timeline.arrival.anchorage}d</div>
                            <div>Discharge: {selectedData.timeline.arrival.discharge}d</div>
                            <div>Congestion: {selectedData.timeline.arrival.congestion}d</div>
                            <div className="font-semibold mt-2 pt-2 border-t border-gray-300">
                              Total: {Object.values(selectedData.timeline.arrival).reduce((a, b) => a + b, 0).toFixed(1)}d
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm text-gray-600 mb-2">Total Transit</div>
                          <div className="text-2xl font-bold text-black">
                            {(
                              Object.values(selectedData.timeline.preDeparture).reduce((a, b) => a + b, 0) +
                              selectedData.timeline.sailing.days + selectedData.timeline.sailing.weatherBuffer +
                              Object.values(selectedData.timeline.arrival).reduce((a, b) => a + b, 0)
                            ).toFixed(1)} days
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cost Breakdown */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <button
                    onClick={() => toggleSection('cost')}
                    className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-all"
                  >
                    <h2 className="text-xl font-semibold text-black">4. Cost Breakdown</h2>
                    {expandedSection === 'cost' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {expandedSection === 'cost' && (
                    <div className="px-6 pb-6 space-y-4 border-t border-gray-200 pt-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold text-black mb-3">4.1 Fixed & Variable Costs</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Freight Rate:</span>
                              <span className="font-medium">${(selectedData.cost.freight / 1000).toLocaleString()}k</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Bunker Fuel:</span>
                              <span className="font-medium">${(selectedData.cost.bunker / 1000).toLocaleString()}k</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Canal Fees:</span>
                              <span className="font-medium">${(selectedData.cost.canal / 1000).toLocaleString()}k</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Port Charges:</span>
                              <span className="font-medium">${(selectedData.cost.port / 1000).toLocaleString()}k</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Agency & Misc:</span>
                              <span className="font-medium">${(selectedData.cost.agency / 1000).toLocaleString()}k</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-black mb-3">4.2 Time-Based Costs</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Demurrage Risk:</span>
                              <span className="font-medium">${(selectedData.cost.demurrage / 1000).toLocaleString()}k</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Storage:</span>
                              <span className="font-medium">${(selectedData.cost.storage / 1000).toLocaleString()}k</span>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex justify-between text-lg font-bold">
                              <span>Total Landed Cost:</span>
                              <span>${(selectedData.cost.total / 1000000).toFixed(2)}M</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 mt-1">
                              <span>Cost per unit:</span>
                              <span>${selectedData.cost.perUnit.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Risk & Reliability */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <button
                    onClick={() => toggleSection('risk')}
                    className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-all"
                  >
                    <h2 className="text-xl font-semibold text-black">5. Risk & Reliability</h2>
                    {expandedSection === 'risk' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {expandedSection === 'risk' && (
                    <div className="px-6 pb-6 space-y-4 border-t border-gray-200 pt-6">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Delivery Reliability Score</span>
                            <span className={`text-2xl font-bold ${
                              selectedData.reliability >= 80 ? 'text-green-600' :
                              selectedData.reliability >= 60 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {selectedData.reliability}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full ${
                                selectedData.reliability >= 80 ? 'bg-green-500' :
                                selectedData.reliability >= 60 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${selectedData.reliability}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-black mb-3">Key Risk Drivers</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedData.riskDrivers.map((risk, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-lg p-3 text-sm">
                              {risk}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-black mb-3">ETA Confidence Intervals</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600 mb-1">Earliest (10%)</div>
                              <div className="font-semibold">{selectedData.eta.earliest}</div>
                            </div>
                            <div>
                              <div className="text-gray-600 mb-1">Most Likely (50%)</div>
                              <div className="font-semibold text-lg">{selectedData.eta.mostLikely}</div>
                            </div>
                            <div>
                              <div className="text-gray-600 mb-1">Latest (90%)</div>
                              <div className="font-semibold">{selectedData.eta.latest}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Outputs */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <button
                    onClick={() => toggleSection('outputs')}
                    className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-all"
                  >
                    <h2 className="text-xl font-semibold text-black">6. Outputs</h2>
                    {expandedSection === 'outputs' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {expandedSection === 'outputs' && (
                    <div className="px-6 pb-6 space-y-4 border-t border-gray-200 pt-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold text-black mb-3">6.1 Core Outputs</h3>
                          <div className="space-y-3">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="text-sm text-gray-600 mb-1">Total Delivery ETA</div>
                              <div className="text-xl font-bold">{selectedData.eta.mostLikely}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                Range: {selectedData.eta.earliest} - {selectedData.eta.latest}
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="text-sm text-gray-600 mb-1">Total Transit Days</div>
                              <div className="text-xl font-bold">
                                {(
                                  Object.values(selectedData.timeline.preDeparture).reduce((a, b) => a + b, 0) +
                                  selectedData.timeline.sailing.days + selectedData.timeline.sailing.weatherBuffer +
                                  Object.values(selectedData.timeline.arrival).reduce((a, b) => a + b, 0)
                                ).toFixed(1)} days
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="text-sm text-gray-600 mb-1">All-in Cost</div>
                              <div className="text-xl font-bold">${(selectedData.cost.total / 1000000).toFixed(2)}M</div>
                              <div className="text-xs text-gray-500 mt-1">
                                ${selectedData.cost.perUnit.toFixed(2)} per {selectedData.commodity === 'Iron Ore' ? 'ton' : 'barrel'}
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="text-sm text-gray-600 mb-1">Emissions Footprint</div>
                              <div className="text-xl font-bold">{selectedData.route.emissions.toLocaleString()} CO₂ tons</div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-black mb-3">6.2 Export Options</h3>
                          <div className="space-y-3">
                            <button className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-black transition-all flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Download size={20} />
                                <span className="font-medium">Export to PDF</span>
                              </div>
                            </button>
                            <button className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-black transition-all flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Download size={20} />
                                <span className="font-medium">Export to Excel</span>
                              </div>
                            </button>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="text-sm text-gray-600 mb-2">Scenario Comparison</div>
                              <div className="text-xs text-gray-500">
                                Compare this scenario with others to evaluate different routes, vessels, or departure dates.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
