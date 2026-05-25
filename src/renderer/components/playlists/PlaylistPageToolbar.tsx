import { RefreshCw, Search } from 'lucide-react';
import type { PlaylistSortKey, PlaylistStatusFilter, SortDirection } from '@shared/playlistMockData';
import { DropdownButton } from './DropdownButton';

const filters: PlaylistStatusFilter[] = ['All', 'Loaded', 'Partial', 'Error'];

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

function getFilterClass(filter: PlaylistStatusFilter, activeFilter: PlaylistStatusFilter) {
  if (filter === activeFilter) {
    if (filter === 'Loaded') {
      return 'bg-emerald-500/12 text-emerald-300 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.28)]';
    }
    if (filter === 'Partial') {
      return 'bg-amber-500/12 text-amber-300 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.26)]';
    }
    if (filter === 'Error') {
      return 'bg-red-500/12 text-red-300 shadow-[inset_0_0_0_1px_rgba(248,113,113,0.26)]';
    }
    return 'bg-blue-500/15 text-blue-300 shadow-[inset_0_0_0_1px_rgba(96,165,250,0.35)]';
  }

  if (filter === 'Loaded') {
    return 'text-emerald-300 hover:bg-white/[0.05]';
  }
  if (filter === 'Partial') {
    return 'text-amber-300 hover:bg-white/[0.05]';
  }
  if (filter === 'Error') {
    return 'text-red-300 hover:bg-white/[0.05]';
  }
  return 'text-mist-300 hover:bg-white/[0.05]';
}

export function PlaylistPageToolbar({
  search,
  statusFilter,
  sortKey,
  sortDirection,
  onSearchChange,
  onStatusFilterChange,
  onSortSelect,
}: {
  search: string;
  statusFilter: PlaylistStatusFilter;
  sortKey: PlaylistSortKey;
  sortDirection: SortDirection;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: PlaylistStatusFilter) => void;
  onSortSelect: (value: PlaylistSortKey) => void;
}) {
  return (
    <section className="flex items-center gap-5">
      <label className="flex h-10 min-w-[300px] flex-1 max-w-[360px] items-center gap-3 rounded-md border border-white/[0.09] bg-shell-950/35 px-4 text-mist-500">
        <Search size={18} />
        <input
          className="w-full bg-transparent text-sm text-mist-100 outline-none placeholder:text-mist-500"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search playlists..."
        />
      </label>

      <div className="flex h-10 overflow-hidden rounded-md border border-white/[0.09] bg-white/[0.035]">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => onStatusFilterChange(filter)}
            className={`border-r border-white/[0.055] px-5 text-sm transition last:border-r-0 ${getFilterClass(
              filter,
              statusFilter,
            )}`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <DropdownButton
          className="w-[220px]"
          label={`Sort: ${sortLabels[sortKey]} ${sortDirection === 'asc' ? '↑' : '↓'}`}
          options={sortOptions}
          value={sortKey}
          onSelect={onSortSelect}
        />
        <button className="flex h-10 items-center gap-2 rounded-md bg-gradient-to-r from-blue-500 to-blue-700 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:from-blue-400 hover:to-blue-600">
          <RefreshCw size={17} />
          Sync all
        </button>
      </div>
    </section>
  );
}
