import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Car, Bike } from 'lucide-react-native';
import { Vehicle } from '../types';

interface VehicleCardProps {
  vehicle: Vehicle & { currentOdo?: number };
  onRefresh?: () => void;
  onLongPress?: () => void;
}

export default function VehicleCard({ vehicle, onRefresh, onLongPress }: VehicleCardProps) {
  const router = useRouter();
  
  const displayOdo = vehicle.currentOdo || vehicle.startingOdometer;
  const isCar = vehicle.vehicleType === 'Car';

  // Placeholder percentage until we build the Maintenance Matrix calculation!
  const healthPercentage = 85; 

  return (
    <Pressable 
      className="flex-col rounded-2xl overflow-hidden border border-[#e5e2e1] bg-white shadow-sm shadow-black/5 mb-5 active:scale-[0.98] transition-transform"
      onPress={() => router.push(`/vehicle/${vehicle.id}`)}
      onLongPress={onLongPress}
      delayLongPress={300}
    >
      {/* Top Black Header Section */}
      <View className="bg-[#1c1b1b] p-6 relative overflow-hidden">
        {/* Massive Watermark Icon */}
        <View className="absolute -right-8 -bottom-10 opacity-10">
          {isCar ? (
            <Car size={160} color="#ffffff" strokeWidth={1} />
          ) : (
            <Bike size={160} color="#ffffff" strokeWidth={1} />
          )}
        </View>
        
        {/* Nickname */}
        <Text className="text-[32px] font-black text-white uppercase tracking-tight z-10" numberOfLines={1}>
          {vehicle.nickname}
        </Text>
      </View>

      {/* Bottom Telemetry Section */}
      <View className="p-5 flex-col">
        <Text className="text-[12px] text-[#848484] uppercase tracking-wide font-bold mb-4">
          {vehicle.year} {vehicle.make} {vehicle.model} • {displayOdo.toLocaleString()} km
        </Text>
        
        {/* Service Health Progress Bar */}
        <View className="flex-col gap-1.5 mt-1">
          <View className="flex-row justify-between items-center">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-[#848484]">Service Health</Text>
            <Text className="text-[11px] font-black text-[#1c1b1b]">{healthPercentage}%</Text>
          </View>
          <View className="h-2 w-full bg-[#f0eded] rounded-full overflow-hidden">
            <View 
              className="h-full bg-[#b7102a] rounded-full" 
              style={{ width: `${healthPercentage}%` }} 
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
