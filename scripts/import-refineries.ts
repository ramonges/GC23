/**
 * Script to import refineries data into Supabase
 * Categorizes refineries by crude type acceptance: light, medium, extra_heavy
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials in environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface RefineryData {
  name: string
  operator?: string
  country: string
  city?: string
  address?: string
  capacity_bpd: number
  crude_types: ('light' | 'medium' | 'extra_heavy')[]
  latitude?: number
  longitude?: number
}

// LIGHT CRUDE ONLY refineries
const lightOnlyRefineries: RefineryData[] = [
  {
    name: 'Prudhoe Bay Crude Oil Topping Unit',
    operator: 'Hilcorp',
    country: 'United States',
    city: 'Prudhoe Bay',
    address: 'Prudhoe Bay, North Slope, Alaska',
    capacity_bpd: 10500,
    crude_types: ['light'],
    latitude: 70.2556,
    longitude: -148.3383,
  },
  {
    name: 'Kuparuk Topping Unit',
    operator: 'ConocoPhillips',
    country: 'United States',
    city: 'Kuparuk',
    address: 'Near Prudhoe Bay / Kuparuk River Unit, North Slope, Alaska',
    capacity_bpd: 15000,
    crude_types: ['light'],
    latitude: 70.3333,
    longitude: -149.6667,
  },
  {
    name: 'Adrar Refinery',
    operator: 'CNPC/Sonatrach',
    country: 'Algeria',
    city: 'Adrar',
    address: '~40 km North of Adrar, Adrar Province, Algeria',
    capacity_bpd: 12500,
    crude_types: ['light'],
    latitude: 27.8747,
    longitude: -0.2939,
  },
  {
    name: 'Refinería Iquitos Loreto',
    operator: 'Petroperú',
    country: 'Peru',
    city: 'Iquitos',
    address: 'Iquitos, Loreto Region, Peru',
    capacity_bpd: 12000,
    crude_types: ['light'],
    latitude: -3.7481,
    longitude: -73.2472,
  },
  {
    name: 'Apiay Refinery',
    operator: 'Ecopetrol',
    country: 'Colombia',
    city: 'Apiay',
    address: 'Apiay (near Villavicencio), Meta Department, Colombia',
    capacity_bpd: 2500,
    crude_types: ['light'],
    latitude: 4.1422,
    longitude: -73.6264,
  },
  {
    name: 'Orito Refinery',
    operator: 'Ecopetrol',
    country: 'Colombia',
    city: 'Orito',
    address: 'Orito, Putumayo Department, Colombia',
    capacity_bpd: 2300,
    crude_types: ['light'],
    latitude: 0.6667,
    longitude: -76.8667,
  },
]

// EXTRA HEAVY CRUDE refineries
const extraHeavyRefineries: RefineryData[] = [
  {
    name: 'Galveston Bay Refinery',
    operator: 'Marathon Petroleum',
    country: 'United States',
    city: 'Texas City',
    address: 'Texas City, Texas, United States',
    capacity_bpd: 631000,
    crude_types: ['light', 'medium', 'extra_heavy'], // Can process all types
    latitude: 29.3838,
    longitude: -94.9027,
  },
  {
    name: 'Port Arthur Refinery',
    operator: 'Motiva/Saudi Aramco',
    country: 'United States',
    city: 'Port Arthur',
    address: 'Port Arthur, Texas, United States',
    capacity_bpd: 628000,
    crude_types: ['light', 'medium', 'extra_heavy'], // Can process all types
    latitude: 29.8989,
    longitude: -93.9286,
  },
  {
    name: 'Beaumont Refinery',
    operator: 'ExxonMobil',
    country: 'United States',
    city: 'Beaumont',
    address: 'Beaumont, Texas, United States',
    capacity_bpd: 609000,
    crude_types: ['light', 'medium', 'extra_heavy'], // Can process all types
    latitude: 30.0802,
    longitude: -94.1266,
  },
  {
    name: 'Garyville Refinery',
    operator: 'Marathon Petroleum',
    country: 'United States',
    city: 'Garyville',
    address: 'Garyville, Louisiana, United States',
    capacity_bpd: 597000,
    crude_types: ['light', 'medium', 'extra_heavy'], // Can process all types
    latitude: 30.0566,
    longitude: -90.6195,
  },
  {
    name: 'Baytown Refinery',
    operator: 'ExxonMobil',
    country: 'United States',
    city: 'Baytown',
    address: 'Baytown, Texas, United States',
    capacity_bpd: 584500,
    crude_types: ['light', 'medium', 'extra_heavy'], // Can process all types
    latitude: 29.7356,
    longitude: -94.9774,
  },
  {
    name: 'Baton Rouge Refinery',
    operator: 'ExxonMobil',
    country: 'United States',
    city: 'Baton Rouge',
    address: 'Baton Rouge, Louisiana, United States',
    capacity_bpd: 540000,
    crude_types: ['light', 'medium', 'extra_heavy'], // Can process all types
    latitude: 30.4515,
    longitude: -91.1871,
  },
  {
    name: 'Lake Charles Refinery',
    operator: 'Citgo',
    country: 'United States',
    city: 'Lake Charles',
    address: 'Lake Charles, Louisiana, United States',
    capacity_bpd: 455000,
    crude_types: ['light', 'medium', 'extra_heavy'], // Can process all types
    latitude: 30.2266,
    longitude: -93.2171,
  },
  {
    name: 'Whiting Refinery',
    operator: 'BP',
    country: 'United States',
    city: 'Whiting',
    address: 'Whiting, Indiana, United States',
    capacity_bpd: 430000,
    crude_types: ['light', 'medium', 'extra_heavy'], // Can process all types
    latitude: 41.6798,
    longitude: -87.4948,
  },
  {
    name: 'Port Arthur Refinery (Valero)',
    operator: 'Valero',
    country: 'United States',
    city: 'Port Arthur',
    address: 'Port Arthur, Texas, United States',
    capacity_bpd: 360000,
    crude_types: ['light', 'medium', 'extra_heavy'], // Can process all types
    latitude: 29.8989,
    longitude: -93.9286,
  },
  {
    name: 'Chalmette Refinery',
    operator: 'PBF Energy',
    country: 'United States',
    city: 'Chalmette',
    address: 'Chalmette (near New Orleans), Louisiana, United States',
    capacity_bpd: 187000,
    crude_types: ['light', 'medium', 'extra_heavy'], // Can process all types
    latitude: 29.9427,
    longitude: -89.9634,
  },
  {
    name: 'Strathcona Refinery',
    operator: 'Imperial Oil/ExxonMobil',
    country: 'Canada',
    city: 'Sherwood Park',
    address: 'Sherwood Park, Alberta, Canada',
    capacity_bpd: 191000,
    crude_types: ['light', 'medium', 'extra_heavy'], // Can process all types
    latitude: 53.5412,
    longitude: -113.2958,
  },
  {
    name: 'Edmonton Refinery',
    operator: 'Suncor Energy',
    country: 'Canada',
    city: 'Strathcona County',
    address: 'Strathcona County, Alberta, Canada',
    capacity_bpd: 142000,
    crude_types: ['light', 'medium', 'extra_heavy'], // Can process all types
    latitude: 53.5412,
    longitude: -113.2958,
  },
  {
    name: 'Scotford Refinery',
    operator: 'Shell',
    country: 'Canada',
    city: 'Strathcona County',
    address: 'Strathcona County, Alberta, Canada',
    capacity_bpd: 114000,
    crude_types: ['light', 'medium', 'extra_heavy'], // Can process all types
    latitude: 53.5412,
    longitude: -113.2958,
  },
  {
    name: 'Paraguana Refinery Complex',
    operator: 'PDVSA',
    country: 'Venezuela',
    city: 'Punto Fijo',
    address: 'Punto Fijo, Falcón, Venezuela',
    capacity_bpd: 956000,
    crude_types: ['light', 'medium', 'extra_heavy'], // Can process all types
    latitude: 11.7072,
    longitude: -70.1992,
  },
  {
    name: 'Jamnagar Refinery',
    operator: 'Reliance Industries',
    country: 'India',
    city: 'Jamnagar',
    address: 'Jamnagar, Gujarat, India',
    capacity_bpd: 1240000,
    crude_types: ['light', 'medium', 'extra_heavy'], // Can process all types
    latitude: 22.4707,
    longitude: 70.0583,
  },
  {
    name: 'Ruwais Refinery',
    operator: 'ADNOC',
    country: 'United Arab Emirates',
    city: 'Ruwais',
    address: 'Ruwais, UAE',
    capacity_bpd: 817000,
    crude_types: ['light', 'medium', 'extra_heavy'], // Can process all types
    latitude: 24.1333,
    longitude: 52.7333,
  },
  {
    name: 'Dangote Refinery',
    operator: 'Dangote',
    country: 'Nigeria',
    city: 'Lekki',
    address: 'Lekki, Nigeria',
    capacity_bpd: 650000,
    crude_types: ['light', 'medium', 'extra_heavy'], // Can process all types
    latitude: 6.4474,
    longitude: 3.5303,
  },
]

// MEDIUM CRUDE refineries (all others that can accept light/medium)
// This is a large list, so I'll create a helper function to parse them
const mediumRefineriesRaw = `
PBF Energy Toledo Refinery — Toledo, Ohio, United States — ~180,000 bpd
PBF Energy Chalmette Refinery — Chalmette (near New Orleans), Louisiana, United States — ~185,000 bpd
Marathon Los Angeles Refinery — Carson/Wilmington, California, United States — ~365,000 bpd
bp Cherry Point Refinery — Blaine, Washington, United States — ~250,000 bpd
Valero Port Arthur Refinery — Port Arthur, Texas, United States — ~360,000 bpd
Motiva Port Arthur Refinery — Port Arthur, Texas, United States — ~626,000 bpd
ExxonMobil Baton Rouge Refinery — Baton Rouge, Louisiana, United States — ~522,000 bpd
bp Whiting Refinery — Whiting, Indiana, United States — ~440,000 bpd
Pascagoula Refinery — Pascagoula, Mississippi, United States — ~330,000 bpd
Pernis Refinery — Rotterdam, Netherlands — ~404,000 bpd
Antwerp Refinery (TotalEnergies) — Antwerp, Belgium — ~360,000 bpd
Normandy Refinery — Normandy, France — ~350,000 bpd
Antwerp Refinery (ExxonMobil) — Antwerp, Belgium — ~333,000 bpd
Port Jérôme-Gravenchon Refinery — Port Jérôme, France — ~270,000 bpd
Fawley Refinery — Fawley, United Kingdom — ~270,000 bpd
Donges Refinery — Donges, France — ~231,000 bpd
Plock Refinery — Plock, Poland — ~276,000 bpd
Lavera Refinery — Lavera, France — ~210,000 bpd
Gdansk Refinery — Gdansk, Poland — ~210,000 bpd
Ulsan Refinery — Ulsan, South Korea — ~840,000 bpd
Yeosu Refinery — Yeosu, South Korea — ~730,000 bpd
Nayara Refinery — Vadodara, India — 406,000 bpd
Paradip Refinery — Paradip, Odisha, India — 303,000 bpd
Panipat Refinery — Panipat, Haryana, India — 282,500 bpd
Mangalore Refinery — Mangalore, Karnataka, India — 199,000 bpd
Manali Refinery — Chennai, Tamil Nadu, India — 185,000 bpd
Visakhapatnam Refinery — Visakhapatnam, Andhra Pradesh, India — 150,000 bpd
Kochi Refinery — Kochi, Kerala, India — 310,000 bpd
Guru Gobind Singh Refinery — Bathinda, Punjab, India — 230,000 bpd
Barmer Refinery — Barmer, Rajasthan, India — 208,000 bpd
Onsan Refinery — Ulsan, South Korea — 669,000 bpd
Daesan Refinery — Seosan, South Korea — 561,000 bpd
Mailiao Refinery — Mailiao, Taiwan — 540,000 bpd
Sinopec Zhenhai Refinery — Zhenhai, China — 345,000 bpd
Sinopec Maoming Company Refinery — Maoming, China — 265,000 bpd
Sinopec Jinling Company Refinery — Jinling, China — 265,000 bpd
Sinopec Shanghai Gaoqiao Oil Refinery — Shanghai, China — 220,000 bpd
WEPEC Dalian Refinery — Dalian, China — 200,000 bpd
Sinopec Qilu Company Refinery — Qilu, China — 195,000 bpd
Fushun Petrochemical Refinery — Fushun, China — 186,000 bpd
Sinopec Beijing Yanshan Company Refinery — Beijing, China — 165,000 bpd
CPCC Guangzhou Branch Refinery — Guangzhou, China — 150,000 bpd
Dalian Petrochemical Refinery — Dalian, China — 144,000 bpd
Daqing Petrochemical Refinery — Daqing, China — 122,000 bpd
Dushanzi Refinery — Dushanzi, China — 120,000 bpd
Jilin Chemical Refinery — Jilin, China — 115,000 bpd
Lanzhou Refinery — Lanzhou, China — 112,000 bpd
Jinxi Refinery — Jinxi, China — 112,000 bpd
Jinzhou Petrochemical Refinery — Jinzhou, China — 112,000 bpd
Sinopec Anqing Company Refinery — Anqing, China — 110,000 bpd
Ürümqi Petrochemical — Ürümqi, China — 101,000 bpd
Sinopec Luoyang Company — Luoyang, China — 100,000 bpd
Sinopec Jingmen Company — Jingmen, China — 100,000 bpd
CPCC Changling Company Refinery — Changling, China — 100,000 bpd
Sinopec Tianjin Company Refinery — Tianjin, China — 100,000 bpd
Sinopec Jiujiang Company Refinery — Jiujiang, China — 98,000 bpd
Sinopec Wuhan Company Refinery — Wuhan, China — 80,000 bpd
Sinopec Cangzhou Company Refinery — Cangzhou, China — 70,000 bpd
Sinopec Jinan Company — Jinan, China — 21,000 bpd
Sinopec Beihai Company Refinery — Beihai, China — 12,000 bpd
Negishi Yokohama Refinery — Yokohama, Japan — 340,000 bpd
Kawasaki Refinery — Kawasaki, Japan — 335,000 bpd
Chiba Refinery — Chiba, Japan — 240,000 bpd
Kashima Refinery — Kashima, Japan — 210,000 bpd
Showa Yokkaichi Refinery — Yokkaichi, Japan — 210,000 bpd
Mizushima Refinery — Mizushima, Japan — 205,200 bpd
Keihin Refinery — Keihin, Japan — 185,000 bpd
Muroran Refinery — Muroran, Japan — 180,000 bpd
Yokkaichi Refinery — Yokkaichi, Japan — 175,000 bpd
Wakayama Refinery — Wakayama, Japan — 170,000 bpd
Ohita Refinery — Ohita, Japan — 160,000 bpd
Aichi Refinery — Aichi, Japan — 160,000 bpd
Sakai Refinery — Sakai, Japan — 156,000 bpd
Sendai Refinery — Sendai, Japan — 145,000 bpd
Hokkaido Refinery — Hokkaido, Japan — 140,000 bpd
Marifu Refinery — Marifu, Japan — 127,000 bpd
Yamaguchi Refinery — Yamaguchi, Japan — 120,000 bpd
Tokuyama Refinery — Tokuyama, Japan — 120,000 bpd
Shikoku Refinery — Shikoku, Japan — 120,000 bpd
Sodegaura Refinery — Sodegaura, Japan — 192,000 bpd
Nishihara Refinery — Nishihara, Japan — 100,000 bpd
Toyama Refinery — Toyama, Japan — 60,000 bpd
Kubiki Refinery — Kubiki, Japan — 4,410 bpd
Balikpapan Refinery — Balikpapan, Indonesia — 360,000 bpd
Cilacap Refinery — Cilacap, Indonesia — 348,000 bpd
Dumai Refinery — Dumai, Indonesia — 170,000 bpd
Balongan Refinery — Balongan, Indonesia — 150,000 bpd
Plaju Refinery — Plaju, Indonesia — 126,000 bpd
Sorong Refinery — Sorong, Indonesia — 10,000 bpd
Shymkent Refinery — Shymkent, Kazakhstan — 160,000 bpd
Pavlodar Refinery — Pavlodar, Kazakhstan — 162,600 bpd
Atyrau Refinery — Atyrau, Kazakhstan — 104,400 bpd
Pengerang Refining Company — Pengerang, Malaysia — 300,000 bpd
Malaysian Refining Company — Melaka, Malaysia — 300,000 bpd
Hengyuan Refining Company — Port Dickson, Malaysia — 156,000 bpd
Petronas Penapisan (Terengganu) — Kerteh, Malaysia — 124,000 bpd
Kemaman Bitumen Refinery — Kemaman, Malaysia — 100,000 bpd
PSR-1 Melaka I Refinery — Melaka, Malaysia — 100,000 bpd
PSR-2 Melaka II Refinery — Melaka, Malaysia — 100,000 bpd
Port Dickson Refinery — Port Dickson, Malaysia — 88,000 bpd
Al Zour Refinery — Al Zour, Kuwait — 615,000 bpd
Mina Al-Ahmadi Refinery — Mina Al-Ahmadi, Kuwait — 466,000 bpd
Mina Abdullah Refinery — Mina Abdullah, Kuwait — 270,000 bpd
Ras Tanura Refinery — Ras Tanura, Saudi Arabia — 550,000 bpd
Abadan Refinery — Abadan, Iran — 450,000 bpd
Isfahan Refinery — Isfahan, Iran — 375,000 bpd
Persian Gulf Star Oil Refinery — Bandar Abbas, Iran — 360,000 bpd
Bandar Abbas Refinery — Bandar Abbas, Iran — 350,000 bpd
Arak Refinery — Arak, Iran — 250,000 bpd
Tehran Refinery — Tehran, Iran — 225,000 bpd
Arvand Oil Refinery — Arvand, Iran — 120,000 bpd
Tabriz Refinery — Tabriz, Iran — 112,000 bpd
Lavan Refinery — Lavan, Iran — 60,000 bpd
Shiraz Refinery — Shiraz, Iran — 40,000 bpd
Kermanshah Refinery — Kermanshah, Iran — 25,000 bpd
Basrah Refinery — Basrah, Iraq — 210,000 bpd
Daurah Refinery — Baghdad, Iraq — 180,000 bpd
Kirkuk Refinery — Kirkuk, Iraq — 170,000 bpd
Baiji North Refinery — Baiji, Iraq — 150,000 bpd
Mirsan Refinery — Kurdistan, Iraq — 150,000 bpd
Karbala Refinery — Karbala, Iraq — 150,000 bpd
Baiji Salahedden Refinery — Baiji, Iraq — 70,000 bpd
Samawah Refinery — Samawah, Iraq — 27,000 bpd
Haditha Refinery — Haditha, Iraq — 14,000 bpd
Khanaqin/Alwand Refinery — Khanaqin, Iraq — 10,500 bpd
Majd Al Iraq — Iraq — 6,500 bpd
Muftiah Refinery — Muftiah, Iraq — 4,500 bpd
Gaiyarah Refinery — Gaiyarah, Iraq — 4,000 bpd
Haifa Refinery — Haifa, Israel — 197,000 bpd
Ashdod Oil Refineries — Ashdod, Israel — 108,000 bpd
Jordan Refinery — Zarqa, Jordan — 90,000 bpd
Bahrain Petroleum Company Refinery — Sitra, Bahrain — 267,000 bpd
Skikda Refinery — Skikda, Algeria — 350,000 bpd
Ra's Lanuf Refinery — Ra's Lanuf, Libya — 220,000 bpd
Port Harcourt Refinery — Port Harcourt, Nigeria — 210,000 bpd
Sapref Refinery — Durban, South Africa — 180,000 bpd
Cairo Mostorod Refinery — Cairo, Egypt — 142,000 bpd
Engen Refinery — Durban, South Africa — 135,000 bpd
El Nasr Refinery — Suez, Egypt — 132,000 bpd
Cape Town Refinery — Cape Town, South Africa — 100,000 bpd
Khartoum Refinery — Khartoum, Sudan — 100,000 bpd
REPLAN Refinery — Paulínia, Brazil — 434,000 bpd
Salina Cruz Refinery — Salina Cruz, Oaxaca, Mexico — 330,000 bpd
Dos Bocas (Olmeca) Refinery — Paraiso, Tabasco, Mexico — 340,000 bpd
Tula Refinery — Tula, Hidalgo, Mexico — 320,000 bpd
Isla Refinery — Curaçao — 320,000 bpd
RLAM Refinery — São Francisco do Conde, Brazil — 280,000 bpd
REVAP Refinery — São José dos Campos, Brazil — 251,500 bpd
REDUC Refinery — Duque de Caxias, Brazil — 242,000 bpd
REPAR Refinery — Araucária, Brazil — 220,000 bpd
REFAP Refinery — Canoas, Brazil — 201,000 bpd
RPBC Refinery — Cubatão, Brazil — 170,000 bpd
REGAP Refinery — Betim, Brazil — 170,000 bpd
Barrancabermeja-Santander Refinery — Barrancabermeja, Colombia — 240,000 bpd
Cartagena Refinery — Cartagena, Colombia — 210,000 bpd
La Plata Refinery — La Plata, Argentina — 189,000 bpd
Buenos Aires Refinery — Buenos Aires, Argentina — 110,000 bpd
Luján de Cuyo Refinery — Luján de Cuyo, Argentina — 105,500 bpd
Esso Campana Refinery — Campana, Argentina — 84,500 bpd
San Lorenzo Refinery — San Lorenzo, Argentina — 38,000 bpd
Plaza Huincul Refinery — Plaza Huincul, Argentina — 25,000 bpd
Campo Duran Refinery — Campo Duran, Argentina — 32,000 bpd
Bahía Blanca Refinery — Bahía Blanca, Argentina — 28,975 bpd
Esmeraldas Refinery — Esmeraldas, Ecuador — 110,000 bpd
La Libertad Refinery — La Libertad, Ecuador — 45,000 bpd
Shushufindi Refinery — Shushufindi, Ecuador — 20,000 bpd
Refinería La Pampilla — Ventanilla/Lima, Peru — 102,000 bpd
Refinería de Talara — Talara, Peru — 65,000 bpd
Refinería Conchan — Conchan, Peru — 15,000 bpd
Refinería Pucallpa — Pucallpa, Peru — 3,250 bpd
Refinería El Milagro — El Milagro, Peru — 1,500 bpd
Refinería Shiviyacu — Shiviyacu, Peru — 2,000 bpd
Gualberto Villarael Cochabamba Refinery — Cochabamba, Bolivia — 40,000 bpd
Guillermo Elder Bell Santa Cruz Refinery — Santa Cruz, Bolivia — 20,000 bpd
Villa Elisa Refinery — Villa Elisa, Paraguay — 7,500 bpd
Staatsolie Refinery — Paramaribo, Suriname — 15,000 bpd
La Teja Refinery — La Teja, Uruguay — 50,000 bpd
Geelong Oil Refinery — Geelong, Victoria, Australia — 130,000 bpd
Lytton Oil Refinery — Lytton, Queensland, Australia — 104,000 bpd
Eromanga Refinery — Eromanga, Queensland, Australia — 1,200 bpd
InterOil Refinery — Port Moresby, Papua New Guinea — 32,500 bpd
`

// Helper function to parse refinery strings and extract data
function parseRefineryString(line: string): RefineryData | null {
  const parts = line.split('—').map(p => p.trim()).filter(p => p)
  if (parts.length < 2) return null

  const name = parts[0]
  const location = parts[1]
  const capacityStr = parts[2] || parts[1] // Sometimes capacity is in second part

  // Extract capacity
  const capacityMatch = capacityStr.match(/([\d,]+)\s*bpd/i) || capacityStr.match(/~?([\d,]+)/)
  const capacity = capacityMatch ? parseFloat(capacityMatch[1].replace(/,/g, '')) : 0

  // Parse location
  const locationParts = location.split(',').map(p => p.trim())
  const country = locationParts[locationParts.length - 1] || ''
  const city = locationParts[0] || ''

  return {
    name,
    country,
    city,
    address: location,
    capacity_bpd: capacity,
    crude_types: ['light', 'medium'], // Medium refineries can accept light and medium
  }
}

// Geocoding helper - simplified coordinates for major cities
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  // US Cities
  'Toledo': { lat: 41.6528, lng: -83.5379 },
  'Chalmette': { lat: 29.9427, lng: -89.9634 },
  'Carson': { lat: 33.8314, lng: -118.2820 },
  'Wilmington': { lat: 33.7701, lng: -118.2626 },
  'Whiting': { lat: 41.6798, lng: -87.4948 },
  'Blaine': { lat: 48.9937, lng: -122.7471 },
  'Port Arthur': { lat: 29.8989, lng: -93.9286 },
  'Baton Rouge': { lat: 30.4515, lng: -91.1871 },
  'Pascagoula': { lat: 30.3658, lng: -88.5561 },
  // European Cities
  'Rotterdam': { lat: 51.9225, lng: 4.4792 },
  'Antwerp': { lat: 51.2194, lng: 4.4025 },
  'Normandy': { lat: 49.1829, lng: -0.3707 },
  'Port Jérôme': { lat: 49.4833, lng: 0.5167 },
  'Fawley': { lat: 50.8333, lng: -1.3500 },
  'Donges': { lat: 47.3167, lng: -2.0833 },
  'Plock': { lat: 52.5500, lng: 19.7000 },
  'Lavera': { lat: 43.3833, lng: 5.0167 },
  'Gdansk': { lat: 54.3520, lng: 18.6466 },
  // Asian Cities
  'Ulsan': { lat: 35.5384, lng: 129.3114 },
  'Yeosu': { lat: 34.7604, lng: 127.6622 },
  'Vadodara': { lat: 22.3072, lng: 73.1812 },
  'Paradip': { lat: 20.3167, lng: 86.6167 },
  'Panipat': { lat: 29.3909, lng: 76.9635 },
  'Mangalore': { lat: 12.9141, lng: 74.8560 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Visakhapatnam': { lat: 17.6868, lng: 83.2185 },
  'Kochi': { lat: 9.9312, lng: 76.2673 },
  'Bathinda': { lat: 30.2070, lng: 74.9455 },
  'Barmer': { lat: 25.7500, lng: 71.3833 },
  'Seosan': { lat: 36.7847, lng: 126.4503 },
  'Mailiao': { lat: 23.8000, lng: 120.2000 },
  'Zhenhai': { lat: 29.9500, lng: 121.7167 },
  'Maoming': { lat: 21.6600, lng: 110.9200 },
  'Jinling': { lat: 32.0500, lng: 118.7833 },
  'Shanghai': { lat: 31.2304, lng: 121.4737 },
  'Dalian': { lat: 38.9140, lng: 121.6147 },
  'Qilu': { lat: 36.7000, lng: 117.1000 },
  'Fushun': { lat: 41.8570, lng: 123.9236 },
  'Beijing': { lat: 39.9042, lng: 116.4074 },
  'Guangzhou': { lat: 23.1291, lng: 113.2644 },
  'Daqing': { lat: 46.5877, lng: 125.1031 },
  'Dushanzi': { lat: 44.3333, lng: 84.8833 },
  'Jilin': { lat: 43.8508, lng: 126.5603 },
  'Lanzhou': { lat: 36.0611, lng: 103.8343 },
  'Jinxi': { lat: 40.7500, lng: 120.8500 },
  'Jinzhou': { lat: 41.1078, lng: 121.1417 },
  'Anqing': { lat: 30.5256, lng: 117.0500 },
  'Ürümqi': { lat: 43.8256, lng: 87.6168 },
  'Luoyang': { lat: 34.6197, lng: 112.4540 },
  'Jingmen': { lat: 31.0333, lng: 112.2000 },
  'Changling': { lat: 44.2667, lng: 123.9667 },
  'Tianjin': { lat: 39.3434, lng: 117.3616 },
  'Jiujiang': { lat: 29.7050, lng: 116.0020 },
  'Wuhan': { lat: 30.5928, lng: 114.3055 },
  'Cangzhou': { lat: 38.3106, lng: 116.8458 },
  'Jinan': { lat: 36.6512, lng: 117.1201 },
  'Beihai': { lat: 21.4733, lng: 109.1200 },
  'Yokohama': { lat: 35.4437, lng: 139.6380 },
  'Kawasaki': { lat: 35.5309, lng: 139.7030 },
  'Chiba': { lat: 35.6074, lng: 140.1065 },
  'Kashima': { lat: 35.9667, lng: 140.6333 },
  'Yokkaichi': { lat: 34.9651, lng: 136.6245 },
  'Mizushima': { lat: 34.5167, lng: 133.7333 },
  'Keihin': { lat: 35.4667, lng: 139.6500 },
  'Muroran': { lat: 42.3167, lng: 140.9833 },
  'Wakayama': { lat: 34.2261, lng: 135.1675 },
  'Ohita': { lat: 33.2333, lng: 131.6000 },
  'Aichi': { lat: 35.1803, lng: 136.9066 },
  'Sakai': { lat: 34.5733, lng: 135.4831 },
  'Sendai': { lat: 38.2682, lng: 140.8694 },
  'Hokkaido': { lat: 43.0642, lng: 141.3469 },
  'Marifu': { lat: 34.0167, lng: 131.5667 },
  'Yamaguchi': { lat: 34.1858, lng: 131.4706 },
  'Tokuyama': { lat: 34.0500, lng: 131.8167 },
  'Shikoku': { lat: 33.8333, lng: 133.5333 },
  'Sodegaura': { lat: 35.4167, lng: 139.9500 },
  'Nishihara': { lat: 26.1833, lng: 127.7667 },
  'Toyama': { lat: 36.6953, lng: 137.2113 },
  'Kubiki': { lat: 37.4000, lng: 138.5500 },
  'Balikpapan': { lat: -1.2635, lng: 116.8275 },
  'Cilacap': { lat: -7.7333, lng: 109.0167 },
  'Dumai': { lat: 1.6667, lng: 101.4500 },
  'Balongan': { lat: -6.3667, lng: 108.3667 },
  'Plaju': { lat: -2.9833, lng: 104.7500 },
  'Sorong': { lat: -0.8667, lng: 131.2500 },
  'Shymkent': { lat: 42.3000, lng: 69.6000 },
  'Pavlodar': { lat: 52.2833, lng: 76.9667 },
  'Atyrau': { lat: 47.1167, lng: 51.8833 },
  'Pengerang': { lat: 1.3667, lng: 104.1167 },
  'Melaka': { lat: 2.1896, lng: 102.2501 },
  'Port Dickson': { lat: 2.5167, lng: 101.8000 },
  'Kerteh': { lat: 4.5167, lng: 103.4500 },
  'Kemaman': { lat: 4.2333, lng: 103.4167 },
  'Al Zour': { lat: 29.0167, lng: 48.0833 },
  'Mina Al-Ahmadi': { lat: 29.0833, lng: 48.1333 },
  'Mina Abdullah': { lat: 29.0333, lng: 48.1667 },
  'Ras Tanura': { lat: 26.6500, lng: 50.1500 },
  'Abadan': { lat: 30.3392, lng: 48.3042 },
  'Isfahan': { lat: 32.6546, lng: 51.6680 },
  'Bandar Abbas': { lat: 27.1833, lng: 56.2667 },
  'Arak': { lat: 34.0917, lng: 49.6892 },
  'Tehran': { lat: 35.6892, lng: 51.3890 },
  'Arvand': { lat: 30.0167, lng: 48.4667 },
  'Tabriz': { lat: 38.0814, lng: 46.3006 },
  'Lavan': { lat: 26.8167, lng: 53.2500 },
  'Shiraz': { lat: 29.5918, lng: 52.5837 },
  'Kermanshah': { lat: 34.3142, lng: 47.0650 },
  'Basrah': { lat: 30.5150, lng: 47.8100 },
  'Baghdad': { lat: 33.3152, lng: 44.3661 },
  'Kirkuk': { lat: 35.4681, lng: 44.3922 },
  'Baiji': { lat: 34.9333, lng: 43.4833 },
  'Kurdistan': { lat: 36.1911, lng: 44.0092 },
  'Karbala': { lat: 32.6167, lng: 44.0333 },
  'Samawah': { lat: 31.3167, lng: 45.2833 },
  'Haditha': { lat: 34.1333, lng: 42.3667 },
  'Khanaqin': { lat: 34.3333, lng: 45.3833 },
  'Haifa': { lat: 32.8192, lng: 34.9980 },
  'Ashdod': { lat: 31.8044, lng: 34.6553 },
  'Zarqa': { lat: 32.0728, lng: 36.0881 },
  'Sitra': { lat: 26.1500, lng: 50.6167 },
  'Skikda': { lat: 36.8667, lng: 6.9000 },
  'Ra\'s Lanuf': { lat: 30.5167, lng: 18.5333 },
  'Port Harcourt': { lat: 4.8156, lng: 7.0498 },
  'Durban': { lat: -29.8587, lng: 31.0218 },
  'Cairo': { lat: 30.0444, lng: 31.2357 },
  'Suez': { lat: 29.9668, lng: 32.5498 },
  'Cape Town': { lat: -33.9249, lng: 18.4241 },
  'Khartoum': { lat: 15.5007, lng: 32.5599 },
  'Paulínia': { lat: -22.7611, lng: -47.1542 },
  'Salina Cruz': { lat: 16.1833, lng: -95.2000 },
  'Paraiso': { lat: 18.4000, lng: -93.2167 },
  'Tula': { lat: 20.0667, lng: -99.3500 },
  'Curaçao': { lat: 12.1696, lng: -68.9900 },
  'São Francisco do Conde': { lat: -12.6278, lng: -38.6800 },
  'São José dos Campos': { lat: -23.1791, lng: -45.8872 },
  'Duque de Caxias': { lat: -22.7858, lng: -43.3117 },
  'Araucária': { lat: -25.5928, lng: -49.4047 },
  'Canoas': { lat: -29.9178, lng: -51.1836 },
  'Cubatão': { lat: -23.8950, lng: -46.4253 },
  'Betim': { lat: -19.9678, lng: -44.1978 },
  'Barrancabermeja': { lat: 7.0653, lng: -73.8547 },
  'Cartagena': { lat: 10.3910, lng: -75.4794 },
  'La Plata': { lat: -34.9215, lng: -57.9545 },
  'Buenos Aires': { lat: -34.6037, lng: -58.3816 },
  'Luján de Cuyo': { lat: -33.0333, lng: -68.8833 },
  'Campana': { lat: -34.1689, lng: -58.9592 },
  'San Lorenzo': { lat: -32.7500, lng: -60.7333 },
  'Plaza Huincul': { lat: -38.9333, lng: -69.2000 },
  'Campo Duran': { lat: -23.2167, lng: -64.0833 },
  'Bahía Blanca': { lat: -38.7183, lng: -62.2663 },
  'Esmeraldas': { lat: 0.9667, lng: -79.6667 },
  'La Libertad': { lat: -2.2333, lng: -80.9000 },
  'Shushufindi': { lat: -0.1833, lng: -76.6333 },
  'Ventanilla': { lat: -11.8667, lng: -77.1333 },
  'Lima': { lat: -12.0464, lng: -77.0428 },
  'Talara': { lat: -4.5767, lng: -81.2719 },
  'Conchan': { lat: -12.1167, lng: -76.9833 },
  'Pucallpa': { lat: -8.3833, lng: -74.5500 },
  'El Milagro': { lat: -3.5000, lng: -73.5667 },
  'Shiviyacu': { lat: -4.5833, lng: -73.5167 },
  'Cochabamba': { lat: -17.3935, lng: -66.1570 },
  'Santa Cruz': { lat: -17.8146, lng: -63.1561 },
  'Villa Elisa': { lat: -25.3833, lng: -57.6000 },
  'Paramaribo': { lat: 5.8520, lng: -55.2038 },
  'La Teja': { lat: -34.8833, lng: -56.2167 },
  'Geelong': { lat: -38.1499, lng: 144.3617 },
  'Lytton': { lat: -27.4167, lng: 153.1500 },
  'Eromanga': { lat: -26.7500, lng: 143.2667 },
  'Port Moresby': { lat: -9.4780, lng: 147.1500 },
}

// Function to get coordinates for a refinery
function getCoordinates(refinery: RefineryData): { lat: number; lng: number } {
  // If coordinates already provided, use them
  if (refinery.latitude && refinery.longitude) {
    return { lat: refinery.latitude, lng: refinery.longitude }
  }

  // Try to find by city name
  if (refinery.city) {
    const coords = cityCoordinates[refinery.city]
    if (coords) return coords
  }

  // Try to find by country capital or major city
  const countryCapitals: Record<string, { lat: number; lng: number }> = {
    'United States': { lat: 38.9072, lng: -77.0369 },
    'Netherlands': { lat: 52.3676, lng: 4.9041 },
    'Belgium': { lat: 50.8503, lng: 4.3517 },
    'France': { lat: 48.8566, lng: 2.3522 },
    'United Kingdom': { lat: 51.5074, lng: -0.1278 },
    'Poland': { lat: 52.2297, lng: 21.0122 },
    'South Korea': { lat: 37.5665, lng: 126.9780 },
    'India': { lat: 28.6139, lng: 77.2090 },
    'China': { lat: 39.9042, lng: 116.4074 },
    'Japan': { lat: 35.6762, lng: 139.6503 },
    'Indonesia': { lat: -6.2088, lng: 106.8456 },
    'Kazakhstan': { lat: 51.1694, lng: 71.4491 },
    'Malaysia': { lat: 3.1390, lng: 101.6869 },
    'Kuwait': { lat: 29.3759, lng: 47.9774 },
    'Saudi Arabia': { lat: 24.7136, lng: 46.6753 },
    'Iran': { lat: 35.6892, lng: 51.3890 },
    'Iraq': { lat: 33.3152, lng: 44.3661 },
    'Israel': { lat: 31.7683, lng: 35.2137 },
    'Jordan': { lat: 31.9539, lng: 35.9106 },
    'Bahrain': { lat: 26.0667, lng: 50.5577 },
    'Algeria': { lat: 36.7538, lng: 3.0588 },
    'Libya': { lat: 32.8872, lng: 13.1913 },
    'Nigeria': { lat: 9.0765, lng: 7.3986 },
    'South Africa': { lat: -25.7479, lng: 28.2293 },
    'Egypt': { lat: 30.0444, lng: 31.2357 },
    'Sudan': { lat: 15.5007, lng: 32.5599 },
    'Brazil': { lat: -15.7942, lng: -47.8822 },
    'Mexico': { lat: 19.4326, lng: -99.1332 },
    'Colombia': { lat: 4.7110, lng: -74.0721 },
    'Argentina': { lat: -34.6037, lng: -58.3816 },
    'Ecuador': { lat: -0.1807, lng: -78.4678 },
    'Peru': { lat: -12.0464, lng: -77.0428 },
    'Bolivia': { lat: -16.2902, lng: -63.5887 },
    'Paraguay': { lat: -25.2637, lng: -57.5759 },
    'Suriname': { lat: 5.8520, lng: -55.2038 },
    'Uruguay': { lat: -34.9011, lng: -56.1645 },
    'Australia': { lat: -35.2809, lng: 149.1300 },
    'Papua New Guinea': { lat: -9.4780, lng: 147.1500 },
    'United Arab Emirates': { lat: 24.4539, lng: 54.3773 },
  }

  return countryCapitals[refinery.country] || { lat: 0, lng: 0 }
}

async function main() {
  console.log('Starting refinery import...')

  // Create a map of refineries by normalized name to handle duplicates
  const refineryMap = new Map<string, RefineryData>()

  // Add light only refineries first
  for (const refinery of lightOnlyRefineries) {
    const normalizedName = refinery.name.toLowerCase().trim()
    refineryMap.set(normalizedName, refinery)
  }

  // Add extra heavy refineries (these can process all types)
  for (const refinery of extraHeavyRefineries) {
    const normalizedName = refinery.name.toLowerCase().trim()
    refineryMap.set(normalizedName, refinery)
  }

  // Parse medium refineries and add only if not already present
  for (const line of mediumRefineriesRaw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const refinery = parseRefineryString(trimmed)
    if (!refinery || refinery.capacity_bpd === 0) continue

    const normalizedName = refinery.name.toLowerCase().trim()
    
    // Skip if already exists (from extra heavy list)
    if (refineryMap.has(normalizedName)) {
      console.log(`Skipping duplicate (already in extra heavy): ${refinery.name}`)
      continue
    }

    // Get coordinates
    const coords = getCoordinates(refinery)
    refinery.latitude = coords.lat
    refinery.longitude = coords.lng

    refineryMap.set(normalizedName, refinery)
  }

  // Convert map to array
  const allRefineries = Array.from(refineryMap.values())

  console.log(`Total refineries to import: ${allRefineries.length}`)
  console.log(`- Light only: ${lightOnlyRefineries.length}`)
  console.log(`- Extra heavy: ${extraHeavyRefineries.length}`)
  console.log(`- Medium: ${allRefineries.length - lightOnlyRefineries.length - extraHeavyRefineries.length}`)

  // Insert into database
  let successCount = 0
  let errorCount = 0

  for (const refinery of allRefineries) {
    try {
      const { error } = await supabase.from('refineries').insert({
        name: refinery.name,
        operator: refinery.operator || null,
        country: refinery.country,
        city: refinery.city || null,
        address: refinery.address || null,
        latitude: refinery.latitude!,
        longitude: refinery.longitude!,
        capacity_bpd: refinery.capacity_bpd,
        crude_types_accepted: refinery.crude_types,
        operational_status: 'operational',
      })

      if (error) {
        console.error(`Error inserting ${refinery.name}:`, error.message)
        errorCount++
      } else {
        successCount++
        if (successCount % 10 === 0) {
          console.log(`Inserted ${successCount} refineries...`)
        }
      }
    } catch (err) {
      console.error(`Exception inserting ${refinery.name}:`, err)
      errorCount++
    }
  }

  console.log(`\nImport complete!`)
  console.log(`Success: ${successCount}`)
  console.log(`Errors: ${errorCount}`)
}

main().catch(console.error)
