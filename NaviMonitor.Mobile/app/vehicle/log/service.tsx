import { View, Text, TextInput, ScrollView, Pressable, Alert, Platform, Animated, Dimensions, Keyboard } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Save, Calendar, Wrench, Rocket, Store, Hammer, Phone } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { VehicleRepository } from '../../../lib/localRepository';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const StitchInput = ({ label, value, onChange, placeholder, unit, icon: Icon, keyboardType = 'default', required = false, editable = true, prefix, multiline = false, onFocus }: any) => (
  <View className={`flex flex-col mb-4 ${multiline ? 'flex-1' : ''}`}>
    <Text className="text-[11px] font-bold text-[#111827] uppercase tracking-wider mb-1.5">
      {label} {required && <Text className="text-[#b7102a]">*</Text>}
    </Text>
    <View className={`relative flex justify-center ${multiline ? 'flex-1' : ''}`}>
      {prefix && <Text className="absolute left-3 top-[14px] text-sm text-[#111827] font-medium z-10">{prefix}</Text>}
      {Icon && (
        <View className="absolute left-3 top-[14px] z-10 pointer-events-none">
          <Icon size={16} color="#9ca3af" />
        </View>
      )}
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor="#9ca3af"
        editable={editable}
        multiline={multiline}
        onFocus={onFocus}
        style={multiline ? { textAlignVertical: 'top', minHeight: 120 } : {}}
        className={`w-full bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-sm text-[#111827] font-medium 
          ${!editable ? 'opacity-70 bg-gray-100' : ''} 
          ${prefix ? 'pl-8' : (Icon ? 'pl-9' : 'px-3')} 
          ${unit ? 'pr-10' : ''}
          ${multiline ? 'pt-3 pb-3 h-full' : 'py-3'} 
        `}
      />
      {unit && <Text className="absolute right-3 top-[14px] text-sm text-[#9ca3af] font-medium pointer-events-none">{unit}</Text>}
    </View>
  </View>
);

