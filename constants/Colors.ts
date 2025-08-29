/**
 * Color palette for the app supporting light and dark modes.
 */

const tintColor = '#9c5dfc';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    card: '#f2f2f2',
    tint: tintColor,
    icon: '#555555',
    tabIconDefault: '#555555',
    tabIconSelected: tintColor,
  },
  dark: {
    text: '#ffffff',
    background: '#121212',
    card: '#1e1e1e',
    tint: tintColor,
    icon: '#9a9a9a',
    tabIconDefault: '#9a9a9a',
    tabIconSelected: tintColor,
  },
} as const;
