'use client'

import dynamic from 'next/dynamic'

const CommodityGame = dynamic(() => import('@/components/CommodityGame'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading Commodity Game...</p>
      </div>
    </div>
  ),
})

export default function CommodityGamePage() {
  return <CommodityGame />
}
