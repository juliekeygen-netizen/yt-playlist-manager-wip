import { homeActions, mockHomeState } from '@shared/mockData';
import type { MockSessionInfo } from '@shared/sessionMockData';
import { QuickActionCard } from '../components/QuickActionCard';
import { QuickTools } from '../components/QuickTools';
import { RecentActivity } from '../components/RecentActivity';
import { RecentPlaylists } from '../components/RecentPlaylists';

export function Dashboard({
  session,
  previewFirstTime,
  onOpenPlaylists,
  onOpenSessionManager,
}: {
  session: MockSessionInfo;
  previewFirstTime: boolean;
  onOpenPlaylists?: () => void;
  onOpenSessionManager: () => void;
}) {
  const homeState = previewFirstTime || session.state === 'none' ? 'firstTime' : mockHomeState;
  const actions = homeActions[homeState];

  return (
    <div className="mx-auto max-w-[1160px] space-y-5">
      <section>
        <h1 className="text-[29px] font-bold tracking-[-0.035em] text-mist-50">Welcome back</h1>
        <p className="mt-1 text-[16px] text-mist-200">
          Manage playlists faster with safer batch actions.
        </p>
      </section>

      <section className="grid grid-cols-3 gap-5">
        {actions.map((action) => (
          <QuickActionCard
            key={action.title}
            action={action}
            onClick={getActionHandler(action.title, onOpenPlaylists, onOpenSessionManager)}
          />
        ))}
      </section>

      <RecentPlaylists />
      <QuickTools />
      <RecentActivity />
    </div>
  );
}

function getActionHandler(
  title: string,
  onOpenPlaylists: (() => void) | undefined,
  onOpenSessionManager: () => void,
) {
  if (title === 'Open Playlists') return onOpenPlaylists;
  if (title === 'Manage Session' || title === 'Connect YouTube Session') return onOpenSessionManager;
  return undefined;
}
