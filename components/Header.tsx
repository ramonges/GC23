'use client'

import Link from 'next/link'
import { useState } from 'react'
import LoginModal from './LoginModal'

export default function Header() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 backdrop-blur-sm bg-opacity-95">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex-1">
            <Link href="/" className="text-2xl font-bold text-black hover:text-accent transition-colors">
              Commodities Earth
            </Link>
          </div>

          <div className="flex-1 flex justify-center">
            <nav>
              <Link
                href="/#pricing"
                className="text-lg font-medium text-black hover:text-accent transition-colors"
              >
                Pricing
              </Link>
            </nav>
          </div>

          <div className="flex-1 flex justify-end gap-4">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="px-6 py-2.5 text-black border-2 border-black rounded-lg hover:bg-black hover:text-white transition-all duration-200 font-medium"
            >
              Log In
            </button>
            <Link
              href="/request-demo"
              className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-accent transition-all duration-200 font-medium"
            >
              Request a Demo
            </Link>
          </div>
        </div>
      </header>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  )
}
