import { useState } from 'react';
import axios from 'axios';
import BaseModal from '../../ui/BaseModal';
import DeleteConfirmation from '../../ui/DeleteConfirmation';
import type { MaintenanceLog } from '../../../types/types';

interface DeleteMaintenanceModalProps { isOpen: boolean; onClose: () => void; onSuccess: () => void; log: MaintenanceLog; }

export default function DeleteMaintenanceModal({ isOpen, onClose, onSuccess, log }: DeleteMaintenanceModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setIsDeleting(true); setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:7041/api';
      await axios.delete(`${apiUrl}/maintenance/${log.id}`);
      onSuccess(); onClose();
    } catch (err) {
      console.error("Error deleting maintenance log:", err); setError("Failed to delete the log. Please try again.");
    } finally { setIsDeleting(false); }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Delete Record" maxWidth="max-w-md">
      <DeleteConfirmation 
        itemName={`${log.serviceType} • ${new Date(log.date).toLocaleDateString()}`}
        warningText="This action cannot be undone. You are about to permanently delete the record:"
        isDeleting={isDeleting}
        onCancel={onClose}
        onConfirm={handleDelete}
        error={error}
      />
    </BaseModal>
  );
}
