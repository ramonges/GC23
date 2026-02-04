'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, Filter } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { CommodityData, RefineryData, ShippingRoute } from '@/lib/types'
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

const commodityCategories = {
  Energy: ['Crude Oil', 'Natural Gas', 'Oil & Gas', 'LNG', 'Gas Condensate', 'Uranium', 'Coal'],
  Metals: ['Gold', 'Silver', 'Copper', 'Steel', 'Lithium', 'Iron Ore', 'Platinum', 'Silicon', 'Titanium'],
  Agricultural: ['Soybeans', 'Wheat', 'Coffee', 'Cotton', 'Rice', 'Sugar', 'Cocoa', 'Corn'],
  Industrial: ['Cobalt', 'Aluminium', 'Zinc', 'Nickel', 'Rhodium', 'Palladium', 'Magnesium'],
  Livestock: ['Beef', 'Poultry', 'Eggs', 'Salmon', 'Live Cattle', 'Feeder Cattle', 'Lean Hogs'],
}

const companies = [
  'Trafigura', 'Glencore', 'Vitol', 'Mercuria', 'Total', 'Chevron', 'BP', 'Shell', 
  'Cargill', 'Olam',
  // Algeria companies
  'Sonatrach', 'Cepsa', 'Eni', 'Occidental Petroleum', 'TotalEnergies', 'Repsol', 
  'PTTEP', 'Petrovietnam', 'Wintershall Dea', 'Groupement Berkine', 'Organisation Ourhoud', 
  'Groupement Reggane Nord', 'Groupement Isarene',
  // Angola companies
  'ExxonMobil', 'Pluspetrol', 'Sonangol', 'Cobalt International Energy',
  // Azerbaijan companies
  'SOCAR', 'Lukoil', 'Equinor', 'TPAO', 'Petronas', 'Union Grand Energy', 'Binagadi Oil Company',
  // Bahrain companies
  'Saudi Aramco', 'Bapco Energies',
  // Benin companies
  'Rex International', 'Saga Petroleum', 'Addax Petroleum',
  // Brunei companies
  'Hibiscus Petroleum', 'EnQuest',
  // Cameroon companies
  'Perenco', 'Tower Resources', 'NewAge', 'Bowleven', 'Victoria Oil & Gas', 'Sinopec',
  // Chad companies
  'SHT', 'CNPC',
  // China companies
  'CNOOC', 'ConocoPhillips', 'Genting',
  // Congo DRC & Republic companies
  'Trident Energy', 'Canadian Natural Resources', 'Murphy Oil', 'BW Energy', 'VAALCO Energy', 'Assala Energy',
  // Côte d\'Ivoire companies
  'Foxtrot International',
  // Egypt companies
  'Apache', 'BAPETCO', 'Cheiron', 'Dana Gas', 'EGPC', 'Energean', 'GPC', 'GUPCO',
  'Gemsa Petroleum Company', 'Khalda Petroleum', 'Kuwait Energy', 'PetroGulf Misr',
  'Petrobel', 'Rashid Petroleum Company', 'SUCO', 'Tharwa Petroleum Company', 'Vegas Oil & Gas',
  // Equatorial Guinea companies
  'GEPetrol', 'Marathon Oil',
  // Ghana companies
  'Tullow Oil', 'MODEC',
  // India companies
  'ONGC', 'Oil India Limited', 'Cairn Oil & Gas', 'Reliance Industries', 'Selan', 'Nippon Power Limited',
  // Libya companies
  'AGOCO', 'Akakus Oil', 'Harouge Oil', 'Mellitah Oil & Gas', 'NOC Libya',
  'Sirte Oil Company', 'Waha Oil Company', 'Zueitina Oil Company',
  // Niger companies
  'Savannah Energy',
  // Nigeria companies
  'Aradel Energy', 'NNPC', 'Seplat Energy', 'Oando', 'Heirs Holdings', 'Heritage Oil', 'Elcrest Exploration',
  // Norway companies
  'Aker BP', 'DNO', 'Harbour Energy', 'OKEA', 'Vår Energi', 'Petoro',
  // South Africa companies
  'PetroSA',
  // South Sudan companies
  'GPOC', 'GNPOC', 'DPOC', 'SPOC', 'Nilepet',
  // Sudan companies
  'Sudapet', 'WNPOC',
  // Tunisia companies
  'ETAP', 'OMV', 'Panoro Energy', 'Petrofac', 'SEREPT', 'Serinus Energy', 'SITEP',
  // Uganda companies
  'UNOC'
]

