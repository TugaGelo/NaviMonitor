import React from 'react';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: '#fcf9f8' },
        headerTitleStyle: { 
          fontWeight: '900', 
          letterSpacing: 2,
          color: '#000'
        },
        headerRight: () => (
          <TouchableOpacity style={{ marginRight: 20 }}>
            <MaterialCommunityIcons name="account-circle-outline" size={28} color="#000" />
          </TouchableOpacity>
        ),
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#ba1a1a', 
        tabBarInactiveTintColor: '#7e7576',
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="light" />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'GARAGE',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="view-dashboard" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: 'LOGS',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="fuel" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    elevation: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 50,
    height: 70,
    borderWidth: 1,
    borderColor: 'rgba(207, 196, 197, 0.5)',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
    overflow: 'hidden',
  },
});
