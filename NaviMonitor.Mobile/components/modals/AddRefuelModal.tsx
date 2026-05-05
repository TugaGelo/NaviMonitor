import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Platform,
  Keyboard 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import BaseBottomSheet from '../ui/BaseBottomSheet';

interface AddRefuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleNickname: string;
  onSave: (data: any) => void;
}

export default function AddRefuelModal({ isOpen, onClose, vehicleNickname, onSave }: AddRefuelModalProps) {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [odometer, setOdometer] = useState('');
  const [volume, setVolume] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [fuelType, setFuelType] = useState('Unleaded');

  const FUEL_TYPES = ['Unleaded', 'Premium', 'Diesel'];

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSave = () => {
    onSave({ 
      date: date.toISOString().split('T')[0], 
      odometer: Number(odometer), 
      volume: Number(volume), 
      totalCost: Number(totalCost), 
      fuelType 
    });
    
    setOdometer('');
    setVolume('');
    setTotalCost('');
    setFuelType('Unleaded');
    setDate(new Date());
    
    onClose();
  };

  return (
    <BaseBottomSheet isOpen={isOpen} onClose={onClose} title="Quick Refuel Log">
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Text style={styles.subtitle}>Recording fill-up for {vehicleNickname}</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity 
            style={styles.inputWrapper} 
            activeOpacity={1}
            onPress={() => {
              Keyboard.dismiss();
              setShowDatePicker(!showDatePicker);
            }}
          >
            <Text style={styles.inputText}>
              {date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </Text>
            <MaterialCommunityIcons name="calendar-month" size={20} color="#7e7576" style={styles.inputIcon} />
          </TouchableOpacity>

          {showDatePicker && (
            Platform.OS === 'ios' ? (
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="spinner"
                  onChange={onDateChange}
                  themeVariant="light"
                  maximumDate={new Date()}
                />
                <TouchableOpacity style={styles.iosDoneBtn} onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.iosDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Odometer</Text>
          <View style={styles.inputWrapper}>
            <TextInput 
              style={styles.input} 
              value={odometer} 
              onChangeText={setOdometer} 
              keyboardType="numeric" 
              placeholder="0" 
            />
            <Text style={styles.unitText}>km</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Volume</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.input} 
                value={volume} 
                onChangeText={setVolume} 
                keyboardType="numeric" 
                placeholder="0.00" 
              />
              <Text style={styles.unitText}>L</Text>
            </View>
          </View>
          
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Total Cost</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.currencyText}>₱</Text>
              <TextInput 
                style={[styles.input, { paddingLeft: 25 }]} 
                value={totalCost} 
                onChangeText={setTotalCost} 
                keyboardType="numeric" 
                placeholder="0.00" 
              />
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fuel Type</Text>
          <View style={styles.chipRow}>
            {FUEL_TYPES.map((type) => (
              <TouchableOpacity 
                key={type} 
                style={[styles.chip, fuelType === type && styles.chipActive]}
                onPress={() => setFuelType(type)}
              >
                <Text style={[styles.chipText, fuelType === type && styles.chipTextActive]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
          <Text style={styles.saveBtnText}>Save Log</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </BaseBottomSheet>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 14, color: '#7e7576', marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '700', color: '#000', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
  
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#cfc4c5', 
    borderRadius: 12, 
    backgroundColor: '#fcf9f8',
    justifyContent: 'space-between',
    height: 54,
  },
  input: { 
    flex: 1, 
    paddingHorizontal: 16, 
    paddingVertical: 0,
    fontSize: 16, 
    color: '#000',
    height: '100%',
  },
  inputText: { 
    flex: 1, 
    paddingHorizontal: 16, 
    fontSize: 16, 
    color: '#000',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  inputIcon: { marginRight: 16 },
  unitText: { marginRight: 16, fontSize: 14, color: '#7e7576', fontWeight: '600' },
  currencyText: { position: 'absolute', left: 16, fontSize: 16, color: '#7e7576', fontWeight: '600' },
  row: { flexDirection: 'row', gap: 16 },
  
  pickerContainer: { backgroundColor: '#f6f3f2', borderRadius: 12, marginTop: 8, overflow: 'hidden' },
  iosDoneBtn: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#cfc4c5', alignItems: 'center' },
  iosDoneText: { color: '#000', fontWeight: '700', fontSize: 16 },

  chipRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#cfc4c5', backgroundColor: '#fff' },
  chipActive: { backgroundColor: '#000', borderColor: '#000' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#4c4546' },
  chipTextActive: { color: '#fff' },

  saveBtn: { 
    flexDirection: 'row', 
    backgroundColor: '#b7102a', 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8,
    marginTop: 10
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
