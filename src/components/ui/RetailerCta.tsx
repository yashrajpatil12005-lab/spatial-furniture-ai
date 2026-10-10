import Link from 'next/link';

export default function RetailerCta() {
  return (
    <section id="for-retailers" className="py-12 sm:py-16 bg-white border-t border-[#E2E8F0] scroll-mt-16">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
        
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-3xl p-8 sm:p-12 card-shadow relative overflow-hidden">
          
          {/* Subtle accent corner glow */}
          <div 
            className="pointer-events-none absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-gradient-to-br from-[#10B981]/15 to-transparent blur-2xl" 
            aria-hidden="true" 
          />

          <div className="relative z-10 max-w-3xl">
            
            <div className="inline-flex items-center gap-2 rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold text-[#047857] border border-[#A7F3D0] mb-4">
              <span>Retail Operations</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#111827] leading-[1.2]">
              Bring your furniture catalog into the spatial era.
            </h2>

            <p className="mt-4 text-sm sm:text-base text-[#475569] leading-relaxed max-w-2xl">
              Manage your product catalog, maintain real-time inventory visibility, track custom dimensional variations, and prepare your merchandise for multimodal AI room recommendations and spatial visualization.
            </p>

            {/* Retailer Feature List */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
                <div className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                  Catalog Management
                </div>
                <p className="mt-1 text-xs text-[#64748B]">
                  Upload 3D assets, define physical dimensions, and manage finish swatches.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
                <div className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                  Inventory Visibility
                </div>
                <p className="mt-1 text-xs text-[#64748B]">
                  Track low-stock thresholds, backorders, and multi-variant availability.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
                <div className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                  Spatial Integration
                </div>
                <p className="mt-1 text-xs text-[#64748B]">
                  Provide customer-ready data for Gemini multimodal room matching.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/retailer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#10B981] hover:bg-[#059669] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#10B981]"
              >
                <span>Open Retailer Dashboard</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center rounded-xl bg-white hover:bg-slate-50 border border-[#E2E8F0] px-5 py-3.5 text-sm font-semibold text-[#111827] shadow-sm transition-colors"
              >
                Register Retailer Account
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
