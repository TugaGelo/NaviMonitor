import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { FileImage, X, UploadCloud, AlertCircle } from 'lucide-react';

interface UploadPhaseProps {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
  onClose: () => void;
  onAnalyze: () => void;
}

export default function UploadPhase({ files, setFiles, error, setError, onClose, onAnalyze }: UploadPhaseProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
      setError(''); 
    }
  };

  const removeFile = (index: number) => setFiles(files.filter((_, i) => i !== index));

  return (
    <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div 
        className="border-2 border-dashed border-zinc-200 rounded-2xl p-12 text-center hover:bg-zinc-50 transition-all cursor-pointer group"
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud className="w-10 h-10 text-zinc-300 mx-auto mb-4 group-hover:text-black transition-colors" />
        <h3 className="text-sm font-black uppercase tracking-widest text-black">Upload Manual Pages</h3>
        <input type="file" multiple hidden ref={fileInputRef} onChange={handleFileSelect} accept="image/*" />
      </div>
      
      {files.length > 0 && (
        <div className="mt-6 grid grid-cols-4 gap-2">
          {files.map((file, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-200">
              <img src={URL.createObjectURL(file)} className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all" alt="upload preview" />
              <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="absolute top-1 right-1 bg-black text-white p-1 rounded-full">
                <X className="w-3 h-3" />
              </button>
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
        <button 
          onClick={onAnalyze} 
          disabled={files.length === 0} 
          className="bg-black text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 disabled:opacity-30"
        >
          <FileImage className="w-4 h-4" /> Analyze Pages
        </button>
      </div>
    </motion.div>
  );
}
