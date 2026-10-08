import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0F0F0F] text-[#71717A] py-10 border-t border-[#27272A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold tracking-tight text-[#F5F5F5]">
              Spatial<span className="text-[#10B981]">AI</span>
            </span>
            <span className="text-xs text-[#71717A] pl-2 border-l border-[#27272A]">
              AI Powered Furniture Visualization &amp; Sales Assistant
            </span>
          </div>

          <div className="flex space-x-6 text-xs font-medium text-[#A1A1AA]">
            <Link href="/customer" className="hover:text-[#10B981] transition-colors">Customer Portal</Link>
            <Link href="/retailer" className="hover:text-[#10B981] transition-colors">Retailer Dashboard</Link>
            <Link href="/admin" className="hover:text-[#10B981] transition-colors">Admin</Link>
          </div>
        </div>

        <div className="mt-6 flex flex-col md:flex-row justify-between items-center text-xs text-[#71717A] border-t border-[#27272A]/60 pt-6">
          <p>The future of spatial furniture visualization and retail intelligence.</p>
          <p className="mt-2 md:mt-0">&copy; {new Date().getFullYear()} SpatialAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
