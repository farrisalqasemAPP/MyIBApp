import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { subjectData } from '@/constants/subjects';
import { curriculumUnits } from '@/constants/curriculum';

export default function CurriculumScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {subjectData.map(subject => (
        <View key={subject.key} style={styles.card}>
          <Text style={[styles.subject, { color: subject.color }]}>{subject.title}</Text>
          {curriculumUnits[subject.key]?.map((unit, idx) => (
            <Text key={idx} style={styles.unit}>{`\u2022 ${unit}`}</Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1c',
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#2c2c2c',
    borderRadius: 8,
  },
  subject: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  unit: {
    fontSize: 16,
    color: '#f4d03f',
    marginLeft: 8,
    marginBottom: 4,
  },
});
