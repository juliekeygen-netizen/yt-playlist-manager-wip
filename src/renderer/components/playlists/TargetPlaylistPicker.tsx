import { Copy, FolderInput, MoreVertical, Pin, Search, X } from 'lucide-react';
import type { MouseEvent } from 'react';
import type {
  PlaylistSortKey,
  PlaylistStatus,
  PlaylistViewRecord,
  PlaylistVideo,
  SortDirection,
  TargetPlaylistStatusFilter,
} from '@shared/playlistMockData';
import { DropdownButton } from './DropdownButton';
import { StatusText } from './StatusBadge';
import { ThumbnailPlaceholder } from './ThumbnailPlaceholder';
import type { SelectionModifiers } from './VideoTable';

export type TargetPickerMode = 'copyTarget' | 'moveTarget';

const statusOptions = [
  { label: 'All playlist statuses', value: 'All playlist statuses' },
  { label: 'Loaded', value: 'Loaded' },
  { label: 'Partial', value: 'Partial' },
  { label: 'Error', value: 'Error' },
] satisfies Array<{ label: string; value: TargetPlaylistStatusFilter }>;

const sortOptions = [
  { label: 'Playlist title', value: 'playlistName' },
  { label: 'Recently updated', value: 'recentlyUpdated' },
  { label: 'Video count', value: 'videoCount' },
  { label: 'Total duration', value: 'totalDuration' },
] satisfies Array<{ label: string; value: PlaylistSortKey }>;

const sortLabels: Record<PlaylistSortKey, string> = {
  playlistName: 'Playlist title',
  recentlyUpdated: 'Recently updated',
  videoCount: 'Video count',
  totalDuration: 'Total duration',
};

const tableGrid = 'grid-cols-[40px_86px_minmax(260px,2fr)_100px_126px_158px_28px]';

