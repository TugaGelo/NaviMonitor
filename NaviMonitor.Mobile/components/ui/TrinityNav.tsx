import { View, Text, Pressable } from 'react-native';
import { LayoutGrid, History as HistoryIcon, Activity, Warehouse, BarChart3, Settings } from 'lucide-react-native';

interface TrinityNavProps {
  activeTab: number;
  onTabPress: (index: number) => void;
  variant?: 'global' | 'vehicle'; 
}

export default function TrinityNav({ activeTab, onTabPress, variant = 'vehicle' }: TrinityNavProps) {
  
  const tabs = variant === 'global' 
    ? [
        { id: 0, label: 'Garage', Icon: Warehouse },
        { id: 1, label: 'Stats', Icon: BarChart3 },
        { id: 2, label: 'System', Icon: Settings },
      ]
    : [
        { id: 0, label: 'Dash', Icon: LayoutGrid },
        { id: 1, label: 'Logs', Icon: HistoryIcon },
        { id: 2, label: 'Matrix', Icon: Activity },
      ];

  return (
    <View className="absolute bottom-8 left-0 right-0 items-center pointer-events-box-none z-50">
      <View className="flex-row items-center justify-between bg-[rgba(255,255,255,0.95)] px-2 py-2 rounded-full w-[85%] max-w-[340px] shadow-lg shadow-black/10 border border-[#e5e2e1]">
        
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable 
              key={tab.id}
              onPress={() => onTabPress(tab.id)}
              className={`flex-col items-center justify-center w-[30%] py-2.5 rounded-full ${isActive ? 'bg-[#f6f3f2]' : 'opacity-60 active:opacity-100'}`}
            >
              <tab.Icon size={20} color={isActive ? '#b7102a' : '#1c1b1b'} strokeWidth={isActive ? 2.5 : 2} />
              <Text className={`font-bold text-[9px] uppercase tracking-wider mt-1 ${isActive ? 'text-[#b7102a]' : 'text-[#1c1b1b]'}`}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}

      </View>
    </View>
  );
}
