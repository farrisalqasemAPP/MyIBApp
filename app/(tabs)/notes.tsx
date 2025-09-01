import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function NotesScreen() {
  const subjects = ['Math', 'Science', 'English', 'History', 'Language', 'Other'];

  return (
    <LinearGradient colors={['#2e1065', '#1e3a8a']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>CLARITY</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#fff" style={styles.searchIcon} />
          <TextInput
            placeholder="Search notes"
            placeholderTextColor="#ccc"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.grid}>
          {subjects.map(subject => (
            <TouchableOpacity key={subject} style={styles.cube}>
              <Text style={styles.cubeText}>{subject}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginTop: 10,
    width: '100%',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#fff',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 30,
    width: '100%',
  },
  cube: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cubeText: {
    color: '#fff',
    fontWeight: '600',
  },
});

