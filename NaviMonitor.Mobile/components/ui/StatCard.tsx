import { View, Text } from 'react-native';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: any;
  prefix?: string;
  unit?: string;
  subtext?: string;
  fullWidth?: boolean;
}

export default function StatCard({ label, value, icon: Icon, prefix, unit, subtext, fullWidth }: StatCardProps) {
  if (fullWidth) {
    return (
      <View className="w-full bg-white border border-[#e5e2e1] rounded-2xl p-5 shadow-sm shadow-black/5">
        <Text className="text-[10px] font-bold text-[#848484] uppercase tracking-widest mb-1">{label}</Text>
        <View className="flex-row items-baseline mb-1">
          {prefix && <Text className="text-[14px] font-bold text-[#1c1b1b] mr-0.5">{prefix}</Text>}
          <Text className="text-[24px] font-black text-[#1c1b1b] tracking-tight">{value}</Text>
          {unit && <Text className="font-medium text-[#848484] text-[12px] ml-1">{unit}</Text>}
        </View>
        {subtext && <Text className="text-[12px] font-bold text-[#cfc4c5]">{subtext}</Text>}
      </View>
    );
  }

  return (
    <View className="w-[48%] bg-white border border-[#e5e2e1] rounded-2xl p-4 flex-col justify-between h-[100px] shadow-sm shadow-black/5">
      <View className="flex-row items-center gap-1.5">
        {Icon && <Icon size={14} color="#848484" />}
        <Text className="font-bold text-[#848484] uppercase tracking-wider text-[10px]" numberOfLines={1}>{label}</Text>
      </View>
      <View className="flex-row items-baseline">
        {prefix && <Text className="text-[14px] font-bold text-[#1c1b1b] mr-0.5">{prefix}</Text>}
        <Text className="font-black text-[22px] text-[#1c1b1b] tracking-tight">{value}</Text>
        {unit && <Text className="font-medium text-[#848484] text-[11px] ml-1">{unit}</Text>}
      </View>
    </View>
  );
}
