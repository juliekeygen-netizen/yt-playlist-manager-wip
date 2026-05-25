import { ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import type { MouseEvent } from 'react';
import type { QueueAffectedVideo, QueueRowsPerPage } from '@shared/queueMockData';
import { DropdownButton } from '../playlists/DropdownButton';
import { ThumbnailPlaceholder } from '../playlists/ThumbnailPlaceholder';
import type { QueueSelectionModifiers } from './QueueOperationList';
import { queueActionClasses } from './queueStyle';

const tableGrid = 'grid-cols-[42px_88px_minmax(250px,2fr)_minmax(150px,1fr)_96px_150px_28px]';

const rowsPerPageOptions = [
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
  { label: 'All', value: 'All' },
] satisfies Array<{ label: string; value: QueueRowsPerPage }>;

export function QueueAffectedTable({
  videos,
  allVideos,
  selectedIds,
  rowsPerPage,
  rangeText,
  page,
  totalPages,
  operationType,
  onActivate,
  onSelectVideo,
  onToggleAll,
  onRowsPerPageChange,
  onPreviousPage,
  onNextPage,
  onOpenContextMenu,
}: {
  videos: QueueAffectedVideo[];
  allVideos: QueueAffectedVideo[];
  selectedIds: string[];
  rowsPerPage: QueueRowsPerPage;
  rangeText: string;
  page: number;
  totalPages: number;
  operationType: keyof typeof queueActionClasses;
  onActivate: () => void;
  onSelectVideo: (id: string, modifiers: QueueSelectionModifiers, visibleIds: string[]) => void;
  onToggleAll: () => void;
  onRowsPerPageChange: (value: QueueRowsPerPage) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onOpenContextMenu: (id: string, x: number, y: number) => void;
}) {
  const visibleIds = videos.map((video) => video.id);
  const allSelected = allVideos.length > 0 && allVideos.every((video) => selectedIds.includes(video.id));

  return (
    <section
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      data-active-list-scope="queueDetailVideos"
      onPointerDownCapture={onActivate}
    >
      <div className={`grid shrink-0 ${tableGrid} items-center border-y border-white/[0.055] px-4 py-3 text-sm font-medium text-mist-300`}>
        <input
          aria-label="Select affected videos"
          checked={allSelected}
          className="h-4 w-4 rounded border-slate-600 bg-shell-950 accent-blue-500"
          onChange={onToggleAll}
          type="checkbox"
        />
        <span />
        <span>Video</span>
        <span>Channel</span>
        <span>Duration</span>
        <span>Action</span>
        <span />
      </div>
      <div className="video-table-scroll min-h-0 flex-1 overflow-y-auto">
        {videos.length > 0 ? (
          videos.map((video) => (
            <div
              key={video.id}
              className={`grid min-h-[66px] ${tableGrid} cursor-default items-center border-b border-white/[0.045] px-4 py-2.5 text-sm ${
                selectedIds.includes(video.id) ? 'bg-blue-500/[0.055]' : 'hover:bg-white/[0.025]'
              }`}
              onClick={(event) => onSelectVideo(video.id, getSelectionModifiers(event), visibleIds)}
              onContextMenu={(event) => {
                event.preventDefault();
                onOpenContextMenu(video.id, event.clientX, event.clientY);
              }}
            >
              <input
                checked={selectedIds.includes(video.id)}
                className="h-4 w-4 rounded border-slate-600 bg-shell-950 accent-blue-500"
                onChange={() => undefined}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectVideo(
                    video.id,
                    { ...getSelectionModifiers(event), checkboxToggle: true },
                    visibleIds,
                  );
                }}
                type="checkbox"
              />
              <ThumbnailPlaceholder size="table" />
              <span className="clamp-2 min-w-0 pr-4 font-semibold leading-5 text-mist-50">
                {video.title}
              </span>
              <span className="clamp-2 min-w-0 pr-4 leading-5 text-mist-400">{video.channel}</span>
              <span className="text-mist-200">{video.duration}</span>
              <span className={`font-semibold ${queueActionClasses[operationType]}`}>{video.action}</span>
              <button
                className="rounded-md p-1 text-mist-500 transition hover:bg-white/[0.07] hover:text-mist-100"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenContextMenu(video.id, event.clientX, event.clientY);
                }}
              >
                <MoreVertical size={18} />
              </button>
            </div>
          ))
        ) : (
          <div className="flex h-full min-h-[220px] flex-col items-center justify-center px-6 text-center">
            <h3 className="text-lg font-semibold text-mist-50">No affected videos</h3>
            <p className="mt-2 text-sm text-mist-400">This operation has no affected videos.</p>
          </div>
        )}
      </div>
      <footer className="flex h-12 shrink-0 items-center border-t border-white/[0.055] px-4 text-sm text-mist-400">
        <span>Rows per page:</span>
        <DropdownButton
          className="ml-3 w-[82px]"
          label={String(rowsPerPage)}
          options={rowsPerPageOptions}
          placement="top"
          value={rowsPerPage}
          onSelect={onRowsPerPageChange}
        />
        <span className="ml-auto">{rangeText}</span>
        <button
          className="ml-6 rounded-md p-2 text-mist-500 transition hover:bg-white/[0.07] hover:text-mist-100 disabled:cursor-not-allowed disabled:opacity-35"
          disabled={page <= 1}
          onClick={page <= 1 ? undefined : onPreviousPage}
        >
          <ChevronLeft size={18} />
        </button>
        <button
          className="rounded-md p-2 text-mist-300 transition hover:bg-white/[0.07] hover:text-mist-100 disabled:cursor-not-allowed disabled:opacity-35"
          disabled={page >= totalPages}
          onClick={page >= totalPages ? undefined : onNextPage}
        >
          <ChevronRight size={18} />
        </button>
      </footer>
    </section>
  );
}

function getSelectionModifiers(event: MouseEvent<HTMLElement>): QueueSelectionModifiers {
  return {
    shiftKey: event.shiftKey,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
  };
}
