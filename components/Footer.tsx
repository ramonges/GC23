export default function Footer() {
  return (
    <footer className="bg-black text-white py-12 border-t border-gray-800">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div>
          <p className="font-bold text-2xl">Commodities Earth</p>
          <p className="text-gray-400 mt-1">Global Commodities Intelligence</p>
        </div>

        <div className="text-right">
          <p className="text-white mb-2">
            <span className="font-semibold">Contact:</span>{' '}
            <a
              href="mailto:ram2315@columbia.edu"
              className="text-accent hover:underline transition-colors"
            >
              ram2315@columbia.edu
            </a>
          </p>
          <p className="text-gray-400">
            116th Broadway, New York, NY
          </p>
        </div>
      </div>
    </footer>
  )
}
