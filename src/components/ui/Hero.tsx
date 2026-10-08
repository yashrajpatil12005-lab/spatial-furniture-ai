import Link from 'next/link';

export default function Hero() {
  return (
    <div className="relative isolate overflow-hidden bg-[#0F0F0F] pt-8 pb-16 sm:pb-24">
      {/* Subtle top ambient glow */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div 
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#10B981]/20 to-[#059669]/10 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-10 sm:pt-14 lg:flex lg:px-8 lg:py-20 items-center gap-x-12">
        <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl">
          <div>
            <div className="inline-flex space-x-3 items-center">
              <span className="rounded-full bg-[#10B981]/10 px-3 py-1 text-xs font-semibold leading-5 text-[#10B981] border border-[#10B981]/30">
                SpatialAI Platform
              </span>
              <span className="text-xs font-mono text-[#A1A1AA]">
                Next-Gen Furniture Intelligence
              </span>
            </div>
          </div>
          
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[#F5F5F5] sm:text-5xl lg:text-6xl leading-[1.1]">
            Redefining Furniture Retail with AI &amp; Spatial Computing
          </h1>
          
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#A1A1AA]">
            Spatial Furniture AI bridges the gap between digital imagination and physical spaces. Experience immersive AR previews, intelligent Gemini-driven recommendations, and digital twin analytics.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/customer/products"
              className="rounded-lg bg-[#10B981] hover:bg-[#059669] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#10B981]"
            >
              Explore Furniture Catalog
            </Link>
            <Link
              href="/retailer"
              className="rounded-lg bg-[#141414] hover:bg-[#181818] border border-[#27272A] hover:border-slate-700 px-5 py-3 text-sm font-semibold text-[#F5F5F5] transition-all flex items-center gap-1.5 group"
            >
              <span>Retailer Dashboard</span>
              <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1 text-[#10B981]">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Spatial Graphic / Wireframe Canvas */}
        <div className="mx-auto mt-14 flex max-w-2xl lg:mt-0 lg:max-w-none lg:flex-auto">
          <div className="w-full h-[22rem] sm:h-[30rem] bg-[#141414] rounded-2xl border border-[#27272A] shadow-2xl overflow-hidden flex items-center justify-center relative">
            {/* Dark grid canvas */}
            <div className="absolute inset-0 bg-[#0F0F0F] [background-size:28px_28px] [background-image:linear-gradient(to_right,#27272A_1px,transparent_1px),linear-gradient(to_bottom,#27272A_1px,transparent_1px)] opacity-60" />
            
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Scanning effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#10B981]/10 to-transparent w-full h-32 blur-xl" />
              
              {/* Isometric Spatial Wireframe */}
              <svg className="w-64 h-64 text-[#10B981] opacity-90" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M50 20 L80 35 L80 65 L50 80 L20 65 L20 35 Z" strokeDasharray="2 2" strokeOpacity="0.4" />
                <path d="M50 20 L50 50 L80 65" strokeDasharray="2 2" strokeOpacity="0.4" />
                <path d="M20 35 L50 50 L50 80" strokeDasharray="2 2" strokeOpacity="0.4" />
                
                {/* Furniture silhouette */}
                <path d="M35 45 L65 45 L70 60 L30 60 Z" fill="currentColor" fillOpacity="0.15" />
                <path d="M35 45 L65 45 L65 30 L35 30 Z" fill="currentColor" fillOpacity="0.1" />
                
                {/* Scanning nodes */}
                <circle cx="50" cy="50" r="2.5" className="animate-pulse" fill="#10B981" />
                <circle cx="35" cy="45" r="1.8" fill="#10B981" />
                <circle cx="65" cy="45" r="1.8" fill="#10B981" />
                <circle cx="70" cy="60" r="1.8" fill="#10B981" />
                <circle cx="30" cy="60" r="1.8" fill="#10B981" />
              </svg>

              {/* Spatial UI Badge Overlays */}
              <div className="absolute top-6 left-6 bg-[#0A0A0A]/90 backdrop-blur-md rounded-lg px-3 py-1.5 border border-[#27272A] flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-xs text-[#F5F5F5] font-mono">Spatial Environment Active</span>
              </div>
              <div className="absolute bottom-6 right-6 bg-[#0A0A0A]/90 backdrop-blur-md rounded-lg px-3 py-1.5 border border-[#27272A] flex items-center space-x-2">
                <span className="text-xs text-[#10B981] font-mono">Target: Modern 3-Seater Sofa</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
