import type { VideoStatus } from './playlistMockData';

export type HistoryState = 'Undoable' | 'Recoverable' | 'Restored' | 'Expired' | 'Cleared';
export type HistoryFilter = 'All history' | 'Undoable' | 'Recoverable' | 'Restored';
export type HistorySortKey = 'newest' | 'oldest' | 'actionType' | 'playlistTitle' | 'recoveryState';
export type HistoryRowsPerPage = 10 | 25 | 50 | 'All';
export type HistoryEventType =
  | 'Move videos'
  | 'Remove videos'
  | 'Deleted playlist'
  | 'Restored playlist'
  | 'Copy videos'
  | 'Reorder playlist';

export interface HistorySavedVideo {
  id: string;
  title: string;
  channel: string;
  duration: string;
  status: VideoStatus;
  url: string;
}

export interface HistoryEvent {
  id: string;
  type: HistoryEventType;
  title: string;
  subtitle: string;
  source?: string;
  target?: string;
  targetSummary?: string;
  playlistTitle: string;
  state: HistoryState;
  timestamp: string;
  timestampLabel: string;
  createdOrder: number;
  savedVideoCount: number;
  savedVideos: HistorySavedVideo[];
  note: string;
  backupLabel?: string;
}

const deletedPlaylistVideos: HistorySavedVideo[] = [
  {
    id: 'history-midnight-drive',
    title: 'Midnight Drive',
    channel: 'Chillwave Radio',
    duration: '28:41',
    status: 'Public',
    url: 'https://www.youtube.com/watch?v=history-midnight-drive',
  },
  {
    id: 'history-lofi-rain-sessions',
    title: 'Lofi Rain Sessions',
    channel: 'Lofi Girl',
    duration: '1:02:15',
    status: 'Unlisted',
    url: 'https://www.youtube.com/watch?v=history-lofi-rain-sessions',
  },
  {
    id: 'history-sunset-memories',
    title: 'Sunset Memories',
    channel: 'Palm Skies',
    duration: '19:37',
    status: 'Deleted',
    url: 'https://www.youtube.com/watch?v=history-sunset-memories',
  },
  {
    id: 'history-cosmic-journey',
    title: 'Cosmic Journey',
    channel: 'Stellar Sounds',
    duration: '36:22',
    status: 'Unavailable',
    url: 'https://www.youtube.com/watch?v=history-cosmic-journey',
  },
  {
    id: 'history-ocean-waves',
    title: 'Ocean Waves',
    channel: 'Nature Escapes',
    duration: '45:11',
    status: 'Public',
    url: 'https://www.youtube.com/watch?v=history-ocean-waves',
  },
];

const movedVideos: HistorySavedVideo[] = [
  {
    id: 'history-night-drive-mix',
    title: 'Night Drive Mix',
    channel: 'Lo-Fi Station',
    duration: '1:02:15',
    status: 'Public',
    url: 'https://www.youtube.com/watch?v=history-night-drive-mix',
  },
  {
    id: 'history-synthwave-coding-set',
    title: 'Synthwave Coding Set',
    channel: 'Retro Pulse',
    duration: '58:42',
    status: 'Public',
    url: 'https://www.youtube.com/watch?v=history-synthwave-coding-set',
  },
];

const removedVideos: HistorySavedVideo[] = [
  {
    id: 'history-old-amv',
    title: 'Old AMV Reupload',
    channel: 'Nostalgia Folder',
    duration: '4:45',
    status: 'Unlisted',
    url: 'https://www.youtube.com/watch?v=history-old-amv',
  },
  {
    id: 'history-deleted-favorite',
    title: 'Deleted favorite music video',
    channel: 'Unknown',
    duration: '3:59',
    status: 'Deleted',
    url: 'https://www.youtube.com/watch?v=history-deleted-favorite',
  },
  {
    id: 'history-rare-upload',
    title: 'Rare Upload From An Old Channel Archive',
    channel: 'Archived Media Preservation',
    duration: '22:18',
    status: 'Public',
    url: 'https://www.youtube.com/watch?v=history-rare-upload',
  },
  {
    id: 'history-documentary-backup',
    title: 'Documentary clip backup',
    channel: 'VHS Notes',
    duration: '14:06',
    status: 'Public',
    url: 'https://www.youtube.com/watch?v=history-documentary-backup',
  },
  {
    id: 'history-unavailable-archive',
    title: 'Unavailable archived upload',
    channel: 'Unknown',
    duration: '0:00',
    status: 'Unavailable',
    url: 'https://www.youtube.com/watch?v=history-unavailable-archive',
  },
];

