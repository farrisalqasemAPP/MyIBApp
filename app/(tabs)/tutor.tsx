import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function TutorScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hello! I'm your IB Jordan grade 11 tutor. How can I help you today?\n",
    },
  ]);
  const contextLimit = 5;
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const context = newMessages.slice(-contextLimit);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are a helpful tutor for the International Baccalaureate (IB) system in Jordan for 11th grade students.',
            },
            ...context,
          ],
        }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content?.trim();
      if (reply) {
        setMessages([...newMessages, { role: 'assistant', content: reply }]);
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Sorry, something went wrong.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#6a0dad', '#0000ff']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Clarity</Text>
      </View>
      <ScrollView style={styles.messages} contentContainerStyle={styles.messagesContent}>
        {messages.map((m, idx) => (
          <View
            key={idx}
            style={[
              styles.message,
              m.role === 'user' ? styles.userMessage : styles.assistantMessage,
            ]}
          >
            <Text style={m.role === 'user' ? styles.userText : styles.assistantText}>
              {m.content}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about IB Jordan Grade 11..."
          placeholderTextColor={Colors.dark.icon}
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={loading}
        >
          <Text style={styles.sendText}>{loading ? '...' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  messages: {
    flex: 1,
    marginBottom: 8,
  },
  messagesContent: {
    paddingBottom: 16,
  },
  message: {
    marginVertical: 4,
    padding: 8,
    borderRadius: 6,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.dark.tint,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.dark.card,
  },
  userText: {
    color: Colors.dark.text,
  },
  assistantText: {
    color: Colors.dark.text,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    color: Colors.dark.text,
    padding: 8,
    borderRadius: 6,
    maxHeight: 120,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: Colors.dark.tint,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  sendText: {
    color: Colors.dark.text,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    color: Colors.dark.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
});
