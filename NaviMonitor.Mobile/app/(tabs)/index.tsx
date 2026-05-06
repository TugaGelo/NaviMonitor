import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import VehicleCard from '../../components/VehicleCard';

import api from '../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function GarageScreen() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    const fetchRealData = async () => {
      if (authLoading) return;
      if (!user) return;

      try {
        setFetchingData(true);
        const response = await api.get('/vehicle');
        setVehicles(response.data);
      } catch (error: any) {
        console.error("💥 API Fetch Error:", error.response?.status, error.message);
      } finally {
        setFetchingData(false);
      }
    };

    fetchRealData();
  }, [user, authLoading]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.subHeader}>Select a vehicle to view dashboard</Text>
      
      <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
        <Text style={styles.logoutBtnText}>Sign Out</Text>
      </TouchableOpacity>

      {fetchingData ? (
        <ActivityIndicator size="large" color="#b7102a" style={{ marginTop: 40 }} />
      ) : vehicles.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Your garage is empty.</Text>
          <Text style={styles.emptySubText}>Add a vehicle in your backend to see it here!</Text>
        </View>
      ) : (
        vehicles.map((vehicle) => (
          <VehicleCard 
            key={vehicle.id}
            name={vehicle.nickname || vehicle.model}
            model={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            odometer={vehicle.startingOdometer?.toString() || '0'} 
            ltoReg={vehicle.registrationExpiry ? new Date(vehicle.registrationExpiry).toLocaleDateString() : 'Not Set'}
            lastRefuel="Check Logs"
            type={vehicle.vehicleType as 'CAR' | 'BIKE'}
            onPress={() => {
              router.push({
                pathname: '/vehicle/[id]',
                params: { id: vehicle.id }
              });
            }}    
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcf9f8' },
  content: { padding: 20, paddingBottom: 120 },
  subHeader: { fontSize: 14, color: '#4c4546', marginBottom: 20 },
  logoutBtn: { backgroundColor: '#b7102a', padding: 12, borderRadius: 8, marginBottom: 20, alignItems: 'center' },
  logoutBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  emptySubText: { fontSize: 14, color: '#7e7576', marginTop: 8 }
});
