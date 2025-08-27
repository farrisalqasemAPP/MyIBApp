import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={28} name="notes" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={28} name="schedule" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tutor"
        options={{
          title: 'Tutor',
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={28} name="school" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="curriculum"
        options={{
          title: 'Curriculum',
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={28} name="menu-book" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
