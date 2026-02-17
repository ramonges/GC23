export interface CommodityData {
  id: string
  title: string
  owner: string
  address: string
  contact?: string
  long_term_contract?: boolean
  contract_with?: string
  supply_volume?: number
  storage_volume?: number
  latitude: number
  longitude: number
  commodity_type: string
  commodity_name: string
  company?: string
  country?: string
  region?: string
  location_type?: string
  operational_status?: string
  operator?: string
  ownership_type?: string
  ownership_details?: string
  production_monthly?: number
  production_yearly?: number
  production_unit?: string
  estimated_reserves?: number
  reserves_unit?: string
  start_date?: string
  closing_date?: string
  quality_type?: string
  api_gravity?: number
  quality_sulfur_content?: number
  grade?: string
  last_transaction_value?: number
  last_transaction_currency?: string
  last_transaction_date?: string
  contract_duration_years?: number
  pipelines?: string[]
  ports?: string[]
  rail_connections?: string[]
  additional_info?: any
}

export interface RefineryData {
  id: string
  name: string
  operator?: string
  country: string
  city?: string
  address?: string
  latitude: number
  longitude: number
  capacity_bpd: number
  crude_types_accepted: string[]
  operational_status?: string
}

export interface ShippingRoute {
  id: string
  name: string
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  color: string
  waypoints?: Array<{ lat: number; lng: number }>
  /** Custom data passed to onRouteClick (e.g. voyage result) */
  data?: any
}
