import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { memo, useState, useEffect, useMemo } from 'react';
import { Droplet, Wrench, AlertTriangle, Gauge, Banknote, Wallet, History as HistoryIcon, ChevronRight, Car, Bike } from 'lucide-react-native';
import TimelineItem from './TimelineItem';
import StatCard from '../../ui/StatCard';
import PageHeader from '../../ui/PageHeader';
import { SettingsRepository } from '../../../lib/database/localRepository';

export const DashboardTab = memo(({ vehicle, stats, timeline, onGoToLogs, onGoToMatrix }: any) => {
  const router = useRouter();

  const [distanceUnit, setDistanceUnit] = useState('KM');
  const [effUnit, setEffUnit] = useState('KM/L');

  useEffect(() => {
    SettingsRepository.getSettings().then(settings => {
      setDistanceUnit(settings.distanceUnit);
      setEffUnit(`${settings.distanceUnit}/${settings.volumeUnit}`);
    });
  }, []);

  const { generalHealth, criticalItem } = useMemo(() => {
    if (!vehicle?.maintenanceMatrixJson) return { generalHealth: 100, criticalItem: null };
    
    try {
      const parsedMatrix = JSON.parse(vehicle.maintenanceMatrixJson);
      
      const evaluatedMatrix = parsedMatrix.map((matrixItem: any) => {
        const serviceLogs = timeline.filter((l: any) => 
          l.feedType === 'Maintenance' && l.serviceType === matrixItem.item
        );
        
        const completedCount = serviceLogs.length;
        let prevTarget = 0;
        let nextTarget = 0;

        const initialTarget = Number(matrixItem.initialMilestone || matrixItem.initial || 0);
        const intervalTarget = Number(matrixItem.interval || 0);

        if (initialTarget > 0) {
          if (completedCount === 0) {
            prevTarget = 0;
            nextTarget = initialTarget;
          } else {
            prevTarget = initialTarget + (intervalTarget * (completedCount - 1));
            nextTarget = initialTarget + (intervalTarget * completedCount);
          }
        } else {
          prevTarget = intervalTarget * completedCount;
          nextTarget = intervalTarget * (completedCount + 1);
        }
        
        const remainingKm = nextTarget - stats.currentOdo;
        const cycleLength = Math.max(1, nextTarget - prevTarget);
        const currentProgressInCycle = Math.max(0, stats.currentOdo - prevTarget);
        const progressPct = Math.min(100, Math.max(0, (currentProgressInCycle / cycleLength) * 100));

        return { ...matrixItem, remainingKm, progressPct };
      }).sort((a: any, b: any) => a.remainingKm - b.remainingKm);

      if (evaluatedMatrix.length === 0) return { generalHealth: 100, criticalItem: null };

      const totalProgress = evaluatedMatrix.reduce((acc: number, curr: any) => acc + curr.progressPct, 0);
      const avgProgress = totalProgress / evaluatedMatrix.length;
      
      const health = Math.max(0, Math.round(100 - avgProgress));
      return { generalHealth: health, criticalItem: evaluatedMatrix[0] };
    } catch (e) {
      return { generalHealth: 100, criticalItem: null };
    }
  }, [vehicle, timeline, stats]);

  const distanceCovered = stats.currentOdo - vehicle.startingOdometer;
  const costPerKm = distanceCovered > 0 ? (stats.totalSpent / distanceCovered).toFixed(2) : "0.00";

  return (
    <ScrollView className="flex-1 px-6 pt-1 bg-[#fcf9f8]" contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>       
      <View className="mb-2">
        <PageHeader 
          title={vehicle.nickname} 
          subtitle={
            <View className="flex-row items-center flex-wrap gap-1.5">
              <Text className="text-[11px] font-black text-[#848484] uppercase tracking-[0.15em]">{vehicle.year}</Text>
              <Text className="text-[#cfc4c5] text-xs font-bold">•</Text>
              <Text className="text-[11px] font-black text-[#848484] uppercase tracking-[0.15em]">{vehicle.make} {vehicle.model}</Text>
              <Text className="text-[#cfc4c5] text-xs font-bold">•</Text>
              <View className="flex-row items-center gap-2">
                <Gauge size={12} color="#848484" strokeWidth={2.5} />
                <Text className="text-[11px] font-black text-[#848484] uppercase tracking-[0.15em]">{stats.currentOdo.toLocaleString()} {distanceUnit}</Text>
              </View>
            </View>
          }
          rightIcon={vehicle.vehicleType === 'Car' ? Car : Bike}
        />
      </View>

      <View className="flex-row gap-3 mb-8">
        <Pressable onPress={() => router.push(`/vehicle/log/fuel?vehicleId=${vehicle.id}`)} className="flex-1 bg-[#1b1b1b] rounded-full py-3 flex-row items-center justify-center gap-1 active:scale-95 transition-transform">
          <Droplet size={16} color="#fff" />
          <Text className="text-white font-bold text-[13px]">Fuel</Text>
        </Pressable>
        <Pressable onPress={() => router.push(`/vehicle/log/service?vehicleId=${vehicle.id}&mode=modification`)} className="flex-1 bg-transparent border border-[#cfc4c5] rounded-full py-3 flex-row items-center justify-center gap-1 active:scale-95 transition-transform">
          <Wrench size={16} color="#1c1b1b" />
          <Text className="text-[#1c1b1b] font-bold text-[13px]">Mod</Text>
        </Pressable>
        <Pressable onPress={() => router.push(`/vehicle/log/service?vehicleId=${vehicle.id}&mode=unscheduled`)} className="flex-1 bg-[#b7102a] rounded-full py-3 flex-row items-center justify-center gap-1 active:scale-95 transition-transform">
          <AlertTriangle size={16} color="#fff" />
          <Text className="text-white font-bold text-[13px]">Service</Text>
        </Pressable>
      </View>

      <Pressable onPress={onGoToMatrix} className="bg-white border border-[#e5e2e1] rounded-2xl p-5 mb-6 shadow-sm shadow-black/5 active:scale-[0.99] transition-transform">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-bold text-[16px] text-[#1c1b1b]">General Health</Text>
          <ChevronRight size={16} color="#848484" />
        </View>
        <View className="w-full bg-[#f0eded] rounded-full h-2 mb-3 overflow-hidden">
          <View className={`h-2 rounded-full ${generalHealth < 40 ? 'bg-[#b7102a]' : 'bg-[#1c1b1b]'}`} style={{ width: `${generalHealth}%` }} />
        </View>
        <Text className="font-medium text-[#848484] text-[13px]">
          {criticalItem ? (
            <>Next Service: <Text className="font-bold text-[#1c1b1b]">{criticalItem.item} in {Math.max(0, criticalItem.remainingKm).toLocaleString()} {distanceUnit.toLowerCase()}</Text></>
          ) : (
            <>Status: <Text className="font-bold text-[#1c1b1b]">No Matrix Configured</Text></>
          )}
        </Text>
      </Pressable>

      <View className="flex-row flex-wrap justify-between gap-y-3 mb-10">
        <StatCard label="Total Spent" value={stats.totalSpent.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})} icon={Banknote} prefix="₱" />
        <StatCard label="Avg Efficiency" value={stats.avgEfficiency} icon={Gauge} unit={effUnit} />
        <StatCard label={`Cost Per ${distanceUnit}`} value={costPerKm} icon={Wallet} prefix="₱" />
        <StatCard label="Current Odo" value={stats.currentOdo.toLocaleString()} icon={HistoryIcon} unit={distanceUnit.toLowerCase()} />
      </View>

      <View className="flex-col mb-4">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-[22px] font-black text-[#1c1b1b] tracking-tight">Recent Logs</Text>
          <Pressable onPress={onGoToLogs} className="flex-row items-center gap-1 active:opacity-50">
            <Text className="text-[13px] font-bold text-[#848484]">View All</Text>
            <ChevronRight size={16} color="#848484" />
          </Pressable>
        </View>
        {timeline.length === 0 ? (
          <View className="py-10 border-2 border-dashed border-[#e5e2e1] rounded-2xl items-center justify-center">
            <Text className="text-[#848484] font-bold text-[11px] uppercase tracking-widest">No logs recorded yet</Text>
          </View>
        ) : (
          <View className="-mx-6 flex-col space-y-6">
            {timeline.slice(0, 3).map((log: any, idx: number) => (
              <TimelineItem key={`${log.feedType}-${log.id}-${idx}`} item={log} isLast={idx === 2 || idx === timeline.length - 1} onPress={() => onGoToLogs()} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
});

export default DashboardTab;
