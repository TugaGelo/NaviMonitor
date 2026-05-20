import { View, Text, Pressable } from 'react-native';

interface SegmentedControlProps {
  options: { label: string; value: any; icon?: any }[];
  selectedValue: any;
  onChange: (value: any) => void;
}

export default function SegmentedControl({ options, selectedValue, onChange }: SegmentedControlProps) {
  return (
    <View className="flex-row bg-[#f3f4f6] p-1 rounded-lg w-full">
      {options.map((opt) => {
        const isActive = selectedValue === opt.value;
        const Icon = opt.icon;
        return (
          <Pressable
            key={String(opt.value)}
            onPress={() => onChange(opt.value)}
            className={`flex-1 flex-row items-center justify-center py-2 rounded-md ${isActive ? 'bg-black' : 'bg-transparent'}`}
            style={isActive ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 1.5, elevation: 1 } : {}}
          >
            {Icon && <Icon size={16} color={isActive ? '#fff' : '#6b7280'} />}
            <Text className={`text-xs uppercase tracking-wider font-bold ${Icon ? 'ml-2' : ''} ${isActive ? 'text-white' : 'text-[#6b7280]'}`}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
