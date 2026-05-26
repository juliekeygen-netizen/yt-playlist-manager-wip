import { Search, Trash2 } from 'lucide-react';
import type { HistoryFilter, HistorySortKey } from '@shared/historyMockData';
import { DropdownButton } from '../playlists/DropdownButton';

const filterOptions = [
  { label: 'All history', value: 'All history' },
  { label: 'Undoable', value: 'Undoable' },
  { label: 'Recoverable', value: 'Recoverable' },
  { label: 'Restored', value: 'Restored' },
] satisfies Array<{ label: string; value: HistoryFilter }>;

const sortOptions = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Oldest first', value: 'oldest' },
  { label: 'Action type', value: 'actionType' },
  { label: 'Playlist title', value: 'playlistTitle' },
  { label: 'Recovery state', value: 'recoveryState' },
] satisfies Array<{ label: string; value: HistorySortKey }>;

const sortLabels: Record<HistorySortKey, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  actionType: 'Action type',
  playlistTitle: 'Playlist title',
  recoveryState: 'Recovery state',
};

export function HistoryToolbar({
  search,
  filter,
  sortKey,
  clearDisabled,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onClearOldHistory,
}: {
  search: string;
  filter: HistoryFilter;
  sortKey: HistorySortKey;
  clearDisabled: boolean;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: HistoryFilter) => void;
  onSortChange: (value: HistorySortKey) => void;
  onClearOldHistory: () => void;
}) {
  return (
    <section className="flex shrink-0 items-center gap-4">
      <label className="flex h-10 min-w-[300px] max-w-[360px] flex-1 items-center gap-3 rounded-md border border-white/[0.09] bg-shell-950/35 px-4 text-mist-500">
        <Search size={18} />
        <input
          className="w-full bg-transparent text-sm text-mist-100 outline-none placeholder:text-mist-500"
          placeholder="Search history..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>
      <DropdownButton
        className="w-[220px]"
        label={filter}
        options={filterOptions}
        value={filter}
        onSelect={onFilterChange}
      />
      <DropdownButton
        className="w-[220px]"
        label={`Sort: ${sortLabels[sortKey]}`}
        options={sortOptions}
        value={sortKey}
        onSelect={onSortChange}
      />
      <button
        className="ml-auto flex h-10 items-center gap-2 rounded-md border border-white/[0.09] bg-white/[0.035] px-4 text-sm font-semibold text-mist-200 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        disabled={clearDisabled}
        onClick={clearDisabled ? undefined : onClearOldHistory}
      >
        <Trash2 size={17} />
        Clear old history
      </button>
    </section>
  );
}
