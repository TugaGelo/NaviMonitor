import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityEvent } from '../utils/activityEngine';

export default function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  const getIcon = (type: ActivityEvent['type']) => {
    switch(type) {
      case 'FUEL': return 'gas-station';
      case 'MAINTENANCE': return 'wrench';
      case 'MODIFICATION': return 'auto-fix';
      default: return 'bell';
    }
  };

  const getIconColor = (type: ActivityEvent['type']) => {
    switch(type) {
      case 'MAINTENANCE': return '#b7102a';
      default: return '#000';
    }
  };

  if (events.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No activity recorded yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.verticalLine} />
      {events.map((event) => (
        <View key={event.id} style={styles.row}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name={getIcon(event.type)} size={16} color={getIconColor(event.type)} />
            </View>
          </View>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.dateText}>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
            </View>
            <Text style={styles.subtitle}>{event.subtitle}</Text>
            {event.cost > 0 && <Text style={styles.costText}>₱{event.cost.toLocaleString()}</Text>}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginTop: 16, position: 'relative' },
  verticalLine: { position: 'absolute', left: 32, top: 0, bottom: 0, width: 1, backgroundColor: '#cfc4c5' },
  row: { flexDirection: 'row', marginBottom: 20 },
  iconContainer: { width: 32, alignItems: 'center', zIndex: 10 },
  iconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#cfc4c5', justifyContent: 'center', alignItems: 'center' },
  card: { flex: 1, marginLeft: 12, backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#cfc4c5' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  eventTitle: { fontSize: 15, fontWeight: '700', color: '#1c1b1b' },
  dateText: { fontSize: 11, color: '#7e7576', fontWeight: '500' },
  subtitle: { fontSize: 13, color: '#4c4546' },
  costText: { fontSize: 13, fontWeight: '700', color: '#b7102a', marginTop: 6 },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#7e7576', fontSize: 14 }
});
