import type { AppResult, QueueOperation, QueueOperationType } from '../../shared/appTypes';
import type { OperationIdRequest, QueueAddRequest } from '../../shared/ipc';

export class QueueService {
  private operations: QueueOperation[] = [];

  list(): AppResult<QueueOperation[]> {
    return { ok: true, data: this.operations };
  }

  add(request: QueueAddRequest): AppResult<QueueOperation> {
    const operation: QueueOperation = {
      operationId: crypto.randomUUID(),
      type: request.type as QueueOperationType,
      status: 'pending',
      sourcePlaylistId: request.sourcePlaylistId,
      targetPlaylistIds: request.targetPlaylistIds,
      affectedVideoIds: request.affectedVideoIds ?? [],
      affectedPlaylistItemIds: request.affectedPlaylistItemIds ?? [],
      createdAt: new Date().toISOString(),
    };
    this.operations = [operation, ...this.operations];
    return { ok: true, data: operation };
  }

  getOperation(request: OperationIdRequest): AppResult<QueueOperation> {
    const operation = this.operations.find((item) => item.operationId === request.operationId);
    return operation ? { ok: true, data: operation } : { ok: false, error: 'Queue operation not found.', code: 'OPERATION_NOT_FOUND' };
  }

  run(request: OperationIdRequest): AppResult<QueueOperation> {
    return this.updateStatus(request.operationId, 'completed');
  }

  cancel(request: OperationIdRequest): AppResult<QueueOperation> {
    return this.updateStatus(request.operationId, 'cancelled');
  }

  clear(request?: Partial<OperationIdRequest>): AppResult<QueueOperation[]> {
    this.operations = request?.operationId
      ? this.operations.filter((operation) => operation.operationId !== request.operationId)
      : this.operations.filter((operation) => operation.status !== 'completed' && operation.status !== 'cancelled');
    return { ok: true, data: this.operations };
  }

  private updateStatus(operationId: string, status: QueueOperation['status']): AppResult<QueueOperation> {
    const operation = this.operations.find((item) => item.operationId === operationId);
    if (!operation) {
      return { ok: false, error: 'Queue operation not found.', code: 'OPERATION_NOT_FOUND' };
    }

    operation.status = status;
    operation.completedAt = status === 'completed' || status === 'cancelled' ? new Date().toISOString() : operation.completedAt;
    return { ok: true, data: operation };
  }
}
