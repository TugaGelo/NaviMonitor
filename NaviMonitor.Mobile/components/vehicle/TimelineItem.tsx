import { View, Text, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { Fuel, Wrench, Rocket, Hammer, CalendarCheck } from 'lucide-react-native';
import { SettingsRepository } from '../../lib/localRepository';

interface TimelineItemProps {
  item: any;
  isLast: boolean;
  onPress: (item: any) => void;
  className?: string;
}

export default function TimelineItem({ item, isLast, onPress, className = "px-6" }: TimelineItemProps) {
  const [distanceUnit, setDistanceUnit] = useState('KM');
  const [volumeUnit, setVolumeUnit] = useState('L');

  useEffect(() => {
    SettingsRepository.getSettings().then(s => {
      setDistanceUnit(s.distanceUnit);
      setVolumeUnit(s.volumeUnit);
    });
  }, []);

  const isFuel = item.feedType === 'Refuel';
  
  const category = item.serviceCategory || 'Unscheduled'; 
  const isMod = item.feedType === 'Modification' || item.logType === 'Modification' || category === 'Upgrade';
  const isScheduled = category === 'Scheduled' && !isMod;
  const isUnscheduled = category === 'Unscheduled' && !isMod;

  const cost = isFuel ? item.totalCost : item.price;

  let IconComponent = Wrench;
  let iconColor = 'bg-[#1c1b1b]';
  let badgeText = 'SERVICE';
  let badgeBg = 'bg-[#f0eded]';
  let badgeTextColor = 'text-[#848484]';

  if (isFuel) {
    IconComponent = Fuel;
    iconColor = 'bg-[#1c1b1b]';
    badgeText = item.fuelType ? item.fuelType.toUpperCase() : 'FUEL';    
    badgeBg = 'bg-[#f0eded]';
    badgeTextColor = 'text-[#848484]';
  } else if (isMod) {
    IconComponent = Rocket;
    iconColor = 'bg-[#b7102a]';
    badgeText = 'UPGRADE';
    badgeBg = 'bg-[#ffdad6]';
    badgeTextColor = 'text-[#b7102a]';
  } else if (isScheduled) {
    IconComponent = CalendarCheck; 
    iconColor = 'bg-[#1c1b1b]';
    badgeText = 'ROUTINE';
    badgeBg = 'bg-[#e5e2e1]';
    badgeTextColor = 'text-[#1c1b1b]';
  } else if (isUnscheduled) {
    IconComponent = Hammer;
    iconColor = 'bg-[#b7102a]';
    badgeText = 'REPAIR';
    badgeBg = 'bg-[#ffdad6]';
    badgeTextColor = 'text-[#b7102a]';
  }

  return (
    <Pressable onPress={() => onPress(item)} className={`flex-row active:opacity-50 ${className}`}>
      
      {/* Left Axis: Timeline Node */}
      <View className="items-center w-6 mr-4">
        {!isLast && <View className="absolute top-8 bottom-[-32px] w-[2px] border-l-2 border-dashed border-[#e5e2e1]" />}
        <View className={`w-8 h-8 rounded-full border-4 border-[#fcf9f8] flex items-center justify-center z-10 ${iconColor}`}>
          <IconComponent size={14} color="#fff" />
        </View>
      </View>

      {/* Right Axis: Feed Content */}
      <View className="flex-1 pb-8 flex-row justify-between items-start mt-0.5">
        
        <View className="flex-1 pr-2">
          {/* Title & Pill Badge Row */}
          <View className="flex-row items-center flex-wrap gap-2 mb-1">
            <Text className="text-sm font-bold uppercase tracking-wide text-[#1c1b1b]" numberOfLines={1}>
              {isFuel ? 'Fuel Refill' : item.serviceType}
            </Text>
            
            <View className={`px-2 py-0.5 rounded-sm ${badgeBg}`}>
              <Text className={`text-[9px] font-black tracking-widest uppercase ${badgeTextColor}`}>
                {badgeText}
              </Text>
            </View>
          </View>

          <Text className="text-xs text-[#848484] mt-0.5 font-medium">
            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {isFuel ? `${item.volume}${volumeUnit}` : (item.isDIY ? 'DIY Service' : (item.shopName || 'Garage'))}
          </Text>
        </View>

        {/* Cost & Odometer Analytics */}
        <View className="items-end pl-2">
          <Text className="text-[15px] font-black text-[#1c1b1b]">
            - ₱{(cost || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </Text>
          <Text className="text-[11px] text-[#cfc4c5] mt-1 font-bold">
            {item.odometer?.toLocaleString()} {distanceUnit.toLowerCase()}
          </Text>
        </View>
        
      </View>
    </Pressable>
  );
}
