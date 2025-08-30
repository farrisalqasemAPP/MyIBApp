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
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';

type Event = {
  id: string;
  title: string;
  date: Date;
};

export default function ScheduleScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const addEvent = () => {
    setEvents(prev => [
      ...prev,
      { id: Date.now().toString(), title: newTitle || 'Untitled', date: newDate },
    ]);
    setModalVisible(false);
    setNewTitle('');
    setNewDate(new Date());
  };

  const onChange = (_: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) setNewDate(selectedDate);
  };

  return (
    <LinearGradient colors={['#2e1065', '#000']} style={styles.container}>
      <Text style={styles.title}>SCHEDULE</Text>
      <ScrollView contentContainerStyle={styles.content}>
        {events.map(event => (
          <View key={event.id} style={styles.eventCard}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDate}>{event.date.toLocaleString()}</Text>
          </View>
        ))}
        {events.length === 0 && (
          <Text style={styles.emptyText}>No events yet.</Text>
        )}
      </ScrollView>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add Event</Text>
          <TextInput
            style={styles.input}
            placeholder="Event title"
            placeholderTextColor="#aaa"
            value={newTitle}
            onChangeText={setNewTitle}
          />
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowPicker(true)}
          >
            <Ionicons name="calendar" size={20} color="#fff" />
            <Text style={styles.dateButtonText}>
              {newDate.toLocaleString()}
            </Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={newDate}
              mode="datetime"
              display="default"
              onChange={onChange}
            />
          )}
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.saveButton} onPress={addEvent}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.saveButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 16,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  eventCard: {
    backgroundColor: '#2e1065',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventDate: {
    color: '#ddd',
    marginTop: 4,
  },
  emptyText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 32,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 40,
    backgroundColor: '#2e1065',
    borderRadius: 30,
    padding: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#1a1a40',
    paddingTop: 60,
    padding: 16,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    color: '#fff',
    marginBottom: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2e1065',
    padding: 12,
    borderRadius: 8,
  },
  dateButtonText: {
    color: '#fff',
    marginLeft: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
  },
  saveButton: {
    backgroundColor: '#2e1065',
    padding: 16,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
  },
});

