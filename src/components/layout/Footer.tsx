import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white text-[#64748B] py-12 border-t border-[#E2E8F0]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-4">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold tracking-tight text-[#111827]">
              Spatial<span className="text-[#10B981]">AI</span>
            </span>
            <span className="text-xs text-[#94A3B8] pl-3 border-l border-[#E2E8F0]">
              AI Powered Furniture Visualization &amp; Sales Assistant
            </span>
          </div>

          <div className="flex space-x-6 text-sm font-medium text-[#475569]">
            <Link href="/customer" className="hover:text-[#059669] transition-colors">Customer Portal</Link>
            <Link href="/retailer" className="hover:text-[#059669] transition-colors">Retailer Dashboard</Link>
            <Link href="/admin" className="hover:text-[#059669] transition-colors">Admin</Link>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row justify-between items-center text-xs text-[#64748B] border-t border-[#E2E8F0] pt-8">
          <p>The future of spatial furniture visualization and retail intelligence.</p>
          <p className="mt-2 md:mt-0">&copy; {new Date().getFullYear()} SpatialAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
