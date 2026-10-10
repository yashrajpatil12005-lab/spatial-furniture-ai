import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] pt-6 pb-12 sm:pt-8 sm:pb-16 lg:pt-10 lg:pb-16">
      {/* Subtle ambient gradient */}
      <div 
        className="pointer-events-none absolute inset-x-0 -top-24 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl"
        aria-hidden="true"
      >
        <div 
          className="aspect-[1100/450] w-[68rem] flex-none bg-gradient-to-tr from-[#10B981]/15 via-[#34D399]/10 to-transparent opacity-70"
          style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
        />
      </div>

      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headlines & Actions */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            
            {/* Platform Badge */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold text-[#047857] border border-[#A7F3D0]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                SpatialAI Platform
              </span>
              <span className="text-xs font-medium text-[#64748B]">
                Intelligent Furniture Technology
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#111827] leading-[1.14]">
              Redefining Furniture Retail with{' '}
              <span className="text-[#10B981]">AI &amp; Spatial Computing</span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg leading-relaxed text-[#475569] max-w-2xl">
              Experience intelligent furniture commerce. Upload your room to evaluate natural lighting and layout scale with Gemini AI, explore personalized recommendations, and customize dimensions for physical spaces.
            </p>

            {/* Feature Highlights Pills */}
            <div className="flex flex-wrap gap-2 pt-1 text-xs font-medium text-[#334155]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] shadow-sm">
                <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Multimodal Room Reasoning
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] shadow-sm">
                <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Parametric Customizer
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] shadow-sm">
                <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                1:1 Digital Twins
              </span>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              {/* Primary CTA */}
              <Link
                href="/customer/products"
                className="inline-flex items-center justify-center rounded-xl bg-[#10B981] hover:bg-[#059669] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#10B981]"
              >
                Explore Furniture
              </Link>

              {/* Secondary CTA */}
              <Link
                href="/retailer"
                className="inline-flex items-center justify-center rounded-xl bg-white hover:bg-slate-50 border border-[#E2E8F0] px-5 py-3 text-sm font-semibold text-[#111827] shadow-sm transition-colors group"
              >
                <span>Retailer Dashboard</span>
                <span aria-hidden="true" className="ml-1.5 text-[#10B981] transition-transform group-hover:translate-x-0.5">&rarr;</span>
              </Link>

              {/* Third Contextual Action */}
              <Link
                href="/customer/products"
                className="inline-flex items-center gap-2 rounded-xl bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] px-4 py-3 text-sm font-semibold text-[#047857] transition-colors"
                title="Select a furniture piece from the catalog to launch room analysis"
              >
                <svg className="w-4 h-4 text-[#047857]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Analyze My Room</span>
              </Link>
            </div>

            <p className="text-xs text-[#64748B]">
              * Room analysis is supported via individual catalog products in the customer portal.
            </p>
          </div>

          {/* Right Column: Hero Visual with SpatialAI Overlay */}
          <div className="lg:col-span-5 relative">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-2xl overflow-hidden border border-[#E2E8F0] bg-white card-shadow">
              
              {/* Premium Furniture Visual */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200"
                alt="Modern living room with designer sofa and spatial layout"
                className="w-full h-full object-cover"
              />

              {/* Gradient Scrim for Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-900/10 to-transparent pointer-events-none" />

              {/* Floating SpatialAI Overlay: Top-Left Analysis Status */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-xl p-2.5 sm:p-3 border border-[#E2E8F0] shadow-lg max-w-[240px]">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
                  </span>
                  <span className="text-[11px] font-bold text-[#111827] uppercase tracking-wider">
                    Spatial Analysis
                  </span>
                </div>
                <div className="mt-1 text-xs text-[#475569]">
                  Living Area &bull; 4.2m &times; 3.8m
                </div>
                <div className="text-[10px] text-[#047857] font-semibold mt-0.5">
                  Natural Daylight Detected (East)
                </div>
              </div>

              {/* Floating Spatial Pin / Dimension Tag */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/85 backdrop-blur-md text-white rounded-xl px-3 py-2 border border-white/20 shadow-xl pointer-events-none text-center">
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-[#34D399]">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse"></span>
                  <span>1:1 Scale Match</span>
                </div>
                <div className="text-xs font-semibold mt-0.5">
                  210 &times; 85 &times; 90 cm
                </div>
              </div>

              {/* Floating SpatialAI Overlay: Bottom Tag */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-[#E2E8F0] shadow-lg flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#111827]">
                    Modern 3-Seater Sofa
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    Charcoal Grey &bull; Solid Oak Legs
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-bold text-[#047857] border border-[#A7F3D0]">
                  96% Harmony
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
