import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Milestone, TimelineTask } from '../utils/maintenanceEngine';

interface ScheduleTimelineProps {
  currentOdo: number;
  milestones: Milestone[];
}

export default function ScheduleTimeline({ currentOdo, milestones }: ScheduleTimelineProps) {
  const renderItem = (item: TimelineTask) => {
    const isCompleted = item.status === 'completed';
    const isOverdue = item.status === 'overdue';

    return (
      <View key={item.id} style={styles.listItem}>
        <View style={styles.itemLeft}>
          <MaterialCommunityIcons 
            name={isCompleted ? "checkbox-marked" : "checkbox-blank-outline"} 
            size={20} 
            color={isCompleted ? "#000" : isOverdue ? "#ba1a1a" : "#7e7576"} 
          />
          <Text style={[styles.itemText, isCompleted && styles.textCompleted, isOverdue && { color: '#ba1a1a' }]}>
            {item.task} <Text style={styles.actionText}>({item.action})</Text>
          </Text>
        </View>
        {!isCompleted && (
          <TouchableOpacity style={styles.logBtn}>
            <Text style={styles.logBtnText}>LOG</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.verticalLine} />
      {milestones.map((milestone, index) => {
        const isCompleted = milestone.status === 'Completed';
        const isFuture = milestone.status === 'Future';
        const isOverdue = milestone.status === 'Overdue';
        const nextMilestone = milestones[index + 1];
        const showPulseAfter = currentOdo >= milestone.km && (!nextMilestone || currentOdo < nextMilestone.km);

        return (
          <React.Fragment key={milestone.km}>
            <View style={[styles.milestoneRow, isFuture && { opacity: 0.6 }]}>
              <View style={styles.nodeContainer}>
                <View style={[styles.node, isCompleted ? styles.nodeCompleted : isOverdue ? styles.nodeOverdue : styles.nodeUpcoming]} />
              </View>
              <View style={[styles.card, isOverdue && styles.cardOverdue]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.kmText}>{milestone.km.toLocaleString()} KM</Text>
                  <View style={[styles.badge, isCompleted && styles.badgeCompleted, isOverdue && styles.badgeOverdue]}>
                    <Text style={[styles.badgeText, isCompleted && { color: '#fff' }, isOverdue && { color: '#ba1a1a' }]}>{milestone.status}</Text>
                  </View>
                </View>
                <View style={styles.listContainer}>
                  {milestone.items.map(item => renderItem(item))}
                </View>
              </View>
            </View>

            {showPulseAfter && (
              <View style={styles.pulseRow}>
                <View style={styles.horizontalPulseLine} />
                <View style={styles.nodeContainer}>
                   <View style={styles.pulseNode} />
                </View>
                <View style={styles.pulseBadge}>
                  <Text style={styles.pulseText}>Current Reading: {currentOdo.toLocaleString()} KM</Text>
                </View>
              </View>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', marginTop: 10, paddingHorizontal: 16 },
  verticalLine: { position: 'absolute', left: 32, top: 20, bottom: 0, width: 1, backgroundColor: '#cfc4c5', zIndex: 0 },
  milestoneRow: { flexDirection: 'row', marginBottom: 24, zIndex: 10 },
  nodeContainer: { width: 32, alignItems: 'center', paddingTop: 20 },
  node: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, backgroundColor: '#fcf9f8', borderColor: '#cfc4c5' },
  nodeCompleted: { backgroundColor: '#000', borderColor: '#fcf9f8', borderWidth: 3 },
  nodeOverdue: { backgroundColor: '#ba1a1a', borderColor: '#ffdad6', borderWidth: 3 },
  nodeUpcoming: { borderColor: '#000' },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#cfc4c5', marginLeft: 8 },
  cardOverdue: { borderColor: 'rgba(186,26,26,0.3)', backgroundColor: '#fffdfc' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f0eded', paddingBottom: 12, marginBottom: 12 },
  kmText: { fontSize: 18, fontWeight: '700', color: '#1c1b1b' },
  badge: { backgroundColor: '#f0eded', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeCompleted: { backgroundColor: '#000' },
  badgeOverdue: { backgroundColor: '#ffdad6' },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#4c4546', textTransform: 'uppercase' },
  listContainer: { gap: 12 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemText: { fontSize: 14, color: '#1c1b1b', fontWeight: '500' },
  actionText: { fontSize: 12, color: '#7e7576', fontWeight: '400' },
  textCompleted: { color: '#7e7576', textDecorationLine: 'line-through' },
  logBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  logBtnText: { fontSize: 12, fontWeight: '700', color: '#b7102a', textTransform: 'uppercase' },
  pulseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, position: 'relative' },
  horizontalPulseLine: { position: 'absolute', left: 32, right: 0, top: '50%', height: 1, backgroundColor: 'rgba(183,16,42,0.2)', zIndex: 0 },
  pulseNode: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#b7102a', borderWidth: 2, borderColor: '#fff' },
  pulseBadge: { marginLeft: 16, backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#ba1a1a' },
  pulseText: { fontSize: 12, fontWeight: '600', color: '#ba1a1a' }
});
