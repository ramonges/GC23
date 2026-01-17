export default function Footer() {
  return (
    <footer className="bg-dark-blue border-t border-brand-green py-8">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div>
          <p className="text-brand-green font-bold text-xl">Commodities Earth</p>
        </div>

        <div className="text-right">
          <p className="text-white mb-2">
            <span className="font-semibold">Contact us:</span>{' '}
            <a
              href="mailto:ram2315@columbia.edu"
              className="text-brand-green hover:text-light-green transition-colors"
            >
              ram2315@columbia.edu
            </a>
          </p>
          <p className="text-white">
            <span className="font-semibold">Address:</span> 116th Broadway, New York
          </p>
        </div>
      </div>
    </footer>
  )
}
