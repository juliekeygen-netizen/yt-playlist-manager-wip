import { app, dialog } from 'electron';
import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { AppPaths, AppResult } from '../../shared/appTypes';
import type { ChooseExportPathRequest } from '../../shared/ipc';

export class StorageService {
  getAppPaths(): AppResult<AppPaths> {
    const appDataRoot = app.getPath('userData');
    return {
      ok: true,
      data: {
        appDataRoot,
        settingsDir: join(appDataRoot, 'settings'),
        sessionsDir: join(appDataRoot, 'sessions'),
        backupsDir: join(appDataRoot, 'backups'),
        exportsDir: join(appDataRoot, 'exports'),
        logsDir: join(appDataRoot, 'logs'),
        cacheDir: join(appDataRoot, 'cache'),
      },
    };
  }

  ensureAppFolders(): AppResult<AppPaths> {
    const result = this.getAppPaths();
    if (!result.ok) return result;

    for (const path of Object.values(result.data)) {
      mkdirSync(path, { recursive: true });
    }
    return result;
  }

  getSettingsFilePath() {
    const result = this.ensureAppFolders();
    if (!result.ok) return result;

    return { ok: true, data: join(result.data.settingsDir, 'app-settings.json') } satisfies AppResult<string>;
  }

  getSessionMetadataFilePath() {
    const result = this.ensureAppFolders();
    if (!result.ok) return result;

    // TODO: Real session/cookie persistence should stay in main process only and never expose raw cookies to the renderer.
    return { ok: true, data: join(result.data.sessionsDir, 'session-metadata.json') } satisfies AppResult<string>;
  }

  getDefaultExportPath(fileName: string) {
    const result = this.ensureAppFolders();
    if (!result.ok) return result;

    return {
      ok: true,
      data: join(result.data.exportsDir, normalizeFileName(fileName)),
    } satisfies AppResult<string>;
  }

  getDefaultBackupPath(fileName = `playlist-backup-${Date.now()}.json`) {
    const result = this.ensureAppFolders();
    if (!result.ok) return result;

    return {
      ok: true,
      data: join(result.data.backupsDir, normalizeFileName(fileName)),
    } satisfies AppResult<string>;
  }

  getLogFilePath(fileName = 'app.log') {
    const result = this.ensureAppFolders();
    if (!result.ok) return result;

    return { ok: true, data: join(result.data.logsDir, normalizeFileName(fileName)) } satisfies AppResult<string>;
  }

  getCacheFilePath(fileName = 'cache.json') {
    const result = this.ensureAppFolders();
    if (!result.ok) return result;

    return { ok: true, data: join(result.data.cacheDir, normalizeFileName(fileName)) } satisfies AppResult<string>;
  }

  async chooseExportPath(request: ChooseExportPathRequest): Promise<AppResult<{ filePath: string | null }>> {
    const defaultPathResult = request.defaultPath
      ? { ok: true as const, data: request.defaultPath }
      : this.getDefaultExportPath(request.defaultFileName);
    if (!defaultPathResult.ok) return defaultPathResult;

    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Choose export location',
      defaultPath: defaultPathResult.data,
      filters: [{ name: 'JSON files', extensions: ['json'] }],
      properties: ['createDirectory', 'showOverwriteConfirmation'],
    });

    return {
      ok: true,
      data: {
        filePath: canceled ? null : filePath ?? null,
      },
    };
  }

  appendLogLine(message: string): AppResult<string> {
    const logPathResult = this.getLogFilePath();
    if (!logPathResult.ok) return logPathResult;

    appendFileSync(logPathResult.data, `${new Date().toISOString()} ${message}\n`, 'utf8');
    return { ok: true, data: logPathResult.data };
  }

  openFolder(): AppResult<null> {
    return { ok: false, error: 'Opening folders is not implemented yet.', code: 'NOT_IMPLEMENTED' };
  }
}

function normalizeFileName(fileName: string) {
  return fileName.replace(/[<>:"/\\|?*]/g, '-');
}
