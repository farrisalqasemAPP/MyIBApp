import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { subjectData } from '@/constants/subjects';
import { ibOverview, subjectDetails } from '@/constants/ibInfo';
import { curriculumUnits } from '@/constants/curriculum';

export default function CurriculumScreen() {
  const [expanded, setExpanded] = useState<string | null>(null);

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
              color={Colors.dark.icon}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 16 },
  overview: { color: Colors.dark.text, marginBottom: 16, fontSize: 16 },
  card: { backgroundColor: Colors.dark.card, borderRadius: 12, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  cardTitle: { color: Colors.dark.text, fontWeight: '600', fontSize: 16 },
  icon: { marginRight: 8 },
  chevron: { marginLeft: 'auto' },
  cardBody: { paddingHorizontal: 12, paddingBottom: 12 },
  subjectDetail: { color: Colors.dark.text, marginBottom: 8 },
  unit: { marginBottom: 8 },
  unitTitle: { color: Colors.dark.tint, fontWeight: '600' },
  unitDesc: { color: Colors.dark.text, fontSize: 14 },
});
