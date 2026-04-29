import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import BaseModal from '../../ui/modals/BaseModal';
import UploadPhase from './UploadPhase';
import ReviewPhase from './ReviewPhase';
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
  
  const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:7041/api';

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
            <UploadPhase 
              files={files} 
              setFiles={setFiles} 
              error={error} 
              setError={setError} 
              onClose={onClose} 
              onAnalyze={handleAnalyze} 
            />
          )}

          {phase === 'PROCESSING' && (
            <motion.div key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
              <div className="w-12 h-12 border-4 border-zinc-100 border-t-black rounded-full animate-spin mx-auto mb-6" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] animate-pulse">Reading Manual...</h3>
            </motion.div>
          )}

          {phase === 'REVIEW' && (
            <ReviewPhase 
              extractedData={extractedData} 
              setExtractedData={setExtractedData} 
              error={error} 
              isSaving={isSaving} 
              onRestart={() => { setPhase('UPLOAD'); setError(''); }} 
              onSave={handleFinalSave} 
            />
          )}

        </AnimatePresence>
      </div>
    </BaseModal>
  );
}
