import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useProgress } from '../context/ProgressContext';
import { colors } from '../theme/colors';
import { PetAvatar } from '../components/PetAvatar';
import { eyeExercises } from '../data/exercises';
import { RootStackParamList } from '../navigation/types';
import { formatDuration } from '../utils/formatDuration';

export const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { stats, logs } = useProgress();
  const [petFeeling, setPetFeeling] = useState('Погладь меня!');

  const recommended = useMemo(() => {
    const lastId = logs[0]?.id;
    return eyeExercises.find((ex) => ex.id !== lastId) ?? eyeExercises[0];
  }, [logs]);

  const moodLevel = Math.min(1, stats.todayMinutes / 5 + stats.streakDays / 10);

  const goToExercise = () => {
    navigation.navigate('ExercisePlayer', { exerciseId: recommended.id });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.header}>DeskEyes</Text>
      <Text style={styles.subHeader}>Твой помощник для отдыха глаз</Text>
      <PetAvatar
        moodLevel={moodLevel}
        streak={stats.streakDays}
        onPet={() => setPetFeeling('Спасибо за внимание!')}
      />
      <Text style={styles.petFeeling}>{petFeeling}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.label}>Сегодня</Text>
          <Text style={styles.value}>{stats.todayMinutes.toFixed(1)} мин</Text>
          <Text style={styles.hint}>{stats.todaySessions} упражнений</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.label}>За неделю</Text>
          <Text style={styles.value}>{stats.weeklyMinutes.toFixed(1)} мин</Text>
          <Text style={styles.hint}>Серия {stats.streakDays} дн.</Text>
        </View>
      </View>

      <View style={styles.cardCTA}>
        <Text style={styles.ctaTitle}>Рекомендовано сегодня</Text>
        <Text style={styles.ctaExercise}>{recommended.title}</Text>
        <Text style={styles.ctaHint}>⏱ {formatDuration(recommended.duration)} · {recommended.steps.length} шага</Text>
        <Pressable style={styles.ctaButton} onPress={goToExercise}>
          <Text style={styles.ctaButtonText}>Начать</Text>
        </Pressable>
      </View>

      <View style={styles.historyBlock}>
        <Text style={styles.historyTitle}>Последние активности</Text>
        {logs.slice(0, 4).map((log) => (
          <View key={log.completedAt} style={styles.historyRow}>
            <Text style={styles.historyExercise}>{log.title}</Text>
            <Text style={styles.historyMeta}>
              {new Date(log.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}
        {!logs.length && <Text style={styles.hint}>Пока нет данных — начни с короткого упражнения.</Text>}
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
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 40,
    gap: 20
  },
  header: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text
  },
  subHeader: {
    fontSize: 16,
    color: colors.muted
  },
  petFeeling: {
    textAlign: 'center',
    color: colors.muted
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    gap: 4
  },
  label: {
    color: colors.muted,
    fontSize: 13
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text
  },
  hint: {
    color: colors.muted,
    fontSize: 12
  },
  cardCTA: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    gap: 8
  },
  ctaTitle: {
    color: colors.muted,
    fontSize: 14
  },
  ctaExercise: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text
  },
  ctaHint: {
    color: colors.muted
  },
  ctaButton: {
    marginTop: 12,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center'
  },
  ctaButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  historyBlock: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    gap: 10
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  historyExercise: {
    color: colors.text
  },
  historyMeta: {
    color: colors.muted
  }
});
