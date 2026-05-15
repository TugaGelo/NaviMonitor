import { View, Text, Pressable, ScrollView, ActivityIndicator, SectionList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect, Stack } from 'expo-router';
import { useState, useCallback, useRef, useMemo, memo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, Settings, Plus, Gauge, Banknote, Wallet, 
  History as HistoryIcon, ChevronRight, Fuel, Wrench, 
  Rocket, Car, Bike, Search, Activity, Calendar, TrendingUp, Clock, Inbox
} from 'lucide-react-native';
import PagerView from 'react-native-pager-view';
import { VehicleRepository } from '../../lib/localRepository';
import TrinityNav from '../../components/ui/TrinityNav';
import ActionSheet from '../../components/ui/ActionSheet';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Vehicle } from '../../types';
import { calculateTabStats } from '../../lib/statsEngine';

const DashboardTab = memo(({ vehicle, stats, timeline, onGoToLogs }: any) => {
  const router = useRouter();
  const distanceCovered = stats.currentOdo - vehicle.startingOdometer;
  const costPerKm = distanceCovered > 0 ? (stats.totalSpent / distanceCovered).toFixed(2) : "0.00";

  return (
    <ScrollView className="flex-1 px-6 pt-4 bg-[#fcf9f8]" contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>       
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
            <HistoryIcon size={14} color="#848484" />
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
          <Pressable onPress={onGoToLogs} className="flex-row items-center gap-1 active:opacity-50">
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
            {timeline.slice(0, 3).map((log: any, idx: number) => {
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
  );
});

const LogsTab = memo(({ vehicle, rawLogs, onLogPress }: any) => {
  const FILTER_TABS = ['All', 'Fuel', 'Service', 'Mods'];
  const [activeFilter, setActiveFilter] = useState('All');

  const { sections, stats } = useMemo(() => {
    let filtered = rawLogs;
    if (activeFilter === 'Fuel') filtered = rawLogs.filter((l:any) => l.feedType === 'Refuel');
    if (activeFilter === 'Service') filtered = rawLogs.filter((l:any) => l.feedType === 'Maintenance');
    if (activeFilter === 'Mods') filtered = rawLogs.filter((l:any) => l.feedType === 'Modification');

    const groups = filtered.reduce((acc:any, log:any) => {
      const d = new Date(log.date);
      const monthYear = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
      if (!acc[monthYear]) acc[monthYear] = [];
      acc[monthYear].push(log);
      return acc;
    }, {});

    const sectioned = Object.keys(groups).map(key => ({ title: key, data: groups[key] }));
    const calculatedStats = calculateTabStats(activeFilter, filtered, vehicle);
    
    return { sections: sectioned, stats: calculatedStats };
  }, [rawLogs, activeFilter, vehicle]);

  const renderTimelineItem = ({ item, index, section }: any) => {
    const isFuel = item.feedType === 'Refuel';
    const isMod = item.feedType === 'Modification';
    const cost = isFuel ? item.totalCost : item.price;
    const isLastItem = index === section.data.length - 1;

    return (
      <Pressable onPress={() => onLogPress(item)} className="flex-row px-6 active:opacity-50">
        <View className="items-center w-6 mr-4">
          {!isLastItem && <View className="absolute top-8 bottom-[-32px] w-[2px] border-l-2 border-dashed border-[#e5e2e1]" />}
          <View className={`w-8 h-8 rounded-full border-4 border-[#fcf9f8] flex items-center justify-center z-10 ${isFuel ? 'bg-[#1b1b1b]' : 'bg-[#b7102a]'}`}>
            {isFuel ? <Fuel size={14} color="#fff" /> : isMod ? <Rocket size={14} color="#fff" /> : <Wrench size={14} color="#fff" />}
          </View>
        </View>
        <View className="flex-1 pb-8 flex-row justify-between items-start mt-0.5">
          <View className="flex-1 pr-2">
            <Text className="text-sm font-bold uppercase tracking-wide text-[#1c1b1b]">{isFuel ? 'Fuel Refill' : item.serviceType}</Text>
            <Text className="text-xs text-[#848484] mt-1 font-medium">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {isFuel ? `${item.volume}L` : (item.isDIY ? 'DIY' : (item.shopName || 'Shop'))}</Text>
          </View>
          <View className="items-end">
            <Text className="text-[15px] font-black text-[#1c1b1b]">- ₱{(cost || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
            <Text className="text-[11px] text-[#cfc4c5] mt-1 font-bold">{item.odometer?.toLocaleString()} km</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-[#fcf9f8]">
      <View className="px-6 pt-2 pb-6 bg-[#fcf9f8] z-50">
        <Text className="text-[40px] leading-none font-black tracking-tight text-[#1c1b1b] uppercase">Archive</Text>
        <Text className="text-[11px] font-black text-[#848484] uppercase tracking-[0.2em] mt-2">
          {vehicle?.nickname || 'VEHICLE'} • {rawLogs.length} RECORDS
        </Text>
      </View>

      <View className="px-6 pb-4 bg-[#fcf9f8] z-50 border-b border-[#e5e2e1]">
        <View className="flex-row gap-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab;
              return (
                <Pressable 
                  key={tab} 
                  onPress={() => setActiveFilter(tab)} 
                  className={`px-6 py-3 rounded-full border ${isActive ? 'bg-[#1b1b1b] border-[#1b1b1b]' : 'bg-[#fcf9f8] border-[#e5e2e1] active:bg-[#f0eded]'}`}
                >
                  <Text className={`text-[13px] font-bold tracking-wide ${isActive ? 'text-white' : 'text-[#4c4546]'}`}>{tab}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderTimelineItem}
        stickySectionHeadersEnabled={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListHeaderComponent={() => (
          <View className="px-6 mb-8 mt-2">
            {stats ? (
              <>
                <View className="flex-row justify-between mb-3">
                  <View className="w-[48%] bg-[#f6f3f2] border border-[#e5e2e1] rounded-2xl p-4 flex-col justify-between h-[90px]">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-[10px] font-bold text-[#848484] uppercase tracking-wider">{stats.topL.label}</Text>
                      <stats.topL.icon size={14} color="#848484" />
                    </View>
                    <Text className="text-[18px] font-black text-[#1c1b1b] tracking-tight">{stats.topL.val}</Text>
                  </View>
                  <View className="w-[48%] bg-[#f6f3f2] border border-[#e5e2e1] rounded-2xl p-4 flex-col justify-between h-[90px]">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-[10px] font-bold text-[#848484] uppercase tracking-wider">{stats.topR.label}</Text>
                      <stats.topR.icon size={14} color="#848484" />
                    </View>
                    <Text className="text-[18px] font-black text-[#1c1b1b] tracking-tight">{stats.topR.val}</Text>
                  </View>
                </View>
                <View className="w-full bg-white border border-[#e5e2e1] rounded-2xl p-5 shadow-sm shadow-black/5">
                  <Text className="text-[10px] font-bold text-[#848484] uppercase tracking-widest mb-1">{stats.anchor.label}</Text>
                  <Text className="text-[24px] font-black text-[#1c1b1b] tracking-tight mb-1">{stats.anchor.val}</Text>
                  <Text className="text-[12px] font-bold text-[#cfc4c5]">{stats.anchor.sub}</Text>
                </View>
              </>
            ) : (
               <View className="w-full bg-[#f6f3f2] border border-[#e5e2e1] rounded-2xl p-5 items-center justify-center h-[120px]">
                  <Text className="text-[12px] font-bold text-[#848484] uppercase tracking-widest">Not enough data to calculate stats</Text>
               </View>
            )}
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View className="bg-[#fcf9f8] pt-4 pb-6 px-6">
            <Text className="text-[11px] font-black text-[#848484] uppercase tracking-[2px]">{title}</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center pt-10">
            <Inbox size={40} color="#dcd9d9" />
            <Text className="text-[#848484] font-bold text-xs uppercase tracking-widest mt-4 text-center">No records found</Text>
          </View>
        )}
      />
    </View>
  );
});

export default function MasterVehicleScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [stats, setStats] = useState({ totalSpent: 0, currentOdo: 0, avgEfficiency: "0.0" });
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pager & Nav State
  const pagerRef = useRef<PagerView>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Edit/Delete Action State
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  // Fetch data ONCE
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        if (id && !isNaN(Number(id))) {
          try {
            if (!vehicle) setLoading(true);
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
        }
      };
      loadData();
    }, [id])
  );

  const handleLogPress = useCallback((log: any) => {
    setSelectedLog(log);
    setActionSheetVisible(true);
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-[#fcf9f8] items-center justify-center">
        <ActivityIndicator size="large" color="#b7102a" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#fcf9f8] relative" edges={['top']}>   
      <Stack.Screen options={{ headerShown: false }} />

      {/* Persistent Global Top Bar */}
      <View className="bg-[#fcf9f8] flex-row justify-between items-center px-6 h-14 z-50">
        <Pressable onPress={() => router.push('/(tabs)')} className="p-2 -ml-2 active:opacity-50">
          <ArrowLeft size={24} color="#1c1b1b" />
        </Pressable>
        {activeTab === 0 && <Text className="text-[#b7102a] font-black text-[14px] tracking-[0.2em] uppercase">Garage</Text>}
        {activeTab === 0 ? (
          <Pressable onPress={() => router.push(`/vehicle/edit/${vehicle?.id}`)} className="p-2 -mr-2 active:opacity-50">
            <Settings size={22} color="#1c1b1b" />
          </Pressable>
        ) : (
          <Pressable className="p-2 -mr-2 active:opacity-50 bg-[#f0eded] rounded-full w-10 h-10 items-center justify-center">
            <Search size={20} color="#1c1b1b" />
          </Pressable>
        )}
      </View>

      {/* Swipeable Screens */}
      <PagerView 
        ref={pagerRef}
        style={{ flex: 1 }} 
        initialPage={0}
        onPageSelected={(e) => setActiveTab(e.nativeEvent.position)}
      >
        <View key="dash" className="flex-1">
          <DashboardTab vehicle={vehicle} stats={stats} timeline={timeline} onGoToLogs={() => {
            setActiveTab(1);
            pagerRef.current?.setPage(1);
          }} />
        </View>

        <View key="logs" className="flex-1">
          <LogsTab vehicle={vehicle} rawLogs={timeline} onLogPress={handleLogPress} />
        </View>

        <View key="matrix" className="flex-1 items-center justify-center bg-[#fcf9f8]">
          <Activity size={48} color="#e5e2e1" className="mb-4" />
          <Text className="text-[#848484] font-bold tracking-widest uppercase">Matrix Coming Soon</Text>
        </View>
      </PagerView>

      {/* Floating Bottom Nav */}
      <TrinityNav 
        activeTab={activeTab} 
        onTabPress={(index) => {
          setActiveTab(index);
          pagerRef.current?.setPage(index);
        }} 
      />

      {/* Management Modals */}
      <ActionSheet
        visible={actionSheetVisible}
        title={selectedLog ? `${new Date(selectedLog.date).toLocaleDateString()} - ${selectedLog.feedType === 'Refuel' ? 'Fuel' : 'Service'}` : "Manage Record"}
        editLabel="Edit Record"
        deleteLabel="Delete Record"
        onCancel={() => {
          setActionSheetVisible(false);
          setSelectedLog(null);
        }}
        onEdit={() => {
          setActionSheetVisible(false);
          if (selectedLog?.feedType === 'Refuel') {
            router.push(`/vehicle/log/fuel?vehicleId=${id}&editId=${selectedLog.id}`);
          } else {
            router.push(`/vehicle/log/service?vehicleId=${id}&editId=${selectedLog.id}`);
          }
        }}
        onDelete={() => {
          setActionSheetVisible(false);
          setTimeout(() => setConfirmDeleteVisible(true), 300);
        }}
      />

      <ConfirmDialog
        visible={confirmDeleteVisible}
        title="Delete Record"
        description="Are you sure you want to permanently delete this log? Your stats will be recalculated."
        highlightedText={selectedLog ? `${selectedLog.feedType === 'Refuel' ? 'Fuel Refill' : selectedLog.serviceType}` : ''}
        onCancel={() => {
          setConfirmDeleteVisible(false);
          setSelectedLog(null);
        }}
        onConfirm={async () => {
          try {
            if (selectedLog?.feedType === 'Refuel') {
              await VehicleRepository.deleteFuelLog(selectedLog.id);
            } else {
              await VehicleRepository.deleteMaintenanceLog(selectedLog.id);
            }
            // Silent Refresh after deletion
            const tData = await VehicleRepository.getVehicleTimeline(Number(id));
            const sData = await VehicleRepository.getVehicleStats(Number(id));
            setTimeline(tData || []);
            setStats(sData);
          } catch (error) {
            console.error("Failed to delete", error);
          } finally {
            setConfirmDeleteVisible(false);
            setSelectedLog(null);
          }
        }}
      />

    </SafeAreaView>
  );
}