export default function AddServiceLogScreen() {
  const router = useRouter();
  const { vehicleId, editId } = useLocalSearchParams();
  
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentOdo, setCurrentOdo] = useState(0);

  // Zone Tracking Logic
  const activeZone = useRef<'top' | 'bottom'>('top');
  const isKeyboardVisible = useRef(false);
  const kbHeight = useRef(0);

  const [form, setForm] = useState({
    logType: 'Maintenance' as 'Maintenance' | 'Modification',
    serviceType: '',
    date: new Date().toISOString().split('T')[0],
    odometer: '',
    price: '',
    isDIY: false,
    shopName: '',
    mechanicName: '',
    contactNumber: '',
    notes: ''
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (vehicleId) {
        const stats = await VehicleRepository.getVehicleStats(Number(vehicleId));
        setCurrentOdo(stats.currentOdo);
        if (!editId) {
          setForm(f => ({ ...f, odometer: (stats.currentOdo + 1).toString() }));
        }
      }
    };
    fetchStats();
  }, [vehicleId, editId]);

  useEffect(() => {
    const fetchEditData = async () => {
      if (editId) {
        const log = await VehicleRepository.getMaintenanceLogById(Number(editId));
        if (log) {
          setForm({
            logType: log.logType as 'Maintenance' | 'Modification',
            serviceType: log.serviceType,
            date: log.date,
            odometer: log.odometer.toString(),
            price: log.price.toString(),
            isDIY: Number(log.isDIY) === 1,
            shopName: log.shopName || '',
            mechanicName: log.mechanicName || '',
            contactNumber: log.contactNumber || '',
            notes: log.notes || ''
          });
        }
      }
    };
    fetchEditData();
  }, [editId]);

  useEffect(() => {
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 10 }).start();
  }, []);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      isKeyboardVisible.current = true;
      kbHeight.current = e.endCoordinates.height;
      if (activeZone.current === 'bottom') {
        Animated.timing(keyboardOffset, { toValue: -e.endCoordinates.height * 0.75, duration: 250, useNativeDriver: true }).start();
      } else {
        Animated.timing(keyboardOffset, { toValue: 0, duration: 250, useNativeDriver: true }).start();
      }
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      isKeyboardVisible.current = false;
      Animated.timing(keyboardOffset, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    });

    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const handleZone = (zone: 'top' | 'bottom') => {
    activeZone.current = zone;
    if (isKeyboardVisible.current && kbHeight.current > 0) {
      if (zone === 'bottom') {
        Animated.timing(keyboardOffset, { toValue: -kbHeight.current * 0.75, duration: 250, useNativeDriver: true }).start();
      } else {
        Animated.timing(keyboardOffset, { toValue: 0, duration: 250, useNativeDriver: true }).start();
      }
    }
  };

  const closeForm = () => {
    Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 250, useNativeDriver: true }).start(() => router.back());
  };

  const handleSave = async () => {
    if (!form.serviceType || !form.odometer || !form.price) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    const newOdo = parseInt(form.odometer);
    if (!editId && newOdo < currentOdo) {
      Alert.alert("Invalid Odometer", `Your last recorded odometer is ${currentOdo} km. You cannot enter a lower number.`);
      return;
    }

    try {
      if (editId) {
        await VehicleRepository.updateMaintenanceLog({
          id: Number(editId),
          vehicleId: Number(vehicleId),
          logType: form.logType,
          serviceType: form.serviceType,
          date: form.date,
          odometer: newOdo,
          price: parseFloat(form.price),
          isDIY: form.isDIY,
          shopName: form.shopName,
          mechanicName: form.mechanicName,
          contactNumber: form.contactNumber,
          notes: form.notes
        });
      } else {
        await VehicleRepository.addMaintenanceLog({
          vehicleId: Number(vehicleId),
          logType: form.logType,
          serviceType: form.serviceType,
          date: form.date,
          odometer: newOdo,
          price: parseFloat(form.price),
          isDIY: form.isDIY,
          shopName: form.shopName,
          mechanicName: form.mechanicName,
          contactNumber: form.contactNumber,
          notes: form.notes
        });
      }
      closeForm();
    } catch (e) {
      Alert.alert("Error", "Failed to save service log.");
    }
  };

  return (
    <View className="flex-1 justify-end">
      <Pressable className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={closeForm} />

      <Animated.View style={{ height: SCREEN_HEIGHT * 0.77, transform: [{ translateY: slideAnim }, { translateY: keyboardOffset }] }}>
        <View className="flex-1 bg-white rounded-t-[24px] overflow-hidden" style={{ elevation: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.15, shadowRadius: 20 }}>
          
          <View className="px-6 pt-5 pb-4 border-b border-[#f3f4f6]">
            <View className="flex-row justify-between items-start">
              <View>
                <Text className="text-2xl font-bold text-[#111827] tracking-tight">{editId ? 'Edit Service Log' : 'Service Log'}</Text>
                <Text className="text-sm text-[#6b7280] mt-1">
                  {form.logType === 'Maintenance' ? 'Record garage services and checkups' : 'Track your custom upgrades'}
                </Text>
              </View>
              <Pressable onPress={closeForm} className="p-1 -mr-2">
                <X size={24} color="#9ca3af" />
              </Pressable>
            </View>

            <View className="mt-4 flex-row bg-[#f3f4f6] p-1 rounded-lg w-full">
              {[
                { val: 'Maintenance', icon: Wrench, label: 'Maintenance' },
                { val: 'Modification', icon: Rocket, label: 'Modification' }
              ].map((opt) => {
                const isActive = form.logType === opt.val;
                return (
                  <Pressable
                    key={opt.val}
                    onPress={() => setForm({ ...form, logType: opt.val as 'Maintenance' | 'Modification' })}
                    className={`flex-1 flex-row items-center justify-center py-2 rounded-md ${isActive ? 'bg-black' : 'bg-transparent'}`}
                    style={isActive ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2 } : {}}
                  >
                    <opt.icon size={16} color={isActive ? '#fff' : '#6b7280'} />
                    <Text className={`ml-2 text-xs uppercase tracking-wider font-bold ${isActive ? 'text-white' : 'text-[#6b7280]'}`}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <ScrollView 
            bounces={false} 
            showsVerticalScrollIndicator={false} 
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}
          >
            
            <View className="flex-row gap-4">
              <View className="flex-1">
                <StitchInput label="Service / Mod Name" required placeholder="e.g. Changed Oil" value={form.serviceType} onChange={(v: string) => setForm({...form, serviceType: v})} onFocus={() => handleZone('top')} />
              </View>
              <View className="flex-1">
                <StitchInput label="Total Price" required placeholder="0.00" prefix="₱" keyboardType="numeric" value={form.price} onChange={(v: string) => setForm({...form, price: v})} onFocus={() => handleZone('top')} />
              </View>
            </View>

            <View className="flex-row flex-wrap gap-2 mb-4">
              {['Oil Change', 'Brakes', 'Tire Swap'].map(t => (
                <Pressable 
                  key={t} 
                  onPress={() => setForm(f => ({ ...f, serviceType: t }))} 
                  className={`px-3 py-1.5 rounded-lg border ${form.serviceType === t ? 'border-[#111827] bg-[#111827]' : 'border-[#e5e7eb] bg-[#f9fafb]'}`}
                >
                  <Text className={`text-[10px] font-bold uppercase tracking-wider ${form.serviceType === t ? 'text-white' : 'text-[#6b7280]'}`}>{t}</Text>
                </Pressable>
              ))}
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Pressable onPress={() => setShowDatePicker(true)}>
                  <View pointerEvents="none">
                    <StitchInput label="Date" required value={form.date} icon={Calendar} editable={false} />
                  </View>
                </Pressable>
              </View>
              <View className="flex-1">
                <StitchInput label="Odometer" required placeholder={currentOdo.toString()} unit="km" keyboardType="numeric" value={form.odometer} onChange={(v: string) => setForm({...form, odometer: v})} onFocus={() => handleZone('top')} />
              </View>
            </View>

            <Text className="text-[11px] font-bold text-[#111827] uppercase tracking-wider mb-2 mt-1">Service Mode</Text>
            <View className="flex-row bg-[#f3f4f6] p-1 rounded-lg w-full mb-4">
              {[
                { val: false, icon: Store, label: 'Professional' },
                { val: true, icon: Hammer, label: 'DIY Service' }
              ].map((opt) => {
                const isActive = form.isDIY === opt.val;
                return (
                  <Pressable
                    key={opt.label}
                    onPress={() => setForm({ ...form, isDIY: opt.val, shopName: '', mechanicName: '', contactNumber: '' })}
                    className={`flex-1 flex-row items-center justify-center py-2 rounded-md ${isActive ? 'bg-black' : 'bg-transparent'}`}
                    style={isActive ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2 } : {}}
                  >
                    <opt.icon size={16} color={isActive ? '#fff' : '#6b7280'} />
                    <Text className={`ml-2 text-xs uppercase tracking-wider font-bold ${isActive ? 'text-white' : 'text-[#6b7280]'}`}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {!form.isDIY && (
              <View className="flex-row gap-4">
                <View className="flex-1"><StitchInput label="Shop Name" placeholder="e.g. Honda Center" value={form.shopName} onChange={(v: string) => setForm({...form, shopName: v})} onFocus={() => handleZone('bottom')} /></View>
                <View className="flex-1"><StitchInput label="Mechanic / Phone" placeholder="Name or #" icon={Phone} value={form.contactNumber} onChange={(v: string) => setForm({...form, contactNumber: v})} onFocus={() => handleZone('bottom')} /></View>
              </View>
            )}

            <StitchInput multiline={true} label="Notes & Findings" placeholder="Write details about the parts used..." value={form.notes} onChange={(v: string) => setForm({...form, notes: v})} onFocus={() => handleZone('bottom')} />

            <View className="mt-2">
              <Pressable 
                onPress={handleSave}
                className="w-full bg-[#111827] py-3.5 rounded-lg flex-row items-center justify-center space-x-2 active:bg-[#374151] active:scale-[0.98] transition-transform"
                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}
              >
                <Save size={24} color="#fff" />
                <Text className="text-white text-base font-bold ml-1">{editId ? 'Update Record' : `Record ${form.logType}`}</Text>
              </Pressable>
            </View>

          </ScrollView>
        </View>
      </Animated.View>

      {showDatePicker && (
        <DateTimePicker
          value={new Date(form.date)}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setForm({ ...form, date: selectedDate.toISOString().split('T')[0] });
          }}
        />
      )}
    </View>
  );
}
