import { useSettings } from '../../../contexts/settingsContextValue';
import { SettingsButton, SettingsRow, SettingsSection } from '../SettingsRow';
import { SettingsToggle } from '../SettingsToggle';

export function AdvancedSettings({
  onNotImplemented,
  onResetSettings,
}: {
  onNotImplemented: (title: string) => void;
  onResetSettings: () => void;
}) {
  const { settings, updateSetting } = useSettings();

  return (
    <div className="space-y-7">
      <SettingsSection title="Debug">
        <SettingsRow
          label="Enable debug logs"
          control={
            <SettingsToggle
              checked={settings.enableDebugLogs}
              onChange={(checked) => updateSetting('enableDebugLogs', checked)}
            />
          }
        />
        <SettingsRow
          label="Show internal IDs"
          control={
            <SettingsToggle
              checked={settings.showInternalIds}
              onChange={(checked) => updateSetting('showInternalIds', checked)}
            />
          }
        />
        <SettingsRow
          label="Reset mock data"
          control={<SettingsButton danger onClick={onResetSettings}>Reset mock data</SettingsButton>}
        />
        <SettingsRow
          label="Clear cache"
          control={<SettingsButton onClick={() => onNotImplemented('Clear cache')}>Clear cache</SettingsButton>}
        />
        <SettingsRow
          label="Open logs folder"
          control={<SettingsButton onClick={() => onNotImplemented('Open logs folder')}>Open folder</SettingsButton>}
        />
      </SettingsSection>

      <SettingsSection title="Developer">
        <SettingsRow
          label="Enable mock data mode"
          description="This prototype currently runs on mock state only."
          control={
            <SettingsToggle
              checked={settings.enableMockDataMode}
              disabled
              onChange={(checked) => updateSetting('enableMockDataMode', checked)}
            />
          }
        />
      </SettingsSection>
    </div>
  );
}
