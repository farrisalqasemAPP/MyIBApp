import { useColorScheme as _useColorScheme } from 'react-native';

// Web implementation mirrors the device preference.
export function useColorScheme() {
  return _useColorScheme() ?? 'light';
}
