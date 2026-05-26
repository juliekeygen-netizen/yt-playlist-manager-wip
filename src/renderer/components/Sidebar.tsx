import { AlertTriangle, History, Home, ListMusic, TimerReset } from 'lucide-react';
import type { AppPage } from '@shared/navigation';
import type { MockSessionInfo } from '@shared/sessionMockData';

const navItems = [
  { label: 'Home', icon: Home, page: 'home' },
  { label: 'Playlists', icon: ListMusic, page: 'playlists' },
  { label: 'Queue', icon: TimerReset, page: 'queue' },
  { label: 'History', icon: History, page: 'history' },
] satisfies Array<{ label: string; icon: typeof Home; page: AppPage }>;

export function Sidebar({
  activePage,
  session,
  onNavigate,
  onOpenSessionManager,
}: {
  activePage: AppPage;
  session: MockSessionInfo;
  onNavigate: (page: AppPage) => void;
  onOpenSessionManager: () => void;
}) {
  const connected = session.state === 'connected';

  return (
    <aside className="flex w-[314px] shrink-0 flex-col border-r border-white/[0.08] bg-shell-950/55 px-4 py-5 backdrop-blur-2xl">
      <button
        className="panel flex w-full items-center gap-4 rounded-lg p-4 text-left transition hover:border-white/[0.14] hover:bg-white/[0.055]"
        onClick={onOpenSessionManager}
        type="button"
      >
        <div
          className={`relative flex h-14 w-14 items-center justify-center rounded-full text-xl font-semibold shadow-lg ${
            connected
              ? 'bg-gradient-to-br from-blue-400 to-violet-600 text-white shadow-blue-950/40'
              : 'border border-white/[0.10] bg-white/[0.055] text-mist-400'
          }`}
        >
          {connected ? session.initials : <AlertTriangle size={23} />}
          <span
            className={`absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-shell-900 text-[10px] ${
              connected ? 'bg-emerald-400 text-shell-950' : 'bg-amber-400 text-shell-950'
            }`}
          >
            {connected ? '✓' : '!'}
          </span>
        </div>
        <div>
          <p className="font-semibold text-mist-50">YouTube session</p>
          <p className={`text-sm font-semibold ${connected ? 'text-emerald-300' : 'text-amber-300'}`}>
            {connected ? 'connected' : 'disconnected'}
          </p>
          <p className="mt-1 text-sm text-mist-400">
            {connected ? session.accountName : 'No active session'}
          </p>
        </div>
      </button>

      <nav className="mt-7 space-y-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const selected = activePage === item.page;
          return (
            <button
              key={item.label}
              onClick={() => onNavigate(item.page)}
              className={`relative isolate flex w-full items-center gap-5 overflow-hidden rounded-lg px-5 py-3.5 text-left text-[16px] transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-300/40 ${
                selected
                  ? 'bg-gradient-to-r from-blue-500/25 via-blue-500/14 to-blue-500/5 text-white'
                  : 'text-mist-400 hover:bg-white/6 hover:text-mist-50'
              }`}
            >
              {selected && (
                <>
                  <span className="absolute left-0 top-2 h-[calc(100%-1rem)] w-[4px] rounded-r-full bg-blue-400" />
                  <span className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-24 bg-gradient-to-r from-blue-400/10 to-transparent" />
                </>
              )}
              <Icon size={24} className={selected ? 'text-blue-300' : 'text-mist-400'} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto">
        <footer className="border-t border-white/[0.055] px-5 pt-5 text-sm text-mist-500">
          YT Playlist Manager&nbsp;&nbsp; v0.1.0
        </footer>
      </div>
    </aside>
  );
}
