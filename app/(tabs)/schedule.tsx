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
import { LinearGradient } from 'expo-linear-gradient';

type DayData = {
  notes: string;
  events: string[];
};

export default function ScheduleScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<Record<string, DayData>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tempNotes, setTempNotes] = useState('');
  const [currentEvents, setCurrentEvents] = useState<string[]>([]);
  const [newEvent, setNewEvent] = useState('');

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const getMonthName = (date: Date) =>
    date.toLocaleString('default', { month: 'long' });

  const toKey = (date: Date) => date.toISOString().split('T')[0];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const openDay = (date: Date) => {
    const key = toKey(date);
    const data = schedule[key] || { notes: '', events: [] };
    setSelectedDate(date);
    setTempNotes(data.notes);
    setCurrentEvents(data.events);
    setNewEvent('');
  };

  const saveDay = () => {
    if (!selectedDate) return;
    const key = toKey(selectedDate);
    setSchedule(prev => ({
      ...prev,
      [key]: { notes: tempNotes, events: currentEvents },
    }));
    setSelectedDate(null);
  };

  const addEvent = () => {
    if (newEvent.trim()) {
      setCurrentEvents(prev => [...prev, newEvent.trim()]);
      setNewEvent('');
    }
  };

  return (
    <LinearGradient colors={["#2e1065", "#000"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentDate(new Date(year, month - 1, 1))}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{getMonthName(currentDate)} {year}</Text>
        <TouchableOpacity onPress={() => setCurrentDate(new Date(year, month + 1, 1))}>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <Text key={d} style={styles.weekDay}>{d}</Text>
        ))}
      </View>

      <View style={styles.calendar}>
        {cells.map((date, index) => {
          const key = date ? toKey(date) : index.toString();
          const hasData = date ? schedule[toKey(date)] : false;
          return (
            <TouchableOpacity
              key={key}
              style={styles.dayCell}
              onPress={() => date && openDay(date)}
              disabled={!date}
            >
              {date && <Text style={styles.dayText}>{date.getDate()}</Text>}
              {date && hasData && <View style={styles.dot} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <Modal
        visible={!!selectedDate}
        animationType="slide"
        onRequestClose={() => setSelectedDate(null)}
      >
        <View style={styles.modalContainer}>
          {selectedDate && (
            <>
              <Text style={styles.modalTitle}>{selectedDate.toDateString()}</Text>
              <TextInput
                style={styles.input}
                placeholder="Notes"
                placeholderTextColor="#aaa"
                value={tempNotes}
                onChangeText={setTempNotes}
                multiline
              />
              <ScrollView style={styles.eventsList}>
                {currentEvents.map((ev, idx) => (
                  <Text key={idx} style={styles.eventItem}>• {ev}</Text>
                ))}
              </ScrollView>
              <TextInput
                style={styles.input}
                placeholder="New event"
                placeholderTextColor="#aaa"
                value={newEvent}
                onChangeText={setNewEvent}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.saveButton} onPress={addEvent}>
                  <Text style={styles.saveButtonText}>Add Event</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={saveDay}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setSelectedDate(null)}>
                  <Text style={styles.saveButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weekDay: {
    width: '14.28%',
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    borderWidth: 0.5,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    color: '#fff',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6d28d9',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#1a1a40',
    padding: 16,
    paddingTop: 60,
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
    marginBottom: 12,
  },
  eventsList: {
    maxHeight: 120,
    marginBottom: 12,
  },
  eventItem: {
    color: '#fff',
    marginBottom: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: '#2e1065',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
  },
});
