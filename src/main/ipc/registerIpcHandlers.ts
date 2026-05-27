import { ipcMain } from 'electron';
import { ipcChannels } from '../../shared/ipc';
import type {
  HistoryRestoreRequest,
  OperationIdRequest,
  QueueAddRequest,
  SwitchSessionRequest,
} from '../../shared/ipc';
import { BackupService } from '../services/backupService';
import { HistoryService } from '../services/historyService';
import { QueueService } from '../services/queueService';
import { SessionService } from '../services/sessionService';
import { StorageService } from '../services/storageService';
import { YouTubeService } from '../services/youtubeService';

export function registerIpcHandlers() {
  const sessionService = new SessionService();
  const youtubeService = new YouTubeService();
  const storageService = new StorageService();
  const queueService = new QueueService();
  const historyService = new HistoryService();
  const backupService = new BackupService();

  ipcMain.handle(ipcChannels.session.getMetadata, () => sessionService.getMetadata());
  ipcMain.handle(ipcChannels.session.importCookiesFile, () => sessionService.importCookiesFile());
  ipcMain.handle(ipcChannels.session.importCookiesText, () => sessionService.importCookiesText());
  ipcMain.handle(ipcChannels.session.remove, () => sessionService.remove());
  ipcMain.handle(ipcChannels.session.refresh, () => sessionService.refresh());
  ipcMain.handle(ipcChannels.session.listSaved, () => sessionService.listSaved());
  ipcMain.handle(ipcChannels.session.switch, (_event, request: SwitchSessionRequest) => sessionService.switch(request.sessionId));

  ipcMain.handle(ipcChannels.playlists.list, () => youtubeService.listPlaylists());
  ipcMain.handle(ipcChannels.playlists.getVideos, () => youtubeService.getPlaylistVideos());
  ipcMain.handle(ipcChannels.playlists.refresh, () => youtubeService.listPlaylists());
  ipcMain.handle(ipcChannels.playlists.export, () => youtubeService.exportPlaylistData());

  ipcMain.handle(ipcChannels.queue.list, () => queueService.list());
  ipcMain.handle(ipcChannels.queue.add, (_event, request: QueueAddRequest) => queueService.add(request));
  ipcMain.handle(ipcChannels.queue.run, (_event, request: OperationIdRequest) => queueService.run(request));
  ipcMain.handle(ipcChannels.queue.cancel, (_event, request: OperationIdRequest) => queueService.cancel(request));
  ipcMain.handle(ipcChannels.queue.clear, (_event, request?: Partial<OperationIdRequest>) => queueService.clear(request));
  ipcMain.handle(ipcChannels.queue.getOperation, (_event, request: OperationIdRequest) => queueService.getOperation(request));

  ipcMain.handle(ipcChannels.history.list, () => historyService.list());
  ipcMain.handle(ipcChannels.history.restore, (_event, request: HistoryRestoreRequest) => historyService.restore(request));
  ipcMain.handle(ipcChannels.history.clear, () => historyService.clear());
  ipcMain.handle(ipcChannels.history.exportBackup, () => backupService.exportBackup());

  ipcMain.handle(ipcChannels.storage.getAppPaths, () => storageService.ensureAppFolders());
  ipcMain.handle(ipcChannels.storage.openFolder, () => storageService.openFolder());
}
