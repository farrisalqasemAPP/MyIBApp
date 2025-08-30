import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { subjectData } from '@/constants/subjects';

export default function PlannerScreen() {
  const [selected, setSelected] = useState<string[]>([]);
  const [plan, setPlan] = useState<{ day: string; subject: string }[]>([]);

  const toggleSubject = (key: string) => {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const generatePlan = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const chosen = subjectData.filter(s => selected.includes(s.key));
    const sessions: { day: string; subject: string }[] = [];
    let dayIndex = 0;
    chosen.forEach(sub => {
      sessions.push({ day: days[dayIndex % days.length], subject: sub.title });
      dayIndex++;
    });
    setPlan(sessions);
  };

  return (
    <LinearGradient colors={['#6a0dad', '#0000ff']} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.header}>Select your subjects</Text>
        <View style={styles.subjects}>
          {subjectData.map(subject => {
            const active = selected.includes(subject.key);
            return (
              <TouchableOpacity
                key={subject.key}
                style={[styles.subjectItem, active && styles.subjectItemActive]}
                onPress={() => toggleSubject(subject.key)}
              >
                <Text style={styles.subjectText}>{subject.title}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity style={styles.generateButton} onPress={generatePlan}>
          <Text style={styles.generateText}>Generate Study Plan</Text>
        </TouchableOpacity>
        {plan.length > 0 && (
          <View style={styles.plan}>
            {plan.map((p, idx) => (
              <Text key={idx} style={styles.planText}>
                {p.day}: {p.subject}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subjects: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  subjectItem: {
    backgroundColor: Colors.dark.card,
    padding: 8,
    borderRadius: 6,
    margin: 4,
  },
  subjectItemActive: {
    backgroundColor: Colors.dark.tint,
  },
  subjectText: {
    color: Colors.dark.text,
  },
  generateButton: {
    backgroundColor: Colors.dark.tint,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 16,
  },
  generateText: {
    color: Colors.dark.text,
    fontWeight: 'bold',
  },
  plan: {
    backgroundColor: Colors.dark.card,
    padding: 12,
    borderRadius: 6,
  },
  planText: {
    color: Colors.dark.text,
    marginBottom: 4,
  },
});

