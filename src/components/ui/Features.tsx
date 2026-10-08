export default function Features() {
  const features = [
    {
      name: 'Augmented Reality',
      description: 'Visualize furniture in your actual room before buying.',
      status: 'Coming Soon',
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5m16.5 0V6A2.25 2.25 0 0 0 18 3.75h-1.5m-15 15V18A2.25 2.25 0 0 1 6 20.25h1.5m15-15v1.5m0 10.5V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
        </svg>
      )
    },
    {
      name: 'AI Recommendations',
      description: 'Generative AI curates personalized styles based on your spatial dimensions and aesthetic.',
      status: 'Coming Soon',
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
        </svg>
      )
    },
    {
      name: 'Digital Twin Retail',
      description: 'Retailers can manage a 1:1 digital replica of their inventory and track spatial interactions.',
      status: 'Coming Soon',
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
        </svg>
      )
    },
  ];

  return (
    <div className="py-20 sm:py-24 bg-white border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-bold tracking-widest uppercase leading-7 text-emerald-600">Platform Architecture</h2>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
            Everything needed for the future of retail
          </p>
          <p className="mt-6 text-lg leading-relaxed text-neutral-600">
            We are building a robust foundation that seamlessly integrates bleeding-edge technologies.
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-7xl sm:mt-20">
          <dl className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col bg-neutral-50 rounded-2xl p-8 ring-1 ring-neutral-900/5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    {feature.status}
                  </span>
                </div>
                
                <dt className="flex items-center gap-x-4 text-lg font-bold leading-7 text-neutral-900">
                  <div className="h-12 w-12 flex-none bg-emerald-100/80 rounded-xl flex items-center justify-center ring-1 ring-emerald-600/10">
                    {feature.icon}
                  </div>
                  {feature.name}
                </dt>
                
                <dd className="mt-6 flex flex-auto flex-col text-base leading-relaxed text-neutral-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
