import { View, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCheck, Lock } from 'lucide-react-native';
import { useEffect } from 'react';

import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function LoginScreen() {
  
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });
  }, []);

  const handleNativeGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      const response = await GoogleSignin.signIn();
      
      const idToken = response.data?.idToken || (response as any).idToken;

      if (idToken) {
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
      } else {
        throw new Error("No ID Token returned from Google Services.");
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User closed the Google sheet");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Authentication flow already processing");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("Error", "Google Play Services are required but unavailable.");
      } else {
        console.error("Native Auth Error Details:", error);
        Alert.alert("Login Failed", "An internal error occurred during secure sign-in.");
      }
    }
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

        {/* Call To Action */}
        <View className="w-full mt-16 mb-auto">
          <Pressable 
            onPress={handleNativeGoogleSignIn}
            className="w-full bg-[#000000] py-4 rounded-xl flex-row items-center justify-center active:opacity-80"
          >
            <View className="bg-white rounded-full w-6 h-6 items-center justify-center mr-3">
              <Text className="font-black text-black text-[13px]">G</Text>
            </View>
            <Text className="font-bold text-[#ffffff] text-[16px] tracking-wide">Continue with Google</Text>
          </Pressable>
        </View>

        {/* Security Badges */}
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
