import { View, FlatList, Pressable, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Plus, Banknote, Gauge } from 'lucide-react-native';

import { VehicleRepository } from '../../lib/localRepository';
import { Vehicle } from '../../types';
import VehicleCard from '../../components/VehicleCard';

import PageHeader from '../../components/vehicle/PageHeader';
import StatCard from '../../components/vehicle/StatCard';
import ActionSheet from '../../components/ui/ActionSheet';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

type VehicleWithStats = Vehicle & { currentOdo: number };

export default function GarageScreen() {
  const router = useRouter();

  const [vehicles, setVehicles] = useState<VehicleWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fleetStats, setFleetStats] = useState({ totalSpend: 0, totalKm: 0 });
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithStats | null>(null);

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

  const handleLongPress = (vehicle: VehicleWithStats) => {
    setSelectedVehicle(vehicle);
    setIsSheetVisible(true);
  };

  const handleEdit = () => {
    setIsSheetVisible(false);
    if (selectedVehicle) {
      router.push({ pathname: '/vehicle/create', params: { editId: selectedVehicle.id } });
    }
  };

  const handleDeleteTrigger = () => {
    setIsSheetVisible(false);
    if (selectedVehicle) {
      setTimeout(() => {
        setIsConfirmVisible(true);
      }, 300);
    }
  };

  const executeDelete = async () => {
    setIsConfirmVisible(false);
    if (selectedVehicle) {
      try {
        await VehicleRepository.deleteVehicle(selectedVehicle.id!);
        loadData(); 
      } catch (error) {
        Alert.alert("Error", "Could not delete the vehicle.");
      }
    }
  };

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

      <View className="flex-row justify-between px-6 gap-y-3 mb-4">
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

      {vehicles.length > 0 && (
        <View className="px-6 mb-4">
          <Text className="text-[10px] font-black text-[#848484] uppercase tracking-widest">
            Tip: Press and hold a vehicle card to manage it
          </Text>
        </View>
      )}

      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id!.toString()}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <VehicleCard 
            vehicle={item} 
            onRefresh={loadData}
            onLongPress={() => handleLongPress(item)}
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

      <ActionSheet 
        visible={isSheetVisible}
        title={selectedVehicle?.nickname ? `Manage ${selectedVehicle.nickname.toUpperCase()}` : "MANAGE VEHICLE"}
        onEdit={handleEdit}
        onDelete={handleDeleteTrigger}
        onCancel={() => setIsSheetVisible(false)}
      />

      <ConfirmDialog 
        visible={isConfirmVisible}
        title="Delete Vehicle"
        description="Are you sure you want to remove this vehicle? This will delete all associated logs and history."
        highlightedText={selectedVehicle?.nickname}
        onCancel={() => setIsConfirmVisible(false)}
        onConfirm={executeDelete}
      />

    </SafeAreaView>
  );
}
