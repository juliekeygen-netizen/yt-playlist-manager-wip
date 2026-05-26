export type PlaylistStatus = 'Loaded' | 'Partial' | 'Error';
export type VideoStatus = 'Public' | 'Unlisted' | 'Private' | 'Deleted' | 'Unavailable';
export type SortDirection = 'asc' | 'desc';
export type PlaylistStatusFilter = 'All statuses' | PlaylistStatus;
export type TargetPlaylistStatusFilter = 'All playlist statuses' | PlaylistStatus;
export type VideoStatusFilter = 'All statuses' | VideoStatus;
export type PlaylistSortKey = 'recentlyUpdated' | 'playlistName' | 'videoCount' | 'totalDuration';
export type VideoSortKey = 'manual' | 'videoTitle' | 'channel' | 'duration' | 'status' | 'dateAdded';
export type RowsPerPage = 10 | 25 | 50 | 100 | 200 | 500 | 1000 | 'All';

export interface PlaylistListRecord {
  id: string;
  title: string;
  videoCount: number;
  status: PlaylistStatus;
  lastSynced: string;
  locked?: boolean;
  pinned?: boolean;
}

export interface PlaylistVideo {
  id: string;
  title: string;
  channel: string;
  duration: string;
  status: VideoStatus;
  dateAdded: string;
  url?: string;
}

export interface PlaylistViewRecord extends PlaylistListRecord {
  videoCount: number;
  totalDurationSeconds: number;
  originalIndex: number;
}

export const playlistRecords: PlaylistListRecord[] = [
  {
    title: 'Chill Lo-Fi Beats',
    id: 'PL1234567890abcdef',
    videoCount: 128,
    status: 'Loaded',
    lastSynced: 'Today, 10:18 AM',
  },
  {
    title: 'Coding Music',
    id: 'PL0987654321fedcba',
    videoCount: 64,
    status: 'Loaded',
    lastSynced: 'Today, 10:24 AM',
  },
  {
    title: 'Workout Motivation',
    id: 'PL1122334455667788',
    videoCount: 92,
    status: 'Partial',
    lastSynced: 'Today, 9:56 AM',
  },
  {
    title: 'Archive Favorites',
    id: 'PL8877665544332211',
    videoCount: 45,
    status: 'Loaded',
    lastSynced: 'Yesterday, 5:40 PM',
  },
  {
    title: 'Private Mixes',
    id: 'PL556677889900aabb',
    videoCount: 23,
    status: 'Loaded',
    lastSynced: 'Yesterday, 4:12 PM',
    locked: true,
  },
];

export const selectedPlaylistId = 'PL0987654321fedcba';

