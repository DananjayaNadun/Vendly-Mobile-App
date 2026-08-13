import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { palettes, type Palette } from './tokens';

export type Scheme = 'light' | 'dark';
export type SchemePreference = Scheme | 'system';

type ThemeValue = {
  scheme: Scheme;
  preference: SchemePreference;
  setPreference: (next: SchemePreference) => void;
  toggle: () => void;
  c: Palette;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreference] = useState<SchemePreference>('system');

  const scheme: Scheme =
    preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;

  const toggle = useCallback(() => {
    setPreference(scheme === 'dark' ? 'light' : 'dark');
  }, [scheme]);

  const value = useMemo<ThemeValue>(
    () => ({
      scheme,
      preference,
      setPreference,
      toggle,
      c: palettes[scheme],
      isDark: scheme === 'dark',
    }),
    [scheme, preference, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside <ThemeProvider>');
  return value;
}
