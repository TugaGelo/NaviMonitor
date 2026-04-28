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
import MaintenanceScheduleTable from './tables/MaintenanceScheduleTable';
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
  const [activeTab, setActiveTab] = useState<'Activity' | 'Fuel' | 'Maintenance' | 'Schedule'>('Activity');

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
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, refreshTrigger]);

  if (isLoading || !vehicle) {
    return (
      <div className="p-20 text-center animate-pulse font-black uppercase tracking-widest text-zinc-400">
        Syncing Core Systems...
      </div>
    );
  }

  const allOdos = [...refuelLogs.map(l => l.odometer), ...maintenanceLogs.map(m => m.odometer)];
  const currentOdometer = allOdos.length > 0 ? Math.max(...allOdos) : (vehicle.startingOdometer ?? 0);

  const totalSpent = refuelLogs.reduce((sum, log) => sum + log.totalCost, 0) + 
                     maintenanceLogs.reduce((sum, log) => sum + log.price, 0);
  
  const totalVolume = refuelLogs.reduce((sum, log) => sum + log.volume, 0);
  const distanceTraveled = Math.max(0, currentOdometer - (vehicle.startingOdometer ?? 0));
  
  const avgEfficiency = (totalVolume > 0 && distanceTraveled > 0) ? (distanceTraveled / totalVolume).toFixed(1) : "---";
  const costPerKm = (distanceTraveled > 0 && totalSpent > 0) ? (totalSpent / distanceTraveled).toFixed(2) : "---";

  const maintenanceMatrix = vehicle.maintenanceMatrixJson 
    ? JSON.parse(vehicle.maintenanceMatrixJson).matrix 
    : [];

  const handleMatrixAction = (item: string, action: string) => {
    if (onOpenMaintenanceModal && vehicle) {
      const prefillData: Partial<MaintenanceLog> = {
        serviceType: `${item} (${action})`,
        odometer: currentOdometer,
        price: 0,
        notes: `Automated log from Service Matrix milestone.`,
        date: new Date().toISOString().split('T')[0]
      };
      onOpenMaintenanceModal(vehicle.id, prefillData as MaintenanceLog, currentOdometer);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-8 pb-20"
    >
      <DashboardHeader 
        vehicle={vehicle} 
        activeTab={activeTab === 'Activity' ? 'Fuel' : (activeTab === 'Schedule' ? 'Maintenance' : activeTab)}
        onOpenRefuelModal={onOpenRefuelModal} 
        onOpenMaintenanceModal={(vId) => onOpenMaintenanceModal && onOpenMaintenanceModal(vId, null, currentOdometer)} 
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
        
        <AnimatePresence mode="wait">
          {activeTab === 'Activity' ? (
            <ActivityFeed 
              key="feed" 
              maintenanceLogs={maintenanceLogs} 
              refuelLogs={refuelLogs} 
            />
          ) : (
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm"
            >
              {activeTab === 'Fuel' && (
                <div className="overflow-x-auto">
                  <FuelTable 
                    logs={refuelLogs} 
                    vehicleId={vehicle.id} 
                    onEdit={onOpenRefuelModal} 
                    onDelete={onDeleteRefuelLog} 
                  />
                </div>
              )}
              
              {activeTab === 'Maintenance' && (
                <div className="overflow-x-auto">
                  <MaintenanceTable 
                    logs={maintenanceLogs} 
                    vehicleId={vehicle.id} 
                    onEdit={onOpenMaintenanceModal} 
                    onDelete={onDeleteMaintenanceLog} 
                  />
                </div>
              )}

              {activeTab === 'Schedule' && (
                <MaintenanceScheduleTable 
                  matrix={maintenanceMatrix} 
                  currentOdometer={currentOdometer} 
                  logs={maintenanceLogs}
                  onCellClick={handleMatrixAction}
                />
              )}

              {activeTab !== 'Schedule' && (
                <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-between bg-zinc-50/50">
                  <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                    System Registry
                  </span>
                  <span className="text-zinc-500 text-sm font-bold">
                    {`Showing ${activeTab === 'Fuel' ? refuelLogs.length : maintenanceLogs.length} historical logs`}
                  </span>
                  
                </div>
              )}
              
              {activeTab === 'Schedule' && (
                <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-between bg-zinc-50/50">
                  <span className="text-zinc-500 text-sm font-bold">
                    Tracking {maintenanceMatrix.length} maintenance tasks
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </motion.div>
  );
}