const shippingRoutes: ShippingRoute[] = [
  // C1: Asia ↔ Europe (via Suez Canal, around Spain through Gibraltar)
  { 
    id: 'C1', 
    name: 'Asia ↔ Europe (Far East to North Europe / Med)', 
    startLat: 35.7, startLng: 139.8, 
    endLat: 51.5, endLng: -0.1, 
    color: '#3B82F6',
    waypoints: [
      { lat: 32.0, lng: 130.0 }, // East China Sea
      { lat: 28.0, lng: 125.0 }, // East China Sea
      { lat: 22.0, lng: 118.0 }, // Taiwan Strait
      { lat: 15.0, lng: 115.0 }, // South China Sea
      { lat: 8.0, lng: 110.0 }, // South China Sea
      { lat: 3.0, lng: 106.0 }, // Java Sea
      { lat: 1.3, lng: 103.8 }, // Singapore Strait
      { lat: 2.0, lng: 100.0 }, // Malacca Strait
      { lat: 4.0, lng: 90.0 }, // Bay of Bengal
      { lat: 6.0, lng: 80.0 }, // Indian Ocean
      { lat: 8.0, lng: 70.0 }, // Indian Ocean
      { lat: 10.0, lng: 60.0 }, // Arabian Sea
      { lat: 12.0, lng: 50.0 }, // Gulf of Aden
      { lat: 15.0, lng: 42.0 }, // Red Sea
      { lat: 20.0, lng: 38.0 }, // Red Sea
      { lat: 25.0, lng: 35.0 }, // Red Sea
      { lat: 29.9, lng: 32.5 }, // Suez Canal
      { lat: 32.0, lng: 30.0 }, // Eastern Mediterranean
      { lat: 35.0, lng: 25.0 }, // Eastern Mediterranean
      { lat: 37.0, lng: 20.0 }, // Central Mediterranean (south of Italy)
      { lat: 38.0, lng: 15.0 }, // Central Mediterranean
      { lat: 37.0, lng: 10.0 }, // Western Mediterranean (south of France)
      { lat: 36.0, lng: 5.0 }, // Western Mediterranean (off Algeria)
      { lat: 36.0, lng: 0.0 }, // Western Mediterranean (off Algeria)
      { lat: 36.0, lng: -3.0 }, // Strait of Gibraltar approach
      { lat: 35.9, lng: -5.3 }, // Strait of Gibraltar
      { lat: 36.0, lng: -8.0 }, // Atlantic (off Portugal)
      { lat: 38.0, lng: -10.0 }, // Atlantic (off Portugal)
      { lat: 40.0, lng: -10.0 }, // Atlantic (off Spain)
      { lat: 42.0, lng: -10.0 }, // Atlantic (off Spain)
      { lat: 45.0, lng: -8.0 }, // Atlantic (off France)
      { lat: 48.0, lng: -5.0 }, // Atlantic (off France)
      { lat: 50.0, lng: -2.0 }, // English Channel approach
      { lat: 50.5, lng: -1.0 }, // English Channel
    ]
  },
  // C2: Asia ↔ Mediterranean (via Suez)
  { 
    id: 'C2', 
    name: 'Asia ↔ Mediterranean', 
    startLat: 35.7, startLng: 139.8, 
    endLat: 41.0, endLng: 28.9, 
    color: '#8B5CF6',
    waypoints: [
      { lat: 30.0, lng: 125.0 }, // East China Sea
      { lat: 20.0, lng: 115.0 }, // South China Sea
      { lat: 10.0, lng: 110.0 }, // South China Sea
      { lat: 3.0, lng: 105.0 }, // Java Sea
      { lat: 1.3, lng: 103.8 }, // Singapore Strait
      { lat: 2.0, lng: 95.0 }, // Malacca Strait
      { lat: 5.0, lng: 85.0 }, // Bay of Bengal
      { lat: 6.0, lng: 80.0 }, // Indian Ocean
      { lat: 8.0, lng: 70.0 }, // Indian Ocean
      { lat: 10.0, lng: 60.0 }, // Arabian Sea
      { lat: 12.0, lng: 50.0 }, // Gulf of Aden
      { lat: 15.0, lng: 42.0 }, // Red Sea
      { lat: 20.0, lng: 38.0 }, // Red Sea
      { lat: 25.0, lng: 35.0 }, // Red Sea
      { lat: 29.9, lng: 32.5 }, // Suez Canal
      { lat: 32.0, lng: 30.0 }, // Eastern Mediterranean
      { lat: 35.0, lng: 27.0 }, // Eastern Mediterranean (off Turkey)
      { lat: 38.0, lng: 28.0 }, // Eastern Mediterranean (off Turkey)
      { lat: 40.0, lng: 28.5 }, // Eastern Mediterranean (off Turkey)
    ]
  },
  // C3: Asia ↔ North America West Coast (Transpacific)
  { 
    id: 'C3', 
    name: 'Asia ↔ North America West Coast', 
    startLat: 35.7, startLng: 139.8, 
    endLat: 37.8, endLng: -122.4, 
    color: '#10B981',
    waypoints: [
      { lat: 33.0, lng: 135.0 }, // Pacific Ocean
      { lat: 30.0, lng: 140.0 }, // Pacific Ocean
      { lat: 35.0, lng: 150.0 }, // Pacific Ocean (northern route)
      { lat: 38.0, lng: 160.0 }, // Pacific Ocean
      { lat: 40.0, lng: 170.0 }, // Pacific Ocean
      { lat: 42.0, lng: -175.0 }, // Pacific Ocean
      { lat: 42.0, lng: -165.0 }, // Mid-Pacific
      { lat: 40.0, lng: -155.0 }, // Mid-Pacific
      { lat: 40.0, lng: -150.0 }, // Mid-Pacific
      { lat: 40.0, lng: -140.0 }, // North Pacific
      { lat: 40.0, lng: -130.0 }, // North Pacific
      { lat: 38.0, lng: -125.0 }, // North Pacific approach
    ]
  },
  // C4: Asia ↔ North America East Coast (Pacifique → Panama → Atlantique - NO Indian Ocean, NO Europe)
  { 
    id: 'C4', 
    name: 'Asia ↔ North America East Coast', 
    startLat: 35.7, startLng: 139.8, 
    endLat: 40.7, endLng: -74.0, 
    color: '#F59E0B',
    waypoints: [
      // Asie de l'Est
      { lat: 35.0, lng: 139.0 }, // Tokyo Bay (off Japan)
      { lat: 33.0, lng: 130.0 }, // East China Sea (off Japan)
      { lat: 30.0, lng: 125.0 }, // East China Sea (off China/Korea)
      { lat: 28.0, lng: 122.0 }, // East China Sea (off China)
      { lat: 25.0, lng: 120.0 }, // East China Sea (off China/Taiwan)
      { lat: 22.0, lng: 118.0 }, // Taiwan Strait (off Taiwan)
      { lat: 20.0, lng: 116.0 }, // South China Sea (off China)
      { lat: 18.0, lng: 115.0 }, // South China Sea (off Philippines)
      { lat: 15.0, lng: 115.0 }, // South China Sea (off Philippines)
      { lat: 12.0, lng: 114.0 }, // South China Sea (off Philippines)
      { lat: 8.0, lng: 112.0 }, // South China Sea (off Philippines)
      { lat: 5.0, lng: 110.0 }, // South China Sea (off Malaysia)
      { lat: 2.0, lng: 108.0 }, // South China Sea (off Indonesia)
      { lat: 0.0, lng: 108.0 }, // South China Sea (off Indonesia)
      // Océan Pacifique
      { lat: -2.0, lng: 112.0 }, // Java Sea (off Indonesia)
      { lat: -5.0, lng: 115.0 }, // Java Sea (off Indonesia)
      { lat: -5.0, lng: 120.0 }, // Banda Sea (off Indonesia)
      { lat: -5.0, lng: 125.0 }, // Banda Sea (off Indonesia)
      { lat: -5.0, lng: 130.0 }, // Arafura Sea (off Indonesia)
      { lat: 0.0, lng: 135.0 }, // Pacific Ocean (off Papua New Guinea)
      { lat: 0.0, lng: 140.0 }, // Pacific Ocean (off Papua New Guinea)
      { lat: 5.0, lng: 145.0 }, // Pacific Ocean
      { lat: 5.0, lng: 150.0 }, // Pacific Ocean
      { lat: 5.0, lng: 155.0 }, // Pacific Ocean
      { lat: 5.0, lng: 160.0 }, // Pacific Ocean
      { lat: 5.0, lng: 165.0 }, // Pacific Ocean
      { lat: 5.0, lng: 170.0 }, // Pacific Ocean
      { lat: 5.0, lng: -175.0 }, // Pacific Ocean
      { lat: 5.0, lng: -170.0 }, // Pacific Ocean
      { lat: 5.0, lng: -165.0 }, // Pacific Ocean
      { lat: 5.0, lng: -160.0 }, // Pacific Ocean
      { lat: 5.0, lng: -155.0 }, // Pacific Ocean
      { lat: 5.0, lng: -150.0 }, // Pacific Ocean
      { lat: 5.0, lng: -145.0 }, // Pacific Ocean
      { lat: 5.0, lng: -140.0 }, // Pacific Ocean
      { lat: 5.0, lng: -135.0 }, // Pacific Ocean
      { lat: 5.0, lng: -130.0 }, // Pacific Ocean
      { lat: 5.0, lng: -125.0 }, // Pacific Ocean
      { lat: 5.0, lng: -120.0 }, // Pacific Ocean
      { lat: 5.0, lng: -115.0 }, // Pacific Ocean
      { lat: 5.0, lng: -110.0 }, // Pacific Ocean
      { lat: 5.0, lng: -105.0 }, // Pacific Ocean
      { lat: 5.0, lng: -100.0 }, // Pacific Ocean
      { lat: 5.0, lng: -95.0 }, // Pacific Ocean
      { lat: 5.0, lng: -90.0 }, // Pacific Ocean (approach to Panama)
      { lat: 7.0, lng: -85.0 }, // Pacific Ocean (approach to Panama)
      { lat: 8.0, lng: -82.0 }, // Pacific Ocean (approach to Panama)
      { lat: 8.5, lng: -80.0 }, // Pacific Ocean (approach to Panama)
      // Canal de Panama
      { lat: 9.0, lng: -79.5 }, // Panama Canal (Pacific side)
      { lat: 9.0, lng: -79.5 }, // Panama Canal
      { lat: 9.5, lng: -79.5 }, // Panama Canal (Atlantic side)
      // Océan Atlantique
      { lat: 10.0, lng: -79.0 }, // Caribbean Sea (off Panama - at sea)
      { lat: 12.0, lng: -78.0 }, // Caribbean Sea (off Colombia - at sea)
      { lat: 15.0, lng: -76.0 }, // Caribbean Sea (off Jamaica - at sea)
      { lat: 18.0, lng: -73.0 }, // Caribbean Sea (off Haiti/Dominican Republic - at sea)
      { lat: 20.0, lng: -71.0 }, // Atlantic (off Dominican Republic - at sea)
      { lat: 22.0, lng: -70.0 }, // Atlantic (off Bahamas - at sea)
      { lat: 25.0, lng: -70.5 }, // Atlantic (off Bahamas - at sea)
      { lat: 28.0, lng: -71.0 }, // Atlantic (off US East Coast - at sea)
      { lat: 30.0, lng: -72.0 }, // Atlantic (off US East Coast - at sea)
      { lat: 32.0, lng: -72.5 }, // Atlantic (off US East Coast - at sea)
      { lat: 35.0, lng: -73.0 }, // Atlantic (off US East Coast - at sea)
      { lat: 38.0, lng: -73.5 }, // Atlantic (off US East Coast - at sea)
      { lat: 40.0, lng: -73.8 }, // Atlantic (off New York/NJ - at sea)
      { lat: 40.7, lng: -73.9 }, // New York approach (at sea)
    ]
  },
  // C5: Asia ↔ Middle East (via Indian Ocean, around Arabian Peninsula)
  { 
    id: 'C5', 
    name: 'Asia ↔ Middle East', 
    startLat: 35.7, startLng: 139.8, 
    endLat: 25.2, endLng: 55.3, 
    color: '#EF4444',
    waypoints: [
      { lat: 30.0, lng: 125.0 }, // East China Sea
      { lat: 20.0, lng: 115.0 }, // South China Sea
      { lat: 10.0, lng: 110.0 }, // South China Sea
      { lat: 3.0, lng: 105.0 }, // Java Sea
      { lat: 1.3, lng: 103.8 }, // Singapore Strait
      { lat: 2.0, lng: 95.0 }, // Malacca Strait
      { lat: 5.0, lng: 85.0 }, // Bay of Bengal
      { lat: 6.0, lng: 80.0 }, // Bay of Bengal
      { lat: 8.0, lng: 77.0 }, // Indian Ocean
      { lat: 10.0, lng: 73.0 }, // Indian Ocean
      { lat: 12.0, lng: 68.0 }, // Indian Ocean
      { lat: 15.0, lng: 63.0 }, // Arabian Sea (off India)
      { lat: 18.0, lng: 60.0 }, // Arabian Sea (off Pakistan)
      { lat: 20.0, lng: 58.0 }, // Arabian Sea (off Oman)
      { lat: 22.0, lng: 58.0 }, // Gulf of Oman (off Oman)
      { lat: 24.0, lng: 57.0 }, // Gulf of Oman (off UAE)
      { lat: 24.5, lng: 56.0 }, // Persian Gulf (off UAE)
      { lat: 25.0, lng: 55.0 }, // Persian Gulf (off UAE)
      { lat: 25.2, lng: 55.2 }, // Dubai approach
    ]
  },
  // C6: Asia ↔ Indian Subcontinent
  { 
    id: 'C6', 
    name: 'Asia ↔ Indian Subcontinent', 
    startLat: 35.7, startLng: 139.8, 
    endLat: 19.1, endLng: 72.9, 
    color: '#EC4899',
    waypoints: [
      { lat: 30.0, lng: 125.0 }, // East China Sea
      { lat: 20.0, lng: 115.0 }, // South China Sea
      { lat: 10.0, lng: 110.0 }, // South China Sea
      { lat: 3.0, lng: 105.0 }, // Java Sea
      { lat: 1.3, lng: 103.8 }, // Singapore Strait
      { lat: 2.0, lng: 95.0 }, // Malacca Strait
      { lat: 4.0, lng: 88.0 }, // Bay of Bengal
      { lat: 6.0, lng: 82.0 }, // Bay of Bengal
      { lat: 8.0, lng: 78.0 }, // Bay of Bengal
      { lat: 10.0, lng: 77.0 }, // Indian Ocean
      { lat: 12.0, lng: 75.0 }, // Indian Ocean
      { lat: 15.0, lng: 73.0 }, // Indian Ocean
      { lat: 17.0, lng: 72.5 }, // Indian Ocean
    ]
  },
  // C7: Asia ↔ Africa (via Indian Ocean, around Cape)
  { 
    id: 'C7', 
    name: 'Asia ↔ Africa', 
    startLat: 35.7, startLng: 139.8, 
    endLat: -33.9, endLng: 18.4, 
    color: '#14B8A6',
    waypoints: [
      { lat: 25.0, lng: 125.0 }, // East China Sea
      { lat: 15.0, lng: 115.0 }, // South China Sea
      { lat: 5.0, lng: 108.0 }, // Java Sea
      { lat: 1.3, lng: 103.8 }, // Singapore Strait
      { lat: 0.0, lng: 100.0 }, // Malacca Strait
      { lat: -2.0, lng: 95.0 }, // Indian Ocean
      { lat: -5.0, lng: 90.0 }, // Indian Ocean
      { lat: -8.0, lng: 85.0 }, // Indian Ocean
      { lat: -10.0, lng: 80.0 }, // Indian Ocean
      { lat: -12.0, lng: 75.0 }, // Indian Ocean
      { lat: -15.0, lng: 70.0 }, // Indian Ocean
      { lat: -18.0, lng: 65.0 }, // Indian Ocean
      { lat: -20.0, lng: 60.0 }, // Central Indian Ocean
      { lat: -25.0, lng: 50.0 }, // Indian Ocean
      { lat: -30.0, lng: 40.0 }, // Indian Ocean
      { lat: -32.0, lng: 30.0 }, // Indian Ocean
      { lat: -34.0, lng: 25.0 }, // Cape of Good Hope approach
      { lat: -35.0, lng: 20.0 }, // Cape of Good Hope
      { lat: -34.0, lng: 18.5 }, // Cape Town approach
    ]
  },
  // C8: Intra-Asia (South China Sea routes)
  { 
    id: 'C8', 
    name: 'Intra-Asia', 
    startLat: 22.3, startLng: 114.2, 
    endLat: 1.3, endLng: 103.8, 
    color: '#06B6D4',
    waypoints: [
      { lat: 22.0, lng: 114.0 }, // South China Sea (off Hong Kong)
      { lat: 20.0, lng: 113.0 }, // South China Sea (off China)
      { lat: 18.0, lng: 112.0 }, // South China Sea (off China/Vietnam)
      { lat: 15.0, lng: 110.0 }, // South China Sea (off Vietnam)
      { lat: 12.0, lng: 109.0 }, // South China Sea (off Vietnam)
      { lat: 10.0, lng: 108.0 }, // South China Sea (off Vietnam)
      { lat: 8.0, lng: 107.0 }, // South China Sea (off Vietnam)
      { lat: 6.0, lng: 106.0 }, // Gulf of Thailand (off Vietnam)
      { lat: 5.0, lng: 105.0 }, // Gulf of Thailand (off Thailand)
      { lat: 3.0, lng: 104.0 }, // Gulf of Thailand (off Malaysia)
      { lat: 2.0, lng: 103.5 }, // Malacca Strait approach (off Malaysia)
    ]
  },
  // C9: Australia ↔ China / East Asia
  { 
    id: 'C9', 
    name: 'Australia ↔ China / East Asia', 
    startLat: -33.9, startLng: 151.2, 
    endLat: 31.2, endLng: 121.5, 
    color: '#84CC16',
    waypoints: [
      { lat: -33.0, lng: 151.5 }, // Tasman Sea (off Sydney)
      { lat: -30.0, lng: 153.0 }, // Tasman Sea
      { lat: -25.0, lng: 155.0 }, // Coral Sea (off Australia)
      { lat: -20.0, lng: 152.0 }, // Coral Sea (off Australia)
      { lat: -15.0, lng: 147.0 }, // Coral Sea (off Australia)
      { lat: -12.0, lng: 142.0 }, // Arafura Sea (off Australia)
      { lat: -10.0, lng: 137.0 }, // Arafura Sea (off Australia)
      { lat: -8.0, lng: 132.0 }, // Arafura Sea (off Indonesia)
      { lat: -5.0, lng: 130.0 }, // Arafura Sea (off Indonesia)
      { lat: -2.0, lng: 127.0 }, // Banda Sea (off Indonesia)
      { lat: 0.0, lng: 125.0 }, // Banda Sea (off Indonesia)
      { lat: 3.0, lng: 122.0 }, // Celebes Sea (off Indonesia)
      { lat: 5.0, lng: 120.0 }, // Celebes Sea (off Philippines)
      { lat: 8.0, lng: 118.0 }, // Sulu Sea (off Philippines)
      { lat: 10.0, lng: 117.0 }, // South China Sea (off Philippines)
      { lat: 15.0, lng: 116.0 }, // South China Sea (off Philippines)
      { lat: 18.0, lng: 118.0 }, // South China Sea (off Taiwan)
      { lat: 22.0, lng: 119.0 }, // South China Sea (off Taiwan)
      { lat: 25.0, lng: 120.0 }, // East China Sea (off Taiwan)
      { lat: 28.0, lng: 121.0 }, // East China Sea (off China)
      { lat: 30.0, lng: 121.5 }, // East China Sea (off China)
    ]
  },
  // C10: Europe ↔ North America (Transatlantic)
  { 
    id: 'C10', 
    name: 'Europe ↔ North America', 
    startLat: 51.5, startLng: -0.1, 
    endLat: 40.7, endLng: -74.0, 
    color: '#6366F1',
    waypoints: [
      { lat: 51.0, lng: -2.0 }, // English Channel
      { lat: 51.0, lng: -5.0 }, // Celtic Sea (off UK/Ireland)
      { lat: 50.0, lng: -10.0 }, // North Atlantic (off Ireland)
      { lat: 49.0, lng: -15.0 }, // North Atlantic
      { lat: 48.0, lng: -20.0 }, // North Atlantic
      { lat: 47.0, lng: -25.0 }, // North Atlantic
      { lat: 46.0, lng: -30.0 }, // Mid-Atlantic
      { lat: 45.0, lng: -35.0 }, // Mid-Atlantic
      { lat: 44.0, lng: -40.0 }, // Mid-Atlantic
      { lat: 43.0, lng: -45.0 }, // Western Atlantic
      { lat: 42.0, lng: -50.0 }, // Western Atlantic
      { lat: 41.5, lng: -55.0 }, // Western Atlantic
      { lat: 41.0, lng: -60.0 }, // Western Atlantic
      { lat: 40.8, lng: -65.0 }, // Western Atlantic
      { lat: 40.7, lng: -70.0 }, // Western Atlantic approach
      { lat: 40.7, lng: -73.0 }, // New York approach
    ]
  },
  // C11: Europe ↔ Africa (via Atlantic, around Africa)
  { 
    id: 'C11', 
    name: 'Europe ↔ Africa', 
    startLat: 51.5, startLng: -0.1, 
    endLat: -33.9, endLng: 18.4, 
    color: '#A855F7',
    waypoints: [
      { lat: 51.0, lng: -2.0 }, // English Channel
      { lat: 50.0, lng: -5.0 }, // Celtic Sea
      { lat: 48.0, lng: -8.0 }, // Bay of Biscay (off France)
      { lat: 45.0, lng: -10.0 }, // Atlantic (off Portugal)
      { lat: 42.0, lng: -10.0 }, // Atlantic (off Spain)
      { lat: 38.0, lng: -9.0 }, // Atlantic (off Portugal)
      { lat: 36.0, lng: -7.0 }, // Atlantic (off Portugal)
      { lat: 35.0, lng: -6.0 }, // Strait of Gibraltar approach
      { lat: 35.9, lng: -5.3 }, // Strait of Gibraltar
      { lat: 35.0, lng: -4.0 }, // Mediterranean (off Morocco)
      { lat: 32.0, lng: -5.0 }, // Atlantic (off Morocco)
      { lat: 28.0, lng: -10.0 }, // Atlantic (off Western Sahara)
      { lat: 25.0, lng: -15.0 }, // Atlantic (off Mauritania)
      { lat: 20.0, lng: -18.0 }, // Atlantic (off Senegal)
      { lat: 15.0, lng: -18.0 }, // Atlantic (off Guinea)
      { lat: 10.0, lng: -16.0 }, // Atlantic (off Sierra Leone)
      { lat: 5.0, lng: -15.0 }, // Atlantic (off Liberia)
      { lat: 0.0, lng: -12.0 }, // Atlantic (off Equatorial Guinea)
      { lat: -5.0, lng: -8.0 }, // Atlantic (off Gabon)
      { lat: -10.0, lng: -5.0 }, // Atlantic (off Angola)
      { lat: -15.0, lng: 0.0 }, // Atlantic (off Angola)
      { lat: -20.0, lng: 5.0 }, // Atlantic (off Namibia)
      { lat: -25.0, lng: 10.0 }, // Atlantic (off Namibia)
      { lat: -30.0, lng: 15.0 }, // Atlantic (off South Africa)
      { lat: -32.0, lng: 17.0 }, // Cape Town approach
      { lat: -33.5, lng: 18.2 }, // Cape Town
    ]
  },
  // C12: Europe ↔ Middle East (via Atlantic → Mediterranean → Suez → around Arabian Peninsula)
  { 
    id: 'C12', 
    name: 'Europe ↔ Middle East', 
    startLat: 51.5, startLng: -0.1, 
    endLat: 25.2, endLng: 55.3, 
    color: '#F97316',
    waypoints: [
      { lat: 51.0, lng: 0.0 }, // English Channel (off UK - at sea)
      { lat: 50.0, lng: -2.0 }, // English Channel (off UK - at sea)
      { lat: 49.0, lng: -5.0 }, // Celtic Sea (off UK/Ireland - at sea)
      { lat: 48.0, lng: -8.0 }, // Bay of Biscay (off France - at sea)
      { lat: 45.0, lng: -10.0 }, // Atlantic (off France - at sea)
      { lat: 42.0, lng: -10.0 }, // Atlantic (off Spain - at sea)
      { lat: 40.0, lng: -9.0 }, // Atlantic (off Spain - at sea)
      { lat: 38.0, lng: -8.0 }, // Atlantic (off Portugal - at sea)
      { lat: 36.0, lng: -7.0 }, // Atlantic (off Portugal - at sea)
      { lat: 36.0, lng: -6.0 }, // Strait of Gibraltar approach (off Spain - at sea)
      { lat: 35.9, lng: -5.3 }, // Strait of Gibraltar
      { lat: 36.0, lng: -4.0 }, // Mediterranean (off Spain - at sea)
      { lat: 37.0, lng: -1.0 }, // Mediterranean (off Spain - at sea)
      { lat: 38.0, lng: 2.0 }, // Mediterranean (off Spain - at sea)
      { lat: 39.0, lng: 5.0 }, // Mediterranean (off Spain - at sea)
      { lat: 38.0, lng: 10.0 }, // Mediterranean (off Italy - at sea)
      { lat: 38.0, lng: 15.0 }, // Mediterranean (south of Italy - at sea)
      { lat: 36.0, lng: 18.0 }, // Mediterranean (south of Italy - at sea)
      { lat: 35.0, lng: 22.0 }, // Eastern Mediterranean (off Greece - at sea)
      { lat: 35.0, lng: 25.0 }, // Eastern Mediterranean (off Cyprus - at sea)
      { lat: 33.0, lng: 27.0 }, // Eastern Mediterranean (off Egypt - at sea)
      { lat: 31.0, lng: 29.0 }, // Eastern Mediterranean (off Egypt - at sea)
      { lat: 29.9, lng: 32.5 }, // Suez Canal
      { lat: 28.0, lng: 34.0 }, // Red Sea (off Egypt)
      { lat: 26.0, lng: 36.0 }, // Red Sea (off Saudi Arabia - west coast)
      { lat: 24.0, lng: 38.0 }, // Red Sea (off Saudi Arabia - west coast)
      { lat: 22.0, lng: 39.0 }, // Red Sea (off Saudi Arabia - west coast)
      { lat: 20.0, lng: 40.0 }, // Red Sea (off Saudi Arabia - west coast)
      { lat: 18.0, lng: 41.0 }, // Red Sea (off Saudi Arabia - west coast)
      { lat: 16.0, lng: 42.0 }, // Red Sea (off Yemen - west coast)
      { lat: 14.0, lng: 43.0 }, // Red Sea (off Yemen - west coast)
      { lat: 13.0, lng: 44.0 }, // Bab-el-Mandeb Strait (off Yemen)
      { lat: 12.0, lng: 45.0 }, // Gulf of Aden (off Yemen)
      { lat: 14.0, lng: 50.0 }, // Arabian Sea (off Yemen - south coast)
      { lat: 16.0, lng: 52.0 }, // Arabian Sea (off Oman - south coast)
      { lat: 18.0, lng: 54.0 }, // Arabian Sea (off Oman - south coast)
      { lat: 20.0, lng: 56.0 }, // Arabian Sea (off Oman - east coast)
      { lat: 22.0, lng: 58.0 }, // Gulf of Oman (off Oman - east coast)
      { lat: 24.0, lng: 57.0 }, // Gulf of Oman (off UAE - east coast)
      { lat: 24.5, lng: 56.0 }, // Persian Gulf (off UAE)
      { lat: 25.0, lng: 55.0 }, // Persian Gulf (off UAE)
      { lat: 25.2, lng: 55.2 }, // Dubai approach
    ]
  },
  // C13: Europe ↔ Indian Subcontinent (via Suez, around Spain, around Arabian Peninsula)
  { 
    id: 'C13', 
    name: 'Europe ↔ Indian Subcontinent', 
    startLat: 51.5, startLng: -0.1, 
    endLat: 19.1, endLng: 72.9, 
    color: '#22D3EE',
    waypoints: [
      { lat: 51.0, lng: 0.0 }, // English Channel (off UK - at sea)
      { lat: 50.0, lng: -2.0 }, // English Channel (off UK - at sea)
      { lat: 49.0, lng: -5.0 }, // Celtic Sea (off UK/Ireland - at sea)
      { lat: 48.0, lng: -8.0 }, // Bay of Biscay (off France - at sea)
      { lat: 45.0, lng: -10.0 }, // Atlantic (off France - at sea)
      { lat: 42.0, lng: -10.0 }, // Atlantic (off Spain - at sea)
      { lat: 40.0, lng: -9.0 }, // Atlantic (off Spain - at sea)
      { lat: 38.0, lng: -8.0 }, // Atlantic (off Portugal - at sea)
      { lat: 36.0, lng: -7.0 }, // Atlantic (off Portugal - at sea)
      { lat: 36.0, lng: -6.0 }, // Strait of Gibraltar approach (off Spain - at sea)
      { lat: 35.9, lng: -5.3 }, // Strait of Gibraltar
      { lat: 36.0, lng: -4.0 }, // Mediterranean (off Spain - at sea)
      { lat: 37.0, lng: -1.0 }, // Mediterranean (off Spain - at sea)
      { lat: 38.0, lng: 2.0 }, // Mediterranean (off Spain - at sea)
      { lat: 39.0, lng: 5.0 }, // Mediterranean (off Spain - at sea)
      { lat: 38.0, lng: 10.0 }, // Mediterranean (off Italy - at sea)
      { lat: 38.0, lng: 15.0 }, // Mediterranean (south of Italy - at sea)
      { lat: 36.0, lng: 18.0 }, // Mediterranean (south of Italy - at sea)
      { lat: 35.0, lng: 22.0 }, // Eastern Mediterranean (off Greece - at sea)
      { lat: 35.0, lng: 25.0 }, // Eastern Mediterranean (off Cyprus - at sea)
      { lat: 33.0, lng: 27.0 }, // Eastern Mediterranean (off Egypt - at sea)
      { lat: 31.0, lng: 29.0 }, // Eastern Mediterranean (off Egypt - at sea)
      { lat: 29.9, lng: 32.5 }, // Suez Canal
      { lat: 28.0, lng: 34.0 }, // Red Sea (off Egypt)
      { lat: 26.0, lng: 36.0 }, // Red Sea (off Saudi Arabia - west coast)
      { lat: 24.0, lng: 38.0 }, // Red Sea (off Saudi Arabia - west coast)
      { lat: 22.0, lng: 39.0 }, // Red Sea (off Saudi Arabia - west coast)
      { lat: 20.0, lng: 40.0 }, // Red Sea (off Saudi Arabia - west coast)
      { lat: 18.0, lng: 41.0 }, // Red Sea (off Saudi Arabia - west coast)
      { lat: 16.0, lng: 42.0 }, // Red Sea (off Yemen - west coast)
      { lat: 14.0, lng: 43.0 }, // Red Sea (off Yemen - west coast)
      { lat: 13.0, lng: 44.0 }, // Bab-el-Mandeb Strait (off Yemen)
      { lat: 12.0, lng: 45.0 }, // Gulf of Aden (off Yemen)
      { lat: 14.0, lng: 50.0 }, // Arabian Sea (off Yemen - south coast)
      { lat: 16.0, lng: 52.0 }, // Arabian Sea (off Oman - south coast)
      { lat: 18.0, lng: 55.0 }, // Arabian Sea (off Oman - east coast)
      { lat: 18.0, lng: 58.0 }, // Arabian Sea (off Oman - east coast)
      { lat: 18.0, lng: 60.0 }, // Arabian Sea (off Pakistan)
      { lat: 18.0, lng: 65.0 }, // Arabian Sea (off Pakistan)
      { lat: 17.0, lng: 68.0 }, // Arabian Sea (off Pakistan)
      { lat: 16.0, lng: 70.0 }, // Arabian Sea (off India)
      { lat: 17.0, lng: 72.0 }, // Arabian Sea (off India)
      { lat: 18.0, lng: 72.5 }, // Arabian Sea (off India)
      { lat: 19.0, lng: 72.8 }, // Mumbai approach
    ]
  },
  // C14: North America ↔ South America (East Coast - along Atlantic, staying off coast)
  { 
    id: 'C14', 
    name: 'North America ↔ South America (East)', 
    startLat: 40.7, startLng: -74.0, 
    endLat: -23.5, endLng: -46.6, 
    color: '#34D399',
    waypoints: [
      { lat: 40.5, lng: -73.5 }, // North Atlantic (off New York - at sea)
      { lat: 39.0, lng: -72.5 }, // North Atlantic (off US East Coast - at sea)
      { lat: 37.0, lng: -71.5 }, // North Atlantic (off US East Coast - at sea)
      { lat: 35.0, lng: -70.5 }, // North Atlantic (off US East Coast - at sea)
      { lat: 32.0, lng: -70.5 }, // North Atlantic (off US East Coast - at sea)
      { lat: 30.0, lng: -70.5 }, // North Atlantic (off US East Coast - at sea)
      { lat: 27.0, lng: -70.5 }, // North Atlantic (off Florida - at sea)
      { lat: 25.0, lng: -70.5 }, // North Atlantic (off Florida - at sea)
      { lat: 22.0, lng: -69.0 }, // Caribbean Sea (off Bahamas - at sea)
      { lat: 20.0, lng: -68.5 }, // Caribbean Sea (off Dominican Republic - at sea)
      { lat: 18.0, lng: -66.5 }, // Caribbean Sea (off Puerto Rico - at sea)
      { lat: 15.0, lng: -65.5 }, // Caribbean Sea (off Venezuela - at sea)
      { lat: 12.0, lng: -63.5 }, // Caribbean Sea (off Venezuela - at sea)
      { lat: 10.0, lng: -62.5 }, // Caribbean Sea (off Venezuela - at sea)
      { lat: 8.0, lng: -60.5 }, // Caribbean Sea (off Venezuela - at sea)
      { lat: 7.0, lng: -59.5 }, // Atlantic (off Venezuela/Guyana border - at sea)
      { lat: 6.5, lng: -58.5 }, // Atlantic (off Guyana - north coast - at sea)
      { lat: 6.0, lng: -58.0 }, // Atlantic (off Guyana - north coast - at sea)
      { lat: 5.5, lng: -57.5 }, // Atlantic (off Guyana - north coast - at sea)
      { lat: 5.0, lng: -57.0 }, // Atlantic (off Guyana - north coast - at sea)
      { lat: 4.5, lng: -56.5 }, // Atlantic (off Guyana/Suriname border - at sea)
      { lat: 4.0, lng: -56.0 }, // Atlantic (off Suriname - north coast - at sea)
      { lat: 3.5, lng: -55.5 }, // Atlantic (off Suriname - north coast - at sea)
      { lat: 3.0, lng: -55.0 }, // Atlantic (off Suriname - north coast - at sea)
      { lat: 2.5, lng: -54.5 }, // Atlantic (off Suriname/French Guiana border - at sea)
      { lat: 2.0, lng: -54.0 }, // Atlantic (off French Guiana - north coast - at sea)
      { lat: 1.5, lng: -53.5 }, // Atlantic (off French Guiana - north coast - at sea)
      { lat: 1.0, lng: -53.0 }, // Atlantic (off French Guiana - north coast - at sea)
      { lat: 0.5, lng: -52.5 }, // Atlantic (off French Guiana/Brazil border - at sea)
      { lat: 0.0, lng: -50.0 }, // Atlantic (off Brazil - north coast - at sea, far from land)
      { lat: -1.0, lng: -49.5 }, // Atlantic (off Brazil - north coast - at sea)
      { lat: -2.0, lng: -49.0 }, // Atlantic (off Brazil - north coast - at sea)
      { lat: -3.0, lng: -48.5 }, // Atlantic (off Brazil - north coast - at sea)
      { lat: -4.0, lng: -48.0 }, // Atlantic (off Brazil - north coast - at sea)
      { lat: -5.0, lng: -47.5 }, // Atlantic (off Brazil - north coast - at sea)
      { lat: -6.0, lng: -47.0 }, // Atlantic (off Brazil - north coast - at sea)
      { lat: -7.0, lng: -38.0 }, // Atlantic (off Brazil - north coast - at sea, far from land)
      { lat: -8.0, lng: -38.0 }, // Atlantic (off Brazil - northeast coast - at sea)
      { lat: -9.0, lng: -38.0 }, // Atlantic (off Brazil - northeast coast - at sea)
      { lat: -10.0, lng: -38.5 }, // Atlantic (off Brazil - northeast coast - at sea)
      { lat: -11.0, lng: -39.0 }, // Atlantic (off Brazil - northeast coast - at sea)
      { lat: -12.0, lng: -39.5 }, // Atlantic (off Brazil - northeast coast - at sea)
      { lat: -13.0, lng: -40.0 }, // Atlantic (off Brazil - northeast coast - at sea)
      { lat: -14.0, lng: -40.5 }, // Atlantic (off Brazil - northeast coast - at sea)
      { lat: -15.0, lng: -41.0 }, // Atlantic (off Brazil - east coast - at sea)
      { lat: -16.0, lng: -41.5 }, // Atlantic (off Brazil - east coast - at sea)
      { lat: -17.0, lng: -42.0 }, // Atlantic (off Brazil - east coast - at sea)
      { lat: -18.0, lng: -42.5 }, // Atlantic (off Brazil - east coast - at sea)
      { lat: -19.0, lng: -43.0 }, // Atlantic (off Brazil - east coast - at sea)
      { lat: -20.0, lng: -43.5 }, // Atlantic (off Brazil - east coast - at sea)
      { lat: -21.0, lng: -44.0 }, // Atlantic (off Brazil - east coast - at sea)
      { lat: -22.0, lng: -44.5 }, // Atlantic (off Brazil - east coast - at sea)
      { lat: -23.0, lng: -45.0 }, // Atlantic (off Brazil - east coast - at sea)
      { lat: -23.5, lng: -45.5 }, // Atlantic (off Brazil - east coast - at sea)
      { lat: -23.5, lng: -46.0 }, // Atlantic (off Brazil - east coast - at sea)
      { lat: -23.5, lng: -46.5 }, // São Paulo approach (at sea - along coast)
    ]
  },
  // C15: North America ↔ South America (West Coast)
  { 
    id: 'C15', 
    name: 'North America ↔ South America (West)', 
    startLat: 37.8, startLng: -122.4, 
    endLat: -12.0, endLng: -77.0, 
    color: '#60A5FA',
    waypoints: [
      { lat: 35.0, lng: -120.0 }, // Pacific Ocean
      { lat: 30.0, lng: -115.0 }, // Pacific Ocean
      { lat: 25.0, lng: -112.0 }, // Eastern Pacific
      { lat: 20.0, lng: -110.0 }, // Eastern Pacific
      { lat: 15.0, lng: -108.0 }, // Eastern Pacific
      { lat: 10.0, lng: -105.0 }, // Eastern Pacific
      { lat: 5.0, lng: -102.0 }, // Central Pacific
      { lat: 0.0, lng: -100.0 }, // Central Pacific
      { lat: -5.0, lng: -95.0 }, // South Pacific
      { lat: -8.0, lng: -90.0 }, // South Pacific
      { lat: -10.0, lng: -85.0 }, // South Pacific
      { lat: -11.0, lng: -80.0 }, // South Pacific
      { lat: -11.5, lng: -78.0 }, // Lima approach
    ]
  },
  // C16: Asia ↔ South America (West Coast) - via Pacific
  { 
    id: 'C16', 
    name: 'Asia ↔ South America (West)', 
    startLat: 35.7, startLng: 139.8, 
    endLat: -12.0, endLng: -77.0, 
    color: '#FB7185',
    waypoints: [
      { lat: 33.0, lng: 135.0 }, // Pacific Ocean
      { lat: 28.0, lng: 140.0 }, // Pacific Ocean
      { lat: 20.0, lng: 145.0 }, // Western Pacific
      { lat: 15.0, lng: 150.0 }, // Western Pacific
      { lat: 10.0, lng: 155.0 }, // Western Pacific
      { lat: 5.0, lng: 160.0 }, // Western Pacific
      { lat: 0.0, lng: 165.0 }, // Central Pacific
      { lat: -5.0, lng: 170.0 }, // Central Pacific
      { lat: -5.0, lng: -175.0 }, // Central Pacific
      { lat: -5.0, lng: -150.0 }, // Central Pacific
      { lat: -5.0, lng: -130.0 }, // Central Pacific
      { lat: -8.0, lng: -110.0 }, // Eastern Pacific
      { lat: -10.0, lng: -100.0 }, // Eastern Pacific
      { lat: -11.0, lng: -90.0 }, // Eastern Pacific
      { lat: -11.5, lng: -80.0 }, // Lima approach
    ]
  },
  // C17: Asia ↔ South America (East Coast) - via Pacific → Panama Canal → Atlantic (along South America coast)
  { 
    id: 'C17', 
    name: 'Asia ↔ South America (East)', 
    startLat: 35.7, startLng: 139.8, 
    endLat: -23.5, endLng: -46.6, 
    color: '#A78BFA',
    waypoints: [
      { lat: 33.0, lng: 130.0 }, // East China Sea (off Japan)
      { lat: 30.0, lng: 125.0 }, // East China Sea (off China/Korea)
      { lat: 25.0, lng: 120.0 }, // East China Sea (off China)
      { lat: 20.0, lng: 115.0 }, // South China Sea (off China)
      { lat: 15.0, lng: 115.0 }, // South China Sea (off Philippines)
      { lat: 10.0, lng: 115.0 }, // South China Sea (off Philippines)
      { lat: 5.0, lng: 110.0 }, // South China Sea (off Malaysia)
      { lat: 0.0, lng: 110.0 }, // South China Sea (off Indonesia)
      { lat: -5.0, lng: 115.0 }, // Java Sea (off Indonesia)
      { lat: -5.0, lng: 120.0 }, // Banda Sea (off Indonesia)
      { lat: -5.0, lng: 130.0 }, // Arafura Sea (off Indonesia)
      { lat: 0.0, lng: 140.0 }, // Pacific Ocean (off Papua New Guinea)
      { lat: 5.0, lng: 150.0 }, // Pacific Ocean
      { lat: 10.0, lng: 160.0 }, // Pacific Ocean
      { lat: 15.0, lng: 170.0 }, // Pacific Ocean
      { lat: 15.0, lng: -175.0 }, // Pacific Ocean
      { lat: 15.0, lng: -170.0 }, // Pacific Ocean
      { lat: 15.0, lng: -160.0 }, // Pacific Ocean
      { lat: 15.0, lng: -150.0 }, // Pacific Ocean
      { lat: 15.0, lng: -140.0 }, // Pacific Ocean
      { lat: 15.0, lng: -130.0 }, // Pacific Ocean
      { lat: 12.0, lng: -120.0 }, // Pacific Ocean (approach to Panama)
      { lat: 10.0, lng: -110.0 }, // Pacific Ocean (approach to Panama)
      { lat: 9.0, lng: -90.0 }, // Pacific Ocean (approach to Panama)
      { lat: 9.0, lng: -80.0 }, // Pacific Ocean (approach to Panama)
      { lat: 9.0, lng: -79.5 }, // Panama Canal (Pacific side)
      { lat: 9.0, lng: -79.5 }, // Panama Canal
      { lat: 9.5, lng: -79.5 }, // Panama Canal (Atlantic side)
      // After Panama - stay at sea along South America Atlantic coast
      { lat: 10.0, lng: -79.0 }, // Caribbean Sea (off Panama - at sea)
      { lat: 11.0, lng: -75.0 }, // Caribbean Sea (off Colombia - at sea)
      { lat: 12.0, lng: -72.0 }, // Caribbean Sea (off Colombia - at sea)
      { lat: 12.0, lng: -70.0 }, // Caribbean Sea (off Colombia/Venezuela - at sea)
      { lat: 12.0, lng: -68.0 }, // Caribbean Sea (off Venezuela - at sea)
      { lat: 12.0, lng: -66.0 }, // Caribbean Sea (off Venezuela - at sea)
      { lat: 11.0, lng: -64.0 }, // Caribbean Sea (off Venezuela - at sea)
      { lat: 10.0, lng: -62.5 }, // Atlantic (off Venezuela - at sea)
      { lat: 8.0, lng: -61.0 }, // Atlantic (off Venezuela - at sea)
      { lat: 7.0, lng: -59.5 }, // Atlantic (off Venezuela/Guyana border - at sea)
      { lat: 6.5, lng: -58.5 }, // Atlantic (off Guyana - north coast - at sea)
      { lat: 6.0, lng: -58.0 }, // Atlantic (off Guyana - north coast - at sea)
      { lat: 5.5, lng: -57.5 }, // Atlantic (off Guyana - north coast - at sea)
      { lat: 5.0, lng: -57.0 }, // Atlantic (off Guyana - north coast - at sea)
      { lat: 4.5, lng: -56.5 }, // Atlantic (off Guyana/Suriname border - at sea)
      { lat: 4.0, lng: -56.0 }, // Atlantic (off Suriname - north coast - at sea)
      { lat: 3.5, lng: -55.5 }, // Atlantic (off Suriname - north coast - at sea)
      { lat: 3.0, lng: -55.0 }, // Atlantic (off Suriname - north coast - at sea)
      { lat: 2.5, lng: -54.5 }, // Atlantic (off Suriname/French Guiana border - at sea)
      { lat: 2.0, lng: -54.0 }, // Atlantic (off French Guiana - north coast - at sea)
      { lat: 1.5, lng: -53.5 }, // Atlantic (off French Guiana - north coast - at sea)
      { lat: 1.0, lng: -53.0 }, // Atlantic (off French Guiana - north coast - at sea)
      { lat: 0.5, lng: -52.5 }, // Atlantic (off French Guiana/Brazil border - at sea)
      { lat: 0.0, lng: -50.0 }, // Atlantic (off Brazil - north coast - at sea, far from land)
      { lat: -1.0, lng: -49.5 }, // Atlantic (off Brazil - north coast - at sea)
      { lat: -2.0, lng: -49.0 }, // Atlantic (off Brazil - north coast - at sea)
      { lat: -3.0, lng: -48.5 }, // Atlantic (off Brazil - north coast - at sea)
      { lat: -4.0, lng: -48.0 }, // Atlantic (off Brazil - north coast - at sea)
      { lat: -5.0, lng: -47.5 }, // Atlantic (off Brazil - north coast - at sea)
      { lat: -6.0, lng: -47.0 }, // Atlantic (off Brazil - north coast - at sea)
      { lat: -7.0, lng: -38.0 }, // Atlantic (off Brazil - north coast - at sea, far from land)
      { lat: -8.0, lng: -38.0 }, // Atlantic (off Brazil - northeast coast - at sea)
      { lat: -9.0, lng: -38.0 }, // Atlantic (off Brazil - northeast coast - at sea)
      { lat: -10.0, lng: -38.5 }, // Atlantic (off Brazil - northeast coast - at sea)
      { lat: -11.0, lng: -39.0 }, // Atlantic (off Brazil - northeast coast - at sea)
      { lat: -12.0, lng: -39.5 }, // Atlantic (off Brazil - northeast coast - at sea)
      { lat: -13.0, lng: -40.0 }, // Atlantic (off Brazil - northeast coast - at sea)
      { lat: -14.0, lng: -40.5 }, // Atlantic (off Brazil - northeast coast - at sea)
      { lat: -15.0, lng: -41.0 }, // Atlantic (off Brazil - east coast - at sea)
      { lat: -16.0, lng: -41.5 }, // Atlantic (off Brazil - east coast - at sea)
      { lat: -17.0, lng: -42.0 }, // Atlantic (off Brazil - east coast - at sea)
      { lat: -18.0, lng: -42.5 }, // Atlantic (off Brazil - east coast - at sea)
      { lat: -19.0, lng: -43.0 }, // Atlantic (off Brazil - east coast - at sea)
      { lat: -20.0, lng: -43.5 }, // Atlantic (off Brazil - east coast - at sea)
      { lat: -21.0, lng: -44.0 }, // Atlantic (off Brazil - east coast - at sea)
      { lat: -22.0, lng: -44.5 }, // Atlantic (off Brazil - east coast - at sea)
      { lat: -23.0, lng: -45.0 }, // Atlantic (off Brazil - east coast - at sea)
      { lat: -23.5, lng: -45.5 }, // Atlantic (off Brazil - east coast - at sea)
      { lat: -23.5, lng: -46.0 }, // Atlantic (off Brazil - east coast - at sea)
      { lat: -23.5, lng: -46.5 }, // São Paulo approach (at sea - along coast)
    ]
  },
  // C18: Middle East ↔ Africa (Golfe Persique → Mer d'Arabie → Océan Indien → Afrique)
  { 
    id: 'C18', 
    name: 'Middle East ↔ Africa', 
    startLat: 25.2, startLng: 55.3, 
    endLat: -33.9, endLng: 18.4, 
    color: '#FBBF24',
    waypoints: [
      { lat: 25.0, lng: 55.0 }, // Persian Gulf (off UAE - at sea)
      { lat: 24.5, lng: 54.5 }, // Persian Gulf (off UAE - at sea)
      { lat: 24.0, lng: 54.0 }, // Persian Gulf (off UAE - at sea)
      { lat: 23.5, lng: 53.5 }, // Persian Gulf (off UAE - at sea)
      { lat: 23.0, lng: 53.0 }, // Persian Gulf (off UAE - at sea)
      { lat: 22.5, lng: 52.5 }, // Persian Gulf exit (off UAE - at sea)
      { lat: 24.0, lng: 57.0 }, // Gulf of Oman (off UAE/Oman - at sea)
      { lat: 22.0, lng: 58.0 }, // Gulf of Oman (off Oman - at sea)
      { lat: 20.0, lng: 58.0 }, // Gulf of Oman (off Oman - at sea)
      { lat: 18.0, lng: 57.0 }, // Arabian Sea (off Oman - at sea)
      { lat: 16.0, lng: 56.0 }, // Arabian Sea (off Oman - at sea)
      { lat: 14.0, lng: 55.0 }, // Arabian Sea (off Yemen - at sea)
      { lat: 12.0, lng: 54.0 }, // Arabian Sea (off Yemen - at sea)
      { lat: 10.0, lng: 52.0 }, // Arabian Sea (off Somalia - at sea)
      { lat: 8.0, lng: 50.0 }, // Arabian Sea (off Somalia - at sea)
      { lat: 6.0, lng: 48.0 }, // Indian Ocean (off Somalia - at sea)
      { lat: 4.0, lng: 46.0 }, // Indian Ocean (off Somalia - at sea)
      { lat: 2.0, lng: 44.0 }, // Indian Ocean (off Somalia - at sea)
      { lat: 0.0, lng: 42.0 }, // Indian Ocean (off Kenya - at sea)
      { lat: -2.0, lng: 40.0 }, // Indian Ocean (off Kenya - Mombasa area - at sea)
      { lat: -4.0, lng: 39.5 }, // Indian Ocean (off Tanzania - Dar es Salaam area - at sea)
      { lat: -6.0, lng: 39.5 }, // Indian Ocean (off Tanzania - at sea)
      { lat: -8.0, lng: 39.5 }, // Indian Ocean (off Tanzania - at sea)
      { lat: -10.0, lng: 40.0 }, // Indian Ocean (off Mozambique - at sea)
      { lat: -12.0, lng: 40.5 }, // Indian Ocean (off Mozambique - at sea)
      { lat: -15.0, lng: 40.5 }, // Indian Ocean (off Mozambique - Maputo area - at sea)
      { lat: -18.0, lng: 38.5 }, // Indian Ocean (off Mozambique - at sea)
      { lat: -20.0, lng: 35.5 }, // Indian Ocean (off Mozambique - at sea)
      { lat: -25.0, lng: 32.5 }, // Indian Ocean (off South Africa - Durban area - at sea)
      { lat: -27.0, lng: 32.0 }, // Indian Ocean (off South Africa - east coast - at sea)
      { lat: -29.0, lng: 31.0 }, // Indian Ocean (off South Africa - east coast - at sea)
      { lat: -31.0, lng: 29.5 }, // Indian Ocean (off South Africa - south coast - at sea)
      { lat: -32.0, lng: 28.0 }, // Indian Ocean (off South Africa - south coast - at sea)
      { lat: -33.0, lng: 26.0 }, // Indian Ocean (off South Africa - south coast - at sea)
      { lat: -33.5, lng: 24.0 }, // Indian Ocean (off South Africa - south coast - at sea)
      { lat: -34.0, lng: 22.0 }, // Indian Ocean (off South Africa - south coast - at sea)
      { lat: -34.0, lng: 20.0 }, // Indian Ocean (off South Africa - south coast - at sea)
      { lat: -34.0, lng: 19.0 }, // Indian Ocean (off South Africa - south coast - at sea)
      { lat: -33.9, lng: 18.5 }, // Cape Town approach (at sea - along coast)
    ]
  },
  // C19: Intra-Europe (North Sea / Baltic routes - maritime only)
  { 
    id: 'C19', 
    name: 'Intra-Europe', 
    startLat: 51.5, startLng: -0.1, 
    endLat: 52.5, endLng: 13.4, 
    color: '#4ADE80',
    waypoints: [
      { lat: 51.0, lng: 1.0 }, // English Channel (off UK)
      { lat: 51.0, lng: 2.0 }, // English Channel (off UK/France)
      { lat: 51.5, lng: 3.0 }, // North Sea (off UK/Belgium)
      { lat: 52.0, lng: 4.0 }, // North Sea (off Netherlands)
      { lat: 52.5, lng: 5.0 }, // North Sea (off Netherlands)
      { lat: 53.0, lng: 6.0 }, // North Sea (off Germany)
      { lat: 53.5, lng: 7.0 }, // North Sea (off Germany)
      { lat: 54.0, lng: 8.0 }, // North Sea (off Germany)
      { lat: 54.5, lng: 9.0 }, // North Sea (off Germany)
      { lat: 54.5, lng: 10.0 }, // North Sea / Baltic approach (off Germany)
      { lat: 54.5, lng: 11.0 }, // Baltic Sea (off Germany)
      { lat: 54.0, lng: 12.0 }, // Baltic Sea (off Germany)
      { lat: 53.5, lng: 13.0 }, // Baltic Sea (off Germany)
      { lat: 53.0, lng: 13.5 }, // Baltic Sea (off Germany/Poland)
    ]
  },
  // C20: Intra-Americas (Caribbean routes)
  { 
    id: 'C20', 
    name: 'Intra-Americas', 
    startLat: 40.7, startLng: -74.0, 
    endLat: 19.4, endLng: -99.1, 
    color: '#818CF8',
    waypoints: [
      { lat: 38.0, lng: -75.0 }, // North Atlantic
      { lat: 35.0, lng: -76.0 }, // North Atlantic
      { lat: 30.0, lng: -78.0 }, // North Atlantic
      { lat: 27.0, lng: -79.0 }, // Florida Straits approach
      { lat: 25.0, lng: -80.0 }, // Florida Straits
      { lat: 23.0, lng: -82.0 }, // Gulf of Mexico
      { lat: 22.0, lng: -85.0 }, // Gulf of Mexico / Caribbean
      { lat: 21.0, lng: -88.0 }, // Gulf of Mexico
      { lat: 20.0, lng: -92.0 }, // Gulf of Mexico
      { lat: 19.5, lng: -96.0 }, // Gulf of Mexico
      { lat: 19.4, lng: -98.0 }, // Mexico approach
    ]
  },
]

