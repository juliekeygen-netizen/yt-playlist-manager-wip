import {
  Copy,
  ListRestart,
  RefreshCw,
  Repeat,
  Trash2,
  Undo2,
  type LucideIcon,
} from 'lucide-react';
import type { HistoryEventType, HistoryState } from '@shared/historyMockData';

export const historyStateClasses: Record<HistoryState, string> = {
  Undoable: 'text-blue-300',
  Recoverable: 'text-violet-300',
  Restored: 'text-emerald-300',
  Expired: 'text-amber-300',
  Cleared: 'text-mist-500',
};

export const historyActionClasses: Record<HistoryEventType, string> = {
  'Move videos': 'text-blue-300',
  'Remove videos': 'text-red-300',
  'Deleted playlist': 'text-violet-300',
  'Restored playlist': 'text-emerald-300',
  'Copy videos': 'text-cyan-300',
  'Reorder playlist': 'text-purple-300',
};

export const historyIcons: Record<HistoryEventType, LucideIcon> = {
  'Move videos': Repeat,
  'Remove videos': Trash2,
  'Deleted playlist': Trash2,
  'Restored playlist': RefreshCw,
  'Copy videos': Copy,
  'Reorder playlist': ListRestart,
};

export function getPrimaryActionLabel(type: HistoryEventType, state: HistoryState) {
  if (state === 'Restored') return 'View restored details';
  if (state === 'Recoverable' && type === 'Deleted playlist') return 'Restore as new playlist';
  if (state === 'Recoverable') return 'Restore removed videos';
  if (type === 'Move videos') return 'Undo move';
  if (type === 'Copy videos') return 'Undo copy';
  if (type === 'Reorder playlist') return 'Undo reorder';
  return 'Undo action';
}

export function getPrimaryActionIcon(type: HistoryEventType, state: HistoryState) {
  if (state === 'Recoverable' && type === 'Deleted playlist') return RefreshCw;
  if (state === 'Recoverable') return RefreshCw;
  return Undo2;
}
