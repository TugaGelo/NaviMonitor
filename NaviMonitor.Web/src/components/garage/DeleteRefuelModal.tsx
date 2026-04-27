import { useState } from 'react';
import axios from 'axios';
import { AlertTriangle, Trash2 } from 'lucide-react';
import BaseModal from '../ui/BaseModal';
import type { RefuelLog } from '../../types/types';

interface DeleteRefuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  log: RefuelLog;
}

export default function DeleteRefuelModal({ isOpen, onClose, onSuccess, log }: DeleteRefuelModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:7041/api';
      await axios.delete(`${apiUrl}/refuel/${log.id}`);
      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to delete log. Please try again.');
      console.error(err)
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Refuel Log"
      maxWidth="max-w-md"
    >
      <div className="p-6">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg">{error}</div>}
        
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="w-16 h-16 bg-red-50 text-secondary rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-black">Are you absolutely sure?</h3>
            <p className="text-sm text-zinc-500 mt-2">
              This will permanently delete the log for <span className="font-bold text-black">{log.odometer} km</span> and recalculate your dashboard statistics.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 font-bold text-black bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-all">
            Cancel
          </button>
          <button 
            onClick={handleDelete} 
            disabled={isDeleting}
            className="flex-1 py-3 font-bold text-white bg-secondary hover:bg-red-600 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5" />
            {isDeleting ? 'Deleting...' : 'Delete Log'}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
