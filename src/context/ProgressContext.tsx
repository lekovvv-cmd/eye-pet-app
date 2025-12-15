import { createContext, ReactNode, useContext, useEffect } from 'react';
import { useProgressStorage } from '../hooks/useProgressStorage';
import { useAchievements, createAchievementStats } from '../hooks/useAchievements';
import { useSettings } from './SettingsContext';

type ProgressContextValue = ReturnType<typeof useProgressStorage> & {
  checkAchievements: () => void;
  newlyUnlockedAchievements: string[];
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export const ProgressProvider = ({ children }: { children: ReactNode }) => {
  const progress = useProgressStorage();
  const achievements = useAchievements();
  const { getDailyGoal } = useSettings();

  // Проверяем достижения при изменении прогресса
  useEffect(() => {
    if (progress.isReady && achievements.isReady) {
      const stats = createAchievementStats(
        progress.logs,
        {
          totalMinutes: progress.stats.totalMinutes,
          todayMinutes: progress.stats.todayMinutes,
          todaySessions: progress.stats.todaySessions,
          streakDays: progress.stats.streakDays,
          weeklyMinutes: progress.stats.weeklyMinutes,
        },
        getDailyGoal()
      );
      achievements.checkAchievements(stats);
    }
  }, [progress.logs, progress.stats, achievements.isReady, progress.isReady, getDailyGoal]);

  const checkAchievements = () => {
    if (progress.isReady && achievements.isReady) {
      const stats = createAchievementStats(
        progress.logs,
        {
          totalMinutes: progress.stats.totalMinutes,
          todayMinutes: progress.stats.todayMinutes,
          todaySessions: progress.stats.todaySessions,
          streakDays: progress.stats.streakDays,
          weeklyMinutes: progress.stats.weeklyMinutes,
        },
        getDailyGoal()
      );
      achievements.checkAchievements(stats);
    }
  };

  const value: ProgressContextValue = {
    ...progress,
    checkAchievements,
    newlyUnlockedAchievements: achievements.newlyUnlocked,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};

export const useProgress = () => {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return ctx;
};

