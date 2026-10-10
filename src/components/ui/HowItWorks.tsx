import Link from 'next/link';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Explore furniture',
      description: 'Browse the available catalog and compare products.',
      detail: 'Inspect physical dimensions, structure materials, color options, and real-time inventory counts across our curated retail collection.',
      icon: (
        <svg className="w-6 h-6 text-[#047857]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      status: 'Available Now',
      statusClass: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
    },
    {
      number: '02',
      title: 'Understand your space',
      description: 'Upload a room photo through the existing AI room-analysis flow.',
      detail: 'On any product page, upload a room photo. Multimodal Gemini vision analyzes window illumination, spatial layout, and style compatibility.',
      icon: (
        <svg className="w-6 h-6 text-[#047857]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      status: 'Available Now',
      statusClass: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
    },
    {
      number: '03',
      title: 'Personalize your choice',
      description: 'Explore customization and AI recommendations.',
      detail: 'Adjust colors, materials, and dimensional parameters. The recommendation engine suggests matching furniture configurations for your room.',
      icon: (
        <svg className="w-6 h-6 text-[#047857]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      status: 'Available Now',
      statusClass: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
    },
  ];

  return (
    <section id="how-it-works" className="py-12 sm:py-16 bg-[#F8FAFC] border-t border-[#E2E8F0] scroll-mt-16">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#047857]">
            How It Works
          </span>
          <h2 className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
            Intelligent spatial furniture selection in three steps
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#475569]">
            A transparent workflow connecting digital visualization, generative reasoning, and physical room fit.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E2E8F0] card-shadow card-shadow-hover flex flex-col justify-between relative group"
            >
              <div>
                {/* Step Header: Number & Icon */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-extrabold text-[#047857] bg-[#ECFDF5] px-2.5 py-1 rounded-lg border border-[#A7F3D0]">
                      {step.number}
                    </span>
                    <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      {step.icon}
                    </div>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${step.statusClass}`}>
                    {step.status}
                  </span>
                </div>

                {/* Step Title & Core Description */}
                <h3 className="text-lg font-bold text-[#111827] group-hover:text-[#047857] transition-colors">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm font-medium text-[#334155]">
                  {step.description}
                </p>
                <p className="mt-2 text-xs text-[#64748B] leading-relaxed">
                  {step.detail}
                </p>
              </div>

              {/* Step Footer Link */}
              <div className="mt-6 pt-4 border-t border-[#F1F5F9]">
                <Link
                  href="/customer/products"
                  className="inline-flex items-center text-xs font-semibold text-[#047857] hover:text-[#059669] transition-colors gap-1"
                >
                  <span>Experience this step</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Realistic Technical Notice */}
        <div className="mt-8 bg-white border border-[#E2E8F0] rounded-xl p-4 sm:p-5 card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#475569]">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <span>
              <strong>Platform Notice:</strong> Multimodal room photo reasoning and custom parametric sizing are live. Automated LiDAR mesh extraction and live WebXR camera tracking are currently under active development.
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
