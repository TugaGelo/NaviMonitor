import { motion } from 'framer-motion';
import { Activity, Fuel, Wrench, Calendar } from 'lucide-react';

interface DashboardTabsProps {
  activeTab: 'Activity' | 'Fuel' | 'Maintenance' | 'Schedule';
  setActiveTab: (tab: 'Activity' | 'Fuel' | 'Maintenance' | 'Schedule') => void;
}

export default function DashboardTabs({ activeTab, setActiveTab }: DashboardTabsProps) {
  const tabs = [
    { id: 'Activity', icon: Activity, label: 'Activity' },
    { id: 'Fuel', icon: Fuel, label: 'Fuel' },
    { id: 'Maintenance', icon: Wrench, label: 'Maintenance' },
    { id: 'Schedule', icon: Calendar, label: 'Schedule' },
  ] as const;

  return (
    <div className="flex border-b border-zinc-200 gap-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`pb-4 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all relative ${
            activeTab === tab.id ? 'text-black' : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
          {activeTab === tab.id && (
            <motion.div 
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-1 bg-black rounded-t-full" 
            />
          )}
        </button>
      ))}
    </div>
  );
}
