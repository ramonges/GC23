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
      setProfileData({ ...profileData, newPassword: '' })
    } catch (err: any) {
      alert(err.message || 'Failed to change password')
    }
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-3 bg-white border-2 border-gray-200 rounded-lg text-black hover:border-black transition-all shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40 shadow-2xl ${
          isOpen ? 'w-80' : 'w-0'
        } overflow-hidden`}
      >
        <div className="pt-20 px-6">
          {/* Logo */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-black">Commodities Earth</h2>
            <p className="text-sm text-gray-500 mt-1">Professional Platform</p>
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    currentPage === item.id
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Profile Section - Only show if user is logged in */}
          {userEmail && (
            <div className="border-t border-gray-200 pt-6 space-y-2">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
              >
                <User size={20} />
                <span className="font-medium">My Profile</span>
              </button>

              {isProfileOpen && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-3 ml-4 animate-fade-in">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1 font-medium">First Name</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1 font-medium">Last Name</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1 font-medium">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full px-3 py-2 text-sm rounded-lg bg-gray-200 text-gray-600 border border-gray-300 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1 font-medium">New Password</label>
                    <input
                      type="password"
                      value={profileData.newPassword}
                      onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Enter new password"
                    />
                  </div>
                  <button
                    onClick={handlePasswordChange}
                    className="w-full px-3 py-2 text-sm bg-black text-white rounded-lg hover:bg-accent transition-all"
                  >
                    Change Password
                  </button>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut size={20} />
                <span className="font-medium">Log Out</span>
              </button>
            </div>
          )}

          {/* Contact section - Always visible */}
          <div className="border-t border-gray-200 pt-6">
            <a
              href="mailto:ram2315@columbia.edu"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
            >
              <Mail size={20} />
              <span className="font-medium">Contact Us</span>
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
