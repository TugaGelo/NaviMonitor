import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect, Stack } from 'expo-router';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, Edit2, Gauge, Banknote, Wallet, 
  History, AlertTriangle, ChevronRight, Fuel, Wrench, 
  Car, Bike, BarChart3
} from 'lucide-react-native';
import { VehicleRepository } from '../../lib/localRepository';
import { Vehicle } from '../../types';

export default function VehicleDashboard() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [stats, setStats] = useState({ totalSpent: 0, currentOdo: 0, avgEfficiency: "0.0" });
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        if (id) {
          const vData = await VehicleRepository.getVehicleById(Number(id));
          const sData = await VehicleRepository.getVehicleStats(Number(id));
          const tData = await VehicleRepository.getVehicleTimeline(Number(id));
          
          if (vData) setVehicle(vData);
          if (sData) setStats(sData);
          if (tData) setTimeline(tData);
          setLoading(false);
        }
      };
      loadData();
    }, [id])
  );

  if (loading || !vehicle) {
    return (
      <View className="flex-1 bg-[#fcf9f8] items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const distanceCovered = stats.currentOdo - vehicle.startingOdometer;
  const costPerKm = distanceCovered > 0 ? (stats.totalSpent / distanceCovered).toFixed(2) : "0.00";

  return (
    <SafeAreaView className="flex-1 bg-[#fcf9f8] relative" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="bg-[#fcf9f8] flex-row justify-between items-center px-6 h-16 border-b border-[#e5e2e1] z-50">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2 active:opacity-50">
          <ArrowLeft size={24} color="#1c1b1b" />
        </Pressable>
        <Text className="text-[#1c1b1b] font-black text-lg tracking-tighter uppercase">Vehicle Hub</Text>
        <Pressable onPress={() => router.push(`/vehicle/edit/${vehicle.id}`)} className="p-2 -mr-2 active:opacity-50">
          <Edit2 size={20} color="#1c1b1b" />
        </Pressable>
      </View>
      
      <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 200 }} showsVerticalScrollIndicator={false}>
        <View className="bg-[#1b1b1b] rounded-2xl flex-col justify-end min-h-[140px] p-5 mb-6 shadow-sm overflow-hidden relative">
          <View className="z-10">
            <Text className="text-white text-4xl font-black uppercase tracking-tighter mb-2">{vehicle.nickname}</Text>
            <View className="flex-row items-center flex-wrap gap-2">
              <Text className="text-zinc-400 font-bold text-xs">{vehicle.year}</Text>
              <Text className="text-zinc-600">•</Text>
              <Text className="text-zinc-400 font-bold text-xs">{vehicle.make} {vehicle.model}</Text>
              <Text className="text-zinc-600">•</Text>
              <View className="flex-row items-center gap-1">
                <Gauge size={14} color="#fff" />
                <Text className="text-white font-bold text-xs uppercase tracking-wider">{stats.currentOdo.toLocaleString()} KM</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="flex-row flex-wrap justify-between gap-y-4 mb-6">
          <View className="w-[48%] bg-white border border-[#e5e2e1] rounded-xl p-4 flex-col justify-between shadow-sm">
            <View className="flex-row items-center mb-2 gap-1">
              <Banknote size={16} color="#848484" className="mr-2" />
              <Text className="text-[10px] font-bold text-[#848484] uppercase tracking-wider">Total Spent</Text>
            </View>
            <Text className="text-xl font-bold text-[#1c1b1b]">₱{stats.totalSpent.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</Text>
          </View>
          
          <View className="w-[48%] bg-white border border-[#e5e2e1] rounded-xl p-4 flex-col justify-between shadow-sm">
            <View className="flex-row items-center mb-2 gap-1">
              <Gauge size={16} color="#848484" className="mr-2" />
              <Text className="text-[10px] font-bold text-[#848484] uppercase tracking-wider">Efficiency</Text>
            </View>
            <Text className="text-xl font-bold text-[#1c1b1b]">{stats.avgEfficiency} <Text className="text-sm font-normal text-[#848484]">km/L</Text></Text>
          </View>

          <View className="w-[48%] bg-white border border-[#e5e2e1] rounded-xl p-4 flex-col justify-between shadow-sm">
            <View className="flex-row items-center mb-2 gap-1">
              <Wallet size={16} color="#848484" className="mr-2" />
              <Text className="text-[10px] font-bold text-[#848484] uppercase tracking-wider">Cost Per Km</Text>
            </View>
            <Text className="text-xl font-bold text-[#1c1b1b]">₱{costPerKm}</Text>
          </View>

          <View className="w-[48%] bg-white border border-[#e5e2e1] rounded-xl p-4 flex-col justify-between shadow-sm">
            <View className="flex-row items-center mb-2 gap-1">
              <History size={16} color="#848484" className="mr-2" />
              <Text className="text-[10px] font-bold text-[#848484] uppercase tracking-wider">Current Odo</Text>
            </View>
            <Text className="text-xl font-bold text-[#1c1b1b]">{stats.currentOdo.toLocaleString()} <Text className="text-sm font-normal text-[#848484]">km</Text></Text>
          </View>
        </View>

        <View className="bg-white border border-[#ffdad6] rounded-xl p-4 mb-8 shadow-sm">
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <AlertTriangle size={18} color="#b7102a" />
              <Text className="text-xs font-bold uppercase tracking-wider text-[#b7102a]">Maintenance Health</Text>
            </View>
            <View className="bg-[#ffdad6] px-2 py-1 rounded-full">
              <Text className="text-[10px] font-bold text-[#93000a]">Matrix Pending</Text>
            </View>
          </View>
          <View className="w-full bg-[#f0eded] rounded-full h-2">
            <View className="bg-[#b7102a] h-2 rounded-full" style={{ width: '100%' }}></View>
          </View>
        </View>

        <View className="flex-col mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-[#1c1b1b]">Recent Logs</Text>
            <Pressable className="flex-row items-center gap-1 active:opacity-50">
              <Text className="text-sm font-medium text-[#848484]">View All</Text>
              <ChevronRight size={16} color="#848484" />
            </Pressable>
          </View>

          {timeline.length === 0 ? (
            <View className="py-8 border-2 border-dashed border-[#e5e2e1] rounded-2xl items-center justify-center">
              <Text className="text-[#848484] font-bold text-xs uppercase tracking-widest">No logs recorded yet</Text>
            </View>
          ) : (
            <View className="ml-4 pl-6 border-l border-dashed border-[#dcd9d9] flex-col gap-8 py-2">
              {timeline.slice(0, 5).map((log, idx) => {
                const isFuel = log.feedType === 'Refuel';
                return (
                  <View key={`${log.feedType}-${log.id}-${idx}`} className="relative flex-row items-center justify-between">
                    <View className={`absolute -left-[37px] top-1/2 -translate-y-[12px] w-6 h-6 rounded-full border-2 border-[#fcf9f8] flex items-center justify-center z-10 ${isFuel ? 'bg-[#1b1b1b]' : 'bg-[#b7102a]'}`}>
                      {isFuel ? <Fuel size={12} color="#fff" /> : <Wrench size={12} color="#fff" />}
                    </View>
                    
                    <View className="flex-1">
                      <Text className="text-sm font-bold uppercase tracking-wide text-[#1c1b1b]">{isFuel ? 'Fuel Refill' : log.serviceType}</Text>
                      <Text className="text-xs text-[#848484] mt-0.5">
                        {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {isFuel ? `${log.volume}L` : (log.isDIY ? 'DIY' : 'Shop')}
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text className="text-sm font-black text-[#1c1b1b]">- ₱{(isFuel ? log.totalCost : log.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <View className="absolute bottom-[90px] left-0 right-0 px-6 z-40">
        <View className="flex-row gap-3">
          <Pressable 
            onPress={() => alert('Log Fuel Screen Coming Next!')}
            className="flex-1 bg-[#1b1b1b] py-3.5 rounded-xl flex-row items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-black/20"
          >
            <Fuel size={18} color="#fff" />
            <Text className="text-white font-bold text-sm">Log Fuel</Text>
          </Pressable>
          <Pressable 
            onPress={() => alert('Log Service Screen Coming Next!')}
            className="flex-1 bg-[#b7102a] py-3.5 rounded-xl flex-row items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-red-900/20"
          >
            <Wrench size={18} color="#fff" />
            <Text className="text-white font-bold text-sm">Log Service</Text>
          </Pressable>
        </View>
      </View>

      <View className="absolute bottom-0 w-full bg-white border-t border-[#e5e2e1] flex-row justify-around items-center h-[80px] pb-5 z-50">
        <Pressable onPress={() => router.push('/(tabs)')} className="flex-col items-center justify-center w-16 opacity-100 relative group">
          <View className="absolute bg-[#ffdad8] rounded-full w-10 h-10 -z-10 opacity-50" />
          {vehicle.vehicleType === 'Car' ? <Car size={22} color="#b7102a" /> : <Bike size={22} color="#b7102a" />}
          <Text className="text-[10px] font-bold text-[#b7102a] mt-1">Garage</Text>
        </Pressable>
        
        <Pressable className="flex-col items-center justify-center w-16 opacity-50">
          <Fuel size={22} color="#4c4546" />
          <Text className="text-[10px] font-bold text-[#4c4546] mt-1">Logs</Text>
        </Pressable>

        <Pressable className="flex-col items-center justify-center w-16 opacity-50">
          <Wrench size={22} color="#4c4546" />
          <Text className="text-[10px] font-bold text-[#4c4546] mt-1">Service</Text>
        </Pressable>

        <Pressable className="flex-col items-center justify-center w-16 opacity-50">
          <BarChart3 size={22} color="#4c4546" />
          <Text className="text-[10px] font-bold text-[#4c4546] mt-1">Stats</Text>
        </Pressable>
      </View>

    </SafeAreaView>
  );
}
