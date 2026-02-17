'use client'

import { useState } from 'react'
import PlatformSidebarDev from '@/components/PlatformSidebarDev'
import EarthMap from '@/components/EarthMap'
import OptionsDashboard from '@/components/OptionsDashboard'
import PhysicalDeliveryModeling from '@/components/PhysicalDeliveryModeling'
import CommodityMarketLevels from '@/components/CommodityMarketLevels'

export default function PlatformDev() {
  const [currentPage, setCurrentPage] = useState('earth-map')
  const userEmail = 'dev@localhost' // Mock email for dev mode

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Top Header Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Menu button space */}
            <div className="w-12"></div>
            {/* Logo */}
            <div>
              <h1 className="text-2xl font-bold text-black">Commodities Earth</h1>
              <p className="text-xs text-gray-500">Professional Platform <span className="text-orange-500">(DEV MODE)</span></p>
            </div>
          </div>
          
          {/* User info */}
          <div className="text-right">
            <p className="text-sm text-gray-600">{userEmail}</p>
            <p className="text-xs text-orange-500">No authentication required</p>
          </div>
        </div>
      </div>

      {/* Main Layout with Sidebar */}
      <div className="flex flex-1 min-h-0 pt-[73px]">
        <PlatformSidebarDev 
          currentPage={currentPage} 
          onNavigate={setCurrentPage}
          userEmail={userEmail}
        />

        {/* Main Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {currentPage === 'earth-map' && (
            <div className="h-full overflow-hidden">
              <EarthMap />
            </div>
          )}
          
          {currentPage === 'options' && (
            <div className="h-full overflow-y-auto">
              <OptionsDashboard />
            </div>
          )}
          
          {currentPage === 'futures' && (
            <div className="h-full overflow-y-auto">
              <CommodityMarketLevels />
            </div>
          )}
          
          {currentPage === 'pricer' && <PhysicalDeliveryModeling />}
        </div>
      </div>
    </div>
  )
}
