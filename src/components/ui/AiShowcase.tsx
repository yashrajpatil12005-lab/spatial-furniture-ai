import Link from 'next/link';

export default function AiShowcase() {
  return (
    <section className="py-12 sm:py-16 bg-[#F8FAFC] border-t border-[#E2E8F0]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
        
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-12">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#047857]">
            AI Multimodal Reasoning
          </span>
          <h2 className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
            How Gemini AI reasons about your living space
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#475569]">
            Beyond simple 2D overlays — our multimodal pipeline evaluates natural illumination, wall undertones, and spatial proportions before you make a purchase.
          </p>
        </div>

        {/* 2-Column Content Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Workflow Explanation */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] card-shadow space-y-5">
              
              {/* Feature 1 */}
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">
                    1. Illumination &amp; Lighting Evaluation
                  </h3>
                  <p className="text-xs sm:text-sm text-[#475569] mt-1 leading-relaxed">
                    Evaluates natural daylight angle, warmth, and shadow falloffs in your room photo so selected finishes reflect real ambience.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">
                    2. Color Harmony &amp; Material Pairing
                  </h3>
                  <p className="text-xs sm:text-sm text-[#475569] mt-1 leading-relaxed">
                    Identifies dominant floor and wall palettes to suggest harmonizing textiles, solid woods, or contrast accent swatches.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">
                    3. Proportions &amp; Walkway Clearance
                  </h3>
                  <p className="text-xs sm:text-sm text-[#475569] mt-1 leading-relaxed">
                    Compares customized furniture dimensions against physical perimeter constraints to ensure sufficient room circulation.
                  </p>
                </div>
              </div>

            </div>

            {/* CTA directly to the actual workflow */}
            <div className="pt-2">
              <Link
                href="/customer/products"
                className="inline-flex items-center gap-2 rounded-xl bg-[#10B981] hover:bg-[#059669] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#10B981]"
              >
                <span>Explore Catalog &amp; Try Room Analysis</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
              <p className="mt-2 text-xs text-[#64748B]">
                Upload your room photo on any product page under the &ldquo;Visualize in My Room&rdquo; panel.
              </p>
            </div>

          </div>

          {/* Right Column: Visual Demonstration Mockup */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden card-shadow">
              
              {/* Card Header */}
              <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse"></span>
                  <span className="text-xs font-bold text-[#111827]">
                    Sample Spatial Analysis Breakdown
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-[#047857] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
                  Gemini Vision
                </span>
              </div>

              {/* Sample Photo */}
              <div className="relative aspect-[16/10] bg-[#F1F5F9] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800"
                  alt="Sample analyzed room photo with Scandinavian Lounge Chair"
                  className="w-full h-full object-cover"
                />

                {/* Overlaid Detection Badges */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md rounded-lg px-2.5 py-1 text-[11px] font-medium text-[#111827] border border-[#E2E8F0] shadow-sm">
                  Lighting: Warm Day (4500K)
                </div>
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md rounded-lg px-2.5 py-1 text-[11px] font-semibold text-[#047857] border border-[#A7F3D0] shadow-sm">
                  Score: 94% Harmony
                </div>
              </div>

              {/* Sample Gemini Output Text */}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#047857]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Generated AI Spatial Reasoning</span>
                </div>

                <p className="text-xs text-[#334155] leading-relaxed italic bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
                  &ldquo;Room geometry reveals an open living layout with soft northern daylight. The Scandinavian Lounge Chair in Mustard Wool introduces balanced warm contrast against the cool grey walls, preserving 1.1m unobstructed circulation.&rdquo;
                </p>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-[#64748B] pt-1">
                  <span>Product: Scandinavian Lounge Chair</span>
                  <span className="font-semibold text-[#111827]">Walkway Clearance: Preserved (&gt;90cm)</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
