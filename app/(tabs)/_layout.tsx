import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Animated icon for the Tutor tab.
function TutorIcon({ color, focused }: { color: string; focused: boolean }) {
  const scale = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (focused) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <MaterialIcons size={28} name="school" color={color} />
    </Animated.View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          ...Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: 'absolute',
            },
            default: {},
          }),
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
        },
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
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tutor"
        options={{
          title: 'Tutor',
          tabBarIcon: ({ color, focused }) => (
            <TutorIcon color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="scholar"
        options={{
          title: 'Scholar',
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={28} name="library-books" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
