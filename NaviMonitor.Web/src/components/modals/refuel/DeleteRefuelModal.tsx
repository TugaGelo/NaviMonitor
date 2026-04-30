import { useState } from 'react';
import api from '../../../lib/api';
import BaseModal from '../../ui/modals/BaseModal';
import DeleteConfirmation from '../../ui/modals/DeleteConfirmation';
import type { RefuelLog } from '../../../types/types';

interface DeleteRefuelModalProps { isOpen: boolean; onClose: () => void; onSuccess: () => void; log: RefuelLog; }

export default function DeleteRefuelModal({ isOpen, onClose, onSuccess, log }: DeleteRefuelModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setIsDeleting(true); setError('');
    try {
      await api.delete(`/refuel/${log.id}`);
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
