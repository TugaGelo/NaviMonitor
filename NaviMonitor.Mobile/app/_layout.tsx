import '../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { initDatabase } from '../lib/database/database';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { useAutoSync } from '../hooks/useAutoSync';
import { AuthProvider, useAuth } from '../lib/auth/AuthContext';

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

const queryClient = new QueryClient();

function SyncEngineRunner({ children }: { children: React.ReactNode }) {
  useAutoSync();
  return <>{children}</>;
}

function InitialLayout() {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login';

    if (!token && !inAuthGroup) {
      router.replace('/login');
    } else if (token && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [token, isLoading, segments]);

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="vehicle/create" options={{ presentation: 'transparentModal', animation: 'fade', headerShown: false }} />
      <Stack.Screen name="vehicle/edit/[id]" options={{ presentation: 'transparentModal', animation: 'none', headerShown: false }} />
      <Stack.Screen name="vehicle/log/fuel" options={{ presentation: 'transparentModal', animation: 'none', headerShown: false }} />
      <Stack.Screen name="vehicle/log/service" options={{ presentation: 'transparentModal', animation: 'none', headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function setupApp() {
      try {
        await initDatabase();
      } catch (e) {
        console.error(e);
      } finally {
        setDbReady(true);
        await SplashScreen.hideAsync();
      }
    }
    setupApp();
  }, []);

  if (!dbReady) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SyncEngineRunner>
            <InitialLayout />
          </SyncEngineRunner>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
