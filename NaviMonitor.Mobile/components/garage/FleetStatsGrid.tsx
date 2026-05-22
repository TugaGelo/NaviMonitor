import { View } from 'react-native';
import { useState, useEffect } from 'react';
import { Banknote, Gauge } from 'lucide-react-native';
import StatCard from '../vehicle/StatCard';
import { SettingsRepository } from '../../lib/localRepository';

interface FleetStatsGridProps {
  totalSpend: number;
  totalKm: number;
}

export default function FleetStatsGrid({ totalSpend, totalKm }: FleetStatsGridProps) {
  const [distanceUnit, setDistanceUnit] = useState('KM');

  useEffect(() => {
    SettingsRepository.getSettings().then(s => setDistanceUnit(s.distanceUnit));
  }, []);

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
        unit={distanceUnit.toLowerCase()} 
      />
    </View>
  );
}
