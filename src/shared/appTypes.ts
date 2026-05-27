export type AppResult<T> = { ok: true; data: T } | { ok: false; error: string; code?: string };

export type PlaylistVideoStatus = 'public' | 'unlisted' | 'private' | 'deleted' | 'unavailable';
export type SessionConnectionStatus = 'connected' | 'notConnected' | 'expired' | 'unknown';
export type SessionSource = 'importedCookies' | 'savedSession' | 'none';

export interface Playlist {
  playlistId: string;
  title: string;
  description?: string;
  videoCount: number;
  totalDuration?: string;
  status?: 'loaded' | 'partial' | 'error';
  lastSyncedAt?: string;
  thumbnailUrl?: string;
}

export interface PlaylistVideo {
  playlistId: string;
  playlistItemId: string;
  videoId: string;
  title: string;
  channelTitle: string;
  channelId?: string;
  duration: string;
  addedAt: string;
  position: number;
  status: PlaylistVideoStatus;
  thumbnailUrl?: string;
  videoUrl?: string;
}

export type QueueOperationType =
  | 'copyVideos'
  | 'moveVideos'
  | 'removeVideos'
  | 'deletePlaylist'
  | 'reorderPlaylist'
  | 'exportPlaylist'
  | 'refreshPlaylist'
  | 'syncPlaylists';

export type QueueOperationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface QueueProgress {
  completed: number;
  total: number;
  message?: string;
}

export interface QueueOperation {
  operationId: string;
  type: QueueOperationType;
  status: QueueOperationStatus;
  sourcePlaylistId?: string;
  targetPlaylistIds?: string[];
  affectedVideoIds: string[];
  affectedPlaylistItemIds: string[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  progress?: QueueProgress;
  resultSummary?: string;
}

export type RecoveryState = 'undoable' | 'recoverable' | 'restored' | 'expired' | 'cleared';

export interface HistoryRecord {
  historyId: string;
  type: QueueOperationType | 'restoreBackup' | 'clearHistory';
  title: string;
  createdAt: string;
  recoveryState: RecoveryState;
  sourcePlaylistId?: string;
  targetPlaylistId?: string;
  affectedVideos: PlaylistVideo[];
  backupPath?: string;
}

export interface BackupSnapshot {
  backupId: string;
  createdAt: string;
  type: 'playlistSnapshot' | 'removedVideos' | 'deletedPlaylist' | 'reorderSnapshot';
  playlist: Playlist;
  videos: PlaylistVideo[];
  filePath?: string;
}

export interface SessionHealth {
  sessionDataLoaded: boolean;
  signInCheckPassed: boolean;
  playlistAccessCheckPassed: boolean;
}

export interface SessionMetadata {
  hasActiveSession: boolean;
  accountName: string;
  email?: string;
  initials: string;
  sessionSource: SessionSource;
  connectionStatus: SessionConnectionStatus;
  lastChecked?: string;
  lastRefreshed?: string;
  health: SessionHealth;
}

export interface AppPaths {
  appDataRoot: string;
  settingsDir: string;
  sessionsDir: string;
  backupsDir: string;
  exportsDir: string;
  logsDir: string;
  cacheDir: string;
}
