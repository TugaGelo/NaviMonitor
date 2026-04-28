import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { Plus, Fuel } from 'lucide-react';
import type { Vehicle, RefuelLog, MaintenanceLog } from './types/types';
import { AnimatePresence } from 'framer-motion';

import Layout from './components/ui/Layout';
import VehicleCard from './components/garage/VehicleCard';
import AddVehicleModal from './components/modals/vehicle/AddVehicleModal';
import DeleteVehicleModal from './components/modals/vehicle/DeleteVehicleModal';
import AddRefuelModal from './components/modals/refuel/AddRefuelModal';
import DeleteRefuelModal from './components/modals/refuel/DeleteRefuelModal';
import VehicleDashboard from './components/garage/dashboard/VehicleDashboard';
import AddMaintenanceModModal from './components/modals/maintenance/AddMaintenanceModModal';
import DeleteMaintenanceModal from './components/modals/maintenance/DeleteMaintenanceModal';

export default function App() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [refreshKey, setRefreshKey] = useState(0);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  
  const [isRefuelModalOpen, setIsRefuelModalOpen] = useState(false);
  const [preselectedRefuelId, setPreselectedRefuelId] = useState<number | null>(null);
  const [refuelLogToEdit, setRefuelLogToEdit] = useState<RefuelLog | null>(null);
  const [refuelLogToDelete, setRefuelLogToDelete] = useState<RefuelLog | null>(null);

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [preselectedMaintenanceId, setPreselectedMaintenanceId] = useState<number | null>(null);
  const [maintenanceLogToEdit, setMaintenanceLogToEdit] = useState<MaintenanceLog | null>(null);
  const [maintenanceLogToDelete, setMaintenanceLogToDelete] = useState<MaintenanceLog | null>(null);
  const [maintenanceModalOdo, setMaintenanceModalOdo] = useState<number>(0);

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
        if (isMounted) setIsLoading(false);
      }
    };
    loadVehicles();
    return () => { isMounted = false; };
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
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setPreselectedRefuelId(null);
                    setRefuelLogToEdit(null);
                    setIsRefuelModalOpen(true);
                  }}
                  className="bg-black text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all active:scale-95"
                >
                  <Fuel className="w-5 h-5" /> Quick Log
                </button>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-secondary text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all active:scale-95"
                >
                  <Plus className="w-5 h-5" /> Add Vehicle
                </button>
              </div>
            </div>

            {isLoading && <div className="text-center py-20 animate-pulse text-zinc-400 font-bold uppercase tracking-widest">Opening Garage...</div>}
            {error && <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600 font-medium shadow-sm">{error}</div>}
            {!isLoading && !error && vehicles.length === 0 && (
              <div className="text-center py-16 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50">
                <h3 className="text-xl font-bold text-black mb-2">Your garage is empty</h3>
                <p className="text-zinc-500 mb-6">Let's add your first vehicle to get started.</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vehicles.map((vehicle) => (
                <VehicleCard 
                  key={vehicle.id} 
                  vehicle={vehicle} 
                  onEdit={(v) => setVehicleToEdit(v)}
                  onDelete={(id) => setVehicleToDelete(vehicles.find(v => v.id === id) || null)}
                  refreshTrigger={refreshKey}
                />
              ))}
            </div>
          </div>
        } />

        <Route path="/vehicle/:id" element={
          <VehicleDashboard 
            onOpenRefuelModal={(vehicleId: number, log?: RefuelLog) => {
              setPreselectedRefuelId(vehicleId);
              setRefuelLogToEdit(log || null);
              setIsRefuelModalOpen(true);
            }}
            onDeleteRefuelLog={(log: RefuelLog) => setRefuelLogToDelete(log)}
            
            onOpenMaintenanceModal={(vehicleId: number, log?: MaintenanceLog | null, currentOdo?: number) => {
              setPreselectedMaintenanceId(vehicleId);
              setMaintenanceLogToEdit(log || null);
              setMaintenanceModalOdo(currentOdo || 0);
              setIsMaintenanceModalOpen(true);
            }}
            onDeleteMaintenanceLog={(log: MaintenanceLog) => setMaintenanceLogToDelete(log)}
            
            refreshTrigger={refreshKey}
          />
        } />
      </Routes>

      <AnimatePresence>
        {isAddModalOpen && <AddVehicleModal key="add-veh" isOpen={true} onClose={() => setIsAddModalOpen(false)} onSuccess={() => setRefreshKey(k => k + 1)} />}
        {vehicleToEdit && <AddVehicleModal key="edit-veh" isOpen={true} onClose={() => setVehicleToEdit(null)} onSuccess={() => setRefreshKey(k => k + 1)} vehicleToEdit={vehicleToEdit} />}
        {vehicleToDelete && <DeleteVehicleModal key="del-veh" isOpen={true} onClose={() => setVehicleToDelete(null)} onSuccess={() => setRefreshKey(k => k + 1)} vehicle={vehicleToDelete} />}
        {isRefuelModalOpen && <AddRefuelModal key="add-ref" isOpen={true} onClose={() => { setIsRefuelModalOpen(false); setPreselectedRefuelId(null); setRefuelLogToEdit(null); }} onSuccess={() => setRefreshKey(k => k + 1)} vehicles={vehicles} preselectedVehicleId={preselectedRefuelId} logToEdit={refuelLogToEdit} />}
        {refuelLogToDelete && <DeleteRefuelModal key="del-ref" isOpen={true} onClose={() => setRefuelLogToDelete(null)} onSuccess={() => setRefreshKey(k => k + 1)} log={refuelLogToDelete} />}
        {isMaintenanceModalOpen && <AddMaintenanceModModal key="add-maint" isOpen={true} onClose={() => { setIsMaintenanceModalOpen(false); setPreselectedMaintenanceId(null); setMaintenanceLogToEdit(null); }} onSuccess={() => setRefreshKey(k => k + 1)} vehicles={vehicles} preselectedVehicleId={preselectedMaintenanceId} logToEdit={maintenanceLogToEdit} currentOdometer={maintenanceModalOdo} />}
        {maintenanceLogToDelete && <DeleteMaintenanceModal key="del-maint" isOpen={true} onClose={() => setMaintenanceLogToDelete(null)} onSuccess={() => setRefreshKey(k => k + 1)} log={maintenanceLogToDelete} />}
      </AnimatePresence>

    </Layout>
  );
}
