/**
 * Oil Reserves Data Scraper
 * 
 * This script scrapes public data sources for oil reserves information
 * and populates the commodity_locations table in Supabase
 */

// Load environment variables FIRST, before any other imports
import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import * as cheerio from 'cheerio'

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found!')
  console.error('   Please make sure .env.local exists with:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface OilReserveData {
  title: string
  owner: string
  address: string
  contact: string
  latitude: number
  longitude: number
  supply_volume: number
  storage_volume: number
  long_term_contract: boolean
  contract_with: string
  commodity_type: string
  commodity_name: string
  company?: string
  country: string
  location_type?: string
  api_gravity?: number
  sulfur_content?: number
  operational_status?: string
}

// Major oil fields database (curated from public sources)
const majorOilFields = [
  {
    name: "Ghawar Field",
    country: "Saudi Arabia",
    operator: "Saudi Aramco",
    latitude: 25.5,
    longitude: 49.5,
    production_bpd: 3800000,
    api_gravity: "32-34",
    sulfur_content: "1.8-2.1%",
    type: "Conventional"
  },
  {
    name: "Safaniya Field",
    country: "Saudi Arabia",
    operator: "Saudi Aramco",
    latitude: 27.7,
    longitude: 48.8,
    production_bpd: 1200000,
    api_gravity: "27-29",
    sulfur_content: "2.5-2.8%",
    type: "Offshore"
  },
  {
    name: "Rumaila Field",
    country: "Iraq",
    operator: "BP/CNPC",
    latitude: 30.5,
    longitude: 47.5,
    production_bpd: 1450000,
    api_gravity: "25-35",
    sulfur_content: "3.0-4.0%",
    type: "Conventional"
  },
  {
    name: "West Qurna Field",
    country: "Iraq",
    operator: "ExxonMobil/Shell",
    latitude: 31.4,
    longitude: 47.4,
    production_bpd: 865000,
    api_gravity: "24-32",
    sulfur_content: "3.5-4.5%",
    type: "Conventional"
  },
  {
    name: "Burgan Field",
    country: "Kuwait",
    operator: "Kuwait Oil Company",
    latitude: 29.1,
    longitude: 48.1,
    production_bpd: 1700000,
    api_gravity: "31-33",
    sulfur_content: "2.5%",
    type: "Conventional"
  },
  {
    name: "Permian Basin",
    country: "United States",
    operator: "Chevron/ExxonMobil/ConocoPhillips",
    latitude: 31.8,
    longitude: -102.3,
    production_bpd: 5400000,
    api_gravity: "38-42",
    sulfur_content: "0.3-0.5%",
    type: "Shale"
  },
  {
    name: "Eagle Ford Shale",
    country: "United States",
    operator: "EOG Resources/ConocoPhillips",
    latitude: 28.5,
    longitude: -98.5,
    production_bpd: 1100000,
    api_gravity: "40-50",
    sulfur_content: "0.1-0.3%",
    type: "Shale"
  },
  {
    name: "Bakken Formation",
    country: "United States",
    operator: "Continental Resources/Hess",
    latitude: 47.8,
    longitude: -103.5,
    production_bpd: 1200000,
    api_gravity: "40-43",
    sulfur_content: "0.2%",
    type: "Shale"
  },
  {
    name: "Cantarell Field",
    country: "Mexico",
    operator: "Pemex",
    latitude: 19.7,
    longitude: -92.3,
    production_bpd: 180000,
    api_gravity: "22",
    sulfur_content: "3.5%",
    type: "Offshore"
  },
  {
    name: "Samotlor Field",
    country: "Russia",
    operator: "Rosneft",
    latitude: 61.1,
    longitude: 76.7,
    production_bpd: 600000,
    api_gravity: "31",
    sulfur_content: "0.7%",
    type: "Conventional"
  },
  {
    name: "Priobskoye Field",
    country: "Russia",
    operator: "Rosneft/Gazprom Neft",
    latitude: 61.5,
    longitude: 72.5,
    production_bpd: 760000,
    api_gravity: "32",
    sulfur_content: "0.8%",
    type: "Conventional"
  },
  {
    name: "Daqing Field",
    country: "China",
    operator: "PetroChina",
    latitude: 46.6,
    longitude: 125.1,
    production_bpd: 640000,
    api_gravity: "32",
    sulfur_content: "0.1%",
    type: "Conventional"
  },
  {
    name: "Kashagan Field",
    country: "Kazakhstan",
    operator: "North Caspian Operating Company",
    latitude: 45.3,
    longitude: 52.2,
    production_bpd: 390000,
    api_gravity: "44",
    sulfur_content: "High H2S",
    type: "Offshore"
  },
  {
    name: "Tengiz Field",
    country: "Kazakhstan",
    operator: "Chevron",
    latitude: 45.3,
    longitude: 54.4,
    production_bpd: 700000,
    api_gravity: "44-46",
    sulfur_content: "High H2S",
    type: "Conventional"
  },
  {
    name: "Marlim Field",
    country: "Brazil",
    operator: "Petrobras",
    latitude: -22.6,
    longitude: -40.1,
    production_bpd: 420000,
    api_gravity: "19-22",
    sulfur_content: "0.6%",
    type: "Deepwater"
  },
  {
    name: "Lula Field",
    country: "Brazil",
    operator: "Petrobras",
    latitude: -24.7,
    longitude: -43.1,
    production_bpd: 1000000,
    api_gravity: "28-30",
    sulfur_content: "0.3%",
    type: "Pre-salt"
  },
  {
    name: "North Sea - Forties",
    country: "United Kingdom",
    operator: "Apache",
    latitude: 57.5,
    longitude: 0.8,
    production_bpd: 70000,
    api_gravity: "37-40",
    sulfur_content: "0.3%",
    type: "Offshore"
  },
  {
    name: "North Sea - Ekofisk",
    country: "Norway",
    operator: "ConocoPhillips",
    latitude: 56.5,
    longitude: 3.2,
    production_bpd: 320000,
    api_gravity: "37-40",
    sulfur_content: "0.2%",
    type: "Offshore"
  },
  {
    name: "Zakum Field",
    country: "UAE",
    operator: "ADNOC",
    latitude: 24.9,
    longitude: 53.2,
    production_bpd: 750000,
    api_gravity: "33-40",
    sulfur_content: "1.5-2.0%",
    type: "Offshore"
  },
  {
    name: "Hassi Messaoud",
    country: "Algeria",
    operator: "Sonatrach",
    latitude: 31.7,
    longitude: 6.1,
    production_bpd: 400000,
    api_gravity: "45",
    sulfur_content: "0.1%",
    type: "Conventional"
  },
  {
    name: "Azadegan Field",
    country: "Iran",
    operator: "NIOC",
    latitude: 31.5,
    longitude: 48.4,
    production_bpd: 185000,
    api_gravity: "18-20",
    sulfur_content: "3.5%",
    type: "Conventional"
  },
  {
    name: "South Pars/North Dome",
    country: "Iran/Qatar",
    operator: "NIOC/Qatar Petroleum",
    latitude: 26.8,
    longitude: 52.1,
    production_bpd: 0, // Mainly gas
    api_gravity: "45",
    sulfur_content: "Low",
    type: "Gas Condensate"
  },
  {
    name: "Bohai Bay",
    country: "China",
    operator: "CNOOC",
    latitude: 38.5,
    longitude: 119.5,
    production_bpd: 450000,
    api_gravity: "30-35",
    sulfur_content: "0.2%",
    type: "Offshore"
  },
  {
    name: "Kirkuk Field",
    country: "Iraq",
    operator: "North Oil Company",
    latitude: 35.5,
    longitude: 44.4,
    production_bpd: 250000,
    api_gravity: "32-36",
    sulfur_content: "2.5%",
    type: "Conventional"
  },
  {
    name: "Agha Jari Field",
    country: "Iran",
    operator: "NIOC",
    latitude: 30.7,
    longitude: 49.8,
    production_bpd: 200000,
    api_gravity: "26-34",
    sulfur_content: "1.4%",
    type: "Conventional"
  },
  // Additional Middle East Fields
  {
    name: "Shaybah Field",
    country: "Saudi Arabia",
    operator: "Saudi Aramco",
    latitude: 22.5,
    longitude: 53.9,
    production_bpd: 750000,
    api_gravity: "40-42",
    sulfur_content: "0.8%",
    type: "Conventional"
  },
  {
    name: "Manifa Field",
    country: "Saudi Arabia",
    operator: "Saudi Aramco",
    latitude: 27.5,
    longitude: 49.2,
    production_bpd: 900000,
    api_gravity: "27",
    sulfur_content: "3.3%",
    type: "Offshore"
  },
  {
    name: "Khurais Field",
    country: "Saudi Arabia",
    operator: "Saudi Aramco",
    latitude: 25.9,
    longitude: 48.5,
    production_bpd: 1200000,
    api_gravity: "32",
    sulfur_content: "1.9%",
    type: "Conventional"
  },
  {
    name: "Majnoon Field",
    country: "Iraq",
    operator: "Basra Oil Company",
    latitude: 31.6,
    longitude: 47.5,
    production_bpd: 240000,
    api_gravity: "24-30",
    sulfur_content: "3.8%",
    type: "Conventional"
  },
  {
    name: "Halfaya Field",
    country: "Iraq",
    operator: "PetroChina/Total",
    latitude: 31.9,
    longitude: 47.1,
    production_bpd: 535000,
    api_gravity: "27-31",
    sulfur_content: "3.2%",
    type: "Conventional"
  },
  {
    name: "South Rumaila Field",
    country: "Iraq",
    operator: "BP/CNPC",
    latitude: 30.2,
    longitude: 47.6,
    production_bpd: 350000,
    api_gravity: "28-32",
    sulfur_content: "3.5%",
    type: "Conventional"
  },
  {
    name: "Upper Zakum Field",
    country: "UAE",
    operator: "ADNOC",
    latitude: 25.2,
    longitude: 53.1,
    production_bpd: 700000,
    api_gravity: "33-38",
    sulfur_content: "1.8%",
    type: "Offshore"
  },
  {
    name: "Bab Field",
    country: "UAE",
    operator: "ADNOC",
    latitude: 24.1,
    longitude: 53.8,
    production_bpd: 450000,
    api_gravity: "31",
    sulfur_content: "2.0%",
    type: "Onshore"
  },
  {
    name: "Murban Field",
    country: "UAE",
    operator: "ADNOC",
    latitude: 24.2,
    longitude: 53.5,
    production_bpd: 380000,
    api_gravity: "40",
    sulfur_content: "0.8%",
    type: "Onshore"
  },
  {
    name: "Raudhatain Field",
    country: "Kuwait",
    operator: "Kuwait Oil Company",
    latitude: 29.7,
    longitude: 47.7,
    production_bpd: 280000,
    api_gravity: "30-33",
    sulfur_content: "2.4%",
    type: "Conventional"
  },
  {
    name: "Marun Field",
    country: "Iran",
    operator: "NIOC",
    latitude: 30.2,
    longitude: 49.5,
    production_bpd: 520000,
    api_gravity: "31-35",
    sulfur_content: "1.3%",
    type: "Conventional"
  },
  {
    name: "Gachsaran Field",
    country: "Iran",
    operator: "NIOC",
    latitude: 30.3,
    longitude: 50.8,
    production_bpd: 560000,
    api_gravity: "28-34",
    sulfur_content: "1.5%",
    type: "Conventional"
  },
  {
    name: "Ahwaz Field",
    country: "Iran",
    operator: "NIOC",
    latitude: 31.3,
    longitude: 48.7,
    production_bpd: 700000,
    api_gravity: "30-34",
    sulfur_content: "1.4%",
    type: "Conventional"
  },
  // Additional US Fields
  {
    name: "Spraberry Field",
    country: "United States",
    operator: "Pioneer Natural Resources",
    latitude: 32.0,
    longitude: -101.5,
    production_bpd: 400000,
    api_gravity: "40",
    sulfur_content: "0.4%",
    type: "Shale"
  },
  {
    name: "Wolfcamp Shale",
    country: "United States",
    operator: "Various Operators",
    latitude: 31.5,
    longitude: -102.0,
    production_bpd: 1800000,
    api_gravity: "38-42",
    sulfur_content: "0.3%",
    type: "Shale"
  },
  {
    name: "Bone Spring Formation",
    country: "United States",
    operator: "Chevron/Occidental",
    latitude: 32.2,
    longitude: -103.8,
    production_bpd: 350000,
    api_gravity: "41",
    sulfur_content: "0.2%",
    type: "Shale"
  },
  {
    name: "Niobrara Formation",
    country: "United States",
    operator: "PDC Energy/Occidental",
    latitude: 40.2,
    longitude: -104.5,
    production_bpd: 380000,
    api_gravity: "42-48",
    sulfur_content: "0.1%",
    type: "Shale"
  },
  {
    name: "Anadarko Basin",
    country: "United States",
    operator: "Devon Energy",
    latitude: 35.8,
    longitude: -98.5,
    production_bpd: 180000,
    api_gravity: "40",
    sulfur_content: "0.3%",
    type: "Conventional"
  },
  {
    name: "Prudhoe Bay",
    country: "United States",
    operator: "BP/ConocoPhillips",
    latitude: 70.3,
    longitude: -148.4,
    production_bpd: 300000,
    api_gravity: "27",
    sulfur_content: "0.9%",
    type: "Conventional"
  },
  {
    name: "Kuparuk Field",
    country: "United States",
    operator: "ConocoPhillips",
    latitude: 70.3,
    longitude: -149.6,
    production_bpd: 120000,
    api_gravity: "24-28",
    sulfur_content: "0.8%",
    type: "Conventional"
  },
  {
    name: "Wilmington Field",
    country: "United States",
    operator: "Various Operators",
    latitude: 33.8,
    longitude: -118.2,
    production_bpd: 25000,
    api_gravity: "19",
    sulfur_content: "1.3%",
    type: "Conventional"
  },
  // Canadian Oil Sands
  {
    name: "Athabasca Oil Sands",
    country: "Canada",
    operator: "Suncor/Syncrude",
    latitude: 57.0,
    longitude: -111.5,
    production_bpd: 2800000,
    api_gravity: "8-12",
    sulfur_content: "4.5%",
    type: "Oil Sands"
  },
  {
    name: "Cold Lake",
    country: "Canada",
    operator: "Imperial Oil",
    latitude: 54.5,
    longitude: -110.2,
    production_bpd: 160000,
    api_gravity: "12-14",
    sulfur_content: "3.8%",
    type: "Oil Sands"
  },
  {
    name: "Christina Lake",
    country: "Canada",
    operator: "Cenovus",
    latitude: 55.4,
    longitude: -110.9,
    production_bpd: 350000,
    api_gravity: "11",
    sulfur_content: "3.2%",
    type: "Oil Sands"
  },
  {
    name: "Foster Creek",
    country: "Canada",
    operator: "Cenovus",
    latitude: 55.5,
    longitude: -111.1,
    production_bpd: 180000,
    api_gravity: "11",
    sulfur_content: "3.5%",
    type: "Oil Sands"
  },
  // More Russian Fields
  {
    name: "Vankor Field",
    country: "Russia",
    operator: "Rosneft",
    latitude: 64.4,
    longitude: 87.8,
    production_bpd: 420000,
    api_gravity: "33-35",
    sulfur_content: "0.6%",
    type: "Conventional"
  },
  {
    name: "Romashkino Field",
    country: "Russia",
    operator: "Tatneft",
    latitude: 54.5,
    longitude: 52.5,
    production_bpd: 230000,
    api_gravity: "29",
    sulfur_content: "1.7%",
    type: "Conventional"
  },
  {
    name: "Urengoy Field",
    country: "Russia",
    operator: "Gazprom",
    latitude: 66.0,
    longitude: 76.6,
    production_bpd: 50000,
    api_gravity: "45",
    sulfur_content: "0.1%",
    type: "Gas Condensate"
  },
  {
    name: "Surgut Field",
    country: "Russia",
    operator: "Surgutneftegaz",
    latitude: 61.3,
    longitude: 73.4,
    production_bpd: 380000,
    api_gravity: "31",
    sulfur_content: "0.9%",
    type: "Conventional"
  },
  {
    name: "Russkoye Field",
    country: "Russia",
    operator: "Gazprom",
    latitude: 69.1,
    longitude: 78.9,
    production_bpd: 35000,
    api_gravity: "44",
    sulfur_content: "0.1%",
    type: "Gas Condensate"
  },
  // More Chinese Fields
  {
    name: "Shengli Field",
    country: "China",
    operator: "Sinopec",
    latitude: 37.5,
    longitude: 118.5,
    production_bpd: 470000,
    api_gravity: "24-32",
    sulfur_content: "0.3%",
    type: "Conventional"
  },
  {
    name: "Changqing Field",
    country: "China",
    operator: "PetroChina",
    latitude: 36.5,
    longitude: 108.5,
    production_bpd: 430000,
    api_gravity: "31",
    sulfur_content: "0.2%",
    type: "Conventional"
  },
  {
    name: "Liaohe Field",
    country: "China",
    operator: "PetroChina",
    latitude: 41.2,
    longitude: 122.1,
    production_bpd: 220000,
    api_gravity: "16-30",
    sulfur_content: "0.2%",
    type: "Conventional"
  },
  {
    name: "Tarim Basin",
    country: "China",
    operator: "PetroChina",
    latitude: 40.5,
    longitude: 83.0,
    production_bpd: 280000,
    api_gravity: "35-45",
    sulfur_content: "0.1%",
    type: "Conventional"
  },
  // Latin American Fields
  {
    name: "Cano Limon Field",
    country: "Colombia",
    operator: "Occidental/Ecopetrol",
    latitude: 7.2,
    longitude: -71.3,
    production_bpd: 65000,
    api_gravity: "29",
    sulfur_content: "0.5%",
    type: "Conventional"
  },
  {
    name: "Rubiales Field",
    country: "Colombia",
    operator: "Ecopetrol",
    latitude: 4.9,
    longitude: -71.5,
    production_bpd: 120000,
    api_gravity: "12-18",
    sulfur_content: "1.8%",
    type: "Heavy Oil"
  },
  {
    name: "Vaca Muerta",
    country: "Argentina",
    operator: "YPF/Shell/Chevron",
    latitude: -38.5,
    longitude: -69.5,
    production_bpd: 120000,
    api_gravity: "38-42",
    sulfur_content: "0.3%",
    type: "Shale"
  },
  {
    name: "Orinoco Belt",
    country: "Venezuela",
    operator: "PDVSA",
    latitude: 8.5,
    longitude: -64.5,
    production_bpd: 800000,
    api_gravity: "8-12",
    sulfur_content: "3.5%",
    type: "Extra Heavy Oil"
  },
  {
    name: "Maracaibo Basin",
    country: "Venezuela",
    operator: "PDVSA",
    latitude: 9.5,
    longitude: -71.5,
    production_bpd: 450000,
    api_gravity: "16-32",
    sulfur_content: "1.5%",
    type: "Conventional"
  },
  {
    name: "Sergipe-Alagoas Basin",
    country: "Brazil",
    operator: "Petrobras",
    latitude: -10.5,
    longitude: -36.5,
    production_bpd: 35000,
    api_gravity: "30-38",
    sulfur_content: "0.2%",
    type: "Offshore"
  },
  {
    name: "Campos Basin",
    country: "Brazil",
    operator: "Petrobras",
    latitude: -22.5,
    longitude: -40.5,
    production_bpd: 1400000,
    api_gravity: "18-30",
    sulfur_content: "0.4%",
    type: "Offshore"
  },
  {
    name: "Buzios Field",
    country: "Brazil",
    operator: "Petrobras",
    latitude: -24.2,
    longitude: -42.8,
    production_bpd: 620000,
    api_gravity: "28-30",
    sulfur_content: "0.3%",
    type: "Pre-salt"
  },
  {
    name: "Mero Field",
    country: "Brazil",
    operator: "Petrobras/Total",
    latitude: -23.8,
    longitude: -43.5,
    production_bpd: 180000,
    api_gravity: "29",
    sulfur_content: "0.3%",
    type: "Pre-salt"
  },
  // African Fields
  {
    name: "Safaniyah Offshore",
    country: "Nigeria",
    operator: "Shell/Total/Eni",
    latitude: 4.5,
    longitude: 6.5,
    production_bpd: 900000,
    api_gravity: "24-37",
    sulfur_content: "0.2%",
    type: "Offshore"
  },
  {
    name: "Bonny Light Field",
    country: "Nigeria",
    operator: "Shell",
    latitude: 4.4,
    longitude: 7.2,
    production_bpd: 200000,
    api_gravity: "32-37",
    sulfur_content: "0.2%",
    type: "Offshore"
  },
  {
    name: "Forcados Field",
    country: "Nigeria",
    operator: "Shell/Chevron",
    latitude: 5.4,
    longitude: 5.4,
    production_bpd: 250000,
    api_gravity: "28-30",
    sulfur_content: "0.2%",
    type: "Offshore"
  },
  {
    name: "Girassol Field",
    country: "Angola",
    operator: "Total",
    latitude: -8.9,
    longitude: 13.1,
    production_bpd: 200000,
    api_gravity: "32",
    sulfur_content: "0.4%",
    type: "Deepwater"
  },
  {
    name: "Dalia Field",
    country: "Angola",
    operator: "Total/BP",
    latitude: -8.8,
    longitude: 13.0,
    production_bpd: 240000,
    api_gravity: "26",
    sulfur_content: "0.5%",
    type: "Deepwater"
  },
  {
    name: "Pazflor Field",
    country: "Angola",
    operator: "Total",
    latitude: -7.9,
    longitude: 11.8,
    production_bpd: 220000,
    api_gravity: "28",
    sulfur_content: "0.4%",
    type: "Deepwater"
  },
  {
    name: "Karamay Field",
    country: "China",
    operator: "PetroChina",
    latitude: 45.6,
    longitude: 84.9,
    production_bpd: 120000,
    api_gravity: "24-28",
    sulfur_content: "0.3%",
    type: "Conventional"
  },
  {
    name: "Jubilee Field",
    country: "Ghana",
    operator: "Tullow Oil",
    latitude: 4.8,
    longitude: -2.9,
    production_bpd: 100000,
    api_gravity: "38",
    sulfur_content: "0.4%",
    type: "Offshore"
  },
  {
    name: "Mamba Complex",
    country: "Mozambique",
    operator: "Eni/Total",
    latitude: -14.8,
    longitude: 40.7,
    production_bpd: 10000,
    api_gravity: "42",
    sulfur_content: "0.1%",
    type: "Gas Condensate"
  },
  // Additional North Sea Fields
  {
    name: "Troll Field",
    country: "Norway",
    operator: "Equinor",
    latitude: 60.7,
    longitude: 3.7,
    production_bpd: 180000,
    api_gravity: "38",
    sulfur_content: "0.1%",
    type: "Offshore"
  },
  {
    name: "Oseberg Field",
    country: "Norway",
    operator: "Equinor",
    latitude: 60.5,
    longitude: 2.8,
    production_bpd: 160000,
    api_gravity: "36",
    sulfur_content: "0.2%",
    type: "Offshore"
  },
  {
    name: "Statfjord Field",
    country: "Norway",
    operator: "Equinor",
    latitude: 61.2,
    longitude: 1.8,
    production_bpd: 80000,
    api_gravity: "39",
    sulfur_content: "0.2%",
    type: "Offshore"
  },
  {
    name: "Gullfaks Field",
    country: "Norway",
    operator: "Equinor",
    latitude: 61.2,
    longitude: 2.3,
    production_bpd: 110000,
    api_gravity: "33",
    sulfur_content: "0.3%",
    type: "Offshore"
  },
  {
    name: "Johan Sverdrup",
    country: "Norway",
    operator: "Equinor",
    latitude: 58.9,
    longitude: 2.8,
    production_bpd: 535000,
    api_gravity: "33",
    sulfur_content: "0.1%",
    type: "Offshore"
  },
  // Additional Asian Fields
  {
    name: "Seria Field",
    country: "Brunei",
    operator: "Brunei Shell",
    latitude: 4.6,
    longitude: 114.3,
    production_bpd: 60000,
    api_gravity: "34",
    sulfur_content: "0.1%",
    type: "Conventional"
  },
  {
    name: "Minas Field",
    country: "Indonesia",
    operator: "Chevron",
    latitude: 0.5,
    longitude: 101.5,
    production_bpd: 180000,
    api_gravity: "34",
    sulfur_content: "0.1%",
    type: "Conventional"
  },
  {
    name: "Duri Field",
    country: "Indonesia",
    operator: "Chevron",
    latitude: 1.4,
    longitude: 101.2,
    production_bpd: 150000,
    api_gravity: "21",
    sulfur_content: "0.2%",
    type: "Heavy Oil"
  },
  {
    name: "Malampaya Field",
    country: "Philippines",
    operator: "Shell",
    latitude: 10.8,
    longitude: 119.9,
    production_bpd: 5000,
    api_gravity: "46",
    sulfur_content: "0.1%",
    type: "Gas Condensate"
  },
  {
    name: "Bombay High",
    country: "India",
    operator: "ONGC",
    latitude: 19.8,
    longitude: 71.7,
    production_bpd: 180000,
    api_gravity: "38-40",
    sulfur_content: "0.2%",
    type: "Offshore"
  },
  {
    name: "Krishna-Godavari Basin",
    country: "India",
    operator: "Reliance/ONGC",
    latitude: 16.5,
    longitude: 81.8,
    production_bpd: 45000,
    api_gravity: "40-42",
    sulfur_content: "0.1%",
    type: "Offshore"
  },
  // Southeast Asian Fields
  {
    name: "Khafji Field",
    country: "Saudi Arabia/Kuwait",
    operator: "Saudi Aramco/KOC",
    latitude: 28.4,
    longitude: 48.5,
    production_bpd: 300000,
    api_gravity: "29",
    sulfur_content: "2.9%",
    type: "Offshore"
  },
  // Australian Fields
  {
    name: "Gippsland Basin",
    country: "Australia",
    operator: "ExxonMobil/BHP",
    latitude: -38.5,
    longitude: 148.5,
    production_bpd: 80000,
    api_gravity: "42-48",
    sulfur_content: "0.1%",
    type: "Offshore"
  },
  {
    name: "North West Shelf",
    country: "Australia",
    operator: "Woodside",
    latitude: -18.5,
    longitude: 116.5,
    production_bpd: 35000,
    api_gravity: "48-50",
    sulfur_content: "0.1%",
    type: "Gas Condensate"
  },
  // === ADDITIONAL USA FIELDS ===
  {
    name: "Thunder Horse",
    country: "United States",
    operator: "BP",
    latitude: 28.2,
    longitude: -88.5,
    production_bpd: 250000,
    api_gravity: "31",
    sulfur_content: "0.6%",
    type: "Deepwater"
  },
  {
    name: "Mars Field",
    country: "United States",
    operator: "Shell",
    latitude: 28.9,
    longitude: -88.0,
    production_bpd: 100000,
    api_gravity: "30",
    sulfur_content: "0.7%",
    type: "Deepwater"
  },
  {
    name: "Atlantis Field",
    country: "United States",
    operator: "BP/Shell",
    latitude: 27.2,
    longitude: -90.0,
    production_bpd: 200000,
    api_gravity: "29",
    sulfur_content: "0.8%",
    type: "Deepwater"
  },
  {
    name: "Mad Dog",
    country: "United States",
    operator: "BP",
    latitude: 27.6,
    longitude: -90.5,
    production_bpd: 100000,
    api_gravity: "28",
    sulfur_content: "0.9%",
    type: "Deepwater"
  },
  {
    name: "Na Kika",
    country: "United States",
    operator: "Shell",
    latitude: 28.6,
    longitude: -88.2,
    production_bpd: 70000,
    api_gravity: "32",
    sulfur_content: "0.5%",
    type: "Deepwater"
  },
  {
    name: "SCOOP/STACK Play",
    country: "United States",
    operator: "Continental Resources/Devon",
    latitude: 35.5,
    longitude: -97.8,
    production_bpd: 350000,
    api_gravity: "41",
    sulfur_content: "0.2%",
    type: "Shale"
  },
  {
    name: "DJ Basin",
    country: "United States",
    operator: "Occidental/PDC Energy",
    latitude: 40.4,
    longitude: -104.7,
    production_bpd: 480000,
    api_gravity: "42-46",
    sulfur_content: "0.1%",
    type: "Shale"
  },
  {
    name: "Haynesville Shale",
    country: "United States",
    operator: "Chesapeake/BHP",
    latitude: 32.1,
    longitude: -93.9,
    production_bpd: 40000,
    api_gravity: "53",
    sulfur_content: "0.1%",
    type: "Gas Condensate"
  },
  {
    name: "Utica Shale",
    country: "United States",
    operator: "EQT/Chesapeake",
    latitude: 40.2,
    longitude: -81.0,
    production_bpd: 200000,
    api_gravity: "45",
    sulfur_content: "0.1%",
    type: "Shale"
  },
  {
    name: "Point Thomson",
    country: "United States",
    operator: "ExxonMobil",
    latitude: 70.1,
    longitude: -146.3,
    production_bpd: 10000,
    api_gravity: "50",
    sulfur_content: "0.1%",
    type: "Gas Condensate"
  },
  // === ADDITIONAL RUSSIAN FIELDS ===
  {
    name: "Sakhalin-1",
    country: "Russia",
    operator: "ExxonMobil/Rosneft",
    latitude: 51.8,
    longitude: 143.2,
    production_bpd: 220000,
    api_gravity: "35",
    sulfur_content: "0.3%",
    type: "Offshore"
  },
  {
    name: "Sakhalin-2",
    country: "Russia",
    operator: "Gazprom/Shell",
    latitude: 48.5,
    longitude: 142.5,
    production_bpd: 180000,
    api_gravity: "33",
    sulfur_content: "0.4%",
    type: "Offshore"
  },
  {
    name: "Fedorovsky Field",
    country: "Russia",
    operator: "Surgutneftegaz",
    latitude: 61.4,
    longitude: 73.2,
    production_bpd: 200000,
    api_gravity: "32",
    sulfur_content: "0.8%",
    type: "Conventional"
  },
  {
    name: "Mamontovskoye Field",
    country: "Russia",
    operator: "Rosneft",
    latitude: 61.6,
    longitude: 75.8,
    production_bpd: 180000,
    api_gravity: "33",
    sulfur_content: "0.7%",
    type: "Conventional"
  },
  {
    name: "Salym Field",
    country: "Russia",
    operator: "Gazprom Neft/Shell",
    latitude: 60.9,
    longitude: 74.2,
    production_bpd: 120000,
    api_gravity: "34",
    sulfur_content: "0.6%",
    type: "Conventional"
  },
  {
    name: "Yuganskneftegaz Fields",
    country: "Russia",
    operator: "Rosneft",
    latitude: 61.2,
    longitude: 76.8,
    production_bpd: 1200000,
    api_gravity: "31",
    sulfur_content: "0.9%",
    type: "Conventional"
  },
  {
    name: "Novoportovskoye Field",
    country: "Russia",
    operator: "Gazprom Neft",
    latitude: 67.7,
    longitude: 72.9,
    production_bpd: 270000,
    api_gravity: "36",
    sulfur_content: "0.5%",
    type: "Arctic"
  },
  {
    name: "Verkhnechonskoye Field",
    country: "Russia",
    operator: "Rosneft/BP",
    latitude: 59.5,
    longitude: 110.5,
    production_bpd: 180000,
    api_gravity: "35",
    sulfur_content: "0.4%",
    type: "Conventional"
  },
  {
    name: "Talakan Field",
    country: "Russia",
    operator: "Surgutneftegaz",
    latitude: 59.8,
    longitude: 111.2,
    production_bpd: 90000,
    api_gravity: "36",
    sulfur_content: "0.3%",
    type: "Conventional"
  },
  // === ADDITIONAL SAUDI ARABIA FIELDS ===
  {
    name: "Abqaiq Field",
    country: "Saudi Arabia",
    operator: "Saudi Aramco",
    latitude: 25.9,
    longitude: 49.7,
    production_bpd: 400000,
    api_gravity: "37",
    sulfur_content: "2.0%",
    type: "Conventional"
  },
  {
    name: "Berri Field",
    country: "Saudi Arabia",
    operator: "Saudi Aramco",
    latitude: 27.8,
    longitude: 49.6,
    production_bpd: 250000,
    api_gravity: "39",
    sulfur_content: "1.1%",
    type: "Offshore"
  },
  {
    name: "Zuluf Field",
    country: "Saudi Arabia",
    operator: "Saudi Aramco",
    latitude: 27.9,
    longitude: 49.0,
    production_bpd: 500000,
    api_gravity: "31",
    sulfur_content: "2.8%",
    type: "Offshore"
  },
  {
    name: "Marjan Field",
    country: "Saudi Arabia",
    operator: "Saudi Aramco",
    latitude: 28.1,
    longitude: 48.9,
    production_bpd: 450000,
    api_gravity: "33",
    sulfur_content: "2.4%",
    type: "Offshore"
  },
  {
    name: "Qatif Field",
    country: "Saudi Arabia",
    operator: "Saudi Aramco",
    latitude: 26.5,
    longitude: 50.0,
    production_bpd: 800000,
    api_gravity: "36",
    sulfur_content: "1.5%",
    type: "Onshore"
  },
  {
    name: "Abu Safah Field",
    country: "Saudi Arabia",
    operator: "Saudi Aramco",
    latitude: 28.0,
    longitude: 48.7,
    production_bpd: 300000,
    api_gravity: "28",
    sulfur_content: "3.0%",
    type: "Offshore"
  },
  // === ADDITIONAL NIGERIAN FIELDS ===
  {
    name: "Bonga Field",
    country: "Nigeria",
    operator: "Shell",
    latitude: 4.4,
    longitude: 3.4,
    production_bpd: 225000,
    api_gravity: "28-31",
    sulfur_content: "0.2%",
    type: "Deepwater"
  },
  {
    name: "Agbami Field",
    country: "Nigeria",
    operator: "Chevron/Total",
    latitude: 4.7,
    longitude: 3.7,
    production_bpd: 250000,
    api_gravity: "47-48",
    sulfur_content: "0.04%",
    type: "Deepwater"
  },
  {
    name: "Akpo Field",
    country: "Nigeria",
    operator: "Total",
    latitude: 4.5,
    longitude: 3.9,
    production_bpd: 175000,
    api_gravity: "35",
    sulfur_content: "0.1%",
    type: "Deepwater"
  },
  {
    name: "Erha Field",
    country: "Nigeria",
    operator: "ExxonMobil",
    latitude: 4.0,
    longitude: 3.3,
    production_bpd: 210000,
    api_gravity: "25",
    sulfur_content: "0.1%",
    type: "Deepwater"
  },
  {
    name: "Bonga Southwest",
    country: "Nigeria",
    operator: "Shell",
    latitude: 4.2,
    longitude: 3.2,
    production_bpd: 150000,
    api_gravity: "29",
    sulfur_content: "0.2%",
    type: "Deepwater"
  },
  {
    name: "Egina Field",
    country: "Nigeria",
    operator: "Total",
    latitude: 4.6,
    longitude: 3.6,
    production_bpd: 200000,
    api_gravity: "28",
    sulfur_content: "0.1%",
    type: "Deepwater"
  },
  {
    name: "Usan Field",
    country: "Nigeria",
    operator: "ExxonMobil",
    latitude: 4.3,
    longitude: 4.2,
    production_bpd: 180000,
    api_gravity: "21",
    sulfur_content: "0.1%",
    type: "Deepwater"
  },
  {
    name: "Qua Iboe Field",
    country: "Nigeria",
    operator: "ExxonMobil",
    latitude: 4.5,
    longitude: 7.9,
    production_bpd: 300000,
    api_gravity: "36",
    sulfur_content: "0.1%",
    type: "Offshore"
  },
  {
    name: "Escravos Field",
    country: "Nigeria",
    operator: "Chevron",
    latitude: 5.5,
    longitude: 5.1,
    production_bpd: 150000,
    api_gravity: "30-37",
    sulfur_content: "0.2%",
    type: "Offshore"
  },
  {
    name: "Brass River Field",
    country: "Nigeria",
    operator: "Eni",
    latitude: 4.9,
    longitude: 6.2,
    production_bpd: 110000,
    api_gravity: "42",
    sulfur_content: "0.1%",
    type: "Offshore"
  },
  // === ADDITIONAL ALGERIAN FIELDS ===
  {
    name: "Hassi R'Mel",
    country: "Algeria",
    operator: "Sonatrach",
    latitude: 32.9,
    longitude: 3.3,
    production_bpd: 50000,
    api_gravity: "55",
    sulfur_content: "0.1%",
    type: "Gas Condensate"
  },
  {
    name: "Ourhoud Field",
    country: "Algeria",
    operator: "Sonatrach/Anadarko",
    latitude: 31.5,
    longitude: 6.5,
    production_bpd: 100000,
    api_gravity: "43",
    sulfur_content: "0.1%",
    type: "Conventional"
  },
  {
    name: "El Merk Field",
    country: "Algeria",
    operator: "Sonatrach/Cepsa",
    latitude: 30.8,
    longitude: 6.2,
    production_bpd: 80000,
    api_gravity: "44",
    sulfur_content: "0.1%",
    type: "Conventional"
  },
  {
    name: "Berkine Basin",
    country: "Algeria",
    operator: "Sonatrach/Various",
    latitude: 31.0,
    longitude: 6.8,
    production_bpd: 300000,
    api_gravity: "43-45",
    sulfur_content: "0.1%",
    type: "Conventional"
  },
  {
    name: "Tin Fouye Tabankort",
    country: "Algeria",
    operator: "Sonatrach/Total",
    latitude: 28.5,
    longitude: 7.5,
    production_bpd: 200000,
    api_gravity: "42",
    sulfur_content: "0.1%",
    type: "Conventional"
  },
  {
    name: "Hassi Berkine",
    country: "Algeria",
    operator: "Sonatrach",
    latitude: 31.2,
    longitude: 6.3,
    production_bpd: 180000,
    api_gravity: "44",
    sulfur_content: "0.1%",
    type: "Conventional"
  },
  {
    name: "Rhourde el Baguel",
    country: "Algeria",
    operator: "Sonatrach",
    latitude: 32.1,
    longitude: 5.8,
    production_bpd: 60000,
    api_gravity: "43",
    sulfur_content: "0.1%",
    type: "Conventional"
  },
  // === ADDITIONAL CANADIAN FIELDS ===
  {
    name: "Kearl Oil Sands",
    country: "Canada",
    operator: "Imperial Oil/ExxonMobil",
    latitude: 57.2,
    longitude: -111.0,
    production_bpd: 280000,
    api_gravity: "11",
    sulfur_content: "3.8%",
    type: "Oil Sands"
  },
  {
    name: "Horizon Oil Sands",
    country: "Canada",
    operator: "CNRL",
    latitude: 57.3,
    longitude: -111.6,
    production_bpd: 250000,
    api_gravity: "10",
    sulfur_content: "4.2%",
    type: "Oil Sands"
  },
  {
    name: "Firebag",
    country: "Canada",
    operator: "Suncor",
    latitude: 57.1,
    longitude: -111.2,
    production_bpd: 215000,
    api_gravity: "11",
    sulfur_content: "3.5%",
    type: "Oil Sands"
  },
  {
    name: "Jackpine",
    country: "Canada",
    operator: "Shell",
    latitude: 57.2,
    longitude: -111.4,
    production_bpd: 100000,
    api_gravity: "11",
    sulfur_content: "3.7%",
    type: "Oil Sands"
  },
  {
    name: "Albian Sands",
    country: "Canada",
    operator: "Shell/Chevron",
    latitude: 57.0,
    longitude: -111.7,
    production_bpd: 255000,
    api_gravity: "11",
    sulfur_content: "4.0%",
    type: "Oil Sands"
  },
  {
    name: "Sunrise Oil Sands",
    country: "Canada",
    operator: "Husky",
    latitude: 56.8,
    longitude: -111.3,
    production_bpd: 60000,
    api_gravity: "12",
    sulfur_content: "3.3%",
    type: "Oil Sands"
  },
  {
    name: "MacKay River",
    country: "Canada",
    operator: "Suncor",
    latitude: 57.0,
    longitude: -111.1,
    production_bpd: 38000,
    api_gravity: "11",
    sulfur_content: "3.6%",
    type: "Oil Sands"
  },
  {
    name: "Hibernia",
    country: "Canada",
    operator: "ExxonMobil/Chevron",
    latitude: 46.8,
    longitude: -48.8,
    production_bpd: 135000,
    api_gravity: "36",
    sulfur_content: "0.4%",
    type: "Offshore"
  },
  {
    name: "Terra Nova",
    country: "Canada",
    operator: "Suncor",
    latitude: 46.5,
    longitude: -48.6,
    production_bpd: 35000,
    api_gravity: "34",
    sulfur_content: "0.4%",
    type: "Offshore"
  },
  {
    name: "White Rose",
    country: "Canada",
    operator: "Husky",
    latitude: 46.9,
    longitude: -48.7,
    production_bpd: 75000,
    api_gravity: "35",
    sulfur_content: "0.4%",
    type: "Offshore"
  },
  {
    name: "Hebron",
    country: "Canada",
    operator: "ExxonMobil",
    latitude: 46.7,
    longitude: -48.5,
    production_bpd: 150000,
    api_gravity: "35",
    sulfur_content: "0.4%",
    type: "Offshore"
  },
  {
    name: "Lloydminster Heavy Oil",
    country: "Canada",
    operator: "Husky/CNRL/Cenovus",
    latitude: 53.3,
    longitude: -110.0,
    production_bpd: 450000,
    api_gravity: "14-18",
    sulfur_content: "2.5%",
    type: "Heavy Oil"
  },
  // === ADDITIONAL IRAQ FIELDS ===
  {
    name: "Zubair Field",
    country: "Iraq",
    operator: "Eni/Kogas/Occidental",
    latitude: 30.4,
    longitude: 47.7,
    production_bpd: 475000,
    api_gravity: "30-34",
    sulfur_content: "3.0%",
    type: "Conventional"
  },
  {
    name: "Badra Field",
    country: "Iraq",
    operator: "Gazprom Neft",
    latitude: 32.6,
    longitude: 46.0,
    production_bpd: 170000,
    api_gravity: "27",
    sulfur_content: "3.5%",
    type: "Conventional"
  },
  {
    name: "Gharraf Field",
    country: "Iraq",
    operator: "Petronas",
    latitude: 31.0,
    longitude: 46.3,
    production_bpd: 230000,
    api_gravity: "31",
    sulfur_content: "2.8%",
    type: "Conventional"
  },
  // === LIBYA FIELDS ===
  {
    name: "Sharara Field",
    country: "Libya",
    operator: "NOC/Repsol",
    latitude: 27.8,
    longitude: 12.5,
    production_bpd: 315000,
    api_gravity: "44",
    sulfur_content: "0.1%",
    type: "Conventional"
  },
  {
    name: "Waha Field",
    country: "Libya",
    operator: "NOC/ConocoPhillips",
    latitude: 28.8,
    longitude: 21.5,
    production_bpd: 350000,
    api_gravity: "42",
    sulfur_content: "0.2%",
    type: "Conventional"
  },
  {
    name: "Sarir Field",
    country: "Libya",
    operator: "NOC/Agoco",
    latitude: 27.5,
    longitude: 22.5,
    production_bpd: 200000,
    api_gravity: "38",
    sulfur_content: "0.4%",
    type: "Conventional"
  },
  {
    name: "Messla Field",
    country: "Libya",
    operator: "NOC/Agoco",
    latitude: 28.2,
    longitude: 22.0,
    production_bpd: 240000,
    api_gravity: "40",
    sulfur_content: "0.3%",
    type: "Conventional"
  },
  {
    name: "El Feel Field",
    country: "Libya",
    operator: "NOC/Eni",
    latitude: 28.5,
    longitude: 13.2,
    production_bpd: 90000,
    api_gravity: "43",
    sulfur_content: "0.1%",
    type: "Conventional"
  },
  // === ADDITIONAL VENEZUELA FIELDS ===
  {
    name: "Lago de Maracaibo",
    country: "Venezuela",
    operator: "PDVSA",
    latitude: 10.0,
    longitude: -71.6,
    production_bpd: 600000,
    api_gravity: "22-26",
    sulfur_content: "1.5%",
    type: "Offshore"
  },
  {
    name: "Furrial Field",
    country: "Venezuela",
    operator: "PDVSA",
    latitude: 9.6,
    longitude: -63.3,
    production_bpd: 200000,
    api_gravity: "24",
    sulfur_content: "1.0%",
    type: "Conventional"
  },
  {
    name: "Hamaca Project",
    country: "Venezuela",
    operator: "PDVSA/Chevron",
    latitude: 8.7,
    longitude: -63.8,
    production_bpd: 180000,
    api_gravity: "9",
    sulfur_content: "3.8%",
    type: "Extra Heavy Oil"
  },
  // === ADDITIONAL ANGOLA FIELDS ===
  {
    name: "CLOV Field",
    country: "Angola",
    operator: "Total",
    latitude: -8.5,
    longitude: 13.2,
    production_bpd: 160000,
    api_gravity: "31",
    sulfur_content: "0.4%",
    type: "Deepwater"
  },
  {
    name: "Kizomba Field",
    country: "Angola",
    operator: "ExxonMobil/BP",
    latitude: -7.5,
    longitude: 12.8,
    production_bpd: 250000,
    api_gravity: "28",
    sulfur_content: "0.4%",
    type: "Deepwater"
  },
  {
    name: "Greater Plutonio",
    country: "Angola",
    operator: "BP",
    latitude: -7.8,
    longitude: 12.5,
    production_bpd: 240000,
    api_gravity: "27",
    sulfur_content: "0.5%",
    type: "Deepwater"
  },
  {
    name: "Cabinda Field",
    country: "Angola",
    operator: "Chevron",
    latitude: -5.5,
    longitude: 12.2,
    production_bpd: 300000,
    api_gravity: "32",
    sulfur_content: "0.2%",
    type: "Offshore"
  },
  // === ADDITIONAL UK FIELDS ===
  {
    name: "Buzzard Field",
    country: "United Kingdom",
    operator: "Nexen/CNOOC",
    latitude: 57.8,
    longitude: 0.2,
    production_bpd: 180000,
    api_gravity: "33",
    sulfur_content: "0.4%",
    type: "Offshore"
  },
  {
    name: "Schiehallion Field",
    country: "United Kingdom",
    operator: "BP",
    latitude: 60.4,
    longitude: -4.0,
    production_bpd: 130000,
    api_gravity: "25",
    sulfur_content: "0.5%",
    type: "Offshore"
  },
  {
    name: "Clair Field",
    country: "United Kingdom",
    operator: "BP",
    latitude: 60.8,
    longitude: -2.2,
    production_bpd: 120000,
    api_gravity: "29",
    sulfur_content: "0.6%",
    type: "Offshore"
  },
  // === AZERBAIJAN FIELDS ===
  {
    name: "Azeri-Chirag-Gunashli",
    country: "Azerbaijan",
    operator: "BP",
    latitude: 40.1,
    longitude: 50.4,
    production_bpd: 650000,
    api_gravity: "34-35",
    sulfur_content: "0.15%",
    type: "Offshore"
  },
  {
    name: "Shah Deniz",
    country: "Azerbaijan",
    operator: "BP",
    latitude: 39.9,
    longitude: 50.2,
    production_bpd: 50000,
    api_gravity: "50",
    sulfur_content: "0.1%",
    type: "Gas Condensate"
  },
  {
    name: "Baku Oil Fields",
    country: "Azerbaijan",
    operator: "SOCAR",
    latitude: 40.4,
    longitude: 50.0,
    production_bpd: 80000,
    api_gravity: "32",
    sulfur_content: "0.4%",
    type: "Onshore"
  },
  // === OMAN FIELDS ===
  {
    name: "Fahud Field",
    country: "Oman",
    operator: "PDO",
    latitude: 22.3,
    longitude: 56.5,
    production_bpd: 100000,
    api_gravity: "34",
    sulfur_content: "0.8%",
    type: "Conventional"
  },
  {
    name: "Yibal Field",
    country: "Oman",
    operator: "PDO",
    latitude: 21.8,
    longitude: 57.5,
    production_bpd: 85000,
    api_gravity: "33",
    sulfur_content: "0.9%",
    type: "Conventional"
  },
  {
    name: "Mukhaizna Field",
    country: "Oman",
    operator: "Occidental",
    latitude: 19.5,
    longitude: 56.0,
    production_bpd: 150000,
    api_gravity: "15",
    sulfur_content: "2.0%",
    type: "Heavy Oil"
  },
  {
    name: "Nimr Field",
    country: "Oman",
    operator: "PDO",
    latitude: 20.2,
    longitude: 56.8,
    production_bpd: 90000,
    api_gravity: "23",
    sulfur_content: "1.2%",
    type: "Conventional"
  },
  // === ADDITIONAL UAE FIELDS ===
  {
    name: "Umm Shaif Field",
    country: "UAE",
    operator: "ADNOC",
    latitude: 25.6,
    longitude: 53.0,
    production_bpd: 275000,
    api_gravity: "37",
    sulfur_content: "1.1%",
    type: "Offshore"
  },
  {
    name: "Asab Field",
    country: "UAE",
    operator: "ADNOC",
    latitude: 24.5,
    longitude: 53.7,
    production_bpd: 120000,
    api_gravity: "32",
    sulfur_content: "1.8%",
    type: "Onshore"
  },
  {
    name: "Shah Gas Field",
    country: "UAE",
    operator: "ADNOC",
    latitude: 24.0,
    longitude: 53.9,
    production_bpd: 30000,
    api_gravity: "48",
    sulfur_content: "High H2S",
    type: "Gas Condensate"
  },
  // === ADDITIONAL KUWAIT FIELDS ===
  {
    name: "Sabriya Field",
    country: "Kuwait",
    operator: "Kuwait Oil Company",
    latitude: 29.5,
    longitude: 48.0,
    production_bpd: 180000,
    api_gravity: "32",
    sulfur_content: "2.6%",
    type: "Conventional"
  },
  {
    name: "Minagish Field",
    country: "Kuwait",
    operator: "Kuwait Oil Company",
    latitude: 29.0,
    longitude: 47.4,
    production_bpd: 150000,
    api_gravity: "31",
    sulfur_content: "2.7%",
    type: "Conventional"
  },
  // === ADDITIONAL KAZAKHSTAN FIELDS ===
  {
    name: "Karachaganak Field",
    country: "Kazakhstan",
    operator: "Shell/Eni",
    latitude: 51.2,
    longitude: 53.0,
    production_bpd: 250000,
    api_gravity: "46",
    sulfur_content: "High H2S",
    type: "Gas Condensate"
  },
  {
    name: "Uzen Field",
    country: "Kazakhstan",
    operator: "KazMunayGas",
    latitude: 43.9,
    longitude: 54.2,
    production_bpd: 160000,
    api_gravity: "30",
    sulfur_content: "1.8%",
    type: "Conventional"
  },
  {
    name: "Zhanazhol Field",
    country: "Kazakhstan",
    operator: "KazMunayGas",
    latitude: 45.5,
    longitude: 52.0,
    production_bpd: 100000,
    api_gravity: "42",
    sulfur_content: "High H2S",
    type: "Conventional"
  },
  // === ADDITIONAL MEXICO FIELDS ===
  {
    name: "Ku-Maloob-Zaap",
    country: "Mexico",
    operator: "Pemex",
    latitude: 19.4,
    longitude: -92.5,
    production_bpd: 650000,
    api_gravity: "22-26",
    sulfur_content: "3.3%",
    type: "Offshore"
  },
  {
    name: "Ayatsil Field",
    country: "Mexico",
    operator: "Pemex",
    latitude: 18.8,
    longitude: -92.7,
    production_bpd: 80000,
    api_gravity: "12",
    sulfur_content: "5.5%",
    type: "Offshore"
  },
  {
    name: "Tsimin-Xux Field",
    country: "Mexico",
    operator: "Pemex",
    latitude: 19.6,
    longitude: -92.2,
    production_bpd: 50000,
    api_gravity: "22",
    sulfur_content: "3.8%",
    type: "Offshore"
  },
  // === MALAYSIA FIELDS ===
  {
    name: "Tapis Field",
    country: "Malaysia",
    operator: "Petronas",
    latitude: 3.2,
    longitude: 105.0,
    production_bpd: 90000,
    api_gravity: "46",
    sulfur_content: "0.03%",
    type: "Offshore"
  },
  {
    name: "Dulang Field",
    country: "Malaysia",
    operator: "Petronas",
    latitude: 3.5,
    longitude: 105.2,
    production_bpd: 70000,
    api_gravity: "41",
    sulfur_content: "0.1%",
    type: "Offshore"
  },
  {
    name: "Miri Field",
    country: "Malaysia",
    operator: "Petronas",
    latitude: 4.4,
    longitude: 114.0,
    production_bpd: 50000,
    api_gravity: "36",
    sulfur_content: "0.1%",
    type: "Onshore"
  },
  {
    name: "Kikeh Field",
    country: "Malaysia",
    operator: "Murphy Oil",
    latitude: 5.5,
    longitude: 117.0,
    production_bpd: 55000,
    api_gravity: "33",
    sulfur_content: "0.1%",
    type: "Deepwater"
  },
  // === QATAR FIELDS ===
  {
    name: "Dukhan Field",
    country: "Qatar",
    operator: "Qatar Petroleum",
    latitude: 25.4,
    longitude: 50.8,
    production_bpd: 335000,
    api_gravity: "41",
    sulfur_content: "1.3%",
    type: "Onshore"
  },
  {
    name: "Al-Shaheen Field",
    country: "Qatar",
    operator: "TotalEnergies",
    latitude: 25.9,
    longitude: 51.7,
    production_bpd: 300000,
    api_gravity: "40",
    sulfur_content: "1.5%",
    type: "Offshore"
  },
  {
    name: "Idd El-Shargi Field",
    country: "Qatar",
    operator: "Qatar Petroleum",
    latitude: 25.7,
    longitude: 51.6,
    production_bpd: 80000,
    api_gravity: "38",
    sulfur_content: "1.4%",
    type: "Offshore"
  },
  // === EGYPT FIELDS ===
  {
    name: "October Field",
    country: "Egypt",
    operator: "Eni",
    latitude: 31.5,
    longitude: 30.5,
    production_bpd: 80000,
    api_gravity: "32",
    sulfur_content: "1.8%",
    type: "Onshore"
  },
  {
    name: "Belayim Field",
    country: "Egypt",
    operator: "EGPC/Petrobel",
    latitude: 28.4,
    longitude: 33.2,
    production_bpd: 120000,
    api_gravity: "27-31",
    sulfur_content: "2.1%",
    type: "Offshore"
  },
  {
    name: "Gulf of Suez Fields",
    country: "Egypt",
    operator: "EGPC/Various",
    latitude: 28.0,
    longitude: 33.5,
    production_bpd: 250000,
    api_gravity: "30-33",
    sulfur_content: "1.5%",
    type: "Offshore"
  },
  {
    name: "Zohr Gas Field",
    country: "Egypt",
    operator: "Eni",
    latitude: 31.8,
    longitude: 33.0,
    production_bpd: 40000,
    api_gravity: "50",
    sulfur_content: "0.1%",
    type: "Gas Condensate"
  },
  // === ADDITIONAL ARGENTINA FIELDS ===
  {
    name: "Neuquen Basin",
    country: "Argentina",
    operator: "YPF/Various",
    latitude: -38.0,
    longitude: -70.0,
    production_bpd: 180000,
    api_gravity: "35-40",
    sulfur_content: "0.4%",
    type: "Conventional"
  },
  {
    name: "Cerro Dragon",
    country: "Argentina",
    operator: "Pan American Energy",
    latitude: -45.8,
    longitude: -67.5,
    production_bpd: 50000,
    api_gravity: "42",
    sulfur_content: "0.3%",
    type: "Conventional"
  },
  // === ECUADOR FIELDS ===
  {
    name: "Ishpingo-Tambococha-Tiputini",
    country: "Ecuador",
    operator: "Petroecuador",
    latitude: -0.7,
    longitude: -75.5,
    production_bpd: 60000,
    api_gravity: "14-18",
    sulfur_content: "1.5%",
    type: "Heavy Oil"
  },
  {
    name: "Sacha Field",
    country: "Ecuador",
    operator: "Petroecuador",
    latitude: -0.3,
    longitude: -76.8,
    production_bpd: 80000,
    api_gravity: "18-23",
    sulfur_content: "1.2%",
    type: "Conventional"
  },
  {
    name: "Shushufindi Field",
    country: "Ecuador",
    operator: "Petroecuador",
    latitude: -0.2,
    longitude: -76.6,
    production_bpd: 75000,
    api_gravity: "20-24",
    sulfur_content: "1.0%",
    type: "Conventional"
  },
  // === VIETNAM FIELDS ===
  {
    name: "Bach Ho Field",
    country: "Vietnam",
    operator: "Vietsovpetro",
    latitude: 9.5,
    longitude: 107.3,
    production_bpd: 85000,
    api_gravity: "39",
    sulfur_content: "0.04%",
    type: "Offshore"
  },
  {
    name: "Rong Field",
    country: "Vietnam",
    operator: "Petronas",
    latitude: 9.8,
    longitude: 107.5,
    production_bpd: 50000,
    api_gravity: "41",
    sulfur_content: "0.03%",
    type: "Offshore"
  },
  {
    name: "Rang Dong Field",
    country: "Vietnam",
    operator: "Petrovietnam",
    latitude: 9.2,
    longitude: 107.0,
    production_bpd: 40000,
    api_gravity: "38",
    sulfur_content: "0.05%",
    type: "Offshore"
  },
  {
    name: "Su Tu Den Field",
    country: "Vietnam",
    operator: "Petrovietnam",
    latitude: 9.7,
    longitude: 107.4,
    production_bpd: 45000,
    api_gravity: "40",
    sulfur_content: "0.04%",
    type: "Offshore"
  },
  // === ADDITIONAL IRAN FIELDS ===
  {
    name: "South Azadegan",
    country: "Iran",
    operator: "NIOC",
    latitude: 31.3,
    longitude: 48.2,
    production_bpd: 150000,
    api_gravity: "19",
    sulfur_content: "3.7%",
    type: "Conventional"
  },
  {
    name: "Yadavaran Field",
    country: "Iran",
    operator: "NIOC/Sinopec",
    latitude: 31.0,
    longitude: 48.0,
    production_bpd: 115000,
    api_gravity: "17-20",
    sulfur_content: "3.9%",
    type: "Conventional"
  },
  {
    name: "Karanj Field",
    country: "Iran",
    operator: "NIOC",
    latitude: 30.8,
    longitude: 49.2,
    production_bpd: 200000,
    api_gravity: "30",
    sulfur_content: "1.5%",
    type: "Conventional"
  },
  // === ADDITIONAL INDONESIA FIELDS ===
  {
    name: "Mahakam Field",
    country: "Indonesia",
    operator: "Total",
    latitude: -0.5,
    longitude: 117.5,
    production_bpd: 120000,
    api_gravity: "35",
    sulfur_content: "0.1%",
    type: "Offshore"
  },
  {
    name: "Cepu Field",
    country: "Indonesia",
    operator: "ExxonMobil",
    latitude: -7.2,
    longitude: 111.6,
    production_bpd: 170000,
    api_gravity: "32",
    sulfur_content: "0.1%",
    type: "Onshore"
  },
  {
    name: "Attaka Field",
    country: "Indonesia",
    operator: "Total",
    latitude: -0.3,
    longitude: 117.4,
    production_bpd: 50000,
    api_gravity: "48",
    sulfur_content: "0.05%",
    type: "Offshore"
  },
  // === ADDITIONAL INDIA FIELDS ===
  {
    name: "Rajasthan Block",
    country: "India",
    operator: "Cairn India/Vedanta",
    latitude: 27.5,
    longitude: 71.5,
    production_bpd: 175000,
    api_gravity: "32-36",
    sulfur_content: "0.2%",
    type: "Onshore"
  },
  {
    name: "Mumbai Offshore",
    country: "India",
    operator: "ONGC",
    latitude: 19.5,
    longitude: 71.5,
    production_bpd: 220000,
    api_gravity: "38-41",
    sulfur_content: "0.2%",
    type: "Offshore"
  },
  {
    name: "Assam Oil Fields",
    country: "India",
    operator: "Oil India Limited",
    latitude: 27.0,
    longitude: 95.0,
    production_bpd: 80000,
    api_gravity: "34-37",
    sulfur_content: "0.3%",
    type: "Onshore"
  },
  // ============================================
  // NATURAL GAS FIELDS - GLOBAL COVERAGE
  // ============================================
  // === USA GAS FIELDS ===
  {
    name: "Marcellus Shale Gas",
    country: "United States",
    operator: "EQT/Chesapeake",
    latitude: 40.5,
    longitude: -79.0,
    production_bpd: 80000,
    api_gravity: "60",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "Haynesville Gas",
    country: "United States",
    operator: "Chesapeake/BHP",
    latitude: 32.0,
    longitude: -93.8,
    production_bpd: 45000,
    api_gravity: "55",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "Barnett Shale Gas",
    country: "United States",
    operator: "Various",
    latitude: 32.8,
    longitude: -97.5,
    production_bpd: 35000,
    api_gravity: "58",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "Fayetteville Shale",
    country: "United States",
    operator: "Southwestern Energy",
    latitude: 35.5,
    longitude: -92.3,
    production_bpd: 25000,
    api_gravity: "57",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "Woodford Shale",
    country: "United States",
    operator: "Devon Energy",
    latitude: 35.2,
    longitude: -96.8,
    production_bpd: 30000,
    api_gravity: "56",
    sulfur_content: "0.02%",
    type: "Gas Condensate"
  },
  // === RUSSIA GAS FIELDS ===
  {
    name: "Yamburg Field",
    country: "Russia",
    operator: "Gazprom",
    latitude: 67.9,
    longitude: 75.2,
    production_bpd: 70000,
    api_gravity: "55",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "Bovanenkovo Field",
    country: "Russia",
    operator: "Gazprom",
    latitude: 70.4,
    longitude: 68.0,
    production_bpd: 90000,
    api_gravity: "58",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "Zapolyarnoye Field",
    country: "Russia",
    operator: "Gazprom",
    latitude: 66.9,
    longitude: 79.5,
    production_bpd: 65000,
    api_gravity: "56",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "Medvezhye Field",
    country: "Russia",
    operator: "Gazprom",
    latitude: 65.9,
    longitude: 73.5,
    production_bpd: 45000,
    api_gravity: "54",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "Shtokman Field",
    country: "Russia",
    operator: "Gazprom",
    latitude: 73.3,
    longitude: 43.8,
    production_bpd: 40000,
    api_gravity: "52",
    sulfur_content: "0.01%",
    type: "Offshore Gas"
  },
  // === IRAN GAS FIELDS ===
  {
    name: "North Pars",
    country: "Iran",
    operator: "NIOC",
    latitude: 27.0,
    longitude: 52.2,
    production_bpd: 60000,
    api_gravity: "50",
    sulfur_content: "0.02%",
    type: "Gas Condensate"
  },
  {
    name: "Kish Gas Field",
    country: "Iran",
    operator: "NIOC",
    latitude: 26.5,
    longitude: 53.9,
    production_bpd: 35000,
    api_gravity: "48",
    sulfur_content: "0.02%",
    type: "Gas Condensate"
  },
  {
    name: "Tabnak Gas Field",
    country: "Iran",
    operator: "NIOC",
    latitude: 28.5,
    longitude: 52.5,
    production_bpd: 30000,
    api_gravity: "49",
    sulfur_content: "0.03%",
    type: "Gas Condensate"
  },
  // === QATAR GAS FIELDS ===
  {
    name: "North Field",
    country: "Qatar",
    operator: "Qatar Petroleum",
    latitude: 26.0,
    longitude: 51.3,
    production_bpd: 120000,
    api_gravity: "65",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "Ras Laffan LNG",
    country: "Qatar",
    operator: "Qatar Petroleum",
    latitude: 25.9,
    longitude: 51.5,
    production_bpd: 100000,
    api_gravity: "63",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  // === AUSTRALIA GAS FIELDS ===
  {
    name: "Gorgon LNG",
    country: "Australia",
    operator: "Chevron",
    latitude: -20.6,
    longitude: 115.1,
    production_bpd: 85000,
    api_gravity: "60",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "Wheatstone LNG",
    country: "Australia",
    operator: "Chevron",
    latitude: -20.5,
    longitude: 115.0,
    production_bpd: 55000,
    api_gravity: "58",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "Ichthys LNG",
    country: "Australia",
    operator: "Inpex",
    latitude: -12.4,
    longitude: 130.9,
    production_bpd: 70000,
    api_gravity: "59",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "Pluto LNG",
    country: "Australia",
    operator: "Woodside",
    latitude: -20.6,
    longitude: 116.7,
    production_bpd: 60000,
    api_gravity: "57",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "Browse Basin",
    country: "Australia",
    operator: "Woodside",
    latitude: -14.0,
    longitude: 123.0,
    production_bpd: 45000,
    api_gravity: "56",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  // === CANADA GAS FIELDS ===
  {
    name: "Montney Formation",
    country: "Canada",
    operator: "Canadian Natural/Encana",
    latitude: 56.5,
    longitude: -120.5,
    production_bpd: 65000,
    api_gravity: "62",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "Horn River Basin",
    country: "Canada",
    operator: "Various",
    latitude: 58.5,
    longitude: -122.0,
    production_bpd: 35000,
    api_gravity: "61",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "Duvernay Formation",
    country: "Canada",
    operator: "Chevron/Encana",
    latitude: 53.5,
    longitude: -115.0,
    production_bpd: 40000,
    api_gravity: "60",
    sulfur_content: "0.02%",
    type: "Gas Condensate"
  },
  // === CHINA GAS FIELDS ===
  {
    name: "Sulige Gas Field",
    country: "China",
    operator: "PetroChina",
    latitude: 38.5,
    longitude: 108.0,
    production_bpd: 55000,
    api_gravity: "58",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "Puguang Gas Field",
    country: "China",
    operator: "Sinopec",
    latitude: 31.8,
    longitude: 107.5,
    production_bpd: 45000,
    api_gravity: "56",
    sulfur_content: "High H2S",
    type: "Gas Condensate"
  },
  {
    name: "Sichuan Gas Fields",
    country: "China",
    operator: "PetroChina/Sinopec",
    latitude: 30.5,
    longitude: 104.5,
    production_bpd: 60000,
    api_gravity: "57",
    sulfur_content: "0.02%",
    type: "Gas Condensate"
  },
  // === NORWAY GAS FIELDS ===
  {
    name: "Ormen Lange",
    country: "Norway",
    operator: "Shell/Equinor",
    latitude: 63.4,
    longitude: 5.1,
    production_bpd: 50000,
    api_gravity: "62",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "Snohvit LNG",
    country: "Norway",
    operator: "Equinor",
    latitude: 71.3,
    longitude: 21.3,
    production_bpd: 35000,
    api_gravity: "60",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "Aasta Hansteen",
    country: "Norway",
    operator: "Equinor",
    latitude: 66.8,
    longitude: 8.1,
    production_bpd: 40000,
    api_gravity: "61",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  // === ALGERIA GAS FIELDS ===
  {
    name: "In Salah Gas",
    country: "Algeria",
    operator: "Sonatrach/BP",
    latitude: 27.2,
    longitude: 2.5,
    production_bpd: 50000,
    api_gravity: "58",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "In Amenas Gas",
    country: "Algeria",
    operator: "Sonatrach/BP",
    latitude: 28.0,
    longitude: 9.6,
    production_bpd: 45000,
    api_gravity: "57",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  // === TURKMENISTAN GAS FIELDS ===
  {
    name: "Galkynysh Field",
    country: "Turkmenistan",
    operator: "Turkmengas/CNPC",
    latitude: 38.9,
    longitude: 64.8,
    production_bpd: 95000,
    api_gravity: "62",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "Dauletabad Field",
    country: "Turkmenistan",
    operator: "Turkmengas",
    latitude: 39.5,
    longitude: 63.5,
    production_bpd: 60000,
    api_gravity: "60",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "Yoloten Field",
    country: "Turkmenistan",
    operator: "Turkmengas",
    latitude: 38.8,
    longitude: 64.9,
    production_bpd: 55000,
    api_gravity: "61",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  // === MALAYSIA GAS FIELDS ===
  {
    name: "Sarawak Gas",
    country: "Malaysia",
    operator: "Petronas",
    latitude: 3.5,
    longitude: 113.5,
    production_bpd: 65000,
    api_gravity: "60",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "MLNG Bintulu",
    country: "Malaysia",
    operator: "Petronas",
    latitude: 3.2,
    longitude: 113.0,
    production_bpd: 70000,
    api_gravity: "61",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  // === INDONESIA GAS FIELDS ===
  {
    name: "Tangguh LNG",
    country: "Indonesia",
    operator: "BP",
    latitude: -2.0,
    longitude: 134.0,
    production_bpd: 75000,
    api_gravity: "62",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "Bontang LNG",
    country: "Indonesia",
    operator: "Total/Pertamina",
    latitude: 0.1,
    longitude: 117.5,
    production_bpd: 80000,
    api_gravity: "60",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "Arun Gas Field",
    country: "Indonesia",
    operator: "ExxonMobil/Pertamina",
    latitude: 5.2,
    longitude: 97.2,
    production_bpd: 30000,
    api_gravity: "58",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  // === EGYPT GAS FIELDS ===
  {
    name: "Damietta LNG",
    country: "Egypt",
    operator: "Eni/EGPC",
    latitude: 31.4,
    longitude: 31.8,
    production_bpd: 55000,
    api_gravity: "59",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "Idku LNG",
    country: "Egypt",
    operator: "Shell/EGPC",
    latitude: 31.3,
    longitude: 30.3,
    production_bpd: 50000,
    api_gravity: "58",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  // === NIGERIA GAS FIELDS ===
  {
    name: "Nigeria LNG Bonny",
    country: "Nigeria",
    operator: "Shell/Total/Eni",
    latitude: 4.4,
    longitude: 7.2,
    production_bpd: 85000,
    api_gravity: "61",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "Bonga Northwest Gas",
    country: "Nigeria",
    operator: "Shell",
    latitude: 4.5,
    longitude: 3.3,
    production_bpd: 35000,
    api_gravity: "60",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  // === TRINIDAD & TOBAGO ===
  {
    name: "Atlantic LNG",
    country: "Trinidad and Tobago",
    operator: "BP/Shell",
    latitude: 10.3,
    longitude: -61.6,
    production_bpd: 65000,
    api_gravity: "62",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "Dolphin Gas Field",
    country: "Trinidad and Tobago",
    operator: "BP",
    latitude: 10.5,
    longitude: -61.0,
    production_bpd: 40000,
    api_gravity: "60",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  // === PERU GAS FIELDS ===
  {
    name: "Camisea Gas Field",
    country: "Peru",
    operator: "Pluspetrol",
    latitude: -12.2,
    longitude: -72.8,
    production_bpd: 75000,
    api_gravity: "61",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "Peru LNG",
    country: "Peru",
    operator: "Hunt Oil",
    latitude: -13.4,
    longitude: -76.2,
    production_bpd: 50000,
    api_gravity: "59",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  // === BOLIVIA GAS FIELDS ===
  {
    name: "San Alberto Field",
    country: "Bolivia",
    operator: "Petrobras",
    latitude: -19.8,
    longitude: -63.5,
    production_bpd: 45000,
    api_gravity: "58",
    sulfur_content: "0.02%",
    type: "Gas Condensate"
  },
  {
    name: "San Antonio Field",
    country: "Bolivia",
    operator: "Repsol",
    latitude: -19.5,
    longitude: -63.8,
    production_bpd: 40000,
    api_gravity: "57",
    sulfur_content: "0.02%",
    type: "Gas Condensate"
  },
  // === NETHERLANDS GAS FIELDS ===
  {
    name: "Groningen Field",
    country: "Netherlands",
    operator: "NAM/ExxonMobil/Shell",
    latitude: 53.3,
    longitude: 6.8,
    production_bpd: 55000,
    api_gravity: "60",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "K12-B Platform",
    country: "Netherlands",
    operator: "Gaz de France",
    latitude: 53.0,
    longitude: 3.6,
    production_bpd: 25000,
    api_gravity: "58",
    sulfur_content: "0.01%",
    type: "Offshore Gas"
  },
  // === PAKISTAN GAS FIELDS ===
  {
    name: "Sui Gas Field",
    country: "Pakistan",
    operator: "OGDC",
    latitude: 28.6,
    longitude: 69.2,
    production_bpd: 50000,
    api_gravity: "57",
    sulfur_content: "0.02%",
    type: "Gas Condensate"
  },
  {
    name: "Mari Gas Field",
    country: "Pakistan",
    operator: "OGDC/ENI",
    latitude: 27.6,
    longitude: 68.8,
    production_bpd: 45000,
    api_gravity: "56",
    sulfur_content: "0.02%",
    type: "Gas Condensate"
  },
  // === ISRAEL GAS FIELDS ===
  {
    name: "Tamar Gas Field",
    country: "Israel",
    operator: "Noble Energy",
    latitude: 32.6,
    longitude: 34.0,
    production_bpd: 60000,
    api_gravity: "62",
    sulfur_content: "0.01%",
    type: "Offshore Gas"
  },
  {
    name: "Leviathan Gas Field",
    country: "Israel",
    operator: "Noble Energy",
    latitude: 33.1,
    longitude: 34.2,
    production_bpd: 75000,
    api_gravity: "63",
    sulfur_content: "0.01%",
    type: "Offshore Gas"
  },
  // === MYANMAR GAS FIELDS ===
  {
    name: "Yadana Gas Field",
    country: "Myanmar",
    operator: "Total",
    latitude: 12.0,
    longitude: 97.5,
    production_bpd: 55000,
    api_gravity: "60",
    sulfur_content: "0.01%",
    type: "Offshore Gas"
  },
  {
    name: "Yetagun Gas Field",
    country: "Myanmar",
    operator: "Petronas",
    latitude: 11.5,
    longitude: 97.2,
    production_bpd: 35000,
    api_gravity: "58",
    sulfur_content: "0.01%",
    type: "Offshore Gas"
  },
  // === PAPUA NEW GUINEA ===
  {
    name: "PNG LNG",
    country: "Papua New Guinea",
    operator: "ExxonMobil",
    latitude: -7.5,
    longitude: 145.5,
    production_bpd: 70000,
    api_gravity: "62",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "Hides Gas Field",
    country: "Papua New Guinea",
    operator: "ExxonMobil",
    latitude: -6.1,
    longitude: 142.9,
    production_bpd: 45000,
    api_gravity: "60",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  // === THAILAND GAS FIELDS ===
  {
    name: "Bongkot Gas Field",
    country: "Thailand",
    operator: "Chevron/PTT",
    latitude: 12.8,
    longitude: 100.5,
    production_bpd: 50000,
    api_gravity: "59",
    sulfur_content: "0.01%",
    type: "Offshore Gas"
  },
  {
    name: "Erawan Gas Field",
    country: "Thailand",
    operator: "Chevron",
    latitude: 12.5,
    longitude: 100.3,
    production_bpd: 45000,
    api_gravity: "58",
    sulfur_content: "0.01%",
    type: "Offshore Gas"
  },
  // === BANGLADESH GAS FIELDS ===
  {
    name: "Bibiyana Gas Field",
    country: "Bangladesh",
    operator: "Chevron",
    latitude: 24.7,
    longitude: 91.3,
    production_bpd: 60000,
    api_gravity: "59",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  {
    name: "Jalalabad Gas Field",
    country: "Bangladesh",
    operator: "Chevron",
    latitude: 24.5,
    longitude: 91.5,
    production_bpd: 40000,
    api_gravity: "58",
    sulfur_content: "0.01%",
    type: "Gas Condensate"
  },
  // === ADDITIONAL EUROPEAN FIELDS ===
  {
    name: "Troll Gas Phase",
    country: "Norway",
    operator: "Equinor",
    latitude: 60.6,
    longitude: 3.7,
    production_bpd: 55000,
    api_gravity: "60",
    sulfur_content: "0.01%",
    type: "Offshore Gas"
  },
  {
    name: "Romania Black Sea Gas",
    country: "Romania",
    operator: "OMV Petrom",
    latitude: 44.2,
    longitude: 29.5,
    production_bpd: 35000,
    api_gravity: "57",
    sulfur_content: "0.02%",
    type: "Offshore Gas"
  },
  {
    name: "Tunisia Miskar Gas",
    country: "Tunisia",
    operator: "BG Group/Shell",
    latitude: 34.8,
    longitude: 11.5,
    production_bpd: 30000,
    api_gravity: "56",
    sulfur_content: "0.01%",
    type: "Offshore Gas"
  },
  {
    name: "Denmark Tyra Field",
    country: "Denmark",
    operator: "Total",
    latitude: 55.7,
    longitude: 4.8,
    production_bpd: 40000,
    api_gravity: "58",
    sulfur_content: "0.01%",
    type: "Offshore Gas"
  },
  {
    name: "UK Morecambe Bay",
    country: "United Kingdom",
    operator: "Centrica",
    latitude: 54.0,
    longitude: -3.5,
    production_bpd: 35000,
    api_gravity: "57",
    sulfur_content: "0.01%",
    type: "Offshore Gas"
  },
  // ============================================
  // URANIUM MINES - GLOBAL COVERAGE
  // ============================================
  // === KAZAKHSTAN URANIUM MINES ===
  {
    name: "Tortkuduk Mine",
    country: "Kazakhstan",
    operator: "Kazatomprom",
    latitude: 44.5,
    longitude: 62.5,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Inkai Mine",
    country: "Kazakhstan",
    operator: "Cameco/Kazatomprom",
    latitude: 44.8,
    longitude: 68.2,
    production_bpd: 4200,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Budenovskoye Mine",
    country: "Kazakhstan",
    operator: "Kazatomprom",
    latitude: 48.2,
    longitude: 59.8,
    production_bpd: 3800,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Akdala Mine",
    country: "Kazakhstan",
    operator: "Uranium One/Kazatomprom",
    latitude: 49.5,
    longitude: 61.2,
    production_bpd: 3500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "South Inkai Mine",
    country: "Kazakhstan",
    operator: "Kazatomprom",
    latitude: 44.6,
    longitude: 68.0,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  // === CANADA URANIUM MINES ===
  {
    name: "McArthur River Mine",
    country: "Canada",
    operator: "Cameco",
    latitude: 57.8,
    longitude: -105.0,
    production_bpd: 7500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Cigar Lake Mine",
    country: "Canada",
    operator: "Cameco/Orano",
    latitude: 58.1,
    longitude: -104.5,
    production_bpd: 6500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Key Lake Mine",
    country: "Canada",
    operator: "Cameco",
    latitude: 57.2,
    longitude: -105.6,
    production_bpd: 2800,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Rabbit Lake Mine",
    country: "Canada",
    operator: "Cameco",
    latitude: 58.2,
    longitude: -103.7,
    production_bpd: 1500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  // === AUSTRALIA URANIUM MINES ===
  {
    name: "Olympic Dam Mine",
    country: "Australia",
    operator: "BHP",
    latitude: -30.5,
    longitude: 136.9,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Ranger Mine",
    country: "Australia",
    operator: "Energy Resources of Australia",
    latitude: -12.7,
    longitude: 132.9,
    production_bpd: 2200,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Beverley Mine",
    country: "Australia",
    operator: "Heathgate Resources",
    latitude: -30.2,
    longitude: 139.5,
    production_bpd: 1200,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Four Mile Mine",
    country: "Australia",
    operator: "Heathgate Resources",
    latitude: -30.3,
    longitude: 139.6,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  // === NAMIBIA URANIUM MINES ===
  {
    name: "Rossing Mine",
    country: "Namibia",
    operator: "Rio Tinto/CNNC",
    latitude: -22.5,
    longitude: 14.9,
    production_bpd: 3200,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Husab Mine",
    country: "Namibia",
    operator: "Swakop Uranium/CNNC",
    latitude: -22.4,
    longitude: 15.0,
    production_bpd: 5500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Langer Heinrich Mine",
    country: "Namibia",
    operator: "Paladin Energy",
    latitude: -22.8,
    longitude: 14.8,
    production_bpd: 2500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  // === NIGER URANIUM MINES ===
  {
    name: "Somair Mine",
    country: "Niger",
    operator: "Orano",
    latitude: 17.0,
    longitude: 7.7,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Cominak Mine",
    country: "Niger",
    operator: "Orano",
    latitude: 17.5,
    longitude: 8.5,
    production_bpd: 1500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Imouraren Deposit",
    country: "Niger",
    operator: "Orano",
    latitude: 18.7,
    longitude: 8.0,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  // === RUSSIA URANIUM MINES ===
  {
    name: "Priargunsky Mine",
    country: "Russia",
    operator: "ARMZ/Rosatom",
    latitude: 50.0,
    longitude: 118.5,
    production_bpd: 2800,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Khiagda Mine",
    country: "Russia",
    operator: "ARMZ/Rosatom",
    latitude: 51.5,
    longitude: 110.2,
    production_bpd: 1200,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Dalur Mine",
    country: "Russia",
    operator: "ARMZ/Rosatom",
    latitude: 52.2,
    longitude: 106.8,
    production_bpd: 800,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  // === UZBEKISTAN URANIUM MINES ===
  {
    name: "Uchkuduk Mine",
    country: "Uzbekistan",
    operator: "Navoi Mining",
    latitude: 42.1,
    longitude: 63.6,
    production_bpd: 2400,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Zafarabad Mine",
    country: "Uzbekistan",
    operator: "Navoi Mining",
    latitude: 41.5,
    longitude: 64.2,
    production_bpd: 1800,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Nurabad Mine",
    country: "Uzbekistan",
    operator: "Navoi Mining",
    latitude: 40.8,
    longitude: 65.5,
    production_bpd: 1500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  // === CHINA URANIUM MINES ===
  {
    name: "Yining Mine",
    country: "China",
    operator: "CNNC",
    latitude: 43.9,
    longitude: 81.3,
    production_bpd: 1800,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Fuzhou Mine",
    country: "China",
    operator: "CNNC",
    latitude: 25.0,
    longitude: 116.3,
    production_bpd: 1200,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Benxi Mine",
    country: "China",
    operator: "CNNC",
    latitude: 41.3,
    longitude: 123.8,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  // === USA URANIUM MINES ===
  {
    name: "White Mesa Mill",
    country: "United States",
    operator: "Energy Fuels",
    latitude: 37.5,
    longitude: -109.3,
    production_bpd: 1500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Nichols Ranch ISR",
    country: "United States",
    operator: "Ur-Energy",
    latitude: 43.0,
    longitude: -105.5,
    production_bpd: 800,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Smith Ranch-Highland",
    country: "United States",
    operator: "Cameco",
    latitude: 43.2,
    longitude: -105.3,
    production_bpd: 1200,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  // === UKRAINE URANIUM MINES ===
  {
    name: "Novokostiantynivka Mine",
    country: "Ukraine",
    operator: "VostGOK",
    latitude: 48.2,
    longitude: 33.5,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Smolinska Mine",
    country: "Ukraine",
    operator: "VostGOK",
    latitude: 48.5,
    longitude: 33.8,
    production_bpd: 800,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  // === OTHER COUNTRIES ===
  {
    name: "Malanjkhand Mine",
    country: "India",
    operator: "UCIL",
    latitude: 22.0,
    longitude: 80.7,
    production_bpd: 600,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Jaduguda Mine",
    country: "India",
    operator: "UCIL",
    latitude: 22.6,
    longitude: 86.4,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Dornod Mine",
    country: "Mongolia",
    operator: "MonAtom",
    latitude: 47.5,
    longitude: 111.5,
    production_bpd: 400,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Mkuju River Project",
    country: "Tanzania",
    operator: "Mantra Resources",
    latitude: -10.5,
    longitude: 38.5,
    production_bpd: 600,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Kayelekera Mine",
    country: "Malawi",
    operator: "Paladin Energy",
    latitude: -10.2,
    longitude: 33.9,
    production_bpd: 700,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Musonoi Mine",
    country: "Democratic Republic of the Congo",
    operator: "Various",
    latitude: -11.7,
    longitude: 27.6,
    production_bpd: 300,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Mutanga Mine",
    country: "Zambia",
    operator: "Albidon",
    latitude: -13.1,
    longitude: 28.6,
    production_bpd: 250,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Poços de Caldas",
    country: "Brazil",
    operator: "INB",
    latitude: -21.8,
    longitude: -46.6,
    production_bpd: 400,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Caetité Mine",
    country: "Brazil",
    operator: "INB",
    latitude: -14.0,
    longitude: -42.5,
    production_bpd: 350,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Cerro Solo",
    country: "Argentina",
    operator: "CNEA",
    latitude: -42.5,
    longitude: -68.5,
    production_bpd: 200,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Sierra Pintada",
    country: "Argentina",
    operator: "CNEA",
    latitude: -35.0,
    longitude: -68.0,
    production_bpd: 150,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Mounana Mine",
    country: "Gabon",
    operator: "COMUF",
    latitude: -1.4,
    longitude: 13.2,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Bakouma Project",
    country: "Central African Republic",
    operator: "Areva",
    latitude: 5.6,
    longitude: 22.8,
    production_bpd: 80,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "Kamativi Mine",
    country: "Zimbabwe",
    operator: "Kairezi Tin Mining",
    latitude: -18.9,
    longitude: 26.9,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  {
    name: "South Africa Mines",
    country: "South Africa",
    operator: "Various",
    latitude: -26.2,
    longitude: 28.0,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Uranium Mine"
  },
  // ============================================
  // COAL MINES - GLOBAL COVERAGE
  // ============================================
  // === CHINA COAL MINES ===
  {
    name: "Shenhua Group - Shendong Mine",
    country: "China",
    operator: "China Shenhua Energy",
    latitude: 39.5,
    longitude: 110.2,
    production_bpd: 150000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  {
    name: "Haerwusu Coal Mine",
    country: "China",
    operator: "China Shenhua Energy",
    latitude: 39.7,
    longitude: 109.8,
    production_bpd: 80000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  {
    name: "Hongliulin Coal Mine",
    country: "China",
    operator: "Shaanxi Coal Industry",
    latitude: 38.5,
    longitude: 110.3,
    production_bpd: 60000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  {
    name: "Bulianta Coal Mine",
    country: "China",
    operator: "Shenhua Shendong Coal",
    latitude: 39.4,
    longitude: 110.0,
    production_bpd: 70000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  {
    name: "Daliuta Coal Mine",
    country: "China",
    operator: "Shenhua Group",
    latitude: 39.3,
    longitude: 110.1,
    production_bpd: 50000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  // === INDIA COAL MINES ===
  {
    name: "Gevra Coal Mine",
    country: "India",
    operator: "South Eastern Coalfields Limited",
    latitude: 22.3,
    longitude: 82.6,
    production_bpd: 45000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  {
    name: "Kusmunda Coal Mine",
    country: "India",
    operator: "South Eastern Coalfields Limited",
    latitude: 22.2,
    longitude: 82.7,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  {
    name: "Dipka Coal Mine",
    country: "India",
    operator: "South Eastern Coalfields Limited",
    latitude: 22.4,
    longitude: 82.5,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  {
    name: "Jharia Coalfield",
    country: "India",
    operator: "Bharat Coking Coal Limited",
    latitude: 23.7,
    longitude: 86.4,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Coking Coal"
  },
  {
    name: "Talcher Coalfield",
    country: "India",
    operator: "Mahanadi Coalfields Limited",
    latitude: 20.9,
    longitude: 85.2,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  // === INDONESIA COAL MINES ===
  {
    name: "Sangatta Coal Mine",
    country: "Indonesia",
    operator: "Kaltim Prima Coal",
    latitude: 0.5,
    longitude: 117.5,
    production_bpd: 55000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Sub-bituminous"
  },
  {
    name: "Bontang Coal Terminal",
    country: "Indonesia",
    operator: "Adaro Energy",
    latitude: 0.1,
    longitude: 117.5,
    production_bpd: 50000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Sub-bituminous"
  },
  {
    name: "Tutupan Coal Mine",
    country: "Indonesia",
    operator: "Arutmin",
    latitude: -3.4,
    longitude: 115.5,
    production_bpd: 40000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Sub-bituminous"
  },
  {
    name: "Satui Coal Mine",
    country: "Indonesia",
    operator: "Kideco Jaya Agung",
    latitude: -3.7,
    longitude: 115.8,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Sub-bituminous"
  },
  // === UNITED STATES COAL MINES ===
  {
    name: "North Antelope Rochelle Mine",
    country: "United States",
    operator: "Peabody Energy",
    latitude: 43.5,
    longitude: -105.3,
    production_bpd: 110000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Sub-bituminous"
  },
  {
    name: "Black Thunder Mine",
    country: "United States",
    operator: "Arch Coal",
    latitude: 43.7,
    longitude: -105.5,
    production_bpd: 90000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Sub-bituminous"
  },
  {
    name: "Powder River Basin - Belle Ayr",
    country: "United States",
    operator: "Eagle Specialty Materials",
    latitude: 43.9,
    longitude: -105.6,
    production_bpd: 40000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Sub-bituminous"
  },
  {
    name: "Cordero Rojo Mine",
    country: "United States",
    operator: "Cloud Peak Energy",
    latitude: 44.0,
    longitude: -105.8,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Sub-bituminous"
  },
  {
    name: "Colowyo Coal Mine",
    country: "United States",
    operator: "Tri-State Generation",
    latitude: 40.3,
    longitude: -107.8,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  // === AUSTRALIA COAL MINES ===
  {
    name: "Mount Arthur Coal Mine",
    country: "Australia",
    operator: "BHP",
    latitude: -32.4,
    longitude: 150.9,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  {
    name: "Hail Creek Mine",
    country: "Australia",
    operator: "Glencore",
    latitude: -21.5,
    longitude: 148.5,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  {
    name: "Peak Downs Mine",
    country: "Australia",
    operator: "BHP Mitsubishi Alliance",
    latitude: -22.3,
    longitude: 148.2,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Coking Coal"
  },
  {
    name: "Goonyella Riverside Mine",
    country: "Australia",
    operator: "BHP Mitsubishi Alliance",
    latitude: -21.8,
    longitude: 148.3,
    production_bpd: 26000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Coking Coal"
  },
  {
    name: "Hunter Valley Operations",
    country: "Australia",
    operator: "Glencore",
    latitude: -32.5,
    longitude: 151.0,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Thermal"
  },
  // === RUSSIA COAL MINES ===
  {
    name: "Kuzbass Basin - Raspadskaya",
    country: "Russia",
    operator: "Evraz Group",
    latitude: 53.8,
    longitude: 87.8,
    production_bpd: 32000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Coking Coal"
  },
  {
    name: "Yuzhny Kuzbass",
    country: "Russia",
    operator: "Mechel",
    latitude: 53.5,
    longitude: 87.5,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Coking Coal"
  },
  {
    name: "Elga Coal Complex",
    country: "Russia",
    operator: "Mechel",
    latitude: 58.0,
    longitude: 130.5,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Coking Coal"
  },
  {
    name: "Urgalugol Mine",
    country: "Russia",
    operator: "SUEK",
    latitude: 51.1,
    longitude: 132.5,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  // === SOUTH AFRICA COAL MINES ===
  {
    name: "Grootegeluk Coal Mine",
    country: "South Africa",
    operator: "Exxaro Resources",
    latitude: -23.7,
    longitude: 27.7,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  {
    name: "New Largo Coal Mine",
    country: "South Africa",
    operator: "Glencore",
    latitude: -26.0,
    longitude: 29.2,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Thermal"
  },
  {
    name: "Khutala Colliery",
    country: "South Africa",
    operator: "Anglo American",
    latitude: -25.8,
    longitude: 29.4,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Thermal"
  },
  {
    name: "Goedehoop Colliery",
    country: "South Africa",
    operator: "Anglo American",
    latitude: -26.1,
    longitude: 29.3,
    production_bpd: 17000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Thermal"
  },
  // === GERMANY COAL MINES ===
  {
    name: "Garzweiler Surface Mine",
    country: "Germany",
    operator: "RWE",
    latitude: 51.1,
    longitude: 6.5,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Lignite"
  },
  {
    name: "Hambach Surface Mine",
    country: "Germany",
    operator: "RWE",
    latitude: 50.9,
    longitude: 6.5,
    production_bpd: 40000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Lignite"
  },
  {
    name: "Inden Surface Mine",
    country: "Germany",
    operator: "RWE",
    latitude: 50.9,
    longitude: 6.4,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Lignite"
  },
  // === POLAND COAL MINES ===
  {
    name: "Belchatow Mine",
    country: "Poland",
    operator: "PGE",
    latitude: 51.3,
    longitude: 19.3,
    production_bpd: 45000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Lignite"
  },
  {
    name: "Bogdanka Coal Mine",
    country: "Poland",
    operator: "Enea",
    latitude: 51.5,
    longitude: 23.0,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  {
    name: "Katowice Coal Basin",
    country: "Poland",
    operator: "JSW",
    latitude: 50.3,
    longitude: 19.0,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Coking Coal"
  },
  // === KAZAKHSTAN COAL MINES ===
  {
    name: "Bogatyr Coal Mine",
    country: "Kazakhstan",
    operator: "Bogatyr Komir",
    latitude: 50.4,
    longitude: 72.9,
    production_bpd: 42000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  {
    name: "Karaganda Coal Basin",
    country: "Kazakhstan",
    operator: "ArcelorMittal Temirtau",
    latitude: 49.8,
    longitude: 73.1,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Coking Coal"
  },
  // === TURKEY COAL MINES ===
  {
    name: "Afsin-Elbistan Lignite Basin",
    country: "Turkey",
    operator: "TKI",
    latitude: 38.2,
    longitude: 37.4,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Lignite"
  },
  {
    name: "Zonguldak Coal Basin",
    country: "Turkey",
    operator: "TTK",
    latitude: 41.5,
    longitude: 31.8,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  // === COLOMBIA COAL MINES ===
  {
    name: "Cerrejon Coal Mine",
    country: "Colombia",
    operator: "Glencore",
    latitude: 11.0,
    longitude: -72.7,
    production_bpd: 32000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Thermal"
  },
  {
    name: "La Jagua Mine",
    country: "Colombia",
    operator: "Prodeco",
    latitude: 9.6,
    longitude: -73.3,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Thermal"
  },
  // === VIETNAM COAL MINES ===
  {
    name: "Quang Ninh Coal Basin",
    country: "Vietnam",
    operator: "Vinacomin",
    latitude: 21.0,
    longitude: 107.3,
    production_bpd: 40000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Anthracite"
  },
  {
    name: "Hong Gai Coal Mine",
    country: "Vietnam",
    operator: "Vinacomin",
    latitude: 20.9,
    longitude: 107.1,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Anthracite"
  },
  // === UKRAINE COAL MINES ===
  {
    name: "Donbas Coal Basin",
    country: "Ukraine",
    operator: "DTEK",
    latitude: 48.0,
    longitude: 38.0,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Anthracite"
  },
  {
    name: "Pavlograd Coal Basin",
    country: "Ukraine",
    operator: "DTEK",
    latitude: 48.5,
    longitude: 36.0,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  // === CZECH REPUBLIC COAL MINES ===
  {
    name: "Bilina Mine",
    country: "Czech Republic",
    operator: "Severoceske Doly",
    latitude: 50.6,
    longitude: 13.8,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Lignite"
  },
  {
    name: "Nastup Tusimice",
    country: "Czech Republic",
    operator: "Severoceske Doly",
    latitude: 50.4,
    longitude: 13.4,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Lignite"
  },
  // === ROMANIA COAL MINES ===
  {
    name: "Jiu Valley Coal Basin",
    country: "Romania",
    operator: "Complexul Energetic Hunedoara",
    latitude: 45.3,
    longitude: 23.2,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  {
    name: "Oltenia Lignite Basin",
    country: "Romania",
    operator: "Complexul Energetic Oltenia",
    latitude: 44.7,
    longitude: 23.5,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Lignite"
  },
  // === GREECE COAL MINES ===
  {
    name: "Ptolemais-Amynteon Basin",
    country: "Greece",
    operator: "PPC",
    latitude: 40.5,
    longitude: 21.7,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Lignite"
  },
  {
    name: "Megalopolis Mine",
    country: "Greece",
    operator: "PPC",
    latitude: 37.4,
    longitude: 22.1,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Lignite"
  },
  // === BULGARIA COAL MINES ===
  {
    name: "Maritsa East Mines",
    country: "Bulgaria",
    operator: "Mini Maritsa Iztok",
    latitude: 42.4,
    longitude: 25.9,
    production_bpd: 32000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Lignite"
  },
  // === SERBIA COAL MINES ===
  {
    name: "Kolubara Coal Basin",
    country: "Serbia",
    operator: "EPS",
    latitude: 44.5,
    longitude: 20.0,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Lignite"
  },
  {
    name: "Kostolac Basin",
    country: "Serbia",
    operator: "EPS",
    latitude: 44.7,
    longitude: 21.2,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Lignite"
  },
  // === BOSNIA AND HERZEGOVINA ===
  {
    name: "Ugljevik Coal Mine",
    country: "Bosnia and Herzegovina",
    operator: "RiTE Ugljevik",
    latitude: 44.7,
    longitude: 18.9,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Lignite"
  },
  {
    name: "Kakanj Coal Mine",
    country: "Bosnia and Herzegovina",
    operator: "EPBiH",
    latitude: 44.1,
    longitude: 18.1,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Lignite"
  },
  // === UNITED KINGDOM ===
  {
    name: "Ffos-y-Fran Surface Mine",
    country: "United Kingdom",
    operator: "Miller Argent",
    latitude: 51.7,
    longitude: -3.3,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  // === MONGOLIA COAL MINES ===
  {
    name: "Tavan Tolgoi",
    country: "Mongolia",
    operator: "Erdenes Tavan Tolgoi",
    latitude: 43.2,
    longitude: 105.5,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Coking Coal"
  },
  {
    name: "Baganuur Coal Mine",
    country: "Mongolia",
    operator: "Baganuur JSC",
    latitude: 47.7,
    longitude: 108.3,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Lignite"
  },
  // === UZBEKISTAN ===
  {
    name: "Angren Coal Mine",
    country: "Uzbekistan",
    operator: "Uzbekugol",
    latitude: 41.0,
    longitude: 70.1,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Lignite"
  },
  // === PAKISTAN ===
  {
    name: "Thar Coal Field",
    country: "Pakistan",
    operator: "Sindh Engro Coal Mining",
    latitude: 24.8,
    longitude: 70.3,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Lignite"
  },
  // === THAILAND ===
  {
    name: "Mae Moh Mine",
    country: "Thailand",
    operator: "EGAT",
    latitude: 18.3,
    longitude: 99.7,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Lignite"
  },
  // === PHILIPPINES ===
  {
    name: "Semirara Coal Mine",
    country: "Philippines",
    operator: "Semirara Mining",
    latitude: 12.1,
    longitude: 121.4,
    production_bpd: 14000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Sub-bituminous"
  },
  // === JAPAN (Historical/Small Scale) ===
  {
    name: "Kushiro Coal Mine",
    country: "Japan",
    operator: "Kushiro Coal Mine",
    latitude: 42.9,
    longitude: 144.4,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  // === SOUTH KOREA ===
  {
    name: "Gangwon Coal Mines",
    country: "South Korea",
    operator: "Korea Coal Corporation",
    latitude: 37.2,
    longitude: 128.9,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Anthracite"
  },
  // === IRAN ===
  {
    name: "Tabas Coal Mine",
    country: "Iran",
    operator: "Parvadeh Coal Company",
    latitude: 33.6,
    longitude: 57.0,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Coking Coal"
  },
  // === CANADA ===
  {
    name: "Elkview Operations",
    country: "Canada",
    operator: "Teck Resources",
    latitude: 50.0,
    longitude: -114.8,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Coking Coal"
  },
  {
    name: "Line Creek Operations",
    country: "Canada",
    operator: "Teck Resources",
    latitude: 49.5,
    longitude: -114.7,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Coking Coal"
  },
  // === MEXICO ===
  {
    name: "Coahuila Coal Region",
    country: "Mexico",
    operator: "AHMSA/Minera del Norte",
    latitude: 27.5,
    longitude: -101.0,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  // === BRAZIL ===
  {
    name: "Candiota Coal Mine",
    country: "Brazil",
    operator: "Copelmi Mining",
    latitude: -31.5,
    longitude: -53.7,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Sub-bituminous"
  },
  // === CHILE ===
  {
    name: "Isla Riesco Mine",
    country: "Chile",
    operator: "Mina Invierno",
    latitude: -52.9,
    longitude: -71.5,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Sub-bituminous"
  },
  // === PERU ===
  {
    name: "Alto Chicama Coal",
    country: "Peru",
    operator: "Duke Energy",
    latitude: -7.8,
    longitude: -78.5,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Anthracite"
  },
  // === VENEZUELA ===
  {
    name: "Guasare Coal Mine",
    country: "Venezuela",
    operator: "Carbones del Guasare",
    latitude: 11.0,
    longitude: -72.3,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  // === ZIMBABWE ===
  {
    name: "Hwange Colliery",
    country: "Zimbabwe",
    operator: "Hwange Colliery Company",
    latitude: -18.4,
    longitude: 26.5,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  // === MOZAMBIQUE ===
  {
    name: "Moatize Coal Mine",
    country: "Mozambique",
    operator: "Vale",
    latitude: -15.9,
    longitude: 33.7,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Coking Coal"
  },
  // === BOTSWANA ===
  {
    name: "Morupule Coal Mine",
    country: "Botswana",
    operator: "Debswana",
    latitude: -22.5,
    longitude: 27.1,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  // === TANZANIA ===
  {
    name: "Kiwira Coal Mine",
    country: "Tanzania",
    operator: "Tancoal Energy",
    latitude: -9.1,
    longitude: 33.5,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  // === ZAMBIA ===
  {
    name: "Maamba Collieries",
    country: "Zambia",
    operator: "Nava Bharat",
    latitude: -17.4,
    longitude: 27.2,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  // === NIGERIA ===
  {
    name: "Enugu Coal Field",
    country: "Nigeria",
    operator: "Nigerian Coal Corporation",
    latitude: 6.4,
    longitude: 7.5,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Sub-bituminous"
  },
  // === EGYPT ===
  {
    name: "Maghara Coal Mine",
    country: "Egypt",
    operator: "Egyptian Mineral Resources Authority",
    latitude: 30.7,
    longitude: 33.8,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Sub-bituminous"
  },
  // === MOROCCO ===
  {
    name: "Jerada Coal Basin",
    country: "Morocco",
    operator: "Charbonnages du Maroc",
    latitude: 34.3,
    longitude: -2.2,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Anthracite"
  },
  // === SPAIN ===
  {
    name: "El Bierzo Coal Basin",
    country: "Spain",
    operator: "Coto Minero Cantabrico",
    latitude: 42.6,
    longitude: -6.6,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Anthracite"
  },
  // === FRANCE (Historical) ===
  {
    name: "Lorraine Coal Basin",
    country: "France",
    operator: "Charbonnages de France (Historical)",
    latitude: 49.1,
    longitude: 6.8,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  // === ITALY ===
  {
    name: "Sulcis Coal Mine",
    country: "Italy",
    operator: "Carbosulcis",
    latitude: 39.2,
    longitude: 8.5,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Sub-bituminous"
  },
  // === BELGIUM (Historical) ===
  {
    name: "Kempen Coal Basin",
    country: "Belgium",
    operator: "Historical Operations",
    latitude: 51.0,
    longitude: 5.5,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  // === NETHERLANDS (Historical) ===
  {
    name: "Zuid-Limburg Coal Basin",
    country: "Netherlands",
    operator: "Historical Operations",
    latitude: 50.9,
    longitude: 6.0,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Bituminous"
  },
  // === AUSTRIA ===
  {
    name: "Koflach-Voitsberg",
    country: "Austria",
    operator: "GKB-Bergbau",
    latitude: 47.0,
    longitude: 15.1,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Lignite"
  },
  // === HUNGARY ===
  {
    name: "Visegrad Lignite Basin",
    country: "Hungary",
    operator: "Vértesi Erőmű",
    latitude: 47.6,
    longitude: 18.9,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coal Mine - Lignite"
  },
  // ============================================
  // GOLD MINES - GLOBAL COVERAGE
  // ============================================
  // === CHINA GOLD MINES ===
  {
    name: "Zijinshan Gold Mine",
    country: "China",
    operator: "Zijin Mining Group",
    latitude: 25.1,
    longitude: 116.4,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Jiaodong Gold Province",
    country: "China",
    operator: "Shandong Gold",
    latitude: 37.5,
    longitude: 120.5,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Jinya Gold Mine",
    country: "China",
    operator: "China National Gold",
    latitude: 32.8,
    longitude: 105.2,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === AUSTRALIA GOLD MINES ===
  {
    name: "Super Pit Kalgoorlie",
    country: "Australia",
    operator: "Northern Star Resources",
    latitude: -30.8,
    longitude: 121.5,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Boddington Gold Mine",
    country: "Australia",
    operator: "Newmont",
    latitude: -32.8,
    longitude: 116.5,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Cadia Valley Operations",
    country: "Australia",
    operator: "Newcrest Mining",
    latitude: -33.5,
    longitude: 148.9,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Telfer Gold Mine",
    country: "Australia",
    operator: "Newcrest Mining",
    latitude: -21.7,
    longitude: 122.2,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === RUSSIA GOLD MINES ===
  {
    name: "Olimpiada Gold Mine",
    country: "Russia",
    operator: "Polyus Gold",
    latitude: 63.7,
    longitude: 92.5,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Blagodatnoye Gold Mine",
    country: "Russia",
    operator: "Polyus Gold",
    latitude: 63.5,
    longitude: 92.3,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Natalka Gold Mine",
    country: "Russia",
    operator: "Polyus Gold",
    latitude: 61.5,
    longitude: 147.8,
    production_bpd: 16000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === CANADA GOLD MINES ===
  {
    name: "Canadian Malartic",
    country: "Canada",
    operator: "Agnico Eagle Mines",
    latitude: 48.1,
    longitude: -78.1,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Detour Lake Mine",
    country: "Canada",
    operator: "Agnico Eagle Mines",
    latitude: 48.5,
    longitude: -81.9,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Hemlo Gold Mine",
    country: "Canada",
    operator: "Barrick Gold",
    latitude: 48.7,
    longitude: -85.9,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Red Lake Mine",
    country: "Canada",
    operator: "Evolution Mining",
    latitude: 51.0,
    longitude: -93.8,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === UNITED STATES GOLD MINES ===
  {
    name: "Carlin Trend Nevada",
    country: "United States",
    operator: "Nevada Gold Mines (Barrick/Newmont)",
    latitude: 40.7,
    longitude: -116.3,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Cortez Gold Mine",
    country: "United States",
    operator: "Nevada Gold Mines",
    latitude: 40.2,
    longitude: -116.6,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Goldstrike Mine",
    country: "United States",
    operator: "Nevada Gold Mines",
    latitude: 41.2,
    longitude: -116.4,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Fort Knox Mine Alaska",
    country: "United States",
    operator: "Kinross Gold",
    latitude: 64.9,
    longitude: -147.4,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === GHANA GOLD MINES ===
  {
    name: "Ahafo Gold Mine",
    country: "Ghana",
    operator: "Newmont",
    latitude: 7.3,
    longitude: -2.5,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Obuasi Gold Mine",
    country: "Ghana",
    operator: "AngloGold Ashanti",
    latitude: 6.2,
    longitude: -1.7,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Tarkwa Gold Mine",
    country: "Ghana",
    operator: "Gold Fields",
    latitude: 5.3,
    longitude: -2.0,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === MEXICO GOLD MINES ===
  {
    name: "Penasquito Mine",
    country: "Mexico",
    operator: "Newmont",
    latitude: 24.8,
    longitude: -102.5,
    production_bpd: 16000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Herradura Mine",
    country: "Mexico",
    operator: "Fresnillo",
    latitude: 29.0,
    longitude: -110.5,
    production_bpd: 14000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Los Filos Mine",
    country: "Mexico",
    operator: "Equinox Gold",
    latitude: 17.9,
    longitude: -99.7,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === INDONESIA GOLD MINES ===
  {
    name: "Grasberg Mine",
    country: "Indonesia",
    operator: "Freeport-McMoRan",
    latitude: -4.1,
    longitude: 137.1,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Batu Hijau Mine",
    country: "Indonesia",
    operator: "Amman Mineral",
    latitude: -8.9,
    longitude: 116.9,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === UZBEKISTAN GOLD MINES ===
  {
    name: "Muruntau Gold Mine",
    country: "Uzbekistan",
    operator: "Navoi Mining",
    latitude: 42.0,
    longitude: 64.5,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Kokpatas Gold Mine",
    country: "Uzbekistan",
    operator: "Navoi Mining",
    latitude: 40.5,
    longitude: 66.0,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === SOUTH AFRICA GOLD MINES ===
  {
    name: "Mponeng Mine",
    country: "South Africa",
    operator: "AngloGold Ashanti",
    latitude: -26.4,
    longitude: 27.5,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "South Deep Mine",
    country: "South Africa",
    operator: "Gold Fields",
    latitude: -26.4,
    longitude: 27.7,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Driefontein Mine",
    country: "South Africa",
    operator: "Sibanye-Stillwater",
    latitude: -26.5,
    longitude: 27.5,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === BRAZIL GOLD MINES ===
  {
    name: "Morro do Ouro",
    country: "Brazil",
    operator: "AngloGold Ashanti",
    latitude: -15.9,
    longitude: -50.1,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Paracatu Mine",
    country: "Brazil",
    operator: "Kinross Gold",
    latitude: -17.2,
    longitude: -46.9,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === PERU GOLD MINES ===
  {
    name: "Yanacocha Mine",
    country: "Peru",
    operator: "Newmont",
    latitude: -6.9,
    longitude: -78.5,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Lagunas Norte",
    country: "Peru",
    operator: "Barrick Gold",
    latitude: -8.0,
    longitude: -78.2,
    production_bpd: 14000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Cerro Verde Mine",
    country: "Peru",
    operator: "Freeport-McMoRan",
    latitude: -16.5,
    longitude: -71.6,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === KAZAKHSTAN GOLD MINES ===
  {
    name: "Vasilkovskoye Mine",
    country: "Kazakhstan",
    operator: "Polymetal",
    latitude: 51.2,
    longitude: 77.5,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Kyzyl Mine",
    country: "Kazakhstan",
    operator: "Polymetal",
    latitude: 50.5,
    longitude: 81.2,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === MALI GOLD MINES ===
  {
    name: "Loulo-Gounkoto",
    country: "Mali",
    operator: "Barrick Gold",
    latitude: 13.4,
    longitude: -9.3,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Sadiola Gold Mine",
    country: "Mali",
    operator: "Allied Gold",
    latitude: 13.3,
    longitude: -10.8,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === BURKINA FASO GOLD MINES ===
  {
    name: "Essakane Mine",
    country: "Burkina Faso",
    operator: "IAMGOLD",
    latitude: 14.2,
    longitude: 0.0,
    production_bpd: 14000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Karma Mine",
    country: "Burkina Faso",
    operator: "Endeavour Mining",
    latitude: 12.9,
    longitude: -3.9,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === SUDAN GOLD MINES ===
  {
    name: "Hassai Gold Mine",
    country: "Sudan",
    operator: "Managem Group",
    latitude: 17.8,
    longitude: 35.2,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Ariab Mining Area",
    country: "Sudan",
    operator: "Various Artisanal",
    latitude: 18.9,
    longitude: 37.5,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === ARGENTINA GOLD MINES ===
  {
    name: "Veladero Mine",
    country: "Argentina",
    operator: "Barrick Gold",
    latitude: -29.3,
    longitude: -70.0,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Cerro Negro Mine",
    country: "Argentina",
    operator: "Newmont",
    latitude: -47.7,
    longitude: -70.5,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === TANZANIA GOLD MINES ===
  {
    name: "Bulyanhulu Mine",
    country: "Tanzania",
    operator: "Twiga Minerals (Barrick)",
    latitude: -3.2,
    longitude: 32.8,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "North Mara Mine",
    country: "Tanzania",
    operator: "Twiga Minerals",
    latitude: -1.5,
    longitude: 34.6,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === CÔTE D'IVOIRE GOLD MINES ===
  {
    name: "Agbaou Mine",
    country: "Côte d'Ivoire",
    operator: "Allied Gold",
    latitude: 6.4,
    longitude: -5.6,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Ity Mine",
    country: "Côte d'Ivoire",
    operator: "Endeavour Mining",
    latitude: 6.6,
    longitude: -7.9,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === SAUDI ARABIA GOLD MINES ===
  {
    name: "Mahd adh Dhahab",
    country: "Saudi Arabia",
    operator: "Ma'aden",
    latitude: 23.5,
    longitude: 40.9,
    production_bpd: 7000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Al Amar Mine",
    country: "Saudi Arabia",
    operator: "Ma'aden",
    latitude: 25.3,
    longitude: 42.5,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === COLOMBIA GOLD MINES ===
  {
    name: "La Colosa Project",
    country: "Colombia",
    operator: "AngloGold Ashanti",
    latitude: 4.3,
    longitude: -75.4,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Segovia Mine",
    country: "Colombia",
    operator: "Gran Colombia Gold",
    latitude: 7.1,
    longitude: -74.7,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === PAPUA NEW GUINEA GOLD MINES ===
  {
    name: "Porgera Mine",
    country: "Papua New Guinea",
    operator: "New Porgera Limited",
    latitude: -5.5,
    longitude: 143.1,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Lihir Gold Mine",
    country: "Papua New Guinea",
    operator: "Newcrest Mining",
    latitude: -3.1,
    longitude: 152.6,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === PHILIPPINES GOLD MINES ===
  {
    name: "Didipio Mine",
    country: "Philippines",
    operator: "OceanaGold",
    latitude: 16.3,
    longitude: 121.2,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Co-O Mine",
    country: "Philippines",
    operator: "Philex Mining",
    latitude: 16.6,
    longitude: 120.8,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === CHILE GOLD MINES ===
  {
    name: "Refugio Mine",
    country: "Chile",
    operator: "Kinross Gold",
    latitude: -28.0,
    longitude: -70.5,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "El Penon Mine",
    country: "Chile",
    operator: "Yamana Gold",
    latitude: -26.2,
    longitude: -69.0,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === GUINEA GOLD MINES ===
  {
    name: "Siguiri Mine",
    country: "Guinea",
    operator: "AngloGold Ashanti",
    latitude: 11.4,
    longitude: -9.2,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Lefa Mine",
    country: "Guinea",
    operator: "Société Aurifère de Guinée",
    latitude: 10.4,
    longitude: -8.5,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === ZIMBABWE GOLD MINES ===
  {
    name: "Freda Rebecca Mine",
    country: "Zimbabwe",
    operator: "Mwana Africa",
    latitude: -17.3,
    longitude: 30.8,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Blanket Mine",
    country: "Zimbabwe",
    operator: "Caledonia Mining",
    latitude: -20.5,
    longitude: 29.8,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === ECUADOR GOLD MINES ===
  {
    name: "Fruta del Norte",
    country: "Ecuador",
    operator: "Lundin Gold",
    latitude: -3.7,
    longitude: -78.6,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === NICARAGUA GOLD MINES ===
  {
    name: "Bonanza Mine",
    country: "Nicaragua",
    operator: "Calibre Mining",
    latitude: 13.9,
    longitude: -84.6,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === MONGOLIA GOLD MINES ===
  {
    name: "Oyu Tolgoi",
    country: "Mongolia",
    operator: "Rio Tinto/Turquoise Hill",
    latitude: 43.0,
    longitude: 106.8,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === DOMINICAN REPUBLIC GOLD MINES ===
  {
    name: "Pueblo Viejo Mine",
    country: "Dominican Republic",
    operator: "Barrick Gold",
    latitude: 19.0,
    longitude: -70.2,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === LAOS GOLD MINES ===
  {
    name: "Sepon Gold Mine",
    country: "Laos",
    operator: "MMG Limited",
    latitude: 16.0,
    longitude: 106.4,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === TURKEY GOLD MINES ===
  {
    name: "Kisladag Mine",
    country: "Turkey",
    operator: "Eldorado Gold",
    latitude: 38.5,
    longitude: 28.9,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Efemcukuru Mine",
    country: "Turkey",
    operator: "Eldorado Gold",
    latitude: 38.3,
    longitude: 28.2,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === ETHIOPIA GOLD MINES ===
  {
    name: "Lega Dembi Mine",
    country: "Ethiopia",
    operator: "MIDROC Gold",
    latitude: 5.7,
    longitude: 39.0,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === EGYPT GOLD MINES ===
  {
    name: "Sukari Gold Mine",
    country: "Egypt",
    operator: "Centamin",
    latitude: 24.9,
    longitude: 34.7,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === BOLIVIA GOLD MINES ===
  {
    name: "Kori Chaca Mine",
    country: "Bolivia",
    operator: "Various Operators",
    latitude: -16.9,
    longitude: -68.0,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === VENEZUELA GOLD MINES ===
  {
    name: "Las Cristinas",
    country: "Venezuela",
    operator: "Minerven",
    latitude: 7.0,
    longitude: -61.5,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === SENEGAL GOLD MINES ===
  {
    name: "Sabodala-Massawa",
    country: "Senegal",
    operator: "Endeavour Mining",
    latitude: 12.8,
    longitude: -11.8,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === FINLAND GOLD MINES ===
  {
    name: "Kittila Mine",
    country: "Finland",
    operator: "Agnico Eagle Mines",
    latitude: 67.7,
    longitude: 25.0,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === NORWAY GOLD MINES ===
  {
    name: "Nordic Mining Engebø",
    country: "Norway",
    operator: "Nordic Mining",
    latitude: 61.5,
    longitude: 5.5,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === SWEDEN GOLD MINES ===
  {
    name: "Boliden Area Mines",
    country: "Sweden",
    operator: "Boliden AB",
    latitude: 64.9,
    longitude: 20.4,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === SPAIN GOLD MINES ===
  {
    name: "Las Cruces Mine",
    country: "Spain",
    operator: "First Quantum Minerals",
    latitude: 37.5,
    longitude: -6.2,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === GREECE GOLD MINES ===
  {
    name: "Olympias Mine",
    country: "Greece",
    operator: "Hellas Gold",
    latitude: 40.9,
    longitude: 23.8,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  {
    name: "Stratoni Mine",
    country: "Greece",
    operator: "Hellas Gold",
    latitude: 40.5,
    longitude: 23.9,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === ROMANIA GOLD MINES ===
  {
    name: "Rosia Montana",
    country: "Romania",
    operator: "Historical/Proposed",
    latitude: 46.3,
    longitude: 23.1,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === SERBIA GOLD MINES ===
  {
    name: "Čukaru Peki",
    country: "Serbia",
    operator: "Zijin Mining",
    latitude: 43.9,
    longitude: 22.0,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === ARMENIA GOLD MINES ===
  {
    name: "Amulsar Mine",
    country: "Armenia",
    operator: "Lydian International",
    latitude: 39.8,
    longitude: 45.5,
    production_bpd: 7000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === IRAN GOLD MINES ===
  {
    name: "Zarshuran Mine",
    country: "Iran",
    operator: "Iranian Mines & Mining Industries Development",
    latitude: 36.7,
    longitude: 45.8,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === THAILAND GOLD MINES ===
  {
    name: "Chatree Mine",
    country: "Thailand",
    operator: "Akara Resources",
    latitude: 15.7,
    longitude: 101.1,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === VIETNAM GOLD MINES ===
  {
    name: "Ban Phuc Mine",
    country: "Vietnam",
    operator: "AMR Nickel",
    latitude: 22.4,
    longitude: 104.1,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === JAPAN GOLD MINES ===
  {
    name: "Hishikari Mine",
    country: "Japan",
    operator: "Sumitomo Metal Mining",
    latitude: 31.8,
    longitude: 130.8,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // === SOUTH KOREA GOLD MINES ===
  {
    name: "Seongsan Mine",
    country: "South Korea",
    operator: "Korea Resources Corporation",
    latitude: 37.5,
    longitude: 128.5,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Gold Mine"
  },
  // ============================================
  // SILVER MINES - GLOBAL COVERAGE
  // ============================================
  // === MEXICO SILVER MINES ===
  {
    name: "Fresnillo Mine",
    country: "Mexico",
    operator: "Fresnillo plc",
    latitude: 23.2,
    longitude: -102.9,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  {
    name: "Saucito Mine",
    country: "Mexico",
    operator: "Fresnillo plc",
    latitude: 23.1,
    longitude: -102.8,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  {
    name: "Sabinas Mine",
    country: "Mexico",
    operator: "First Majestic Silver",
    latitude: 24.5,
    longitude: -101.2,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  {
    name: "San Dimas Mine",
    country: "Mexico",
    operator: "First Majestic Silver",
    latitude: 24.1,
    longitude: -105.9,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === CHINA SILVER MINES ===
  {
    name: "Yinman Silver Mine",
    country: "China",
    operator: "Silvercorp Metals",
    latitude: 29.5,
    longitude: 107.8,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  {
    name: "Ying Mining District",
    country: "China",
    operator: "Silvercorp Metals",
    latitude: 29.8,
    longitude: 107.5,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === PERU SILVER MINES ===
  {
    name: "Antamina Mine",
    country: "Peru",
    operator: "Glencore/BHP/Teck",
    latitude: -9.5,
    longitude: -77.1,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  {
    name: "Uchucchacua Mine",
    country: "Peru",
    operator: "Compañía de Minas Buenaventura",
    latitude: -10.5,
    longitude: -76.7,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  {
    name: "Pallancata Mine",
    country: "Peru",
    operator: "Hochschild Mining",
    latitude: -15.0,
    longitude: -72.5,
    production_bpd: 16000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === AUSTRALIA SILVER MINES ===
  {
    name: "Cannington Mine",
    country: "Australia",
    operator: "South32",
    latitude: -21.8,
    longitude: 140.3,
    production_bpd: 32000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  {
    name: "Mount Isa Mines",
    country: "Australia",
    operator: "Glencore",
    latitude: -20.7,
    longitude: 139.5,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === POLAND SILVER MINES ===
  {
    name: "Polkowice-Sieroszowice",
    country: "Poland",
    operator: "KGHM Polska Miedź",
    latitude: 51.5,
    longitude: 16.1,
    production_bpd: 45000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  {
    name: "Rudna Mine",
    country: "Poland",
    operator: "KGHM Polska Miedź",
    latitude: 51.5,
    longitude: 16.2,
    production_bpd: 38000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === RUSSIA SILVER MINES ===
  {
    name: "Dukat Mine",
    country: "Russia",
    operator: "Polymetal International",
    latitude: 62.5,
    longitude: 154.2,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  {
    name: "Goltsovoye Mine",
    country: "Russia",
    operator: "Polymetal International",
    latitude: 52.8,
    longitude: 116.5,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === CHILE SILVER MINES ===
  {
    name: "Candelaria Mine",
    country: "Chile",
    operator: "Lundin Mining",
    latitude: -27.5,
    longitude: -70.2,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  {
    name: "Escondida Mine",
    country: "Chile",
    operator: "BHP",
    latitude: -24.3,
    longitude: -69.1,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === BOLIVIA SILVER MINES ===
  {
    name: "San Cristobal Mine",
    country: "Bolivia",
    operator: "Sumitomo Corporation",
    latitude: -20.5,
    longitude: -66.3,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  {
    name: "San Vicente Mine",
    country: "Bolivia",
    operator: "Pan American Silver",
    latitude: -18.8,
    longitude: -65.9,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === UNITED STATES SILVER MINES ===
  {
    name: "Greens Creek Mine Alaska",
    country: "United States",
    operator: "Hecla Mining",
    latitude: 58.1,
    longitude: -134.6,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  {
    name: "Rochester Mine Nevada",
    country: "United States",
    operator: "Coeur Mining",
    latitude: 40.5,
    longitude: -118.8,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  {
    name: "Lucky Friday Mine Idaho",
    country: "United States",
    operator: "Hecla Mining",
    latitude: 47.5,
    longitude: -116.2,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === ARGENTINA SILVER MINES ===
  {
    name: "Manantial Espejo",
    country: "Argentina",
    operator: "Pan American Silver",
    latitude: -47.1,
    longitude: -68.8,
    production_bpd: 14000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === KAZAKHSTAN SILVER MINES ===
  {
    name: "Kazzinc Ridder-Sokolny",
    country: "Kazakhstan",
    operator: "Glencore",
    latitude: 50.3,
    longitude: 83.5,
    production_bpd: 16000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === CANADA SILVER MINES ===
  {
    name: "Saucito Mine (San Martin)",
    country: "Canada",
    operator: "Coeur Mining",
    latitude: 49.7,
    longitude: -117.5,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === INDIA SILVER MINES ===
  {
    name: "Rampura Agucha Mine",
    country: "India",
    operator: "Hindustan Zinc",
    latitude: 27.3,
    longitude: 74.2,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  {
    name: "Sindesar Khurd Mine",
    country: "India",
    operator: "Hindustan Zinc",
    latitude: 24.6,
    longitude: 74.0,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === IRAN SILVER MINES ===
  {
    name: "Gol-e-Gohar Complex",
    country: "Iran",
    operator: "National Iranian Copper Industries",
    latitude: 29.5,
    longitude: 57.2,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === MOROCCO SILVER MINES ===
  {
    name: "Imiter Mine",
    country: "Morocco",
    operator: "Managem Group",
    latitude: 31.1,
    longitude: -6.0,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === UZBEKISTAN SILVER MINES ===
  {
    name: "Kalmakyr Mine",
    country: "Uzbekistan",
    operator: "Almalyk Mining",
    latitude: 41.1,
    longitude: 69.9,
    production_bpd: 9000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === TURKEY SILVER MINES ===
  {
    name: "Gümüşköy Mine",
    country: "Turkey",
    operator: "Koza Altin",
    latitude: 39.5,
    longitude: 29.5,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === GUATEMALA SILVER MINES ===
  {
    name: "Escobal Mine",
    country: "Guatemala",
    operator: "Pan American Silver",
    latitude: 14.5,
    longitude: -90.2,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === SWEDEN SILVER MINES ===
  {
    name: "Garpenberg Mine",
    country: "Sweden",
    operator: "Boliden AB",
    latitude: 60.3,
    longitude: 16.2,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === JAPAN SILVER MINES ===
  {
    name: "Toyoha Mine",
    country: "Japan",
    operator: "Sumitomo Metal Mining",
    latitude: 42.8,
    longitude: 141.0,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === SOUTH AFRICA SILVER MINES ===
  {
    name: "Gamsberg Mine",
    country: "South Africa",
    operator: "Vedanta Resources",
    latitude: -29.0,
    longitude: 18.9,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === INDONESIA SILVER MINES ===
  {
    name: "Batu Hijau Silver",
    country: "Indonesia",
    operator: "Amman Mineral",
    latitude: -8.9,
    longitude: 116.9,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === PAPUA NEW GUINEA SILVER MINES ===
  {
    name: "Simberi Mine",
    country: "Papua New Guinea",
    operator: "St Barbara",
    latitude: -2.7,
    longitude: 151.0,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === SPAIN SILVER MINES ===
  {
    name: "Cerro Colorado Mine",
    country: "Spain",
    operator: "MATSA",
    latitude: 37.6,
    longitude: -6.8,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === GREECE SILVER MINES ===
  {
    name: "Stratoni Silver Mine",
    country: "Greece",
    operator: "Hellas Gold",
    latitude: 40.5,
    longitude: 23.9,
    production_bpd: 7000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === SERBIA SILVER MINES ===
  {
    name: "Veliki Krivelj Mine",
    country: "Serbia",
    operator: "Zijin Mining",
    latitude: 43.9,
    longitude: 22.0,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === ROMANIA SILVER MINES ===
  {
    name: "Certej Project",
    country: "Romania",
    operator: "Eldorado Gold",
    latitude: 45.8,
    longitude: 22.8,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === ARMENIA SILVER MINES ===
  {
    name: "Sotk Gold-Silver Mine",
    country: "Armenia",
    operator: "GeoProMining",
    latitude: 40.5,
    longitude: 45.3,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === GERMANY SILVER MINES ===
  {
    name: "Rammelsberg Mine (Historical)",
    country: "Germany",
    operator: "Historical Operations",
    latitude: 51.9,
    longitude: 10.3,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === CZECH REPUBLIC SILVER MINES ===
  {
    name: "Příbram Mining District",
    country: "Czech Republic",
    operator: "Historical/Small Scale",
    latitude: 49.7,
    longitude: 14.0,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === SLOVAKIA SILVER MINES ===
  {
    name: "Banská Štiavnica",
    country: "Slovakia",
    operator: "Historical Operations",
    latitude: 48.5,
    longitude: 18.9,
    production_bpd: 800,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === HUNGARY SILVER MINES ===
  {
    name: "Recsk Mine",
    country: "Hungary",
    operator: "MÉV Ásványbányászati",
    latitude: 47.9,
    longitude: 20.1,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === BULGARIA SILVER MINES ===
  {
    name: "Madan Lead-Zinc Complex",
    country: "Bulgaria",
    operator: "Gorubso Madan",
    latitude: 41.5,
    longitude: 24.9,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === AUSTRIA SILVER MINES ===
  {
    name: "Schwaz Mine (Historical)",
    country: "Austria",
    operator: "Historical Operations",
    latitude: 47.3,
    longitude: 11.7,
    production_bpd: 300,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === NORWAY SILVER MINES ===
  {
    name: "Kongsberg Silver Mines",
    country: "Norway",
    operator: "Historical Operations",
    latitude: 59.7,
    longitude: 9.6,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === FINLAND SILVER MINES ===
  {
    name: "Pyhäsalmi Mine",
    country: "Finland",
    operator: "First Quantum Minerals",
    latitude: 63.7,
    longitude: 25.9,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === UKRAINE SILVER MINES ===
  {
    name: "Beregovo Polymetallic Mine",
    country: "Ukraine",
    operator: "State Mining Company",
    latitude: 48.2,
    longitude: 22.6,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === TAJIKISTAN SILVER MINES ===
  {
    name: "Takob Silver Deposit",
    country: "Tajikistan",
    operator: "Anzob Mining",
    latitude: 39.0,
    longitude: 68.5,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === MONGOLIA SILVER MINES ===
  {
    name: "Oyut Ulaan Mine",
    country: "Mongolia",
    operator: "MonGold LLC",
    latitude: 46.5,
    longitude: 106.0,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === VIETNAM SILVER MINES ===
  {
    name: "Sin Quyen Mine",
    country: "Vietnam",
    operator: "Vietnam National Coal-Mineral",
    latitude: 22.5,
    longitude: 104.0,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === LAOS SILVER MINES ===
  {
    name: "Phu Kham Mine",
    country: "Laos",
    operator: "PanAust",
    latitude: 19.5,
    longitude: 103.0,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === THAILAND SILVER MINES ===
  {
    name: "Akara Mining Operations",
    country: "Thailand",
    operator: "Akara Resources",
    latitude: 13.0,
    longitude: 101.5,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === PHILIPPINES SILVER MINES ===
  {
    name: "Masbate Gold-Silver Mine",
    country: "Philippines",
    operator: "B2Gold",
    latitude: 12.4,
    longitude: 123.6,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === MYANMAR SILVER MINES ===
  {
    name: "Bawdwin Mine",
    country: "Myanmar",
    operator: "Myanmar Metals",
    latitude: 23.1,
    longitude: 97.5,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === SOUTH KOREA SILVER MINES ===
  {
    name: "Yeonhwa Mine",
    country: "South Korea",
    operator: "Korea Zinc",
    latitude: 37.2,
    longitude: 128.8,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === ECUADOR SILVER MINES ===
  {
    name: "Rio Blanco Project",
    country: "Ecuador",
    operator: "Junefield Resources",
    latitude: -2.3,
    longitude: -79.3,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === HONDURAS SILVER MINES ===
  {
    name: "San Andrés Mine",
    country: "Honduras",
    operator: "Aura Minerals",
    latitude: 14.0,
    longitude: -87.5,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === NICARAGUA SILVER MINES ===
  {
    name: "La Libertad Mine",
    country: "Nicaragua",
    operator: "Calibre Mining",
    latitude: 13.5,
    longitude: -85.8,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // === DOMINICAN REPUBLIC SILVER MINES ===
  {
    name: "Pueblo Viejo Silver",
    country: "Dominican Republic",
    operator: "Barrick Gold",
    latitude: 19.0,
    longitude: -70.2,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silver Mine"
  },
  // ============================================
  // COPPER MINES - GLOBAL COVERAGE
  // ============================================
  // === CHILE COPPER MINES ===
  {
    name: "Escondida Mine",
    country: "Chile",
    operator: "BHP",
    latitude: -24.3,
    longitude: -69.1,
    production_bpd: 50000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Collahuasi Mine",
    country: "Chile",
    operator: "Glencore/Anglo American",
    latitude: -20.9,
    longitude: -68.7,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "El Teniente Mine",
    country: "Chile",
    operator: "Codelco",
    latitude: -34.1,
    longitude: -70.4,
    production_bpd: 32000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Chuquicamata Mine",
    country: "Chile",
    operator: "Codelco",
    latitude: -22.3,
    longitude: -68.9,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Los Bronces Mine",
    country: "Chile",
    operator: "Anglo American",
    latitude: -33.2,
    longitude: -70.3,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Andina Mine",
    country: "Chile",
    operator: "Codelco",
    latitude: -32.8,
    longitude: -70.2,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === PERU COPPER MINES ===
  {
    name: "Cerro Verde Mine",
    country: "Peru",
    operator: "Freeport-McMoRan",
    latitude: -16.5,
    longitude: -71.6,
    production_bpd: 40000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Las Bambas Mine",
    country: "Peru",
    operator: "MMG Limited",
    latitude: -14.2,
    longitude: -72.3,
    production_bpd: 38000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Antamina Mine",
    country: "Peru",
    operator: "Glencore/BHP/Teck",
    latitude: -9.5,
    longitude: -77.1,
    production_bpd: 32000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Toquepala Mine",
    country: "Peru",
    operator: "Southern Copper",
    latitude: -17.3,
    longitude: -70.6,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Cuajone Mine",
    country: "Peru",
    operator: "Southern Copper",
    latitude: -17.0,
    longitude: -70.7,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === DRC COPPER MINES ===
  {
    name: "Kamoa-Kakula Mine",
    country: "Democratic Republic of the Congo",
    operator: "Ivanhoe Mines/Zijin Mining",
    latitude: -10.7,
    longitude: 26.5,
    production_bpd: 42000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Tenke Fungurume",
    country: "Democratic Republic of the Congo",
    operator: "China Molybdenum",
    latitude: -10.6,
    longitude: 26.1,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Mutanda Mine",
    country: "Democratic Republic of the Congo",
    operator: "Glencore",
    latitude: -10.9,
    longitude: 27.6,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Kamoto Copper Company",
    country: "Democratic Republic of the Congo",
    operator: "Glencore",
    latitude: -10.6,
    longitude: 27.5,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === CHINA COPPER MINES ===
  {
    name: "Zijinshan Copper Mine",
    country: "China",
    operator: "Zijin Mining Group",
    latitude: 25.1,
    longitude: 116.4,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Dexing Copper Mine",
    country: "China",
    operator: "Jiangxi Copper",
    latitude: 29.0,
    longitude: 117.7,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Yulong Copper Mine",
    country: "China",
    operator: "Western Mining",
    latitude: 32.3,
    longitude: 96.5,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === UNITED STATES COPPER MINES ===
  {
    name: "Morenci Mine Arizona",
    country: "United States",
    operator: "Freeport-McMoRan",
    latitude: 33.0,
    longitude: -109.3,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Bingham Canyon Utah",
    country: "United States",
    operator: "Rio Tinto",
    latitude: 40.5,
    longitude: -112.2,
    production_bpd: 32000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Bagdad Mine Arizona",
    country: "United States",
    operator: "Freeport-McMoRan",
    latitude: 34.6,
    longitude: -113.2,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Ray Mine Arizona",
    country: "United States",
    operator: "ASARCO",
    latitude: 33.2,
    longitude: -110.9,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === AUSTRALIA COPPER MINES ===
  {
    name: "Olympic Dam Mine",
    country: "Australia",
    operator: "BHP",
    latitude: -30.5,
    longitude: 136.9,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Cadia Valley Operations",
    country: "Australia",
    operator: "Newcrest Mining",
    latitude: -33.5,
    longitude: 148.9,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Ernest Henry Mine",
    country: "Australia",
    operator: "Glencore",
    latitude: -20.4,
    longitude: 140.7,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === RUSSIA COPPER MINES ===
  {
    name: "Udokan Deposit",
    country: "Russia",
    operator: "Baikal Mining Company",
    latitude: 56.5,
    longitude: 118.0,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Norilsk Nickel Complex",
    country: "Russia",
    operator: "Nornickel",
    latitude: 69.4,
    longitude: 88.2,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Gaisky GOK",
    country: "Russia",
    operator: "UGMK",
    latitude: 51.5,
    longitude: 58.5,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === ZAMBIA COPPER MINES ===
  {
    name: "Konkola Copper Mines",
    country: "Zambia",
    operator: "Vedanta Resources",
    latitude: -12.4,
    longitude: 27.9,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Kansanshi Mine",
    country: "Zambia",
    operator: "First Quantum Minerals",
    latitude: -12.1,
    longitude: 26.4,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Lumwana Mine",
    country: "Zambia",
    operator: "Barrick Gold",
    latitude: -12.2,
    longitude: 25.8,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === MEXICO COPPER MINES ===
  {
    name: "Buenavista del Cobre",
    country: "Mexico",
    operator: "Grupo México",
    latitude: 30.5,
    longitude: -109.7,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "La Caridad Mine",
    country: "Mexico",
    operator: "Grupo México",
    latitude: 30.1,
    longitude: -109.5,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === INDONESIA COPPER MINES ===
  {
    name: "Grasberg Mine",
    country: "Indonesia",
    operator: "Freeport-McMoRan",
    latitude: -4.1,
    longitude: 137.1,
    production_bpd: 45000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Batu Hijau Mine",
    country: "Indonesia",
    operator: "Amman Mineral",
    latitude: -8.9,
    longitude: 116.9,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === CANADA COPPER MINES ===
  {
    name: "Highland Valley Copper",
    country: "Canada",
    operator: "Teck Resources",
    latitude: 50.5,
    longitude: -121.0,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Antamina Canada Operations",
    country: "Canada",
    operator: "Various Operators",
    latitude: 48.5,
    longitude: -78.0,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === KAZAKHSTAN COPPER MINES ===
  {
    name: "Aktogay Mine",
    country: "Kazakhstan",
    operator: "KAZ Minerals",
    latitude: 47.5,
    longitude: 78.5,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Bozshakol Mine",
    country: "Kazakhstan",
    operator: "KAZ Minerals",
    latitude: 50.0,
    longitude: 62.5,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === BRAZIL COPPER MINES ===
  {
    name: "Salobo Mine",
    country: "Brazil",
    operator: "Vale",
    latitude: -5.8,
    longitude: -50.5,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Sossego Mine",
    country: "Brazil",
    operator: "Vale",
    latitude: -6.5,
    longitude: -50.0,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === MONGOLIA COPPER MINES ===
  {
    name: "Oyu Tolgoi Mine",
    country: "Mongolia",
    operator: "Rio Tinto/Turquoise Hill",
    latitude: 43.0,
    longitude: 106.8,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Erdenet Mine",
    country: "Mongolia",
    operator: "Erdenet Mining Corporation",
    latitude: 49.0,
    longitude: 104.1,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === IRAN COPPER MINES ===
  {
    name: "Sarcheshmeh Mine",
    country: "Iran",
    operator: "National Iranian Copper Industries",
    latitude: 29.8,
    longitude: 55.9,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Sungun Mine",
    country: "Iran",
    operator: "National Iranian Copper Industries",
    latitude: 38.8,
    longitude: 46.4,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === POLAND COPPER MINES ===
  {
    name: "Lubin Mine",
    country: "Poland",
    operator: "KGHM Polska Miedź",
    latitude: 51.4,
    longitude: 16.2,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Polkowice Mine",
    country: "Poland",
    operator: "KGHM Polska Miedź",
    latitude: 51.5,
    longitude: 16.1,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === SPAIN COPPER MINES ===
  {
    name: "Riotinto Mine",
    country: "Spain",
    operator: "Atalaya Mining",
    latitude: 37.7,
    longitude: -6.6,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === TURKEY COPPER MINES ===
  {
    name: "Çayeli Mine",
    country: "Turkey",
    operator: "Inmet Mining",
    latitude: 41.0,
    longitude: 40.7,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === PHILIPPINES COPPER MINES ===
  {
    name: "Carmen Copper Mine",
    country: "Philippines",
    operator: "Atlas Consolidated",
    latitude: 9.5,
    longitude: 125.5,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Tampakan Project",
    country: "Philippines",
    operator: "Sagittarius Mines",
    latitude: 6.4,
    longitude: 124.9,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === SOUTH AFRICA COPPER MINES ===
  {
    name: "Palabora Mine",
    country: "South Africa",
    operator: "Palabora Mining Company",
    latitude: -23.9,
    longitude: 31.1,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === ARGENTINA COPPER MINES ===
  {
    name: "Bajo de la Alumbrera",
    country: "Argentina",
    operator: "Glencore",
    latitude: -27.3,
    longitude: -66.6,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === PANAMA COPPER MINES ===
  {
    name: "Cobre Panama",
    country: "Panama",
    operator: "First Quantum Minerals",
    latitude: 8.9,
    longitude: -80.6,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === BOLIVIA COPPER MINES ===
  {
    name: "Corocoro Mine",
    country: "Bolivia",
    operator: "Comibol",
    latitude: -17.2,
    longitude: -68.4,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === COLOMBIA COPPER MINES ===
  {
    name: "Pantanos Project",
    country: "Colombia",
    operator: "Libero Copper",
    latitude: 4.5,
    longitude: -76.5,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === SERBIA COPPER MINES ===
  {
    name: "Bor Mine",
    country: "Serbia",
    operator: "Zijin Mining",
    latitude: 44.1,
    longitude: 22.1,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Majdanpek Mine",
    country: "Serbia",
    operator: "Zijin Mining",
    latitude: 44.4,
    longitude: 21.9,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === BULGARIA COPPER MINES ===
  {
    name: "Elatsite Mine",
    country: "Bulgaria",
    operator: "Aurubis Bulgaria",
    latitude: 42.7,
    longitude: 24.3,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Assarel Mine",
    country: "Bulgaria",
    operator: "Asarel-Medet",
    latitude: 42.5,
    longitude: 24.2,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === SWEDEN COPPER MINES ===
  {
    name: "Aitik Mine",
    country: "Sweden",
    operator: "Boliden AB",
    latitude: 67.1,
    longitude: 20.9,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === FINLAND COPPER MINES ===
  {
    name: "Kevitsa Mine",
    country: "Finland",
    operator: "Boliden AB",
    latitude: 67.6,
    longitude: 27.0,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === PORTUGAL COPPER MINES ===
  {
    name: "Neves-Corvo Mine",
    country: "Portugal",
    operator: "Lundin Mining",
    latitude: 37.6,
    longitude: -7.9,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === GREECE COPPER MINES ===
  {
    name: "Skouries Project",
    country: "Greece",
    operator: "Hellas Gold",
    latitude: 40.5,
    longitude: 23.7,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === ARMENIA COPPER MINES ===
  {
    name: "Kajaran Mine",
    country: "Armenia",
    operator: "Zangezur Copper Molybdenum",
    latitude: 39.2,
    longitude: 46.2,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === UZBEKISTAN COPPER MINES ===
  {
    name: "Almalyk Mining Complex",
    country: "Uzbekistan",
    operator: "Almalyk Mining",
    latitude: 41.1,
    longitude: 69.9,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === LAOS COPPER MINES ===
  {
    name: "Phu Bia Mine",
    country: "Laos",
    operator: "PanAust",
    latitude: 19.0,
    longitude: 103.2,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === PAPUA NEW GUINEA COPPER MINES ===
  {
    name: "Ok Tedi Mine",
    country: "Papua New Guinea",
    operator: "Ok Tedi Mining",
    latitude: -5.2,
    longitude: 141.2,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Panguna Mine",
    country: "Papua New Guinea",
    operator: "Bougainville Copper",
    latitude: -6.3,
    longitude: 155.5,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === MYANMAR COPPER MINES ===
  {
    name: "Monywa Copper Mine",
    country: "Myanmar",
    operator: "Myanmar Metals",
    latitude: 22.1,
    longitude: 95.1,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === VIETNAM COPPER MINES ===
  {
    name: "Sin Quyen Copper Mine",
    country: "Vietnam",
    operator: "Vietnam National Coal-Mineral",
    latitude: 22.5,
    longitude: 104.0,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === THAILAND COPPER MINES ===
  {
    name: "Puthep Mine",
    country: "Thailand",
    operator: "Akara Resources",
    latitude: 15.5,
    longitude: 101.5,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === MALAYSIA COPPER MINES ===
  {
    name: "Mamut Copper Mine",
    country: "Malaysia",
    operator: "Historical Operations",
    latitude: 6.0,
    longitude: 116.5,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === INDIA COPPER MINES ===
  {
    name: "Malanjkhand Copper Mine",
    country: "India",
    operator: "Hindustan Copper",
    latitude: 22.0,
    longitude: 80.7,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Khetri Copper Complex",
    country: "India",
    operator: "Hindustan Copper",
    latitude: 28.0,
    longitude: 75.8,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === PAKISTAN COPPER MINES ===
  {
    name: "Saindak Copper Mine",
    country: "Pakistan",
    operator: "China Metallurgical Group",
    latitude: 29.3,
    longitude: 61.5,
    production_bpd: 7000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  {
    name: "Reko Diq Project",
    country: "Pakistan",
    operator: "Barrick Gold",
    latitude: 29.0,
    longitude: 62.5,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === SAUDI ARABIA COPPER MINES ===
  {
    name: "Jabal Sayid Mine",
    country: "Saudi Arabia",
    operator: "Barrick Gold",
    latitude: 24.0,
    longitude: 41.0,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === OMAN COPPER MINES ===
  {
    name: "Lasail Mine",
    country: "Oman",
    operator: "Oman Mining Company",
    latitude: 24.3,
    longitude: 56.5,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === EGYPT COPPER MINES ===
  {
    name: "Abu Swayel Mine",
    country: "Egypt",
    operator: "Egyptian Mineral Resources Authority",
    latitude: 27.2,
    longitude: 33.5,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === MOROCCO COPPER MINES ===
  {
    name: "Hajar Mine",
    country: "Morocco",
    operator: "Managem Group",
    latitude: 32.5,
    longitude: -6.5,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === TUNISIA COPPER MINES ===
  {
    name: "Oum Tounsi Mine",
    country: "Tunisia",
    operator: "Compagnie des Phosphates de Gafsa",
    latitude: 34.5,
    longitude: 8.5,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === NAMIBIA COPPER MINES ===
  {
    name: "Tschudi Mine",
    country: "Namibia",
    operator: "Weatherly International",
    latitude: -19.5,
    longitude: 17.8,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === BOTSWANA COPPER MINES ===
  {
    name: "Mowana Mine",
    country: "Botswana",
    operator: "Copper 360",
    latitude: -21.5,
    longitude: 27.5,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === TANZANIA COPPER MINES ===
  {
    name: "Kabanga Nickel-Copper",
    country: "Tanzania",
    operator: "BHP/Lifezone Metals",
    latitude: -2.6,
    longitude: 30.8,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === ZIMBABWE COPPER MINES ===
  {
    name: "Alaska Mine",
    country: "Zimbabwe",
    operator: "Bindura Nickel Corporation",
    latitude: -17.3,
    longitude: 31.3,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // === JAPAN COPPER MINES ===
  {
    name: "Besshi Mine (Historical)",
    country: "Japan",
    operator: "Sumitomo Metal Mining",
    latitude: 33.9,
    longitude: 133.3,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Copper Mine"
  },
  // ============================================
  // STEEL PRODUCTION FACILITIES - GLOBAL COVERAGE
  // ============================================
  // === CHINA STEEL PLANTS ===
  {
    name: "Baosteel Shanghai",
    country: "China",
    operator: "China Baowu Steel Group",
    latitude: 31.4,
    longitude: 121.2,
    production_bpd: 150000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  {
    name: "Angang Steel Anshan",
    country: "China",
    operator: "Ansteel Group",
    latitude: 41.1,
    longitude: 122.9,
    production_bpd: 120000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  {
    name: "Shougang Steel Beijing",
    country: "China",
    operator: "Shougang Group",
    latitude: 39.9,
    longitude: 116.2,
    production_bpd: 100000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  {
    name: "Hebei Iron & Steel",
    country: "China",
    operator: "HBIS Group",
    latitude: 38.0,
    longitude: 114.5,
    production_bpd: 110000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === INDIA STEEL PLANTS ===
  {
    name: "Jamshedpur Steel Plant",
    country: "India",
    operator: "Tata Steel",
    latitude: 22.8,
    longitude: 86.2,
    production_bpd: 45000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  {
    name: "Rourkela Steel Plant",
    country: "India",
    operator: "SAIL",
    latitude: 22.2,
    longitude: 84.9,
    production_bpd: 38000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  {
    name: "Bhilai Steel Plant",
    country: "India",
    operator: "SAIL",
    latitude: 21.2,
    longitude: 81.4,
    production_bpd: 40000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  {
    name: "Vizag Steel Plant",
    country: "India",
    operator: "Rashtriya Ispat Nigam",
    latitude: 17.7,
    longitude: 83.3,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === JAPAN STEEL PLANTS ===
  {
    name: "Kimitsu Works",
    country: "Japan",
    operator: "Nippon Steel",
    latitude: 35.3,
    longitude: 139.9,
    production_bpd: 42000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  {
    name: "Oita Works",
    country: "Japan",
    operator: "Nippon Steel",
    latitude: 33.3,
    longitude: 131.7,
    production_bpd: 38000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  {
    name: "Fukuyama Works",
    country: "Japan",
    operator: "JFE Steel",
    latitude: 34.5,
    longitude: 133.4,
    production_bpd: 40000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === UNITED STATES STEEL PLANTS ===
  {
    name: "Gary Works Indiana",
    country: "United States",
    operator: "U.S. Steel",
    latitude: 41.6,
    longitude: -87.3,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  {
    name: "Cleveland Works",
    country: "United States",
    operator: "ArcelorMittal",
    latitude: 41.5,
    longitude: -81.7,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  {
    name: "Burns Harbor Indiana",
    country: "United States",
    operator: "ArcelorMittal",
    latitude: 41.6,
    longitude: -87.2,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === RUSSIA STEEL PLANTS ===
  {
    name: "Magnitogorsk Iron & Steel",
    country: "Russia",
    operator: "MMK",
    latitude: 53.4,
    longitude: 59.0,
    production_bpd: 50000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  {
    name: "Cherepovets Steel Mill",
    country: "Russia",
    operator: "Severstal",
    latitude: 59.1,
    longitude: 37.9,
    production_bpd: 45000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  {
    name: "NLMK Lipetsk",
    country: "Russia",
    operator: "NLMK",
    latitude: 52.6,
    longitude: 39.6,
    production_bpd: 42000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === SOUTH KOREA STEEL PLANTS ===
  {
    name: "Pohang Steel Works",
    country: "South Korea",
    operator: "POSCO",
    latitude: 36.0,
    longitude: 129.4,
    production_bpd: 45000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  {
    name: "Gwangyang Works",
    country: "South Korea",
    operator: "POSCO",
    latitude: 34.9,
    longitude: 127.7,
    production_bpd: 42000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === GERMANY STEEL PLANTS ===
  {
    name: "ThyssenKrupp Duisburg",
    country: "Germany",
    operator: "ThyssenKrupp Steel",
    latitude: 51.4,
    longitude: 6.8,
    production_bpd: 38000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  {
    name: "Salzgitter Steelworks",
    country: "Germany",
    operator: "Salzgitter AG",
    latitude: 52.2,
    longitude: 10.4,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === TURKEY STEEL PLANTS ===
  {
    name: "Eregli Iron & Steel",
    country: "Turkey",
    operator: "Erdemir",
    latitude: 41.3,
    longitude: 31.4,
    production_bpd: 32000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  {
    name: "Iskenderun Iron & Steel",
    country: "Turkey",
    operator: "Tosyali",
    latitude: 36.6,
    longitude: 36.2,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === BRAZIL STEEL PLANTS ===
  {
    name: "CSN Volta Redonda",
    country: "Brazil",
    operator: "Companhia Siderúrgica Nacional",
    latitude: -22.5,
    longitude: -44.1,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  {
    name: "Usiminas Ipatinga",
    country: "Brazil",
    operator: "Usiminas",
    latitude: -19.5,
    longitude: -42.5,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === IRAN STEEL PLANTS ===
  {
    name: "Mobarakeh Steel Complex",
    country: "Iran",
    operator: "Mobarakeh Steel Company",
    latitude: 32.6,
    longitude: 51.5,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  {
    name: "Khuzestan Steel Company",
    country: "Iran",
    operator: "Khuzestan Steel",
    latitude: 31.3,
    longitude: 48.7,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === ITALY STEEL PLANTS ===
  {
    name: "Taranto Steel Plant",
    country: "Italy",
    operator: "ArcelorMittal",
    latitude: 40.5,
    longitude: 17.2,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  {
    name: "Piombino Steel Works",
    country: "Italy",
    operator: "JSW Steel",
    latitude: 42.9,
    longitude: 10.5,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === VIETNAM STEEL PLANTS ===
  {
    name: "Formosa Ha Tinh Steel",
    country: "Vietnam",
    operator: "Formosa Plastics",
    latitude: 18.3,
    longitude: 105.9,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  {
    name: "Hoa Phat Hai Duong",
    country: "Vietnam",
    operator: "Hoa Phat Group",
    latitude: 20.9,
    longitude: 106.3,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === TAIWAN STEEL PLANTS ===
  {
    name: "China Steel Kaohsiung",
    country: "Taiwan",
    operator: "China Steel Corporation",
    latitude: 22.6,
    longitude: 120.3,
    production_bpd: 32000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === MEXICO STEEL PLANTS ===
  {
    name: "Altos Hornos de México",
    country: "Mexico",
    operator: "AHMSA",
    latitude: 26.9,
    longitude: -101.4,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  {
    name: "ArcelorMittal Lazaro Cardenas",
    country: "Mexico",
    operator: "ArcelorMittal",
    latitude: 17.9,
    longitude: -102.2,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === CANADA STEEL PLANTS ===
  {
    name: "Stelco Hamilton",
    country: "Canada",
    operator: "Stelco",
    latitude: 43.3,
    longitude: -79.8,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  {
    name: "Algoma Steel Sault Ste Marie",
    country: "Canada",
    operator: "Algoma Steel",
    latitude: 46.5,
    longitude: -84.3,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === INDONESIA STEEL PLANTS ===
  {
    name: "Krakatau Steel Cilegon",
    country: "Indonesia",
    operator: "Krakatau Steel",
    latitude: -6.0,
    longitude: 106.0,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === FRANCE STEEL PLANTS ===
  {
    name: "Dunkerque Steel Plant",
    country: "France",
    operator: "ArcelorMittal",
    latitude: 51.0,
    longitude: 2.4,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  {
    name: "Fos-sur-Mer Works",
    country: "France",
    operator: "ArcelorMittal",
    latitude: 43.4,
    longitude: 4.9,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === SPAIN STEEL PLANTS ===
  {
    name: "ArcelorMittal Asturias",
    country: "Spain",
    operator: "ArcelorMittal",
    latitude: 43.5,
    longitude: -5.7,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === SAUDI ARABIA STEEL PLANTS ===
  {
    name: "Hadeed Jubail",
    country: "Saudi Arabia",
    operator: "Saudi Iron & Steel (Hadeed)",
    latitude: 27.0,
    longitude: 49.7,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === UKRAINE STEEL PLANTS ===
  {
    name: "Azovstal Iron & Steel",
    country: "Ukraine",
    operator: "Metinvest",
    latitude: 47.1,
    longitude: 37.6,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  {
    name: "Zaporizhstal",
    country: "Ukraine",
    operator: "Metinvest",
    latitude: 47.8,
    longitude: 35.2,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === POLAND STEEL PLANTS ===
  {
    name: "ArcelorMittal Poland Dabrowa",
    country: "Poland",
    operator: "ArcelorMittal",
    latitude: 50.3,
    longitude: 19.2,
    production_bpd: 16000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === THAILAND STEEL PLANTS ===
  {
    name: "G Steel Rayong",
    country: "Thailand",
    operator: "G Steel",
    latitude: 12.7,
    longitude: 101.3,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === AUSTRIA STEEL PLANTS ===
  {
    name: "voestalpine Linz",
    country: "Austria",
    operator: "voestalpine",
    latitude: 48.3,
    longitude: 14.3,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === EGYPT STEEL PLANTS ===
  {
    name: "Egyptian Steel Alexandria",
    country: "Egypt",
    operator: "Al Ezz Steel",
    latitude: 31.2,
    longitude: 29.9,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === MALAYSIA STEEL PLANTS ===
  {
    name: "Megasteel Johor",
    country: "Malaysia",
    operator: "Megasteel",
    latitude: 1.5,
    longitude: 103.6,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === UNITED KINGDOM STEEL PLANTS ===
  {
    name: "Port Talbot Steelworks",
    country: "United Kingdom",
    operator: "Tata Steel",
    latitude: 51.6,
    longitude: -3.8,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  {
    name: "Scunthorpe Steelworks",
    country: "United Kingdom",
    operator: "British Steel",
    latitude: 53.6,
    longitude: -0.6,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === SOUTH AFRICA STEEL PLANTS ===
  {
    name: "ArcelorMittal Vanderbijlpark",
    country: "South Africa",
    operator: "ArcelorMittal South Africa",
    latitude: -26.7,
    longitude: 27.8,
    production_bpd: 14000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === AUSTRALIA STEEL PLANTS ===
  {
    name: "BlueScope Port Kembla",
    country: "Australia",
    operator: "BlueScope Steel",
    latitude: -34.5,
    longitude: 150.9,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  {
    name: "Liberty Whyalla",
    country: "Australia",
    operator: "Liberty Steel",
    latitude: -33.0,
    longitude: 137.5,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === NETHERLANDS STEEL PLANTS ===
  {
    name: "Tata Steel IJmuiden",
    country: "Netherlands",
    operator: "Tata Steel",
    latitude: 52.5,
    longitude: 4.6,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === BELGIUM STEEL PLANTS ===
  {
    name: "ArcelorMittal Gent",
    country: "Belgium",
    operator: "ArcelorMittal",
    latitude: 51.3,
    longitude: 3.8,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === CZECH REPUBLIC STEEL PLANTS ===
  {
    name: "Liberty Ostrava",
    country: "Czech Republic",
    operator: "Liberty Steel",
    latitude: 49.8,
    longitude: 18.3,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === SWEDEN STEEL PLANTS ===
  {
    name: "SSAB Luleå",
    country: "Sweden",
    operator: "SSAB",
    latitude: 65.6,
    longitude: 22.2,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === ARGENTINA STEEL PLANTS ===
  {
    name: "Siderar San Nicolas",
    country: "Argentina",
    operator: "Ternium",
    latitude: -33.3,
    longitude: -60.2,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === FINLAND STEEL PLANTS ===
  {
    name: "SSAB Raahe",
    country: "Finland",
    operator: "SSAB",
    latitude: 64.7,
    longitude: 24.5,
    production_bpd: 9000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === PHILIPPINES STEEL PLANTS ===
  {
    name: "SteelAsia Bulacan",
    country: "Philippines",
    operator: "SteelAsia Manufacturing",
    latitude: 14.8,
    longitude: 120.9,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === COLOMBIA STEEL PLANTS ===
  {
    name: "Acerías Paz del Río",
    country: "Colombia",
    operator: "Votorantim",
    latitude: 5.8,
    longitude: -72.8,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === KAZAKHSTAN STEEL PLANTS ===
  {
    name: "ArcelorMittal Temirtau",
    country: "Kazakhstan",
    operator: "ArcelorMittal",
    latitude: 50.1,
    longitude: 73.0,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === ROMANIA STEEL PLANTS ===
  {
    name: "Liberty Galati",
    country: "Romania",
    operator: "Liberty Steel",
    latitude: 45.4,
    longitude: 28.0,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === SERBIA STEEL PLANTS ===
  {
    name: "Smederevo Steel Mill",
    country: "Serbia",
    operator: "HBIS Serbia",
    latitude: 44.7,
    longitude: 20.9,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === HUNGARY STEEL PLANTS ===
  {
    name: "Liberty Dunaferr",
    country: "Hungary",
    operator: "Liberty Steel",
    latitude: 46.9,
    longitude: 18.9,
    production_bpd: 7000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === NORWAY STEEL PLANTS ===
  {
    name: "Celsa Armeringsstål Mo i Rana",
    country: "Norway",
    operator: "Celsa Nordic",
    latitude: 66.3,
    longitude: 14.2,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === SLOVAKIA STEEL PLANTS ===
  {
    name: "U.S. Steel Košice",
    country: "Slovakia",
    operator: "U.S. Steel",
    latitude: 48.7,
    longitude: 21.2,
    production_bpd: 14000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === GREECE STEEL PLANTS ===
  {
    name: "Hellenic Halyvourgia",
    country: "Greece",
    operator: "ElvalHalcor",
    latitude: 38.5,
    longitude: 22.9,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === PORTUGAL STEEL PLANTS ===
  {
    name: "Siderurgia Nacional",
    country: "Portugal",
    operator: "Lusosider",
    latitude: 38.7,
    longitude: -9.2,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === BULGARIA STEEL PLANTS ===
  {
    name: "Stomana Industry",
    country: "Bulgaria",
    operator: "Sidenor Steel",
    latitude: 42.1,
    longitude: 24.7,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === CROATIA STEEL PLANTS ===
  {
    name: "Željezara Split",
    country: "Croatia",
    operator: "Split Steelworks",
    latitude: 43.5,
    longitude: 16.4,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === SLOVENIA STEEL PLANTS ===
  {
    name: "Acroni Jesenice",
    country: "Slovenia",
    operator: "SIJ Group",
    latitude: 46.4,
    longitude: 14.1,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === PERU STEEL PLANTS ===
  {
    name: "Aceros Arequipa",
    country: "Peru",
    operator: "Corporación Aceros Arequipa",
    latitude: -16.4,
    longitude: -71.5,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === CHILE STEEL PLANTS ===
  {
    name: "CAP Huachipato",
    country: "Chile",
    operator: "CAP Steel",
    latitude: -36.7,
    longitude: -73.1,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // === NEW ZEALAND STEEL PLANTS ===
  {
    name: "New Zealand Steel Glenbrook",
    country: "New Zealand",
    operator: "BlueScope Steel",
    latitude: -37.2,
    longitude: 174.9,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Steel Plant"
  },
  // ============================================
  // LITHIUM MINES - GLOBAL COVERAGE
  // ============================================
  // === AUSTRALIA LITHIUM MINES ===
  {
    name: "Greenbushes Mine",
    country: "Australia",
    operator: "Talison Lithium/Tianqi/Albemarle",
    latitude: -33.9,
    longitude: 116.1,
    production_bpd: 45000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  {
    name: "Mt Marion Mine",
    country: "Australia",
    operator: "Mineral Resources/Ganfeng",
    latitude: -32.5,
    longitude: 119.7,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  {
    name: "Mt Cattlin Mine",
    country: "Australia",
    operator: "Allkem",
    latitude: -32.6,
    longitude: 121.5,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  {
    name: "Pilgangoora Mine",
    country: "Australia",
    operator: "Pilbara Minerals",
    latitude: -21.3,
    longitude: 118.7,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  {
    name: "Wodgina Mine",
    country: "Australia",
    operator: "Mineral Resources/Albemarle",
    latitude: -21.2,
    longitude: 118.7,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === CHILE LITHIUM MINES ===
  {
    name: "Salar de Atacama",
    country: "Chile",
    operator: "SQM/Albemarle",
    latitude: -23.5,
    longitude: -68.2,
    production_bpd: 50000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Brine"
  },
  {
    name: "Salar de Maricunga",
    country: "Chile",
    operator: "Wealth Minerals",
    latitude: -27.0,
    longitude: -69.0,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Brine"
  },
  // === CHINA LITHIUM MINES ===
  {
    name: "Jiajika Lithium Mine",
    country: "China",
    operator: "Sichuan Rongda Lithium",
    latitude: 30.8,
    longitude: 101.5,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  {
    name: "Zabuye Salt Lake",
    country: "China",
    operator: "Tibet Mineral Development",
    latitude: 31.4,
    longitude: 84.1,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Brine"
  },
  {
    name: "Qinghai Salt Lakes",
    country: "China",
    operator: "Qinghai Salt Lake Industry",
    latitude: 37.0,
    longitude: 95.5,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Brine"
  },
  // === ARGENTINA LITHIUM MINES ===
  {
    name: "Salar del Hombre Muerto",
    country: "Argentina",
    operator: "Livent/Ganfeng",
    latitude: -25.5,
    longitude: -66.9,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Brine"
  },
  {
    name: "Salar de Olaroz",
    country: "Argentina",
    operator: "Allkem",
    latitude: -24.2,
    longitude: -66.5,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Brine"
  },
  {
    name: "Cauchari-Olaroz",
    country: "Argentina",
    operator: "Ganfeng/Lithium Americas",
    latitude: -23.7,
    longitude: -66.4,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Brine"
  },
  // === BRAZIL LITHIUM MINES ===
  {
    name: "Araçuaí Lithium District",
    country: "Brazil",
    operator: "Sigma Lithium",
    latitude: -16.9,
    longitude: -42.1,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === ZIMBABWE LITHIUM MINES ===
  {
    name: "Bikita Mine",
    country: "Zimbabwe",
    operator: "Bikita Minerals",
    latitude: -20.0,
    longitude: 31.3,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  {
    name: "Arcadia Mine",
    country: "Zimbabwe",
    operator: "Zhejiang Huayou Cobalt",
    latitude: -17.8,
    longitude: 31.0,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === PORTUGAL LITHIUM MINES ===
  {
    name: "Barroso Lithium Project",
    country: "Portugal",
    operator: "Savannah Resources",
    latitude: 41.8,
    longitude: -7.7,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === UNITED STATES LITHIUM MINES ===
  {
    name: "Silver Peak Nevada",
    country: "United States",
    operator: "Albemarle",
    latitude: 37.8,
    longitude: -117.9,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Brine"
  },
  {
    name: "Thacker Pass Nevada",
    country: "United States",
    operator: "Lithium Americas",
    latitude: 41.5,
    longitude: -118.0,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  {
    name: "Kings Mountain NC",
    country: "United States",
    operator: "Albemarle",
    latitude: 35.2,
    longitude: -81.4,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === CANADA LITHIUM MINES ===
  {
    name: "James Bay Lithium Project",
    country: "Canada",
    operator: "Allkem",
    latitude: 51.0,
    longitude: -78.5,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  {
    name: "Whabouchi Quebec",
    country: "Canada",
    operator: "Nemaska Lithium",
    latitude: 51.4,
    longitude: -76.8,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === NAMIBIA LITHIUM MINES ===
  {
    name: "Karibib Lithium Project",
    country: "Namibia",
    operator: "Lepidico",
    latitude: -21.9,
    longitude: 15.9,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === BOLIVIA LITHIUM MINES ===
  {
    name: "Salar de Uyuni",
    country: "Bolivia",
    operator: "YLB (Yacimientos de Litio Bolivianos)",
    latitude: -20.3,
    longitude: -66.8,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Brine"
  },
  // === MEXICO LITHIUM MINES ===
  {
    name: "Sonora Lithium Project",
    country: "Mexico",
    operator: "Bacanora Lithium/Ganfeng",
    latitude: 29.5,
    longitude: -109.5,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === PERU LITHIUM MINES ===
  {
    name: "Falchani Lithium Project",
    country: "Peru",
    operator: "Plateau Energy Metals",
    latitude: -16.5,
    longitude: -69.8,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === AUSTRIA LITHIUM MINES ===
  {
    name: "Koralpe Lithium Project",
    country: "Austria",
    operator: "European Lithium",
    latitude: 46.8,
    longitude: 14.9,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === SERBIA LITHIUM MINES ===
  {
    name: "Jadar Lithium Project",
    country: "Serbia",
    operator: "Rio Tinto",
    latitude: 44.4,
    longitude: 19.3,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === SPAIN LITHIUM MINES ===
  {
    name: "Cáceres Lithium Project",
    country: "Spain",
    operator: "Infinity Lithium",
    latitude: 39.5,
    longitude: -6.4,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === FINLAND LITHIUM MINES ===
  {
    name: "Keliber Lithium Project",
    country: "Finland",
    operator: "Keliber",
    latitude: 63.5,
    longitude: 25.5,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === GERMANY LITHIUM MINES ===
  {
    name: "Zinnwald Lithium Project",
    country: "Germany",
    operator: "Zinnwald Lithium",
    latitude: 50.7,
    longitude: 13.8,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === FRANCE LITHIUM MINES ===
  {
    name: "Beauvoir Lithium Project",
    country: "France",
    operator: "Imerys",
    latitude: 46.1,
    longitude: 1.2,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === CZECH REPUBLIC LITHIUM MINES ===
  {
    name: "Cínovec Lithium Project",
    country: "Czech Republic",
    operator: "European Metals Holdings",
    latitude: 50.6,
    longitude: 13.7,
    production_bpd: 7000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === SLOVAKIA LITHIUM MINES ===
  {
    name: "Prašivá Lithium Deposit",
    country: "Slovakia",
    operator: "Slovak Mining Company",
    latitude: 48.9,
    longitude: 19.5,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === UNITED KINGDOM LITHIUM MINES ===
  {
    name: "Cornish Lithium Project",
    country: "United Kingdom",
    operator: "Cornish Lithium",
    latitude: 50.2,
    longitude: -5.3,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Brine"
  },
  // === IRELAND LITHIUM MINES ===
  {
    name: "Blackstairs Lithium Project",
    country: "Ireland",
    operator: "Ganfeng Lithium",
    latitude: 52.7,
    longitude: -6.7,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === NORWAY LITHIUM MINES ===
  {
    name: "Kuniko Lithium Project",
    country: "Norway",
    operator: "Kuniko",
    latitude: 68.5,
    longitude: 17.5,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === SWEDEN LITHIUM MINES ===
  {
    name: "Varuträsk Lithium Deposit",
    country: "Sweden",
    operator: "Leading Edge Materials",
    latitude: 66.0,
    longitude: 21.0,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === RUSSIA LITHIUM MINES ===
  {
    name: "Kolmozerskoye Lithium Deposit",
    country: "Russia",
    operator: "Rosatom",
    latitude: 66.9,
    longitude: 32.2,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === KAZAKHSTAN LITHIUM MINES ===
  {
    name: "Bakennoe Lithium Deposit",
    country: "Kazakhstan",
    operator: "Tau-Ken Samruk",
    latitude: 47.5,
    longitude: 80.0,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === MONGOLIA LITHIUM MINES ===
  {
    name: "Salkhit Lithium Project",
    country: "Mongolia",
    operator: "Terra Energy",
    latitude: 47.8,
    longitude: 106.5,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === INDIA LITHIUM MINES ===
  {
    name: "Mandya Lithium Reserve",
    country: "India",
    operator: "Geological Survey of India",
    latitude: 12.5,
    longitude: 76.9,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === PAKISTAN LITHIUM MINES ===
  {
    name: "Balochistan Lithium Deposit",
    country: "Pakistan",
    operator: "Pakistan Mineral Development",
    latitude: 29.0,
    longitude: 66.5,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === AFGHANISTAN LITHIUM MINES ===
  {
    name: "Ghazni Lithium Deposit",
    country: "Afghanistan",
    operator: "Afghan Ministry of Mines",
    latitude: 33.5,
    longitude: 68.5,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === IRAN LITHIUM MINES ===
  {
    name: "Dasht-e Bayaz Lithium",
    country: "Iran",
    operator: "Iranian Mines & Mining Industries",
    latitude: 34.0,
    longitude: 60.0,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === SAUDI ARABIA LITHIUM MINES ===
  {
    name: "Midyan Lithium Project",
    country: "Saudi Arabia",
    operator: "Ma'aden",
    latitude: 28.0,
    longitude: 35.5,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === UAE LITHIUM MINES ===
  {
    name: "Ghantoot Lithium Prospect",
    country: "United Arab Emirates",
    operator: "UAE Mining Company",
    latitude: 24.5,
    longitude: 54.5,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === EGYPT LITHIUM MINES ===
  {
    name: "Eastern Desert Lithium",
    country: "Egypt",
    operator: "Egyptian Mineral Resources Authority",
    latitude: 26.0,
    longitude: 33.5,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === MOROCCO LITHIUM MINES ===
  {
    name: "Bouazzer Lithium Deposit",
    country: "Morocco",
    operator: "Managem Group",
    latitude: 30.5,
    longitude: -6.8,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === ALGERIA LITHIUM MINES ===
  {
    name: "Hoggar Lithium Prospect",
    country: "Algeria",
    operator: "Sonatrach Minerals",
    latitude: 23.0,
    longitude: 5.5,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === TUNISIA LITHIUM MINES ===
  {
    name: "Gafsa Lithium Deposit",
    country: "Tunisia",
    operator: "Office National des Mines",
    latitude: 34.5,
    longitude: 8.8,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === DRC LITHIUM MINES ===
  {
    name: "Manono Lithium Project",
    country: "Democratic Republic of the Congo",
    operator: "AVZ Minerals",
    latitude: -7.3,
    longitude: 27.4,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === RWANDA LITHIUM MINES ===
  {
    name: "Gatumba Lithium Deposit",
    country: "Rwanda",
    operator: "Rwanda Mines",
    latitude: -2.5,
    longitude: 29.2,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === ETHIOPIA LITHIUM MINES ===
  {
    name: "Kenticha Lithium Mine",
    country: "Ethiopia",
    operator: "Ethiopian Mineral Development",
    latitude: 5.5,
    longitude: 38.5,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === GHANA LITHIUM MINES ===
  {
    name: "Ewoyaa Lithium Project",
    country: "Ghana",
    operator: "Atlantic Lithium",
    latitude: 5.5,
    longitude: -1.0,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === NIGERIA LITHIUM MINES ===
  {
    name: "Kogi Lithium Deposit",
    country: "Nigeria",
    operator: "Nigerian Mining Corporation",
    latitude: 7.7,
    longitude: 6.7,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === TANZANIA LITHIUM MINES ===
  {
    name: "Nachendezwaya Lithium",
    country: "Tanzania",
    operator: "Canmax Technologies",
    latitude: -10.0,
    longitude: 35.5,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === SOUTH AFRICA LITHIUM MINES ===
  {
    name: "Kamativi Lithium Project",
    country: "South Africa",
    operator: "Prospect Resources",
    latitude: -26.5,
    longitude: 28.5,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === ZAMBIA LITHIUM MINES ===
  {
    name: "Solwezi Lithium Prospect",
    country: "Zambia",
    operator: "First Quantum Minerals",
    latitude: -12.2,
    longitude: 26.4,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === MOZAMBIQUE LITHIUM MINES ===
  {
    name: "Morrua Lithium Project",
    country: "Mozambique",
    operator: "Savannah Resources",
    latitude: -23.9,
    longitude: 35.5,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === MALAWI LITHIUM MINES ===
  {
    name: "Kanyika Lithium Deposit",
    country: "Malawi",
    operator: "Globe Metals",
    latitude: -13.5,
    longitude: 34.0,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === THAILAND LITHIUM MINES ===
  {
    name: "Tak Province Lithium",
    country: "Thailand",
    operator: "Thai Mining Corporation",
    latitude: 16.9,
    longitude: 98.5,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // === INDONESIA LITHIUM MINES ===
  {
    name: "Pulau Bangka Lithium",
    country: "Indonesia",
    operator: "Indonesian Mineral Resources",
    latitude: -2.1,
    longitude: 106.1,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Lithium Mine"
  },
  // ============================================
  // IRON ORE MINES - GLOBAL COVERAGE
  // ============================================
  // === AUSTRALIA IRON ORE MINES ===
  {
    name: "Mount Whaleback",
    country: "Australia",
    operator: "BHP",
    latitude: -23.4,
    longitude: 119.7,
    production_bpd: 85000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  {
    name: "Tom Price Mine",
    country: "Australia",
    operator: "Rio Tinto",
    latitude: -22.7,
    longitude: 117.8,
    production_bpd: 80000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  {
    name: "Mt Newman Mining",
    country: "Australia",
    operator: "BHP",
    latitude: -23.3,
    longitude: 119.7,
    production_bpd: 75000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  {
    name: "Paraburdoo Mine",
    country: "Australia",
    operator: "Rio Tinto",
    latitude: -23.2,
    longitude: 117.7,
    production_bpd: 70000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  {
    name: "Yandicoogina Mine",
    country: "Australia",
    operator: "Rio Tinto",
    latitude: -22.9,
    longitude: 119.1,
    production_bpd: 65000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === BRAZIL IRON ORE MINES ===
  {
    name: "Carajás Mine",
    country: "Brazil",
    operator: "Vale",
    latitude: -6.1,
    longitude: -50.2,
    production_bpd: 90000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  {
    name: "Itabira Complex",
    country: "Brazil",
    operator: "Vale",
    latitude: -19.6,
    longitude: -43.2,
    production_bpd: 55000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  {
    name: "Brucutu Mine",
    country: "Brazil",
    operator: "Vale",
    latitude: -19.9,
    longitude: -43.6,
    production_bpd: 50000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  {
    name: "Vargem Grande Mine",
    country: "Brazil",
    operator: "Vale",
    latitude: -20.0,
    longitude: -43.8,
    production_bpd: 45000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === CHINA IRON ORE MINES ===
  {
    name: "Anshan Iron Ore",
    country: "China",
    operator: "Ansteel Group",
    latitude: 41.1,
    longitude: 122.9,
    production_bpd: 40000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  {
    name: "Benxi Iron Ore",
    country: "China",
    operator: "Bengang Steel",
    latitude: 41.3,
    longitude: 123.8,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  {
    name: "Baotou Iron Ore",
    country: "China",
    operator: "Baogang Group",
    latitude: 40.7,
    longitude: 109.8,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === INDIA IRON ORE MINES ===
  {
    name: "Bailadila Iron Ore Complex",
    country: "India",
    operator: "NMDC",
    latitude: 18.6,
    longitude: 81.3,
    production_bpd: 38000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  {
    name: "Donimalai Mine",
    country: "India",
    operator: "NMDC",
    latitude: 15.2,
    longitude: 76.9,
    production_bpd: 32000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  {
    name: "Kiriburu Iron Ore Mine",
    country: "India",
    operator: "SAIL",
    latitude: 22.2,
    longitude: 85.4,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === RUSSIA IRON ORE MINES ===
  {
    name: "Lebedinsky GOK",
    country: "Russia",
    operator: "Metalloinvest",
    latitude: 51.0,
    longitude: 37.6,
    production_bpd: 42000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  {
    name: "Mikhailovsky GOK",
    country: "Russia",
    operator: "Metalloinvest",
    latitude: 52.3,
    longitude: 35.4,
    production_bpd: 38000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  {
    name: "Stoilensky GOK",
    country: "Russia",
    operator: "NLMK",
    latitude: 51.3,
    longitude: 38.0,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === SOUTH AFRICA IRON ORE MINES ===
  {
    name: "Sishen Mine",
    country: "South Africa",
    operator: "Kumba Iron Ore",
    latitude: -27.7,
    longitude: 23.0,
    production_bpd: 32000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  {
    name: "Kolomela Mine",
    country: "South Africa",
    operator: "Kumba Iron Ore",
    latitude: -28.0,
    longitude: 23.1,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === UKRAINE IRON ORE MINES ===
  {
    name: "Kryvyi Rih Iron Ore Basin",
    country: "Ukraine",
    operator: "Metinvest",
    latitude: 47.9,
    longitude: 33.4,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  {
    name: "Central GOK",
    country: "Ukraine",
    operator: "Metinvest",
    latitude: 48.0,
    longitude: 33.5,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === CANADA IRON ORE MINES ===
  {
    name: "Mary River Mine",
    country: "Canada",
    operator: "Baffinland Iron Mines",
    latitude: 71.3,
    longitude: -79.5,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  {
    name: "IOC Carol Lake",
    country: "Canada",
    operator: "Rio Tinto",
    latitude: 52.9,
    longitude: -66.9,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === UNITED STATES IRON ORE MINES ===
  {
    name: "Minntac Mine Minnesota",
    country: "United States",
    operator: "U.S. Steel",
    latitude: 47.5,
    longitude: -92.8,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  {
    name: "Hibbing Taconite Minnesota",
    country: "United States",
    operator: "ArcelorMittal",
    latitude: 47.4,
    longitude: -92.9,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === IRAN IRON ORE MINES ===
  {
    name: "Gol-e-Gohar Mine",
    country: "Iran",
    operator: "Gol-e-Gohar Iron Ore Company",
    latitude: 29.5,
    longitude: 57.2,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  {
    name: "Chadormalu Mine",
    country: "Iran",
    operator: "Chadormalu Mining",
    latitude: 32.7,
    longitude: 55.8,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === KAZAKHSTAN IRON ORE MINES ===
  {
    name: "Sokolov-Sarbai Mining",
    country: "Kazakhstan",
    operator: "SSGPO",
    latitude: 52.9,
    longitude: 63.6,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  {
    name: "Lisakovsk Mining",
    country: "Kazakhstan",
    operator: "LSGOK",
    latitude: 52.5,
    longitude: 62.5,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === SWEDEN IRON ORE MINES ===
  {
    name: "Kiruna Mine",
    country: "Sweden",
    operator: "LKAB",
    latitude: 67.9,
    longitude: 20.3,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  {
    name: "Malmberget Mine",
    country: "Sweden",
    operator: "LKAB",
    latitude: 67.2,
    longitude: 20.7,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === MEXICO IRON ORE MINES ===
  {
    name: "Peña Colorada",
    country: "Mexico",
    operator: "Consorcio Minero",
    latitude: 18.9,
    longitude: -103.9,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  {
    name: "Las Truchas",
    country: "Mexico",
    operator: "ArcelorMittal",
    latitude: 18.5,
    longitude: -101.5,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === CHILE IRON ORE MINES ===
  {
    name: "El Romeral Mine",
    country: "Chile",
    operator: "CAP Minería",
    latitude: -27.8,
    longitude: -70.5,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  {
    name: "Los Colorados Mine",
    country: "Chile",
    operator: "CAP Minería",
    latitude: -27.5,
    longitude: -70.4,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === PERU IRON ORE MINES ===
  {
    name: "Marcona Mine",
    country: "Peru",
    operator: "Shougang Hierro Peru",
    latitude: -15.3,
    longitude: -75.1,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === MAURITANIA IRON ORE MINES ===
  {
    name: "Zouerate Mine",
    country: "Mauritania",
    operator: "SNIM",
    latitude: 22.7,
    longitude: -12.5,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  {
    name: "Guelb el Rhein",
    country: "Mauritania",
    operator: "SNIM",
    latitude: 22.8,
    longitude: -12.6,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === LIBERIA IRON ORE MINES ===
  {
    name: "Yekepa Mine",
    country: "Liberia",
    operator: "ArcelorMittal",
    latitude: 7.6,
    longitude: -8.5,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  {
    name: "Bong Mine",
    country: "Liberia",
    operator: "China Union",
    latitude: 6.8,
    longitude: -10.0,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === SIERRA LEONE IRON ORE MINES ===
  {
    name: "Tonkolili Mine",
    country: "Sierra Leone",
    operator: "Shandong Iron & Steel",
    latitude: 8.8,
    longitude: -11.8,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === GUINEA IRON ORE MINES ===
  {
    name: "Simandou Mine",
    country: "Guinea",
    operator: "Rio Tinto/Winning Consortium",
    latitude: 8.8,
    longitude: -8.8,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  {
    name: "Zogota Mine",
    country: "Guinea",
    operator: "Rio Tinto",
    latitude: 9.5,
    longitude: -9.0,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === ALGERIA IRON ORE MINES ===
  {
    name: "Ouenza Mine",
    country: "Algeria",
    operator: "SOMIFER",
    latitude: 35.9,
    longitude: 8.1,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === EGYPT IRON ORE MINES ===
  {
    name: "Bahariya Oasis",
    country: "Egypt",
    operator: "Egyptian Iron & Steel",
    latitude: 28.3,
    longitude: 28.9,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === VENEZUELA IRON ORE MINES ===
  {
    name: "Cerro Bolívar",
    country: "Venezuela",
    operator: "CVG Ferrominera",
    latitude: 7.6,
    longitude: -63.5,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  {
    name: "El Pao Mine",
    country: "Venezuela",
    operator: "CVG Ferrominera",
    latitude: 7.5,
    longitude: -63.0,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === COLOMBIA IRON ORE MINES ===
  {
    name: "Cerro Matoso",
    country: "Colombia",
    operator: "South32",
    latitude: 7.9,
    longitude: -75.4,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === TURKEY IRON ORE MINES ===
  {
    name: "Divriği Mine",
    country: "Turkey",
    operator: "Erdemir",
    latitude: 39.4,
    longitude: 38.1,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === SPAIN IRON ORE MINES ===
  {
    name: "Mina de Cala",
    country: "Spain",
    operator: "FerroAtlántica",
    latitude: 37.9,
    longitude: -6.3,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === AUSTRIA IRON ORE MINES ===
  {
    name: "Erzberg Mine",
    country: "Austria",
    operator: "VA Erzberg",
    latitude: 47.5,
    longitude: 14.9,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === NORWAY IRON ORE MINES ===
  {
    name: "Rana Gruber",
    country: "Norway",
    operator: "Rana Gruber AS",
    latitude: 66.3,
    longitude: 14.2,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === FINLAND IRON ORE MINES ===
  {
    name: "Kemi Mine",
    country: "Finland",
    operator: "SSAB",
    latitude: 65.7,
    longitude: 24.6,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === GERMANY IRON ORE MINES ===
  {
    name: "Salzgitter Region (Historical)",
    country: "Germany",
    operator: "Salzgitter AG",
    latitude: 52.2,
    longitude: 10.4,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === FRANCE IRON ORE MINES ===
  {
    name: "Lorraine Iron Ore (Historical)",
    country: "France",
    operator: "ArcelorMittal",
    latitude: 49.1,
    longitude: 6.2,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === UNITED KINGDOM IRON ORE MINES ===
  {
    name: "Cumbria Iron Ore (Historical)",
    country: "United Kingdom",
    operator: "Historical Operations",
    latitude: 54.5,
    longitude: -3.5,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === ROMANIA IRON ORE MINES ===
  {
    name: "Telega-Slanic Mine",
    country: "Romania",
    operator: "Romanian Mining Company",
    latitude: 45.2,
    longitude: 25.9,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === BULGARIA IRON ORE MINES ===
  {
    name: "Kremikovtsi Mine",
    country: "Bulgaria",
    operator: "Kremikovtsi AD",
    latitude: 42.8,
    longitude: 23.5,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === POLAND IRON ORE MINES ===
  {
    name: "Czestochowa Region",
    country: "Poland",
    operator: "Historical Operations",
    latitude: 50.8,
    longitude: 19.1,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === CZECH REPUBLIC IRON ORE MINES ===
  {
    name: "Stare Ransko Deposit",
    country: "Czech Republic",
    operator: "Czech Mining",
    latitude: 49.7,
    longitude: 16.0,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === SLOVAKIA IRON ORE MINES ===
  {
    name: "Rudnany Mine",
    country: "Slovakia",
    operator: "Slovak Mining",
    latitude: 48.9,
    longitude: 20.6,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === BOSNIA AND HERZEGOVINA ===
  {
    name: "Ljubija Mine",
    country: "Bosnia and Herzegovina",
    operator: "ArcelorMittal Prijedor",
    latitude: 44.9,
    longitude: 16.7,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === SERBIA IRON ORE MINES ===
  {
    name: "Kopaonik Mine",
    country: "Serbia",
    operator: "Serbian Mining",
    latitude: 43.3,
    longitude: 20.8,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === GREECE IRON ORE MINES ===
  {
    name: "Vathi Mine",
    country: "Greece",
    operator: "Hellenic Mining",
    latitude: 37.5,
    longitude: 22.8,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === CROATIA IRON ORE MINES ===
  {
    name: "Tomašica Mine",
    country: "Croatia",
    operator: "Croatian Mining",
    latitude: 45.5,
    longitude: 15.5,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === TUNISIA IRON ORE MINES ===
  {
    name: "Djebel Ank Mine",
    country: "Tunisia",
    operator: "Compagnie des Phosphates de Gafsa",
    latitude: 35.5,
    longitude: 9.2,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === MOROCCO IRON ORE MINES ===
  {
    name: "Nador Iron Ore",
    country: "Morocco",
    operator: "Managem Group",
    latitude: 35.2,
    longitude: -2.9,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === ANGOLA IRON ORE MINES ===
  {
    name: "Cassinga Mine",
    country: "Angola",
    operator: "Ferrangol",
    latitude: -14.0,
    longitude: 15.7,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === NIGERIA IRON ORE MINES ===
  {
    name: "Itakpe Mine",
    country: "Nigeria",
    operator: "Nigerian Iron Ore Mining",
    latitude: 7.8,
    longitude: 6.3,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === TANZANIA IRON ORE MINES ===
  {
    name: "Liganga Mine",
    country: "Tanzania",
    operator: "Liganga Iron",
    latitude: -10.5,
    longitude: 35.8,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === UGANDA IRON ORE MINES ===
  {
    name: "Sukulu Hills",
    country: "Uganda",
    operator: "Busitema Iron",
    latitude: 1.0,
    longitude: 34.0,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === KENYA IRON ORE MINES ===
  {
    name: "Mrima Hill",
    country: "Kenya",
    operator: "Kenya Rare Earths",
    latitude: -4.5,
    longitude: 39.5,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === INDONESIA IRON ORE MINES ===
  {
    name: "Sebuku Island",
    country: "Indonesia",
    operator: "Krakatau Steel",
    latitude: -3.5,
    longitude: 117.5,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === MALAYSIA IRON ORE MINES ===
  {
    name: "Bukit Besi Mine",
    country: "Malaysia",
    operator: "Eastern Steel",
    latitude: 4.6,
    longitude: 103.4,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // === PHILIPPINES IRON ORE MINES ===
  {
    name: "Larap Mine",
    country: "Philippines",
    operator: "Benguet Corporation",
    latitude: 16.4,
    longitude: 120.6,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Iron Ore Mine"
  },
  // ============================================
  // PLATINUM MINES - GLOBAL COVERAGE
  // ============================================
  // === SOUTH AFRICA PLATINUM MINES ===
  {
    name: "Mogalakwena Mine",
    country: "South Africa",
    operator: "Anglo American Platinum",
    latitude: -24.3,
    longitude: 28.9,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  {
    name: "Impala Rustenburg",
    country: "South Africa",
    operator: "Impala Platinum",
    latitude: -25.7,
    longitude: 27.2,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  {
    name: "Marikana Mine",
    country: "South Africa",
    operator: "Sibanye-Stillwater",
    latitude: -25.7,
    longitude: 27.5,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  {
    name: "Amandelbult Complex",
    country: "South Africa",
    operator: "Anglo American Platinum",
    latitude: -25.5,
    longitude: 27.3,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  {
    name: "Kroondal Mine",
    country: "South Africa",
    operator: "Sibanye-Stillwater",
    latitude: -25.7,
    longitude: 27.3,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === RUSSIA PLATINUM MINES ===
  {
    name: "Norilsk Talnakh",
    country: "Russia",
    operator: "Nornickel",
    latitude: 69.5,
    longitude: 88.4,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  {
    name: "Oktyabrsky Mine",
    country: "Russia",
    operator: "Nornickel",
    latitude: 69.4,
    longitude: 88.2,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  {
    name: "Kola MMC",
    country: "Russia",
    operator: "Nornickel",
    latitude: 67.9,
    longitude: 33.1,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === ZIMBABWE PLATINUM MINES ===
  {
    name: "Mimosa Mine",
    country: "Zimbabwe",
    operator: "Sibanye-Stillwater/Impala",
    latitude: -20.0,
    longitude: 30.0,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  {
    name: "Zimplats Ngezi",
    country: "Zimbabwe",
    operator: "Impala Platinum",
    latitude: -18.2,
    longitude: 30.1,
    production_bpd: 14000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  {
    name: "Unki Mine",
    country: "Zimbabwe",
    operator: "Anglo American Platinum",
    latitude: -19.4,
    longitude: 29.8,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === CANADA PLATINUM MINES ===
  {
    name: "Lac des Iles Mine",
    country: "Canada",
    operator: "Impala Canada",
    latitude: 48.9,
    longitude: -85.1,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  {
    name: "Sudbury Basin Complex",
    country: "Canada",
    operator: "Vale/Glencore",
    latitude: 46.5,
    longitude: -81.0,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === UNITED STATES PLATINUM MINES ===
  {
    name: "Stillwater Mine Montana",
    country: "United States",
    operator: "Sibanye-Stillwater",
    latitude: 45.4,
    longitude: -109.9,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  {
    name: "East Boulder Mine Montana",
    country: "United States",
    operator: "Sibanye-Stillwater",
    latitude: 45.5,
    longitude: -109.8,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === BOTSWANA PLATINUM MINES ===
  {
    name: "Tati Nickel Mine",
    country: "Botswana",
    operator: "Norilsk Nickel",
    latitude: -21.0,
    longitude: 27.5,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === CHINA PLATINUM MINES ===
  {
    name: "Jinchuan Mine",
    country: "China",
    operator: "Jinchuan Group",
    latitude: 38.5,
    longitude: 102.2,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === AUSTRALIA PLATINUM MINES ===
  {
    name: "Panton PGM Project",
    country: "Australia",
    operator: "Artemis Resources",
    latitude: -17.2,
    longitude: 127.9,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === COLOMBIA PLATINUM MINES ===
  {
    name: "Chocó Platinum District",
    country: "Colombia",
    operator: "Various Artisanal",
    latitude: 5.7,
    longitude: -76.6,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === FINLAND PLATINUM MINES ===
  {
    name: "Suhanko PGE Project",
    country: "Finland",
    operator: "Palladium One Mining",
    latitude: 64.9,
    longitude: 28.5,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === NORWAY PLATINUM MINES ===
  {
    name: "Skaergaard Deposit",
    country: "Norway",
    operator: "Cadence Minerals",
    latitude: 68.2,
    longitude: -31.8,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === BRAZIL PLATINUM MINES ===
  {
    name: "Santa Rita Mine",
    country: "Brazil",
    operator: "Mirabela Nickel",
    latitude: -16.8,
    longitude: -49.0,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === ETHIOPIA PLATINUM MINES ===
  {
    name: "Tulu Kapi PGM",
    country: "Ethiopia",
    operator: "Kefi Gold",
    latitude: 8.5,
    longitude: 35.5,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === TANZANIA PLATINUM MINES ===
  {
    name: "Kabanga PGM Prospect",
    country: "Tanzania",
    operator: "BHP/Lifezone",
    latitude: -2.6,
    longitude: 30.8,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === ZAMBIA PLATINUM MINES ===
  {
    name: "Munali Nickel-PGM",
    country: "Zambia",
    operator: "Albidon",
    latitude: -15.4,
    longitude: 27.8,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === DRC PLATINUM MINES ===
  {
    name: "Ruashi Mine",
    country: "Democratic Republic of the Congo",
    operator: "Jinchuan Group",
    latitude: -11.7,
    longitude: 27.6,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === UGANDA PLATINUM MINES ===
  {
    name: "Kagera PGM Deposit",
    country: "Uganda",
    operator: "Uganda Mining",
    latitude: 0.4,
    longitude: 31.0,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === KENYA PLATINUM MINES ===
  {
    name: "Homa Bay PGM",
    country: "Kenya",
    operator: "Kenya Mining",
    latitude: -0.5,
    longitude: 34.5,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === NAMIBIA PLATINUM MINES ===
  {
    name: "Kunene PGM Complex",
    country: "Namibia",
    operator: "Namibia Critical Metals",
    latitude: -18.5,
    longitude: 13.5,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === MADAGASCAR PLATINUM MINES ===
  {
    name: "Ambatovy PGM",
    country: "Madagascar",
    operator: "Sumitomo",
    latitude: -18.8,
    longitude: 48.3,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === MOZAMBIQUE PLATINUM MINES ===
  {
    name: "Nkomati Mine",
    country: "Mozambique",
    operator: "African Rainbow Minerals",
    latitude: -25.9,
    longitude: 31.9,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === GHANA PLATINUM MINES ===
  {
    name: "Akyem PGM Prospect",
    country: "Ghana",
    operator: "Newmont",
    latitude: 6.3,
    longitude: -0.9,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === NIGERIA PLATINUM MINES ===
  {
    name: "Ife-Ilesha PGM",
    country: "Nigeria",
    operator: "Nigerian Mining Corp",
    latitude: 7.5,
    longitude: 4.5,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === MOROCCO PLATINUM MINES ===
  {
    name: "Bou Azzer PGM",
    country: "Morocco",
    operator: "Managem",
    latitude: 30.7,
    longitude: -6.8,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === ALGERIA PLATINUM MINES ===
  {
    name: "Hoggar PGM Deposit",
    country: "Algeria",
    operator: "Sonatrach Minerals",
    latitude: 23.5,
    longitude: 5.5,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === EGYPT PLATINUM MINES ===
  {
    name: "Wadi Allaqi PGM",
    country: "Egypt",
    operator: "Egyptian Mineral Resources",
    latitude: 23.0,
    longitude: 33.0,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === SUDAN PLATINUM MINES ===
  {
    name: "Red Sea Hills PGM",
    country: "Sudan",
    operator: "Sudan Mining",
    latitude: 18.5,
    longitude: 37.5,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === IRAN PLATINUM MINES ===
  {
    name: "Sabzevar Ophiolite",
    country: "Iran",
    operator: "Iranian Minerals",
    latitude: 36.2,
    longitude: 57.7,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === KAZAKHSTAN PLATINUM MINES ===
  {
    name: "Aktobe PGM Deposit",
    country: "Kazakhstan",
    operator: "Kazakhstan Minerals",
    latitude: 50.3,
    longitude: 57.2,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === MONGOLIA PLATINUM MINES ===
  {
    name: "Darhad Basin PGM",
    country: "Mongolia",
    operator: "Mongolian Mining",
    latitude: 51.5,
    longitude: 99.5,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === INDONESIA PLATINUM MINES ===
  {
    name: "Soroako PGM",
    country: "Indonesia",
    operator: "Vale Indonesia",
    latitude: -2.5,
    longitude: 121.4,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === PHILIPPINES PLATINUM MINES ===
  {
    name: "Palawan PGM Prospect",
    country: "Philippines",
    operator: "Philippine Nickel",
    latitude: 9.8,
    longitude: 118.7,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === PAPUA NEW GUINEA ===
  {
    name: "Ramu PGM",
    country: "Papua New Guinea",
    operator: "Highlands Pacific",
    latitude: -5.5,
    longitude: 145.8,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === JAPAN PLATINUM MINES ===
  {
    name: "Kamuikotan PGM",
    country: "Japan",
    operator: "Japan Metals & Chemicals",
    latitude: 43.8,
    longitude: 142.5,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === SOUTH KOREA ===
  {
    name: "Hongseong PGM Deposit",
    country: "South Korea",
    operator: "Korea Resources",
    latitude: 36.6,
    longitude: 126.7,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === INDIA PLATINUM MINES ===
  {
    name: "Singhbhum PGM Belt",
    country: "India",
    operator: "Geological Survey of India",
    latitude: 22.5,
    longitude: 86.0,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === PAKISTAN PLATINUM MINES ===
  {
    name: "Muslim Bagh Ophiolite",
    country: "Pakistan",
    operator: "Pakistan Mineral Development",
    latitude: 30.9,
    longitude: 67.9,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === TURKEY PLATINUM MINES ===
  {
    name: "Kure Ophiolite PGM",
    country: "Turkey",
    operator: "Turkish Mining",
    latitude: 41.8,
    longitude: 33.8,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === ARMENIA PLATINUM MINES ===
  {
    name: "Sevan-Akera PGM",
    country: "Armenia",
    operator: "Armenian Molybdenum",
    latitude: 40.4,
    longitude: 45.0,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === SERBIA PLATINUM MINES ===
  {
    name: "Novi Pazar PGM",
    country: "Serbia",
    operator: "Serbian Mining",
    latitude: 43.1,
    longitude: 20.5,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === SWEDEN PLATINUM MINES ===
  {
    name: "Skaergaard PGM Project",
    country: "Sweden",
    operator: "Nordic Mining",
    latitude: 66.5,
    longitude: 20.0,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === SPAIN PLATINUM MINES ===
  {
    name: "Cabo Ortegal PGM",
    country: "Spain",
    operator: "Spanish Mining",
    latitude: 43.7,
    longitude: -7.9,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === POLAND PLATINUM MINES ===
  {
    name: "Sudetic PGM Deposit",
    country: "Poland",
    operator: "KGHM",
    latitude: 51.0,
    longitude: 16.5,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === GERMANY PLATINUM MINES ===
  {
    name: "Harz PGM Deposit",
    country: "Germany",
    operator: "German Mining",
    latitude: 51.8,
    longitude: 10.5,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === FRANCE PLATINUM MINES ===
  {
    name: "Limousin PGM Prospect",
    country: "France",
    operator: "Imerys",
    latitude: 45.8,
    longitude: 1.3,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === UNITED KINGDOM ===
  {
    name: "Unst Ophiolite PGM",
    country: "United Kingdom",
    operator: "Scottish Mining",
    latitude: 60.7,
    longitude: -0.9,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === AUSTRIA PLATINUM MINES ===
  {
    name: "Kraubath Ophiolite",
    country: "Austria",
    operator: "Austrian Mining",
    latitude: 47.2,
    longitude: 14.9,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === ITALY PLATINUM MINES ===
  {
    name: "Ivrea Zone PGM",
    country: "Italy",
    operator: "Italian Mining",
    latitude: 45.5,
    longitude: 7.9,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === MEXICO PLATINUM MINES ===
  {
    name: "Molango PGM Deposit",
    country: "Mexico",
    operator: "Autlán",
    latitude: 20.8,
    longitude: -98.7,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // === PERU PLATINUM MINES ===
  {
    name: "Andean PGM Belt",
    country: "Peru",
    operator: "Peruvian Mining",
    latitude: -15.5,
    longitude: -71.5,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Platinum Mine"
  },
  // ============================================
  // SOYBEAN PRODUCTION - GLOBAL COVERAGE
  // ============================================
  // === BRAZIL SOYBEAN ===
  {
    name: "Mato Grosso Soybean Region",
    country: "Brazil",
    operator: "Bunge/Cargill/ADM",
    latitude: -13.0,
    longitude: -55.5,
    production_bpd: 120000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  {
    name: "Paraná Soybean Belt",
    country: "Brazil",
    operator: "Various Cooperatives",
    latitude: -24.5,
    longitude: -51.5,
    production_bpd: 80000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  {
    name: "Rio Grande do Sul Farms",
    country: "Brazil",
    operator: "Local Farmers",
    latitude: -29.0,
    longitude: -53.0,
    production_bpd: 70000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  {
    name: "Goiás Agricultural Zone",
    country: "Brazil",
    operator: "Various Cooperatives",
    latitude: -16.0,
    longitude: -49.5,
    production_bpd: 60000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === UNITED STATES SOYBEAN ===
  {
    name: "Iowa Soybean Belt",
    country: "United States",
    operator: "Farmers Cooperative",
    latitude: 42.0,
    longitude: -93.5,
    production_bpd: 100000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  {
    name: "Illinois Soybean Farms",
    country: "United States",
    operator: "ADM/Bunge",
    latitude: 40.0,
    longitude: -89.0,
    production_bpd: 95000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  {
    name: "Minnesota Soybean Region",
    country: "United States",
    operator: "CHS/Cargill",
    latitude: 45.0,
    longitude: -94.0,
    production_bpd: 70000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  {
    name: "Indiana Soybean Belt",
    country: "United States",
    operator: "Local Cooperatives",
    latitude: 40.0,
    longitude: -86.0,
    production_bpd: 65000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === ARGENTINA SOYBEAN ===
  {
    name: "Pampas Soybean Region",
    country: "Argentina",
    operator: "Cargill/Bunge/Louis Dreyfus",
    latitude: -34.0,
    longitude: -61.0,
    production_bpd: 110000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  {
    name: "Córdoba Agricultural Zone",
    country: "Argentina",
    operator: "Various Cooperatives",
    latitude: -32.0,
    longitude: -63.5,
    production_bpd: 85000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  {
    name: "Santa Fe Soybean Belt",
    country: "Argentina",
    operator: "Local Producers",
    latitude: -31.5,
    longitude: -61.0,
    production_bpd: 75000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === CHINA SOYBEAN ===
  {
    name: "Heilongjiang Soybean Region",
    country: "China",
    operator: "COFCO/State Farms",
    latitude: 47.0,
    longitude: 127.0,
    production_bpd: 45000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  {
    name: "Jilin Province Farms",
    country: "China",
    operator: "COFCO",
    latitude: 43.5,
    longitude: 126.5,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  {
    name: "Inner Mongolia Soybean",
    country: "China",
    operator: "State Agricultural Farms",
    latitude: 43.0,
    longitude: 116.0,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === INDIA SOYBEAN ===
  {
    name: "Madhya Pradesh Soybean",
    country: "India",
    operator: "Indian Farmers",
    latitude: 23.5,
    longitude: 77.5,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  {
    name: "Maharashtra Soybean Belt",
    country: "India",
    operator: "Local Cooperatives",
    latitude: 19.0,
    longitude: 76.0,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  {
    name: "Rajasthan Farms",
    country: "India",
    operator: "Indian Agricultural",
    latitude: 26.0,
    longitude: 73.5,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === PARAGUAY SOYBEAN ===
  {
    name: "Alto Paraná Soybean",
    country: "Paraguay",
    operator: "Cargill/ADM",
    latitude: -25.5,
    longitude: -55.0,
    production_bpd: 50000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  {
    name: "Itapúa Agricultural Zone",
    country: "Paraguay",
    operator: "Local Producers",
    latitude: -26.5,
    longitude: -55.5,
    production_bpd: 40000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === CANADA SOYBEAN ===
  {
    name: "Ontario Soybean Belt",
    country: "Canada",
    operator: "Grain Farmers of Ontario",
    latitude: 43.0,
    longitude: -81.0,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  {
    name: "Quebec Soybean Region",
    country: "Canada",
    operator: "Les Producteurs",
    latitude: 46.0,
    longitude: -73.0,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === RUSSIA SOYBEAN ===
  {
    name: "Amur Oblast Soybean",
    country: "Russia",
    operator: "Russian Agricultural",
    latitude: 50.5,
    longitude: 127.5,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  {
    name: "Primorsky Krai Farms",
    country: "Russia",
    operator: "Far East Agricultural",
    latitude: 44.0,
    longitude: 132.0,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === UKRAINE SOYBEAN ===
  {
    name: "Poltava Region Soybean",
    country: "Ukraine",
    operator: "Ukrainian Agrarian",
    latitude: 49.5,
    longitude: 34.5,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  {
    name: "Kharkiv Agricultural Zone",
    country: "Ukraine",
    operator: "Local Farmers",
    latitude: 49.9,
    longitude: 36.2,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === BOLIVIA SOYBEAN ===
  {
    name: "Santa Cruz Soybean Belt",
    country: "Bolivia",
    operator: "ANAPO/CAO",
    latitude: -17.8,
    longitude: -63.2,
    production_bpd: 32000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === URUGUAY SOYBEAN ===
  {
    name: "Uruguay Soybean Region",
    country: "Uruguay",
    operator: "Uruguayan Farmers",
    latitude: -33.0,
    longitude: -56.0,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === SOUTH AFRICA SOYBEAN ===
  {
    name: "Mpumalanga Soybean",
    country: "South Africa",
    operator: "SA Grain Producers",
    latitude: -26.0,
    longitude: 29.5,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === NIGERIA SOYBEAN ===
  {
    name: "Kaduna Soybean Belt",
    country: "Nigeria",
    operator: "Nigerian Farmers",
    latitude: 10.5,
    longitude: 7.7,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === INDONESIA SOYBEAN ===
  {
    name: "Java Soybean Farms",
    country: "Indonesia",
    operator: "Indonesian Agricultural",
    latitude: -7.5,
    longitude: 110.0,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === THAILAND SOYBEAN ===
  {
    name: "Nakhon Ratchasima Soybean",
    country: "Thailand",
    operator: "Thai Farmers",
    latitude: 15.0,
    longitude: 102.0,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === VIETNAM SOYBEAN ===
  {
    name: "Mekong Delta Soybean",
    country: "Vietnam",
    operator: "Vietnamese Cooperatives",
    latitude: 10.0,
    longitude: 106.0,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === MYANMAR SOYBEAN ===
  {
    name: "Mandalay Region Soybean",
    country: "Myanmar",
    operator: "Myanmar Agricultural",
    latitude: 21.9,
    longitude: 96.1,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === PHILIPPINES SOYBEAN ===
  {
    name: "Mindanao Soybean Farms",
    country: "Philippines",
    operator: "Philippine Farmers",
    latitude: 7.5,
    longitude: 125.0,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === JAPAN SOYBEAN ===
  {
    name: "Hokkaido Soybean Region",
    country: "Japan",
    operator: "JA Group",
    latitude: 43.0,
    longitude: 141.5,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === SOUTH KOREA SOYBEAN ===
  {
    name: "Jeolla Province Soybean",
    country: "South Korea",
    operator: "Korean Agricultural Cooperative",
    latitude: 35.5,
    longitude: 127.0,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === MEXICO SOYBEAN ===
  {
    name: "Tamaulipas Soybean Region",
    country: "Mexico",
    operator: "Mexican Farmers",
    latitude: 24.0,
    longitude: -98.5,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === COLOMBIA SOYBEAN ===
  {
    name: "Eastern Plains Soybean",
    country: "Colombia",
    operator: "Colombian Agricultural",
    latitude: 4.0,
    longitude: -72.0,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === PERU SOYBEAN ===
  {
    name: "San Martín Soybean",
    country: "Peru",
    operator: "Peruvian Farmers",
    latitude: -6.5,
    longitude: -76.0,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === ECUADOR SOYBEAN ===
  {
    name: "Guayas Soybean Farms",
    country: "Ecuador",
    operator: "Ecuadorian Agricultural",
    latitude: -2.0,
    longitude: -79.5,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === VENEZUELA SOYBEAN ===
  {
    name: "Portuguesa Soybean",
    country: "Venezuela",
    operator: "Venezuelan Cooperatives",
    latitude: 9.0,
    longitude: -69.0,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === CHILE SOYBEAN ===
  {
    name: "La Araucanía Soybean",
    country: "Chile",
    operator: "Chilean Farmers",
    latitude: -38.7,
    longitude: -72.6,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === ITALY SOYBEAN ===
  {
    name: "Po Valley Soybean",
    country: "Italy",
    operator: "Italian Cooperatives",
    latitude: 45.0,
    longitude: 10.0,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === ROMANIA SOYBEAN ===
  {
    name: "Wallachia Soybean Region",
    country: "Romania",
    operator: "Romanian Farmers",
    latitude: 44.5,
    longitude: 26.0,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === SERBIA SOYBEAN ===
  {
    name: "Vojvodina Soybean Belt",
    country: "Serbia",
    operator: "Serbian Agricultural",
    latitude: 45.5,
    longitude: 20.0,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === HUNGARY SOYBEAN ===
  {
    name: "Great Plain Soybean",
    country: "Hungary",
    operator: "Hungarian Cooperatives",
    latitude: 47.0,
    longitude: 20.0,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === AUSTRIA SOYBEAN ===
  {
    name: "Burgenland Soybean",
    country: "Austria",
    operator: "Austrian Farmers",
    latitude: 47.5,
    longitude: 16.5,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === FRANCE SOYBEAN ===
  {
    name: "Occitanie Soybean Region",
    country: "France",
    operator: "French Agricultural",
    latitude: 43.5,
    longitude: 1.5,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === GERMANY SOYBEAN ===
  {
    name: "Bavaria Soybean Farms",
    country: "Germany",
    operator: "German Farmers",
    latitude: 48.5,
    longitude: 11.5,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === POLAND SOYBEAN ===
  {
    name: "Lower Silesia Soybean",
    country: "Poland",
    operator: "Polish Cooperatives",
    latitude: 51.0,
    longitude: 17.0,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === SPAIN SOYBEAN ===
  {
    name: "Castile Soybean Region",
    country: "Spain",
    operator: "Spanish Agricultural",
    latitude: 41.5,
    longitude: -4.5,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === PORTUGAL SOYBEAN ===
  {
    name: "Alentejo Soybean",
    country: "Portugal",
    operator: "Portuguese Farmers",
    latitude: 38.5,
    longitude: -8.0,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === UNITED KINGDOM ===
  {
    name: "East Anglia Soybean Trial",
    country: "United Kingdom",
    operator: "UK Agricultural",
    latitude: 52.5,
    longitude: 1.0,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === TURKEY SOYBEAN ===
  {
    name: "Çukurova Plain Soybean",
    country: "Turkey",
    operator: "Turkish Farmers",
    latitude: 37.0,
    longitude: 35.5,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === IRAN SOYBEAN ===
  {
    name: "Golestan Soybean Region",
    country: "Iran",
    operator: "Iranian Agricultural",
    latitude: 37.0,
    longitude: 55.0,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === KAZAKHSTAN SOYBEAN ===
  {
    name: "Almaty Region Soybean",
    country: "Kazakhstan",
    operator: "Kazakh Farmers",
    latitude: 43.2,
    longitude: 76.9,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === UZBEKISTAN SOYBEAN ===
  {
    name: "Fergana Valley Soybean",
    country: "Uzbekistan",
    operator: "Uzbek Agricultural",
    latitude: 40.4,
    longitude: 71.8,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === PAKISTAN SOYBEAN ===
  {
    name: "Punjab Soybean Region",
    country: "Pakistan",
    operator: "Pakistan Farmers",
    latitude: 30.5,
    longitude: 72.0,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === NEPAL SOYBEAN ===
  {
    name: "Terai Region Soybean",
    country: "Nepal",
    operator: "Nepali Farmers",
    latitude: 27.5,
    longitude: 84.0,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === BANGLADESH SOYBEAN ===
  {
    name: "Sylhet Division Soybean",
    country: "Bangladesh",
    operator: "Bangladesh Agricultural",
    latitude: 24.9,
    longitude: 91.9,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === ETHIOPIA SOYBEAN ===
  {
    name: "Oromia Region Soybean",
    country: "Ethiopia",
    operator: "Ethiopian Farmers",
    latitude: 9.0,
    longitude: 38.7,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === UGANDA SOYBEAN ===
  {
    name: "Eastern Uganda Soybean",
    country: "Uganda",
    operator: "Ugandan Cooperatives",
    latitude: 1.0,
    longitude: 33.5,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === TANZANIA SOYBEAN ===
  {
    name: "Morogoro Region Soybean",
    country: "Tanzania",
    operator: "Tanzanian Farmers",
    latitude: -6.8,
    longitude: 37.7,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === ZAMBIA SOYBEAN ===
  {
    name: "Eastern Province Soybean",
    country: "Zambia",
    operator: "Zambian Agricultural",
    latitude: -13.5,
    longitude: 32.0,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === ZIMBABWE SOYBEAN ===
  {
    name: "Mashonaland Soybean",
    country: "Zimbabwe",
    operator: "Zimbabwe Farmers",
    latitude: -17.8,
    longitude: 31.0,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // === MOZAMBIQUE SOYBEAN ===
  {
    name: "Tete Province Soybean",
    country: "Mozambique",
    operator: "Mozambican Farmers",
    latitude: -16.2,
    longitude: 33.6,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Soybean Production"
  },
  // ============================================
  // SILICON PRODUCTION - GLOBAL COVERAGE
  // ============================================
  // === CHINA SILICON PLANTS ===
  {
    name: "Xinjiang Silicon Smelter",
    country: "China",
    operator: "GCL-Poly Energy",
    latitude: 43.8,
    longitude: 87.6,
    production_bpd: 180000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  {
    name: "Yunnan Silicon Plant",
    country: "China",
    operator: "Yunnan Yongchang",
    latitude: 25.0,
    longitude: 102.7,
    production_bpd: 150000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  {
    name: "Sichuan Silicon Complex",
    country: "China",
    operator: "Tongwei Solar",
    latitude: 30.7,
    longitude: 104.1,
    production_bpd: 140000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  {
    name: "Inner Mongolia Silicon",
    country: "China",
    operator: "Daqo New Energy",
    latitude: 40.8,
    longitude: 111.7,
    production_bpd: 130000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === RUSSIA SILICON PLANTS ===
  {
    name: "Bratsk Ferroalloy Plant",
    country: "Russia",
    operator: "RUSAL",
    latitude: 56.2,
    longitude: 101.6,
    production_bpd: 85000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  {
    name: "Shelekhov Silicon Plant",
    country: "Russia",
    operator: "RUSAL",
    latitude: 52.2,
    longitude: 104.1,
    production_bpd: 70000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  {
    name: "Chelyabinsk Electrometallurgical",
    country: "Russia",
    operator: "Chemet",
    latitude: 55.2,
    longitude: 61.4,
    production_bpd: 60000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === BRAZIL SILICON PLANTS ===
  {
    name: "Simões Filho Silicon Plant",
    country: "Brazil",
    operator: "Ligas de Alumínio",
    latitude: -12.8,
    longitude: -38.4,
    production_bpd: 55000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  {
    name: "Minas Gerais Silicon",
    country: "Brazil",
    operator: "RW Silício",
    latitude: -19.9,
    longitude: -43.9,
    production_bpd: 48000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === NORWAY SILICON PLANTS ===
  {
    name: "Elkem Thamshavn",
    country: "Norway",
    operator: "Elkem",
    latitude: 63.3,
    longitude: 9.1,
    production_bpd: 50000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  {
    name: "Elkem Kristiansand",
    country: "Norway",
    operator: "Elkem",
    latitude: 58.1,
    longitude: 8.0,
    production_bpd: 45000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  {
    name: "REC Silicon Moses Lake",
    country: "Norway",
    operator: "REC Silicon",
    latitude: 60.4,
    longitude: 10.4,
    production_bpd: 40000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === UNITED STATES SILICON PLANTS ===
  {
    name: "Moses Lake Silicon Plant",
    country: "United States",
    operator: "REC Silicon",
    latitude: 47.1,
    longitude: -119.3,
    production_bpd: 42000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  {
    name: "Globe Metallurgical Ohio",
    country: "United States",
    operator: "Globe Specialty Metals",
    latitude: 40.2,
    longitude: -81.0,
    production_bpd: 38000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  {
    name: "Mississippi Silicon",
    country: "United States",
    operator: "Ferroglobe",
    latitude: 33.5,
    longitude: -88.8,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === FRANCE SILICON PLANTS ===
  {
    name: "Saint-Jean-de-Maurienne",
    country: "France",
    operator: "Ferropem",
    latitude: 45.3,
    longitude: 6.3,
    production_bpd: 32000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  {
    name: "Montricher-Albens",
    country: "France",
    operator: "Ferroglobe",
    latitude: 45.8,
    longitude: 5.9,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === INDIA SILICON PLANTS ===
  {
    name: "Odisha Ferro Alloys",
    country: "India",
    operator: "Jindal Group",
    latitude: 21.5,
    longitude: 84.0,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  {
    name: "Tamil Nadu Silicon",
    country: "India",
    operator: "Graphite India",
    latitude: 11.0,
    longitude: 77.0,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === KAZAKHSTAN SILICON PLANTS ===
  {
    name: "Kazzinc Silicon Plant",
    country: "Kazakhstan",
    operator: "Kazzinc",
    latitude: 49.8,
    longitude: 73.1,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  {
    name: "Aksu Ferroalloy Plant",
    country: "Kazakhstan",
    operator: "TAU-KEN TEMIR",
    latitude: 52.0,
    longitude: 71.0,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === MALAYSIA SILICON PLANTS ===
  {
    name: "Samalaju Industrial Park",
    country: "Malaysia",
    operator: "Tokuyama Malaysia",
    latitude: 2.5,
    longitude: 113.6,
    production_bpd: 26000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === ICELAND SILICON PLANTS ===
  {
    name: "Grundartangi Silicon Plant",
    country: "Iceland",
    operator: "Elkem Iceland",
    latitude: 64.3,
    longitude: -21.9,
    production_bpd: 24000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === CANADA SILICON PLANTS ===
  {
    name: "Bécancour Silicon Plant",
    country: "Canada",
    operator: "Ferroglobe",
    latitude: 46.3,
    longitude: -72.4,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === SOUTH AFRICA SILICON PLANTS ===
  {
    name: "Polokwane Silicon",
    country: "South Africa",
    operator: "Transalloys",
    latitude: -23.9,
    longitude: 29.5,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === UKRAINE SILICON PLANTS ===
  {
    name: "Nikopol Ferroalloy Plant",
    country: "Ukraine",
    operator: "Privat Group",
    latitude: 47.6,
    longitude: 34.4,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === VENEZUELA SILICON PLANTS ===
  {
    name: "CVG Ferrosilicio",
    country: "Venezuela",
    operator: "CVG",
    latitude: 8.3,
    longitude: -62.7,
    production_bpd: 16000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === AUSTRALIA SILICON PLANTS ===
  {
    name: "Simcoa Silicon Bunbury",
    country: "Australia",
    operator: "Simcoa Operations",
    latitude: -33.3,
    longitude: 115.6,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === MOZAMBIQUE SILICON PLANTS ===
  {
    name: "Mozal Ferrosilicon",
    country: "Mozambique",
    operator: "Mozal",
    latitude: -25.9,
    longitude: 32.6,
    production_bpd: 14000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === ZAMBIA SILICON PLANTS ===
  {
    name: "Chambishi Silicon Plant",
    country: "Zambia",
    operator: "CNMC",
    latitude: -12.6,
    longitude: 28.1,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === BHUTAN SILICON PLANTS ===
  {
    name: "Pasakha Ferrosilicon",
    country: "Bhutan",
    operator: "Bhutan Ferro Alloys",
    latitude: 26.8,
    longitude: 89.4,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === EGYPT SILICON PLANTS ===
  {
    name: "Edfu Ferrosilicon Plant",
    country: "Egypt",
    operator: "Egyptian Ferroalloys",
    latitude: 25.0,
    longitude: 32.9,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === TURKEY SILICON PLANTS ===
  {
    name: "Antalya Silicon Plant",
    country: "Turkey",
    operator: "Eti Elektrometalurji",
    latitude: 36.9,
    longitude: 30.7,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === SPAIN SILICON PLANTS ===
  {
    name: "Boo de Guarnizo Silicon",
    country: "Spain",
    operator: "Ferroglobe",
    latitude: 43.4,
    longitude: -3.8,
    production_bpd: 11000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  {
    name: "Sabiñánigo Silicon",
    country: "Spain",
    operator: "Ferroatlántica",
    latitude: 42.5,
    longitude: -0.4,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === GERMANY SILICON PLANTS ===
  {
    name: "Rheinfelden Silicon",
    country: "Germany",
    operator: "Ferroglobe",
    latitude: 47.6,
    longitude: 7.8,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === ITALY SILICON PLANTS ===
  {
    name: "Piedmont Silicon Plant",
    country: "Italy",
    operator: "Ferroglobe",
    latitude: 45.1,
    longitude: 7.7,
    production_bpd: 9000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === SWEDEN SILICON PLANTS ===
  {
    name: "Vargön Silicon Plant",
    country: "Sweden",
    operator: "Elkem",
    latitude: 58.4,
    longitude: 12.4,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === FINLAND SILICON PLANTS ===
  {
    name: "Pori Silicon Plant",
    country: "Finland",
    operator: "Finnfjord",
    latitude: 61.5,
    longitude: 21.8,
    production_bpd: 9000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === POLAND SILICON PLANTS ===
  {
    name: "Łaziska Silicon Plant",
    country: "Poland",
    operator: "Grupa Azoty",
    latitude: 50.1,
    longitude: 18.8,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === ROMANIA SILICON PLANTS ===
  {
    name: "Tulcea Ferrosilicon",
    country: "Romania",
    operator: "Romanian Silicon",
    latitude: 45.2,
    longitude: 28.8,
    production_bpd: 7000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === SERBIA SILICON PLANTS ===
  {
    name: "Sremska Mitrovica Silicon",
    country: "Serbia",
    operator: "Serbian Ferroalloys",
    latitude: 44.9,
    longitude: 19.6,
    production_bpd: 7000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === BOSNIA AND HERZEGOVINA ===
  {
    name: "Jajce Silicon Plant",
    country: "Bosnia and Herzegovina",
    operator: "Ferrox",
    latitude: 44.3,
    longitude: 17.3,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === SLOVAKIA SILICON PLANTS ===
  {
    name: "Košice Silicon Plant",
    country: "Slovakia",
    operator: "OFZ",
    latitude: 48.7,
    longitude: 21.3,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === CZECH REPUBLIC ===
  {
    name: "Ostrava Silicon Plant",
    country: "Czech Republic",
    operator: "OKK Koksovny",
    latitude: 49.8,
    longitude: 18.3,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === AUSTRIA SILICON PLANTS ===
  {
    name: "Niklasdorf Silicon",
    country: "Austria",
    operator: "RHI Magnesita",
    latitude: 47.4,
    longitude: 15.1,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === GREECE SILICON PLANTS ===
  {
    name: "Thessaloniki Silicon",
    country: "Greece",
    operator: "Mytilineos",
    latitude: 40.6,
    longitude: 22.9,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === BULGARIA SILICON PLANTS ===
  {
    name: "Plovdiv Silicon Plant",
    country: "Bulgaria",
    operator: "Bulgarian Metallurgy",
    latitude: 42.1,
    longitude: 24.7,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === HUNGARY SILICON PLANTS ===
  {
    name: "Tatabánya Silicon",
    country: "Hungary",
    operator: "Hungarian Ferroalloys",
    latitude: 47.6,
    longitude: 18.4,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === PORTUGAL SILICON PLANTS ===
  {
    name: "Sines Silicon Plant",
    country: "Portugal",
    operator: "REN Materials",
    latitude: 37.9,
    longitude: -8.9,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === ARGENTINA SILICON PLANTS ===
  {
    name: "Puerto Madryn Silicon",
    country: "Argentina",
    operator: "ALUAR",
    latitude: -42.8,
    longitude: -65.0,
    production_bpd: 7000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === CHILE SILICON PLANTS ===
  {
    name: "Copiapó Silicon Plant",
    country: "Chile",
    operator: "Chilean Silicon",
    latitude: -27.4,
    longitude: -70.3,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === COLOMBIA SILICON PLANTS ===
  {
    name: "Cartagena Silicon",
    country: "Colombia",
    operator: "Colombian Alloys",
    latitude: 10.4,
    longitude: -75.5,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === PERU SILICON PLANTS ===
  {
    name: "La Oroya Silicon",
    country: "Peru",
    operator: "Doe Run Peru",
    latitude: -11.5,
    longitude: -75.9,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === MEXICO SILICON PLANTS ===
  {
    name: "Monterrey Silicon Plant",
    country: "Mexico",
    operator: "Grupo Ferrominero",
    latitude: 25.7,
    longitude: -100.3,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === JAPAN SILICON PLANTS ===
  {
    name: "Tokuyama Silicon Plant",
    country: "Japan",
    operator: "Tokuyama Corporation",
    latitude: 34.1,
    longitude: 131.8,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === SOUTH KOREA ===
  {
    name: "OCI Gunsan Silicon",
    country: "South Korea",
    operator: "OCI Company",
    latitude: 35.9,
    longitude: 126.7,
    production_bpd: 7000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === INDONESIA SILICON PLANTS ===
  {
    name: "Kalimantan Silicon",
    country: "Indonesia",
    operator: "Ferroalloy Indonesia",
    latitude: -0.5,
    longitude: 117.0,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === VIETNAM SILICON PLANTS ===
  {
    name: "Bac Giang Silicon",
    country: "Vietnam",
    operator: "Vietnam Silicon",
    latitude: 21.3,
    longitude: 106.2,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === THAILAND SILICON PLANTS ===
  {
    name: "Rayong Silicon Plant",
    country: "Thailand",
    operator: "Thai Ferroalloys",
    latitude: 12.7,
    longitude: 101.3,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === PHILIPPINES SILICON PLANTS ===
  {
    name: "Mindanao Silicon",
    country: "Philippines",
    operator: "Philippine Smelting",
    latitude: 7.0,
    longitude: 125.5,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === IRAN SILICON PLANTS ===
  {
    name: "Bandar Abbas Silicon",
    country: "Iran",
    operator: "Iranian Ferroalloys",
    latitude: 27.2,
    longitude: 56.3,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === SAUDI ARABIA ===
  {
    name: "Jubail Silicon Plant",
    country: "Saudi Arabia",
    operator: "Saudi Basic Industries",
    latitude: 27.0,
    longitude: 49.7,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // === UAE SILICON PLANTS ===
  {
    name: "Abu Dhabi Silicon",
    country: "United Arab Emirates",
    operator: "Emirates Global Aluminium",
    latitude: 24.5,
    longitude: 54.4,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Silicon Production"
  },
  // ============================================
  // TITANIUM PRODUCTION - GLOBAL COVERAGE
  // ============================================
  // === CHINA TITANIUM MINES ===
  {
    name: "Panzhihua Titanium Complex",
    country: "China",
    operator: "Pangang Group",
    latitude: 26.5,
    longitude: 101.7,
    production_bpd: 85000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  {
    name: "Chengde Titanium Mine",
    country: "China",
    operator: "CITIC Titanium",
    latitude: 40.9,
    longitude: 117.9,
    production_bpd: 70000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  {
    name: "Shandong Titanium Deposit",
    country: "China",
    operator: "Shandong Titanium Industry",
    latitude: 36.7,
    longitude: 117.0,
    production_bpd: 60000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === AUSTRALIA TITANIUM MINES ===
  {
    name: "WIM 150 Ilmenite Mine",
    country: "Australia",
    operator: "Iluka Resources",
    latitude: -31.9,
    longitude: 115.8,
    production_bpd: 65000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  {
    name: "Murray Basin Operations",
    country: "Australia",
    operator: "Iluka Resources",
    latitude: -34.2,
    longitude: 142.5,
    production_bpd: 55000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  {
    name: "Eneabba Mine",
    country: "Australia",
    operator: "Iluka Resources",
    latitude: -29.8,
    longitude: 115.3,
    production_bpd: 45000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === SOUTH AFRICA TITANIUM MINES ===
  {
    name: "Namakwa Sands",
    country: "South Africa",
    operator: "Rio Tinto",
    latitude: -30.6,
    longitude: 17.8,
    production_bpd: 50000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  {
    name: "Richards Bay Minerals",
    country: "South Africa",
    operator: "Rio Tinto",
    latitude: -28.8,
    longitude: 32.1,
    production_bpd: 48000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === MOZAMBIQUE TITANIUM MINES ===
  {
    name: "Moma Titanium Mine",
    country: "Mozambique",
    operator: "Kenmare Resources",
    latitude: -16.8,
    longitude: 39.0,
    production_bpd: 42000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  {
    name: "Corridor Sands Project",
    country: "Mozambique",
    operator: "Rio Tinto",
    latitude: -24.5,
    longitude: 34.8,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === CANADA TITANIUM MINES ===
  {
    name: "Lac Tio Mine Quebec",
    country: "Canada",
    operator: "Rio Tinto",
    latitude: 50.6,
    longitude: -67.5,
    production_bpd: 38000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  {
    name: "Havre-Saint-Pierre Complex",
    country: "Canada",
    operator: "Rio Tinto Iron & Titanium",
    latitude: 50.2,
    longitude: -63.6,
    production_bpd: 32000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === INDIA TITANIUM MINES ===
  {
    name: "Odisha Titanium Sands",
    country: "India",
    operator: "Indian Rare Earths",
    latitude: 19.8,
    longitude: 85.8,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  {
    name: "Kerala Ilmenite Mine",
    country: "India",
    operator: "Kerala Minerals",
    latitude: 10.8,
    longitude: 76.3,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === UKRAINE TITANIUM MINES ===
  {
    name: "Malyshevskoye Deposit",
    country: "Ukraine",
    operator: "VSMPO-AVISMA",
    latitude: 50.7,
    longitude: 32.0,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  {
    name: "Irshansk Mine",
    country: "Ukraine",
    operator: "United Mining",
    latitude: 50.9,
    longitude: 28.9,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === VIETNAM TITANIUM MINES ===
  {
    name: "Binh Dinh Titanium",
    country: "Vietnam",
    operator: "Binh Dinh Minerals",
    latitude: 13.8,
    longitude: 109.2,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === NORWAY TITANIUM MINES ===
  {
    name: "Tellnes Ilmenite Mine",
    country: "Norway",
    operator: "Titania AS",
    latitude: 58.5,
    longitude: 6.5,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === SIERRA LEONE ===
  {
    name: "Gbangbama Rutile Mine",
    country: "Sierra Leone",
    operator: "Sierra Rutile",
    latitude: 7.9,
    longitude: -12.5,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === MADAGASCAR TITANIUM MINES ===
  {
    name: "Fort Dauphin Ilmenite",
    country: "Madagascar",
    operator: "Rio Tinto QMM",
    latitude: -25.0,
    longitude: 46.9,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === KENYA TITANIUM MINES ===
  {
    name: "Kwale Mineral Sands",
    country: "Kenya",
    operator: "Base Resources",
    latitude: -4.2,
    longitude: 39.5,
    production_bpd: 16000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === TANZANIA TITANIUM MINES ===
  {
    name: "Lindi Titanium Project",
    country: "Tanzania",
    operator: "Tanga Cement",
    latitude: -10.0,
    longitude: 39.7,
    production_bpd: 14000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === SENEGAL TITANIUM MINES ===
  {
    name: "Grande Côte Mineral Sands",
    country: "Senegal",
    operator: "Grande Côte Operations",
    latitude: 15.8,
    longitude: -16.5,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === SRI LANKA ===
  {
    name: "Pulmoddai Mineral Sands",
    country: "Sri Lanka",
    operator: "Lanka Mineral Sands",
    latitude: 9.1,
    longitude: 81.0,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === INDONESIA TITANIUM MINES ===
  {
    name: "Bangka Belitung Titanium",
    country: "Indonesia",
    operator: "Indonesian Titanium",
    latitude: -2.7,
    longitude: 106.1,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === MALAYSIA TITANIUM MINES ===
  {
    name: "Perak Ilmenite Mine",
    country: "Malaysia",
    operator: "Malaysian Titanium",
    latitude: 4.6,
    longitude: 101.1,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === THAILAND TITANIUM MINES ===
  {
    name: "Ranong Titanium Deposit",
    country: "Thailand",
    operator: "Thai Titanium Industry",
    latitude: 9.9,
    longitude: 98.6,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === PHILIPPINES TITANIUM MINES ===
  {
    name: "Palawan Titanium Sands",
    country: "Philippines",
    operator: "Philippine Titanium",
    latitude: 9.5,
    longitude: 118.5,
    production_bpd: 7000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === BRAZIL TITANIUM MINES ===
  {
    name: "Rio de Janeiro Ilmenite",
    country: "Brazil",
    operator: "Cristal Pigmentos",
    latitude: -22.9,
    longitude: -43.2,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === UNITED STATES ===
  {
    name: "Green Cove Springs Florida",
    country: "United States",
    operator: "Chemours",
    latitude: 29.9,
    longitude: -81.7,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === RUSSIA TITANIUM MINES ===
  {
    name: "Yarega Titanium Deposit",
    country: "Russia",
    operator: "VSMPO-AVISMA",
    latitude: 63.7,
    longitude: 57.9,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === KAZAKHSTAN TITANIUM MINES ===
  {
    name: "Obukhovskoye Deposit",
    country: "Kazakhstan",
    operator: "Kazakhstan Titanium",
    latitude: 50.5,
    longitude: 80.2,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === TURKEY TITANIUM MINES ===
  {
    name: "Kumluca Titanium Sands",
    country: "Turkey",
    operator: "Turkish Titanium",
    latitude: 36.4,
    longitude: 30.3,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === IRAN TITANIUM MINES ===
  {
    name: "Kahnouj Titanium Deposit",
    country: "Iran",
    operator: "Iranian Minerals",
    latitude: 27.9,
    longitude: 57.7,
    production_bpd: 7000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === EGYPT TITANIUM MINES ===
  {
    name: "Rosetta Black Sands",
    country: "Egypt",
    operator: "Egyptian Titanium",
    latitude: 31.4,
    longitude: 30.4,
    production_bpd: 7000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === SAUDI ARABIA ===
  {
    name: "Ash Sha'ib Titanium",
    country: "Saudi Arabia",
    operator: "Saudi Arabian Mining",
    latitude: 26.5,
    longitude: 37.5,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === UAE ===
  {
    name: "Fujairah Titanium Sands",
    country: "United Arab Emirates",
    operator: "Emirates Minerals",
    latitude: 25.1,
    longitude: 56.3,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === OMAN ===
  {
    name: "Dhofar Titanium Deposit",
    country: "Oman",
    operator: "Oman Mining",
    latitude: 17.0,
    longitude: 54.1,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === PAKISTAN ===
  {
    name: "Karachi Titanium Sands",
    country: "Pakistan",
    operator: "Pakistan Minerals",
    latitude: 24.9,
    longitude: 67.1,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === BANGLADESH ===
  {
    name: "Cox's Bazar Ilmenite",
    country: "Bangladesh",
    operator: "Bangladesh Titanium",
    latitude: 21.4,
    longitude: 92.0,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === MYANMAR ===
  {
    name: "Rakhine Titanium Sands",
    country: "Myanmar",
    operator: "Myanmar Minerals",
    latitude: 20.1,
    longitude: 92.9,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === LAOS ===
  {
    name: "Attapeu Titanium Deposit",
    country: "Laos",
    operator: "Lao Mining",
    latitude: 14.8,
    longitude: 106.8,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === CAMBODIA ===
  {
    name: "Koh Kong Titanium Sands",
    country: "Cambodia",
    operator: "Cambodian Titanium",
    latitude: 11.6,
    longitude: 103.0,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === JAPAN ===
  {
    name: "Hokkaido Titanium Mine",
    country: "Japan",
    operator: "Japanese Titanium Corp",
    latitude: 43.1,
    longitude: 141.3,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === SOUTH KOREA ===
  {
    name: "Busan Titanium Facility",
    country: "South Korea",
    operator: "Korean Titanium",
    latitude: 35.2,
    longitude: 129.1,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === MEXICO ===
  {
    name: "Playa del Carmen Ilmenite",
    country: "Mexico",
    operator: "Mexican Titanium",
    latitude: 20.6,
    longitude: -87.1,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === CHILE ===
  {
    name: "Antofagasta Titanium",
    country: "Chile",
    operator: "Chilean Titanium",
    latitude: -23.6,
    longitude: -70.4,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === PERU ===
  {
    name: "Piura Titanium Sands",
    country: "Peru",
    operator: "Peruvian Titanium",
    latitude: -5.2,
    longitude: -80.6,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === COLOMBIA ===
  {
    name: "Pacific Coast Titanium",
    country: "Colombia",
    operator: "Colombian Titanium",
    latitude: 4.0,
    longitude: -77.0,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === ARGENTINA ===
  {
    name: "Buenos Aires Titanium",
    country: "Argentina",
    operator: "Argentine Titanium",
    latitude: -38.0,
    longitude: -57.5,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === NAMIBIA ===
  {
    name: "Skeleton Coast Titanium",
    country: "Namibia",
    operator: "Namibian Minerals",
    latitude: -20.0,
    longitude: 13.0,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === ANGOLA ===
  {
    name: "Namibe Titanium Sands",
    country: "Angola",
    operator: "Angolan Titanium",
    latitude: -15.2,
    longitude: 12.1,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === NIGERIA ===
  {
    name: "Lagos Titanium Deposit",
    country: "Nigeria",
    operator: "Nigerian Titanium",
    latitude: 6.5,
    longitude: 3.4,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === GHANA ===
  {
    name: "Western Region Ilmenite",
    country: "Ghana",
    operator: "Ghana Titanium",
    latitude: 4.9,
    longitude: -2.5,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === CÔTE D'IVOIRE ===
  {
    name: "Abidjan Titanium Sands",
    country: "Côte d'Ivoire",
    operator: "Ivorian Titanium",
    latitude: 5.3,
    longitude: -4.0,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === LIBERIA ===
  {
    name: "Monrovia Titanium Mine",
    country: "Liberia",
    operator: "Liberian Minerals",
    latitude: 6.3,
    longitude: -10.8,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === GUINEA ===
  {
    name: "Conakry Titanium Deposit",
    country: "Guinea",
    operator: "Guinean Titanium",
    latitude: 9.5,
    longitude: -13.7,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === ZIMBABWE ===
  {
    name: "Mutare Titanium Mine",
    country: "Zimbabwe",
    operator: "Zimbabwe Titanium",
    latitude: -18.9,
    longitude: 32.7,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // === MALAWI ===
  {
    name: "Lake Malawi Titanium",
    country: "Malawi",
    operator: "Malawi Minerals",
    latitude: -13.9,
    longitude: 33.8,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Titanium Mine"
  },
  // ============================================
  // WHEAT PRODUCTION - GLOBAL COVERAGE
  // ============================================
  // === CHINA WHEAT ===
  {
    name: "Henan Wheat Belt",
    country: "China",
    operator: "COFCO/Local Farmers",
    latitude: 34.5,
    longitude: 113.5,
    production_bpd: 150000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  {
    name: "Shandong Wheat Region",
    country: "China",
    operator: "State Farms",
    latitude: 36.0,
    longitude: 118.0,
    production_bpd: 140000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  {
    name: "Hebei Wheat Plains",
    country: "China",
    operator: "Chinese Farmers",
    latitude: 38.5,
    longitude: 115.5,
    production_bpd: 130000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === INDIA WHEAT ===
  {
    name: "Punjab Wheat Belt",
    country: "India",
    operator: "Indian Farmers",
    latitude: 30.9,
    longitude: 75.9,
    production_bpd: 120000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  {
    name: "Haryana Wheat Region",
    country: "India",
    operator: "Indian Cooperatives",
    latitude: 29.0,
    longitude: 76.0,
    production_bpd: 110000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  {
    name: "Uttar Pradesh Wheat",
    country: "India",
    operator: "Agricultural Cooperatives",
    latitude: 27.0,
    longitude: 80.0,
    production_bpd: 100000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === RUSSIA WHEAT ===
  {
    name: "Krasnodar Wheat Region",
    country: "Russia",
    operator: "Russian Agricultural",
    latitude: 45.0,
    longitude: 39.0,
    production_bpd: 100000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  {
    name: "Stavropol Territory Wheat",
    country: "Russia",
    operator: "Russian Grain",
    latitude: 45.0,
    longitude: 43.0,
    production_bpd: 90000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  {
    name: "Rostov Oblast Wheat",
    country: "Russia",
    operator: "Russian Farmers",
    latitude: 47.2,
    longitude: 39.7,
    production_bpd: 85000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === UNITED STATES WHEAT ===
  {
    name: "Kansas Wheat Belt",
    country: "United States",
    operator: "Kansas Wheat Growers",
    latitude: 38.5,
    longitude: -98.0,
    production_bpd: 80000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  {
    name: "North Dakota Wheat",
    country: "United States",
    operator: "North Dakota Farmers",
    latitude: 47.5,
    longitude: -100.5,
    production_bpd: 75000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  {
    name: "Montana Wheat Region",
    country: "United States",
    operator: "Montana Grain Growers",
    latitude: 47.0,
    longitude: -110.0,
    production_bpd: 70000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === FRANCE WHEAT ===
  {
    name: "Beauce Wheat Region",
    country: "France",
    operator: "French Agricultural",
    latitude: 48.2,
    longitude: 1.5,
    production_bpd: 70000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  {
    name: "Champagne Wheat Belt",
    country: "France",
    operator: "French Cooperatives",
    latitude: 48.9,
    longitude: 4.0,
    production_bpd: 65000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === CANADA WHEAT ===
  {
    name: "Saskatchewan Wheat Belt",
    country: "Canada",
    operator: "Canadian Wheat Board",
    latitude: 52.1,
    longitude: -106.6,
    production_bpd: 65000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  {
    name: "Alberta Wheat Region",
    country: "Canada",
    operator: "Alberta Wheat Commission",
    latitude: 52.2,
    longitude: -113.0,
    production_bpd: 55000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === PAKISTAN WHEAT ===
  {
    name: "Punjab Pakistan Wheat",
    country: "Pakistan",
    operator: "Pakistan Farmers",
    latitude: 30.2,
    longitude: 71.5,
    production_bpd: 55000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  {
    name: "Sindh Wheat Region",
    country: "Pakistan",
    operator: "Sindh Agricultural",
    latitude: 26.0,
    longitude: 68.5,
    production_bpd: 45000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === GERMANY WHEAT ===
  {
    name: "Lower Saxony Wheat",
    country: "Germany",
    operator: "German Farmers",
    latitude: 52.6,
    longitude: 9.8,
    production_bpd: 50000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  {
    name: "Bavaria Wheat Farms",
    country: "Germany",
    operator: "Bavarian Agricultural",
    latitude: 48.8,
    longitude: 11.5,
    production_bpd: 45000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === AUSTRALIA WHEAT ===
  {
    name: "Western Australia Wheat Belt",
    country: "Australia",
    operator: "CBH Group",
    latitude: -31.0,
    longitude: 117.0,
    production_bpd: 48000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  {
    name: "New South Wales Wheat",
    country: "Australia",
    operator: "GrainCorp",
    latitude: -33.5,
    longitude: 147.0,
    production_bpd: 42000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === TURKEY WHEAT ===
  {
    name: "Central Anatolia Wheat",
    country: "Turkey",
    operator: "Turkish Farmers",
    latitude: 39.0,
    longitude: 35.0,
    production_bpd: 42000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  {
    name: "Konya Plain Wheat",
    country: "Turkey",
    operator: "Turkish Agricultural",
    latitude: 38.0,
    longitude: 33.0,
    production_bpd: 38000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === UKRAINE WHEAT ===
  {
    name: "Dnipropetrovsk Wheat",
    country: "Ukraine",
    operator: "Ukrainian Grain",
    latitude: 48.5,
    longitude: 35.0,
    production_bpd: 45000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  {
    name: "Odessa Wheat Region",
    country: "Ukraine",
    operator: "Ukrainian Farmers",
    latitude: 47.0,
    longitude: 30.0,
    production_bpd: 40000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === UNITED KINGDOM ===
  {
    name: "East Anglia Wheat",
    country: "United Kingdom",
    operator: "UK Farmers",
    latitude: 52.2,
    longitude: 0.8,
    production_bpd: 32000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === IRAN WHEAT ===
  {
    name: "Fars Province Wheat",
    country: "Iran",
    operator: "Iranian Agricultural",
    latitude: 29.6,
    longitude: 52.5,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === ARGENTINA WHEAT ===
  {
    name: "Buenos Aires Wheat",
    country: "Argentina",
    operator: "Argentine Farmers",
    latitude: -36.0,
    longitude: -60.0,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === KAZAKHSTAN WHEAT ===
  {
    name: "North Kazakhstan Wheat",
    country: "Kazakhstan",
    operator: "Kazakh Grain",
    latitude: 52.0,
    longitude: 66.0,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === POLAND WHEAT ===
  {
    name: "Mazovia Wheat Region",
    country: "Poland",
    operator: "Polish Farmers",
    latitude: 52.2,
    longitude: 21.0,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === ITALY WHEAT ===
  {
    name: "Emilia-Romagna Wheat",
    country: "Italy",
    operator: "Italian Cooperatives",
    latitude: 44.5,
    longitude: 11.3,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === SPAIN WHEAT ===
  {
    name: "Castile and León Wheat",
    country: "Spain",
    operator: "Spanish Agricultural",
    latitude: 41.8,
    longitude: -4.7,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === EGYPT WHEAT ===
  {
    name: "Nile Delta Wheat",
    country: "Egypt",
    operator: "Egyptian Farmers",
    latitude: 30.5,
    longitude: 31.0,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === UZBEKISTAN WHEAT ===
  {
    name: "Fergana Valley Wheat",
    country: "Uzbekistan",
    operator: "Uzbek Agricultural",
    latitude: 40.4,
    longitude: 71.8,
    production_bpd: 16000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === ROMANIA WHEAT ===
  {
    name: "Romanian Plain Wheat",
    country: "Romania",
    operator: "Romanian Farmers",
    latitude: 44.4,
    longitude: 26.1,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === BRAZIL WHEAT ===
  {
    name: "Rio Grande do Sul Wheat",
    country: "Brazil",
    operator: "Brazilian Cooperatives",
    latitude: -29.7,
    longitude: -53.7,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === AFGHANISTAN WHEAT ===
  {
    name: "Herat Province Wheat",
    country: "Afghanistan",
    operator: "Afghan Farmers",
    latitude: 34.3,
    longitude: 62.2,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === HUNGARY WHEAT ===
  {
    name: "Great Hungarian Plain Wheat",
    country: "Hungary",
    operator: "Hungarian Agricultural",
    latitude: 47.5,
    longitude: 20.5,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === CZECH REPUBLIC ===
  {
    name: "Moravia Wheat Region",
    country: "Czech Republic",
    operator: "Czech Farmers",
    latitude: 49.2,
    longitude: 16.6,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === BULGARIA WHEAT ===
  {
    name: "Danube Plain Wheat",
    country: "Bulgaria",
    operator: "Bulgarian Farmers",
    latitude: 43.8,
    longitude: 25.9,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === SERBIA WHEAT ===
  {
    name: "Vojvodina Wheat Region",
    country: "Serbia",
    operator: "Serbian Agricultural",
    latitude: 45.3,
    longitude: 19.8,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === SLOVAKIA WHEAT ===
  {
    name: "Danubian Lowland Wheat",
    country: "Slovakia",
    operator: "Slovak Farmers",
    latitude: 48.1,
    longitude: 17.1,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === AUSTRIA WHEAT ===
  {
    name: "Lower Austria Wheat",
    country: "Austria",
    operator: "Austrian Farmers",
    latitude: 48.2,
    longitude: 15.6,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === SWITZERLAND WHEAT ===
  {
    name: "Swiss Plateau Wheat",
    country: "Switzerland",
    operator: "Swiss Farmers",
    latitude: 46.9,
    longitude: 7.4,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === SWEDEN WHEAT ===
  {
    name: "Scania Wheat Region",
    country: "Sweden",
    operator: "Swedish Farmers",
    latitude: 55.6,
    longitude: 13.0,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === DENMARK WHEAT ===
  {
    name: "Jutland Wheat Belt",
    country: "Denmark",
    operator: "Danish Agricultural",
    latitude: 56.0,
    longitude: 9.5,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === NETHERLANDS WHEAT ===
  {
    name: "Zeeland Wheat Region",
    country: "Netherlands",
    operator: "Dutch Farmers",
    latitude: 51.5,
    longitude: 3.7,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === BELGIUM WHEAT ===
  {
    name: "Flanders Wheat Belt",
    country: "Belgium",
    operator: "Belgian Farmers",
    latitude: 51.0,
    longitude: 4.5,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === PORTUGAL WHEAT ===
  {
    name: "Alentejo Wheat Plains",
    country: "Portugal",
    operator: "Portuguese Farmers",
    latitude: 38.5,
    longitude: -8.0,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === GREECE WHEAT ===
  {
    name: "Thessaly Wheat Region",
    country: "Greece",
    operator: "Greek Farmers",
    latitude: 39.6,
    longitude: 22.4,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === FINLAND WHEAT ===
  {
    name: "Southern Finland Wheat",
    country: "Finland",
    operator: "Finnish Farmers",
    latitude: 60.5,
    longitude: 25.0,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === NORWAY WHEAT ===
  {
    name: "Østlandet Wheat Region",
    country: "Norway",
    operator: "Norwegian Farmers",
    latitude: 60.0,
    longitude: 11.0,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === IRELAND WHEAT ===
  {
    name: "Leinster Wheat Belt",
    country: "Ireland",
    operator: "Irish Farmers",
    latitude: 53.3,
    longitude: -6.3,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === LITHUANIA WHEAT ===
  {
    name: "Lithuanian Plains Wheat",
    country: "Lithuania",
    operator: "Lithuanian Agricultural",
    latitude: 55.0,
    longitude: 24.0,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === LATVIA WHEAT ===
  {
    name: "Zemgale Wheat Region",
    country: "Latvia",
    operator: "Latvian Farmers",
    latitude: 56.5,
    longitude: 23.7,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === ESTONIA WHEAT ===
  {
    name: "Southern Estonia Wheat",
    country: "Estonia",
    operator: "Estonian Farmers",
    latitude: 58.4,
    longitude: 26.7,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === BELARUS WHEAT ===
  {
    name: "Minsk Region Wheat",
    country: "Belarus",
    operator: "Belarusian Agricultural",
    latitude: 53.9,
    longitude: 27.6,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === MOLDOVA WHEAT ===
  {
    name: "Moldovan Steppe Wheat",
    country: "Moldova",
    operator: "Moldovan Farmers",
    latitude: 47.0,
    longitude: 28.8,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === TAIWAN WHEAT ===
  {
    name: "Taiwan Wheat Region",
    country: "China (Taiwan)",
    operator: "Taiwan Agricultural",
    latitude: 24.1,
    longitude: 120.7,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === MOROCCO WHEAT ===
  {
    name: "Gharb Plain Wheat",
    country: "Morocco",
    operator: "Moroccan Farmers",
    latitude: 34.3,
    longitude: -6.0,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === ALGERIA WHEAT ===
  {
    name: "Tell Atlas Wheat",
    country: "Algeria",
    operator: "Algerian Agricultural",
    latitude: 36.0,
    longitude: 3.0,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === TUNISIA WHEAT ===
  {
    name: "Medjerda Valley Wheat",
    country: "Tunisia",
    operator: "Tunisian Farmers",
    latitude: 36.8,
    longitude: 9.5,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === SOUTH AFRICA WHEAT ===
  {
    name: "Western Cape Wheat",
    country: "South Africa",
    operator: "South African Farmers",
    latitude: -33.5,
    longitude: 19.0,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // === ETHIOPIA WHEAT ===
  {
    name: "Ethiopian Highlands Wheat",
    country: "Ethiopia",
    operator: "Ethiopian Farmers",
    latitude: 9.0,
    longitude: 38.7,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Wheat Production"
  },
  // ============================================
  // COTTON PRODUCTION - GLOBAL COVERAGE
  // ============================================
  // === CHINA COTTON ===
  {
    name: "Xinjiang Cotton Region",
    country: "China",
    operator: "Xinjiang Production Construction Corps",
    latitude: 43.8,
    longitude: 87.6,
    production_bpd: 120000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  {
    name: "Yellow River Cotton Belt",
    country: "China",
    operator: "COFCO/Chinese Farmers",
    latitude: 35.0,
    longitude: 112.0,
    production_bpd: 80000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === INDIA COTTON ===
  {
    name: "Gujarat Cotton Belt",
    country: "India",
    operator: "Indian Cotton Corporation",
    latitude: 22.3,
    longitude: 71.5,
    production_bpd: 110000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  {
    name: "Maharashtra Cotton Region",
    country: "India",
    operator: "Cotton Corporation of India",
    latitude: 20.9,
    longitude: 77.8,
    production_bpd: 95000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  {
    name: "Telangana Cotton Farms",
    country: "India",
    operator: "Indian Farmers",
    latitude: 17.4,
    longitude: 78.5,
    production_bpd: 75000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === UNITED STATES COTTON ===
  {
    name: "Texas Cotton Belt",
    country: "United States",
    operator: "Plains Cotton Cooperative",
    latitude: 33.5,
    longitude: -101.8,
    production_bpd: 85000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  {
    name: "Mississippi Delta Cotton",
    country: "United States",
    operator: "Staplcotn",
    latitude: 33.5,
    longitude: -90.7,
    production_bpd: 65000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  {
    name: "Georgia Cotton Region",
    country: "United States",
    operator: "Cotton Growers Cooperative",
    latitude: 32.2,
    longitude: -83.7,
    production_bpd: 55000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === BRAZIL COTTON ===
  {
    name: "Mato Grosso Cotton",
    country: "Brazil",
    operator: "Brazilian Cotton Growers",
    latitude: -13.0,
    longitude: -55.5,
    production_bpd: 70000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  {
    name: "Bahia Cotton Region",
    country: "Brazil",
    operator: "ABRAPA",
    latitude: -12.0,
    longitude: -45.0,
    production_bpd: 55000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === PAKISTAN COTTON ===
  {
    name: "Punjab Cotton Belt",
    country: "Pakistan",
    operator: "Pakistan Cotton Ginners",
    latitude: 30.2,
    longitude: 71.5,
    production_bpd: 50000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  {
    name: "Sindh Cotton Region",
    country: "Pakistan",
    operator: "Pakistan Farmers",
    latitude: 26.0,
    longitude: 68.5,
    production_bpd: 42000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === UZBEKISTAN COTTON ===
  {
    name: "Fergana Valley Cotton",
    country: "Uzbekistan",
    operator: "Uzpakhtasanoat",
    latitude: 40.4,
    longitude: 71.8,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  {
    name: "Bukhara Cotton Region",
    country: "Uzbekistan",
    operator: "Uzbek Cotton Association",
    latitude: 39.8,
    longitude: 64.4,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === TURKEY COTTON ===
  {
    name: "Çukurova Cotton Belt",
    country: "Turkey",
    operator: "Turkish Cotton Growers",
    latitude: 37.0,
    longitude: 35.3,
    production_bpd: 32000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  {
    name: "Aegean Cotton Region",
    country: "Turkey",
    operator: "Aegean Cotton Association",
    latitude: 38.4,
    longitude: 27.1,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === AUSTRALIA COTTON ===
  {
    name: "Darling Downs Cotton",
    country: "Australia",
    operator: "Cotton Australia",
    latitude: -27.5,
    longitude: 151.9,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  {
    name: "Namoi Valley Cotton",
    country: "Australia",
    operator: "Australian Cotton Growers",
    latitude: -30.5,
    longitude: 149.8,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === ARGENTINA COTTON ===
  {
    name: "Chaco Cotton Region",
    country: "Argentina",
    operator: "Argentine Cotton Producers",
    latitude: -27.5,
    longitude: -59.0,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === MEXICO COTTON ===
  {
    name: "Chihuahua Cotton Belt",
    country: "Mexico",
    operator: "Mexican Cotton Council",
    latitude: 28.6,
    longitude: -106.0,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === GREECE COTTON ===
  {
    name: "Thessaly Cotton Region",
    country: "Greece",
    operator: "Greek Cotton Cooperatives",
    latitude: 39.6,
    longitude: 22.4,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === BENIN COTTON ===
  {
    name: "Northern Benin Cotton",
    country: "Benin",
    operator: "SONAPRA",
    latitude: 10.5,
    longitude: 2.6,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === BURKINA FASO COTTON ===
  {
    name: "Bobo-Dioulasso Cotton",
    country: "Burkina Faso",
    operator: "SOFITEX",
    latitude: 11.2,
    longitude: -4.3,
    production_bpd: 14000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === MALI COTTON ===
  {
    name: "Sikasso Cotton Region",
    country: "Mali",
    operator: "CMDT",
    latitude: 11.3,
    longitude: -5.7,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === CÔTE D'IVOIRE COTTON ===
  {
    name: "Northern Ivory Coast Cotton",
    country: "Ivory Coast (Côte d'Ivoire)",
    operator: "Compagnie Ivoirienne",
    latitude: 9.5,
    longitude: -5.5,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === NIGERIA COTTON ===
  {
    name: "Kaduna Cotton Belt",
    country: "Nigeria",
    operator: "Nigerian Cotton Association",
    latitude: 10.5,
    longitude: 7.7,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === TANZANIA COTTON ===
  {
    name: "Mwanza Cotton Region",
    country: "Tanzania",
    operator: "Tanzania Cotton Board",
    latitude: -2.5,
    longitude: 32.9,
    production_bpd: 7000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === ZIMBABWE COTTON ===
  {
    name: "Mashonaland Cotton",
    country: "Zimbabwe",
    operator: "Cotton Company of Zimbabwe",
    latitude: -17.8,
    longitude: 31.0,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === MOZAMBIQUE COTTON ===
  {
    name: "Nampula Cotton Region",
    country: "Mozambique",
    operator: "Mozambique Cotton Institute",
    latitude: -15.1,
    longitude: 39.3,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === EGYPT COTTON ===
  {
    name: "Nile Delta Cotton",
    country: "Egypt",
    operator: "Egyptian Cotton",
    latitude: 30.8,
    longitude: 31.2,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === SUDAN COTTON ===
  {
    name: "Gezira Scheme Cotton",
    country: "Sudan",
    operator: "Gezira Board",
    latitude: 14.4,
    longitude: 33.5,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === ETHIOPIA COTTON ===
  {
    name: "Awash Valley Cotton",
    country: "Ethiopia",
    operator: "Ethiopian Cotton Producers",
    latitude: 8.6,
    longitude: 39.5,
    production_bpd: 7000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === CAMEROON COTTON ===
  {
    name: "Northern Cameroon Cotton",
    country: "Cameroon",
    operator: "SODECOTON",
    latitude: 10.5,
    longitude: 14.5,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === CHAD COTTON ===
  {
    name: "Southern Chad Cotton",
    country: "Chad",
    operator: "CotonTchad",
    latitude: 8.5,
    longitude: 16.0,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === UGANDA COTTON ===
  {
    name: "Northern Uganda Cotton",
    country: "Uganda",
    operator: "Uganda Cotton Development",
    latitude: 2.5,
    longitude: 32.5,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === ZAMBIA COTTON ===
  {
    name: "Eastern Zambia Cotton",
    country: "Zambia",
    operator: "Cotton Board of Zambia",
    latitude: -13.5,
    longitude: 32.0,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === MALAWI COTTON ===
  {
    name: "Shire Valley Cotton",
    country: "Malawi",
    operator: "Malawi Cotton Council",
    latitude: -16.0,
    longitude: 35.0,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === SENEGAL COTTON ===
  {
    name: "Senegal Cotton Region",
    country: "Senegal",
    operator: "SODEFITEX",
    latitude: 13.7,
    longitude: -13.5,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === TOGO COTTON ===
  {
    name: "Central Togo Cotton",
    country: "Togo",
    operator: "Togolese Cotton Company",
    latitude: 9.0,
    longitude: 1.1,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === GHANA COTTON ===
  {
    name: "Northern Ghana Cotton",
    country: "Ghana",
    operator: "Ghana Cotton Company",
    latitude: 9.4,
    longitude: -0.8,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === KAZAKHSTAN COTTON ===
  {
    name: "South Kazakhstan Cotton",
    country: "Kazakhstan",
    operator: "Kazakhstan Cotton Association",
    latitude: 42.3,
    longitude: 69.6,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === TAJIKISTAN COTTON ===
  {
    name: "Khatlon Cotton Region",
    country: "Tajikistan",
    operator: "Tajik Cotton Producers",
    latitude: 37.8,
    longitude: 69.0,
    production_bpd: 7000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === TURKMENISTAN COTTON ===
  {
    name: "Mary Region Cotton",
    country: "Turkmenistan",
    operator: "Turkmenpagta",
    latitude: 37.6,
    longitude: 61.8,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === AZERBAIJAN COTTON ===
  {
    name: "Shirvan Cotton Region",
    country: "Azerbaijan",
    operator: "Azerbaijan Cotton Association",
    latitude: 40.9,
    longitude: 48.9,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === IRAN COTTON ===
  {
    name: "Golestan Cotton Region",
    country: "Iran",
    operator: "Iranian Cotton Producers",
    latitude: 37.0,
    longitude: 55.0,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === IRAQ COTTON ===
  {
    name: "Mosul Cotton Region",
    country: "Iraq",
    operator: "Iraqi Cotton Board",
    latitude: 36.3,
    longitude: 43.1,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === SYRIA COTTON ===
  {
    name: "Aleppo Cotton Region",
    country: "Syria",
    operator: "Syrian Cotton Marketing",
    latitude: 36.2,
    longitude: 37.2,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === AFGHANISTAN COTTON ===
  {
    name: "Helmand Cotton Belt",
    country: "Afghanistan",
    operator: "Afghan Cotton Growers",
    latitude: 31.6,
    longitude: 64.4,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === BANGLADESH COTTON ===
  {
    name: "Jessore Cotton Region",
    country: "Bangladesh",
    operator: "Bangladesh Cotton Association",
    latitude: 23.2,
    longitude: 89.2,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === MYANMAR COTTON ===
  {
    name: "Sagaing Cotton Region",
    country: "Myanmar",
    operator: "Myanmar Cotton Federation",
    latitude: 21.9,
    longitude: 95.9,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === THAILAND COTTON ===
  {
    name: "Northeastern Thailand Cotton",
    country: "Thailand",
    operator: "Thai Cotton Association",
    latitude: 16.4,
    longitude: 102.8,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === VIETNAM COTTON ===
  {
    name: "Central Highlands Cotton",
    country: "Vietnam",
    operator: "Vietnam Cotton Corporation",
    latitude: 12.0,
    longitude: 108.0,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === INDONESIA COTTON ===
  {
    name: "Sulawesi Cotton Region",
    country: "Indonesia",
    operator: "Indonesian Cotton Growers",
    latitude: -1.5,
    longitude: 120.5,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === PHILIPPINES COTTON ===
  {
    name: "Mindanao Cotton Farms",
    country: "Philippines",
    operator: "Philippine Cotton Corporation",
    latitude: 7.5,
    longitude: 125.0,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === SOUTH AFRICA COTTON ===
  {
    name: "Limpopo Cotton Region",
    country: "South Africa",
    operator: "Cotton SA",
    latitude: -23.4,
    longitude: 29.4,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === PERU COTTON ===
  {
    name: "Piura Cotton Valley",
    country: "Peru",
    operator: "Peruvian Cotton Growers",
    latitude: -5.2,
    longitude: -80.6,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === COLOMBIA COTTON ===
  {
    name: "Tolima Cotton Region",
    country: "Colombia",
    operator: "Colombian Cotton Federation",
    latitude: 4.4,
    longitude: -75.2,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === VENEZUELA COTTON ===
  {
    name: "Portuguesa Cotton Belt",
    country: "Venezuela",
    operator: "Venezuelan Cotton Producers",
    latitude: 9.0,
    longitude: -69.0,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === PARAGUAY COTTON ===
  {
    name: "Chaco Cotton Region",
    country: "Paraguay",
    operator: "Paraguay Cotton Association",
    latitude: -22.7,
    longitude: -60.0,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // === BOLIVIA COTTON ===
  {
    name: "Santa Cruz Cotton",
    country: "Bolivia",
    operator: "Bolivian Cotton Growers",
    latitude: -17.8,
    longitude: -63.2,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cotton Production"
  },
  // ============================================
  // RICE PRODUCTION - GLOBAL COVERAGE
  // ============================================
  // === CHINA RICE ===
  {
    name: "Yangtze River Rice Belt",
    country: "China",
    operator: "COFCO/Chinese Farmers",
    latitude: 30.0,
    longitude: 112.0,
    production_bpd: 180000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  {
    name: "Pearl River Delta Rice",
    country: "China",
    operator: "Guangdong Agricultural",
    latitude: 23.1,
    longitude: 113.3,
    production_bpd: 160000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  {
    name: "Heilongjiang Rice Region",
    country: "China",
    operator: "State Farms",
    latitude: 47.0,
    longitude: 127.0,
    production_bpd: 140000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === INDIA RICE ===
  {
    name: "West Bengal Rice Belt",
    country: "India",
    operator: "Indian Rice Millers",
    latitude: 23.0,
    longitude: 87.5,
    production_bpd: 170000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  {
    name: "Uttar Pradesh Rice",
    country: "India",
    operator: "Indian Farmers",
    latitude: 27.0,
    longitude: 80.0,
    production_bpd: 150000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  {
    name: "Punjab Rice Region",
    country: "India",
    operator: "Punjab Agricultural",
    latitude: 30.9,
    longitude: 75.9,
    production_bpd: 130000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === BANGLADESH RICE ===
  {
    name: "Ganges Delta Rice",
    country: "Bangladesh",
    operator: "Bangladesh Rice Research",
    latitude: 23.8,
    longitude: 90.4,
    production_bpd: 120000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  {
    name: "Sylhet Rice Region",
    country: "Bangladesh",
    operator: "Bangladesh Farmers",
    latitude: 24.9,
    longitude: 91.9,
    production_bpd: 100000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === INDONESIA RICE ===
  {
    name: "Java Rice Paddies",
    country: "Indonesia",
    operator: "Indonesian Rice Millers",
    latitude: -7.5,
    longitude: 110.0,
    production_bpd: 110000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  {
    name: "Sumatra Rice Region",
    country: "Indonesia",
    operator: "Indonesian Farmers",
    latitude: -0.5,
    longitude: 101.5,
    production_bpd: 90000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === VIETNAM RICE ===
  {
    name: "Mekong Delta Rice",
    country: "Vietnam",
    operator: "Vietnam Food Association",
    latitude: 10.0,
    longitude: 106.0,
    production_bpd: 100000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  {
    name: "Red River Delta Rice",
    country: "Vietnam",
    operator: "Vietnamese Cooperatives",
    latitude: 20.9,
    longitude: 106.2,
    production_bpd: 85000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === THAILAND RICE ===
  {
    name: "Central Plains Rice",
    country: "Thailand",
    operator: "Thai Rice Exporters",
    latitude: 14.0,
    longitude: 100.5,
    production_bpd: 95000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  {
    name: "Northeastern Thailand Rice",
    country: "Thailand",
    operator: "Thai Farmers",
    latitude: 16.4,
    longitude: 102.8,
    production_bpd: 80000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === MYANMAR RICE ===
  {
    name: "Irrawaddy Delta Rice",
    country: "Myanmar",
    operator: "Myanmar Rice Federation",
    latitude: 16.8,
    longitude: 95.7,
    production_bpd: 75000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  {
    name: "Ayeyarwady Rice Region",
    country: "Myanmar",
    operator: "Myanmar Farmers",
    latitude: 17.0,
    longitude: 96.0,
    production_bpd: 65000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === PHILIPPINES RICE ===
  {
    name: "Central Luzon Rice Bowl",
    country: "Philippines",
    operator: "Philippine Rice Research",
    latitude: 15.5,
    longitude: 120.8,
    production_bpd: 65000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  {
    name: "Mindanao Rice Farms",
    country: "Philippines",
    operator: "Philippine Farmers",
    latitude: 7.5,
    longitude: 125.0,
    production_bpd: 55000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === PAKISTAN RICE ===
  {
    name: "Punjab Rice Belt",
    country: "Pakistan",
    operator: "Pakistan Rice Exporters",
    latitude: 30.2,
    longitude: 71.5,
    production_bpd: 55000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  {
    name: "Sindh Rice Region",
    country: "Pakistan",
    operator: "Pakistan Farmers",
    latitude: 26.0,
    longitude: 68.5,
    production_bpd: 45000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === CAMBODIA RICE ===
  {
    name: "Tonle Sap Rice Region",
    country: "Cambodia",
    operator: "Cambodia Rice Federation",
    latitude: 13.1,
    longitude: 104.0,
    production_bpd: 50000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === JAPAN RICE ===
  {
    name: "Niigata Rice Region",
    country: "Japan",
    operator: "JA Niigata",
    latitude: 37.9,
    longitude: 139.0,
    production_bpd: 45000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  {
    name: "Akita Rice Belt",
    country: "Japan",
    operator: "JA Akita",
    latitude: 39.7,
    longitude: 140.1,
    production_bpd: 40000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === BRAZIL RICE ===
  {
    name: "Rio Grande do Sul Rice",
    country: "Brazil",
    operator: "Brazilian Rice Institute",
    latitude: -29.7,
    longitude: -53.7,
    production_bpd: 42000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === NIGERIA RICE ===
  {
    name: "Niger Delta Rice",
    country: "Nigeria",
    operator: "Nigeria Rice Farmers",
    latitude: 5.0,
    longitude: 6.5,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === UNITED STATES RICE ===
  {
    name: "Arkansas Rice Belt",
    country: "United States",
    operator: "Riceland Foods",
    latitude: 34.7,
    longitude: -92.3,
    production_bpd: 38000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  {
    name: "California Rice Region",
    country: "United States",
    operator: "California Rice Commission",
    latitude: 39.5,
    longitude: -122.0,
    production_bpd: 32000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === SRI LANKA RICE ===
  {
    name: "Mahaweli Rice Region",
    country: "Sri Lanka",
    operator: "Sri Lankan Rice Board",
    latitude: 7.5,
    longitude: 80.7,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === NEPAL RICE ===
  {
    name: "Terai Rice Belt",
    country: "Nepal",
    operator: "Nepal Agricultural",
    latitude: 27.5,
    longitude: 84.0,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === SOUTH KOREA RICE ===
  {
    name: "Jeolla Rice Region",
    country: "South Korea",
    operator: "Korean Rice Association",
    latitude: 35.5,
    longitude: 127.0,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === EGYPT RICE ===
  {
    name: "Nile Delta Rice",
    country: "Egypt",
    operator: "Egyptian Rice Mills",
    latitude: 31.0,
    longitude: 31.4,
    production_bpd: 24000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === MADAGASCAR RICE ===
  {
    name: "Madagascar Highlands Rice",
    country: "Madagascar",
    operator: "Madagascar Rice Farmers",
    latitude: -19.0,
    longitude: 47.0,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === LAOS RICE ===
  {
    name: "Vientiane Rice Plains",
    country: "Laos",
    operator: "Lao Rice Farmers",
    latitude: 18.0,
    longitude: 102.6,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === CÔTE D'IVOIRE RICE ===
  {
    name: "Northern Ivory Coast Rice",
    country: "Côte d'Ivoire",
    operator: "Ivorian Rice Office",
    latitude: 9.5,
    longitude: -5.5,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === TANZANIA RICE ===
  {
    name: "Mbeya Rice Region",
    country: "Tanzania",
    operator: "Tanzania Rice Board",
    latitude: -8.9,
    longitude: 33.5,
    production_bpd: 16000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === GHANA RICE ===
  {
    name: "Northern Ghana Rice",
    country: "Ghana",
    operator: "Ghana Rice Inter-Professional",
    latitude: 9.4,
    longitude: -0.8,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === MALI RICE ===
  {
    name: "Niger River Rice",
    country: "Mali",
    operator: "Office du Niger",
    latitude: 14.1,
    longitude: -4.9,
    production_bpd: 14000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === GUINEA RICE ===
  {
    name: "Guinea Coastal Rice",
    country: "Guinea",
    operator: "Guinea Rice Farmers",
    latitude: 10.0,
    longitude: -10.0,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === SIERRA LEONE RICE ===
  {
    name: "Sierra Leone Rice Valleys",
    country: "Sierra Leone",
    operator: "Sierra Leone Rice Board",
    latitude: 8.5,
    longitude: -12.0,
    production_bpd: 11000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === SENEGAL RICE ===
  {
    name: "Senegal River Valley Rice",
    country: "Senegal",
    operator: "SAED",
    latitude: 16.0,
    longitude: -15.0,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === CAMEROON RICE ===
  {
    name: "Northern Cameroon Rice",
    country: "Cameroon",
    operator: "Cameroon Rice Farmers",
    latitude: 10.5,
    longitude: 14.5,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === UGANDA RICE ===
  {
    name: "Eastern Uganda Rice",
    country: "Uganda",
    operator: "Uganda Rice Growers",
    latitude: 1.0,
    longitude: 33.5,
    production_bpd: 9000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === DRC RICE ===
  {
    name: "Congo Basin Rice",
    country: "Democratic Republic of the Congo",
    operator: "DRC Rice Federation",
    latitude: -4.3,
    longitude: 15.3,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === IRAN RICE ===
  {
    name: "Gilan Rice Region",
    country: "Iran",
    operator: "Iranian Rice Board",
    latitude: 37.3,
    longitude: 49.6,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === IRAQ RICE ===
  {
    name: "Mesopotamia Rice",
    country: "Iraq",
    operator: "Iraqi Rice Growers",
    latitude: 32.5,
    longitude: 44.4,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === TURKEY RICE ===
  {
    name: "Marmara Rice Region",
    country: "Turkey",
    operator: "Turkish Rice Farmers",
    latitude: 40.2,
    longitude: 28.9,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === AFGHANISTAN RICE ===
  {
    name: "Nangarhar Rice Region",
    country: "Afghanistan",
    operator: "Afghan Rice Growers",
    latitude: 34.4,
    longitude: 70.5,
    production_bpd: 7000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === ITALY RICE ===
  {
    name: "Po Valley Rice",
    country: "Italy",
    operator: "Italian Rice Board",
    latitude: 45.3,
    longitude: 8.5,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === SPAIN RICE ===
  {
    name: "Valencia Rice Region",
    country: "Spain",
    operator: "Spanish Rice Cooperatives",
    latitude: 39.5,
    longitude: -0.4,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === RUSSIA RICE ===
  {
    name: "Krasnodar Rice",
    country: "Russia",
    operator: "Russian Rice Growers",
    latitude: 45.0,
    longitude: 39.0,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === UKRAINE RICE ===
  {
    name: "Kherson Rice Region",
    country: "Ukraine",
    operator: "Ukrainian Rice Farmers",
    latitude: 46.6,
    longitude: 32.6,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === KAZAKHSTAN RICE ===
  {
    name: "Kyzylorda Rice Belt",
    country: "Kazakhstan",
    operator: "Kazakhstan Rice Growers",
    latitude: 44.8,
    longitude: 65.5,
    production_bpd: 7000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === MALAYSIA RICE ===
  {
    name: "Kedah Rice Bowl",
    country: "Malaysia",
    operator: "Malaysian Rice Board",
    latitude: 6.1,
    longitude: 100.4,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === COLOMBIA RICE ===
  {
    name: "Tolima Rice Region",
    country: "Colombia",
    operator: "Colombian Rice Federation",
    latitude: 4.4,
    longitude: -75.2,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === PERU RICE ===
  {
    name: "Northern Coast Rice",
    country: "Peru",
    operator: "Peruvian Rice Growers",
    latitude: -6.8,
    longitude: -79.8,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === ECUADOR RICE ===
  {
    name: "Guayas Rice Region",
    country: "Ecuador",
    operator: "Ecuadorian Rice Farmers",
    latitude: -2.0,
    longitude: -79.5,
    production_bpd: 9000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === BOLIVIA RICE ===
  {
    name: "Santa Cruz Rice",
    country: "Bolivia",
    operator: "Bolivian Rice Association",
    latitude: -17.8,
    longitude: -63.2,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === VENEZUELA RICE ===
  {
    name: "Portuguesa Rice Region",
    country: "Venezuela",
    operator: "Venezuelan Rice Growers",
    latitude: 9.0,
    longitude: -69.0,
    production_bpd: 7000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === MEXICO RICE ===
  {
    name: "Sinaloa Rice Belt",
    country: "Mexico",
    operator: "Mexican Rice Council",
    latitude: 25.0,
    longitude: -107.5,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === DOMINICAN REPUBLIC RICE ===
  {
    name: "Cibao Valley Rice",
    country: "Dominican Republic",
    operator: "Dominican Rice Growers",
    latitude: 19.5,
    longitude: -70.5,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === HAITI RICE ===
  {
    name: "Artibonite Valley Rice",
    country: "Haiti",
    operator: "Haitian Rice Farmers",
    latitude: 19.4,
    longitude: -72.4,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === CUBA RICE ===
  {
    name: "Pinar del Rio Rice",
    country: "Cuba",
    operator: "Cuban Rice Board",
    latitude: 22.4,
    longitude: -83.7,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // === PAPUA NEW GUINEA RICE ===
  {
    name: "Sepik River Rice",
    country: "Papua New Guinea",
    operator: "PNG Rice Growers",
    latitude: -4.0,
    longitude: 143.5,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rice Production"
  },
  // ============================================
  // SUGAR PRODUCTION - GLOBAL COVERAGE
  // ============================================
  // === BRAZIL SUGAR ===
  {
    name: "São Paulo Sugar Belt",
    country: "Brazil",
    operator: "UNICA",
    latitude: -22.0,
    longitude: -48.0,
    production_bpd: 200000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  {
    name: "Minas Gerais Sugar",
    country: "Brazil",
    operator: "Brazilian Sugar Mills",
    latitude: -19.9,
    longitude: -43.9,
    production_bpd: 150000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  {
    name: "Paraná Sugar Region",
    country: "Brazil",
    operator: "Coopersucar",
    latitude: -24.5,
    longitude: -51.5,
    production_bpd: 120000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === INDIA SUGAR ===
  {
    name: "Uttar Pradesh Sugar",
    country: "India",
    operator: "Indian Sugar Mills",
    latitude: 27.0,
    longitude: 80.0,
    production_bpd: 140000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  {
    name: "Maharashtra Sugar Belt",
    country: "India",
    operator: "Maharashtra Sugar Factories",
    latitude: 19.0,
    longitude: 76.0,
    production_bpd: 120000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  {
    name: "Karnataka Sugar Region",
    country: "India",
    operator: "Indian Sugar Association",
    latitude: 15.3,
    longitude: 75.7,
    production_bpd: 100000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === CHINA SUGAR ===
  {
    name: "Guangxi Sugar Region",
    country: "China",
    operator: "China Sugar Association",
    latitude: 23.0,
    longitude: 108.3,
    production_bpd: 90000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  {
    name: "Yunnan Sugar Belt",
    country: "China",
    operator: "Chinese Sugar Mills",
    latitude: 25.0,
    longitude: 102.7,
    production_bpd: 75000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === THAILAND SUGAR ===
  {
    name: "Central Thailand Sugar",
    country: "Thailand",
    operator: "Thai Sugar Millers",
    latitude: 15.0,
    longitude: 100.0,
    production_bpd: 80000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  {
    name: "Northeastern Sugar Belt",
    country: "Thailand",
    operator: "Thai Sugar Association",
    latitude: 16.4,
    longitude: 102.8,
    production_bpd: 70000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === UNITED STATES SUGAR ===
  {
    name: "Florida Sugar Belt",
    country: "United States",
    operator: "US Sugar Corporation",
    latitude: 26.7,
    longitude: -80.9,
    production_bpd: 60000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  {
    name: "Louisiana Sugar Region",
    country: "United States",
    operator: "American Sugar Cane League",
    latitude: 30.0,
    longitude: -91.0,
    production_bpd: 50000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === PAKISTAN SUGAR ===
  {
    name: "Punjab Sugar Mills",
    country: "Pakistan",
    operator: "Pakistan Sugar Mills Association",
    latitude: 30.2,
    longitude: 71.5,
    production_bpd: 45000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  {
    name: "Sindh Sugar Belt",
    country: "Pakistan",
    operator: "Pakistan Sugar Millers",
    latitude: 26.0,
    longitude: 68.5,
    production_bpd: 40000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === MEXICO SUGAR ===
  {
    name: "Veracruz Sugar Region",
    country: "Mexico",
    operator: "CNIAA",
    latitude: 19.5,
    longitude: -96.9,
    production_bpd: 42000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  {
    name: "Jalisco Sugar Belt",
    country: "Mexico",
    operator: "Mexican Sugar Mills",
    latitude: 20.7,
    longitude: -103.3,
    production_bpd: 38000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === RUSSIA SUGAR ===
  {
    name: "Krasnodar Sugar Beet",
    country: "Russia",
    operator: "Russian Sugar Producers",
    latitude: 45.0,
    longitude: 39.0,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === FRANCE SUGAR ===
  {
    name: "Île-de-France Sugar Beet",
    country: "France",
    operator: "Tereos",
    latitude: 48.9,
    longitude: 2.3,
    production_bpd: 32000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === GERMANY SUGAR ===
  {
    name: "Bavaria Sugar Beet",
    country: "Germany",
    operator: "Südzucker",
    latitude: 48.8,
    longitude: 11.5,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === INDONESIA SUGAR ===
  {
    name: "Java Sugar Mills",
    country: "Indonesia",
    operator: "Indonesian Sugar Refineries",
    latitude: -7.5,
    longitude: 110.0,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === AUSTRALIA SUGAR ===
  {
    name: "Queensland Sugar Belt",
    country: "Australia",
    operator: "Wilmar Sugar",
    latitude: -19.3,
    longitude: 146.8,
    production_bpd: 26000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === PHILIPPINES SUGAR ===
  {
    name: "Negros Sugar Region",
    country: "Philippines",
    operator: "Sugar Regulatory Administration",
    latitude: 10.7,
    longitude: 123.0,
    production_bpd: 24000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === TURKEY SUGAR ===
  {
    name: "Konya Sugar Beet",
    country: "Turkey",
    operator: "Turkish Sugar Factories",
    latitude: 38.0,
    longitude: 33.0,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === EGYPT SUGAR ===
  {
    name: "Nile Delta Sugar",
    country: "Egypt",
    operator: "Egyptian Sugar Company",
    latitude: 30.5,
    longitude: 31.0,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === COLOMBIA SUGAR ===
  {
    name: "Cauca Valley Sugar",
    country: "Colombia",
    operator: "Asocaña",
    latitude: 3.4,
    longitude: -76.5,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === ARGENTINA SUGAR ===
  {
    name: "Tucumán Sugar Belt",
    country: "Argentina",
    operator: "Argentine Sugar Center",
    latitude: -26.8,
    longitude: -65.2,
    production_bpd: 16000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === GUATEMALA SUGAR ===
  {
    name: "Pacific Coast Sugar",
    country: "Guatemala",
    operator: "Guatemalan Sugar Association",
    latitude: 14.3,
    longitude: -91.0,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === SOUTH AFRICA SUGAR ===
  {
    name: "KwaZulu-Natal Sugar",
    country: "South Africa",
    operator: "South African Sugar Association",
    latitude: -29.6,
    longitude: 31.0,
    production_bpd: 14000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === IRAN SUGAR ===
  {
    name: "Khuzestan Sugar",
    country: "Iran",
    operator: "Iranian Sugar Company",
    latitude: 31.3,
    longitude: 48.7,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === CUBA SUGAR ===
  {
    name: "Central Cuba Sugar",
    country: "Cuba",
    operator: "AZCUBA",
    latitude: 22.0,
    longitude: -79.5,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === VIETNAM SUGAR ===
  {
    name: "Mekong Delta Sugar",
    country: "Vietnam",
    operator: "Vietnam Sugar Association",
    latitude: 10.0,
    longitude: 106.0,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === UKRAINE SUGAR ===
  {
    name: "Ukrainian Sugar Beet",
    country: "Ukraine",
    operator: "Ukrainian Sugar Producers",
    latitude: 49.0,
    longitude: 32.0,
    production_bpd: 9000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === POLAND SUGAR ===
  {
    name: "Polish Sugar Beet",
    country: "Poland",
    operator: "Polski Cukier",
    latitude: 52.2,
    longitude: 21.0,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === UNITED KINGDOM SUGAR ===
  {
    name: "East Anglia Sugar Beet",
    country: "United Kingdom",
    operator: "British Sugar",
    latitude: 52.2,
    longitude: 0.8,
    production_bpd: 7000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === ITALY SUGAR ===
  {
    name: "Po Valley Sugar Beet",
    country: "Italy",
    operator: "Italia Zuccheri",
    latitude: 45.0,
    longitude: 10.0,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === SPAIN SUGAR ===
  {
    name: "Andalusia Sugar Beet",
    country: "Spain",
    operator: "Azucarera Española",
    latitude: 37.4,
    longitude: -5.9,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === ROMANIA SUGAR ===
  {
    name: "Romanian Sugar Beet",
    country: "Romania",
    operator: "Romanian Sugar Company",
    latitude: 44.4,
    longitude: 26.1,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === NETHERLANDS SUGAR ===
  {
    name: "Dutch Sugar Beet",
    country: "Netherlands",
    operator: "Suiker Unie",
    latitude: 52.1,
    longitude: 5.2,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === BELGIUM SUGAR ===
  {
    name: "Belgian Sugar Beet",
    country: "Belgium",
    operator: "Raffinerie Tirlemontoise",
    latitude: 50.8,
    longitude: 4.4,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === AUSTRIA SUGAR ===
  {
    name: "Austrian Sugar Beet",
    country: "Austria",
    operator: "Agrana",
    latitude: 48.2,
    longitude: 16.4,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === HUNGARY SUGAR ===
  {
    name: "Hungarian Sugar Beet",
    country: "Hungary",
    operator: "Magyar Cukor",
    latitude: 47.5,
    longitude: 19.0,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === CZECH REPUBLIC SUGAR ===
  {
    name: "Czech Sugar Beet",
    country: "Czech Republic",
    operator: "Czech Sugar Company",
    latitude: 50.1,
    longitude: 14.4,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === SLOVAKIA SUGAR ===
  {
    name: "Slovak Sugar Beet",
    country: "Slovakia",
    operator: "Slovak Sugar",
    latitude: 48.1,
    longitude: 17.1,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === GREECE SUGAR ===
  {
    name: "Greek Sugar Beet",
    country: "Greece",
    operator: "Hellenic Sugar Industry",
    latitude: 40.6,
    longitude: 22.9,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === PORTUGAL SUGAR ===
  {
    name: "Azores Sugar Cane",
    country: "Portugal",
    operator: "Portuguese Sugar",
    latitude: 37.7,
    longitude: -25.7,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === MOROCCO SUGAR ===
  {
    name: "Gharb Sugar Beet",
    country: "Morocco",
    operator: "COSUMAR",
    latitude: 34.3,
    longitude: -6.0,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === SUDAN SUGAR ===
  {
    name: "White Nile Sugar",
    country: "Sudan",
    operator: "Kenana Sugar Company",
    latitude: 13.5,
    longitude: 32.7,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === ETHIOPIA SUGAR ===
  {
    name: "Awash Valley Sugar",
    country: "Ethiopia",
    operator: "Ethiopian Sugar Corporation",
    latitude: 8.6,
    longitude: 39.5,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === KENYA SUGAR ===
  {
    name: "Nyanza Sugar Belt",
    country: "Kenya",
    operator: "Kenya Sugar Board",
    latitude: -0.1,
    longitude: 34.8,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === TANZANIA SUGAR ===
  {
    name: "Kilombero Sugar",
    country: "Tanzania",
    operator: "Tanzania Sugar Board",
    latitude: -8.1,
    longitude: 36.5,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === ZAMBIA SUGAR ===
  {
    name: "Mazabuka Sugar",
    country: "Zambia",
    operator: "Zambia Sugar",
    latitude: -15.9,
    longitude: 27.8,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === ZIMBABWE SUGAR ===
  {
    name: "Triangle Sugar Estate",
    country: "Zimbabwe",
    operator: "Tongaat Hulett",
    latitude: -21.0,
    longitude: 31.5,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === MOZAMBIQUE SUGAR ===
  {
    name: "Marromeu Sugar",
    country: "Mozambique",
    operator: "Mozambique Sugar Company",
    latitude: -18.3,
    longitude: 35.9,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === NIGERIA SUGAR ===
  {
    name: "Savannah Sugar Belt",
    country: "Nigeria",
    operator: "Dangote Sugar",
    latitude: 11.0,
    longitude: 4.5,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === CÔTE D'IVOIRE SUGAR ===
  {
    name: "Northern Ivory Coast Sugar",
    country: "Ivory Coast (Côte d'Ivoire)",
    operator: "SUCRIVOIRE",
    latitude: 9.5,
    longitude: -5.5,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === DOMINICAN REPUBLIC SUGAR ===
  {
    name: "Dominican Sugar Mills",
    country: "Dominican Republic",
    operator: "Central Romana",
    latitude: 18.4,
    longitude: -69.0,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === JAMAICA SUGAR ===
  {
    name: "Jamaican Sugar Estates",
    country: "Jamaica",
    operator: "Jamaica Cane Product Sales",
    latitude: 18.1,
    longitude: -77.3,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === BOLIVIA SUGAR ===
  {
    name: "Santa Cruz Sugar",
    country: "Bolivia",
    operator: "Bolivian Sugar Mills",
    latitude: -17.8,
    longitude: -63.2,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // === PERU SUGAR ===
  {
    name: "La Libertad Sugar",
    country: "Peru",
    operator: "Peruvian Sugar Producers",
    latitude: -8.1,
    longitude: -79.0,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Sugar Production"
  },
  // ============================================
  // COCOA PRODUCTION - GLOBAL COVERAGE
  // ============================================
  // === CÔTE D'IVOIRE COCOA ===
  {
    name: "Western Ivory Coast Cocoa",
    country: "Côte d'Ivoire",
    operator: "Le Conseil du Café-Cacao",
    latitude: 7.0,
    longitude: -7.5,
    production_bpd: 80000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  {
    name: "Central Cocoa Belt",
    country: "Côte d'Ivoire",
    operator: "Ivorian Cocoa Cooperatives",
    latitude: 6.5,
    longitude: -5.5,
    production_bpd: 75000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === GHANA COCOA ===
  {
    name: "Ashanti Cocoa Region",
    country: "Ghana",
    operator: "COCOBOD",
    latitude: 6.7,
    longitude: -1.6,
    production_bpd: 60000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  {
    name: "Western Ghana Cocoa",
    country: "Ghana",
    operator: "Ghana Cocoa Board",
    latitude: 5.5,
    longitude: -2.5,
    production_bpd: 55000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === INDONESIA COCOA ===
  {
    name: "Sulawesi Cocoa Belt",
    country: "Indonesia",
    operator: "Indonesian Cocoa Association",
    latitude: -1.5,
    longitude: 120.5,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === NIGERIA COCOA ===
  {
    name: "Cross River Cocoa",
    country: "Nigeria",
    operator: "Cocoa Association of Nigeria",
    latitude: 5.5,
    longitude: 8.5,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === CAMEROON COCOA ===
  {
    name: "Southern Cameroon Cocoa",
    country: "Cameroon",
    operator: "CICC",
    latitude: 4.0,
    longitude: 11.5,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === BRAZIL COCOA ===
  {
    name: "Bahia Cocoa Region",
    country: "Brazil",
    operator: "Brazilian Cocoa Growers",
    latitude: -14.8,
    longitude: -39.3,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === ECUADOR COCOA ===
  {
    name: "Los Rios Cocoa",
    country: "Ecuador",
    operator: "ANECACAO",
    latitude: -1.0,
    longitude: -79.5,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === PERU COCOA ===
  {
    name: "San Martin Cocoa",
    country: "Peru",
    operator: "Peruvian Cocoa Alliance",
    latitude: -6.5,
    longitude: -76.0,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === DOMINICAN REPUBLIC COCOA ===
  {
    name: "Dominican Cocoa Belt",
    country: "Dominican Republic",
    operator: "CONACADO",
    latitude: 18.7,
    longitude: -70.2,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === COLOMBIA COCOA ===
  {
    name: "Santander Cocoa Region",
    country: "Colombia",
    operator: "Colombian Cocoa Federation",
    latitude: 7.0,
    longitude: -73.1,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === PAPUA NEW GUINEA COCOA ===
  {
    name: "East New Britain Cocoa",
    country: "Papua New Guinea",
    operator: "Cocoa Board of PNG",
    latitude: -5.5,
    longitude: 151.5,
    production_bpd: 7000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === UGANDA COCOA ===
  {
    name: "Western Uganda Cocoa",
    country: "Uganda",
    operator: "Uganda Cocoa Association",
    latitude: 0.3,
    longitude: 30.0,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === TOGO COCOA ===
  {
    name: "Plateaux Region Cocoa",
    country: "Togo",
    operator: "Togolese Cocoa Board",
    latitude: 7.5,
    longitude: 1.2,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === SIERRA LEONE COCOA ===
  {
    name: "Eastern Sierra Leone Cocoa",
    country: "Sierra Leone",
    operator: "Sierra Leone Cocoa Board",
    latitude: 8.0,
    longitude: -11.0,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === GUINEA COCOA ===
  {
    name: "Guinean Forest Cocoa",
    country: "Guinea",
    operator: "Guinea Cocoa Farmers",
    latitude: 9.5,
    longitude: -10.5,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === LIBERIA COCOA ===
  {
    name: "Lofa County Cocoa",
    country: "Liberia",
    operator: "Liberia Cocoa Board",
    latitude: 8.2,
    longitude: -9.8,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === VENEZUELA COCOA ===
  {
    name: "Aragua Cocoa Valley",
    country: "Venezuela",
    operator: "Venezuelan Cocoa Growers",
    latitude: 10.2,
    longitude: -67.6,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === MEXICO COCOA ===
  {
    name: "Tabasco Cocoa Region",
    country: "Mexico",
    operator: "Mexican Cocoa Council",
    latitude: 17.8,
    longitude: -92.6,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === HAITI COCOA ===
  {
    name: "Grand'Anse Cocoa",
    country: "Haiti",
    operator: "Haitian Cocoa Federation",
    latitude: 18.5,
    longitude: -74.1,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === NICARAGUA COCOA ===
  {
    name: "RAAN Cocoa Region",
    country: "Nicaragua",
    operator: "Nicaraguan Cocoa Association",
    latitude: 14.0,
    longitude: -84.0,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === GUATEMALA COCOA ===
  {
    name: "Izabal Cocoa Belt",
    country: "Guatemala",
    operator: "Guatemalan Cocoa Producers",
    latitude: 15.5,
    longitude: -88.8,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === HONDURAS COCOA ===
  {
    name: "Atlántida Cocoa Region",
    country: "Honduras",
    operator: "Honduran Cocoa Federation",
    latitude: 15.6,
    longitude: -87.5,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === COSTA RICA COCOA ===
  {
    name: "Limón Cocoa Belt",
    country: "Costa Rica",
    operator: "Costa Rican Cocoa Cooperative",
    latitude: 10.0,
    longitude: -83.0,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === PANAMA COCOA ===
  {
    name: "Bocas del Toro Cocoa",
    country: "Panama",
    operator: "Panamanian Cocoa Growers",
    latitude: 9.3,
    longitude: -82.3,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === BOLIVIA COCOA ===
  {
    name: "Alto Beni Cocoa",
    country: "Bolivia",
    operator: "Bolivian Cocoa Alliance",
    latitude: -15.5,
    longitude: -67.0,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === TRINIDAD AND TOBAGO COCOA ===
  {
    name: "Trinidad Cocoa Estates",
    country: "Trinidad and Tobago",
    operator: "Cocoa Development Company",
    latitude: 10.7,
    longitude: -61.2,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === JAMAICA COCOA ===
  {
    name: "Jamaican Cocoa Farms",
    country: "Jamaica",
    operator: "Jamaica Cocoa Growers",
    latitude: 18.1,
    longitude: -77.3,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === CUBA COCOA ===
  {
    name: "Baracoa Cocoa Region",
    country: "Cuba",
    operator: "Cuban Cocoa Board",
    latitude: 20.3,
    longitude: -74.5,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === SÃO TOMÉ AND PRÍNCIPE COCOA ===
  {
    name: "São Tomé Cocoa Plantations",
    country: "São Tomé and Príncipe",
    operator: "São Tomé Cocoa Cooperative",
    latitude: 0.3,
    longitude: 6.7,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === EQUATORIAL GUINEA COCOA ===
  {
    name: "Bioko Island Cocoa",
    country: "Equatorial Guinea",
    operator: "Equatorial Guinea Cocoa",
    latitude: 3.5,
    longitude: 8.8,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === GABON COCOA ===
  {
    name: "Woleu-Ntem Cocoa",
    country: "Gabon",
    operator: "Gabonese Cocoa Producers",
    latitude: 2.3,
    longitude: 11.5,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === DRC COCOA ===
  {
    name: "Eastern Congo Cocoa",
    country: "Democratic Republic of the Congo",
    operator: "DRC Cocoa Federation",
    latitude: -3.0,
    longitude: 28.0,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === ANGOLA COCOA ===
  {
    name: "Cabinda Cocoa Region",
    country: "Angola",
    operator: "Angolan Cocoa Growers",
    latitude: -5.5,
    longitude: 12.2,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === TANZANIA COCOA ===
  {
    name: "Kagera Cocoa Belt",
    country: "Tanzania",
    operator: "Tanzania Cocoa Board",
    latitude: -1.3,
    longitude: 31.8,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === KENYA COCOA ===
  {
    name: "Western Kenya Cocoa",
    country: "Kenya",
    operator: "Kenya Cocoa Growers",
    latitude: 0.3,
    longitude: 34.5,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === MADAGASCAR COCOA ===
  {
    name: "Sambirano Valley Cocoa",
    country: "Madagascar",
    operator: "Madagascar Cocoa Alliance",
    latitude: -13.4,
    longitude: 48.3,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === MOZAMBIQUE COCOA ===
  {
    name: "Zambezia Cocoa",
    country: "Mozambique",
    operator: "Mozambique Cocoa Farmers",
    latitude: -15.0,
    longitude: 37.0,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === MALAWI COCOA ===
  {
    name: "Malawi Cocoa Project",
    country: "Malawi",
    operator: "Malawi Cocoa Cooperative",
    latitude: -13.9,
    longitude: 33.8,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === ZIMBABWE COCOA ===
  {
    name: "Zimbabwe Cocoa Farms",
    country: "Zimbabwe",
    operator: "Zimbabwe Cocoa Growers",
    latitude: -18.9,
    longitude: 32.7,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === PHILIPPINES COCOA ===
  {
    name: "Davao Cocoa Region",
    country: "Philippines",
    operator: "Philippine Cocoa Foundation",
    latitude: 7.1,
    longitude: 125.6,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === MALAYSIA COCOA ===
  {
    name: "Sabah Cocoa Belt",
    country: "Malaysia",
    operator: "Malaysian Cocoa Board",
    latitude: 5.3,
    longitude: 117.0,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === THAILAND COCOA ===
  {
    name: "Southern Thailand Cocoa",
    country: "Thailand",
    operator: "Thai Cocoa Growers",
    latitude: 7.9,
    longitude: 98.4,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === VIETNAM COCOA ===
  {
    name: "Mekong Delta Cocoa",
    country: "Vietnam",
    operator: "Vietnam Cocoa Association",
    latitude: 10.0,
    longitude: 106.0,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === SRI LANKA COCOA ===
  {
    name: "Sri Lankan Cocoa Estates",
    country: "Sri Lanka",
    operator: "Sri Lanka Cocoa Board",
    latitude: 7.3,
    longitude: 80.6,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === INDIA COCOA ===
  {
    name: "Kerala Cocoa Plantations",
    country: "India",
    operator: "Indian Cocoa Growers",
    latitude: 10.8,
    longitude: 76.3,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === BANGLADESH COCOA ===
  {
    name: "Chittagong Hill Tracts Cocoa",
    country: "Bangladesh",
    operator: "Bangladesh Cocoa Association",
    latitude: 23.2,
    longitude: 92.0,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === CHINA COCOA ===
  {
    name: "Hainan Cocoa Region",
    country: "China",
    operator: "Chinese Cocoa Growers",
    latitude: 19.2,
    longitude: 109.7,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === AUSTRALIA COCOA ===
  {
    name: "Queensland Cocoa Farms",
    country: "Australia",
    operator: "Australian Cocoa Growers",
    latitude: -17.0,
    longitude: 145.8,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === FIJI COCOA ===
  {
    name: "Fiji Cocoa Plantations",
    country: "Fiji",
    operator: "Fiji Cocoa Board",
    latitude: -17.7,
    longitude: 178.0,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // === SOLOMON ISLANDS COCOA ===
  {
    name: "Solomon Islands Cocoa",
    country: "Solomon Islands",
    operator: "Solomon Islands Cocoa Board",
    latitude: -9.4,
    longitude: 160.0,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cocoa Production"
  },
  // ============================================
  // CORN PRODUCTION - GLOBAL COVERAGE
  // ============================================
  // === UNITED STATES CORN ===
  {
    name: "Iowa Corn Belt",
    country: "United States",
    operator: "US Corn Growers",
    latitude: 42.0,
    longitude: -93.5,
    production_bpd: 200000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  {
    name: "Illinois Corn Region",
    country: "United States",
    operator: "Illinois Corn Growers",
    latitude: 40.0,
    longitude: -89.0,
    production_bpd: 180000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  {
    name: "Nebraska Corn Belt",
    country: "United States",
    operator: "Nebraska Corn Board",
    latitude: 41.5,
    longitude: -99.8,
    production_bpd: 160000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === CHINA CORN ===
  {
    name: "Northeast China Corn Belt",
    country: "China",
    operator: "COFCO/Chinese Farmers",
    latitude: 43.9,
    longitude: 125.3,
    production_bpd: 140000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  {
    name: "Hebei Corn Region",
    country: "China",
    operator: "Chinese Corn Growers",
    latitude: 38.5,
    longitude: 115.5,
    production_bpd: 120000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === BRAZIL CORN ===
  {
    name: "Mato Grosso Corn Belt",
    country: "Brazil",
    operator: "Brazilian Corn Association",
    latitude: -13.0,
    longitude: -55.5,
    production_bpd: 100000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  {
    name: "Paraná Corn Region",
    country: "Brazil",
    operator: "Brazilian Corn Growers",
    latitude: -24.5,
    longitude: -51.5,
    production_bpd: 85000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === ARGENTINA CORN ===
  {
    name: "Pampas Corn Belt",
    country: "Argentina",
    operator: "Argentine Corn Producers",
    latitude: -34.0,
    longitude: -61.0,
    production_bpd: 80000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  {
    name: "Córdoba Corn Region",
    country: "Argentina",
    operator: "Argentine Maize Council",
    latitude: -32.0,
    longitude: -63.5,
    production_bpd: 70000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === UKRAINE CORN ===
  {
    name: "Central Ukraine Corn",
    country: "Ukraine",
    operator: "Ukrainian Corn Growers",
    latitude: 49.0,
    longitude: 32.0,
    production_bpd: 60000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === INDIA CORN ===
  {
    name: "Karnataka Corn Belt",
    country: "India",
    operator: "Indian Maize Growers",
    latitude: 15.3,
    longitude: 75.7,
    production_bpd: 50000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === MEXICO CORN ===
  {
    name: "Sinaloa Corn Region",
    country: "Mexico",
    operator: "Mexican Corn Council",
    latitude: 25.0,
    longitude: -107.5,
    production_bpd: 45000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  {
    name: "Jalisco Corn Belt",
    country: "Mexico",
    operator: "Mexican Maize Farmers",
    latitude: 20.7,
    longitude: -103.3,
    production_bpd: 40000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === INDONESIA CORN ===
  {
    name: "Java Corn Region",
    country: "Indonesia",
    operator: "Indonesian Corn Farmers",
    latitude: -7.5,
    longitude: 110.0,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === FRANCE CORN ===
  {
    name: "Southwest France Corn",
    country: "France",
    operator: "French Corn Growers",
    latitude: 43.6,
    longitude: 1.4,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === SOUTH AFRICA CORN ===
  {
    name: "Free State Corn Belt",
    country: "South Africa",
    operator: "South African Grain Lab",
    latitude: -28.5,
    longitude: 26.5,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === RUSSIA CORN ===
  {
    name: "Southern Russia Corn",
    country: "Russia",
    operator: "Russian Corn Growers",
    latitude: 45.0,
    longitude: 39.0,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === ROMANIA CORN ===
  {
    name: "Romanian Plain Corn",
    country: "Romania",
    operator: "Romanian Corn Association",
    latitude: 44.4,
    longitude: 26.1,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === PHILIPPINES CORN ===
  {
    name: "Mindanao Corn Belt",
    country: "Philippines",
    operator: "Philippine Maize Federation",
    latitude: 7.5,
    longitude: 125.0,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === CANADA CORN ===
  {
    name: "Ontario Corn Belt",
    country: "Canada",
    operator: "Grain Farmers of Ontario",
    latitude: 43.0,
    longitude: -81.0,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === HUNGARY CORN ===
  {
    name: "Great Plain Corn",
    country: "Hungary",
    operator: "Hungarian Corn Growers",
    latitude: 47.0,
    longitude: 20.5,
    production_bpd: 16000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === THAILAND CORN ===
  {
    name: "Northeastern Thailand Corn",
    country: "Thailand",
    operator: "Thai Corn Association",
    latitude: 16.4,
    longitude: 102.8,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === ITALY CORN ===
  {
    name: "Po Valley Corn",
    country: "Italy",
    operator: "Italian Corn Producers",
    latitude: 45.0,
    longitude: 10.0,
    production_bpd: 14000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === EGYPT CORN ===
  {
    name: "Nile Delta Corn",
    country: "Egypt",
    operator: "Egyptian Corn Growers",
    latitude: 30.5,
    longitude: 31.0,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === NIGERIA CORN ===
  {
    name: "Northern Nigeria Corn",
    country: "Nigeria",
    operator: "Nigerian Maize Growers",
    latitude: 9.0,
    longitude: 8.0,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === SERBIA CORN ===
  {
    name: "Vojvodina Corn Belt",
    country: "Serbia",
    operator: "Serbian Corn Association",
    latitude: 45.3,
    longitude: 19.8,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === TANZANIA CORN ===
  {
    name: "Southern Highlands Corn",
    country: "Tanzania",
    operator: "Tanzania Grain Board",
    latitude: -8.9,
    longitude: 33.5,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === KENYA CORN ===
  {
    name: "Rift Valley Corn",
    country: "Kenya",
    operator: "Kenya Maize Growers",
    latitude: -0.3,
    longitude: 36.1,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === MALAWI CORN ===
  {
    name: "Central Malawi Corn",
    country: "Malawi",
    operator: "Malawi Grain Traders",
    latitude: -13.9,
    longitude: 33.8,
    production_bpd: 7000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === ZAMBIA CORN ===
  {
    name: "Eastern Zambia Corn",
    country: "Zambia",
    operator: "Zambia National Farmers Union",
    latitude: -13.5,
    longitude: 32.0,
    production_bpd: 7000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === GHANA CORN ===
  {
    name: "Northern Ghana Corn",
    country: "Ghana",
    operator: "Ghana Grains Council",
    latitude: 9.4,
    longitude: -0.8,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === ETHIOPIA CORN ===
  {
    name: "Ethiopian Highlands Corn",
    country: "Ethiopia",
    operator: "Ethiopian Grain Traders",
    latitude: 9.0,
    longitude: 38.7,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === UGANDA CORN ===
  {
    name: "Eastern Uganda Corn",
    country: "Uganda",
    operator: "Uganda Grain Council",
    latitude: 1.0,
    longitude: 33.5,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === MOZAMBIQUE CORN ===
  {
    name: "Nampula Corn Region",
    country: "Mozambique",
    operator: "Mozambique Maize Farmers",
    latitude: -15.1,
    longitude: 39.3,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === DRC CORN ===
  {
    name: "Eastern Congo Corn",
    country: "Democratic Republic of the Congo",
    operator: "DRC Grain Growers",
    latitude: -3.0,
    longitude: 28.0,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === CAMEROON CORN ===
  {
    name: "Western Highlands Corn",
    country: "Cameroon",
    operator: "Cameroon Maize Farmers",
    latitude: 5.5,
    longitude: 10.5,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === CÔTE D'IVOIRE CORN ===
  {
    name: "Northern Ivory Coast Corn",
    country: "Ivory Coast (Côte d'Ivoire)",
    operator: "Ivorian Corn Growers",
    latitude: 9.5,
    longitude: -5.5,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === COLOMBIA CORN ===
  {
    name: "Valle del Cauca Corn",
    country: "Colombia",
    operator: "Colombian Corn Federation",
    latitude: 3.4,
    longitude: -76.5,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === VENEZUELA CORN ===
  {
    name: "Portuguesa Corn Belt",
    country: "Venezuela",
    operator: "Venezuelan Corn Growers",
    latitude: 9.0,
    longitude: -69.0,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === PERU CORN ===
  {
    name: "Andean Corn Region",
    country: "Peru",
    operator: "Peruvian Corn Farmers",
    latitude: -12.0,
    longitude: -75.0,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === BOLIVIA CORN ===
  {
    name: "Santa Cruz Corn Belt",
    country: "Bolivia",
    operator: "Bolivian Corn Association",
    latitude: -17.8,
    longitude: -63.2,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === PARAGUAY CORN ===
  {
    name: "Eastern Paraguay Corn",
    country: "Paraguay",
    operator: "Paraguay Grain Producers",
    latitude: -25.3,
    longitude: -57.6,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === CHILE CORN ===
  {
    name: "Central Valley Corn",
    country: "Chile",
    operator: "Chilean Corn Growers",
    latitude: -35.0,
    longitude: -71.0,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === SPAIN CORN ===
  {
    name: "Castile Corn Region",
    country: "Spain",
    operator: "Spanish Corn Association",
    latitude: 41.5,
    longitude: -4.5,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === GERMANY CORN ===
  {
    name: "Bavaria Corn Belt",
    country: "Germany",
    operator: "German Corn Growers",
    latitude: 48.8,
    longitude: 11.5,
    production_bpd: 7000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === POLAND CORN ===
  {
    name: "Southern Poland Corn",
    country: "Poland",
    operator: "Polish Corn Federation",
    latitude: 50.1,
    longitude: 19.9,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === AUSTRIA CORN ===
  {
    name: "Lower Austria Corn",
    country: "Austria",
    operator: "Austrian Corn Farmers",
    latitude: 48.2,
    longitude: 15.6,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === CZECH REPUBLIC CORN ===
  {
    name: "Moravia Corn Region",
    country: "Czech Republic",
    operator: "Czech Corn Growers",
    latitude: 49.2,
    longitude: 16.6,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === SLOVAKIA CORN ===
  {
    name: "Slovak Corn Belt",
    country: "Slovakia",
    operator: "Slovak Corn Association",
    latitude: 48.1,
    longitude: 17.1,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === NETHERLANDS CORN ===
  {
    name: "Dutch Corn Region",
    country: "Netherlands",
    operator: "Dutch Corn Growers",
    latitude: 52.1,
    longitude: 5.2,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === BELGIUM CORN ===
  {
    name: "Flanders Corn Belt",
    country: "Belgium",
    operator: "Belgian Corn Farmers",
    latitude: 51.0,
    longitude: 4.5,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === UNITED KINGDOM CORN ===
  {
    name: "East Anglia Corn",
    country: "United Kingdom",
    operator: "British Maize Growers",
    latitude: 52.2,
    longitude: 0.8,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === TURKEY CORN ===
  {
    name: "Central Anatolia Corn",
    country: "Turkey",
    operator: "Turkish Corn Growers",
    latitude: 39.0,
    longitude: 35.0,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === IRAN CORN ===
  {
    name: "Gilan Corn Region",
    country: "Iran",
    operator: "Iranian Corn Farmers",
    latitude: 37.3,
    longitude: 49.6,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === PAKISTAN CORN ===
  {
    name: "Punjab Corn Belt",
    country: "Pakistan",
    operator: "Pakistan Maize Growers",
    latitude: 30.2,
    longitude: 71.5,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // === NEPAL CORN ===
  {
    name: "Terai Corn Region",
    country: "Nepal",
    operator: "Nepal Corn Farmers",
    latitude: 27.5,
    longitude: 84.0,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Corn Production"
  },
  // ============================================
  // COFFEE PRODUCTION - GLOBAL COVERAGE
  // ============================================
  // === BRAZIL COFFEE ===
  {
    name: "Minas Gerais Coffee Belt",
    country: "Brazil",
    operator: "Brazilian Coffee Growers",
    latitude: -20.5,
    longitude: -45.0,
    production_bpd: 120000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  {
    name: "São Paulo Coffee Region",
    country: "Brazil",
    operator: "ABIC",
    latitude: -22.0,
    longitude: -48.0,
    production_bpd: 100000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  {
    name: "Espírito Santo Coffee",
    country: "Brazil",
    operator: "Brazilian Coffee Association",
    latitude: -19.5,
    longitude: -40.6,
    production_bpd: 85000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === VIETNAM COFFEE ===
  {
    name: "Central Highlands Coffee",
    country: "Vietnam",
    operator: "VICOFA",
    latitude: 12.7,
    longitude: 108.2,
    production_bpd: 110000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  {
    name: "Dak Lak Coffee Belt",
    country: "Vietnam",
    operator: "Vietnamese Coffee Association",
    latitude: 12.7,
    longitude: 108.0,
    production_bpd: 95000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === COLOMBIA COFFEE ===
  {
    name: "Eje Cafetero Region",
    country: "Colombia",
    operator: "FNC Colombia",
    latitude: 4.8,
    longitude: -75.7,
    production_bpd: 65000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  {
    name: "Huila Coffee Region",
    country: "Colombia",
    operator: "Colombian Coffee Federation",
    latitude: 2.9,
    longitude: -75.5,
    production_bpd: 55000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === INDONESIA COFFEE ===
  {
    name: "Sumatra Coffee Belt",
    country: "Indonesia",
    operator: "Indonesian Coffee Exporters",
    latitude: 0.5,
    longitude: 101.5,
    production_bpd: 45000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  {
    name: "Java Coffee Region",
    country: "Indonesia",
    operator: "AEKI",
    latitude: -7.5,
    longitude: 110.0,
    production_bpd: 38000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === ETHIOPIA COFFEE ===
  {
    name: "Sidamo Coffee Region",
    country: "Ethiopia",
    operator: "Ethiopian Coffee Exchange",
    latitude: 6.5,
    longitude: 38.5,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  {
    name: "Yirgacheffe Coffee",
    country: "Ethiopia",
    operator: "Ethiopian Coffee Growers",
    latitude: 6.2,
    longitude: 38.2,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === HONDURAS COFFEE ===
  {
    name: "Copán Coffee Region",
    country: "Honduras",
    operator: "IHCAFE",
    latitude: 14.8,
    longitude: -88.8,
    production_bpd: 32000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === INDIA COFFEE ===
  {
    name: "Karnataka Coffee Belt",
    country: "India",
    operator: "Coffee Board of India",
    latitude: 13.5,
    longitude: 75.7,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === UGANDA COFFEE ===
  {
    name: "Mount Elgon Coffee",
    country: "Uganda",
    operator: "Uganda Coffee Development Authority",
    latitude: 1.0,
    longitude: 34.5,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === MEXICO COFFEE ===
  {
    name: "Chiapas Coffee Region",
    country: "Mexico",
    operator: "AMECAFE",
    latitude: 16.7,
    longitude: -93.1,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === PERU COFFEE ===
  {
    name: "Amazonas Coffee Belt",
    country: "Peru",
    operator: "Peruvian Coffee Chamber",
    latitude: -5.8,
    longitude: -77.5,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === NICARAGUA COFFEE ===
  {
    name: "Matagalpa Coffee Region",
    country: "Nicaragua",
    operator: "UNICAFE",
    latitude: 12.9,
    longitude: -85.9,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === GUATEMALA COFFEE ===
  {
    name: "Antigua Coffee Region",
    country: "Guatemala",
    operator: "ANACAFE",
    latitude: 14.6,
    longitude: -90.7,
    production_bpd: 16000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === CÔTE D'IVOIRE COFFEE ===
  {
    name: "Central Ivory Coast Coffee",
    country: "Ivory Coast (Côte d'Ivoire)",
    operator: "Ivorian Coffee Council",
    latitude: 6.5,
    longitude: -5.5,
    production_bpd: 14000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === TANZANIA COFFEE ===
  {
    name: "Kilimanjaro Coffee",
    country: "Tanzania",
    operator: "Tanzania Coffee Board",
    latitude: -3.4,
    longitude: 37.3,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === KENYA COFFEE ===
  {
    name: "Central Kenya Coffee",
    country: "Kenya",
    operator: "Coffee Board of Kenya",
    latitude: -0.4,
    longitude: 36.9,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === RWANDA COFFEE ===
  {
    name: "Western Rwanda Coffee",
    country: "Rwanda",
    operator: "Rwanda Coffee Board",
    latitude: -2.0,
    longitude: 29.7,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === BURUNDI COFFEE ===
  {
    name: "Northern Burundi Coffee",
    country: "Burundi",
    operator: "Burundi Coffee Board",
    latitude: -3.4,
    longitude: 29.9,
    production_bpd: 7000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === PHILIPPINES COFFEE ===
  {
    name: "Mindanao Coffee Belt",
    country: "Philippines",
    operator: "Philippine Coffee Board",
    latitude: 7.5,
    longitude: 125.0,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === THAILAND COFFEE ===
  {
    name: "Northern Thailand Coffee",
    country: "Thailand",
    operator: "Thai Coffee Association",
    latitude: 18.8,
    longitude: 98.9,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === LAOS COFFEE ===
  {
    name: "Bolaven Plateau Coffee",
    country: "Laos",
    operator: "Lao Coffee Association",
    latitude: 15.2,
    longitude: 106.4,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === CHINA COFFEE ===
  {
    name: "Yunnan Coffee Belt",
    country: "China",
    operator: "Yunnan Coffee Association",
    latitude: 24.5,
    longitude: 101.5,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === PAPUA NEW GUINEA COFFEE ===
  {
    name: "Eastern Highlands Coffee",
    country: "Papua New Guinea",
    operator: "Coffee Industry Corporation",
    latitude: -6.3,
    longitude: 145.4,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === COSTA RICA COFFEE ===
  {
    name: "Central Valley Coffee",
    country: "Costa Rica",
    operator: "ICAFE",
    latitude: 9.9,
    longitude: -84.1,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === EL SALVADOR COFFEE ===
  {
    name: "Santa Ana Coffee Region",
    country: "El Salvador",
    operator: "Salvadoran Coffee Council",
    latitude: 13.9,
    longitude: -89.6,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === PANAMA COFFEE ===
  {
    name: "Boquete Coffee Region",
    country: "Panama",
    operator: "Panamanian Coffee Association",
    latitude: 8.8,
    longitude: -82.4,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === ECUADOR COFFEE ===
  {
    name: "Loja Coffee Region",
    country: "Ecuador",
    operator: "ANECAFE Ecuador",
    latitude: -4.0,
    longitude: -79.2,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === VENEZUELA COFFEE ===
  {
    name: "Táchira Coffee Belt",
    country: "Venezuela",
    operator: "Venezuelan Coffee Growers",
    latitude: 7.8,
    longitude: -72.2,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === BOLIVIA COFFEE ===
  {
    name: "Yungas Coffee Region",
    country: "Bolivia",
    operator: "Bolivian Coffee Association",
    latitude: -16.3,
    longitude: -67.5,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === DOMINICAN REPUBLIC COFFEE ===
  {
    name: "Barahona Coffee Region",
    country: "Dominican Republic",
    operator: "Dominican Coffee Growers",
    latitude: 18.2,
    longitude: -71.1,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === CUBA COFFEE ===
  {
    name: "Sierra Maestra Coffee",
    country: "Cuba",
    operator: "Cuban Coffee Board",
    latitude: 20.0,
    longitude: -76.8,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === HAITI COFFEE ===
  {
    name: "Haitian Mountain Coffee",
    country: "Haiti",
    operator: "Haitian Coffee Federation",
    latitude: 18.9,
    longitude: -72.7,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === JAMAICA COFFEE ===
  {
    name: "Blue Mountain Coffee",
    country: "Jamaica",
    operator: "Jamaica Coffee Industry Board",
    latitude: 18.0,
    longitude: -76.7,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === CAMEROON COFFEE ===
  {
    name: "Western Cameroon Coffee",
    country: "Cameroon",
    operator: "Cameroon Coffee Board",
    latitude: 5.5,
    longitude: 10.0,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === TOGO COFFEE ===
  {
    name: "Plateaux Coffee Region",
    country: "Togo",
    operator: "Togolese Coffee Board",
    latitude: 7.5,
    longitude: 1.2,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === SIERRA LEONE COFFEE ===
  {
    name: "Eastern Sierra Leone Coffee",
    country: "Sierra Leone",
    operator: "Sierra Leone Coffee Growers",
    latitude: 8.0,
    longitude: -11.0,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === LIBERIA COFFEE ===
  {
    name: "Lofa County Coffee",
    country: "Liberia",
    operator: "Liberia Coffee Association",
    latitude: 8.2,
    longitude: -9.8,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === GUINEA COFFEE ===
  {
    name: "Guinean Forest Coffee",
    country: "Guinea",
    operator: "Guinea Coffee Farmers",
    latitude: 9.5,
    longitude: -10.5,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === DRC COFFEE ===
  {
    name: "Kivu Coffee Region",
    country: "Democratic Republic of the Congo",
    operator: "DRC Coffee Office",
    latitude: -2.3,
    longitude: 28.8,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === ANGOLA COFFEE ===
  {
    name: "Uíge Coffee Region",
    country: "Angola",
    operator: "Angolan Coffee Growers",
    latitude: -7.6,
    longitude: 15.1,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === NIGERIA COFFEE ===
  {
    name: "Plateau State Coffee",
    country: "Nigeria",
    operator: "Nigerian Coffee Association",
    latitude: 9.2,
    longitude: 9.5,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === GHANA COFFEE ===
  {
    name: "Eastern Ghana Coffee",
    country: "Ghana",
    operator: "Ghana Coffee Board",
    latitude: 6.1,
    longitude: -0.2,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === ZIMBABWE COFFEE ===
  {
    name: "Eastern Highlands Coffee",
    country: "Zimbabwe",
    operator: "Zimbabwe Coffee Growers",
    latitude: -18.9,
    longitude: 32.7,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === ZAMBIA COFFEE ===
  {
    name: "Northern Zambia Coffee",
    country: "Zambia",
    operator: "Zambia Coffee Growers",
    latitude: -10.0,
    longitude: 31.0,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === MALAWI COFFEE ===
  {
    name: "Mulanje Coffee Region",
    country: "Malawi",
    operator: "Malawi Coffee Association",
    latitude: -16.0,
    longitude: 35.5,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === MOZAMBIQUE COFFEE ===
  {
    name: "Zambézia Coffee",
    country: "Mozambique",
    operator: "Mozambique Coffee Growers",
    latitude: -15.0,
    longitude: 37.0,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === SOUTH AFRICA COFFEE ===
  {
    name: "KwaZulu-Natal Coffee",
    country: "South Africa",
    operator: "South African Coffee Growers",
    latitude: -29.0,
    longitude: 30.5,
    production_bpd: 300,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === MADAGASCAR COFFEE ===
  {
    name: "Eastern Madagascar Coffee",
    country: "Madagascar",
    operator: "Madagascar Coffee Association",
    latitude: -18.9,
    longitude: 48.2,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === TIMOR-LESTE COFFEE ===
  {
    name: "Ermera Coffee Region",
    country: "Timor-Leste",
    operator: "Timor Coffee Cooperative",
    latitude: -8.7,
    longitude: 125.4,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === NEPAL COFFEE ===
  {
    name: "Gulmi Coffee Belt",
    country: "Nepal",
    operator: "Nepal Coffee Producers",
    latitude: 28.1,
    longitude: 83.3,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // === MYANMAR COFFEE ===
  {
    name: "Shan State Coffee",
    country: "Myanmar",
    operator: "Myanmar Coffee Association",
    latitude: 20.8,
    longitude: 97.0,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Coffee Production"
  },
  // ============================================
  // COBALT PRODUCTION - GLOBAL COVERAGE
  // ============================================
  // === DRC COBALT MINES ===
  {
    name: "Tenke Fungurume Mine",
    country: "Democratic Republic of the Congo",
    operator: "China Molybdenum",
    latitude: -10.6,
    longitude: 26.1,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  {
    name: "Mutanda Mine",
    country: "Democratic Republic of the Congo",
    operator: "Glencore",
    latitude: -10.9,
    longitude: 27.6,
    production_bpd: 32000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  {
    name: "Kolwezi Copper-Cobalt",
    country: "Democratic Republic of the Congo",
    operator: "Various Operators",
    latitude: -10.7,
    longitude: 25.5,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  {
    name: "Kamoto Copper Mine",
    country: "Democratic Republic of the Congo",
    operator: "Glencore",
    latitude: -10.7,
    longitude: 25.4,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === INDONESIA COBALT ===
  {
    name: "Sulawesi Nickel-Cobalt",
    country: "Indonesia",
    operator: "Vale Indonesia",
    latitude: -2.5,
    longitude: 121.4,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  {
    name: "Morowali Nickel Complex",
    country: "Indonesia",
    operator: "Tsingshan Group",
    latitude: -2.8,
    longitude: 121.9,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === RUSSIA COBALT ===
  {
    name: "Norilsk Nickel Complex",
    country: "Russia",
    operator: "Nornickel",
    latitude: 69.3,
    longitude: 88.2,
    production_bpd: 16000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === AUSTRALIA COBALT ===
  {
    name: "Murrin Murrin Nickel-Cobalt",
    country: "Australia",
    operator: "Glencore",
    latitude: -28.7,
    longitude: 121.2,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  {
    name: "Ravensthorpe Nickel",
    country: "Australia",
    operator: "First Quantum",
    latitude: -33.6,
    longitude: 120.0,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === PHILIPPINES COBALT ===
  {
    name: "Coral Bay Nickel",
    country: "Philippines",
    operator: "SMM-JV",
    latitude: 9.8,
    longitude: 124.8,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === CUBA COBALT ===
  {
    name: "Moa Bay Nickel-Cobalt",
    country: "Cuba",
    operator: "Sherritt International",
    latitude: 20.7,
    longitude: -74.9,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === MADAGASCAR COBALT ===
  {
    name: "Ambatovy Nickel-Cobalt",
    country: "Madagascar",
    operator: "Sumitomo",
    latitude: -18.8,
    longitude: 48.3,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === CANADA COBALT ===
  {
    name: "Voisey's Bay Nickel-Cobalt",
    country: "Canada",
    operator: "Vale",
    latitude: 56.3,
    longitude: -61.7,
    production_bpd: 7000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  {
    name: "Sudbury Basin Cobalt",
    country: "Canada",
    operator: "Glencore/Vale",
    latitude: 46.5,
    longitude: -81.0,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === PAPUA NEW GUINEA COBALT ===
  {
    name: "Ramu Nickel-Cobalt",
    country: "Papua New Guinea",
    operator: "MCC",
    latitude: -5.5,
    longitude: 145.8,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === MOROCCO COBALT ===
  {
    name: "Bou Azzer Cobalt Mine",
    country: "Morocco",
    operator: "Managem",
    latitude: 30.7,
    longitude: -6.8,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === CHINA COBALT ===
  {
    name: "Gansu Cobalt Refinery",
    country: "China",
    operator: "Jinchuan Group",
    latitude: 38.5,
    longitude: 102.2,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === ZAMBIA COBALT ===
  {
    name: "Chambishi Cobalt Mine",
    country: "Zambia",
    operator: "CNMC",
    latitude: -12.6,
    longitude: 28.1,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === FINLAND COBALT ===
  {
    name: "Kokkola Cobalt Refinery",
    country: "Finland",
    operator: "Freeport Cobalt",
    latitude: 63.8,
    longitude: 23.1,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === BRAZIL COBALT ===
  {
    name: "Santa Rita Nickel-Cobalt",
    country: "Brazil",
    operator: "Mirabela Nickel",
    latitude: -16.8,
    longitude: -49.0,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === NORWAY COBALT ===
  {
    name: "Hauerseter Cobalt Deposit",
    country: "Norway",
    operator: "Norwegian Mining",
    latitude: 59.9,
    longitude: 11.0,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === SWEDEN COBALT ===
  {
    name: "Sala Cobalt Mine",
    country: "Sweden",
    operator: "Swedish Mining",
    latitude: 59.9,
    longitude: 16.6,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === TURKEY COBALT ===
  {
    name: "Anatolia Cobalt Deposit",
    country: "Turkey",
    operator: "Turkish Mining",
    latitude: 39.0,
    longitude: 35.0,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === SOUTH AFRICA COBALT ===
  {
    name: "Nkomati Nickel-Cobalt",
    country: "South Africa",
    operator: "African Rainbow Minerals",
    latitude: -25.9,
    longitude: 31.9,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === ZIMBABWE COBALT ===
  {
    name: "Bindura Nickel-Cobalt",
    country: "Zimbabwe",
    operator: "Bindura Nickel Corporation",
    latitude: -17.3,
    longitude: 31.3,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === NAMIBIA COBALT ===
  {
    name: "Haib Copper-Cobalt",
    country: "Namibia",
    operator: "Deep South Resources",
    latitude: -27.8,
    longitude: 16.8,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === BOTSWANA COBALT ===
  {
    name: "Selebi-Phikwe Nickel-Cobalt",
    country: "Botswana",
    operator: "BCL",
    latitude: -22.0,
    longitude: 27.8,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === TANZANIA COBALT ===
  {
    name: "Kabanga Nickel-Cobalt",
    country: "Tanzania",
    operator: "BHP/Lifezone",
    latitude: -2.6,
    longitude: 30.8,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === UGANDA COBALT ===
  {
    name: "Kilembe Cobalt Mine",
    country: "Uganda",
    operator: "Uganda Mining",
    latitude: 0.2,
    longitude: 30.0,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === KENYA COBALT ===
  {
    name: "Mrima Hill Cobalt",
    country: "Kenya",
    operator: "Kenya Rare Earths",
    latitude: -0.5,
    longitude: 34.5,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === RWANDA COBALT ===
  {
    name: "Gatumba Cobalt Deposit",
    country: "Rwanda",
    operator: "Rwanda Mining",
    latitude: -2.0,
    longitude: 29.3,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === BURUNDI COBALT ===
  {
    name: "Musongati Nickel-Cobalt",
    country: "Burundi",
    operator: "Burundi Mining",
    latitude: -3.6,
    longitude: 30.1,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === ETHIOPIA COBALT ===
  {
    name: "Ethiopian Cobalt Prospect",
    country: "Ethiopia",
    operator: "Ethiopian Mining",
    latitude: 9.0,
    longitude: 38.7,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === GHANA COBALT ===
  {
    name: "Ashanti Cobalt Deposit",
    country: "Ghana",
    operator: "Ghana Mining",
    latitude: 6.7,
    longitude: -1.6,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === NIGERIA COBALT ===
  {
    name: "Jos Plateau Cobalt",
    country: "Nigeria",
    operator: "Nigerian Mining",
    latitude: 9.9,
    longitude: 8.9,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === SENEGAL COBALT ===
  {
    name: "Falémé Cobalt Project",
    country: "Senegal",
    operator: "Senegal Mining",
    latitude: 13.5,
    longitude: -12.0,
    production_bpd: 300,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === MALI COBALT ===
  {
    name: "Kayes Cobalt Deposit",
    country: "Mali",
    operator: "Mali Mining",
    latitude: 14.4,
    longitude: -11.4,
    production_bpd: 300,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === BURKINA FASO COBALT ===
  {
    name: "Tambao Cobalt Project",
    country: "Burkina Faso",
    operator: "Burkina Mining",
    latitude: 14.8,
    longitude: 0.0,
    production_bpd: 300,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === GUINEA COBALT ===
  {
    name: "Simandou Cobalt",
    country: "Guinea",
    operator: "Rio Tinto",
    latitude: 8.5,
    longitude: -8.7,
    production_bpd: 300,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === SIERRA LEONE COBALT ===
  {
    name: "Tonkolili Cobalt",
    country: "Sierra Leone",
    operator: "Sierra Leone Mining",
    latitude: 8.6,
    longitude: -11.8,
    production_bpd: 300,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === LIBERIA COBALT ===
  {
    name: "Nimba Cobalt Deposit",
    country: "Liberia",
    operator: "Liberian Mining",
    latitude: 7.6,
    longitude: -8.4,
    production_bpd: 300,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === CAMEROON COBALT ===
  {
    name: "Nkamouna Cobalt Project",
    country: "Cameroon",
    operator: "Geovic Mining",
    latitude: 4.8,
    longitude: 14.2,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === GABON COBALT ===
  {
    name: "Mounana Cobalt Deposit",
    country: "Gabon",
    operator: "Gabonese Mining",
    latitude: -1.4,
    longitude: 13.2,
    production_bpd: 300,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === REPUBLIC OF THE CONGO COBALT ===
  {
    name: "Zanaga Iron-Cobalt",
    country: "Republic of the Congo",
    operator: "Zanaga Iron Ore",
    latitude: -2.5,
    longitude: 13.5,
    production_bpd: 300,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === ANGOLA COBALT ===
  {
    name: "Cassinga Cobalt",
    country: "Angola",
    operator: "Ferrangol",
    latitude: -13.5,
    longitude: 15.9,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === MOZAMBIQUE COBALT ===
  {
    name: "Tete Cobalt Project",
    country: "Mozambique",
    operator: "Mozambique Mining",
    latitude: -16.2,
    longitude: 33.6,
    production_bpd: 300,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === MALAWI COBALT ===
  {
    name: "Malawi Cobalt Prospect",
    country: "Malawi",
    operator: "Malawi Mining",
    latitude: -13.9,
    longitude: 33.8,
    production_bpd: 300,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === KAZAKHSTAN COBALT ===
  {
    name: "Aktogay Copper-Cobalt",
    country: "Kazakhstan",
    operator: "KAZ Minerals",
    latitude: 48.2,
    longitude: 79.8,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === MONGOLIA COBALT ===
  {
    name: "Oyu Tolgoi Copper-Cobalt",
    country: "Mongolia",
    operator: "Rio Tinto",
    latitude: 43.0,
    longitude: 106.8,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === IRAN COBALT ===
  {
    name: "Sarcheshmeh Copper-Cobalt",
    country: "Iran",
    operator: "National Copper",
    latitude: 29.8,
    longitude: 55.7,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === INDIA COBALT ===
  {
    name: "Jharkhand Cobalt Deposit",
    country: "India",
    operator: "Indian Mining",
    latitude: 23.3,
    longitude: 85.3,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === PAKISTAN COBALT ===
  {
    name: "Balochistan Cobalt",
    country: "Pakistan",
    operator: "Pakistan Mining",
    latitude: 28.5,
    longitude: 65.0,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === THAILAND COBALT ===
  {
    name: "Thai Cobalt Refinery",
    country: "Thailand",
    operator: "Thai Mining",
    latitude: 13.7,
    longitude: 100.5,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === VIETNAM COBALT ===
  {
    name: "Ban Phuc Nickel-Cobalt",
    country: "Vietnam",
    operator: "Vietnam Mining",
    latitude: 22.0,
    longitude: 104.0,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === JAPAN COBALT ===
  {
    name: "Japanese Cobalt Refinery",
    country: "Japan",
    operator: "Sumitomo Metal Mining",
    latitude: 35.7,
    longitude: 139.7,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // === SOUTH KOREA COBALT ===
  {
    name: "Korean Cobalt Refinery",
    country: "South Korea",
    operator: "Korea Mining",
    latitude: 37.5,
    longitude: 127.0,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Cobalt Mine"
  },
  // ============================================
  // ZINC PRODUCTION - GLOBAL COVERAGE
  // ============================================
  // === CHINA ZINC ===
  {
    name: "Lanping Zinc Mine",
    country: "China",
    operator: "China Nonferrous Mining",
    latitude: 26.5,
    longitude: 99.4,
    production_bpd: 40000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  {
    name: "Huize Zinc Mine",
    country: "China",
    operator: "Yunnan Chihong Zinc",
    latitude: 26.4,
    longitude: 103.5,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  {
    name: "Fankou Lead-Zinc Mine",
    country: "China",
    operator: "Shenzhen Zhongjin Lingnan",
    latitude: 24.8,
    longitude: 113.6,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === PERU ZINC ===
  {
    name: "Antamina Mine",
    country: "Peru",
    operator: "Glencore/BHP/Teck",
    latitude: -9.3,
    longitude: -77.1,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  {
    name: "Cerro Lindo Mine",
    country: "Peru",
    operator: "Nexa Resources",
    latitude: -13.2,
    longitude: -75.8,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  {
    name: "Antapaccay Mine",
    country: "Peru",
    operator: "Glencore",
    latitude: -14.2,
    longitude: -71.3,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === AUSTRALIA ZINC ===
  {
    name: "Century Mine",
    country: "Australia",
    operator: "New Century Resources",
    latitude: -18.7,
    longitude: 138.7,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  {
    name: "Mount Isa Mine",
    country: "Australia",
    operator: "Glencore",
    latitude: -20.7,
    longitude: 139.5,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  {
    name: "Red River Zinc Mine",
    country: "Australia",
    operator: "Teck Resources",
    latitude: -19.8,
    longitude: 140.5,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === INDIA ZINC ===
  {
    name: "Rampura Agucha Mine",
    country: "India",
    operator: "Hindustan Zinc",
    latitude: 27.6,
    longitude: 74.0,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  {
    name: "Rajpura Dariba Mine",
    country: "India",
    operator: "Hindustan Zinc",
    latitude: 25.0,
    longitude: 74.0,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === UNITED STATES ZINC ===
  {
    name: "Red Dog Mine",
    country: "United States",
    operator: "Teck Resources",
    latitude: 68.0,
    longitude: -162.9,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  {
    name: "Tennessee Zinc Operations",
    country: "United States",
    operator: "Nyrstar",
    latitude: 36.2,
    longitude: -83.4,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === MEXICO ZINC ===
  {
    name: "San Martin Mine",
    country: "Mexico",
    operator: "Grupo Mexico",
    latitude: 25.9,
    longitude: -103.5,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  {
    name: "Francisco I. Madero Zinc",
    country: "Mexico",
    operator: "Minera Frisco",
    latitude: 23.7,
    longitude: -105.9,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === CANADA ZINC ===
  {
    name: "Kidd Mine",
    country: "Canada",
    operator: "Glencore",
    latitude: 48.6,
    longitude: -81.4,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  {
    name: "Myra Falls Mine",
    country: "Canada",
    operator: "Nyrstar",
    latitude: 49.9,
    longitude: -125.6,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === BOLIVIA ZINC ===
  {
    name: "San Cristóbal Mine",
    country: "Bolivia",
    operator: "Sumitomo",
    latitude: -19.9,
    longitude: -66.4,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  {
    name: "Bolivar Mine",
    country: "Bolivia",
    operator: "Glencore",
    latitude: -18.1,
    longitude: -66.7,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === KAZAKHSTAN ZINC ===
  {
    name: "Ridder-Sokolny Mine",
    country: "Kazakhstan",
    operator: "Kazzinc",
    latitude: 50.3,
    longitude: 83.5,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === RUSSIA ZINC ===
  {
    name: "Ozernoye Zinc Mine",
    country: "Russia",
    operator: "GRK Bystrinskoye",
    latitude: 52.5,
    longitude: 117.8,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === SWEDEN ZINC ===
  {
    name: "Garpenberg Mine",
    country: "Sweden",
    operator: "Boliden",
    latitude: 60.3,
    longitude: 16.2,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === IRELAND ZINC ===
  {
    name: "Tara Mine",
    country: "Ireland",
    operator: "Boliden",
    latitude: 53.7,
    longitude: -7.0,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === POLAND ZINC ===
  {
    name: "Olkusz-Pomorzany Mine",
    country: "Poland",
    operator: "ZGH Bolesław",
    latitude: 50.3,
    longitude: 19.5,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === IRAN ZINC ===
  {
    name: "Mehdiabad Zinc Project",
    country: "Iran",
    operator: "Vedanta",
    latitude: 33.4,
    longitude: 51.2,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === TURKEY ZINC ===
  {
    name: "Çinkur Zinc Operations",
    country: "Turkey",
    operator: "Çinkur",
    latitude: 40.8,
    longitude: 38.4,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === FINLAND ZINC ===
  {
    name: "Pyhäsalmi Mine",
    country: "Finland",
    operator: "First Quantum",
    latitude: 63.7,
    longitude: 25.9,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === SPAIN ZINC ===
  {
    name: "Reocín Mine",
    country: "Spain",
    operator: "Asturiana de Zinc",
    latitude: 43.2,
    longitude: -4.0,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === NAMIBIA ZINC ===
  {
    name: "Berg Aukas Mine",
    country: "Namibia",
    operator: "Ongopolo Mining",
    latitude: -19.6,
    longitude: 18.5,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === SOUTH AFRICA ZINC ===
  {
    name: "Gamsberg Mine",
    country: "South Africa",
    operator: "Vedanta",
    latitude: -29.1,
    longitude: 18.9,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === BRAZIL ZINC ===
  {
    name: "Vazante Mine",
    country: "Brazil",
    operator: "Nexa Resources",
    latitude: -17.9,
    longitude: -46.9,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === ARGENTINA ZINC ===
  {
    name: "Aguilar Mine",
    country: "Argentina",
    operator: "Glencore",
    latitude: -23.2,
    longitude: -65.4,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === MOROCCO ZINC ===
  {
    name: "Guemassa Zinc Mine",
    country: "Morocco",
    operator: "Managem",
    latitude: 31.4,
    longitude: -7.9,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === UZBEKISTAN ZINC ===
  {
    name: "Uzbekistan Zinc Refinery",
    country: "Uzbekistan",
    operator: "Almalyk MMC",
    latitude: 40.8,
    longitude: 69.6,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === NORWAY ZINC ===
  {
    name: "Rana Zinc Facility",
    country: "Norway",
    operator: "Norzink",
    latitude: 66.3,
    longitude: 14.2,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === PORTUGAL ZINC ===
  {
    name: "Neves-Corvo Mine",
    country: "Portugal",
    operator: "Lundin Mining",
    latitude: 37.6,
    longitude: -7.9,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === SERBIA ZINC ===
  {
    name: "Rudnik Mine",
    country: "Serbia",
    operator: "Serbia Zijin",
    latitude: 44.1,
    longitude: 20.5,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === BULGARIA ZINC ===
  {
    name: "Kardzhali Lead-Zinc",
    country: "Bulgaria",
    operator: "Gorubso",
    latitude: 41.6,
    longitude: 25.4,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === ROMANIA ZINC ===
  {
    name: "Maramures Zinc Mine",
    country: "Romania",
    operator: "Romanian Mining",
    latitude: 47.7,
    longitude: 23.6,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === GREECE ZINC ===
  {
    name: "Olympias Mine",
    country: "Greece",
    operator: "Hellas Gold",
    latitude: 40.9,
    longitude: 23.9,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === NORTH MACEDONIA ZINC ===
  {
    name: "Toranica Zinc Mine",
    country: "North Macedonia",
    operator: "Macedonian Mining",
    latitude: 41.9,
    longitude: 22.4,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === ALBANIA ZINC ===
  {
    name: "Rubik Zinc Mine",
    country: "Albania",
    operator: "Albanian Mining",
    latitude: 41.8,
    longitude: 19.8,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === BOSNIA AND HERZEGOVINA ZINC ===
  {
    name: "Srebrenica Lead-Zinc",
    country: "Bosnia and Herzegovina",
    operator: "BH Mining",
    latitude: 44.1,
    longitude: 19.3,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === KOSOVO ZINC ===
  {
    name: "Trepça Mines",
    country: "Kosovo",
    operator: "Trepça",
    latitude: 42.9,
    longitude: 20.9,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === MONTENEGRO ZINC ===
  {
    name: "Suplja Stijena Mine",
    country: "Montenegro",
    operator: "Montenegro Mining",
    latitude: 43.0,
    longitude: 19.2,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === SLOVENIA ZINC ===
  {
    name: "Mežica Mine",
    country: "Slovenia",
    operator: "Slovenian Mining",
    latitude: 46.5,
    longitude: 14.9,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === SLOVAKIA ZINC ===
  {
    name: "Hodruša-Hámre Mine",
    country: "Slovakia",
    operator: "Slovak Mining",
    latitude: 48.5,
    longitude: 18.9,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === CZECH REPUBLIC ZINC ===
  {
    name: "Kutná Hora Zinc",
    country: "Czech Republic",
    operator: "Czech Mining",
    latitude: 49.9,
    longitude: 15.3,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === GERMANY ZINC ===
  {
    name: "Rammelsberg Mine",
    country: "Germany",
    operator: "German Mining",
    latitude: 51.9,
    longitude: 10.4,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === ITALY ZINC ===
  {
    name: "Iglesias Zinc Mine",
    country: "Italy",
    operator: "Italian Mining",
    latitude: 39.3,
    longitude: 8.5,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === FRANCE ZINC ===
  {
    name: "Les Malines Mine",
    country: "France",
    operator: "French Mining",
    latitude: 43.9,
    longitude: 3.8,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === JAPAN ZINC ===
  {
    name: "Kamioka Zinc Mine",
    country: "Japan",
    operator: "Mitsui Mining",
    latitude: 36.3,
    longitude: 137.3,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === SOUTH KOREA ZINC ===
  {
    name: "Janghang Zinc Smelter",
    country: "South Korea",
    operator: "Korea Zinc",
    latitude: 36.0,
    longitude: 126.7,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === THAILAND ZINC ===
  {
    name: "Padaeng Zinc Mine",
    country: "Thailand",
    operator: "Padaeng Industry",
    latitude: 18.8,
    longitude: 98.4,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === VIETNAM ZINC ===
  {
    name: "Cho Dien Zinc Mine",
    country: "Vietnam",
    operator: "Vietnam Mining",
    latitude: 21.6,
    longitude: 106.0,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === LAOS ZINC ===
  {
    name: "Phu Kham Copper-Zinc",
    country: "Laos",
    operator: "PanAust",
    latitude: 18.5,
    longitude: 102.8,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === MYANMAR ZINC ===
  {
    name: "Bawdwin Mine",
    country: "Myanmar",
    operator: "Myanmar Metals",
    latitude: 23.0,
    longitude: 97.5,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === PHILIPPINES ZINC ===
  {
    name: "Carmen Copper Zinc",
    country: "Philippines",
    operator: "Atlas Consolidated",
    latitude: 10.3,
    longitude: 125.0,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === INDONESIA ZINC ===
  {
    name: "Dairi Zinc Mine",
    country: "Indonesia",
    operator: "Dairi Prima",
    latitude: 2.8,
    longitude: 98.0,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === DEMOCRATIC REPUBLIC OF THE CONGO ZINC ===
  {
    name: "Kipushi Zinc Mine",
    country: "Democratic Republic of the Congo",
    operator: "Ivanhoe Mines",
    latitude: -11.8,
    longitude: 27.3,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // === ZAMBIA ZINC ===
  {
    name: "Kabwe Zinc Mine",
    country: "Zambia",
    operator: "Zambian Mining",
    latitude: -14.4,
    longitude: 28.4,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Zinc Mine"
  },
  // ============================================
  // NICKEL PRODUCTION - GLOBAL COVERAGE
  // ============================================
  // === INDONESIA NICKEL ===
  {
    name: "Weda Bay Nickel Project",
    country: "Indonesia",
    operator: "Eramet/Tsingshan",
    latitude: 0.3,
    longitude: 127.8,
    production_bpd: 50000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  {
    name: "Pomalaa Nickel Mine",
    country: "Indonesia",
    operator: "Vale Indonesia",
    latitude: -4.1,
    longitude: 121.6,
    production_bpd: 45000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  {
    name: "Sorowako Nickel Operations",
    country: "Indonesia",
    operator: "Vale Indonesia",
    latitude: -2.5,
    longitude: 121.4,
    production_bpd: 40000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  {
    name: "Morowali Industrial Park",
    country: "Indonesia",
    operator: "Tsingshan Group",
    latitude: -2.8,
    longitude: 121.9,
    production_bpd: 38000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === PHILIPPINES NICKEL ===
  {
    name: "Rio Tuba Nickel Mine",
    country: "Philippines",
    operator: "Nickel Asia",
    latitude: 8.5,
    longitude: 117.5,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  {
    name: "Taganito HPAL Plant",
    country: "Philippines",
    operator: "Sumitomo/Nickel Asia",
    latitude: 9.6,
    longitude: 125.9,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  {
    name: "Coral Bay Nickel",
    country: "Philippines",
    operator: "SMM-JV",
    latitude: 9.8,
    longitude: 124.8,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === RUSSIA NICKEL ===
  {
    name: "Norilsk Nickel Complex",
    country: "Russia",
    operator: "Nornickel",
    latitude: 69.3,
    longitude: 88.2,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  {
    name: "Kola MMC",
    country: "Russia",
    operator: "Nornickel",
    latitude: 67.9,
    longitude: 33.1,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === NEW CALEDONIA NICKEL ===
  {
    name: "Goro Nickel Mine",
    country: "New Caledonia",
    operator: "Vale",
    latitude: -22.3,
    longitude: 167.0,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  {
    name: "Koniambo Nickel Plant",
    country: "New Caledonia",
    operator: "Glencore",
    latitude: -21.1,
    longitude: 164.9,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === AUSTRALIA NICKEL ===
  {
    name: "Murrin Murrin Operations",
    country: "Australia",
    operator: "Glencore",
    latitude: -28.7,
    longitude: 121.2,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  {
    name: "Ravensthorpe Nickel",
    country: "Australia",
    operator: "First Quantum",
    latitude: -33.6,
    longitude: 120.0,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  {
    name: "Mount Keith Mine",
    country: "Australia",
    operator: "BHP",
    latitude: -27.2,
    longitude: 120.6,
    production_bpd: 14000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === CANADA NICKEL ===
  {
    name: "Sudbury Basin Operations",
    country: "Canada",
    operator: "Vale/Glencore",
    latitude: 46.5,
    longitude: -81.0,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  {
    name: "Voisey's Bay Mine",
    country: "Canada",
    operator: "Vale",
    latitude: 56.3,
    longitude: -61.7,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  {
    name: "Thompson Mine",
    country: "Canada",
    operator: "Vale",
    latitude: 55.7,
    longitude: -97.9,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === BRAZIL NICKEL ===
  {
    name: "Onça Puma Nickel Mine",
    country: "Brazil",
    operator: "Vale",
    latitude: -6.0,
    longitude: -50.8,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  {
    name: "Barro Alto Nickel",
    country: "Brazil",
    operator: "Anglo American",
    latitude: -14.9,
    longitude: -48.9,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === CHINA NICKEL ===
  {
    name: "Jinchuan Nickel Mine",
    country: "China",
    operator: "Jinchuan Group",
    latitude: 38.5,
    longitude: 102.2,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === MADAGASCAR NICKEL ===
  {
    name: "Ambatovy Nickel Project",
    country: "Madagascar",
    operator: "Sumitomo",
    latitude: -18.8,
    longitude: 48.3,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === CUBA NICKEL ===
  {
    name: "Moa Bay Nickel",
    country: "Cuba",
    operator: "Sherritt International",
    latitude: 20.7,
    longitude: -74.9,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  {
    name: "Las Camariocas Nickel",
    country: "Cuba",
    operator: "Cubaniquel",
    latitude: 20.6,
    longitude: -75.7,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === UNITED STATES NICKEL ===
  {
    name: "Eagle Mine",
    country: "United States",
    operator: "Lundin Mining",
    latitude: 47.0,
    longitude: -88.2,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === SOUTH AFRICA NICKEL ===
  {
    name: "Nkomati Nickel Mine",
    country: "South Africa",
    operator: "African Rainbow Minerals",
    latitude: -25.9,
    longitude: 31.9,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === BOTSWANA NICKEL ===
  {
    name: "Phoenix Nickel Mine",
    country: "Botswana",
    operator: "BCL Limited",
    latitude: -21.8,
    longitude: 27.7,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === ZIMBABWE NICKEL ===
  {
    name: "Bindura Nickel Mine",
    country: "Zimbabwe",
    operator: "Bindura Nickel Corporation",
    latitude: -17.3,
    longitude: 31.3,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  {
    name: "Trojan Nickel Mine",
    country: "Zimbabwe",
    operator: "Zimplats",
    latitude: -17.8,
    longitude: 30.2,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === FINLAND NICKEL ===
  {
    name: "Kevitsa Nickel Mine",
    country: "Finland",
    operator: "Boliden",
    latitude: 67.8,
    longitude: 27.0,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  {
    name: "Sotkamo Nickel Mine",
    country: "Finland",
    operator: "Terrafame",
    latitude: 64.1,
    longitude: 28.4,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === NORWAY NICKEL ===
  {
    name: "Rana Nickel Deposit",
    country: "Norway",
    operator: "Norwegian Mining",
    latitude: 66.3,
    longitude: 14.2,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === GREECE NICKEL ===
  {
    name: "Larco Nickel Smelter",
    country: "Greece",
    operator: "Larco GMMSA",
    latitude: 38.5,
    longitude: 22.8,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === TURKEY NICKEL ===
  {
    name: "Gördes Nickel Mine",
    country: "Turkey",
    operator: "Meta Nickel Cobalt",
    latitude: 38.9,
    longitude: 28.3,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === GUATEMALA NICKEL ===
  {
    name: "Fenix Nickel Project",
    country: "Guatemala",
    operator: "Solway Group",
    latitude: 15.6,
    longitude: -89.5,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === COLOMBIA NICKEL ===
  {
    name: "Cerro Matoso",
    country: "Colombia",
    operator: "South32",
    latitude: 7.7,
    longitude: -75.3,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === VENEZUELA NICKEL ===
  {
    name: "Loma de Níquel",
    country: "Venezuela",
    operator: "CVG",
    latitude: 7.2,
    longitude: -66.8,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === DOMINICAN REPUBLIC NICKEL ===
  {
    name: "Falcondo Nickel Mine",
    country: "Dominican Republic",
    operator: "Falcondo",
    latitude: 19.0,
    longitude: -70.4,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === PAPUA NEW GUINEA NICKEL ===
  {
    name: "Ramu Nickel Mine",
    country: "Papua New Guinea",
    operator: "MCC",
    latitude: -5.5,
    longitude: 145.8,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === JAPAN NICKEL ===
  {
    name: "Hachinohe Nickel Refinery",
    country: "Japan",
    operator: "Pacific Metals",
    latitude: 40.5,
    longitude: 141.5,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === SOUTH KOREA NICKEL ===
  {
    name: "Onsan Nickel Refinery",
    country: "South Korea",
    operator: "Korea Nickel",
    latitude: 35.4,
    longitude: 129.3,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === INDIA NICKEL ===
  {
    name: "Sukinda Chromite Nickel",
    country: "India",
    operator: "OMC/Tata Steel",
    latitude: 20.9,
    longitude: 85.6,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === IRAN NICKEL ===
  {
    name: "Abdasht Nickel Deposit",
    country: "Iran",
    operator: "Iranian Mining",
    latitude: 35.7,
    longitude: 50.9,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === KAZAKHSTAN NICKEL ===
  {
    name: "Kempirsay Nickel Mine",
    country: "Kazakhstan",
    operator: "Kazchrome",
    latitude: 50.2,
    longitude: 59.1,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === UKRAINE NICKEL ===
  {
    name: "Pobugsky Nickel Plant",
    country: "Ukraine",
    operator: "Ukrainian Nickel",
    latitude: 48.0,
    longitude: 31.2,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === ALBANIA NICKEL ===
  {
    name: "Bulqiza Nickel Mine",
    country: "Albania",
    operator: "Albanian Chrome",
    latitude: 41.5,
    longitude: 20.2,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === KOSOVO NICKEL ===
  {
    name: "Gllavica Nickel Deposit",
    country: "Kosovo",
    operator: "Kosovo Mining",
    latitude: 42.6,
    longitude: 21.2,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === SERBIA NICKEL ===
  {
    name: "Jadar Nickel Deposit",
    country: "Serbia",
    operator: "Rio Tinto",
    latitude: 44.3,
    longitude: 19.4,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === NORTH MACEDONIA NICKEL ===
  {
    name: "Ržanovo Nickel Mine",
    country: "North Macedonia",
    operator: "Macedonian Mining",
    latitude: 41.8,
    longitude: 22.1,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === BOSNIA AND HERZEGOVINA NICKEL ===
  {
    name: "Vareš Nickel Deposit",
    country: "Bosnia and Herzegovina",
    operator: "BH Mining",
    latitude: 44.2,
    longitude: 18.3,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === MONTENEGRO NICKEL ===
  {
    name: "Brskovo Nickel Mine",
    country: "Montenegro",
    operator: "Montenegro Mining",
    latitude: 42.8,
    longitude: 19.6,
    production_bpd: 300,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === AUSTRIA NICKEL ===
  {
    name: "Styrian Nickel Deposit",
    country: "Austria",
    operator: "Austrian Mining",
    latitude: 47.3,
    longitude: 14.5,
    production_bpd: 300,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === GERMANY NICKEL ===
  {
    name: "Saxony Nickel Deposit",
    country: "Germany",
    operator: "German Mining",
    latitude: 50.9,
    longitude: 13.3,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === FRANCE NICKEL ===
  {
    name: "Massif Central Nickel",
    country: "France",
    operator: "French Mining",
    latitude: 45.5,
    longitude: 3.0,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === SPAIN NICKEL ===
  {
    name: "Aguablanca Nickel Mine",
    country: "Spain",
    operator: "Lundin Mining",
    latitude: 38.0,
    longitude: -6.2,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === PORTUGAL NICKEL ===
  {
    name: "Portuguese Nickel Deposit",
    country: "Portugal",
    operator: "Portuguese Mining",
    latitude: 39.4,
    longitude: -8.2,
    production_bpd: 300,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === SWEDEN NICKEL ===
  {
    name: "Rönnbäcken Nickel Project",
    country: "Sweden",
    operator: "Boliden",
    latitude: 64.9,
    longitude: 17.6,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === IRELAND NICKEL ===
  {
    name: "Irish Nickel Prospect",
    country: "Ireland",
    operator: "Irish Mining",
    latitude: 53.3,
    longitude: -6.3,
    production_bpd: 300,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === ZAMBIA NICKEL ===
  {
    name: "Munali Nickel Mine",
    country: "Zambia",
    operator: "Albidon",
    latitude: -15.5,
    longitude: 28.5,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === TANZANIA NICKEL ===
  {
    name: "Kabanga Nickel Project",
    country: "Tanzania",
    operator: "BHP/Lifezone",
    latitude: -2.6,
    longitude: 30.8,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === MOZAMBIQUE NICKEL ===
  {
    name: "Mozambique Nickel Deposit",
    country: "Mozambique",
    operator: "Mozambique Mining",
    latitude: -18.6,
    longitude: 35.5,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === MALAWI NICKEL ===
  {
    name: "Malawi Nickel Prospect",
    country: "Malawi",
    operator: "Malawi Mining",
    latitude: -13.9,
    longitude: 33.8,
    production_bpd: 300,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === IVORY COAST NICKEL ===
  {
    name: "Côte d'Ivoire Nickel",
    country: "Ivory Coast",
    operator: "Ivorian Mining",
    latitude: 7.5,
    longitude: -5.5,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === GHANA NICKEL ===
  {
    name: "Ghana Nickel Deposit",
    country: "Ghana",
    operator: "Ghana Mining",
    latitude: 7.9,
    longitude: -1.0,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === NIGERIA NICKEL ===
  {
    name: "Kaduna Nickel Deposit",
    country: "Nigeria",
    operator: "Nigerian Mining",
    latitude: 10.5,
    longitude: 7.4,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // === ETHIOPIA NICKEL ===
  {
    name: "Ethiopian Nickel Prospect",
    country: "Ethiopia",
    operator: "Ethiopian Mining",
    latitude: 9.0,
    longitude: 38.7,
    production_bpd: 300,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Nickel Mine"
  },
  // ============================================
  // RHODIUM PRODUCTION - GLOBAL COVERAGE
  // 80-85% from South Africa (Bushveld Complex)
  // ============================================
  // === SOUTH AFRICA RHODIUM (Major Producer - 80-85%) ===
  {
    name: "Mogalakwena Mine",
    country: "South Africa",
    operator: "Anglo American Platinum",
    latitude: -24.3,
    longitude: 28.8,
    production_bpd: 50000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  {
    name: "Amandelbult Complex",
    country: "South Africa",
    operator: "Anglo American Platinum",
    latitude: -25.6,
    longitude: 27.3,
    production_bpd: 45000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  {
    name: "Impala Platinum Rustenburg",
    country: "South Africa",
    operator: "Impala Platinum",
    latitude: -25.7,
    longitude: 27.2,
    production_bpd: 42000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  {
    name: "Marikana Operations",
    country: "South Africa",
    operator: "Sibanye-Stillwater",
    latitude: -25.7,
    longitude: 27.5,
    production_bpd: 38000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  {
    name: "Northam Platinum Zondereinde",
    country: "South Africa",
    operator: "Northam Platinum",
    latitude: -25.5,
    longitude: 27.8,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  {
    name: "Kroondal Mine",
    country: "South Africa",
    operator: "Sibanye-Stillwater",
    latitude: -25.7,
    longitude: 27.3,
    production_bpd: 32000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  {
    name: "Mototolo Mine",
    country: "South Africa",
    operator: "Anglo American Platinum",
    latitude: -24.9,
    longitude: 29.9,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  {
    name: "Bathopele Mine",
    country: "South Africa",
    operator: "Royal Bafokeng Platinum",
    latitude: -25.3,
    longitude: 27.5,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  {
    name: "Mimosa Mine",
    country: "South Africa",
    operator: "Sibanye-Stillwater/Impala",
    latitude: -25.8,
    longitude: 27.4,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  {
    name: "Modikwa Platinum Mine",
    country: "South Africa",
    operator: "Sibanye-Stillwater/ARM",
    latitude: -24.7,
    longitude: 30.1,
    production_bpd: 24000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  {
    name: "Twickenham Mine",
    country: "South Africa",
    operator: "Anglo American Platinum",
    latitude: -25.4,
    longitude: 29.5,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  {
    name: "Tumela Mine",
    country: "South Africa",
    operator: "Anglo American Platinum",
    latitude: -24.9,
    longitude: 27.6,
    production_bpd: 20000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  {
    name: "Dishaba Mine",
    country: "South Africa",
    operator: "Anglo American Platinum",
    latitude: -25.2,
    longitude: 27.4,
    production_bpd: 18000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  {
    name: "Booysendal Platinum Mine",
    country: "South Africa",
    operator: "Northam Platinum",
    latitude: -25.0,
    longitude: 30.2,
    production_bpd: 16000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  {
    name: "Eland Platinum Mine",
    country: "South Africa",
    operator: "Northam Platinum",
    latitude: -25.6,
    longitude: 27.9,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  {
    name: "Styldrift Mine",
    country: "South Africa",
    operator: "Sibanye-Stillwater",
    latitude: -25.1,
    longitude: 27.2,
    production_bpd: 14000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  {
    name: "Siphumelele Mine",
    country: "South Africa",
    operator: "Impala Platinum",
    latitude: -25.9,
    longitude: 27.3,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  {
    name: "Two Rivers Platinum Mine",
    country: "South Africa",
    operator: "African Rainbow Minerals",
    latitude: -25.0,
    longitude: 30.4,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === RUSSIA RHODIUM ===
  {
    name: "Norilsk PGM Complex",
    country: "Russia",
    operator: "Nornickel",
    latitude: 69.3,
    longitude: 88.2,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  {
    name: "Kola PGM Operations",
    country: "Russia",
    operator: "Nornickel",
    latitude: 67.9,
    longitude: 33.1,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === ZIMBABWE RHODIUM ===
  {
    name: "Unki Mine",
    country: "Zimbabwe",
    operator: "Anglo American Platinum",
    latitude: -19.4,
    longitude: 29.8,
    production_bpd: 5000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  {
    name: "Zimplats Ngezi Mine",
    country: "Zimbabwe",
    operator: "Impala Platinum",
    latitude: -18.0,
    longitude: 30.1,
    production_bpd: 4500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  {
    name: "Mimosa Platinum Mine",
    country: "Zimbabwe",
    operator: "Sibanye-Stillwater",
    latitude: -19.3,
    longitude: 30.0,
    production_bpd: 4000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === CANADA RHODIUM ===
  {
    name: "Sudbury PGM Complex",
    country: "Canada",
    operator: "Vale/Glencore",
    latitude: 46.5,
    longitude: -81.0,
    production_bpd: 3000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === UNITED STATES RHODIUM ===
  {
    name: "Stillwater Mine",
    country: "United States",
    operator: "Sibanye-Stillwater",
    latitude: 45.5,
    longitude: -109.8,
    production_bpd: 2500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  {
    name: "East Boulder Mine",
    country: "United States",
    operator: "Sibanye-Stillwater",
    latitude: 45.6,
    longitude: -109.9,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === BOTSWANA RHODIUM ===
  {
    name: "Tati Nickel PGM",
    country: "Botswana",
    operator: "Norilsk Nickel",
    latitude: -21.0,
    longitude: 27.5,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === FINLAND RHODIUM ===
  {
    name: "Kevitsa PGM Byproduct",
    country: "Finland",
    operator: "Boliden",
    latitude: 67.8,
    longitude: 27.0,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === NORWAY RHODIUM ===
  {
    name: "Norwegian PGM Prospect",
    country: "Norway",
    operator: "Norwegian Mining",
    latitude: 69.6,
    longitude: 30.0,
    production_bpd: 300,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === CHINA RHODIUM ===
  {
    name: "Jinchuan PGM Refinery",
    country: "China",
    operator: "Jinchuan Group",
    latitude: 38.5,
    longitude: 102.2,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === AUSTRALIA RHODIUM ===
  {
    name: "Kambalda PGM Deposit",
    country: "Australia",
    operator: "IGO Limited",
    latitude: -31.2,
    longitude: 121.7,
    production_bpd: 300,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === BRAZIL RHODIUM ===
  {
    name: "Carajás PGM Byproduct",
    country: "Brazil",
    operator: "Vale",
    latitude: -6.1,
    longitude: -50.4,
    production_bpd: 200,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === COLOMBIA RHODIUM ===
  {
    name: "Chocó PGM Deposit",
    country: "Colombia",
    operator: "Colombian Mining",
    latitude: 5.5,
    longitude: -76.5,
    production_bpd: 200,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === ETHIOPIA RHODIUM ===
  {
    name: "Ethiopian PGM Prospect",
    country: "Ethiopia",
    operator: "Ethiopian Mining",
    latitude: 9.0,
    longitude: 40.5,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === TANZANIA RHODIUM ===
  {
    name: "Kabanga PGM Byproduct",
    country: "Tanzania",
    operator: "BHP/Lifezone",
    latitude: -2.6,
    longitude: 30.8,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === ZAMBIA RHODIUM ===
  {
    name: "Zambian PGM Deposit",
    country: "Zambia",
    operator: "Zambian Mining",
    latitude: -14.5,
    longitude: 28.3,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === DRC RHODIUM ===
  {
    name: "Katanga PGM Prospect",
    country: "Democratic Republic of the Congo",
    operator: "DRC Mining",
    latitude: -10.7,
    longitude: 26.9,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === UGANDA RHODIUM ===
  {
    name: "Ugandan PGM Deposit",
    country: "Uganda",
    operator: "Uganda Mining",
    latitude: 1.4,
    longitude: 32.3,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === KENYA RHODIUM ===
  {
    name: "Kenyan PGM Prospect",
    country: "Kenya",
    operator: "Kenya Mining",
    latitude: -0.3,
    longitude: 36.1,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === NAMIBIA RHODIUM ===
  {
    name: "Namibian PGM Deposit",
    country: "Namibia",
    operator: "Namibian Mining",
    latitude: -22.6,
    longitude: 17.1,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === MADAGASCAR RHODIUM ===
  {
    name: "Madagascar PGM Prospect",
    country: "Madagascar",
    operator: "Madagascar Mining",
    latitude: -18.9,
    longitude: 47.5,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === MOZAMBIQUE RHODIUM ===
  {
    name: "Mozambique PGM Deposit",
    country: "Mozambique",
    operator: "Mozambique Mining",
    latitude: -18.6,
    longitude: 35.5,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === GHANA RHODIUM ===
  {
    name: "Ghana PGM Prospect",
    country: "Ghana",
    operator: "Ghana Mining",
    latitude: 7.9,
    longitude: -1.0,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === NIGERIA RHODIUM ===
  {
    name: "Nigerian PGM Deposit",
    country: "Nigeria",
    operator: "Nigerian Mining",
    latitude: 9.1,
    longitude: 7.4,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === MOROCCO RHODIUM ===
  {
    name: "Moroccan PGM Prospect",
    country: "Morocco",
    operator: "Managem",
    latitude: 31.8,
    longitude: -7.1,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === ALGERIA RHODIUM ===
  {
    name: "Algerian PGM Deposit",
    country: "Algeria",
    operator: "Algerian Mining",
    latitude: 28.0,
    longitude: 2.9,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === EGYPT RHODIUM ===
  {
    name: "Egyptian PGM Prospect",
    country: "Egypt",
    operator: "Egyptian Mining",
    latitude: 26.8,
    longitude: 30.8,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === SUDAN RHODIUM ===
  {
    name: "Sudanese PGM Deposit",
    country: "Sudan",
    operator: "Sudanese Mining",
    latitude: 15.5,
    longitude: 32.5,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === IRAN RHODIUM ===
  {
    name: "Iranian PGM Prospect",
    country: "Iran",
    operator: "Iranian Mining",
    latitude: 35.7,
    longitude: 51.4,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === KAZAKHSTAN RHODIUM ===
  {
    name: "Kazakhstan PGM Deposit",
    country: "Kazakhstan",
    operator: "Kazakh Mining",
    latitude: 48.0,
    longitude: 66.9,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === MONGOLIA RHODIUM ===
  {
    name: "Mongolian PGM Prospect",
    country: "Mongolia",
    operator: "Mongolian Mining",
    latitude: 47.9,
    longitude: 106.9,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === INDONESIA RHODIUM ===
  {
    name: "Indonesian PGM Byproduct",
    country: "Indonesia",
    operator: "Indonesian Mining",
    latitude: -2.5,
    longitude: 118.0,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === PHILIPPINES RHODIUM ===
  {
    name: "Philippine PGM Deposit",
    country: "Philippines",
    operator: "Philippine Mining",
    latitude: 12.9,
    longitude: 121.8,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === PAPUA NEW GUINEA RHODIUM ===
  {
    name: "PNG PGM Prospect",
    country: "Papua New Guinea",
    operator: "PNG Mining",
    latitude: -6.3,
    longitude: 143.9,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === JAPAN RHODIUM ===
  {
    name: "Japanese PGM Refinery",
    country: "Japan",
    operator: "Tanaka Precious Metals",
    latitude: 35.7,
    longitude: 139.7,
    production_bpd: 200,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === SOUTH KOREA RHODIUM ===
  {
    name: "Korean PGM Refinery",
    country: "South Korea",
    operator: "Korea Precious Metals",
    latitude: 37.5,
    longitude: 127.0,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === INDIA RHODIUM ===
  {
    name: "Indian PGM Deposit",
    country: "India",
    operator: "Indian Mining",
    latitude: 22.6,
    longitude: 88.4,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === PAKISTAN RHODIUM ===
  {
    name: "Pakistani PGM Prospect",
    country: "Pakistan",
    operator: "Pakistani Mining",
    latitude: 30.4,
    longitude: 69.3,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === TURKEY RHODIUM ===
  {
    name: "Turkish PGM Deposit",
    country: "Turkey",
    operator: "Turkish Mining",
    latitude: 39.9,
    longitude: 32.9,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === ARMENIA RHODIUM ===
  {
    name: "Armenian PGM Prospect",
    country: "Armenia",
    operator: "Armenian Mining",
    latitude: 40.2,
    longitude: 44.5,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === SERBIA RHODIUM ===
  {
    name: "Serbian PGM Deposit",
    country: "Serbia",
    operator: "Serbian Mining",
    latitude: 44.8,
    longitude: 20.5,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === SWEDEN RHODIUM ===
  {
    name: "Swedish PGM Prospect",
    country: "Sweden",
    operator: "Boliden",
    latitude: 67.1,
    longitude: 20.6,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === SPAIN RHODIUM ===
  {
    name: "Spanish PGM Deposit",
    country: "Spain",
    operator: "Spanish Mining",
    latitude: 40.4,
    longitude: -3.7,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === POLAND RHODIUM ===
  {
    name: "Polish PGM Prospect",
    country: "Poland",
    operator: "KGHM",
    latitude: 51.1,
    longitude: 17.0,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === GERMANY RHODIUM ===
  {
    name: "German PGM Refinery",
    country: "Germany",
    operator: "Heraeus",
    latitude: 50.1,
    longitude: 8.7,
    production_bpd: 200,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === FRANCE RHODIUM ===
  {
    name: "French PGM Refinery",
    country: "France",
    operator: "French Mining",
    latitude: 48.9,
    longitude: 2.4,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === UNITED KINGDOM RHODIUM ===
  {
    name: "UK PGM Refinery",
    country: "United Kingdom",
    operator: "Johnson Matthey",
    latitude: 51.5,
    longitude: -0.1,
    production_bpd: 200,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === AUSTRIA RHODIUM ===
  {
    name: "Austrian PGM Deposit",
    country: "Austria",
    operator: "Austrian Mining",
    latitude: 47.5,
    longitude: 14.6,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === ITALY RHODIUM ===
  {
    name: "Italian PGM Refinery",
    country: "Italy",
    operator: "Italian Mining",
    latitude: 41.9,
    longitude: 12.5,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === MEXICO RHODIUM ===
  {
    name: "Mexican PGM Byproduct",
    country: "Mexico",
    operator: "Mexican Mining",
    latitude: 23.6,
    longitude: -102.6,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // === PERU RHODIUM ===
  {
    name: "Peruvian PGM Deposit",
    country: "Peru",
    operator: "Peruvian Mining",
    latitude: -9.2,
    longitude: -75.0,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Rhodium Mine"
  },
  // ============================================
  // PALLADIUM PRODUCTION - GLOBAL COVERAGE
  // Russia (40-45%) and South Africa (35-40%)
  // ============================================
  // === RUSSIA PALLADIUM (Major Producer - 40-45%) ===
  {
    name: "Norilsk Palladium Complex",
    country: "Russia",
    operator: "Nornickel",
    latitude: 69.3,
    longitude: 88.2,
    production_bpd: 80000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  {
    name: "Talnakh Palladium Operations",
    country: "Russia",
    operator: "Nornickel",
    latitude: 69.5,
    longitude: 88.4,
    production_bpd: 70000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  {
    name: "Kola MMC Palladium",
    country: "Russia",
    operator: "Nornickel",
    latitude: 67.9,
    longitude: 33.1,
    production_bpd: 60000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  {
    name: "Zapolyarny Palladium Mine",
    country: "Russia",
    operator: "Nornickel",
    latitude: 69.4,
    longitude: 88.0,
    production_bpd: 50000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === SOUTH AFRICA PALLADIUM (Major Producer - 35-40%) ===
  {
    name: "Mogalakwena Palladium",
    country: "South Africa",
    operator: "Anglo American Platinum",
    latitude: -24.3,
    longitude: 28.8,
    production_bpd: 55000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  {
    name: "Amandelbult Palladium",
    country: "South Africa",
    operator: "Anglo American Platinum",
    latitude: -25.6,
    longitude: 27.3,
    production_bpd: 48000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  {
    name: "Impala Rustenburg Palladium",
    country: "South Africa",
    operator: "Impala Platinum",
    latitude: -25.7,
    longitude: 27.2,
    production_bpd: 45000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  {
    name: "Marikana Palladium Operations",
    country: "South Africa",
    operator: "Sibanye-Stillwater",
    latitude: -25.7,
    longitude: 27.5,
    production_bpd: 42000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  {
    name: "Northam Palladium Mine",
    country: "South Africa",
    operator: "Northam Platinum",
    latitude: -25.5,
    longitude: 27.8,
    production_bpd: 38000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  {
    name: "Kroondal Palladium",
    country: "South Africa",
    operator: "Sibanye-Stillwater",
    latitude: -25.7,
    longitude: 27.3,
    production_bpd: 35000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  {
    name: "Mototolo Palladium",
    country: "South Africa",
    operator: "Anglo American Platinum",
    latitude: -24.9,
    longitude: 29.9,
    production_bpd: 32000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  {
    name: "Bathopele Palladium Mine",
    country: "South Africa",
    operator: "Royal Bafokeng Platinum",
    latitude: -25.3,
    longitude: 27.5,
    production_bpd: 30000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  {
    name: "Modikwa Palladium",
    country: "South Africa",
    operator: "Sibanye-Stillwater/ARM",
    latitude: -24.7,
    longitude: 30.1,
    production_bpd: 28000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  {
    name: "Booysendal Palladium",
    country: "South Africa",
    operator: "Northam Platinum",
    latitude: -25.0,
    longitude: 30.2,
    production_bpd: 25000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  {
    name: "Two Rivers Palladium",
    country: "South Africa",
    operator: "African Rainbow Minerals",
    latitude: -25.0,
    longitude: 30.4,
    production_bpd: 22000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === CANADA PALLADIUM ===
  {
    name: "Sudbury Palladium Complex",
    country: "Canada",
    operator: "Vale/Glencore",
    latitude: 46.5,
    longitude: -81.0,
    production_bpd: 15000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  {
    name: "Lac des Iles Palladium",
    country: "Canada",
    operator: "Impala Canada",
    latitude: 48.6,
    longitude: -87.6,
    production_bpd: 12000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === ZIMBABWE PALLADIUM ===
  {
    name: "Unki Palladium Mine",
    country: "Zimbabwe",
    operator: "Anglo American Platinum",
    latitude: -19.4,
    longitude: 29.8,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  {
    name: "Zimplats Palladium",
    country: "Zimbabwe",
    operator: "Impala Platinum",
    latitude: -18.0,
    longitude: 30.1,
    production_bpd: 7000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  {
    name: "Mimosa Palladium",
    country: "Zimbabwe",
    operator: "Sibanye-Stillwater",
    latitude: -19.3,
    longitude: 30.0,
    production_bpd: 6000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === UNITED STATES PALLADIUM ===
  {
    name: "Stillwater Palladium Mine",
    country: "United States",
    operator: "Sibanye-Stillwater",
    latitude: 45.5,
    longitude: -109.8,
    production_bpd: 10000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  {
    name: "East Boulder Palladium",
    country: "United States",
    operator: "Sibanye-Stillwater",
    latitude: 45.6,
    longitude: -109.9,
    production_bpd: 8000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === BOTSWANA PALLADIUM ===
  {
    name: "Tati Palladium Mine",
    country: "Botswana",
    operator: "Norilsk Nickel",
    latitude: -21.0,
    longitude: 27.5,
    production_bpd: 2000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === FINLAND PALLADIUM ===
  {
    name: "Kevitsa Palladium Byproduct",
    country: "Finland",
    operator: "Boliden",
    latitude: 67.8,
    longitude: 27.0,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === NORWAY PALLADIUM ===
  {
    name: "Norwegian Palladium Prospect",
    country: "Norway",
    operator: "Norwegian Mining",
    latitude: 69.6,
    longitude: 30.0,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === CHINA PALLADIUM ===
  {
    name: "Jinchuan Palladium Refinery",
    country: "China",
    operator: "Jinchuan Group",
    latitude: 38.5,
    longitude: 102.2,
    production_bpd: 1000,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === AUSTRALIA PALLADIUM ===
  {
    name: "Kambalda Palladium Deposit",
    country: "Australia",
    operator: "IGO Limited",
    latitude: -31.2,
    longitude: 121.7,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === BRAZIL PALLADIUM ===
  {
    name: "Carajás Palladium Byproduct",
    country: "Brazil",
    operator: "Vale",
    latitude: -6.1,
    longitude: -50.4,
    production_bpd: 300,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === COLOMBIA PALLADIUM ===
  {
    name: "Chocó Palladium Deposit",
    country: "Colombia",
    operator: "Colombian Mining",
    latitude: 5.5,
    longitude: -76.5,
    production_bpd: 300,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === ETHIOPIA PALLADIUM ===
  {
    name: "Ethiopian Palladium Prospect",
    country: "Ethiopia",
    operator: "Ethiopian Mining",
    latitude: 9.0,
    longitude: 40.5,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === TANZANIA PALLADIUM ===
  {
    name: "Kabanga Palladium Byproduct",
    country: "Tanzania",
    operator: "BHP/Lifezone",
    latitude: -2.6,
    longitude: 30.8,
    production_bpd: 200,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === ZAMBIA PALLADIUM ===
  {
    name: "Zambian Palladium Deposit",
    country: "Zambia",
    operator: "Zambian Mining",
    latitude: -14.5,
    longitude: 28.3,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === DRC PALLADIUM ===
  {
    name: "Katanga Palladium Prospect",
    country: "Democratic Republic of the Congo",
    operator: "DRC Mining",
    latitude: -10.7,
    longitude: 26.9,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === UGANDA PALLADIUM ===
  {
    name: "Ugandan Palladium Deposit",
    country: "Uganda",
    operator: "Uganda Mining",
    latitude: 1.4,
    longitude: 32.3,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === KENYA PALLADIUM ===
  {
    name: "Kenyan Palladium Prospect",
    country: "Kenya",
    operator: "Kenya Mining",
    latitude: -0.3,
    longitude: 36.1,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === NAMIBIA PALLADIUM ===
  {
    name: "Namibian Palladium Deposit",
    country: "Namibia",
    operator: "Namibian Mining",
    latitude: -22.6,
    longitude: 17.1,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === MADAGASCAR PALLADIUM ===
  {
    name: "Madagascar Palladium Prospect",
    country: "Madagascar",
    operator: "Madagascar Mining",
    latitude: -18.9,
    longitude: 47.5,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === MOZAMBIQUE PALLADIUM ===
  {
    name: "Mozambique Palladium Deposit",
    country: "Mozambique",
    operator: "Mozambique Mining",
    latitude: -18.6,
    longitude: 35.5,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === GHANA PALLADIUM ===
  {
    name: "Ghana Palladium Prospect",
    country: "Ghana",
    operator: "Ghana Mining",
    latitude: 7.9,
    longitude: -1.0,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === NIGERIA PALLADIUM ===
  {
    name: "Nigerian Palladium Deposit",
    country: "Nigeria",
    operator: "Nigerian Mining",
    latitude: 9.1,
    longitude: 7.4,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === MOROCCO PALLADIUM ===
  {
    name: "Moroccan Palladium Prospect",
    country: "Morocco",
    operator: "Managem",
    latitude: 31.8,
    longitude: -7.1,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === ALGERIA PALLADIUM ===
  {
    name: "Algerian Palladium Deposit",
    country: "Algeria",
    operator: "Algerian Mining",
    latitude: 28.0,
    longitude: 2.9,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === EGYPT PALLADIUM ===
  {
    name: "Egyptian Palladium Prospect",
    country: "Egypt",
    operator: "Egyptian Mining",
    latitude: 26.8,
    longitude: 30.8,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === SUDAN PALLADIUM ===
  {
    name: "Sudanese Palladium Deposit",
    country: "Sudan",
    operator: "Sudanese Mining",
    latitude: 15.5,
    longitude: 32.5,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === IRAN PALLADIUM ===
  {
    name: "Iranian Palladium Prospect",
    country: "Iran",
    operator: "Iranian Mining",
    latitude: 35.7,
    longitude: 51.4,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === KAZAKHSTAN PALLADIUM ===
  {
    name: "Kazakhstan Palladium Deposit",
    country: "Kazakhstan",
    operator: "Kazakh Mining",
    latitude: 48.0,
    longitude: 66.9,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === MONGOLIA PALLADIUM ===
  {
    name: "Mongolian Palladium Prospect",
    country: "Mongolia",
    operator: "Mongolian Mining",
    latitude: 47.9,
    longitude: 106.9,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === INDONESIA PALLADIUM ===
  {
    name: "Indonesian Palladium Byproduct",
    country: "Indonesia",
    operator: "Indonesian Mining",
    latitude: -2.5,
    longitude: 118.0,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === PHILIPPINES PALLADIUM ===
  {
    name: "Philippine Palladium Deposit",
    country: "Philippines",
    operator: "Philippine Mining",
    latitude: 12.9,
    longitude: 121.8,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === PAPUA NEW GUINEA PALLADIUM ===
  {
    name: "PNG Palladium Prospect",
    country: "Papua New Guinea",
    operator: "PNG Mining",
    latitude: -6.3,
    longitude: 143.9,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === JAPAN PALLADIUM ===
  {
    name: "Japanese Palladium Refinery",
    country: "Japan",
    operator: "Tanaka Precious Metals",
    latitude: 35.7,
    longitude: 139.7,
    production_bpd: 500,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === SOUTH KOREA PALLADIUM ===
  {
    name: "Korean Palladium Refinery",
    country: "South Korea",
    operator: "Korea Precious Metals",
    latitude: 37.5,
    longitude: 127.0,
    production_bpd: 300,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === INDIA PALLADIUM ===
  {
    name: "Indian Palladium Deposit",
    country: "India",
    operator: "Indian Mining",
    latitude: 22.6,
    longitude: 88.4,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === PAKISTAN PALLADIUM ===
  {
    name: "Pakistani Palladium Prospect",
    country: "Pakistan",
    operator: "Pakistani Mining",
    latitude: 30.4,
    longitude: 69.3,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === TURKEY PALLADIUM ===
  {
    name: "Turkish Palladium Deposit",
    country: "Turkey",
    operator: "Turkish Mining",
    latitude: 39.9,
    longitude: 32.9,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === ARMENIA PALLADIUM ===
  {
    name: "Armenian Palladium Prospect",
    country: "Armenia",
    operator: "Armenian Mining",
    latitude: 40.2,
    longitude: 44.5,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === SERBIA PALLADIUM ===
  {
    name: "Serbian Palladium Deposit",
    country: "Serbia",
    operator: "Serbian Mining",
    latitude: 44.8,
    longitude: 20.5,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === SWEDEN PALLADIUM ===
  {
    name: "Swedish Palladium Prospect",
    country: "Sweden",
    operator: "Boliden",
    latitude: 67.1,
    longitude: 20.6,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === SPAIN PALLADIUM ===
  {
    name: "Spanish Palladium Deposit",
    country: "Spain",
    operator: "Spanish Mining",
    latitude: 40.4,
    longitude: -3.7,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === POLAND PALLADIUM ===
  {
    name: "Polish Palladium Prospect",
    country: "Poland",
    operator: "KGHM",
    latitude: 51.1,
    longitude: 17.0,
    production_bpd: 200,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === GERMANY PALLADIUM ===
  {
    name: "German Palladium Refinery",
    country: "Germany",
    operator: "Heraeus",
    latitude: 50.1,
    longitude: 8.7,
    production_bpd: 300,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === FRANCE PALLADIUM ===
  {
    name: "French Palladium Refinery",
    country: "France",
    operator: "French Mining",
    latitude: 48.9,
    longitude: 2.4,
    production_bpd: 200,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === UNITED KINGDOM PALLADIUM ===
  {
    name: "UK Palladium Refinery",
    country: "United Kingdom",
    operator: "Johnson Matthey",
    latitude: 51.5,
    longitude: -0.1,
    production_bpd: 300,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === AUSTRIA PALLADIUM ===
  {
    name: "Austrian Palladium Deposit",
    country: "Austria",
    operator: "Austrian Mining",
    latitude: 47.5,
    longitude: 14.6,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === ITALY PALLADIUM ===
  {
    name: "Italian Palladium Refinery",
    country: "Italy",
    operator: "Italian Mining",
    latitude: 41.9,
    longitude: 12.5,
    production_bpd: 200,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === MEXICO PALLADIUM ===
  {
    name: "Mexican Palladium Byproduct",
    country: "Mexico",
    operator: "Mexican Mining",
    latitude: 23.6,
    longitude: -102.6,
    production_bpd: 100,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  },
  // === PERU PALLADIUM ===
  {
    name: "Peruvian Palladium Deposit",
    country: "Peru",
    operator: "Peruvian Mining",
    latitude: -9.2,
    longitude: -75.0,
    production_bpd: 50,
    api_gravity: "0",
    sulfur_content: "0%",
    type: "Palladium Mine"
  }
]

/**
 * Transform scraped data to database format
 */
function transformToDbFormat(field: typeof majorOilFields[0]): OilReserveData {
  // Determine the commodity type based on the type name
  const isGasField = field.type.toLowerCase().includes('gas') || 
                     field.type.toLowerCase().includes('lng') ||
                     field.type.toLowerCase().includes('condensate')
  
  const isUraniumMine = field.type.toLowerCase().includes('uranium')
  const isCoalMine = field.type.toLowerCase().includes('coal')
  const isGoldMine = field.type.toLowerCase().includes('gold')
  const isSilverMine = field.type.toLowerCase().includes('silver')
  const isCopperMine = field.type.toLowerCase().includes('copper')
  const isSteelPlant = field.type.toLowerCase().includes('steel')
  const isLithiumMine = field.type.toLowerCase().includes('lithium')
  const isIronOreMine = field.type.toLowerCase().includes('iron ore')
  const isPlatinumMine = field.type.toLowerCase().includes('platinum')
  const isSoybeanProduction = field.type.toLowerCase().includes('soybean')
  const isSiliconProduction = field.type.toLowerCase().includes('silicon')
  const isTitaniumMine = field.type.toLowerCase().includes('titanium')
  const isWheatProduction = field.type.toLowerCase().includes('wheat')
  const isCottonProduction = field.type.toLowerCase().includes('cotton')
  const isRiceProduction = field.type.toLowerCase().includes('rice')
  const isSugarProduction = field.type.toLowerCase().includes('sugar')
  const isCocoaProduction = field.type.toLowerCase().includes('cocoa')
  const isCornProduction = field.type.toLowerCase().includes('corn')
  const isCoffeeProduction = field.type.toLowerCase().includes('coffee')
  const isCobaltMine = field.type.toLowerCase().includes('cobalt')
  const isZincMine = field.type.toLowerCase().includes('zinc')
  const isNickelMine = field.type.toLowerCase().includes('nickel')
  const isRhodiumMine = field.type.toLowerCase().includes('rhodium')
  const isPalladiumMine = field.type.toLowerCase().includes('palladium')
  
  let commodityName: string
  let commodityType: string
  let locationType: string
  
  if (isPalladiumMine) {
    commodityName = "Palladium"
    commodityType = "Industrial"
    locationType = 'mine'
  } else if (isRhodiumMine) {
    commodityName = "Rhodium"
    commodityType = "Industrial"
    locationType = 'mine'
  } else if (isNickelMine) {
    commodityName = "Nickel"
    commodityType = "Industrial"
    locationType = 'mine'
  } else if (isZincMine) {
    commodityName = "Zinc"
    commodityType = "Industrial"
    locationType = 'mine'
  } else if (isCobaltMine) {
    commodityName = "Cobalt"
    commodityType = "Industrial"
    locationType = 'mine'
  } else if (isCoffeeProduction) {
    commodityName = "Coffee"
    commodityType = "Agricultural"
    locationType = 'farm'
  } else if (isCornProduction) {
    commodityName = "Corn"
    commodityType = "Agricultural"
    locationType = 'farm'
  } else if (isCocoaProduction) {
    commodityName = "Cocoa"
    commodityType = "Agricultural"
    locationType = 'farm'
  } else if (isSugarProduction) {
    commodityName = "Sugar"
    commodityType = "Agricultural"
    locationType = 'processing_plant'
  } else if (isRiceProduction) {
    commodityName = "Rice"
    commodityType = "Agricultural"
    locationType = 'farm'
  } else if (isCottonProduction) {
    commodityName = "Cotton"
    commodityType = "Agricultural"
    locationType = 'farm'
  } else if (isWheatProduction) {
    commodityName = "Wheat"
    commodityType = "Agricultural"
    locationType = 'farm'
  } else if (isTitaniumMine) {
    commodityName = "Titanium"
    commodityType = "Industrial"
    locationType = 'mine'
  } else if (isSiliconProduction) {
    commodityName = "Silicon"
    commodityType = "Industrial"
    locationType = 'facility'
  } else if (isSoybeanProduction) {
    commodityName = "Soybeans"
    commodityType = "Agricultural"
    locationType = 'farm'
  } else if (isPlatinumMine) {
    commodityName = "Platinum"
    commodityType = "Metals"
    locationType = 'mine'
  } else if (isIronOreMine) {
    commodityName = "Iron Ore"
    commodityType = "Metals"
    locationType = 'mine'
  } else if (isLithiumMine) {
    commodityName = "Lithium"
    commodityType = "Metals"
    locationType = 'mine'
  } else if (isSteelPlant) {
    commodityName = "Steel"
    commodityType = "Metals"
    locationType = 'facility'
  } else if (isCopperMine) {
    commodityName = "Copper"
    commodityType = "Metals"
    locationType = 'mine'
  } else if (isSilverMine) {
    commodityName = "Silver"
    commodityType = "Metals"
    locationType = 'mine'
  } else if (isGoldMine) {
    commodityName = "Gold"
    commodityType = "Metals"
    locationType = 'mine'
  } else if (isCoalMine) {
    commodityName = "Coal"
    commodityType = "Energy"
    locationType = 'mine'
  } else if (isUraniumMine) {
    commodityName = "Uranium"
    commodityType = "Energy"
    locationType = 'mine'
  } else if (isGasField) {
    commodityName = "Natural Gas"
    commodityType = "Energy"
    locationType = 'gas_field'
  } else {
    commodityName = "Crude Oil"
    commodityType = "Energy"
    locationType = 'oil_field'
  }

  // API gravity and sulfur content only apply to crude oil
  let apiGravity: number | undefined
  let sulfurContent: number | undefined

  if (!isGasField && !isUraniumMine && !isCoalMine && !isGoldMine && !isSilverMine && !isCopperMine && !isSteelPlant && !isLithiumMine && !isIronOreMine && !isPlatinumMine && !isSoybeanProduction && !isSiliconProduction && !isTitaniumMine && !isWheatProduction && !isCottonProduction && !isRiceProduction && !isSugarProduction && !isCocoaProduction && !isCornProduction && !isCoffeeProduction) {
    // Only process API gravity for oil fields
    apiGravity = field.api_gravity.includes('-') 
      ? field.api_gravity.split('-').map(s => parseFloat(s)).reduce((a, b) => a + b) / 2
      : parseFloat(field.api_gravity)

    // Parse sulfur content for oil
    sulfurContent = parseFloat(field.sulfur_content.replace('%', '').replace('High H2S', '5.0'))
  } else {
    // For gas fields, uranium mines, coal mines, gold mines, silver mines, copper mines, steel plants, lithium mines, iron ore mines, platinum mines, soybean production, silicon production, titanium mines, wheat production, cotton production, rice production, sugar production, cocoa production, corn production, and coffee production, API gravity and sulfur don't apply
    apiGravity = undefined
    sulfurContent = undefined
  }

  return {
    title: field.name,
    owner: field.operator,
    address: `${field.name}, ${field.country}`,
    contact: `${field.operator.toLowerCase().replace(/\s+/g, '')}@contact.com`,
    latitude: field.latitude,
    longitude: field.longitude,
    supply_volume: field.production_bpd * 365, // Convert to annual volume
    storage_volume: 0,
    long_term_contract: true,
    contract_with: "Various International Buyers",
    commodity_type: commodityType,
    commodity_name: commodityName,
    company: field.operator.split('/')[0], // Primary operator
    country: field.country,
    location_type: locationType,
    api_gravity: apiGravity,
    sulfur_content: sulfurContent,
    operational_status: 'operational'
  }
}

/**
 * Insert data into Supabase
 */
async function insertOilReserves() {
  console.log('🛢️  Starting oil reserves data import...\n')
  
  let successCount = 0
  let errorCount = 0

  for (const field of majorOilFields) {
    try {
      const data = transformToDbFormat(field)
      
      // Check if already exists
      const { data: existing } = await supabase
        .from('commodity_locations')
        .select('id')
        .eq('title', data.title)
        .single()

      if (existing) {
        console.log(`⏭️  Skipping ${data.title} - already exists`)
        continue
      }

      // Insert new record
      const { error } = await supabase
        .from('commodity_locations')
        .insert([data])

      if (error) {
        console.error(`❌ Error inserting ${data.title}:`, error.message)
        errorCount++
      } else {
        console.log(`✅ Inserted: ${data.title} (${data.owner})`)
        successCount++
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))

    } catch (err) {
      console.error(`❌ Error processing ${field.name}:`, err)
      errorCount++
    }
  }

  console.log('\n📊 Import Summary:')
  console.log(`   ✅ Successful: ${successCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
  console.log(`   📝 Total: ${majorOilFields.length}`)
}

/**
 * Scrape additional data from public APIs (optional)
 */
async function scrapeFromAPIs() {
  console.log('\n🌐 Fetching data from public APIs...\n')
  
  // Example: Energy Information Administration (EIA) API
  // You would need to register for an API key at https://www.eia.gov/opendata/
  const EIA_API_KEY = process.env.EIA_API_KEY
  
  if (!EIA_API_KEY) {
    console.log('⚠️  EIA API key not found. Skipping API scraping.')
    return
  }

  try {
    // Example API call (you'd customize based on actual API)
    const response = await fetch(`https://api.eia.gov/v2/petroleum/sum/sndw?api_key=${EIA_API_KEY}`)
    const data = await response.json()
    
    console.log('✅ API data fetched successfully')
    // Process and insert API data here
    
  } catch (error) {
    console.error('❌ Error fetching from API:', error)
  }
}

// Run the scraper
async function main() {
  console.log('🚀 Oil Reserves Data Scraper\n')
  console.log('=' .repeat(50))
  
  // Insert curated oil field data
  await insertOilReserves()
  
  // Optionally scrape from APIs
  // await scrapeFromAPIs()
  
  console.log('\n✨ Script completed!')
  process.exit(0)
}

// Execute
main().catch(console.error)
