import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect, Stack } from 'expo-router';
import { useState, useCallback, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Settings, Search, Activity } from 'lucide-react-native';
import PagerView from 'react-native-pager-view';

// Data & Types
import { VehicleRepository } from '../../lib/localRepository';
import { Vehicle } from '../../types';

// UI Components
import TrinityNav from '../../components/ui/TrinityNav';
import ActionSheet from '../../components/ui/ActionSheet';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

// Vehicle Tabs
import DashboardTab from '../../components/vehicle/DashboardTab';
import LogsTab from '../../components/vehicle/LogsTab';

export default function MasterVehicleScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Data State
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [stats, setStats] = useState({ totalSpent: 0, currentOdo: 0, avgEfficiency: "0.0" });
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Navigation State
  const pagerRef = useRef<PagerView>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Modal State
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  // Load Data
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
      <>
        <Stack.Screen options={{ headerShown: false }} />
        
        <View className="flex-1 bg-[#fcf9f8] items-center justify-center">
          <ActivityIndicator size="large" color="#b7102a" />
        </View>
      </>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#fcf9f8] relative" edges={['top']}>   
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-[#fcf9f8] flex-row items-center px-6 h-14 z-50">
        <Pressable onPress={() => router.push('/(tabs)')} className="p-2 -ml-2 active:opacity-50">
          <ArrowLeft size={24} color="#1c1b1b" />
        </Pressable>
      </View>

      {/* Swiping Screens */}
      <PagerView 
        ref={pagerRef}
        style={{ flex: 1 }} 
        initialPage={0}
        onPageSelected={(e) => setActiveTab(e.nativeEvent.position)}
      >
        <View key="dash" className="flex-1">
          <DashboardTab 
            vehicle={vehicle} 
            stats={stats} 
            timeline={timeline} 
            onGoToLogs={() => {
              setActiveTab(1);
              pagerRef.current?.setPage(1);
            }} 
          />
        </View>

        <View key="logs" className="flex-1">
          <LogsTab 
            vehicle={vehicle} 
            rawLogs={timeline} 
            onLogPress={handleLogPress} 
          />
        </View>

        <View key="matrix" className="flex-1 items-center justify-center bg-[#fcf9f8]">
          <Activity size={48} color="#e5e2e1" className="mb-4" />
          <Text className="text-[#848484] font-bold tracking-widest uppercase">Matrix Coming Soon</Text>
        </View>
      </PagerView>

      {/* Global Bottom Navigation */}
      <TrinityNav 
        activeTab={activeTab} 
        onTabPress={(index) => {
          setActiveTab(index);
          pagerRef.current?.setPage(index);
        }} 
      />

      {/* Shared Modals */}
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
          const route = selectedLog?.feedType === 'Refuel' ? 'fuel' : 'service';
          router.push(`/vehicle/log/${route}?vehicleId=${id}&editId=${selectedLog.id}`);
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
            // Trigger refresh
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
