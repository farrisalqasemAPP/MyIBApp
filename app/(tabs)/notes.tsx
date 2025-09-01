import React, {
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  RichEditor,
  RichToolbar,
  actions,
} from 'react-native-pell-rich-editor';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';

type Attachment = {
  id: string;
  uri: string;
  type: string;
};

type Version = {
  content: string;
  updatedAt: number;
};

type Note = {
  id: string;
  title: string;
  content: string;
  subject: string;
  attachments: Attachment[];
  updatedAt: number;
  history: Version[];
};

const NOTES_FILE = `${FileSystem.documentDirectory}notes.json`;

const GRADIENT_COLORS = ['#4b1e7e', '#00081f'];

// Simple utility to strip HTML tags for previews/search.
const stripHtml = (html: string) => html.replace(/<[^>]+>/g, '');

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [query, setQuery] = useState('');
  const [current, setCurrent] = useState<Note | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<string | null>(null);
  const [addingSubject, setAddingSubject] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [results, setResults] = useState<Note[]>([]);
  const editorRef = useRef<RichEditor>(null);
  const [subjects, setSubjects] = useState<string[]>([
    'Math',
    'English',
    'Science',
    'History',
    'Art',
  ]);
  const colorChoices = [
    '#7c3aed',
    '#2563eb',
    '#16a34a',
    '#dc2626',
    '#f59e0b',
    '#4b5563',
    '#d946ef',
    '#0ea5e9',
    '#f97316',
    '#84cc16',
  ];
  const defaultColors: Record<string, string> = {
    Math: '#7c3aed',
    English: '#2563eb',
    Science: '#16a34a',
    History: '#dc2626',
    Art: '#f59e0b',
  };
  const [subjectColors, setSubjectColors] = useState<Record<string, string>>(defaultColors);
  const [colorMenuSubject, setColorMenuSubject] = useState<string | null>(null);

  const selectColor = (subject: string, color: string) => {
    setSubjectColors(prev => ({ ...prev, [subject]: color }));
    setColorMenuSubject(null);
  };

  const performSearch = () => {
    const q = query.toLowerCase();
    const res = notes.filter(
      n =>
        n.title.toLowerCase().includes(q) ||
        stripHtml(n.content).toLowerCase().includes(q),
    );
    setResults(res);
    setSearchMode(true);
  };

  // Load notes from the local filesystem on mount.
  useEffect(() => {
    const load = async () => {
      try {
        const info = await FileSystem.getInfoAsync(NOTES_FILE);
        if (info.exists) {
          const data = await FileSystem.readAsStringAsync(NOTES_FILE);
          setNotes(JSON.parse(data));
        }
      } catch (e) {
        console.warn('Failed to load notes', e);
      }
    };
    load();
  }, []);

  // Persist notes whenever they change.
  useEffect(() => {
    FileSystem.writeAsStringAsync(NOTES_FILE, JSON.stringify(notes)).catch(
      e => console.warn('Failed to save notes', e),
    );
  }, [notes]);

  const filtered = currentSubject
    ? notes.filter(
        n =>
          n.subject === currentSubject &&
          (n.title.toLowerCase().includes(query.toLowerCase()) ||
            stripHtml(n.content).toLowerCase().includes(query.toLowerCase())),
      )
    : [];

  const openNew = () => {
    if (!currentSubject) return;
    const note: Note = {
      id: Date.now().toString(),
      title: '',
      content: '',
      subject: currentSubject,
      attachments: [],
      updatedAt: Date.now(),
      history: [],
    };
    setCurrent(note);
    setModalVisible(true);
  };

  const openEdit = (note: Note) => {
    setCurrent(note);
    setModalVisible(true);
  };

  const saveCurrent = () => {
    if (!current) return;
    setNotes(prev => {
      const existing = prev.find(n => n.id === current.id);
      if (existing) {
        return prev.map(n =>
          n.id === current.id
            ? {
                ...current,
                updatedAt: Date.now(),
                history: [
                  ...existing.history,
                  { content: existing.content, updatedAt: existing.updatedAt },
                ],
              }
            : n,
        );
      }
      return [...prev, current];
    });
    setModalVisible(false);
    setCurrent(null);
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const addImage = async () => {
    if (!current) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const attachment: Attachment = {
        id: Date.now().toString(),
        uri,
        type: 'image',
      };
      setCurrent({ ...current, attachments: [...current.attachments, attachment] });
    }
  };

  return (
    <LinearGradient colors={GRADIENT_COLORS} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.logo}>CLARITY</Text>
        <TextInput
          placeholder="Search notes"
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={performSearch}
          style={styles.search}
        />
        {searchMode ? (
          <View style={{ flex: 1 }}>
            <View style={styles.selectedHeader}>
              <TouchableOpacity
                onPress={() => {
                  setSearchMode(false);
                  setQuery('');
                }}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.selectedTitle}>Results</Text>
            </View>
            <FlatList
              data={results}
              keyExtractor={n => n.id}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.noteCard}
                  onPress={() => openEdit(item)}
                >
                  <Text style={styles.noteTitle}>{item.title || 'Untitled'}</Text>
                  <Text numberOfLines={2} style={styles.notePreview}>
                    {stripHtml(item.content)}
                  </Text>
                  <Text style={styles.resultSubject}>{item.subject}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        ) : currentSubject ? (
          <>
            <View style={styles.selectedHeader}>
              <TouchableOpacity
                onPress={() => {
                  setCurrentSubject(null);
                  setQuery('');
                }}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.selectedTitle}>{currentSubject}</Text>
            </View>
            <FlatList
              data={filtered.sort((a, b) => b.updatedAt - a.updatedAt)}
              keyExtractor={n => n.id}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.noteCard}
                  onPress={() => openEdit(item)}
                  onLongPress={() => deleteNote(item.id)}
                >
                  <Text style={styles.noteTitle}>{item.title || 'Untitled'}</Text>
                  <Text numberOfLines={2} style={styles.notePreview}>
                    {stripHtml(item.content)}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={[styles.fab, { backgroundColor: subjectColors[currentSubject!] }]}
              onPress={openNew}
            >
              <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.subjectGrid}>
            {(() => {
              const items = [...subjects, 'ADD'];
              if (items.length % 2 !== 0) items.push('PLACEHOLDER');
              return items.map(sub => {
                if (sub === 'ADD') {
                  return (
                    <TouchableOpacity
                      key="ADD"
                      style={[styles.subjectCube, styles.addCube]}
                      onPress={() => setAddingSubject(true)}
                    >
                      <Ionicons name="add" size={24} color="#fff" />
                      <Text style={styles.subjectText}>ADD</Text>
                    </TouchableOpacity>
                  );
                }
                if (sub === 'PLACEHOLDER') {
                  return <View key="placeholder" style={[styles.subjectCube, styles.placeholderCube]} />;
                }
                const count = notes.filter(n => n.subject === sub).length;
                return (
                  <TouchableOpacity
                    key={sub}
                    style={[styles.subjectCube, { backgroundColor: subjectColors[sub] }]}
                    onPress={() => {
                      setCurrentSubject(sub);
                      setQuery('');
                    }}
                  >
                    <TouchableOpacity
                      style={styles.colorIcon}
                      onPress={() =>
                        setColorMenuSubject(
                          colorMenuSubject === sub ? null : sub,
                        )
                      }
                    >
                      <Ionicons name="color-palette" size={16} color="#fff" />
                    </TouchableOpacity>
                    {colorMenuSubject === sub && (
                      <View style={styles.colorPicker}>
                        {colorChoices.map(c => (
                          <TouchableOpacity
                            key={c}
                            style={[styles.colorSwatch, { backgroundColor: c }]}
                            onPress={() => selectColor(sub, c)}
                          />
                        ))}
                      </View>
                    )}
                    <Text style={styles.subjectText}>{sub}</Text>
                    {count > 0 && (
                      <Text style={styles.noteCount}>Notes: {count}</Text>
                    )}
                  </TouchableOpacity>
                );
              });
            })()}
          </View>
        )}
        <Modal visible={modalVisible} animationType="none">
          <LinearGradient colors={GRADIENT_COLORS} style={{ flex: 1 }}>
            <SafeAreaView style={styles.modalContainer}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
              >
                <ScrollView contentContainerStyle={{ padding: 16 }}>
                  <TextInput
                    placeholder="Title"
                    style={styles.titleInput}
                    value={current?.title}
                    onChangeText={t =>
                      setCurrent(c => (c ? { ...c, title: t } : c))
                    }
                  />
                  <RichEditor
                    ref={editorRef}
                    style={styles.editor}
                    initialContentHTML={current?.content}
                    placeholder="Start writing..."
                    onChange={html =>
                      setCurrent(c => (c ? { ...c, content: html } : c))
                    }
                  />
                  <RichToolbar
                    editor={editorRef}
                    actions={[
                      actions.undo,
                      actions.redo,
                      actions.bold,
                      actions.italic,
                      actions.insertBulletsList,
                      actions.insertOrderedList,
                      actions.insertLink,
                      actions.heading1,
                    ]}
                  />
                  <View style={styles.attachments}>
                    {current?.attachments.map(att => (
                      <Image
                        key={att.id}
                        source={{ uri: att.uri }}
                        style={styles.attachmentImage}
                      />
                    ))}
                    <TouchableOpacity
                      onPress={addImage}
                      style={styles.addAttachment}
                    >
                      <Text style={{ fontSize: 32 }}>+</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
                <View style={styles.editorButtons}>
                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible(false);
                      setCurrent(null);
                    }}
                    style={styles.cancelBtn}
                  >
                    <Text style={styles.btnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={saveCurrent} style={styles.saveBtn}>
                    <Text style={styles.btnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </SafeAreaView>
          </LinearGradient>
        </Modal>
        <Modal visible={addingSubject} transparent animationType="fade">
          <View style={styles.addModal}>
            <View style={styles.addModalContent}>
              <TextInput
                placeholder="Section name"
                style={styles.titleInput}
                value={newSubject}
                onChangeText={setNewSubject}
              />
              <View style={styles.editorButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setAddingSubject(false);
                    setNewSubject('');
                  }}
                >
                  <Text style={styles.btnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={() => {
                    if (newSubject.trim()) {
                      const name = newSubject.trim();
                      setSubjects([...subjects, name]);
                      setSubjectColors(prev => ({
                        ...prev,
                        [name]: colorChoices[0],
                      }));
                    }
                    setAddingSubject(false);
                    setNewSubject('');
                  }}
                >
                  <Text style={styles.btnText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    marginTop: 16,
  },
  search: {
    margin: 16,
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  subjectCube: {
    width: '48%',
    height: 120,
    borderRadius: 12,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  placeholderCube: {
    backgroundColor: 'transparent',
  },
  addCube: {
    backgroundColor: '#4b5563',
    flexDirection: 'row',
  },
  colorIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  colorPicker: {
    position: 'absolute',
    top: 24,
    right: 0,
    backgroundColor: '#fff',
    padding: 4,
    borderRadius: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 120,
    zIndex: 10,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    margin: 4,
  },
  subjectText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noteCount: {
    color: '#fff',
    marginTop: 4,
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  selectedTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  noteCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notePreview: {
    fontSize: 14,
    color: '#555',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    lineHeight: 32,
  },
  modalContainer: {
    flex: 1,
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  editor: {
    minHeight: 200,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  attachments: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  attachmentImage: {
    width: 80,
    height: 80,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
  addAttachment: {
    width: 80,
    height: 80,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  editorButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  cancelBtn: {
    padding: 12,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  saveBtn: {
    padding: 12,
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  resultSubject: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  addModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addModalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
});

