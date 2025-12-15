import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { eyeExercises, EyeExercise } from '../data/exercises';
import { ExerciseCard } from '../components/ExerciseCard';
import { useTheme } from '../context/ThemeContext';
import { getColors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';

const filters: { label: string; value: EyeExercise['category'] | 'all' }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Фокус', value: 'focus' },
  { label: 'Релакс', value: 'relax' },
  { label: 'Подвижность', value: 'mobility' }
];

export const ExercisesScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const [activeFilter, setActiveFilter] = useState<typeof filters[number]['value']>('all');

  const filtered = useMemo(() => {
    if (activeFilter === 'all') {
      return eyeExercises;
    }
    return eyeExercises.filter((item) => item.category === activeFilter);
  }, [activeFilter]);

  const styles = createStyles(colors);

  return (
    <View style={styles.screen}>
      <View style={styles.headerBlock}>
        <Text style={styles.header}>Каталог упражнений</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
        >
          {filters.map((filter) => (
            <Pressable
              key={filter.value}
              style={[styles.chip, activeFilter === filter.value && styles.chipActive]}
              onPress={() => setActiveFilter(filter.value)}
            >
              <Text style={[styles.chipText, activeFilter === filter.value && styles.chipTextActive]}>
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ExerciseCard exercise={item} onPress={() => navigation.navigate('ExercisePlayer', { exerciseId: item.id })} />
        )}
      />
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof getColors>) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 60
  },
  headerBlock: {
    marginBottom: 20
  },
  header: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 8
  },
  filterScroll: {
    marginTop: 12,
    marginBottom: 20,
    paddingVertical: 4
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    paddingRight: 24,
    gap: 10
  },
  chip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 0,
    paddingHorizontal: 18,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    backgroundColor: colors.card
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent
  },
  chipText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: -0.2
  },
  chipTextActive: {
    color: '#fff'
  },
  list: {
    paddingBottom: 24,
    gap: 16
  }
});
