'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-black bg-opacity-50 backdrop-blur-md border-b border-white border-opacity-10">
      <div className="container mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex-1">
          <Link href="/" className="text-2xl font-bold text-white hover:text-gray-300 transition-colors tracking-tight">
            Commodities Earth
          </Link>
        </div>

        <div className="flex-1 flex justify-center">
          <nav>
            <Link
              href="/platform"
              className="text-lg font-medium text-white hover:text-gray-300 transition-colors"
            >
              Explore Map
            </Link>
          </nav>
        </div>

        <div className="flex-1 flex justify-end gap-4">
          <Link
            href="/platform"
            className="px-6 py-2.5 bg-white text-black rounded-lg hover:bg-opacity-90 transition-all duration-200 font-medium shadow-lg"
          >
            Access Platform
          </Link>
        </div>
      </div>
    </header>
  )
}
