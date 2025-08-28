import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
// eslint-disable-next-line import/no-unresolved
import { LinearGradient } from 'expo-linear-gradient';

type Note = {
  id: string;
  text: string;
  color: string;
  date: string;
  image?: string;
};

type Subject = {
  key: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  notes: Note[];
  color: string;
};

const colorOptions = [
  '#3b2e7e',
  '#6a0dad',
  '#1a1a40',
  '#2e1065',
  '#007bff',
  '#28a745',
  '#dc3545',
  '#ffc107',
  '#4caf50',
  '#2196f3',
  '#f44336',
  '#ffeb3b',
];

const initialSubjects: Subject[] = [
  { key: 'english', title: 'English', icon: 'book', notes: [], color: colorOptions[0] },
  { key: 'arabic', title: 'Arabic', icon: 'globe-outline', notes: [], color: colorOptions[1] },
  { key: 'math', title: 'Math', icon: 'calculator', notes: [], color: colorOptions[2] },
  { key: 'physics', title: 'Physics', icon: 'planet', notes: [], color: colorOptions[3] },
  { key: 'biology', title: 'Biology', icon: 'leaf', notes: [], color: colorOptions[4] },
  { key: 'business', title: 'Business', icon: 'briefcase', notes: [], color: colorOptions[5] },
  { key: 'social', title: 'Social Studies', icon: 'people', notes: [], color: colorOptions[6] },
];

export default function NotesScreen() {
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [active, setActive] = useState<Subject | null>(null);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  const openSubject = (subject: Subject) => setActive(subject);
  const closeSubject = () => setActive(null);

  const openNote = (note?: Note) => {
    if (note) {
      setCurrentNote(note);
    } else {
      setCurrentNote({
        id: Date.now().toString(),
        text: '',
        color: active?.color || colorOptions[0],
        date: new Date().toLocaleDateString(),
        image: undefined,
      });
    }
    setNoteModalVisible(true);
  };

  const closeNote = () => {
    setNoteModalVisible(false);
    setCurrentNote(null);
  };

  const saveNote = (note: Note) => {
    if (!active) return;
    setSubjects(prev =>
      prev.map(s =>
        s.key === active.key
          ? {
              ...s,
              notes: s.notes.some(n => n.id === note.id)
                ? s.notes.map(n => (n.id === note.id ? note : n))
                : [...s.notes, note],
            }
          : s,
      ),
    );
    setActive(prev =>
      prev && prev.key === active.key
        ? {
            ...prev,
            notes: prev.notes.some(n => n.id === note.id)
              ? prev.notes.map(n => (n.id === note.id ? note : n))
              : [...prev.notes, note],
          }
        : prev,
    );
  };

  const deleteNote = (id: string) => {
    if (!active) return;
    setSubjects(prev =>
      prev.map(s =>
        s.key === active.key ? { ...s, notes: s.notes.filter(n => n.id !== id) } : s,
      ),
    );
    setActive(prev =>
      prev && prev.key === active.key
        ? { ...prev, notes: prev.notes.filter(n => n.id !== id) }
        : prev,
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && currentNote) {
      setCurrentNote({ ...currentNote, image: result.assets[0].uri });
    }
  };

  const changeSubjectColor = (color: string) => {
    if (!active) return;
    setSubjects(prev => prev.map(s => (s.key === active.key ? { ...s, color } : s)));
    setActive(prev => (prev && prev.key === active.key ? { ...prev, color } : prev));
  };

  return (
    <LinearGradient
      colors={['#0d0d3d', '#1a1a40', '#3b2e7e', '#6a0dad']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.grid}>
        {subjects.map(subject => (
          <TouchableOpacity
            key={subject.key}
            style={[styles.box, { backgroundColor: subject.color }]}
            onPress={() => openSubject(subject)}
          >
            <Ionicons name={subject.icon} size={32} color="#dcd6f7" />
            <Text style={styles.boxTitle}>{subject.title}</Text>
            {subject.notes.length > 0 && (
              <Text style={styles.boxNote}>{subject.notes.length} notes</Text>
            )}
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
              <View style={styles.colorRow}>
                {colorOptions.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: c },
                      active.color === c && styles.selectedSwatch,
                    ]}
                    onPress={() => changeSubjectColor(c)}
                  />
                ))}
              </View>
              {active.notes.map(note => (
                <View key={note.id} style={[styles.noteCard, { backgroundColor: note.color }]}>
                  <TouchableOpacity style={styles.noteBody} onPress={() => openNote(note)}>
                    {note.image && (
                      <Image
                        source={{ uri: note.image }}
                        style={styles.noteImage}
                        contentFit="contain"
                      />
                    )}
                    <Text style={styles.noteDate}>{note.date}</Text>
                    <Text style={styles.noteText} numberOfLines={3}>
                      {note.text}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteIcon}
                    onPress={() => deleteNote(note.id)}
                  >
                    <Ionicons name="trash" size={20} color="#dcd6f7" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addButton} onPress={() => openNote()}>
                <Ionicons name="add" size={20} color="#dcd6f7" />
                <Text style={styles.addButtonText}>Add Note</Text>
              </TouchableOpacity>
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={closeSubject}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>

      <Modal visible={noteModalVisible} animationType="slide">
        {currentNote && (
          <View style={styles.noteModalContainer}>
            <Text style={styles.noteDate}>{currentNote.date}</Text>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <TextInput
                style={styles.input}
                placeholder="Write your note..."
                placeholderTextColor="#999"
                multiline
                value={currentNote.text}
                onChangeText={text => setCurrentNote({ ...currentNote, text })}
              />
              {currentNote.image && (
                <Image
                  source={{ uri: currentNote.image }}
                  style={styles.noteImage}
                  contentFit="contain"
                />
              )}
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Ionicons name="image" size={20} color="#dcd6f7" />
                <Text style={styles.addButtonText}>Add Image</Text>
              </TouchableOpacity>
              <View style={styles.colorRow}>
                {colorOptions.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: c },
                      currentNote.color === c && styles.selectedSwatch,
                    ]}
                    onPress={() => setCurrentNote({ ...currentNote, color: c })}
                  />
                ))}
              </View>
            </ScrollView>
            <View style={styles.noteModalButtons}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  saveNote(currentNote);
                  closeNote();
                }}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              {active?.notes.some(n => n.id === currentNote.id) && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => {
                    deleteNote(currentNote.id);
                    closeNote();
                  }}
                >
                  <Text style={styles.saveButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.cancelButton} onPress={closeNote}>
                <Text style={styles.saveButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
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
    alignItems: 'center',
  },
  boxTitle: {
    marginTop: 8,
    color: '#dcd6f7',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  boxNote: {
    marginTop: 8,
    color: '#e0e0e0',
    fontSize: 14,
    textAlign: 'center',
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
  noteCard: {
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noteBody: {
    flex: 1,
    alignItems: 'flex-start',
  },
  noteDate: {
    color: '#dcd6f7',
    marginBottom: 4,
    fontSize: 12,
    textAlign: 'left',
  },
  noteText: {
    color: '#e0e0e0',
    fontSize: 14,
    textAlign: 'left',
  },
  deleteIcon: {
    marginLeft: 8,
    justifyContent: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    marginLeft: 8,
    color: '#dcd6f7',
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
  noteModalContainer: {
    flex: 1,
    backgroundColor: '#0d0d3d',
    paddingTop: 32,
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
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedSwatch: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  noteImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  noteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  saveButton: {
    backgroundColor: '#2e1065',
    padding: 12,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#dcd6f7',
  },
});

