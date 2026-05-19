import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { THEME_COLORS, ThemeMode } from '../lib/brand';

type ThemeContextValue = {
  colors: (typeof THEME_COLORS)[ThemeMode];
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const storageKey = 'tel:theme-mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    AsyncStorage.getItem(storageKey).then((stored) => {
      if (stored === 'light' || stored === 'dark') setModeState(stored);
    });
  }, []);

  const setMode = (nextMode: ThemeMode) => {
    setModeState(nextMode);
    AsyncStorage.setItem(storageKey, nextMode);
  };

  const value = useMemo(
    () => ({
      colors: THEME_COLORS[mode],
      mode,
      setMode,
      toggleMode: () => setMode(mode === 'dark' ? 'light' : 'dark'),
    }),
    [mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}

export function useThemeColors() {
  return useTheme().colors;
}
