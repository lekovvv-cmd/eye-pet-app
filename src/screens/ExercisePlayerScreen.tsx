import { RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { eyeExercises } from '../data/exercises';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import { useProgress } from '../context/ProgressContext';

export const ExercisePlayerScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ExercisePlayer'>>();
  const exercise = eyeExercises.find((item) => item.id === route.params.exerciseId)!;
  const total = exercise.duration;
  const [remaining, setRemaining] = useState(total);
  const [isRunning, setIsRunning] = useState(false);
  const { addCompletion } = useProgress();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const hasSavedRef = useRef(false);

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
    }
  }, [remaining, total, progressAnim, addCompletion, exercise]);

  const resetTimer = () => {
    setRemaining(total);
    setIsRunning(false);
    hasSavedRef.current = false;
  };

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>← Назад</Text>
      </Pressable>
      <Text style={styles.category}>Упражнение</Text>
      <Text style={styles.title}>{exercise.title}</Text>
      <Text style={styles.description}>{exercise.description}</Text>

      <View style={styles.timerCard}>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 16
  },
  backButton: {
    alignSelf: 'flex-start'
  },
  backText: {
    color: colors.accent,
    fontWeight: '600'
  },
  category: {
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text
  },
  description: {
    color: colors.muted,
    fontSize: 15
  },
  timerCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    gap: 10
  },
  timerLabel: {
    color: colors.muted,
    letterSpacing: 1
  },
  timerValue: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.text
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.accentSoft,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.accent
  },
  timerButtons: {
    flexDirection: 'row',
    gap: 12
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center'
  },
  primary: {
    backgroundColor: colors.accent
  },
  pause: {
    backgroundColor: colors.warning
  },
  secondary: {
    borderWidth: 1,
    borderColor: colors.accent
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  },
  secondaryText: {
    color: colors.accent
  },
  stepsCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    gap: 12
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center'
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepNumberText: {
    color: colors.accent,
    fontWeight: '700'
  },
  stepText: {
    flex: 1,
    color: colors.text
  }
});

