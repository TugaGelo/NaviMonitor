import { View, Text, Pressable, TextInput, ScrollView, LayoutAnimation, UIManager, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react-native';
import { SettingsRepository } from '../../../lib/database/localRepository';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SystemTabProps {
  onLogout: () => void;
}

export default function SystemTab({ onLogout }: SystemTabProps) {
  const [distanceUnit, setDistanceUnit] = useState<'KM' | 'MI'>('KM');
  const [volumeUnit, setVolumeUnit] = useState<'L' | 'GAL'>('L');

  const [fuelTypes, setFuelTypes] = useState<string[]>([]);
  const [newFuel, setNewFuel] = useState('');

  const [openFAQ, setOpenFAQ] = useState<number>(0);

  useEffect(() => {
    const loadPreferences = async () => {
      const settings = await SettingsRepository.getSettings();
      setDistanceUnit(settings.distanceUnit as 'KM' | 'MI');
      setVolumeUnit(settings.volumeUnit as 'L' | 'GAL');
      setFuelTypes(settings.fuelTypes);
    };
    loadPreferences();
  }, []);

  const handleDistanceToggle = async (unit: 'KM' | 'MI') => {
    setDistanceUnit(unit);
    await SettingsRepository.saveDistanceUnit(unit);
  };

  const handleVolumeToggle = async (unit: 'L' | 'GAL') => {
    setVolumeUnit(unit);
    await SettingsRepository.saveVolumeUnit(unit);
  };

  const addFuelType = async () => {
    if (newFuel.trim() && !fuelTypes.includes(newFuel.trim().toUpperCase())) {
      const updatedList = [...fuelTypes, newFuel.trim().toUpperCase()];
      setFuelTypes(updatedList);
      setNewFuel('');
      await SettingsRepository.saveFuelTypes(updatedList);
    }
  };

  const removeFuelType = async (index: number) => {
    const updatedList = fuelTypes.filter((_, i) => i !== index);
    setFuelTypes(updatedList);
    await SettingsRepository.saveFuelTypes(updatedList);
  };

  const toggleFAQ = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenFAQ(openFAQ === index ? -1 : index);
  };

  const faqs = [
    {
      title: "Adding an Asset & Initial Setup",
      body: "To add a new asset, navigate to the Garage module and press the plus '+' button. Ensure you have the VIN and license plate ready. The system will automatically generate a blank service matrix for the new vehicle."
    },
    {
      title: "Global Ledgers vs. Vehicle Dashboards",
      body: "Vehicle Dashboards show logs and metrics isolated to a single asset. The Global Ledger (Stats Tab) aggregates expenditure across your entire fleet to give you a top-level financial overview."
    },
    {
      title: "V-Matrix Sync Failure (Code 402)",
      body: "If your matrix fails to sync with the server, check your Wi-Fi connection. The app will cache changes locally and automatically attempt a background sync when a stable connection is restored."
    }
  ];

  return (
    <ScrollView className="flex-1 px-6 pt-2 pb-32" showsVerticalScrollIndicator={false}>
      
      <View className="mb-6">
        <Text className="font-bold text-[10px] text-[#848484] uppercase tracking-widest mb-2">Global Metrics</Text>
        <View className="bg-[#ffffff] rounded-xl border border-[#e5e2e1] p-5 shadow-sm">
          
          <View className="flex-row items-center justify-between border-b border-[#e5e2e1] pb-4 mb-4">
            <Text className="font-bold text-[12px] text-[#1c1b1b] uppercase tracking-widest">Distance Unit</Text>
            <View className="flex-row bg-[#f0eded] rounded-full p-1">
              <Pressable 
                onPress={() => handleDistanceToggle('KM')}
                className={`px-4 py-1.5 rounded-full ${distanceUnit === 'KM' ? 'bg-[#1c1b1b]' : 'bg-transparent'}`}
              >
                <Text className={`font-bold text-[10px] ${distanceUnit === 'KM' ? 'text-[#ffffff]' : 'text-[#848484]'}`}>KM</Text>
              </Pressable>
              <Pressable 
                onPress={() => handleDistanceToggle('MI')}
                className={`px-4 py-1.5 rounded-full ${distanceUnit === 'MI' ? 'bg-[#1c1b1b]' : 'bg-transparent'}`}
              >
                <Text className={`font-bold text-[10px] ${distanceUnit === 'MI' ? 'text-[#ffffff]' : 'text-[#848484]'}`}>MI</Text>
              </Pressable>
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="font-bold text-[12px] text-[#1c1b1b] uppercase tracking-widest">Volume Unit</Text>
            <View className="flex-row bg-[#f0eded] rounded-full p-1">
              <Pressable 
                onPress={() => handleVolumeToggle('L')}
                className={`px-4 py-1.5 rounded-full ${volumeUnit === 'L' ? 'bg-[#1c1b1b]' : 'bg-transparent'}`}
              >
                <Text className={`font-bold text-[10px] ${volumeUnit === 'L' ? 'text-[#ffffff]' : 'text-[#848484]'}`}>L</Text>
              </Pressable>
              <Pressable 
                onPress={() => handleVolumeToggle('GAL')}
                className={`px-4 py-1.5 rounded-full ${volumeUnit === 'GAL' ? 'bg-[#1c1b1b]' : 'bg-transparent'}`}
              >
                <Text className={`font-bold text-[10px] ${volumeUnit === 'GAL' ? 'text-[#ffffff]' : 'text-[#848484]'}`}>GAL</Text>
              </Pressable>
            </View>
          </View>

        </View>
      </View>

      <View className="mb-6">
        <Text className="font-bold text-[10px] text-[#848484] uppercase tracking-widest mb-2">Database Libraries // Fuel Types</Text>
        <View className="bg-[#ffffff] rounded-xl border border-[#e5e2e1] p-5 shadow-sm">
          
          {fuelTypes.map((fuel, index) => (
            <View key={index} className="flex-row items-center justify-between border-b border-[#e5e2e1] py-3">
              <Text className="font-bold text-[12px] text-[#1c1b1b] tracking-wider">{fuel}</Text>
              <Pressable onPress={() => removeFuelType(index)} className="active:opacity-50">
                <Trash2 size={18} color="#848484" />
              </Pressable>
            </View>
          ))}

          <View className="mt-4">
            <TextInput 
              value={newFuel}
              onChangeText={setNewFuel}
              onSubmitEditing={addFuelType}
              placeholder="+ ADD NEW FUEL TYPE..."
              placeholderTextColor="#848484"
              className="bg-[#fcf9f8] border border-[#e5e2e1] rounded-lg px-4 py-3 font-bold text-[12px] text-[#1c1b1b] tracking-wider"
              returnKeyType="done"
            />
          </View>

        </View>
      </View>

      <View className="mb-6">
        <Text className="font-bold text-[10px] text-[#848484] uppercase tracking-widest mb-2">System Diagnostics // FAQs</Text>
        <View className="gap-2">
          
          {faqs.map((faq, index) => {
            const isOpen = openFAQ === index;
            return (
              <View key={index} className="bg-[#ffffff] rounded-xl border border-[#e5e2e1] overflow-hidden shadow-sm">
                <Pressable 
                  onPress={() => toggleFAQ(index)}
                  className={`flex-row items-center justify-between p-4 ${isOpen ? 'bg-[#f6f3f2]' : 'bg-[#ffffff] active:bg-[#f6f3f2]'}`}
                >
                  <Text className="font-bold text-[12px] text-[#1c1b1b] flex-1 mr-4">{faq.title}</Text>
                  {isOpen ? <ChevronUp size={20} color="#848484" /> : <ChevronDown size={20} color="#848484" />}
                </Pressable>
                
                {isOpen && (
                  <View className="p-4 border-t border-[#e5e2e1] bg-[#ffffff]">
                    <Text className="text-[12px] text-[#4c4546] leading-relaxed">{faq.body}</Text>
                  </View>
                )}
              </View>
            );
          })}

        </View>
      </View>

      <View className="mt-4 mb-12">
        <Pressable 
          onPress={onLogout}
          className="w-full bg-[#ffffff] border border-[#e5e2e1] rounded-lg py-4 items-center justify-center active:bg-[#f0eded]"
        >
          <Text className="font-bold text-[12px] text-[#ef4444] uppercase tracking-widest">Logout From System</Text>
        </Pressable>
      </View>

    </ScrollView>
  );
}
