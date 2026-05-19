import { View, Text } from 'react-native';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string | ReactNode;
  rightIcon?: any;
}

export default function PageHeader({ title, subtitle, rightIcon: RightIcon }: PageHeaderProps) {
  return (
    <View className="flex-row justify-between items-start pt-2 pb-6">
      <View className="flex-1 pr-4">
        <Text 
          className="text-[40px] leading-none font-black tracking-tight text-[#1c1b1b] uppercase"
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {title}
        </Text>
        
        {typeof subtitle === 'string' ? (
          <Text className="text-[11px] font-black text-[#848484] uppercase tracking-[0.2em] mt-2">
            {subtitle}
          </Text>
        ) : (
          <View className="mt-2">
            {subtitle}
          </View>
        )}
      </View>
      <View className="h-10 w-10 items-end justify-start mt-1">
        {RightIcon && <RightIcon size={36} color="#1c1b1b" strokeWidth={1.5} />}
      </View>
    </View>
  );
}
