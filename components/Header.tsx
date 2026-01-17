'use client'

import Link from 'next/link'
import { useState } from 'react'
import LoginModal from './LoginModal'

export default function Header() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-dark-blue bg-opacity-95 backdrop-blur-sm border-b border-brand-green">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex-1">
            <Link href="/" className="text-2xl font-bold text-brand-green hover:text-light-green transition-colors">
              Commodities Earth
            </Link>
          </div>

          <div className="flex-1 flex justify-center">
            <nav>
              <Link
                href="/#pricing"
                className="text-xl font-semibold text-white hover:text-brand-green transition-colors"
              >
                Pricing
              </Link>
            </nav>
          </div>

          <div className="flex-1 flex justify-end gap-4">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="px-6 py-2 text-white border-2 border-brand-green rounded-lg hover:bg-brand-green transition-colors font-semibold"
            >
              Log In
            </button>
            <Link
              href="/request-demo"
              className="px-6 py-2 bg-brand-green text-white rounded-lg hover:bg-light-green transition-colors font-semibold"
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
