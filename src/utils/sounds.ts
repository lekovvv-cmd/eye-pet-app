import { Audio } from 'expo-av';
import { Vibration, Platform } from 'react-native';

// Пытаемся импортировать Asset, если доступен
let Asset: any = null;
try {
  Asset = require('expo-asset').Asset;
} catch {
  // Asset не доступен, будем использовать другой подход
}

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

// Звуки питомца
let moanSound: Audio.Sound | null = null;
let shrinkingSound: Audio.Sound | null = null;
let tiltingSound: Audio.Sound | null = null;
let eyeMovingSound: Audio.Sound | null = null;

// Вспомогательная функция для загрузки звука
async function loadSoundAsset(module: any): Promise<any> {
  try {
    // Если это строка (URL), оборачиваем в объект
    if (typeof module === 'string') {
      return { uri: module };
    }
    // Если это объект с default или uri
    if (module && typeof module === 'object') {
      if (module.default) {
        return { uri: module.default };
      }
      if (module.uri) {
        return { uri: module.uri };
      }
    }
    return module;
  } catch (error) {
    console.warn('Failed to load sound asset:', error);
    return null;
  }
}

// Воспроизведение звука поглаживания (moan)
export async function playMoanSound() {
  if (!isAudioAvailable()) {
    return;
  }

  try {
    if (!moanSound) {
      try {
        let soundModule: any;
        try {
          soundModule = require('../sounds/moan.mp3');
          if (soundModule === undefined || soundModule === null) {
            return;
          }
        } catch (e) {
          console.warn('Could not load moan.mp3:', e);
          return;
        }
        const soundSource = await loadSoundAsset(soundModule);
        if (!soundSource) return;
        
        const { sound } = await Audio.Sound.createAsync(
          soundSource,
          { shouldPlay: true, volume: 0.6, isLooping: false }
        );
        moanSound = sound;
        await sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync().catch(() => {});
            moanSound = null;
          }
        });
      } catch (error) {
        console.warn('Failed to play moan sound:', error);
      }
    } else {
      try {
        await moanSound.replayAsync();
      } catch (error) {
        moanSound = null;
        playMoanSound();
      }
    }
  } catch (error) {
    console.warn('Error playing moan sound:', error);
  }
}

// Воспроизведение звука сжатия (shrinking)
export async function playShrinkingSound() {
  if (!isAudioAvailable()) {
    return;
  }

  try {
    if (!shrinkingSound) {
      try {
        let soundModule: any;
        try {
          soundModule = require('../sounds/shrinking.mp3');
          if (soundModule === undefined || soundModule === null) {
            return;
          }
        } catch (e) {
          console.warn('Could not load shrinking.mp3:', e);
          return;
        }
        const soundSource = await loadSoundAsset(soundModule);
        if (!soundSource) return;
        
        const { sound } = await Audio.Sound.createAsync(
          soundSource,
          { shouldPlay: true, volume: 0.5, isLooping: false }
        );
        shrinkingSound = sound;
        await sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync().catch(() => {});
            shrinkingSound = null;
          }
        });
      } catch (error) {
        console.warn('Failed to play shrinking sound:', error);
      }
    } else {
      try {
        await shrinkingSound.replayAsync();
      } catch (error) {
        shrinkingSound = null;
        playShrinkingSound();
      }
    }
  } catch (error) {
    console.warn('Error playing shrinking sound:', error);
  }
}

// Воспроизведение звука наклона (tilting)
export async function playTiltingSound() {
  if (!isAudioAvailable()) {
    return;
  }

  try {
    if (!tiltingSound) {
      try {
        let soundModule: any;
        try {
          soundModule = require('../sounds/tilting.mp3');
          if (soundModule === undefined || soundModule === null) {
            return;
          }
        } catch (e) {
          console.warn('Could not load tilting.mp3:', e);
          return;
        }
        const soundSource = await loadSoundAsset(soundModule);
        if (!soundSource) return;
        
        const { sound } = await Audio.Sound.createAsync(
          soundSource,
          { shouldPlay: true, volume: 0.5, isLooping: false }
        );
        tiltingSound = sound;
        await sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync().catch(() => {});
            tiltingSound = null;
          }
        });
      } catch (error) {
        console.warn('Failed to play tilting sound:', error);
      }
    } else {
      try {
        await tiltingSound.replayAsync();
      } catch (error) {
        tiltingSound = null;
        playTiltingSound();
      }
    }
  } catch (error) {
    console.warn('Error playing tilting sound:', error);
  }
}

// Воспроизведение звука движения глаз (eye_moving)
export async function playEyeMovingSound() {
  if (!isAudioAvailable()) {
    return;
  }

  try {
    if (!eyeMovingSound) {
      try {
        let soundModule: any;
        try {
          soundModule = require('../sounds/eye_moving.mp3');
          if (soundModule === undefined || soundModule === null) {
            return;
          }
        } catch (e) {
          console.warn('Could not load eye_moving.mp3:', e);
          return;
        }
        const soundSource = await loadSoundAsset(soundModule);
        if (!soundSource) return;
        
        const { sound } = await Audio.Sound.createAsync(
          soundSource,
          { shouldPlay: true, volume: 0.5, isLooping: false }
        );
        eyeMovingSound = sound;
        await sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync().catch(() => {});
            eyeMovingSound = null;
          }
        });
      } catch (error) {
        console.warn('Failed to play eye moving sound:', error);
      }
    } else {
      try {
        await eyeMovingSound.replayAsync();
      } catch (error) {
        eyeMovingSound = null;
        playEyeMovingSound();
      }
    }
  } catch (error) {
    console.warn('Error playing eye moving sound:', error);
  }
}

// Выгрузка всех звуков питомца
export async function unloadPetSounds() {
  const sounds = [moanSound, shrinkingSound, tiltingSound, eyeMovingSound];
  for (const sound of sounds) {
    if (sound) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        // Игнорируем ошибки
      }
    }
  }
  moanSound = null;
  shrinkingSound = null;
  tiltingSound = null;
  eyeMovingSound = null;
}

