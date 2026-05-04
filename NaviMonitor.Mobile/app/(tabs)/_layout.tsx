import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { LayoutGrid, Car, Activity, Bell } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#E63946',
        tabBarInactiveTintColor: '#a1a1aa',
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 20,
          right: 20,
          elevation: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 32,
          height: 64,
          paddingBottom: Platform.OS === 'ios' ? 16 : 8,
          paddingTop: 8,
          borderWidth: 1,
          borderColor: 'rgba(229, 231, 235, 0.5)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter',
          fontSize: 10,
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginTop: 4,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <LayoutGrid size={24} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="fleet"
        options={{
          title: 'Fleet',
          tabBarIcon: ({ color }) => <Car size={24} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: 'Health',
          tabBarIcon: ({ color }) => <Activity size={24} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => <Bell size={24} color={color} strokeWidth={2.5} />,
        }}
      />
    </Tabs>
  );
}
