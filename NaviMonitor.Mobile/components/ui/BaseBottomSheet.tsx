import React, { useEffect, useRef, useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TouchableWithoutFeedback, 
  Platform,
  Animated,
  Dimensions,
  Keyboard
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface BaseBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function BaseBottomSheet({ isOpen, onClose, title, children }: BaseBottomSheetProps) {
  const [showModal, setShowModal] = useState(isOpen);
  
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const keyboardHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
        speed: 12
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setShowModal(false));
    }
  }, [isOpen, translateY]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showListener = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(keyboardHeight, {
        toValue: e.endCoordinates.height,
        duration: Platform.OS === 'ios' ? e.duration : 150, 
        useNativeDriver: false, 
      }).start();
    });

    const hideListener = Keyboard.addListener(hideEvent, (e) => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? e.duration : 150, 
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, [keyboardHeight]);

  return (
    <Modal
      visible={showModal}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.keyboardWrapper}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.sheetWrapper, { transform: [{ translateY }] }]}>
              
              <Animated.View style={[styles.sheetContainer, { paddingBottom: keyboardHeight }]}>
                
                <View style={styles.handle} />
                
                <View style={styles.header}>
                  <Text style={styles.title}>{title}</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <MaterialCommunityIcons name="close" size={24} color="#000" />
                  </TouchableOpacity>
                </View>

                <View style={styles.content}>
                  {children}
                </View>

                <View style={{ height: Platform.OS === 'ios' ? 40 : 20 }} />
                
              </Animated.View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end' 
  },
  keyboardWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetWrapper: {
    width: '100%',
  },
  sheetContainer: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
  },
  handle: { 
    width: 40, 
    height: 4, 
    backgroundColor: '#e5e2e1', 
    borderRadius: 2, 
    alignSelf: 'center', 
    marginTop: 12 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0eded'
  },
  title: { fontSize: 20, fontWeight: '700', color: '#000' },
  closeBtn: { padding: 4 },
  content: { 
    paddingHorizontal: 24, 
    paddingVertical: 16,
    maxHeight: SCREEN_HEIGHT * 0.7, 
  }
});
