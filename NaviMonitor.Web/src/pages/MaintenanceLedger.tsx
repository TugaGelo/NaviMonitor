import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Search } from 'lucide-react';
import type { Vehicle, MaintenanceLog } from '../types/types';

import MaintenanceTable from '../components/features/tables/MaintenanceTable';

interface GlobalMaintenanceLogsProps {
  vehicles: Vehicle[];
  onOpenMaintenanceModal: (vehicleId: number, log?: MaintenanceLog | null, currentOdo?: number) => void;
  onDeleteMaintenanceLog: (log: MaintenanceLog) => void;
  refreshTrigger: number;
}

export default function GlobalMaintenanceLogs({ vehicles, onOpenMaintenanceModal, onDeleteMaintenanceLog, refreshTrigger }: GlobalMaintenanceLogsProps) {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [isLoading, setIsLoading] = useState(vehicles.length > 0);
  
  const [activeTab, setActiveTab] = useState<'All' | 'Maintenance' | 'Modification'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchAllLogs = async () => {
      if (vehicles.length === 0) {
        setLogs([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:7041/api';
        const promises = vehicles.map(v => axios.get(`${apiUrl}/maintenance/vehicle/${v.id}`));
        const results = await Promise.all(promises);
        
        if (isMounted) {
          const combinedLogs = results
            .flatMap(res => res.data)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setLogs(combinedLogs);
        }
      } catch (err) {
        console.error("Failed to fetch global maintenance logs", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAllLogs();
    return () => { isMounted = false; };
  }, [vehicles, refreshTrigger]);

  const filteredLogs = logs.filter(log => {
    const matchesTab = activeTab === 'All' || log.logType === activeTab;
    const matchesSearch = log.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (log.shopName && log.shopName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const totalSpend = filteredLogs.reduce((sum, log) => sum + log.price, 0);
  const serviceCount = logs.filter(l => l.logType === 'Maintenance').length;
  const modCount = logs.filter(l => l.logType === 'Modification').length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 border-4 border-zinc-200 border-t-black rounded-full animate-spin"></div>
        <div className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Compiling Service Records...</div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 pb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-black tracking-tight">Service & Mods</h2>
          <p className="text-zinc-500 font-medium mt-1">Cross-asset maintenance timeline and modifications log.</p>
        </div>
        
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex gap-8 items-center shrink-0 shadow-sm">
          <div>
            <p className="text-[10px] font-black text-zinc-400 mb-1 uppercase tracking-widest">Filtered Spend</p>
            <p className="text-xl font-black text-black">₱{totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="h-10 w-px bg-zinc-200"></div>
          <div>
            <p className="text-[10px] font-black text-zinc-400 mb-1 uppercase tracking-widest">Services / Mods</p>
            <p className="font-bold text-black">{serviceCount} <span className="text-zinc-400">/</span> {modCount}</p>
          </div>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex bg-zinc-100 p-1 border border-zinc-200 rounded-lg">
          {(['All', 'Maintenance', 'Modification'] as const).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 font-bold text-xs uppercase tracking-widest rounded transition-colors ${
                activeTab === tab ? 'bg-black text-white shadow-sm' : 'text-zinc-500 hover:text-black'
              }`}
            >
              {tab === 'All' ? 'All Records' : tab === 'Maintenance' ? 'Service' : 'Mods'}
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:w-64 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-lg pl-10 pr-4 py-2 text-sm font-medium text-black focus:border-black focus:ring-0 outline-none transition-all shadow-sm" 
            placeholder="Search logs or shops..." 
          />
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        <MaintenanceTable 
          logs={filteredLogs} 
          vehicles={vehicles} 
          showVehicle={true} 
          onEdit={onOpenMaintenanceModal}
          onDelete={onDeleteMaintenanceLog}
        />
      </div>
      
    </motion.div>
  );
}
