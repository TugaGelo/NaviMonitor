import { View, Text, Pressable, SectionList, ActivityIndicator, Alert } from 'react-native';
import { useState, useCallback, useMemo, useRef, memo } from 'react';
import { useRouter, useLocalSearchParams, useFocusEffect, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Fuel, Wrench, Rocket, Inbox } from 'lucide-react-native';
import PagerView from 'react-native-pager-view';
import { VehicleRepository } from '../../../lib/localRepository';
import ActionSheet from '../../../components/ui/ActionSheet';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';

const TABS = ['All', 'Fuel', 'Service', 'Mods'];

const TabContent = memo(({ filter, rawLogs, onLogPress }: { filter: string, rawLogs: any[], onLogPress: (log: any) => void }) => {
  const { sections, total, count } = useMemo(() => {
    let filtered = rawLogs;
    if (filter === 'Fuel') filtered = rawLogs.filter(l => l.feedType === 'Refuel');
    if (filter === 'Service') filtered = rawLogs.filter(l => l.feedType === 'Maintenance');
    if (filter === 'Mods') filtered = rawLogs.filter(l => l.feedType === 'Modification');

    const groups = filtered.reduce((acc, log) => {
      const d = new Date(log.date);
      const monthYear = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
      if (!acc[monthYear]) acc[monthYear] = [];
      acc[monthYear].push(log);
      return acc;
    }, {} as Record<string, any[]>);

    const sectioned = Object.keys(groups).map(key => ({ title: key, data: groups[key] }));
    const calculatedTotal = filtered.reduce((sum, log) => sum + (log.feedType === 'Refuel' ? (log.totalCost || 0) : (log.price || 0)), 0);
    
    return { sections: sectioned, total: calculatedTotal, count: filtered.length };
  }, [rawLogs, filter]);

  const renderTimelineItem = ({ item, index, section }: any) => {
    const isFuel = item.feedType === 'Refuel';
    const isMod = item.feedType === 'Modification';
    const cost = isFuel ? item.totalCost : item.price;
    const isLastItem = index === section.data.length - 1;

    return (
      <Pressable onPress={() => onLogPress(item)} className="flex-row px-6 active:opacity-50">
        <View className="items-center w-6 mr-4">
          {!isLastItem && <View className="absolute top-8 bottom-[-32px] w-[1px] border-l border-dashed border-[#dcd9d9]" />}
          <View className={`w-6 h-6 rounded-full border-2 border-[#fcf9f8] flex items-center justify-center z-10 ${isFuel ? 'bg-[#1b1b1b]' : 'bg-[#b7102a]'}`}>
            {isFuel ? <Fuel size={12} color="#fff" /> : isMod ? <Rocket size={12} color="#fff" /> : <Wrench size={12} color="#fff" />}
          </View>
        </View>

        <View className="flex-1 pb-8 flex-row justify-between items-start">
          <View className="flex-1 pr-2">
            <Text className="text-sm font-bold uppercase tracking-wide text-[#1c1b1b]">{isFuel ? 'Fuel Refill' : item.serviceType}</Text>
            <Text className="text-xs text-[#848484] mt-0.5">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {isFuel ? `${item.volume}L` : (item.isDIY ? 'DIY' : (item.shopName || 'Shop'))}</Text>
          </View>
          <View className="items-end">
            <Text className="text-sm font-black text-[#1c1b1b]">- ₱{(cost || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
            <Text className="text-[11px] text-[#838484] mt-0.5 font-medium">{item.odometer?.toLocaleString()} km</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      renderItem={renderTimelineItem}
      stickySectionHeadersEnabled={true}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={() => (
        <View className="px-6 mb-4 mt-2">
          <View className="bg-white border border-[#e5e2e1] rounded-2xl p-5 flex-row items-center justify-between shadow-sm">
            <View>
              <Text className="text-[10px] font-black text-[#848484] uppercase tracking-widest mb-1">Filtered Total</Text>
              <Text className="text-2xl font-black text-[#1c1b1b]">₱{total.toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
            </View>
            <View className="items-end">
              <Text className="text-[10px] font-black text-[#848484] uppercase tracking-widest mb-1">Logs</Text>
              <Text className="text-xl font-black text-[#1c1b1b]">{count}</Text>
            </View>
          </View>
        </View>
      )}
      renderSectionHeader={({ section: { title } }) => (
        <View className="bg-[#fcf9f8] pt-6 pb-4 px-6"><Text className="text-[10px] font-black text-[#848484] uppercase tracking-[2px]">{title}</Text></View>
      )}
      ListEmptyComponent={() => (
        <View className="flex-1 items-center justify-center pt-20">
          <Inbox size={40} color="#dcd9d9" />
          <Text className="text-[#848484] font-bold text-xs uppercase tracking-widest mt-4 text-center">No records found</Text>
        </View>
      )}
    />
  );
});

// --- MAIN SCREEN ---
export default function VehicleLogbookScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const vId = params.vehicleId || params.id;
  
  const [loading, setLoading] = useState(true);
  const [rawLogs, setRawLogs] = useState<any[]>([]);
  
  // Pager State
  const pagerRef = useRef<PagerView>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Management State
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          setLoading(true);
          if (vId) {
            const tData = await VehicleRepository.getVehicleTimeline(Number(vId));
            setRawLogs(tData || []);
          }
        } catch (error) {
          Alert.alert("Database Error", "Could not load logs.");
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }, [vId])
  );

  const handleLogPress = useCallback((log: any) => {
    setSelectedLog(log);
    setActionSheetVisible(true);
  }, []);

  const handleTabPress = (index: number) => {
    setActiveTab(index);
    pagerRef.current?.setPage(index);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#fcf9f8] items-center justify-center">
        <ActivityIndicator size="large" color="#b7102a" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#fcf9f8]" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-[#fcf9f8] flex-row justify-between items-center px-6 h-16 border-b border-[#e5e2e1]">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2"><ArrowLeft size={24} color="#1c1b1b" /></Pressable>
        <Text className="text-[#1c1b1b] font-black text-lg tracking-tighter uppercase">History</Text>
        <Pressable className="p-2 -mr-2"><Search size={24} color="#1c1b1b" /></Pressable>
      </View>

      <View className="px-6 py-4 bg-[#fcf9f8]">
        <View className="flex-row bg-[#f0eded] p-1.5 rounded-2xl w-full border border-[#e5e2e1]">
          {TABS.map((tab, index) => {
            const isActive = activeTab === index;
            return (
              <Pressable 
                key={tab} 
                onPress={() => handleTabPress(index)} 
                className={`flex-1 items-center justify-center py-2.5 rounded-xl ${isActive ? 'bg-[#1b1b1b]' : 'bg-transparent'}`}
                style={isActive ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 } : {}}
              >
                <Text className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-[#848484]'}`}>{tab}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <PagerView 
        ref={pagerRef}
        style={{ flex: 1 }} 
        initialPage={0}
        onPageSelected={(e) => setActiveTab(e.nativeEvent.position)}
      >
        {TABS.map((tab, index) => (
          <View key={tab} className="flex-1">
            <TabContent filter={tab} rawLogs={rawLogs} onLogPress={handleLogPress} />
          </View>
        ))}
      </PagerView>

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
            router.push(`/vehicle/log/fuel?vehicleId=${vId}&editId=${selectedLog.id}`);
          } else {
            router.push(`/vehicle/log/service?vehicleId=${vId}&editId=${selectedLog.id}`);
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
            const refreshedData = await VehicleRepository.getVehicleTimeline(Number(vId));
            setRawLogs(refreshedData || []);
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
