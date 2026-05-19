import { View, Text, Pressable } from 'react-native';
import { Fuel, Wrench, Rocket } from 'lucide-react-native';

interface TimelineItemProps {
  item: any;
  isLast: boolean;
  onPress: (item: any) => void;
  className?: string;
}

export default function TimelineItem({ item, isLast, onPress, className = "px-6" }: TimelineItemProps) {
  const isFuel = item.feedType === 'Refuel';
  const isMod = item.feedType === 'Modification';
  const cost = isFuel ? item.totalCost : item.price;

  return (
    <Pressable onPress={() => onPress(item)} className={`flex-row active:opacity-50 ${className}`}>
      <View className="items-center w-6 mr-4">
        {!isLast && <View className="absolute top-8 bottom-[-32px] w-[2px] border-l-2 border-dashed border-[#e5e2e1]" />}
        <View className={`w-8 h-8 rounded-full border-4 border-[#fcf9f8] flex items-center justify-center z-10 ${isFuel ? 'bg-[#1b1b1b]' : 'bg-[#b7102a]'}`}>
          {isFuel ? <Fuel size={14} color="#fff" /> : isMod ? <Rocket size={14} color="#fff" /> : <Wrench size={14} color="#fff" />}
        </View>
      </View>

      <View className="flex-1 pb-8 flex-row justify-between items-start mt-0.5">
        <View className="flex-1 pr-2">
          <Text className="text-sm font-bold uppercase tracking-wide text-[#1c1b1b]">{isFuel ? 'Fuel Refill' : item.serviceType}</Text>
          <Text className="text-xs text-[#848484] mt-1 font-medium">
            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {isFuel ? `${item.volume}L` : (item.isDIY ? 'DIY' : (item.shopName || 'Shop'))}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-[15px] font-black text-[#1c1b1b]">- ₱{(cost || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</Text>
          <Text className="text-[11px] text-[#cfc4c5] mt-1 font-bold">{item.odometer?.toLocaleString()} km</Text>
        </View>
      </View>
    </Pressable>
  );
}
