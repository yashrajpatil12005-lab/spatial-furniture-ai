export default function PlatformCapabilities() {
  const capabilities = [
    {
      name: 'AI Room Analysis',
      description: 'Multimodal Gemini vision analyzes user room photos for ambient illumination, room palettes, and architectural harmony.',
      status: 'Available',
      statusType: 'active',
      icon: (
        <svg className="w-5 h-5 text-[#047857]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      name: 'Personalized Furniture Recommendations',
      description: 'Gemini generative reasoning scores furniture pairings against room dimensions, style aesthetics, and customer budget limits.',
      status: 'Available',
      statusType: 'active',
      icon: (
        <svg className="w-5 h-5 text-[#047857]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      name: 'Furniture Customization',
      description: 'Interactive customizer to adjust width, height, depth, material selections, and finish swatches with instantaneous spec recalculations.',
      status: 'Available',
      statusType: 'active',
      icon: (
        <svg className="w-5 h-5 text-[#047857]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
    },
    {
      name: 'AR Furniture Placement',
      description: 'True 1:1 scale augmented reality positioning via Unity mobile engine and upcoming in-browser WebXR surface detection.',
      status: 'In Development',
      statusType: 'dev',
      icon: (
        <svg className="w-5 h-5 text-[#B45309]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
        </svg>
      ),
    },
    {
      name: 'Digital Twin & Spatial Mapping',
      description: 'Automated 3D boundary collision detection, parametric mesh generation, and volumetric clearance modeling for rooms.',
      status: 'In Development',
      statusType: 'dev',
      icon: (
        <svg className="w-5 h-5 text-[#B45309]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
    },
    {
      name: 'Retailer Inventory & Analytics',
      description: 'Retailer suite for catalog management, stock status alerts, SKU customization tracking, and catalog health diagnostics.',
      status: 'Available',
      statusType: 'active',
      icon: (
        <svg className="w-5 h-5 text-[#047857]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-white border-t border-[#E2E8F0]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
        
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#047857]">
            Platform Capabilities
          </span>
          <h2 className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
            Everything needed for the future of furniture commerce
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#475569]">
            A unified architecture connecting multimodal AI room intelligence, parametric customization, and omni-channel retail inventory.
          </p>
        </div>

        {/* 6 Capabilities Cards Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((item) => (
            <div
              key={item.name}
              className="bg-white rounded-2xl p-6 border border-[#E2E8F0] card-shadow card-shadow-hover flex flex-col justify-between transition-all"
            >
              <div>
                {/* Header: Icon & Accurate Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl border ${
                    item.statusType === 'active' 
                      ? 'bg-[#ECFDF5] border-[#A7F3D0]' 
                      : 'bg-[#FFFBEB] border-[#FDE68A]'
                  }`}>
                    {item.icon}
                  </div>
                  
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                    item.statusType === 'active'
                      ? 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]'
                      : 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#111827]">
                  {item.name}
                </h3>
                
                <p className="mt-2 text-xs sm:text-sm text-[#475569] leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Status Indicator Bar */}
              <div className="mt-5 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#64748B]">
                <span>State</span>
                <span className="font-medium text-[#111827]">
                  {item.statusType === 'active' ? '● Production Feature' : '○ Planned Release'}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
