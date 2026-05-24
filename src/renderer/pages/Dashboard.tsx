import { homeActions, mockHomeState } from '@shared/mockData';
import { QuickActionCard } from '../components/QuickActionCard';
import { QuickTools } from '../components/QuickTools';
import { RecentActivity } from '../components/RecentActivity';
import { RecentPlaylists } from '../components/RecentPlaylists';
import { Sidebar } from '../components/Sidebar';
import { TitleBar } from '../components/TitleBar';

export function Dashboard() {
  const actions = homeActions[mockHomeState];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-700/70 bg-shell-900/80 text-mist-100 shadow-panel">
      <TitleBar />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="main-scroll min-w-0 flex-1 overflow-y-auto px-8 py-7">
          <div className="mx-auto max-w-[1160px] space-y-5">
            <section>
              <h1 className="text-[29px] font-bold tracking-[-0.035em] text-mist-50">Welcome back</h1>
              <p className="mt-1 text-[16px] text-mist-200">
                Manage playlists faster with safer batch actions.
              </p>
            </section>

            <section className="grid grid-cols-3 gap-5">
              {actions.map((action) => (
                <QuickActionCard key={action.title} action={action} />
              ))}
            </section>

            <RecentPlaylists />
            <QuickTools />
            <RecentActivity />
          </div>
        </main>
      </div>
    </div>
  );
}
