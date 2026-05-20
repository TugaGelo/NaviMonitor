import { View, Text, Pressable, Animated, Dimensions, Platform, Keyboard, ScrollView } from 'react-native';
import { useState, useRef, useEffect, ReactNode } from 'react';
import { X, Save } from 'lucide-react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface FormSheetWrapperProps {
  title: string;
  subtitle?: string;
  snapHeight?: number;
  onClose: () => void;
  onSave: () => void;
  saveLabel?: string;
  saveColor?: string;
  children: ReactNode;
  headerHeaderExtra?: ReactNode;
}

export default function FormSheetWrapper({
  title,
  subtitle,
  snapHeight = 0.67,
  onClose,
  onSave,
  saveLabel = "Save Record",
  saveColor = "bg-[#111827]",
  children,
  headerHeaderExtra
}: FormSheetWrapperProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 10 }).start();

    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        // Adjust structural shifting down if container footprint is small
        const adjustmentFactor = snapHeight < 0.5 ? 0.4 : 0.85;
        Animated.timing(keyboardOffset, {
          toValue: -e.endCoordinates.height * adjustmentFactor,
          duration: 220,
          useNativeDriver: true
        }).start();
      }
    );
    
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(keyboardOffset, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      }
    );

    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const handleDismiss = () => {
    Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 220, useNativeDriver: true }).start(() => onClose());
  };

  return (
    <View className="flex-1 justify-end">
      {/* Backdrop Dimming Plate */}
      <Pressable className="absolute inset-0 bg-black/40" onPress={handleDismiss} />

      <Animated.View 
        style={{ 
          height: SCREEN_HEIGHT * snapHeight, 
          transform: [{ translateY: slideAnim }, { translateY: keyboardOffset }] 
        }}
      >
        <View className="flex-1 bg-white rounded-t-[24px] overflow-hidden shadow-2xl shadow-black/40">
          
          {/* Form Banner Header Area */}
          <View className="px-6 pt-5 pb-4 border-b border-[#f3f4f6]">
            <View className="flex-row justify-between items-start">
              <View className="flex-1 pr-4">
                <Text className="text-2xl font-bold text-[#111827] tracking-tight">{title}</Text>
                {subtitle && <Text className="text-sm text-[#6b7280] mt-1">{subtitle}</Text>}
              </View>
              <Pressable onPress={handleDismiss} className="p-1 -mr-2 active:opacity-50">
                <X size={24} color="#9ca3af" />
              </Pressable>
            </View>
            {headerHeaderExtra && <View className="mt-3">{headerHeaderExtra}</View>}
          </View>

          {/* Scrolling Content Feed */}
          <ScrollView 
            bounces={false} 
            showsVerticalScrollIndicator={false} 
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}
          >
            {children}
          </ScrollView>

          {/* Fixed Bottom Action Tray */}
          <View className="p-5 border-t border-[#f3f4f6] bg-[#f9fafb] pb-8">
            <Pressable 
              onPress={onSave}
              className={`w-full ${saveColor} py-3.5 rounded-lg flex-row items-center justify-center active:opacity-90 active:scale-[0.98] transition-transform`}
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 3 }}
            >
              <Save size={22} color="#fff" />
              <Text className="text-white text-base font-bold ml-2">{saveLabel}</Text>
            </Pressable>
          </View>

        </View>
      </Animated.View>
    </View>
  );
}
