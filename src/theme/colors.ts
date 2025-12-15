// Светлая тема
export const lightColors = {
  // Минималистичная палитра в стиле Apple
  background: '#FBFBFD',
  card: '#FFFFFF',
  accent: '#007AFF', // Apple blue
  accentSoft: '#E3F2FD',
  accentLight: '#F0F7FF',
  success: '#30D158', // Apple green
  successLight: '#E6F9EC',
  warning: '#FF9500', // Apple orange
  warningLight: '#FFF4E6',
  text: '#1D1D1F',
  textSecondary: '#6E6E73',
  muted: '#86868B',
  border: '#E5E5EA',
  shadow: 'rgba(0, 0, 0, 0.04)',
  shadowStrong: 'rgba(0, 0, 0, 0.08)'
};

// Темная тема
export const darkColors = {
  background: '#000000',
  card: '#1C1C1E',
  accent: '#0A84FF', // Apple blue (темная версия)
  accentSoft: '#1A1A2E',
  accentLight: '#1A1A2E',
  success: '#30D158', // Apple green
  successLight: '#1A3A2A',
  warning: '#FF9F0A', // Apple orange (темная версия)
  warningLight: '#3A2A1A',
  text: '#FFFFFF',
  textSecondary: '#98989D',
  muted: '#636366',
  border: '#38383A',
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowStrong: 'rgba(0, 0, 0, 0.5)'
};

// Экспортируем светлую тему по умолчанию для обратной совместимости
export const colors = lightColors;

// Функция для получения цветов в зависимости от темы
export const getColors = (isDark: boolean) => {
  return isDark ? darkColors : lightColors;
};

