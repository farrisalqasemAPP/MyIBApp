import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { SUBJECTS, THEME } from "../constants";
import { loadJSON, saveJSON } from "../utils/storage";

const STORAGE_KEY = "events:v1";
const TYPE_LABELS = { exam: "Exam", test: "Test", homework: "Homework", deadline: "Deadline" };

export default function ScheduleScreen() {
  const [selected, setSelected] = useState(dayjs().format("YYYY-MM-DD"));
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("homework");
  const [subject, setSubject] = useState("Math");

  useEffect(() => {
    loadJSON(STORAGE_KEY, []).then(setEvents);
  }, []);

  useEffect(() => {
    saveJSON(STORAGE_KEY, events);
  }, [events]);

  const dayEvents = useMemo(() => events.filter(e => e.date === selected), [events, selected]);

  const marked = useMemo(() => {
    const m = { [selected]: { selected: true, selectedColor: THEME.accent } };
    events.forEach(e => {
      // if multiple events on same date, mark with dots; otherwise keep selection
      if (!m[e.date]) m[e.date] = { marked: true, dots: [{ color: THEME.accent }] };
      else {
        // ensure dots array exists
        if (!m[e.date].dots) m[e.date].dots = [];
        m[e.date].dots.push({ color: THEME.accent });
      }
    });
    return m;
  }, [events, selected]);

  const addEvent = () => {
    if (!title.trim()) return;
    const e = { id: String(Date.now()), date: selected, title: title.trim(), type, subject };
    setEvents([e, ...events]);
    setTitle("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Schedule</Text>

      <Calendar
        onDayPress={d => setSelected(d.dateString)}
        markedDates={marked}
        theme={{
          calendarBackground: THEME.bg,
          dayTextColor: THEME.text,
          monthTextColor: THEME.accent,
          arrowColor: THEME.accent,
        }}
      />

      <View style={{ marginTop: 12, gap: 8 }}>
        <TextInput
          placeholder={`Add ${TYPE_LABELS[type]}…`}
          placeholderTextColor={THEME.muted}
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          {/* event type chips */}
          {["exam", "test", "homework", "deadline"].map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setType(t)}
              style={[styles.chip, type === t && { backgroundColor: THEME.accent }]}
            >
              <Text style={[styles.chipText, type === t && { color: "#000" }]}>{t}</Text>
            </TouchableOpacity>
          ))}

          {/* subject chips */}
          {SUBJECTS.map(s => (
            <TouchableOpacity
              key={s}
              onPress={() => setSubject(s)}
              style={[styles.chip, subject === s && { backgroundColor: THEME.accent }]}
            >
              <Text style={[styles.chipText, subject === s && { color: "#000" }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={addEvent} style={styles.button}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={dayEvents}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingVertical: 10 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>{TYPE_LABELS[item.type] || item.type} · {item.subject}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg, padding: 16 },
  h1: { color: THEME.accent, fontSize: 22, fontWeight: "700", marginBottom: 12 },
  input: { backgroundColor: THEME.panel, color: THEME.text, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#222" },
  button: { backgroundColor: THEME.accent, padding: 12, borderRadius: 12, alignItems: "center", marginBottom: 12 },
  buttonText: { color: "#000", fontWeight: "700" },
  card: { backgroundColor: THEME.panel, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#222" },
  cardTitle: { color: THEME.text, fontSize: 16, fontWeight: "700" },
  cardMeta: { color: THEME.muted, fontSize: 12 },
  pickerWrap: { flexDirection: "row", flex: 1, flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: "#222", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, marginRight: 6, marginBottom: 6 },
  chipText: { color: THEME.text, fontSize: 12 },
});
