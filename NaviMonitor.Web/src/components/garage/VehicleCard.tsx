import { Gauge, CalendarDays, ChevronRight, ShieldAlert, Droplet } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Vehicle } from '../../types/types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick: () => void;
}

export default function VehicleCard({ vehicle, onClick }: VehicleCardProps) {
  const isExpiringSoon = vehicle.registrationExpiry && 
    (new Date(vehicle.registrationExpiry).getTime() - new Date().getTime()) / (1000 * 3600 * 24) < 30;

  return (
    <motion.div 
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 group cursor-pointer relative overflow-hidden transition-shadow hover:shadow-lg"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-secondary to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-black text-black leading-none mb-2 group-hover:text-secondary transition-colors">
            {vehicle.nickname}
          </h3>
          <p className="text-zinc-500 font-medium text-sm">
            {vehicle.year} {vehicle.make} {vehicle.model} • {vehicle.color}
          </p>
        </div>
        <span className="bg-zinc-100 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {vehicle.vehicleType}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100">
          <div className="flex items-center gap-2 text-zinc-500 mb-1">
            <Gauge className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Odometer</span>
          </div>
          <p className="font-bold text-lg text-black">
            {vehicle.startingOdometer?.toLocaleString() ?? 0} <span className="text-xs text-zinc-400 font-medium">km</span>
          </p>
        </div>

        <div className={`rounded-xl p-3 border ${isExpiringSoon ? 'bg-red-50 border-red-100' : 'bg-zinc-50 border-zinc-100'}`}>
          <div className={`flex items-center gap-2 mb-1 ${isExpiringSoon ? 'text-secondary' : 'text-zinc-500'}`}>
            {isExpiringSoon ? <ShieldAlert className="w-4 h-4" /> : <CalendarDays className="w-4 h-4" />}
            <span className="text-xs font-semibold uppercase tracking-wider">LTO Reg</span>
          </div>
          <p className={`font-bold text-sm ${isExpiringSoon ? 'text-secondary' : 'text-black'}`}>
            {vehicle.registrationExpiry ? new Date(vehicle.registrationExpiry).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}
          </p>
        </div>

        <div className="col-span-2 bg-zinc-50 rounded-xl p-3 border border-zinc-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-zinc-500">
            <Droplet className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">Last Refuel</span>
          </div>
          <span className="text-sm font-bold text-zinc-400">No logs yet</span>
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
