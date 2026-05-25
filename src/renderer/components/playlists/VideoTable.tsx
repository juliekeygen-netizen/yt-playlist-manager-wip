import { ChevronLeft, ChevronRight, GripVertical, MoreVertical } from 'lucide-react';
import { useEffect, useRef, useState, type DragEvent, type MouseEvent } from 'react';
import type { PlaylistVideo, RowsPerPage } from '@shared/playlistMockData';
import { DropdownButton } from './DropdownButton';
import { StatusText } from './StatusBadge';
import { ThumbnailPlaceholder } from './ThumbnailPlaceholder';

const tableGrid =
  'grid-cols-[26px_34px_82px_minmax(230px,2.4fr)_minmax(128px,1fr)_82px_92px_118px_36px]';

const rowsPerPageOptions = [
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
  { label: '200', value: 200 },
  { label: '500', value: 500 },
  { label: '1000', value: 1000 },
  { label: 'All', value: 'All' },
] satisfies Array<{ label: string; value: RowsPerPage }>;

export function VideoTable({
  videos,
  filteredVideos,
  totalFilteredVideos,
  totalPlaylistVideos,
  rowsPerPage,
  rangeText,
  page,
  totalPages,
  selectedIds,
  onToggleAllFiltered,
  onRowsPerPageChange,
  onPreviousPage,
  onNextPage,
  manualSortActive,
  onActivate,
  onSelectVideo,
  onOpenContextMenu,
  onReorderVisibleVideos,
}: {
  videos: PlaylistVideo[];
  filteredVideos: PlaylistVideo[];
  totalFilteredVideos: number;
  totalPlaylistVideos: number;
  rowsPerPage: RowsPerPage;
  rangeText: string;
  page: number;
  totalPages: number;
  selectedIds: string[];
  onToggleAllFiltered: () => void;
  onRowsPerPageChange: (value: RowsPerPage) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  manualSortActive: boolean;
  onActivate: () => void;
  onSelectVideo: (id: string, modifiers: SelectionModifiers, visibleVideoIds: string[]) => void;
  onOpenContextMenu: (videoId: string, x: number, y: number) => void;
  onReorderVisibleVideos: (draggedVideoId: string, targetVideoId: string | null) => void;
}) {
  const checkboxRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [draggedVideoId, setDraggedVideoId] = useState<string | null>(null);
  const [dragOverVideoId, setDragOverVideoId] = useState<string | null>(null);
  const [dragOverBottom, setDragOverBottom] = useState(false);
  const visibleVideoIds = videos.map((video) => video.id);
  const allSelected =
    filteredVideos.length > 0 && filteredVideos.every((video) => selectedIds.includes(video.id));
  const someSelected = filteredVideos.some((video) => selectedIds.includes(video.id));

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [allSelected, someSelected]);

  function handleAutoScroll(event: DragEvent<HTMLElement>) {
    if (!manualSortActive || !scrollRef.current) return;

    const rect = scrollRef.current.getBoundingClientRect();
    const distanceFromTop = event.clientY - rect.top;
    const distanceFromBottom = rect.bottom - event.clientY;
    const threshold = 70;
    const maxStep = 18;

    if (distanceFromTop < threshold) {
      const intensity = (threshold - distanceFromTop) / threshold;
      scrollRef.current.scrollTop -= Math.max(4, Math.round(maxStep * intensity));
    } else if (distanceFromBottom < threshold) {
      const intensity = (threshold - distanceFromBottom) / threshold;
      scrollRef.current.scrollTop += Math.max(4, Math.round(maxStep * intensity));
    }
  }

  function finishDrag() {
    setDraggedVideoId(null);
    setDragOverVideoId(null);
    setDragOverBottom(false);
  }

  return (
    <section
      aria-label={`${totalFilteredVideos} filtered videos`}
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      data-active-list-scope="videoTable"
      onPointerDownCapture={onActivate}
    >
      <div className={`grid shrink-0 ${tableGrid} items-center border-b border-white/[0.055] pl-4 pr-6 py-3 text-sm font-medium text-mist-300`}>
        <span />
        <input
          ref={checkboxRef}
          aria-label="Select all videos"
          checked={allSelected}
          className="h-4 w-4 rounded border-slate-600 bg-shell-950 accent-blue-500"
          onChange={onToggleAllFiltered}
          type="checkbox"
        />
        <span />
        <span className="min-w-0">Video</span>
        <span className="min-w-0">Channel</span>
        <span>Duration</span>
        <span>Status</span>
        <span>Date added</span>
        <span />
      </div>

      <div
        ref={scrollRef}
        className="video-table-scroll min-h-0 flex-1 overflow-y-auto"
        onDragOver={handleAutoScroll}
      >
        {videos.length > 0 ? (
          <>
            {videos.map((video) => (
              <VideoRow
                key={video.id}
                video={video}
                selected={selectedIds.includes(video.id)}
                visibleVideoIds={visibleVideoIds}
                onSelect={onSelectVideo}
                onOpenContextMenu={(event) => onOpenContextMenu(video.id, event.clientX, event.clientY)}
                onToggle={(modifiers) =>
                  onSelectVideo(video.id, { ...modifiers, checkboxToggle: true }, visibleVideoIds)
                }
                manualSortActive={manualSortActive}
                dragging={draggedVideoId === video.id}
                dragOver={dragOverVideoId === video.id && draggedVideoId !== video.id}
                onDragStart={() => setDraggedVideoId(video.id)}
                onDragOver={() => {
                  setDragOverBottom(false);
                  setDragOverVideoId(video.id);
                }}
                onDragEnd={finishDrag}
                onDrop={() => {
                  if (draggedVideoId && draggedVideoId !== video.id) {
                    onReorderVisibleVideos(draggedVideoId, video.id);
                  }
                  finishDrag();
                }}
              />
            ))}
            {manualSortActive && (
              <div
                className={`mx-3 my-2 h-8 rounded-md border border-dashed transition ${
                  dragOverBottom
                    ? 'border-blue-300/80 bg-blue-400/[0.09]'
                    : 'border-white/[0.08] bg-white/[0.015]'
                }`}
                onDragOver={(event) => {
                  if (!manualSortActive) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'move';
                  setDragOverVideoId(null);
                  setDragOverBottom(true);
                  handleAutoScroll(event);
                }}
                onDragLeave={() => setDragOverBottom(false)}
                onDrop={(event) => {
                  if (!manualSortActive) return;
                  event.preventDefault();
                  if (draggedVideoId) {
                    onReorderVisibleVideos(draggedVideoId, null);
                  }
                  finishDrag();
                }}
              />
            )}
          </>
        ) : (
          <div className="flex h-full min-h-[220px] flex-col items-center justify-center px-6 text-center">
            <h3 className="text-lg font-semibold text-mist-50">No videos found</h3>
            <p className="mt-2 text-sm text-mist-400">Try changing your search or filters.</p>
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
        <span className="ml-3 text-xs text-mist-500">of {totalPlaylistVideos} total</span>
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

function VideoRow({
  video,
  selected,
  visibleVideoIds,
  onSelect,
  onOpenContextMenu,
  onToggle,
  manualSortActive,
  dragging,
  dragOver,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}: {
  video: PlaylistVideo;
  selected: boolean;
  visibleVideoIds: string[];
  onSelect: (id: string, modifiers: SelectionModifiers, visibleVideoIds: string[]) => void;
  onOpenContextMenu: (event: MouseEvent<HTMLElement>) => void;
  onToggle: (modifiers: SelectionModifiers) => void;
  manualSortActive: boolean;
  dragging: boolean;
  dragOver: boolean;
  onDragStart: () => void;
  onDragOver: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
}) {
  return (
    <div
      className={`grid min-h-[62px] ${tableGrid} items-center border-b border-white/[0.045] pl-4 pr-6 py-2.5 text-sm ${
        selected ? 'bg-blue-500/[0.055]' : 'hover:bg-white/[0.025]'
      } ${dragging ? 'opacity-55' : ''} ${dragOver ? 'bg-blue-400/[0.09] shadow-[inset_0_2px_0_rgba(96,165,250,0.75)]' : ''}`}
      onClick={(event) => onSelect(video.id, getSelectionModifiers(event), visibleVideoIds)}
      onContextMenu={(event) => {
        event.preventDefault();
        onOpenContextMenu(event);
      }}
      onDragOver={(event) => {
        if (!manualSortActive) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        onDragOver();
      }}
      onDragEnd={onDragEnd}
      onDrop={(event) => {
        if (!manualSortActive) return;
        event.preventDefault();
        onDrop();
      }}
    >
      {manualSortActive ? (
        <span
          draggable
          title="Drag to reorder"
          onClick={(event) => event.stopPropagation()}
          onDragEnd={onDragEnd}
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', video.id);
            onDragStart();
          }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <GripVertical size={19} className="cursor-grab text-blue-300 active:cursor-grabbing" />
        </span>
      ) : (
        <span aria-hidden="true" />
      )}
      <input
        checked={selected}
        className="h-4 w-4 rounded border-slate-600 bg-shell-950 accent-blue-500"
        onChange={() => undefined}
        onClick={(event) => {
          event.stopPropagation();
          onToggle(getSelectionModifiers(event));
        }}
        type="checkbox"
      />
      <ThumbnailPlaceholder size="table" />
      <span className="clamp-2 min-w-0 pr-4 font-medium leading-5 text-mist-50">{video.title}</span>
      <span className="clamp-2 min-w-0 pr-4 leading-5 text-mist-400">{video.channel}</span>
      <span className="text-mist-300">{video.duration}</span>
      <StatusText status={video.status} />
      <span className="text-mist-400">{video.dateAdded}</span>
      <button
        className="justify-self-end rounded-md p-1 text-mist-500 transition hover:bg-white/[0.07] hover:text-mist-100"
        onClick={(event) => {
          event.stopPropagation();
          onOpenContextMenu(event);
        }}
      >
        <MoreVertical size={18} />
      </button>
    </div>
  );
}

export interface SelectionModifiers {
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  checkboxToggle?: boolean;
}

function getSelectionModifiers(event: MouseEvent<HTMLElement>): SelectionModifiers {
  return {
    shiftKey: event.shiftKey,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
  };
}
