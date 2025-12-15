import { createContext, useContext, ReactNode } from 'react';
import { useSettings } from './SettingsContext';
import { getColors } from '../theme/colors';

type ThemeContextValue = {
  colors: ReturnType<typeof getColors>;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  let isDark = false;
  try {
    const { settings } = useSettings();
    isDark = settings?.darkMode ?? false;
  } catch (error) {
    // Если useSettings еще не готов, используем светлую тему по умолчанию
    isDark = false;
  }
  
  const colors = getColors(isDark);

  return (
    <ThemeContext.Provider value={{ colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx || !ctx.colors) {
    // Fallback для случаев, когда ThemeProvider еще не инициализирован
    const fallbackColors = getColors(false);
    return { colors: fallbackColors, isDark: false };
  }
  return ctx;
};

