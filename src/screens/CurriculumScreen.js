import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SUBJECTS, THEME } from "../constants";
import { CURRICULUM } from "../data/curriculum";

export default function CurriculumScreen() {
  const [subject, setSubject] = useState("Math");
  const units = useMemo(() => CURRICULUM[subject] ?? [], [subject]);

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Curriculum</Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
        {SUBJECTS.map(s => (
          <TouchableOpacity key={s} onPress={() => setSubject(s)} style={[styles.chip, subject === s && { backgroundColor: THEME.accent }]}>
            <Text style={[styles.chipText, subject === s && { color: "#000" }]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={units}
        keyExtractor={i => i.unit}
        contentContainerStyle={{ paddingVertical: 10 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.unit}</Text>
            {item.objectives?.map((o, idx) => <Text key={idx} style={styles.point}>• {o}</Text>)}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg, padding: 16 },
  h1: { color: THEME.accent, fontSize: 22, fontWeight: "700", marginBottom: 12 },
  chip: { backgroundColor: "#222", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, marginRight: 6, marginBottom: 6 },
  chipText: { color: THEME.text, fontSize: 12 },
  card: { backgroundColor: THEME.panel, borderRadius: 12, padding: 12, gap: 6, borderWidth: 1, borderColor: "#222", marginBottom: 8 },
  cardTitle: { color: THEME.text, fontSize: 16, fontWeight: "700", marginBottom: 4 },
  point: { color: THEME.text, opacity: 0.9, marginBottom: 2 },
});
