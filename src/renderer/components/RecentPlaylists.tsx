import { ArrowRight, MoreVertical } from 'lucide-react';
import { recentPlaylists } from '@shared/mockData';

export function RecentPlaylists() {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-[-0.02em] text-mist-50">Recent Playlists</h2>
        <button className="flex items-center gap-2 text-sm font-medium text-blue-300 transition hover:text-blue-200">
          View all playlists
          <ArrowRight size={17} />
        </button>
      </div>

      <div className="panel overflow-hidden rounded-lg">
        {recentPlaylists.map((playlist, index) => (
          <div
            key={playlist.id}
            className={`grid grid-cols-[86px_minmax(220px,1fr)_120px_104px_32px] items-center gap-5 px-4 py-2.5 ${
              index !== recentPlaylists.length - 1 ? 'border-b border-white/[0.055]' : ''
            }`}
          >
            <div className="h-[52px] w-[82px] overflow-hidden rounded-md border border-slate-500/20 bg-gradient-to-br from-[#070d16] via-[#0e1a2a] to-[#101d2f] shadow-inner shadow-black/40">
              <div className="h-full w-full bg-[radial-gradient(circle_at_72%_35%,rgba(148,163,184,0.11),transparent_18%),linear-gradient(135deg,rgba(255,255,255,0.035),transparent_42%)]" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-[16px] font-semibold text-mist-50">{playlist.title}</h3>
              <p className="mt-1 truncate text-sm text-mist-500">Playlist ID: {playlist.id}</p>
            </div>
            <p className="text-sm text-mist-100">{playlist.videoCount} videos</p>
            <StatusBadge status={playlist.status} />
            <button className="rounded-md p-1.5 text-mist-500 transition hover:bg-white/8 hover:text-mist-100">
              <MoreVertical size={18} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: 'Loaded' | 'Partial' }) {
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
