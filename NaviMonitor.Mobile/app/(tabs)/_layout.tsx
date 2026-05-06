import React from 'react';
import { Tabs } from 'expo-router';
import { Car, Fuel, Gauge, Settings } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#000',
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Garage',
          tabBarIcon: ({ color }) => <Car size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          href: null, 
        }}
      />
    </Tabs>
  );
}
