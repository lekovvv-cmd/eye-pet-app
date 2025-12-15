import React from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View, Pressable, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { PROFESSION_CONFIG } from '../hooks/useUserSettings';
import { getColors } from '../theme/colors';
import { Toggle } from '../components/Toggle';
import { cancelBreakReminders } from '../utils/notifications';

export const SettingsScreen = () => {
  const navigation = useNavigation();
  const { settings, updateDoNotDisturb, updateDarkMode } = useSettings();
  const { colors } = useTheme();

  const openPersonalization = () => {
    navigation.navigate('Personalization');
  };

  const handleDoNotDisturbToggle = async (enabled: boolean) => {
    await updateDoNotDisturb(enabled);
    if (enabled) {
      // Отменяем все уведомления при включении режима "Не беспокоить"
      await cancelBreakReminders();
    }
  };

  const styles = createStyles(colors);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Настройки</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Персонализация</Text>
        <Pressable style={styles.settingCard} onPress={openPersonalization}>
          <View style={styles.settingContent}>
            <View style={styles.settingIcon}>
              <Ionicons name="person-circle-outline" size={28} color={colors.accent} />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Персональные настройки</Text>
              <Text style={styles.settingSubtitle}>
                {settings.isSetupComplete 
                  ? 'Профиль настроен' 
                  : 'Настрой профиль для лучших рекомендаций'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </View>
        </Pressable>

        {settings.isSetupComplete && (
          <View style={styles.infoCard}>
            {settings.profession && (
              <View style={styles.infoRow}>
                <Ionicons name={PROFESSION_CONFIG[settings.profession].icon as any} size={20} color={colors.textSecondary} />
                <Text style={styles.infoText}>
                  {PROFESSION_CONFIG[settings.profession].name}
                </Text>
              </View>
            )}
            {settings.screenTime && (
              <View style={styles.infoRow}>
                <Ionicons name="phone-portrait-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.infoText}>
                  {settings.screenTime === 'low' && 'Меньше 4 часов'}
                  {settings.screenTime === 'medium' && '4-8 часов'}
                  {settings.screenTime === 'high' && '8-12 часов'}
                  {settings.screenTime === 'very-high' && 'Больше 12 часов'}
                </Text>
              </View>
            )}
            {settings.eyeIssues && settings.eyeIssues.length > 0 && (
              <View style={styles.infoRow}>
                <Ionicons name="eye-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.infoText}>
                  {settings.eyeIssues.map(issue => {
                    const labels: Record<string, string> = {
                      'none': 'Нет проблем',
                      'dryness': 'Сухость глаз',
                      'fatigue': 'Усталость глаз',
                      'blurred': 'Размытость зрения',
                      'headaches': 'Головные боли',
                    };
                    return labels[issue];
                  }).filter(Boolean).join(', ')}
                </Text>
              </View>
            )}
            {settings.ageRange && (
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.infoText}>
                  {settings.ageRange === 'under-25' && 'До 25 лет'}
                  {settings.ageRange === '25-35' && '25-35 лет'}
                  {settings.ageRange === '35-45' && '35-45 лет'}
                  {settings.ageRange === '45-60' && '45-60 лет'}
                  {settings.ageRange === 'over-60' && 'Старше 60 лет'}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Внешний вид</Text>
        <View style={styles.settingCard}>
          <View style={styles.settingContent}>
            <View style={styles.settingIcon}>
              <Ionicons name="moon" size={28} color={colors.accent} />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Темная тема</Text>
              <Text style={styles.settingSubtitle}>
                {settings.darkMode
                  ? 'Темная тема включена'
                  : 'Светлая тема включена'}
              </Text>
            </View>
            <Toggle
              value={settings.darkMode}
              onValueChange={updateDarkMode}
              disabled={false}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Уведомления</Text>
        <View style={styles.settingCard}>
          <View style={styles.settingContent}>
            <View style={styles.settingIcon}>
              <Ionicons name="moon-outline" size={28} color={colors.warning} />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Не беспокоить</Text>
              <Text style={styles.settingSubtitle}>
                {settings.doNotDisturb
                  ? 'Все уведомления отключены'
                  : 'Уведомления включены'}
              </Text>
            </View>
            <Toggle
              value={settings.doNotDisturb}
              onValueChange={handleDoNotDisturbToggle}
              disabled={false}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Рекомендации</Text>
        <View style={styles.recommendationCard}>
          <View style={styles.recommendationRow}>
            <Ionicons name="time-outline" size={20} color={colors.accent} />
            <View style={styles.recommendationText}>
              <Text style={styles.recommendationLabel}>Интервал напоминаний</Text>
              <Text style={styles.recommendationValue}>
                Каждые {settings.reminderInterval} минут
              </Text>
            </View>
          </View>
          <View style={styles.recommendationRow}>
            <Ionicons name="flag-outline" size={20} color={colors.accent} />
            <View style={styles.recommendationText}>
              <Text style={styles.recommendationLabel}>Дневная цель</Text>
              <Text style={styles.recommendationValue}>
                {settings.dailyGoal} минут в день
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (colors: ReturnType<typeof getColors>) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  header: {
    marginBottom: 32,
    gap: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    padding: 4,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
    lineHeight: 44,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  settingCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    flex: 1,
    gap: 4,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  infoCard: {
    marginTop: 12,
    backgroundColor: colors.accentSoft,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  recommendationCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  recommendationText: {
    flex: 1,
    gap: 4,
  },
  recommendationLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  recommendationValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
});

