import { motion } from 'framer-motion';
import { Edit2, Trash2, Gauge } from 'lucide-react';
import { useSettings } from '../../../context/settings/SettingsContext';
import type { RefuelLog, Vehicle } from '../../../types/types';

interface FuelTableProps {
  logs: RefuelLog[];
  vehicles?: Vehicle[];
  showVehicle?: boolean;
  onEdit?: (vehicleId: number, log: RefuelLog) => void;
  onDelete?: (log: RefuelLog) => void;
}

export default function FuelTable({ logs, vehicles, showVehicle, onEdit, onDelete }: FuelTableProps) {
  const { settings } = useSettings();
  const headerStyle = "px-6 py-4 font-black text-[10px] text-zinc-500 uppercase tracking-widest whitespace-nowrap";

  return (
    <div className="overflow-x-auto w-full">
      <motion.table 
        key="fuel-table"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        transition={{ duration: 0.15 }}
        className="w-full text-left border-collapse"
      >
        <thead>
          <tr className="bg-zinc-50/80 border-b border-zinc-200">
            <th className={headerStyle}>Date & Odo</th>
            {showVehicle && <th className={headerStyle}>Asset</th>}
            <th className={headerStyle}>Volume</th>
            <th className={headerStyle}>Cost</th>
            <th className={`${headerStyle} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {logs.length === 0 ? (
            <tr>
              <td colSpan={showVehicle ? 5 : 4} className="px-6 py-12 text-center text-zinc-400 font-bold text-sm uppercase tracking-widest">
                No fuel records found
              </td>
            </tr>
          ) : (
            logs.map((log) => {
              const vehicle = vehicles?.find(v => v.id === log.vehicleId);
              
              // Dynamic Unit Calculations
              const displayOdo = settings?.distanceUnit === 'mi' ? log.odometer * 0.621371 : log.odometer;
              const displayVol = settings?.volumeUnit === 'gal' ? log.volume * 0.264172 : log.volume;
              const distLabel = settings?.distanceUnit || 'km';
              const volLabel = settings?.volumeUnit === 'gal' ? 'gal' : 'L';

              return (
                <tr key={log.id} className="hover:bg-zinc-50/50 transition-colors group">
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-sm text-black">{new Date(log.date).toLocaleDateString()}</div>
                    <div className="flex items-center gap-1 text-zinc-400 text-[10px] font-bold uppercase mt-0.5">
                      <Gauge className="w-3 h-3" /> {displayOdo.toLocaleString(undefined, { maximumFractionDigits: 0 })} {distLabel}
                    </div>
                  </td>

                  {showVehicle && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-1 bg-zinc-100 text-zinc-600 text-[10px] font-black uppercase tracking-widest rounded-md">
                        {vehicle ? vehicle.nickname : `ID: ${log.vehicleId}`}
                      </span>
                    </td>
                  )}

                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="font-bold text-black">{displayVol.toFixed(2)}</span>
                    <span className="text-zinc-400 ml-1 font-bold">{volLabel}</span>
                  </td>
                  
                  <td className="px-6 py-4 font-black text-sm text-black whitespace-nowrap">
                    ₱{log.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onEdit && onEdit(log.vehicleId, log)} 
                        className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete && onDelete(log)} 
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
      </motion.table>
    </div>
  );
}
