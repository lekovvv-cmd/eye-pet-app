import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Profession = 
  | 'it'           // IT-специалист (высокая нагрузка на глаза)
  | 'office'       // Офисный работник (средняя нагрузка)
  | 'student'      // Студент (средняя-высокая нагрузка)
  | 'driver'       // Водитель (средняя нагрузка)
  | 'outdoor'      // Работа на открытом воздухе (низкая нагрузка)
  | 'other';       // Другое

export type ScreenTime = 'low' | 'medium' | 'high' | 'very-high';
export type EyeIssues = 'none' | 'dryness' | 'fatigue' | 'blurred' | 'headaches';
export type AgeRange = 'under-25' | '25-35' | '35-45' | '45-60' | 'over-60';

export type UserSettings = {
  profession: Profession | null;
  screenTime: ScreenTime | null; // время за экраном
  eyeIssues: EyeIssues[]; // проблемы с глазами (можно выбрать несколько)
  ageRange: AgeRange | null; // возрастная группа
  reminderInterval: number; // интервал напоминаний в минутах
  dailyGoal: number; // цель в минутах в день
  isSetupComplete: boolean; // завершена ли настройка
  notificationsEnabled: boolean; // разрешены ли уведомления
  doNotDisturb: boolean; // режим "Не беспокоить"
  darkMode: boolean; // темная тема
  soundEnabled: boolean; // включены ли звуки
};

const SETTINGS_KEY = 'eye-care-settings:v2';

const DEFAULT_SETTINGS: UserSettings = {
  profession: null,
  screenTime: null,
  eyeIssues: [],
  ageRange: null,
  reminderInterval: 60,
  dailyGoal: 10,
  isSetupComplete: false,
  notificationsEnabled: true,
  doNotDisturb: false,
  darkMode: false,
  soundEnabled: true,
};

// Настройки для каждой профессии
export const PROFESSION_CONFIG: Record<Profession, { reminderInterval: number; dailyGoal: number; name: string; icon: string }> = {
  it: {
    name: 'IT-специалист',
    icon: 'laptop-outline',
    reminderInterval: 30, // каждые 30 минут
    dailyGoal: 15, // 15 минут в день
  },
  office: {
    name: 'Офисный работник',
    icon: 'briefcase-outline',
    reminderInterval: 45, // каждые 45 минут
    dailyGoal: 12, // 12 минут в день
  },
  student: {
    name: 'Студент',
    icon: 'school-outline',
    reminderInterval: 40, // каждые 40 минут
    dailyGoal: 12, // 12 минут в день
  },
  driver: {
    name: 'Водитель',
    icon: 'car-outline',
    reminderInterval: 60, // каждые 60 минут
    dailyGoal: 10, // 10 минут в день
  },
  outdoor: {
    name: 'Работа на открытом воздухе',
    icon: 'sunny-outline',
    reminderInterval: 120, // каждые 2 часа
    dailyGoal: 8, // 8 минут в день
  },
  other: {
    name: 'Другое',
    icon: 'person-outline',
    reminderInterval: 60, // каждые 60 минут
    dailyGoal: 10, // 10 минут в день
  },
};

const parseSettings = (raw: string | null): UserSettings => {
  if (!raw) {
    return DEFAULT_SETTINGS;
  }
  try {
    const parsed = JSON.parse(raw);
    // Миграция: если eyeIssues - строка (старый формат), преобразуем в массив
    if (parsed.eyeIssues && !Array.isArray(parsed.eyeIssues)) {
      parsed.eyeIssues = parsed.eyeIssues === null ? [] : [parsed.eyeIssues];
    }
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (error) {
    console.warn('Failed to parse settings', error);
    return DEFAULT_SETTINGS;
  }
};

const persistSettings = async (settings: UserSettings) => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save settings', error);
  }
};

