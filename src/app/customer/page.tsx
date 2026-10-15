'use client';

import { ProtectedRoute } from '@/lib/firebase/ProtectedRoute';
import { useAuth } from '@/lib/firebase/AuthContext';
import Link from 'next/link';
import RecommendationPanel from '@/components/ai/RecommendationPanel';

export default function CustomerPage() {
  const { userData } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['customer', 'admin']}>
      <div className="min-h-screen bg-[#F8FAFC] text-[#111827] py-8 sm:py-12 px-5 sm:px-8 lg:px-10">
        <div className="max-w-[1280px] mx-auto space-y-10">
          
          {/* Welcome Dashboard Banner */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-10 card-shadow">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] shadow-sm flex-shrink-0">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#047857] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
                      Customer Dashboard
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
                    Welcome back, <span className="text-[#10B981]">{userData?.name || 'Customer'}</span>
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-[#475569]">
                    Discover designer furniture, run multimodal AI room analyses, and explore personalized recommendations.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
                <Link
                  href="/customer/products"
                  className="inline-flex items-center rounded-xl bg-[#10B981] hover:bg-[#059669] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all"
                >
                  Browse Catalog
                </Link>
                <Link
                  href="/customer/visualizer"
                  className="inline-flex items-center rounded-xl bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] px-4 py-2.5 text-xs font-bold text-[#047857] shadow-2xs transition-all"
                >
                  Room Visualizer
                </Link>
                <a
                  href="#recommendations"
                  className="inline-flex items-center rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] px-4 py-2.5 text-xs font-bold text-[#334155] shadow-2xs transition-all"
                >
                  Recommendations &darr;
                </a>
              </div>
            </div>

            {/* Quick Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Link
                href="/customer/products"
                className="group p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#10B981] hover:bg-white transition-all shadow-xs"
              >
                <div className="p-2 rounded-lg bg-white border border-[#E2E8F0] text-[#047857] w-fit mb-3 group-hover:border-[#10B981]/50 shadow-2xs">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-[#111827] group-hover:text-[#047857] transition-colors">
                  Furniture Catalog
                </h3>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  Browse designer furniture with multi-attribute search, dimensional filtering, and live stock.
                </p>
                <span className="mt-3 text-xs font-semibold text-[#047857] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  View Catalog &rarr;
                </span>
              </Link>

              <Link
                href="/customer/visualizer"
                className="group p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#10B981] hover:bg-white transition-all shadow-xs"
              >
                <div className="p-2 rounded-lg bg-white border border-[#E2E8F0] text-[#047857] w-fit mb-3 group-hover:border-[#10B981]/50 shadow-2xs">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-[#111827] group-hover:text-[#047857] transition-colors">
                  AI Room Visualizer
                </h3>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  Upload a photo of your space for architectural scale, natural lighting, and walkway clearance checks.
                </p>
                <span className="mt-3 text-xs font-semibold text-[#047857] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Launch Visualizer &rarr;
                </span>
              </Link>

              <a
                href="#recommendations"
                className="group p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#10B981] hover:bg-white transition-all shadow-xs"
              >
                <div className="p-2 rounded-lg bg-white border border-[#E2E8F0] text-[#047857] w-fit mb-3 group-hover:border-[#10B981]/50 shadow-2xs">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-[#111827] group-hover:text-[#047857] transition-colors">
                  AI Recommendations
                </h3>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  Get personalized recommendations matched to your room type, budget, and saved spatial analyses.
                </p>
                <span className="mt-3 text-xs font-semibold text-[#047857] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Configure Preferences &darr;
                </span>
              </a>
            </div>
          </div>

          {/* AI Furniture Recommendations Feature Section */}
          <div id="recommendations" className="scroll-mt-20">
            <RecommendationPanel />
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
