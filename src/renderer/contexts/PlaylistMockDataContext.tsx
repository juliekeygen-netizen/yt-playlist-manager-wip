import { useMemo, useState, type ReactNode } from 'react';
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
      resetMockPlaylistData: () => {
        setPlaylistRows(playlistRecords);
        setVideosByPlaylistId(playlistVideosByPlaylistId);
        setActivePlaylistIdState(defaultSelectedPlaylistId);
        setPlaylistPopup(null);
      },
    }),
    [activePlaylistId, playlistPopup, playlistRows, playlistsWithCounts, recentPlaylists, videosByPlaylistId],
  );

  return <PlaylistMockDataContext.Provider value={value}>{children}</PlaylistMockDataContext.Provider>;
}
function parseDuration(duration: string) {
  return duration.split(':').reduce((total, part) => total * 60 + Number(part), 0);
}

function getRecencyScore(label: string) {
  const normalized = label.toLowerCase();

  if (normalized.startsWith('today')) return 3_000_000_000;
  if (normalized.startsWith('yesterday')) return 2_000_000_000;

  const parsed = Date.parse(label);
  return Number.isNaN(parsed) ? 1_000_000_000 : parsed;
}
