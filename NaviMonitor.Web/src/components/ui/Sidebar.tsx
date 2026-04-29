import { NavLink, useParams } from 'react-router-dom';
import { 
  LayoutDashboard, Fuel, Wrench, BarChart3, 
  Settings, HelpCircle, LogOut, TableProperties, Plus
} from 'lucide-react';

export default function Sidebar() {
  const { id } = useParams<{ id: string }>(); 

  const vehicleContextLinks = [
    { name: 'Maintenance', icon: Wrench, path: `/vehicle/${id}/maintenance` },
    { name: 'V-Matrix', icon: TableProperties, path: `/vehicle/${id}/schedule` },
    { name: 'Stats', icon: BarChart3, path: `/vehicle/${id}/stats` },
  ];

  return (
    <aside className="hidden md:flex flex-col py-6 px-4 h-screen w-64 border-r border-zinc-200 bg-white sticky top-0 z-50">
      
      <div className="px-2 mb-8 flex items-center gap-3">
        <h1 className="text-2xl font-black tracking-tighter text-zinc-900">NAVI</h1>
        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" title="System Active"></div>
      </div>

      <div className="flex flex-col gap-1 mb-4">
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
      </div>

      <div className="w-full h-px bg-zinc-200 my-2" />

      <nav className="flex flex-col gap-1 grow mt-2">
        <p className="px-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Vehicle Context</p>
        {vehicleContextLinks.map((item) => {
          const isDisabled = !id;
          
          return (
            <NavLink
              key={item.name}
              to={isDisabled ? '#' : item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm transition-all
                ${isDisabled ? 'opacity-30 cursor-not-allowed text-zinc-400' : 'active:scale-95'}
                ${isActive && !isDisabled 
                  ? 'bg-zinc-100 text-black border-r-4 border-secondary' 
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}
              `}
              onClick={(e) => {
                if (isDisabled) e.preventDefault();
              }}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col pt-6 border-t border-zinc-100">
        <div className="flex flex-col gap-1 mb-6">
          <NavLink to="/settings" className="flex items-center gap-3 px-3 py-2.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg font-bold text-sm transition-all">
            <Settings className="w-5 h-5" /> Settings
          </NavLink>
          <NavLink to="/support" className="flex items-center gap-3 px-3 py-2.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg font-bold text-sm transition-all">
            <HelpCircle className="w-5 h-5" /> Support
          </NavLink>
          <button className="flex items-center gap-3 px-3 py-2.5 text-zinc-500 hover:text-secondary hover:bg-red-50 rounded-lg font-bold text-sm transition-all w-full text-left">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>

        <button className="w-full bg-secondary text-white py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95 flex justify-center items-center gap-2">
          <Plus className="w-4 h-4" /> New Entry
        </button>
      </div>

    </aside>
  );
}
