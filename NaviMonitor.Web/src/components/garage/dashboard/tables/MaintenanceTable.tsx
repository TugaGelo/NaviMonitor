import { motion } from 'framer-motion';
import { Edit2, Trash2 } from 'lucide-react';
import type { MaintenanceLog } from '../../../../types/types';

interface MaintenanceTableProps {
  logs: MaintenanceLog[];
  vehicleId: number;
  onEdit?: (vehicleId: number, log: MaintenanceLog) => void;
  onDelete?: (log: MaintenanceLog) => void;
}

export default function MaintenanceTable({ logs, vehicleId, onEdit, onDelete }: MaintenanceTableProps) {
  return (
    <motion.table 
      key="maint-table"
      initial={{ opacity: 0, x: 10 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -10 }} 
      transition={{ duration: 0.15 }}
      className="w-full text-left border-collapse"
    >
      <thead>
        <tr className="bg-zinc-50/50 border-b border-zinc-100">
          <th className="px-6 py-4 font-black text-[10px] text-zinc-500 uppercase tracking-widest">Date</th>
          <th className="px-6 py-4 font-black text-[10px] text-zinc-500 uppercase tracking-widest">Type</th>
          <th className="px-6 py-4 font-black text-[10px] text-zinc-500 uppercase tracking-widest">Service / Mod</th>
          <th className="px-6 py-4 font-black text-[10px] text-zinc-500 uppercase tracking-widest">Cost</th>
          <th className="px-6 py-4 font-black text-[10px] text-zinc-500 uppercase tracking-widest text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-100">
        {logs.length === 0 ? (
          <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500 font-bold">No maintenance or mod logs found.</td></tr>
        ) : (
          logs.map((log) => (
            <tr key={log.id} className="hover:bg-zinc-50 transition-colors">
              <td className="px-6 py-4">
                <div className="font-bold text-sm text-black">{new Date(log.date).toLocaleDateString()}</div>
                <div className="text-zinc-400 text-xs font-medium">{log.odometer.toLocaleString()} km</div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${log.logType === 'Modification' ? 'bg-purple-100 text-purple-700' : 'bg-zinc-100 text-zinc-700'}`}>
                  {log.logType === 'Modification' ? '🚀 Mod' : '🔧 Maint'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="font-bold text-sm text-black">{log.serviceType}</div>
                {log.serviceCategory && <div className="text-zinc-400 text-xs font-medium mt-0.5">{log.serviceCategory}</div>}
              </td>
              <td className="px-6 py-4 font-bold text-sm text-black">
                ₱{log.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
