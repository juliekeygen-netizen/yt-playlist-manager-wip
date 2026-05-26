import {
  actionModeLabels,
  type ActionMode,
  type AllOperationsCleanupDelay,
  type CompletedCleanupDelay,
  type HistoryCleanupDelay,
} from '@shared/settings';
import { DropdownButton } from '../../playlists/DropdownButton';
import { useSettings } from '../../../contexts/settingsContextValue';
import { SettingsRow, SettingsSection } from '../SettingsRow';

const actionModeOptions: Array<{ label: string; value: ActionMode }> = [
  { label: actionModeLabels.queue, value: 'queue' },
  { label: actionModeLabels.askAndApply, value: 'askAndApply' },
  { label: actionModeLabels.applyNow, value: 'applyNow' },
];

const completedCleanupOptions: Array<{ label: CompletedCleanupDelay; value: CompletedCleanupDelay }> = [
  { label: 'Never', value: 'Never' },
  { label: '5 minutes', value: '5 minutes' },
  { label: '1 hour', value: '1 hour' },
  { label: '1 day', value: '1 day' },
  { label: '7 days', value: '7 days' },
];

const allOperationsCleanupOptions: Array<{
  label: AllOperationsCleanupDelay;
  value: AllOperationsCleanupDelay;
}> = [
  { label: 'Never', value: 'Never' },
  { label: '1 day', value: '1 day' },
  { label: '7 days', value: '7 days' },
  { label: '30 days', value: '30 days' },
];

const historyCleanupOptions: Array<{ label: HistoryCleanupDelay; value: HistoryCleanupDelay }> = [
  { label: 'Never', value: 'Never' },
  { label: '7 days', value: '7 days' },
  { label: '30 days', value: '30 days' },
  { label: '90 days', value: '90 days' },
];

export function QueueHistorySettings() {
  const { settings, updateSetting } = useSettings();

  return (
    <div className="space-y-7">
      <SettingsSection title="Default action mode">
        <SettingsRow
          label="Copy or move videos"
          control={
            <DropdownButton
              variant="settings"
              label={actionModeLabels[settings.copyMoveActionMode]}
              options={actionModeOptions}
              value={settings.copyMoveActionMode}
              onSelect={(value) => updateSetting('copyMoveActionMode', value)}
            />
          }
        />
        <SettingsRow
          label="Remove videos"
          control={
            <DropdownButton
              variant="settings"
              label={actionModeLabels[settings.removeVideosActionMode]}
              options={actionModeOptions}
              value={settings.removeVideosActionMode}
              onSelect={(value) => updateSetting('removeVideosActionMode', value)}
            />
          }
        />
        <SettingsRow
          label="Delete playlists"
          control={
            <DropdownButton
              variant="settings"
              label={actionModeLabels[settings.deletePlaylistsActionMode]}
              options={actionModeOptions}
              value={settings.deletePlaylistsActionMode}
              onSelect={(value) => updateSetting('deletePlaylistsActionMode', value)}
            />
          }
        />
        <SettingsRow
          label="Reorder playlist"
          control={
            <DropdownButton
              variant="settings"
              label={actionModeLabels[settings.reorderPlaylistActionMode]}
              options={actionModeOptions}
              value={settings.reorderPlaylistActionMode}
              onSelect={(value) => updateSetting('reorderPlaylistActionMode', value)}
            />
          }
        />
      </SettingsSection>

      <SettingsSection title="Queue cleanup">
        <SettingsRow
          label="Auto-clear completed and cancelled operations after"
          control={
            <DropdownButton
              variant="settings"
              label={settings.autoClearCompletedOperationsAfter}
              options={completedCleanupOptions}
              value={settings.autoClearCompletedOperationsAfter}
              onSelect={(value) => updateSetting('autoClearCompletedOperationsAfter', value)}
            />
          }
        />
        <SettingsRow
          label="Auto-clear all operations after"
          control={
            <DropdownButton
              variant="settings"
              label={settings.autoClearAllOperationsAfter}
              options={allOperationsCleanupOptions}
              value={settings.autoClearAllOperationsAfter}
              onSelect={(value) => updateSetting('autoClearAllOperationsAfter', value)}
            />
          }
        />
      </SettingsSection>

      <SettingsSection title="History cleanup">
        <SettingsRow
          label="Auto-clear history after"
          control={
            <DropdownButton
              variant="settings"
              label={settings.autoClearHistoryAfter}
              options={historyCleanupOptions}
              value={settings.autoClearHistoryAfter}
              onSelect={(value) => updateSetting('autoClearHistoryAfter', value)}
            />
          }
        />
        <SettingsRow
          label="Auto-clear restored items after"
          control={
            <DropdownButton
              variant="settings"
              label={settings.autoClearRestoredItemsAfter}
              options={completedCleanupOptions}
              value={settings.autoClearRestoredItemsAfter}
              onSelect={(value) => updateSetting('autoClearRestoredItemsAfter', value)}
            />
          }
        />
      </SettingsSection>
    </div>
  );
}
