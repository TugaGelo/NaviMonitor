import { View, Text, Pressable, Modal } from 'react-native';
import { TriangleAlert } from 'lucide-react-native';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  description: string;
  highlightedText?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDialog({ visible, title, description, highlightedText, onCancel, onConfirm }: ConfirmDialogProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 items-center justify-center px-6">
        <Pressable 
          className="absolute inset-0" 
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} 
          onPress={onCancel}
        />

        <View 
          className="bg-white rounded-[24px] w-full max-w-sm flex flex-col items-center p-6 relative z-50"
          style={{ elevation: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20 }}
        >
          <View className="w-20 h-20 rounded-full bg-[#FEF2F2] flex items-center justify-center mb-6">
            <TriangleAlert size={40} color="#E63946" />
          </View>

          <Text className="text-xl font-bold text-black mb-2 text-center">
            {title}
          </Text>

          <View className="text-center mb-8 items-center">
            <Text className="text-sm text-zinc-500 font-medium leading-relaxed text-center">
              {description}
            </Text>
            {highlightedText && (
              <Text className="font-bold text-black text-base mt-1 text-center">
                {highlightedText}
              </Text>
            )}
          </View>

          <View className="w-full flex-row gap-3">
            <Pressable 
              onPress={onCancel}
              className="flex-1 py-3.5 bg-zinc-100 rounded-xl flex items-center justify-center active:bg-zinc-200"
            >
              <Text className="text-black font-bold text-base">Cancel</Text>
            </Pressable>

            <Pressable 
              onPress={onConfirm}
              className="flex-1 py-3.5 bg-[#E63946] rounded-xl flex items-center justify-center active:bg-[#b7102a]"
            >
              <Text className="text-white font-bold text-base">Delete</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