export const playlistVideosByPlaylistId: Record<string, PlaylistVideo[]> = {
  PL1234567890abcdef: [
    {
      id: 'midnight-rain-on-the-window',
      title: 'Midnight Rain on the Window',
      channel: 'Lo-Fi Station',
      duration: '1:12:08',
      status: 'Public',
      dateAdded: 'May 22, 2024',
    },
    {
      id: 'soft-study-beats-for-late-night-homework',
      title: 'Soft Study Beats for Late Night Homework and Quiet Bedroom Focus Sessions',
      channel: 'Gentle Static Radio Archive',
      duration: '2:04:33',
      status: 'Public',
      dateAdded: 'May 19, 2024',
    },
    {
      id: 'coffee-shop-tape-loop',
      title: 'Coffee Shop Tape Loop',
      channel: 'Analog Cafe',
      duration: '48:16',
      status: 'Public',
      dateAdded: 'May 17, 2024',
    },
    {
      id: 'deleted-chillhop-upload',
      title: 'Deleted chillhop upload',
      channel: 'Unknown',
      duration: '3:41',
      status: 'Deleted',
      dateAdded: 'Apr 30, 2024',
    },
    {
      id: 'sleepy-rooftop-mix',
      title: 'Sleepy Rooftop Mix',
      channel: 'Cloudy Windows',
      duration: '1:33:20',
      status: 'Unlisted',
      dateAdded: 'Apr 21, 2024',
    },
    {
      id: 'unavailable-private-beat-collection',
      title: 'Unavailable private beat collection',
      channel: 'Unknown',
      duration: '0:00',
      status: 'Unavailable',
      dateAdded: 'Apr 10, 2024',
    },
  ],
  PL0987654321fedcba: [
    {
      id: 'night-drive-mix',
      title: 'Night Drive Mix',
      channel: 'Lo-Fi Station',
      duration: '1:02:15',
      status: 'Public',
      dateAdded: 'May 20, 2024',
    },
    {
      id: 'synthwave-coding-set',
      title: 'Synthwave Coding Set',
      channel: 'Retro Pulse',
      duration: '58:42',
      status: 'Public',
      dateAdded: 'May 18, 2024',
    },
    {
      id: 'extremely-long-coding-playlist-title',
      title: 'Extremely Long Coding Playlist Title That Should Wrap Cleanly Without Colliding With The Channel Column',
      channel: 'Very Long Channel Name For Testing Table Wrapping And Ellipsis Behavior',
      duration: '1:44:09',
      status: 'Public',
      dateAdded: 'May 16, 2024',
    },
    {
      id: 'rainy-keyboard-focus',
      title: 'Rainy Keyboard Focus',
      channel: 'Calm Works',
      duration: '45:30',
      status: 'Unlisted',
      dateAdded: 'May 15, 2024',
    },
    {
      id: 'unlisted-tutorial-recording',
      title: 'Unlisted Tutorial Recording',
      channel: 'Private Uploads',
      duration: '32:18',
      status: 'Unlisted',
      dateAdded: 'May 10, 2024',
    },
    {
      id: 'deleted-old-track',
      title: 'Deleted old track',
      channel: 'Unknown',
      duration: '4:12',
      status: 'Deleted',
      dateAdded: 'Apr 28, 2024',
    },
    {
      id: 'unavailable-sample',
      title: 'Unavailable sample',
      channel: 'Unknown',
      duration: '3:05',
      status: 'Unavailable',
      dateAdded: 'Apr 20, 2024',
    },
  ],
  PL1122334455667788: [
    {
      id: 'high-energy-warmup-mix',
      title: 'High Energy Warmup Mix',
      channel: 'Motion Beats',
      duration: '24:12',
      status: 'Public',
      dateAdded: 'May 21, 2024',
    },
    {
      id: 'full-body-workout-timer',
      title: 'Full Body Workout Timer With Intense Electronic Background Music For Long Training Sessions',
      channel: 'Training Audio Channel With A Very Long Name To Test Wrapping',
      duration: '1:05:00',
      status: 'Public',
      dateAdded: 'May 18, 2024',
    },
    {
      id: 'morning-cardio-push',
      title: 'Morning Cardio Push',
      channel: 'Pulse Mode',
      duration: '36:44',
      status: 'Public',
      dateAdded: 'May 14, 2024',
    },
    {
      id: 'private-gym-routine-reference',
      title: 'Private gym routine reference',
      channel: 'Personal Uploads',
      duration: '12:30',
      status: 'Private',
      dateAdded: 'May 9, 2024',
    },
    {
      id: 'deleted-hiit-mix',
      title: 'Deleted HIIT mix',
      channel: 'Unknown',
      duration: '18:05',
      status: 'Deleted',
      dateAdded: 'Apr 25, 2024',
    },
    {
      id: 'unavailable-workout-video',
      title: 'Unavailable workout video',
      channel: 'Unknown',
      duration: '0:00',
      status: 'Unavailable',
      dateAdded: 'Apr 12, 2024',
    },
  ],
  PL8877665544332211: [
    {
      id: 'classic-internet-animation-archive',
      title: 'Classic Internet Animation Archive',
      channel: 'Old Web Finds',
      duration: '8:32',
      status: 'Public',
      dateAdded: 'Mar 30, 2024',
    },
    {
      id: 'rare-upload-old-channel-archive',
      title: 'Rare Upload With A Very Long Descriptive Title From An Old Channel Archive Collection',
      channel: 'Archived Media Preservation Channel With A Long Name',
      duration: '22:18',
      status: 'Public',
      dateAdded: 'Mar 27, 2024',
    },
    {
      id: 'old-amv-reupload',
      title: 'Old AMV Reupload',
      channel: 'Nostalgia Folder',
      duration: '4:45',
      status: 'Unlisted',
      dateAdded: 'Mar 21, 2024',
    },
    {
      id: 'deleted-favorite-music-video',
      title: 'Deleted favorite music video',
      channel: 'Unknown',
      duration: '3:59',
      status: 'Deleted',
      dateAdded: 'Feb 14, 2024',
    },
    {
      id: 'documentary-clip-backup',
      title: 'Documentary clip backup',
      channel: 'VHS Notes',
      duration: '14:06',
      status: 'Public',
      dateAdded: 'Feb 2, 2024',
    },
    {
      id: 'unavailable-archived-upload',
      title: 'Unavailable archived upload',
      channel: 'Unknown',
      duration: '0:00',
      status: 'Unavailable',
      dateAdded: 'Jan 20, 2024',
    },
  ],
  PL556677889900aabb: [
    {
      id: 'private-reference-mix-one',
      title: 'Private reference mix one',
      channel: 'Test Account Uploads',
      duration: '29:54',
      status: 'Private',
      dateAdded: 'May 5, 2024',
    },
    {
      id: 'unlisted-ambient-draft-long-title',
      title: 'Unlisted ambient draft with an intentionally long title to test two-line truncation in the video table',
      channel: 'Long Private Channel Name Used For UI Testing Purposes',
      duration: '1:11:11',
      status: 'Unlisted',
      dateAdded: 'Apr 29, 2024',
    },
    {
      id: 'personal-noise-sketch',
      title: 'Personal noise sketch',
      channel: 'Test Account Uploads',
      duration: '7:40',
      status: 'Private',
      dateAdded: 'Apr 15, 2024',
    },
    {
      id: 'hidden-playlist-item-sample',
      title: 'Hidden playlist item sample',
      channel: 'Private Uploads',
      duration: '18:22',
      status: 'Private',
      dateAdded: 'Apr 7, 2024',
    },
    {
      id: 'deleted-private-experiment',
      title: 'Deleted private experiment',
      channel: 'Unknown',
      duration: '2:45',
      status: 'Deleted',
      dateAdded: 'Mar 25, 2024',
    },
    {
      id: 'unavailable-private-mix',
      title: 'Unavailable private mix',
      channel: 'Unknown',
      duration: '0:00',
      status: 'Unavailable',
      dateAdded: 'Mar 12, 2024',
    },
  ],
};

export const initiallySelectedVideoIds = ['night-drive-mix', 'synthwave-coding-set'];
