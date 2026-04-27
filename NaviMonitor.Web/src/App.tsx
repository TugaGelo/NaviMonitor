import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Gauge, CalendarDays, ChevronRight, ShieldAlert } from 'lucide-react';
import AddVehicleModal from './AddVehicleModal';

interface Vehicle {
  id: number;
  vehicleType: string;
  nickname: string;
  make: string;
  model: string;
  year: number;
  color: string;
  engineSizeCC: number;
  startingOdometer: number;
  licensePlate: string;
  registrationExpiry?: string;
}

export default function App() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadVehicles = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:7041/api';
        const response = await axios.get(`${apiUrl}/vehicle`); 
        
        if (isMounted) {
          setVehicles(response.data);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          console.error("API Error:", err);
          setError('Failed to connect to the garage. Is the engine (API) running?');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadVehicles();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const handleVehicleAdded = () => {
    setRefreshKey(oldKey => oldKey + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 relative">
      
      <header className="bg-black text-white px-6 py-5 shadow-md flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-secondary animate-pulse"></div>
          <h1 className="font-black tracking-widest text-xl uppercase">Navi</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
          <span className="text-sm font-bold">G</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-6">
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-black tracking-tight">My Garage</h2>
            <p className="text-zinc-500 font-medium mt-1">Select a vehicle to view dashboard</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-secondary text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Vehicle</span>
          </button>
        </div>

        {isLoading && <div className="text-center text-zinc-500 font-medium py-10 animate-pulse">Opening the garage doors...</div>}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600 font-medium shadow-sm">
            {error}
          </div>
        )}

        {!isLoading && !error && vehicles.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50">
            <h3 className="text-xl font-bold text-black mb-2">Your garage is empty</h3>
            <p className="text-zinc-500 mb-6">Let's add your first vehicle to get started.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vehicles.map((vehicle) => {
            const isExpiringSoon = vehicle.registrationExpiry && 
              (new Date(vehicle.registrationExpiry).getTime() - new Date().getTime()) / (1000 * 3600 * 24) < 30;

            return (
              <div key={vehicle.id} className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 group cursor-pointer relative overflow-hidden transition-all hover:shadow-md">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-secondary to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-black leading-none mb-2">{vehicle.nickname}</h3>
                    <p className="text-zinc-500 font-medium text-sm">
                      {vehicle.year} {vehicle.make} {vehicle.model} • {vehicle.color}
                    </p>
                  </div>
                  <span className="bg-zinc-100 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {vehicle.vehicleType}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                    <div className="flex items-center gap-2 text-zinc-500 mb-1">
                      <Gauge className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Odometer</span>
                    </div>
                    <p className="font-bold text-lg text-black">{vehicle.startingOdometer?.toLocaleString() ?? 0} <span className="text-xs text-zinc-400 font-medium">km</span></p>
                  </div>

                  <div className={`rounded-xl p-3 border ${isExpiringSoon ? 'bg-red-50 border-red-100' : 'bg-zinc-50 border-zinc-100'}`}>
                    <div className={`flex items-center gap-2 mb-1 ${isExpiringSoon ? 'text-secondary' : 'text-zinc-500'}`}>
                      {isExpiringSoon ? <ShieldAlert className="w-4 h-4" /> : <CalendarDays className="w-4 h-4" />}
                      <span className="text-xs font-semibold uppercase tracking-wider">LTO Reg</span>
                    </div>
                    <p className={`font-bold text-sm ${isExpiringSoon ? 'text-secondary' : 'text-black'}`}>
                      {vehicle.registrationExpiry ? new Date(vehicle.registrationExpiry).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-zinc-100 pt-4 mt-2">
                  <span className="text-sm font-bold text-zinc-400 font-mono tracking-widest">{vehicle.licensePlate || 'NO-PLATE'}</span>
                  <div className="flex items-center text-secondary font-bold text-sm group-hover:translate-x-1 transition-transform">
                    View Dashboard <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <AddVehicleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleVehicleAdded} 
      />
    </div>
  );
}
