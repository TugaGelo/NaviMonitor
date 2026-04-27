import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Fuel, Wrench, BarChart3, 
  Settings, HelpCircle 
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  
  const navItems = [
    { name: 'Overview', icon: LayoutDashboard, path: '/' },
    { name: 'Fuel Logs', icon: Fuel, path: '/fuel' },
    { name: 'Maintenance', icon: Wrench, path: '/maintenance' },
    { name: 'Stats', icon: BarChart3, path: '/stats' },
  ];

  return (
    <aside className="hidden md:flex flex-col py-8 h-screen w-64 border-r border-zinc-200 bg-white sticky top-0">
      <div className="px-6 mb-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow-md">
          <div className="w-3 h-3 rounded-full bg-secondary animate-pulse"></div>
        </div>
        <div>
          <h2 className="text-xl font-black tracking-tighter uppercase">Navi</h2>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all active:scale-95 ${
                isActive 
                ? 'bg-zinc-100 text-black border-r-4 border-secondary' 
                : 'text-zinc-500 hover:bg-zinc-50 hover:pl-6'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mt-auto pt-8 border-t border-zinc-100 space-y-1">
        <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-zinc-500 hover:bg-zinc-50 hover:pl-6 rounded-lg font-bold text-sm transition-all">
          <Settings className="w-5 h-5" /> Settings
        </Link>
        <Link to="/support" className="flex items-center gap-3 px-4 py-3 text-zinc-500 hover:bg-zinc-50 hover:pl-6 rounded-lg font-bold text-sm transition-all">
          <HelpCircle className="w-5 h-5" /> Support
        </Link>
        <button className="mt-6 w-full py-3 bg-secondary text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95">
          New Entry
        </button>
      </div>
    </aside>
  );
}
