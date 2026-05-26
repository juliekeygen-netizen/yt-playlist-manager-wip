import type { PlaylistSortKey, RowsPerPage, VideoSortKey } from './playlistMockData';
import type { HistoryRowsPerPage } from './historyMockData';
import type { QueueRowsPerPage } from './queueMockData';

export type SettingsTabId = 'general' | 'queueHistory' | 'safetyBackups' | 'advanced' | 'about';
export type ActionMode = 'queue' | 'askAndApply' | 'applyNow';
export type CompletedCleanupDelay = 'Never' | '5 minutes' | '1 hour' | '1 day' | '7 days';
export type AllOperationsCleanupDelay = 'Never' | '1 day' | '7 days' | '30 days';
export type HistoryCleanupDelay = 'Never' | '7 days' | '30 days' | '90 days';
export type BackupRetention = '7 days' | '30 days' | '90 days' | 'Forever';

export interface AppSettings {
  openLastTabOnLaunch: boolean;
  restoreLastPlaylistOnLaunch: boolean;
  checkUnfinishedQueueOnLaunch: boolean;
  defaultRowsPerPage: RowsPerPage;
  defaultPlaylistSort: PlaylistSortKey;
  defaultVideoSort: VideoSortKey;
  enableDropdownHoverScroll: boolean;
  copyMoveActionMode: ActionMode;
  removeVideosActionMode: ActionMode;
  deletePlaylistsActionMode: ActionMode;
  reorderPlaylistActionMode: ActionMode;
  autoClearCompletedOperationsAfter: CompletedCleanupDelay;
  autoClearAllOperationsAfter: AllOperationsCleanupDelay;
  autoClearHistoryAfter: HistoryCleanupDelay;
  autoClearRestoredItemsAfter: CompletedCleanupDelay;
  confirmDestructiveActions: boolean;
  warnBackupContainsUnavailable: boolean;
  warnBeforeClearingRecoverableBackups: boolean;
  confirmBeforeRestoringBackups: boolean;
  confirmBeforeApplyingMultipleOperations: boolean;
  saveSnapshotBeforeDestructiveActions: boolean;
  saveDeletedPlaylistSnapshots: boolean;
  saveRemovedVideoSnapshots: boolean;
  backupRetention: BackupRetention;
  enableDebugLogs: boolean;
  showInternalIds: boolean;
  previewFirstTimeHomeUi: boolean;
  enableMockDataMode: boolean;
}

export const defaultSettings: AppSettings = {
  openLastTabOnLaunch: true,
  restoreLastPlaylistOnLaunch: true,
  checkUnfinishedQueueOnLaunch: false,
  defaultRowsPerPage: 10,
  defaultPlaylistSort: 'recentlyUpdated',
  defaultVideoSort: 'dateAdded',
  enableDropdownHoverScroll: true,
  copyMoveActionMode: 'queue',
  removeVideosActionMode: 'queue',
  deletePlaylistsActionMode: 'queue',
  reorderPlaylistActionMode: 'queue',
  autoClearCompletedOperationsAfter: 'Never',
  autoClearAllOperationsAfter: 'Never',
  autoClearHistoryAfter: 'Never',
  autoClearRestoredItemsAfter: 'Never',
  confirmDestructiveActions: true,
  warnBackupContainsUnavailable: true,
  warnBeforeClearingRecoverableBackups: true,
  confirmBeforeRestoringBackups: true,
  confirmBeforeApplyingMultipleOperations: true,
  saveSnapshotBeforeDestructiveActions: true,
  saveDeletedPlaylistSnapshots: true,
  saveRemovedVideoSnapshots: true,
  backupRetention: '30 days',
  enableDebugLogs: false,
  showInternalIds: false,
  previewFirstTimeHomeUi: false,
  enableMockDataMode: true,
};

export const settingsStorageKey = 'yt-playlist-manager.settings.v1';

const rowsPerPageValues: RowsPerPage[] = [10, 25, 50, 100, 200, 500, 1000, 'All'];
const playlistSortValues: PlaylistSortKey[] = [
  'playlistName',
  'recentlyUpdated',
  'videoCount',
  'totalDuration',
];
const videoSortValues: VideoSortKey[] = [
  'manual',
  'videoTitle',
  'channel',
  'dateAdded',
  'duration',
  'status',
];
const actionModeValues: ActionMode[] = ['queue', 'askAndApply', 'applyNow'];
const completedCleanupValues: CompletedCleanupDelay[] = ['Never', '5 minutes', '1 hour', '1 day', '7 days'];
const allOperationsCleanupValues: AllOperationsCleanupDelay[] = ['Never', '1 day', '7 days', '30 days'];
const historyCleanupValues: HistoryCleanupDelay[] = ['Never', '7 days', '30 days', '90 days'];
const backupRetentionValues: BackupRetention[] = ['7 days', '30 days', '90 days', 'Forever'];

