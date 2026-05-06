import { View, Text, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function VehicleDashboard() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View className="flex-1 bg-surface pt-12 px-6">
      <View className="flex-row items-center justify-between mb-8">
        <Pressable 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center bg-surface-container-high active:opacity-80"
        >
          <ArrowLeft size={24} color="#000" />
        </Pressable>
        <Text className="text-primary text-xl font-black tracking-tight">Vehicle {id}</Text>
        <View className="w-10" />
      </View>

      <View className="items-center justify-center flex-1">
        <Text className="text-on-surface-variant font-medium">Dashboard layout coming next.</Text>
      </View>
    </View>
  );
}
