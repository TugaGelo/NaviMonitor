import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { VehicleRepository } from '../../lib/localRepository';
import { Vehicle } from '../../types';
import VehicleCard from '../../components/VehicleCard';

export default function GarageScreen() {
  const router = useRouter();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const data = await VehicleRepository.getVehicles();
    setVehicles(data);
    setIsLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      
      <View className="px-6 mt-4 mb-6 flex-row justify-between items-end">
        <View>
          <Text className="text-primary text-3xl font-black tracking-tight">Your Fleet</Text>
          <Text className="text-on-surface-variant text-sm mt-1 font-medium">Manage and monitor vehicle telemetry.</Text>
        </View>
      </View>

      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id.toString()}
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
              className="bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-2xl p-8 items-center justify-center min-h-[200px]"
              onPress={() => router.push('/vehicle/create')}
            >
              <View className="w-16 h-16 rounded-full bg-surface-container items-center justify-center mb-4">
                <Plus size={32} color="#000" />
              </View>
              <Text className="text-primary text-lg font-bold">Add Vehicle</Text>
              <Text className="text-on-surface-variant text-center mt-2">Register a new unit to your tracking dashboard.</Text>
            </Pressable>
          ) : null
        }
      />

      <Pressable 
        onPress={() => router.push('/vehicle/create')}
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center"
        style={{ elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 }}
      >
        <Plus size={28} color="#fff" />
      </Pressable>

    </SafeAreaView>
  );
}
