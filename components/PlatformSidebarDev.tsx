'use client'

import { useState } from 'react'
import {
  Globe,
  TrendingUp,
  LineChart,
  DollarSign,
  User,
  Mail,
  Menu,
  X,
} from 'lucide-react'

interface PlatformSidebarDevProps {
  currentPage: string
  onNavigate: (page: string) => void
  userEmail?: string
}

export default function PlatformSidebarDev({ currentPage, onNavigate, userEmail }: PlatformSidebarDevProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const menuItems = [
    { id: 'earth-map', label: 'Earth Map', icon: Globe },
    { id: 'options', label: 'Commodities Options', icon: TrendingUp },
    { id: 'futures', label: 'Commodity Market Levels', icon: LineChart },
    { id: 'pricer', label: 'Physical Delivery Modeling', icon: DollarSign },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-black">Menu</h2>
            <p className="text-xs text-gray-500 mt-1">Development Mode</p>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id)
                    setIsOpen(false) // Close mobile menu on navigation
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${isActive
                      ? 'bg-black text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User size={18} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-black">Dev User</p>
                <p className="text-xs text-gray-500">{userEmail}</p>
              </div>
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={16} />
                    <span>{userEmail}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                      Development mode - No authentication required
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
