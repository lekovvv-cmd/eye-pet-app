import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { HomeScreen } from './src/screens/HomeScreen';
import { ExercisesScreen } from './src/screens/ExercisesScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { ExercisePlayerScreen } from './src/screens/ExercisePlayerScreen';
import { ProgressProvider } from './src/context/ProgressContext';
import { RootStackParamList, TabParamList } from './src/navigation/types';
import { colors } from './src/theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    primary: colors.accent,
    text: colors.text,
    card: colors.card
  }
};

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.muted,
      tabBarStyle: { backgroundColor: colors.card, borderTopWidth: 0, paddingBottom: 6, height: 64 }
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        title: 'Главная',
        tabBarIcon: ({ color }) => <Text style={{ color }}>🐣</Text>
      }}
    />
    <Tab.Screen
      name="Exercises"
      component={ExercisesScreen}
      options={{
        title: 'Каталог',
        tabBarIcon: ({ color }) => <Text style={{ color }}>👁️</Text>
      }}
    />
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        title: 'Прогресс',
        tabBarIcon: ({ color }) => <Text style={{ color }}>📊</Text>
      }}
    />
  </Tab.Navigator>
);

export default function App() {
  return (
    <ProgressProvider>
      <SafeAreaProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="dark" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Root" component={TabNavigator} />
            <Stack.Screen
              name="ExercisePlayer"
              component={ExercisePlayerScreen}
              options={{ presentation: 'modal', animation: 'slide_from_right' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </ProgressProvider>
  );
}

