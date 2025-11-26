import { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useProgress } from '../context/ProgressContext';
import { colors } from '../theme/colors';
import { formatDuration } from '../utils/formatDuration';

const dayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const DashboardScreen = () => {
  const { stats, logs } = useProgress();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [fade]);

  const weekly = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 7 }).map((_, index) => {
      const day = new Date(now);
      day.setDate(day.getDate() - (6 - index));
      const minutes = logs
        .filter((log) => new Date(log.completedAt).toDateString() === day.toDateString())
        .reduce((sum, log) => sum + log.duration / 60, 0);
      return {
        label: dayLabels[index],
        minutes
      };
    });
  }, [logs]);

  const bestSession = useMemo(() => {
    if (!logs.length) {
      return null;
    }
    return logs.reduce((best, current) => (current.duration > best.duration ? current : best));
  }, [logs]);

  return (
    <Animated.ScrollView style={[styles.screen, { opacity: fade }]} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Дешборд</Text>
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.label}>Всего практики</Text>
          <Text style={styles.value}>{stats.totalMinutes.toFixed(1)} мин</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.label}>Серия</Text>
          <Text style={styles.value}>{stats.streakDays} дн.</Text>
        </View>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Неделя</Text>
        <View style={styles.chartRow}>
          {weekly.map((day) => (
            <View key={day.label} style={styles.chartBarWrapper}>
              <View style={[styles.chartBar, { height: Math.min(100, day.minutes * 12) }]} />
              <Text style={styles.chartLabel}>{day.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.timelineCard}>
        <Text style={styles.chartTitle}>История</Text>
        {logs.slice(0, 6).map((log) => (
          <View key={log.completedAt} style={styles.timelineRow}>
            <View style={styles.dot} />
            <View style={styles.timelineText}>
              <Text style={styles.timelineTitle}>{log.title}</Text>
              <Text style={styles.timelineMeta}>
                {new Date(log.completedAt).toLocaleDateString()} · {formatDuration(log.duration)}
              </Text>
            </View>
          </View>
        ))}
        {!logs.length && <Text style={styles.label}>История появится после первого занятия.</Text>}
      </View>

      {bestSession && (
        <View style={styles.highlightCard}>
          <Text style={styles.chartTitle}>Лучшее занятие</Text>
          <Text style={styles.highlightTitle}>{bestSession.title}</Text>
          <Text style={styles.highlightMeta}>{formatDuration(bestSession.duration)}</Text>
        </View>
      )}
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 40
  },
  header: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16
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
  chartCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    gap: 12
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  chartBarWrapper: {
    alignItems: 'center',
    gap: 6
  },
  chartBar: {
    width: 18,
    borderRadius: 9,
    backgroundColor: colors.accent
  },
  chartLabel: {
    fontSize: 12,
    color: colors.muted
  },
  timelineCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    gap: 12
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start'
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    marginTop: 6
  },
  timelineText: {
    flex: 1
  },
  timelineTitle: {
    color: colors.text,
    fontWeight: '600'
  },
  timelineMeta: {
    color: colors.muted,
    fontSize: 12
  },
  highlightCard: {
    backgroundColor: colors.accent,
    borderRadius: 24,
    padding: 20,
    gap: 6
  },
  highlightTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700'
  },
  highlightMeta: {
    color: '#fff'
  }
});
