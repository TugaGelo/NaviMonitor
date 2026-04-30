import { useState } from 'react';
import api from '../../../lib/api';
import { useAuth } from '../../../context/auth/AuthContext';
import { useSettings } from '../../../context/settings/SettingsContext';
import { Wrench, Rocket, Store, Hammer, Phone, Save } from 'lucide-react';
import BaseModal from '../../ui/modals/BaseModal';
import ModalFooter from '../../ui/modals/ModalFooter';
import FormInput from '../../ui/forms/FormInput';
import SegmentedPicker from '../../ui/forms/SegmentedPicker';
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
  isOpen, onClose, onSuccess, vehicles, preselectedVehicleId, logToEdit, currentOdometer 
}: AddMaintenanceModModalProps) {
  
  const { user } = useAuth();
  const { settings } = useSettings();
  const isEditMode = Boolean(logToEdit?.id && logToEdit.id > 0);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<MaintenanceLog>(() => {
    const baseDefaults: Partial<MaintenanceLog> = { 
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

    if (logToEdit) {
      return { 
        ...baseDefaults, 
        ...logToEdit,
        date: logToEdit.date ? new Date(logToEdit.date).toISOString().split('T')[0] : baseDefaults.date 
      } as MaintenanceLog;
    }
    
    return baseDefaults as MaintenanceLog;
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!user) return;

    setIsSubmitting(true); 
    setError('');
    
    try {
      const payload = { ...formData, userId: user.uid };

      if (isEditMode && logToEdit) {
        await api.put(`/maintenance/${logToEdit.id}`, payload);
      } else {
        await api.post(`/maintenance`, payload);
      }
      
      onSuccess(); 
      onClose();
    } catch (err) { 
      console.error("Maintenance submission error:", err);
      setError("Failed to save log. Please check your inputs."); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditMode ? "Edit Record" : "Add Service Log"} 
      subtitle={formData.logType === 'Maintenance' ? "Record professional garage services and checkups." : "Track your custom performance upgrades and mods."}
      headerRight={
        <SegmentedPicker 
          options={[
            { value: 'Maintenance', label: 'Maint', icon: Wrench }, 
            { value: 'Modification', label: 'Mod', icon: Rocket }
          ]} 
          selectedValue={formData.logType} 
          onChange={(v: 'Maintenance' | 'Modification') => setFormData({ ...formData, logType: v })} 
        />
      }    
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="p-6 space-y-6">
          {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-xs font-bold">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            
            <div className="space-y-5">
              <div className="space-y-2">
                <FormInput label="Service / Mod Name *" name="serviceType" value={formData.serviceType} onChange={handleChange} required placeholder="e.g. Changed Oil" />
                <div className="flex flex-wrap gap-2 pt-1">
                  {(settings?.serviceTypes || ["Oil Change", "Brakes", "Tire Swap"]).map(t => (
                    <button key={t} type="button" onClick={() => setFormData(prev => ({ ...prev, serviceType: t }))} className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg border transition-all ${formData.serviceType === t ? 'border-black bg-black text-white' : 'border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-zinc-300 hover:bg-white'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="Date *" name="date" type="date" value={formData.date} onChange={handleChange} required />
                <FormInput label="Odometer *" name="odometer" type="number" unit={settings?.distanceUnit || 'km'} value={formData.odometer || ''} onChange={handleChange} required placeholder="0" />
              </div>
              <FormInput label="Total Price (₱)" name="price" type="number" icon={<span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">₱</span>} value={formData.price || ''} onChange={handleChange} placeholder="0.00" inputClassName="pl-8" />
            </div>

            <div className="space-y-5 flex flex-col h-full">
              <SegmentedPicker 
                label="Service Mode" 
                options={[
                  { value: false, label: 'Professional', icon: Store }, 
                  { value: true, label: 'DIY Service', icon: Hammer }
                ]} 
                selectedValue={formData.isDIY} 
                onChange={(v) => setFormData({ ...formData, isDIY: v, shopName: '', mechanicName: '', contactNumber: '' })} 
              />
              
              {!formData.isDIY && (
                <>
                  <FormInput label="Shop Name" name="shopName" value={formData.shopName || ''} onChange={handleChange} placeholder="e.g. Honda Center" />
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput label="Mechanic" name="mechanicName" value={formData.mechanicName || ''} onChange={handleChange} placeholder="Name" />
                    <FormInput label="Phone" name="contactNumber" type="tel" icon={<Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />} value={formData.contactNumber || ''} onChange={handleChange} placeholder="09123..." inputClassName="pl-9" />
                  </div>
                </>
              )}

              <div className="space-y-1 flex-1 flex flex-col">
                <label className="text-xs font-bold text-black uppercase tracking-wider">Notes & Findings</label>
                <textarea name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Write details about the parts used..." className="flex-1 min-h-20 w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-zinc-300 resize-none custom-scrollbar" />
              </div>
            </div>

          </div>
        </div>
        <ModalFooter onClose={onClose} isSubmitting={isSubmitting} submitLabel="Record" submitIcon={isEditMode ? Save : Wrench} isEditMode={isEditMode} />
      </form>
    </BaseModal>
  );
}
