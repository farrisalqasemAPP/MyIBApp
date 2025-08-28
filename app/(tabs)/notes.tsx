import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

type Subject = {
  key: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  note: string;
  color: string;
  image: string | null;
};

const initialSubjects: Subject[] = [
  { key: 'math', title: 'Math', icon: 'calculator', note: '', color: '#3b2e7e', image: null },
  { key: 'science', title: 'Science', icon: 'flask', note: '', color: '#3b2e7e', image: null },
  { key: 'history', title: 'History', icon: 'book', note: '', color: '#3b2e7e', image: null },
  { key: 'language', title: 'Language', icon: 'globe-outline', note: '', color: '#3b2e7e', image: null },
];

export default function NotesScreen() {
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [active, setActive] = useState<Subject | null>(null);

  const openSubject = (subject: Subject) => setActive(subject);

  const closeSubject = () => setActive(null);

  const updateSubject = (updated: Subject) => {
    setSubjects(prev => prev.map(s => (s.key === updated.key ? updated : s)));
  };

  const pickImage = async (subject: Subject) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const updated = { ...subject, image: result.assets[0].uri };
      setActive(updated);
      updateSubject(updated);
    }
  };

  const colorOptions = ['#3b2e7e', '#6a0dad', '#1a1a40', '#2e1065'];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.grid}>
        {subjects.map(subject => (
          <TouchableOpacity
            key={subject.key}
            style={[styles.box, { backgroundColor: subject.color }]}
            onPress={() => openSubject(subject)}
          >
            <Ionicons name={subject.icon} size={32} color="#dcd6f7" />
            <Text style={styles.boxTitle}>{subject.title}</Text>
            {subject.image && <Image source={{ uri: subject.image }} style={styles.thumbnail} />}
            {subject.note ? (
              <Text numberOfLines={2} style={styles.boxNote}>
                {subject.note}
              </Text>
            ) : null}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={!!active} animationType="slide">
        {active && (
          <View style={styles.modalContainer}>
            <View style={[styles.modalHeader, { backgroundColor: active.color }]}>
              <Ionicons name={active.icon} size={28} color="#dcd6f7" />
              <Text style={styles.modalTitle}>{active.title}</Text>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <TextInput
                style={styles.input}
                placeholder="Write your note..."
                placeholderTextColor="#999"
                multiline
                value={active.note}
                onChangeText={text => {
                  const updated = { ...active, note: text };
                  setActive(updated);
                  updateSubject(updated);
                }}
              />
              {active.image && <Image source={{ uri: active.image }} style={styles.image} />}
              <View style={styles.colorRow}>
                {colorOptions.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.colorSwatch, { backgroundColor: c }]}
                    onPress={() => {
                      const updated = { ...active, color: c };
                      setActive(updated);
                      updateSubject(updated);
                    }}
                  />
                ))}
              </View>
              <TouchableOpacity style={styles.imageButton} onPress={() => pickImage(active)}>
                <Ionicons name="image" size={20} color="#dcd6f7" />
                <Text style={styles.imageButtonText}>Add Image</Text>
              </TouchableOpacity>
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={closeSubject}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d3d',
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  box: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  boxTitle: {
    marginTop: 8,
    color: '#dcd6f7',
    fontSize: 16,
    fontWeight: 'bold',
  },
  boxNote: {
    marginTop: 8,
    color: '#e0e0e0',
    fontSize: 14,
  },
  thumbnail: {
    width: '100%',
    height: 80,
    marginTop: 8,
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0d0d3d',
  },
  modalHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    marginLeft: 8,
    color: '#dcd6f7',
    fontSize: 20,
    fontWeight: '600',
  },
  modalContent: {
    padding: 16,
  },
  input: {
    minHeight: 120,
    borderColor: '#2e1065',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: '#dcd6f7',
    textAlignVertical: 'top',
  },
  image: {
    width: '100%',
    height: 200,
    marginTop: 16,
    borderRadius: 8,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  imageButtonText: {
    marginLeft: 8,
    color: '#dcd6f7',
  },
  colorRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  closeButton: {
    backgroundColor: '#2e1065',
    padding: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#dcd6f7',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
