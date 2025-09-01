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
  tags: string[];
  attachments: Attachment[];
  updatedAt: number;
  history: Version[];
};

const NOTES_FILE = `${FileSystem.documentDirectory}notes.json`;

// Simple utility to strip HTML tags for previews/search.
const stripHtml = (html: string) => html.replace(/<[^>]+>/g, '');

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [query, setQuery] = useState('');
  const [current, setCurrent] = useState<Note | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const editorRef = useRef<RichEditor>(null);
  const subjects = ['Math', 'English', 'Science', 'History', 'Art', 'Other'];

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

  const filtered = notes.filter(n => {
    const q = query.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      stripHtml(n.content).toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q))
    );
  });

  const openNew = () => {
    const note: Note = {
      id: Date.now().toString(),
      title: '',
      content: '',
      tags: [],
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
    <LinearGradient colors={['#3b0d87', '#0f206c']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.logo}>CLARITY</Text>
        <TextInput
          placeholder="Search notes"
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
          style={styles.search}
        />
        <View style={styles.subjectGrid}>
          {subjects.map(sub => (
            <TouchableOpacity
              key={sub}
              style={styles.subjectCube}
              onPress={() => setQuery(sub)}
            >
              <Text style={styles.subjectText}>{sub}</Text>
            </TouchableOpacity>
          ))}
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
            <View style={styles.tagRow}>
              {item.tags.map(tag => (
                <Text key={tag} style={styles.tag}>
                  #{tag}
                </Text>
              ))}
            </View>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={openNew}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      <Modal visible={modalVisible} animationType="slide">
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
              <TextInput
                placeholder="Tags (comma separated)"
                style={styles.tagsInput}
                value={current?.tags.join(',')}
                onChangeText={t =>
                  setCurrent(c =>
                    c
                      ? {
                          ...c,
                          tags: t
                            .split(',')
                            .map(s => s.trim())
                            .filter(Boolean),
                        }
                      : c,
                  )
                }
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
    width: '30%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectText: {
    color: '#fff',
    fontWeight: 'bold',
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
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    marginRight: 8,
    color: '#6b21a8',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6b21a8',
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
    backgroundColor: '#fff',
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
  tagsInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginTop: 12,
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
    backgroundColor: '#6b21a8',
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

