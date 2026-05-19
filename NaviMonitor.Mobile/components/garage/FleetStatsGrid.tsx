import { View } from 'react-native';
import { Banknote, Gauge } from 'lucide-react-native';
import StatCard from '../vehicle/StatCard';

interface FleetStatsGridProps {
  totalSpend: number;
  totalKm: number;
}

export default function FleetStatsGrid({ totalSpend, totalKm }: FleetStatsGridProps) {
  return (
    <View className="flex-row justify-between px-6 gap-y-3 mb-4">
      <StatCard 
        label="Fleet Spend" 
        value={totalSpend.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} 
        icon={Banknote} 
        prefix="₱" 
      />
      <StatCard 
        label="Fleet Distance" 
        value={totalKm.toLocaleString()} 
        icon={Gauge} 
        unit="km" 
      />
    </View>
  );
}
