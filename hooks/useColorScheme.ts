import { useColorScheme as _useColorScheme } from 'react-native';
import { useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext';

// Return the chosen color scheme or fall back to the device preference.
export function useColorScheme() {
  const { colorScheme } = useContext(ThemeContext);
  return colorScheme ?? _useColorScheme() ?? 'light';
}
