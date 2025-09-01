import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';

// Representation of a single note
export type Note = {
  id: string;
  title: string;
  content: string;
  color: string;
};

const COLOR_OPTIONS = [
  '#f87171',
  '#fbbf24',
  '#34d399',
  '#60a5fa',
  '#a78bfa',
  '#f472b6',
];

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [noteColor, setNoteColor] = useState(COLOR_OPTIONS[0]);
  const richText = useRef<RichEditor>(null);

  // Open modal for creating a new note
  const openNewNote = () => {
    setEditingNote(null);
    setTitle('');
    setNoteColor(COLOR_OPTIONS[0]);
    setEditorVisible(true);
    setTimeout(() => richText.current?.setContentHTML(''), 0);
  };

  // Open modal for editing an existing note
  const openEditNote = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setNoteColor(note.color);
    setEditorVisible(true);
    setTimeout(() => richText.current?.setContentHTML(note.content), 0);
  };

  // Save the current note
  const saveNote = async () => {
    const content = await richText.current?.getContentHtml();
    if (!content) return;

    if (editingNote) {
      setNotes(prev =>
        prev.map(n =>
          n.id === editingNote.id ? { ...n, title, content, color: noteColor } : n,
        ),
      );
    } else {
      setNotes(prev => [
        ...prev,
        { id: Date.now().toString(), title, content, color: noteColor },
      ]);
    }
    setEditorVisible(false);
  };

  // Delete an existing note
  const deleteNote = () => {
    if (editingNote) {
      setNotes(prev => prev.filter(n => n.id !== editingNote.id));
      setEditorVisible(false);
    }
  };

  const renderItem = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={[styles.noteCard, { borderLeftColor: item.color }]}
      onPress={() => openEditNote(item)}
    >
      <Text style={styles.noteTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        keyExtractor={n => n.id}
        renderItem={renderItem}
        contentContainerStyle={notes.length ? undefined : styles.emptyContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No notes yet</Text>}
      />

      <TouchableOpacity style={styles.addButton} onPress={openNewNote}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={editorVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            style={[styles.titleInput, { borderColor: noteColor }]}
            placeholder="Title"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
          <RichEditor
            ref={richText}
            style={styles.editor}
            placeholder="Write your note here"
          />
          <RichToolbar
            editor={richText}
            actions={[
              actions.setBold,
              actions.setItalic,
              actions.setUnderline,
              actions.insertOrderedList,
              actions.insertBulletsList,
              actions.insertLink,
            ]}
            iconTint="#fff"
            style={styles.toolbar}
          />

          <View style={styles.colorRow}>
            {COLOR_OPTIONS.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color },
                  noteColor === color && styles.colorSelected,
                ]}
                onPress={() => {
                  setNoteColor(color);
                  richText.current?.setForeColor(color);
                }}
              />
            ))}
          </View>

          <View style={styles.modalButtons}>
            {editingNote && (
              <TouchableOpacity style={styles.deleteButton} onPress={deleteNote}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditorVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  noteCard: {
    backgroundColor: '#2a2a2a',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 8,
  },
  noteTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#6a0dad',
    borderRadius: 24,
    padding: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 16,
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    color: '#fff',
    marginBottom: 12,
  },
  editor: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    padding: 8,
  },
  toolbar: {
    backgroundColor: '#2a2a2a',
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  colorSelected: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  saveButton: {
    backgroundColor: '#6a0dad',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#555',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

