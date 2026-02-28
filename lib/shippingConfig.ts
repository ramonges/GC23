// Shipping delivery model configuration
// Uses data from Supabase (commodity_locations, coal_mines, gold_mines)
// + static ports, vessel classes, charter types

export type CharterType = 'voyage' | 'time' | 'bareboat'

export interface Port {
  name: string
  country: string
  lat: number
  lng: number
  region: string
}

export const majorPorts: Port[] = [
  { name: 'Port Hedland', country: 'Australia', lat: -20.3, lng: 118.6, region: 'Oceania' },
  { name: 'Dampier', country: 'Australia', lat: -20.7, lng: 116.7, region: 'Oceania' },
  { name: 'Newcastle', country: 'Australia', lat: -32.9, lng: 151.8, region: 'Oceania' },
  { name: 'Tubarao', country: 'Brazil', lat: -20.3, lng: -40.3, region: 'South America' },
  { name: 'Santos', country: 'Brazil', lat: -23.9, lng: -46.3, region: 'South America' },
  { name: 'Richards Bay', country: 'South Africa', lat: -28.8, lng: 32.1, region: 'South Africa' },
  { name: 'Bolivar', country: 'Colombia', lat: 12.2, lng: -72.2, region: 'South America' },
  { name: 'Qingdao', country: 'China', lat: 36.1, lng: 120.4, region: 'East Asia' },
  { name: 'Shanghai', country: 'China', lat: 31.2, lng: 121.5, region: 'East Asia' },
  { name: 'Ningbo', country: 'China', lat: 29.9, lng: 121.6, region: 'East Asia' },
  { name: 'Beilun/Baoshan', country: 'China', lat: 29.9, lng: 121.8, region: 'East Asia' },
  { name: 'Busan', country: 'South Korea', lat: 35.1, lng: 129.0, region: 'East Asia' },
  { name: 'Ras Tanura', country: 'Saudi Arabia', lat: 26.6, lng: 50.2, region: 'Middle East' },
  { name: 'Jubail', country: 'Saudi Arabia', lat: 27.0, lng: 49.7, region: 'Middle East' },
  { name: 'Fujairah', country: 'UAE', lat: 25.1, lng: 56.3, region: 'Middle East' },
  { name: 'Singapore', country: 'Singapore', lat: 1.3, lng: 103.8, region: 'Southeast Asia' },
  { name: 'Lagos', country: 'Nigeria', lat: 6.4, lng: 3.4, region: 'West Africa' },
  { name: 'Rotterdam', country: 'Netherlands', lat: 51.9, lng: 4.5, region: 'North Europe' },
  { name: 'Antwerp', country: 'Belgium', lat: 51.2, lng: 4.4, region: 'North Europe' },
  { name: 'Hamburg', country: 'Germany', lat: 53.6, lng: 10.0, region: 'North Europe' },
  { name: 'Houston', country: 'United States', lat: 29.8, lng: -95.0, region: 'US Gulf' },
  { name: 'New Orleans', country: 'United States', lat: 29.9, lng: -90.1, region: 'US Gulf' },
  { name: 'New York', country: 'United States', lat: 40.7, lng: -74.0, region: 'US East Coast' },
]

export interface CommoditySpec {
  unit: string
  parcels: { size: number; label: string }[]
  vesselTypes: string[]
  loadingRateMtHr: number
  dischargeRateMtHr: number
  bblPerMt?: number
  specFields?: string[]
}

