import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, RotateCcw, Droplets, CheckCircle2 } from 'lucide-react';
import type { RefuelLog, MaintenanceLog, MaintenanceMatrixItem } from '../../../types/types';

import ActivityFeed from '../../features/dashboard/ActivityFeed';
import FuelTable from '../../features/tables/FuelTable.tsx';
import MaintenanceTable from '../../features/tables/MaintenanceTable';
import MaintenanceScheduleTable from '../../features/tables/MaintenanceScheduleTable';

interface TabContentProps {
  activeTab: 'Activity' | 'Fuel' | 'Maintenance' | 'Schedule';
  vehicleId: number;
  refuelLogs: RefuelLog[];
  maintenanceLogs: MaintenanceLog[];
  maintenanceMatrix: MaintenanceMatrixItem[];
  currentOdometer: number;
  onOpenRefuelModal?: (vehicleId: number, logToEdit?: RefuelLog) => void;
  onDeleteRefuelLog?: (log: RefuelLog) => void;
  onOpenMaintenanceModal?: (vehicleId: number, logToEdit?: MaintenanceLog | null, currentOdometer?: number) => void;
  onDeleteMaintenanceLog?: (log: MaintenanceLog) => void;
  onMatrixAction: (item: string, action: string, odoPoint: number) => void;
}

export default function DashboardTabContent({
  activeTab, 
  refuelLogs, 
  maintenanceLogs, 
  maintenanceMatrix, 
  currentOdometer, 
  onOpenRefuelModal, 
  onDeleteRefuelLog, 
  onOpenMaintenanceModal, 
  onDeleteMaintenanceLog, 
  onMatrixAction
}: TabContentProps) {
  
  return (
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
          className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm flex flex-col"
        >
          <div className="overflow-x-auto">
            {activeTab === 'Fuel' && (
              <FuelTable 
                logs={refuelLogs} 
                onEdit={onOpenRefuelModal} 
                onDelete={onDeleteRefuelLog} 
              />
            )}
            
            {activeTab === 'Maintenance' && (
              <MaintenanceTable 
                logs={maintenanceLogs} 
                onEdit={onOpenMaintenanceModal} 
                onDelete={onDeleteMaintenanceLog} 
              />
            )}

            {activeTab === 'Schedule' && (
              <MaintenanceScheduleTable 
                matrix={maintenanceMatrix} 
                currentOdometer={currentOdometer} 
                logs={maintenanceLogs}
                onCellClick={onMatrixAction}
              />
            )}
          </div>

          <div className="px-6 py-4 border-t border-zinc-200 flex flex-wrap gap-4 items-center justify-between bg-zinc-50/50 mt-auto">
            <span className="text-zinc-500 text-sm font-bold">
              {activeTab === 'Schedule' 
                ? `Tracking ${maintenanceMatrix.length} maintenance tasks`
                : `Showing ${activeTab === 'Fuel' ? refuelLogs.length : maintenanceLogs.length} historical logs`
              }
            </span>

            {activeTab === 'Schedule' && (
              <div className="flex items-center gap-6">
                <LegendItem icon={<Search className="w-3.5 h-3.5" />} label="Inspect" />
                <LegendItem icon={<RotateCcw className="w-3.5 h-3.5 text-secondary" />} label="Replace" />
                <LegendItem icon={<Droplets className="w-3.5 h-3.5 text-blue-500" />} label="Clean" />
                <LegendItem icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />} label="Done" />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LegendItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-zinc-400 tracking-widest">
      {icon} {label}
    </div>
  );
}
