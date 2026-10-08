export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-400 py-8 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tighter text-white">
              Spatial<span className="text-emerald-500">AI</span>
            </span>
          </div>
          
          <div className="flex space-x-8 text-sm font-medium">
            <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Contact</a>
          </div>
        </div>
        
        <div className="mt-6 flex flex-col md:flex-row justify-between items-center text-xs text-neutral-600 border-t border-neutral-800 pt-6">
          <p>The future of spatial furniture visualization and retail analytics.</p>
          <p className="mt-2 md:mt-0">&copy; {new Date().getFullYear()} Spatial Furniture AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
