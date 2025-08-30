import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '@/constants/Colors';

type Book = { key: string; title: string; author_name?: string[] };

export default function LibraryScreen() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`,
      );
      const data = await res.json();
      setBooks(data.docs.slice(0, 20));
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Search Open Library"
          placeholderTextColor={Colors.dark.icon}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={search}
        />
        <TouchableOpacity style={styles.button} onPress={search}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator color={Colors.dark.tint} style={{ marginTop: 20 }} />
      ) : (
        <ScrollView style={styles.results}>
          {books.map(book => (
            <View key={book.key} style={styles.resultItem}>
              <Text style={styles.resultTitle}>{book.title}</Text>
              {book.author_name && (
                <Text style={styles.resultAuthor}>{book.author_name.join(', ')}</Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background, padding: 16 },
  searchRow: { flexDirection: 'row', marginBottom: 12 },
  input: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: Colors.dark.text,
  },
  button: {
    marginLeft: 8,
    backgroundColor: Colors.dark.tint,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  results: { flex: 1 },
  resultItem: { marginBottom: 12 },
  resultTitle: { color: Colors.dark.text, fontWeight: '600' },
  resultAuthor: { color: Colors.dark.icon },
});
