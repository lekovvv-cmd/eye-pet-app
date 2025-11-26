import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ExerciseLog = {
  id: string;
  title: string;
  duration: number;
  completedAt: string;
};

const STORAGE_KEY = 'eye-care-progress:v1';

const parseLogs = (raw: string | null): ExerciseLog[] => {
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as ExerciseLog[];
    }
    return [];
  } catch (error) {
    console.warn('Failed to parse progress storage', error);
    return [];
  }
};

const persistLogs = async (logs: ExerciseLog[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (error) {
    console.warn('Failed to save progress', error);
  }
};

export const useProgressStorage = () => {
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => setLogs(parseLogs(raw)))
      .finally(() => setIsReady(true));
  }, []);

  const addCompletion = useCallback(async (entry: Omit<ExerciseLog, 'completedAt'>) => {
    const log: ExerciseLog = { ...entry, completedAt: new Date().toISOString() };
    setLogs((prev) => {
      const next = [log, ...prev].slice(0, 200);
      persistLogs(next);
      return next;
    });
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const todayKey = now.toDateString();
    const totals = logs.reduce(
      (acc, log) => {
        const dayKey = new Date(log.completedAt).toDateString();
        acc.totalMinutes += log.duration / 60;
        if (dayKey === todayKey) {
          acc.todayMinutes += log.duration / 60;
          acc.todaySessions += 1;
        }
        const weekDiff = (now.getTime() - new Date(log.completedAt).getTime()) / (1000 * 60 * 60 * 24);
        if (weekDiff <= 6) {
          acc.weeklyMinutes += log.duration / 60;
        }
        acc.byDay[dayKey] = (acc.byDay[dayKey] || 0) + 1;
        return acc;
      },
      { totalMinutes: 0, todayMinutes: 0, todaySessions: 0, weeklyMinutes: 0, byDay: {} as Record<string, number> }
    );

    const computeStreak = () => {
      let streak = 0;
      for (let offset = 0; offset < 30; offset += 1) {
        const day = new Date(now);
        day.setDate(day.getDate() - offset);
        const hasEntry = totals.byDay[day.toDateString()];
        if (offset === 0) {
          if (!hasEntry) {
            break;
          }
          streak += 1;
        } else if (hasEntry) {
          streak += 1;
        } else {
          break;
        }
      }
      return streak;
    };

    return {
      ...totals,
      streakDays: computeStreak(),
      lastActivity: logs[0]?.completedAt ?? null
    };
  }, [logs]);

  return { logs, isReady, addCompletion, stats };
};

