import { useState } from 'react';
import axios from 'axios';
import BaseModal from '../../ui/BaseModal';
import DeleteConfirmation from '../../ui/DeleteConfirmation';
import type { RefuelLog } from '../../../types/types';

interface DeleteRefuelModalProps { isOpen: boolean; onClose: () => void; onSuccess: () => void; log: RefuelLog; }

export default function DeleteRefuelModal({ isOpen, onClose, onSuccess, log }: DeleteRefuelModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setIsDeleting(true); setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:7041/api';
      await axios.delete(`${apiUrl}/refuel/${log.id}`);
      onSuccess(); onClose();
    } catch (err) {
      console.error(err); setError('Failed to delete log. Please try again.');
    } finally { setIsDeleting(false); }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Delete Refuel Log" maxWidth="max-w-md">
      <DeleteConfirmation 
        itemName={`${log.odometer} km • ${log.volume} Liters`}
        warningText="This will permanently delete this fuel record and recalculate your dashboard statistics:"
        isDeleting={isDeleting}
        onCancel={onClose}
        onConfirm={handleDelete}
        error={error}
      />
    </BaseModal>
  );
}
