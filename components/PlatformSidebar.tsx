'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Globe,
  TrendingUp,
  LineChart,
  DollarSign,
  User,
  Mail,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface PlatformSidebarProps {
  currentPage: string
  onNavigate: (page: string) => void
  userEmail?: string
}

export default function PlatformSidebar({ currentPage, onNavigate, userEmail }: PlatformSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: userEmail || '',
    currentPassword: '',
    newPassword: '',
  })
  const router = useRouter()

  const menuItems = [
    { id: 'earth-map', label: 'Earth Map', icon: Globe },
    { id: 'options', label: 'Commodities Options', icon: TrendingUp },
    { id: 'futures', label: 'Commodities Futures', icon: LineChart },
    { id: 'pricer', label: 'Physical Trading Pricer', icon: DollarSign },
  ]

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
      setProfileData({ ...profileData, currentPassword: '', newPassword: '' })
    } catch (err: any) {
      alert(err.message || 'Failed to change password')
    }
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-3 bg-brand-blue border-2 border-brand-green rounded-lg text-white hover:bg-brand-green transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-brand-blue border-r-2 border-brand-green transition-all duration-300 z-40 ${
          isOpen ? 'w-80' : 'w-0'
        } overflow-hidden`}
      >
        <div className="pt-20 px-6">
          {/* Logo */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-brand-green">Commodities Earth</h2>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-2 mb-8">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-brand-green text-white'
                      : 'text-gray-300 hover:bg-dark-blue hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Profile Section */}
          <div className="border-t border-brand-green pt-6 space-y-2">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-dark-blue hover:text-white transition-colors"
            >
              <User size={20} />
              <span className="font-medium">My Profile</span>
            </button>

            {isProfileOpen && (
              <div className="bg-dark-blue p-4 rounded-lg space-y-3 ml-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">First Name</label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded bg-brand-blue text-white border border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded bg-brand-blue text-white border border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-3 py-2 text-sm rounded bg-brand-blue text-white border border-brand-green opacity-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">New Password</label>
                  <input
                    type="password"
                    value={profileData.newPassword}
                    onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded bg-brand-blue text-white border border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
                    placeholder="Enter new password"
                  />
                </div>
                <button
                  onClick={handlePasswordChange}
                  className="w-full px-3 py-2 text-sm bg-brand-green text-white rounded hover:bg-light-green transition-colors"
                >
                  Change Password
                </button>
              </div>
            )}

            <a
              href="mailto:ram2315@columbia.edu"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-dark-blue hover:text-white transition-colors"
            >
              <Mail size={20} />
              <span className="font-medium">Contact Us</span>
            </a>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-dark-blue hover:text-red-300 transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
