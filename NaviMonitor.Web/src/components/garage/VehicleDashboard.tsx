import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ArrowLeft, Fuel, History, Edit2, ArrowUp, Trash2, Filter } from 'lucide-react';
import type { Vehicle, RefuelLog } from '../../types/types';

interface DashboardProps {
  onOpenRefuelModal?: (vehicleId: number) => void;
  refreshTrigger?: number;
}

export default function VehicleDashboard({ onOpenRefuelModal, refreshTrigger }: DashboardProps) {
  const { id } = useParams<{ id: string }>(); 
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [logs, setLogs] = useState<RefuelLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [timeFilter, setTimeFilter] = useState('All Time');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:7041/api';
        
        const vehicleRes = await axios.get(`${apiUrl}/vehicle/${id}`);
        setVehicle(vehicleRes.data);

        try {
           const logsRes = await axios.get(`${apiUrl}/refuel/vehicle/${id}`);
           setLogs(logsRes.data);
        } catch {
           setLogs([]); 
        }
      } catch (err) {
        console.error("Error fetching vehicle details:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) fetchData();
  }, [id, refreshTrigger]);

  if (isLoading || !vehicle) return <div className="p-20 text-center animate-pulse font-black uppercase tracking-widest text-zinc-400">Loading Data...</div>;

  const currentOdometer = logs.length > 0 
    ? Math.max(...logs.map(l => l.odometer)) 
    : (vehicle.startingOdometer ?? 0);

  const totalSpent = logs.reduce((sum, log) => sum + log.totalCost, 0);

  const totalVolume = logs.reduce((sum, log) => sum + log.volume, 0);
  const distanceTraveled = currentOdometer - (vehicle.startingOdometer ?? 0);
  
  const avgEfficiency = totalVolume > 0 
    ? (distanceTraveled / totalVolume).toFixed(1) 
    : "---";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-secondary mb-2 transition-colors font-bold text-xs uppercase tracking-widest group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Garage
          </Link>
          <h2 className="text-4xl font-black text-black tracking-tighter uppercase">{vehicle.nickname}</h2>
          <p className="text-zinc-500 font-bold">{vehicle.year} {vehicle.make} {vehicle.model} • {vehicle.licensePlate}</p>
        </div>
        
        <button 
          onClick={() => onOpenRefuelModal && onOpenRefuelModal(vehicle.id)}
          className="bg-secondary text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center gap-2"
        >
          <Fuel className="w-4 h-4" /> New Log
        </button>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-4">Avg Efficiency</span>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-black text-black">{avgEfficiency} <span className="text-lg text-zinc-400 font-medium">km/L</span></span>
            {avgEfficiency !== "---" && (
              <span className="text-green-600 font-bold flex items-center text-sm mb-1 bg-green-50 px-2 py-1 rounded-lg">
                <ArrowUp className="w-4 h-4 mr-1" /> Active
              </span>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between group">
          <div className="flex justify-between items-center mb-4">
            <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest">Total Spent</span>
            <div className="flex items-center text-zinc-400 hover:text-black transition-colors cursor-pointer">
              <Filter className="w-3 h-3 mr-1" />
              <select 
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="text-xs font-bold bg-transparent outline-none cursor-pointer appearance-none text-inherit"
              >
                <option value="All Time">All Time</option>
                <option value="6 Months">Last 6 Months</option>
                <option value="30 Days">Last 30 Days</option>
              </select>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-black text-black">₱{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-zinc-400 text-sm font-medium mb-1">Total</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-4">Current Odometer</span>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-black text-black">
              {currentOdometer.toLocaleString()}
            </span>
            <span className="text-zinc-400 text-sm font-medium mb-1">km</span>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-secondary" />
          <h3 className="text-xl font-black uppercase tracking-tight">Recent Activity</h3>
        </div>
        
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-6 py-4 font-black text-[10px] text-zinc-500 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 font-black text-[10px] text-zinc-500 uppercase tracking-widest">Odometer</th>
                  <th className="px-6 py-4 font-black text-[10px] text-zinc-500 uppercase tracking-widest">Volume / Cost</th>
                  <th className="px-6 py-4 font-black text-[10px] text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                
                {logs.length === 0 ? (
                  <tr>
                     <td colSpan={4} className="px-6 py-8 text-center text-zinc-500 font-bold">No fuel logs found for this vehicle.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-sm text-black">{new Date(log.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-zinc-600 text-sm font-medium">{log.odometer.toLocaleString()} km</td>
                      <td className="px-6 py-4 text-zinc-600 text-sm">
                        <span className="font-bold text-black">{log.volume} L</span> <span className="text-zinc-400">/ ₱{log.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button className="p-2 text-zinc-400 hover:text-secondary transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
                
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-between bg-zinc-50/50">
            <span className="text-zinc-500 text-sm font-bold">Showing {logs.length} logs</span>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
