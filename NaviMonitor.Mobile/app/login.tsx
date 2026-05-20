import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../lib/AuthContext';
import { useRouter } from 'expo-router';
import { ShieldCheck, Lock } from 'lucide-react-native';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();

  const handleGoogleSignIn = () => {
    login("TEMPORARY_TEST_TOKEN");
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fcf9f8]">
      <View className="flex-1 px-8 pt-12 pb-6 flex-col justify-between">
        
        {/* Header Section */}
        <View className="mt-8">
          <Text className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#7e7576] mb-6">
            SYSTEM ACCESS // SECURED
          </Text>
          
          <Text className="text-[40px] font-black text-[#000000] tracking-tighter leading-[1.05] uppercase mb-6">
            TRACK EVERY MILE.{"\n"}MASTER EVERY{"\n"}SERVICE.
          </Text>
          
          <Text className="text-[16px] text-[#4c4546] leading-relaxed pr-4">
            Sign in to your NaviMonitor dashboard to access real-time vehicle analytics, manage fuel logs, and optimize your fleet's performance.
          </Text>
        </View>

        {/* CTA Section  */}
        <View className="w-full mt-16 mb-auto">
          <Pressable 
            onPress={handleGoogleSignIn}
            className="w-full bg-[#000000] py-4 rounded-xl flex-row items-center justify-center active:opacity-80"
          >
            {/* Minimalist Native 'G' Badge to replace the heavy SVG */}
            <View className="bg-white rounded-full w-6 h-6 items-center justify-center mr-3">
              <Text className="font-black text-black text-[13px]">G</Text>
            </View>
            <Text className="font-bold text-[#ffffff] text-[16px] tracking-wide">Continue with Google</Text>
          </Pressable>
        </View>

        {/* Trust Footer (Bottom 20%) */}
        <View className="flex-row items-center justify-center gap-3 opacity-60">
          <View className="flex-row items-center gap-1.5">
            <ShieldCheck size={14} color="#7e7576" />
            <Text className="text-[11px] font-bold tracking-widest uppercase text-[#7e7576]">
              SOC2 COMPLIANT
            </Text>
          </View>
          
          <View className="w-1 h-1 rounded-full bg-[#cfc4c5]" />
          
          <View className="flex-row items-center gap-1.5">
            <Lock size={14} color="#7e7576" />
            <Text className="text-[11px] font-bold tracking-widest uppercase text-[#7e7576]">
              END-TO-END ENCRYPTED
            </Text>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}
