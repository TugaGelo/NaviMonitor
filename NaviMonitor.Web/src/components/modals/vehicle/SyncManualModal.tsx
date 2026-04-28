import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileImage, X, UploadCloud, AlertCircle, Plus, Save, Trash2 } from 'lucide-react';
import axios from 'axios';
import BaseModal from '../../ui/BaseModal';
import type { MaintenanceMatrixItem } from '../../../types/types';

interface SyncManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicleId: number;
}

type SyncPhase = 'UPLOAD' | 'PROCESSING' | 'REVIEW';

export default function SyncManualModal({ isOpen, onClose, onSuccess, vehicleId }: SyncManualModalProps) {
  const [phase, setPhase] = useState<SyncPhase>('UPLOAD');
  const [files, setFiles] = useState<File[]>([]);
  const [extractedData, setExtractedData] = useState<MaintenanceMatrixItem[]>([]);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:7041/api';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
      setError(''); 
    }
  };

  const removeFile = (index: number) => setFiles(files.filter((_, i) => i !== index));

  const handleAnalyze = async () => {
    if (files.length === 0) return;
    setPhase('PROCESSING');
    setError('');

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const response = await axios.post(`${apiUrl}/maintenance/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.matrix) {
        setExtractedData(response.data.matrix);
        setPhase('REVIEW');
      }
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data?.message : "Failed to analyze images.");
      setPhase('UPLOAD');
    }
  };

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

  const handleFinalSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      await axios.post(`${apiUrl}/maintenance/vehicle/${vehicleId}/matrix`, {
        matrixData: { matrix: extractedData }
      });
      onSuccess();
      onClose();
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : "Failed to save schedule.";
      setError(message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal 
      isOpen={isOpen} onClose={onClose} title="Manual Sync" maxWidth={phase === 'REVIEW' ? 'max-w-5xl' : 'max-w-2xl'}
      subtitle={phase === 'REVIEW' ? "Verify and edit the maintenance schedule Gemini extracted." : "AI-powered maintenance extraction."}
    >
      <div className="p-6">
        <AnimatePresence mode="wait">
          
          {phase === 'UPLOAD' && (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div 
                className="border-2 border-dashed border-zinc-200 rounded-2xl p-12 text-center hover:bg-zinc-50 transition-all cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className="w-10 h-10 text-zinc-300 mx-auto mb-4 group-hover:text-black transition-colors" />
                <h3 className="text-sm font-black uppercase tracking-widest text-black">Upload Manual Pages</h3>
                <input type="file" multiple hidden ref={fileInputRef} onChange={handleFileSelect} />
              </div>
              
              {files.length > 0 && (
                <div className="mt-6 grid grid-cols-4 gap-2">
                  {files.map((file, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-200">
                      <img src={URL.createObjectURL(file)} className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all" />
                      <button onClick={() => removeFile(i)} className="absolute top-1 right-1 bg-black text-white p-1 rounded-full"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 text-secondary rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              <div className="mt-8 flex justify-end gap-3 border-t border-zinc-100 pt-6">
                <button onClick={onClose} className="px-6 py-3 font-bold text-zinc-400 text-xs uppercase tracking-widest">Cancel</button>
                <button onClick={handleAnalyze} disabled={files.length === 0} className="bg-black text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 disabled:opacity-30">
                  <FileImage className="w-4 h-4" /> Analyze Pages
                </button>
              </div>
            </motion.div>
          )}

          {phase === 'PROCESSING' && (
            <motion.div key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
              <div className="w-12 h-12 border-4 border-zinc-100 border-t-black rounded-full animate-spin mx-auto mb-6" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] animate-pulse">Reading Manual...</h3>
            </motion.div>
          )}

          {phase === 'REVIEW' && (
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
                  <button onClick={() => { setPhase('UPLOAD'); setError(''); }} className="px-6 py-3 font-bold text-zinc-400 text-xs uppercase tracking-widest">Restart</button>
                  <button 
                    onClick={handleFinalSave} 
                    disabled={isSaving}
                    className="bg-black text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-black/20 disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Save Schedule</>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BaseModal>
  );
}
