import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-dark-blue">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Earth Background */}
        <div className="absolute inset-0 flex items-center justify-end pr-20">
          <div className="relative w-[800px] h-[800px]">
            {/* Earth with Sunrise Effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-900 via-blue-600 to-transparent opacity-80"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-900 via-green-700 to-blue-900 opacity-60"></div>
            
            {/* Sun glow effect */}
            <div className="absolute top-1/4 right-0 w-64 h-64 bg-yellow-400 rounded-full blur-3xl opacity-40"></div>
            <div className="absolute top-1/3 right-10 w-48 h-48 bg-orange-400 rounded-full blur-2xl opacity-30"></div>
            
            {/* Earth sphere */}
            <div className="absolute inset-8 rounded-full border-4 border-brand-green opacity-30"></div>
            <div className="absolute inset-16 rounded-full border-2 border-light-green opacity-20"></div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Commodities Platform for<br />
            <span className="text-brand-green">Producers and Traders</span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-12">
            World Energy, Metals and Agriculture Producers Analytics
          </p>
        </div>
      </section>

      {/* Added Value Section */}
      <section className="py-20 bg-brand-blue">
        <div className="container mx-auto px-6">
          <h2 className="text-5xl font-bold text-white text-center mb-16">
            What Do You Get Through Our Platform?
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="bg-dark-blue p-8 rounded-lg border-2 border-brand-green">
              <h3 className="text-2xl font-bold text-brand-green mb-4">📍 Mine & Reserve Locations</h3>
              <p className="text-gray-300 text-lg">
                Comprehensive data on mine locations for metals, shale/reserves for energy (oil/gas), 
                including precise coordinates and reserve volumes by country and region.
              </p>
            </div>

            <div className="bg-dark-blue p-8 rounded-lg border-2 border-brand-green">
              <h3 className="text-2xl font-bold text-brand-green mb-4">🚢 Maritime Cargo Tracking</h3>
              <p className="text-gray-300 text-lg">
                Real-time tracking of cargo boats (LNG carriers, tankers, bulk carriers) with detailed 
                information on vessel sizes, routes, and cargo specifications.
              </p>
            </div>

            <div className="bg-dark-blue p-8 rounded-lg border-2 border-brand-green">
              <h3 className="text-2xl font-bold text-brand-green mb-4">🏢 Producer Intelligence</h3>
              <p className="text-gray-300 text-lg">
                Detailed producer database by commodity including company addresses, contact information, 
                production volumes, and long-term contract relationships.
              </p>
            </div>

            <div className="bg-dark-blue p-8 rounded-lg border-2 border-brand-green">
              <h3 className="text-2xl font-bold text-brand-green mb-4">📊 Storage & Reserves</h3>
              <p className="text-gray-300 text-lg">
                Global storage facility data across ports and cities, including capacity, ownership 
                (merchant or independent), and current inventory levels by country.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-dark-blue">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold text-white mb-8">Pricing</h2>
          
          <div className="max-w-2xl mx-auto bg-brand-blue p-12 rounded-lg border-2 border-brand-green shadow-2xl">
            <p className="text-3xl font-bold text-brand-green mb-8">
              Access beginning at €599/month
            </p>
            
            <p className="text-xl text-gray-300 mb-8">
              • 15-day free trial<br />
              • Full platform access<br />
              • Real-time data updates<br />
              • Dedicated support
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/request-demo"
                className="px-8 py-4 bg-brand-green text-white text-lg font-bold rounded-lg hover:bg-light-green transition-colors"
              >
                Request a Demo
              </Link>
              <a
                href="mailto:ram2315@columbia.edu"
                className="px-8 py-4 border-2 border-brand-green text-white text-lg font-bold rounded-lg hover:bg-brand-green transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-brand-blue to-dark-blue">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            You are a trader at a Merchant, Bank or Hedge Fund?
          </h2>
          <p className="text-3xl text-brand-green font-bold mb-10">
            Access the best tech.
          </p>
          <Link
            href="/request-demo"
            className="inline-block px-12 py-5 bg-brand-green text-white text-xl font-bold rounded-lg hover:bg-light-green transition-colors shadow-lg hover:shadow-xl"
          >
            Get Started Today
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
