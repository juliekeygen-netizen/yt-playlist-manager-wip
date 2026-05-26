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
  enableMockDataMode: true,
};

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
