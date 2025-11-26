import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { eyeExercises, EyeExercise } from '../data/exercises';
import { ExerciseCard } from '../components/ExerciseCard';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';

const filters: { label: string; value: EyeExercise['category'] | 'all' }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Фокус', value: 'focus' },
  { label: 'Релакс', value: 'relax' },
  { label: 'Подвижность', value: 'mobility' }
];

export const ExercisesScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeFilter, setActiveFilter] = useState<typeof filters[number]['value']>('all');

  const filtered = useMemo(() => {
    if (activeFilter === 'all') {
      return eyeExercises;
    }
    return eyeExercises.filter((item) => item.category === activeFilter);
  }, [activeFilter]);

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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 50
  },
  headerBlock: {
    marginBottom: 12
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text
  },
  filterScroll: {
    marginTop: 10,
    marginBottom: 16,
    paddingVertical: 4
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    paddingRight: 20,
    marginBottom: 18
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.accentSoft,
    paddingVertical: 0,
    paddingHorizontal: 14,
    borderRadius: 999,
    marginRight: 12,
    height: 38,
    justifyContent: 'center'
  },
  chipActive: {
    backgroundColor: colors.accent
  },
  chipText: {
    color: colors.accent,
    fontWeight: '600'
  },
  chipTextActive: {
    color: '#fff'
  },
  list: {
    paddingBottom: 30,
    gap: 14
  }
});
