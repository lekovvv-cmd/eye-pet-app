import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';
import { 
  Profession, 
  PROFESSION_CONFIG, 
  ScreenTime, 
  EyeIssues, 
  AgeRange 
} from '../hooks/useUserSettings';
import { useTheme } from '../context/ThemeContext';
import { getColors } from '../theme/colors';

type Step = 'profession' | 'screenTime' | 'eyeIssues' | 'ageRange';

const SCREEN_TIME_OPTIONS: { value: ScreenTime; label: string; icon: string; hint: string }[] = [
  { value: 'low', label: 'Меньше 4 часов', icon: 'phone-portrait-outline', hint: 'Редко использую' },
  { value: 'medium', label: '4-8 часов', icon: 'laptop-outline', hint: 'Умеренное использование' },
  { value: 'high', label: '8-12 часов', icon: 'desktop-outline', hint: 'Часто за экраном' },
  { value: 'very-high', label: 'Больше 12 часов', icon: 'tv-outline', hint: 'Почти весь день' },
];

const EYE_ISSUES_OPTIONS: { value: EyeIssues; label: string; icon: string; hint: string }[] = [
  { value: 'none', label: 'Нет проблем', icon: 'checkmark-circle-outline', hint: 'Всё в порядке' },
  { value: 'dryness', label: 'Сухость глаз', icon: 'water-outline', hint: 'Ощущение сухости' },
  { value: 'fatigue', label: 'Усталость глаз', icon: 'eye-outline', hint: 'Быстро устают' },
  { value: 'blurred', label: 'Размытость зрения', icon: 'remove-circle-outline', hint: 'Периодически' },
  { value: 'headaches', label: 'Головные боли', icon: 'medical-outline', hint: 'От напряжения' },
];

const AGE_RANGE_OPTIONS: { value: AgeRange; label: string; icon: string }[] = [
  { value: 'under-25', label: 'До 25 лет', icon: 'happy-outline' },
  { value: '25-35', label: '25-35 лет', icon: 'person-outline' },
  { value: '35-45', label: '35-45 лет', icon: 'people-outline' },
  { value: '45-60', label: '45-60 лет', icon: 'person-circle-outline' },
  { value: 'over-60', label: 'Старше 60 лет', icon: 'accessibility-outline' },
];