export function sanitizeSettings(rawSettings: unknown): AppSettings {
  if (!rawSettings || typeof rawSettings !== 'object') {
    return defaultSettings;
  }

  const raw = rawSettings as Partial<Record<keyof AppSettings, unknown>>;
  const next = { ...defaultSettings };

  for (const key of booleanSettingKeys) {
    if (typeof raw[key] === 'boolean') {
      next[key] = raw[key];
    }
  }

  next.defaultRowsPerPage = pickAllowed(raw.defaultRowsPerPage, rowsPerPageValues, defaultSettings.defaultRowsPerPage);
  next.defaultPlaylistSort = pickAllowed(raw.defaultPlaylistSort, playlistSortValues, defaultSettings.defaultPlaylistSort);
  next.defaultVideoSort = pickAllowed(raw.defaultVideoSort, videoSortValues, defaultSettings.defaultVideoSort);
  next.copyMoveActionMode = pickAllowed(raw.copyMoveActionMode, actionModeValues, defaultSettings.copyMoveActionMode);
  next.removeVideosActionMode = pickAllowed(raw.removeVideosActionMode, actionModeValues, defaultSettings.removeVideosActionMode);
  next.deletePlaylistsActionMode = pickAllowed(raw.deletePlaylistsActionMode, actionModeValues, defaultSettings.deletePlaylistsActionMode);
  next.reorderPlaylistActionMode = pickAllowed(raw.reorderPlaylistActionMode, actionModeValues, defaultSettings.reorderPlaylistActionMode);
  next.autoClearCompletedOperationsAfter = pickAllowed(
    raw.autoClearCompletedOperationsAfter,
    completedCleanupValues,
    defaultSettings.autoClearCompletedOperationsAfter,
  );
  next.autoClearAllOperationsAfter = pickAllowed(
    raw.autoClearAllOperationsAfter,
    allOperationsCleanupValues,
    defaultSettings.autoClearAllOperationsAfter,
  );
  next.autoClearHistoryAfter = pickAllowed(
    raw.autoClearHistoryAfter,
    historyCleanupValues,
    defaultSettings.autoClearHistoryAfter,
  );
  next.autoClearRestoredItemsAfter = pickAllowed(
    raw.autoClearRestoredItemsAfter,
    completedCleanupValues,
    defaultSettings.autoClearRestoredItemsAfter,
  );
  next.backupRetention = pickAllowed(raw.backupRetention, backupRetentionValues, defaultSettings.backupRetention);

  return next;
}

const booleanSettingKeys = [
  'openLastTabOnLaunch',
  'restoreLastPlaylistOnLaunch',
  'checkUnfinishedQueueOnLaunch',
  'enableDropdownHoverScroll',
  'confirmDestructiveActions',
  'warnBackupContainsUnavailable',
  'warnBeforeClearingRecoverableBackups',
  'confirmBeforeRestoringBackups',
  'confirmBeforeApplyingMultipleOperations',
  'saveSnapshotBeforeDestructiveActions',
  'saveDeletedPlaylistSnapshots',
  'saveRemovedVideoSnapshots',
  'enableDebugLogs',
  'showInternalIds',
  'previewFirstTimeHomeUi',
  'enableMockDataMode',
] satisfies Array<keyof AppSettings>;

function pickAllowed<T extends string | number>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export const actionModeLabels: Record<ActionMode, string> = {
  queue: 'Add to Queue for confirmation',
  askAndApply: 'Ask and apply',
  applyNow: 'Apply without confirmation',
};

export function toCompactQueueRowsPerPage(rowsPerPage: RowsPerPage): QueueRowsPerPage {
  return rowsPerPage === 10 || rowsPerPage === 25 || rowsPerPage === 50 || rowsPerPage === 'All'
    ? rowsPerPage
    : 50;
}

export function toCompactHistoryRowsPerPage(rowsPerPage: RowsPerPage): HistoryRowsPerPage {
  return rowsPerPage === 10 || rowsPerPage === 25 || rowsPerPage === 50 || rowsPerPage === 'All'
    ? rowsPerPage
    : 50;
}
