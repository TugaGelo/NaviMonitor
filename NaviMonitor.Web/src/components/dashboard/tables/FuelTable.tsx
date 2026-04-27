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
        <tr className="bg-zinc-50/50 border-b border-zinc-100">
          <th className="px-6 py-4 font-black text-[10px] text-zinc-500 uppercase tracking-widest">Date</th>
          <th className="px-6 py-4 font-black text-[10px] text-zinc-500 uppercase tracking-widest">Odometer</th>
          <th className="px-6 py-4 font-black text-[10px] text-zinc-500 uppercase tracking-widest">Volume / Cost</th>
          <th className="px-6 py-4 font-black text-[10px] text-zinc-500 uppercase tracking-widest text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-100">
        {logs.length === 0 ? (
          <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-500 font-bold">No fuel logs found for this vehicle.</td></tr>
        ) : (
          logs.map((log) => (
            <tr key={log.id} className="hover:bg-zinc-50 transition-colors">
              <td className="px-6 py-4 font-bold text-sm text-black">{new Date(log.date).toLocaleDateString()}</td>
              <td className="px-6 py-4 text-zinc-600 text-sm font-medium">{log.odometer.toLocaleString()} km</td>
              <td className="px-6 py-4 text-zinc-600 text-sm">
                <span className="font-bold text-black">{log.volume} L</span> <span className="text-zinc-400">/ ₱{log.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </td>
              <td className="px-6 py-4 text-right flex justify-end gap-2">
                <button 
                  onClick={() => onEdit && onEdit(vehicleId, log)} 
                  className="p-2 text-zinc-400 hover:text-black transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onDelete && onDelete(log)} 
                  className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </motion.table>
  );
}
