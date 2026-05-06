import '../global.css';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { initDatabase } from './lib/database';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function setupApp() {
      try {
        await initDatabase();
        console.log("Local SQLite Database Initialized");
      } catch (e) {
        console.error("Failed to initialize database:", e);
      } finally {
        setDbReady(true);
        await SplashScreen.hideAsync();
      }
    }
    setupApp();
  }, []);

  if (!dbReady) {
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  }

  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        <Stack.Screen 
          name="vehicle/create" 
          options={{ 
            presentation: 'transparentModal', 
            animation: 'fade',
            headerShown: false,
          }} 
        />
      </Stack>
    </SafeAreaProvider>
  );
}
