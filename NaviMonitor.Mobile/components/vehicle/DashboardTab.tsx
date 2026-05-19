import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Droplet, Wrench, AlertTriangle, Gauge, Banknote, Wallet, History as HistoryIcon, ChevronRight, Car, Bike } from 'lucide-react-native';
import TimelineItem from './TimelineItem';
import StatCard from './StatCard';
import PageHeader from './PageHeader';

export const DashboardTab = memo(({ vehicle, stats, timeline, onGoToLogs, onGoToMatrix }: any) => {
  const router = useRouter();
  const distanceCovered = stats.currentOdo - vehicle.startingOdometer;
  const costPerKm = distanceCovered > 0 ? (stats.totalSpent / distanceCovered).toFixed(2) : "0.00";

  return (
    <ScrollView className="flex-1 px-6 pt-1 bg-[#fcf9f8]" contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>       
      {/* Header */}
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
                <Text className="text-[11px] font-black text-[#848484] uppercase tracking-[0.15em]">{stats.currentOdo.toLocaleString()} KM</Text>
              </View>
            </View>
          }
          rightIcon={vehicle.vehicleType === 'Car' ? Car : Bike}
        />
      </View>

      <View className="flex-row gap-3 mb-8">
        
        {/* Fuel */}
        <Pressable 
          onPress={() => router.push(`/vehicle/log/fuel?vehicleId=${vehicle.id}`)}
          className="flex-1 bg-[#1b1b1b] rounded-full py-3 flex-row items-center justify-center gap-1 active:scale-95 transition-transform"
        >
          <Droplet size={16} color="#fff" />
          <Text className="text-white font-bold text-[13px]">Fuel</Text>
        </Pressable>

        {/* Mod / Upgrade */}
        <Pressable 
          onPress={() => router.push(`/vehicle/log/service?vehicleId=${vehicle.id}&mode=modification`)}
          className="flex-1 bg-transparent border border-[#cfc4c5] rounded-full py-3 flex-row items-center justify-center gap-1 active:scale-95 transition-transform"
        >
          <Wrench size={16} color="#1c1b1b" />
          <Text className="text-[#1c1b1b] font-bold text-[13px]">Mod</Text>
        </Pressable>

        {/* Emergency / Repair */}
        <Pressable 
          onPress={() => router.push(`/vehicle/log/service?vehicleId=${vehicle.id}&mode=emergency`)}
          className="flex-1 bg-[#b7102a] rounded-full py-3 flex-row items-center justify-center gap-1 active:scale-95 transition-transform"
        >
          <AlertTriangle size={16} color="#fff" />
          <Text className="text-white font-bold text-[13px]">Repair</Text>
        </Pressable>

      </View>

      {/* Matrix Health Monitor */}
      <Pressable 
        onPress={onGoToMatrix}
        className="bg-white border border-[#e5e2e1] rounded-2xl p-5 mb-6 shadow-sm shadow-black/5 active:scale-[0.99] transition-transform"
      >
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-bold text-[16px] text-[#1c1b1b]">General Health</Text>
          <ChevronRight size={16} color="#848484" />
        </View>
        <View className="w-full bg-[#f0eded] rounded-full h-2 mb-3 overflow-hidden">
          <View className="bg-[#10b981] h-2 rounded-full" style={{ width: '75%' }}></View>
        </View>
        <Text className="font-medium text-[#848484] text-[13px]">
          Next Service: <Text className="font-bold text-[#1c1b1b]">Oil Change in 1,200 km</Text>
        </Text>
      </Pressable>

      {/* Performance Grid */}
      <View className="flex-row flex-wrap justify-between gap-y-3 mb-10">
        <StatCard 
          label="Total Spent" 
          value={stats.totalSpent.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})} 
          icon={Banknote} 
          prefix="₱" 
        />
        <StatCard 
          label="Avg Efficiency" 
          value={stats.avgEfficiency} 
          icon={Gauge} 
          unit="km/L" 
        />
        <StatCard 
          label="Cost Per KM" 
          value={costPerKm} 
          icon={Wallet} 
          prefix="₱" 
        />
        <StatCard 
          label="Current Odo" 
          value={stats.currentOdo.toLocaleString()} 
          icon={HistoryIcon} 
          unit="km" 
        />
      </View>

      {/* Recent Logs */}
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
              <TimelineItem 
                key={`${log.feedType}-${log.id}-${idx}`} 
                item={log} 
                isLast={idx === 2 || idx === timeline.length - 1} 
                onPress={() => onGoToLogs()} 
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
});

export default DashboardTab;
