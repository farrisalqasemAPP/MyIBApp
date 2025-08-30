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

const eventColorOptions = [
  '#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', '#E6B333',
  '#3366E6', '#999966', '#99FF99', '#B34D4D', '#80B300', '#809900',
  '#E6B3B3', '#6680B3', '#66991A', '#FF99E6', '#CCFF1A', '#FF1A66',
  '#E6331A', '#33FFCC', '#66994D', '#B366CC', '#4D8000', '#B33300',
  '#CC80CC', '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', '#4D8066',
  '#809980', '#E6FF80', '#1AFF33', '#999933', '#FF3380', '#CCCC00',
  '#66E64D', '#4D80CC', '#9900B3', '#E64D66', '#4DB380', '#FF4D4D',
  '#99E6E6', '#6666FF',
];

type Event = { text: string; color: string };

type DayData = {
  notes: string;
  events: Event[];
};

export default function ScheduleScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<Record<string, DayData>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tempNotes, setTempNotes] = useState('');
  const [currentEvents, setCurrentEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState('');
  const [newEventColor, setNewEventColor] = useState(eventColorOptions[0]);

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
    setNewEventColor(eventColorOptions[0]);
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
      setCurrentEvents(prev => [
        ...prev,
        { text: newEvent.trim(), color: newEventColor },
      ]);
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
          const dayData = date ? schedule[toKey(date)] : undefined;
          const dayColor = dayData?.events[0]?.color;
          const isToday = date && toKey(date) === toKey(new Date());
          return (
            <TouchableOpacity
              key={key}
              style={[styles.dayCell, dayColor && { backgroundColor: dayColor }]}
              onPress={() => date && openDay(date)}
              disabled={!date}
            >
              {date && isToday ? (
                <View style={styles.todayCircle}>
                  <Text style={styles.dayText}>{date.getDate()}</Text>
                </View>
              ) : (
                date && <Text style={styles.dayText}>{date.getDate()}</Text>
              )}
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
                  <View key={idx} style={styles.eventItem}>
                    <View
                      style={[styles.eventColor, { backgroundColor: ev.color }]}
                    />
                    <Text style={styles.eventText}>{ev.text}</Text>
                  </View>
                ))}
              </ScrollView>
              <TextInput
                style={styles.input}
                placeholder="New event"
                placeholderTextColor="#aaa"
                value={newEvent}
                onChangeText={setNewEvent}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.colorOptions}
              >
                {eventColorOptions.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      newEventColor === color && styles.selectedColor,
                    ]}
                    onPress={() => setNewEventColor(color)}
                  />
                ))}
              </ScrollView>
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
  container: { flex: 1, paddingTop: 60 },
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
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: '16.66%',
    margin: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    color: '#fff',
  },
  todayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  eventText: {
    color: '#fff',
  },
  colorOptions: {
    marginBottom: 12,
  },
  colorOption: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: '#fff',
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
