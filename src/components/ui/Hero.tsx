import Link from 'next/link';

export default function Hero() {
  return (
    <div className="relative isolate overflow-hidden bg-neutral-50 pt-16">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#34d399] to-[#059669] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 pb-16 pt-10 sm:pb-24 lg:flex lg:px-8 lg:py-24 items-center gap-x-12">
        <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl">
          <div className="mt-10 sm:mt-12 lg:mt-0">
            <a href="#" className="inline-flex space-x-4 items-center">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold leading-6 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Phase 1</span>
              <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-neutral-600">
                <span>Foundation Ready</span>
              </span>
            </a>
          </div>
          <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
            Redefining Furniture Retail with AI & Spatial Computing
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-neutral-700">
            Spatial Furniture AI bridges the gap between digital imagination and physical spaces. Prepare for a future of immersive AR try-ons, intelligent recommendations, and digital twin analytics.
          </p>
          <div className="mt-8 flex items-center gap-x-6">
            <Link href="/customer" className="rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-colors">
              Customer Portal
            </Link>
            <Link href="/retailer" className="text-sm font-semibold leading-6 text-neutral-900 hover:text-emerald-600 transition-colors group">
              Retailer Dashboard <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
        
        <div className="mx-auto mt-16 flex max-w-2xl lg:mt-0 lg:max-w-none lg:flex-auto">
          <div className="w-full h-[24rem] sm:h-[32rem] bg-white rounded-2xl shadow-xl ring-1 ring-neutral-900/10 overflow-hidden flex items-center justify-center relative">
            <div className="absolute inset-0 bg-neutral-900 [background-size:30px_30px] [background-image:linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)]"></div>
            
            {/* Spatial Computing / AR Wireframe Representation */}
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Scanning effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent w-full h-32 animate-[spin_4s_linear_infinite] blur-xl"></div>
              
              {/* Wireframe Furniture Object (Chair/Sofa abstraction) */}
              <svg className="w-64 h-64 text-emerald-400 opacity-80" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                {/* Isometric Cube / Spatial bounds */}
                <path d="M50 20 L80 35 L80 65 L50 80 L20 65 L20 35 Z" strokeDasharray="2 2" strokeOpacity="0.4" />
                <path d="M50 20 L50 50 L80 65" strokeDasharray="2 2" strokeOpacity="0.4" />
                <path d="M20 35 L50 50 L50 80" strokeDasharray="2 2" strokeOpacity="0.4" />
                
                {/* Solid Furniture shape inside */}
                <path d="M35 45 L65 45 L70 60 L30 60 Z" fill="currentColor" fillOpacity="0.1" />
                <path d="M35 45 L65 45 L65 30 L35 30 Z" fill="currentColor" fillOpacity="0.05" />
                
                {/* AI / Scanning nodes */}
                <circle cx="50" cy="50" r="2" className="animate-pulse" fill="#34d399" />
                <circle cx="35" cy="45" r="1.5" fill="#34d399" />
                <circle cx="65" cy="45" r="1.5" fill="#34d399" />
                <circle cx="70" cy="60" r="1.5" fill="#34d399" />
                <circle cx="30" cy="60" r="1.5" fill="#34d399" />
              </svg>

              {/* Spatial UI Elements */}
              <div className="absolute top-8 left-8 bg-black/40 backdrop-blur-md rounded px-3 py-1.5 border border-white/10 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-xs text-white font-mono">Spatial Map Active</span>
              </div>
              <div className="absolute bottom-8 right-8 bg-black/40 backdrop-blur-md rounded px-3 py-1.5 border border-white/10 flex items-center space-x-2">
                <span className="text-xs text-emerald-300 font-mono">Object Detected: Sofa</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
