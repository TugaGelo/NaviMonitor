import { MaintenanceLog, RefuelLog } from '../constants/vehicles';

export interface ActivityEvent {
  id: string;
  type: 'FUEL' | 'MAINTENANCE' | 'MODIFICATION';
  title: string;
  subtitle: string;
  date: string;
  cost: number;
}

export function generateActivityFeed(mLogs: MaintenanceLog[], fLogs: RefuelLog[]): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  mLogs.forEach(log => {
    events.push({
      id: `m-${log.id}`,
      type: log.logType === 'Modification' ? 'MODIFICATION' : 'MAINTENANCE',
      title: log.serviceType,
      subtitle: `${log.isDIY ? 'DIY' : 'Shop'} • ${log.odometer.toLocaleString()} km`,
      date: log.date,
      cost: log.price
    });
  });

  fLogs.forEach(log => {
    events.push({
      id: `f-${log.id}`,
      type: 'FUEL',
      title: `Refueled ${log.volume}L`,
      subtitle: `${log.fuelType || 'Gas'} • ${log.odometer.toLocaleString()} km`,
      date: log.date,
      cost: log.totalCost
    });
  });

  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
