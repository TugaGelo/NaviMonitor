import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface VehicleCardProps {
  name: string;
  model: string;
  odometer: string;
  ltoReg: string;
  lastRefuel: string;
  type: 'CAR' | 'BIKE';
  onPress: () => void;
}

export default function VehicleCard({ name, model, odometer, ltoReg, lastRefuel, type, onPress }: VehicleCardProps) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.model}>{model}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{type}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <View style={styles.statLabelRow}>
            <MaterialCommunityIcons name="speedometer" size={14} color="#7e7576" />
            <Text style={styles.statLabel}>ODOMETER</Text>
          </View>
          <Text style={styles.statValue}>{odometer} <Text style={styles.unit}>km</Text></Text>
        </View>

        <View style={[styles.statBox, styles.alertBox]}>
          <View style={styles.statLabelRow}>
            <MaterialCommunityIcons name="shield-alert" size={14} color="#ba1a1a" />
            <Text style={[styles.statLabel, { color: '#ba1a1a' }]}>LTO REG</Text>
          </View>
          <Text style={[styles.statValue, { color: '#ba1a1a' }]}>{ltoReg}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.statLabelRow}>
          <MaterialCommunityIcons name="gas-station" size={14} color="#7e7576" />
          <Text style={styles.statLabel}>LAST REFUEL: {lastRefuel}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#ba1a1a" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#cfc4c5',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  name: { fontSize: 22, fontWeight: '900', color: '#000' },
  model: { fontSize: 14, color: '#4c4546', marginTop: 2 },
  badge: { backgroundColor: '#f0eded', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, height: 24 },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#000' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 15 },
  statBox: { flex: 1, backgroundColor: '#f6f3f2', padding: 12, borderRadius: 12 },
  alertBox: { backgroundColor: '#ffdad6', borderColor: 'rgba(186, 26, 26, 0.1)', borderWidth: 1 },
  statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  statLabel: { fontSize: 10, fontWeight: '700', color: '#7e7576' },
  statValue: { fontSize: 16, fontWeight: '700', color: '#000' },
  unit: { fontSize: 12, fontWeight: '400', color: '#4c4546' },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0eded'
  },
});
