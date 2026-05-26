import { Play, Search } from 'lucide-react';
import type {
  QueueSortKey,
  QueueStatusFilter,
  QueueTypeFilter,
} from '@shared/queueMockData';
import type { SortDirection } from '@shared/playlistMockData';
import { DropdownButton } from '../playlists/DropdownButton';

const statusOptions = [
  { label: 'All statuses', value: 'All statuses' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Needs review', value: 'Needs review' },
  { label: 'Running', value: 'Running' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Failed', value: 'Failed' },
  { label: 'Cancelled', value: 'Cancelled' },
] satisfies Array<{ label: string; value: QueueStatusFilter }>;

const typeOptions = [
  { label: 'All types', value: 'All types' },
  { label: 'Copy videos', value: 'Copy videos' },
  { label: 'Move videos', value: 'Move videos' },
  { label: 'Remove videos', value: 'Remove videos' },
  { label: 'Sync playlist', value: 'Sync playlist' },
  { label: 'Export playlist', value: 'Export playlist' },
  { label: 'Reorder playlist', value: 'Reorder playlist' },
] satisfies Array<{ label: string; value: QueueTypeFilter }>;

const sortOptions = [
  { label: 'By date', value: 'date' },
  { label: 'Queue status', value: 'status' },
  { label: 'Operation type', value: 'type' },
  { label: 'Playlist title', value: 'source' },
] satisfies Array<{ label: string; value: QueueSortKey }>;

const sortLabels: Record<QueueSortKey, string> = {
  date: 'By date',
  status: 'Queue status',
  type: 'Operation type',
  source: 'Playlist title',
};

export function QueueToolbar({
  search,
  statusFilter,
  typeFilter,
  sortKey,
  sortDirection,
  runAllDisabled,
  onSearchChange,
  onStatusFilterChange,
  onTypeFilterChange,
  onSortChange,
  onRunAll,
}: {
  search: string;
  statusFilter: QueueStatusFilter;
  typeFilter: QueueTypeFilter;
  sortKey: QueueSortKey;
  sortDirection: SortDirection;
  runAllDisabled: boolean;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: QueueStatusFilter) => void;
  onTypeFilterChange: (value: QueueTypeFilter) => void;
  onSortChange: (value: QueueSortKey) => void;
  onRunAll: () => void;
}) {
  return (
    <section className="flex items-center gap-4">
      <label className="flex h-10 min-w-[300px] max-w-[360px] flex-1 items-center gap-3 rounded-md border border-white/[0.09] bg-shell-950/35 px-4 text-mist-500">
        <Search size={18} />
        <input
          className="w-full bg-transparent text-sm text-mist-100 outline-none placeholder:text-mist-500"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search operations..."
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
        label={typeFilter}
        options={typeOptions}
        value={typeFilter}
        onSelect={onTypeFilterChange}
      />
      <DropdownButton
        className="w-[220px]"
        label={`Sort: ${sortLabels[sortKey]} ${sortDirection === 'asc' ? '↑' : '↓'}`}
        options={sortOptions}
        value={sortKey}
        onSelect={onSortChange}
      />
      <button
        className="ml-auto flex h-10 items-center gap-2 rounded-md bg-gradient-to-r from-blue-500 to-blue-700 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:from-blue-400 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-45"
        disabled={runAllDisabled}
        onClick={runAllDisabled ? undefined : onRunAll}
      >
        <Play size={16} />
        Run all
      </button>
    </section>
  );
}
