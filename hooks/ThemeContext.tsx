import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ColorSchemeName } from 'react-native';

interface ThemeContextValue {
  colorScheme: NonNullable<ColorSchemeName>;
  toggleColorScheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colorScheme: 'dark',
  toggleColorScheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colorScheme, setColorScheme] = useState<NonNullable<ColorSchemeName>>(
    'dark',
  );

  const toggleColorScheme = () =>
    setColorScheme(prev => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ colorScheme, toggleColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export { ThemeContext };
