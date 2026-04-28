import { useState } from 'react';
import axios from 'axios';
import { PlusCircle, Car, Bike, Save } from 'lucide-react';
import BaseModal from '../../ui/BaseModal';
import ModalFooter from '../../ui/ModalFooter';
import FormInput from '../../ui/FormInput';
import SegmentedPicker from '../../ui/SegmentedPicker';
import type { Vehicle } from '../../../types/types';

interface AddVehicleModalProps { isOpen: boolean; onClose: () => void; onSuccess: () => void; vehicleToEdit?: Vehicle | null; }

export default function AddVehicleModal({ isOpen, onClose, onSuccess, vehicleToEdit }: AddVehicleModalProps) {
  const isEditMode = !!vehicleToEdit;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nickname: vehicleToEdit?.nickname || '', vehicleType: vehicleToEdit?.vehicleType || 'Car',
    make: vehicleToEdit?.make || '', model: vehicleToEdit?.model || '', year: vehicleToEdit?.year || new Date().getFullYear(),
    color: vehicleToEdit?.color || '', engineSizeCC: vehicleToEdit?.engineSizeCC?.toString() || '',
    startingOdometer: vehicleToEdit?.startingOdometer?.toString() || '', licensePlate: vehicleToEdit?.licensePlate || '',
    registrationExpiry: vehicleToEdit?.registrationExpiry ? vehicleToEdit.registrationExpiry.split('T')[0] : ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:7041/api';
      const payload = { ...formData, year: Number(formData.year), engineSizeCC: Number(formData.engineSizeCC) || 0, startingOdometer: Number(formData.startingOdometer) || 0, registrationExpiry: formData.registrationExpiry ? new Date(formData.registrationExpiry).toISOString() : null };
      if (isEditMode && vehicleToEdit) await axios.put(`${apiUrl}/vehicle/${vehicleToEdit.id}`, { id: vehicleToEdit.id, ...payload });
      else await axios.post(`${apiUrl}/vehicle`, payload);
      onSuccess(); onClose();
      } catch (err) { 
        console.error("Vehicle submission error:", err);
        setError('Failed to save vehicle.'); 
      } finally { 
        setIsSubmitting(false); 
      }
    };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Edit Vehicle" : "Add New Vehicle"} subtitle={isEditMode ? "Update your vehicle's details" : "Register a new asset to your Garage"}
      headerRight={<SegmentedPicker options={[{ value: 'Car', label: 'Car', icon: Car }, { value: 'Motorcycle', label: 'Bike', icon: Bike }]} selectedValue={formData.vehicleType} onChange={(v) => setFormData({ ...formData, vehicleType: v })} />}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="p-6 space-y-6">
          {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-xs font-bold">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <div className="space-y-5">
              <FormInput label="Nickname *" name="nickname" value={formData.nickname} onChange={handleChange} required placeholder="e.g. Red Thunder" />
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="Make *" name="make" value={formData.make} onChange={handleChange} required placeholder="Honda" />
                <FormInput label="Model *" name="model" value={formData.model} onChange={handleChange} required placeholder="Civic" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="Year" name="year" type="number" value={formData.year} onChange={handleChange} />
                <FormInput label="Color" name="color" value={formData.color} onChange={handleChange} placeholder="Black" />
              </div>
            </div>
            <div className="space-y-5">
              <FormInput label="Engine Capacity (CC)" name="engineSizeCC" type="number" unit="CC" value={formData.engineSizeCC} onChange={handleChange} placeholder="1500" />
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="Plate *" name="licensePlate" value={formData.licensePlate} onChange={handleChange} required placeholder="ABC-1234" inputClassName="uppercase" />
                <FormInput label="Start Odo" name="startingOdometer" type="number" unit="km" value={formData.startingOdometer} onChange={handleChange} placeholder="0" />
              </div>
              <FormInput label="Reg. Expiry" name="registrationExpiry" type="date" value={formData.registrationExpiry} onChange={handleChange} />
            </div>
          </div>
        </div>
        <ModalFooter onClose={onClose} isSubmitting={isSubmitting} submitLabel="Vehicle" submitIcon={isEditMode ? Save : PlusCircle} isEditMode={isEditMode} />
      </form>
    </BaseModal>
  );
}
