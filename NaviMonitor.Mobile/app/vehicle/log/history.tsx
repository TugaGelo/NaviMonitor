import { View, Text, Pressable, SectionList, ActivityIndicator } from 'react-native';
import { useState, useCallback, useMemo } from 'react';
import { useRouter, useLocalSearchParams, useFocusEffect, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Fuel, Wrench, Rocket } from 'lucide-react-native';
import { VehicleRepository } from '../../../lib/localRepository';

type FilterType = 'All' | 'Fuel' | 'Service' | 'Mods';

export default function VehicleLogbookScreen() {
  const router = useRouter();
  const { vehicleId } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [rawLogs, setRawLogs] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          setLoading(true);
          if (vehicleId) {
            const tData = await VehicleRepository.getVehicleTimeline(Number(vehicleId));
            setRawLogs(tData || []);
          }
        } catch (error) {
          console.error("💥 DB ERROR:", error);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }, [vehicleId])
  );

  const filteredLogs = useMemo(() => {
    if (activeFilter === 'All') return rawLogs;
    if (activeFilter === 'Fuel') return rawLogs.filter(l => l.feedType === 'Refuel');
    if (activeFilter === 'Service') return rawLogs.filter(l => l.feedType === 'Maintenance');
    if (activeFilter === 'Mods') return rawLogs.filter(l => l.feedType === 'Modification');
    return rawLogs;
  }, [rawLogs, activeFilter]);

  const sectionedLogs = useMemo(() => {
    const groups = filteredLogs.reduce((acc, log) => {
      const d = new Date(log.date);
      const monthYear = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
      if (!acc[monthYear]) acc[monthYear] = [];
      acc[monthYear].push(log);
      return acc;
    }, {} as Record<string, any[]>);

    return Object.keys(groups).map(key => ({ title: key, data: groups[key] }));
  }, [filteredLogs]);

  const filteredTotal = filteredLogs.reduce((sum, log) => sum + (log.feedType === 'Refuel' ? log.totalCost : log.price), 0);
  const filteredCount = filteredLogs.length;

  if (loading) {
    return (
      <View className="flex-1 bg-[#fcf9f8] items-center justify-center">
        <ActivityIndicator size="large" color="#b7102a" />
      </View>
    );
  }

  const renderTimelineItem = ({ item, index, section }: any) => {
    const isFuel = item.feedType === 'Refuel';
    const isMod = item.feedType === 'Modification';
    const cost = isFuel ? item.totalCost : item.price;
    const isLastItem = index === section.data.length - 1;

    return (
      <View className="flex-row px-6">
        <View className="items-center w-6 mr-4">
          {!isLastItem && (
            <View className="absolute top-8 bottom-[-32px] w-[1px] border-l border-dashed border-[#dcd9d9]" />
          )}
          
          <View className={`w-6 h-6 rounded-full border-2 border-[#fcf9f8] flex items-center justify-center z-10 ${isFuel ? 'bg-[#1b1b1b]' : 'bg-[#b7102a]'}`}>
            {isFuel ? <Fuel size={12} color="#fff" /> : isMod ? <Rocket size={12} color="#fff" /> : <Wrench size={12} color="#fff" />}
          </View>
        </View>

        <View className="flex-1 pb-8 flex-row justify-between items-start">
          <View className="flex-1 pr-2">
            <Text className="text-sm font-bold uppercase tracking-wide text-[#1c1b1b]">
              {isFuel ? 'Fuel Refill' : item.serviceType}
            </Text>
            <Text className="text-xs text-[#848484] mt-0.5">
              {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {isFuel ? `${item.volume}L` : (item.isDIY ? 'DIY' : (item.shopName || 'Shop'))}
            </Text>
          </View>

          <View className="items-end">
            <Text className="text-sm font-black text-[#1c1b1b]">
              - ₱{cost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </Text>
            <Text className="text-[11px] text-[#838484] mt-0.5 font-medium">
              {item.odometer.toLocaleString()} km
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fcf9f8]" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-[#fcf9f8] flex-row justify-between items-center px-6 h-16 border-b border-[#e5e2e1] z-50">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2 active:opacity-50">
          <ArrowLeft size={24} color="#1c1b1b" />
        </Pressable>
        <Text className="text-[#1c1b1b] font-black text-lg tracking-tighter uppercase">History</Text>
        <Pressable className="p-2 -mr-2 active:opacity-50">
          <Search size={24} color="#1c1b1b" />
        </Pressable>
      </View>

      <View className="px-6 py-4 bg-[#fcf9f8]">
        <View className="flex-row bg-[#f0eded] p-1.5 rounded-2xl w-full border border-[#e5e2e1]">
          {(['All', 'Fuel', 'Service', 'Mods'] as FilterType[]).map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <Pressable 
                key={filter} 
                onPress={() => setActiveFilter(filter)} 
                className={`flex-1 items-center justify-center py-2.5 rounded-xl ${isActive ? 'bg-[#1b1b1b]' : 'bg-transparent'}`}
                style={isActive ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 } : {}}
              >
                <Text className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-[#848484]'}`}>
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <SectionList
        sections={sectionedLogs}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderTimelineItem}
        stickySectionHeadersEnabled={true}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
            <View className="px-6 mb-4">
                <View className="bg-white border border-[#e5e2e1] rounded-2xl p-5 flex-row items-center justify-between shadow-sm shadow-black/5">
                    <View>
                        <Text className="text-[10px] font-black text-[#848484] uppercase tracking-widest mb-1">Filtered Total</Text>
                        <Text className="text-2xl font-black text-[#1c1b1b]">₱{filteredTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
                    </View>
                    <View className="items-end">
                        <Text className="text-[10px] font-black text-[#848484] uppercase tracking-widest mb-1">Logs</Text>
                        <Text className="text-xl font-black text-[#1c1b1b]">{filteredCount}</Text>
                    </View>
                </View>
            </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View className="bg-[#fcf9f8] pt-6 pb-4 px-6">
             <Text className="text-[10px] font-black text-[#848484] uppercase tracking-[2px]">{title}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
