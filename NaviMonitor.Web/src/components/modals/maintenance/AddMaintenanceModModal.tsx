import { useState } from 'react';
import axios from 'axios';
import { Wrench, Rocket, Store, Hammer, Phone, Save } from 'lucide-react';
import BaseModal from '../../ui/BaseModal';
import type { MaintenanceLog, Vehicle } from '../../../types/types';

interface AddMaintenanceModModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicles: Vehicle[];
  preselectedVehicleId?: number | null;
  logToEdit?: MaintenanceLog | null;
  currentOdometer?: number;
}

export default function AddMaintenanceModModal({
  isOpen,
  onClose,
  onSuccess,
  vehicles,
  preselectedVehicleId,
  logToEdit,
  currentOdometer
}: AddMaintenanceModModalProps) {
  const isEditMode = !!logToEdit;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<MaintenanceLog>(() => {
    if (logToEdit) {
      return {
        ...logToEdit,
        date: new Date(logToEdit.date).toISOString().split('T')[0]
      };
    }
    return {
      vehicleId: preselectedVehicleId || (vehicles.length > 0 ? vehicles[0].id : 0),
      logType: 'Maintenance',
      date: new Date().toISOString().split('T')[0],
      odometer: currentOdometer || 0,
      serviceType: '',
      serviceCategory: 'General',
      price: 0,
      isDIY: false,
      notes: '',
      shopName: '',
      mechanicName: '',
      contactNumber: ''
    };
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:7041/api';
      if (isEditMode && logToEdit) {
        await axios.put(`${apiUrl}/maintenance/${logToEdit.id}`, formData);
      } else {
        await axios.post(`${apiUrl}/maintenance`, formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving maintenance log:", err);
      setError("Failed to save log. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceTemplates = ["Change Oil", "Tire Swap", "Spark Plug", "Brakes", "Suspension", "Exhaust"];

  const logTypeToggle = (
    <div className="flex p-1 bg-zinc-100 rounded-xl border border-zinc-200">
      <label className="flex-1 cursor-pointer">
        <input type="radio" name="logType" value="Maintenance" checked={formData.logType === 'Maintenance'} onChange={() => setFormData(prev => ({ ...prev, logType: 'Maintenance' }))} className="hidden peer" />
        <div className="px-4 py-2 flex items-center justify-center gap-2 text-sm font-bold rounded-lg peer-checked:bg-black peer-checked:text-white text-zinc-500 transition-all">
          <Wrench className="w-4 h-4" /> <span className="hidden sm:inline">Maintenance</span><span className="sm:hidden">Maint</span>
        </div>
      </label>
      <label className="flex-1 cursor-pointer">
        <input type="radio" name="logType" value="Modification" checked={formData.logType === 'Modification'} onChange={() => setFormData(prev => ({ ...prev, logType: 'Modification' }))} className="hidden peer" />
        <div className="px-4 py-2 flex items-center justify-center gap-2 text-sm font-bold rounded-lg peer-checked:bg-black peer-checked:text-white text-zinc-500 transition-all">
          <Rocket className="w-4 h-4" /> <span className="hidden sm:inline">Modification</span><span className="sm:hidden">Mod</span>
        </div>
      </label>
    </div>
  );

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditMode ? "Edit Record" : "Add Service Log"}
      subtitle={formData.logType === 'Maintenance' ? "Record professional garage services and checkups." : "Track your custom performance upgrades and mods."}
      headerRight={logTypeToggle}
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
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-black uppercase tracking-wider">Service / Mod Name *</label>
                <input required name="serviceType" value={formData.serviceType} onChange={handleChange} type="text" placeholder="e.g. Changed Oil, Givi Top Box..." className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-zinc-300" />
                
                <div className="flex flex-wrap gap-2 pt-1">
                  {serviceTemplates.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, serviceType: t }))}
                      className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg border transition-all ${formData.serviceType === t ? 'border-black bg-black text-white' : 'border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-zinc-300 hover:bg-white'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black uppercase tracking-wider">Date *</label>
                  <input required name="date" value={formData.date} onChange={handleChange} type="date" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black uppercase tracking-wider">Odometer *</label>
                  <div className="relative">
                    <input required name="odometer" value={formData.odometer || ''} onChange={handleChange} type="number" placeholder="0" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-4 pr-10 text-sm font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-zinc-300" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400">km</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-black uppercase tracking-wider">Total Price (₱)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">₱</span>
                  <input name="price" value={formData.price || ''} onChange={handleChange} type="number" placeholder="0.00" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-8 pr-4 text-sm font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-zinc-300" />
                </div>
              </div>
            </div>

            <div className="space-y-5 flex flex-col h-full">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-black uppercase tracking-wider">Service Mode</label>
                <div className="flex p-1 bg-zinc-100 rounded-xl border border-zinc-200">
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" name="isDIY" checked={!formData.isDIY} onChange={() => setFormData(prev => ({ ...prev, isDIY: false }))} className="hidden peer" />
                    <div className="py-2 flex items-center justify-center gap-2 text-sm font-bold rounded-lg peer-checked:bg-black peer-checked:text-white text-zinc-500 transition-all">
                      <Store className="w-4 h-4" /> Professional
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" name="isDIY" checked={formData.isDIY} onChange={() => setFormData(prev => ({ ...prev, isDIY: true, shopName: '', mechanicName: '', contactNumber: '' }))} className="hidden peer" />
                    <div className="py-2 flex items-center justify-center gap-2 text-sm font-bold rounded-lg peer-checked:bg-black peer-checked:text-white text-zinc-500 transition-all">
                      <Hammer className="w-4 h-4" /> DIY Service
                    </div>
                  </label>
                </div>
              </div>

              {!formData.isDIY && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-black uppercase tracking-wider">Shop Name</label>
                    <input name="shopName" value={formData.shopName || ''} onChange={handleChange} type="text" placeholder="e.g. Honda Center" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-zinc-300" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-black uppercase tracking-wider">Mechanic</label>
                      <input name="mechanicName" value={formData.mechanicName || ''} onChange={handleChange} type="text" placeholder="Name" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-zinc-300" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-black uppercase tracking-wider">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input name="contactNumber" value={formData.contactNumber || ''} onChange={handleChange} type="tel" placeholder="09123..." className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-9 pr-4 text-sm font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-zinc-300" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1 flex-1 flex flex-col">
                <label className="text-xs font-bold text-black uppercase tracking-wider">Notes & Findings</label>
                <textarea 
                  name="notes" 
                  value={formData.notes || ''} 
                  onChange={handleChange} 
                  placeholder="Write details about the parts used or findings..." 
                  className="flex-1 min-h-20 w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-zinc-300 resize-none custom-scrollbar"
                />
              </div>

            </div>

          </div>
        </div>

        <div className="border-t border-zinc-100 pt-6 px-6 pb-6 bg-zinc-50/50 flex justify-end gap-4 rounded-b-2xl mt-auto">
          <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-black border border-zinc-200 rounded-xl hover:bg-white transition-all">
            Cancel
          </button>
          <button disabled={isSubmitting} type="submit" className="px-6 py-3 font-bold text-white bg-secondary rounded-xl hover:bg-red-600 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20 active:scale-95">
            {isSubmitting ? 'Saving...' : (isEditMode ? <><Save className="w-5 h-5" /> Update Record</> : <><Wrench className="w-5 h-5" /> Save Record</>)}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
