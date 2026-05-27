import { contextBridge, ipcRenderer } from 'electron';
import { ipcChannels, type YtpmApi } from '../shared/ipc';

contextBridge.exposeInMainWorld('windowControls', {
  ready: true,
  ping: () => ipcRenderer.invoke('window:controls-ready'),
  minimize: () => ipcRenderer.invoke('window:minimize'),
  close: () => ipcRenderer.invoke('window:close'),
  reload: () => ipcRenderer.invoke('window:reload'),
  hardReload: () => ipcRenderer.invoke('window:hard-reload'),
  relaunch: () => ipcRenderer.invoke('app:relaunch'),
});

const ytpmApi: YtpmApi = {
  session: {
    getMetadata: () => ipcRenderer.invoke(ipcChannels.session.getMetadata),
    importCookiesFile: (request) => ipcRenderer.invoke(ipcChannels.session.importCookiesFile, request),
    importCookiesText: (request) => ipcRenderer.invoke(ipcChannels.session.importCookiesText, request),
    remove: () => ipcRenderer.invoke(ipcChannels.session.remove),
    refresh: () => ipcRenderer.invoke(ipcChannels.session.refresh),
    listSaved: () => ipcRenderer.invoke(ipcChannels.session.listSaved),
    switch: (request) => ipcRenderer.invoke(ipcChannels.session.switch, request),
  },
  playlists: {
    list: () => ipcRenderer.invoke(ipcChannels.playlists.list),
    getVideos: (request) => ipcRenderer.invoke(ipcChannels.playlists.getVideos, request),
    refresh: (request) => ipcRenderer.invoke(ipcChannels.playlists.refresh, request),
    export: (request) => ipcRenderer.invoke(ipcChannels.playlists.export, request),
  },
  queue: {
    list: () => ipcRenderer.invoke(ipcChannels.queue.list),
    add: (request) => ipcRenderer.invoke(ipcChannels.queue.add, request),
    run: (request) => ipcRenderer.invoke(ipcChannels.queue.run, request),
    cancel: (request) => ipcRenderer.invoke(ipcChannels.queue.cancel, request),
    clear: (request) => ipcRenderer.invoke(ipcChannels.queue.clear, request),
    getOperation: (request) => ipcRenderer.invoke(ipcChannels.queue.getOperation, request),
  },
  history: {
    list: () => ipcRenderer.invoke(ipcChannels.history.list),
    restore: (request) => ipcRenderer.invoke(ipcChannels.history.restore, request),
    clear: () => ipcRenderer.invoke(ipcChannels.history.clear),
    exportBackup: (request) => ipcRenderer.invoke(ipcChannels.history.exportBackup, request),
  },
  storage: {
    getAppPaths: () => ipcRenderer.invoke(ipcChannels.storage.getAppPaths),
    chooseExportPath: (request) => ipcRenderer.invoke(ipcChannels.storage.chooseExportPath, request),
    openFolder: (path) => ipcRenderer.invoke(ipcChannels.storage.openFolder, path),
  },
};

contextBridge.exposeInMainWorld('ytpm', ytpmApi);
