import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { Plus } from 'lucide-react';
import type { Vehicle } from './types/types';

import Layout from './components/ui/Layout';
import VehicleCard from './components/garage/VehicleCard';
import AddVehicleModal from './components/garage/AddVehicleModal';
import VehicleDashboard from './components/garage/VehicleDashboard';

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
          setError('Failed to connect to the garage.');
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

  return (
    <Layout>
      <Routes>
        <Route path="/" element={
          <div className="space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-extrabold text-black tracking-tight">My Garage</h2>
                <p className="text-zinc-500 font-medium mt-1">Select a vehicle to view dashboard</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-secondary text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" /> Add Vehicle
              </button>
            </div>

            {isLoading && <div className="text-center py-20 animate-pulse text-zinc-400 font-bold uppercase tracking-widest">Opening Garage...</div>}
            
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
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>

            <AddVehicleModal 
              isOpen={isModalOpen} 
              onClose={() => setIsModalOpen(false)} 
              onSuccess={() => setRefreshKey(k => k + 1)} 
            />
          </div>
        } />

        {/* DASHBOARD ROUTE: Individual Vehicle */}
        <Route path="/vehicle/:id" element={<VehicleDashboard />} />
      </Routes>
    </Layout>
  );
}
