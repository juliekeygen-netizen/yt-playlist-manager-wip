import type { AppResult, SessionMetadata } from '../../shared/appTypes';
import type { SavedSessionSummary } from '../../shared/ipc';

const connectedMetadata: SessionMetadata = {
  hasActiveSession: true,
  accountName: 'Test account',
  email: 'test.account@gmail.com',
  initials: 'TA',
  sessionSource: 'importedCookies',
  connectionStatus: 'connected',
  lastChecked: 'Not checked by backend yet',
  lastRefreshed: 'Mock session',
  health: {
    sessionDataLoaded: true,
    signInCheckPassed: true,
    playlistAccessCheckPassed: true,
  },
};

const noSessionMetadata: SessionMetadata = {
  hasActiveSession: false,
  accountName: '',
  initials: '',
  sessionSource: 'none',
  connectionStatus: 'notConnected',
  health: {
    sessionDataLoaded: false,
    signInCheckPassed: false,
    playlistAccessCheckPassed: false,
  },
};

export class SessionService {
  private metadata = connectedMetadata;

  getMetadata(): AppResult<SessionMetadata> {
    return { ok: true, data: this.metadata };
  }

  importCookiesFile(): AppResult<SessionMetadata> {
    this.metadata = { ...connectedMetadata, lastChecked: new Date().toISOString(), lastRefreshed: 'Just now' };
    return { ok: true, data: this.metadata };
  }

  importCookiesText(): AppResult<SessionMetadata> {
    this.metadata = { ...connectedMetadata, lastChecked: new Date().toISOString(), lastRefreshed: 'Just now' };
    return { ok: true, data: this.metadata };
  }

  remove(): AppResult<SessionMetadata> {
    this.metadata = noSessionMetadata;
    return { ok: true, data: this.metadata };
  }

  refresh(): AppResult<SessionMetadata> {
    if (!this.metadata.hasActiveSession) {
      return { ok: true, data: this.metadata };
    }

    this.metadata = { ...this.metadata, lastChecked: new Date().toISOString(), lastRefreshed: 'Just now' };
    return { ok: true, data: this.metadata };
  }

  listSaved(): AppResult<SavedSessionSummary[]> {
    return {
      ok: true,
      data: [
        { sessionId: 'test-account', accountName: 'Test account', email: 'test.account@gmail.com', initials: 'TA', status: 'connected' },
        { sessionId: 'personal-backup', accountName: 'Personal Backup', email: 'personal.backup@gmail.com', initials: 'PB', status: 'connected' },
        { sessionId: 'work-account', accountName: 'Work Account', email: 'work.account@gmail.com', initials: 'WA', status: 'expired' },
      ],
    };
  }

  switch(sessionId: string): AppResult<SessionMetadata> {
    const savedSessions = this.listSaved();
    if (!savedSessions.ok) {
      return savedSessions;
    }
    const saved = savedSessions.data.find((session) => session.sessionId === sessionId);
    if (!saved) {
      return { ok: false, error: 'Saved session not found.', code: 'SESSION_NOT_FOUND' };
    }

    this.metadata = {
      ...connectedMetadata,
      accountName: saved.accountName,
      email: saved.email,
      initials: saved.initials,
      sessionSource: 'savedSession',
      connectionStatus: saved.status === 'expired' ? 'expired' : 'connected',
      lastChecked: new Date().toISOString(),
      lastRefreshed: 'Just now',
    };
    return { ok: true, data: this.metadata };
  }
}
