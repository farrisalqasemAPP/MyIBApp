/* eslint-disable import/no-unresolved */
import React, { useState, useMemo, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import RenderHTML from 'react-native-render-html';
import AIButton from '../../components/AIButton';

type Note = {
  id: string;
  title: string;
  text: string;
  color: string;
  date: string;
  images: string[];
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
  const [showSubjectColors, setShowSubjectColors] = useState(false);
  const [showNoteColors, setShowNoteColors] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const styles = useMemo(() => createStyles(darkMode), [darkMode]);
  const textColor = darkMode ? '#dcd6f7' : '#000';
  const iconColor = textColor;
  const richText = useRef<RichEditor>(null);
  const { width } = useWindowDimensions();

  const stripHtml = (html: string) => html.replace(/<[^>]+>/g, '');
  const filteredNotes = useMemo(
    () =>
      subjects.flatMap(s =>
        s.notes
          .filter(n => {
            const q = searchQuery.toLowerCase();
            return (
              n.title.toLowerCase().includes(q) ||
              stripHtml(n.text).toLowerCase().includes(q)
            );
          })
          .map(n => ({ subject: s, note: n })),
      ),
    [subjects, searchQuery],
  );

  const openSubject = (subject: Subject) => {
    setActive(subject);
    setShowSubjectColors(false);
  };
  const closeSubject = () => {
    setActive(null);
    setShowSubjectColors(false);
  };

  const openNote = (note?: Note) => {
    if (note) {
      setCurrentNote({
        ...note,
        images: note.images || [],
      });
    } else {
      setCurrentNote({
        id: Date.now().toString(),
        title: '',
        text: '',
        color: active?.color || colorOptions[0],
        date: new Date().toLocaleDateString(),
        images: [],
      });
    }
    setShowNoteColors(false);
    setNoteModalVisible(true);
  };

  const closeNote = () => {
    setNoteModalVisible(false);
    setCurrentNote(null);
    setShowNoteColors(false);
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

  const confirmDeleteNote = (id: string, onAfter?: () => void) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteNote(id);
          onAfter?.();
        },
      },
    ]);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && currentNote) {
      setCurrentNote({
        ...currentNote,
        images: [...(currentNote.images || []), result.assets[0].uri],
      });
    }
  };

  const removeImage = (index: number) => {
    if (!currentNote) return;
    setCurrentNote({
      ...currentNote,
      images: currentNote.images.filter((_, i) => i !== index),
    });
  };

  const changeSubjectColor = (color: string) => {
    if (!active) return;
    setSubjects(prev => prev.map(s => (s.key === active.key ? { ...s, color } : s)));
    setActive(prev => (prev && prev.key === active.key ? { ...prev, color } : prev));
  };

  return (
    <LinearGradient
      colors={
        darkMode
          ? ['#0d0d3d', '#1a1a40', '#3b2e7e', '#6a0dad']
          : ['#cde7ff', '#b7d9ff', '#9ccaff', '#b7d9ff']
      }
      style={styles.container}
    >
      <Text style={styles.title}>NOTES</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search notes..."
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {searchQuery ? (
        <ScrollView contentContainerStyle={styles.searchResults}>
          {filteredNotes.map(({ subject, note }) => (
            <TouchableOpacity
              key={note.id}
              style={[styles.searchCard, { backgroundColor: note.color }]}
              onPress={() => {
                setActive(subject);
                openNote(note);
              }}
            >
              <Text style={styles.noteTitle}>{note.title}</Text>
              <Text style={styles.noteDate}>
                {note.date} - {subject.title}
              </Text>
              <RenderHTML
                contentWidth={width}
                source={{ html: note.text }}
                baseStyle={styles.noteText}
                defaultTextProps={{ numberOfLines: 3, ellipsizeMode: 'tail' }}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {subjects.map(subject => (
            <TouchableOpacity
              key={subject.key}
              style={[styles.box, { backgroundColor: subject.color }]}
              onPress={() => openSubject(subject)}
            >
              <Ionicons name={subject.icon} size={32} color={iconColor} />
              <Text style={styles.boxTitle}>{subject.title}</Text>
              {subject.notes.length > 0 && (
                <Text style={styles.boxNote}>{subject.notes.length} notes</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      <TouchableOpacity
        style={styles.themeToggle}
        onPress={() => setDarkMode(!darkMode)}
      >
        <Ionicons
          name={darkMode ? 'moon' : 'sunny'}
          size={24}
          color={iconColor}
        />
      </TouchableOpacity>

      <AIButton />

      <Modal visible={!!active} animationType="slide">
        {active && (
          <View style={styles.modalContainer}>
            <View style={[styles.modalHeader, { backgroundColor: active.color }]}> 
              <View style={styles.headerLeft}>
                <Ionicons name={active.icon} size={28} color={iconColor} />
                <Text style={styles.modalTitle}>{active.title}</Text>
              </View>
              <TouchableOpacity
                style={[styles.colorIndicator, { backgroundColor: active.color }]}
                onPress={() => setShowSubjectColors(!showSubjectColors)}
              />
            </View>
            <ScrollView contentContainerStyle={styles.modalContent}>
              {showSubjectColors && (
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
              )}
              {active.notes.map(note => (
                <View
                  key={note.id}
                  style={[styles.noteCard, { backgroundColor: note.color }]}
                >
                  <TouchableOpacity style={styles.noteBody} onPress={() => openNote(note)}>
                    <Text style={styles.noteTitle}>{note.title}</Text>
                    <Text style={styles.noteDate}>{note.date}</Text>
                    <RenderHTML
                      contentWidth={width}
                      source={{ html: note.text }}
                      baseStyle={styles.noteText}
                      defaultTextProps={{ numberOfLines: 3, ellipsizeMode: 'tail' }}
                    />
                    {note.images.length > 0 && (
                      note.images.length === 1 ? (
                        <Image
                          source={{ uri: note.images[0] }}
                          style={styles.noteImage}
                          contentFit="contain"
                        />
                      ) : (
                        <View style={styles.imageIconContainer}>
                          <Ionicons name="images" size={20} color={iconColor} />
                        </View>
                      )
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteIcon}
                    onPress={() => confirmDeleteNote(note.id)}
                  >
                    <Ionicons name="trash" size={20} color={iconColor} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addButton} onPress={() => openNote()}>
                <Ionicons name="add" size={20} color={iconColor} />
                <Text style={styles.addButtonText}>Add Note</Text>
              </TouchableOpacity>
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={closeSubject}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <AIButton bottomOffset={100} />
          </View>
        )}
      </Modal>

      <Modal visible={noteModalVisible} animationType="slide">
        {currentNote && (
          <View style={styles.noteModalContainer}>
            <Text style={styles.noteDate}>{currentNote.date}</Text>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <TextInput
                style={styles.titleInput}
                placeholder="Title"
                placeholderTextColor="#999"
                value={currentNote.title}
                onChangeText={title => setCurrentNote({ ...currentNote, title })}
              />
              <RichEditor
                ref={richText}
                initialContentHTML={currentNote.text}
                editorStyle={{ backgroundColor: 'transparent', color: textColor }}
                style={styles.richEditor}
                onChange={text => setCurrentNote({ ...currentNote, text })}
              />
              <RichToolbar
                editor={richText}
                actions={[actions.setItalic, actions.setUnderline]}
                iconTint={iconColor}
                selectedIconTint={iconColor}
                style={styles.formatBar}
              />
              {currentNote.images.map((img, idx) => (
                <View key={img + idx} style={styles.imageContainer}>
                  <Image
                    source={{ uri: img }}
                    style={styles.noteImage}
                    contentFit="contain"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(idx)}
                  >
                    <Ionicons name="close-circle" size={20} color="#dc3545" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Ionicons name="image" size={20} color={iconColor} />
                <Text style={styles.addButtonText}>Add Image</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.colorToggle}
                onPress={() => {
                  setShowNoteColors(!showNoteColors);
                }}
              >
                <Ionicons name="color-palette" size={20} color={iconColor} />
                <Text style={styles.addButtonText}>Colors</Text>
              </TouchableOpacity>
              {showNoteColors && (
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
              )}
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
                    onPress={() => confirmDeleteNote(currentNote.id, closeNote)}
                  >
                    <Text style={styles.saveButtonText}>Delete</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.cancelButton} onPress={closeNote}>
                  <Text style={styles.saveButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            <AIButton bottomOffset={100} />
          </View>
        )}
      </Modal>
    </LinearGradient>
  );
}

const createStyles = (dark: boolean) => {
  const textColor = dark ? '#dcd6f7' : '#000';
  const secondaryText = dark ? '#e0e0e0' : '#333';
  const background = dark ? '#0d0d3d' : '#cde7ff';
  const toggleBg = dark ? '#1a1a40' : '#b7d9ff';
  const inputBorder = dark ? '#2e1065' : '#99c1ff';
  const selectedBorder = dark ? '#fff' : '#000';
  const cancelBg = dark ? '#6c757d' : '#b0c4de';
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      paddingTop: 40,
    },
    title: {
      color: textColor,
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 16,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    searchInput: {
      borderColor: inputBorder,
      borderWidth: 1,
      borderRadius: 8,
      padding: 8,
      color: textColor,
      marginBottom: 16,
    },
    searchResults: {
      paddingBottom: 16,
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
      color: textColor,
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    boxNote: {
      marginTop: 8,
      color: secondaryText,
      fontSize: 14,
      textAlign: 'center',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: background,
    },
    modalHeader: {
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    modalTitle: {
      marginLeft: 8,
      color: textColor,
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
    searchCard: {
      borderRadius: 8,
      marginBottom: 12,
      padding: 12,
    },
    noteBody: {
      flex: 1,
      alignItems: 'flex-start',
    },
    noteDate: {
      color: textColor,
      marginBottom: 4,
      fontSize: 12,
      textAlign: 'left',
    },
    noteText: {
      color: secondaryText,
      fontSize: 14,
      textAlign: 'left',
    },
    noteTitle: {
      color: textColor,
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'left',
      marginBottom: 4,
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
      color: textColor,
    },
    closeButton: {
      backgroundColor: '#2e1065',
      padding: 16,
      alignItems: 'center',
    },
    closeButtonText: {
      color: textColor,
      fontSize: 16,
      fontWeight: 'bold',
    },
    noteModalContainer: {
      flex: 1,
      backgroundColor: background,
      paddingTop: 32,
    },
    titleInput: {
      borderColor: inputBorder,
      borderWidth: 1,
      borderRadius: 8,
      padding: 8,
      color: textColor,
      marginBottom: 12,
    },
    richEditor: {
      minHeight: 120,
      borderColor: inputBorder,
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
    },
    formatBar: {
      marginTop: 8,
      backgroundColor: toggleBg,
      borderRadius: 4,
    },
    colorRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 16,
      marginBottom: 16,
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
      borderColor: selectedBorder,
    },
    noteImage: {
      width: '100%',
      height: 150,
      borderRadius: 8,
      marginBottom: 8,
    },
    imageContainer: {
      position: 'relative',
      width: '100%',
      marginBottom: 8,
    },
    removeImageButton: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 12,
      padding: 2,
    },
    noteModalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 16,
      marginTop: 24,
    },
    saveButton: {
      backgroundColor: '#2e1065',
      padding: 16,
      borderRadius: 8,
    },
    deleteButton: {
      backgroundColor: '#dc3545',
      padding: 16,
      borderRadius: 8,
    },
    cancelButton: {
      backgroundColor: cancelBg,
      padding: 16,
      borderRadius: 8,
    },
    saveButtonText: {
      color: textColor,
      fontSize: 16,
    },
    themeToggle: {
      position: 'absolute',
      bottom: 30,
      right: 20,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: toggleBg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    colorToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 16,
    },
    colorIndicator: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: textColor,
    },
    imageIconContainer: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: toggleBg,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
    },
  });
};

