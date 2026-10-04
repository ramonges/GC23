'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Globe,
  TrendingUp,
  LineChart,
  DollarSign,
  BarChart3,
  User,
  Mail,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface PlatformSidebarProps {
  userEmail?: string
}

const menuItems = [
  { href: '/platform/map', label: 'Earth Map', icon: Globe },
  { href: '/platform/options', label: 'Commodities Options', icon: TrendingUp },
  { href: '/platform/market', label: 'Commodity Market Levels', icon: LineChart },
  { href: '/platform/futures', label: 'Commodity Comparison', icon: BarChart3 },
  { href: '/platform/shipping', label: 'Physical Delivery Modeling', icon: DollarSign },
]

export default function PlatformSidebar({ userEmail }: PlatformSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: userEmail || '',
    newPassword: '',
  })
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handlePasswordChange = async () => {
    if (!profileData.newPassword) return

    try {
      const { error } = await supabase.auth.updateUser({
        password: profileData.newPassword,
      })

      if (error) throw error
      alert('Password changed successfully')
      setProfileData({ ...profileData, newPassword: '' })
    } catch (err: any) {
      alert(err.message || 'Failed to change password')
    }
  }

  const input =
    'w-full border border-white/10 bg-vulcan-ink px-3 py-2 text-sm text-vulcan-paper placeholder-vulcan-muted focus:border-white/30 focus:outline-none'
  const label = 'mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-vulcan-muted'
  const row =
    'flex w-full items-center gap-3 px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors'

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        className="fixed left-3 top-3 z-50 flex h-10 w-10 items-center justify-center border border-white/10 bg-vulcan-charcoal text-vulcan-paper transition-colors hover:border-white/30 sm:left-4"
      >
        {isOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
      </button>

      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[2px]" onClick={() => setIsOpen(false)} aria-hidden />}

      <aside
        className={`fixed left-0 top-0 z-40 h-full w-80 max-w-[85vw] border-r border-white/10 bg-vulcan-charcoal text-vulcan-paper transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto px-5 pb-6 pt-20">
          <Link href="/" onClick={() => setIsOpen(false)} className="mb-10 block px-3" aria-label="Vulcan Trade — home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/vulcan-trade-logo.png" alt="Vulcan Trade" width={837} height={120} className="h-6 w-auto" />
          </Link>

          <p className="mb-3 px-3 font-mono text-[10px] uppercase tracking-[0.22em] text-vulcan-muted">Platform</p>
          <nav className="mb-8 space-y-px">
            {menuItems.map((item, i) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`${row} relative ${isActive ? 'bg-white/[0.06] text-vulcan-paper' : 'text-vulcan-aluminum/70 hover:bg-white/[0.03] hover:text-vulcan-paper'}`}
                >
                  {isActive && <span className="absolute inset-y-0 left-0 w-px bg-vulcan-signal" />}
                  <span className="w-5 text-vulcan-muted">{String(i + 1).padStart(2, '0')}</span>
                  <Icon size={15} strokeWidth={1.5} />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto space-y-px border-t border-white/10 pt-5">
            {userEmail && (
              <>
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className={`${row} text-vulcan-aluminum/70 hover:bg-white/[0.03] hover:text-vulcan-paper`}>
                  <User size={15} strokeWidth={1.5} />
                  <span>My profile</span>
                </button>

                {isProfileOpen && (
                  <div className="space-y-3 border border-white/10 bg-vulcan-ink/60 p-4">
                    <div>
                      <label className={label}>First name</label>
                      <input type="text" value={profileData.firstName} onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })} className={input} />
                    </div>
                    <div>
                      <label className={label}>Last name</label>
                      <input type="text" value={profileData.lastName} onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })} className={input} />
                    </div>
                    <div>
                      <label className={label}>Email</label>
                      <input type="email" value={profileData.email} disabled className={`${input} cursor-not-allowed text-vulcan-muted`} />
                    </div>
                    <div>
                      <label className={label}>New password</label>
                      <input
                        type="password"
                        value={profileData.newPassword}
                        onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                        className={input}
                        placeholder="Enter new password"
                      />
                    </div>
                    <button
                      onClick={handlePasswordChange}
                      className="w-full bg-vulcan-paper px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-vulcan-ink transition-colors hover:bg-white"
                    >
                      Change password
                    </button>
                  </div>
                )}

                <button onClick={handleLogout} className={`${row} text-vulcan-aluminum/70 hover:bg-white/[0.03] hover:text-vulcan-signal`}>
                  <LogOut size={15} strokeWidth={1.5} />
                  <span>Log out</span>
                </button>
              </>
            )}
            <a href="mailto:ram2315@columbia.edu" className={`${row} text-vulcan-aluminum/70 hover:bg-white/[0.03] hover:text-vulcan-paper`}>
              <Mail size={15} strokeWidth={1.5} />
              <span>Contact us</span>
              <span className="ml-auto text-vulcan-signal">↗</span>
            </a>
          </div>
        </div>
      </aside>
    </>
  )
}
