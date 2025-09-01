import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import RenderHTML from 'react-native-render-html';
import { useLocalSearchParams } from 'expo-router';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
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
};

type Subject = SubjectInfo & {
  notes: Note[];
  info?: string;
};

type TrashNote = Note & { subjectKey: string; subjectTitle: string };

type GridSubject = Subject | { key: string; empty: true };

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
  const [gridOrder, setGridOrder] = useState<(string | null)[]>(() => [
    ...initialSubjects.map(s => s.key),
    null,
  ]);
  const [active, setActive] = useState<Subject | null>(null);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [showSubjectColors, setShowSubjectColors] = useState(false);
  const [showNoteColors, setShowNoteColors] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [addSubjectModalVisible, setAddSubjectModalVisible] = useState(false);
  const [newSubjectTitle, setNewSubjectTitle] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState(colorOptions[0]);
  const [deletedSubjects, setDeletedSubjects] = useState<Subject[]>([]);
  const [deletedNotes, setDeletedNotes] = useState<TrashNote[]>([]);
  const [trashModalVisible, setTrashModalVisible] = useState(false);
  const styles = useMemo(() => createStyles(), []);
  const textColor = '#fff';
  const iconColor = textColor;
  const richText = useRef<RichEditor>(null);
  const { width } = useWindowDimensions();
  const { subject: subjectParam } = useLocalSearchParams<{ subject?: string }>();

  const gridData = useMemo<GridSubject[]>(
    () =>
      gridOrder.map((key, idx) => {
        const subject = subjects.find(s => s.key === key);
        return subject ? subject : { key: `empty-${idx}`, empty: true };
      }),
    [gridOrder, subjects],
  );

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

  const deleteSubject = (key: string) => {
    const subjectToDelete = subjects.find(s => s.key === key);
    if (!subjectToDelete) return;
    setSubjects(prev => prev.filter(s => s.key !== key));
    setGridOrder(prev => {
      const next = prev.map(k => (k === key ? null : k));
      return next.includes(null) ? next : [...next, null];
    });
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
  };

  const confirmDeleteSubject = (key: string) => {
    Alert.alert('Delete Subject', 'Are you sure you want to delete this subject?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteSubject(key) },
    ]);
  };

  const restoreSubject = (key: string) => {
    const subject = deletedSubjects.find(s => s.key === key);
    if (!subject) return;
    setDeletedSubjects(prev => prev.filter(s => s.key !== key));
    setDeletedNotes(prev => prev.filter(n => n.subjectKey !== key));
    setSubjects(prev => [...prev, subject]);
    setGridOrder(prev => {
      const emptyIndex = prev.findIndex(k => k === null);
      const next = [...prev];
      if (emptyIndex !== -1) {
        next[emptyIndex] = subject.key;
      } else {
        next.push(subject.key);
      }
      if (!next.includes(null)) next.push(null);
      return next;
    });
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

  const fetchSubjectInfo = async (title: string) => {
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      );
      if (res.ok) {
        const data = await res.json();
        return data.extract as string;
      }
    } catch {
      return null;
    }
    return null;
  };

  const handleAddSubject = async () => {
    if (!newSubjectTitle.trim()) return;
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
    setGridOrder(prev => {
      const emptyIndex = prev.findIndex(k => k === null);
      const next = [...prev];
      if (emptyIndex !== -1) {
        next[emptyIndex] = newSubject.key;
      } else {
        next.push(newSubject.key);
      }
      if (!next.includes(null)) next.push(null);
      return next;
    });
    setAddSubjectModalVisible(false);
    setNewSubjectTitle('');
    setNewSubjectColor(colorOptions[0]);
    if (!info) {
      Alert.alert('No info found', 'Could not find information on this subject online.');
    }
  };

  useEffect(() => {
    if (typeof subjectParam === 'string') {
      const match = subjects.find(s => s.key === subjectParam);
      if (match) {
        setActive(match);
      }
    }
  }, [subjectParam, subjects]);

  const SubjectGridItem = ({
    item,
    drag,
    isActive,
  }: RenderItemParams<GridSubject>) => {
    const shake = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      if (isActive) {
        const anim = Animated.loop(
          Animated.sequence([
            Animated.timing(shake, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(shake, {
              toValue: -1,
              duration: 100,
              useNativeDriver: true,
            }),
          ]),
        );
        anim.start();
        return () => anim.stop();
      }
      shake.stopAnimation();
      shake.setValue(0);
      return undefined;
    }, [isActive, shake]);

    const animatedStyle = {
      transform: [
        {
          rotate: shake.interpolate({
            inputRange: [-1, 1],
            outputRange: ['-3deg', '3deg'],
          }),
        },
        { scale: isActive ? 1.05 : 1 },
      ],
    } as const;

    if ('empty' in item) {
      return (
        <View style={[styles.box, styles.emptyBox]}>
          <TouchableOpacity
            style={styles.boxContent}
            onPress={() => setAddSubjectModalVisible(true)}
          >
            <Ionicons name="add" size={32} color={iconColor} />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScaleDecorator>
        <Animated.View style={[styles.box, { backgroundColor: item.color }, animatedStyle]}>
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
        </Animated.View>
      </ScaleDecorator>
    );
  };

  const NoteItem = ({
    item,
    drag,
    isActive,
  }: RenderItemParams<Note>) => {
    const shake = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      if (isActive) {
        const anim = Animated.loop(
          Animated.sequence([
            Animated.timing(shake, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(shake, {
              toValue: -1,
              duration: 100,
              useNativeDriver: true,
            }),
          ]),
        );
        anim.start();
        return () => anim.stop();
      }
      shake.stopAnimation();
      shake.setValue(0);
      return undefined;
    }, [isActive, shake]);

    const animatedStyle = {
      transform: [
        {
          rotate: shake.interpolate({
            inputRange: [-1, 1],
            outputRange: ['-3deg', '3deg'],
          }),
        },
        { scale: isActive ? 1.05 : 1 },
      ],
    } as const;

    return (
      <ScaleDecorator>
        <Animated.View
          style={[styles.noteCard, { backgroundColor: item.color }, animatedStyle]}
        >
          <TouchableOpacity
            style={styles.noteBody}
            onPress={() => openNote(item)}
            onLongPress={drag}
            disabled={isActive}
          >
            <Text style={styles.noteTitle}>{item.title}</Text>
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
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteIcon}
            onPress={() => confirmDeleteNote(item.id)}
          >
            <Ionicons name="trash" size={20} color={iconColor} />
          </TouchableOpacity>
        </Animated.View>
      </ScaleDecorator>
    );
  };

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
        <DraggableFlatList
          data={gridData}
          keyExtractor={item => item.key}
          onDragEnd={({ from, to }) => {
            setGridOrder(prev => {
              const next = [...prev];
              const moved = next[from];
              next[from] = null;
              if (next[to] === null) {
                next[to] = moved;
              } else {
                const emptyIndex = next.findIndex(k => k === null);
                if (emptyIndex !== -1) {
                  next[emptyIndex] = next[to];
                }
                next[to] = moved;
              }
              if (!next.includes(null)) next.push(null);
              return next;
            });
          }}
          renderItem={SubjectGridItem}
          contentContainerStyle={styles.grid}
          numColumns={2}
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
            <DraggableFlatList
              data={active.notes}
              keyExtractor={item => item.id}
              onDragEnd={({ data }) => {
                setActive(prev =>
                  prev && prev.key === active.key ? { ...prev, notes: data } : prev,
                );
                setSubjects(prev =>
                  prev.map(s => (s.key === active.key ? { ...s, notes: data } : s)),
                );
              }}
              renderItem={NoteItem}
              ListHeaderComponent={
                showSubjectColors ? (
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
                ) : null
              }
              ListFooterComponent={
                <TouchableOpacity style={styles.addButton} onPress={() => openNote()}>
                  <Ionicons name="add" size={20} color={iconColor} />
                  <Text style={styles.addButtonText}>Add Note</Text>
                </TouchableOpacity>
              }
              contentContainerStyle={styles.modalContent}
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
                actions={[actions.setItalic, actions.setUnderline]}
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
      flexDirection: 'row',
      flexWrap: 'wrap',
      borderWidth: 1,
      borderColor: inputBorder,
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
      width: '50%',
      borderWidth: 1,
      borderColor: inputBorder,
      padding: 16,
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
    emptyBox: {
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