export function TargetPlaylistPicker({
  mode,
  sourcePlaylist,
  playlists,
  playlistVideosByPlaylistId,
  selectedVideoIds,
  selectedTargetIds,
  search,
  statusFilter,
  sortKey,
  sortDirection,
  onSearchChange,
  onStatusFilterChange,
  onSortSelect,
  onActivate,
  onSelectTarget,
  onOpenPlaylistContextMenu,
  onConfirm,
  onCancel,
}: {
  mode: TargetPickerMode;
  sourcePlaylist: PlaylistViewRecord;
  playlists: PlaylistViewRecord[];
  playlistVideosByPlaylistId: Record<string, PlaylistVideo[]>;
  selectedVideoIds: string[];
  selectedTargetIds: string[];
  search: string;
  statusFilter: TargetPlaylistStatusFilter;
  sortKey: PlaylistSortKey;
  sortDirection: SortDirection;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: TargetPlaylistStatusFilter) => void;
  onSortSelect: (value: PlaylistSortKey) => void;
  onActivate: () => void;
  onSelectTarget: (playlistId: string, modifiers: SelectionModifiers, visibleTargetIds: string[]) => void;
  onOpenPlaylistContextMenu: (playlistId: string, x: number, y: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const copyMode = mode === 'copyTarget';
  const selectedTargetTitles = playlists
    .filter((playlist) => selectedTargetIds.includes(playlist.id))
    .map((playlist) => playlist.title);
  const targetLabel =
    selectedTargetTitles.length > 0
      ? `${copyMode ? 'Target playlists' : 'Target playlist'}: ${selectedTargetTitles.join(', ')}`
      : `Choose target ${copyMode ? 'playlists' : 'playlist'}`;
  const confirmDisabled = selectedTargetIds.length === 0;
  const targetStates = new Map(playlists.map((playlist) => [playlist.id, getTargetState(playlist)]));
  const validTargetIds = playlists
    .filter((playlist) => !targetStates.get(playlist.id)?.disabled)
    .map((playlist) => playlist.id);

  return (
    <section
      className="panel flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg"
      data-active-list-scope={mode}
      onPointerDownCapture={onActivate}
    >
      <header className="shrink-0 px-6 pb-4 pt-5">
        <h2 className="text-2xl font-semibold tracking-[-0.025em] text-mist-50">
          {copyMode ? 'Copy selected videos' : 'Move selected videos'}
        </h2>
        <p className="mt-2 text-sm text-mist-300">
          Choose where to {copyMode ? 'copy' : 'move'} {selectedVideoIds.length}{' '}
          {selectedVideoIds.length === 1 ? 'video' : 'videos'} from {sourcePlaylist.title}.
        </p>
      </header>

      <section className="flex shrink-0 items-center gap-3 px-6 pb-4">
        <label className="flex h-10 min-w-[260px] flex-1 items-center gap-3 rounded-md border border-white/[0.09] bg-shell-950/35 px-3 text-mist-500">
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
      </section>

      <section className="mx-6 flex h-12 shrink-0 items-center overflow-hidden rounded-md border border-white/[0.075] bg-white/[0.045] text-sm text-mist-200">
        <div className="flex h-full items-center gap-2 border-r border-white/[0.055] px-4 text-blue-300">
          <span className="h-4 w-4 rounded border border-blue-400/70 bg-blue-500/20" />
          {selectedTargetIds.length} selected
        </div>
        <span className="min-w-0 flex-1 truncate px-4">{targetLabel}</span>
        <button
          className="flex h-full items-center gap-2 bg-blue-600 px-5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-mist-500"
          disabled={confirmDisabled}
          onClick={confirmDisabled ? undefined : onConfirm}
        >
          {copyMode ? <Copy size={17} /> : <FolderInput size={17} />}
          {copyMode ? 'Copy here' : 'Move here'}
        </button>
        <button
          className="flex h-full items-center gap-2 px-4 transition hover:bg-white/[0.06] hover:text-white"
          onClick={onCancel}
        >
          <X size={17} />
          {copyMode ? 'Cancel copy' : 'Cancel move'}
        </button>
      </section>

      <div className={`mt-4 grid shrink-0 ${tableGrid} items-center border-y border-white/[0.055] px-6 py-3 text-sm font-medium text-mist-300`}>
        <span />
        <span />
        <span>Playlist</span>
        <span>Videos</span>
        <span>Status</span>
        <span>Last synced</span>
        <span />
      </div>

      <div className="video-table-scroll min-h-0 flex-1 overflow-y-auto">
        {playlists.length > 0 ? (
          playlists.map((playlist) => {
            const { disabled, rowStatus, title } = targetStates.get(playlist.id) ?? getTargetState(playlist);

            return (
              <div
                key={playlist.id}
                role="button"
                tabIndex={disabled ? -1 : 0}
                className={`grid min-h-[62px] w-full ${tableGrid} items-center border-b border-white/[0.045] px-6 py-2.5 text-left text-sm transition ${
                  disabled ? 'cursor-not-allowed opacity-45' : 'hover:bg-white/[0.03]'
                } ${selectedTargetIds.includes(playlist.id) ? 'bg-blue-500/[0.08]' : ''}`}
                title={title}
                onContextMenu={(event) => {
                  event.preventDefault();
                  onOpenPlaylistContextMenu(playlist.id, event.clientX, event.clientY);
                }}
                onClick={(event) => {
                  if (!disabled) {
                    onSelectTarget(playlist.id, getSelectionModifiers(event), validTargetIds);
                  }
                }}
                onKeyDown={(event) => {
                  if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    onSelectTarget(
                      playlist.id,
                      { ctrlKey: false, metaKey: false, shiftKey: false },
                      validTargetIds,
                    );
                  }
                }}
              >
                <input
                  checked={selectedTargetIds.includes(playlist.id)}
                  className="h-4 w-4 rounded border-slate-600 bg-shell-950 accent-blue-500"
                  disabled={disabled}
                  onChange={() => undefined}
                  type="checkbox"
                />
                <ThumbnailPlaceholder size="table" />
                <span className="clamp-2 min-w-0 pr-5 font-semibold leading-5 text-mist-50">
                  {playlist.title}
                  {playlist.pinned && (
                    <Pin size={13} className="ml-2 inline-block fill-blue-300/20 text-blue-300" />
                  )}
                </span>
                <span className="text-mist-300">{playlist.videoCount} videos</span>
                <StatusText status={rowStatus} />
                <span className="text-mist-400">{playlist.lastSynced}</span>
                <button
                  className="rounded-md p-1 text-mist-500 transition hover:bg-white/[0.07] hover:text-mist-100"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenPlaylistContextMenu(playlist.id, event.clientX, event.clientY);
                  }}
                >
                  <MoreVertical size={18} />
                </button>
              </div>
            );
          })
        ) : (
          <div className="flex h-full min-h-[220px] flex-col items-center justify-center px-6 text-center">
            <h3 className="text-lg font-semibold text-mist-50">No playlists found</h3>
            <p className="mt-2 text-sm text-mist-400">Try changing your search or filters.</p>
          </div>
        )}
      </div>

      <footer className="flex h-12 shrink-0 items-center justify-between border-t border-white/[0.055] px-6 text-sm text-mist-400">
        <span>
          {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
        </span>
        <span>
          {playlists.length === 0 ? '0 of 0' : `1–${playlists.length} of ${playlists.length}`}
        </span>
      </footer>
    </section>
  );

  function getTargetState(playlist: PlaylistViewRecord): {
    disabled: boolean;
    rowStatus: PlaylistStatus | 'Source' | 'Duplicate';
    title?: string;
  } {
    const isSource = playlist.id === sourcePlaylist.id;
    const hasDuplicate = !isSource && selectedVideoIds.some((videoId) =>
      (playlistVideosByPlaylistId[playlist.id] ?? []).some((video) => video.id === videoId),
    );

    if (isSource) {
      return {
        disabled: true,
        rowStatus: 'Source',
        title: 'This is the source playlist.',
      };
    }

    if (hasDuplicate) {
      return {
        disabled: true,
        rowStatus: 'Duplicate',
        title: 'This playlist already contains one or more selected videos.',
      };
    }

    return {
      disabled: false,
      rowStatus: playlist.status,
    };
  }
}

function getSelectionModifiers(event: MouseEvent<HTMLElement>): SelectionModifiers {
  return {
    shiftKey: event.shiftKey,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
  };
}
