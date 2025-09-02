/**
 * Color palette for the app supporting light and dark modes.
 */

const darkTintColor = '#9c5dfc';
const lightTintColor = '#9370db';

export const Colors = {
  light: {
    text: '#000000',
    background: '#add8e6',
    card: '#d0e1ff',
    tint: lightTintColor,
    icon: '#555555',
    tabIconDefault: '#555555',
    tabIconSelected: lightTintColor,
  },
  dark: {
    text: '#ffffff',
    background: '#121212',
    card: '#1e1e1e',
    tint: darkTintColor,
    icon: '#9a9a9a',
    tabIconDefault: '#9a9a9a',
    tabIconSelected: darkTintColor,
  },
} as const;
