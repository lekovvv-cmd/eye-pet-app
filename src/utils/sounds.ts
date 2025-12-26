import { Audio } from 'expo-av';
import { Vibration, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Пытаемся импортировать Asset, если доступен
let Asset: any = null;
try {
  Asset = require('expo-asset').Asset;
} catch {
  // Asset не доступен, будем использовать другой подход
}

let successSound: Audio.Sound | null = null;
let achievementSound: Audio.Sound | null = null;
let tickSound: Audio.Sound | null = null;

// Проверяем, что Audio доступен
const isAudioAvailable = () => {
  try {
    return Audio && Audio.Sound && typeof Audio.Sound.createAsync === 'function';
  } catch {
    return false;
  }
};

// Проверяем, включены ли звуки в настройках
const isSoundEnabled = async (): Promise<boolean> => {
  try {
    const SETTINGS_KEY = 'eye-care-settings:v2';
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return true; // По умолчанию звуки включены
    }
    const settings = JSON.parse(raw);
    return settings.soundEnabled !== false; // По умолчанию true, если не установлено
  } catch (error) {
    return true; // В случае ошибки разрешаем звуки
  }
};

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

// Воспроизведение звука успеха (success)
export async function playSuccessSound() {
  if (!isAudioAvailable()) {
    return;
  }

  const soundEnabled = await isSoundEnabled();
  if (!soundEnabled) {
    return;
  }

  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    if (!successSound) {
      try {
        let soundModule: any;
        try {
          soundModule = require('../sounds/success.mp3');
          if (soundModule === undefined || soundModule === null) {
            return;
          }
        } catch (e) {
          console.warn('Could not load success.mp3:', e);
          return;
        }
        const soundSource = await loadSoundAsset(soundModule);
        if (!soundSource) return;
        
        const { sound } = await Audio.Sound.createAsync(
          soundSource,
          { shouldPlay: true, volume: 0.7, isLooping: false }
        );
        successSound = sound;
        await sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync().catch(() => {});
            successSound = null;
          }
        });
      } catch (error) {
        console.warn('Failed to play success sound:', error);
      }
    } else {
      try {
        await successSound.replayAsync();
      } catch (error) {
        successSound = null;
        playSuccessSound();
      }
    }
  } catch (error) {
    console.warn('Error playing success sound:', error);
  }
}

// Воспроизведение звука достижения (achievement)
export async function playAchievementSound() {
  if (!isAudioAvailable()) {
    return;
  }

  const soundEnabled = await isSoundEnabled();
  if (!soundEnabled) {
    return;
  }

  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    if (!achievementSound) {
      try {
        let soundModule: any;
        try {
          soundModule = require('../sounds/achievement.mp3');
          if (soundModule === undefined || soundModule === null) {
            return;
          }
        } catch (e) {
          console.warn('Could not load achievement.mp3:', e);
          return;
        }
        const soundSource = await loadSoundAsset(soundModule);
        if (!soundSource) return;
        
        const { sound } = await Audio.Sound.createAsync(
          soundSource,
          { shouldPlay: true, volume: 0.7, isLooping: false }
        );
        achievementSound = sound;
        await sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync().catch(() => {});
            achievementSound = null;
          }
        });
      } catch (error) {
        console.warn('Failed to play achievement sound:', error);
      }
    } else {
      try {
        await achievementSound.replayAsync();
      } catch (error) {
        achievementSound = null;
        playAchievementSound();
      }
    }
  } catch (error) {
    console.warn('Error playing achievement sound:', error);
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
  if (achievementSound) {
    try {
      await achievementSound.unloadAsync();
    } catch (error) {
      // Игнорируем ошибки
    }
    achievementSound = null;
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

// Воспроизведение звука поглаживания (moan)
export async function playMoanSound() {
  if (!isAudioAvailable()) {
    return;
  }

  const soundEnabled = await isSoundEnabled();
  if (!soundEnabled) {
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

  const soundEnabled = await isSoundEnabled();
  if (!soundEnabled) {
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

  const soundEnabled = await isSoundEnabled();
  if (!soundEnabled) {
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

  const soundEnabled = await isSoundEnabled();
  if (!soundEnabled) {
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

