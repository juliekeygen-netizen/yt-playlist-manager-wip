import { createContext, useContext } from 'react';
import type { AppSettings, SettingsTabId } from '@shared/settings';

export interface SettingsContextValue {
  settings: AppSettings;
  activeSettingsTab: SettingsTabId;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  setActiveSettingsTab: (tab: SettingsTabId) => void;
  resetSettings: () => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used inside SettingsProvider.');
  }
  return context;
}
