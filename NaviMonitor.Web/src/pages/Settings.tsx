import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../context/settings/SettingsContext';
import { Trash2, GripVertical } from 'lucide-react';

export default function Settings() {
  const { settings, updateSettings, loading } = useSettings();
  const [newFuel, setNewFuel] = useState('');
  const [newService, setNewService] = useState('');

  if (loading || !settings) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 border-4 border-zinc-200 border-t-black rounded-full animate-spin"></div>
        <div className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Compiling Terminal Config...</div>
      </div>
    );
  }

  const handleUpdateUnit = (key: 'distanceUnit' | 'volumeUnit', value: string) => {
    updateSettings({ ...settings, [key]: value });
  };

  const addFuelType = () => {
    if (!newFuel.trim()) return;
    updateSettings({ ...settings, fuelTypes: [...settings.fuelTypes, newFuel.trim()] });
    setNewFuel('');
  };

  const removeFuelType = (index: number) => {
    const updated = settings.fuelTypes.filter((_, i) => i !== index);
    updateSettings({ ...settings, fuelTypes: updated });
  };

  const addServiceType = () => {
    if (!newService.trim()) return;
    updateSettings({ ...settings, serviceTypes: [...settings.serviceTypes, newService.trim()] });
    setNewService('');
  };

  const removeServiceType = (index: number) => {
    const updated = settings.serviceTypes.filter((_, i) => i !== index);
    updateSettings({ ...settings, serviceTypes: updated });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-7xl mx-auto pb-32">
      
      <header className="border-b border-zinc-200 pb-8">
        <h2 className="text-3xl font-extrabold text-black tracking-tight uppercase">Operations & Library</h2>
        <p className="text-zinc-500 font-medium mt-1">Configure global system metrics and manage localized database libraries.</p>
      </header>        
      <section>
        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">System Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <MetricControl 
            label="Distance Unit" 
            value={settings.distanceUnit} 
            options={['km', 'mi']} 
            onChange={(v) => handleUpdateUnit('distanceUnit', v)} 
          />
          <MetricControl 
            label="Volume Unit" 
            value={settings.volumeUnit} 
            options={['L', 'gal']} 
            onChange={(v) => handleUpdateUnit('volumeUnit', v)} 
          />
        </div>
      </section>

      <section className="space-y-8">
        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">Database Libraries</h3>
        
        <div className="space-y-12">
          <div>
            <h4 className="text-sm font-bold text-black mb-3">Fuel Types</h4>
            <div className="flex flex-col gap-1 border border-zinc-200 rounded-xl overflow-hidden shadow-sm bg-zinc-50/50">
              {settings.fuelTypes.map((fuel, i) => (
                <div key={i} className="flex items-center justify-between bg-white p-4 group border-b border-zinc-100 last:border-b-0">
                  <div className="flex items-center gap-4">
                    <GripVertical className="w-4 h-4 text-zinc-300 cursor-grab hover:text-black transition-colors" />
                    <span className="text-sm font-bold text-black uppercase tracking-wider">{fuel}</span>
                  </div>
                  <button onClick={() => removeFuelType(i)} className="text-zinc-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <div className="bg-white p-2">
                <input 
                  value={newFuel}
                  onChange={(e) => setNewFuel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addFuelType()}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black p-3 text-sm font-bold uppercase tracking-widest text-black placeholder:text-zinc-400 outline-none transition-all" 
                  placeholder="Add new fuel type..." 
                  type="text" 
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-black mb-3">Service Presets</h4>
            <div className="flex flex-col gap-1 border border-zinc-200 rounded-xl overflow-hidden shadow-sm bg-zinc-50/50">
              {settings.serviceTypes.map((service, i) => (
                <div key={i} className="flex items-center justify-between bg-white p-4 group border-b border-zinc-100 last:border-b-0">
                  <div className="flex items-center gap-4">
                    <GripVertical className="w-4 h-4 text-zinc-300 cursor-grab hover:text-black transition-colors" />
                    <span className="text-sm font-bold text-black uppercase tracking-wider">{service}</span>
                  </div>
                  <button onClick={() => removeServiceType(i)} className="text-zinc-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <div className="bg-white p-2">
                <input 
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addServiceType()}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black p-3 text-sm font-bold uppercase tracking-widest text-black placeholder:text-zinc-400 outline-none transition-all" 
                  placeholder="Add new service preset..." 
                  type="text" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

function MetricControl({ 
  label, 
  value, 
  options, 
  onChange 
}: { 
  label: string; 
  value: string; 
  options: string[]; 
  onChange: (val: string) => void; 
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black text-black uppercase tracking-widest">{label}</label>
      <div className="flex bg-zinc-100 rounded-lg p-1 border border-zinc-200 shadow-inner">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`flex-1 py-2 rounded-md text-xs font-black transition-all ${
              value === opt 
                ? 'bg-black text-white shadow-md' 
                : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            {opt.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