export const historyEvents: HistoryEvent[] = [
  {
    id: 'history-move-coding-lofi',
    type: 'Move videos',
    title: 'Moved 2 videos',
    subtitle: 'Coding Music → Chill Lo-Fi Beats',
    source: 'Coding Music',
    target: 'Chill Lo-Fi Beats',
    playlistTitle: 'Coding Music',
    state: 'Undoable',
    timestamp: 'Today, 9:42 PM',
    timestampLabel: 'Moved: Today, 9:42 PM',
    createdOrder: 1,
    savedVideoCount: 2,
    savedVideos: movedVideos,
    note: 'This can undo the move by returning 2 videos to Coding Music and removing the copied entries from Chill Lo-Fi Beats.',
  },
  {
    id: 'history-remove-archive',
    type: 'Remove videos',
    title: 'Removed 5 videos',
    subtitle: 'From Archive Favorites',
    source: 'Archive Favorites',
    playlistTitle: 'Archive Favorites',
    state: 'Recoverable',
    timestamp: 'Today, 8:15 PM',
    timestampLabel: 'Removed: Today, 8:15 PM',
    createdOrder: 2,
    savedVideoCount: 5,
    savedVideos: removedVideos,
    note: 'The removed videos are saved in a local mock backup and can be restored to a playlist later.',
  },
  {
    id: 'history-deleted-archive',
    type: 'Deleted playlist',
    title: 'Deleted playlist',
    subtitle: 'Archive Favorites',
    source: 'Archive Favorites',
    playlistTitle: 'Archive Favorites',
    state: 'Recoverable',
    timestamp: 'Yesterday, 6:20 PM',
    timestampLabel: 'Deleted: Yesterday, 6:20 PM',
    createdOrder: 3,
    savedVideoCount: 45,
    savedVideos: deletedPlaylistVideos,
    note: 'This backup can be restored as a new playlist using the saved local snapshot.',
    backupLabel: 'Local snapshot',
  },
  {
    id: 'history-restored-classic',
    type: 'Restored playlist',
    title: 'Restored playlist',
    subtitle: 'Classic Edits',
    source: 'Classic Edits',
    playlistTitle: 'Classic Edits',
    state: 'Restored',
    timestamp: 'May 12, 2025, 2:18 PM',
    timestampLabel: 'Restored: May 12, 2025, 2:18 PM',
    createdOrder: 4,
    savedVideoCount: 18,
    savedVideos: deletedPlaylistVideos.slice(0, 3),
    note: 'This playlist has already been restored from a saved mock backup.',
  },
  {
    id: 'history-copy-workout',
    type: 'Copy videos',
    title: 'Copied 3 videos',
    subtitle: 'Workout Motivation → 2 playlists',
    source: 'Workout Motivation',
    targetSummary: '2 playlists',
    playlistTitle: 'Workout Motivation',
    state: 'Undoable',
    timestamp: 'May 12, 2025, 11:05 AM',
    timestampLabel: 'Copied: May 12, 2025, 11:05 AM',
    createdOrder: 5,
    savedVideoCount: 3,
    savedVideos: movedVideos.concat(removedVideos.slice(0, 1)),
    note: 'This can undo the copy by removing the copied mock entries from the target playlists.',
  },
  {
    id: 'history-reorder-lofi',
    type: 'Reorder playlist',
    title: 'Reordered playlist',
    subtitle: 'Chill Lo-Fi Beats',
    source: 'Chill Lo-Fi Beats',
    playlistTitle: 'Chill Lo-Fi Beats',
    state: 'Undoable',
    timestamp: 'May 11, 2025, 7:31 PM',
    timestampLabel: 'Reordered: May 11, 2025, 7:31 PM',
    createdOrder: 6,
    savedVideoCount: 12,
    savedVideos: deletedPlaylistVideos.slice(0, 4),
    note: 'This can restore the previous saved order for Chill Lo-Fi Beats.',
  },
];
