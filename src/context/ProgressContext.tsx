import { createContext, ReactNode, useContext } from 'react';
import { useProgressStorage } from '../hooks/useProgressStorage';

const ProgressContext = createContext<ReturnType<typeof useProgressStorage> | null>(null);

export const ProgressProvider = ({ children }: { children: ReactNode }) => {
  const value = useProgressStorage();
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};

export const useProgress = () => {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return ctx;
};

