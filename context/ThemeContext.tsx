import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ColorSchemeName } from 'react-native';

export type ThemeContextType = {
  colorScheme: NonNullable<ColorSchemeName>;
  setColorScheme: (scheme: NonNullable<ColorSchemeName>) => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  colorScheme: 'dark',
  setColorScheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colorScheme, setColorScheme] = useState<NonNullable<ColorSchemeName>>('dark');

  return (
    <ThemeContext.Provider value={{ colorScheme, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
