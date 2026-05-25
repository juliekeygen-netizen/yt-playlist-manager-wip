export type QueueStatus = 'Pending' | 'Needs review' | 'Running' | 'Completed' | 'Failed' | 'Cancelled';
export type QueueOperationType =
  | 'Move videos'
  | 'Copy videos'
  | 'Remove videos'
  | 'Sync playlist'
  | 'Export playlist'
  | 'Reorder playlist';
export type QueueStatusFilter = 'All statuses' | QueueStatus;
export type QueueTypeFilter = 'All types' | QueueOperationType;
export type QueueSortKey =
  | 'newest'
  | 'oldest'
  | 'status'
  | 'type'
  | 'source'
  | 'target';
export type QueueRowsPerPage = 10 | 25 | 50 | 'All';

export interface QueueAffectedVideo {
  id: string;
  title: string;
  channel: string;
  duration: string;
  action: string;
  url?: string;
}

export interface QueueOperation {
  id: string;
  type: QueueOperationType;
  title: string;
  source: string;
  target?: string;
  targetSummary?: string;
  status: QueueStatus;
  createdAt: string;
  createdOrder: number;
  affectedVideos: QueueAffectedVideo[];
  note: string;
  error?: string;
}

export const queueOperations: QueueOperation[] = [
  {
    id: 'queue-move-coding-to-lofi',
    type: 'Move videos',
    title: 'Move 2 videos',
    source: 'Coding Music',
    target: 'Chill Lo-Fi Beats',
    status: 'Pending',
    createdAt: 'Today, 9:42 PM',
    createdOrder: 1,
    note: 'This will add 2 videos to Chill Lo-Fi Beats and remove them from Coding Music.',
    affectedVideos: [
      {
        id: 'queue-night-drive-mix',
        title: 'Night Drive Mix',
        channel: 'Chillwave Radio',
        duration: '32:14',
        action: 'Will be moved',
        url: 'https://www.youtube.com/watch?v=queue-night-drive-mix',
      },
      {
        id: 'queue-synthwave-coding-set',
        title: 'Synthwave Coding Set',
        channel: 'Future Function',
        duration: '41:27',
        action: 'Will be moved',
        url: 'https://www.youtube.com/watch?v=queue-synthwave-coding-set',
      },
    ],
  },
  {
    id: 'queue-remove-archive',
    type: 'Remove videos',
    title: 'Remove 5 videos',
    source: 'Archive Favorites',
    status: 'Needs review',
    createdAt: 'Today, 9:48 PM',
    createdOrder: 2,
    note: 'This will remove 5 unavailable or unwanted videos from Archive Favorites.',
    affectedVideos: [
      {
        id: 'queue-old-amv',
        title: 'Old AMV Reupload',
        channel: 'Nostalgia Folder',
        duration: '4:45',
        action: 'Will be removed',
      },
      {
        id: 'queue-deleted-favorite',
        title: 'Deleted favorite music video',
        channel: 'Unknown',
        duration: '3:59',
        action: 'Will be removed',
      },
      {
        id: 'queue-rare-upload',
        title: 'Rare Upload From An Old Channel Archive',
        channel: 'Archived Media Preservation',
        duration: '22:18',
        action: 'Will be removed',
      },
      {
        id: 'queue-vhs-notes',
        title: 'Documentary clip backup',
        channel: 'VHS Notes',
        duration: '14:06',
        action: 'Will be removed',
      },
      {
        id: 'queue-unavailable-archive',
        title: 'Unavailable archived upload',
        channel: 'Unknown',
        duration: '0:00',
        action: 'Will be removed',
      },
    ],
  },
  {
    id: 'queue-copy-private',
    type: 'Copy videos',
    title: 'Copy 3 videos',
    source: 'Private Mixes',
    targetSummary: '2 playlists',
    status: 'Pending',
    createdAt: 'Today, 9:51 PM',
    createdOrder: 3,
    note: 'This will copy 3 selected videos from Private Mixes into 2 target playlists.',
    affectedVideos: [
      {
        id: 'queue-private-reference',
        title: 'Private reference mix one',
        channel: 'Test Account Uploads',
        duration: '29:54',
        action: 'Will be copied',
      },
      {
        id: 'queue-ambient-draft',
        title: 'Unlisted ambient draft',
        channel: 'Long Private Channel Name',
        duration: '1:11:11',
        action: 'Will be copied',
      },
      {
        id: 'queue-noise-sketch',
        title: 'Personal noise sketch',
        channel: 'Test Account Uploads',
        duration: '7:40',
        action: 'Will be copied',
      },
    ],
  },
  {
    id: 'queue-sync-workout',
    type: 'Sync playlist',
    title: 'Sync playlist',
    source: 'Workout Motivation',
    status: 'Running',
    createdAt: 'Today, 9:54 PM',
    createdOrder: 4,
    note: 'This mock sync checks Workout Motivation for playlist changes.',
    affectedVideos: [],
  },
  {
    id: 'queue-export-coding',
    type: 'Export playlist',
    title: 'Export playlist',
    source: 'Coding Music',
    status: 'Completed',
    createdAt: 'Today, 9:57 PM',
    createdOrder: 5,
    note: 'This export operation has completed in mock state.',
    affectedVideos: [
      {
        id: 'queue-export-summary',
        title: 'Coding Music export manifest',
        channel: 'Local mock export',
        duration: '0:00',
        action: 'Exported',
      },
    ],
  },
  {
    id: 'queue-reorder-lofi',
    type: 'Reorder playlist',
    title: 'Reorder playlist',
    source: 'Chill Lo-Fi Beats',
    status: 'Failed',
    createdAt: 'Today, 10:02 PM',
    createdOrder: 6,
    error: 'Could not apply order because one item was unavailable.',
    note: 'Retry after reviewing unavailable videos in Chill Lo-Fi Beats.',
    affectedVideos: [
      {
        id: 'queue-midnight-rain',
        title: 'Midnight Rain on the Window',
        channel: 'Lo-Fi Station',
        duration: '1:12:08',
        action: 'Will be reordered',
      },
      {
        id: 'queue-coffee-loop',
        title: 'Coffee Shop Tape Loop',
        channel: 'Analog Cafe',
        duration: '48:16',
        action: 'Will be reordered',
      },
    ],
  },
  {
    id: 'queue-copy-workout',
    type: 'Copy videos',
    title: 'Copy 1 video',
    source: 'Workout Motivation',
    target: 'Private Mixes',
    status: 'Cancelled',
    createdAt: 'Today, 10:06 PM',
    createdOrder: 7,
    note: 'This operation was cancelled in mock state.',
    affectedVideos: [
      {
        id: 'queue-warmup',
        title: 'High Energy Warmup Mix',
        channel: 'Motion Beats',
        duration: '24:12',
        action: 'Was queued',
      },
    ],
  },
  {
    id: 'queue-remove-duplicates',
    type: 'Remove videos',
    title: 'Remove duplicate videos',
    source: 'Coding Music',
    status: 'Pending',
    createdAt: 'Today, 10:10 PM',
    createdOrder: 8,
    note: 'This will remove duplicate entries from Coding Music after preview.',
    affectedVideos: [
      {
        id: 'queue-duplicate-synth',
        title: 'Synthwave Coding Set',
        channel: 'Retro Pulse',
        duration: '58:42',
        action: 'Duplicate will be removed',
      },
    ],
  },
];
