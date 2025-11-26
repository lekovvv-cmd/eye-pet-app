import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { EyeExercise } from '../data/exercises';
import { formatDuration } from '../utils/formatDuration';

type Props = {
  exercise: EyeExercise;
  onPress: () => void;
};

const categoryBadge: Record<EyeExercise['category'], string> = {
  focus: 'Фокус',
  relax: 'Релакс',
  mobility: 'Подвижность'
};

export const ExerciseCard = ({ exercise, onPress }: Props) => (
  <Pressable style={styles.card} onPress={onPress} accessibilityRole="button">
    <LinearGradient colors={[colors.accent, colors.accentSoft]} style={styles.badge}>
      <Text style={styles.badgeText}>{categoryBadge[exercise.category]}</Text>
    </LinearGradient>
    <Text style={styles.title}>{exercise.title}</Text>
    <Text style={styles.desc}>{exercise.description}</Text>
    <View style={styles.metaRow}>
      <Text style={styles.meta}>⏱ {formatDuration(exercise.duration)}</Text>
      <Text style={styles.meta}>• {exercise.steps.length} шага</Text>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 18,
    gap: 8,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 12
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text
  },
  desc: {
    fontSize: 14,
    color: colors.muted
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4
  },
  meta: {
    fontSize: 13,
    color: colors.accent
  }
});

