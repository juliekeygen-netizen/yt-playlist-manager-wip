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
          label="Preview first-time Home UI"
          description="Mock-only preview for the no-session Home entry state."
          control={
            <SettingsToggle
              checked={settings.previewFirstTimeHomeUi}
              onChange={(checked) => updateSetting('previewFirstTimeHomeUi', checked)}
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
        <SettingsRow
          label="Enable overlay visual tuning"
          description="Developer-only right-click sliders for Settings and session modals."
          control={
            <SettingsToggle
              checked={settings.enableOverlayVisualTuning}
              onChange={(checked) => updateSetting('enableOverlayVisualTuning', checked)}
            />
          }
        />
        <SettingsRow
          label="Enable developer reload hotkeys"
          description="Ctrl+R reloads, Ctrl+Shift+R hard reloads, Ctrl+Alt+R relaunches Electron."
          control={
            <SettingsToggle
              checked={settings.enableDeveloperReloadHotkeys}
              onChange={(checked) => updateSetting('enableDeveloperReloadHotkeys', checked)}
            />
          }
        />
      </SettingsSection>
    </div>
  );
}
