import { Lock, MoreVertical, Pin, RefreshCw } from 'lucide-react';
import type { MouseEvent } from 'react';
import type { PlaylistListRecord } from '@shared/playlistMockData';
import { StatusBadge } from './StatusBadge';
import { ThumbnailPlaceholder } from './ThumbnailPlaceholder';

export function PlaylistListPanel({
  playlists,
  selectedId,
  selectedIds,
  onActivate,
  onSelect,
  onOpenContextMenu,
}: {
  playlists: PlaylistListRecord[];
  selectedId: string;
  selectedIds: string[];
  onActivate: () => void;
  onSelect: (id: string, modifiers: PlaylistSelectionModifiers, visibleIds: string[]) => void;
  onOpenContextMenu: (playlistId: string, x: number, y: number) => void;
}) {
  const visibleIds = playlists.map((playlist) => playlist.id);

  return (
    <section
      className="panel flex min-h-0 w-[360px] shrink-0 flex-col overflow-hidden rounded-lg"
      data-active-list-scope="playlistList"
      onPointerDownCapture={onActivate}
    >
      <div className="playlist-list-scroll min-h-0 flex-1 overflow-y-auto">
        {playlists.length > 0 ? (
          playlists.map((playlist) => (
            <PlaylistListItem
              key={playlist.id}
              playlist={playlist}
              selected={playlist.id === selectedId}
              multiSelected={selectedIds.includes(playlist.id)}
              visibleIds={visibleIds}
              onSelect={onSelect}
              onOpenContextMenu={(event) => onOpenContextMenu(playlist.id, event.clientX, event.clientY)}
            />
          ))
        ) : (
          <div className="flex h-full min-h-[260px] flex-col items-center justify-center px-6 text-center">
            <h3 className="text-lg font-semibold text-mist-50">No playlists found</h3>
            <p className="mt-2 text-sm text-mist-400">Try changing your search or filters.</p>
          </div>
        )}
      </div>
      <footer className="flex h-12 shrink-0 items-center justify-between border-t border-white/[0.055] px-5 text-sm text-mist-400">
        <span>
          {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
        </span>
        <button className="rounded-md p-1.5 text-mist-400 transition hover:bg-white/[0.07] hover:text-blue-200">
          <RefreshCw size={18} />
        </button>
      </footer>
    </section>
  );
}

function PlaylistListItem({
  playlist,
  selected,
  multiSelected,
  visibleIds,
  onSelect,
  onOpenContextMenu,
}: {
  playlist: PlaylistListRecord;
  selected: boolean;
  multiSelected: boolean;
  visibleIds: string[];
  onSelect: (id: string, modifiers: PlaylistSelectionModifiers, visibleIds: string[]) => void;
  onOpenContextMenu: (event: MouseEvent<HTMLElement>) => void;
}) {
  return (
    <article
      className={`relative mx-2 my-1 grid cursor-default grid-cols-[80px_minmax(0,1fr)_28px] gap-4 overflow-hidden rounded-lg px-4 py-4 ${
        selected
          ? 'bg-blue-500/[0.025]'
          : multiSelected
            ? 'bg-blue-500/[0.07]'
            : 'border-b border-white/[0.045] hover:bg-white/[0.035]'
      }`}
      onClick={(event) => onSelect(playlist.id, getSelectionModifiers(event), visibleIds)}
      onContextMenu={(event) => {
        event.preventDefault();
        onOpenContextMenu(event);
      }}
    >
      {selected && (
        <>
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/25 via-blue-500/13 to-transparent" />
          <span className="pointer-events-none absolute left-0 top-2 h-[calc(100%-1rem)] w-[4px] rounded-r-full bg-blue-400" />
        </>
      )}
      <div className="relative z-10 text-left">
        <ThumbnailPlaceholder />
      </div>
      <div className="relative z-10 min-w-0 self-center text-left">
        <h3 className="flex items-center gap-2 truncate font-semibold text-mist-50">
          {playlist.title}
          {playlist.locked && <Lock size={14} className="shrink-0 text-mist-300" />}
          {playlist.pinned && <Pin size={13} className="shrink-0 fill-blue-300/20 text-blue-300" />}
        </h3>
        <div className="mt-3 flex items-center gap-4">
          <span className="text-sm text-mist-200">{playlist.videoCount} videos</span>
          <StatusBadge status={playlist.status} />
        </div>
      </div>
      <button
        className="relative z-10 place-self-center rounded-md p-1 text-mist-500 transition hover:bg-white/[0.07] hover:text-mist-100"
        onClick={(event) => {
          event.stopPropagation();
          onOpenContextMenu(event);
        }}
      >
        <MoreVertical size={18} />
      </button>
    </article>
  );
}

export interface PlaylistSelectionModifiers {
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  checkboxToggle?: boolean;
}

function getSelectionModifiers(event: MouseEvent<HTMLElement>): PlaylistSelectionModifiers {
  return {
    shiftKey: event.shiftKey,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
  };
}
