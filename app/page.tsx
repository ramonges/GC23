import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-gradient-to-br from-white via-gray-50 to-white">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-96 h-96 bg-accent opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-black opacity-5 rounded-full blur-3xl"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-6xl">
          <h1 className="text-7xl md:text-8xl font-bold text-black mb-8 leading-tight">
            Commodities Platform for<br />
            <span className="bg-gradient-to-r from-black to-accent bg-clip-text text-transparent">
              Producers and Traders
            </span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-600 mb-12 font-light">
            World Energy, Metals and Agriculture Producers Analytics
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/request-demo"
              className="px-10 py-4 bg-black text-white text-lg font-semibold rounded-lg hover:bg-accent transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
            <Link
              href="/#pricing"
              className="px-10 py-4 border-2 border-black text-black text-lg font-semibold rounded-lg hover:bg-black hover:text-white transition-all duration-200"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Added Value Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-5xl font-bold text-black text-center mb-4">
            What Do You Get Through Our Platform?
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16 font-light">
            Comprehensive data and intelligence for commodities professionals
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <div className="p-8 bg-white rounded-2xl border-2 border-gray-200 hover:border-black transition-all duration-200 hover:shadow-xl">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-2xl font-bold text-black mb-4">Mine & Reserve Locations</h3>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive data on mine locations for metals, shale/reserves for energy (oil/gas), 
                including precise coordinates and reserve volumes.
              </p>
            </div>

            <div className="p-8 bg-white rounded-2xl border-2 border-gray-200 hover:border-black transition-all duration-200 hover:shadow-xl">
              <div className="text-4xl mb-4">🚢</div>
              <h3 className="text-2xl font-bold text-black mb-4">Maritime Cargo Tracking</h3>
              <p className="text-gray-600 leading-relaxed">
                Real-time tracking of cargo boats (LNG carriers, tankers, bulk carriers) with detailed 
                information on vessel sizes and routes.
              </p>
            </div>

            <div className="p-8 bg-white rounded-2xl border-2 border-gray-200 hover:border-black transition-all duration-200 hover:shadow-xl">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-2xl font-bold text-black mb-4">Producer Intelligence</h3>
              <p className="text-gray-600 leading-relaxed">
                Detailed producer database by commodity including company addresses, contact information, 
                and long-term contract relationships.
              </p>
            </div>

            <div className="p-8 bg-white rounded-2xl border-2 border-gray-200 hover:border-black transition-all duration-200 hover:shadow-xl">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-black mb-4">Storage & Reserves</h3>
              <p className="text-gray-600 leading-relaxed">
                Global storage facility data across ports and cities, including capacity, ownership 
                and current inventory levels by country.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold text-black mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 mb-12 font-light">
            Professional-grade commodities intelligence
          </p>
          
          <div className="max-w-2xl mx-auto bg-white p-12 rounded-2xl border-2 border-gray-200 shadow-xl">
            <p className="text-6xl font-bold text-black mb-4">
              €599<span className="text-2xl text-gray-600 font-normal">/month</span>
            </p>
            
            <div className="text-left space-y-3 mb-10 max-w-md mx-auto">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">✓</span>
                </div>
                <p className="text-gray-700">15-day free trial</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">✓</span>
                </div>
                <p className="text-gray-700">Full platform access</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">✓</span>
                </div>
                <p className="text-gray-700">Real-time data updates</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">✓</span>
                </div>
                <p className="text-gray-700">Dedicated support</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/request-demo"
                className="px-8 py-4 bg-black text-white text-lg font-bold rounded-lg hover:bg-accent transition-all duration-200 shadow-lg"
              >
                Request a Demo
              </Link>
              <a
                href="mailto:ram2315@columbia.edu"
                className="px-8 py-4 border-2 border-black text-black text-lg font-bold rounded-lg hover:bg-black hover:text-white transition-all duration-200"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            You are a trader at a Merchant,<br />Bank or Hedge Fund?
          </h2>
          <p className="text-3xl mb-10 text-gray-300 font-light">
            Access the best tech.
          </p>
          <Link
            href="/request-demo"
            className="inline-block px-12 py-5 bg-white text-black text-xl font-bold rounded-lg hover:bg-accent hover:text-white transition-all duration-200 shadow-lg hover:shadow-2xl"
          >
            Get Started Today
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
