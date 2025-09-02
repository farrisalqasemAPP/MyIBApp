import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import AIButton from '@/components/AIButton';
import { Colors } from '@/constants/Colors';
import { subjectData, SubjectInfo } from '@/constants/subjects';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Note = {
  id: string;
  title: string;
  content: string;
};

type NotesBySubject = {
  [key: string]: Note[];
};

export default function NotesScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const [activeSubject, setActiveSubject] = useState<SubjectInfo | null>(null);
  const [notes, setNotes] = useState<NotesBySubject>({});
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();

  const openSubject = (subject: SubjectInfo) => {
    setActiveSubject(subject);
  };

  const startNewNote = () => {
    setEditingNote({ id: Date.now().toString(), title: '', content: '' });
    setDraftTitle('');
    setDraftContent('');
  };

  const editNote = (note: Note) => {
    setEditingNote(note);
    setDraftTitle(note.title);
    setDraftContent(note.content);
  };

  const saveNote = () => {
    if (!activeSubject || !editingNote) return;
    const note = { ...editingNote, title: draftTitle, content: draftContent };
    setNotes(prev => {
      const subjectNotes = prev[activeSubject.key] || [];
      const index = subjectNotes.findIndex(n => n.id === note.id);
      if (index >= 0) {
        subjectNotes[index] = note;
      } else {
        subjectNotes.push(note);
      }
      return { ...prev, [activeSubject.key]: [...subjectNotes] };
    });
    setEditingNote(null);
    setDraftTitle('');
    setDraftContent('');
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setDraftTitle('');
    setDraftContent('');
  };

  const deleteNote = (id: string) => {
    if (!activeSubject) return;
    setNotes(prev => {
      const subjectNotes = prev[activeSubject.key] || [];
      return {
        ...prev,
        [activeSubject.key]: subjectNotes.filter(n => n.id !== id),
      };
    });
    cancelEdit();
  };

  const gradientColors =
    colorScheme === 'light'
      ? ['#add8e6', '#9370db']
      : ['#2e1065', '#000000'];

  return (
    <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
      <View style={[styles.mainHeader, { paddingTop: insets.top + 10 }]}> 
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.mainHeaderTitle}>CLARITY</Text>
        <View style={{ width: 24 }} />
      </View>

      {!activeSubject && (
        <ScrollView contentContainerStyle={styles.subjectList}>
          {subjectData.map(sub => (
            <TouchableOpacity
              key={sub.key}
              style={[styles.subjectBox, { backgroundColor: sub.color }]}
              onPress={() => openSubject(sub)}
            >
              <Ionicons name={sub.icon} size={32} color="#fff" />
              <Text style={styles.subjectTitle}>{sub.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {activeSubject && !editingNote && (
        <View style={{ flex: 1 }}>
          <View style={[styles.subjectHeader, { backgroundColor: activeSubject.color }]}>
            <TouchableOpacity onPress={() => setActiveSubject(null)}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.subjectHeaderTitle}>{activeSubject.title}</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#fff" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search notes..."
              placeholderTextColor="#fff"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <ScrollView contentContainerStyle={styles.noteList}>
            {(notes[activeSubject.key] || [])
              .filter(
                n =>
                  n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  n.content.toLowerCase().includes(searchQuery.toLowerCase()),
              )
              .map(n => (
              <TouchableOpacity
                key={n.id}
                style={styles.noteItem}
                onPress={() => editNote(n)}
              >
                <Text style={styles.noteTitle}>{n.title || 'Untitled Note'}</Text>
                <Text numberOfLines={1} style={styles.notePreview}>
                  {n.content}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.addNoteButton, { backgroundColor: activeSubject.color }]}
              onPress={startNewNote}
            >
              <Ionicons name="add" size={24} color="#fff" />
              <Text style={styles.addNoteText}>New Note</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {activeSubject && editingNote && (
        <View style={{ flex: 1 }}>
          <View style={[styles.subjectHeader, { backgroundColor: activeSubject.color }]}>
            <TouchableOpacity onPress={cancelEdit}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.subjectHeaderTitle}>
              {editingNote.title ? 'Edit Note' : 'New Note'}
            </Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView contentContainerStyle={styles.editorContent}>
            <TextInput
              value={draftTitle}
              onChangeText={setDraftTitle}
              placeholder="Title"
              placeholderTextColor={theme.text}
              style={[styles.input, { color: theme.text, borderColor: activeSubject.color }]}
            />
            <TextInput
              value={draftContent}
              onChangeText={setDraftContent}
              placeholder="Start writing..."
              placeholderTextColor={theme.text}
              style={[
                styles.textArea,
                { color: theme.text, borderColor: activeSubject.color },
              ]}
              multiline
            />
          </ScrollView>
          <View style={styles.bottomButtons}>
            <TouchableOpacity
              style={[styles.bottomButton, { backgroundColor: activeSubject.color }]}
              onPress={saveNote}
            >
              <Ionicons name="checkmark" size={24} color="#fff" />
              <Text style={styles.bottomButtonText}>Save</Text>
            </TouchableOpacity>
            {notes[activeSubject.key]?.some(n => n.id === editingNote.id) && (
              <TouchableOpacity
                style={[styles.bottomButton, { backgroundColor: 'red' }]}
                onPress={() => deleteNote(editingNote.id)}
              >
                <Ionicons name="trash" size={24} color="#fff" />
                <Text style={styles.bottomButtonText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <AIButton bottomOffset={20} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  subjectList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  mainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  mainHeaderTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  subjectBox: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectTitle: {
    marginTop: 8,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  subjectHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subjectHeaderTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
  },
  noteList: {
    padding: 16,
  },
  noteItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  noteTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notePreview: {
    color: '#fff',
  },
  addNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  addNoteText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
  editorContent: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: 16,
  },
  bottomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  bottomButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
});

