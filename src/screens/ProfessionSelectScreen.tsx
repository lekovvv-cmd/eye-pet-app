import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { getColors } from '../theme/colors';
import { PROFESSION_CONFIG, Profession } from '../hooks/useUserSettings';

export const ProfessionSelectScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { settings, updateProfession } = useSettings();

  const handleSelect = async (profession: Profession) => {
    await updateProfession(profession);
    navigation.goBack();
  };

  const professions: Profession[] = ['it', 'office', 'student', 'driver', 'outdoor', 'other'];
  const styles = createStyles(colors);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Выбери свою профессию</Text>
        <Text style={styles.subtitle}>
          Мы подберем оптимальную частоту упражнений для твоей работы
        </Text>
      </View>

      <View style={styles.list}>
        {professions.map((profession) => {
          const config = PROFESSION_CONFIG[profession];
          const isSelected = settings.profession === profession;

          return (
            <Pressable
              key={profession}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => handleSelect(profession)}
            >
              <View style={styles.cardContent}>
                <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                  <Ionicons name={config.icon as any} size={28} color={isSelected ? '#fff' : colors.accent} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                    {config.name}
                  </Text>
                  <Text style={styles.cardHint}>
                    Напоминание каждые {config.reminderInterval} мин · Цель {config.dailyGoal} мин/день
                  </Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
        <Text style={styles.infoText}>
          Ты всегда можешь изменить профессию в настройках
        </Text>
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
  subtitle: {
    fontSize: 17,
    color: colors.textSecondary,
    lineHeight: 24,
    marginTop: 4,
  },
  list: {
    gap: 12,
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerSelected: {
    backgroundColor: colors.accent,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.2,
  },
  cardTitleSelected: {
    color: colors.accent,
  },
  cardHint: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.accentSoft,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

