import { useState, useEffect } from 'react';
import { Gauge, CalendarDays, ChevronRight, ShieldAlert, Droplet, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Vehicle, RefuelLog } from '../../../types/types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicleId: number) => void;
  refreshTrigger?: number;
}

export default function VehicleCard({ vehicle, onEdit, onDelete, refreshTrigger }: VehicleCardProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [latestLog, setLatestLog] = useState<RefuelLog | null>(null);

  useEffect(() => {
    const fetchLatestLog = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:7041/api';
        const response = await axios.get(`${apiUrl}/refuel/vehicle/${vehicle.id}`);
        const logs = response.data;
        if (logs && logs.length > 0) {
          setLatestLog(logs[0]);
        }
      } catch (err) {
        console.error(err);      
      }
    };
    fetchLatestLog();
  }, [vehicle.id, refreshTrigger]);

  const isExpiringSoon = vehicle.registrationExpiry && 
    (new Date(vehicle.registrationExpiry).getTime() - new Date().getTime()) / (1000 * 3600 * 24) < 30;

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onEdit(vehicle);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onDelete(vehicle.id);
  };

  const displayOdometer = latestLog ? latestLog.odometer : (vehicle.startingOdometer ?? 0);
  const displayLastRefuel = latestLog 
    ? new Date(latestLog.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }) 
    : 'No logs yet';

  return (
    <motion.div 
      onClick={() => navigate(`/vehicle/${vehicle.id}`)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 group cursor-pointer relative overflow-hidden transition-shadow hover:shadow-lg"
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-secondary to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl"></div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-black text-black leading-none mb-2 group-hover:text-secondary transition-colors">
            {vehicle.nickname}
          </h3>
          <p className="text-zinc-500 font-medium text-sm">
            {vehicle.year} {vehicle.make} {vehicle.model} • {vehicle.color}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="bg-zinc-100 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {vehicle.vehicleType}
          </span>
          
          <div className="relative">
            <button 
              onClick={handleMenuClick}
              className="p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-black rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }} />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-40 bg-white border border-zinc-200 shadow-xl rounded-xl overflow-hidden z-50 flex flex-col"
                  >
                    <button onClick={handleEdit} className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition-colors w-full text-left border-b border-zinc-100">
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-secondary hover:bg-red-50 transition-colors w-full text-left">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100">
          <div className="flex items-center gap-2 text-zinc-500 mb-1">
            <Gauge className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Odometer</span>
          </div>
          <p className="font-bold text-lg text-black">
            {displayOdometer.toLocaleString()} <span className="text-xs text-zinc-400 font-medium">km</span>
          </p>
        </div>

        <div className={`rounded-xl p-3 border ${isExpiringSoon ? 'bg-red-50 border-red-100' : 'bg-zinc-50 border-zinc-100'}`}>
          <div className={`flex items-center gap-2 mb-1 ${isExpiringSoon ? 'text-secondary' : 'text-zinc-500'}`}>
            {isExpiringSoon ? <ShieldAlert className="w-4 h-4" /> : <CalendarDays className="w-4 h-4" />}
            <span className="text-xs font-bold uppercase tracking-wider">LTO Reg</span>
          </div>
          <p className={`font-bold text-sm ${isExpiringSoon ? 'text-secondary' : 'text-black'}`}>
            {vehicle.registrationExpiry ? new Date(vehicle.registrationExpiry).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}
          </p>
        </div>

        <div className="col-span-2 bg-zinc-50 rounded-xl p-3 border border-zinc-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-zinc-500">
            <Droplet className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Last Refuel</span>
          </div>
          <span className={`text-sm font-bold ${latestLog ? 'text-black' : 'text-zinc-400'}`}>
            {displayLastRefuel}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center border-t border-zinc-100 pt-4 mt-2">
        <span className="text-sm font-bold text-zinc-400 font-mono tracking-widest">{vehicle.licensePlate || 'NO-PLATE'}</span>
        <div className="flex items-center text-secondary font-bold text-sm group-hover:translate-x-1 transition-transform">
          View Dashboard <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </motion.div>
  );
}
