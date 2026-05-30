import { useMemo, useState, type ReactNode } from 'react';
import type { AppResult, Playlist as BackendPlaylist, PlaylistVideo as BackendPlaylistVideo } from '@shared/appTypes';
import {
  playlistRecords,
  playlistVideosByPlaylistId,
  selectedPlaylistId as defaultSelectedPlaylistId,
  type PlaylistListRecord,
  type PlaylistVideo,
  type PlaylistViewRecord,
} from '@shared/playlistMockData';
import {
  PlaylistMockDataContext,
  type PlaylistMockDataContextValue,
  type PlaylistPopupState,
} from './playlistMockDataContextValue';

export function PlaylistMockDataProvider({ children }: { children: ReactNode }) {
  const [playlistRows, setPlaylistRows] = useState<PlaylistListRecord[]>(() => playlistRecords);
  const [videosByPlaylistId, setVideosByPlaylistId] =
    useState<Record<string, PlaylistVideo[]>>(() => playlistVideosByPlaylistId);
  const [activePlaylistId, setActivePlaylistIdState] = useState(defaultSelectedPlaylistId);
  const [playlistPopup, setPlaylistPopup] = useState<PlaylistPopupState>(null);
  const [loadedRealVideoIds, setLoadedRealVideoIds] = useState<string[]>([]);

  const playlistsWithCounts = useMemo<PlaylistViewRecord[]>(
    () =>
      playlistRows.map((playlist, originalIndex) => {
        const videos = videosByPlaylistId[playlist.id] ?? [];
        return {
          ...playlist,
          originalIndex,
          videoCount: videos.length,
          totalDurationSeconds: videos.reduce((total, video) => total + parseDuration(video.duration), 0),
        };
      }),
    [playlistRows, videosByPlaylistId],
  );

  const recentPlaylists = useMemo(
    () =>
      [...playlistRows]
        .sort((left, right) => getRecencyScore(right.lastSynced) - getRecencyScore(left.lastSynced))
        .slice(0, 3),
    [playlistRows],
  );

  const value = useMemo<PlaylistMockDataContextValue>(
    () => ({
      playlistRows,
      setPlaylistRows,
      videosByPlaylistId,
      setVideosByPlaylistId,
      activePlaylistId,
      setActivePlaylistId: setActivePlaylistIdState,
      recentPlaylists,
      playlistPopup,
      openPlaylistStats: (playlistId) => setPlaylistPopup({ type: 'playlistStats', playlistId }),
      openExportPlaylist: (playlistId) => setPlaylistPopup({ type: 'exportPlaylist', playlistId }),
      closePlaylistPopup: () => setPlaylistPopup(null),
      getPlaylistViewById: (playlistId) => playlistsWithCounts.find((playlist) => playlist.id === playlistId),
      loadRealPlaylists: async () => {
        if (!window.ytpm?.playlists.list) {
          return { ok: false, error: 'YouTube preload API is unavailable.', code: 'API_UNAVAILABLE' };
        }

        const result = await window.ytpm.playlists.list();
        if (!result.ok) return result as AppResult<PlaylistListRecord[]>;

        const mapped = result.data.map(mapBackendPlaylist);
        setPlaylistRows(mapped.length > 0 ? mapped : playlistRecords);
        setVideosByPlaylistId((current) => {
          const next = { ...current };
          for (const playlist of mapped) {
            if (!(playlist.id in next)) {
              next[playlist.id] = [];
            }
          }
          return next;
        });
        setLoadedRealVideoIds([]);
        if (mapped[0]?.id) {
          setActivePlaylistIdState(mapped[0].id);
        }
        return { ok: true, data: mapped };
      },
      loadRealPlaylistVideos: async (playlistId, options) => {
        if (!window.ytpm?.playlists.getVideos) {
          return { ok: false, error: 'YouTube preload API is unavailable.', code: 'API_UNAVAILABLE' };
        }
        if (!options?.force && loadedRealVideoIds.includes(playlistId) && videosByPlaylistId[playlistId]?.[0]?.source === 'real') {
          return { ok: true, data: videosByPlaylistId[playlistId] ?? [] };
        }

        const result = await window.ytpm.playlists.getVideos({ playlistId });
        if (!result.ok) return result as AppResult<PlaylistVideo[]>;

        const mapped = result.data.map(mapBackendPlaylistVideo);
        setVideosByPlaylistId((current) => ({ ...current, [playlistId]: mapped }));
        setLoadedRealVideoIds((current) => (current.includes(playlistId) ? current : [...current, playlistId]));
        return { ok: true, data: mapped };
      },
      exportPlaylist: async (playlistId, outputPath) => {
        if (!window.ytpm?.playlists.export) {
          return { ok: false, error: 'YouTube preload API is unavailable.', code: 'API_UNAVAILABLE' };
        }
        return window.ytpm.playlists.export({ playlistId, outputPath });
      },
      resetMockPlaylistData: () => {
        setPlaylistRows(playlistRecords);
        setVideosByPlaylistId(playlistVideosByPlaylistId);
        setActivePlaylistIdState(defaultSelectedPlaylistId);
        setLoadedRealVideoIds([]);
        setPlaylistPopup(null);
      },
    }),
    [activePlaylistId, loadedRealVideoIds, playlistPopup, playlistRows, playlistsWithCounts, recentPlaylists, videosByPlaylistId],
  );

  return <PlaylistMockDataContext.Provider value={value}>{children}</PlaylistMockDataContext.Provider>;
}

function mapBackendPlaylist(playlist: BackendPlaylist): PlaylistListRecord {
  return {
    id: playlist.playlistId,
    title: playlist.title,
    videoCount: playlist.videoCount,
    status:
      playlist.status === 'error'
        ? 'Error'
        : playlist.status === 'partial'
          ? 'Partial'
          : 'Loaded',
    lastSynced: formatTimestamp(playlist.lastSyncedAt),
    thumbnailUrl: playlist.thumbnailUrl,
    source: 'real',
  };
}

function mapBackendPlaylistVideo(video: BackendPlaylistVideo): PlaylistVideo {
  return {
    id: video.playlistItemId || video.videoId || `${video.playlistId}-${video.position}`,
    playlistId: video.playlistId,
    playlistItemId: video.playlistItemId,
    videoId: video.videoId,
    title: video.title,
    channel: video.channelTitle || 'Unknown',
    channelId: video.channelId,
    duration: video.duration || 'Unknown',
    status: toVideoStatus(video.status),
    dateAdded: formatTimestamp(video.addedAt) || 'Unknown',
    thumbnailUrl: video.thumbnailUrl,
    url: video.videoUrl,
    source: 'real',
  };
}

function toVideoStatus(status: BackendPlaylistVideo['status']): PlaylistVideo['status'] {
  switch (status) {
    case 'public':
      return 'Public';
    case 'unlisted':
      return 'Unlisted';
    case 'private':
      return 'Private';
    case 'deleted':
      return 'Deleted';
    case 'unavailable':
    default:
      return 'Unavailable';
  }
}

function parseDuration(duration: string) {
  if (!duration || duration === 'Unknown') return 0;
  return duration.split(':').reduce((total, part) => total * 60 + Number(part), 0);
}

function getRecencyScore(label: string) {
  const normalized = label.toLowerCase();
  if (normalized.startsWith('today')) return 3_000_000_000;
  if (normalized.startsWith('yesterday')) return 2_000_000_000;
  const parsed = Date.parse(label);
  return Number.isNaN(parsed) ? 1_000_000_000 : parsed;
}

function formatTimestamp(value?: string) {
  if (!value) return '';
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(parsed));
}
