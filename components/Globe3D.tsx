'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import { CommodityData, RefineryData, ShippingRoute, VesselData } from '@/lib/types'

interface Globe3DProps {
  markers: CommodityData[]
  showCities?: boolean
  routes?: ShippingRoute[]
  refineries?: RefineryData[]
  vessels?: VesselData[]
  satelliteMode?: boolean
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

export default function Globe3D({ markers, showCities, routes, refineries = [], vessels = [], satelliteMode = false }: Globe3DProps) {
  return <Globe3DClient markers={markers} showCities={showCities} routes={routes} refineries={refineries} vessels={vessels} satelliteMode={satelliteMode} />
}
