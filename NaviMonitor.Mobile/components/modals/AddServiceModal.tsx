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

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleNickname: string;
  initialTask?: string; 
  onSave: (data: any) => void;
}

export default function AddServiceModal({ isOpen, onClose, vehicleNickname, initialTask = '', onSave }: AddServiceModalProps) {
  const [logType, setLogType] = useState<'Maintenance' | 'Modification'>('Maintenance');
  const [serviceTask, setServiceTask] = useState(initialTask);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [odometer, setOdometer] = useState('');
  const [price, setPrice] = useState('');
  
  const [isDIY, setIsDIY] = useState(false);
  const [shopName, setShopName] = useState('');
  const [mechanicName, setMechanicName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  
  const [notes, setNotes] = useState('');

  const QUICK_CHIPS = ["Oil Change", "Brakes", "Tire Swap", "Spark Plug"];

  React.useEffect(() => {
    if (isOpen) setServiceTask(initialTask);
  }, [isOpen, initialTask]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleSave = () => {
    onSave({ 
      logType,
      serviceTask,
      date: date.toISOString().split('T')[0], 
      odometer: Number(odometer), 
      price: Number(price), 
      isDIY,
      shopName: isDIY ? '' : shopName,
      mechanicName: isDIY ? '' : mechanicName,
      contactNumber: isDIY ? '' : contactNumber,
      notes
    });
    
    setLogType('Maintenance');
    setServiceTask('');
    setOdometer('');
    setPrice('');
    setIsDIY(false);
    setShopName('');
    setMechanicName('');
    setContactNumber('');
    setNotes('');
    setDate(new Date());
    
    onClose();
  };

  return (
    <BaseBottomSheet isOpen={isOpen} onClose={onClose} title="Log Service">
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
      >
        <Text style={styles.subtitle}>
          {logType === 'Maintenance' ? "Record garage services and checkups" : "Track custom performance mods"} for {vehicleNickname}
        </Text>

        <View style={styles.inputGroup}>
          <View style={styles.toggleRow}>
            <TouchableOpacity 
              style={[styles.segmentBtn, logType === 'Maintenance' && styles.segmentBtnActive]}
              onPress={() => setLogType('Maintenance')}
            >
              <MaterialCommunityIcons name="wrench" size={16} color={logType === 'Maintenance' ? "#fff" : "#4c4546"} />
              <Text style={[styles.segmentText, logType === 'Maintenance' && styles.segmentTextActive]}>Maintenance</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.segmentBtn, logType === 'Modification' && styles.segmentBtnActive]}
              onPress={() => setLogType('Modification')}
            >
              <MaterialCommunityIcons name="rocket-launch" size={16} color={logType === 'Modification' ? "#fff" : "#4c4546"} />
              <Text style={[styles.segmentText, logType === 'Modification' && styles.segmentTextActive]}>Modification</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Service / Mod Name</Text>
          <View style={styles.inputWrapper}>
            <TextInput 
              style={styles.input} 
              value={serviceTask} 
              onChangeText={setServiceTask} 
              placeholder="e.g. Changed Oil, New Exhaust" 
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipRow}>
            {QUICK_CHIPS.map(chip => (
              <TouchableOpacity 
                key={chip} 
                style={[styles.chip, serviceTask === chip && styles.chipActive]}
                onPress={() => setServiceTask(chip)}
              >
                <Text style={[styles.chipText, serviceTask === chip && styles.chipTextActive]}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity 
              style={styles.inputWrapper} 
              activeOpacity={1}
              onPress={() => { Keyboard.dismiss(); setShowDatePicker(!showDatePicker); }}
            >
              <Text style={styles.inputText}>
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
              </Text>
              <MaterialCommunityIcons name="calendar" size={18} color="#7e7576" style={{ marginRight: 12 }} />
            </TouchableOpacity>
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
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
        </View>

        {showDatePicker && (
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity style={styles.iosDoneBtn} onPress={() => setShowDatePicker(false)}>
                <Text style={styles.iosDoneText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Total Price</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.currencyText}>₱</Text>
            <TextInput 
              style={[styles.input, { paddingLeft: 25 }]} 
              value={price} 
              onChangeText={setPrice} 
              keyboardType="numeric" 
              placeholder="0.00" 
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Service Mode</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity 
              style={[styles.segmentBtn, !isDIY && styles.segmentBtnActive]}
              onPress={() => setIsDIY(false)}
            >
              <MaterialCommunityIcons name="storefront" size={16} color={!isDIY ? "#fff" : "#4c4546"} />
              <Text style={[styles.segmentText, !isDIY && styles.segmentTextActive]}>Professional</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.segmentBtn, isDIY && styles.segmentBtnActive]}
              onPress={() => setIsDIY(true)}
            >
              <MaterialCommunityIcons name="hammer-wrench" size={16} color={isDIY ? "#fff" : "#4c4546"} />
              <Text style={[styles.segmentText, isDIY && styles.segmentTextActive]}>DIY Service</Text>
            </TouchableOpacity>
          </View>
        </View>

        {!isDIY && (
          <View style={styles.conditionalContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Shop Name</Text>
              <View style={styles.inputWrapper}>
                <TextInput style={styles.input} value={shopName} onChangeText={setShopName} placeholder="e.g. Honda Center" />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Mechanic</Text>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} value={mechanicName} onChangeText={setMechanicName} placeholder="Name" />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Phone</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="phone" size={16} color="#7e7576" style={{ marginLeft: 12 }} />
                  <TextInput style={styles.input} value={contactNumber} onChangeText={setContactNumber} keyboardType="phone-pad" placeholder="0912..." />
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes & Findings</Text>
          <View style={[styles.inputWrapper, { height: 100, alignItems: 'flex-start' }]}>
            <TextInput 
              style={[styles.input, { paddingTop: 16, textAlignVertical: 'top' }]} 
              value={notes} 
              onChangeText={setNotes} 
              placeholder="Write details about parts used..." 
              multiline={true}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
          <Text style={styles.saveBtnText}>Record Log</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </BaseBottomSheet>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 13, color: '#7e7576', marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '700', color: '#000', textTransform: 'uppercase', marginBottom: 6, letterSpacing: 0.5 },
  
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#cfc4c5', 
    borderRadius: 10, 
    backgroundColor: '#fcf9f8',
    justifyContent: 'space-between',
    height: 50,
  },
  input: { 
    flex: 1, 
    paddingHorizontal: 12, 
    paddingVertical: 0,
    fontSize: 15, 
    color: '#000',
    height: '100%',
  },
  inputText: { 
    flex: 1, 
    paddingHorizontal: 12, 
    fontSize: 15, 
    color: '#000',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  unitText: { marginRight: 12, fontSize: 13, color: '#7e7576', fontWeight: '600' },
  currencyText: { position: 'absolute', left: 12, fontSize: 15, color: '#7e7576', fontWeight: '600' },
  row: { flexDirection: 'row', gap: 12 },

  toggleRow: { flexDirection: 'row', backgroundColor: '#f0eded', borderRadius: 10, padding: 4 },
  segmentBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8 },
  segmentBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  segmentText: { fontSize: 13, fontWeight: '600', color: '#4c4546' },
  segmentTextActive: { color: '#000', fontWeight: '700' },

  chipScroll: { marginTop: 8 },
  chipRow: { gap: 6, paddingRight: 20 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#cfc4c5', backgroundColor: '#fff' },
  chipActive: { backgroundColor: '#000', borderColor: '#000' },
  chipText: { fontSize: 11, fontWeight: '700', color: '#4c4546', textTransform: 'uppercase' },
  chipTextActive: { color: '#fff' },

  conditionalContainer: { backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#eae7e7', marginBottom: 16 },

  pickerContainer: { backgroundColor: '#f6f3f2', borderRadius: 10, marginBottom: 16, overflow: 'hidden' },
  iosDoneBtn: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#cfc4c5', alignItems: 'center' },
  iosDoneText: { color: '#000', fontWeight: '700', fontSize: 16 },

  saveBtn: { 
    flexDirection: 'row', 
    backgroundColor: '#b7102a', 
    paddingVertical: 14, 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8,
    marginTop: 8
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' }
});
