import { StyleSheet, View, Text } from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { useEffect } from 'react';

type CircularProgressProps = {
  progress: number; // 0-100
  size?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
};

export const CircularProgress = ({
  progress,
  size = 100,
  color,
  backgroundColor,
  showLabel = true,
}: CircularProgressProps) => {
  const { colors: themeColors } = useTheme();
  const progressValue = useSharedValue(0);
  const finalColor = color || themeColors.accent;
  const finalBackgroundColor = backgroundColor || themeColors.accentLight;

  useEffect(() => {
    progressValue.value = withTiming(progress, {
      duration: 1000,
    });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(progressValue.value, [0, 100], [0, 1]);
    return {
      transform: [{ scale }],
      opacity: interpolate(progressValue.value, [0, 10, 100], [0, 0.3, 0.3]),
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background circle */}
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: finalBackgroundColor,
            borderWidth: 12,
          },
        ]}
      />
      {/* Progress overlay - показывает прогресс через заливку */}
      <Reanimated.View
        style={[
          styles.progressOverlay,
          {
            width: size - 24,
            height: size - 24,
            borderRadius: (size - 24) / 2,
            backgroundColor: finalColor,
          },
          animatedStyle,
        ]}
      />
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { fontSize: size * 0.2, color: finalColor }]}>
            {Math.round(progress)}%
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
  },
  progressOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  label: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});

