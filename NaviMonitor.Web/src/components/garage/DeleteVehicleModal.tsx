import { useState } from 'react';
import axios from 'axios';
import { AlertTriangle, Trash2 } from 'lucide-react';
import BaseModal from '../ui/BaseModal';
import type { Vehicle } from '../../types/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicle: Vehicle | null;
}

export default function DeleteVehicleModal({ isOpen, onClose, onSuccess, vehicle }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!vehicle) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:7041/api';
      await axios.delete(`${apiUrl}/vehicle/${vehicle.id}`);
      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to delete vehicle.');
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Delete Vehicle">
      <div className="p-6 space-y-6"> 
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex gap-3 items-start border border-red-100">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold mb-1">Warning: This action cannot be undone.</p>
            <p>Are you sure you want to permanently delete <strong>{vehicle.nickname}</strong>?</p>
          </div>
        </div>

        {error && <div className="text-red-500 text-sm font-bold text-center">{error}</div>}

        <div className="flex gap-4 pt-4 border-t border-zinc-100">
          <button type="button" onClick={onClose} className="flex-1 px-6 py-3 font-bold text-black border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={isDeleting} className="flex-1 px-6 py-3 font-bold text-white bg-secondary rounded-xl hover:bg-red-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 active:scale-95">
            {isDeleting ? 'Deleting...' : <><Trash2 className="w-5 h-5" /> Yes, Delete</>}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
