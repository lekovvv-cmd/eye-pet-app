import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Modal, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Reanimated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAchievements } from '../hooks/useAchievements';
import { useTheme } from '../context/ThemeContext';
import { getColors } from '../theme/colors';
import { AchievementBadge } from '../components/AchievementBadge';
import { Achievement, getRarityColor, getRarityLabel } from '../types/achievements';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const RARITY_ORDER: Achievement['rarity'][] = ['legendary', 'epic', 'rare', 'common'];

export const AchievementsScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { getAllAchievements, getProgress } = useAchievements();
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement & { isUnlocked: boolean; unlockedAt?: string } | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const achievements = getAllAchievements;
  const progress = getProgress();

  // Группируем достижения по редкости
  const groupedAchievements = useMemo(() => {
    const grouped: Record<Achievement['rarity'], typeof achievements> = {
      legendary: [],
      epic: [],
      rare: [],
      common: [],
    };

    achievements.forEach((achievement) => {
      grouped[achievement.rarity].push(achievement);
    });

    // Сортируем каждую группу: сначала разблокированные, потом заблокированные
    Object.keys(grouped).forEach((rarity) => {
      grouped[rarity as Achievement['rarity']].sort((a, b) => {
        if (a.isUnlocked && !b.isUnlocked) return -1;
        if (!a.isUnlocked && b.isUnlocked) return 1;
        return 0;
      });
    });

    return grouped;
  }, [achievements]);

  const handleAchievementPress = (achievement: Achievement & { isUnlocked: boolean; unlockedAt?: string }) => {
    setSelectedAchievement(achievement);
    setShowDetails(true);
  };

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;
  const styles = createStyles(colors);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Достижения</Text>
          <Text style={styles.headerSubtitle}>
            {unlockedCount} из {totalCount} разблокировано
          </Text>
        </View>
      </View>

      {/* Прогресс-бар */}
      <Reanimated.View entering={FadeInDown.duration(400)} style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Ionicons name="trophy" size={24} color={colors.accent} />
          <Text style={styles.progressTitle}>Общий прогресс</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${progress.percentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressPercentage}>{progress.percentage}%</Text>
        </View>
        <Text style={styles.progressHint}>
          {totalCount - unlockedCount} достижений осталось разблокировать
        </Text>
      </Reanimated.View>

      {/* Группы достижений по редкости */}
      {RARITY_ORDER.map((rarity, index) => {
        const group = groupedAchievements[rarity];
        if (group.length === 0) return null;

        const rarityColor = getRarityColor(rarity);
        const rarityLabel = getRarityLabel(rarity);
        const unlockedInGroup = group.filter(a => a.isUnlocked).length;

        return (
          <Reanimated.View 
            key={rarity}
            entering={FadeInDown.duration(400).delay(100 * (index + 1))}
            style={styles.raritySection}
          >
            <View style={styles.rarityHeader}>
              <View style={styles.rarityHeaderLeft}>
                <View style={[styles.rarityIconContainer, { backgroundColor: rarityColor + '20' }]}>
                  <Ionicons name="star" size={20} color={rarityColor} />
                </View>
                <View>
                  <Text style={styles.rarityTitle}>{rarityLabel}</Text>
                  <Text style={styles.raritySubtitle}>
                    {unlockedInGroup} из {group.length}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.achievementsGrid}>
              {group.map((achievement) => (
                <View key={achievement.id} style={styles.achievementGridItem}>
                  <Pressable
                    onPress={() => handleAchievementPress(achievement)}
                    style={styles.achievementItem}
                  >
                    <AchievementBadge
                      achievement={achievement}
                      size="medium"
                      showDetails={true}
                    />
                  </Pressable>
                </View>
              ))}
            </View>
          </Reanimated.View>
        );
      })}

      {/* Модальное окно с деталями достижения */}
      <Modal
        visible={showDetails}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowDetails(false);
          setSelectedAchievement(null);
        }}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => {
            setShowDetails(false);
            setSelectedAchievement(null);
          }}
        >
          <Pressable 
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            {selectedAchievement && (
              <LinearGradient
                colors={[
                  getRarityColor(selectedAchievement.rarity) + '20',
                  getRarityColor(selectedAchievement.rarity) + '10'
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <Pressable
                    onPress={() => {
                      setShowDetails(false);
                      setSelectedAchievement(null);
                    }}
                    style={styles.modalCloseButton}
                  >
                    <Ionicons name="close" size={24} color={colors.text} />
                  </Pressable>
                </View>

                <View style={styles.modalBody}>
                  <AchievementBadge
                    achievement={selectedAchievement}
                    size="large"
                  />
                  
                  <Text style={styles.modalTitle}>{selectedAchievement.title}</Text>
                  <Text style={styles.modalDescription}>{selectedAchievement.description}</Text>
                  
                  <View style={styles.modalRarityBadge}>
                    <Ionicons name="star" size={16} color={getRarityColor(selectedAchievement.rarity)} />
                    <Text style={[styles.modalRarityText, { color: getRarityColor(selectedAchievement.rarity) }]}>
                      {getRarityLabel(selectedAchievement.rarity)}
                    </Text>
                  </View>

                  {selectedAchievement.isUnlocked && selectedAchievement.unlockedAt && (
                    <View style={styles.modalUnlockedInfo}>
                      <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                      <Text style={styles.modalUnlockedText}>
                        Разблокировано {new Date(selectedAchievement.unlockedAt).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                  )}

                  {!selectedAchievement.isUnlocked && (
                    <View style={styles.modalLockedInfo}>
                      <Ionicons name="lock-closed" size={20} color={colors.textSecondary} />
                      <Text style={styles.modalLockedText}>
                        Это достижение ещё не разблокировано
                      </Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            )}
          </Pressable>
        </Pressable>
      </Modal>
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
    paddingTop: 60,
    paddingBottom: 48,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
    gap: 8,
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 17,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  progressCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.accentLight,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 999,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
    minWidth: 50,
    textAlign: 'right',
  },
  progressHint: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  raritySection: {
    gap: 16,
  },
  rarityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rarityHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rarityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rarityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.2,
  },
  raritySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  achievementGridItem: {
    width: (SCREEN_WIDTH - 48 - 12) / 2, // (ширина экрана - padding - gap) / 2 элемента
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  achievementItem: {
    width: '100%',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  modalGradient: {
    padding: 24,
    gap: 20,
    backgroundColor: colors.card,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalBody: {
    alignItems: 'center',
    gap: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginTop: 8,
  },
  modalDescription: {
    fontSize: 17,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalRarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalRarityText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  modalUnlockedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: colors.successLight,
  },
  modalUnlockedText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  modalLockedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: colors.accentLight,
  },
  modalLockedText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

