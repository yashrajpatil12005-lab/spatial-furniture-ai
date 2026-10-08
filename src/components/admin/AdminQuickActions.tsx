'use client';

import Link from 'next/link';

export default function AdminQuickActions() {
  const actions = [
    {
      title: 'Manage Products',
      description: 'View full product inventory, edit listings, and manage stock',
      href: '/retailer/products',
      icon: (
        <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    },
    {
      title: 'Add New Product',
      description: 'Create a new catalog item with dimensions & 3D attributes',
      href: '/retailer/products/new',
      icon: (
        <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      title: 'Customer Catalog',
      description: 'Experience customer product discovery and AI visualizer',
      href: '/customer/products',
      icon: (
        <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      title: 'Retailer Dashboard',
      description: 'Navigate to retail analytics and partner overview',
      href: '/retailer',
      icon: (
        <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: 'Customer Portal',
      description: 'Visit customer landing view and discovery recommendations',
      href: '/customer',
      icon: (
        <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="rounded-2xl bg-white border border-[#E2E8F0] p-6 sm:p-8 card-shadow">
      <div className="pb-4 border-b border-[#E2E8F0]">
        <h2 className="text-base font-bold text-[#111827]">Quick Actions</h2>
        <p className="text-xs text-[#64748B] mt-0.5">
          Fast portal navigation for administrative workflows and cross-role verification
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 mt-6">
        {actions.map((act) => (
          <Link
            key={act.title}
            href={act.href}
            className="group flex flex-col justify-between p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#10B981] hover:bg-white transition-all shadow-sm"
          >
            <div>
              <div className="p-2.5 rounded-xl bg-white w-fit border border-[#E2E8F0] group-hover:border-[#10B981]/40 transition-colors shadow-xs">
                {act.icon}
              </div>
              <h3 className="text-xs font-bold text-[#111827] mt-3 group-hover:text-[#047857] transition-colors">
                {act.title}
              </h3>
              <p className="text-[11px] text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                {act.description}
              </p>
            </div>
            <span className="mt-4 text-[11px] font-semibold text-[#047857] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Open &rarr;
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
