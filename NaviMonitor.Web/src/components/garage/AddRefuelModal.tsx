import { useState } from 'react';
import axios from 'axios';
import { X, Fuel, Car, Bike, Truck } from 'lucide-react';
import type { Vehicle } from '../../types/types';

interface AddRefuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicles: Vehicle[];
  preselectedVehicleId?: number | null;
}

export default function AddRefuelModal({ isOpen, onClose, onSuccess, vehicles, preselectedVehicleId }: AddRefuelModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const hideVehiclePicker = !!preselectedVehicleId;

  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    preselectedVehicleId || (vehicles.length > 0 ? vehicles[0].id : null)
  );

  const [formData, setFormData] = useState({
    odometer: '',
    volume: '',
    totalCost: '',
    fuelType: 'Unleaded',
    notes: ''
  });

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
        date: new Date().toISOString(),
        odometer: Number(formData.odometer),
        volume: Number(formData.volume),
        totalCost: Number(formData.totalCost),
        fuelType: formData.fuelType
      };

      await axios.post(`${apiUrl}/refuel`, payload);
      onSuccess();
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data || 'Submission failed. Ensure odometer is higher than the last entry.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const activeVehicle = vehicles.find(v => v.id === selectedVehicleId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100 bg-white">
          <div>
            <h2 className="text-xl font-bold text-black tracking-tight">Quick Refuel Log</h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              {hideVehiclePicker && activeVehicle 
                ? `Record latest fill-up for ${activeVehicle.nickname}.` 
                : 'Record your latest fill-up.'}
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-black transition-colors p-2 rounded-full hover:bg-zinc-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-xs font-bold">
                {error}
              </div>
            )}

            {!hideVehiclePicker && (
              <section className="space-y-2">
                <h3 className="text-xs font-bold text-black uppercase tracking-wider">Select Ride</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x no-scrollbar">
                  {vehicles.map((vehicle) => {
                    const isSelected = selectedVehicleId === vehicle.id;
                    return (
                      <button
                        key={vehicle.id}
                        type="button"
                        onClick={() => setSelectedVehicleId(vehicle.id)}
                        className={`shrink-0 flex items-center gap-3 rounded-lg px-3 py-2 border-2 transition-all snap-start ${
                          isSelected 
                            ? 'bg-zinc-50 border-secondary' 
                            : 'bg-white border-zinc-100 hover:border-zinc-200'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${isSelected ? 'bg-red-100 text-secondary' : 'bg-zinc-100 text-zinc-400'}`}>
                          {vehicle.vehicleType === 'Motorcycle' ? <Bike className="w-4 h-4" /> : vehicle.vehicleType === 'Truck' ? <Truck className="w-4 h-4" /> : <Car className="w-4 h-4" />}
                        </div>
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className={`text-sm font-bold whitespace-nowrap ${isSelected ? 'text-black' : 'text-zinc-600'}`}>
                            {vehicle.nickname}
                          </span>
                          <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded shrink-0 uppercase">
                            {vehicle.licensePlate}
                          </span>
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
                  <input required id="odometer" type="number" value={formData.odometer} onChange={handleChange} className="w-full bg-white border border-zinc-200 rounded-lg py-3 pl-4 pr-12 text-sm font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-zinc-300" placeholder="Enter current mileage" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">km</span>
                </div>
                <p className="text-[10px] font-bold text-zinc-400 absolute -bottom-5 left-0 uppercase">
                  Last recorded: {activeVehicle?.startingOdometer?.toLocaleString() || 0} km
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-black" htmlFor="volume">Fuel Volume</label>
                <div className="relative">
                  <input required id="volume" type="number" step="0.01" value={formData.volume} onChange={handleChange} className="w-full bg-white border border-zinc-200 rounded-lg py-3 pl-4 pr-16 text-sm font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-zinc-300" placeholder="0.00" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">Liters</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-black" htmlFor="totalCost">Total Cost</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">₱</span>
                  <input required id="totalCost" type="number" step="0.01" value={formData.totalCost} onChange={handleChange} className="w-full bg-white border border-zinc-200 rounded-lg py-3 pl-8 pr-4 text-sm font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-zinc-300" placeholder="0.00" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-black mb-2 block">Fuel Type</label>
                <div className="flex flex-wrap gap-2">
                  {['Unleaded', 'Premium', 'Diesel'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({...formData, fuelType: type})}
                      className={`text-xs font-bold px-4 py-2 rounded-full border transition-all ${
                        formData.fuelType === type 
                          ? 'border-black bg-black text-white' 
                          : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="p-6 border-t border-zinc-100 bg-white">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-secondary hover:bg-red-600 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-red-500/10 disabled:opacity-50"
            >
              <Fuel className="w-5 h-5" />
              {isSubmitting ? 'Saving Log...' : 'Save Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
