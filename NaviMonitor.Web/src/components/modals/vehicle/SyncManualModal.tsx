import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileImage, X, UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const handleAnalyze = async () => {
    if (files.length === 0) return;
    setPhase('PROCESSING');
    setError('');

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file); 
    });

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:7041/api';
      
      const response = await axios.post(`${apiUrl}/maintenance/sync-manual/${vehicleId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const parsedData = JSON.parse(response.data.data);
      
      if (parsedData.matrix && Array.isArray(parsedData.matrix)) {
        setExtractedData(parsedData.matrix);
        setPhase('REVIEW');
        
        onSuccess(); 
      } else {
        throw new Error("Invalid format received from AI.");
      }

    } catch (err) {
      console.error("AI Sync Error:", err);
      
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message || "Failed to analyze manual. Ensure the images are clear.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred during sync.");
      }
      
      setPhase('UPLOAD'); 
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Smart Manual Sync" 
      subtitle="Upload pages from your manual to automatically generate a maintenance schedule."
      maxWidth="max-w-3xl"
    >
      <div className="p-6">
        <AnimatePresence mode="wait">
          
          {phase === 'UPLOAD' && (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              
              <div 
                className="border-2 border-dashed border-zinc-300 rounded-2xl p-10 text-center hover:bg-zinc-50 hover:border-zinc-400 transition-all cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="bg-zinc-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8 text-zinc-500" />
                </div>
                <h3 className="text-lg font-bold text-black">Click to upload manual pages</h3>
                <p className="text-zinc-500 mt-2 text-sm">Upload multiple photos of your maintenance tables (JPG, PNG).</p>
                <input 
                  type="file" 
                  multiple 
                  accept="image/png, image/jpeg, image/webp" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                />
              </div>

              {files.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-bold text-sm text-zinc-500 mb-3 uppercase tracking-wider">Selected Pages ({files.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {files.map((file, index) => (
                      <div key={index} className="relative group rounded-xl overflow-hidden border border-zinc-200 aspect-square bg-zinc-100 flex items-center justify-center">
                        <img src={URL.createObjectURL(file)} alt="preview" className="object-cover w-full h-full opacity-80" />
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0"/> {error}
                </div>
              )}

              <div className="mt-8 flex justify-end gap-3">
                <button onClick={onClose} className="px-6 py-3 font-bold text-zinc-500 hover:bg-zinc-100 rounded-xl transition-colors">Cancel</button>
                <button 
                  onClick={handleAnalyze} 
                  disabled={files.length === 0}
                  className="px-6 py-3 font-bold text-white bg-black rounded-xl hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FileImage className="w-5 h-5" /> Analyze {files.length > 0 ? files.length : ''} Pages
                </button>
              </div>
            </motion.div>
          )}

          {phase === 'PROCESSING' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-20 text-center">
              <div className="w-16 h-16 border-4 border-zinc-200 border-t-black rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-2xl font-black uppercase tracking-widest text-black">Gemini is Thinking...</h3>
              <p className="text-zinc-500 mt-2 font-medium">Extracting maintenance intervals from your images. This usually takes 15-30 seconds.</p>
            </motion.div>
          )}

          {phase === 'REVIEW' && (
            <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-10 text-center">
               <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
               <h3 className="text-2xl font-black text-black">Extraction Complete!</h3>
               <p className="text-zinc-500 mb-6">Successfully extracted {extractedData.length} items. We will build the Editable Table here next.</p>
               <button onClick={onClose} className="px-6 py-3 font-bold text-white bg-black rounded-xl hover:bg-zinc-800">Close for now</button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </BaseModal>
  );
}
