import { View, Text, Pressable } from 'react-native';
import { LayoutGrid, History as HistoryIcon, Activity } from 'lucide-react-native';

interface TrinityNavProps {
  activeTab: number;
  onTabPress: (index: number) => void;
}

export default function TrinityNav({ activeTab, onTabPress }: TrinityNavProps) {
  return (
    <View className="absolute bottom-8 left-0 right-0 items-center pointer-events-box-none z-50">
      <View className="flex-row items-center justify-between bg-[rgba(255,255,255,0.95)] px-2 py-2 rounded-full w-[85%] max-w-[340px] shadow-lg shadow-black/10 border border-[#e5e2e1]">
        
        {/* Dashboard Tab */}
        <Pressable 
          onPress={() => onTabPress(0)}
          className={`flex-col items-center justify-center w-[30%] py-2.5 rounded-full ${activeTab === 0 ? 'bg-[#f6f3f2]' : 'opacity-60 active:opacity-100'}`}
        >
          <LayoutGrid size={20} color={activeTab === 0 ? '#b7102a' : '#1c1b1b'} strokeWidth={activeTab === 0 ? 2.5 : 2} />
          <Text className={`font-bold text-[9px] uppercase tracking-wider mt-1 ${activeTab === 0 ? 'text-[#b7102a]' : 'text-[#1c1b1b]'}`}>Dash</Text>
        </Pressable>

        {/* Logs Tab */}
        <Pressable 
          onPress={() => onTabPress(1)}
          className={`flex-col items-center justify-center w-[30%] py-2.5 rounded-full ${activeTab === 1 ? 'bg-[#f6f3f2]' : 'opacity-60 active:opacity-100'}`}
        >
          <HistoryIcon size={20} color={activeTab === 1 ? '#b7102a' : '#1c1b1b'} strokeWidth={activeTab === 1 ? 2.5 : 2} />
          <Text className={`font-bold text-[9px] uppercase tracking-wider mt-1 ${activeTab === 1 ? 'text-[#b7102a]' : 'text-[#1c1b1b]'}`}>Logs</Text>
        </Pressable>

        {/* Matrix Tab */}
        <Pressable 
          onPress={() => onTabPress(2)}
          className={`flex-col items-center justify-center w-[30%] py-2.5 rounded-full ${activeTab === 2 ? 'bg-[#f6f3f2]' : 'opacity-60 active:opacity-100'}`}
        >
          <Activity size={20} color={activeTab === 2 ? '#b7102a' : '#1c1b1b'} strokeWidth={activeTab === 2 ? 2.5 : 2} />
          <Text className={`font-bold text-[9px] uppercase tracking-wider mt-1 ${activeTab === 2 ? 'text-[#b7102a]' : 'text-[#1c1b1b]'}`}>Matrix</Text>
        </Pressable>

      </View>
    </View>
  );
}
