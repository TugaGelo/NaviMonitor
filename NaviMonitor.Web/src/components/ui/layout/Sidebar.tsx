import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../context/auth/AuthContext';
import { 
  LayoutDashboard, Fuel, Wrench, BarChart3, 
  Settings, HelpCircle, LogOut, UserCircle
} from 'lucide-react';
import LogoutModal from '../../modals/auth/LogoutModal';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleConfirmLogout = async () => {
    try {
      await logout();
      setIsLogoutModalOpen(false);
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <>
      <aside className="hidden md:flex flex-col py-6 px-4 h-screen w-64 border-r border-zinc-200 bg-white sticky top-0 z-50">
        
        <div className="pb-3 mb-3 border-b border-zinc-200 flex items-center justify-center w-full">
          <h1 className="text-5xl font-black tracking-tighter text-black uppercase">
            NAVI
          </h1>
        </div>

                <nav className="flex flex-col gap-1 grow">
          <NavLink to="/" end className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm transition-all ${isActive ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}>
            <LayoutDashboard className="w-5 h-5" /> My Garage
          </NavLink>
          <NavLink to="/fuel" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm transition-all ${isActive ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}>
            <Fuel className="w-5 h-5" /> Fuel Logs
          </NavLink>
          <NavLink to="/maintenance" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm transition-all ${isActive ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}>
            <Wrench className="w-5 h-5" /> Maintenance
          </NavLink>
          <NavLink to="/stats" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm transition-all ${isActive ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}>
            <BarChart3 className="w-5 h-5" /> Stats
          </NavLink>
        </nav>

        <div className="mt-auto flex flex-col pt-6 border-t border-zinc-100 space-y-4">
          <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 shrink-0">
                <UserCircle className="w-6 h-6" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-black text-black uppercase truncate" title={user?.email || 'User'}>
                  {user?.email?.split('@')[0] || 'User'}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <NavLink to="/settings" className="flex items-center gap-2 px-2 py-1.5 text-zinc-500 hover:text-black text-xs font-bold transition-all rounded-md hover:bg-zinc-100">
                <Settings className="w-4 h-4" /> Settings
              </NavLink>
              <NavLink to="/support" className="flex items-center gap-2 px-2 py-1.5 text-zinc-500 hover:text-black text-xs font-bold transition-all rounded-md hover:bg-zinc-100">
                <HelpCircle className="w-4 h-4" /> Support
              </NavLink>
              <button 
                onClick={() => setIsLogoutModalOpen(true)} 
                className="flex items-center gap-2 px-2 py-1.5 text-zinc-500 hover:text-black text-xs font-bold transition-all w-full text-left rounded-md hover:bg-zinc-200/50 group"
              >
                <LogOut className="w-4 h-4 group-hover:text-black transition-colors" /> Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={handleConfirmLogout} 
      />
    </>
  );
}
