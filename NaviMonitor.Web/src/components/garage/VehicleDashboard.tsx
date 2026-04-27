import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ArrowLeft, Fuel, History, Edit2, ArrowUp, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Vehicle } from '../../types/types';

export default function VehicleDashboard() {
  const { id } = useParams<{ id: string }>(); 
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:7041/api';
        const response = await axios.get(`${apiUrl}/vehicle/${id}`);
        setVehicle(response.data);
      } catch (err) {
        console.error("Error fetching vehicle details:", err);
      }
    };
    if (id) fetchVehicleDetails();
  }, [id]);

  if (!vehicle) return <div className="p-20 text-center animate-pulse font-black uppercase tracking-widest text-zinc-400">Loading Data...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header with real data */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-secondary mb-2 transition-colors font-bold text-xs uppercase tracking-widest group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Garage
          </Link>
          <h2 className="text-4xl font-black text-black tracking-tighter uppercase">{vehicle.nickname}</h2>
          <p className="text-zinc-500 font-bold">{vehicle.year} {vehicle.make} {vehicle.model} • {vehicle.licensePlate}</p>
        </div>
        
        <button className="bg-secondary text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center gap-2">
          <Fuel className="w-4 h-4" /> New Log Entry
        </button>
      </div>

      {/* Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-4">Avg Efficiency</span>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-black text-black">18.4 <span className="text-lg text-zinc-400 font-medium">km/L</span></span>
            <span className="text-green-600 font-bold flex items-center text-sm mb-1 bg-green-50 px-2 py-1 rounded-lg">
              <ArrowUp className="w-4 h-4 mr-1" /> 2.1%
            </span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-4">Total Spent</span>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-black text-black">$1,248</span>
            <span className="text-zinc-400 text-sm font-medium mb-1">Last 6 Months</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-4">Current Odometer</span>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-black text-black">{vehicle.startingOdometer?.toLocaleString() ?? 0}</span>
            <span className="text-zinc-400 text-sm font-medium mb-1">km</span>
          </div>
        </div>
      </section>

      {/* Table Section */}
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
                  <th className="px-6 py-4 font-black text-[10px] text-zinc-500 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 font-black text-[10px] text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <tr className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-sm">Initial Entry</td>
                  <td className="px-6 py-4 text-zinc-600 text-sm">{vehicle.startingOdometer?.toLocaleString()} km</td>
                  <td className="px-6 py-4 text-zinc-600 text-sm">Setup</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-zinc-400 hover:text-secondary transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-between bg-zinc-50/50">
            <span className="text-zinc-500 text-sm font-bold">Showing 1 of 1 logs</span>
            <div className="flex gap-2">
              <button className="p-2 border border-zinc-200 rounded-lg bg-zinc-50 transition-colors opacity-50 cursor-not-allowed">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="p-2 border border-zinc-200 rounded-lg bg-zinc-50 transition-colors opacity-50 cursor-not-allowed">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
