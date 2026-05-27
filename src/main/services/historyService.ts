import type { AppResult, HistoryRecord } from '../../shared/appTypes';
import type { HistoryRestoreRequest } from '../../shared/ipc';

export class HistoryService {
  private records: HistoryRecord[] = [];

  list(): AppResult<HistoryRecord[]> {
    return { ok: true, data: this.records };
  }

  add(record: HistoryRecord): AppResult<HistoryRecord> {
    this.records = [record, ...this.records];
    return { ok: true, data: record };
  }

  restore(request: HistoryRestoreRequest): AppResult<HistoryRecord> {
    const record = this.records.find((item) => item.historyId === request.historyId);
    if (!record) {
      return { ok: false, error: 'History record not found.', code: 'HISTORY_NOT_FOUND' };
    }
    record.recoveryState = 'restored';
    return { ok: true, data: record };
  }

  clear(): AppResult<HistoryRecord[]> {
    this.records = [];
    return { ok: true, data: this.records };
  }
}
