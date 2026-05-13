import { View, Text, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { Gauge, CalendarDays, MoreHorizontal, ShieldAlert, Car, Motorbike } from 'lucide-react-native';
import { Vehicle } from '../types';
import { useRouter, Href } from 'expo-router';
import { VehicleRepository } from '../lib/localRepository';
import ActionSheet from './ui/ActionSheet';
import ConfirmDialog from './ui/ConfirmDialog';

interface Props {
  vehicle: Vehicle;
  onRefresh: () => void;
}

export default function VehicleCard({ vehicle, onRefresh }: Props) {
  const router = useRouter();
  
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isExpiringSoon = vehicle.registrationExpiry && 
    (new Date(vehicle.registrationExpiry).getTime() - new Date().getTime()) / (1000 * 3600 * 24) < 30;

  const VehicleIcon = vehicle.vehicleType === 'Car' ? Car : Motorbike;

  const handleEdit = () => {
    setShowActionSheet(false);
    router.push(`/vehicle/edit/${vehicle.id}` as Href);
  };

  const triggerDeleteConfirm = () => {
    setShowActionSheet(false);
    setTimeout(() => {
      setShowDeleteDialog(true);
    }, 50);
  };

  const executeDelete = async () => {
    setShowDeleteDialog(false);
    try {
      await VehicleRepository.deleteVehicle(vehicle.id);
      onRefresh(); 
    } catch (error) {
      Alert.alert("Error", "Failed to delete the vehicle.");
    }
  };

  return (
    <>
      <Pressable 
        onPress={() => router.push(`/vehicle/${vehicle.id}` as Href)}
        className="bg-surface-container rounded-2xl p-6 mb-4 relative overflow-hidden active:opacity-80"
        style={{ shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.05, shadowRadius: 0, elevation: 2 }}
      >
        <View className="flex-row justify-between items-start mb-6">
          <View>
            <View className="flex-row items-center gap-2 mb-1">
              <View className="bg-primary px-2.5 py-1.5 rounded-full">
                <VehicleIcon size={14} color="#fff" />
              </View>
              <Text className="text-on-surface-variant text-xs font-bold uppercase">
                {vehicle.year} {vehicle.make}
              </Text>
            </View>
            <Text className="text-primary text-3xl font-black tracking-tighter mt-1">
              {vehicle.nickname}
            </Text>
          </View>
          
          <Pressable className="p-2 -mr-2" onPress={() => setShowActionSheet(true)}>
            <MoreHorizontal size={24} color="#000" />
          </Pressable>
        </View>

        <View className="flex-row gap-4 mt-auto">
          <View className="flex-1 bg-surface-container-high rounded-xl p-4">
            <View className="flex-row items-center gap-2 mb-2">
              <Gauge size={16} color="#4c4546" />
              <Text className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Odometer</Text>
            </View>
            <Text className="text-primary text-xl font-black">
              {vehicle.startingOdometer.toLocaleString()} <Text className="text-on-surface-variant text-sm font-normal">km</Text>
            </Text>
          </View>

          <View className={`flex-1 rounded-xl p-4 ${isExpiringSoon ? 'bg-[#ffdad8]' : 'bg-surface-container-high'}`}>
            <View className="flex-row items-center gap-2 mb-2">
              {isExpiringSoon ? <ShieldAlert size={16} color="#b7102a" /> : <CalendarDays size={16} color="#4c4546" />}
              <Text className={`text-xs font-bold uppercase tracking-wider ${isExpiringSoon ? 'text-secondary' : 'text-on-surface-variant'}`}>LTO Reg</Text>
            </View>
            <Text className={`text-sm font-bold ${isExpiringSoon ? 'text-secondary' : 'text-primary'}`}>
              {vehicle.registrationExpiry ? new Date(vehicle.registrationExpiry).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}
            </Text>
          </View>
        </View>
      </Pressable>

      <ActionSheet 
        visible={showActionSheet}
        title="VEHICLE OPTIONS"
        onEdit={handleEdit}
        onDelete={triggerDeleteConfirm}
        onCancel={() => setShowActionSheet(false)}
      />

      <ConfirmDialog 
        visible={showDeleteDialog}
        title="Are you absolutely sure?"
        description="This action cannot be undone. You are about to permanently delete:"
        highlightedText={vehicle.nickname}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={executeDelete}
      />
    </>
  );
}
