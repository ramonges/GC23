'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-black bg-opacity-50 backdrop-blur-md border-b border-white border-opacity-10">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-5 flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <Link href="/" className="text-lg sm:text-2xl font-bold text-white hover:text-gray-300 transition-colors tracking-tight truncate block">
            Commodities Earth
          </Link>
        </div>

        <div className="flex-shrink-0 flex items-center gap-2 sm:gap-4">
          <nav className="hidden sm:block">
            <Link
              href="/platform"
              className="text-lg font-medium text-white hover:text-gray-300 transition-colors"
            >
              Explore Map
            </Link>
          </nav>
          <Link
            href="/platform"
            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white text-black rounded-lg hover:bg-opacity-90 transition-all duration-200 font-medium shadow-lg text-sm sm:text-base whitespace-nowrap"
          >
            Access Platform
          </Link>
        </div>
      </div>
    </header>
  )
}
