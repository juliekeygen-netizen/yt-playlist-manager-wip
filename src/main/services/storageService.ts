import { app } from 'electron';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { AppPaths, AppResult } from '../../shared/appTypes';

export class StorageService {
  getAppPaths(): AppResult<AppPaths> {
    const appDataRoot = app.getPath('userData');
    return {
      ok: true,
      data: {
        appDataRoot,
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

  openFolder(): AppResult<null> {
    return { ok: false, error: 'Opening folders is not implemented yet.', code: 'NOT_IMPLEMENTED' };
  }
}
