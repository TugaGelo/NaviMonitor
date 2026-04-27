import { Link } from 'react-router-dom';
import { ArrowLeft, Fuel, Wrench } from 'lucide-react';
import type { Vehicle } from '../../../types/types';

interface DashboardHeaderProps {
  vehicle: Vehicle;
  activeTab: 'Fuel' | 'Maintenance';
  onOpenRefuelModal?: (vehicleId: number) => void;
  onOpenMaintenanceModal?: (vehicleId: number) => void;
}

export default function DashboardHeader({ 
  vehicle, 
  activeTab, 
  onOpenRefuelModal, 
  onOpenMaintenanceModal 
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-secondary mb-2 transition-colors font-bold text-xs uppercase tracking-widest group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Garage
        </Link>
        <h2 className="text-4xl font-black text-black tracking-tighter uppercase">{vehicle.nickname}</h2>
        <p className="text-zinc-500 font-bold">{vehicle.year} {vehicle.make} {vehicle.model} • {vehicle.licensePlate}</p>
      </div>
      
      <div className="flex gap-3">
        {activeTab === 'Fuel' ? (
          <button 
            onClick={() => onOpenRefuelModal && onOpenRefuelModal(vehicle.id)}
            className="bg-black text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all active:scale-95 flex items-center gap-2"
          >
            <Fuel className="w-4 h-4" /> New Fuel Log
          </button>
        ) : (
          <button 
            onClick={() => onOpenMaintenanceModal && onOpenMaintenanceModal(vehicle.id)}
            className="bg-secondary text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center gap-2"
          >
            <Wrench className="w-4 h-4" /> Add Maintenance
          </button>
        )}
      </div>
    </div>
  );
}
