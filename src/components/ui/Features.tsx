export default function Features() {
  const features = [
    {
      name: 'Augmented Reality',
      description: 'Visualize furniture directly within your physical room at 1:1 scale before buying.',
      status: 'In Development',
      icon: (
        <svg className="w-6 h-6 text-[#10B981]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5m16.5 0V6A2.25 2.25 0 0 0 18 3.75h-1.5m-15 15V18A2.25 2.25 0 0 1 6 20.25h1.5m15-15v1.5m0 10.5V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
        </svg>
      )
    },
    {
      name: 'AI Recommendations',
      description: 'Generative Gemini reasoning curates personalized furniture choices based on your spatial preferences.',
      status: 'Configured',
      icon: (
        <svg className="w-6 h-6 text-[#10B981]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
        </svg>
      )
    },
    {
      name: 'Digital Twin Retail',
      description: 'Retailers manage 1:1 catalog replicas with custom dimensions, material swatches, and stock metrics.',
      status: 'Active',
      icon: (
        <svg className="w-6 h-6 text-[#10B981]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
        </svg>
      )
    },
  ];

  return (
    <div className="py-20 sm:py-24 bg-[#0F0F0F] border-t border-[#27272A]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-[#10B981]">
            Platform Architecture
          </h2>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#F5F5F5] sm:text-4xl">
            Everything needed for the future of retail
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#A1A1AA]">
            A unified foundation integrating spatial modeling, multimodal AI analysis, and omnichannel retail inventory.
          </p>
        </div>
        
        <div className="mx-auto mt-14 max-w-7xl">
          <dl className="grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-2 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="flex flex-col bg-[#141414] rounded-xl p-7 border border-[#27272A] hover:border-[#10B981]/40 transition-all relative overflow-hidden group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-11 w-11 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <span className="inline-flex items-center rounded-full bg-[#181818] px-2.5 py-0.5 text-xs font-mono font-medium text-[#A1A1AA] border border-[#27272A]">
                    {feature.status}
                  </span>
                </div>
                
                <dt className="text-base font-bold text-[#F5F5F5]">
                  {feature.name}
                </dt>
                
                <dd className="mt-2 text-sm leading-relaxed text-[#A1A1AA]">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
