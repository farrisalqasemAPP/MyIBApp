import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { subjectData } from '@/constants/subjects';
import { curriculumUnits } from '@/constants/curriculum';
import { subjectDetails } from '@/constants/ibInfo';
import { LinearGradient } from 'expo-linear-gradient';

export default function CurriculumScreen() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    setQuery(search.trim().toLowerCase());
  };

  const subjects = subjectData.filter(subject => {
    if (!query) return true;
    const subjectMatch = subject.title.toLowerCase().includes(query);
    const units = curriculumUnits[subject.key] || [];
    const unitMatch = units.some(
      u =>
        u.title.toLowerCase().includes(query) ||
        u.description.toLowerCase().includes(query)
    );
    return subjectMatch || unitMatch;
  });

  return (
    <LinearGradient colors={['#6a0dad', '#0000ff']} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search curriculum..."
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
        {subjects.map(subject => {
          const units = (curriculumUnits[subject.key] || []).filter(
            u =>
              !query ||
              u.title.toLowerCase().includes(query) ||
              u.description.toLowerCase().includes(query)
          );
          return (
            <View key={subject.key} style={styles.card}>
              <Text style={[styles.subject, { color: subject.color }]}>{subject.title}</Text>
              <Text style={styles.subjectDetail}>{subjectDetails[subject.key]}</Text>
              {units.map((unit, idx) => (
                <View key={idx} style={styles.unitContainer}>
                  <Text style={styles.unitTitle}>{`\u2022 ${unit.title}`}</Text>
                  <Text style={styles.unitDescription}>{unit.description}</Text>
                </View>
              ))}
            </View>
          );
        })}
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
  searchRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#2c2c2c',
    color: '#ffffff',
    padding: 8,
    borderRadius: 6,
  },
  searchButton: {
    marginLeft: 8,
    backgroundColor: '#6a0dad',
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 6,
  },
  searchButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
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
  subjectDetail: {
    fontSize: 14,
    color: '#ddd',
    marginBottom: 8,
  },
  unitContainer: {
    marginLeft: 8,
    marginBottom: 8,
  },
  unitTitle: {
    fontSize: 16,
    color: '#f4d03f',
  },
  unitDescription: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 16,
  },
});
