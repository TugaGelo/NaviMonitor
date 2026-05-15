import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect, Stack } from 'expo-router';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, Settings, Plus, Gauge, Banknote, Wallet, 
  History, ChevronRight, Fuel, Wrench, Rocket, 
  Car, Bike, LayoutGrid, Activity
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
        if (id && !isNaN(Number(id))) {
          try {
            setLoading(true);
            const vData = await VehicleRepository.getVehicleById(Number(id));
            const sData = await VehicleRepository.getVehicleStats(Number(id));
            const tData = await VehicleRepository.getVehicleTimeline(Number(id));
            
            if (vData) setVehicle(vData);
            if (sData) setStats(sData);
            if (tData) setTimeline(tData);
          } catch (error) {
            console.error("Dashboard DB Error:", error);
          } finally {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      };
      loadData();
    }, [id])
  );

  if (loading) {
    return (
      <View className="flex-1 bg-[#fcf9f8] items-center justify-center">
        <ActivityIndicator size="large" color="#b7102a" />
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View className="flex-1 bg-[#fcf9f8] items-center justify-center px-6">
        <Text className="text-lg font-bold text-[#1c1b1b] mb-4">Vehicle not found.</Text>
        <Pressable onPress={() => router.replace('/(tabs)')} className="bg-[#1b1b1b] px-6 py-3 rounded-lg">
          <Text className="text-white font-bold">Go to Garage</Text>
        </Pressable>
      </View>
    );
  }

  const distanceCovered = stats.currentOdo - vehicle.startingOdometer;
  const costPerKm = distanceCovered > 0 ? (stats.totalSpent / distanceCovered).toFixed(2) : "0.00";

  return (
    <SafeAreaView className="flex-1 bg-[#fcf9f8] relative" edges={['top']}>   
      <Stack.Screen options={{ headerShown: false }} />

      {/* Top App Bar */}
      <View className="bg-[#fcf9f8] flex-row justify-between items-center px-6 h-14 z-50">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2 active:opacity-50">
          <ArrowLeft size={24} color="#1c1b1b" />
        </Pressable>
        <Text className="text-[#b7102a] font-black text-[14px] tracking-[0.2em] uppercase">Garage</Text>
        <Pressable onPress={() => router.push(`/vehicle/edit/${vehicle.id}`)} className="p-2 -mr-2 active:opacity-50">
          <Settings size={22} color="#1c1b1b" />
        </Pressable>
      </View>

      <ScrollView 
        className="flex-1 px-6 pt-4" 
        contentContainerStyle={{ paddingBottom: 140 }} 
        showsVerticalScrollIndicator={false}
      >       
        {/* Typography Header */}
        <View className="flex-row justify-between items-start mb-8">
          <View className="flex-1 pr-4">
            <Text className="text-[40px] leading-tight font-black tracking-tight text-[#1c1b1b] uppercase">
              {vehicle.nickname}
            </Text>
            <View className="flex-row items-center flex-wrap gap-1 mt-1">
              <Text className="font-medium text-[#848484] text-[13px]">{vehicle.year}</Text>
              <Text className="text-[#cfc4c5] text-xs">•</Text>
              <Text className="font-medium text-[#848484] text-[13px]">{vehicle.make} {vehicle.model}</Text>
              <Text className="text-[#cfc4c5] text-xs">•</Text>
              <View className="flex-row items-center gap-1">
                <Gauge size={12} color="#848484" />
                <Text className="font-medium text-[#848484] text-[13px]">{stats.currentOdo.toLocaleString()} km</Text>
              </View>
            </View>
          </View>
          <View className="mt-2">
            {vehicle.vehicleType === 'Car' ? <Car size={40} color="#1c1b1b" strokeWidth={1.5} /> : <Bike size={40} color="#1c1b1b" strokeWidth={1.5} />}
          </View>
        </View>

        {/* Trinity Action Row */}
        <View className="flex-row gap-3 mb-8">
          <Pressable 
            onPress={() => router.push(`/vehicle/log/fuel?vehicleId=${vehicle.id}`)}
            className="flex-1 bg-[#1b1b1b] rounded-full py-3 flex-row items-center justify-center gap-1 active:scale-95 transition-transform"
          >
            <Plus size={16} color="#fff" />
            <Text className="text-white font-bold text-[13px]">Fuel</Text>
          </Pressable>
          <Pressable 
            onPress={() => router.push(`/vehicle/log/service?vehicleId=${vehicle.id}`)}
            className="flex-1 bg-[#b7102a] rounded-full py-3 flex-row items-center justify-center gap-1 active:scale-95 transition-transform"
          >
            <Plus size={16} color="#fff" />
            <Text className="text-white font-bold text-[13px]">Service</Text>
          </Pressable>
          <Pressable className="flex-1 bg-transparent border border-[#cfc4c5] rounded-full py-3 flex-row items-center justify-center gap-1 active:scale-95 transition-transform">
            <Plus size={16} color="#1c1b1b" />
            <Text className="text-[#1c1b1b] font-bold text-[13px]">Matrix</Text>
          </Pressable>
        </View>

        {/* Matrix Health Monitor */}
        <View className="bg-white border border-[#e5e2e1] rounded-2xl p-5 mb-6 shadow-sm shadow-black/5">
          <Text className="font-bold text-[16px] text-[#1c1b1b] mb-4">General Health</Text>
          <View className="w-full bg-[#f0eded] rounded-full h-2 mb-3 overflow-hidden">
            <View className="bg-[#10b981] h-2 rounded-full" style={{ width: '75%' }}></View>
          </View>
          <Text className="font-medium text-[#848484] text-[13px]">
            Next Service: <Text className="font-bold text-[#1c1b1b]">Oil Change in 1,200 km</Text>
          </Text>
        </View>

        {/* Performance Grid */}
        <View className="flex-row flex-wrap justify-between gap-y-3 mb-10">
          <View className="w-[48%] bg-white border border-[#e5e2e1] rounded-2xl p-4 flex-col justify-between h-[100px] shadow-sm shadow-black/5">
            <View className="flex-row items-center gap-1.5">
              <Banknote size={14} color="#848484" />
              <Text className="font-bold text-[#848484] uppercase tracking-wider text-[10px]">Total Spent</Text>
            </View>
            <View className="flex-row items-baseline">
              <Text className="text-[14px] font-bold text-[#1c1b1b] mr-0.5">₱</Text>
              <Text className="font-black text-[22px] text-[#1c1b1b] tracking-tight">{stats.totalSpent.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</Text>
            </View>
          </View>
          
          <View className="w-[48%] bg-white border border-[#e5e2e1] rounded-2xl p-4 flex-col justify-between h-[100px] shadow-sm shadow-black/5">
            <View className="flex-row items-center gap-1.5">
              <Gauge size={14} color="#848484" />
              <Text className="font-bold text-[#848484] uppercase tracking-wider text-[10px]">Avg Efficiency</Text>
            </View>
            <View className="flex-row items-baseline gap-1">
              <Text className="font-black text-[22px] text-[#1c1b1b] tracking-tight">{stats.avgEfficiency}</Text>
              <Text className="font-medium text-[#848484] text-[11px]">km/L</Text>
            </View>
          </View>

          <View className="w-[48%] bg-white border border-[#e5e2e1] rounded-2xl p-4 flex-col justify-between h-[100px] shadow-sm shadow-black/5">
            <View className="flex-row items-center gap-1.5">
              <Wallet size={14} color="#848484" />
              <Text className="font-bold text-[#848484] uppercase tracking-wider text-[10px]">Cost Per KM</Text>
            </View>
            <View className="flex-row items-baseline">
              <Text className="text-[14px] font-bold text-[#1c1b1b] mr-0.5">₱</Text>
              <Text className="font-black text-[22px] text-[#1c1b1b] tracking-tight">{costPerKm}</Text>
            </View>
          </View>

          <View className="w-[48%] bg-white border border-[#e5e2e1] rounded-2xl p-4 flex-col justify-between h-[100px] shadow-sm shadow-black/5">
            <View className="flex-row items-center gap-1.5">
              <History size={14} color="#848484" />
              <Text className="font-bold text-[#848484] uppercase tracking-wider text-[10px]">Current Odo</Text>
            </View>
            <View className="flex-row items-baseline gap-1">
              <Text className="font-black text-[22px] text-[#1c1b1b] tracking-tight">{stats.currentOdo.toLocaleString()}</Text>
              <Text className="font-medium text-[#848484] text-[11px]">km</Text>
            </View>
          </View>
        </View>

        {/* Recent Logs */}
        <View className="flex-col mb-4">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-[22px] font-black text-[#1c1b1b] tracking-tight">Recent Logs</Text>
            <Pressable 
              onPress={() => router.push(`/vehicle/log/history?vehicleId=${vehicle.id}`)}
              className="flex-row items-center gap-1 active:opacity-50"
            >
              <Text className="text-[13px] font-bold text-[#848484]">View All</Text>
              <ChevronRight size={16} color="#848484" />
            </Pressable>
          </View>

          {timeline.length === 0 ? (
            <View className="py-10 border-2 border-dashed border-[#e5e2e1] rounded-2xl items-center justify-center">
              <Text className="text-[#848484] font-bold text-[11px] uppercase tracking-widest">No logs recorded yet</Text>
            </View>
          ) : (
            <View className="ml-5 pl-7 border-l border-dashed border-[#cfc4c5] flex-col space-y-8 py-2">
              {timeline.slice(0, 3).map((log, idx) => {
                const isFuel = log.feedType === 'Refuel';
                const isMod = log.feedType === 'Modification';
                return (
                  <View key={`${log.feedType}-${log.id}-${idx}`} className="relative flex-row justify-between items-start">
                    <View className={`absolute -left-[45px] top-0 w-8 h-8 rounded-full border-4 border-[#fcf9f8] flex items-center justify-center z-10 ${isFuel ? 'bg-[#1b1b1b]' : 'bg-[#b7102a]'}`}>
                      {isFuel ? <Fuel size={14} color="#fff" /> : (isMod ? <Rocket size={14} color="#fff" /> : <Wrench size={14} color="#fff" />)}
                    </View>
                    
                    <View className="flex-1 pr-4 mt-0.5">
                      <Text className="text-[13px] font-bold uppercase tracking-wide text-[#1c1b1b]">{isFuel ? 'Fuel Refill' : log.serviceType}</Text>
                      <Text className="text-[12px] font-medium text-[#848484] mt-1">
                        {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {isFuel ? `${log.volume}L` : (log.isDIY ? 'DIY' : (log.shopName || 'Shop'))}
                      </Text>
                    </View>

                    <View className="items-end mt-0.5">
                      <Text className="text-[15px] font-black text-[#1c1b1b]">- ₱{(isFuel ? log.totalCost : log.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Bottom Nav (The Trinity) */}
      <View className="absolute bottom-8 left-0 right-0 items-center pointer-events-box-none z-50">
        <View className="flex-row items-center justify-between bg-[rgba(255,255,255,0.95)] px-2 py-2 rounded-full w-[85%] max-w-[340px] shadow-lg shadow-black/10 border border-[#e5e2e1]">
          
          {/* Active: Dashboard */}
          <Pressable className="flex-col items-center justify-center bg-[#f6f3f2] rounded-full w-[30%] py-2.5">
            <LayoutGrid size={20} color="#b7102a" strokeWidth={2.5} />
            <Text className="font-bold text-[#b7102a] text-[9px] uppercase tracking-wider mt-1">Dash</Text>
          </Pressable>

          {/* Inactive: Logs */}
          <Pressable 
            onPress={() => router.push(`/vehicle/log/history?vehicleId=${vehicle.id}`)}
            className="flex-col items-center justify-center w-[30%] py-2.5 opacity-60 active:opacity-100"
          >
            <History size={20} color="#1c1b1b" strokeWidth={2} />
            <Text className="font-bold text-[#1c1b1b] text-[9px] uppercase tracking-wider mt-1">Logs</Text>
          </Pressable>

          {/* Inactive: Matrix */}
          <Pressable className="flex-col items-center justify-center w-[30%] py-2.5 opacity-60 active:opacity-100">
            <Activity size={20} color="#1c1b1b" strokeWidth={2} />
            <Text className="font-bold text-[#1c1b1b] text-[9px] uppercase tracking-wider mt-1">Matrix</Text>
          </Pressable>

        </View>
      </View>

    </SafeAreaView>
  );
}
