import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Hero Section with Earth Sunrise */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-60 z-10"></div>
        
        {/* Earth with Sunrise Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Earth sphere positioned on right side */}
          <div className="absolute right-[-20%] top-1/2 -translate-y-1/2 w-[1000px] h-[1000px]">
            {/* Real Earth image - spherical effect */}
            <div 
              className="absolute inset-0 rounded-full overflow-hidden"
              style={{
                backgroundImage: 'url(https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'brightness(0.95) contrast(1.05)',
                boxShadow: 'inset -100px -100px 200px rgba(0, 0, 0, 0.5), inset 100px 100px 200px rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Overlay for better blending with sunrise */}
              <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-transparent to-black/20 rounded-full"></div>
            </div>
            
            {/* Additional Earth glow for realism */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/10 via-transparent to-transparent"></div>
            
            {/* Sphere shadow for depth */}
            <div className="absolute inset-0 rounded-full bg-gradient-radial from-transparent via-transparent to-black/20"></div>
            
            {/* Earth atmosphere glow */}
            <div className="absolute inset-[-10px] rounded-full bg-gradient-to-br from-blue-300 via-transparent to-transparent opacity-20 blur-2xl"></div>
            
            {/* Sunrise glow - positioned on the left edge of earth */}
            <div className="absolute left-[-15%] top-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-yellow-200 via-orange-400 to-transparent opacity-70 blur-3xl"></div>
            <div className="absolute left-[-10%] top-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-radial from-orange-300 via-red-400 to-transparent opacity-60 blur-2xl"></div>
            <div className="absolute left-[-5%] top-1/2 -translate-y-1/2 w-48 h-48 bg-yellow-100 opacity-80 blur-xl rounded-full"></div>
            
            {/* Light rays from sunrise */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[600px] h-1 bg-gradient-to-r from-yellow-200 via-orange-300 to-transparent opacity-40 rotate-[-15deg]"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[600px] h-1 bg-gradient-to-r from-yellow-200 via-orange-300 to-transparent opacity-30 rotate-[15deg]"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-1 bg-gradient-to-r from-orange-200 via-red-300 to-transparent opacity-35 rotate-[-25deg]"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-1 bg-gradient-to-r from-orange-200 via-red-300 to-transparent opacity-25 rotate-[25deg]"></div>
          </div>
          
          {/* Stars in background */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-1 h-1 bg-white rounded-full opacity-80"></div>
            <div className="absolute top-40 left-32 w-1 h-1 bg-white rounded-full opacity-60"></div>
            <div className="absolute top-60 left-20 w-0.5 h-0.5 bg-white rounded-full opacity-70"></div>
            <div className="absolute top-80 left-48 w-1 h-1 bg-white rounded-full opacity-50"></div>
            <div className="absolute top-32 left-64 w-0.5 h-0.5 bg-white rounded-full opacity-80"></div>
            <div className="absolute top-96 left-40 w-1 h-1 bg-white rounded-full opacity-40"></div>
            <div className="absolute bottom-40 left-24 w-1 h-1 bg-white rounded-full opacity-70"></div>
            <div className="absolute bottom-60 left-56 w-0.5 h-0.5 bg-white rounded-full opacity-60"></div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center px-6 max-w-6xl">
          <div className="mb-8">
            <span className="inline-block px-6 py-2 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-full text-white text-sm font-medium tracking-wider uppercase">
              Open Access Platform
            </span>
          </div>
          
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold text-white mb-8 leading-tight tracking-tight">
            Global Oil & Gas Fields<br />
            <span className="bg-gradient-to-r from-blue-200 via-blue-100 to-white bg-clip-text text-transparent">
              Interactive Map
            </span>
          </h1>
          
          <p className="text-2xl md:text-3xl text-gray-300 mb-12 font-light tracking-wide">
            Explore oil and gas fields worldwide with comprehensive production data
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/platform"
              className="group px-12 py-5 bg-white text-black text-lg font-semibold rounded-lg hover:bg-opacity-90 transition-all duration-300 shadow-2xl hover:shadow-white/20 hover:scale-105"
            >
              <span className="flex items-center justify-center gap-2">
                Explore Oil & Gas Fields
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex items-center justify-center gap-12 text-white text-opacity-60 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span>Trusted by Leading Traders</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Bank-Grade Security</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span>Real-Time Data</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <svg className="w-6 h-6 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Added Value Section */}
      <section className="py-32 bg-gradient-to-b from-black via-gray-900 to-black relative">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Comprehensive Oil & Gas Data
            </h2>
            <p className="text-xl text-gray-400 font-light max-w-3xl mx-auto">
              Open access to global oil and gas field information, production data, and infrastructure details
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <div className="group p-10 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:transform hover:scale-105 backdrop-blur-sm">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">🛢️</div>
              <h3 className="text-2xl font-bold text-white mb-4">Oil Fields</h3>
              <p className="text-gray-400 leading-relaxed">
                Comprehensive database of oil fields worldwide with production data, reserves, and operator information.
              </p>
            </div>

            <div className="group p-10 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:transform hover:scale-105 backdrop-blur-sm">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">⛽</div>
              <h3 className="text-2xl font-bold text-white mb-4">Gas Fields</h3>
              <p className="text-gray-400 leading-relaxed">
                Detailed information on natural gas fields including production capacity, reserves, and infrastructure.
              </p>
            </div>

            <div className="group p-10 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:transform hover:scale-105 backdrop-blur-sm">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">📍</div>
              <h3 className="text-2xl font-bold text-white mb-4">Precise Locations</h3>
              <p className="text-gray-400 leading-relaxed">
                Interactive 3D globe with precise coordinates for all oil and gas fields around the world.
              </p>
            </div>

            <div className="group p-10 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:transform hover:scale-105 backdrop-blur-sm">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">📊</div>
              <h3 className="text-2xl font-bold text-white mb-4">Production Data</h3>
              <p className="text-gray-400 leading-relaxed">
                Monthly and yearly production volumes, reserves estimates, and operational status for each field.
              </p>
            </div>
          </div>
        </div>
      </section>


      <Footer />
    </div>
  )
}
