import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  ArrowUpDown,
  Cookie,
  FileOutput,
  FolderOpen,
  RefreshCw,
  ShieldCheck,
  UserCog,
  Search,
  Shuffle,
} from 'lucide-react';

export type Accent = 'purple' | 'blue' | 'green' | 'rose' | 'amber';
export type HomeState = 'firstTime' | 'connected';

export const mockHomeState: HomeState = 'connected';

export interface QuickAction {
  title: string;
  description: string;
  buttonLabel: string;
  accent: Accent;
  icon: LucideIcon;
}

export interface Playlist {
  title: string;
  id: string;
  videoCount: number;
  status: 'Loaded' | 'Partial';
}

export interface ToolCard {
  title: string;
  description: string;
  accent: Accent;
  icon: LucideIcon;
}

export interface ActivityRow {
  text: string;
  time: string;
  status: 'Completed';
  icon: LucideIcon;
  accent: Accent;
}

export const homeActions: Record<HomeState, QuickAction[]> = {
  firstTime: [
    {
      title: 'Connect YouTube Session',
      description: 'Set up access using your YouTube cookies.',
      buttonLabel: 'Connect Session',
      accent: 'green',
      icon: UserCog,
    },
    {
      title: 'Import Cookies',
      description: 'Choose a cookies.txt file exported from your browser.',
      buttonLabel: 'Import Cookies',
      accent: 'purple',
      icon: Cookie,
    },
    {
      title: 'Read Safety Note',
      description: 'Learn how sessions and destructive actions are handled.',
      buttonLabel: 'Read Safety Note',
      accent: 'blue',
      icon: ShieldCheck,
    },
  ],
  connected: [
    {
      title: 'Open Playlists',
      description: 'Browse and manage your playlists.',
      buttonLabel: 'Open Playlists',
      accent: 'blue',
      icon: FolderOpen,
    },
    {
      title: 'Sync Playlists',
      description: 'Refresh playlist data from YouTube.',
      buttonLabel: 'Sync Playlists',
      accent: 'green',
      icon: RefreshCw,
    },
    {
      title: 'Manage Session',
      description: 'Update cookies, switch account, or check connection.',
      buttonLabel: 'Manage Session',
      accent: 'purple',
      icon: UserCog,
    },
  ],
};

export const recentPlaylists: Playlist[] = [
  {
    title: 'Chill Lo-Fi Beats',
    id: 'PL1234567890abcdef',
    videoCount: 128,
    status: 'Loaded',
  },
  {
    title: 'Coding Music',
    id: 'PL0987654321fedcba',
    videoCount: 64,
    status: 'Loaded',
  },
  {
    title: 'Workout Motivation',
    id: 'PL1122334455667788',
    videoCount: 92,
    status: 'Partial',
  },
];

export const quickTools: ToolCard[] = [
  {
    title: 'Export Playlist',
    description: 'Export video list to CSV or JSON.',
    accent: 'green',
    icon: FileOutput,
  },
  {
    title: 'Find Unavailable Videos',
    description: 'Scan and identify removed or private videos.',
    accent: 'rose',
    icon: Search,
  },
  {
    title: 'Remove Duplicates',
    description: 'Find and remove duplicate videos in a playlist.',
    accent: 'amber',
    icon: Shuffle,
  },
  {
    title: 'Reorder Videos',
    description: 'Reorder videos manually or by date added.',
    accent: 'blue',
    icon: ArrowUpDown,
  },
];

export const recentActivity: ActivityRow[] = [
  {
    text: 'Exported "Chill Lo-Fi Beats" to CSV',
    time: 'Today, 10:24 AM',
    status: 'Completed',
    accent: 'green',
    icon: Activity,
  },
];
