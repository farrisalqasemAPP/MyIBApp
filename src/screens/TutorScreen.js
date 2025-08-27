import Constants from "expo-constants";
import { useRef, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { THEME } from "../constants";

const SYSTEM = `You are an AI tutor for 11th grade IB students in Jordan.
- Use simple, clear steps.
- Align answers to IB style (criterion language, command terms).
- Show worked examples and point out common mistakes.
- If unsure, say what to check in the syllabus and suggest study strategies.`;

export default function TutorScreen() {
  const [messages, setMessages] = useState([{ id: "sys", role: "system", content: SYSTEM, createdAt: Date.now() }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    const userMsg = { id: String(Date.now()), role: "user", content: text, createdAt: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const apiKey = (Constants.expoConfig && Constants.expoConfig.extra && Constants.expoConfig.extra.OPENAI_API_KEY) ||
                     (Constants.manifest && Constants.manifest.extra && Constants.manifest.extra.OPENAI_API_KEY);
      let assistantText = "(No API key set. Add one in app.json under extra.OPENAI_API_KEY)";

      if (apiKey) {
        const res = await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            input: [
              { role: "system", content: SYSTEM },
              ...messages.filter(m => m.role !== "system").map(m => ({ role: m.role, content: m.content })),
              { role: "user", content: text },
            ],
            temperature: 0.3,
          }),
        });
        const data = await res.json();
        assistantText = data.output_text || (data.choices && data.choices[0] && (data.choices[0].message?.content || data.choices[0].text)) || "(No reply)";
      }

      const aMsg = { id: String(Date.now() + 1), role: "assistant", content: assistantText, createdAt: Date.now() };
      setMessages(prev => [...prev, aMsg]);
    } catch (e) {
      const err = { id: String(Date.now() + 2), role: "assistant", content: `Error: ${e?.message ?? e}`, createdAt: Date.now() };
      setMessages(prev => [...prev, err]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 100);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>AI Tutor</Text>

      <FlatList
        ref={listRef}
        data={messages.filter(m => m.role !== "system")}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingVertical: 10 }}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === "user" ? styles.right : styles.left]}>
            <Text style={styles.bubbleText}>{item.content}</Text>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Ask about homework, concepts, strategies…"
          placeholderTextColor={THEME.muted}
          value={input}
          onChangeText={setInput}
          style={styles.input}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <TouchableOpacity onPress={send} style={styles.send}>
          {loading ? <ActivityIndicator /> : <Text style={{ color: "#000", fontWeight: "700" }}>Send</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg, padding: 16 },
  h1: { color: THEME.accent, fontSize: 22, fontWeight: "700", marginBottom: 12 },
  bubble: { maxWidth: "85%", padding: 10, borderRadius: 12, backgroundColor: THEME.panel, borderWidth: 1, borderColor: "#222", marginBottom: 8 },
  bubbleText: { color: THEME.text },
  left: { alignSelf: "flex-start" },
  right: { alignSelf: "flex-end", backgroundColor: "#1e1e22" },
  inputRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  input: { flex: 1, backgroundColor: THEME.panel, color: THEME.text, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#222" },
  send: { backgroundColor: THEME.accent, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, marginLeft: 8 },
});
