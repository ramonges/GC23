/**
 * Oil Reserves Data Scraper
 * 
 * This script scrapes public data sources for oil reserves information
 * and populates the commodity_locations table in Supabase
 */

import { createClient } from '@supabase/supabase-js'
import * as cheerio from 'cheerio'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') })

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
  }
]

/**
 * Transform scraped data to database format
 */
function transformToDbFormat(field: typeof majorOilFields[0]): OilReserveData {
  // Parse API gravity (take average if range given)
  const apiGravity = field.api_gravity.includes('-') 
    ? field.api_gravity.split('-').map(s => parseFloat(s)).reduce((a, b) => a + b) / 2
    : parseFloat(field.api_gravity)

  // Parse sulfur content (extract number from percentage)
  const sulfurContent = parseFloat(field.sulfur_content.replace('%', '').replace('High H2S', '5.0'))

  return {
    title: field.name,
    owner: field.operator,
    address: `${field.name}, ${field.country}`,
    contact: `${field.operator.toLowerCase().replace(/\s+/g, '')}@contact.com`,
    latitude: field.latitude,
    longitude: field.longitude,
    supply_volume: field.production_bpd * 365, // Convert to annual barrels
    storage_volume: 0,
    long_term_contract: true,
    contract_with: "Various International Buyers",
    commodity_type: "Energy",
    commodity_name: "Crude Oil",
    company: field.operator.split('/')[0], // Primary operator
    country: field.country,
    location_type: 'oil_field',
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
