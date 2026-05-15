import { View, Text, Pressable, Modal, Animated, Dimensions } from 'react-native';
import { Edit2, Trash2 } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface ActionSheetProps {
  visible: boolean;
  title: string;
  onEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
  editLabel?: string;
  deleteLabel?: string;
}

export default function ActionSheet({ 
  visible, 
  title, 
  onEdit, 
  onDelete, 
  onCancel,
  editLabel = "Edit Vehicle",
  deleteLabel = "Delete Vehicle"
}: ActionSheetProps) {
  const [renderModal, setRenderModal] = useState(false);
 
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setRenderModal(true);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 10,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start(() => {
        setRenderModal(false);
      });
    }
  }, [visible, slideAnim, fadeAnim]);

  return (
    <Modal transparent visible={renderModal} animationType="none" statusBarTranslucent={true}>
      <View className="flex-1 justify-end">
       
        <Animated.View
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', opacity: fadeAnim }}
        >
          <Pressable className="flex-1" onPress={onCancel} />
        </Animated.View>

        <Animated.View
          className="bg-[#fcf9f8] w-full rounded-t-[24px] pb-8 pt-4"
          style={{
            elevation: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -10 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <View className="w-12 h-1.5 bg-[#dcd9d9] rounded-full self-center mb-4" />
         
          <Text className="text-[12px] font-bold text-[#1c1b1b] uppercase tracking-widest text-center mb-2">
            {title}
          </Text>

          <View className="flex flex-col w-full">
            <Pressable
              onPress={onEdit}
              className="flex-row items-center py-4 px-6 active:bg-[#eae7e7] w-full"
            >
              <Edit2 size={22} color="#1c1b1b" />
              <Text className="text-[18px] text-[#1c1b1b] font-medium ml-4">{editLabel}</Text>
            </Pressable>

            <Pressable
              onPress={onDelete}
              className="flex-row items-center py-4 px-6 active:bg-[#ffdad8] w-full"
            >
              <Trash2 size={22} color="#b7102a" />
              <Text className="text-[18px] text-[#b7102a] font-medium ml-4">{deleteLabel}</Text>
            </Pressable>
          </View>

          <View className="mt-2 w-full">
            <Pressable
              onPress={onCancel}
              className="py-4 px-6 active:bg-[#eae7e7] w-full items-center"
            >
              <Text className="text-[18px] font-bold text-[#1c1b1b]">Cancel</Text>
            </Pressable>
          </View>

        </Animated.View>
      </View>
    </Modal>
  );
}
