import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Fuel, Wrench, BarChart3, 
  Settings, HelpCircle, Plus, Bell
} from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  const navItems = [
    { name: 'Overview', icon: LayoutDashboard, path: '/' },
    { name: 'Fuel Logs', icon: Fuel, path: '/fuel' },
    { name: 'Maintenance', icon: Wrench, path: '/maintenance' },
    { name: 'Stats', icon: BarChart3, path: '/stats' },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <aside className="hidden md:flex flex-col py-8 h-screen w-64 border-r border-zinc-200 bg-white sticky top-0">
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
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

      <div className="flex-1 flex flex-col min-w-0">
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

        <main className="p-6 md:p-8 max-w-screen-2xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
