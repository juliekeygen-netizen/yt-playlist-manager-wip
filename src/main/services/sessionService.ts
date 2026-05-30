import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import type { AppResult, SessionMetadata } from '../../shared/appTypes';
import type {
  ImportCookiesFileRequest,
  ImportCookiesTextRequest,
  SavedSessionSummary,
} from '../../shared/ipc';
import { StorageService } from './storageService';
import { type StoredCookie, YouTubeClient } from './youtubeClient';

interface StoredSessionRecord {
  cookies: StoredCookie[];
  metadata: SessionMetadata;
  updatedAt: string;
}

const emptyMetadata: SessionMetadata = {
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
  private metadata: SessionMetadata = emptyMetadata;
  private cookies: StoredCookie[] = [];
  private readonly storageService: StorageService;
  private readonly youtubeClient: YouTubeClient;

  constructor(storageService = new StorageService(), youtubeClient = new YouTubeClient()) {
    this.storageService = storageService;
    this.youtubeClient = youtubeClient;
    this.loadStoredSession();
  }

  getMetadata(): AppResult<SessionMetadata> {
    return { ok: true, data: this.metadata };
  }

  getStoredCookies() {
    return [...this.cookies];
  }

  async importCookiesFile(request: ImportCookiesFileRequest): Promise<AppResult<SessionMetadata>> {
    return this.importCookiesText({ cookieText: request.cookieText });
  }

  async importCookiesText(request: ImportCookiesTextRequest): Promise<AppResult<SessionMetadata>> {
    const parseResult = parseCookieInput(request.cookieText);
    if (!parseResult.ok) {
      this.log(`Cookie import failed: ${parseResult.error}`);
      return parseResult;
    }

    this.cookies = parseResult.data;
    const checkResult = await this.youtubeClient.checkSession(this.cookies);
    if (!checkResult.ok) {
      this.log(`Cookie import check failed: ${checkResult.error}`);
      return checkResult;
    }

    this.metadata = {
      ...checkResult.data,
      sessionSource: 'importedCookies',
      lastRefreshed: new Date().toISOString(),
    };
    this.persistCurrentSession();
    this.log(`Cookie import succeeded. Connection status: ${this.metadata.connectionStatus}`);
    return { ok: true, data: this.metadata };
  }

  remove(): AppResult<SessionMetadata> {
    this.cookies = [];
    this.metadata = emptyMetadata;
    this.clearPersistedSession();
    this.log('Session removed.');
    return { ok: true, data: this.metadata };
  }

  async refresh(): Promise<AppResult<SessionMetadata>> {
    if (this.cookies.length === 0) {
      return { ok: true, data: this.metadata };
    }

    const result = await this.youtubeClient.checkSession(this.cookies);
    if (!result.ok) {
      this.log(`Session refresh failed: ${result.error}`);
      return result;
    }

    this.metadata = {
      ...result.data,
      sessionSource: this.metadata.sessionSource === 'savedSession' ? 'savedSession' : 'importedCookies',
      lastRefreshed: new Date().toISOString(),
    };
    this.persistCurrentSession();
    this.log(`Session refresh completed. Connection status: ${this.metadata.connectionStatus}`);
    return { ok: true, data: this.metadata };
  }

  listSaved(): AppResult<SavedSessionSummary[]> {
    const current =
      this.metadata.hasActiveSession && this.metadata.accountName
        ? [
            {
              sessionId: 'current-session',
              accountName: this.metadata.accountName,
              email: this.metadata.email,
              initials: this.metadata.initials || 'YT',
              status: this.metadata.connectionStatus === 'expired' ? 'expired' : 'connected',
              lastUsedAt: this.metadata.lastRefreshed,
            } satisfies SavedSessionSummary,
          ]
        : [];

    return { ok: true, data: current };
  }

  switch(sessionId: string): AppResult<SessionMetadata> {
    if (sessionId === 'current-session' && this.metadata.hasActiveSession) {
      return { ok: true, data: this.metadata };
    }

    return { ok: false, error: 'Saved session switching is not implemented for real sessions yet.', code: 'NOT_IMPLEMENTED' };
  }

  getSessionMetadataPath(): AppResult<string> {
    // TODO: Persist encrypted/secure raw cookie storage in main process only if stronger local protection is added.
    return this.storageService.getSessionMetadataFilePath();
  }

  private loadStoredSession() {
    const pathResult = this.storageService.getSessionMetadataFilePath();
    if (!pathResult.ok || !existsSync(pathResult.data)) {
      return;
    }

    try {
      const raw = JSON.parse(readFileSync(pathResult.data, 'utf8')) as Partial<StoredSessionRecord>;
      this.cookies = Array.isArray(raw.cookies) ? raw.cookies.filter(isStoredCookie) : [];
      this.metadata = isSessionMetadata(raw.metadata) ? raw.metadata : emptyMetadata;
    } catch (error) {
      this.log('Stored session metadata could not be read. Starting disconnected.');
      this.cookies = [];
      this.metadata = emptyMetadata;
    }
  }

  private persistCurrentSession() {
    const pathResult = this.storageService.getSessionMetadataFilePath();
    if (!pathResult.ok) return;

    const payload: StoredSessionRecord = {
      cookies: this.cookies,
      metadata: this.metadata,
      updatedAt: new Date().toISOString(),
    };
    writeFileSync(pathResult.data, JSON.stringify(payload, null, 2), 'utf8');
  }

  private clearPersistedSession() {
    const pathResult = this.storageService.getSessionMetadataFilePath();
    if (!pathResult.ok) return;
    rmSync(pathResult.data, { force: true });
  }

  private log(message: string) {
    console.info(`[session] ${message}`);
    void this.storageService.appendLogLine(`[session] ${message}`);
  }
}

