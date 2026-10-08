import Link from 'next/link';

export default function Hero() {
  return (
    <div className="relative isolate overflow-hidden bg-[#F8FAFC] pt-8 pb-16 sm:pb-24">
      {/* Subtle emerald ambient top gradient */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div 
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#10B981]/15 to-[#34D399]/10 opacity-60 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
        />
      </div>

      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 pt-10 sm:pt-14 lg:flex lg:py-20 items-center gap-x-12">
        <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl">
          <div>
            <div className="inline-flex space-x-2.5 items-center">
              <span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold leading-5 text-[#047857] border border-[#A7F3D0]">
                SpatialAI Platform
              </span>
              <span className="text-xs font-medium text-[#64748B]">
                Intelligent Furniture Technology
              </span>
            </div>
          </div>
          
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[#111827] sm:text-5xl lg:text-6xl leading-[1.12]">
            Redefining Furniture Retail with <span className="text-[#10B981]">AI &amp; Spatial Computing</span>
          </h1>
          
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#475569]">
            Spatial Furniture AI bridges the gap between digital imagination and physical living spaces. Experience contextual Gemini-powered room analysis, custom dimensions, and digital twin retail cataloging.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/customer/products"
              className="rounded-xl bg-[#10B981] hover:bg-[#059669] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#10B981]"
            >
              Explore Furniture Catalog
            </Link>
            <Link
              href="/retailer"
              className="rounded-xl bg-white hover:bg-slate-50 border border-[#E2E8F0] px-6 py-3.5 text-sm font-semibold text-[#111827] transition-all flex items-center gap-2 group shadow-sm"
            >
              <span>Retailer Dashboard</span>
              <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1 text-[#10B981]">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Spatial Preview Viewport Card */}
        <div className="mx-auto mt-14 flex max-w-2xl lg:mt-0 lg:max-w-none lg:flex-auto">
          <div className="w-full h-[22rem] sm:h-[30rem] bg-white rounded-2xl border border-[#E2E8F0] shadow-xl overflow-hidden flex items-center justify-center relative p-3">
            <div className="w-full h-full rounded-xl bg-slate-900 overflow-hidden relative flex items-center justify-center">
              {/* Spatial grid canvas inside viewport */}
              <div className="absolute inset-0 [background-size:24px_24px] [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)]" />
              
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Scanning sweep */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#10B981]/15 to-transparent w-full h-32 blur-xl" />
                
                {/* Isometric Furniture Wireframe */}
                <svg className="w-64 h-64 text-[#10B981]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M50 20 L80 35 L80 65 L50 80 L20 65 L20 35 Z" strokeDasharray="2 2" strokeOpacity="0.4" />
                  <path d="M50 20 L50 50 L80 65" strokeDasharray="2 2" strokeOpacity="0.4" />
                  <path d="M20 35 L50 50 L50 80" strokeDasharray="2 2" strokeOpacity="0.4" />
                  
                  {/* Furniture shape */}
                  <path d="M35 45 L65 45 L70 60 L30 60 Z" fill="currentColor" fillOpacity="0.15" />
                  <path d="M35 45 L65 45 L65 30 L35 30 Z" fill="currentColor" fillOpacity="0.1" />
                  
                  {/* Scanning tracking nodes */}
                  <circle cx="50" cy="50" r="2.5" className="animate-pulse" fill="#10B981" />
                  <circle cx="35" cy="45" r="1.8" fill="#10B981" />
                  <circle cx="65" cy="45" r="1.8" fill="#10B981" />
                  <circle cx="70" cy="60" r="1.8" fill="#10B981" />
                  <circle cx="30" cy="60" r="1.8" fill="#10B981" />
                </svg>

                {/* Spatial HUD elements */}
                <div className="absolute top-5 left-5 bg-black/60 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/10 flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="text-xs text-white font-mono">Spatial Mapping Active</span>
                </div>
                <div className="absolute bottom-5 right-5 bg-black/60 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/10 flex items-center space-x-2">
                  <span className="text-xs text-[#34D399] font-mono">Target: Modern 3-Seater Sofa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
