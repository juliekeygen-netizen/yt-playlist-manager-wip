import type { AppResult, BackupSnapshot } from '../../shared/appTypes';
import { StorageService } from './storageService';

export class BackupService {
  private readonly storageService = new StorageService();

  createSnapshot(): AppResult<BackupSnapshot> {
    return { ok: false, error: 'Creating backup snapshots is not implemented yet.', code: 'NOT_IMPLEMENTED' };
  }

  exportBackup(): AppResult<BackupSnapshot> {
    return { ok: false, error: 'Exporting backups is not implemented yet.', code: 'NOT_IMPLEMENTED' };
  }

  getDefaultBackupPath(snapshotName?: string): AppResult<string> {
    return this.storageService.getDefaultBackupPath(snapshotName);
  }
}
