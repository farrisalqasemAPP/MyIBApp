import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  RichEditor,
  RichToolbar,
  actions,
} from 'react-native-pell-rich-editor';
import DrawingCanvas, { DrawingElement } from '@/components/DrawingCanvas';
import DrawingBoardModal from '@/components/DrawingBoardModal';

import AIButton from '@/components/AIButton';
import { Colors } from '@/constants/Colors';
import { subjectData, SubjectInfo } from '@/constants/subjects';
import { useColorScheme, useToggleColorScheme } from '@/hooks/useColorScheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Note = {
  id: string;
  title: string;
  content: string; // stored as HTML for text notes
  drawing?: DrawingElement[]; // drawing elements for drawing notes
  pinned: boolean;
  type: 'text' | 'drawing';
};

type NotesBySubject = {
  [key: string]: Note[];
};

export default function NotesScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const [subjects, setSubjects] = useState<SubjectInfo[]>(subjectData);
  const [activeSubject, setActiveSubject] = useState<SubjectInfo | null>(null);
  const [notes, setNotes] = useState<NotesBySubject>({});
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [drawingElements, setDrawingElements] = useState<DrawingElement[]>([]);
  const [drawingModalVisible, setDrawingModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [editingSubjectInfo, setEditingSubjectInfo] = useState<SubjectInfo | null>(null);
  const [textColor, setTextColor] = useState('#000000');
  const [deletedSubjects, setDeletedSubjects] = useState<
    { subject: SubjectInfo; notes: Note[] }[]
  >([]);
  const [deletedNotes, setDeletedNotes] = useState<
    { note: Note; subject: SubjectInfo }[]
  >([]);
  const [trashVisible, setTrashVisible] = useState(false);
  const toggleColorScheme = useToggleColorScheme();
  const richText = useRef<RichEditor>(null);
  const insets = useSafeAreaInsets();

  const openSubject = (subject: SubjectInfo) => {
    setActiveSubject(subject);
    setSearchQuery('');
  };

  const openAddSubject = () => {
    setEditingSubjectInfo(null);
    setSubjectName('');
    setSubjectModalVisible(true);
  };

  const openEditSubject = (subject: SubjectInfo) => {
    setEditingSubjectInfo(subject);
    setSubjectName(subject.title);
    setSubjectModalVisible(true);
  };

  const handleDeleteSubject = (subject: SubjectInfo) => {
    setDeletedSubjects(prev => [
      ...prev,
      { subject, notes: notes[subject.key] || [] },
    ]);
    setSubjects(prev => prev.filter(s => s.key !== subject.key));
    setNotes(prev => {
      const updated = { ...prev };
      delete updated[subject.key];
      return updated;
    });
  };

  const saveSubjectInfo = () => {
    if (subjectName.trim() === '') return;
    if (editingSubjectInfo) {
      setSubjects(prev =>
        prev.map(s => (s.key === editingSubjectInfo.key ? { ...s, title: subjectName } : s))
      );
    } else {
      const newSubject: SubjectInfo = {
        key: Date.now().toString(),
        title: subjectName,
        icon: 'book',
        color: '#3b2e7e',
      };
      setSubjects(prev => [...prev, newSubject]);
    }
    setSubjectModalVisible(false);
  };

  const deleteSubjectInfo = () => {
    if (!editingSubjectInfo) return;
    handleDeleteSubject(editingSubjectInfo);
    setSubjectModalVisible(false);
  };

  const startNewNote = () => {
    setEditingNote({
      id: Date.now().toString(),
      title: '',
      content: '',
      pinned: false,
      type: 'text',
    });
    setDraftTitle('');
    setDraftContent('');
    setTextColor('#000000');
    richText.current?.setForeColor('#000000');
  };

  const startNewDrawing = () => {
    setEditingNote({
      id: Date.now().toString(),
      title: '',
      content: '',
      drawing: [],
      pinned: false,
      type: 'drawing',
    });
    setDraftTitle('');
    setDrawingElements([]);
    setDrawingModalVisible(true);
  };

  const editNote = (note: Note) => {
    setEditingNote(note);
    setDraftTitle(note.title);
    if (note.type === 'drawing') {
      setDrawingElements(note.drawing || []);
      setDrawingModalVisible(true);
    } else {
      setDraftContent(note.content);
      setTextColor('#000000');
      richText.current?.setForeColor('#000000');
    }
  };

  const saveNote = () => {
    if (!activeSubject || !editingNote) return;
    const note =
      editingNote.type === 'drawing'
        ? { ...editingNote, title: draftTitle, drawing: drawingElements }
        : { ...editingNote, title: draftTitle, content: draftContent };
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
    setDrawingElements([]);
    setDrawingModalVisible(false);
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setDraftTitle('');
    setDraftContent('');
    setDrawingElements([]);
    setTextColor('#000000');
    setDrawingModalVisible(false);
  };

  const deleteNote = (id: string) => {
    if (!activeSubject) return;
    setNotes(prev => {
      const subjectNotes = prev[activeSubject.key] || [];
      const noteToDelete = subjectNotes.find(n => n.id === id);
      if (noteToDelete) {
        setDeletedNotes(prevTrash => [
          ...prevTrash,
          { note: noteToDelete, subject: activeSubject },
        ]);
      }
      return {
        ...prev,
        [activeSubject.key]: subjectNotes.filter(n => n.id !== id),
      };
    });
    cancelEdit();
  };

  const togglePin = (id: string) => {
    if (!activeSubject) return;
    setNotes(prev => {
      const subjectNotes = prev[activeSubject.key] || [];
      const index = subjectNotes.findIndex(n => n.id === id);
      if (index >= 0) {
        subjectNotes[index].pinned = !subjectNotes[index].pinned;
      }
      return { ...prev, [activeSubject.key]: [...subjectNotes] };
    });
  };

  const restoreSubject = (item: { subject: SubjectInfo; notes: Note[] }) => {
    setSubjects(prev => [...prev, item.subject]);
    setNotes(prev => ({ ...prev, [item.subject.key]: item.notes }));
    setDeletedSubjects(prev =>
      prev.filter(s => s.subject.key !== item.subject.key)
    );
  };

  const permanentlyDeleteSubject = (key: string) => {
    setDeletedSubjects(prev => prev.filter(s => s.subject.key !== key));
  };

  const restoreNote = (item: { note: Note; subject: SubjectInfo }) => {
    setSubjects(prev => {
      if (!prev.find(s => s.key === item.subject.key)) {
        return [...prev, item.subject];
      }
      return prev;
    });
    setNotes(prev => {
      const subjectNotes = prev[item.subject.key] || [];
      return { ...prev, [item.subject.key]: [...subjectNotes, item.note] };
    });
    setDeletedNotes(prev => prev.filter(n => n.note.id !== item.note.id));
  };

  const permanentlyDeleteNote = (id: string) => {
    setDeletedNotes(prev => prev.filter(n => n.note.id !== id));
  };

  const stripHtml = (html: string) => html.replace(/<[^>]+>/g, '');

  const gradientColors =
    colorScheme === 'light'
      ? ['#add8e6', '#9370db']
      : ['#2e1065', '#000000'];

  return (
    <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
      <View style={[styles.mainHeader, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => setSettingsVisible(true)}>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.mainHeaderTitle}>CLARITY</Text>
        <TouchableOpacity onPress={() => setTrashVisible(true)}>
          <Ionicons name="trash" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {!activeSubject && (
        <View style={{ flex: 1 }}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color={theme.text}
              style={{ marginRight: 8 }}
            />
            <TextInput
              placeholder="Search notes..."
              placeholderTextColor={theme.text}
              style={[styles.searchInput, { color: theme.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          {searchQuery === '' ? (
            <ScrollView contentContainerStyle={styles.subjectList}>
              {subjects.map(sub => (
                <View key={sub.key} style={styles.subjectWrapper}>
                  <TouchableOpacity
                    style={styles.deleteSubjectButton}
                    onPress={() => handleDeleteSubject(sub)}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.subjectBox, { backgroundColor: sub.color }]}
                    onPress={() => openSubject(sub)}
                    onLongPress={() => openEditSubject(sub)}
                  >
                    <Ionicons name={sub.icon} size={32} color="#fff" />
                    <Text style={styles.subjectTitle}>{sub.title}</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <View key="add-subject" style={styles.subjectWrapper}>
                <TouchableOpacity
                  style={[styles.subjectBox, styles.addSubjectBox]}
                  onPress={openAddSubject}
                >
                  <Ionicons name="add" size={32} color="#fff" />
                  <Text style={styles.subjectTitle}>Add</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <ScrollView contentContainerStyle={styles.noteList}>
              {Object.entries(notes)
                .flatMap(([key, subjectNotes]) => {
                  const subject = subjects.find(s => s.key === key);
                  return subjectNotes.map(n => ({ ...n, subject }));
                })
                .filter(n => {
                  const q = searchQuery.toLowerCase();
                  return (
                    n.title.toLowerCase().includes(q) ||
                    (n.type === 'text' &&
                      stripHtml(n.content).toLowerCase().includes(q))
                  );
                })
                .map(n => (
                  <TouchableOpacity
                    key={n.id}
                    style={styles.noteItem}
                    onPress={() => {
                      setActiveSubject(n.subject);
                      editNote(n);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.noteTitle, { color: theme.text }]}>
                        {n.title || 'Untitled Note'}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={[styles.notePreview, { color: theme.text }]}
                      >
                        {n.type === 'drawing' ? 'Drawing' : stripHtml(n.content)}
                      </Text>
                      <Text
                        style={{ color: theme.text, fontSize: 12, marginTop: 4 }}
                      >
                        {n.subject?.title}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          )}
        </View>
      )}

      {activeSubject && !editingNote && (
        <View style={{ flex: 1 }}>
          <View style={[styles.subjectHeader, { backgroundColor: activeSubject.color }]}>
            <TouchableOpacity
              onPress={() => {
                setActiveSubject(null);
                setSearchQuery('');
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.subjectHeaderTitle}>{activeSubject.title}</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color={theme.text}
              style={{ marginRight: 8 }}
            />
            <TextInput
              placeholder="Search notes..."
              placeholderTextColor={theme.text}
              style={[styles.searchInput, { color: theme.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <ScrollView contentContainerStyle={styles.noteList}>
            {(notes[activeSubject.key] || [])
              .filter(n => {
                const q = searchQuery.toLowerCase();
                return (
                  n.title.toLowerCase().includes(q) ||
                  (n.type === 'text' &&
                    stripHtml(n.content).toLowerCase().includes(q))
                );
              })
              .sort((a, b) => Number(b.pinned) - Number(a.pinned))
              .map(n => (
                <View key={n.id} style={styles.noteItem}>
                  <TouchableOpacity
                    style={styles.pinButton}
                    onPress={() => togglePin(n.id)}
                  >
                    <Ionicons
                      name={n.pinned ? 'star' : 'star-outline'}
                      size={20}
                      color="#ffd700"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={{ flex: 1 }} onPress={() => editNote(n)}>
                    <Text style={[styles.noteTitle, { color: theme.text }]}>
                      {n.title || 'Untitled Note'}
                    </Text>
                    <Text numberOfLines={1} style={[styles.notePreview, { color: theme.text }]}> 
                      {n.type === 'drawing' ? 'Drawing' : stripHtml(n.content)}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            <View style={styles.addNoteRow}>
              <TouchableOpacity
                style={[
                  styles.addNoteButton,
                  { backgroundColor: activeSubject.color, marginRight: 4 },
                ]}
                onPress={startNewNote}
              >
                <Ionicons name="pencil" size={24} color="#fff" />
                <Text style={styles.addNoteText}>Text</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.addNoteButton,
                  { backgroundColor: activeSubject.color, marginLeft: 4 },
                ]}
                onPress={startNewDrawing}
              >
                <Ionicons name="brush" size={24} color="#fff" />
                <Text style={styles.addNoteText}>Drawing</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      {activeSubject && editingNote && editingNote.type === 'text' && (
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
            <RichEditor
              ref={richText}
              initialContentHTML={draftContent}
              onChange={setDraftContent}
              placeholder="Start writing..."
              editorStyle={{ color: textColor }}
              style={[styles.richEditor, { borderColor: activeSubject.color }]}
            />
            <RichToolbar
              editor={richText}
              actions={[actions.setBold, actions.setItalic, actions.insertBulletsList]}
              style={[styles.richToolbar, { borderColor: activeSubject.color }]}
              iconTint={activeSubject.color}
            />
            <View style={styles.colorOptions}>
              {['#000000', '#ff0000', '#0000ff', '#008000'].map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorSwatch,
                    {
                      backgroundColor: color,
                      borderColor: color === textColor ? theme.text : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    richText.current?.setForeColor(color);
                    setTextColor(color);
                  }}
                />
              ))}
            </View>
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

      {activeSubject && editingNote && editingNote.type === 'drawing' && (
        <View style={{ flex: 1 }}>
          <View style={[styles.subjectHeader, { backgroundColor: activeSubject.color }]}>
            <TouchableOpacity onPress={cancelEdit}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.subjectHeaderTitle}>
              {editingNote.title ? 'Edit Drawing' : 'New Drawing'}
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
            <TouchableOpacity
              style={[styles.drawingWrapper, { borderColor: activeSubject.color }]}
              onPress={() => setDrawingModalVisible(true)}
              activeOpacity={0.8}
            >
              <DrawingCanvas
                elements={drawingElements}
                editable={false}
                canvasSize={300}
              />
            </TouchableOpacity>
          </ScrollView>
          <DrawingBoardModal
            visible={drawingModalVisible}
            onClose={() => setDrawingModalVisible(false)}
            elements={drawingElements}
            setElements={setDrawingElements}
          />
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

      <Modal
        visible={subjectModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSubjectModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setSubjectModalVisible(false)}
          activeOpacity={1}
        >
          <View style={[styles.settingsContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.settingsTitle, { color: theme.text }]}>
              {editingSubjectInfo ? 'Edit Subject' : 'Add Subject'}
            </Text>
            <TextInput
              value={subjectName}
              onChangeText={setSubjectName}
              placeholder="Subject Name"
              placeholderTextColor={theme.text}
              style={[styles.input, { color: theme.text, borderColor: theme.text }]}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.bottomButton, { backgroundColor: theme.tint }]}
                onPress={saveSubjectInfo}
              >
                <Ionicons name="checkmark" size={24} color="#fff" />
                <Text style={styles.bottomButtonText}>Save</Text>
              </TouchableOpacity>
              {editingSubjectInfo && (
                <TouchableOpacity
                  style={[styles.bottomButton, { backgroundColor: 'red' }]}
                  onPress={deleteSubjectInfo}
                >
                  <Ionicons name="trash" size={24} color="#fff" />
                  <Text style={styles.bottomButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={trashVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTrashVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setTrashVisible(false)}
          activeOpacity={1}
        >
          <View style={[styles.settingsContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.settingsTitle, { color: theme.text }]}>Trash</Text>
            <ScrollView>
              {deletedSubjects.map(item => (
                <View key={item.subject.key} style={styles.trashItem}>
                  <Text style={[styles.settingText, { color: theme.text }]}>
                    {item.subject.title}
                  </Text>
                  <View style={styles.trashActions}>
                    <TouchableOpacity
                      onPress={() => restoreSubject(item)}
                      style={{ marginRight: 8 }}
                    >
                      <Ionicons name="refresh" size={20} color={theme.tint} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => permanentlyDeleteSubject(item.subject.key)}
                    >
                      <Ionicons name="trash" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              {deletedNotes.map(item => (
                <View key={item.note.id} style={styles.trashItem}>
                  <Text style={[styles.settingText, { color: theme.text }]}>
                    {item.note.title || 'Untitled Note'} ({item.subject.title})
                  </Text>
                  <View style={styles.trashActions}>
                    <TouchableOpacity
                      onPress={() => restoreNote(item)}
                      style={{ marginRight: 8 }}
                    >
                      <Ionicons name="refresh" size={20} color={theme.tint} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => permanentlyDeleteNote(item.note.id)}
                    >
                      <Ionicons name="trash" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <AIButton bottomOffset={20} />

      {/* Settings Modal */}
      <Modal
        visible={settingsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setSettingsVisible(false)}
          activeOpacity={1}
        >
          <View style={[styles.settingsContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.settingsTitle, { color: theme.text }]}>Settings</Text>
            <View style={styles.settingRow}>
              <Text style={[styles.settingText, { color: theme.text }]}>Light Mode</Text>
              <Switch
                value={colorScheme === 'light'}
                onValueChange={toggleColorScheme}
              />
            </View>
            <Text style={[styles.settingPlaceholder, { color: theme.text }]}>
              More customization options coming soon...
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>
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
  subjectWrapper: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  subjectBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteSubjectButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 2,
    zIndex: 1,
  },
  addSubjectBox: {
    backgroundColor: 'rgba(128,128,128,0.5)',
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
  },
  noteList: {
    padding: 16,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notePreview: {},
  addNoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  addNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
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
  richEditor: {
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 200,
    marginBottom: 12,
  },
  richToolbar: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  drawingWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    height: 300,
    overflow: 'hidden',
    marginBottom: 12,
  },
  colorOptions: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 2,
  },
  pinButton: {
    marginRight: 8,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: 16,
    marginBottom: 80,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsContent: {
    padding: 20,
    borderRadius: 12,
    width: '80%',
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingText: {
    fontSize: 16,
  },
  settingPlaceholder: {
    fontSize: 14,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 8,
  },
  trashItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trashActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

