import { MoreVertical, Upload } from 'lucide-react';
import type {
  PlaylistListRecord,
  PlaylistVideo,
  RowsPerPage,
  SortDirection,
  VideoSortKey,
  VideoStatusFilter,
} from '@shared/playlistMockData';
import { StatusBadge } from './StatusBadge';
import { ThumbnailPlaceholder } from './ThumbnailPlaceholder';
import { SelectionActionBar } from './SelectionActionBar';
import { VideoTable, type SelectionModifiers } from './VideoTable';
import { VideoToolbar } from './VideoToolbar';

export function PlaylistDetailPanel({
  playlist,
  totalPlaylistVideos,
  videos,
  filteredVideos,
  totalFilteredVideos,
  rowsPerPage,
  rangeText,
  page,
  totalPages,
  videoSearch,
  videoStatusFilter,
  videoSortKey,
  videoSortDirection,
  selectedVideoIds,
  onVideoSearchChange,
  onVideoStatusFilterChange,
  onVideoSortSelect,
  onActivateVideoTable,
  onSelectVideo,
  onOpenVideoContextMenu,
  onOpenPlaylistContextMenu,
  onOpenExportPlaylist,
  onOpenPlaylistStats,
  onToggleAllFiltered,
  onRowsPerPageChange,
  onPreviousPage,
  onNextPage,
  manualSortActive,
  onReorderVisibleVideos,
  onCopySelected,
  onMoveSelected,
  onRemoveSelected,
  onClearSelection,
  removeConfirmActive,
  onConfirmRemove,
  onCancelRemove,
}: {
  playlist: PlaylistListRecord;
  totalPlaylistVideos: number;
  videos: PlaylistVideo[];
  filteredVideos: PlaylistVideo[];
  totalFilteredVideos: number;
  rowsPerPage: RowsPerPage;
  rangeText: string;
  page: number;
  totalPages: number;
  videoSearch: string;
  videoStatusFilter: VideoStatusFilter;
  videoSortKey: VideoSortKey;
  videoSortDirection: SortDirection;
  selectedVideoIds: string[];
  onVideoSearchChange: (value: string) => void;
  onVideoStatusFilterChange: (value: VideoStatusFilter) => void;
  onVideoSortSelect: (value: VideoSortKey) => void;
  onActivateVideoTable: () => void;
  onSelectVideo: (id: string, modifiers: SelectionModifiers, visibleVideoIds: string[]) => void;
  onOpenVideoContextMenu: (videoId: string, x: number, y: number) => void;
  onOpenPlaylistContextMenu: (playlistId: string, x: number, y: number) => void;
  onOpenExportPlaylist: () => void;
  onOpenPlaylistStats: () => void;
  onToggleAllFiltered: () => void;
  onRowsPerPageChange: (value: RowsPerPage) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  manualSortActive: boolean;
  onReorderVisibleVideos: (draggedVideoId: string, targetVideoId: string | null) => void;
  onCopySelected: () => void;
  onMoveSelected: () => void;
  onRemoveSelected: () => void;
  onClearSelection: () => void;
  removeConfirmActive: boolean;
  onConfirmRemove: () => void;
  onCancelRemove: () => void;
}) {
  return (
    <section className="panel flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg">
      <header className="flex shrink-0 items-start gap-5 p-4">
        <ThumbnailPlaceholder size="lg" />
        <div className="min-w-0 pt-2">
          <h2 className="truncate text-2xl font-semibold tracking-[-0.025em] text-mist-50">
            {playlist.title}
          </h2>
          <p className="mt-2 truncate text-sm text-mist-400">
            {totalPlaylistVideos} videos{' '}
            <span className="px-2 text-mist-600">•</span> Last synced: {playlist.lastSynced}
          </p>
          <div className="mt-3">
            <StatusBadge status={playlist.status} />
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            className="flex h-10 items-center gap-2 rounded-md border border-white/[0.09] bg-white/[0.035] px-4 text-sm text-mist-100 transition hover:bg-white/[0.07]"
            onClick={onOpenExportPlaylist}
            type="button"
          >
            <Upload size={17} />
            Export
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-md border border-white/[0.09] bg-white/[0.035] text-mist-400 transition hover:bg-white/[0.07] hover:text-mist-100"
            onClick={(event) => onOpenPlaylistContextMenu(playlist.id, event.clientX, event.clientY)}
            type="button"
          >
            <MoreVertical size={19} />
          </button>
        </div>
      </header>

      <VideoToolbar
        search={videoSearch}
        statusFilter={videoStatusFilter}
        sortKey={videoSortKey}
        sortDirection={videoSortDirection}
        onSearchChange={onVideoSearchChange}
        onStatusFilterChange={onVideoStatusFilterChange}
        onSortSelect={onVideoSortSelect}
        onOpenStats={onOpenPlaylistStats}
      />
      {removeConfirmActive ? (
        <RemoveConfirmation
          playlistTitle={playlist.title}
          selectedCount={selectedVideoIds.length}
          onCancel={onCancelRemove}
          onConfirm={onConfirmRemove}
        />
      ) : (
        <>
          <SelectionActionBar
            selectedCount={selectedVideoIds.length}
            onClear={onClearSelection}
            onCopy={onCopySelected}
            onMove={onMoveSelected}
            onRemove={onRemoveSelected}
          />
          <VideoTable
            videos={videos}
            filteredVideos={filteredVideos}
            totalFilteredVideos={totalFilteredVideos}
            totalPlaylistVideos={totalPlaylistVideos}
            rowsPerPage={rowsPerPage}
            rangeText={rangeText}
            page={page}
            totalPages={totalPages}
            selectedIds={selectedVideoIds}
            onToggleAllFiltered={onToggleAllFiltered}
            onRowsPerPageChange={onRowsPerPageChange}
            onPreviousPage={onPreviousPage}
            onNextPage={onNextPage}
            manualSortActive={manualSortActive}
            onActivate={onActivateVideoTable}
            onSelectVideo={onSelectVideo}
            onOpenContextMenu={onOpenVideoContextMenu}
            onReorderVisibleVideos={onReorderVisibleVideos}
          />
        </>
      )}
    </section>
  );
}

function RemoveConfirmation({
  playlistTitle,
  selectedCount,
  onCancel,
  onConfirm,
}: {
  playlistTitle: string;
  selectedCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center border-t border-white/[0.055] px-6">
      <section className="panel max-w-[520px] rounded-xl p-6 text-center shadow-none">
        <h3 className="text-xl font-semibold text-mist-50">
          Remove {selectedCount} {selectedCount === 1 ? 'video' : 'videos'} from {playlistTitle}?
        </h3>
        <p className="mt-2 text-sm text-mist-400">
          This only changes the mock playlist data in this UI shell.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <button
            className="rounded-md bg-red-500/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
            onClick={onConfirm}
          >
            Remove from playlist
          </button>
          <button
            className="rounded-md border border-white/[0.09] bg-white/[0.035] px-4 py-2 text-sm text-mist-200 transition hover:bg-white/[0.07]"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </section>
    </div>
  );
}

export function EmptyPlaylistDetailPanel() {
  return (
    <section className="panel flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden rounded-lg px-8 text-center">
      <div>
        <h2 className="text-xl font-semibold text-mist-50">No playlists found</h2>
        <p className="mt-2 text-sm text-mist-400">Try changing your search or filters.</p>
      </div>
    </section>
  );
}
