import { View, Pressable, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Car, Motorbike, Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { VehicleRepository } from '../../lib/localRepository';
import FormSheetWrapper from '../../components/ui/FormSheetWrapper';
import SegmentedControl from '../../components/ui/SegmentedControl';
import StitchInput from '../../components/ui/StitchInput';

export default function AddVehicleScreen() {
  const router = useRouter();
  const { editId } = useLocalSearchParams();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [form, setForm] = useState({ nickname: '', make: '', model: '', year: '2026', vehicleType: 'Car', color: '', licensePlate: '', engineSizeCC: '', startingOdometer: '', registrationExpiry: '' });

  useEffect(() => {
    if (editId) {
      VehicleRepository.getVehicleById(Number(editId)).then(v => {
        if (v) setForm({ nickname: v.nickname, make: v.make, model: v.model, year: v.year.toString(), vehicleType: v.vehicleType, color: v.color || '', licensePlate: v.licensePlate, engineSizeCC: v.engineSizeCC?.toString() || '', startingOdometer: v.startingOdometer.toString(), registrationExpiry: v.registrationExpiry || '' });
      });
    }
  }, [editId]);

  const handleSave = async () => {
    if (!form.nickname || !form.make || !form.startingOdometer || !form.licensePlate) return Alert.alert("Missing Fields", "Please complete required fields (*)");
    const vehiclePayload = { ...form, year: parseInt(form.year), engineSizeCC: parseInt(form.engineSizeCC) || 0, startingOdometer: parseInt(form.startingOdometer) || 0 };

    try {
      if (editId) await VehicleRepository.updateVehicle({ id: Number(editId), ...vehiclePayload });
      else await VehicleRepository.addVehicle({ ...vehiclePayload, hasSyncedManual: false, maintenanceMatrixJson: JSON.stringify(form.vehicleType === 'Motorcycle' ? BIKE_MATRIX : CAR_MATRIX) });
      router.back();
    } catch (e) { Alert.alert("Error", "Failed to save vehicle."); }
  };

  return (
    <FormSheetWrapper
      title={editId ? 'Edit Vehicle' : 'Add New Vehicle'}
      subtitle={editId ? 'Update your vehicle details' : 'Register a new asset to your Garage'}
      snapHeight={0.65}
      saveColor="bg-[#e63946]"
      onClose={() => router.back()}
      onSave={handleSave}
      headerHeaderExtra={
        <SegmentedControl 
          options={[{ label: 'Car', value: 'Car', icon: Car }, { label: 'Bike', value: 'Motorcycle', icon: Motorbike }]} 
          selectedValue={form.vehicleType} 
          onChange={(val) => !editId && setForm({ ...form, vehicleType: val })} 
        />
      }
    >
      <StitchInput label="Nickname" required placeholder="e.g. Red Thunder" value={form.nickname} onChange={(v) => setForm({...form, nickname: v})} />
      <View className="flex-row gap-4">
        <View className="flex-1"><StitchInput label="Make" required placeholder="Honda" value={form.make} onChange={(v) => setForm({...form, make: v})} /></View>
        <View className="flex-1"><StitchInput label="Model" required placeholder="Civic" value={form.model} onChange={(v) => setForm({...form, model: v})} /></View>
      </View>
      <View className="flex-row gap-4">
        <View className="flex-1"><StitchInput label="Year" placeholder="2026" keyboardType="numeric" value={form.year} onChange={(v) => setForm({...form, year: v})} /></View>
        <View className="flex-1"><StitchInput label="Color" placeholder="Black" value={form.color} onChange={(v) => setForm({...form, color: v})} /></View>
      </View>
      <View className="flex-row gap-4">
         <View className="flex-1"><StitchInput label="Plate" required placeholder="ABC-1234" value={form.licensePlate} onChange={(v) => setForm({...form, licensePlate: v})} /></View>
         <View className="flex-1"><StitchInput label="Start Odo" placeholder="0" unit="km" keyboardType="numeric" value={form.startingOdometer} onChange={(v) => setForm({...form, startingOdometer: v})} editable={!editId} /></View>
      </View>
      <View className="flex-row gap-4">
          <View className="flex-1"><StitchInput label="Engine Capacity" placeholder="1500" unit="CC" keyboardType="numeric" value={form.engineSizeCC} onChange={(v) => setForm({...form, engineSizeCC: v})} /></View>
          <Pressable className="flex-1" onPress={() => setShowDatePicker(true)}>
            <View pointerEvents="none"><StitchInput label="Reg. Expiry" placeholder="YYYY-MM-DD" icon={Calendar} iconPosition="right" value={form.registrationExpiry} editable={false} /></View>
          </Pressable>
      </View>

      {showDatePicker && (
        <DateTimePicker value={form.registrationExpiry ? new Date(form.registrationExpiry) : new Date()} mode="date" display="default" onChange={(_, d) => { setShowDatePicker(false); if (d) setForm({ ...form, registrationExpiry: d.toISOString().split('T')[0] }); }} />
      )}
    </FormSheetWrapper>
  );
}

const CAR_MATRIX = [{ item: "Engine Oil", interval: 10000, action: "Replace" }, { item: "Oil Filter", interval: 10000, action: "Replace" }, { item: "Air Filter", interval: 20000, action: "Replace" }, { item: "Brake Pads", interval: 30000, action: "Replace" }, { item: "Spark Plugs", interval: 40000, action: "Replace" }];
const BIKE_MATRIX = [{ item: "Engine Oil", interval: 3000, action: "Replace" }, { item: "Oil Filter", interval: 6000, action: "Replace" }, { item: "Drive Chain", interval: 1000, action: "Clean/Lube" }, { item: "Spark Plugs", interval: 12000, action: "Replace" }, { item: "Brake Pads", interval: 15000, action: "Replace" }];
