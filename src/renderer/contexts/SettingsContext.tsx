import { useMemo, useState, type ReactNode } from 'react';
import { defaultSettings, type AppSettings } from '@shared/settings';
import { SettingsContext, type SettingsContextValue } from './settingsContextValue';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      updateSetting: (key, nextValue) => {
        setSettings((current) => ({ ...current, [key]: nextValue }));
      },
      resetSettings: () => setSettings(defaultSettings),
    }),
    [settings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
