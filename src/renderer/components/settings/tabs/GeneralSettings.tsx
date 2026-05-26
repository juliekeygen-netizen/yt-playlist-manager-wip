import type { PlaylistSortKey, RowsPerPage, VideoSortKey } from '@shared/playlistMockData';
import { DropdownButton } from '../../playlists/DropdownButton';
import { useSettings } from '../../../contexts/settingsContextValue';
import { SettingsRow, SettingsSection } from '../SettingsRow';
import { SettingsToggle } from '../SettingsToggle';

const rowsPerPageOptions: Array<{ label: string; value: RowsPerPage }> = [
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
  { label: '200', value: 200 },
  { label: '500', value: 500 },
  { label: '1000', value: 1000 },
  { label: 'All', value: 'All' },
];

const playlistSortOptions: Array<{ label: string; value: PlaylistSortKey }> = [
  { label: 'Playlist title', value: 'playlistName' },
  { label: 'Recently updated', value: 'recentlyUpdated' },
  { label: 'Video count', value: 'videoCount' },
  { label: 'Total duration', value: 'totalDuration' },
];

const videoSortOptions: Array<{ label: string; value: VideoSortKey }> = [
  { label: 'Manual', value: 'manual' },
  { label: 'Video title', value: 'videoTitle' },
  { label: 'Channel', value: 'channel' },
  { label: 'Date added', value: 'dateAdded' },
  { label: 'Duration', value: 'duration' },
  { label: 'Status', value: 'status' },
];

export function GeneralSettings() {
  const { settings, updateSetting } = useSettings();

  return (
    <div className="space-y-7">
      <SettingsSection title="Startup">
        <SettingsRow
          label="Open last used tab on launch"
          control={
            <SettingsToggle
              checked={settings.openLastTabOnLaunch}
              onChange={(checked) => updateSetting('openLastTabOnLaunch', checked)}
            />
          }
        />
        <SettingsRow
          label="Restore last selected playlist on launch"
          control={
            <SettingsToggle
              checked={settings.restoreLastPlaylistOnLaunch}
              onChange={(checked) => updateSetting('restoreLastPlaylistOnLaunch', checked)}
            />
          }
        />
        <SettingsRow
          label="Check for unfinished queue operations on launch"
          control={
            <SettingsToggle
              checked={settings.checkUnfinishedQueueOnLaunch}
              onChange={(checked) => updateSetting('checkUnfinishedQueueOnLaunch', checked)}
            />
          }
        />
      </SettingsSection>

      <SettingsSection title="Default behavior">
        <SettingsRow
          label="Default rows per page"
          control={
            <DropdownButton
              variant="settings"
              label={String(settings.defaultRowsPerPage)}
              options={rowsPerPageOptions}
              value={settings.defaultRowsPerPage}
              onSelect={(value) => updateSetting('defaultRowsPerPage', value)}
              placement="bottom"
            />
          }
        />
        <SettingsRow
          label="Default playlist sort"
          control={
            <DropdownButton
              variant="settings"
              label={playlistSortOptions.find((option) => option.value === settings.defaultPlaylistSort)?.label ?? 'Recently updated'}
              options={playlistSortOptions}
              value={settings.defaultPlaylistSort}
              onSelect={(value) => updateSetting('defaultPlaylistSort', value)}
              placement="bottom"
            />
          }
        />
        <SettingsRow
          label="Default video sort"
          control={
            <DropdownButton
              variant="settings"
              label={videoSortOptions.find((option) => option.value === settings.defaultVideoSort)?.label ?? 'Date added'}
              options={videoSortOptions}
              value={settings.defaultVideoSort}
              onSelect={(value) => updateSetting('defaultVideoSort', value)}
              placement="bottom"
            />
          }
        />
      </SettingsSection>

      <SettingsSection title="Interface">
        <SettingsRow
          label="Enable hover-scroll on dropdowns"
          control={
            <SettingsToggle
              checked={settings.enableDropdownHoverScroll}
              onChange={(checked) => updateSetting('enableDropdownHoverScroll', checked)}
            />
          }
        />
      </SettingsSection>
    </div>
  );
}
