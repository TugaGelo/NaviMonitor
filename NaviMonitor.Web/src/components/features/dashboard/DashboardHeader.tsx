import { Plus, Settings, Wrench } from 'lucide-react';
import type { Vehicle } from '../../../types/types';

interface DashboardHeaderProps {
  vehicle: Vehicle;
  currentOdometer: number;
  onOpenRefuel: () => void;
  onOpenMaintenance: () => void;
  onOpenSync: () => void;
}

export default function DashboardHeader({ 
  vehicle, 
  currentOdometer,
  onOpenRefuel,
  onOpenMaintenance,
  onOpenSync
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
      <div>
        <h2 className="text-3xl font-extrabold text-black tracking-tight">{vehicle.nickname}</h2>
        <div className="flex items-center gap-3 mt-1 text-zinc-500 font-medium text-sm">
          <span>{vehicle.make} {vehicle.model} ({vehicle.year})</span>
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
          <span className="font-black text-black uppercase tracking-widest text-[10px] bg-zinc-100 px-2 py-1 rounded">
            ODO: {currentOdometer.toLocaleString()} KM
          </span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 w-full md:w-auto">
        <button 
          onClick={onOpenSync}
          className="flex-1 md:flex-none bg-white border border-zinc-200 text-black px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-50 transition-all active:scale-95 shadow-sm"
        >
          <Settings className="w-4 h-4 text-zinc-400" /> V-Matrix
        </button>

        <button 
          onClick={onOpenMaintenance}
          className="flex-1 md:flex-none bg-black text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all active:scale-95"
        >
          <Wrench className="w-4 h-4" /> Service
        </button>

        <button 
          onClick={onOpenRefuel}
          className="flex-1 md:flex-none bg-secondary text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Fuel Log
        </button>
      </div>
    </div>
  );
}
