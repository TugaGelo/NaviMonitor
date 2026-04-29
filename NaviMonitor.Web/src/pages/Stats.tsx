import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { DollarSign, Wrench, Calendar, LineChart, PieChart } from 'lucide-react';
import type { Vehicle, RefuelLog, MaintenanceLog } from '../types/types';
import StatCard from '../components/ui/display/StatCard';

interface GlobalStatsProps {
  vehicles: Vehicle[];
}

export default function GlobalStats({ vehicles }: GlobalStatsProps) {
  const [fuelLogs, setFuelLogs] = useState<RefuelLog[]>([]);
  const [maintLogs, setMaintLogs] = useState<MaintenanceLog[]>([]);
  const [isLoading, setIsLoading] = useState(vehicles.length > 0);

  useEffect(() => {
    let isMounted = true;

    const fetchAllData = async () => {
      if (vehicles.length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:7041/api';
        
        const fuelPromises = vehicles.map(v => axios.get(`${apiUrl}/refuel/vehicle/${v.id}`));
        const maintPromises = vehicles.map(v => axios.get(`${apiUrl}/maintenance/vehicle/${v.id}`));
        
        const [fuelResults, maintResults] = await Promise.all([
          Promise.all(fuelPromises),
          Promise.all(maintPromises)
        ]);
        
        if (isMounted) {
          setFuelLogs(fuelResults.flatMap(res => res.data));
          setMaintLogs(maintResults.flatMap(res => res.data));
        }
      } catch (err) {
        console.error("Failed to fetch global stats data", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAllData();
    return () => { isMounted = false; };
  }, [vehicles]);

  const totalFuelSpend = fuelLogs.reduce((sum, log) => sum + log.totalCost, 0);
  const totalMaintSpend = maintLogs.reduce((sum, log) => sum + log.price, 0);
  const totalSpend = totalFuelSpend + totalMaintSpend;

  let totalDistance = 0;
  vehicles.forEach(v => {
    const vLogs = fuelLogs.filter(l => l.vehicleId === v.id);
    if (vLogs.length > 1) {
      const minOdo = Math.min(...vLogs.map(l => l.odometer));
      const maxOdo = Math.max(...vLogs.map(l => l.odometer));
      totalDistance += (maxOdo - minOdo);
    }
  });

  const costPerKm = totalDistance > 0 ? (totalSpend / totalDistance) : 0;

  const fuelPct = totalSpend > 0 ? Math.round((totalFuelSpend / totalSpend) * 100) : 0;
  const maintPct = totalSpend > 0 ? Math.round((totalMaintSpend / totalSpend) * 100) : 0;

  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      label: d.toLocaleString('default', { month: 'short' }).toUpperCase(),
      month: d.getMonth(),
      year: d.getFullYear(),
      volume: 0
    };
  });

  fuelLogs.forEach(log => {
    const d = new Date(log.date);
    const target = last6Months.find(m => m.month === d.getMonth() && m.year === d.getFullYear());
    if (target) target.volume += log.volume;
  });

  const maxVolume = Math.max(...last6Months.map(m => m.volume), 1);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 border-4 border-zinc-200 border-t-black rounded-full animate-spin"></div>
        <div className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Compiling Telemetry...</div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 pb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-black tracking-tight uppercase">Performance Stats</h2>
          <p className="text-zinc-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Fleet Aggregate // Real-Time Telemetry</p>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Cost per KM" 
          value={costPerKm.toFixed(2)} 
          prefix="₱" 
          icon={DollarSign} 
          trend={{ value: "Across all assets", isUp: true }}
        />
        <StatCard 
          label="Total Garage Spend" 
          value={totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })} 
          prefix="₱" 
          icon={DollarSign} 
          trend={{ value: "Fuel + Maint", isUp: true }}
        />
        <StatCard 
          label="Recorded Distance" 
          value={totalDistance.toLocaleString()} 
          suffix="km" 
          icon={Calendar} 
          trend={{ value: "Total Tracked", isUp: true }}
        />
        <StatCard 
          label="Service Events" 
          value={maintLogs.length} 
          icon={Wrench} 
          trend={{ value: "Total Interventions", isUp: true }}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl p-6 flex flex-col shadow-sm h-80">
          <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-4">
            <div className="flex items-center gap-2 text-black">
              <LineChart className="w-5 h-5" />
              <h3 className="font-black text-sm uppercase tracking-widest">Fuel Volume (6 Months)</h3>
            </div>
          </div>
          
          <div className="flex-1 relative w-full flex items-end justify-between px-2 pb-4 gap-2">
            <div className="absolute left-0 top-0 h-full w-full flex flex-col justify-between z-0 pointer-events-none pb-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-full border-t border-dashed border-zinc-100 h-0"></div>
              ))}
            </div>

            {last6Months.map((m, i) => {
              const heightPct = Math.max((m.volume / maxVolume) * 100, 2); // min 2% height
              return (
                <div key={i} className="w-full relative z-10 flex flex-col items-center group h-full justify-end">
                  <div className="absolute -top-8 bg-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {m.volume.toFixed(1)}L
                  </div>
                  <div 
                    className={`w-full rounded-t-sm transition-all duration-500 ${i === 5 ? 'bg-secondary' : 'bg-zinc-200 hover:bg-zinc-300'}`}
                    style={{ height: `${heightPct}%` }}
                  ></div>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-between px-2 pt-2 border-t border-zinc-100">
            {last6Months.map((m, i) => (
              <span key={i} className={`text-[10px] font-black uppercase tracking-widest ${i === 5 ? 'text-secondary' : 'text-zinc-400'}`}>
                {m.label}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col shadow-sm h-80">
          <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-4">
            <div className="flex items-center gap-2 text-black">
              <PieChart className="w-5 h-5" />
              <h3 className="font-black text-sm uppercase tracking-widest">Spend Ratio</h3>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center items-center relative">
            <svg viewBox="0 0 36 36" className="w-36 h-36">
              <path
                className="text-zinc-100"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="text-black"
                strokeDasharray={`${fuelPct}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              {maintPct > 0 && (
                <path
                  className="text-secondary"
                  strokeDasharray={`${maintPct}, 100`}
                  strokeDashoffset={`-${fuelPct}`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-black text-xl text-black">{(fuelPct || 0)}%</span>
              <span className="text-[9px] font-black uppercase text-zinc-400">Fuel</span>
            </div>
          </div>

          <div className="mt-auto space-y-2 pt-4 border-t border-zinc-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-black rounded-full"></div>
                <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Fuel</span>
              </div>
              <span className="text-xs font-black text-black">₱{totalFuelSpend.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-secondary rounded-full"></div>
                <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Service</span>
              </div>
              <span className="text-xs font-black text-black">₱{totalMaintSpend.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </section>
    </motion.div>
  );
}
