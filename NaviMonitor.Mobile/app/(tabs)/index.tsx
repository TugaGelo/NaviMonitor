import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import VehicleCard from '../../components/VehicleCard';
import { VEHICLES } from '../../constants/vehicles';

export default function GarageScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.subHeader}>Select a vehicle to view dashboard</Text>
      
      {VEHICLES.map((vehicle) => (
        <VehicleCard 
          key={vehicle.id}
          name={vehicle.nickname}
          model={`${vehicle.year} ${vehicle.model}`}
          odometer={vehicle.odo}
          ltoReg={vehicle.ltoReg}
          lastRefuel={vehicle.lastRefuel}
          type={vehicle.type}
          onPress={() => {
            console.log("📍 Tapped vehicle ID:", vehicle.id);
            router.push({
              pathname: '/vehicle/[id]',
              params: { id: vehicle.id }
            });
          }}    
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcf9f8' },
  content: { padding: 20, paddingBottom: 120 },
  subHeader: { fontSize: 14, color: '#4c4546', marginBottom: 20 },
});
