import { Vehicle } from '../types';
import { Activity, Calendar, TrendingUp, Clock, Rocket } from 'lucide-react-native';

export const calculateTabStats = (
  filter: string, 
  logs: any[], 
  vehicle: Vehicle | null, 
  distanceUnit: string = 'KM', 
  volumeUnit: string = 'L'
) => {
  if (!logs.length || !vehicle) return null;

  const distUnitLower = distanceUnit.toLowerCase();
  const effUnit = `${distanceUnit}/${volumeUnit}`;

  const now = new Date().getTime();
  const firstLogDate = new Date(logs[logs.length - 1].date).getTime();
  const msInMonth = 1000 * 60 * 60 * 24 * 30;
  const msInDay = 1000 * 60 * 60 * 24;
  
  const totalMonths = Math.max(1, (now - firstLogDate) / msInMonth);
  const totalDays = Math.max(1, (now - firstLogDate) / msInDay);

  if (filter === 'All') {
    const totalSpent = logs.reduce((sum, l) => sum + (l.feedType === 'Refuel' ? (l.totalCost || 0) : (l.price || 0)), 0);
    const maxOdo = Math.max(...logs.map(l => l.odometer || 0));
    const distance = Math.max(1, maxOdo - vehicle.startingOdometer);
    
    return {
      topL: { label: `Cost Per ${distanceUnit}`, val: `₱${(totalSpent / distance).toFixed(2)}`, icon: Activity },
      topR: { label: 'Monthly Avg', val: `₱${(totalSpent / totalMonths).toLocaleString(undefined, {maximumFractionDigits: 0})}`, icon: Calendar },
      anchor: { label: 'Total Ownership Cost', val: `₱${totalSpent.toLocaleString(undefined, {minimumFractionDigits: 2})}`, sub: `${logs.length} Total Records` }
    };
  }

  if (filter === 'Fuel') {
    const totalSpent = logs.reduce((sum, l) => sum + (l.totalCost || 0), 0);
    const totalVol = logs.reduce((sum, l) => sum + (l.volume || 0), 0);
    const distance = Math.max(0, logs[0].odometer - logs[logs.length - 1].odometer);
    const avgEff = totalVol > 0 ? (distance / totalVol) : 0;
    
    let lastEffStr = "N/A";
    if (logs.length >= 2) {
      const lastDist = logs[0].odometer - logs[1].odometer;
      const lastEff = lastDist / (logs[0].volume || 1);
      const diff = (lastEff - avgEff).toFixed(1);
      lastEffStr = `${lastEff.toFixed(1)} ${effUnit} (${Number(diff) >= 0 ? '+' : ''}${diff} vs Avg)`;
    }

    return {
      topL: { label: 'Avg Efficiency', val: `${avgEff.toFixed(1)} ${effUnit}`, icon: TrendingUp },
      topR: { label: 'Fuel/Month', val: `₱${(totalSpent / totalMonths).toLocaleString(undefined, {maximumFractionDigits: 0})}`, icon: Calendar },
      anchor: { label: 'Last Fill-up Efficiency', val: lastEffStr, sub: `₱${logs[0].totalCost.toLocaleString()} • ${logs[0].volume}${volumeUnit}` }
    };
  }

  if (filter === 'Service') {
    const totalSpent = logs.reduce((sum, l) => sum + (l.price || 0), 0);
    const distance = logs.length > 1 ? logs[0].odometer - logs[logs.length - 1].odometer : 0;
    const avgInterval = logs.length > 1 ? distance / (logs.length - 1) : 0;
    const daysSince = Math.floor((now - new Date(logs[0].date).getTime()) / msInDay);

    return {
      topL: { label: 'Avg Interval', val: `${avgInterval.toLocaleString(undefined, {maximumFractionDigits: 0})} ${distUnitLower}`, icon: Activity },
      topR: { label: 'Days Since Last', val: `${daysSince} Days`, icon: Clock },
      anchor: { label: 'Last Service Reference', val: logs[0].serviceType, sub: `${new Date(logs[0].date).toLocaleDateString()} • ${logs[0].odometer.toLocaleString()} ${distUnitLower}` }
    };
  }

  if (filter === 'Mods') {
    const totalSpent = logs.reduce((sum, l) => sum + (l.price || 0), 0);
    const projectAgeMonths = Math.floor(totalDays / 30);

    return {
      topL: { label: 'Component Count', val: `${logs.length} Parts`, icon: Rocket },
      topR: { label: 'Project Age', val: `${projectAgeMonths} Months`, icon: Clock },
      anchor: { label: 'Total Build Investment', val: `₱${totalSpent.toLocaleString(undefined, {minimumFractionDigits: 2})}`, sub: `Latest: ${logs[0].serviceType}` }
    };
  }
  return null;
};
