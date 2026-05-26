import type { BackupRetention } from '@shared/settings';
import { DropdownButton } from '../../playlists/DropdownButton';
import { useSettings } from '../../../contexts/settingsContextValue';
import { SettingsButton, SettingsRow, SettingsSection } from '../SettingsRow';
import { SettingsToggle } from '../SettingsToggle';

const backupRetentionOptions: Array<{ label: BackupRetention; value: BackupRetention }> = [
  { label: '7 days', value: '7 days' },
  { label: '30 days', value: '30 days' },
  { label: '90 days', value: '90 days' },
  { label: 'Forever', value: 'Forever' },
];

export function SafetyBackupsSettings({ onNotImplemented }: { onNotImplemented: (title: string) => void }) {
  const { settings, updateSetting } = useSettings();

  return (
    <div className="space-y-7">
      <SettingsSection title="Confirmations / Warnings">
        <SettingsRow
          label="Confirm before destructive actions"
          control={
            <SettingsToggle
              checked={settings.confirmDestructiveActions}
              onChange={(checked) => updateSetting('confirmDestructiveActions', checked)}
            />
          }
        />
        <SettingsRow
          label="Warn when backup contains deleted/unavailable videos"
          control={
            <SettingsToggle
              checked={settings.warnBackupContainsUnavailable}
              onChange={(checked) => updateSetting('warnBackupContainsUnavailable', checked)}
            />
          }
        />
        <SettingsRow
          label="Warn before clearing recoverable backups"
          control={
            <SettingsToggle
              checked={settings.warnBeforeClearingRecoverableBackups}
              onChange={(checked) => updateSetting('warnBeforeClearingRecoverableBackups', checked)}
            />
          }
        />
        <SettingsRow
          label="Confirm before restoring backups"
          control={
            <SettingsToggle
              checked={settings.confirmBeforeRestoringBackups}
              onChange={(checked) => updateSetting('confirmBeforeRestoringBackups', checked)}
            />
          }
        />
        <SettingsRow
          label="Confirm before applying multiple operations at once"
          control={
            <SettingsToggle
              checked={settings.confirmBeforeApplyingMultipleOperations}
              onChange={(checked) => updateSetting('confirmBeforeApplyingMultipleOperations', checked)}
            />
          }
        />
      </SettingsSection>

      <SettingsSection title="Backups">
        <SettingsRow
          label="Save local snapshot before destructive actions"
          control={
            <SettingsToggle
              checked={settings.saveSnapshotBeforeDestructiveActions}
              onChange={(checked) => updateSetting('saveSnapshotBeforeDestructiveActions', checked)}
            />
          }
        />
        <SettingsRow
          label="Save deleted playlist snapshots"
          control={
            <SettingsToggle
              checked={settings.saveDeletedPlaylistSnapshots}
              onChange={(checked) => updateSetting('saveDeletedPlaylistSnapshots', checked)}
            />
          }
        />
        <SettingsRow
          label="Save removed video snapshots"
          control={
            <SettingsToggle
              checked={settings.saveRemovedVideoSnapshots}
              onChange={(checked) => updateSetting('saveRemovedVideoSnapshots', checked)}
            />
          }
        />
        <SettingsRow
          label="Backup retention"
          control={
            <DropdownButton
              variant="settings"
              label={settings.backupRetention}
              options={backupRetentionOptions}
              value={settings.backupRetention}
              onSelect={(value) => updateSetting('backupRetention', value)}
            />
          }
        />
        <SettingsRow
          label="Open backup folder"
          control={<SettingsButton onClick={() => onNotImplemented('Open backup folder')}>Open folder</SettingsButton>}
        />
      </SettingsSection>
    </div>
  );
}
