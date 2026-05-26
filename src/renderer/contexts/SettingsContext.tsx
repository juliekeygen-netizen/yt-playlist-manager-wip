import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  defaultSettings,
  sanitizeSettings,
  settingsStorageKey,
  type AppSettings,
  type SettingsTabId,
} from '@shared/settings';
import { SettingsContext, type SettingsContextValue } from './settingsContextValue';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => loadStoredSettings());
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTabId>('general');

  useEffect(() => {
    try {
      localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
    } catch (error) {
      console.warn('Unable to persist settings to localStorage.', error);
    }
  }, [settings]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      activeSettingsTab,
      updateSetting: (key, nextValue) => {
        setSettings((current) => ({ ...current, [key]: nextValue }));
      },
      setActiveSettingsTab,
      resetSettings: () => setSettings(defaultSettings),
    }),
    [activeSettingsTab, settings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

function loadStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(settingsStorageKey);
    return raw ? sanitizeSettings(JSON.parse(raw)) : defaultSettings;
  } catch (error) {
    console.warn('Unable to load stored settings; using defaults.', error);
    return defaultSettings;
  }
}
