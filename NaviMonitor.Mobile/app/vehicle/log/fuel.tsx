import { View, Text, TextInput, ScrollView, Pressable, Alert, Platform, Animated, Dimensions, Keyboard } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Save, Calendar, Fuel } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { VehicleRepository } from '../../../lib/localRepository';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const StitchInput = ({ label, value, onChange, placeholder, unit, icon: Icon, keyboardType = 'default', required = false, editable = true, prefix }: any) => (
  <View className="flex flex-col mb-5">
    <Text className="text-[11px] font-bold text-[#111827] uppercase tracking-wider mb-1.5">
      {label} {required && <Text className="text-[#b7102a]">*</Text>}
    </Text>
    <View className="relative flex justify-center">
      {prefix && <Text className="absolute left-3 text-sm text-[#111827] font-medium z-10">{prefix}</Text>}
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor="#9ca3af"
        editable={editable}
        className={`w-full bg-[#f9fafb] border border-[#e5e7eb] rounded-lg py-3 text-sm text-[#111827] font-medium 
          ${!editable ? 'opacity-70 bg-gray-100' : ''} 
          ${prefix ? 'pl-8' : 'px-3'} 
          ${unit || Icon ? 'pr-10' : ''}
        `}
      />
      {unit && <Text className="absolute right-3 text-sm text-[#9ca3af] font-medium pointer-events-none">{unit}</Text>}
      {Icon && (
        <View className="absolute right-3 pointer-events-none">
          <Icon size={18} color="#9ca3af" />
        </View>
      )}
    </View>
  </View>
);

export default function QuickRefuelLogScreen() {
  const router = useRouter();
  const { vehicleId, editId } = useLocalSearchParams();
  
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentOdo, setCurrentOdo] = useState(0);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    odometer: '',
    volume: '',
    totalCost: '',
    fuelType: 'Unleaded'
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
        const log = await VehicleRepository.getFuelLogById(Number(editId));
        if (log) {
          setForm({
            date: log.date,
            odometer: log.odometer.toString(),
            volume: log.volume.toString(),
            totalCost: log.totalCost.toString(),
            fuelType: log.fuelType || 'Unleaded'
          });
        }
      }
    };
    fetchEditData();
  }, [editId]);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 10,
    }).start();
  }, []);

  useEffect(() => {
    const showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', (e) => {
      Animated.timing(keyboardOffset, { toValue: -e.endCoordinates.height, duration: 250, useNativeDriver: true }).start();
    });
    const hideSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => {
      Animated.timing(keyboardOffset, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    });
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const closeForm = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      router.back();
    });
  };

  const handleSave = async () => {
    if (!form.odometer || !form.volume || !form.totalCost) {
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
        await VehicleRepository.updateFuelLog({
          id: Number(editId),
          vehicleId: Number(vehicleId),
          date: form.date,
          odometer: newOdo,
          volume: parseFloat(form.volume),
          totalCost: parseFloat(form.totalCost),
          fuelType: form.fuelType
        });
      } else {
        await VehicleRepository.addRefuelLog({
          vehicleId: Number(vehicleId),
          date: form.date,
          odometer: newOdo,
          volume: parseFloat(form.volume),
          totalCost: parseFloat(form.totalCost),
          fuelType: form.fuelType
        });
      }
      closeForm();
    } catch (e) {
      Alert.alert("Error", "Failed to save refuel log.");
    }
  };

  return (
    <View className="flex-1 justify-end">
      <Pressable className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={closeForm} />

      <Animated.View style={{ height: SCREEN_HEIGHT * 0.46, transform: [{ translateY: slideAnim }, { translateY: keyboardOffset }] }}>
        <View className="flex-1 bg-white rounded-t-[24px] overflow-hidden" style={{ elevation: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.15, shadowRadius: 20 }}>
          
          <View className="px-6 pt-5 pb-4 border-b border-[#f3f4f6]">
            <View className="flex-row justify-between items-start">
              <View>
                <Text className="text-2xl font-bold text-[#111827] tracking-tight">{editId ? 'Edit Fuel Log' : 'Quick Refuel Log'}</Text>
                <Text className="text-sm text-[#6b7280] mt-1">Record your gas station visit</Text>
              </View>
              <Pressable onPress={closeForm} className="p-1 -mr-2">
                <X size={24} color="#9ca3af" />
              </Pressable>
            </View>
          </View>

          <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Pressable onPress={() => setShowDatePicker(true)}>
                  <View pointerEvents="none">
                    <StitchInput label="Date" required value={form.date} icon={Calendar} editable={false} />
                  </View>
                </Pressable>
              </View>
              <View className="flex-1">
                <StitchInput 
                  label="Odometer" 
                  required 
                  placeholder={currentOdo.toString()} 
                  unit="km" 
                  keyboardType="numeric" 
                  value={form.odometer} 
                  onChange={(v: string) => setForm({...form, odometer: v})} 
                />
              </View>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <StitchInput 
                  label="Volume" 
                  required 
                  placeholder="0.00" 
                  unit="L" 
                  keyboardType="numeric" 
                  value={form.volume} 
                  onChange={(v: string) => setForm({...form, volume: v})} 
                />
              </View>
              <View className="flex-1">
                <StitchInput 
                  label="Total Cost" 
                  required 
                  placeholder="0.00" 
                  prefix="₱" 
                  keyboardType="numeric" 
                  value={form.totalCost} 
                  onChange={(v: string) => setForm({...form, totalCost: v})} 
                />
              </View>
            </View>

            <View className="flex flex-col mb-5 pt-2">
              <Text className="text-[11px] font-bold text-[#111827] uppercase tracking-wider mb-2">Fuel Type</Text>
              <View className="flex-row gap-2 flex-wrap">
                {['Unleaded', 'Premium', 'Diesel'].map((type) => {
                  const isActive = form.fuelType === type;
                  return (
                    <Pressable
                      key={type}
                      onPress={() => setForm({ ...form, fuelType: type })}
                      className={`px-4 py-2.5 rounded-full border ${isActive ? 'bg-[#111827] border-[#111827]' : 'bg-[#f9fafb] border-[#e5e7eb]'}`}
                    >
                      <Text className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-[#6b7280]'}`}>
                        {type}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

          </ScrollView>

          <View className="p-5 border-t border-[#f3f4f6] bg-[#f9fafb] pb-8">
            <Pressable 
              onPress={handleSave}
              className="w-full bg-[#b7102a] py-3.5 rounded-lg flex-row items-center justify-center space-x-2 active:bg-[#93000a] active:scale-[0.98] transition-transform"
              style={{ shadowColor: '#b7102a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}
            >
              <Save size={24} color="#fff" />
              <Text className="text-white text-base font-bold ml-1">{editId ? 'Update Log' : 'Save Log'}</Text>
            </Pressable>
          </View>

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
