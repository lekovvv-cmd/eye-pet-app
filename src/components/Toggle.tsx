import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { useEffect } from 'react';

type ToggleProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

export const Toggle = ({ value, onValueChange, disabled = false }: ToggleProps) => {
  const { colors } = useTheme();
  const translateX = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    translateX.value = withSpring(value ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [value]);

  const trackAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      translateX.value,
      [0, 1],
      [colors.border, colors.accent]
    );

    return {
      backgroundColor,
    };
  });

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value * 24 }],
    };
  });

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      disabled={disabled}
      activeOpacity={0.7}
      style={styles.pressable}
    >
      <Animated.View
        style={[styles.track, trackAnimatedStyle, disabled && styles.disabled]}
      >
        <Animated.View 
          style={[styles.thumb, thumbAnimatedStyle]} 
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pressable: {
    alignSelf: 'flex-start',
  },
  track: {
    width: 52,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    padding: 2,
  },
  thumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  disabled: {
    opacity: 0.5,
  },
});

