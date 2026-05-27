import type { PlaylistSortKey, RowsPerPage, VideoSortKey } from './playlistMockData';
import type { HistoryRowsPerPage } from './historyMockData';
import type { QueueRowsPerPage } from './queueMockData';

export type SettingsTabId = 'general' | 'queueHistory' | 'safetyBackups' | 'advanced' | 'about';
export type ActionMode = 'queue' | 'askAndApply' | 'applyNow';
export type CompletedCleanupDelay = 'Never' | '5 minutes' | '1 hour' | '1 day' | '7 days';
export type AllOperationsCleanupDelay = 'Never' | '1 day' | '7 days' | '30 days';
export type HistoryCleanupDelay = 'Never' | '7 days' | '30 days' | '90 days';
export type BackupRetention = '7 days' | '30 days' | '90 days' | 'Forever';

export interface OverlayVisualSettings {
  backgroundOpacity: number;
  backgroundBlurPx: number;
  glowStrength: number;
  glowSpread: number;
  modalOpacity: number;
  modalShadowStrength: number;
  modalBorderBrightness: number;
}

export interface ChildOverlayVisualSettings {
  childModalOpacity: number;
  parentBlurPx: number;
  parentDimOpacity: number;
  childModalShadowStrength: number;
  childModalBorderBrightness: number;
  childModalScale: number;
}

export interface PopupVisualSettings {
  popupBackdropOpacity: number;
  popupBackdropBlurPx: number;
  popupOpacity: number;
  popupShadowStrength: number;
  popupBorderBrightness: number;
  popupScale: number;
}

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
  enableOverlayVisualTuning: boolean;
  enableDeveloperReloadHotkeys: boolean;
  overlayVisuals: OverlayVisualSettings;
  childOverlayVisuals: ChildOverlayVisualSettings;
  popupVisuals: PopupVisualSettings;
}

export const defaultOverlayVisuals: OverlayVisualSettings = {
  backgroundOpacity: 0.62,
  backgroundBlurPx: 10,
  glowStrength: 1,
  glowSpread: 1,
  modalOpacity: 0.96,
  modalShadowStrength: 1,
  modalBorderBrightness: 0.18,
};

export const defaultChildOverlayVisuals: ChildOverlayVisualSettings = {
  childModalOpacity: 0.98,
  parentBlurPx: 8,
  parentDimOpacity: 0.35,
  childModalShadowStrength: 1,
  childModalBorderBrightness: 0.18,
  childModalScale: 1,
};

export const defaultPopupVisuals: PopupVisualSettings = {
  popupBackdropOpacity: 0.35,
  popupBackdropBlurPx: 4,
  popupOpacity: 0.96,
  popupShadowStrength: 1,
  popupBorderBrightness: 0.14,
  popupScale: 1,
};

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
  enableOverlayVisualTuning: false,
  enableDeveloperReloadHotkeys: true,
  overlayVisuals: defaultOverlayVisuals,
  childOverlayVisuals: defaultChildOverlayVisuals,
  popupVisuals: defaultPopupVisuals,
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
  next.overlayVisuals = sanitizeOverlayVisuals(raw.overlayVisuals);
  next.childOverlayVisuals = sanitizeChildOverlayVisuals(raw.childOverlayVisuals);
  next.popupVisuals = sanitizePopupVisuals(raw.popupVisuals);

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
  'enableOverlayVisualTuning',
  'enableDeveloperReloadHotkeys',
] satisfies Array<keyof AppSettings>;

function pickAllowed<T extends string | number>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function sanitizeOverlayVisuals(value: unknown): OverlayVisualSettings {
  const raw = value && typeof value === 'object' ? (value as Partial<Record<keyof OverlayVisualSettings, unknown>>) : {};
  return {
    backgroundOpacity: pickNumber(raw.backgroundOpacity, defaultOverlayVisuals.backgroundOpacity, 0.25, 0.9),
    backgroundBlurPx: pickNumber(raw.backgroundBlurPx, defaultOverlayVisuals.backgroundBlurPx, 0, 24),
    glowStrength: pickNumber(raw.glowStrength, defaultOverlayVisuals.glowStrength, 0, 2.5),
    glowSpread: pickNumber(raw.glowSpread, defaultOverlayVisuals.glowSpread, 0.55, 1.65),
    modalOpacity: pickNumber(raw.modalOpacity, defaultOverlayVisuals.modalOpacity, 0.55, 1),
    modalShadowStrength: pickNumber(raw.modalShadowStrength, defaultOverlayVisuals.modalShadowStrength, 0, 2.5),
    modalBorderBrightness: pickNumber(raw.modalBorderBrightness, defaultOverlayVisuals.modalBorderBrightness, 0.04, 0.38),
  };
}

function sanitizeChildOverlayVisuals(value: unknown): ChildOverlayVisualSettings {
  const raw = value && typeof value === 'object' ? (value as Partial<Record<keyof ChildOverlayVisualSettings, unknown>>) : {};
  return {
    childModalOpacity: pickNumber(raw.childModalOpacity, defaultChildOverlayVisuals.childModalOpacity, 0.65, 1),
    parentBlurPx: pickNumber(raw.parentBlurPx, defaultChildOverlayVisuals.parentBlurPx, 0, 18),
    parentDimOpacity: pickNumber(raw.parentDimOpacity, defaultChildOverlayVisuals.parentDimOpacity, 0, 0.75),
    childModalShadowStrength: pickNumber(
      raw.childModalShadowStrength,
      defaultChildOverlayVisuals.childModalShadowStrength,
      0,
      2.5,
    ),
    childModalBorderBrightness: pickNumber(
      raw.childModalBorderBrightness,
      defaultChildOverlayVisuals.childModalBorderBrightness,
      0.04,
      0.42,
    ),
    childModalScale: pickNumber(raw.childModalScale, defaultChildOverlayVisuals.childModalScale, 0.95, 1.05),
  };
}

function sanitizePopupVisuals(value: unknown): PopupVisualSettings {
  const raw = value && typeof value === 'object' ? (value as Partial<Record<keyof PopupVisualSettings, unknown>>) : {};
  return {
    popupBackdropOpacity: pickNumber(raw.popupBackdropOpacity, defaultPopupVisuals.popupBackdropOpacity, 0, 0.75),
    popupBackdropBlurPx: pickNumber(raw.popupBackdropBlurPx, defaultPopupVisuals.popupBackdropBlurPx, 0, 16),
    popupOpacity: pickNumber(raw.popupOpacity, defaultPopupVisuals.popupOpacity, 0.65, 1),
    popupShadowStrength: pickNumber(raw.popupShadowStrength, defaultPopupVisuals.popupShadowStrength, 0, 2.5),
    popupBorderBrightness: pickNumber(raw.popupBorderBrightness, defaultPopupVisuals.popupBorderBrightness, 0.04, 0.42),
    popupScale: pickNumber(raw.popupScale, defaultPopupVisuals.popupScale, 0.95, 1.05),
  };
}

function pickNumber(value: unknown, fallback: number, min: number, max: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
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
