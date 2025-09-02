import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import RenderHTML from 'react-native-render-html';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import AIButton from '../../components/AIButton';
import { subjectData, SubjectInfo } from '@/constants/subjects';

type Note = {
  id: string;
  title: string;
  text: string;
  color: string;
  date: string;
  images?: string[];
  pinned?: boolean;
};

type Subject = SubjectInfo & {
  notes: Note[];
  info?: string;
};

type TrashNote = Note & { subjectKey: string; subjectTitle: string };

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

const initialSubjects: Subject[] = subjectData.map(s => ({ ...s, notes: [] }));

export default function NotesScreen() {
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [active, setActive] = useState<Subject | null>(null);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [showSubjectColors, setShowSubjectColors] = useState(false);
  const [showNoteColors, setShowNoteColors] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectSearch, setSubjectSearch] = useState('');
  const [addSubjectModalVisible, setAddSubjectModalVisible] = useState(false);
  const [newSubjectTitle, setNewSubjectTitle] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState(colorOptions[0]);
  const [deletedSubjects, setDeletedSubjects] = useState<Subject[]>([]);
  const [deletedNotes, setDeletedNotes] = useState<TrashNote[]>([]);
  const [trashModalVisible, setTrashModalVisible] = useState(false);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [subjectError, setSubjectError] = useState<string | null>(null);
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);
  const styles = useMemo(() => createStyles(), []);
  const textColor = '#fff';
  const iconColor = textColor;
  const richText = useRef<RichEditor>(null);
  const { width } = useWindowDimensions();
  const { subject: subjectParam } = useLocalSearchParams<{ subject?: string }>();
  const router = useRouter();

  const stripHtml = (html: string) => html.replace(/<[^>]+>/g, '');
  const filteredNotes = useMemo(
    () =>
      subjects
        .flatMap(s =>
          s.notes
            .filter(n => {
              const q = searchQuery.toLowerCase();
              return (
                n.title.toLowerCase().includes(q) ||
                stripHtml(n.text).toLowerCase().includes(q)
              );
            })
            .map(n => ({ subject: s, note: n })),
        )
        .sort((a, b) => Number(b.note.pinned) - Number(a.note.pinned)),
    [subjects, searchQuery],
  );

  const filteredSubjectNotes = useMemo(
    () =>
      active
        ? active.notes
            .filter(n => {
              const q = subjectSearch.toLowerCase();
              return (
                n.title.toLowerCase().includes(q) ||
                stripHtml(n.text).toLowerCase().includes(q)
              );
            })
            .sort((a, b) => Number(b.pinned) - Number(a.pinned))
        : [],
    [active, subjectSearch],
  );

  // Debounced handler to avoid rapid double navigation when a subject is pressed
  const openingRef = useRef(false);
  const openSubject = useCallback(
    async (subject: Subject) => {
      if (openingRef.current) return; // ignore rapid double taps
      openingRef.current = true;
      setSubjectError(null);
      setSubjectLoading(true);
      try {
        // ensure we always pass a fresh reference and update route params
        setActive(prev => (prev?.key === subject.key ? prev : subject));
        router.setParams({ subject: subject.key });
      } catch {
        setSubjectError('Failed to load subject');
      } finally {
        setShowSubjectColors(false);
        setSubjectLoading(false);
        openingRef.current = false;
      }
    },
    [router],
  );

  const closeSubject = useCallback(() => {
    router.setParams({ subject: undefined });
    setActive(null);
    setShowSubjectColors(false);
  }, [router]);

  const openNote = (note?: Note) => {
    if (note) {
      setCurrentNote({
        ...note,
        images: note.images || [],
        pinned: note.pinned ?? false,
      });
    } else {
      setCurrentNote({
        id: Date.now().toString(),
        title: '',
        text: '',
        color: active?.color || colorOptions[0],
        date: new Date().toLocaleDateString(),
        images: [],
        pinned: false,
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

  const togglePinNote = (id: string) => {
    if (!active) return;
    setSubjects(prev =>
      prev.map(s =>
        s.key === active.key
          ? {
              ...s,
              notes: s.notes.map(n =>
                n.id === id ? { ...n, pinned: !n.pinned } : n,
              ),
            }
          : s,
      ),
    );
    setActive(prev =>
      prev && prev.key === active.key
        ? {
            ...prev,
            notes: prev.notes.map(n =>
              n.id === id ? { ...n, pinned: !n.pinned } : n,
            ),
          }
        : prev,
    );
  };

  const deleteNote = (id: string) => {
    if (!active) return;
    const noteToDelete = active.notes.find(n => n.id === id);
    if (!noteToDelete) return;
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
    setDeletedNotes(prev => [
      ...prev,
      {
        ...noteToDelete,
        images: noteToDelete.images || [],
        subjectKey: active.key,
        subjectTitle: active.title,
      },
    ]);
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

  const deleteSubject = useCallback(
    (key: string) => {
      const subjectToDelete = subjects.find(s => s.key === key);
      if (!subjectToDelete) return;
      setSubjects(prev => prev.filter(s => s.key !== key));
      setDeletedSubjects(prev => [...prev, subjectToDelete]);
      setDeletedNotes(prev => [
        ...prev,
        ...subjectToDelete.notes.map(n => ({
          ...n,
          images: n.images || [],
          subjectKey: subjectToDelete.key,
          subjectTitle: subjectToDelete.title,
        })),
      ]);
      if (active?.key === key) {
        setActive(null);
      }
    },
    [subjects, active],
  );

  const confirmDeleteSubject = useCallback(
    (key: string) => {
      Alert.alert('Delete Subject', 'Are you sure you want to delete this subject?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteSubject(key) },
      ]);
    },
    [deleteSubject],
  );

  const restoreSubject = (key: string) => {
    const subject = deletedSubjects.find(s => s.key === key);
    if (!subject) return;
    setDeletedSubjects(prev => prev.filter(s => s.key !== key));
    setDeletedNotes(prev => prev.filter(n => n.subjectKey !== key));
    setSubjects(prev => [...prev, subject]);
  };

  const restoreNote = (id: string) => {
    const note = deletedNotes.find(n => n.id === id);
    if (!note) return;
    const subjectExists = subjects.find(s => s.key === note.subjectKey);
    if (!subjectExists) return;
    const { subjectKey, subjectTitle, images: restoredImages, ...rest } = note;
    setSubjects(prev =>
      prev.map(s =>
        s.key === subjectKey
          ? { ...s, notes: [...s.notes, { ...rest, images: restoredImages || [] }] }
          : s,
      ),
    );
    setDeletedNotes(prev => prev.filter(n => n.id !== id));
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
      images: currentNote.images?.filter((_, i) => i !== index) || [],
    });
  };

  const changeSubjectColor = (color: string) => {
    if (!active) return;
    setSubjects(prev => prev.map(s => (s.key === active.key ? { ...s, color } : s)));
    setActive(prev => (prev && prev.key === active.key ? { ...prev, color } : prev));
  };

  const renderSubjectItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Subject>) => {
      if (item.key === 'add-subject') {
        return (
          <TouchableOpacity
            style={[styles.box, styles.addBox]}
            onPress={() => setAddSubjectModalVisible(true)}
          >
            <Ionicons name="add" size={32} color={iconColor} />
            <Text style={styles.boxTitle}>ADD</Text>
          </TouchableOpacity>
        );
      }
      return (
        <View style={[styles.box, { backgroundColor: item.color }]}> 
          <TouchableOpacity
            style={styles.subjectDeleteIcon}
            onPress={() => confirmDeleteSubject(item.key)}
          >
            <Ionicons name="close" size={16} color={iconColor} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.boxContent}
            onLongPress={drag}
            disabled={isActive}
            onPress={() => openSubject(item)}
          >
            <Ionicons name={item.icon} size={32} color={iconColor} />
            <Text style={styles.boxTitle}>{item.title}</Text>
            {item.notes.length > 0 && (
              <Text style={styles.boxNote}>{item.notes.length} notes</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    },
    [confirmDeleteSubject, openSubject, iconColor, styles],
  );

  const renderNoteCard = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={[styles.noteCard, { backgroundColor: item.color }]}
      onPress={() => openNote(item)}
    >
      <View style={styles.noteCardHeader}>
        <Text style={styles.noteTitle}>{item.title}</Text>
        <TouchableOpacity onPress={() => togglePinNote(item.id)}>
          <Ionicons
            name={item.pinned ? 'star' : 'star-outline'}
            size={20}
            color={iconColor}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.noteDate}>{item.date}</Text>
      <RenderHTML
        contentWidth={width}
        source={{ html: item.text }}
        baseStyle={styles.noteText}
        defaultTextProps={{ numberOfLines: 3, ellipsizeMode: 'tail' }}
      />
      {item.images?.length ? (
        item.images.length === 1 ? (
          <Image
            source={{ uri: item.images[0] }}
            style={styles.noteImage}
            contentFit="contain"
          />
        ) : (
          <View style={styles.imageIconContainer}>
            <Ionicons name="images" size={20} color={iconColor} />
          </View>
        )
      ) : null}
      <TouchableOpacity
        style={styles.noteDelete}
        onPress={() => confirmDeleteNote(item.id)}
      >
        <Ionicons name="trash" size={20} color={iconColor} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const fetchSubjectInfo = async (title: string) => {
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      );
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      return data.extract as string;
    } catch {
      return null;
    }
  };

  const handleAddSubject = async () => {
    if (!newSubjectTitle.trim()) return;
    setInfoError(null);
    setInfoLoading(true);
    try {
      const key =
        newSubjectTitle.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString();
      const info = await fetchSubjectInfo(newSubjectTitle.trim());
      const newSubject: Subject = {
        key,
        title: newSubjectTitle.trim(),
        icon: 'book',
        color: newSubjectColor,
        notes: [],
        ...(info ? { info } : {}),
      };
      setSubjects(prev => [...prev, newSubject]);
      setAddSubjectModalVisible(false);
      setNewSubjectTitle('');
      setNewSubjectColor(colorOptions[0]);
      if (!info) {
        setInfoError('No info found for this subject.');
      }
    } catch {
      setInfoError('Failed to fetch subject information');
    } finally {
      setInfoLoading(false);
    }
  };

  useEffect(() => {
    if (typeof subjectParam === 'string') {
      const match = subjects.find(s => s.key === subjectParam);
      if (match && match.key !== active?.key) {
        setActive(match);
      }
    }
  }, [subjectParam, subjects, active]);

  const subjectsWithAdd = useMemo(
    () => [...subjects, { key: 'add-subject' } as Subject],
    [subjects],
  );

  return (
    <LinearGradient
      colors={['#2e1065', '#000000']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>NOTES</Text>
        <TouchableOpacity
          style={styles.trashIcon}
          onPress={() => setTrashModalVisible(true)}
        >
          <Ionicons name="trash" size={24} color={iconColor} />
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.searchInput}
        placeholder="Search notes..."
        placeholderTextColor="#aaa"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {subjectError && <Text style={styles.errorText}>{subjectError}</Text>}
      {subjectLoading && (
        <ActivityIndicator size="small" color="#fff" style={styles.loading} />
      )}
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
              <Text style={styles.noteTitle}>
                {note.title}
                {note.pinned ? ' \u2605' : ''}
              </Text>
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
        <DraggableFlatList
          data={subjectsWithAdd}
          keyExtractor={item => item.key}
          onDragEnd={({ data }) =>
            setSubjects(data.filter(s => s.key !== 'add-subject'))
          }
          renderItem={renderSubjectItem}
          contentContainerStyle={styles.grid}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
        />
      )}
      <AIButton />

      <Modal visible={trashModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Trash</Text>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {deletedSubjects.length > 0 && (
              <>
                <Text style={styles.sectionHeader}>Subjects</Text>
                {deletedSubjects.map(s => (
                  <View
                    key={s.key}
                    style={[styles.trashCard, { backgroundColor: s.color }]}
                  >
                    <Text style={styles.noteTitle}>{s.title}</Text>
                    <TouchableOpacity
                      style={styles.restoreButton}
                      onPress={() => restoreSubject(s.key)}
                    >
                      <Text style={styles.saveButtonText}>Restore</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}
            {deletedNotes.length > 0 && (
              <>
                <Text style={styles.sectionHeader}>Notes</Text>
                {deletedNotes.map(n => (
                  <View
                    key={n.id}
                    style={[styles.trashCard, { backgroundColor: n.color }]}
                  >
                    <Text style={styles.noteTitle}>{n.title}</Text>
                    <Text style={styles.noteDate}>{n.subjectTitle}</Text>
                    <TouchableOpacity
                      style={styles.restoreButton}
                      onPress={() => restoreNote(n.id)}
                    >
                      <Text style={styles.saveButtonText}>Restore</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}
            {!deletedSubjects.length && !deletedNotes.length && (
              <Text style={styles.noteDate}>Trash is empty</Text>
            )}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setTrashModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={addSubjectModalVisible} animationType="slide">
        <View style={styles.addSubjectContainer}>
          <Text style={styles.modalTitle}>Add Subject</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Subject Name"
            placeholderTextColor="#aaa"
            value={newSubjectTitle}
            onChangeText={setNewSubjectTitle}
          />
          <View style={styles.colorRow}>
            {colorOptions.map(c => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: c },
                  newSubjectColor === c && styles.selectedSwatch,
                ]}
                onPress={() => setNewSubjectColor(c)}
              />
            ))}
          </View>
          {infoError && <Text style={styles.errorText}>{infoError}</Text>}
          {infoLoading && (
            <ActivityIndicator size="small" color="#fff" style={styles.loading} />
          )}
          <View style={styles.noteModalButtons}>
            <TouchableOpacity style={styles.saveButton} onPress={handleAddSubject}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setAddSubjectModalVisible(false)}
            >
              <Text style={styles.saveButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
            <FlatList
              data={filteredSubjectNotes}
              keyExtractor={n => n.id}
              renderItem={renderNoteCard}
              contentContainerStyle={styles.modalContent}
              ListHeaderComponent={
                <View>
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
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search notes..."
                    placeholderTextColor="#aaa"
                    value={subjectSearch}
                    onChangeText={setSubjectSearch}
                  />
                </View>
              }
              ListFooterComponent={
                <TouchableOpacity style={styles.addButton} onPress={() => openNote()}>
                  <Ionicons name="add" size={20} color={iconColor} />
                  <Text style={styles.addButtonText}>Add Note</Text>
                </TouchableOpacity>
              }
            />
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
                placeholderTextColor="#aaa"
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
                actions={[
                  actions.setBold,
                  actions.setItalic,
                  actions.setUnderline,
                  actions.insertBulletsList,
                  actions.insertOrderedList,
                  actions.checkboxList,
                ]}
                iconTint={iconColor}
                selectedIconTint={iconColor}
                style={styles.formatBar}
              />
              {currentNote.images?.map((img, idx) => (
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
                  style={styles.pinButton}
                  onPress={() =>
                    setCurrentNote({ ...currentNote, pinned: !currentNote.pinned })
                  }
                >
                  <Text style={styles.saveButtonText}>
                    {currentNote.pinned ? 'Unpin' : 'Pin'}
                  </Text>
                </TouchableOpacity>
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
            <AIButton bottomOffset={20} size={40} align="right" />
          </View>
        )}
      </Modal>
    </LinearGradient>
  );
}

const createStyles = () => {
  const textColor = '#fff';
  const secondaryText = '#ddd';
  const background = '#1a1a40';
  const toggleBg = '#2e1065';
  const inputBorder = '#444';
  const selectedBorder = '#fff';
  const cancelBg = '#333';
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      paddingTop: 40,
    },
    header: {
      position: 'relative',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      color: textColor,
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    trashIcon: {
      position: 'absolute',
      right: 0,
      top: 0,
      padding: 4,
    },
    grid: {
      paddingBottom: 16,
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
    errorText: {
      color: '#ff6b6b',
      textAlign: 'center',
      marginBottom: 8,
    },
    loading: {
      marginBottom: 8,
    },
    box: {
      width: '48%',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      alignItems: 'center',
      position: 'relative',
    },
    boxContent: {
      alignItems: 'center',
    },
    subjectDeleteIcon: {
      position: 'absolute',
      top: 4,
      right: 4,
      padding: 4,
    },
    addBox: {
      borderWidth: 1,
      borderColor: inputBorder,
      backgroundColor: 'transparent',
      justifyContent: 'center',
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
    sectionHeader: {
      color: textColor,
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 16,
      marginBottom: 8,
    },
    trashCard: {
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
    },
    restoreButton: {
      marginTop: 8,
      backgroundColor: '#28a745',
      padding: 8,
      borderRadius: 8,
      alignItems: 'center',
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
      position: 'relative',
    },
    searchCard: {
      borderRadius: 8,
      marginBottom: 12,
      padding: 12,
    },
    noteCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
    noteDelete: {
      position: 'absolute',
      top: 8,
      right: 8,
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
    addSubjectContainer: {
      flex: 1,
      backgroundColor: background,
      paddingTop: 32,
      padding: 16,
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
    pinButton: {
      backgroundColor: '#ffc107',
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

