import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { EyeExercise } from '../data/exercises';
import { formatDuration } from '../utils/formatDuration';
import { getColors } from '../theme/colors';

type Props = {
  exercise: EyeExercise;
  onPress: () => void;
};

const categoryBadge: Record<EyeExercise['category'], string> = {
  focus: 'Фокус',
  relax: 'Релакс',
  mobility: 'Подвижность'
};

export const ExerciseCard = ({ exercise, onPress }: Props) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  return (
    <Pressable style={styles.card} onPress={onPress} accessibilityRole="button">
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{categoryBadge[exercise.category]}</Text>
    </View>
    <Text style={styles.title}>{exercise.title}</Text>
    <Text style={styles.desc}>{exercise.description}</Text>
    <View style={styles.metaRow}>
      <View style={styles.metaItem}>
        <Ionicons name="time-outline" size={14} color={colors.accent} />
        <Text style={styles.meta}>{formatDuration(exercise.duration)}</Text>
      </View>
      <View style={styles.metaItem}>
        <Ionicons name="list-outline" size={14} color={colors.accent} />
        <Text style={styles.meta}>{exercise.steps.length} шага</Text>
      </View>
    </View>
  </Pressable>
  );
};

const createStyles = (colors: ReturnType<typeof getColors>) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    gap: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: colors.accent
  },
  badgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.1
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
    marginTop: 4
  },
  desc: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    fontWeight: '400'
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  meta: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '500'
  }
});

