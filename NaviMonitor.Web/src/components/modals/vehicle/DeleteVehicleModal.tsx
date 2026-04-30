import { useState } from 'react';
import api from '../../../lib/api';
import BaseModal from '../../ui/modals/BaseModal';
import DeleteConfirmation from '../../ui/modals/DeleteConfirmation';
import type { Vehicle } from '../../../types/types';

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; vehicle: Vehicle | null; }

export default function DeleteVehicleModal({ isOpen, onClose, onSuccess, vehicle }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!vehicle) return null;

  const handleDelete = async () => {
    setIsDeleting(true); setError('');
    try {
      await api.delete(`/vehicle/${vehicle.id}`);
      onSuccess(); onClose();
    } catch (err) {
      console.error(err); setError('Failed to delete vehicle.');
    } finally { setIsDeleting(false); }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Delete Vehicle" maxWidth="max-w-md">
      <DeleteConfirmation 
        itemName={vehicle.nickname}
        isDeleting={isDeleting}
        onCancel={onClose}
        onConfirm={handleDelete}
        error={error}
      />
    </BaseModal>
  );
}