function parseCookieInput(cookieText: string): AppResult<StoredCookie[]> {
  const trimmed = cookieText.trim();
  if (!trimmed) {
    return { ok: false, error: 'Cookies must include youtube.com entries.', code: 'INVALID_COOKIES' };
  }

  const cookies = tryParseJsonCookies(trimmed) ?? tryParseNetscapeCookies(trimmed) ?? tryParseHeaderCookies(trimmed);
  const youtubeCookies = cookies.filter((cookie) => /(^|\.)youtube\.com$/i.test(cookie.domain) || cookie.domain.includes('youtube.com'));

  if (youtubeCookies.length === 0 || !looksLikeYouTubeCookieSet(youtubeCookies)) {
    return { ok: false, error: 'Cookies must include youtube.com entries.', code: 'INVALID_COOKIES' };
  }

  return { ok: true, data: youtubeCookies };
}

function tryParseJsonCookies(input: string): StoredCookie[] | null {
  try {
    const parsed = JSON.parse(input) as unknown;
    const source = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === 'object' && Array.isArray((parsed as Record<string, unknown>).cookies)
        ? (parsed as Record<string, unknown>).cookies
        : null;
    if (!source) return null;

    return source
      .map((cookie) => {
        if (!cookie || typeof cookie !== 'object') return null;
        const record = cookie as Record<string, unknown>;
        const name = typeof record.name === 'string' ? record.name : '';
        const value = typeof record.value === 'string' ? record.value : '';
        const domain = typeof record.domain === 'string' ? record.domain : '';
        if (!name || !value || !domain) return null;

        return {
          name,
          value,
          domain,
          path: typeof record.path === 'string' ? record.path : '/',
          secure: Boolean(record.secure),
          httpOnly: Boolean(record.httpOnly),
          expires: typeof record.expirationDate === 'number'
            ? record.expirationDate
            : typeof record.expires === 'number'
              ? record.expires
              : null,
        } satisfies StoredCookie;
      })
      .filter((cookie): cookie is StoredCookie => Boolean(cookie));
  } catch {
    return null;
  }
}

function tryParseNetscapeCookies(input: string): StoredCookie[] | null {
  if (!input.includes('\t') && !input.includes('youtube.com')) return null;

  const cookies = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const parts = line.split('\t');
      if (parts.length < 7) return null;
      const [domain, , path, secureFlag, expires, name, value] = parts;
      return {
        name,
        value,
        domain,
        path: path || '/',
        secure: secureFlag.toUpperCase() === 'TRUE',
        httpOnly: false,
        expires: expires && expires !== '0' ? Number(expires) : null,
      } satisfies StoredCookie;
    })
    .filter((cookie): cookie is StoredCookie => Boolean(cookie));

  return cookies.length > 0 ? cookies : null;
}

function tryParseHeaderCookies(input: string): StoredCookie[] {
  return input
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex === -1) return null;
      return {
        name: part.slice(0, separatorIndex).trim(),
        value: part.slice(separatorIndex + 1).trim(),
        domain: '.youtube.com',
        path: '/',
        secure: true,
        httpOnly: false,
        expires: null,
      } satisfies StoredCookie;
    })
    .filter((cookie): cookie is StoredCookie => Boolean(cookie));
}

function looksLikeYouTubeCookieSet(cookies: StoredCookie[]) {
  return cookies.some((cookie) =>
    ['SID', 'HSID', 'SAPISID', '__Secure-3PAPISID', 'APISID', 'SSID'].includes(cookie.name) ||
    cookie.domain.includes('youtube.com'),
  );
}

function isStoredCookie(value: unknown): value is StoredCookie {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record.name === 'string' &&
    typeof record.value === 'string' &&
    typeof record.domain === 'string' &&
    typeof record.path === 'string';
}

function isSessionMetadata(value: unknown): value is SessionMetadata {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record.accountName === 'string' &&
    typeof record.initials === 'string' &&
    typeof record.sessionSource === 'string' &&
    typeof record.connectionStatus === 'string' &&
    typeof record.health === 'object';
}
