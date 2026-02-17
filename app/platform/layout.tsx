'use client'

import { useState, useEffect } from 'react'
import PlatformSidebar from '@/components/PlatformSidebar'
import { supabase } from '@/lib/supabase'

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState<string>('')

  useEffect(() => {
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
            <div className="w-12"></div>
            <div>
              <h1 className="text-2xl font-bold text-black">Commodities Earth</h1>
              <p className="text-xs text-gray-500">Professional Platform</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">{userEmail || 'Guest Access'}</p>
          </div>
        </div>
      </div>

      {/* Main Layout with Sidebar */}
      <div className="flex flex-1 min-h-0 pt-[73px]">
        <PlatformSidebar userEmail={userEmail} />

        {/* Main Content - each page fills this */}
        <div className="flex-1 min-h-0">
          {children}
        </div>
      </div>
    </div>
  )
}
