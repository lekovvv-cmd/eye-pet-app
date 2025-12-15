import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Modal } from 'react-native';
import Reanimated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useProgress } from '../context/ProgressContext';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { useAchievements } from '../hooks/useAchievements';
import { getColors } from '../theme/colors';
import { PetAvatar } from '../components/PetAvatar';
import { eyeExercises } from '../data/exercises';
import { RootStackParamList } from '../navigation/types';
import { formatDuration } from '../utils/formatDuration';
import { AchievementBadge } from '../components/AchievementBadge';
import { getRarityColor } from '../types/achievements';
import { LinearGradient } from 'expo-linear-gradient';
import { Vibration } from 'react-native';

export const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { stats, logs, newlyUnlockedAchievements } = useProgress();
  const { settings, isReady, getDailyGoal } = useSettings();
  const { colors } = useTheme();
  const { getAchievement } = useAchievements();
  const [showProfessionPrompt, setShowProfessionPrompt] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<string | null>(null);
  const processedAchievementsRef = useRef<Set<string>>(new Set());

  // Показываем промпт персонализации при первом запуске
  useEffect(() => {
    if (isReady && !settings.isSetupComplete) {
      setShowProfessionPrompt(true);
    }
  }, [isReady, settings.isSetupComplete]);

  // Показываем модальное окно достижения только когда пользователь на главном экране
  useFocusEffect(
    useCallback(() => {
      if (newlyUnlockedAchievements.length > 0) {
        // Находим первое необработанное достижение
        const unprocessedAchievement = newlyUnlockedAchievements.find(
          id => !processedAchievementsRef.current.has(id)
        );
        
        if (unprocessedAchievement) {
          processedAchievementsRef.current.add(unprocessedAchievement);
          setCurrentAchievement(unprocessedAchievement);
          setShowAchievementModal(true);
          Vibration.vibrate([100, 50, 100, 50, 100]);
        }
      }
    }, [newlyUnlockedAchievements])
  );

  const recommended = useMemo(() => {
    // Находим дату последнего выполнения для каждого упражнения
    const exerciseLastDates = new Map<string, Date>();
    
    logs.forEach((log) => {
      const logDate = new Date(log.completedAt);
      const existingDate = exerciseLastDates.get(log.id);
      if (!existingDate || logDate > existingDate) {
        exerciseLastDates.set(log.id, logDate);
      }
    });

    // Находим упражнение, которое дольше всех не выполнялось
    let leastRecentExercise = eyeExercises[0];
    let oldestDate: Date | null = null;
    const now = Date.now();

    eyeExercises.forEach((exercise) => {
      const lastDate = exerciseLastDates.get(exercise.id);
      
      if (!lastDate) {
        // Если упражнение никогда не выполнялось, оно имеет наивысший приоритет
        // Используем очень старую дату для сравнения
        const neverDoneDate = new Date(0);
        if (!oldestDate || neverDoneDate < oldestDate) {
          leastRecentExercise = exercise;
          oldestDate = neverDoneDate;
        }
      } else {
        // Если упражнение выполнялось, выбираем то, у которого самая старая дата
        // (то есть дольше всех не выполнялось)
        if (!oldestDate || lastDate < oldestDate) {
          leastRecentExercise = exercise;
          oldestDate = lastDate;
        }
      }
    });

    return leastRecentExercise;
  }, [logs]);

  // Адаптируем настроение питомца под профессию
  const dailyGoal = getDailyGoal();
  const moodLevel = useMemo(() => {
    const baseLevel = Math.min(1, stats.todayMinutes / dailyGoal + stats.streakDays / 10);
    // Если профессия не выбрана, используем базовый расчет
    if (!settings.profession) {
      return Math.min(1, stats.todayMinutes / 5 + stats.streakDays / 10);
    }
    return baseLevel;
  }, [stats.todayMinutes, stats.streakDays, dailyGoal, settings.profession]);

  const goToExercise = () => {
    navigation.navigate('ExercisePlayer', { exerciseId: recommended.id });
  };

  const openPersonalization = () => {
    navigation.navigate('Personalization');
    setShowProfessionPrompt(false);
  };

  const styles = createStyles(colors);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>DeskEyes</Text>
        <Pressable 
          onPress={() => navigation.navigate('Settings')}
          style={styles.settingsButton}
        >
          <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
        </Pressable>
      </View>

      <PetAvatar
        moodLevel={moodLevel}
        streak={stats.streakDays}
      />

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.label}>Сегодня</Text>
          <Text style={styles.value}>{stats.todayMinutes.toFixed(1)} мин</Text>
          <Text style={styles.hint}>{stats.todaySessions} упражнений</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.label}>За неделю</Text>
          <Text style={styles.value}>{stats.weeklyMinutes.toFixed(1)} мин</Text>
          <Text style={styles.hint}>Серия {stats.streakDays} дн.</Text>
        </View>
      </View>

      <View style={styles.cardCTA}>
        <Text style={styles.ctaTitle}>Рекомендовано сейчас</Text>
        <Text style={styles.ctaExercise}>{recommended.title}</Text>
        <View style={styles.ctaMetaRow}>
          <View style={styles.ctaMetaItem}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.ctaHint}>{formatDuration(recommended.duration)}</Text>
          </View>
          <View style={styles.ctaMetaItem}>
            <Ionicons name="list-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.ctaHint}>{recommended.steps.length} шага</Text>
          </View>
        </View>
        {settings.profession && (
          <View style={styles.goalHint}>
            <Ionicons name="flag-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.goalHintText}>
              Цель дня: {dailyGoal} мин ({stats.todayMinutes.toFixed(1)}/{dailyGoal})
            </Text>
          </View>
        )}
        <Pressable style={styles.ctaButton} onPress={goToExercise}>
          <Text style={styles.ctaButtonText}>Начать</Text>
        </Pressable>
      </View>

      <View style={styles.historyBlock}>
        <Pressable 
          onPress={() => navigation.navigate('Dashboard', { scrollTo: 'history' })}
          style={styles.historyTitleContainer}
        >
          <Text style={styles.historyTitle}>Последние активности</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </Pressable>
        {logs.slice(0, 4).map((log) => {
          const logDate = new Date(log.completedAt);
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          let dateText = '';
          if (logDate.toDateString() === today.toDateString()) {
            dateText = 'Сегодня';
          } else if (logDate.toDateString() === yesterday.toDateString()) {
            dateText = 'Вчера';
          } else {
            dateText = logDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
          }
          
          return (
            <View key={log.completedAt} style={styles.historyRow}>
              <View style={styles.historyLeft}>
                <Text style={styles.historyExercise}>{log.title}</Text>
                <Text style={styles.historyDate}>{dateText}</Text>
              </View>
              <Text style={styles.historyMeta}>
                {logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          );
        })}
        {!logs.length && <Text style={styles.hint}>Пока нет данных — начни с короткого упражнения.</Text>}
      </View>

      <Modal
        visible={showProfessionPrompt}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProfessionPrompt(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="person-circle-outline" size={64} color={colors.accent} />
            <Text style={styles.modalTitle}>Давай познакомимся!</Text>
            <Text style={styles.modalText}>
              Ответь на несколько вопросов, и мы создадим персональную программу для твоих глаз
            </Text>
            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowProfessionPrompt(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Позже</Text>
              </Pressable>
              <Pressable 
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={openPersonalization}
              >
                <Text style={styles.modalButtonTextPrimary}>Начать</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAchievementModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowAchievementModal(false);
          setCurrentAchievement(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <Reanimated.View 
            entering={FadeInDown.duration(500)}
            style={styles.achievementModal}
          >
            {currentAchievement && getAchievement(currentAchievement as any) && (
              <>
                <LinearGradient
                  colors={[
                    getRarityColor(getAchievement(currentAchievement as any)!.rarity) + '20',
                    getRarityColor(getAchievement(currentAchievement as any)!.rarity) + '10'
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.achievementModalGradient}
                >
                  <View style={styles.achievementModalContent}>
                    <Text style={styles.achievementModalTitle}>🎉 Достижение разблокировано!</Text>
                    <AchievementBadge
                      achievement={{
                        ...getAchievement(currentAchievement as any)!,
                        isUnlocked: true,
                      }}
                      size="large"
                    />
                    <Text style={styles.achievementModalName}>
                      {getAchievement(currentAchievement as any)!.title}
                    </Text>
                    <Text style={styles.achievementModalDescription}>
                      {getAchievement(currentAchievement as any)!.description}
                    </Text>
                    <Pressable
                      style={styles.achievementModalButton}
                      onPress={() => {
                        setShowAchievementModal(false);
                        setCurrentAchievement(null);
                      }}
                    >
                      <Text style={styles.achievementModalButtonText}>Отлично!</Text>
                    </Pressable>
                  </View>
                </LinearGradient>
              </>
            )}
          </Reanimated.View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const createStyles = (colors: ReturnType<typeof getColors>) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 60,
    gap: 28
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  header: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
    flex: 1
  },
  settingsButton: {
    padding: 8
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    gap: 6,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.1,
    marginBottom: 4
  },
  value: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.5
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '400'
  },
  cardCTA: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    gap: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border
  },
  ctaTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  ctaExercise: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3
  },
  ctaMetaRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4
  },
  ctaMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  ctaHint: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '400'
  },
  goalHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.accentSoft,
    borderRadius: 12
  },
  goalHintText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500'
  },
  ctaButton: {
    marginTop: 8,
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  ctaButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 17,
    letterSpacing: -0.2
  },
  historyBlock: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    gap: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border
  },
  historyTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  historyLeft: {
    flex: 1,
    gap: 4
  },
  historyExercise: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500'
  },
  historyDate: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '400'
  },
  historyMeta: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '400'
  },
  achievementModal: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  achievementModalGradient: {
    padding: 32,
    alignItems: 'center',
    gap: 20,
    backgroundColor: colors.card,
  },
  achievementModalContent: {
    alignItems: 'center',
    gap: 16,
    width: '100%'
  },
  achievementModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.3
  },
  achievementModalName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginTop: 8
  },
  achievementModalDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22
  },
  achievementModalButton: {
    marginTop: 8,
    backgroundColor: colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 20,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  achievementModalButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: colors.shadowStrong,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 12
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
    textAlign: 'center',
    marginTop: 8
  },
  modalText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    width: '100%'
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center'
  },
  modalButtonSecondary: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border
  },
  modalButtonPrimary: {
    backgroundColor: colors.accent
  },
  modalButtonTextSecondary: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600'
  },
  modalButtonTextPrimary: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600'
  }
});
