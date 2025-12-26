import { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, useWindowDimensions, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
  FadeIn,
  FadeInDown
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getColors } from '../theme/colors';
import { useSettings } from '../context/SettingsContext';
import { 
  registerForPushNotificationsAsync, 
  scheduleBreakReminders, 
  cancelBreakReminders 
} from '../utils/notifications';

export const FocusScreen = () => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const { colors } = useTheme();
  const { settings } = useSettings();
  const [isActive, setIsActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [nextBreakIn, setNextBreakIn] = useState(5); // 5 секунд
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const breakIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerStartTimeRef = useRef<number | null>(null);
  const appState = useRef(AppState.currentState);
  
  // Reanimated values
  const timerScale = useSharedValue(1);
  const timerPulse = useSharedValue(1);
  const breakProgress = useSharedValue(0);
  const breakCardOpacity = useSharedValue(0);
  const breakCardScale = useSharedValue(0.9);

  // Адаптивные размеры
  const TIMER_SIZE = Math.min(SCREEN_WIDTH * 0.65, 280);
  const isSmallScreen = SCREEN_HEIGHT < 700;
  const paddingHorizontal = Math.max(20, Math.min(24, SCREEN_WIDTH * 0.06));

  const TIMER_STORAGE_KEY = 'focus-timer-start-time';
  const BREAK_INTERVAL = 5; // 5 секунд

  useEffect(() => {
    registerForPushNotificationsAsync();
    
    // Восстанавливаем таймер при загрузке
    const restoreTimer = async () => {
      try {
        const startTimeStr = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
        if (startTimeStr) {
          const startTime = parseInt(startTimeStr, 10);
          const now = Date.now();
          const elapsed = Math.floor((now - startTime) / 1000);
          setElapsedTime(elapsed);
          timerStartTimeRef.current = startTime;
          setIsActive(true);
        }
      } catch (error) {
        console.warn('Failed to restore timer', error);
      }
    };
    
    restoreTimer();
  }, []);

  // Обработка изменения состояния приложения (фон/актив)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isActive]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // Приложение вернулось в активное состояние
      if (isActive && timerStartTimeRef.current) {
        const now = Date.now();
        const elapsed = Math.floor((now - timerStartTimeRef.current) / 1000);
        setElapsedTime(elapsed);
        
        // Пересчитываем nextBreakIn
        const timeSinceStart = elapsed;
        const breaksPassed = Math.floor(timeSinceStart / BREAK_INTERVAL);
        const nextBreakTime = (breaksPassed + 1) * BREAK_INTERVAL;
        const remaining = nextBreakTime - timeSinceStart;
        setNextBreakIn(Math.max(0, remaining));
      }
    }
    appState.current = nextAppState;
  };

  useEffect(() => {
    if (isActive) {
      // Анимация пульсации таймера
      timerPulse.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );

      // Показываем карточку перерыва
      breakCardOpacity.value = withTiming(1, { duration: 400 });
      breakCardScale.value = withSpring(1, { damping: 12 });

      // Сохраняем время старта
      const startTime = Date.now();
      timerStartTimeRef.current = startTime;
      AsyncStorage.setItem(TIMER_STORAGE_KEY, startTime.toString());

      // Таймер общего времени
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);
        
        // Пересчитываем nextBreakIn
        const breaksPassed = Math.floor(elapsed / BREAK_INTERVAL);
        const nextBreakTime = (breaksPassed + 1) * BREAK_INTERVAL;
        const remaining = nextBreakTime - elapsed;
        const newValue = Math.max(0, remaining);
        setNextBreakIn(newValue);
        
        // Обновляем прогресс (0-1)
        breakProgress.value = withTiming(1 - (newValue / BREAK_INTERVAL), { duration: 1000 });
      }, 1000);

      // Планируем уведомления
      scheduleBreakReminders({
        notificationsEnabled: settings.notificationsEnabled,
        doNotDisturb: settings.doNotDisturb,
      }).catch((error) => {
        console.error('Failed to schedule break reminders:', error);
      });
    } else {
      // Скрываем карточку перерыва
      breakCardOpacity.value = withTiming(0, { duration: 300 });
      breakCardScale.value = withTiming(0.9, { duration: 300 });
      timerPulse.value = 1;
      breakProgress.value = 0;

      // Очищаем сохраненное время
      timerStartTimeRef.current = null;
      AsyncStorage.removeItem(TIMER_STORAGE_KEY);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (breakIntervalRef.current) {
        clearInterval(breakIntervalRef.current);
      }
      cancelBreakReminders();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (breakIntervalRef.current) {
        clearInterval(breakIntervalRef.current);
      }
    };
  }, [isActive]);

  const handleToggle = () => {
    if (!isActive) {
      // Анимация при старте
      timerScale.value = withSequence(
        withSpring(1.15, { damping: 6, stiffness: 200 }),
        withSpring(1, { damping: 8, stiffness: 200 })
      );
    } else {
      // Сброс при остановке
      setElapsedTime(0);
      setNextBreakIn(BREAK_INTERVAL);
      breakProgress.value = 0;
    }
    setIsActive(!isActive);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBreakTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Animated styles
  const timerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: timerScale.value * timerPulse.value }
    ]
  }));

  const breakCardOpacityStyle = useAnimatedStyle(() => ({
    opacity: breakCardOpacity.value,
  }));

  const breakCardScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breakCardScale.value }]
  }));

  const breakProgressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${breakProgress.value * 100}%`
  }));

  const breakProgressOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(breakProgress.value, [0, 0.1, 1], [0.3, 0.5, 1])
  }));

  const styles = createStyles(colors);

  return (
    <ScrollView 
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingHorizontal, paddingTop: isSmallScreen ? 40 : 60 }
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View 
        entering={FadeInDown.duration(600).delay(100)}
        style={styles.header}
      >
        <Text style={[styles.title, { fontSize: isSmallScreen ? 32 : 36 }]}>
          Фокусировка
        </Text>
        <Text style={[styles.subtitle, { fontSize: isSmallScreen ? 15 : 17 }]}>
          {isActive 
            ? 'Ты в режиме работы. Мы напомним о перерывах' 
            : 'Начни работу, и мы будем напоминать о перерывах каждые 5 секунд'}
        </Text>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.duration(600).delay(200)}
        style={styles.timerContainer}
      >
        <Animated.View style={timerAnimatedStyle}>
          <Pressable 
            onPress={handleToggle}
            style={({ pressed }) => [
              styles.timerCircle, 
              { width: TIMER_SIZE, height: TIMER_SIZE, borderRadius: TIMER_SIZE / 2 },
              pressed && styles.timerCirclePressed
            ]}
          >
            <Text style={[styles.timerValue, { fontSize: isSmallScreen ? 40 : 48 }]}>
              {formatTime(elapsedTime)}
            </Text>
            <Text style={[styles.timerLabel, { fontSize: isSmallScreen ? 14 : 16 }]}>
              {isActive ? 'Остановить' : 'Начать'}
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>

      {isActive && (
        <Animated.View 
          style={breakCardOpacityStyle}
        >
          <Animated.View 
            style={[styles.breakCard, breakCardScaleStyle]}
          >
            <View style={styles.breakHeader}>
              <Ionicons name="time-outline" size={22} color={colors.accent} />
              <Text style={styles.breakTitle}>Следующий перерыв через</Text>
            </View>
            <Text style={[styles.breakTime, { fontSize: isSmallScreen ? 36 : 42 }]}>
              {formatBreakTime(nextBreakIn)}
            </Text>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <Animated.View 
                  style={[
                    styles.progressFill, 
                    breakProgressAnimatedStyle,
                    breakProgressOpacity
                  ]} 
                />
              </View>
            </View>

            <Text style={styles.breakHint}>
              Мы отправим уведомление, когда придет время
            </Text>
          </Animated.View>
        </Animated.View>
      )}


      <Animated.View 
        entering={FadeInDown.duration(600).delay(400)}
        style={styles.infoCard}
      >
        <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
        <Text style={styles.infoText}>
          Мы будем отправлять напоминания каждые 5 секунд, чтобы ты не забывал заботиться о глазах
        </Text>
      </Animated.View>
    </ScrollView>
  );
};

const createStyles = (colors: ReturnType<typeof getColors>) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    alignItems: 'center',
    paddingBottom: 48,
    gap: 28,
  },
  header: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  title: {
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 340,
    paddingHorizontal: 8,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  timerCircle: {
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
    elevation: 10,
  },
  timerCirclePressed: {
    opacity: 0.8,
  },
  timerValue: {
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -1.5,
    marginBottom: 4,
  },
  timerLabel: {
    color: colors.textSecondary,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  breakCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  breakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  breakTitle: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  breakTime: {
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: -1,
    marginBottom: 8,
  },
  progressContainer: {
    width: '100%',
    paddingHorizontal: 4,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.accentLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  breakHint: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.accentSoft,
    borderRadius: 18,
    padding: 18,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
});

