/* eslint-disable import/no-unresolved */
import { withLayoutContext } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

const { Navigator } = createMaterialTopTabNavigator();
const TopTabs = withLayoutContext(Navigator);

export default function ScholarLayout() {
  const insets = useSafeAreaInsets();

  return (
    <TopTabs
      screenOptions={{
        tabBarActiveTintColor: Colors.dark.tint,
        tabBarIndicatorStyle: { backgroundColor: Colors.dark.tint },
        tabBarStyle: {
          backgroundColor: Colors.dark.background,
          paddingTop: insets.top,
        },
      }}
    >
      <TopTabs.Screen name="curriculum" options={{ title: 'Curriculum' }} />
      <TopTabs.Screen name="library" options={{ title: 'Library' }} />
      <TopTabs.Screen name="planner" options={{ title: 'AI Planner' }} />
    </TopTabs>
  );
}
