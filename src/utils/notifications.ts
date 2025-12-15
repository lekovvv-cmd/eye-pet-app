import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Настройка обработчика уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Тексты для уведомлений
export const NOTIFICATION_TEXTS = [
  'Йоу! Пора заботиться о глазах 👀',
  'Время для перерыва! Твои глаза скажут спасибо',
  'Сделай мини-перерыв для глаз прямо сейчас',
  'Отдохни от экрана 30 секунд — это важно!',
  'Твои глаза устали? Давай сделаем упражнение',
  'Напоминание: пора размять глазки',
  'Не забывай про здоровье глаз! Сделай перерыв',
  '20 минут прошло — время для отдыха глаз',
  'Забота о глазах — это важно! Сделай перерыв',
  'Твои глаза работают на износ. Давай отдохнем',
  'Пора дать глазам передышку! 🌟',
  'Стоп! Время для глазной гимнастики',
  'Твои глаза заслуживают отдыха прямо сейчас',
  'Минутка для здоровья глаз — сделай перерыв',
  'Не забывай моргать! Пора отдохнуть',
  'Глаза устали? Время для небольшой паузы',
  'Забота о зрении — сделай перерыв сейчас',
  'Пора размять глазные мышцы! 💪',
  'Твои глаза просят передышку — послушай их',
  'Время для заботы о глазах — сделай перерыв',
];

// Запрос разрешений на уведомления
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return null;
  }
  token = (await Notifications.getExpoPushTokenAsync()).data;

  return token;
}

// Планирование повторяющихся уведомлений каждые 5 секунд
export async function scheduleBreakReminders(settings?: { notificationsEnabled?: boolean; doNotDisturb?: boolean }) {
  // Проверяем настройки
  if (settings?.doNotDisturb) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return;
  }
  
  if (!settings?.notificationsEnabled) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return;
  }

  // Отменяем предыдущие уведомления
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Проверяем разрешения
  const { status } = await Notifications.getPermissionsAsync();
  
  if (status !== 'granted') {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    
    if (newStatus !== 'granted') {
      return;
    }
  }

  // Создаем несколько уведомлений с разными текстами каждые 5 секунд
  const notificationTexts = [...NOTIFICATION_TEXTS];
  
  // Планируем уведомления на ближайшие 10 минут (120 уведомлений)
  // Каждое уведомление будет иметь случайный текст
  for (let i = 0; i < 120; i++) {
    const randomText = notificationTexts[Math.floor(Math.random() * notificationTexts.length)];
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'DeskEyes',
        body: randomText,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        seconds: 5 * (i + 1), // Каждые 5 секунд от текущего момента
        repeats: false,
      },
    });
  }
}

// Отмена всех запланированных уведомлений
export async function cancelBreakReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Отправка немедленного уведомления
export async function sendImmediateNotification(
  text?: string,
  settings?: { notificationsEnabled?: boolean; doNotDisturb?: boolean }
) {
  // Проверяем настройки
  if (settings?.doNotDisturb || !settings?.notificationsEnabled) {
    return;
  }

  // Проверяем разрешения
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    return;
  }

  const notificationText = text || NOTIFICATION_TEXTS[Math.floor(Math.random() * NOTIFICATION_TEXTS.length)];
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'DeskEyes',
      body: notificationText,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null, // Немедленное уведомление
  });
}

