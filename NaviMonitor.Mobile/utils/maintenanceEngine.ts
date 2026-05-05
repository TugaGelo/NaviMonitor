import { Vehicle, MaintenanceLog, MaintenanceMatrixItem } from '../constants/vehicles';

export interface TimelineTask {
  id: string;
  task: string;
  action: string;
  status: 'completed' | 'pending' | 'overdue';
}

export interface Milestone {
  km: number;
  status: 'Completed' | 'Upcoming' | 'Future' | 'Overdue';
  items: TimelineTask[];
}

export function generateTimeline(vehicle: Vehicle, logs: MaintenanceLog[], currentOdo: number): Milestone[] {
  if (!vehicle.maintenanceMatrixJson || vehicle.maintenanceMatrixJson === '[]') return [];

  const matrix: MaintenanceMatrixItem[] = JSON.parse(vehicle.maintenanceMatrixJson);
  const milestoneMap = new Map<number, TimelineTask[]>();
  const projectionLimit = currentOdo + 10000;

  matrix.forEach((item, index) => {
    let nextKm = item.initial ? item.initial : item.interval;
    
    while (nextKm <= projectionLimit) {
      if (!milestoneMap.has(nextKm)) {
        milestoneMap.set(nextKm, []);
      }
      
      const isCompleted = logs.some(
        log => log.serviceType === item.item && Math.abs(log.odometer - nextKm) <= 500
      );

      let status: 'completed' | 'pending' | 'overdue' = 'pending';
      if (isCompleted) status = 'completed';
      else if (currentOdo >= nextKm) status = 'overdue';

      milestoneMap.get(nextKm)?.push({
        id: `${index}-${nextKm}`,
        task: item.item,
        action: item.action,
        status: status
      });

      nextKm += item.interval;
    }
  });

  const milestones: Milestone[] = Array.from(milestoneMap.entries())
    .map(([km, items]) => {
      let milestoneStatus: Milestone['status'] = 'Future';
      const allCompleted = items.every(i => i.status === 'completed');
      const hasOverdue = items.some(i => i.status === 'overdue');

      if (hasOverdue) milestoneStatus = 'Overdue';
      else if (allCompleted && currentOdo >= km) milestoneStatus = 'Completed';
      else if (!allCompleted && km > currentOdo && km <= currentOdo + 5000) milestoneStatus = 'Upcoming';

      return { km, status: milestoneStatus, items };
    })
    .sort((a, b) => a.km - b.km);

  return milestones;
}
