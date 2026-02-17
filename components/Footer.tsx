import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white border-opacity-10 py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <p className="font-bold text-2xl text-white mb-2">Commodities Earth</p>
            <p className="text-gray-400 text-sm">Premium Market Intelligence</p>
          </div>

          <div className="text-center md:text-right">
            <p className="text-white mb-2">
              <span className="font-semibold">Contact:</span>{' '}
              <a
                href="mailto:ram2315@columbia.edu"
                className="text-blue-400 hover:text-blue-300 transition-colors hover:underline"
              >
                ram2315@columbia.edu
              </a>
            </p>
            <p className="text-gray-400 text-sm">
              116th Broadway, New York, NY
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white border-opacity-10 flex items-center justify-between">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Commodities Earth. All rights reserved.</p>
          <Link
            href="/writer"
            className="text-gray-500 hover:text-white text-sm transition-colors"
          >
            Writer Login
          </Link>
        </div>
      </div>
    </footer>
  )
}
