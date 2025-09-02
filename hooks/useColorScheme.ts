import { useTheme } from './ThemeContext';

// Return the current color scheme from context.
export function useColorScheme() {
  const { colorScheme } = useTheme();
  return colorScheme;
}

// Hook to toggle between light and dark modes.
export function useToggleColorScheme() {
  const { toggleColorScheme } = useTheme();
  return toggleColorScheme;
}
