import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import VehicleCard from '../../components/VehicleCard';

export default function GarageScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.subHeader}>Select a vehicle to view dashboard</Text>
      
      {/* Example Vehicle 1 */}
      <VehicleCard 
        name="Coco"
        model="2026 Honda Navi • Black/White"
        odometer="200"
        ltoReg="May 4, 2026"
        lastRefuel="May 4"
        type="CAR"
      />

      {/* Example Vehicle 2 */}
      <VehicleCard 
        name="Thunder"
        model="2023 Honda Navi • Red"
        odometer="3,500"
        ltoReg="Oct 12, 2026"
        lastRefuel="Apr 28"
        type="BIKE"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcf9f8' },
  content: { padding: 20, paddingBottom: 120 },
  subHeader: { fontSize: 14, color: '#4c4546', marginBottom: 20 },
});
