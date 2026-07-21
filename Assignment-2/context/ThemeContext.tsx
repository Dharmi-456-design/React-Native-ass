import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeType {
  bg: string;
  card: string;
  border: string;
  primary: string;
  primaryLight: string;
  primaryMuted: string;
  text: string;
  textMuted: string;
  textLight: string;
  danger: string;
  success: string;
  warning: string;
  purple: string;
  tabBar: string;
  tabBarBorder: string;
  inputBg: string;
  inputBorder: string;
  statusBar: 'light' | 'dark';
}

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  theme: ThemeType;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const THEME_KEY = '@smartfield_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(val => {
      if (val !== null) setIsDark(val === 'dark');
    });
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      return next;
    });
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export const lightTheme: ThemeType = {
  bg: '#F0F2F5',
  card: '#ffffff',
  border: '#E4E6EB',
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  primaryMuted: '#DBEAFE',
  text: '#1C1E21',
  textMuted: '#65676B',
  textLight: '#9CA3AF',
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  purple: '#8B5CF6',
  tabBar: '#ffffff',
  tabBarBorder: '#E4E6EB',
  inputBg: '#ffffff',
  inputBorder: '#D1D5DB',
  statusBar: 'dark',
};

export const darkTheme: ThemeType = {
  bg: '#0F1117',
  card: '#1E2028',
  border: '#2D3039',
  primary: '#3B82F6',
  primaryLight: '#1E3A5F',
  primaryMuted: '#1E40AF',
  text: '#F9FAFB',
  textMuted: '#9CA3AF',
  textLight: '#6B7280',
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  purple: '#A78BFA',
  tabBar: '#1E2028',
  tabBarBorder: '#2D3039',
  inputBg: '#2D3039',
  inputBorder: '#3D4049',
  statusBar: 'light',
};
