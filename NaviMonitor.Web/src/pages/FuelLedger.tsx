import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Edit2, Trash2, Fuel, DollarSign, TrendingDown } from 'lucide-react';
import type { Vehicle, RefuelLog } from '../types/types';
import StatCard from '../components/ui/display/StatCard';

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
        const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:7041/api';
        
        const promises = vehicles.map(v => axios.get(`${apiUrl}/refuel/vehicle/${v.id}`));
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

  const headerStyle = "px-6 py-4 font-black text-[10px] text-zinc-500 uppercase tracking-widest";

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
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/80 border-b border-zinc-200">
                <th className={headerStyle}>Date</th>
                <th className={headerStyle}>Vehicle</th>
                <th className={headerStyle}>Odometer</th>
                <th className={headerStyle}>Volume / Cost</th>
                <th className={`${headerStyle} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 font-bold text-sm uppercase tracking-widest">
                    No fuel records found across garage
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const vehicle = vehicles.find(v => v.id === log.vehicleId);
                  
                  return (
                    <tr key={log.id} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-sm text-black">{new Date(log.date).toLocaleDateString()}</td>
                      
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 bg-zinc-100 text-zinc-600 text-[10px] font-black uppercase tracking-widest rounded-md">
                          {vehicle ? vehicle.nickname : `ID: ${log.vehicleId}`}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-zinc-600 text-sm font-medium">{log.odometer.toLocaleString()} km</td>
                      
                      <td className="px-6 py-4 text-zinc-600 text-sm">
                        <span className="font-bold text-black">{log.volume} L</span> 
                        <span className="text-zinc-400"> / ₱{log.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => onOpenRefuelModal(log.vehicleId, log)} 
                            className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-lg transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => onDeleteRefuelLog(log)} 
                            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50/50">
          <span className="text-zinc-500 text-sm font-bold">Showing {logs.length} global records</span>
        </div>
      </div>

    </motion.div>
  );
}
