import React, { useState } from 'react';
import axios from 'axios';
import { Wrench, Rocket, Store, Hammer, Phone, Plus } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:7041/api';
      if (logToEdit?.id) {
        await axios.put(`${apiUrl}/maintenance/${logToEdit.id}`, formData);
      } else {
        await axios.post(`${apiUrl}/maintenance`, formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving maintenance log:", err);
      alert("Failed to save log. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceTemplates = ["Change Oil", "Tire Swap", "Spark Plug", "Brakes"];

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={logToEdit ? "Edit Log" : "Add Maintenance Log"}
      subtitle={formData.logType === 'Maintenance' ? "Record professional garage services and checkups." : "Track your custom performance upgrades and mods."}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        
        <div className="flex p-1 bg-zinc-100 rounded-lg border border-zinc-200">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, logType: 'Maintenance' }))}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md font-bold text-xs uppercase tracking-widest transition-all ${formData.logType === 'Maintenance' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black'}`}
          >
            <Wrench className="w-4 h-4" /> Maintenance
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, logType: 'Modification' }))}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md font-bold text-xs uppercase tracking-widest transition-all ${formData.logType === 'Modification' ? 'bg-black text-white shadow-sm' : 'text-zinc-500 hover:text-black'}`}
          >
            <Rocket className="w-4 h-4" /> Modification
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-black uppercase tracking-widest">Service Date</label>
            <input 
              type="date" 
              required
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full h-12 px-4 rounded-lg border border-zinc-300 bg-zinc-50 text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors font-medium"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-black uppercase tracking-widest">Odometer Reading (km)</label>
            <input 
              type="number" 
              required
              placeholder="e.g. 45000"
              value={formData.odometer || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, odometer: parseInt(e.target.value) || 0 }))}
              className="w-full h-12 px-4 rounded-lg border border-zinc-300 bg-zinc-50 text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors font-medium"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-black uppercase tracking-widest">Service Type</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {serviceTemplates.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, serviceType: t }))}
                className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${formData.serviceType === t ? 'bg-black text-white border-black' : 'border-zinc-300 bg-zinc-50 text-black hover:bg-zinc-100'}`}
              >
                {t}
              </button>
            ))}
            <div className="relative flex-1 min-w-37.5">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Plus className="h-4 w-4 text-zinc-400" />
              </div>
              <input 
                type="text" 
                placeholder="Custom..."
                required
                value={formData.serviceType}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value }))}
                className="w-full h-9.5 pl-9 pr-4 rounded-full border border-zinc-300 bg-zinc-50 focus:border-black focus:ring-1 focus:ring-black outline-none text-sm font-semibold transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-black uppercase tracking-widest">Total Price (₱)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-zinc-500">₱</span>
              <input 
                type="number" 
                placeholder="0.00"
                value={formData.price || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                className="w-full h-12 pl-10 pr-4 rounded-lg border border-zinc-300 bg-zinc-50 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors font-medium text-black"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-black uppercase tracking-widest hidden md:block">Service Mode</label>
            <div className="flex h-12 p-1 bg-zinc-100 rounded-lg border border-zinc-200">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isDIY: false }))}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md font-semibold text-sm transition-all ${!formData.isDIY ? 'bg-black text-white shadow-sm' : 'text-zinc-500 hover:text-black'}`}
              >
                <Store className="w-4 h-4" /> Professional
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isDIY: true, shopName: '', mechanicName: '', contactNumber: '' }))}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md font-semibold text-sm transition-all ${formData.isDIY ? 'bg-black text-white shadow-sm' : 'text-zinc-500 hover:text-black'}`}
              >
                <Hammer className="w-4 h-4" /> DIY Service
              </button>
            </div>
          </div>
        </div>

        {!formData.isDIY && <hr className="border-zinc-200" />}

        {!formData.isDIY && (
          <div className="flex flex-col gap-6 bg-zinc-50/50 p-6 rounded-xl border border-zinc-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-black uppercase tracking-widest">Shop Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Honda QC"
                  value={formData.shopName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, shopName: e.target.value }))}
                  className="w-full h-12 px-4 rounded-lg border border-zinc-300 bg-white focus:border-black outline-none font-medium text-black"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-black uppercase tracking-widest">Mechanic Name</label>
                <input 
                  type="text" 
                  placeholder="Name of mechanic"
                  value={formData.mechanicName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, mechanicName: e.target.value }))}
                  className="w-full h-12 px-4 rounded-lg border border-zinc-300 bg-white focus:border-black outline-none font-medium text-black"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-black uppercase tracking-widest">Contact Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="tel" 
                  placeholder="e.g. +63 917 123 4567"
                  value={formData.contactNumber || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                  className="w-full h-12 pl-12 pr-4 rounded-lg border border-zinc-300 bg-white focus:border-black outline-none font-medium text-black"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-black uppercase tracking-widest">Notes</label>
          <textarea 
            rows={3}
            placeholder="Write details about the parts used or findings..."
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full p-4 rounded-lg border border-zinc-300 bg-zinc-50 focus:border-black focus:ring-1 focus:ring-black outline-none font-medium text-sm resize-none custom-scrollbar"
          />
        </div>

        <div className="pt-2 flex justify-end gap-3 border-t border-zinc-100 mt-6">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-3 rounded-lg font-bold text-sm text-zinc-500 hover:bg-zinc-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-lg bg-secondary text-white font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? "Saving..." : (
              <>
                <Wrench className="w-4 h-4" /> Save Service Log
              </>
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
