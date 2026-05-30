import { ArrowRight, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import type { PlaylistListRecord } from '@shared/playlistMockData';
import { ContextMenu, type ContextMenuState } from './playlists/ContextMenu';

export function RecentPlaylists({
  playlists,
  onOpenPlaylist,
  onOpenPlaylistContextAction,
  onViewAll,
}: {
  playlists: PlaylistListRecord[];
  onOpenPlaylist: (playlistId: string) => void;
  onOpenPlaylistContextAction: (playlistId: string, action: 'open' | 'stats' | 'export') => void;
  onViewAll?: () => void;
}) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-[-0.02em] text-mist-50">Recent Playlists</h2>
        <button className="flex items-center gap-2 text-sm font-medium text-blue-300 transition hover:text-blue-200" onClick={onViewAll} type="button">
          View all playlists
          <ArrowRight size={17} />
        </button>
      </div>

      <div className="panel overflow-hidden rounded-lg">
        {playlists.map((playlist, index) => (
          <div
            key={playlist.id}
            className={`grid grid-cols-[86px_minmax(220px,1fr)_120px_104px_32px] items-center gap-5 px-4 py-2.5 ${
              index !== playlists.length - 1 ? 'border-b border-white/[0.055]' : ''
            }`}
            onDoubleClick={() => onOpenPlaylist(playlist.id)}
          >
            <div className="h-[52px] w-[82px] overflow-hidden rounded-md border border-slate-500/20 bg-gradient-to-br from-[#070d16] via-[#0e1a2a] to-[#101d2f] shadow-inner shadow-black/40">
              {playlist.thumbnailUrl ? (
                <img alt={playlist.title} className="h-full w-full object-cover" loading="lazy" src={playlist.thumbnailUrl} />
              ) : (
                <div className="h-full w-full bg-[radial-gradient(circle_at_72%_35%,rgba(148,163,184,0.11),transparent_18%),linear-gradient(135deg,rgba(255,255,255,0.035),transparent_42%)]" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-[16px] font-semibold text-mist-50">{playlist.title}</h3>
              <p className="mt-1 truncate text-sm text-mist-500">Last synced: {playlist.lastSynced}</p>
            </div>
            <p className="text-sm text-mist-100">{playlist.videoCount} videos</p>
            <StatusBadge status={playlist.status} />
            <button
              className="rounded-md p-1.5 text-mist-500 transition hover:bg-white/8 hover:text-mist-100"
              onClick={(event) => {
                event.stopPropagation();
                setContextMenu({
                  x: event.clientX,
                  y: event.clientY,
                  items: [
                    {
                      label: 'Open in Playlists',
                      onSelect: () => onOpenPlaylistContextAction(playlist.id, 'open'),
                    },
                    {
                      label: 'Export',
                      onSelect: () => onOpenPlaylistContextAction(playlist.id, 'export'),
                    },
                    {
                      label: 'Stats',
                      onSelect: () => onOpenPlaylistContextAction(playlist.id, 'stats'),
                    },
                  ],
                });
              }}
              type="button"
            >
              <MoreVertical size={18} />
            </button>
          </div>
        ))}
      </div>
      <ContextMenu menu={contextMenu} onClose={() => setContextMenu(null)} />
    </section>
  );
}

function StatusBadge({ status }: { status: 'Loaded' | 'Partial' | 'Error' }) {
  const className =
    status === 'Loaded'
      ? 'bg-emerald-400/15 text-emerald-300'
      : 'bg-amber-400/15 text-amber-300';

  return (
    <span className={`rounded-md px-4 py-1.5 text-center text-xs font-semibold ${className}`}>
      {status}
    </span>
  );
}
