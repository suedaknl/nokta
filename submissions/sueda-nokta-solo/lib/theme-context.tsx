import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';

type ThemeMode = 'light' | 'dark';

type AppTheme = {
  mode: ThemeMode;
  isDark: boolean;
  gradientColors: [string, string, ...string[]];
  textPrimary: string;
  textSecondary: string;
  cardBackground: string;
  cardBorder: string;
  inputBackground: string;
  inputBorder: string;
  tabBarBackground: string;
  tabBarBorder: string;
};

type ThemeContextValue = {
  theme: AppTheme;
  mode: ThemeMode;
  toggleTheme: () => void;
};

const lightTheme: AppTheme = {
  mode: 'light',
  isDark: false,
  gradientColors: ['#F6F8FD', '#EFF3FA', '#FFFFFF'],
  textPrimary: '#172033',
  textSecondary: '#4A5877',
  cardBackground: 'rgba(255, 255, 255, 0.7)',
  cardBorder: 'rgba(255, 255, 255, 0.5)',
  inputBackground: 'rgba(255, 255, 255, 0.8)',
  inputBorder: 'rgba(200, 210, 230, 0.5)',
  tabBarBackground: 'rgba(255, 255, 255, 0.85)',
  tabBarBorder: 'rgba(200, 210, 230, 0.3)',
};

const darkTheme: AppTheme = {
  mode: 'dark',
  isDark: true,
  gradientColors: ['#0B0F19', '#100D21', '#15112B'],
  textPrimary: '#F3F6FF',
  textSecondary: '#CAD5EB',
  cardBackground: 'rgba(20, 17, 39, 0.45)',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  inputBackground: 'rgba(16, 12, 33, 0.6)',
  inputBorder: 'rgba(255, 255, 255, 0.1)',
  tabBarBackground: 'rgba(11, 8, 22, 0.85)',
  tabBarBorder: 'rgba(255, 255, 255, 0.05)',
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemTheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(systemTheme === 'dark' ? 'dark' : 'light');

  const value = useMemo<ThemeContextValue>(() => {
    const theme = mode === 'dark' ? darkTheme : lightTheme;
    return {
      theme,
      mode,
      toggleTheme: () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark')),
    };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within AppThemeProvider.');
  }
  return context;
}
