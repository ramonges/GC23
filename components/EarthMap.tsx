'use client'

import { useEffect, useState, useRef } from 'react'
import { Search, Filter } from 'lucide-react'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'

// Dynamically import map to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

interface CommodityData {
  id: string
  title: string
  owner: string
  address: string
  contact: string
  long_term_contract: boolean
  contract_with: string
  supply_volume: number
  storage_volume: number
  latitude: number
  longitude: number
  commodity_type: string
  commodity_name: string
  company?: string
  api_range?: string
  sulfur_range?: string
  concentration_level?: string
}

const commodityCategories = {
  Energy: ['Crude Oil', 'Natural Gas', 'Uranium', 'Coal'],
  Metals: ['Gold', 'Silver', 'Copper', 'Steel', 'Lithium', 'Iron Ore', 'Platinum', 'Silicon', 'Titanium'],
  Agricultural: ['Soybeans', 'Wheat', 'Coffee', 'Cotton', 'Rice', 'Sugar', 'Cocoa', 'Corn'],
  Industrial: ['Cobalt', 'Aluminium', 'Zinc', 'Nickel', 'Rhodium', 'Palladium', 'Magnesium'],
  Livestock: ['Beef', 'Poultry', 'Eggs', 'Salmon', 'Live Cattle', 'Feeder Cattle', 'Lean Hogs'],
}

const companies = [
  'Trafigura', 'Glencore', 'Vitol', 'Mercuria', 'Total', 'Chevron', 'BP', 'Shell', 
  'Cargill', 'Olam', 'Storage - All', 'Storage - Independent'
]

export default function EarthMap() {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedCommodity, setSelectedCommodity] = useState<string>('')
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [showStorage, setShowStorage] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState({
    apiRange: '',
    sulfurRange: '',
    concentrationLevel: '',
  })
  const [markers, setMarkers] = useState<CommodityData[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSearch = async () => {
    try {
      let query = supabase.from('commodity_locations').select('*')

      if (selectedCategory) {
        query = query.eq('commodity_type', selectedCategory)
      }
      if (selectedCommodity) {
        query = query.eq('commodity_name', selectedCommodity)
      }
      if (selectedCompany) {
        query = query.eq('company', selectedCompany)
      }
      if (showStorage) {
        query = query.eq('is_storage', true)
      }

      const { data, error } = await query

      if (error) throw error

      setMarkers(data || [])
    } catch (err) {
      console.error('Error fetching data:', err)
    }
  }

  if (!isClient) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dark-blue">
        <p className="text-white text-xl">Loading map...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Filters Bar */}
      <div className="bg-white border-b border-gray-200 p-6 shadow-sm">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Commodity Category */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-black text-sm font-semibold mb-2">
              <Filter className="inline mr-2" size={16} />
              Commodity Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setSelectedCommodity('')
              }}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-50 text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            >
              <option value="">All Categories</option>
              {Object.keys(commodityCategories).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Specific Commodity */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-black text-sm font-semibold mb-2">
              Specific Commodity
            </label>
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-50 text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all disabled:bg-gray-200 disabled:cursor-not-allowed"
              disabled={!selectedCategory}
            >
              <option value="">All Commodities</option>
              {selectedCategory &&
                commodityCategories[selectedCategory as keyof typeof commodityCategories]?.map(
                  (commodity) => (
                    <option key={commodity} value={commodity}>
                      {commodity}
                    </option>
                  )
                )}
            </select>
          </div>

          {/* Company */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-black text-sm font-semibold mb-2">
              Asset by Company
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-50 text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            >
              <option value="">All Companies</option>
              {companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>

          {/* Storage */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 text-black cursor-pointer hover:text-accent transition-colors">
              <input
                type="checkbox"
                checked={showStorage}
                onChange={(e) => setShowStorage(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="font-semibold">Storage Facilities</span>
            </label>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="px-8 py-2.5 bg-black text-white font-bold rounded-lg hover:bg-accent transition-all duration-200 flex items-center gap-2 shadow-lg"
          >
            <Search size={20} />
            Search
          </button>
        </div>

        {/* Advanced Filters */}
        {(selectedCategory === 'Energy' || selectedCategory === 'Metals') && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-black font-semibold mb-3 flex items-center gap-2">
              <Filter size={16} />
              Advanced Filters
            </p>
            <div className="flex flex-wrap gap-4">
              {selectedCategory === 'Energy' && (
                <>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-black text-sm font-medium mb-2">API Range</label>
                    <input
                      type="text"
                      value={advancedFilters.apiRange}
                      onChange={(e) =>
                        setAdvancedFilters({ ...advancedFilters, apiRange: e.target.value })
                      }
                      placeholder="e.g., 30-40"
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-50 text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-black text-sm font-medium mb-2">Sulfur Range (%)</label>
                    <input
                      type="text"
                      value={advancedFilters.sulfurRange}
                      onChange={(e) =>
                        setAdvancedFilters({ ...advancedFilters, sulfurRange: e.target.value })
                      }
                      placeholder="e.g., 0.5-1.5"
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-50 text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                  </div>
                </>
              )}
              {selectedCategory === 'Metals' && (
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-black text-sm font-medium mb-2">Concentration Level (%)</label>
                  <input
                    type="text"
                    value={advancedFilters.concentrationLevel}
                    onChange={(e) =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        concentrationLevel: e.target.value,
                      })
                    }
                    placeholder="e.g., 5-10"
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {typeof window !== 'undefined' && (
          <MapContainer
            center={[20, 0]}
            zoom={2}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            {markers.map((marker) => (
              <Marker key={marker.id} position={[marker.latitude, marker.longitude]}>
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-lg mb-2">{marker.title}</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Owner:</strong> {marker.owner}
                      </p>
                      <p>
                        <strong>Address:</strong> {marker.address}
                      </p>
                      <p>
                        <strong>Contact:</strong> {marker.contact}
                      </p>
                      <p>
                        <strong>Long Term Contract:</strong> {marker.long_term_contract ? 'Yes' : 'No'}
                      </p>
                      {marker.long_term_contract && marker.contract_with && (
                        <p>
                          <strong>Contract With:</strong> {marker.contract_with}
                        </p>
                      )}
                      {marker.supply_volume > 0 && (
                        <p>
                          <strong>Supply Volume:</strong> {marker.supply_volume.toLocaleString()} metric tonnes
                        </p>
                      )}
                      {marker.storage_volume > 0 && (
                        <p>
                          <strong>Storage Volume:</strong> {marker.storage_volume.toLocaleString()} metric tonnes
                        </p>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        {/* Results Counter */}
        <div className="absolute bottom-6 right-6 bg-white border border-gray-300 rounded-xl px-6 py-3 z-10 shadow-lg">
          <p className="text-black font-semibold">
            {markers.length} location{markers.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>
    </div>
  )
}
