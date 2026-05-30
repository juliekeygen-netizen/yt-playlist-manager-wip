import { RefreshCw, Search } from 'lucide-react';
import type { PlaylistSortKey, PlaylistStatusFilter, SortDirection } from '@shared/playlistMockData';
import { DropdownButton } from './DropdownButton';

const statusOptions = [
  { label: 'All statuses', value: 'All statuses' },
  { label: 'Loaded', value: 'Loaded' },
  { label: 'Partial', value: 'Partial' },
  { label: 'Error', value: 'Error' },
] satisfies Array<{ label: string; value: PlaylistStatusFilter }>;

const sortOptions = [
  { label: 'Playlist title', value: 'playlistName' },
  { label: 'Recently updated', value: 'recentlyUpdated' },
  { label: 'Video count', value: 'videoCount' },
  { label: 'Total duration', value: 'totalDuration' },
] satisfies Array<{ label: string; value: PlaylistSortKey }>;

const sortLabels: Record<PlaylistSortKey, string> = {
  recentlyUpdated: 'Recently updated',
  playlistName: 'Playlist title',
  videoCount: 'Video count',
  totalDuration: 'Total duration',
};

export function PlaylistPageToolbar({
  search,
  statusFilter,
  sortKey,
  sortDirection,
  syncing,
  onSearchChange,
  onStatusFilterChange,
  onSortSelect,
  onSyncAll,
}: {
  search: string;
  statusFilter: PlaylistStatusFilter;
  sortKey: PlaylistSortKey;
  sortDirection: SortDirection;
  syncing?: boolean;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: PlaylistStatusFilter) => void;
  onSortSelect: (value: PlaylistSortKey) => void;
  onSyncAll: () => void;
}) {
  return (
    <section className="flex items-center gap-4">
      <label className="flex h-10 min-w-[300px] flex-1 max-w-[360px] items-center gap-3 rounded-md border border-white/[0.09] bg-shell-950/35 px-4 text-mist-500">
        <Search size={18} />
        <input
          className="w-full bg-transparent text-sm text-mist-100 outline-none placeholder:text-mist-500"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search playlists..."
        />
      </label>

      <DropdownButton
        className="w-[220px]"
        label={statusFilter}
        options={statusOptions}
        value={statusFilter}
        onSelect={onStatusFilterChange}
      />
      <DropdownButton
        className="w-[220px]"
        label={`Sort: ${sortLabels[sortKey]} ${sortDirection === 'asc' ? '↑' : '↓'}`}
        options={sortOptions}
        value={sortKey}
        onSelect={onSortSelect}
      />
      <button
        className="ml-auto flex h-10 w-[108px] items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-500 to-blue-700 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:from-blue-400 hover:to-blue-600 disabled:cursor-wait disabled:opacity-80"
        disabled={syncing}
        onClick={onSyncAll}
        type="button"
      >
        <RefreshCw size={17} />
        {syncing ? 'Syncing' : 'Sync all'}
      </button>
    </section>
  );
}
