'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'

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
}

interface ShippingRoute {
  id: string
  name: string
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  color: string
  waypoints?: Array<{ lat: number; lng: number }>
}

interface Globe3DProps {
  markers: CommodityData[]
  showCities?: boolean
  routes?: ShippingRoute[]
}

const Globe3DClient = dynamic(() => import('./Globe3DClient'), {
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

export default function Globe3D({ markers, showCities, routes }: Globe3DProps) {
  return <Globe3DClient markers={markers} showCities={showCities} routes={routes} />
}
