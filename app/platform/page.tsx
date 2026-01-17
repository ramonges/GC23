'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PlatformSidebar from '@/components/PlatformSidebar'
import EarthMap from '@/components/EarthMap'
import { supabase } from '@/lib/supabase'

export default function Platform() {
  const [currentPage, setCurrentPage] = useState('earth-map')
  const [userEmail, setUserEmail] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/')
      return
    }

    setUserEmail(session.user.email || '')
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-dark-blue">
        <p className="text-white text-xl">Loading platform...</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-dark-blue overflow-hidden">
      <PlatformSidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        userEmail={userEmail}
      />

      {/* Logo in top left */}
      <div className="fixed top-4 left-20 z-30 pointer-events-none">
        <h1 className="text-2xl font-bold text-brand-green">Commodities Earth</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {currentPage === 'earth-map' && <EarthMap />}
        
        {currentPage === 'options' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4">Commodities Options</h2>
              <p className="text-gray-400 text-xl">Coming Soon</p>
            </div>
          </div>
        )}
        
        {currentPage === 'futures' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4">Commodities Futures</h2>
              <p className="text-gray-400 text-xl">Coming Soon</p>
            </div>
          </div>
        )}
        
        {currentPage === 'pricer' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4">Physical Trading Pricer</h2>
              <p className="text-gray-400 text-xl">Coming Soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
