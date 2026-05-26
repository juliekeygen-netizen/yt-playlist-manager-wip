import { useEffect, useState } from 'react';
import type { AppPage } from '@shared/navigation';
import {
  connectedMockSession,
  createMockSessionTimestamps,
  emptyMockSession,
  sanitizeMockSession,
  sessionStorageKey,
  type MockSessionInfo,
} from '@shared/sessionMockData';
import { Sidebar } from './components/Sidebar';
import { ManageYouTubeSessionOverlay } from './components/session/ManageYouTubeSessionOverlay';
import { SettingsOverlay } from './components/settings/SettingsOverlay';
import { TitleBar } from './components/TitleBar';
import { SettingsProvider } from './contexts/SettingsContext';
import { useSettings } from './contexts/settingsContextValue';
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
  const { settings } = useSettings();
  const [activePage, setActivePage] = useState<AppPage>('home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [session, setSession] = useState<MockSessionInfo>(() => loadStoredSession());

  useEffect(() => {
    try {
      localStorage.setItem(sessionStorageKey, JSON.stringify(session));
    } catch (error) {
      console.warn('Unable to persist mock session metadata to localStorage.', error);
    }
  }, [session]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-700/70 bg-shell-900/80 text-mist-100 shadow-panel">
      <TitleBar onOpenSettings={() => setSettingsOpen(true)} />
      <div className="flex min-h-0 flex-1">
        <Sidebar
          activePage={activePage}
          session={session}
          onNavigate={setActivePage}
          onOpenSessionManager={() => setSessionOpen(true)}
        />
        <main className="main-scroll min-w-0 flex-1 overflow-y-auto px-7 py-6">
          {activePage === 'home' && (
            <Dashboard
              session={session}
              previewFirstTime={settings.previewFirstTimeHomeUi}
              onOpenPlaylists={() => setActivePage('playlists')}
              onOpenSessionManager={() => setSessionOpen(true)}
            />
          )}
          {activePage === 'playlists' && <PlaylistsPage />}
          {activePage === 'queue' && <QueuePage />}
          {activePage === 'history' && <HistoryPage />}
        </main>
      </div>
      {settingsOpen && <SettingsOverlay onClose={() => setSettingsOpen(false)} />}
      {sessionOpen && (
        <ManageYouTubeSessionOverlay
          session={session}
          onClose={() => setSessionOpen(false)}
          onRefreshSession={() =>
            setSession((current) =>
              current.state === 'connected'
                ? {
                    ...current,
                    connectionStatus: 'Connected',
                    ...createMockSessionTimestamps(),
                    health: {
                      sessionDataLoaded: true,
                      signInCheckPassed: true,
                      playlistAccessCheckPassed: true,
                    },
                  }
                : current,
            )
          }
          onRemoveSession={() => setSession(emptyMockSession)}
          onUseSession={(nextSession) => setSession(nextSession)}
        />
      )}
    </div>
  );
}

function loadStoredSession(): MockSessionInfo {
  try {
    const raw = localStorage.getItem(sessionStorageKey);
    return raw ? sanitizeMockSession(JSON.parse(raw)) : connectedMockSession;
  } catch (error) {
    console.warn('Unable to load stored mock session metadata; using defaults.', error);
    return connectedMockSession;
  }
}
