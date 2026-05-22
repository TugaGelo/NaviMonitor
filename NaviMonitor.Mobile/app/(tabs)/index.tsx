import { View, Text, Pressable, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useRef } from 'react';
import { useFocusEffect, useRouter, Tabs } from 'expo-router';
import PagerView from 'react-native-pager-view';
import { Plus } from 'lucide-react-native';

// Components
import TrinityNav from '../../components/ui/TrinityNav';
import VehicleCard from '../../components/shared/VehicleCard';
import GarageEmptyState from '../../components/features/global/GarageEmptyState';
import ActionSheet from '../../components/ui/ActionSheet';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PageHeader from '../../components/ui/PageHeader';
import StatsTab from '../../components/features/global/StatsTab';
import SystemTab from '../../components/features/global/SystemTab';

// Data
import { VehicleRepository } from '../../lib/database/localRepository';
import { Vehicle } from '../../types';
import { useAuth } from '../../lib/auth/AuthContext';

type VehicleWithStats = Vehicle & { currentOdo: number };

export default function GlobalMasterScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  // Navigation State
  const pagerRef = useRef<PagerView>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Data State
  const [vehicles, setVehicles] = useState<VehicleWithStats[]>([]);
  const [globalTimeline, setGlobalTimeline] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithStats | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await VehicleRepository.getVehicles();
      let compiledTimeline: any[] = [];
      
      const enrichedVehicles = await Promise.all(data.map(async (v) => {
        const stats = await VehicleRepository.getVehicleStats(v.id!);
        const timeline = await VehicleRepository.getVehicleTimeline(v.id!);
        const currentOdo = stats?.currentOdo || v.startingOdometer;
        
        if (timeline && Array.isArray(timeline)) {
          compiledTimeline = [...compiledTimeline, ...timeline];
        }
        
        return { ...v, currentOdo };
      }));

      setVehicles(enrichedVehicles);
      setGlobalTimeline(compiledTimeline);
    } catch (err) {
      console.error("Failed to load global workspace data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleLongPress = (vehicle: VehicleWithStats) => {
    setSelectedVehicle(vehicle);
    setIsSheetVisible(true);
  };

  const handleEdit = () => {
    setIsSheetVisible(false);
    if (selectedVehicle) {
      router.push({ pathname: '/vehicle/create', params: { editId: selectedVehicle.id } });
    }
  };

  const handleDeleteTrigger = () => {
    setIsSheetVisible(false);
    if (selectedVehicle) {
      setTimeout(() => setIsConfirmVisible(true), 300);
    }
  };

  const executeDelete = async () => {
    setIsConfirmVisible(false);
    if (selectedVehicle) {
      try {
        await VehicleRepository.deleteVehicle(selectedVehicle.id!);
        loadData(); 
      } catch (error) {
        Alert.alert("Error", "Could not delete the vehicle.");
      }
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#fcf9f8] items-center justify-center">
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#fcf9f8]" edges={['top']}>
      <Tabs.Screen options={{ tabBarStyle: { display: 'none' }, headerShown: false }} />

      {/* Panel Swipe Container */}
      <PagerView 
        ref={pagerRef}
        style={{ flex: 1 }} 
        initialPage={0}
        onPageSelected={(e) => setActiveTab(e.nativeEvent.position)}
      >
        
        {/* THE GARAGE */}
        <View key="garage" className="flex-1 relative bg-[#fcf9f8]">
          <View className="px-6 pt-12 bg-[#fcf9f8] z-50">
            <PageHeader 
              title="GARAGE" 
              subtitle={`${vehicles.length} ASSETS REGISTERED`} 
            />
          </View>

          <FlatList
            data={vehicles}
            keyExtractor={(item) => item.id!.toString()}
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 140 }}
            renderItem={({ item }) => (
              <VehicleCard vehicle={item} onRefresh={loadData} onLongPress={() => handleLongPress(item)} />
            )}
            ListEmptyComponent={
              !isLoading ? <GarageEmptyState onPress={() => router.push('/vehicle/create')} /> : null
            }
          />

          <Pressable 
            onPress={() => router.push('/vehicle/create')}
            className="absolute bottom-28 right-6 bg-[#000000] w-14 h-14 rounded-full items-center justify-center border-2 border-[#ffffff] active:scale-95 z-40"
            style={{ elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5 }}
          >
            <Plus size={30} color="#ffffff" />
          </Pressable>
        </View>

        {/* PERFORMANCE STATS */}
        <View key="stats" className="flex-1 relative bg-[#fcf9f8]">
          <View className="px-6 pt-12 bg-[#fcf9f8] z-50">
            <PageHeader 
              title="STATS" 
              subtitle="REAL-TIME TELEMETRY" 
            />
          </View>
          
          <StatsTab vehicles={vehicles} timeline={globalTimeline} />
          
        </View>

        {/* SYSTEM & SETTINGS */}
        <View key="system" className="flex-1 relative bg-[#fcf9f8]">
          <View className="px-6 pt-12 bg-[#fcf9f8] z-50">
            <PageHeader 
              title="SYSTEM" 
              subtitle="OPERATIONS & SUPPORT" 
            />
          </View>
          
          <SystemTab onLogout={logout} />
          
        </View>

      </PagerView>

      <TrinityNav 
        variant="global"
        activeTab={activeTab} 
        onTabPress={(index) => {
          setActiveTab(index);
          pagerRef.current?.setPage(index);
        }} 
      />

      <ActionSheet 
        visible={isSheetVisible}
        title={selectedVehicle?.nickname ? `Manage ${selectedVehicle.nickname.toUpperCase()}` : "MANAGE VEHICLE"}
        onEdit={handleEdit}
        onDelete={handleDeleteTrigger}
        onCancel={() => setIsSheetVisible(false)}
      />

      <ConfirmDialog 
        visible={isConfirmVisible}
        title="Delete Vehicle"
        description="Are you sure you want to remove this vehicle? This will delete all associated logs and history."
        highlightedText={selectedVehicle?.nickname}
        onCancel={() => setIsConfirmVisible(false)}
        onConfirm={executeDelete}
      />

    </SafeAreaView>
  );
}
