import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

import LibraryScreen from './scholarTabs/library';
import PlannerScreen from './scholarTabs/planner';
import CurriculumScreen from './scholarTabs/curriculum';

const TopTabs = createMaterialTopTabNavigator();

export default function ScholarScreen() {
  return (
    <LinearGradient colors={['#6a0dad', '#0000ff']} style={{ flex: 1 }}>
      <TopTabs.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: 'transparent' },
          tabBarIndicatorStyle: { backgroundColor: Colors.dark.tint },
          tabBarActiveTintColor: Colors.dark.text,
          tabBarInactiveTintColor: Colors.dark.icon,
          tabBarLabelStyle: { fontWeight: 'bold' },
        }}
        sceneContainerStyle={{ backgroundColor: 'transparent' }}
      >
        <TopTabs.Screen name="Library" component={LibraryScreen} />
        <TopTabs.Screen name="Planner" component={PlannerScreen} />
        <TopTabs.Screen name="Curriculum" component={CurriculumScreen} />
      </TopTabs.Navigator>
    </LinearGradient>
  );
}
