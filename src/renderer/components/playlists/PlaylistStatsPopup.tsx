import { BarChart3, Clock, ListVideo, RefreshCw, Users } from 'lucide-react';
import type { PlaylistViewRecord, PlaylistVideo } from '@shared/playlistMockData';
import { PopupModalFrame } from '../modals/PopupModalFrame';

export function PlaylistStatsPopup({
  playlist,
  videos,
  onClose,
}: {
  playlist: PlaylistViewRecord;
  videos: PlaylistVideo[];
  onClose: () => void;
}) {
  const durations = videos.map((video) => parseDuration(video.duration));
  const totalSeconds = durations.reduce((total, duration) => total + duration, 0);
  const longest = videos.reduce<PlaylistVideo | null>((best, video) => (!best || parseDuration(video.duration) > parseDuration(best.duration) ? video : best), null);
  const shortest = videos.reduce<PlaylistVideo | null>((best, video) => (!best || parseDuration(video.duration) < parseDuration(best.duration) ? video : best), null);
  const uniqueChannels = new Set(videos.map((video) => video.channel)).size;

  return (
    <PopupModalFrame
      title="Playlist stats"
      subtitle={playlist.title}
      maxWidth="max-w-[760px]"
      icon={<div className="flex h-16 w-16 items-center justify-center rounded-full border border-blue-300/30 bg-blue-500/10 text-blue-300"><BarChart3 size={32} /></div>}
      footer={
        <div className="flex items-center justify-between">
          <p className="text-sm text-mist-500">Stats last updated: mock snapshot</p>
          <button className="flex items-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.05] px-4 py-2 text-sm font-semibold text-mist-100 transition hover:bg-white/[0.08]" type="button">
            <RefreshCw size={16} />
            Refresh stats
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

function parseDuration(duration: string) {
  return duration.split(':').reduce((total, part) => total * 60 + Number(part), 0);
}

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0 ? `${hours}h ${minutes}m ${seconds}s` : `${minutes}m ${seconds}s`;
}
