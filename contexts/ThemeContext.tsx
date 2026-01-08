'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ActiveTheme = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  activeTheme: ActiveTheme;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>('auto');
  const [activeTheme, setActiveTheme] = useState<ActiveTheme>('light');

  // 시스템 다크모드 감지
  const getSystemTheme = (): ActiveTheme => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // 시간대별 자동 테마 계산 (18:00 ~ 06:00 다크모드)
  const getTimeBasedTheme = (): ActiveTheme => {
    const hour = new Date().getHours();
    return (hour >= 18 || hour < 6) ? 'dark' : 'light';
  };

  // 활성 테마 계산
  const calculateActiveTheme = (themeMode: ThemeMode): ActiveTheme => {
    if (themeMode === 'light') return 'light';
    if (themeMode === 'dark') return 'dark';

    // auto 모드: 시간대 우선, 시스템 설정 참고
    return getTimeBasedTheme();
  };

  // 모드 변경
  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    const theme = calculateActiveTheme(newMode);
    setActiveTheme(theme);

    // localStorage 저장
    if (typeof window !== 'undefined') {
      localStorage.setItem('themeMode', newMode);
    }
  };

  // 테마 토글 (light ↔ dark)
  const toggleTheme = () => {
    const newMode: ThemeMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
  };

  // 초기화 및 시스템 변경 감지
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // localStorage에서 설정 불러오기
    const savedMode = localStorage.getItem('themeMode');
    const initialMode: ThemeMode = savedMode === 'light' || savedMode === 'dark' || savedMode === 'auto'
      ? savedMode
      : 'auto';

    setModeState(initialMode);
    setActiveTheme(calculateActiveTheme(initialMode));

    // 시스템 다크모드 변경 감지 (auto 모드일 때만 반영)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (mode === 'auto') {
        setActiveTheme(calculateActiveTheme('auto'));
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  // auto 모드일 때 1분마다 시간대 확인
  useEffect(() => {
    if (mode !== 'auto') return;

    const interval = setInterval(() => {
      const newTheme = calculateActiveTheme('auto');
      if (newTheme !== activeTheme) {
        setActiveTheme(newTheme);
      }
    }, 60000); // 1분마다 체크

    return () => clearInterval(interval);
  }, [mode, activeTheme]);

  // HTML에 테마 클래스 적용
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    if (activeTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [activeTheme]);

  return (
    <ThemeContext.Provider value={{ mode, activeTheme, setMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
