import { useState } from 'react';
import type { AppPage } from '@shared/navigation';
import { Sidebar } from './components/Sidebar';
import { SettingsOverlay } from './components/settings/SettingsOverlay';
import { TitleBar } from './components/TitleBar';
import { SettingsProvider } from './contexts/SettingsContext';
import { Dashboard } from './pages/Dashboard';
import { HistoryPage } from './pages/HistoryPage';
import { PlaylistsPage } from './pages/PlaylistsPage';
import { QueuePage } from './pages/QueuePage';

export default function App() {
  return (
    <SettingsProvider>
      <AppShell />
    </SettingsProvider>
  );
}

function AppShell() {
  const [activePage, setActivePage] = useState<AppPage>('home');
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-700/70 bg-shell-900/80 text-mist-100 shadow-panel">
      <TitleBar onOpenSettings={() => setSettingsOpen(true)} />
      <div className="flex min-h-0 flex-1">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        <main className="main-scroll min-w-0 flex-1 overflow-y-auto px-7 py-6">
          {activePage === 'home' && <Dashboard onOpenPlaylists={() => setActivePage('playlists')} />}
          {activePage === 'playlists' && <PlaylistsPage />}
          {activePage === 'queue' && <QueuePage />}
          {activePage === 'history' && <HistoryPage />}
        </main>
      </div>
      {settingsOpen && <SettingsOverlay onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
