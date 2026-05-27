import { createContext, useContext, type Dispatch, type SetStateAction } from 'react';
import type { PlaylistListRecord, PlaylistVideo, PlaylistViewRecord } from '@shared/playlistMockData';

export type PlaylistPopupState =
  | { type: 'playlistStats'; playlistId: string }
  | { type: 'exportPlaylist'; playlistId: string }
  | null;

export interface PlaylistMockDataContextValue {
  playlistRows: PlaylistListRecord[];
  setPlaylistRows: Dispatch<SetStateAction<PlaylistListRecord[]>>;
  videosByPlaylistId: Record<string, PlaylistVideo[]>;
  setVideosByPlaylistId: Dispatch<SetStateAction<Record<string, PlaylistVideo[]>>>;
  activePlaylistId: string;
  setActivePlaylistId: (playlistId: string) => void;
  recentPlaylists: PlaylistListRecord[];
  openPlaylistStats: (playlistId: string) => void;
  openExportPlaylist: (playlistId: string) => void;
  closePlaylistPopup: () => void;
  playlistPopup: PlaylistPopupState;
  getPlaylistViewById: (playlistId: string) => PlaylistViewRecord | undefined;
  resetMockPlaylistData: () => void;
}

export const PlaylistMockDataContext = createContext<PlaylistMockDataContextValue | null>(null);

export function usePlaylistMockData() {
  const context = useContext(PlaylistMockDataContext);
  if (!context) {
    throw new Error('usePlaylistMockData must be used inside PlaylistMockDataProvider.');
  }
  return context;
}
