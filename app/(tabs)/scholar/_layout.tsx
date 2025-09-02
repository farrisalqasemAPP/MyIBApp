import { withLayoutContext } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const { Navigator } = createMaterialTopTabNavigator();
const TopTabs = withLayoutContext(Navigator);

export default function ScholarLayout() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <View style={{ paddingTop: insets.top + 10, paddingBottom: 10 }}>
        <Text
          style={{
            color: Colors[colorScheme].text,
            textAlign: 'center',
            fontSize: 20,
            fontWeight: 'bold',
          }}
        >
          CLARITY
        </Text>
      </View>
      <TopTabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme].tint,
          tabBarIndicatorStyle: { backgroundColor: Colors[colorScheme].tint },
          tabBarStyle: {
            backgroundColor: Colors[colorScheme].background,
          },
          tabBarLabelStyle: { marginTop: 10 },
        }}
      >
        <TopTabs.Screen name="curriculum" options={{ title: 'Curriculum' }} />
        <TopTabs.Screen name="library" options={{ title: 'Library' }} />
        <TopTabs.Screen name="planner" options={{ title: 'AI Planner' }} />
      </TopTabs>
    </View>
  );
}
