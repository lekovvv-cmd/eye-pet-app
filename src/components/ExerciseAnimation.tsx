import { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { EyeExercise } from '../data/exercises';
import { getColors } from '../theme/colors';

type ExerciseAnimationProps = {
  exercise: EyeExercise;
  isRunning: boolean;
};

export const ExerciseAnimation = ({ exercise, isRunning }: ExerciseAnimationProps) => {
  const { colors } = useTheme();
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isRunning) {
      progress.value = withRepeat(
        withTiming(1, {
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
      
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      progress.value = 0;
      scale.value = 1;
    }
  }, [isRunning]);

  const renderAnimation = () => {
    switch (exercise.id) {
      case 'distance-shift':
        return <DistanceShiftAnimation progress={progress} scale={scale} colors={colors} />;
      case 'eye-yoga':
        return <EyeYogaAnimation progress={progress} scale={scale} colors={colors} />;
      case 'palming':
        return <PalmingAnimation progress={progress} scale={scale} colors={colors} />;
      case 'blink-reset':
        return <BlinkAnimation progress={progress} scale={scale} colors={colors} />;
      default:
        return <DefaultAnimation progress={progress} scale={scale} colors={colors} />;
    }
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {renderAnimation()}
    </View>
  );
};

// Анимация ближний/дальний фокус
const DistanceShiftAnimation = ({ progress, scale, colors }: { progress: Animated.SharedValue<number>; scale: Animated.SharedValue<number>; colors: ReturnType<typeof getColors> }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(progress.value, [0, 0.5, 1], [0.5, 1.2, 0.5]) },
    ],
    opacity: interpolate(progress.value, [0, 0.5, 1], [0.6, 1, 0.6]),
  }));

  return (
    <Animated.View style={[baseStyles.animationView, animatedStyle]}>
      <View style={[baseStyles.circle, { backgroundColor: colors.accent }]} />
    </Animated.View>
  );
};

// Анимация глазной йоги (движения по диагоналям)
const EyeYogaAnimation = ({ progress, scale, colors }: { progress: Animated.SharedValue<number>; scale: Animated.SharedValue<number>; colors: ReturnType<typeof getColors> }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const angle = progress.value * Math.PI * 2;
    const radius = 50;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { scale: scale.value },
      ],
    };
  });

  return (
    <Animated.View style={[baseStyles.animationView, animatedStyle]}>
      <Ionicons name="eye-outline" size={48} color={colors.accent} />
    </Animated.View>
  );
};

// Анимация пальминга (пульсация)
const PalmingAnimation = ({ progress, scale, colors }: { progress: Animated.SharedValue<number>; scale: Animated.SharedValue<number>; colors: ReturnType<typeof getColors> }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.value, [0, 0.5, 1], [1, 1.3, 1]) }],
    opacity: interpolate(progress.value, [0, 0.5, 1], [0.8, 1, 0.8]),
  }));

  return (
    <Animated.View style={[baseStyles.animationView, animatedStyle]}>
      <View style={[baseStyles.circle, { backgroundColor: colors.warning, width: 120, height: 120 }]} />
    </Animated.View>
  );
};

// Анимация моргания
const BlinkAnimation = ({ progress, scale, colors }: { progress: Animated.SharedValue<number>; scale: Animated.SharedValue<number>; colors: ReturnType<typeof getColors> }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: interpolate(progress.value, [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], [1, 0.1, 1, 0.1, 1, 0.1, 1, 0.1, 1, 0.1, 1]) }],
  }));

  return (
    <Animated.View style={[baseStyles.animationView, animatedStyle]}>
      <Ionicons name="eye" size={64} color={colors.accent} />
    </Animated.View>
  );
};

// Анимация по умолчанию
const DefaultAnimation = ({ progress, scale, colors }: { progress: Animated.SharedValue<number>; scale: Animated.SharedValue<number>; colors: ReturnType<typeof getColors> }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: interpolate(progress.value, [0, 0.5, 1], [0.7, 1, 0.7]),
  }));

  return (
    <Animated.View style={[baseStyles.animationView, animatedStyle]}>
      <Ionicons name="fitness-outline" size={64} color={colors.accent} />
    </Animated.View>
  );
};

// Общие стили, не зависящие от темы
const baseStyles = StyleSheet.create({
  animationView: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
});

const createStyles = (colors: ReturnType<typeof getColors>) => StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
});

