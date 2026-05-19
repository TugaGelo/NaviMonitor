import { View, Text, Pressable } from 'react-native';
import { Plus } from 'lucide-react-native';

interface GarageEmptyStateProps {
  onPress: () => void;
}

export default function GarageEmptyState({ onPress }: GarageEmptyStateProps) {
  return (
    <Pressable 
      className="mt-6 border-2 border-dashed border-[#e5e2e1] rounded-2xl p-8 items-center justify-center min-h-[200px] active:opacity-50"
      onPress={onPress}
    >
      <View className="w-16 h-16 rounded-full bg-[#f0eded] items-center justify-center mb-4">
        <Plus size={32} color="#1c1b1b" />
      </View>
      <Text className="text-[18px] text-[#1c1b1b] font-black uppercase tracking-tight">Add Vehicle</Text>
      <Text className="text-[#848484] font-medium text-[13px] text-center mt-2">
        Register your first unit to begin tracking telemetry.
      </Text>
    </Pressable>
  );
}
