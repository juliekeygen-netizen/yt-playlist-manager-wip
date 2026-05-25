import { useState } from 'react';
import type { AppPage } from '@shared/navigation';
import { Sidebar } from './components/Sidebar';
import { TitleBar } from './components/TitleBar';
import { Dashboard } from './pages/Dashboard';
import { PlaylistsPage } from './pages/PlaylistsPage';
import { QueuePage } from './pages/QueuePage';

export default function App() {
  const [activePage, setActivePage] = useState<AppPage>('home');

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-700/70 bg-shell-900/80 text-mist-100 shadow-panel">
      <TitleBar />
      <div className="flex min-h-0 flex-1">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        <main className="main-scroll min-w-0 flex-1 overflow-y-auto px-7 py-6">
          {activePage === 'home' && <Dashboard onOpenPlaylists={() => setActivePage('playlists')} />}
          {activePage === 'playlists' && <PlaylistsPage />}
          {activePage === 'queue' && <QueuePage />}
          {activePage !== 'home' && activePage !== 'playlists' && activePage !== 'queue' && (
            <PlaceholderPage page={activePage} />
          )}
        </main>
      </div>
    </div>
  );
}

function PlaceholderPage({ page }: { page: AppPage }) {
  const title = page[0].toUpperCase() + page.slice(1);

  return (
    <div className="mx-auto flex h-full max-w-[1160px] items-center justify-center">
      <section className="panel rounded-xl px-10 py-8 text-center">
        <h1 className="text-2xl font-semibold text-mist-50">{title}</h1>
        <p className="mt-2 text-mist-400">This tab is a placeholder for now.</p>
      </section>
    </div>
  );
}
