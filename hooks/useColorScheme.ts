import { useColorScheme as _useColorScheme } from 'react-native';

// Return the device color scheme, defaulting to light when unavailable.
export function useColorScheme() {
  return _useColorScheme() ?? 'light';
}
