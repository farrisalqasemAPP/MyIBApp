import React, { useState, useMemo } from 'react';
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
import { useColorScheme } from '@/hooks/useColorScheme';

type Book = { key: string; title: string; author_name?: string[] };

export default function LibraryScreen() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);

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
          placeholderTextColor={Colors[colorScheme].icon}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={search}
        />
        <TouchableOpacity style={styles.button} onPress={search}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator
          color={Colors[colorScheme].tint}
          style={{ marginTop: 20 }}
        />
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

const createStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
      padding: 16,
    },
    searchRow: { flexDirection: 'row', marginBottom: 12 },
    input: {
      flex: 1,
      backgroundColor: Colors[colorScheme].card,
      borderRadius: 8,
      paddingHorizontal: 12,
      color: Colors[colorScheme].text,
    },
    button: {
      marginLeft: 8,
      backgroundColor: Colors[colorScheme].tint,
      borderRadius: 8,
      paddingHorizontal: 16,
      justifyContent: 'center',
    },
    buttonText: { color: '#fff', fontWeight: '600' },
    results: { flex: 1 },
    resultItem: { marginBottom: 12 },
    resultTitle: { color: Colors[colorScheme].text, fontWeight: '600' },
    resultAuthor: { color: Colors[colorScheme].icon },
  });
