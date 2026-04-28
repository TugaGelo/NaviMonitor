import { useState, useEffect } from 'react';
import axios from 'axios';
import { Fuel, Car, Bike, Truck, Save } from 'lucide-react';
import BaseModal from '../../ui/BaseModal';
import type { Vehicle, RefuelLog } from '../../../types/types';

interface AddRefuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicles: Vehicle[];
  preselectedVehicleId?: number | null;
  logToEdit?: RefuelLog | null;
}

export default function AddRefuelModal({ isOpen, onClose, onSuccess, vehicles, preselectedVehicleId, logToEdit }: AddRefuelModalProps) {
  const isEditMode = !!logToEdit;
  const hideVehiclePicker = !!preselectedVehicleId;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    preselectedVehicleId || (vehicles.length > 0 ? vehicles[0].id : null)
  );

  const [formData, setFormData] = useState({
    odometer: logToEdit?.odometer?.toString() || '',
    volume: logToEdit?.volume?.toString() || '',
    totalCost: logToEdit?.totalCost?.toString() || '',
    fuelType: logToEdit?.fuelType || 'Unleaded'
  });

  useEffect(() => {
    if (!isOpen || isEditMode || !selectedVehicleId) return;

    let isMounted = true;

    const fetchLatestOdo = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:7041/api';
        const res = await axios.get(`${apiUrl}/refuel/vehicle/${selectedVehicleId}`);
        if (!isMounted) return;

        const logs: RefuelLog[] = res.data;
        const active = vehicles.find(v => v.id === selectedVehicleId);
        
        const highestOdo = logs.length > 0 
          ? Math.max(...logs.map((l: RefuelLog) => l.odometer)) 
          : (active?.startingOdometer || 0);
        
        setFormData(prev => ({ ...prev, odometer: (highestOdo + 1).toString() }));
      } catch {
        if (!isMounted) return;
        const active = vehicles.find(v => v.id === selectedVehicleId);
        setFormData(prev => ({ ...prev, odometer: ((active?.startingOdometer || 0) + 1).toString() }));
      }
    };
    
    fetchLatestOdo();

    return () => { isMounted = false; };
  }, [isOpen, selectedVehicleId, isEditMode, vehicles]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId) return;

    setIsSubmitting(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:7041/api';
      const payload = {
        vehicleId: selectedVehicleId,
        date: isEditMode && logToEdit ? logToEdit.date : new Date().toISOString(),
        odometer: Number(formData.odometer),
        volume: Number(formData.volume),
        totalCost: Number(formData.totalCost),
        fuelType: formData.fuelType
      };

      if (isEditMode && logToEdit) {
        await axios.put(`${apiUrl}/refuel/${logToEdit.id}`, { id: logToEdit.id, ...payload });
      } else {
        await axios.post(`${apiUrl}/refuel`, payload);
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data || 'Submission failed. Check your data.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeVehicle = vehicles.find(v => v.id === selectedVehicleId);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Refuel Log" : "Quick Refuel Log"}
      subtitle={isEditMode ? "Update the details of your previous fill-up." : (hideVehiclePicker && activeVehicle ? `Record latest fill-up for ${activeVehicle.nickname}.` : 'Record your latest fill-up.')}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="p-6 space-y-6">
          {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-xs font-bold">{error}</div>}

          {!hideVehiclePicker && !isEditMode && (
            <section className="space-y-2">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider">Select Ride</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x no-scrollbar">
                {vehicles.map((vehicle) => {
                  const isSelected = selectedVehicleId === vehicle.id;
                  return (
                    <button 
                      key={vehicle.id} 
                      type="button" 
                      onClick={() => {
                        setSelectedVehicleId(vehicle.id);
                        setFormData(prev => ({ ...prev, volume: '', totalCost: '' }));
                      }} 
                      className={`shrink-0 flex items-center gap-3 rounded-lg px-3 py-2 border-2 transition-all snap-start ${isSelected ? 'bg-zinc-50 border-secondary' : 'bg-white border-zinc-100 hover:border-zinc-200'}`}
                    >
                      <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${isSelected ? 'bg-red-100 text-secondary' : 'bg-zinc-100 text-zinc-400'}`}>
                        {vehicle.vehicleType === 'Motorcycle' ? <Bike className="w-4 h-4" /> : vehicle.vehicleType === 'Truck' ? <Truck className="w-4 h-4" /> : <Car className="w-4 h-4" />}
                      </div>
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className={`text-sm font-bold whitespace-nowrap ${isSelected ? 'text-black' : 'text-zinc-600'}`}>{vehicle.nickname}</span>
                        <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded shrink-0 uppercase">{vehicle.licensePlate}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <section className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            <div className="space-y-1 relative">
              <label className="text-xs font-bold text-black" htmlFor="odometer">Odometer Reading</label>
              <div className="relative">
                <input required id="odometer" type="number" value={formData.odometer} onChange={handleChange} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-4 pr-12 text-sm font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-zinc-300" placeholder="Enter current mileage" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">km</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-black" htmlFor="volume">Fuel Volume</label>
              <div className="relative">
                <input required id="volume" type="number" step="0.01" value={formData.volume} onChange={handleChange} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-4 pr-16 text-sm font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-zinc-300" placeholder="0.00" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">Liters</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-black" htmlFor="totalCost">Total Cost</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">₱</span>
                <input required id="totalCost" type="number" step="0.01" value={formData.totalCost} onChange={handleChange} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-8 pr-4 text-sm font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-zinc-300" placeholder="0.00" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-black mb-2 block">Fuel Type</label>
              <div className="flex flex-wrap gap-2">
                {['Unleaded', 'Premium', 'Diesel'].map((type) => (
                  <button key={type} type="button" onClick={() => setFormData({...formData, fuelType: type})} className={`text-xs font-bold px-4 py-2 rounded-full border transition-all ${formData.fuelType === type ? 'border-black bg-black text-white' : 'border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-zinc-300'}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="border-t border-zinc-100 pt-6 px-6 pb-6 bg-zinc-50/50 flex justify-end gap-4 rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-black border border-zinc-200 rounded-xl hover:bg-white transition-all">Cancel</button>
          <button disabled={isSubmitting} type="submit" className="px-6 py-3 font-bold text-white bg-secondary rounded-xl hover:bg-red-600 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20 active:scale-95">
            {isEditMode ? <><Save className="w-5 h-5" /> Update Log</> : <><Fuel className="w-5 h-5" /> Save Log</>}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