export const commoditySpecs: Record<string, CommoditySpec> = {
  'Crude Oil': {
    unit: 'bbls',
    bblPerMt: 7.33,
    parcels: [
      { size: 500000, label: '500k bbls (VLCC full)' },
      { size: 270000, label: '270k bbls (Suezmax)' },
      { size: 135000, label: '135k bbls (Aframax)' },
      { size: 80000, label: '80k bbls (Panamax)' },
    ],
    vesselTypes: ['VLCC', 'Suezmax', 'Aframax'],
    loadingRateMtHr: 12500,
    dischargeRateMtHr: 10000,
    specFields: ['api_gravity', 'sulfur_content'],
  },
  'Natural Gas': {
    unit: 'mmbtu',
    parcels: [
      { size: 170000, label: '170k m³ (LNG)' },
      { size: 145000, label: '145k m³ (standard)' },
    ],
    vesselTypes: ['LNG Carrier'],
    loadingRateMtHr: 8000,
    dischargeRateMtHr: 6000,
  },
  'Uranium': {
    unit: 'MT',
    parcels: [
      { size: 55000, label: '55k MT (Supramax)' },
      { size: 30000, label: '30k MT (Handymax)' },
    ],
    vesselTypes: ['Supramax', 'Handymax'],
    loadingRateMtHr: 1500,
    dischargeRateMtHr: 1200,
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
    specFields: ['grade', 'calorific_value_kcal_kg', 'sulfur_percent'],
  },
  'Gold': {
    unit: 'MT',
    parcels: [
      { size: 30000, label: '30k MT (Handymax)' },
      { size: 15000, label: '15k MT (Handysize)' },
    ],
    vesselTypes: ['Handymax', 'Handysize'],
    loadingRateMtHr: 1000,
    dischargeRateMtHr: 800,
  },
  'Iron Ore': {
    unit: 'MT',
    parcels: [
      { size: 300000, label: '300k MT (Valemax/VLOC)' },
      { size: 180000, label: '180k MT (Capesize)' },
      { size: 80000, label: '80k MT (Panamax)' },
      { size: 55000, label: '55k MT (Supramax)' },
    ],
    vesselTypes: ['Capesize', 'Panamax', 'Supramax'],
    loadingRateMtHr: 6000,
    dischargeRateMtHr: 5000,
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
  'Grain': {
    unit: 'MT',
    parcels: [
      { size: 70000, label: '70k MT (Panamax)' },
      { size: 55000, label: '55k MT (Supramax)' },
      { size: 35000, label: '35k MT (Handymax)' },
    ],
    vesselTypes: ['Panamax', 'Supramax', 'Handymax', 'Handysize'],
    loadingRateMtHr: 2000,
    dischargeRateMtHr: 1800,
  },
}

export interface VesselConfig {
  dwtMin: number
  dwtMax: number
  speed: number
  fuelAtSea: number
  fuelInPort: number
  tceRate: number
  portCostPerCall: number
  demurrageRate: number
  canalPanama: boolean
  canalSuez: boolean
  commodities: string[]
}

export const vesselClasses: Record<string, VesselConfig> = {
  'VLCC': { dwtMin: 200000, dwtMax: 320000, speed: 14.5, fuelAtSea: 88, fuelInPort: 7, tceRate: 35000, portCostPerCall: 105000, demurrageRate: 70000, canalPanama: false, canalSuez: true, commodities: ['Crude Oil'] },
  'Suezmax': { dwtMin: 120000, dwtMax: 200000, speed: 14, fuelAtSea: 62, fuelInPort: 6, tceRate: 28000, portCostPerCall: 80000, demurrageRate: 47500, canalPanama: false, canalSuez: true, commodities: ['Crude Oil'] },
  'Aframax': { dwtMin: 80000, dwtMax: 120000, speed: 14, fuelAtSea: 47, fuelInPort: 5, tceRate: 22000, portCostPerCall: 62500, demurrageRate: 35000, canalPanama: false, canalSuez: true, commodities: ['Crude Oil'] },
  'LNG Carrier': { dwtMin: 145000, dwtMax: 217000, speed: 19, fuelAtSea: 145, fuelInPort: 12, tceRate: 75000, portCostPerCall: 120000, demurrageRate: 95000, canalPanama: false, canalSuez: true, commodities: ['Natural Gas'] },
  'Capesize': { dwtMin: 100000, dwtMax: 400000, speed: 14, fuelAtSea: 60, fuelInPort: 5, tceRate: 18000, portCostPerCall: 70000, demurrageRate: 30000, canalPanama: false, canalSuez: true, commodities: ['Iron Ore', 'Coal'] },
  'Panamax': { dwtMin: 65000, dwtMax: 90000, speed: 13.5, fuelAtSea: 35, fuelInPort: 4, tceRate: 12000, portCostPerCall: 45000, demurrageRate: 18500, canalPanama: true, canalSuez: true, commodities: ['Iron Ore', 'Coal', 'Grain'] },
  'Supramax': { dwtMin: 50000, dwtMax: 65000, speed: 13, fuelAtSea: 26, fuelInPort: 3, tceRate: 10000, portCostPerCall: 32500, demurrageRate: 13000, canalPanama: true, canalSuez: true, commodities: ['Iron Ore', 'Coal', 'Grain', 'Copper', 'Uranium', 'Gold'] },
  'Handymax': { dwtMin: 35000, dwtMax: 50000, speed: 12.5, fuelAtSea: 21, fuelInPort: 2.5, tceRate: 8500, portCostPerCall: 25000, demurrageRate: 9500, canalPanama: true, canalSuez: true, commodities: ['Coal', 'Grain', 'Copper', 'Gold'] },
  'Handysize': { dwtMin: 25000, dwtMax: 50000, speed: 12, fuelAtSea: 21, fuelInPort: 2.5, tceRate: 8000, portCostPerCall: 25000, demurrageRate: 9000, canalPanama: true, canalSuez: true, commodities: ['Grain', 'Copper', 'Gold'] },
}

export function haversineDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export function findNearestPort(assetLat: number, assetLng: number): { port: Port; distanceKm: number } {
  let nearest = majorPorts[0]
  let minDist = haversineDistanceKm(assetLat, assetLng, nearest.lat, nearest.lng)
  for (const p of majorPorts) {
    const d = haversineDistanceKm(assetLat, assetLng, p.lat, p.lng)
    if (d < minDist) {
      minDist = d
      nearest = p
    }
  }
  return { port: nearest, distanceKm: minDist }
}

export function generateSeaWaypoints(lat1: number, lng1: number, lat2: number, lng2: number): Array<{ lat: number; lng: number }> {
  const toRad = (x: number) => x * Math.PI / 180
  const toDeg = (x: number) => x * 180 / Math.PI
  const φ1 = toRad(lat1), λ1 = toRad(lng1)
  const φ2 = toRad(lat2), λ2 = toRad(lng2)
  const Δλ = λ2 - λ1
  const δ = 2 * Math.asin(Math.sqrt(
    Math.pow(Math.sin((φ1 - φ2) / 2), 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.pow(Math.sin(Δλ / 2), 2)
  ))
  if (δ < 1e-6) return [{ lat: lat2, lng: lng2 }]
  const w: Array<{ lat: number; lng: number }> = []
  for (let i = 0; i <= 30; i++) {
    const f = i / 30
    const A = Math.sin((1 - f) * δ) / Math.sin(δ)
    const B = Math.sin(f * δ) / Math.sin(δ)
    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2)
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2)
    const z = A * Math.sin(φ1) + B * Math.sin(φ2)
    const φ = Math.atan2(z, Math.sqrt(x * x + y * y))
    const λ = Math.atan2(y, x)
    w.push({ lat: toDeg(φ), lng: toDeg(λ) })
  }
  return w
}
