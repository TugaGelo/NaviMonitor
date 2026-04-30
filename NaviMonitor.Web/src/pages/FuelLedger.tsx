import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import { Fuel, DollarSign, TrendingDown } from 'lucide-react';
import type { Vehicle, RefuelLog } from '../types/types';
import StatCard from '../components/ui/display/StatCard';
import FuelTable from '../components/features/tables/FuelTable';

interface GlobalFuelLogsProps {
  vehicles: Vehicle[];
  onOpenRefuelModal: (vehicleId: number, log?: RefuelLog) => void;
  onDeleteRefuelLog: (log: RefuelLog) => void;
  refreshTrigger: number;
}

export default function GlobalFuelLogs({ vehicles, onOpenRefuelModal, onDeleteRefuelLog, refreshTrigger }: GlobalFuelLogsProps) {
  const [logs, setLogs] = useState<RefuelLog[]>([]);
  const [isLoading, setIsLoading] = useState(vehicles.length > 0);

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
        const promises = vehicles.map(v => api.get(`/refuel/vehicle/${v.id}`));
        const results = await Promise.all(promises);
        
        if (isMounted) {
          const combinedLogs = results
            .flatMap(res => res.data)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          setLogs(combinedLogs);
        }
      } catch (err) {
        console.error("Failed to fetch global fuel logs", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAllLogs();

    return () => { isMounted = false; };
  }, [vehicles, refreshTrigger]);

  const totalSpend = logs.reduce((sum, log) => sum + log.totalCost, 0);
  const totalVolume = logs.reduce((sum, log) => sum + log.volume, 0);
  const avgPricePerLiter = totalVolume > 0 ? (totalSpend / totalVolume) : 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 border-4 border-zinc-200 border-t-black rounded-full animate-spin"></div>
        <div className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Compiling Master Ledger...</div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      
      <div>
        <h2 className="text-3xl font-extrabold text-black tracking-tight">Master Fuel Ledger</h2>
        <p className="text-zinc-500 font-medium mt-1">Cross-asset fuel consumption and spending history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Total Garage Spend" 
          value={totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
          prefix="₱" 
          icon={DollarSign} 
        />
        <StatCard 
          label="Total Volume (All Assets)" 
          value={totalVolume.toFixed(1)} 
          suffix="L" 
          icon={Fuel} 
        />
        <StatCard 
          label="Avg. Price / Liter" 
          value={avgPricePerLiter.toFixed(2)} 
          prefix="₱" 
          icon={TrendingDown} 
        />
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
        
        <FuelTable 
          logs={logs}
          vehicles={vehicles}
          showVehicle={true}
          onEdit={onOpenRefuelModal}
          onDelete={onDeleteRefuelLog}
        />
        
        <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50/50">
          <span className="text-zinc-500 text-sm font-bold">Showing {logs.length} global records</span>
        </div>
      </div>

    </motion.div>
  );
}
