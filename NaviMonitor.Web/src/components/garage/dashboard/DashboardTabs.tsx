import { Fuel, Wrench, Activity } from 'lucide-react';

interface DashboardTabsProps {
  activeTab: 'Fuel' | 'Maintenance' | 'Activity';
  setActiveTab: (tab: 'Fuel' | 'Maintenance' | 'Activity') => void;
}

export default function DashboardTabs({ activeTab, setActiveTab }: DashboardTabsProps) {
  return (
    <div className="flex gap-2 p-1 bg-zinc-100 rounded-xl overflow-x-auto no-scrollbar border border-zinc-200">
      <button 
        onClick={() => setActiveTab('Activity')}
        className={`flex-1 min-w-30 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all ${activeTab === 'Activity' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black hover:bg-zinc-50'}`}
      >
        <Activity className="w-4 h-4" /> Timeline
      </button>
      <button 
        onClick={() => setActiveTab('Fuel')}
        className={`flex-1 min-w-30 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all ${activeTab === 'Fuel' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black hover:bg-zinc-50'}`}
      >
        <Fuel className="w-4 h-4" /> Fuel Logs
      </button>
      <button 
        onClick={() => setActiveTab('Maintenance')}
        className={`flex-1 min-w-30 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all ${activeTab === 'Maintenance' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black hover:bg-zinc-50'}`}
      >
        <Wrench className="w-4 h-4" /> Service Logs
      </button>
    </div>
  );
}
