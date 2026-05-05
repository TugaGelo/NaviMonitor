import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VEHICLES } from '../../constants/vehicles';

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Activity');

  const vehicle = VEHICLES.find(v => v.id === id);

  if (!vehicle) {
    return (
      <View style={styles.center}><Text>Vehicle not found.</Text></View>
    );
  }

  const TABS = ['Activity', 'Fuel', 'Maintenance', 'Schedule'];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#4c4546" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{vehicle.nickname}</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialCommunityIcons name="pencil" size={20} color="#4c4546" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.heroSection}>
          <Text style={styles.modelText}>{vehicle.model} {vehicle.year}</Text>
          <View style={styles.odoBadge}>
            <Text style={styles.odoText}>ODO: {vehicle.odo} km</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#000' }]}>
              <MaterialCommunityIcons name="plus" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Fuel Log</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#b7102a' }]}>
              <MaterialCommunityIcons name="plus" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Service</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
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
          </ScrollView>
        </View>

        <View style={styles.grid}>
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <MaterialCommunityIcons name="lightning-bolt" size={18} color="#4c4546" />
              <Text style={styles.kpiLabel}>AVG EFFICIENCY</Text>
            </View>
            <Text style={styles.kpiValue}>{vehicle.stats.avgEfficiency} <Text style={styles.kpiUnit}>km/L</Text></Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <MaterialCommunityIcons name="tag-outline" size={18} color="#4c4546" />
              <Text style={styles.kpiLabel}>COST PER KM</Text>
            </View>
            <Text style={styles.kpiValue}>₱ {vehicle.stats.costPerKm}</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <MaterialCommunityIcons name="chart-bar" size={18} color="#4c4546" />
              <Text style={styles.kpiLabel}>TOTAL SPENT</Text>
            </View>
            <Text style={styles.kpiValue}>₱ {vehicle.stats.totalSpent}</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <MaterialCommunityIcons name="wrench-outline" size={18} color="#4c4546" />
              <Text style={styles.kpiLabel}>NEXT SERVICE</Text>
            </View>
            <Text style={[styles.kpiValue, { color: '#b7102a' }]}>In {vehicle.stats.nextService} km</Text>
          </View>
        </View>

        <View style={styles.feedArea}>
          <Text style={{ textAlign: 'center', color: '#7e7576', marginTop: 40 }}>
            {activeTab} Feed Coming Soon...
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#fcf9f8' },
  content: { paddingBottom: 120 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50, // Avoids the notch
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0eded',
  },
  iconBtn: { padding: 8, backgroundColor: '#f6f3f2', borderRadius: 20 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#000', textTransform: 'uppercase' },
  
  heroSection: { alignItems: 'center', marginTop: 32, paddingHorizontal: 20 },
  modelText: { fontSize: 32, fontWeight: '700', color: '#1c1b1b', marginBottom: 8 },
  odoBadge: { backgroundColor: '#f0eded', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#cfc4c5' },
  odoText: { fontSize: 14, fontWeight: '600', color: '#1c1b1b' },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, gap: 8 },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  tabContainer: { marginTop: 32, paddingHorizontal: 20 },
  tabScroll: { backgroundColor: '#eae7e7', padding: 4, borderRadius: 30, flexDirection: 'row' },
  tabBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  tabBtnActive: { backgroundColor: '#000', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '500', color: '#4c4546' },
  tabTextActive: { color: '#fff', fontWeight: '600' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, marginTop: 24, gap: 12 },
  kpiCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cfc4c5',
    borderRadius: 16,
    padding: 16,
  },
  kpiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  kpiLabel: { fontSize: 10, fontWeight: '700', color: '#4c4546', letterSpacing: 0.5 },
  kpiValue: { fontSize: 22, fontWeight: '700', color: '#000' },
  kpiUnit: { fontSize: 14, fontWeight: '400', color: '#4c4546' },
  
  feedArea: { flex: 1, minHeight: 200 }
});
