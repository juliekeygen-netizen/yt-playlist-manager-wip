import { homeActions, mockHomeState } from '@shared/mockData';
import type { PlaylistListRecord } from '@shared/playlistMockData';
import { queueOperations } from '@shared/queueMockData';
import type { MockSessionInfo } from '@shared/sessionMockData';
import { QuickActionCard } from '../components/QuickActionCard';
import { RecentActivity } from '../components/RecentActivity';
import { RecentPlaylists } from '../components/RecentPlaylists';

export function Dashboard({
  recentPlaylists,
  session,
  previewFirstTime,
  onOpenPlaylists,
  onOpenPlaylist,
  onOpenPlaylistContextAction,
  onOpenSessionManager,
  onOpenImportSession,
  onOpenSafetyNote,
  onOpenQueue,
}: {
  recentPlaylists: PlaylistListRecord[];
  session: MockSessionInfo;
  previewFirstTime: boolean;
  onOpenPlaylists?: () => void;
  onOpenPlaylist: (playlistId: string) => void;
  onOpenPlaylistContextAction: (playlistId: string, action: 'open' | 'stats' | 'export') => void;
  onOpenSessionManager: () => void;
  onOpenImportSession: () => void;
  onOpenSafetyNote: () => void;
  onOpenQueue: () => void;
}) {
  const homeState = previewFirstTime || session.state === 'none' ? 'firstTime' : mockHomeState;
  const actions = homeActions[homeState];

  return (
    <div className="mx-auto max-w-[1160px] space-y-5">
      <section>
        <h1 className="text-[29px] font-bold tracking-[-0.035em] text-mist-50">
          {homeState === 'firstTime' ? 'Welcome' : 'Welcome back'}
        </h1>
        <p className="mt-1 text-[16px] text-mist-200">
          Manage playlists faster with safer batch actions.
        </p>
      </section>

      <section className="grid grid-cols-3 gap-5">
        {actions.map((action) => (
          <QuickActionCard
            key={action.title}
            action={action}
            onClick={getActionHandler(action.title, onOpenPlaylists, onOpenSessionManager, onOpenImportSession, onOpenSafetyNote)}
          />
        ))}
      </section>

      <RecentPlaylists
        playlists={recentPlaylists}
        onOpenPlaylist={onOpenPlaylist}
        onOpenPlaylistContextAction={onOpenPlaylistContextAction}
        onViewAll={onOpenPlaylists}
      />
      <RecentActivity activities={queueOperations.slice(0, 3)} onViewAll={onOpenQueue} />
    </div>
  );
}

function getActionHandler(
  title: string,
  onOpenPlaylists: (() => void) | undefined,
  onOpenSessionManager: () => void,
  onOpenImportSession: () => void,
  onOpenSafetyNote: () => void,
) {
  if (title === 'Open Playlists') return onOpenPlaylists;
  if (title === 'Manage Session') return onOpenSessionManager;
  if (title === 'Connect YouTube Session' || title === 'Import Cookies') return onOpenImportSession;
  if (title === 'Read Safety Note') return onOpenSafetyNote;
  return undefined;
}
