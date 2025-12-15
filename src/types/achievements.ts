import { ExerciseLog } from '../hooks/useProgressStorage';

export type AchievementId = 
  | 'first_steps'           // Первое упражнение
  | 'week_warrior'          // 7 дней подряд
  | 'month_master'          // 30 дней подряд
  | 'century_club'          // 100 упражнений всего
  | 'daily_goal'            // Выполнил дневную цель
  | 'early_bird'            // Упражнение до 8 утра
  | 'night_owl'             // Упражнение после 22:00
  | 'speed_demon'           // 5 упражнений за день
  | 'marathon'              // 60 минут за день
  | 'consistency'           // 14 дней подряд
  | 'explorer'              // Выполнил все типы упражнений
  | 'dedication';           // 50 дней подряд

export type Achievement = {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  condition: (stats: AchievementStats) => boolean;
  unlockedAt?: string;
};

export type AchievementStats = {
  totalExercises: number;
  streakDays: number;
  todaySessions: number;
  todayMinutes: number;
  weeklyMinutes: number;
  logs: ExerciseLog[];
  completedExerciseIds: Set<string>;
  hasEarlyExercise: boolean;
  hasLateExercise: boolean;
  dailyGoal: number;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    title: 'Первые шаги',
    description: 'Выполни первое упражнение',
    icon: 'footsteps-outline',
    color: '#007AFF',
    rarity: 'common',
    condition: (stats) => stats.totalExercises >= 1,
  },
  {
    id: 'week_warrior',
    title: 'Воин недели',
    description: '7 дней подряд заботишься о глазах',
    icon: 'flame',
    color: '#FF9500',
    rarity: 'rare',
    condition: (stats) => stats.streakDays >= 7,
  },
  {
    id: 'month_master',
    title: 'Мастер месяца',
    description: '30 дней подряд без перерыва',
    icon: 'trophy',
    color: '#FFD700',
    rarity: 'epic',
    condition: (stats) => stats.streakDays >= 30,
  },
  {
    id: 'century_club',
    title: 'Клуб сотни',
    description: 'Выполнил 100 упражнений',
    icon: 'star',
    color: '#30D158',
    rarity: 'epic',
    condition: (stats) => stats.totalExercises >= 100,
  },
  {
    id: 'daily_goal',
    title: 'Цель достигнута',
    description: 'Выполнил дневную цель',
    icon: 'flag',
    color: '#30D158',
    rarity: 'common',
    condition: (stats) => stats.todayMinutes >= stats.dailyGoal && stats.dailyGoal > 0,
  },
  {
    id: 'early_bird',
    title: 'Ранняя пташка',
    description: 'Выполнил упражнение до 8 утра',
    icon: 'sunny-outline',
    color: '#FF9500',
    rarity: 'rare',
    condition: (stats) => stats.hasEarlyExercise,
  },
  {
    id: 'night_owl',
    title: 'Ночная сова',
    description: 'Выполнил упражнение после 22:00',
    icon: 'moon',
    color: '#5856D6',
    rarity: 'rare',
    condition: (stats) => stats.hasLateExercise,
  },
  {
    id: 'speed_demon',
    title: 'Скоростной демон',
    description: '5 упражнений за один день',
    icon: 'flash',
    color: '#FF3B30',
    rarity: 'rare',
    condition: (stats) => stats.todaySessions >= 5,
  },
  {
    id: 'marathon',
    title: 'Марафон',
    description: '60 минут упражнений за день',
    icon: 'fitness',
    color: '#FF9500',
    rarity: 'epic',
    condition: (stats) => stats.todayMinutes >= 60,
  },
  {
    id: 'consistency',
    title: 'Последовательность',
    description: '14 дней подряд',
    icon: 'calendar',
    color: '#007AFF',
    rarity: 'rare',
    condition: (stats) => stats.streakDays >= 14,
  },
  {
    id: 'explorer',
    title: 'Исследователь',
    description: 'Выполнил все типы упражнений',
    icon: 'compass',
    color: '#5856D6',
    rarity: 'epic',
    condition: (stats) => stats.completedExerciseIds.size >= 5,
  },
  {
    id: 'dedication',
    title: 'Преданность',
    description: '50 дней подряд - невероятно!',
    icon: 'heart',
    color: '#FF3B30',
    rarity: 'legendary',
    condition: (stats) => stats.streakDays >= 50,
  },
];

export const getRarityColor = (rarity: Achievement['rarity']): string => {
  switch (rarity) {
    case 'common':
      return '#30D158'; // Зеленый
    case 'rare':
      return '#007AFF'; // Синий
    case 'epic':
      return '#5856D6'; // Фиолетовый
    case 'legendary':
      return '#FFD700'; // Желтый
    default:
      return '#30D158';
  }
};

export const getRarityLabel = (rarity: Achievement['rarity']): string => {
  switch (rarity) {
    case 'common':
      return 'Обычное';
    case 'rare':
      return 'Редкое';
    case 'epic':
      return 'Эпическое';
    case 'legendary':
      return 'Легендарное';
    default:
      return 'Обычное';
  }
};

