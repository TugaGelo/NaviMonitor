import { motion } from 'framer-motion';
import { Edit2, Trash2 } from 'lucide-react';
import type { RefuelLog } from '../../../types/types';

interface FuelTableProps {
  logs: RefuelLog[];
  vehicleId: number;
  onEdit?: (vehicleId: number, log: RefuelLog) => void;
  onDelete?: (log: RefuelLog) => void;
}

export default function FuelTable({ logs, vehicleId, onEdit, onDelete }: FuelTableProps) {
  
  const headerStyle = "px-6 py-4 font-black text-[10px] text-zinc-500 uppercase tracking-widest";

  return (
    <motion.table 
      key="fuel-table"
      initial={{ opacity: 0, x: -10 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: 10 }} 
      transition={{ duration: 0.15 }}
      className="w-full text-left border-collapse"
    >
      <thead>
        <tr className="bg-zinc-50/80 border-b border-zinc-200">
          <th className={headerStyle}>Date</th>
          <th className={headerStyle}>Odometer</th>
          <th className={headerStyle}>Volume / Cost</th>
          <th className={`${headerStyle} text-right`}>Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-100">
        {logs.length === 0 ? (
          <tr>
            <td colSpan={4} className="px-6 py-12 text-center text-zinc-400 font-bold text-sm uppercase tracking-widest">
              No fuel records found
            </td>
          </tr>
        ) : (
          logs.map((log) => (
            <tr key={log.id} className="hover:bg-zinc-50/50 transition-colors group">
              <td className="px-6 py-4 font-bold text-sm text-black">{new Date(log.date).toLocaleDateString()}</td>
              <td className="px-6 py-4 text-zinc-600 text-sm font-medium">{log.odometer.toLocaleString()} km</td>
              <td className="px-6 py-4 text-zinc-600 text-sm">
                <span className="font-bold text-black">{log.volume} L</span> <span className="text-zinc-400">/ ₱{log.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onEdit && onEdit(vehicleId, log)} 
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
          ))
        )}
      </tbody>
    </motion.table>
  );
}
