import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from './src/screens/HomeScreen';
import { ExercisesScreen } from './src/screens/ExercisesScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { ExercisePlayerScreen } from './src/screens/ExercisePlayerScreen';
import { FocusScreen } from './src/screens/FocusScreen';
import { ProfessionSelectScreen } from './src/screens/ProfessionSelectScreen';
import { PersonalizationScreen } from './src/screens/PersonalizationScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { AchievementsScreen } from './src/screens/AchievementsScreen';
import { useEffect } from 'react';
import { ProgressProvider } from './src/context/ProgressContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { RootStackParamList, TabParamList } from './src/navigation/types';
import { requestAllPermissions } from './src/utils/permissions';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0.5,
          borderTopColor: colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 1,
          shadowRadius: 8,
          elevation: 8
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          letterSpacing: -0.1
        }
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Главная',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Exercises"
        component={ExercisesScreen}
        options={{
          title: 'Каталог',
          tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Focus"
        component={FocusScreen}
        options={{
          title: 'Фокус',
          tabBarIcon: ({ color, size }) => <Ionicons name="timer-outline" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Прогресс',
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { colors, isDark } = useTheme();
  
  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      primary: colors.accent,
      text: colors.text,
      card: colors.card,
      border: colors.border,
    }
  };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Root" component={TabNavigator} />
        <Stack.Screen
          name="ExercisePlayer"
          component={ExercisePlayerScreen}
          options={{ presentation: 'modal', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="ProfessionSelect"
          component={ProfessionSelectScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Personalization"
          component={PersonalizationScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Achievements"
          component={AchievementsScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  useEffect(() => {
    // Запрашиваем все разрешения при запуске приложения
    requestAllPermissions().catch((error) => {
      console.warn('Failed to request permissions on app start:', error);
    });
  }, []);

  return (
    <SettingsProvider>
      <ThemeProvider>
        <ProgressProvider>
          <SafeAreaProvider>
            <AppNavigator />
          </SafeAreaProvider>
        </ProgressProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}
