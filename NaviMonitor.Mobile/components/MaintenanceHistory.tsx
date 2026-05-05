import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MaintenanceLog } from '../constants/vehicles';

interface MaintenanceHistoryProps {
  logs: MaintenanceLog[];
}

export default function MaintenanceHistory({ logs }: MaintenanceHistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Service Logs</Text>
        <Text style={styles.countText}>{logs.length} RECORDS</Text>
      </View>
      <View style={styles.listContainer}>
        {logs.map((log, index) => {
          const subText = `${log.isDIY ? 'DIY' : 'Shop'}${log.notes ? ` - ${log.notes}` : ''}`;
          return (
            <TouchableOpacity key={log.id || index} style={styles.logItem} activeOpacity={0.7}>
              <View style={styles.itemLeft}>
                <Text style={styles.serviceText}>{log.serviceType}</Text>
                <Text style={styles.subText}>{subText}</Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.priceText}>₱{log.price.toLocaleString()}</Text>
                <Text style={styles.dateText}>{formatDate(log.date)}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}>
        <MaterialCommunityIcons name="plus" size={20} color="#fff" />
        <Text style={styles.addBtnText}>Log Service</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginTop: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#000' },
  countText: { fontSize: 12, fontWeight: '600', color: '#7e7576', textTransform: 'uppercase', letterSpacing: 1 },
  listContainer: { borderTopWidth: 1, borderTopColor: 'rgba(207, 196, 197, 0.5)' },
  logItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(207, 196, 197, 0.5)' },
  itemLeft: { flex: 1, gap: 2 },
  serviceText: { fontSize: 16, fontWeight: '600', color: '#1c1b1b' },
  subText: { fontSize: 13, color: '#4c4546' },
  itemRight: { alignItems: 'flex-end', gap: 2 },
  priceText: { fontSize: 16, fontWeight: '600', color: '#1c1b1b' },
  dateText: { fontSize: 13, color: '#4c4546' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#b7102a', paddingVertical: 16, borderRadius: 12, marginTop: 24, gap: 8, shadowColor: '#b7102a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '700', textTransform: 'uppercase' }
});
