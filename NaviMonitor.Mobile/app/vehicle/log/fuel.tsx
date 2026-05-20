import { View, Text, Pressable, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { VehicleRepository } from '../../../lib/localRepository';
import FormSheetWrapper from '../../../components/ui/FormSheetWrapper';
import StitchInput from '../../../components/ui/StitchInput';

export default function QuickRefuelLogScreen() {
  const router = useRouter();
  const { vehicleId, editId } = useLocalSearchParams();
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentOdo, setCurrentOdo] = useState(0);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], odometer: '', volume: '', totalCost: '', fuelType: 'Unleaded' });

  useEffect(() => {
    if (vehicleId) {
      VehicleRepository.getVehicleStats(Number(vehicleId)).then(stats => {
        setCurrentOdo(stats.currentOdo);
        if (!editId) setForm(f => ({ ...f, odometer: (stats.currentOdo + 1).toString() }));
      });
    }
  }, [vehicleId, editId]);

  useEffect(() => {
    if (editId) {
      VehicleRepository.getFuelLogById(Number(editId)).then(log => {
        if (log) setForm({ date: log.date, odometer: log.odometer.toString(), volume: log.volume.toString(), totalCost: log.totalCost.toString(), fuelType: log.fuelType || 'Unleaded' });
      });
    }
  }, [editId]);

  const handleSave = async () => {
    if (!form.odometer || !form.volume || !form.totalCost) return Alert.alert("Missing Fields", "Please fill in all fields.");
    const newOdo = parseInt(form.odometer);
    if (!editId && newOdo < currentOdo) return Alert.alert("Invalid Odometer", `Cannot enter lower than ${currentOdo} km.`);

    const payload = { vehicleId: Number(vehicleId), date: form.date, odometer: newOdo, volume: parseFloat(form.volume), totalCost: parseFloat(form.totalCost), fuelType: form.fuelType };
    try {
      if (editId) await VehicleRepository.updateFuelLog({ id: Number(editId), ...payload });
      else await VehicleRepository.addRefuelLog(payload);
      router.back();
    } catch (e) { Alert.alert("Error", "Failed to save refuel log."); }
  };

  return (
    <FormSheetWrapper 
      title={editId ? 'Edit Fuel Log' : 'Quick Refuel Log'} 
      subtitle="Record your gas station visit" 
      snapHeight={0.44} 
      saveColor="bg-[#b7102a]"
      onClose={() => router.back()} 
      onSave={handleSave}
    >
      <View className="flex-row gap-4">
        <Pressable className="flex-1" onPress={() => setShowDatePicker(true)}>
          <View pointerEvents="none"><StitchInput label="Date" required value={form.date} icon={Calendar} editable={false} /></View>
        </Pressable>
        <View className="flex-1">
          <StitchInput label="Odometer" required placeholder={currentOdo.toString()} unit="km" keyboardType="numeric" value={form.odometer} onChange={(v) => setForm({...form, odometer: v})} />
        </View>
      </View>

      <View className="flex-row gap-4">
        <View className="flex-1"><StitchInput label="Volume" required placeholder="0.00" unit="L" keyboardType="numeric" value={form.volume} onChange={(v) => setForm({...form, volume: v})} /></View>
        <View className="flex-1"><StitchInput label="Total Cost" required placeholder="0.00" prefix="₱" keyboardType="numeric" value={form.totalCost} onChange={(v) => setForm({...form, totalCost: v})} /></View>
      </View>

      <Text className="text-[11px] font-bold text-[#111827] uppercase tracking-wider mb-2 pt-2">Fuel Type</Text>
      <View className="flex-row gap-2 flex-wrap">
        {['Unleaded', 'Premium', 'Diesel'].map(type => (
          <Pressable key={type} onPress={() => setForm({ ...form, fuelType: type })} className={`px-4 py-2 rounded-full border ${form.fuelType === type ? 'bg-[#111827] border-[#111827]' : 'bg-[#f9fafb] border-[#e5e7eb]'}`}>
            <Text className={`text-xs font-semibold ${form.fuelType === type ? 'text-white' : 'text-[#6b7280]'}`}>{type}</Text>
          </Pressable>
        ))}
      </View>

      {showDatePicker && (
        <DateTimePicker value={new Date(form.date)} mode="date" display="default" onChange={(_, d) => { setShowDatePicker(false); if (d) setForm({ ...form, date: d.toISOString().split('T')[0] }); }} />
      )}
    </FormSheetWrapper>
  );
}
