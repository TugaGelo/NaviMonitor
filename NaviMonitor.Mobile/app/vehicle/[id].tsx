import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { VEHICLES, MOCK_LOGS, MOCK_FUEL } from '../../constants/vehicles';
import { generateTimeline } from '../../utils/maintenanceEngine';
import { generateActivityFeed } from '../../utils/activityEngine';

import ScheduleTimeline from '../../components/ScheduleTimeline';
import MaintenanceHistory from '../../components/MaintenanceHistory';
import FuelHistory from '../../components/FuelHistory';
import ActivityFeed from '../../components/ActivityFeed';
import AddRefuelModal from '../../components/modals/AddRefuelModal';

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Activity');
  
  const [isRefuelModalOpen, setIsRefuelModalOpen] = useState(false);

  const vehicle = VEHICLES.find(v => v.id === Number(id));
  
  const currentOdo = 3500; 

  const vehicleLogs = useMemo(() => {
    if (!vehicle) return [];
    return MOCK_LOGS.filter(l => l.vehicleId === vehicle.id);
  }, [vehicle]);

  const vehicleFuel = useMemo(() => {
    if (!vehicle) return [];
    return MOCK_FUEL.filter(f => f.vehicleId === vehicle.id);
  }, [vehicle]);

  const activityEvents = useMemo(() => {
    return generateActivityFeed(vehicleLogs, vehicleFuel);
  }, [vehicleLogs, vehicleFuel]);

  const timelineMilestones = useMemo(() => {
    if (!vehicle || !vehicle.maintenanceMatrixJson) return [];
    if (vehicle.maintenanceMatrixJson === '[]') return [];
    return generateTimeline(vehicle, vehicleLogs, currentOdo);
  }, [vehicle, currentOdo, vehicleLogs]);

  if (!vehicle) {
    return <View style={styles.center}><Text style={styles.errorText}>Vehicle not found.</Text></View>;
  }

  const TABS = ['Activity', 'Fuel', 'Maintenance', 'Schedule'];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{vehicle.nickname}</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialCommunityIcons name="pencil" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.heroSection}>
          <Text style={styles.modelText}>{vehicle.make} {vehicle.model}</Text>
          <View style={styles.odoBadge}>
            <Text style={styles.odoText}>ODO: {currentOdo.toLocaleString()} km</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.vMatrixBtn}>
              <MaterialCommunityIcons name="grid" size={18} color="#000" />
              <Text style={styles.vMatrixBtnText}>V-Matrix</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#000' }]}
              onPress={() => setIsRefuelModalOpen(true)}
            >
              <MaterialCommunityIcons name="gas-station" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Fuel Log</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#b7102a' }]}>
              <MaterialCommunityIcons name="wrench" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Service</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <View style={styles.tabScroll}>
            {TABS.map((tab) => (
              <TouchableOpacity 
                key={tab} 
                style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.feedArea}>
          {activeTab === 'Schedule' ? (
            timelineMilestones.length > 0 ? (
              <ScheduleTimeline currentOdo={currentOdo} milestones={timelineMilestones} />
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#cfc4c5" />
                <Text style={styles.emptyText}>No Maintenance Schedule Found.</Text>
                <Text style={styles.emptySubText}>Sync a manual to see the V-Matrix.</Text>
              </View>
            )
          ) : activeTab === 'Maintenance' ? (
            <MaintenanceHistory logs={vehicleLogs} />
          ) : activeTab === 'Fuel' ? (
            <FuelHistory logs={vehicleFuel} />
          ) : activeTab === 'Activity' ? (
            <ActivityFeed events={activityEvents} />
          ) : null}
        </View>

      </ScrollView>

      <AddRefuelModal 
        isOpen={isRefuelModalOpen}
        onClose={() => setIsRefuelModalOpen(false)}
        vehicleNickname={vehicle.nickname}
        onSave={(data) => {
          console.log("Saving Refuel Data:", data);
          // In the future: api.post('/refuel', data)
        }}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#ba1a1a', fontWeight: '600' },
  container: { flex: 1, backgroundColor: '#fcf9f8' },
  content: { paddingBottom: 150 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16, backgroundColor: '#fff' },
  iconBtn: { padding: 8, backgroundColor: '#f6f3f2', borderRadius: 20 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#000', textTransform: 'uppercase', letterSpacing: 1 },
  heroSection: { alignItems: 'center', marginTop: 24, paddingHorizontal: 16 },
  modelText: { fontSize: 26, fontWeight: '700', color: '#1c1b1b', marginBottom: 8 },
  odoBadge: { backgroundColor: '#f0eded', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: '#cfc4c5' },
  odoText: { fontSize: 12, fontWeight: '600', color: '#1c1b1b' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 24, width: '100%' },
  vMatrixBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, gap: 4, backgroundColor: '#fff', borderWidth: 1, borderColor: '#cfc4c5' },
  vMatrixBtnText: { color: '#000', fontSize: 11, fontWeight: '700' },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, gap: 4 },
  actionBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  tabContainer: { marginTop: 32, paddingHorizontal: 16 },
  tabScroll: { backgroundColor: '#eae7e7', padding: 4, borderRadius: 12, flexDirection: 'row' },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8 },
  tabBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  tabText: { fontSize: 12, fontWeight: '500', color: '#4c4546' },
  tabTextActive: { color: '#000', fontWeight: '700' },
  feedArea: { flex: 1, marginTop: 10 },
  emptyState: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#4c4546', marginTop: 16 },
  emptySubText: { fontSize: 14, color: '#7e7576', textAlign: 'center', marginTop: 4 },
});
