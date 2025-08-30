import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Colors } from '@/constants/Colors';

export default function PlannerScreen() {
  const [prompt, setPrompt] = useState('');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {
    if (!prompt.trim()) return;
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      setPlan('Missing API key. Set EXPO_PUBLIC_OPENAI_API_KEY to enable AI features.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are a helpful tutor for IB students. Provide step-by-step study plans and reference reputable sources. Do not complete assignments for the student.',
            },
            { role: 'user', content: prompt },
          ],
        }),
      });
      const data = await res.json();
      setPlan(data.choices?.[0]?.message?.content?.trim() ?? 'No response');
    } catch {
      setPlan('Failed to generate plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.disclaimer}>
        AI guidance supports learning. Use suggestions to create your own work and cite all sources.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Describe what you need help studying..."
        placeholderTextColor={Colors.dark.icon}
        value={prompt}
        onChangeText={setPrompt}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={generatePlan}>
        <Text style={styles.buttonText}>Generate Plan</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator color={Colors.dark.tint} style={{ marginTop: 20 }} />}
      {plan ? <Text style={styles.plan}>{plan}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: Colors.dark.background, flexGrow: 1 },
  disclaimer: { color: Colors.dark.text, marginBottom: 12, fontSize: 14 },
  input: {
    backgroundColor: Colors.dark.card,
    color: Colors.dark.text,
    padding: 12,
    borderRadius: 8,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 12,
    backgroundColor: Colors.dark.tint,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  plan: { marginTop: 20, color: Colors.dark.text, fontSize: 14 },
});
