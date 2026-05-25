import {
  Copy,
  FileUp,
  RefreshCw,
  Repeat,
  Shuffle,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import type { QueueOperationType, QueueStatus } from '@shared/queueMockData';

export const queueStatusClasses: Record<QueueStatus, string> = {
  Pending: 'text-amber-300',
  'Needs review': 'text-orange-300',
  Running: 'text-blue-300',
  Completed: 'text-emerald-300',
  Failed: 'text-red-300',
  Cancelled: 'text-mist-500',
};

export const queueActionClasses: Record<QueueOperationType, string> = {
  'Move videos': 'text-amber-300',
  'Copy videos': 'text-blue-300',
  'Remove videos': 'text-red-300',
  'Sync playlist': 'text-cyan-300',
  'Export playlist': 'text-emerald-300',
  'Reorder playlist': 'text-purple-300',
};

export const operationIcons: Record<QueueOperationType, LucideIcon> = {
  'Move videos': Repeat,
  'Copy videos': Copy,
  'Remove videos': Trash2,
  'Sync playlist': RefreshCw,
  'Export playlist': FileUp,
  'Reorder playlist': Shuffle,
};

export function getOperationSubtitle({
  source,
  target,
  targetSummary,
  type,
}: {
  source: string;
  target?: string;
  targetSummary?: string;
  type: QueueOperationType;
}) {
  if (target || targetSummary) {
    return `From ${source} → ${target ?? targetSummary}`;
  }
  if (type === 'Sync playlist' || type === 'Export playlist' || type === 'Reorder playlist') {
    return source;
  }
  return `From ${source}`;
}
