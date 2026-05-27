import { app, BrowserWindow, ipcMain } from 'electron';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

let mainWindow: BrowserWindow | null = null;

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
}

app.on('second-instance', () => {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.focus();
});

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1580,
    height: 990,
    minWidth: 1120,
    minHeight: 760,
    backgroundColor: '#07101c',
    frame: false,
    title: 'YT Playlist Manager',
    show: false,
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

if (gotSingleInstanceLock) {
  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('window:minimize', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender) ?? mainWindow;
  if (!window) {
    console.warn('window:minimize failed: no BrowserWindow resolved.');
    return false;
  }
  window.minimize();
  return true;
});

ipcMain.handle('window:close', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender) ?? mainWindow;
  if (!window) {
    console.warn('window:close failed: no BrowserWindow resolved.');
    return false;
  }
  window.close();
  return true;
});

ipcMain.handle('window:controls-ready', (event) => Boolean(BrowserWindow.fromWebContents(event.sender) ?? mainWindow));

ipcMain.handle('window:reload', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender) ?? mainWindow;
  window?.webContents.reload();
  return Boolean(window);
});

ipcMain.handle('window:hard-reload', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender) ?? mainWindow;
  window?.webContents.reloadIgnoringCache();
  return Boolean(window);
});

ipcMain.handle('app:relaunch', () => {
  app.relaunch();
  app.exit(0);
  return true;
});

function getPreloadPath() {
  const candidates = [
    join(__dirname, '../preload/index.mjs'),
    join(__dirname, '../preload/index.js'),
  ];
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) {
    console.warn(`No preload bundle found. Tried: ${candidates.join(', ')}`);
  }
  return found ?? candidates[0];
}
