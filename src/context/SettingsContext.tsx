import { createContext, ReactNode, useContext } from 'react';
import { useUserSettings } from '../hooks/useUserSettings';

const SettingsContext = createContext<ReturnType<typeof useUserSettings> | null>(null);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const value = useUserSettings();
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return ctx;
};

