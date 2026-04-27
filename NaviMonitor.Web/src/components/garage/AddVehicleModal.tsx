import { useState } from 'react';
import axios from 'axios';
import { PlusCircle, Calendar, Car, Bike } from 'lucide-react';
import BaseModal from '../ui/BaseModal';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddVehicleModal({ isOpen, onClose, onSuccess }: AddVehicleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nickname: '',
    vehicleType: 'Car',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    engineSizeCC: '',
    startingOdometer: '',
    licensePlate: '',
    registrationExpiry: ''
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

      await axios.post(`${apiUrl}/vehicle`, payload);
      
      onSuccess();
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.title || 'Failed to add vehicle. Check required fields.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Add New Vehicle" 
      subtitle="Register a new asset to your Garage"
    >
      <form onSubmit={handleSubmit} className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm font-bold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-6">
            <div>
              <label className="text-sm font-bold text-black block mb-2">Nickname *</label>
              <input required name="nickname" value={formData.nickname} onChange={handleChange} type="text" placeholder="e.g. Red Thunder" className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all bg-zinc-50" />
            </div>

            <div>
              <label className="text-sm font-bold text-black block mb-2">Vehicle Type *</label>
              <div className="flex p-1 bg-zinc-100 rounded-xl border border-zinc-200">
                <label className="flex-1 cursor-pointer">
                  <input type="radio" name="vehicleType" value="Car" checked={formData.vehicleType === 'Car'} onChange={handleChange} className="hidden peer" />
                  <div className="py-2 flex items-center justify-center gap-2 text-sm font-bold rounded-lg peer-checked:bg-black peer-checked:text-white text-zinc-500 transition-all">
                    <Car className="w-4 h-4" /> Car
                  </div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input type="radio" name="vehicleType" value="Motorcycle" checked={formData.vehicleType === 'Motorcycle'} onChange={handleChange} className="hidden peer" />
                  <div className="py-2 flex items-center justify-center gap-2 text-sm font-bold rounded-lg peer-checked:bg-black peer-checked:text-white text-zinc-500 transition-all">
                    <Bike className="w-4 h-4" /> Bike
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-black block mb-2">Make *</label>
                <input required name="make" value={formData.make} onChange={handleChange} type="text" placeholder="e.g. Honda" className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all bg-zinc-50" />
              </div>
              <div>
                <label className="text-sm font-bold text-black block mb-2">Model *</label>
                <input required name="model" value={formData.model} onChange={handleChange} type="text" placeholder="e.g. Navi" className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all bg-zinc-50" />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-black block mb-2">Year</label>
              <input name="year" value={formData.year} onChange={handleChange} type="number" className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all bg-zinc-50" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-black block mb-2">Color</label>
                <input name="color" value={formData.color} onChange={handleChange} type="text" placeholder="e.g. Black" className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all bg-zinc-50" />
              </div>
              <div>
                <label className="text-sm font-bold text-black block mb-2">Engine (CC)</label>
                <input name="engineSizeCC" value={formData.engineSizeCC} onChange={handleChange} type="number" placeholder="e.g. 1500" className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all bg-zinc-50" />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-black block mb-2">License Plate *</label>
              <input required name="licensePlate" value={formData.licensePlate} onChange={handleChange} type="text" placeholder="ABC-1234" className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all bg-zinc-50 uppercase" />
            </div>

            <div>
              <label className="text-sm font-bold text-black block mb-2">Starting Odometer (km)</label>
              <input name="startingOdometer" value={formData.startingOdometer} onChange={handleChange} type="number" placeholder="0" className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all bg-zinc-50" />
            </div>

            <div>
              <label className="text-sm font-bold text-black block mb-2">Registration Expiry</label>
              <div className="relative">
                <input name="registrationExpiry" value={formData.registrationExpiry} onChange={handleChange} type="date" className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all bg-zinc-50" />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-100 pt-6 mt-8 flex justify-end gap-4">
          <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-black border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all">
            Cancel
          </button>
          <button disabled={isSubmitting} type="submit" className="px-6 py-3 font-bold text-white bg-secondary rounded-xl hover:bg-red-600 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20 active:scale-95">
            {isSubmitting ? 'Saving...' : <><PlusCircle className="w-5 h-5" /> Add Vehicle</>}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