export default function EarthMap() {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedCommodity, setSelectedCommodity] = useState<string>('')
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [showCities, setShowCities] = useState(true) // Cities visible by default
  // Removed showShippingRoutes - now using modal for route selection
  const [enabledRoutes, setEnabledRoutes] = useState<Set<string>>(new Set())
  const [markers, setMarkers] = useState<CommodityData[]>([])
  const [refineries, setRefineries] = useState<RefineryData[]>([])
  const [showRefineries, setShowRefineries] = useState(false)
  const [refineryFilter, setRefineryFilter] = useState<Set<string>>(new Set(['light', 'medium', 'extra_heavy']))
  const [selectedPoint, setSelectedPoint] = useState<{ data: CommodityData | RefineryData | null, type: 'commodity' | 'refinery' | null }>({ data: null, type: null })

  const fetchData = useCallback(async (ignoreCompany = false) => {
    try {
      let query = supabase.from('commodity_locations').select('*').limit(10000)

      if (selectedCategory) {
        query = query.eq('commodity_type', selectedCategory)
      }
      if (selectedCommodity) {
        query = query.eq('commodity_name', selectedCommodity)
      }
      // Only apply company filter if not ignoring it (i.e., manual search)
      if (!ignoreCompany) {
        if (selectedCompany) {
          query = query.eq('company', selectedCompany)
        }
      }

      const { data, error } = await query

      if (error) {
        console.error('Supabase query error:', error)
        throw error
      }

      console.log('Raw data from Supabase:', data?.length || 0, 'records')
      const validMarkers = (data || []).filter(m => m.latitude != null && m.longitude != null)
      console.log(`Fetched ${data?.length || 0} total locations, ${validMarkers.length} with valid coordinates`)
      setMarkers(validMarkers)
    } catch (err) {
      console.error('Error fetching data:', err)
    }
  }, [selectedCategory, selectedCommodity, selectedCompany])

  // Automatically load all data when component mounts and when filters change
  useEffect(() => {
    // Only auto-fetch when both category and commodity are empty (meaning "All")
    // When both are "All", show ALL points regardless of company filters
    if (!selectedCategory && !selectedCommodity) {
      fetchData(true) // Ignore company filters for auto-load
    } else {
      // If filters are selected, still fetch data with filters
      fetchData(false)
    }
  }, [selectedCategory, selectedCommodity, selectedCompany, fetchData])

  const fetchRefineries = useCallback(async () => {
    try {
      let query = supabase.from('refineries').select('*')
      
      // Filter by crude types if any are selected
      if (refineryFilter.size > 0 && refineryFilter.size < 3) {
        // If not all types selected, filter by crude_types_accepted array
        query = query.contains('crude_types_accepted', Array.from(refineryFilter))
      }

      const { data, error } = await query

      if (error) throw error

      setRefineries(data || [])
    } catch (err) {
      console.error('Error fetching refineries:', err)
    }
  }, [refineryFilter])

  // Fetch refineries when filter changes
  useEffect(() => {
    if (showRefineries) {
      fetchRefineries()
    } else {
      setRefineries([])
    }
  }, [showRefineries, refineryFilter, fetchRefineries])

  const handleSearch = async () => {
    await fetchData(false) // Apply all filters including company
  }

  // Stable callback for point selection - won't cause globe re-initialization
  const handlePointSelect = useCallback((data: CommodityData | RefineryData | null, type: 'commodity' | 'refinery') => {
    setSelectedPoint({ data, type })
  }, [])

  // Memoize props to prevent globe re-renders
  const filteredRoutes = useMemo(() => 
    shippingRoutes.filter(r => enabledRoutes.has(r.id)), 
    [enabledRoutes]
  )
  
  const displayedRefineries = useMemo(() => 
    showRefineries ? refineries : [], 
    [showRefineries, refineries]
  )

  const [showRoutesModal, setShowRoutesModal] = useState(false)

  return (
    <div className="flex-1 flex flex-col bg-black">
      {/* Modern Monochrome Filters Bar */}
      <div className="bg-black border-b border-neutral-800 px-5 py-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Category Select */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              setSelectedCommodity('')
            }}
            className="h-10 px-4 text-sm rounded-lg bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:border-white transition-all min-w-[150px] appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {Object.keys(commodityCategories).map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Commodity Select */}
          <select
            value={selectedCommodity}
            onChange={(e) => setSelectedCommodity(e.target.value)}
            className="h-10 px-4 text-sm rounded-lg bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:border-white transition-all disabled:opacity-40 disabled:cursor-not-allowed min-w-[160px] appearance-none cursor-pointer"
            disabled={!selectedCategory}
          >
            <option value="">All Commodities</option>
            {selectedCategory &&
              commodityCategories[selectedCategory as keyof typeof commodityCategories]?.map(
                (commodity) => (
                  <option key={commodity} value={commodity}>{commodity}</option>
                )
              )}
          </select>

          {/* Company Select */}
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="h-10 px-4 text-sm rounded-lg bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:border-white transition-all min-w-[160px] appearance-none cursor-pointer"
          >
            <option value="">All Companies</option>
            {companies.map((company) => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>

          <div className="h-6 w-px bg-neutral-700 mx-1" />

          {/* Routes Button */}
          <button
            onClick={() => setShowRoutesModal(true)}
            className={`h-10 px-5 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
              enabledRoutes.size > 0 
                ? 'bg-white text-black hover:bg-neutral-200' 
                : 'bg-neutral-900 text-neutral-300 border border-neutral-700 hover:border-neutral-500 hover:text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Routes {enabledRoutes.size > 0 && <span className="bg-black/20 px-1.5 py-0.5 rounded text-xs">{enabledRoutes.size}</span>}
          </button>

          {/* Cities Toggle */}
          <button
            onClick={() => setShowCities(!showCities)}
            className={`h-10 px-5 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
              showCities 
                ? 'bg-white text-black hover:bg-neutral-200' 
                : 'bg-neutral-900 text-neutral-300 border border-neutral-700 hover:border-neutral-500 hover:text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Cities
          </button>

          <div className="flex-1" />

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="h-10 px-6 bg-white text-black text-sm font-semibold rounded-lg hover:bg-neutral-200 transition-all flex items-center gap-2"
          >
            <Search size={16} />
            Search
          </button>
        </div>
      </div>

      {/* Shipping Routes Modal */}
      {showRoutesModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setShowRoutesModal(false)}
        >
          <div 
            className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Select Shipping Routes
              </h3>
              <button 
                onClick={() => setShowRoutesModal(false)}
                className="text-neutral-500 hover:text-white transition-colors p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Select All / Clear */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setEnabledRoutes(new Set(shippingRoutes.map(r => r.id)))}
                className="text-sm text-white hover:text-neutral-300 transition-colors underline underline-offset-2"
              >
                Select All
              </button>
              <span className="text-neutral-700">|</span>
              <button
                onClick={() => setEnabledRoutes(new Set())}
                className="text-sm text-neutral-400 hover:text-white transition-colors underline underline-offset-2"
              >
                Clear All
              </button>
            </div>

            {/* Routes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2">
              {shippingRoutes.map((route) => (
                <label
                  key={route.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    enabledRoutes.has(route.id)
                      ? 'bg-neutral-900 border border-white/30'
                      : 'bg-neutral-900/50 border border-transparent hover:bg-neutral-900 hover:border-neutral-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={enabledRoutes.has(route.id)}
                    onChange={(e) => {
                      const newSet = new Set(enabledRoutes)
                      if (e.target.checked) {
                        newSet.add(route.id)
                      } else {
                        newSet.delete(route.id)
                      }
                      setEnabledRoutes(newSet)
                    }}
                    className="sr-only"
                  />
                  <div 
                    className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${
                      enabledRoutes.has(route.id)
                        ? 'border-white bg-white'
                        : 'border-neutral-600 bg-transparent'
                    }`}
                  >
                    {enabledRoutes.has(route.id) && (
                      <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: route.color }}
                      />
                      <span className="text-white font-medium text-sm">{route.id}</span>
                    </div>
                    <p className="text-neutral-500 text-xs truncate mt-0.5">{route.name}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-neutral-800">
              <p className="text-neutral-500 text-sm">
                {enabledRoutes.size} of {shippingRoutes.length} routes selected
              </p>
              <button
                onClick={() => setShowRoutesModal(false)}
                className="px-5 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-neutral-200 transition-all"
              >
                Apply Routes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D Globe */}
      <div className="flex-1 relative">
        <Globe3D 
          markers={markers} 
          showCities={showCities} 
          routes={filteredRoutes}
          refineries={displayedRefineries}
          onPointSelect={handlePointSelect}
        />

        {/* Selected Point Info Panel - Left Side */}
        {selectedPoint.data && (
          <div 
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black bg-opacity-95 border border-gray-500 rounded-xl p-6 shadow-2xl backdrop-blur-sm w-80 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                setSelectedPoint({ data: null, type: null })
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors z-10 bg-gray-800 rounded-full p-1"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {selectedPoint.type === 'commodity' && (() => {
                const data = selectedPoint.data as CommodityData
                const fieldLabels: Record<string, string> = {
                  title: 'Site Name',
                  owner: 'Owner',
                  company: 'Company',
                  operator: 'Operator',
                  commodity_type: 'Category',
                  commodity_name: 'Commodity',
                  country: 'Country',
                  region: 'Region',
                  address: 'Address',
                  location_type: 'Location Type',
                  operational_status: 'Status',
                  ownership_type: 'Ownership Type',
                  ownership_details: 'Ownership Details',
                  production_monthly: 'Monthly Production',
                  production_yearly: 'Yearly Production',
                  production_unit: 'Production Unit',
                  estimated_reserves: 'Estimated Reserves',
                  reserves_unit: 'Reserves Unit',
                  start_date: 'Start Date',
                  closing_date: 'Closing Date',
                  quality_type: 'Quality Type',
                  api_gravity: 'API Gravity',
                  quality_sulfur_content: 'Sulfur Content',
                  grade: 'Grade',
                  last_transaction_value: 'Last Transaction Value',
                  last_transaction_currency: 'Currency',
                  last_transaction_date: 'Transaction Date',
                  contract_duration_years: 'Contract Duration',
                  pipelines: 'Pipelines',
                  ports: 'Ports',
                  rail_connections: 'Rail Connections',
                  supply_volume: 'Supply Volume',
                  storage_volume: 'Storage Volume',
                  long_term_contract: 'Long-term Contract',
                  contract_with: 'Contract With',
                }
                
                return (
                  <div className="text-white">
                    <h3 className="text-xl font-bold text-orange-400 mb-4 pr-8">
                      {data.title}
                    </h3>
                    <div className="space-y-2 text-sm">
                      {Object.entries(fieldLabels).map(([key, label]) => {
                        const value = data[key as keyof CommodityData]
                        if (value === null || value === undefined || value === '' || value === 0) return null
                        if (key === 'title') return null // Already shown as header
                        if (key === 'latitude' || key === 'longitude' || key === 'id') return null
                        
                        // Format arrays
                        if (Array.isArray(value)) {
                          if (value.length === 0) return null
                          return (
                            <div key={key} className="py-1">
                              <span className="text-gray-400">{label}:</span>
                              <ul className="ml-4 mt-1 text-gray-200">
                                {value.map((item, i) => (
                                  <li key={i} className="text-xs">• {item}</li>
                                ))}
                              </ul>
                            </div>
                          )
                        }
                        
                        // Format booleans
                        if (typeof value === 'boolean') {
                          return (
                            <p key={key} className={value ? 'text-green-400' : 'text-gray-400'}>
                              {value ? '✓' : '✗'} {label}
                            </p>
                          )
                        }
                        
                        // Format numbers
                        if (typeof value === 'number') {
                          return (
                            <p key={key}>
                              <span className="text-gray-400">{label}:</span>{' '}
                              <span className="text-gray-200">{value.toLocaleString()}</span>
                            </p>
                          )
                        }
                        
                        // Format strings
                        return (
                          <p key={key}>
                            <span className="text-gray-400">{label}:</span>{' '}
                            <span className="text-gray-200">{String(value)}</span>
                          </p>
                        )
                      })}
                      <p className="text-xs text-gray-500 mt-4 pt-2 border-t border-gray-700">
                        Coordinates: {data.latitude?.toFixed(4)}, {data.longitude?.toFixed(4)}
                      </p>
                    </div>
                  </div>
                )
              })()}
              
              {selectedPoint.type === 'refinery' && (() => {
                const data = selectedPoint.data as RefineryData
                return (
                  <div className="text-white">
                    <h3 className="text-xl font-bold text-yellow-400 mb-4 pr-8">
                      {data.name}
                    </h3>
                    <div className="space-y-2 text-sm">
                      {data.operator && <p><span className="text-gray-400">Operator:</span> <span className="text-gray-200">{data.operator}</span></p>}
                      {data.country && <p><span className="text-gray-400">Country:</span> <span className="text-gray-200">{data.country}</span></p>}
                      {data.city && <p><span className="text-gray-400">City:</span> <span className="text-gray-200">{data.city}</span></p>}
                      {data.address && <p><span className="text-gray-400">Address:</span> <span className="text-gray-200">{data.address}</span></p>}
                      {data.capacity_bpd > 0 && <p><span className="text-gray-400">Capacity:</span> <span className="text-gray-200">{data.capacity_bpd.toLocaleString()} bpd</span></p>}
                      {data.operational_status && <p><span className="text-gray-400">Status:</span> <span className="text-gray-200">{data.operational_status}</span></p>}
                      {data.crude_types_accepted && data.crude_types_accepted.length > 0 && (
                        <p>
                          <span className="text-gray-400">Crude Types:</span>{' '}
                          <span className="text-gray-200">
                            {data.crude_types_accepted.map(t => {
                              if (t === 'light') return 'Light';
                              if (t === 'medium') return 'Medium';
                              if (t === 'extra_heavy') return 'Extra Heavy';
                              return t;
                            }).join(', ')}
                          </span>
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-4 pt-2 border-t border-gray-700">
                        Coordinates: {data.latitude?.toFixed(4)}, {data.longitude?.toFixed(4)}
                      </p>
                    </div>
                  </div>
                )
              })()}
          </div>
        )}

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
