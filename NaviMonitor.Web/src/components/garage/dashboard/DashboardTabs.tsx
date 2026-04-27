import { Fuel, Wrench } from 'lucide-react';

interface DashboardTabsProps {
  activeTab: 'Fuel' | 'Maintenance';
  setActiveTab: (tab: 'Fuel' | 'Maintenance') => void;
}

export default function DashboardTabs({ activeTab, setActiveTab }: DashboardTabsProps) {
  return (
    <div className="flex items-center gap-6 border-b border-zinc-200">
      <button 
        onClick={() => setActiveTab('Fuel')}
        className={`pb-4 font-black uppercase tracking-widest text-sm flex items-center gap-2 transition-colors ${activeTab === 'Fuel' ? 'text-black border-b-2 border-red-500' : 'text-zinc-400 hover:text-zinc-600'}`}
      >
        <Fuel className="w-5 h-5" /> Fuel History
      </button>
      <button 
        onClick={() => setActiveTab('Maintenance')}
        className={`pb-4 font-black uppercase tracking-widest text-sm flex items-center gap-2 transition-colors ${activeTab === 'Maintenance' ? 'text-black border-b-2 border-red-500' : 'text-zinc-400 hover:text-zinc-600'}`}
      >
        <Wrench className="w-5 h-5" /> Maintenance Record
      </button>
    </div>
  );
}
