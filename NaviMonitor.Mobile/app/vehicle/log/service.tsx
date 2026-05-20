import { View, Pressable, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar, Wrench, Rocket, Store, Hammer, Phone } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { VehicleRepository } from '../../../lib/localRepository';
import FormSheetWrapper from '../../../components/ui/FormSheetWrapper';
import SegmentedControl from '../../../components/ui/SegmentedControl';
import StitchInput from '../../../components/ui/StitchInput';
import { runSyncEngine } from '../../../hooks/useAutoSync';

export default function AddServiceLogScreen() {
  const router = useRouter();
  const { vehicleId, editId, mode, item } = useLocalSearchParams();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentOdo, setCurrentOdo] = useState(0);

  const [form, setForm] = useState({
    logType: (mode === 'modification' ? 'Modification' : 'Maintenance') as 'Maintenance' | 'Modification',
    serviceCategory: mode === 'modification' ? 'Upgrade' : (mode === 'scheduled' ? 'Scheduled' : 'Unscheduled'),
    serviceType: (mode === 'scheduled' && item) ? (item as string) : '', date: new Date().toISOString().split('T')[0],
    odometer: '', price: '', isDIY: false, shopName: '', mechanicName: '', contactNumber: '', notes: ''
  });

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
      VehicleRepository.getMaintenanceLogById(Number(editId)).then(log => {
        if (log) setForm({ logType: log.logType as any, serviceCategory: log.serviceCategory || 'Unscheduled', serviceType: log.serviceType, date: log.date, odometer: log.odometer.toString(), price: log.price.toString(), isDIY: Number(log.isDIY) === 1, shopName: log.shopName || '', mechanicName: log.mechanicName || '', contactNumber: log.contactNumber || '', notes: log.notes || '' });
      });
    }
  }, [editId]);

  const handleSave = async () => {
    if (!form.serviceType || !form.odometer || !form.price) return Alert.alert("Missing Fields", "Please complete all required fields.");
    
    const newOdo = parseInt(form.odometer) || 0;
    const price = parseFloat(form.price) || 0;

    if (!editId && newOdo <= currentOdo) return Alert.alert("Invalid Odometer", `Must be strictly higher than ${currentOdo} km.`);

    const payload = { vehicleId: Number(vehicleId), logType: form.logType, serviceCategory: form.serviceCategory, serviceType: form.serviceType, date: form.date, odometer: newOdo, price: price, isDIY: form.isDIY, shopName: form.shopName, mechanicName: form.mechanicName, contactNumber: form.contactNumber, notes: form.notes };
    
    try {
      if (editId) await VehicleRepository.updateMaintenanceLog({ id: Number(editId), ...payload });
      else await VehicleRepository.addMaintenanceLog(payload);
      
      runSyncEngine();
      
      router.back();
    } catch (e) { 
      Alert.alert("Error", "Failed to save record."); 
    }
  };

  const getHeaderDetails = () => {
    if (editId) return { title: 'Edit Record', sub: 'Update history log entry' };
    if (mode === 'scheduled') return { title: 'Scheduled Maintenance', sub: 'Factory recommended lifespan reset' };
    if (mode === 'modification') return { title: 'Add Modification', sub: 'Track your custom upgrades & mods' };
    return { title: 'Custom Service', sub: 'Record custom garage checkups and upkeep' };
  };

  const header = getHeaderDetails();

  return (
    <FormSheetWrapper
      title={header.title} subtitle={header.sub} snapHeight={0.67} saveColor="bg-[#111827]" onClose={() => router.back()} onSave={handleSave}
      headerHeaderExtra={(!mode && !editId) ? (
        <SegmentedControl options={[{ label: 'Maintenance', value: 'Maintenance', icon: Wrench }, { label: 'Modification', value: 'Modification', icon: Rocket }]} selectedValue={form.logType} onChange={(v) => setForm({ ...form, logType: v })} />
      ) : undefined}
    >
      <View className="flex-row gap-4">
        <View className="flex-1"><StitchInput label={mode === 'scheduled' ? 'Matrix Item (Locked)' : 'Service / Mod Name'} required placeholder={mode === 'modification' ? 'e.g. Roof Rack' : 'e.g. Changed Oil'} value={form.serviceType} onChange={(v) => setForm({...form, serviceType: v})} editable={mode !== 'scheduled'} /></View>
        <View className="flex-1"><StitchInput label="Total Price" required placeholder="0.00" prefix="₱" keyboardType="numeric" value={form.price} onChange={(v) => setForm({...form, price: v})} /></View>
      </View>
      <View className="flex-row gap-4">
        <Pressable className="flex-1" onPress={() => setShowDatePicker(true)}>
          <View pointerEvents="none"><StitchInput label="Date" required value={form.date} icon={Calendar} editable={false} /></View>
        </Pressable>
        <View className="flex-1"><StitchInput label="Odometer" required placeholder={currentOdo.toString()} unit="km" keyboardType="numeric" value={form.odometer} onChange={(v) => setForm({...form, odometer: v})} /></View>
      </View>

      <View className="mb-4">
        <SegmentedControl options={[{ label: 'Professional', value: false, icon: Store }, { label: 'DIY Service', value: true, icon: Hammer }]} selectedValue={form.isDIY} onChange={(v) => setForm({ ...form, isDIY: v, shopName: '', mechanicName: '', contactNumber: '' })} />
      </View>

      {!form.isDIY && (
        <View className="flex-row gap-4">
          <View className="flex-1"><StitchInput label="Shop Name" placeholder="e.g. Honda Center" value={form.shopName} onChange={(v) => setForm({...form, shopName: v})} /></View>
          <View className="flex-1"><StitchInput label="Mechanic / Phone" placeholder="Name or #" icon={Phone} iconPosition="right" value={form.contactNumber} onChange={(v) => setForm({...form, contactNumber: v})} /></View>
        </View>
      )}
      <StitchInput multiline={true} label="Notes & Findings" placeholder="Write details about the parts used..." value={form.notes} onChange={(v) => setForm({...form, notes: v})} />

      {showDatePicker && (
        <DateTimePicker value={new Date(form.date)} mode="date" display="default" onChange={(_, d) => { setShowDatePicker(false); if (d) setForm({ ...form, date: d.toISOString().split('T')[0] }); }} />
      )}
    </FormSheetWrapper>
  );
}
