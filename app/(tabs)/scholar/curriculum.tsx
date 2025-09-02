import React, { useState, useMemo } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { subjectData } from '@/constants/subjects';
import { ibOverview, subjectDetails } from '@/constants/ibInfo';
import { curriculumUnits } from '@/constants/curriculum';

export default function CurriculumScreen() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.overview}>{ibOverview}</Text>
      {subjectData.map(subject => (
        <View key={subject.key} style={styles.card}>
          <TouchableOpacity
            style={styles.cardHeader}
            onPress={() => setExpanded(expanded === subject.key ? null : subject.key)}
          >
            <Ionicons name={subject.icon} size={20} color={subject.color} style={styles.icon} />
            <Text style={styles.cardTitle}>{subject.title}</Text>
            <Ionicons
              name={expanded === subject.key ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={Colors[colorScheme].icon}
              style={styles.chevron}
            />
          </TouchableOpacity>
          {expanded === subject.key && (
            <View style={styles.cardBody}>
              <Text style={styles.subjectDetail}>{subjectDetails[subject.key]}</Text>
              {curriculumUnits[subject.key].map(unit => (
                <View key={unit.title} style={styles.unit}>
                  <Text style={styles.unitTitle}>{unit.title}</Text>
                  <Text style={styles.unitDesc}>{unit.description}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const createStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors[colorScheme].background },
    content: { padding: 16 },
    overview: {
      color: Colors[colorScheme].text,
      marginBottom: 16,
      fontSize: 16,
    },
    card: {
      backgroundColor: Colors[colorScheme].card,
      borderRadius: 12,
      marginBottom: 12,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
    cardTitle: {
      color: Colors[colorScheme].text,
      fontWeight: '600',
      fontSize: 16,
    },
    icon: { marginRight: 8 },
    chevron: { marginLeft: 'auto' },
    cardBody: { paddingHorizontal: 12, paddingBottom: 12 },
    subjectDetail: { color: Colors[colorScheme].text, marginBottom: 8 },
    unit: { marginBottom: 8 },
    unitTitle: { color: Colors[colorScheme].tint, fontWeight: '600' },
    unitDesc: { color: Colors[colorScheme].text, fontSize: 14 },
  });
