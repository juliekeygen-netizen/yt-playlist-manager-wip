import { BarChart3, Search } from 'lucide-react';
import type { SortDirection, VideoSortKey, VideoStatusFilter } from '@shared/playlistMockData';
import { AdvancedSearchButton } from './AdvancedSearchButton';
import { DropdownButton } from './DropdownButton';

const statusOptions = [
  { label: 'All statuses', value: 'All statuses' },
  { label: 'Public', value: 'Public' },
  { label: 'Unlisted', value: 'Unlisted' },
  { label: 'Private', value: 'Private' },
  { label: 'Deleted', value: 'Deleted' },
  { label: 'Unavailable', value: 'Unavailable' },
] satisfies Array<{ label: string; value: VideoStatusFilter }>;

const sortOptions = [
  { label: 'Manual', value: 'manual' },
  { label: 'Video title', value: 'videoTitle' },
  { label: 'Channel', value: 'channel' },
  { label: 'Date added', value: 'dateAdded' },
  { label: 'Duration', value: 'duration' },
  { label: 'Status', value: 'status' },
] satisfies Array<{ label: string; value: VideoSortKey }>;

const sortLabels: Record<VideoSortKey, string> = {
  manual: 'Manual',
  videoTitle: 'Video title',
  channel: 'Channel',
  duration: 'Duration',
  status: 'Status',
  dateAdded: 'Date added',
};

export function VideoToolbar({
  search,
  statusFilter,
  sortKey,
  sortDirection,
  onSearchChange,
  onStatusFilterChange,
  onSortSelect,
  onOpenStats,
}: {
  search: string;
  statusFilter: VideoStatusFilter;
  sortKey: VideoSortKey;
  sortDirection: SortDirection;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: VideoStatusFilter) => void;
  onSortSelect: (value: VideoSortKey) => void;
  onOpenStats: () => void;
}) {
  return (
    <section className="flex shrink-0 items-center gap-3 border-t border-white/[0.055] px-4 py-3">
      <label className="flex h-10 min-w-[260px] flex-1 items-center gap-3 rounded-md border border-white/[0.09] bg-shell-950/35 px-3 text-mist-500">
        <Search size={18} />
        <input
          className="w-full bg-transparent text-sm text-mist-100 outline-none placeholder:text-mist-500"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search videos..."
        />
      </label>
      <AdvancedSearchButton />
      <DropdownButton
        className="w-[150px]"
        label={statusFilter}
        options={statusOptions}
        value={statusFilter}
        onSelect={onStatusFilterChange}
      />
      <DropdownButton
        className="w-[230px]"
        label={`Sort: ${sortLabels[sortKey]}${sortKey === 'manual' ? '' : ` ${sortDirection === 'asc' ? '↑' : '↓'}`}`}
        options={sortOptions}
        value={sortKey}
        onSelect={onSortSelect}
      />
      <button
        className="ml-auto flex h-10 items-center gap-2 rounded-md border border-white/[0.09] bg-white/[0.035] px-4 text-sm text-mist-100 transition hover:bg-white/[0.07]"
        onClick={onOpenStats}
        type="button"
      >
        <BarChart3 size={17} className="text-mist-300" />
        Stats
      </button>
    </section>
  );
}