export const PersonalizationScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { settings, updateProfession, updateScreenTime, toggleEyeIssue, updateAgeRange, completeSetup } = useSettings();
  const [currentStep, setCurrentStep] = useState<Step>('profession');

  const professions: Profession[] = ['it', 'office', 'student', 'driver', 'outdoor', 'other'];

  const handleProfessionSelect = async (profession: Profession) => {
    await updateProfession(profession);
    setCurrentStep('screenTime');
  };

  const handleScreenTimeSelect = async (screenTime: ScreenTime) => {
    await updateScreenTime(screenTime);
    setCurrentStep('eyeIssues');
  };

  const handleEyeIssuesSelect = async (eyeIssues: EyeIssues) => {
    await toggleEyeIssue(eyeIssues);
  };

  const handleEyeIssuesContinue = () => {
    setCurrentStep('ageRange');
  };

  const handleAgeRangeSelect = async (ageRange: AgeRange) => {
    await updateAgeRange(ageRange);
    await completeSetup();
    navigation.goBack();
  };

  const handleSkip = () => {
    if (currentStep === 'profession') {
      setCurrentStep('screenTime');
    } else if (currentStep === 'screenTime') {
      setCurrentStep('eyeIssues');
    } else if (currentStep === 'eyeIssues') {
      setCurrentStep('ageRange');
    } else {
      completeSetup();
      navigation.goBack();
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'profession':
        return 'Твоя профессия?';
      case 'screenTime':
        return 'Сколько времени за экраном?';
      case 'eyeIssues':
        return 'Есть ли проблемы с глазами?';
      case 'ageRange':
        return 'Твой возраст?';
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 'profession':
        return 'Мы подберем оптимальную частоту упражнений';
      case 'screenTime':
        return 'Это поможет определить нагрузку на глаза';
      case 'eyeIssues':
        return 'Мы адаптируем программу под твои потребности';
      case 'ageRange':
        return 'Последний шаг для персонализации';
    }
  };

  const renderProfessionStep = () => (
    <View style={styles.optionsList}>
      {professions.map((profession) => {
        const config = PROFESSION_CONFIG[profession];
        const isSelected = settings.profession === profession;
        return (
          <Pressable
            key={profession}
            style={[styles.optionCard, isSelected && styles.optionCardSelected]}
            onPress={() => handleProfessionSelect(profession)}
          >
            <View style={[styles.optionIcon, isSelected && styles.optionIconSelected]}>
              <Ionicons name={config.icon as any} size={28} color={isSelected ? '#fff' : colors.accent} />
            </View>
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                {config.name}
              </Text>
            </View>
            {isSelected && <Ionicons name="checkmark-circle" size={24} color={colors.accent} />}
          </Pressable>
        );
      })}
    </View>
  );

  const renderScreenTimeStep = () => (
    <View style={styles.optionsList}>
      {SCREEN_TIME_OPTIONS.map((option) => {
        const isSelected = settings.screenTime === option.value;
        return (
          <Pressable
            key={option.value}
            style={[styles.optionCard, isSelected && styles.optionCardSelected]}
            onPress={() => handleScreenTimeSelect(option.value)}
          >
            <View style={[styles.optionIcon, isSelected && styles.optionIconSelected]}>
              <Ionicons name={option.icon as any} size={28} color={isSelected ? '#fff' : colors.accent} />
            </View>
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                {option.label}
              </Text>
              <Text style={styles.optionHint}>{option.hint}</Text>
            </View>
            {isSelected && <Ionicons name="checkmark-circle" size={24} color={colors.accent} />}
          </Pressable>
        );
      })}
    </View>
  );

  const renderEyeIssuesStep = () => (
    <>
      <View style={styles.optionsList}>
        {EYE_ISSUES_OPTIONS.map((option) => {
          const isSelected = settings.eyeIssues?.includes(option.value) || false;
          return (
            <Pressable
              key={option.value}
              style={[styles.optionCard, isSelected && styles.optionCardSelected]}
              onPress={() => handleEyeIssuesSelect(option.value)}
            >
              <View style={[styles.optionIcon, isSelected && styles.optionIconSelected]}>
                <Ionicons name={option.icon as any} size={28} color={isSelected ? '#fff' : colors.accent} />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                  {option.label}
                </Text>
                <Text style={styles.optionHint}>{option.hint}</Text>
              </View>
              {isSelected && <Ionicons name="checkmark-circle" size={24} color={colors.accent} />}
            </Pressable>
          );
        })}
      </View>
      {(settings.eyeIssues && settings.eyeIssues.length > 0) && (
        <Pressable style={styles.continueButton} onPress={handleEyeIssuesContinue}>
          <Text style={styles.continueButtonText}>Продолжить</Text>
        </Pressable>
      )}
    </>
  );

  const renderAgeRangeStep = () => (
    <View style={styles.optionsList}>
      {AGE_RANGE_OPTIONS.map((option) => {
        const isSelected = settings.ageRange === option.value;
        return (
          <Pressable
            key={option.value}
            style={[styles.optionCard, isSelected && styles.optionCardSelected]}
            onPress={() => handleAgeRangeSelect(option.value)}
          >
            <View style={[styles.optionIcon, isSelected && styles.optionIconSelected]}>
              <Ionicons name={option.icon as any} size={28} color={isSelected ? '#fff' : colors.accent} />
            </View>
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                {option.label}
              </Text>
            </View>
            {isSelected && <Ionicons name="checkmark-circle" size={24} color={colors.accent} />}
          </Pressable>
        );
      })}
    </View>
  );

  const getProgress = () => {
    const steps = ['profession', 'screenTime', 'eyeIssues', 'ageRange'];
    return ((steps.indexOf(currentStep) + 1) / steps.length) * 100;
  };

  const styles = createStyles(colors);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${getProgress()}%` }]} />
        </View>
        <Text style={styles.title}>{getStepTitle()}</Text>
        <Text style={styles.subtitle}>{getStepSubtitle()}</Text>
      </View>

      {currentStep === 'profession' && renderProfessionStep()}
      {currentStep === 'screenTime' && renderScreenTimeStep()}
      {currentStep === 'eyeIssues' && renderEyeIssuesStep()}
      {currentStep === 'ageRange' && renderAgeRangeStep()}

      <Pressable style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Пропустить</Text>
      </Pressable>
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
    gap: 12,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    padding: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 17,
    color: colors.textSecondary,
    lineHeight: 24,
    marginTop: 4,
  },
  optionsList: {
    gap: 12,
    marginBottom: 24,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  optionCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionIconSelected: {
    backgroundColor: colors.accent,
  },
  optionText: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.2,
  },
  optionTitleSelected: {
    color: colors.accent,
  },
  optionHint: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.2,
  },
});

