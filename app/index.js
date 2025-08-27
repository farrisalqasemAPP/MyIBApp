import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';

const Tab = createBottomTabNavigator();

// Notes Screen
function NotesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📝 Notes Screen</Text>
    </View>
  );
}

// Schedule Screen
function ScheduleScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📅 Schedule Screen</Text>
    </View>
  );
}

// Tutor Screen
function TutorScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🎓 Tutor Screen</Text>
    </View>
  );
}

// Curriculum Screen
function CurriculumScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📚 Curriculum Screen</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: '#0b0b0c' },
          tabBarActiveTintColor: '#f4d03f',
          tabBarInactiveTintColor: '#aaa',
        }}
      >
        <Tab.Screen name="Notes" component={NotesScreen} />
        <Tab.Screen name="Schedule" component={ScheduleScreen} />
        <Tab.Screen name="Tutor" component={TutorScreen} />
        <Tab.Screen name="Curriculum" component={CurriculumScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 22,
    color: '#f4d03f',
  },
});
