import { Link } from 'react-router-dom';
import { Plus, Bell } from 'lucide-react';

export default function TopNav() {
  return (
    <header className="w-full border-b border-zinc-200 bg-white sticky top-0 z-40">
      <div className="flex justify-between items-center px-6 h-16 max-w-screen-2xl mx-auto">
        <div className="md:hidden text-xl font-black uppercase tracking-tighter text-black">Navi</div>
        
        <nav className="hidden lg:flex items-center gap-8 h-full ml-8">
          <Link to="/" className="text-black border-b-2 border-secondary pb-1 h-full flex items-center font-bold text-sm">Dashboard</Link>
          <Link to="/" className="text-zinc-500 hover:text-black transition-colors duration-200 h-full flex items-center font-bold text-sm">Garages</Link>
        </nav>

        <div className="flex items-center gap-4 ml-auto">
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg font-bold text-sm hover:bg-red-600 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Log
          </button>
          <button className="p-2 text-zinc-400 hover:bg-zinc-50 rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full border-2 border-white"></span>
          </button>
          <div className="ml-2 w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white text-xs font-bold shadow-sm cursor-pointer hover:ring-2 hover:ring-zinc-200 transition-all">
            G
          </div>
        </div>
      </div>
    </header>
  );
}
