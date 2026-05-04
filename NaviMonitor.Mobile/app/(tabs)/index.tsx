import { StatusBar } from 'expo-status-bar';
import { Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, CarFront, Bike } from 'lucide-react-native';

export default function GarageScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <StatusBar style="dark" />
      <View className="flex-row justify-between items-center px-6 py-4 border-b border-surface-variant bg-white">
        <View className="p-2 rounded-full"><Menu size={24} color="#1c1b1b" /></View>
        <View className="flex-row items-center gap-2">
          <Text className="font-black tracking-widest uppercase text-xl text-primary">GARAGE</Text>
          <View className="w-2 h-2 rounded-full bg-secondary" />
        </View>
        <View className="p-2"><View className="w-6 h-6" /></View>
      </View>
      <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View className="gap-4 flex-col justify-between">
          <View className="bg-surface-container-low rounded-xl p-6 border border-surface-variant w-full overflow-hidden relative">
            <View className="flex-row justify-between items-start z-10">
              <View>
                <Text className="text-xl font-bold text-on-surface">THUNDER</Text>
                <Text className="text-sm text-on-surface-variant font-medium">Honda Navi</Text>
              </View>
              <Bike size={28} color="#a1a1aa" opacity={0.5} />
            </View>
            <View className="z-10 mt-8">
              <Text className="text-4xl font-bold tracking-tighter text-on-surface">3,500 <Text className="text-lg font-normal text-on-surface-variant tracking-normal">km</Text></Text>
              <Text className="text-xs font-bold text-on-surface-variant mt-2 tracking-widest uppercase">2023 • B894-GE</Text>
            </View>
            <Text className="absolute -bottom-8 -right-4 text-9xl font-black italic text-on-surface opacity-5">T</Text>
          </View>
          <View className="bg-surface-container-low rounded-xl p-6 border border-surface-variant w-full overflow-hidden relative mt-4">
            <View className="flex-row justify-between items-start z-10">
              <View>
                <Text className="text-xl font-bold text-on-surface">RECON</Text>
                <Text className="text-sm text-on-surface-variant font-medium">Dual Sport</Text>
              </View>
              <Bike size={28} color="#a1a1aa" opacity={0.5} />
            </View>
            <View className="z-10 mt-8">
              <Text className="text-4xl font-bold tracking-tighter text-on-surface">1,240 <Text className="text-lg font-normal text-on-surface-variant tracking-normal">km</Text></Text>
              <Text className="text-xs font-bold text-on-surface-variant mt-2 tracking-widest uppercase">2024 • R210-XT</Text>
            </View>
            <Text className="absolute -bottom-8 -right-4 text-9xl font-black italic text-on-surface opacity-5">R</Text>
          </View>
          <View className="bg-surface-container-low rounded-xl p-6 border border-surface-variant w-full overflow-hidden relative mt-4">
            <View className="flex-row justify-between items-start z-10">
              <View>
                <Text className="text-xl font-bold text-on-surface">THE PANDA</Text>
                <Text className="text-sm text-on-surface-variant font-medium">AE86 Coupe</Text>
              </View>
              <CarFront size={28} color="#a1a1aa" opacity={0.5} />
            </View>
            <View className="z-10 mt-8 flex-row justify-between items-end">
              <View>
                <Text className="text-4xl font-bold tracking-tighter text-on-surface">142,080 <Text className="text-lg font-normal text-on-surface-variant tracking-normal">km</Text></Text>
                <Text className="text-xs font-bold text-on-surface-variant mt-2 tracking-widest uppercase">1986 • TRUENO</Text>
              </View>
              <View className="bg-surface-variant px-3 py-1 rounded-full">
                <Text className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Needs Service</Text>
              </View>
            </View>
            <Text className="absolute -bottom-12 -right-2 text-[120px] font-black italic text-on-surface opacity-5">P</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
