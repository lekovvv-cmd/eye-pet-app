import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type PetAvatarProps = {
  moodLevel: number;
  streak: number;
  onPet?: () => void;
};

export const PetAvatar = ({ moodLevel, streak, onPet }: PetAvatarProps) => {
  const bounce = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: -10,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true
        })
      ])
    ).start();
  }, [bounce]);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.08, friction: 3, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true })
    ]).start();
    onPet?.();
  };

  const moodColor = moodLevel > 0.7 ? colors.success : moodLevel > 0.4 ? colors.accent : colors.warning;
  const eyeCurve = 8 - Math.round(moodLevel * 5);

  return (
    <Pressable onPress={handlePress} style={styles.wrapper} accessibilityRole="image">
      <Animated.View
        style={[
          styles.pet,
          {
            backgroundColor: moodColor,
            transform: [{ translateY: bounce }, { scale }]
          }
        ]}
      >
        <View style={styles.eyesRow}>
          <View style={[styles.eye, { borderRadius: eyeCurve }]} />
          <View style={[styles.eye, { borderRadius: eyeCurve }]} />
        </View>
        <View style={[styles.mouth, { borderBottomLeftRadius: 30 - eyeCurve, borderBottomRightRadius: 30 - eyeCurve }]} />
      </Animated.View>
      <Text style={styles.caption}>Серия: {streak} дн.</Text>
      <Text style={styles.status}>
        {moodLevel >= 0.7 ? 'Моим глазам хорошо!' : moodLevel >= 0.4 ? 'Нужно чуть больше заботы' : 'Давай сделаем упражнение?'}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 6
  },
  pet: {
    width: 200,
    height: 200,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10
  },
  eyesRow: {
    flexDirection: 'row',
    gap: 40
  },
  eye: {
    width: 26,
    height: 26,
    backgroundColor: colors.card,
    borderRadius: 12
  },
  mouth: {
    width: 90,
    height: 40,
    marginTop: 10,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderColor: colors.card,
    borderBottomWidth: 6
  },
  caption: {
    fontSize: 14,
    color: colors.muted
  },
  status: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center'
  }
});

