import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Car, ArrowRight } from 'lucide-react-native';
import { Vehicle } from '../types';

type VehicleWithStats = Vehicle & { currentOdo: number };

interface VehicleCardProps {
  vehicle: VehicleWithStats;
  onRefresh: () => void;
  onLongPress: () => void;
}

export default function VehicleCard({ vehicle, onRefresh, onLongPress }: VehicleCardProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/vehicle/${vehicle.id}`)}
      onLongPress={onLongPress}
      className="bg-[#ffffff] border border-[#e5e2e1] rounded-xl p-4 mb-4 active:bg-[#fcf9f8] relative"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
      }}
    >
      {/* Absolute Positioned Status Pill */}
      <View className="absolute top-4 right-4 flex-row items-center bg-[#f0eded] px-3 py-1 rounded-full border border-[#e5e2e1] z-10">
        <View className="w-1.5 h-1.5 rounded-full bg-[#000000] mr-1.5" />
        <Text className="font-bold text-[9px] text-[#000000] uppercase tracking-widest">
          Nominal
        </Text>
      </View>

      <View className="flex-col">
        <View className="flex-row items-center mb-4 pr-24"> 
          <View className="w-12 h-12 bg-[#f0eded] rounded-lg items-center justify-center mr-3">
            <Car size={24} color="#000000" strokeWidth={1.5} />
          </View>
          
          <View className="flex-1 justify-center">
            <Text className="font-extrabold text-xl text-[#000000] uppercase tracking-tighter" numberOfLines={1}>
              {vehicle.nickname || vehicle.make}
            </Text>
            <Text className="font-bold text-[10px] text-[#848484] uppercase tracking-widest mt-0.5" numberOfLines={1}>
              {vehicle.year ? `${vehicle.year} ` : ''}{vehicle.make} {vehicle.model}
            </Text>
          </View>
        </View>

        <View className="flex-row border-t border-[#e5e2e1] pt-3 mb-3">
          <View className="flex-1 border-r border-[#e5e2e1] pr-2">
            <Text className="font-bold text-[9px] text-[#848484] uppercase tracking-widest mb-1">Plate Reg</Text>
            <Text className="font-mono text-sm text-[#000000] font-bold tracking-widest" numberOfLines={1}>
              {vehicle.licensePlate || 'N/A'}
            </Text>
          </View>
          <View className="flex-1 pl-4">
            <Text className="font-bold text-[9px] text-[#848484] uppercase tracking-widest mb-1">Reg Expiry</Text>
            <Text className="font-mono text-sm text-[#000000] font-bold tracking-widest" numberOfLines={1}>
              {vehicle.registrationExpiry || 'NOT SET'}
            </Text>
          </View>
        </View>

        <View className="border-t border-[#e5e2e1] pt-3 flex-row justify-between items-end">
          <View>
            <Text className="font-bold text-[9px] text-[#848484] uppercase tracking-widest mb-1">Current Odometer</Text>
            <View className="flex-row items-baseline">
              <Text className="font-extrabold text-2xl text-[#000000] tracking-tighter">
                {vehicle.currentOdo.toLocaleString()}
              </Text>
              <Text className="font-bold text-xs text-[#848484] ml-1">KM</Text>
            </View>
          </View>
          <ArrowRight size={18} color="#848484" />
        </View>
      </View>
    </Pressable>
  );
}
