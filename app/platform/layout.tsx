'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
    <div className="h-screen flex flex-col bg-vulcan-ink overflow-hidden font-grotesk">
      <header className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-white/10 bg-vulcan-ink/90 backdrop-blur-md">
        <div className="flex h-full items-center justify-between pl-[4.25rem] pr-4 sm:pl-20 sm:pr-6">
          <Link href="/" aria-label="Vulcan Trade — home" className="flex min-w-0 items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/vulcan-trade-logo.png"
              alt="Vulcan Trade"
              width={837}
              height={120}
              className="h-5 w-auto sm:h-6"
            />
            <span className="hidden h-4 w-px bg-white/15 md:block" />
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-vulcan-muted md:block">
              Intelligence platform
            </span>
          </Link>
          <p
            className="max-w-[140px] truncate font-mono text-[10px] uppercase tracking-[0.18em] text-vulcan-aluminum/70 sm:max-w-none"
            title={userEmail || 'Guest access'}
          >
            {userEmail || 'Guest access'}
          </p>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 pt-16">
        <PlatformSidebar userEmail={userEmail} />
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}
