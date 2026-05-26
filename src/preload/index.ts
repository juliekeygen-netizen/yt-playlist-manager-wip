import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('windowControls', {
  ready: true,
  ping: () => ipcRenderer.invoke('window:controls-ready'),
  minimize: () => ipcRenderer.invoke('window:minimize'),
  close: () => ipcRenderer.invoke('window:close'),
});
