import { View, Text, ScrollView, Pressable, Image, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { X, Plus, Sparkles, ArrowLeft, Trash2, CheckCircle2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VehicleRepository } from '../../../lib/database/localRepository';
import { Vehicle, MaintenanceMatrixItem } from '../../../types';
import SegmentedControl from '../../../components/ui/SegmentedControl';
import  { runSyncEngine } from '../../../hooks/useAutoSync';

const API_BASE_URL = 'http://192.168.68.133:5053/api'; 

export default function AISyncScreen() {
  const router = useRouter();
  const { vehicleId } = useLocalSearchParams();
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [matrixData, setMatrixData] = useState<MaintenanceMatrixItem[]>([]);

  useEffect(() => {
    if (vehicleId) VehicleRepository.getVehicleById(Number(vehicleId)).then(v => setVehicle(v || null));
  }, [vehicleId]);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.8 });
    if (!result.canceled) setImages(prev => [...prev, ...result.assets.map(a => a.uri)]);
  };

  const handleAnalyze = async () => {
    if (images.length === 0) return Alert.alert("No Images", "Select at least one manual page.");
    setStep(1);
    try {
      const formData = new FormData();
      images.forEach((uri, idx) => {
        // @ts-ignore
        formData.append('files', { uri, name: uri.split('/').pop() || `img_${idx}.jpg`, type: 'image/jpeg' });
      });

      const response = await fetch(`${API_BASE_URL}/maintenance/analyze`, { method: 'POST', headers: { 'Content-Type': 'multipart/form-data' }, body: formData });
      if (!response.ok) throw new Error();
      const responseData = await response.json();
      
      if (responseData?.matrix) { setMatrixData(responseData.matrix); setStep(2); } 
      else throw new Error();
    } catch {
      Alert.alert("Analysis Failed", "Could not process images. Check server connection.");
      setStep(0);
    }
  };

  const updateMatrixItem = (index: number, field: keyof MaintenanceMatrixItem, value: any) => {
    const newData = [...matrixData];
    newData[index] = { ...newData[index], [field]: value };
    setMatrixData(newData);
  };

  const commitToVehicle = async () => {
    if (!vehicle) return;
    try {
      await VehicleRepository.updateVehicle({ 
        ...vehicle, 
        maintenanceMatrixJson: JSON.stringify(matrixData), 
        hasSyncedManual: true 
      });
      
      runSyncEngine();
      
      router.back();
    } catch { 
      Alert.alert("Save Failed", "Could not save the matrix."); 
    }
  };

  if (step === 1) return (
    <SafeAreaView className="flex-1 bg-[#1c1b1b] items-center justify-center p-6">
      <Stack.Screen options={{ headerShown: false }} />
      <Sparkles size={48} color="#ffffff" className="mb-6 opacity-80" />
      <ActivityIndicator size="large" color="#ffffff" className="mb-6" />
      <Text className="font-black text-2xl text-white uppercase tracking-wider text-center">Processing Manual</Text>
      <Text className="text-[#848484] font-bold text-xs uppercase tracking-widest mt-2">Transmitting to Local AI Core...</Text>
    </SafeAreaView>
  );

  if (step === 2) return (
    <SafeAreaView className="flex-1 bg-[#fcf9f8]" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="bg-white border-b border-[#e5e2e1] flex-row justify-between items-center px-6 h-16 sticky top-0">
        <Pressable onPress={() => setStep(0)} className="p-2 -ml-2"><ArrowLeft size={24} color="#1c1b1b" /></Pressable>
        <Text className="text-[12px] font-bold text-[#848484] uppercase tracking-widest flex-1 text-center">Task Matrix</Text>
        <View className="w-10" />
      </View>

      <View className="px-6 pt-8 pb-4">
        <Text className="text-[48px] font-black text-[#1c1b1b] uppercase tracking-tighter leading-none mb-2">Verify</Text>
        <Text className="text-[14px] font-bold text-[#848484] uppercase tracking-widest">{matrixData.length} ITEMS EXTRACTED • VERIFY INTELLIGENCE DATA</Text>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 120 }}>
        {matrixData.map((item, idx) => (
          <View key={idx} className="bg-white border border-[#e5e2e1] rounded-xl p-4 mb-4 shadow-sm shadow-black/5">
            <View className="flex-row items-center mb-4 pb-4 border-b border-[#f0eded]">
              <View className="flex-1">
                <Text className="text-[12px] font-bold text-[#848484] uppercase mb-1">Part / Component</Text>
                <TextInput value={item.item} onChangeText={(v) => updateMatrixItem(idx, 'item', v)} className="font-black text-[24px] text-[#1c1b1b] uppercase p-0" />
              </View>
              <Pressable onPress={() => setMatrixData(prev => prev.filter((_, i) => i !== idx))} className="p-2"><Trash2 size={20} color="#b7102a" /></Pressable>
            </View>

            <View className="flex-col gap-4">
              <View className="flex-1">
                <Text className="text-[12px] font-bold text-[#848484] uppercase mb-1">Interval</Text>
                <View className="flex-row items-center border border-[#e5e2e1] rounded-md bg-[#fcf9f8]">
                  <TextInput value={item.interval.toString()} onChangeText={(v) => updateMatrixItem(idx, 'interval', parseInt(v) || 0)} keyboardType="numeric" className="flex-1 font-bold text-[18px] text-[#1c1b1b] p-2 text-right" />
                  <View className="bg-[#f0eded] px-3 py-3 border-l border-[#e5e2e1]"><Text className="text-[12px] font-bold text-[#1c1b1b]">km</Text></View>
                </View>
              </View>

              <View className="flex-1 mt-2">
                <Text className="text-[12px] font-bold text-[#848484] uppercase mb-1">Action</Text>
                <SegmentedControl 
                  options={[{ label: 'Replace', value: 'Replace' }, { label: 'Clean', value: 'Clean' }, { label: 'Inspect', value: 'Inspect' }]}
                  selectedValue={item.action}
                  onChange={(val) => updateMatrixItem(idx, 'action', val)}
                />
              </View>
            </View>
          </View>
        ))}
        
        <Pressable onPress={() => setMatrixData([...matrixData, { item: 'NEW ITEM', interval: 5000, action: 'Inspect' }])} className="w-full py-4 border-2 border-dashed border-[#cfc4c5] rounded-xl flex-row items-center justify-center gap-2 active:bg-[#f0eded] mb-6">
          <Plus size={20} color="#848484" /><Text className="font-bold text-[14px] text-[#848484] uppercase tracking-wider">Add Manual Item</Text>
        </Pressable>
      </ScrollView>

      <View className="absolute bottom-0 w-full bg-white border-t border-[#e5e2e1] p-6 pb-10 z-50">
        <Pressable onPress={commitToVehicle} className="w-full bg-[#1c1b1b] flex-row items-center justify-center py-4 rounded-lg active:opacity-90">
          <Text className="text-white font-black text-[20px] uppercase tracking-wide mr-3">Commit To Vehicle</Text>
          <CheckCircle2 size={24} color="#ffffff" strokeWidth={2.5} />
        </Pressable>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#fcf9f8]" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="px-8 pt-8 pb-6 flex-col">
        <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-[#f0eded] rounded-full mb-6"><X size={20} color="#1c1b1b" /></Pressable>
        <Text className="text-[48px] font-black text-[#1c1b1b] uppercase tracking-tighter leading-none mb-2">AI SYNC</Text>
        <Text className="text-[12px] font-bold text-[#848484] tracking-wider uppercase">SELECT AND VERIFY MANUAL PAGES</Text>
      </View>

      <ScrollView className="flex-1 px-8 pt-2" contentContainerStyle={{ paddingBottom: 160 }}>
        <View className="flex-row flex-wrap justify-between">
          {images.map((uri, idx) => (
            <View key={idx} className="w-[48%] aspect-[3/4] bg-white rounded-xl border border-[#e5e2e1] mb-4 relative overflow-hidden">
              <Image source={{ uri }} className="w-full h-full object-cover" />
              <Pressable onPress={() => setImages(p => p.filter((_, i) => i !== idx))} className="absolute top-2 right-2 w-8 h-8 items-center justify-center bg-[#1c1b1b] rounded-full"><X size={16} color="#ffffff" /></Pressable>
            </View>
          ))}
          <Pressable onPress={pickImages} className="w-[48%] aspect-[3/4] bg-[#fcf9f8] border-2 border-dashed border-[#cfc4c5] rounded-xl flex items-center justify-center mb-4"><Plus size={32} color="#7e7576" /></Pressable>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 w-full bg-[#fcf9f8] border-t border-[#e5e2e1] p-6 pb-10 z-50">
        <Pressable onPress={handleAnalyze} className="w-full bg-[#1c1b1b] flex-row items-center justify-center py-4 rounded-lg mb-3"><Sparkles size={24} color="#ffffff" className="mr-3" /><Text className="text-white font-black text-[20px] uppercase tracking-wide"> Analyze</Text></Pressable>
        <Text className="text-[10px] text-[#848484] text-center font-bold px-4 leading-tight uppercase tracking-wider">Processes image data via local server core.</Text>
      </View>
    </SafeAreaView>
  );
}
