import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Achievement, AchievementId, AchievementStats, ACHIEVEMENTS } from '../types/achievements';
import { ExerciseLog } from './useProgressStorage';

const STORAGE_KEY = 'eye-care-achievements:v1';

type StoredAchievement = {
  id: AchievementId;
  unlockedAt: string;
};

const parseAchievements = (raw: string | null): Map<AchievementId, string> => {
  const map = new Map<AchievementId, string>();
  if (!raw) {
    return map;
  }
  try {
    const parsed: StoredAchievement[] = JSON.parse(raw);
    parsed.forEach((achievement) => {
      map.set(achievement.id, achievement.unlockedAt);
    });
  } catch (error) {
    console.warn('Failed to parse achievements', error);
  }
  return map;
};

const persistAchievements = async (achievements: Map<AchievementId, string>) => {
  try {
    const array: StoredAchievement[] = Array.from(achievements.entries()).map(([id, unlockedAt]) => ({
      id,
      unlockedAt,
    }));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(array));
  } catch (error) {
    console.warn('Failed to save achievements', error);
  }
};

export const useAchievements = () => {
  const [unlockedAchievements, setUnlockedAchievements] = useState<Map<AchievementId, string>>(new Map());
  const [isReady, setIsReady] = useState(false);
  const [newlyUnlocked, setNewlyUnlocked] = useState<AchievementId[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => setUnlockedAchievements(parseAchievements(raw)))
      .finally(() => setIsReady(true));
  }, []);

  const checkAchievements = useCallback(
    (stats: AchievementStats): AchievementId[] => {
      const newlyUnlockedIds: AchievementId[] = [];
      const now = new Date().toISOString();

      ACHIEVEMENTS.forEach((achievement) => {
        // Пропускаем уже разблокированные
        if (unlockedAchievements.has(achievement.id)) {
          return;
        }

        // Проверяем условие
        if (achievement.condition(stats)) {
          newlyUnlockedIds.push(achievement.id);
          unlockedAchievements.set(achievement.id, now);
        }
      });

      if (newlyUnlockedIds.length > 0) {
        setUnlockedAchievements(new Map(unlockedAchievements));
        persistAchievements(unlockedAchievements);
        setNewlyUnlocked(newlyUnlockedIds);
        // Очищаем новые достижения через 5 секунд
        setTimeout(() => setNewlyUnlocked([]), 5000);
      }

      return newlyUnlockedIds;
    },
    [unlockedAchievements]
  );

  const getAchievement = useCallback(
    (id: AchievementId): Achievement | undefined => {
      return ACHIEVEMENTS.find((a) => a.id === id);
    },
    []
  );

  const isUnlocked = useCallback(
    (id: AchievementId): boolean => {
      return unlockedAchievements.has(id);
    },
    [unlockedAchievements]
  );

  const getUnlockedCount = useCallback((): number => {
    return unlockedAchievements.size;
  }, [unlockedAchievements]);

  const getProgress = useCallback((): { unlocked: number; total: number; percentage: number } => {
    const unlocked = unlockedAchievements.size;
    const total = ACHIEVEMENTS.length;
    return {
      unlocked,
      total,
      percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0,
    };
  }, [unlockedAchievements]);

  const getAllAchievements = useMemo(() => {
    return ACHIEVEMENTS.map((achievement) => ({
      ...achievement,
      unlockedAt: unlockedAchievements.get(achievement.id),
      isUnlocked: unlockedAchievements.has(achievement.id),
    }));
  }, [unlockedAchievements]);

  const resetAchievements = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUnlockedAchievements(new Map());
      setNewlyUnlocked([]);
    } catch (error) {
      console.warn('Failed to reset achievements', error);
    }
  }, []);

  return {
    isReady,
    checkAchievements,
    getAchievement,
    isUnlocked,
    getUnlockedCount,
    getProgress,
    getAllAchievements,
    newlyUnlocked,
    clearNewlyUnlocked: () => setNewlyUnlocked([]),
    resetAchievements,
  };
};

// Хелпер для создания AchievementStats из данных прогресса
export const createAchievementStats = (
  logs: ExerciseLog[],
  stats: {
    totalMinutes: number;
    todayMinutes: number;
    todaySessions: number;
    streakDays: number;
    weeklyMinutes: number;
  },
  dailyGoal: number
): AchievementStats => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Проверяем ранние и поздние упражнения
  const hasEarlyExercise = logs.some((log) => {
    const logDate = new Date(log.completedAt);
    return logDate >= today && logDate.getHours() < 8;
  });

  const hasLateExercise = logs.some((log) => {
    const logDate = new Date(log.completedAt);
    return logDate >= today && logDate.getHours() >= 22;
  });

  // Собираем уникальные ID выполненных упражнений
  const completedExerciseIds = new Set(logs.map((log) => log.id));

  return {
    totalExercises: logs.length,
    streakDays: stats.streakDays,
    todaySessions: stats.todaySessions,
    todayMinutes: stats.todayMinutes,
    weeklyMinutes: stats.weeklyMinutes,
    logs,
    completedExerciseIds,
    hasEarlyExercise,
    hasLateExercise,
    dailyGoal,
  };
};

