import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Fuel, Wrench, BarChart3, 
  Settings, HelpCircle, LogOut, Plus, UserCircle, Bell
} from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col py-6 px-4 h-screen w-64 border-r border-zinc-200 bg-white sticky top-0 z-50">
      
      <div className="px-2 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black tracking-tighter text-zinc-900">NAVI</h1>
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" title="System Active"></div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-md transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-secondary rounded-full"></span>
          </button>
        </div>
      </div>

      <button className="w-full bg-secondary text-white py-2.5 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-md shadow-red-500/20 active:scale-95 flex justify-center items-center gap-2 mb-6">
        <Plus className="w-4 h-4" /> New Entry
      </button>

      <nav className="flex flex-col gap-1 grow">
        <NavLink 
          to="/"
          end
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm transition-all
            ${isActive ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}
          `}
        >
          <LayoutDashboard className="w-5 h-5" />
          My Garage
        </NavLink>

        <NavLink 
          to="/fuel"
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm transition-all
            ${isActive ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}
          `}
        >
          <Fuel className="w-5 h-5" />
          Fuel Logs
        </NavLink>

        <NavLink 
          to="/maintenance"
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm transition-all
            ${isActive ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}
          `}
        >
          <Wrench className="w-5 h-5" />
          Maintenance
        </NavLink>

        <NavLink 
          to="/stats"
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm transition-all
            ${isActive ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}
          `}
        >
          <BarChart3 className="w-5 h-5" />
          Stats
        </NavLink>
      </nav>

      <div className="mt-auto flex flex-col pt-6 border-t border-zinc-100 space-y-4">
        
        <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600">
              <UserCircle className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-black uppercase truncate max-w-30">Gelo Dev</span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Pro Account</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <NavLink to="/settings" className="flex items-center gap-2 px-2 py-1.5 text-zinc-500 hover:text-black text-xs font-bold transition-all rounded-md hover:bg-zinc-100">
              <Settings className="w-4 h-4" /> Settings
            </NavLink>
            <NavLink to="/support" className="flex items-center gap-2 px-2 py-1.5 text-zinc-500 hover:text-black text-xs font-bold transition-all rounded-md hover:bg-zinc-100">
              <HelpCircle className="w-4 h-4" /> Support
            </NavLink>
            <button className="flex items-center gap-2 px-2 py-1.5 text-zinc-500 hover:text-secondary text-xs font-bold transition-all w-full text-left rounded-md hover:bg-red-50">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>

    </aside>
  );
}
