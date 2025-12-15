import { Audio } from 'expo-av';
import { Vibration, Platform } from 'react-native';

let successSound: Audio.Sound | null = null;
let tickSound: Audio.Sound | null = null;

// Проверяем, что Audio доступен
const isAudioAvailable = () => {
  try {
    return Audio && Audio.Sound && typeof Audio.Sound.createAsync === 'function';
  } catch {
    return false;
  }
};

// Праздничный звук успеха - используем вибрацию с паттерном для создания праздничного эффекта
export async function playSuccessSound() {
  if (!isAudioAvailable()) {
    // Если Audio недоступен, используем только вибрацию
    if (Platform.OS !== 'web') {
      const celebrationPattern = [0, 50, 30, 50, 30, 50, 30, 100];
      Vibration.vibrate(celebrationPattern);
    }
    return;
  }

  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    // Создаем праздничный звук через последовательность коротких звуков
    // Используем простой подход - несколько быстрых вибраций + звук
    if (Platform.OS !== 'web') {
      const celebrationPattern = [0, 50, 30, 50, 30, 50, 30, 100];
      Vibration.vibrate(celebrationPattern);
    }

    // Пытаемся воспроизвести звук успеха
    if (!successSound) {
      try {
        // Используем простой звук успеха (можно заменить на локальный файл)
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'https://assets.mixkit.co/sfx/download/mixkit-achievement-bell-600.mp3' },
          { shouldPlay: true, volume: 0.7, isLooping: false }
        );
        successSound = sound;
        await sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
          }
        });
      } catch (error) {
        // Если не удалось загрузить, используем только вибрацию
        successSound = null;
      }
    } else {
      try {
        await successSound.replayAsync();
      } catch (error) {
        // Если ошибка, создаем новый звук
        successSound = null;
        playSuccessSound();
      }
    }
  } catch (error) {
    // Вибрация уже работает
  }
}

// Тикающий звук для таймера - очень тихий и короткий
export async function playTickSound() {
  if (!isAudioAvailable()) {
    // Если Audio недоступен, просто пропускаем звук
    return;
  }

  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    // Используем очень короткую вибрацию для тика (опционально)
    // Vibration.vibrate(10); // Очень короткая вибрация

    // Пытаемся воспроизвести тикающий звук
    if (!tickSound) {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'https://assets.mixkit.co/sfx/download/mixkit-tick-tock-clock-timer-1055.mp3' },
          { shouldPlay: true, volume: 0.15, isLooping: false }
        );
        tickSound = sound;
        await sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            // Не выгружаем, чтобы был готов для следующего тика
          }
        });
      } catch (error) {
        // Если не удалось, просто пропускаем тик
        tickSound = null;
      }
    } else {
      try {
        // Быстро перезапускаем звук
        await tickSound.setPositionAsync(0);
        await tickSound.playAsync();
      } catch (error) {
        // Если ошибка, создаем новый
        tickSound = null;
      }
    }
  } catch (error) {
    // Тихий тик - можно пропустить
  }
}

export async function unloadSounds() {
  if (successSound) {
    try {
      await successSound.unloadAsync();
    } catch (error) {
      // Игнорируем ошибки
    }
    successSound = null;
  }
  if (tickSound) {
    try {
      await tickSound.unloadAsync();
    } catch (error) {
      // Игнорируем ошибки
    }
    tickSound = null;
  }
}

