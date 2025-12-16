import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  interpolate
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getColors } from '../theme/colors';
import { playMoanSound, playShrinkingSound, playTiltingSound, playEyeMovingSound } from '../utils/sounds';

type RandomAction = 'shake-cube' | 'squash' | 'squash-vertical' | 'eye-expression' | 'none';

type PetAvatarProps = {
  moodLevel: number;
  streak: number;
  onPet?: () => void;
};

export const PetAvatar = ({ moodLevel, streak, onPet }: PetAvatarProps) => {
  const { colors } = useTheme();
  const bounceY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const eyeScale = useSharedValue(1);
  const heartScale = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0);
  const glowScale = useSharedValue(1);
  
  // Random animations
  const [currentAction, setCurrentAction] = useState<RandomAction>('none');
  const shakeX = useSharedValue(0);
  const shakeY = useSharedValue(0);
  const borderRadius = useSharedValue(12);
  const scaleX = useSharedValue(1);
  const scaleY = useSharedValue(1);
  const cubeRotationX = useSharedValue(0);
  const cubeRotationY = useSharedValue(0);
  const eyeExpressionScale = useSharedValue(1);
  const eyeExpressionX = useSharedValue(0);
  const eyeExpressionY = useSharedValue(0);
  const actionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Random actions system
  useEffect(() => {
    const startRandomAction = () => {
      if (actionTimerRef.current) {
        clearTimeout(actionTimerRef.current);
      }

      // Random delay between 10-25 seconds
      const delay = Math.random() * 15000 + 10000;
      
      actionTimerRef.current = setTimeout(() => {
        const actions: RandomAction[] = ['shake-cube', 'squash', 'squash-vertical', 'eye-expression'];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        
        setCurrentAction(randomAction);
        
        if (randomAction === 'shake-cube') {
          // Воспроизводим звук наклона
          playTiltingSound();
          
          // Shake and transform to cube
          shakeX.value = withRepeat(
            withSequence(
              withTiming(-8, { duration: 50 }),
              withTiming(8, { duration: 50 }),
              withTiming(-6, { duration: 50 }),
              withTiming(6, { duration: 50 }),
              withTiming(-4, { duration: 50 }),
              withTiming(4, { duration: 50 }),
              withTiming(0, { duration: 50 })
            ),
            1,
            false
          );
          
          shakeY.value = withRepeat(
            withSequence(
              withTiming(-6, { duration: 50 }),
              withTiming(6, { duration: 50 }),
              withTiming(-4, { duration: 50 }),
              withTiming(4, { duration: 50 }),
              withTiming(-2, { duration: 50 }),
              withTiming(2, { duration: 50 }),
              withTiming(0, { duration: 50 })
            ),
            1,
            false
          );
          
          // Transform to cube (reduce border radius and rotate)
          borderRadius.value = withSequence(
            withTiming(12, { duration: 200 }),
            withTiming(4, { duration: 300, easing: Easing.out(Easing.ease) }),
            withTiming(4, { duration: 3000 }), // Остается кубом 3 секунды
            withTiming(12, { duration: 400, easing: Easing.inOut(Easing.ease) })
          );
          
          // Rotate to show cube in 3D
          cubeRotationX.value = withSequence(
            withTiming(0, { duration: 200 }),
            withTiming(-15, { duration: 300, easing: Easing.out(Easing.ease) }),
            withTiming(-15, { duration: 3000 }),
            withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
          );
          
          cubeRotationY.value = withSequence(
            withTiming(0, { duration: 200 }),
            withTiming(25, { duration: 300, easing: Easing.out(Easing.ease) }),
            withTiming(25, { duration: 3000 }),
            withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
          );
          
          // After animation, return to normal
          setTimeout(() => {
            setCurrentAction('none');
            shakeX.value = 0;
            shakeY.value = 0;
            borderRadius.value = 12;
            cubeRotationX.value = 0;
            cubeRotationY.value = 0;
            startRandomAction();
          }, 4200); // Увеличено время до 4.2 секунды (200 + 300 + 3000 + 400 + 300 для запаса)
        } else if (randomAction === 'squash') {
          // Воспроизводим звук сжатия
          playShrinkingSound();
          
          // Squash from right to left
          scaleX.value = withSequence(
            withTiming(0.3, { duration: 200, easing: Easing.out(Easing.ease) }),
            withTiming(0.3, { duration: 100 }),
            withSpring(1, { damping: 8, stiffness: 300 })
          );
          
          scaleY.value = withSequence(
            withTiming(1.1, { duration: 200, easing: Easing.out(Easing.ease) }),
            withTiming(1.1, { duration: 100 }),
            withSpring(1, { damping: 8, stiffness: 300 })
          );
          
          // After animation, return to normal
          setTimeout(() => {
            setCurrentAction('none');
            scaleX.value = 1;
            scaleY.value = 1;
            startRandomAction();
          }, 600);
        } else if (randomAction === 'squash-vertical') {
          // Воспроизводим звук сжатия
          playShrinkingSound();
          
          // Squash from top to bottom
          scaleY.value = withSequence(
            withTiming(0.3, { duration: 200, easing: Easing.out(Easing.ease) }),
            withTiming(0.3, { duration: 100 }),
            withSpring(1, { damping: 8, stiffness: 300 })
          );
          
          scaleX.value = withSequence(
            withTiming(1.1, { duration: 200, easing: Easing.out(Easing.ease) }),
            withTiming(1.1, { duration: 100 }),
            withSpring(1, { damping: 8, stiffness: 300 })
          );
          
          // After animation, return to normal
          setTimeout(() => {
            setCurrentAction('none');
            scaleX.value = 1;
            scaleY.value = 1;
            startRandomAction();
          }, 600);
        } else if (randomAction === 'eye-expression') {
          // Воспроизводим звук движения глаз
          playEyeMovingSound();
          
          // Change eye expression
          const expressions = [
            { scale: 1.5, x: 0, y: 0 }, // Surprised (big eyes)
            { scale: 1, x: -8, y: 0 }, // Looking left
            { scale: 1, x: 8, y: 0 }, // Looking right
            { scale: 1, x: 0, y: -4 }, // Looking up
            { scale: 1, x: 0, y: 4 }, // Looking down
          ];
          
          const expression = expressions[Math.floor(Math.random() * expressions.length)];
          
          eyeExpressionScale.value = withSequence(
            withTiming(1, { duration: 100 }),
            withTiming(expression.scale, { duration: 200, easing: Easing.out(Easing.ease) }),
            withTiming(expression.scale, { duration: 1500 }),
            withTiming(1, { duration: 200, easing: Easing.inOut(Easing.ease) })
          );
          
          eyeExpressionX.value = withSequence(
            withTiming(0, { duration: 100 }),
            withTiming(expression.x, { duration: 200, easing: Easing.out(Easing.ease) }),
            withTiming(expression.x, { duration: 1500 }),
            withTiming(0, { duration: 200, easing: Easing.inOut(Easing.ease) })
          );
          
          eyeExpressionY.value = withSequence(
            withTiming(0, { duration: 100 }),
            withTiming(expression.y, { duration: 200, easing: Easing.out(Easing.ease) }),
            withTiming(expression.y, { duration: 1500 }),
            withTiming(0, { duration: 200, easing: Easing.inOut(Easing.ease) })
          );
          
          // After animation, return to normal
          setTimeout(() => {
            setCurrentAction('none');
            eyeExpressionScale.value = 1;
            eyeExpressionX.value = 0;
            eyeExpressionY.value = 0;
            startRandomAction();
          }, 2100);
        }
      }, delay);
    };

    startRandomAction();

    return () => {
      if (actionTimerRef.current) {
        clearTimeout(actionTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Плавное покачивание (only when not in random action)
    if (currentAction === 'none') {
      bounceY.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      bounceY.value = withTiming(0, { duration: 300 });
    }

    // Моргание глаз
    eyeScale.value = withRepeat(
      withSequence(
        withTiming(0.1, { duration: 150 }),
        withTiming(1, { duration: 150 }),
        withTiming(1, { duration: 2500 })
      ),
      -1,
      false
    );

    // Пульсация свечения для счастливого питомца
    if (moodLevel >= 0.7) {
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      sparkleOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0.3, { duration: 1000 })
        ),
        -1,
        false
      );
    }
  }, [moodLevel, currentAction]);

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(1.2, { damping: 6, stiffness: 200 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );
    
    rotation.value = withSequence(
      withSpring(-15, { damping: 8 }),
      withSpring(15, { damping: 8 }),
      withSpring(0, { damping: 10 })
    );

    heartScale.value = withSequence(
      withDelay(100, withSpring(1.3, { damping: 5 })),
      withSpring(0, { damping: 6 })
    );

    // Воспроизводим звук поглаживания
    playMoanSound();

    onPet?.();
  };

  const petAnimatedStyle = useAnimatedStyle(() => {
    // Комбинируем повороты для 3D эффекта
    const combinedRotation = rotation.value + cubeRotationY.value;
    const perspective = 1000;
    
    return {
      transform: [
        { translateX: shakeX.value },
        { translateY: bounceY.value + shakeY.value },
        { scale: scale.value },
        { scaleX: scaleX.value },
        { scaleY: scaleY.value },
        { perspective },
        { rotateX: `${cubeRotationX.value}deg` },
        { rotateY: `${cubeRotationY.value}deg` },
        { rotateZ: `${combinedRotation}deg` },
      ],
      borderRadius: borderRadius.value,
    };
  });

  const eyeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleY: eyeScale.value * eyeExpressionScale.value },
      { scaleX: eyeExpressionScale.value },
      { translateX: eyeExpressionX.value },
      { translateY: eyeExpressionY.value }
    ]
  }));

  const heartAnimatedStyle = useAnimatedStyle(() => {
    const scale = heartScale.value;
    // Используем Math.max/Math.min для clamp значений (работают в worklet)
    const clampedScale = Math.max(0, Math.min(1, scale));
    return {
      transform: [{ scale: clampedScale }],
      opacity: clampedScale
    };
  });

  const glowAnimatedStyle = useAnimatedStyle(() => {
    const scale = glowScale.value;
    // Используем Math.max/Math.min для clamp значений
    const clampedScale = Math.max(1, Math.min(1.05, scale));
    return {
      transform: [{ scale: clampedScale }],
      opacity: interpolate(clampedScale, [1, 1.05], [0.3, 0.6])
    };
  });

  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value
  }));

  const moodColor = moodLevel > 0.7 ? colors.success : moodLevel > 0.4 ? colors.accent : colors.warning;
  const eyeCurve = 8 - Math.round(moodLevel * 5);
  const isHappy = moodLevel >= 0.7;
  const styles = createStyles(colors);

  return (
    <Pressable onPress={handlePress} style={styles.wrapper} accessibilityRole="image">
      <View style={styles.petContainer}>
        {isHappy && (
          <Animated.View style={[styles.glow, { backgroundColor: moodColor }, glowAnimatedStyle]} />
        )}
        <Animated.View style={[styles.pet, { backgroundColor: moodColor }, petAnimatedStyle]}>
          <View style={styles.eyesRow}>
            <Animated.View style={[styles.eye, { borderRadius: eyeCurve }, eyeAnimatedStyle]} />
            <Animated.View style={[styles.eye, { borderRadius: eyeCurve }, eyeAnimatedStyle]} />
          </View>
          <View style={[styles.mouth, { borderBottomLeftRadius: 30 - eyeCurve, borderBottomRightRadius: 30 - eyeCurve }]} />
          
          {isHappy && (
            <Animated.View style={[styles.decorations, sparkleAnimatedStyle]}>
              <Ionicons name="sparkles" size={24} color="#fff" style={styles.sparkle1} />
              <Ionicons name="sparkles" size={20} color="#fff" style={styles.sparkle2} />
              <Ionicons name="sparkles" size={18} color="#fff" style={styles.sparkle3} />
            </Animated.View>
          )}
        </Animated.View>
        
        <Animated.View style={[styles.heartContainer, heartAnimatedStyle]}>
          <Ionicons name="heart" size={44} color="#FF6B9D" />
        </Animated.View>
      </View>
      
      <View style={styles.infoContainer}>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={16} color={colors.warning} />
          <Text style={styles.caption}>{streak} дн.</Text>
        </View>
        <Text style={styles.status}>
          {moodLevel >= 0.7 ? 'Моим глазам хорошо!' : moodLevel >= 0.4 ? 'Нужно чуть больше заботы' : 'Давай сделаем упражнение?'}
        </Text>
      </View>
    </Pressable>
  );
};

const createStyles = (colors: ReturnType<typeof getColors>) => StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 16
  },
  petContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
  glow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 12,
    opacity: 0.4
  },
  pet: {
    width: 220,
    height: 220,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadowStrong,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 12
  },
  eyesRow: {
    flexDirection: 'row',
    gap: 48
  },
  eye: {
    width: 32,
    height: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  mouth: {
    width: 100,
    height: 44,
    marginTop: 14,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderColor: '#FFFFFF',
    borderBottomWidth: 8
  },
  decorations: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'visible'
  },
  sparkle1: {
    position: 'absolute',
    top: 30,
    right: 40,
    opacity: 0.9
  },
  sparkle2: {
    position: 'absolute',
    top: 50,
    left: 35,
    opacity: 0.8
  },
  sparkle3: {
    position: 'absolute',
    bottom: 40,
    right: 50,
    opacity: 0.7
  },
  heartContainer: {
    position: 'absolute',
    top: -28,
    alignItems: 'center',
    justifyContent: 'center'
  },
  infoContainer: {
    alignItems: 'center',
    gap: 8
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.warningLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  caption: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    letterSpacing: -0.1
  },
  status: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: -0.2,
    lineHeight: 22
  }
});

