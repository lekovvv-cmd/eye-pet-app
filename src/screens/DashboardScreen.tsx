import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Animated, StyleSheet, Text, View, ScrollView, Pressable, Dimensions, Modal } from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { TabParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useProgress } from '../context/ProgressContext';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { useAchievements } from '../hooks/useAchievements';
import { getColors } from '../theme/colors';
import { formatDuration } from '../utils/formatDuration';
import { LinearGradient } from 'expo-linear-gradient';
import { CircularProgress } from '../components/CircularProgress';
import { AchievementBadge } from '../components/AchievementBadge';
import { Vibration } from 'react-native';
import { getRarityColor } from '../types/achievements';
import { RootStackParamList } from '../navigation/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const dayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const DashboardScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<BottomTabScreenProps<TabParamList, 'Dashboard'>['route']>();
  const scrollViewRef = useRef<ScrollView>(null);
  const historyRef = useRef<View>(null);
  const { colors } = useTheme();
  const { stats, logs, newlyUnlockedAchievements } = useProgress();
  const { getDailyGoal, settings } = useSettings();
  const { getAllAchievements, getProgress, getAchievement } = useAchievements();
  const [isMotivationExpanded, setIsMotivationExpanded] = useState(false);
  
  // Анимации для мотивационной карточки
  const motivationScale = useSharedValue(1);
  const motivationRotation = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0);
  
  const achievements = getAllAchievements;
  const achievementProgress = getProgress();
  const recentAchievements = achievements.filter(a => a.isUnlocked).slice(0, 6);

  const weekly = useMemo(() => {
    const now = new Date();
    // Находим понедельник текущей недели
    const monday = new Date(now);
    const dayOfWeek = now.getDay(); // 0 = воскресенье, 1 = понедельник, ..., 6 = суббота
    // Вычисляем, сколько дней назад был понедельник
    // Если сегодня воскресенье (0), то понедельник был 6 дней назад
    // Если сегодня понедельник (1), то понедельник сегодня (0 дней назад)
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    monday.setDate(now.getDate() - daysFromMonday);
    monday.setHours(0, 0, 0, 0);
    
    // Создаем массив из 7 дней, начиная с понедельника
    return Array.from({ length: 7 }).map((_, index) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + index);
      const minutes = logs
        .filter((log) => new Date(log.completedAt).toDateString() === day.toDateString())
        .reduce((sum, log) => sum + log.duration / 60, 0);
      return {
        label: dayLabels[index], // Пн, Вт, Ср, Чт, Пт, Сб, Вс
        minutes,
        date: day
      };
    });
  }, [logs]);

  const bestSession = useMemo(() => {
    if (!logs.length) {
      return null;
    }
    return logs.reduce((best, current) => (current.duration > best.duration ? current : best));
  }, [logs]);

  const getMotivationalMessage = () => {
    if (stats.streakDays === 0 && stats.todaySessions === 0) {
      return {
        title: 'Начни свой путь!',
        message: 'Выполни первое упражнение и начни заботиться о своих глазах',
        icon: 'rocket-outline',
        gradient: [colors.accent],
        tips: ['Регулярность важнее длительности', 'Начни с коротких упражнений', 'Делай перерывы каждые 20 минут']
      };
    }
    if (stats.streakDays >= 7) {
      return {
        title: 'Невероятная серия!',
        message: `Ты уже ${stats.streakDays} дней подряд заботишься о глазах. Продолжай в том же духе!`,
        icon: 'flame',
        gradient: [colors.warning],
        tips: ['Ты на правильном пути!', 'Твои глаза скажут спасибо', 'Поделись успехом с друзьями']
      };
    }
    if (stats.streakDays >= 3) {
      return {
        title: 'Отличная работа!',
        message: `Твоя серия уже ${stats.streakDays} дня! Не останавливайся!`,
        icon: 'star',
        gradient: [colors.accent],
        tips: ['Каждый день имеет значение', 'Ты формируешь полезную привычку', 'Продолжай завтра']
      };
    }
    if (stats.todaySessions > 0) {
      return {
        title: 'Молодец!',
        message: `Сегодня ты уже выполнил ${stats.todaySessions} упражнений. Продолжай!`,
        icon: 'checkmark-circle',
        gradient: [colors.success],
        tips: ['Отличное начало дня!', 'Помни о регулярности', 'Твои глаза будут благодарны']
      };
    }
    return {
      title: 'Ты на правильном пути!',
      message: 'Каждое упражнение делает твои глаза здоровее',
      icon: 'heart',
      gradient: [colors.accent],
      tips: ['Начни с короткого упражнения', 'Делай регулярно', 'Следи за прогрессом']
    };
  };

  const motivation = getMotivationalMessage();
  const avgPerDay = stats.totalMinutes / Math.max(1, stats.streakDays || 1);
  const dailyGoal = getDailyGoal();
  const weeklyGoal = dailyGoal * 7;
  const weeklyProgress = Math.min(100, (stats.weeklyMinutes / weeklyGoal) * 100);
  const maxWeeklyMinutes = Math.max(...weekly.map(d => d.minutes), 1);

  // Анимация пульсации для мотивационной карточки
  useEffect(() => {
    motivationScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    
    sparkleOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0.3, { duration: 1500 })
      ),
      -1,
      false
    );
  }, []);

  const motivationAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: motivationScale.value }],
  }));

  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
  }));

  const handleMotivationPress = () => {
    setIsMotivationExpanded(!isMotivationExpanded);
    motivationRotation.value = withSpring(isMotivationExpanded ? 0 : 180, {
      damping: 10,
      stiffness: 100,
    });
  };

  const rotationAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${motivationRotation.value}deg` }],
  }));

  // Прокрутка к истории при получении параметра
  useFocusEffect(
    useCallback(() => {
      const scrollToHistory = route.params?.scrollTo === 'history';
      if (scrollToHistory) {
        setTimeout(() => {
          historyRef.current?.measureLayout(
            scrollViewRef.current as any,
            (x, y) => {
              scrollViewRef.current?.scrollTo({ 
                y: Math.max(0, y - 80), 
                animated: true 
              });
            },
            () => {}
          );
        }, 500);
      }
      
      return () => {
        // Очищаем параметр при размонтировании, чтобы можно было прокрутить снова
        if (scrollToHistory) {
          navigation.setParams({ scrollTo: undefined } as any);
        }
      };
    }, [route.params?.scrollTo, navigation])
  );

  const styles = createStyles(colors);

  return (
    <ScrollView 
      ref={scrollViewRef}
      style={styles.screen} 
      contentContainerStyle={styles.content} 
      showsVerticalScrollIndicator={false}
    >
      <Reanimated.View entering={FadeInDown.duration(600).delay(100)}>
        <Text style={styles.header}>Прогресс</Text>
      </Reanimated.View>
      
      <Reanimated.View 
        entering={FadeInDown.duration(600).delay(200)}
      >
        <Reanimated.View style={motivationAnimatedStyle}>
          <Pressable onPress={handleMotivationPress} style={styles.motivationCardPressable}>
          <LinearGradient
            colors={[motivation.gradient[0], motivation.gradient[0] + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.motivationCard}
          >
            <View style={styles.motivationContent}>
              <View style={styles.motivationIconContainer}>
                <Ionicons name={motivation.icon as any} size={48} color="#fff" />
                <Reanimated.View style={[styles.sparkles, sparkleAnimatedStyle]}>
                  <Ionicons name="sparkles" size={24} color="#fff" style={styles.sparkle1} />
                  <Ionicons name="sparkles" size={20} color="#fff" style={styles.sparkle2} />
                </Reanimated.View>
              </View>
              <View style={styles.motivationText}>
                <Text style={styles.motivationTitle}>{motivation.title}</Text>
                <Text style={styles.motivationMessage}>{motivation.message}</Text>
              </View>
              <Reanimated.View style={rotationAnimatedStyle}>
                <Ionicons name="chevron-down" size={24} color="#fff" style={{ opacity: 0.8 }} />
              </Reanimated.View>
            </View>
            
            {isMotivationExpanded && (
              <Reanimated.View 
                entering={FadeInDown.duration(400)}
                style={styles.tipsContainer}
              >
                {motivation.tips.map((tip, index) => (
                  <Reanimated.View 
                    key={index} 
                    entering={FadeInDown.duration(300).delay(index * 100)}
                    style={styles.tipItem}
                  >
                    <Ionicons name="checkmark-circle" size={18} color="#fff" style={{ opacity: 0.95 }} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </Reanimated.View>
                ))}
              </Reanimated.View>
            )}
          </LinearGradient>
          </Pressable>
        </Reanimated.View>
      </Reanimated.View>
      <Reanimated.View 
        entering={FadeInDown.duration(600).delay(300)}
        style={styles.summaryRow}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={[styles.iconCircle, { backgroundColor: colors.accentSoft }]}>
              <Ionicons name="time" size={24} color={colors.accent} />
            </View>
            <Text style={[styles.label, { fontSize: 12 }]}>
              Всего{'\n'}практики
            </Text>
          </View>
          <View style={styles.valueContainer}>
            <Text 
              style={styles.value} 
              numberOfLines={1} 
              adjustsFontSizeToFit 
              minimumFontScale={0.6}
              allowFontScaling={true}
            >
              {stats.totalMinutes.toFixed(1)} мин
            </Text>
          </View>
          {stats.streakDays > 0 && (
            <Text style={styles.hint} numberOfLines={1}>
              ~{avgPerDay.toFixed(1)} мин/день
            </Text>
          )}
        </View>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={[styles.iconCircle, { backgroundColor: colors.warningLight }]}>
              <Ionicons name="flame" size={24} color={colors.warning} />
            </View>
            <Text style={styles.label}>Серия</Text>
          </View>
          <View style={styles.valueContainer}>
            <Text 
              style={styles.value} 
              numberOfLines={1} 
              adjustsFontSizeToFit 
              minimumFontScale={0.6}
              allowFontScaling={true}
            >
              {stats.streakDays} дн.
            </Text>
          </View>
          {stats.streakDays > 0 && (
            <Text style={styles.hint} numberOfLines={1}>
              Продолжай!
            </Text>
          )}
        </View>
      </Reanimated.View>

      {stats.weeklyMinutes > 0 && (
        <Reanimated.View 
          entering={FadeInDown.duration(600).delay(500)}
          style={styles.goalCard}
        >
          <View style={styles.goalHeader}>
            <View style={styles.goalHeaderLeft}>
              <Ionicons name="flag" size={22} color={colors.accent} />
              <Text style={styles.goalTitle}>Цель недели</Text>
            </View>
          </View>
          <View style={styles.goalContent}>
            <CircularProgress 
              progress={weeklyProgress} 
              size={120}
              color={colors.accent}
              backgroundColor={colors.accentLight}
            />
            <View style={styles.goalTextContainer}>
              <Text style={styles.goalMainValue}>
                {stats.weeklyMinutes.toFixed(1)} / {weeklyGoal} мин
              </Text>
              <Text style={styles.goalHint}>
                Осталось: {(weeklyGoal - stats.weeklyMinutes).toFixed(1)} мин
              </Text>
            </View>
          </View>
        </Reanimated.View>
      )}

      <Reanimated.View 
        entering={FadeInDown.duration(600).delay(600)}
        style={styles.achievementsRow}
      >
        {stats.streakDays > 0 && (
          <View style={styles.achievementCard}>
            <View style={[styles.achievementIconContainer, { backgroundColor: colors.warningLight }]}>
              <Ionicons name="flame" size={28} color={colors.warning} />
            </View>
            <View style={styles.achievementText}>
              <Text style={styles.achievementTitle}>Активная серия</Text>
              <Text style={styles.achievementValue}>
                {stats.streakDays} {stats.streakDays === 1 ? 'день' : stats.streakDays < 5 ? 'дня' : 'дней'} подряд!
              </Text>
            </View>
          </View>
        )}

        {stats.todaySessions > 0 && (
          <View style={styles.achievementCard}>
            <View style={[styles.achievementIconContainer, { backgroundColor: colors.accentSoft }]}>
              <Ionicons name="today" size={28} color={colors.accent} />
            </View>
            <View style={styles.achievementText}>
              <Text style={styles.achievementTitle}>Сегодня</Text>
              <Text style={styles.achievementValue}>
                {stats.todaySessions} {stats.todaySessions === 1 ? 'упражнение' : stats.todaySessions < 5 ? 'упражнения' : 'упражнений'}
              </Text>
            </View>
          </View>
        )}
      </Reanimated.View>

      <Reanimated.View 
        entering={FadeInDown.duration(600).delay(400)}
        style={styles.chartCard}
      >
        <View style={styles.chartHeader}>
          <Ionicons name="calendar" size={22} color={colors.accent} />
          <Text style={styles.chartTitle}>Активность недели</Text>
        </View>
        <View style={styles.chartContainer}>
          <View style={styles.chartRow}>
            {weekly.map((day, index) => {
              const height = Math.max(8, (day.minutes / maxWeeklyMinutes) * 120);
              const today = new Date();
              const isToday = day.date && day.date.toDateString() === today.toDateString();
              return (
                <Reanimated.View 
                  key={day.label} 
                  entering={FadeInDown.duration(400).delay(500 + index * 50)}
                  style={styles.chartBarWrapper}
                >
                  <View style={styles.chartBarContainer}>
                    {day.minutes > 0 && (
                      <Text style={[styles.chartValue, { 
                        color: isToday ? colors.accent : colors.textSecondary,
                        bottom: height + 8,
                      }]}>
                        {day.minutes.toFixed(0)}
                      </Text>
                    )}
                    <View 
                      style={[
                        styles.chartBar, 
                        { 
                          height,
                          backgroundColor: isToday ? colors.accent : colors.accent + '80',
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.chartLabel, { fontWeight: isToday ? '600' : '500' }]}>
                    {day.label}
                  </Text>
                </Reanimated.View>
              );
            })}
          </View>
          <View style={styles.chartStats}>
            <View style={styles.chartStatItem}>
              <Ionicons name="trending-up" size={16} color={colors.success} />
              <Text style={styles.chartStatText}>
                Макс: {maxWeeklyMinutes.toFixed(1)} мин
              </Text>
            </View>
            <View style={styles.chartStatItem}>
              <Ionicons name="stats-chart" size={16} color={colors.accent} />
              <Text style={styles.chartStatText}>
                Среднее: {(weekly.reduce((sum, d) => sum + d.minutes, 0) / 7).toFixed(1)} мин/день
              </Text>
            </View>
          </View>
        </View>
      </Reanimated.View>

      <Reanimated.View 
        entering={FadeInDown.duration(600).delay(600)}
        style={styles.chartCard}
      >
        <View style={styles.chartHeader}>
          <Ionicons name="trending-up" size={22} color={colors.success} />
          <Text style={styles.chartTitle}>Прогресс по дням</Text>
        </View>
        <View style={styles.progressChartContainer}>
          <View style={styles.progressChartRow}>
            {weekly.map((day, index) => {
              const progress = Math.min(100, (day.minutes / dailyGoal) * 100);
              const today = new Date();
              const isToday = day.date && day.date.toDateString() === today.toDateString();
              return (
                <Reanimated.View 
                  key={day.label} 
                  entering={FadeInDown.duration(400).delay(650 + index * 50)}
                  style={styles.progressChartBarWrapper}
                >
                  <View style={styles.progressChartBarContainer}>
                    <Text style={[styles.progressChartValue, { 
                      color: progress > 0 
                        ? (isToday ? colors.success : colors.textSecondary)
                        : colors.textSecondary,
                      bottom: progress > 0 ? (progress / 100) * 120 + 8 : 8,
                    }]}>
                      {progress.toFixed(0)}%
                    </Text>
                    <View style={styles.progressChartBarTrack}>
                      {progress > 0 && (
                        <LinearGradient
                          colors={isToday 
                            ? [colors.success, colors.success + 'CC'] 
                            : [colors.success + '80', colors.success + '40']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 0, y: 1 }}
                          style={[styles.progressChartBarFill, { height: `${progress}%` }]}
                        />
                      )}
                    </View>
                  </View>
                  <Text style={[styles.progressChartLabel, { fontWeight: isToday ? '600' : '500' }]}>
                    {day.label}
                  </Text>
                </Reanimated.View>
              );
            })}
          </View>
          <View style={styles.progressChartGoal}>
            <Ionicons name="flag" size={14} color={colors.textSecondary} />
            <Text style={styles.progressChartGoalText}>
              Цель: {dailyGoal} мин/день
            </Text>
          </View>
        </View>
      </Reanimated.View>

      <View ref={historyRef}>
        <Reanimated.View 
          entering={FadeInDown.duration(600).delay(700)}
          style={styles.timelineCard}
        >
        <View style={styles.timelineHeader}>
          <Ionicons name="time-outline" size={22} color={colors.accent} />
          <Text style={styles.chartTitle}>История</Text>
        </View>
        {logs.slice(0, 6).map((log, index) => (
          <Reanimated.View 
            key={log.completedAt} 
            entering={FadeInDown.duration(300).delay(800 + index * 50)}
            style={styles.timelineRow}
          >
            <View style={styles.timelineDotContainer}>
              <View style={styles.dot} />
              {index < logs.slice(0, 6).length - 1 && <View style={styles.timelineLine} />}
            </View>
            <View style={styles.timelineText}>
              <Text style={styles.timelineTitle}>{log.title}</Text>
              <Text style={styles.timelineMeta}>
                {new Date(log.completedAt).toLocaleDateString('ru-RU', { 
                  day: 'numeric', 
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })} · {formatDuration(log.duration)}
              </Text>
            </View>
          </Reanimated.View>
        ))}
        {!logs.length && (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={48} color={colors.textSecondary} style={{ opacity: 0.3 }} />
            <Text style={styles.emptyStateText}>История появится после первого занятия</Text>
          </View>
        )}
        </Reanimated.View>
      </View>

      {bestSession && (
        <Reanimated.View 
          entering={FadeInDown.duration(600).delay(900)}
          style={styles.highlightCard}
        >
          <LinearGradient
            colors={[colors.accent, colors.accent + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.highlightGradient}
          >
            <View style={styles.highlightHeader}>
              <View style={styles.highlightIconContainer}>
                <Ionicons name="medal" size={32} color="#fff" />
              </View>
              <Text style={styles.highlightTitle}>Лучшее занятие</Text>
            </View>
            <Text style={styles.highlightExercise}>{bestSession.title}</Text>
            <View style={styles.highlightMetaContainer}>
              <Ionicons name="time" size={18} color="#fff" style={{ opacity: 0.9 }} />
              <Text style={styles.highlightMeta}>{formatDuration(bestSession.duration)}</Text>
            </View>
          </LinearGradient>
        </Reanimated.View>
      )}

      <Pressable 
        onPress={() => navigation.navigate('Achievements')}
        style={({ pressed }) => [
          styles.achievementsSection,
          pressed && styles.achievementsSectionPressed
        ]}
      >
        <Reanimated.View entering={FadeInDown.duration(600).delay(1000)}>
          <View style={styles.achievementsSectionHeader}>
            <View style={styles.achievementsSectionTitleRow}>
              <Ionicons name="trophy" size={24} color={colors.accent} />
              <Text style={styles.achievementsSectionTitle}>Достижения</Text>
            </View>
            <Pressable 
              onPress={() => navigation.navigate('Achievements')}
              style={styles.achievementsViewAll}
            >
              <Text style={styles.achievementsViewAllText}>Все</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.accent} />
            </Pressable>
          </View>
          <View style={styles.achievementsProgress}>
            <Text style={styles.achievementsProgressText}>
              {achievementProgress.unlocked} / {achievementProgress.total}
            </Text>
            <View style={styles.achievementsProgressBar}>
              <View 
                style={[
                  styles.achievementsProgressFill, 
                  { width: `${achievementProgress.percentage}%` }
                ]} 
              />
            </View>
          </View>
          
          {recentAchievements.length > 0 ? (
            <View style={styles.achievementsGridContainer}>
              <View style={styles.achievementsGrid}>
              {recentAchievements.map((achievement) => (
                <View key={achievement.id} style={styles.achievementGridItem}>
                  <AchievementBadge
                    achievement={achievement}
                    size="medium"
                    showDetails={true}
                  />
                </View>
              ))}
              </View>
            </View>
          ) : (
            <View style={styles.achievementsEmpty}>
              <Ionicons name="trophy-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.achievementsEmptyText}>
                Выполняй упражнения, чтобы разблокировать достижения!
              </Text>
            </View>
          )}
        </Reanimated.View>
      </Pressable>

    </ScrollView>
  );
};

const createStyles = (colors: ReturnType<typeof getColors>) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 24,
    gap: 20,
    paddingBottom: 48,
    paddingTop: 60
  },
  header: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 4
  },
  motivationCardPressable: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: colors.shadowStrong,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
  },
  motivationCard: {
    borderRadius: 28,
    padding: 28,
    overflow: 'hidden',
  },
  motivationIconContainer: {
    position: 'relative',
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkles: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  sparkle1: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  sparkle2: {
    position: 'absolute',
    bottom: -8,
    left: -8,
  },
  motivationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  motivationText: {
    flex: 1,
    gap: 6
  },
  motivationTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3
  },
  motivationMessage: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.95,
    lineHeight: 22,
    fontWeight: '400'
  },
  tipsContainer: {
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)'
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  tipText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    lineHeight: 20
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.1,
    flex: 1
  },
  valueContainer: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 4,
    width: '100%',
  },
  value: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
    lineHeight: 38,
    includeFontPadding: false,
    textAlignVertical: 'center',
    width: '100%',
    flexShrink: 0,
    maxWidth: '100%',
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '400',
    marginTop: 4
  },
  goalCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    gap: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border
  },
  goalHeader: {
    marginBottom: 8
  },
  goalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24
  },
  goalTextContainer: {
    flex: 1,
    gap: 6
  },
  goalMainValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3
  },
  goalHint: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '400'
  },
  chartCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    gap: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3
  },
  chartContainer: {
    gap: 16
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 8,
    minHeight: 160
  },
  chartBarWrapper: {
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  chartBarContainer: {
    width: '100%',
    maxWidth: 32,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 160,
    position: 'relative',
  },
  chartBar: {
    width: '100%',
    maxWidth: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    minHeight: 8,
  },
  chartLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 4
  },
  chartValue: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
    position: 'absolute',
  },
  chartStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 16
  },
  chartStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1
  },
  chartStatText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500'
  },
  progressChartContainer: {
    gap: 16
  },
  progressChartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 8,
    minHeight: 160
  },
  progressChartBarWrapper: {
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  progressChartBarContainer: {
    width: '100%',
    maxWidth: 32,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 160,
    position: 'relative',
  },
  progressChartBarTrack: {
    width: '100%',
    maxWidth: 28,
    height: 120,
    borderRadius: 14,
    backgroundColor: colors.accentLight + '40',
    overflow: 'hidden',
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressChartBarFill: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderRadius: 14,
    minHeight: 4
  },
  progressChartLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 4
  },
  progressChartValue: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
    position: 'absolute',
    zIndex: 10,
  },
  progressChartValueInside: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
  },
  progressChartGoal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  progressChartGoalText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500'
  },
  timelineCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    gap: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
    paddingVertical: 4
  },
  timelineDotContainer: {
    alignItems: 'center',
    width: 12,
    flexShrink: 0,
    position: 'relative'
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
    marginTop: 6,
    zIndex: 1
  },
  timelineLine: {
    position: 'absolute',
    width: 2,
    height: 40,
    backgroundColor: colors.border,
    top: 18,
    left: 5
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12
  },
  emptyStateText: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '400'
  },
  timelineText: {
    flex: 1
  },
  timelineTitle: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4
  },
  timelineMeta: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '400'
  },
  achievementsRow: {
    gap: 12
  },
  achievementCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border
  },
  achievementIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementText: {
    flex: 1
  },
  achievementTitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
    letterSpacing: -0.1
  },
  achievementValue: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3
  },
  highlightCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6
  },
  highlightGradient: {
    padding: 28,
    gap: 12
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8
  },
  highlightIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4
  },
  highlightTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: -0.3
  },
  highlightExercise: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: -0.3
  },
  highlightMeta: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '400',
    opacity: 0.9
  },
  achievementsSection: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    gap: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2
  },
  achievementsSectionPressed: {
    opacity: 0.8
  },
  achievementsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  achievementsSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  achievementsViewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.accentSoft
  },
  achievementsViewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent
  },
  achievementsSectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3
  },
  achievementsProgress: {
    gap: 8,
    marginBottom: 24
  },
  achievementsProgressText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500'
  },
  achievementsProgressBar: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.accentLight,
    overflow: 'hidden'
  },
  achievementsProgressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 999
  },
  achievementsGridContainer: {
    marginTop: 0
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between'
  },
  achievementGridItem: {
    width: (SCREEN_WIDTH - 48 - 24) / 3, // (ширина экрана - padding - gap) / 3 элемента
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'flex-start'
  },
  achievementsEmpty: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12
  },
  achievementsEmptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280
  },
});
