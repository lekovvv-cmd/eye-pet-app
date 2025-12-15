import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as MediaLibrary from 'expo-media-library';

/**
 * Запрашивает все доступные разрешения для приложения
 */
export async function requestAllPermissions() {
  const results: Record<string, string> = {};

  try {
    // 1. Уведомления (основное разрешение для приложения)
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
      const { status } = await Notifications.requestPermissionsAsync();
      results.notifications = status;
    } catch (error) {
      console.warn('Failed to request notification permissions:', error);
      results.notifications = 'error';
    }

    // 2. Медиа библиотека (фото/видео)
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      results.mediaLibrary = status;
    } catch (error) {
      console.warn('Failed to request media library permissions:', error);
      results.mediaLibrary = 'error';
    }

    console.log('Permission request results:', results);
    return results;
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return results;
  }
}

