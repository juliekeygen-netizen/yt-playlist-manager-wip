import { homeActions, mockHomeState } from '@shared/mockData';
import { QuickActionCard } from '../components/QuickActionCard';
import { QuickTools } from '../components/QuickTools';
import { RecentActivity } from '../components/RecentActivity';
import { RecentPlaylists } from '../components/RecentPlaylists';

export function Dashboard({ onOpenPlaylists }: { onOpenPlaylists?: () => void }) {
  const actions = homeActions[mockHomeState];

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
            onClick={action.title === 'Open Playlists' ? onOpenPlaylists : undefined}
          />
        ))}
      </section>

      <RecentPlaylists />
      <QuickTools />
      <RecentActivity />
    </div>
  );
}
