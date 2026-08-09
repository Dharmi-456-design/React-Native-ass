import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
        headerShown: true,
        headerStyle: { backgroundColor: '#0f172a' },
        headerTitleStyle: { color: '#ffffff', fontWeight: 'bold' },
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: '#1e293b',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Camera & Video',
          headerTitle: 'Part 1 & 2: Camera & Video Capture',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera-outline" size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'QR & Barcode',
          headerTitle: 'Part 3: QR & Barcode Scanner',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="qr-code-outline" size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="location"
        options={{
          title: 'Location Dashboard',
          headerTitle: 'Part 4 & 5: Location & Tracking',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="location-outline" size={size || 24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