export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY)
      .then((raw) => setSettings(parseSettings(raw)))
      .finally(() => setIsReady(true));
  }, []);

  const updateProfession = useCallback(async (profession: Profession) => {
    const newSettings = { ...settings, profession };
    const calculated = calculatePersonalizedSettings(newSettings);
    setSettings(calculated);
    await persistSettings(calculated);
  }, [settings]);

  const updateScreenTime = useCallback(async (screenTime: ScreenTime) => {
    const newSettings = { ...settings, screenTime };
    const calculated = calculatePersonalizedSettings(newSettings);
    setSettings(calculated);
    await persistSettings(calculated);
  }, [settings]);

  const updateEyeIssues = useCallback(async (eyeIssues: EyeIssues[]) => {
    const newSettings = { ...settings, eyeIssues };
    const calculated = calculatePersonalizedSettings(newSettings);
    setSettings(calculated);
    await persistSettings(calculated);
  }, [settings]);

  const toggleEyeIssue = useCallback(async (eyeIssue: EyeIssues) => {
    const currentIssues = settings.eyeIssues || [];
    let newIssues: EyeIssues[];
    
    if (eyeIssue === 'none') {
      // Если выбрали "Нет проблем", очищаем все остальные
      newIssues = currentIssues.includes('none') ? [] : ['none'];
    } else {
      // Если выбрали другую проблему, убираем "Нет проблем" если он был выбран
      if (currentIssues.includes(eyeIssue)) {
        newIssues = currentIssues.filter(issue => issue !== eyeIssue);
      } else {
        newIssues = [...currentIssues.filter(issue => issue !== 'none'), eyeIssue];
      }
    }
    
    const newSettings = { ...settings, eyeIssues: newIssues };
    const calculated = calculatePersonalizedSettings(newSettings);
    setSettings(calculated);
    await persistSettings(calculated);
  }, [settings]);

  const updateAgeRange = useCallback(async (ageRange: AgeRange) => {
    const newSettings = { ...settings, ageRange };
    const calculated = calculatePersonalizedSettings(newSettings);
    setSettings(calculated);
    await persistSettings(calculated);
  }, [settings]);

  const completeSetup = useCallback(async () => {
    const newSettings = { ...settings, isSetupComplete: true };
    setSettings(newSettings);
    await persistSettings(newSettings);
  }, [settings]);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await persistSettings(newSettings);
  }, [settings]);

  const getRecommendedInterval = useCallback((): number => {
    if (settings.profession) {
      return PROFESSION_CONFIG[settings.profession].reminderInterval;
    }
    return DEFAULT_SETTINGS.reminderInterval;
  }, [settings.profession]);

  const getDailyGoal = useCallback((): number => {
    return settings.dailyGoal;
  }, [settings.dailyGoal]);

  const updateNotificationsEnabled = useCallback(async (enabled: boolean) => {
    const newSettings = { ...settings, notificationsEnabled: enabled };
    setSettings(newSettings);
    await persistSettings(newSettings);
  }, [settings]);

  const updateDoNotDisturb = useCallback(async (enabled: boolean) => {
    const newSettings = { ...settings, doNotDisturb: enabled };
    setSettings(newSettings);
    await persistSettings(newSettings);
  }, [settings]);

  const updateDarkMode = useCallback(async (enabled: boolean) => {
    const newSettings = { ...settings, darkMode: enabled };
    setSettings(newSettings);
    await persistSettings(newSettings);
  }, [settings]);

  const updateSoundEnabled = useCallback(async (enabled: boolean) => {
    const newSettings = { ...settings, soundEnabled: enabled };
    setSettings(newSettings);
    await persistSettings(newSettings);
  }, [settings]);

  return {
    settings,
    isReady,
    updateProfession,
    updateScreenTime,
    updateEyeIssues,
    toggleEyeIssue,
    updateAgeRange,
    completeSetup,
    updateSettings,
    getRecommendedInterval,
    getDailyGoal,
    updateNotificationsEnabled,
    updateDoNotDisturb,
    updateDarkMode,
    updateSoundEnabled,
  };
};

// Функция для расчета персонализированных настроек на основе всех параметров
function calculatePersonalizedSettings(settings: UserSettings): UserSettings {
  let baseInterval = 60;
  let baseGoal = 10;

  // Базовая настройка по профессии
  if (settings.profession) {
    const profConfig = PROFESSION_CONFIG[settings.profession];
    baseInterval = profConfig.reminderInterval;
    baseGoal = profConfig.dailyGoal;
  }

  // Корректировка по времени за экраном
  if (settings.screenTime === 'very-high') {
    baseInterval = Math.max(20, baseInterval - 20);
    baseGoal += 3;
  } else if (settings.screenTime === 'high') {
    baseInterval = Math.max(25, baseInterval - 15);
    baseGoal += 2;
  } else if (settings.screenTime === 'medium') {
    baseInterval = Math.max(30, baseInterval - 10);
    baseGoal += 1;
  } else if (settings.screenTime === 'low') {
    baseInterval += 15;
    baseGoal = Math.max(5, baseGoal - 2);
  }

  // Корректировка по проблемам с глазами
  if (settings.eyeIssues && settings.eyeIssues.length > 0 && !settings.eyeIssues.includes('none')) {
    // Если выбраны проблемы, применяем корректировки
    if (settings.eyeIssues.includes('headaches') || settings.eyeIssues.includes('blurred')) {
      baseInterval = Math.max(20, baseInterval - 15);
      baseGoal += 4;
    } else if (settings.eyeIssues.includes('fatigue')) {
      baseInterval = Math.max(25, baseInterval - 10);
      baseGoal += 3;
    } else if (settings.eyeIssues.includes('dryness')) {
      baseInterval = Math.max(30, baseInterval - 10);
      baseGoal += 2;
    }
    
    // Если выбрано несколько проблем, увеличиваем корректировки
    if (settings.eyeIssues.length > 1) {
      baseInterval = Math.max(20, baseInterval - 5);
      baseGoal += 1;
    }
  }

  // Корректировка по возрасту
  if (settings.ageRange === 'over-60') {
    baseInterval = Math.max(30, baseInterval - 10);
    baseGoal += 2;
  } else if (settings.ageRange === '45-60') {
    baseInterval = Math.max(30, baseInterval - 5);
    baseGoal += 1;
  } else if (settings.ageRange === 'under-25') {
    baseInterval += 5;
    baseGoal = Math.max(8, baseGoal - 1);
  }

  return {
    ...settings,
    reminderInterval: baseInterval,
    dailyGoal: Math.min(25, Math.max(5, baseGoal)), // Ограничиваем от 5 до 25 минут
  };
}

