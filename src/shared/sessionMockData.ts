export type MockSessionState = 'connected' | 'none';
export type MockConnectionStatus = 'Connected' | 'Not connected';
export type MockSessionSource = 'Imported cookies' | 'Saved session' | 'None';

export interface MockSessionHealth {
  sessionDataLoaded: boolean;
  signInCheckPassed: boolean;
  playlistAccessCheckPassed: boolean;
}

export interface MockSessionInfo {
  state: MockSessionState;
  accountName: string;
  email?: string;
  initials: string;
  connectionStatus: MockConnectionStatus;
  sessionSource: MockSessionSource;
  lastChecked: string;
  lastRefreshed: string;
  health: MockSessionHealth;
}

export const connectedMockSession: MockSessionInfo = {
  state: 'connected',
  accountName: 'Test account',
  email: 'test.account@gmail.com',
  initials: 'TA',
  connectionStatus: 'Connected',
  sessionSource: 'Imported cookies',
  lastChecked: 'Today, 10:23 PM',
  lastRefreshed: '1 min ago',
  health: {
    sessionDataLoaded: true,
    signInCheckPassed: true,
    playlistAccessCheckPassed: true,
  },
};

export const emptyMockSession: MockSessionInfo = {
  state: 'none',
  accountName: '',
  initials: '',
  connectionStatus: 'Not connected',
  sessionSource: 'None',
  lastChecked: '',
  lastRefreshed: '',
  health: {
    sessionDataLoaded: false,
    signInCheckPassed: false,
    playlistAccessCheckPassed: false,
  },
};

export const sessionStorageKey = 'yt-playlist-manager:mock-session';

export function sanitizeMockSession(value: unknown): MockSessionInfo {
  if (!value || typeof value !== 'object') {
    return connectedMockSession;
  }

  const candidate = value as Partial<MockSessionInfo>;
  if (candidate.state !== 'connected' && candidate.state !== 'none') {
    return connectedMockSession;
  }

  if (candidate.state === 'none') {
    return {
      ...emptyMockSession,
      lastChecked: typeof candidate.lastChecked === 'string' ? candidate.lastChecked : '',
      lastRefreshed: typeof candidate.lastRefreshed === 'string' ? candidate.lastRefreshed : '',
    };
  }

  return {
    ...connectedMockSession,
    accountName: typeof candidate.accountName === 'string' && candidate.accountName ? candidate.accountName : connectedMockSession.accountName,
    email: typeof candidate.email === 'string' ? candidate.email : connectedMockSession.email,
    initials: typeof candidate.initials === 'string' && candidate.initials ? candidate.initials : connectedMockSession.initials,
    connectionStatus: candidate.connectionStatus === 'Connected' ? 'Connected' : connectedMockSession.connectionStatus,
    sessionSource:
      candidate.sessionSource === 'Imported cookies' || candidate.sessionSource === 'Saved session'
        ? candidate.sessionSource
        : connectedMockSession.sessionSource,
    lastChecked: typeof candidate.lastChecked === 'string' && candidate.lastChecked ? candidate.lastChecked : connectedMockSession.lastChecked,
    lastRefreshed:
      typeof candidate.lastRefreshed === 'string' && candidate.lastRefreshed ? candidate.lastRefreshed : connectedMockSession.lastRefreshed,
    health: {
      sessionDataLoaded: Boolean(candidate.health?.sessionDataLoaded),
      signInCheckPassed: Boolean(candidate.health?.signInCheckPassed),
      playlistAccessCheckPassed: Boolean(candidate.health?.playlistAccessCheckPassed),
    },
  };
}

export function createMockSessionTimestamps() {
  return {
    lastChecked: `Today, ${new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date())}`,
    lastRefreshed: 'Just now',
  };
}
