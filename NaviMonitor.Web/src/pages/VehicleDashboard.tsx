import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import type { Vehicle, RefuelLog, MaintenanceLog, MaintenanceMatrixItem } from '../types/types';

import DashboardHeader from '../components/features/dashboard/DashboardHeader';
import DashboardTabs from '../components/features/dashboard/DashboardTabs';
import DashboardTabContent from '../components/features/dashboard/DashboardTabContent';
import MetricGrid from '../components/features/dashboard/MetricGrid';

type TabType = "Activity" | "Fuel" | "Maintenance" | "Schedule";

interface VehicleDashboardProps {
  onOpenRefuelModal: (vehicleId: number, log?: RefuelLog | null) => void;
  onDeleteRefuelLog: (log: RefuelLog) => void;
  onOpenMaintenanceModal: (vehicleId: number, log?: MaintenanceLog | null, currentOdo?: number) => void;
  onDeleteMaintenanceLog: (log: MaintenanceLog) => void;
  onOpenSyncModal: (vehicleId: number) => void;
  refreshTrigger: number;
}

export default function VehicleDashboard({
  onOpenRefuelModal,
  onDeleteRefuelLog,
  onOpenMaintenanceModal,
  onDeleteMaintenanceLog,
  onOpenSyncModal,
  refreshTrigger
}: VehicleDashboardProps) {
  const { id } = useParams<{ id: string }>();
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [fuelLogs, setFuelLogs] = useState<RefuelLog[]>([]);
  const [maintLogs, setMaintLogs] = useState<MaintenanceLog[]>([]);
  
  const [maintenanceMatrix] = useState<MaintenanceMatrixItem[]>([]);  
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<TabType>("Activity");
  const [timeFilter, setTimeFilter] = useState('All Time');

  useEffect(() => {
    let isMounted = true;

    const fetchVehicleData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:7041/api';
        
        const [vehRes, fuelRes, maintRes] = await Promise.all([
          axios.get(`${apiUrl}/vehicle/${id}`),
          axios.get(`${apiUrl}/refuel/vehicle/${id}`),
          axios.get(`${apiUrl}/maintenance/vehicle/${id}`)
        ]);

        if (isMounted) {
          setVehicle(vehRes.data);
          setFuelLogs(fuelRes.data.sort((a: RefuelLog, b: RefuelLog) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          setMaintLogs(maintRes.data.sort((a: MaintenanceLog, b: MaintenanceLog) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
      } catch (err) {
        console.error("Failed to fetch vehicle dashboard data", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchVehicleData();

    return () => { isMounted = false; };
  }, [id, refreshTrigger]);

  const handleMatrixAction = (item: string, action: string) => {
    console.log(`Matrix action triggered: ${action} on ${item}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 border-4 border-zinc-200 border-t-black rounded-full animate-spin"></div>
        <div className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Loading Telemetry...</div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-20 text-zinc-400 font-bold uppercase tracking-widest">
        Vehicle not found.
      </div>
    );
  }

  const maxFuelOdo = fuelLogs.length > 0 ? Math.max(...fuelLogs.map(l => l.odometer)) : 0;
  const maxMaintOdo = maintLogs.length > 0 ? Math.max(...maintLogs.map(l => l.odometer)) : 0;
  const currentOdo = Math.max(vehicle.startingOdometer, maxFuelOdo, maxMaintOdo);

  const cutoffDate = new Date();
  if (timeFilter === '6 Months') {
    cutoffDate.setMonth(cutoffDate.getMonth() - 6);
  }

  const filteredFuelLogs = timeFilter === 'All Time' 
    ? fuelLogs 
    : fuelLogs.filter(log => new Date(log.date) >= cutoffDate);

  const filteredMaintLogs = timeFilter === 'All Time'
    ? maintLogs
    : maintLogs.filter(log => new Date(log.date) >= cutoffDate);

  const totalFuelSpend = filteredFuelLogs.reduce((sum, log) => sum + log.totalCost, 0);
  const totalMaintSpend = filteredMaintLogs.reduce((sum, log) => sum + log.price, 0);
  const filteredTotalSpent = totalFuelSpend + totalMaintSpend;

  let totalDistance = 0;
  if (filteredFuelLogs.length > 1) {
    const minOdo = Math.min(...filteredFuelLogs.map(l => l.odometer));
    const maxOdo = Math.max(...filteredFuelLogs.map(l => l.odometer));
    totalDistance = maxOdo - minOdo;
  }
  const totalVolume = filteredFuelLogs.reduce((sum, log) => sum + log.volume, 0);
  const avgEfficiency = totalVolume > 0 ? (totalDistance / totalVolume).toFixed(1) : "0.0";
  const costPerKm = totalDistance > 0 ? (filteredTotalSpent / totalDistance).toFixed(2) : "0.00";

  const nextServiceCountdown = currentOdo === 0 ? 3000 : 3000 - (currentOdo % 3000);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      
      <DashboardHeader 
        vehicle={vehicle} 
        currentOdometer={currentOdo}
        onOpenRefuel={() => onOpenRefuelModal(vehicle.id)}
        onOpenMaintenance={() => onOpenMaintenanceModal(vehicle.id, null, currentOdo)}
        onOpenSync={() => onOpenSyncModal(vehicle.id)}
      />

      <MetricGrid 
        avgEfficiency={avgEfficiency}
        costPerKm={costPerKm}
        totalSpent={filteredTotalSpent}
        nextServiceDistance={nextServiceCountdown}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
      />

      <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <DashboardTabContent 
        activeTab={activeTab}
        vehicleId={vehicle.id} 
        refuelLogs={fuelLogs} 
        maintenanceLogs={maintLogs} 
        maintenanceMatrix={maintenanceMatrix} 
        currentOdometer={currentOdo}          
        onOpenRefuelModal={onOpenRefuelModal}
        onDeleteRefuelLog={onDeleteRefuelLog}
        onOpenMaintenanceModal={(vId, log) => onOpenMaintenanceModal(vId, log, currentOdo)}
        onDeleteMaintenanceLog={onDeleteMaintenanceLog}
        onMatrixAction={handleMatrixAction}   
      />

    </motion.div>
  );
}
