import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Achievement, getRarityColor, getRarityLabel } from '../types/achievements';
import { useTheme } from '../context/ThemeContext';
import { getColors } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

type AchievementBadgeProps = {
  achievement: Achievement & { isUnlocked: boolean; unlockedAt?: string };
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
};

export const AchievementBadge = ({
  achievement,
  onPress,
  size = 'medium',
  showDetails = false,
}: AchievementBadgeProps) => {
  const { colors } = useTheme();
  const isUnlocked = achievement.isUnlocked;
  const rarityColor = getRarityColor(achievement.rarity);
  const styles = createStyles(colors);
  const sizeConfig = {
    small: { icon: 24, container: 64, fontSize: 12 },
    medium: { icon: 32, container: 80, fontSize: 14 },
    large: { icon: 48, container: 120, fontSize: 16 },
  }[size];

  const Container = onPress ? Pressable : View;

  const detailsWidth = size === 'small' ? 80 : size === 'medium' ? '100%' : 140;

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.wrapper}>
      <Container
        style={[
          styles.container,
          { width: sizeConfig.container, height: sizeConfig.container },
          !isUnlocked && styles.locked,
        ]}
        onPress={onPress}
      >
        {isUnlocked ? (
          <LinearGradient
            colors={[rarityColor + '20', rarityColor + '10']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradient, { borderRadius: sizeConfig.container / 2 }]}
          >
            <View style={[styles.iconContainer, { borderColor: rarityColor + '40' }]}>
              <Ionicons name={achievement.icon as any} size={sizeConfig.icon} color={rarityColor} />
            </View>
            {achievement.rarity !== 'common' && (
              <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
                <Ionicons name="star" size={8} color="#fff" />
              </View>
            )}
          </LinearGradient>
        ) : (
          <View style={[styles.lockedContainer, { borderRadius: sizeConfig.container / 2 }]}>
            <Ionicons name="lock-closed" size={sizeConfig.icon} color={colors.textSecondary} />
          </View>
        )}
      </Container>
      {showDetails && (
        <View style={[styles.details, typeof detailsWidth === 'number' ? { width: detailsWidth } : {}]}>
          <View style={styles.titleContainer}>
            <Text 
              style={[styles.title, { fontSize: sizeConfig.fontSize }]} 
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {achievement.title}
            </Text>
          </View>
          <View style={styles.descriptionContainer}>
            <Text 
              style={styles.description} 
              numberOfLines={2}
            >
              {(() => {
                const words = achievement.description.split(' ');
                if (words.length > 3) {
                  return words.slice(0, 3).join(' ') + '\n' + words.slice(3).join(' ');
                }
                return achievement.description;
              })()}
            </Text>
          </View>
          <View style={styles.dateContainer}>
            {isUnlocked && achievement.unlockedAt && (
              <Text style={styles.unlockedDate} numberOfLines={1} ellipsizeMode="tail">
                {new Date(achievement.unlockedAt).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'short',
                })}
              </Text>
            )}
            {!isUnlocked && (
              <Text style={styles.rarityLabel} numberOfLines={1} ellipsizeMode="tail">
                {getRarityLabel(achievement.rarity)}
              </Text>
            )}
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const createStyles = (colors: ReturnType<typeof getColors>) => StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  locked: {
    opacity: 0.5,
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconContainer: {
    width: '80%',
    height: '80%',
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  lockedContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  rarityBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  details: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingHorizontal: 4,
  },
  titleContainer: {
    width: '100%',
    height: 36,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 0,
    paddingHorizontal: 4,
    paddingBottom: 2,
    overflow: 'hidden',
  },
  title: {
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 18,
    width: '100%',
    includeFontPadding: false,
  },
  descriptionContainer: {
    width: '100%',
    height: 28,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 4,
    paddingHorizontal: 4,
    paddingTop: 2,
    overflow: 'hidden',
  },
  description: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
    width: '100%',
    includeFontPadding: false,
  },
  dateContainer: {
    width: '100%',
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  unlockedDate: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
  },
  rarityLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    textAlign: 'center',
    width: '100%',
  },
});

