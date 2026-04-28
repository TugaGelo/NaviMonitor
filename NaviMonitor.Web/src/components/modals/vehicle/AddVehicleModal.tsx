import { useState } from 'react';
import axios from 'axios';
import { PlusCircle, Car, Bike, Save } from 'lucide-react';
import BaseModal from '../../ui/BaseModal';
import type { Vehicle } from '../../../types/types';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicleToEdit?: Vehicle | null;
}

export default function AddVehicleModal({ isOpen, onClose, onSuccess, vehicleToEdit }: AddVehicleModalProps) {
  const isEditMode = !!vehicleToEdit;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nickname: vehicleToEdit?.nickname || '',
    vehicleType: vehicleToEdit?.vehicleType || 'Car',
    make: vehicleToEdit?.make || '',
    model: vehicleToEdit?.model || '',
    year: vehicleToEdit?.year || new Date().getFullYear(),
    color: vehicleToEdit?.color || '',
    engineSizeCC: vehicleToEdit?.engineSizeCC?.toString() || '',
    startingOdometer: vehicleToEdit?.startingOdometer?.toString() || '',
    licensePlate: vehicleToEdit?.licensePlate || '',
    registrationExpiry: vehicleToEdit?.registrationExpiry ? vehicleToEdit.registrationExpiry.split('T')[0] : ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:7041/api';
      const payload = {
        ...formData,
        year: Number(formData.year),
        engineSizeCC: Number(formData.engineSizeCC) || 0,
        startingOdometer: Number(formData.startingOdometer) || 0,
        registrationExpiry: formData.registrationExpiry ? new Date(formData.registrationExpiry).toISOString() : null
      };

      if (isEditMode && vehicleToEdit) {
        await axios.put(`${apiUrl}/vehicle/${vehicleToEdit.id}`, { id: vehicleToEdit.id, ...payload });
      } else {
        await axios.post(`${apiUrl}/vehicle`, payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.status === 405 ? 'Backend Error 405: Check your Controller PUT method!' : 'Failed to save vehicle.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeToggle = (
    <div className="flex p-1 bg-zinc-100 rounded-xl border border-zinc-200">
      <label className="flex-1 cursor-pointer">
        <input type="radio" name="vehicleType" value="Car" checked={formData.vehicleType === 'Car'} onChange={handleChange} className="hidden peer" />
        <div className="px-5 py-2 flex items-center justify-center gap-2 text-sm font-bold rounded-lg peer-checked:bg-black peer-checked:text-white text-zinc-500 transition-all">
          <Car className="w-4 h-4" /> Car
        </div>
      </label>
      <label className="flex-1 cursor-pointer">
        <input type="radio" name="vehicleType" value="Motorcycle" checked={formData.vehicleType === 'Motorcycle'} onChange={handleChange} className="hidden peer" />
        <div className="px-5 py-2 flex items-center justify-center gap-2 text-sm font-bold rounded-lg peer-checked:bg-black peer-checked:text-white text-zinc-500 transition-all">
          <Bike className="w-4 h-4" /> Bike
        </div>
      </label>
    </div>
  );

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditMode ? "Edit Vehicle" : "Add New Vehicle"} 
      subtitle={isEditMode ? "Update your vehicle's details" : "Register a new asset to your Garage"}
      headerRight={typeToggle}
    >
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-xs font-bold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-black uppercase tracking-wider">Nickname *</label>
                <input required name="nickname" value={formData.nickname} onChange={handleChange} type="text" placeholder="e.g. Red Thunder" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-zinc-300" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black uppercase tracking-wider">Make *</label>
                  <input required name="make" value={formData.make} onChange={handleChange} type="text" placeholder="e.g. Honda" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-zinc-300" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black uppercase tracking-wider">Model *</label>
                  <input required name="model" value={formData.model} onChange={handleChange} type="text" placeholder="e.g. Civic" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-zinc-300" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black uppercase tracking-wider">Year</label>
                  <input name="year" value={formData.year} onChange={handleChange} type="number" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-zinc-300" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black uppercase tracking-wider">Color</label>
                  <input name="color" value={formData.color} onChange={handleChange} type="text" placeholder="e.g. Black" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-zinc-300" />
                </div>
              </div>
            </div>

            <div className="space-y-5">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-black uppercase tracking-wider">Engine Capacity (CC)</label>
                <div className="relative">
                  <input name="engineSizeCC" value={formData.engineSizeCC} onChange={handleChange} type="number" placeholder="e.g. 1500" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-4 pr-12 text-sm font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-zinc-300" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">CC</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black uppercase tracking-wider">Plate *</label>
                  <input required name="licensePlate" value={formData.licensePlate} onChange={handleChange} type="text" placeholder="ABC-1234" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-zinc-300 uppercase" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black uppercase tracking-wider whitespace-nowrap">Start Odo</label>
                  <div className="relative">
                    <input name="startingOdometer" value={formData.startingOdometer} onChange={handleChange} type="number" placeholder="0" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-3 pr-10 text-sm font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-zinc-300" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400">km</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-black uppercase tracking-wider">Reg. Expiry</label>
                <input name="registrationExpiry" value={formData.registrationExpiry} onChange={handleChange} type="date" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-black" />
              </div>

            </div>

          </div>
        </div>

        <div className="border-t border-zinc-100 pt-6 px-6 pb-6 bg-zinc-50/50 flex justify-end gap-4 rounded-b-2xl mt-auto">
          <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-black border border-zinc-200 rounded-xl hover:bg-white transition-all">
            Cancel
          </button>
          <button disabled={isSubmitting} type="submit" className="px-6 py-3 font-bold text-white bg-secondary rounded-xl hover:bg-red-600 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20 active:scale-95">
            {isSubmitting ? 'Saving...' : (isEditMode ? <><Save className="w-5 h-5" /> Update Vehicle</> : <><PlusCircle className="w-5 h-5" /> Save Vehicle</>)}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
