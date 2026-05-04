import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function Page() {
  return (
    // The bg-zinc-50 class is handled by the Babel plugin + tailwind.config.js
    <View className="flex-1 items-center justify-center bg-zinc-50">
      
      {/* The "Industrial Noir" Card */}
      <View className="bg-white rounded-2xl border border-zinc-200 p-8 items-center w-[85%] shadow-sm">
        <Text className="text-5xl font-black text-black uppercase tracking-tighter mb-2">
          NAVI
        </Text>
        
        <Text className="text-secondary text-xs font-black tracking-[4px] uppercase mb-6">
          Mobile Link
        </Text>
        
        <View className="w-12 h-1 bg-black rounded-full" />
      </View>

      <StatusBar style="dark" />
    </View>
  );
}
