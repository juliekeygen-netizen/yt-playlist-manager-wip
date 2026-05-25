import type { PlaylistStatus, VideoStatus } from '@shared/playlistMockData';

type ExtraStatus = 'Source' | 'Duplicate' | 'Already added' | 'Needs attention';
type Status = PlaylistStatus | VideoStatus | ExtraStatus;

const statusClasses: Record<Status, string> = {
  Loaded: 'bg-emerald-400/15 text-emerald-300',
  Partial: 'bg-amber-400/15 text-amber-300',
  Error: 'bg-red-400/15 text-red-300',
  'Needs attention': 'bg-red-400/15 text-red-300',
  Public: 'bg-emerald-400/15 text-emerald-300',
  Unlisted: 'bg-blue-400/15 text-blue-300',
  Private: 'bg-violet-400/15 text-violet-200',
  Deleted: 'bg-red-400/15 text-red-300',
  Unavailable: 'bg-slate-500/20 text-slate-200',
  Source: 'bg-slate-500/14 text-slate-300',
  Duplicate: 'bg-amber-500/12 text-amber-200',
  'Already added': 'bg-amber-500/12 text-amber-200',
};

const textStatusClasses: Record<Status, string> = {
  Loaded: 'text-emerald-300',
  Partial: 'text-amber-300',
  Error: 'text-red-300',
  'Needs attention': 'text-red-300',
  Public: 'text-emerald-300',
  Unlisted: 'text-blue-300',
  Private: 'text-violet-300',
  Deleted: 'text-red-300',
  Unavailable: 'text-slate-300',
  Source: 'text-slate-400',
  Duplicate: 'text-amber-300',
  'Already added': 'text-amber-300',
};

function normalizeStatus(status: string): Status {
  const normalized = status.trim().toLowerCase();
  if (normalized === 'error') return 'Error';
  if (normalized === 'needs attention') return 'Needs attention';
  if (normalized === 'loaded') return 'Loaded';
  if (normalized === 'partial') return 'Partial';
  if (normalized === 'public') return 'Public';
  if (normalized === 'unlisted') return 'Unlisted';
  if (normalized === 'private') return 'Private';
  if (normalized === 'deleted') return 'Deleted';
  if (normalized === 'unavailable') return 'Unavailable';
  if (normalized === 'source') return 'Source';
  if (normalized === 'duplicate') return 'Duplicate';
  if (normalized === 'already added') return 'Already added';
  return 'Unavailable';
}

export function StatusBadge({ status, fixed = false }: { status: Status | string; fixed?: boolean }) {
  const safeStatus = normalizeStatus(status);

  return (
    <span
      className={`inline-flex h-7 items-center justify-center rounded-md px-3 text-xs font-semibold ${fixed ? 'w-[104px]' : ''} ${statusClasses[safeStatus]}`}
    >
      {safeStatus}
    </span>
  );
}

export function StatusText({ status }: { status: Status | string }) {
  const safeStatus = normalizeStatus(status);

  return <span className={`text-sm font-semibold ${textStatusClasses[safeStatus]}`}>{safeStatus}</span>;
}
