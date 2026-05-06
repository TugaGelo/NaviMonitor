import { View, Text, TextInput, ScrollView, Pressable, Alert, Platform, Animated, Dimensions, Keyboard } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { X, Car, Motorbike, Save, Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { VehicleRepository } from '../lib/localRepository';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const StitchInput = ({ label, value, onChange, placeholder, unit, icon: Icon, keyboardType = 'default', required = false, editable = true }: any) => (
  <View className="flex flex-col mb-5">
    <Text className="text-[11px] font-bold text-[#111827] uppercase tracking-wider mb-1.5">
      {label} {required && <Text className="text-[#e63946]">*</Text>}
    </Text>
    <View className="relative flex justify-center">
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor="#9ca3af"
        editable={editable}
        className={`w-full bg-[#f9fafb] border border-[#e5e7eb] rounded-lg px-3 py-3 text-sm text-[#111827] font-medium ${!editable ? 'opacity-70 bg-gray-100' : ''}`}
      />
      {unit && <Text className="absolute right-3 text-sm text-[#9ca3af] font-medium">{unit}</Text>}
      {Icon && (
        <View className="absolute right-3 pointer-events-none">
          <Icon size={18} color="#9ca3af" />
        </View>
      )}
    </View>
  </View>
);

export default function AddVehicleScreen() {
  const router = useRouter();
  
  const slideAnim = useRef(new Animated.Value(800)).current;
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 10,
    }).start();
  }, []);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        Animated.timing(keyboardOffset, {
          toValue: -e.endCoordinates.height, 
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    );
    
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(keyboardOffset, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => { 
      showSub.remove(); 
      hideSub.remove(); 
    };
  }, []);

  const closeForm = () => {
    Animated.timing(slideAnim, {
      toValue: 1000,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      router.back();
    });
  };

  const [form, setForm] = useState({
    nickname: '', make: '', model: '', year: new Date().getFullYear().toString(),
    vehicleType: 'Car', color: '', licensePlate: '', engineSizeCC: '',
    startingOdometer: '', registrationExpiry: '',
  });

  const handleSave = async () => {
    if (!form.nickname || !form.make || !form.startingOdometer || !form.licensePlate) {
      Alert.alert("Missing Fields", "Please fill in the required fields (*)");
      return;
    }
    try {
      await VehicleRepository.addVehicle({
        ...form,
        year: parseInt(form.year),
        engineSizeCC: parseInt(form.engineSizeCC) || 0,
        startingOdometer: parseInt(form.startingOdometer) || 0,
        hasSyncedManual: false,
      });
      closeForm();
    } catch (e) {
      Alert.alert("Error", "Failed to save vehicle.");
    }
  };

  return (
    <View className="flex-1 justify-end">
      
      <Pressable className="absolute inset-0 bg-black/50" onPress={closeForm} />

      <Animated.View 
        style={{ 
          height: SCREEN_HEIGHT * 0.665, 
          transform: [
            { translateY: slideAnim }, 
            { translateY: keyboardOffset }
          ] 
        }}
      >
        <View className="flex-1 bg-white rounded-t-[24px] shadow-2xl overflow-hidden">
          
          <View className="px-6 pt-5 pb-4 border-b border-[#f3f4f6]">
            <View className="flex-row justify-between items-start">
              <View>
                <Text className="text-2xl font-bold text-[#111827] tracking-tight">Add New Vehicle</Text>
                <Text className="text-sm text-[#6b7280] mt-1">Register a new asset to your Garage</Text>
              </View>
              <Pressable onPress={closeForm} className="p-1 -mr-2">
                <X size={24} color="#9ca3af" />
              </Pressable>
            </View>

            <View className="mt-3 flex-row bg-[#f3f4f6] p-1 rounded-lg w-full max-w-[800px]">
              {['Car', 'Motorcycle'].map((type) => {
                const isActive = form.vehicleType === type;
                return (
                  <Pressable
                    key={type}
                    onPress={() => setForm({ ...form, vehicleType: type })}
                    className={`flex-1 flex-row items-center justify-center py-1.5 rounded-md ${
                      isActive ? 'bg-black shadow-sm' : 'bg-transparent'
                    }`}
                  >
                    {type === 'Car' 
                      ? <Car size={24} color={isActive ? '#fff' : '#6b7280'} />
                      : <Motorbike size={24} color={isActive ? '#fff' : '#6b7280'} />
                    }
                    <Text className={`ml-2 text-sm ${isActive ? 'text-white font-semibold' : 'text-[#6b7280] font-medium'}`}>
                      {type === 'Motorcycle' ? 'Bike' : type}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <ScrollView 
            className="flex-1 px-6 pt-6" 
            showsVerticalScrollIndicator={false} 
            keyboardShouldPersistTaps="handled"
          >
            
            <StitchInput label="Nickname" required placeholder="e.g. Red Thunder" value={form.nickname} onChange={(v: string) => setForm({...form, nickname: v})} />

            <View className="flex-row gap-4">
              <View className="flex-1"><StitchInput label="Make" required placeholder="Honda" value={form.make} onChange={(v: string) => setForm({...form, make: v})} /></View>
              <View className="flex-1"><StitchInput label="Model" required placeholder="Civic" value={form.model} onChange={(v: string) => setForm({...form, model: v})} /></View>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1"><StitchInput label="Year" placeholder="2026" keyboardType="numeric" value={form.year} onChange={(v: string) => setForm({...form, year: v})} /></View>
              <View className="flex-1"><StitchInput label="Color" placeholder="Black" value={form.color} onChange={(v: string) => setForm({...form, color: v})} /></View>
            </View>

            <View className="flex-row gap-4">
               <View className="flex-1"><StitchInput label="Plate" required placeholder="ABC-1234" value={form.licensePlate} onChange={(v: string) => setForm({...form, licensePlate: v})} /></View>
               <View className="flex-1"><StitchInput label="Start Odo" placeholder="0" unit="km" keyboardType="numeric" value={form.startingOdometer} onChange={(v: string) => setForm({...form, startingOdometer: v})} /></View>
            </View>

            <View className="flex-row gap-4">
                <View className="flex-1"><StitchInput label="Engine Capacity" placeholder="1500" unit="CC" keyboardType="numeric" value={form.engineSizeCC} onChange={(v: string) => setForm({...form, engineSizeCC: v})} /></View>
                <View className="flex-1">
                  <Pressable onPress={() => setShowDatePicker(true)}>
                    <View pointerEvents="none">
                      <StitchInput label="Reg. Expiry" placeholder="YYYY-MM-DD" icon={Calendar} value={form.registrationExpiry} editable={false} />
                    </View>
                  </Pressable>
                </View>
            </View>

          </ScrollView>

          <View className="p-5 border-t border-[#f3f4f6] bg-[#f9fafb] pb-8">
            <Pressable 
              onPress={handleSave}
              className="w-full bg-[#e63946] py-3.5 rounded-lg flex-row items-center justify-center space-x-2 active:bg-[#d62828] active:scale-[0.98] transition-transform"
              style={{ shadowColor: '#ef4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}
            >
              <Save size={24} color="#fff" />
              <Text className="text-white text-base font-bold ml-1">Save Vehicle</Text>
            </Pressable>
          </View>

        </View>
      </Animated.View>

      {showDatePicker && (
        <DateTimePicker
          value={form.registrationExpiry ? new Date(form.registrationExpiry) : new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setForm({ ...form, registrationExpiry: selectedDate.toISOString().split('T')[0] });
            }
          }}
        />
      )}
    </View>
  );
}