import type {
  AppPaths,
  AppResult,
  BackupSnapshot,
  HistoryRecord,
  Playlist,
  PlaylistVideo,
  QueueOperation,
  QueueOperationType,
  SessionMetadata,
} from './appTypes';

export const ipcChannels = {
  session: {
    getMetadata: 'session:getMetadata',
    importCookiesFile: 'session:importCookiesFile',
    importCookiesText: 'session:importCookiesText',
    remove: 'session:remove',
    refresh: 'session:refresh',
    listSaved: 'session:listSaved',
    switch: 'session:switch',
  },
  playlists: {
    list: 'playlists:list',
    getVideos: 'playlists:getVideos',
    refresh: 'playlists:refresh',
    export: 'playlists:export',
  },
  queue: {
    list: 'queue:list',
    add: 'queue:add',
    run: 'queue:run',
    cancel: 'queue:cancel',
    clear: 'queue:clear',
    getOperation: 'queue:getOperation',
  },
  history: {
    list: 'history:list',
    restore: 'history:restore',
    clear: 'history:clear',
    exportBackup: 'history:exportBackup',
  },
  storage: {
    getAppPaths: 'storage:getAppPaths',
    chooseExportPath: 'storage:chooseExportPath',
    openFolder: 'storage:openFolder',
  },
} as const;

export interface SavedSessionSummary {
  sessionId: string;
  accountName: string;
  email?: string;
  initials: string;
  status: 'connected' | 'expired';
  lastUsedAt?: string;
}

export interface ImportCookiesFileRequest {
  fileName?: string;
  cookieText: string;
}

export interface ImportCookiesTextRequest {
  cookieText: string;
}

export interface SwitchSessionRequest {
  sessionId: string;
}

export interface PlaylistVideosRequest {
  playlistId: string;
}

export interface PlaylistExportRequest {
  playlistId: string;
  outputPath?: string;
}

export interface ChooseExportPathRequest {
  defaultFileName: string;
  defaultPath?: string;
}

export interface QueueAddRequest {
  type: QueueOperationType;
  sourcePlaylistId?: string;
  targetPlaylistIds?: string[];
  affectedVideoIds?: string[];
  affectedPlaylistItemIds?: string[];
}

export interface OperationIdRequest {
  operationId: string;
}

export interface HistoryRestoreRequest {
  historyId: string;
}

export interface HistoryExportBackupRequest {
  historyId: string;
  outputPath?: string;
}

export interface YtpmApi {
  session: {
    getMetadata: () => Promise<AppResult<SessionMetadata>>;
    importCookiesFile: (request: ImportCookiesFileRequest) => Promise<AppResult<SessionMetadata>>;
    importCookiesText: (request: ImportCookiesTextRequest) => Promise<AppResult<SessionMetadata>>;
    remove: () => Promise<AppResult<SessionMetadata>>;
    refresh: () => Promise<AppResult<SessionMetadata>>;
    listSaved: () => Promise<AppResult<SavedSessionSummary[]>>;
    switch: (request: SwitchSessionRequest) => Promise<AppResult<SessionMetadata>>;
  };
  playlists: {
    list: () => Promise<AppResult<Playlist[]>>;
    getVideos: (request: PlaylistVideosRequest) => Promise<AppResult<PlaylistVideo[]>>;
    refresh: (request: PlaylistVideosRequest) => Promise<AppResult<Playlist>>;
    export: (request: PlaylistExportRequest) => Promise<AppResult<{ outputPath: string }>>;
  };
  queue: {
    list: () => Promise<AppResult<QueueOperation[]>>;
    add: (request: QueueAddRequest) => Promise<AppResult<QueueOperation>>;
    run: (request: OperationIdRequest) => Promise<AppResult<QueueOperation>>;
    cancel: (request: OperationIdRequest) => Promise<AppResult<QueueOperation>>;
    clear: (request?: Partial<OperationIdRequest>) => Promise<AppResult<QueueOperation[]>>;
    getOperation: (request: OperationIdRequest) => Promise<AppResult<QueueOperation>>;
  };
  history: {
    list: () => Promise<AppResult<HistoryRecord[]>>;
    restore: (request: HistoryRestoreRequest) => Promise<AppResult<HistoryRecord>>;
    clear: () => Promise<AppResult<HistoryRecord[]>>;
    exportBackup: (request: HistoryExportBackupRequest) => Promise<AppResult<BackupSnapshot>>;
  };
  storage: {
    getAppPaths: () => Promise<AppResult<AppPaths>>;
    chooseExportPath: (request: ChooseExportPathRequest) => Promise<AppResult<{ filePath: string | null }>>;
    openFolder: (path: string) => Promise<AppResult<null>>;
  };
}
