import { RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View, Modal, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { eyeExercises } from '../data/exercises';
import { useTheme } from '../context/ThemeContext';
import { getColors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import { useProgress } from '../context/ProgressContext';
import { ExerciseAnimation } from '../components/ExerciseAnimation';

export const ExercisePlayerScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ExercisePlayer'>>();
  const { colors } = useTheme();
  const exercise = eyeExercises.find((item) => item.id === route.params.exerciseId)!;
  const total = exercise.duration;
  const [remaining, setRemaining] = useState(total);
  const [isRunning, setIsRunning] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const { addCompletion } = useProgress();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const hasSavedRef = useRef(false);
  const celebrationScale = useRef(new Animated.Value(0)).current;
  const celebrationOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isRunning && remaining > 0) {
      timer = setInterval(() => {
        setRemaining((prev) => Math.max(prev - 1, 0));
      }, 1000);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isRunning, remaining]);

  useEffect(() => {
    const progress = 1 - remaining / total;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false
    }).start();

    if (remaining === 0 && !hasSavedRef.current) {
      hasSavedRef.current = true;
      addCompletion({ id: exercise.id, title: exercise.title, duration: exercise.duration });
      setIsRunning(false);
      setShowCelebration(true);
      
      // Вибрация для тактильной обратной связи
      Vibration.vibrate([100, 50, 100]);
      
      Animated.parallel([
        Animated.spring(celebrationScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true
        }),
        Animated.timing(celebrationOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [remaining, total, progressAnim, addCompletion, exercise]);

  const resetTimer = () => {
    setRemaining(total);
    setIsRunning(false);
    hasSavedRef.current = false;
    setShowCelebration(false);
    celebrationScale.setValue(0);
    celebrationOpacity.setValue(0);
  };

  const closeCelebration = () => {
    setShowCelebration(false);
    celebrationScale.setValue(0);
    celebrationOpacity.setValue(0);
  };

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const styles = createStyles(colors);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.category}>Упражнение</Text>
      <Text style={styles.title}>{exercise.title}</Text>
      <Text style={styles.description}>{exercise.description}</Text>

      <View style={styles.timerCard}>
        <ExerciseAnimation exercise={exercise} isRunning={isRunning} />
        <Text style={styles.timerLabel}>Осталось</Text>
        <Text style={styles.timerValue}>
          {Math.floor(remaining / 60)
            .toString()
            .padStart(2, '0')}
          :
          {(remaining % 60).toString().padStart(2, '0')}
        </Text>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <View style={styles.timerButtons}>
          <Pressable style={[styles.button, styles.secondary]} onPress={resetTimer}>
            <Text style={[styles.buttonText, styles.secondaryText]}>Сброс</Text>
          </Pressable>
          <Pressable style={[styles.button, isRunning ? styles.pause : styles.primary]} onPress={() => setIsRunning((prev) => !prev)}>
            <Text style={styles.buttonText}>{isRunning ? 'Пауза' : 'Старт'}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.stepsCard}>
        <Text style={styles.stepsTitle}>Шаги</Text>
        {exercise.steps.map((step, index) => (
          <View key={step} style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      <Modal
        visible={showCelebration}
        transparent
        animationType="none"
        onRequestClose={closeCelebration}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.celebrationContainer,
              {
                opacity: celebrationOpacity,
                transform: [{ scale: celebrationScale }]
              }
            ]}
          >
            <View style={[styles.celebrationCard, { backgroundColor: colors.success }]}>
              <Ionicons name="checkmark-circle" size={64} color="#fff" style={styles.celebrationIcon} />
              
              <Text style={styles.celebrationTitle}>Отлично!</Text>
              <Text style={styles.celebrationSubtitle}>Упражнение завершено</Text>
              <Text style={styles.celebrationMessage}>
                Ты молодец, продолжай в том же духе!
              </Text>
              
              <View style={styles.celebrationIcons}>
                <Ionicons name="heart" size={32} color="#fff" />
                <Ionicons name="star" size={40} color="#fff" />
                <Ionicons name="heart" size={32} color="#fff" />
              </View>

              <Pressable 
                style={styles.celebrationButton} 
                onPress={() => {
                  closeCelebration();
                  navigation.navigate('Home');
                }}
              >
                <Text style={styles.celebrationButtonText}>Продолжить</Text>
              </Pressable>
            </View>
          </Animated.View>
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
    padding: 24,
    paddingBottom: 48,
    gap: 24
  },
  category: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 8
  },
  description: {
    color: colors.textSecondary,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '400'
  },
  timerCard: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 28,
    gap: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border
  },
  timerLabel: {
    color: colors.textSecondary,
    letterSpacing: 0.5,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  timerValue: {
    fontSize: 64,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -1
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.accentLight,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.accent
  },
  timerButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2
  },
  primary: {
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.3
  },
  pause: {
    backgroundColor: colors.warning
  },
  secondary: {
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 17,
    letterSpacing: -0.2
  },
  secondaryText: {
    color: colors.accent
  },
  stepsCard: {
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
  stepsTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: 4
  },
  stepRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
    paddingVertical: 8
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  stepNumberText: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 16
  },
  stepText: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  celebrationContainer: {
    width: '100%',
    maxWidth: 360
  },
  celebrationCard: {
    borderRadius: 36,
    padding: 40,
    alignItems: 'center',
    gap: 20,
    shadowColor: colors.shadowStrong,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 12
  },
  celebrationIcon: {
    marginBottom: 8
  },
  celebrationTitle: {
    fontSize: 42,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.5
  },
  celebrationSubtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.3
  },
  celebrationMessage: {
    fontSize: 17,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.95,
    lineHeight: 24,
    fontWeight: '400'
  },
  celebrationIcons: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    marginVertical: 12
  },
  celebrationButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 24,
    marginTop: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4
  },
  celebrationButtonText: {
    color: colors.accent,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2
  }
});

