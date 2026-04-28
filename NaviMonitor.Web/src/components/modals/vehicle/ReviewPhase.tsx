import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Plus, Save, Trash2 } from 'lucide-react';
import type { MaintenanceMatrixItem } from '../../../types/types';

interface ReviewPhaseProps {
  extractedData: MaintenanceMatrixItem[];
  setExtractedData: React.Dispatch<React.SetStateAction<MaintenanceMatrixItem[]>>;
  error: string;
  isSaving: boolean;
  onRestart: () => void;
  onSave: () => void;
}

export default function ReviewPhase({ extractedData, setExtractedData, error, isSaving, onRestart, onSave }: ReviewPhaseProps) {
  
  const handleUpdateItem = (index: number, field: keyof MaintenanceMatrixItem, value: string | number) => {
    const newData = [...extractedData];
    const finalValue = (field === 'initial' && value === '') ? undefined : value;
    newData[index] = { ...newData[index], [field]: finalValue };
    setExtractedData(newData);
  };

  const removeRow = (index: number) => setExtractedData(extractedData.filter((_, i) => i !== index));
  
  const addRow = () => {
    setExtractedData([...extractedData, { item: "New Task", interval: 4000, action: "Inspect" }]);
  };

  return (
    <motion.div key="review" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="bg-zinc-50 rounded-xl border border-zinc-200 overflow-hidden mb-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/50">
              <th className="px-4 py-3 font-black text-[10px] text-zinc-400 uppercase tracking-widest">Maintenance Item</th>
              <th className="px-4 py-3 font-black text-[10px] text-zinc-400 uppercase tracking-widest text-center">Initial (km)</th>
              <th className="px-4 py-3 font-black text-[10px] text-zinc-400 uppercase tracking-widest text-center">Regular (km)</th>
              <th className="px-4 py-3 font-black text-[10px] text-zinc-400 uppercase tracking-widest">Action</th>
              <th className="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {extractedData.map((row, i) => (
              <tr key={i} className="bg-white hover:bg-zinc-50/50 transition-colors group">
                <td className="p-2">
                  <input 
                    value={row.item} 
                    onChange={(e) => handleUpdateItem(i, 'item', e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-black"
                    placeholder="e.g. Engine Oil"
                  />
                </td>
                <td className="p-2 w-28">
                  <input 
                    type="number" 
                    value={row.initial ?? ''} 
                    onChange={(e) => handleUpdateItem(i, 'initial', e.target.value === '' ? '' : parseInt(e.target.value))}
                    className="w-full bg-red-50/30 rounded-lg border-none focus:ring-0 text-sm font-bold text-secondary text-center placeholder:text-zinc-300"
                    placeholder="1000"
                  />
                </td>
                <td className="p-2 w-28">
                  <input 
                    type="number" 
                    value={row.interval} 
                    onChange={(e) => handleUpdateItem(i, 'interval', parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-black text-center"
                  />
                </td>
                <td className="p-2">
                  <select 
                    value={row.action} 
                    onChange={(e) => handleUpdateItem(i, 'action', e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-black appearance-none cursor-pointer"
                  >
                    <option value="Replace">Replace</option>
                    <option value="Inspect">Inspect</option>
                    <option value="Clean">Clean</option>
                  </select>
                </td>
                <td className="p-2 text-right">
                  <button onClick={() => removeRow(i)} className="p-2 text-zinc-300 hover:text-secondary transition-colors"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-secondary rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <button onClick={addRow} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">
          <Plus className="w-4 h-4" /> Add Item
        </button>
        <div className="flex gap-3">
          <button onClick={onRestart} className="px-6 py-3 font-bold text-zinc-400 text-xs uppercase tracking-widest">Restart</button>
          <button 
            onClick={onSave} 
            disabled={isSaving}
            className="bg-black text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-black/20 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Save Schedule</>}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
