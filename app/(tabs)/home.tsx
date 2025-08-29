import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AIButton from '@/components/AIButton';
import { Colors } from '@/constants/Colors';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Ionicons
            name="person-circle-outline"
            size={40}
            color={Colors.dark.icon}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Upcoming</Text>
            <Text style={styles.cardDescription}>
              Check out the most recent notifications, announcements, test info
              and more!
            </Text>
            <TouchableOpacity style={styles.cardButton}>
              <Text style={styles.cardButtonText}>Check Out</Text>
            </TouchableOpacity>
          </View>
          <Ionicons
            name="book-outline"
            size={72}
            color={Colors.dark.tint}
          />
        </View>

        <View style={styles.dots}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <View style={styles.sectionHeader}>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownText}>Math</Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={Colors.dark.text}
            />
          </TouchableOpacity>
          <Text style={styles.sectionSub}>Overview</Text>
        </View>

        <View style={styles.grid}>
          {Array.from({ length: 8 }).map((_, index) => (
            <View key={index} style={styles.tile} />
          ))}
        </View>
      </ScrollView>
      <AIButton bottomOffset={20} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'flex-end',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.card,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  cardText: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    color: Colors.dark.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  cardDescription: {
    color: Colors.dark.text,
    fontSize: 14,
    marginBottom: 12,
  },
  cardButton: {
    backgroundColor: Colors.dark.tint,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  cardButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#444',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.dark.tint,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#1f1f1f',
    marginRight: 8,
  },
  dropdownText: {
    color: Colors.dark.text,
    marginRight: 4,
  },
  sectionSub: {
    color: Colors.dark.text,
    fontWeight: '600',
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    marginBottom: 16,
  },
});

