import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { VehicleRepository } from '../lib/localRepository';
import { Vehicle } from '../../types';

export default function TestGarageScreen() {
  const [testVehicles, setTestVehicles] = useState<Vehicle[]>([]);

  const refreshData = async () => {
    const data = await VehicleRepository.getVehicles();
    setTestVehicles(data);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleAddTest = async () => {
    await VehicleRepository.addVehicle({
      vehicleType: 'Car',
      nickname: `Test Car ${Date.now().toString().slice(-4)}`,
      make: 'TestMake',
      model: 'TestModel',
      year: 2024,
      color: 'Black',
      engineSizeCC: 2000,
      startingOdometer: 100,
      licensePlate: 'TEST-123',
    });
    refreshData();
  };

  return (
    <View style={{ flex: 1, padding: 50, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 24, fontWeight: '900', marginBottom: 20 }}>🛠 Database Lab</Text>
      
      <TouchableOpacity 
        onPress={handleAddTest}
        style={{ backgroundColor: '#000', padding: 15, borderRadius: 10, marginBottom: 20 }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>+ Add Dummy Vehicle</Text>
      </TouchableOpacity>

      <ScrollView>
        {testVehicles.map(v => (
          <View key={v.id} style={{ padding: 15, borderBottomWidth: 1, borderColor: '#eee' }}>
            <Text style={{ fontWeight: 'bold' }}>{v.nickname} (ID: {v.id})</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>Synced Status: {v.is_synced === 1 ? '✅ Yes' : '❌ No (Local)'}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
