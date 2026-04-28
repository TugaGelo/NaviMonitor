import { useState } from 'react';
import axios from 'axios';
import { AlertTriangle, Trash2 } from 'lucide-react';
import BaseModal from '../../ui/BaseModal';
import type { MaintenanceLog } from '../../../types/types';

interface DeleteMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  log: MaintenanceLog;
}

export default function DeleteMaintenanceModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  log 
}: DeleteMaintenanceModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:7041/api';
      await axios.delete(`${apiUrl}/maintenance/${log.id}`);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error deleting maintenance log:", err);
      alert("Failed to delete the log. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Delete Record"
      maxWidth="max-w-md"
    >
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <h3 className="text-xl font-black text-black uppercase tracking-tight mb-2">Are you sure?</h3>
        <p className="text-zinc-500 font-medium mb-8">
          You are about to delete the <span className="font-bold text-black">{log.serviceType}</span> record from <span className="font-bold text-black">{new Date(log.date).toLocaleDateString()}</span>. This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-4 rounded-xl font-bold text-zinc-500 hover:bg-zinc-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 bg-red-500 text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? "Deleting..." : (
              <>
                <Trash2 className="w-4 h-4" /> Delete Log
              </>
            )}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
