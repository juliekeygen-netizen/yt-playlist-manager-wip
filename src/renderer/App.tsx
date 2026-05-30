import { useEffect, useState } from 'react';
import type { AppPage } from '@shared/navigation';
import {
  emptyMockSession,
  mapSessionMetadataToMockSession,
  type MockSessionInfo,
} from '@shared/sessionMockData';
import { Sidebar } from './components/Sidebar';
import { ExportPlaylistPopup } from './components/playlists/ExportPlaylistPopup';
import { PlaylistStatsPopup } from './components/playlists/PlaylistStatsPopup';
import { ManageYouTubeSessionOverlay } from './components/session/ManageYouTubeSessionOverlay';
import { SettingsOverlay } from './components/settings/SettingsOverlay';
import { SafetyNoteOverlay } from './components/SafetyNoteOverlay';
import { PlaylistMockDataProvider } from './contexts/PlaylistMockDataContext';
import { usePlaylistMockData } from './contexts/playlistMockDataContextValue';
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
      <PlaylistMockDataProvider>
        <AppShell />
      </PlaylistMockDataProvider>
    </SettingsProvider>
  );
}

function AppShell() {
  const { settings } = useSettings();
  const {
    closePlaylistPopup,
    getPlaylistViewById,
    openPlaylistStats,
    openExportPlaylist,
    playlistPopup,
    recentPlaylists,
    resetMockPlaylistData,
    setActivePlaylistId,
    videosByPlaylistId,
  } = usePlaylistMockData();
  const [activePage, setActivePage] = useState<AppPage>('home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [sessionImportOpen, setSessionImportOpen] = useState(false);
  const [safetyNoteOpen, setSafetyNoteOpen] = useState(false);
  const [session, setSession] = useState<MockSessionInfo>(emptyMockSession);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    if (!window.ytpm?.session.getMetadata) {
      setSessionLoading(false);
      return;
    }

    void window.ytpm.session.getMetadata().then((result) => {
      if (result.ok) {
        setSession(mapSessionMetadataToMockSession(result.data));
      }
      setSessionLoading(false);
    });
  }, []);

  useEffect(() => {
    function handleDeveloperReload(event: KeyboardEvent) {
      if (!settings.enableDeveloperReloadHotkeys || !event.ctrlKey || event.key.toLowerCase() !== 'r') return;
      event.preventDefault();
      if (event.altKey) {
        void window.windowControls?.relaunch?.();
      } else if (event.shiftKey) {
        void window.windowControls?.hardReload?.();
      } else {
        void window.windowControls?.reload?.();
      }
    }

    window.addEventListener('keydown', handleDeveloperReload);
    return () => window.removeEventListener('keydown', handleDeveloperReload);
  }, [settings.enableDeveloperReloadHotkeys]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-700/70 bg-shell-900/80 text-mist-100 shadow-panel">
      <TitleBar onOpenSettings={() => setSettingsOpen(true)} onOpenSafetyNote={() => setSafetyNoteOpen(true)} />
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
              recentPlaylists={recentPlaylists}
              session={session}
              previewFirstTime={settings.previewFirstTimeHomeUi}
              onOpenPlaylists={() => setActivePage('playlists')}
              onOpenPlaylist={(playlistId) => {
                setActivePlaylistId(playlistId);
                setActivePage('playlists');
              }}
              onOpenPlaylistContextAction={(playlistId, action) => {
                if (action === 'stats') {
                  openPlaylistStats(playlistId);
                  return;
                }
                if (action === 'export') {
                  openExportPlaylist(playlistId);
                  return;
                }
                if (action === 'open') {
                  setActivePlaylistId(playlistId);
                  setActivePage('playlists');
                }
              }}
              onOpenSessionManager={() => setSessionOpen(true)}
              onOpenImportSession={() => {
                setSessionOpen(true);
                setSessionImportOpen(true);
              }}
              onOpenSafetyNote={() => setSafetyNoteOpen(true)}
              onOpenQueue={() => setActivePage('queue')}
            />
          )}
          {activePage === 'playlists' && <PlaylistsPage />}
          {activePage === 'queue' && <QueuePage />}
          {activePage === 'history' && <HistoryPage />}
        </main>
      </div>
      {settingsOpen && (
        <SettingsOverlay
          onClose={() => setSettingsOpen(false)}
          onResetMockData={() => {
            resetMockPlaylistData();
          }}
        />
      )}
      {sessionOpen && (
        <ManageYouTubeSessionOverlay
          session={session}
          initialChildModal={sessionImportOpen ? { type: 'cookies', mode: 'import' } : null}
          onClose={() => {
            setSessionOpen(false);
            setSessionImportOpen(false);
          }}
          onImportCookiesFile={async ({ cookieText, fileName }) => {
            if (!window.ytpm?.session.importCookiesFile) {
              throw new Error('Session import API is unavailable.');
            }
            const result = await window.ytpm.session.importCookiesFile({ cookieText, fileName });
            if (!result.ok) {
              throw new Error(result.error);
            }
            const mapped = mapSessionMetadataToMockSession(result.data);
            setSession(mapped);
            return mapped;
          }}
          onImportCookiesText={async (cookieText) => {
            if (!window.ytpm?.session.importCookiesText) {
              throw new Error('Session import API is unavailable.');
            }
            const result = await window.ytpm.session.importCookiesText({ cookieText });
            if (!result.ok) {
              throw new Error(result.error);
            }
            const mapped = mapSessionMetadataToMockSession(result.data);
            setSession(mapped);
            return mapped;
          }}
          onRefreshSession={async () => {
            if (!window.ytpm?.session.refresh) return;
            const result = await window.ytpm.session.refresh();
            if (result.ok) {
              setSession(mapSessionMetadataToMockSession(result.data));
            }
          }}
          onRemoveSession={async () => {
            if (!window.ytpm?.session.remove) return;
            const result = await window.ytpm.session.remove();
            if (result.ok) {
              setSession(mapSessionMetadataToMockSession(result.data));
            }
          }}
          onUseSession={(nextSession) => setSession(nextSession)}
        />
      )}
      {safetyNoteOpen && <SafetyNoteOverlay onClose={() => setSafetyNoteOpen(false)} />}
      {playlistPopup && (() => {
        const playlist = getPlaylistViewById(playlistPopup.playlistId);
        if (!playlist) return null;
        const videos = videosByPlaylistId[playlist.id] ?? [];
        return playlistPopup.type === 'playlistStats' ? (
          <PlaylistStatsPopup playlist={playlist} videos={videos} onClose={closePlaylistPopup} />
        ) : (
          <ExportPlaylistPopup playlist={playlist} onClose={closePlaylistPopup} />
        );
      })()}
    </div>
  );
}
