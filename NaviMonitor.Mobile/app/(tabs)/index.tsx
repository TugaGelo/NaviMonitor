import { View, FlatList, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Plus, Banknote, Gauge } from 'lucide-react-native';

import { VehicleRepository } from '../../lib/localRepository';
import { Vehicle } from '../../types';
import VehicleCard from '../../components/VehicleCard';

import PageHeader from '../../components/vehicle/PageHeader';
import StatCard from '../../components/vehicle/StatCard';

type VehicleWithStats = Vehicle & { currentOdo: number };

export default function GarageScreen() {
  const router = useRouter();

  const [vehicles, setVehicles] = useState<VehicleWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fleetStats, setFleetStats] = useState({ totalSpend: 0, totalKm: 0 });

  const loadData = async () => {
    setIsLoading(true);
    const data = await VehicleRepository.getVehicles();
    
    let combinedSpend = 0;
    let combinedKm = 0;
    
    const enrichedVehicles = await Promise.all(data.map(async (v) => {
      const stats = await VehicleRepository.getVehicleStats(v.id!);
      const currentOdo = stats?.currentOdo || v.startingOdometer;
      
      combinedSpend += stats?.totalSpent || 0;
      combinedKm += currentOdo;
      
      return { ...v, currentOdo };
    }));

    setVehicles(enrichedVehicles);
    setFleetStats({ totalSpend: combinedSpend, totalKm: combinedKm });
    setIsLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-[#fcf9f8]" edges={['top']}>
      
      <View className="px-6 pt-12 pb-4">
        <PageHeader 
          title="GARAGE" 
          subtitle={
            <View className="flex-row items-center flex-wrap gap-1.5 mt-0.5">
              <Text className="text-[11px] font-black text-[#848484] uppercase tracking-[0.15em]">
                {vehicles.length} ACTIVE {vehicles.length === 1 ? 'UNIT' : 'UNITS'}
              </Text>
              <Text className="text-[#cfc4c5] text-xs font-bold">•</Text>
              <View className="flex-row items-center gap-2">
                <Gauge size={12} color="#848484" strokeWidth={2.5} />
                <Text className="text-[11px] font-black text-[#848484] uppercase tracking-[0.15em]">
                  {fleetStats.totalKm.toLocaleString()} TOTAL KM
                </Text>
              </View>
            </View>
          }
          rightIcon={() => (
            <Pressable 
              onPress={() => router.push('/vehicle/create')}
              className="w-10 h-10 rounded-full border border-[#e5e2e1] items-center justify-center active:bg-[#f0eded] transition-colors"
            >
              <Plus size={20} color="#1c1b1b" strokeWidth={2} />
            </Pressable>
          )} 
        />
      </View>

      <View className="flex-row justify-between px-6 gap-y-3 mb-6">
         <StatCard 
           label="Fleet Spend" 
           value={fleetStats.totalSpend.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})} 
           icon={Banknote} 
           prefix="₱" 
         />
         <StatCard 
           label="Fleet Distance" 
           value={fleetStats.totalKm.toLocaleString()} 
           icon={Gauge} 
           unit="km" 
         />
      </View>

      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id!.toString()}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <VehicleCard 
            vehicle={item} 
            onRefresh={loadData}
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <Pressable 
              className="mt-6 border-2 border-dashed border-[#e5e2e1] rounded-2xl p-8 items-center justify-center min-h-[200px] active:opacity-50"
              onPress={() => router.push('/vehicle/create')}
            >
              <View className="w-16 h-16 rounded-full bg-[#f0eded] items-center justify-center mb-4">
                <Plus size={32} color="#1c1b1b" />
              </View>
              <Text className="text-[18px] text-[#1c1b1b] font-black uppercase tracking-tight">Add Vehicle</Text>
              <Text className="text-[#848484] font-medium text-[13px] text-center mt-2">
                Register your first unit to begin tracking telemetry.
              </Text>
            </Pressable>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
