'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Filter } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import dynamic from 'next/dynamic'

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
  Energy: ['Crude Oil', 'Natural Gas', 'LNG', 'Gas Condensate', 'Uranium', 'Coal'],
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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showCargoes, setShowCargoes] = useState(false)
  const [showCities, setShowCities] = useState(true) // Cities visible by default
  const [advancedFilters, setAdvancedFilters] = useState({
    apiRange: '',
    sulfurRange: '',
    concentrationLevel: '',
  })
  const [markers, setMarkers] = useState<CommodityData[]>([])

  const fetchData = useCallback(async (ignoreCompanyAndStorage = false) => {
    try {
      let query = supabase.from('commodity_locations').select('*')

      if (selectedCategory) {
        query = query.eq('commodity_type', selectedCategory)
      }
      if (selectedCommodity) {
        query = query.eq('commodity_name', selectedCommodity)
      }
      // Only apply company and storage filters if not ignoring them (i.e., manual search)
      if (!ignoreCompanyAndStorage) {
        if (selectedCompany) {
          query = query.eq('company', selectedCompany)
        }
        if (showStorage) {
          query = query.eq('is_storage', true)
        }
      }

      const { data, error } = await query

      if (error) throw error

      setMarkers(data || [])
    } catch (err) {
      console.error('Error fetching data:', err)
    }
  }, [selectedCategory, selectedCommodity, selectedCompany, showStorage])

  // Automatically load all data when component mounts and when filters are set to "All"
  useEffect(() => {
    // Only auto-fetch when both category and commodity are empty (meaning "All")
    // When both are "All", show ALL points regardless of company/storage filters
    if (!selectedCategory && !selectedCommodity) {
      fetchData(true) // Ignore company and storage filters for auto-load
    }
  }, [selectedCategory, selectedCommodity, fetchData])

  const handleSearch = async () => {
    await fetchData(false) // Apply all filters including company and storage
  }

  return (
    <div className="flex-1 flex flex-col bg-black">
      {/* Filters Bar */}
      <div className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-700 p-6 shadow-xl">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Commodity Category */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-white text-sm font-semibold mb-2">
              <Filter className="inline mr-2" size={16} />
              Commodity Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setSelectedCommodity('')
              }}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
            <label className="block text-white text-sm font-semibold mb-2">
              Specific Commodity
            </label>
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-700 disabled:cursor-not-allowed"
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
            <label className="block text-white text-sm font-semibold mb-2">
              Asset by Company
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
            <label className="flex items-center gap-2.5 text-white cursor-pointer hover:text-blue-400 transition-colors group">
              <input
                type="checkbox"
                checked={showStorage}
                onChange={(e) => setShowStorage(e.target.checked)}
                className="w-5 h-5 rounded-md border-2 border-gray-500 bg-gray-800 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:border-blue-500 transition-all duration-200 cursor-pointer checked:bg-blue-500 checked:border-blue-500 hover:border-blue-400"
              />
              <span className="font-semibold">Storage</span>
            </label>
          </div>

          {/* Cargoes */}
          <div className="flex items-center">
            <label className="flex items-center gap-2.5 text-white cursor-pointer hover:text-blue-400 transition-colors group">
              <input
                type="checkbox"
                checked={showCargoes}
                onChange={(e) => setShowCargoes(e.target.checked)}
                className="w-5 h-5 rounded-md border-2 border-gray-500 bg-gray-800 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:border-blue-500 transition-all duration-200 cursor-pointer checked:bg-blue-500 checked:border-blue-500 hover:border-blue-400"
              />
              <span className="font-semibold">Cargo Ships</span>
            </label>
          </div>

          {/* Cities Toggle */}
          <div className="flex items-center">
            <label className="flex items-center gap-2.5 text-white cursor-pointer hover:text-blue-400 transition-colors group">
              <input
                type="checkbox"
                checked={showCities}
                onChange={(e) => setShowCities(e.target.checked)}
                className="w-5 h-5 rounded-md border-2 border-gray-500 bg-gray-800 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:border-blue-500 transition-all duration-200 cursor-pointer checked:bg-blue-500 checked:border-blue-500 hover:border-blue-400"
              />
              <span className="font-semibold">Cities</span>
            </label>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center">
            <label className="flex items-center gap-2.5 text-white cursor-pointer hover:text-blue-400 transition-colors group">
              <input
                type="checkbox"
                checked={showAdvancedFilters}
                onChange={(e) => setShowAdvancedFilters(e.target.checked)}
                className="w-5 h-5 rounded-md border-2 border-gray-500 bg-gray-800 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:border-blue-500 transition-all duration-200 cursor-pointer checked:bg-blue-500 checked:border-blue-500 hover:border-blue-400"
              />
              <span className="font-semibold">Advanced</span>
            </label>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-all duration-200 flex items-center gap-2 shadow-xl"
          >
            <Search size={20} />
            Search
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (selectedCategory === 'Energy' || selectedCategory === 'Metals') && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <p className="text-white font-semibold mb-3 flex items-center gap-2">
              <Filter size={16} />
              Advanced Filters
            </p>
            <div className="flex flex-wrap gap-4">
              {selectedCategory === 'Energy' && (
                <>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-white text-sm font-medium mb-2">API Range</label>
                    <input
                      type="text"
                      value={advancedFilters.apiRange}
                      onChange={(e) =>
                        setAdvancedFilters({ ...advancedFilters, apiRange: e.target.value })
                      }
                      placeholder="e.g., 30-40"
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-white text-sm font-medium mb-2">Sulfur Range (%)</label>
                    <input
                      type="text"
                      value={advancedFilters.sulfurRange}
                      onChange={(e) =>
                        setAdvancedFilters({ ...advancedFilters, sulfurRange: e.target.value })
                      }
                      placeholder="e.g., 0.5-1.5"
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </>
              )}
              {selectedCategory === 'Metals' && (
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-white text-sm font-medium mb-2">Concentration Level (%)</label>
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
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3D Globe */}
      <div className="flex-1 relative">
        <Globe3D markers={markers} showCities={showCities} />

        {/* Results Counter */}
        <div className="absolute bottom-6 right-6 bg-black bg-opacity-90 border border-gray-600 rounded-xl px-6 py-3 z-10 shadow-2xl backdrop-blur-sm">
          <p className="text-white font-semibold flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            {markers.length} location{markers.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Legend */}
        <div className="absolute top-6 right-6 bg-black bg-opacity-90 border border-gray-600 rounded-xl p-4 z-10 shadow-2xl backdrop-blur-sm">
          <p className="text-white font-semibold mb-3 text-sm">Commodity Types</p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF6B35]"></div>
              <span className="text-gray-300">Energy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FFD700]"></div>
              <span className="text-gray-300">Metals</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
              <span className="text-gray-300">Agricultural</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
              <span className="text-gray-300">Industrial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#EC4899]"></div>
              <span className="text-gray-300">Livestock</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
