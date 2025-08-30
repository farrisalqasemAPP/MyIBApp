import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

export default function PlannerScreen() {
  return (
    <LinearGradient colors={['#6a0dad', '#0000ff']} style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.text}>AI Planner coming soon.</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { color: Colors.dark.text, fontSize: 18 },
});
