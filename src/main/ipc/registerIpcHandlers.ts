import { ipcMain } from 'electron';
import { ipcChannels } from '../../shared/ipc';
import type {
  ChooseExportPathRequest,
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
import { YouTubeClient } from '../services/youtubeClient';
import { YouTubeService } from '../services/youtubeService';

export function registerIpcHandlers() {
  const storageService = new StorageService();
  const youtubeClient = new YouTubeClient();
  const sessionService = new SessionService(storageService, youtubeClient);
  const youtubeService = new YouTubeService(sessionService, storageService, youtubeClient);
  const queueService = new QueueService();
  const historyService = new HistoryService();
  const backupService = new BackupService();

  ipcMain.handle(ipcChannels.session.getMetadata, () => sessionService.getMetadata());
  ipcMain.handle(ipcChannels.session.importCookiesFile, (_event, request) => sessionService.importCookiesFile(request));
  ipcMain.handle(ipcChannels.session.importCookiesText, (_event, request) => sessionService.importCookiesText(request));
  ipcMain.handle(ipcChannels.session.remove, () => sessionService.remove());
  ipcMain.handle(ipcChannels.session.refresh, () => sessionService.refresh());
  ipcMain.handle(ipcChannels.session.listSaved, () => sessionService.listSaved());
  ipcMain.handle(ipcChannels.session.switch, (_event, request: SwitchSessionRequest) => sessionService.switch(request.sessionId));

  ipcMain.handle(ipcChannels.playlists.list, () => youtubeService.listPlaylists());
  ipcMain.handle(ipcChannels.playlists.getVideos, (_event, request) => youtubeService.getPlaylistVideos(request));
  ipcMain.handle(ipcChannels.playlists.refresh, (_event, request) => youtubeService.refreshPlaylist(request));
  ipcMain.handle(ipcChannels.playlists.export, (_event, request) => youtubeService.exportPlaylistData(request));

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
  ipcMain.handle(ipcChannels.storage.chooseExportPath, (_event, request: ChooseExportPathRequest) =>
    storageService.chooseExportPath(request),
  );
  ipcMain.handle(ipcChannels.storage.openFolder, () => storageService.openFolder());
}
