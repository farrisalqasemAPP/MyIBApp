import { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SUBJECTS, THEME } from "../constants";
import { loadJSON, saveJSON } from "../utils/storage";

const STORAGE_KEY = "notes:v1";

export default function NotesScreen() {
  const [notes, setNotes] = useState([]);
  const [subject, setSubject] = useState("Math");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    loadJSON(STORAGE_KEY, []).then(setNotes);
  }, []);

  useEffect(() => {
    saveJSON(STORAGE_KEY, notes);
  }, [notes]);

  const filtered = useMemo(() => (filter === "All" ? notes : notes.filter(n => n.subject === filter)), [filter, notes]);

  const addNote = () => {
    if (!title.trim() && !content.trim()) return;
    const now = Date.now();
    const n = { id: String(now), subject, title: title.trim() || "Untitled", content: content.trim(), createdAt: now, updatedAt: now };
    setNotes([n, ...notes]);
    setTitle(""); setContent("");
  };

  const removeNote = id => setNotes(notes.filter(n => n.id !== id));

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Notes</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
        <Chip label="All" selected={filter==="All"} onPress={()=>setFilter("All")} />
        {SUBJECTS.map(s => <Chip key={s} label={s} selected={subject===s} onPress={()=>setSubject(s)} />)}
      </View>

      <TextInput placeholder="Title" placeholderTextColor={THEME.muted} value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput placeholder="Write your note…" placeholderTextColor={THEME.muted} value={content} onChangeText={setContent} multiline style={[styles.input, {height:100}]} />
      <TouchableOpacity onPress={addNote} style={styles.button}><Text style={styles.buttonText}>Add Note</Text></TouchableOpacity>

      <FlatList
        data={filtered}
        keyExtractor={i=>i.id}
        contentContainerStyle={{ gap: 8, paddingVertical: 10 }}
        renderItem={({item})=>(
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>{item.subject}</Text>
            <Text style={styles.cardBody}>{item.content}</Text>
            <TouchableOpacity onPress={()=>removeNote(item.id)} style={styles.delete}><Text style={{color:"#000"}}>Delete</Text></TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

function Chip({label, selected, onPress}) {
  return <TouchableOpacity onPress={onPress} style={[styles.chip, selected && {backgroundColor: THEME.accent}]}>
    <Text style={[styles.chipText, selected && {color:"#000"}]}>{label}</Text>
  </TouchableOpacity>;
}

const styles = StyleSheet.create({
  container:{flex:1, backgroundColor:"#0b0b0c", padding:16},
  h1:{color:THEME.accent,fontSize:22,fontWeight:"700",marginBottom:12},
  input:{backgroundColor:"#151517",color:THEME.text,borderRadius:12,padding:12,marginBottom:8,borderWidth:1,borderColor:"#222"},
  button:{backgroundColor:THEME.accent,padding:12,borderRadius:12,alignItems:"center"},
  buttonText:{color:"#000", fontWeight:"700"},
  card:{backgroundColor:"#151517",borderRadius:12,padding:12,gap:6,borderWidth:1,borderColor:"#222"},
  cardTitle:{color:THEME.text,fontSize:16,fontWeight:"700"},
  cardMeta:{color:THEME.muted,fontSize:12},
  cardBody:{color:THEME.text},
  delete:{backgroundColor:THEME.accent,alignSelf:"flex-start",paddingHorizontal:10,paddingVertical:6,borderRadius:8,marginTop:6},
  chip:{backgroundColor:"#222",paddingHorizontal:10,paddingVertical:6,borderRadius:999},
  chipText:{color:THEME.text,fontSize:12}
});
