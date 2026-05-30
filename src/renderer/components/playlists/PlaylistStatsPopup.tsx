import { BarChart3, Clock, ListVideo, RefreshCw, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { PlaylistViewRecord, PlaylistVideo } from '@shared/playlistMockData';
import { PopupModalFrame } from '../modals/PopupModalFrame';

export function PlaylistStatsPopup({
  playlist,
  videos,
  onRefresh,
  onClose,
}: {
  playlist: PlaylistViewRecord;
  videos: PlaylistVideo[];
  onRefresh?: () => Promise<void>;
  onClose: () => void;
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState('');
  const [refreshedAt, setRefreshedAt] = useState(() => new Date().toLocaleString());
  const durations = videos.map((video) => parseDuration(video.duration));
  const totalSeconds = durations.reduce((total, duration) => total + duration, 0);
  const longest = videos.reduce<PlaylistVideo | null>((best, video) => (!best || parseDuration(video.duration) > parseDuration(best.duration) ? video : best), null);
  const shortest = videos.reduce<PlaylistVideo | null>((best, video) => (!best || parseDuration(video.duration) < parseDuration(best.duration) ? video : best), null);
  const uniqueChannels = new Set(videos.map((video) => video.channel)).size;
  const statusCounts = useMemo(
    () =>
      videos.reduce<Record<string, number>>((counts, video) => {
        counts[video.status] = (counts[video.status] ?? 0) + 1;
        return counts;
      }, {}),
    [videos],
  );

  async function handleRefresh() {
    if (!onRefresh) return;
    setRefreshing(true);
    setRefreshError('');
    try {
      await onRefresh();
      setRefreshedAt(new Date().toLocaleString());
    } catch (error) {
      setRefreshError(error instanceof Error ? error.message : 'Unable to refresh playlist stats.');
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <PopupModalFrame
      title="Playlist stats"
      subtitle={playlist.title}
      maxWidth="max-w-[760px]"
      icon={<div className="flex h-16 w-16 items-center justify-center rounded-full border border-blue-300/30 bg-blue-500/10 text-blue-300"><BarChart3 size={32} /></div>}
      footer={
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-mist-500">Stats last updated: {refreshedAt}</p>
            {refreshError && <p className="mt-1 text-xs text-red-300">{refreshError}</p>}
          </div>
          <button
            className="flex items-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.05] px-4 py-2 text-sm font-semibold text-mist-100 transition hover:bg-white/[0.08] disabled:cursor-wait disabled:opacity-80"
            disabled={refreshing}
            onClick={() => void handleRefresh()}
            type="button"
          >
            <RefreshCw size={16} />
            {refreshing ? 'Refreshing...' : 'Refresh stats'}
          </button>
        </div>
      }
      onClose={onClose}
    >
      <h3 className="mb-3 text-lg text-mist-200">Overview</h3>
      <div className="grid grid-cols-2 gap-4">
        <StatCard Icon={ListVideo} label="Videos" value={String(videos.length)} />
        <StatCard Icon={Clock} label="Total duration" value={formatDuration(totalSeconds)} />
        <StatCard Icon={BarChart3} label="Average duration" value={formatDuration(videos.length ? Math.round(totalSeconds / videos.length) : 0)} />
        <StatCard Icon={Users} label="Unique channels" value={`${uniqueChannels} unique`} />
        <WideStat label="Longest video" title={longest?.title ?? 'None'} value={longest?.duration ?? '0:00'} />
        <WideStat label="Shortest video" title={shortest?.title ?? 'None'} value={shortest?.duration ?? '0:00'} />
      </div>
      <div className="mt-5 grid grid-cols-5 gap-3">
        <MiniStatusCard label="Public" value={statusCounts.Public ?? 0} />
        <MiniStatusCard label="Unlisted" value={statusCounts.Unlisted ?? 0} />
        <MiniStatusCard label="Private" value={statusCounts.Private ?? 0} />
        <MiniStatusCard label="Deleted" value={statusCounts.Deleted ?? 0} />
        <MiniStatusCard label="Unavailable" value={statusCounts.Unavailable ?? 0} />
      </div>
    </PopupModalFrame>
  );
}

function StatCard({ Icon, label, value }: { Icon: typeof BarChart3; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.035] p-4">
      <div className="flex items-center gap-3 text-mist-300">
        <Icon size={20} className="text-blue-300" />
        {label}
      </div>
      <strong className="text-xl text-mist-50">{value}</strong>
    </div>
  );
}

function WideStat({ label, title, value }: { label: string; title: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.035] p-4">
      <p className="text-sm text-mist-400">{label}</p>
      <div className="mt-2 flex items-center justify-between gap-4">
        <strong className="truncate text-mist-50">{title}</strong>
        <span className="shrink-0 font-semibold text-blue-300">{value}</span>
      </div>
    </div>
  );
}

function MiniStatusCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-center">
      <p className="text-xs uppercase tracking-[0.06em] text-mist-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-mist-50">{value}</p>
    </div>
  );
}

function parseDuration(duration: string) {
  if (!duration || duration === 'Unknown') return 0;
  return duration.split(':').reduce((total, part) => total * 60 + Number(part), 0);
}

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0 ? `${hours}h ${minutes}m ${seconds}s` : `${minutes}m ${seconds}s`;
}
