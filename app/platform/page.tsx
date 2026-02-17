'use client'

import { useState, useEffect } from 'react'
import PlatformSidebar from '@/components/PlatformSidebar'
import EarthMap from '@/components/EarthMap'
import OptionsDashboard from '@/components/OptionsDashboard'
import PhysicalDeliveryModeling from '@/components/PhysicalDeliveryModeling'
import CommodityMarketLevels from '@/components/CommodityMarketLevels'
import { supabase } from '@/lib/supabase'

export default function Platform() {
  const [currentPage, setCurrentPage] = useState('earth-map')
  const [userEmail, setUserEmail] = useState<string>('')

  useEffect(() => {
    // Optionally check for user session, but don't require it
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUserEmail(session.user.email || '')
      }
    }
    checkUser()
  }, [])

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
              <p className="text-xs text-gray-500">Professional Platform</p>
            </div>
          </div>
          
          {/* User info */}
          <div className="text-right">
            <p className="text-sm text-gray-600">{userEmail || 'Guest Access'}</p>
          </div>
        </div>
      </div>

      {/* Main Layout with Sidebar */}
      <div className="flex flex-1 pt-[73px]">
        <PlatformSidebar 
          currentPage={currentPage} 
          onNavigate={setCurrentPage}
          userEmail={userEmail}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {currentPage === 'earth-map' && <EarthMap />}
          
          {currentPage === 'options' && <OptionsDashboard />}
          
          {currentPage === 'futures' && <CommodityMarketLevels />}
          
          {currentPage === 'pricer' && <PhysicalDeliveryModeling />}
        </div>
      </div>
    </div>
  )
}
