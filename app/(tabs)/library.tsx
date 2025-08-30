import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Colors } from '@/constants/Colors';

interface Book {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
}

export default function LibraryScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`
      );
      const data = await res.json();
      setResults(data.docs || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search Open Library..."
          placeholderTextColor={Colors.dark.icon}
        />
        <TouchableOpacity style={styles.button} onPress={search}>
          <Text style={styles.buttonText}>Go</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.results} contentContainerStyle={styles.resultsContent}>
        {loading && <Text style={styles.loading}>Loading...</Text>}
        {results.map(book => (
          <View key={book.key} style={styles.card}>
            <Text style={styles.title}>{book.title}</Text>
            {book.author_name && (
              <Text style={styles.author}>{book.author_name.join(', ')}</Text>
            )}
            {book.first_publish_year && (
              <Text style={styles.year}>{book.first_publish_year}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    padding: 16,
  },
  searchRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    color: Colors.dark.text,
    padding: 8,
    borderRadius: 6,
  },
  button: {
    marginLeft: 8,
    backgroundColor: Colors.dark.tint,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 6,
  },
  buttonText: {
    color: Colors.dark.text,
    fontWeight: 'bold',
  },
  results: {
    flex: 1,
  },
  resultsContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.dark.card,
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  author: {
    color: Colors.dark.text,
    marginTop: 4,
  },
  year: {
    color: Colors.dark.icon,
    marginTop: 2,
  },
  loading: {
    color: Colors.dark.text,
    textAlign: 'center',
    marginVertical: 20,
  },
});

