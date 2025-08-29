import { Ionicons } from '@expo/vector-icons';

export type SubjectInfo = {
  key: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

export const subjectData: SubjectInfo[] = [
  { key: 'english', title: 'English', icon: 'book', color: '#3b2e7e' },
  { key: 'arabic', title: 'Arabic', icon: 'globe-outline', color: '#6a0dad' },
  { key: 'math', title: 'Math', icon: 'calculator', color: '#1a1a40' },
  { key: 'physics', title: 'Physics', icon: 'planet', color: '#2e1065' },
  { key: 'biology', title: 'Biology', icon: 'leaf', color: '#007bff' },
  { key: 'business', title: 'Business', icon: 'briefcase', color: '#28a745' },
  { key: 'social', title: 'Social Studies', icon: 'people', color: '#dc3545' },
];

