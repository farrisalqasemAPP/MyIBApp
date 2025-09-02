import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Switch,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import AIButton from '@/components/AIButton';
import { Colors } from '@/constants/Colors';
import { subjectData, SubjectInfo } from '@/constants/subjects';
import { useColorScheme, useToggleColorScheme } from '@/hooks/useColorScheme';

const cardData = [
  {
    title: 'Upcoming',
    description:
      'Check out the most recent notifications, announcements, test info and more!',
    icon: 'book-outline' as const,
  },
  {
    title: 'Result logging',
    description: 'Log and review your results.',
    icon: 'clipboard-outline' as const,
  },
  {
    title: 'AI feedback',
    description: 'Get insights and feedback from the AI.',
    icon: 'chatbubbles-outline' as const,
  },
];

const overviewSections = [
  {
    title: 'Subject Home',
    description:
      "Snapshot of this week's unit, key resources, upcoming deadlines, quick links.",
  },
  {
    title: 'Syllabus & Units',
    description:
      'Unit map with aims, assessment objectives (HL/SL), command terms.',
  },
  {
    title: 'Library & Lessons',
    description:
      'Curated resources for the subject: PDFs, slides, videos, open-library books; filter by unit/level/language.',
  },
  {
    title: 'Assignments & Submissions',
    description:
      'Briefs, rubrics, submit files, status (assigned/submitted/graded).',
  },
  {
    title: 'Practice & Question Bank',
    description:
      'Past-style questions, auto-generated drills, step-by-step solutions, difficulty filters.',
  },
  {
    title: 'Results & Feedback',
    description:
      'Grades by unit/AO, teacher comments, targets, progress analytics.',
  },
];

export default function HomeScreen() {
  const [selectedSubject, setSelectedSubject] = useState<SubjectInfo>(subjectData[0]);
  const [showSubjects, setShowSubjects] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [activeCard, setActiveCard] = useState(0);

  const colorScheme = useColorScheme();
  const toggleColorScheme = useToggleColorScheme();
  const theme = Colors[colorScheme];
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const styles = useMemo(
    () => createStyles(theme, width, colorScheme),
    [theme, width, colorScheme],
  );


  return (
    <LinearGradient
      colors={
        colorScheme === 'light'
          ? ['#add8e6', '#9370db']
          : ['#2e1065', '#000000']
      }
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSettingsVisible(true)}>
            <Ionicons name="settings-outline" size={28} color={theme.icon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Clarity</Text>
        </View>


        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.cardCarousel}
          onMomentumScrollEnd={event => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x / (width - 40),
            );
            setActiveCard(index);
          }}
        >
          {cardData.map((card, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardDescription}>{card.description}</Text>
                <TouchableOpacity style={styles.cardButton}>
                  <Text style={styles.cardButtonText}>Check Out</Text>
                </TouchableOpacity>
              </View>
              <Ionicons name={card.icon} size={72} color={theme.tint} />
            </View>
          ))}
        </ScrollView>

        <View style={styles.dots}>
          {cardData.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.dot, index === activeCard && styles.activeDot]}
              onPress={() => {
                scrollRef.current?.scrollTo({
                  x: index * (width - 40),
                  animated: true,
                });
                setActiveCard(index);
              }}
            />
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowSubjects(true)}
          >
            <Text style={styles.dropdownText}>{selectedSubject.title}</Text>
            <Ionicons name="chevron-down" size={16} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.sectionSub}>Overview</Text>
        </View>

        <View style={styles.sectionList}>
          {overviewSections.map(section => (
            <View
              key={section.title}
              style={[styles.box, { backgroundColor: selectedSubject.color }]}
            >
              <Text style={styles.boxTitle}>{section.title}</Text>
              <Text style={styles.boxNote}>{section.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <AIButton bottomOffset={20} />

      {/* Settings Modal */}
      <Modal
        visible={settingsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setSettingsVisible(false)}
          activeOpacity={1}
        >
          <View style={styles.settingsContent}>
            <Text style={styles.settingsTitle}>Settings</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingText}>Light Mode</Text>
              <Switch
                value={colorScheme === 'light'}
                onValueChange={toggleColorScheme}
              />
            </View>
            <Text style={styles.settingPlaceholder}>
              More customization options coming soon...
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Subject Selection Modal */}
      <Modal
        visible={showSubjects}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSubjects(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowSubjects(false)}
          activeOpacity={1}
        >
          <View style={styles.modalContent}>
            {subjectData.map(subject => (
              <TouchableOpacity
                key={subject.key}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedSubject(subject);
                  setShowSubjects(false);
                }}
              >
                <Text style={styles.modalItemText}>{subject.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
}

const createStyles = (
  colors: typeof Colors.light | typeof Colors.dark,
  width: number,
  scheme: 'light' | 'dark',
) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 100,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerTitle: {
      color: colors.text,
      fontSize: 22,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    cardCarousel: {
      marginTop: 20,
    },
    card: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      padding: 20,
      borderRadius: 16,
      alignItems: 'center',
      width: width - 40,
    },
    cardText: {
      flex: 1,
      marginRight: 10,
    },
    cardTitle: {
      color: colors.text,
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 6,
    },
    cardDescription: {
      color: colors.text,
      fontSize: 14,
      marginBottom: 12,
    },
    cardButton: {
      backgroundColor: colors.tint,
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
      backgroundColor: colors.icon,
      marginHorizontal: 4,
    },
    activeDot: {
      backgroundColor: colors.tint,
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
      backgroundColor: colors.card,
      marginRight: 8,
    },
    dropdownText: {
      color: colors.text,
      marginRight: 4,
    },
    sectionSub: {
      color: colors.text,
      fontWeight: '600',
      fontSize: 16,
    },
    sectionList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingBottom: 16,
    },
    box: {
      width: '48%',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      alignItems: 'center',
      position: 'relative',
      borderWidth: 4,
      borderColor: scheme === 'light' ? '#fff' : '#444',
    },
    boxTitle: {
      marginTop: 8,
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    boxNote: {
      marginTop: 8,
      color: '#ddd',
      fontSize: 14,
      textAlign: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.card,
      padding: 20,
      borderRadius: 12,
      width: '80%',
    },
    modalItem: {
      paddingVertical: 10,
    },
    modalItemText: {
      color: colors.text,
      fontSize: 16,
    },
    settingsContent: {
      backgroundColor: colors.card,
      padding: 20,
      borderRadius: 12,
      width: '80%',
    },
    settingsTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 12,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    settingText: {
      color: colors.text,
      fontSize: 16,
    },
    settingPlaceholder: {
      color: colors.text,
      fontSize: 14,
    },
  });

