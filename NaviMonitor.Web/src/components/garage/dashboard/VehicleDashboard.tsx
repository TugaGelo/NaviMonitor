import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import type { Vehicle, RefuelLog, MaintenanceLog } from '../../../types/types';

import DashboardHeader from './DashboardHeader';
import MetricGrid from './MetricGrid';
import DashboardTabs from './DashboardTabs';
import FuelTable from './tables/FuelTable';
import MaintenanceTable from './tables/MaintenanceTable';
import ActivityFeed from './ActivityFeed';

interface DashboardProps {
  onOpenRefuelModal?: (vehicleId: number, logToEdit?: RefuelLog) => void;
  onDeleteRefuelLog?: (log: RefuelLog) => void;
  onOpenMaintenanceModal?: (vehicleId: number, logToEdit?: MaintenanceLog | null, currentOdometer?: number) => void;
  onDeleteMaintenanceLog?: (log: MaintenanceLog) => void;
  onOpenSyncModal?: (vehicleId: number) => void;
  refreshTrigger?: number;
}

export default function VehicleDashboard({ 
  onOpenRefuelModal, 
  onDeleteRefuelLog,
  onOpenMaintenanceModal,
  onDeleteMaintenanceLog,
  onOpenSyncModal,
  refreshTrigger 
}: DashboardProps) {
  const { id } = useParams<{ id: string }>(); 
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [refuelLogs, setRefuelLogs] = useState<RefuelLog[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [activeTab, setActiveTab] = useState<'Activity' | 'Fuel' | 'Maintenance'>('Activity');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:7041/api';
        
        const vehicleRes = await axios.get(`${apiUrl}/vehicle/${id}`);
        setVehicle(vehicleRes.data);

        try {
           const logsRes = await axios.get(`${apiUrl}/refuel/vehicle/${id}`);
           setRefuelLogs(logsRes.data);
        } catch { setRefuelLogs([]); }

        try {
           const maintRes = await axios.get(`${apiUrl}/maintenance/vehicle/${id}`);
           setMaintenanceLogs(maintRes.data);
        } catch { setMaintenanceLogs([]); }

      } catch (err) {
        console.error("Error fetching vehicle details:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, refreshTrigger]);

  if (isLoading || !vehicle) return <div className="p-20 text-center animate-pulse font-black uppercase tracking-widest text-zinc-400">Loading Data...</div>;

  const allOdos = [...refuelLogs.map(l => l.odometer), ...maintenanceLogs.map(m => m.odometer)];
  const currentOdometer = allOdos.length > 0 ? Math.max(...allOdos) : (vehicle.startingOdometer ?? 0);

  const totalSpent = refuelLogs.reduce((sum, log) => sum + log.totalCost, 0) + maintenanceLogs.reduce((sum, log) => sum + log.price, 0);
  const totalVolume = refuelLogs.reduce((sum, log) => sum + log.volume, 0);
  const distanceTraveled = Math.max(0, currentOdometer - (vehicle.startingOdometer ?? 0));
  
  const avgEfficiency = (totalVolume > 0 && distanceTraveled > 0) ? (distanceTraveled / totalVolume).toFixed(1) : "---";
  const costPerKm = (distanceTraveled > 0 && totalSpent > 0) ? (totalSpent / distanceTraveled).toFixed(2) : "---";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      
      <DashboardHeader 
        vehicle={vehicle} 
        activeTab={activeTab === 'Activity' ? 'Fuel' : activeTab}
        onOpenRefuelModal={onOpenRefuelModal} 
        onOpenMaintenanceModal={(vehicleId) => onOpenMaintenanceModal && onOpenMaintenanceModal(vehicleId, null, currentOdometer)} 
        onOpenSyncModal={onOpenSyncModal}
      />

      <MetricGrid 
        avgEfficiency={avgEfficiency}
        costPerKm={costPerKm}
        totalSpent={totalSpent}
        currentOdometer={currentOdometer}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
      />

      <section className="space-y-6">
        <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {activeTab === 'Activity' ? (
          <ActivityFeed maintenanceLogs={maintenanceLogs} refuelLogs={refuelLogs} />
        ) : (
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'Fuel' && (
                  <FuelTable logs={refuelLogs} vehicleId={vehicle.id} onEdit={onOpenRefuelModal} onDelete={onDeleteRefuelLog} />
                )}
                {activeTab === 'Maintenance' && (
                  <MaintenanceTable logs={maintenanceLogs} vehicleId={vehicle.id} onEdit={onOpenMaintenanceModal} onDelete={onDeleteMaintenanceLog} />
                )}
              </AnimatePresence>
            </div>
            <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-between bg-zinc-50/50">
              <span className="text-zinc-500 text-sm font-bold">
                Showing {activeTab === 'Fuel' ? refuelLogs.length : maintenanceLogs.length} logs
              </span>
            </div>
          </div>
        )}
      </section>

    </motion.div>
  );
}
