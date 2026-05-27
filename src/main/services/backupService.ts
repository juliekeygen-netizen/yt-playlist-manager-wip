import type { AppResult, BackupSnapshot } from '../../shared/appTypes';

export class BackupService {
  createSnapshot(): AppResult<BackupSnapshot> {
    return { ok: false, error: 'Creating backup snapshots is not implemented yet.', code: 'NOT_IMPLEMENTED' };
  }

  exportBackup(): AppResult<BackupSnapshot> {
    return { ok: false, error: 'Exporting backups is not implemented yet.', code: 'NOT_IMPLEMENTED' };
  }
}
