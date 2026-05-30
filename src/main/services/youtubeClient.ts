import { createHash } from 'node:crypto';
import type {
  AppResult,
  Playlist,
  PlaylistVideo,
  PlaylistVideoStatus,
  SessionConnectionStatus,
  SessionHealth,
  SessionMetadata,
} from '../../shared/appTypes';

const YOUTUBE_ORIGIN = 'https://www.youtube.com';
const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36';

export interface StoredCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  secure: boolean;
  httpOnly: boolean;
  expires?: number | null;
}

interface ClientConfig {
  apiKey: string;
  clientName: string;
  clientVersion: string;
}

interface RequestContext {
  clientConfig: ClientConfig;
}

interface BrowseResponse {
  continuationItems?: unknown[];
  raw: unknown;
}

export class YouTubeClient {
  async checkSession(cookies: StoredCookie[]): Promise<AppResult<SessionMetadata>> {
    if (cookies.length === 0) {
      return {
        ok: true,
        data: buildSessionMetadata({
          accountName: '',
          connectionStatus: 'notConnected',
          hasActiveSession: false,
          sessionSource: 'none',
          health: unavailableHealth(),
        }),
      };
    }

    try {
      const page = await this.fetchHtml(`${YOUTUBE_ORIGIN}/feed/playlists`, cookies);
      const signInCheckPassed = !looksSignedOut(page.html);
      const playlistItems = collectPlaylistItems(page.initialData);
      const accountName = extractAccountName(page.initialData) ?? 'Imported YouTube session';
      const connectionStatus: SessionConnectionStatus = signInCheckPassed
        ? 'connected'
        : hasAuthCookies(cookies)
          ? 'expired'
          : 'invalid';

      return {
        ok: true,
        data: buildSessionMetadata({
          accountName,
          email: undefined,
          connectionStatus,
          hasActiveSession: signInCheckPassed,
          sessionSource: 'importedCookies',
          health: {
            sessionDataLoaded: cookies.length > 0,
            signInCheckPassed,
            playlistAccessCheckPassed: signInCheckPassed && playlistItems.length >= 0,
          },
        }),
      };
    } catch (error) {
      return {
        ok: true,
        data: buildSessionMetadata({
          accountName: 'Imported YouTube session',
          connectionStatus: hasAuthCookies(cookies) ? 'expired' : 'invalid',
          hasActiveSession: false,
          sessionSource: 'importedCookies',
          health: {
            sessionDataLoaded: cookies.length > 0,
            signInCheckPassed: false,
            playlistAccessCheckPassed: false,
          },
        }),
      };
    }
  }

  async listPlaylists(cookies: StoredCookie[]): Promise<AppResult<Playlist[]>> {
    try {
      const page = await this.fetchHtml(`${YOUTUBE_ORIGIN}/feed/playlists`, cookies);
      if (looksSignedOut(page.html)) {
        return { ok: false, error: 'Stored YouTube session is signed out or expired.', code: 'SESSION_INVALID' };
      }

      const playlists = new Map<string, Playlist>();
      for (const item of collectPlaylistItems(page.initialData)) {
        playlists.set(item.playlistId, item);
      }

      const seenContinuations = new Set<string>();
      for (const token of extractContinuationTokens(page.initialData)) {
        await this.appendPlaylistContinuations({
          cookies,
          context: { clientConfig: page.clientConfig },
          playlists,
          seenContinuations,
          token,
        });
      }

      return { ok: true, data: [...playlists.values()] };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to load YouTube playlists.',
        code: 'PLAYLIST_LIST_FAILED',
      };
    }
  }

  async getPlaylistVideos(cookies: StoredCookie[], playlistId: string): Promise<AppResult<PlaylistVideo[]>> {
    try {
      const page = await this.fetchHtml(`${YOUTUBE_ORIGIN}/playlist?list=${encodeURIComponent(playlistId)}`, cookies);
      const videos = new Map<string, PlaylistVideo>();
      let nextPosition = 0;

      for (const item of collectPlaylistVideoItems(page.initialData, playlistId)) {
        videos.set(item.playlistItemId, { ...item, position: nextPosition++ });
      }

      const seenContinuations = new Set<string>();
      for (const token of extractContinuationTokens(page.initialData)) {
        nextPosition = await this.appendPlaylistVideoContinuations({
          cookies,
          context: { clientConfig: page.clientConfig },
          playlistId,
          seenContinuations,
          token,
          videos,
          nextPosition,
        });
      }

      return { ok: true, data: [...videos.values()] };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to load playlist videos.',
        code: 'PLAYLIST_VIDEOS_FAILED',
      };
    }
  }

  private async appendPlaylistContinuations({
    cookies,
    context,
    playlists,
    seenContinuations,
    token,
  }: {
    cookies: StoredCookie[];
    context: RequestContext;
    playlists: Map<string, Playlist>;
    seenContinuations: Set<string>;
    token: string;
  }) {
    let currentToken: string | null = token;
    let guard = 0;

    while (currentToken && !seenContinuations.has(currentToken) && guard < 12) {
      seenContinuations.add(currentToken);
      guard += 1;
      const response = await this.fetchBrowseContinuation(cookies, context.clientConfig, currentToken);

      for (const item of collectPlaylistItems(response.raw)) {
        playlists.set(item.playlistId, item);
      }

      currentToken = extractContinuationTokens(response.raw).find((candidate) => !seenContinuations.has(candidate)) ?? null;
    }
  }

  private async appendPlaylistVideoContinuations({
    cookies,
    context,
    playlistId,
    seenContinuations,
    token,
    videos,
    nextPosition,
  }: {
    cookies: StoredCookie[];
    context: RequestContext;
    playlistId: string;
    seenContinuations: Set<string>;
    token: string;
    videos: Map<string, PlaylistVideo>;
    nextPosition: number;
  }) {
    let currentToken: string | null = token;
    let guard = 0;

    while (currentToken && !seenContinuations.has(currentToken) && guard < 30) {
      seenContinuations.add(currentToken);
      guard += 1;
      const response = await this.fetchBrowseContinuation(cookies, context.clientConfig, currentToken);

      for (const item of collectPlaylistVideoItems(response.raw, playlistId)) {
        if (!videos.has(item.playlistItemId)) {
          videos.set(item.playlistItemId, { ...item, position: nextPosition++ });
        }
      }

      currentToken = extractContinuationTokens(response.raw).find((candidate) => !seenContinuations.has(candidate)) ?? null;
    }

    return nextPosition;
  }

  private async fetchBrowseContinuation(
    cookies: StoredCookie[],
    clientConfig: ClientConfig,
    continuation: string,
  ): Promise<BrowseResponse> {
    const headers = this.buildRequestHeaders(cookies, clientConfig);
    const response = await fetch(`${YOUTUBE_ORIGIN}/youtubei/v1/browse?key=${encodeURIComponent(clientConfig.apiKey)}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        context: {
          client: {
            clientName: clientConfig.clientName,
            clientVersion: clientConfig.clientVersion,
          },
        },
        continuation,
      }),
    });

    if (!response.ok) {
      throw new Error(`YouTube continuation request failed with ${response.status}.`);
    }

    const raw = (await response.json()) as unknown;
    return { raw };
  }

  private async fetchHtml(url: string, cookies: StoredCookie[]) {
    const response = await fetch(url, {
      headers: this.buildRequestHeaders(cookies),
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`YouTube request failed with ${response.status}.`);
    }

    const html = await response.text();
    const initialData = extractBalancedJson(html, 'var ytInitialData =') ?? extractBalancedJson(html, 'window["ytInitialData"] =');
    const ytcfg = extractBalancedJson(html, 'ytcfg.set(');

    if (!initialData) {
      throw new Error('Unable to parse YouTube page data.');
    }

    return {
      html,
      initialData,
      clientConfig: {
        apiKey: String(
          (ytcfg as Record<string, unknown> | null)?.INNERTUBE_API_KEY ??
            matchString(html, /"INNERTUBE_API_KEY":"([^"]+)"/),
        ),
        clientName: 'WEB',
        clientVersion: String(
          (ytcfg as Record<string, unknown> | null)?.INNERTUBE_CLIENT_VERSION ??
            matchString(html, /"INNERTUBE_CLIENT_VERSION":"([^"]+)"/) ??
            '2.20250527.00.00',
        ),
      } satisfies ClientConfig,
    };
  }

  private buildRequestHeaders(cookies: StoredCookie[], clientConfig?: ClientConfig) {
    const cookieHeader = buildCookieHeader(cookies);
    const headers: Record<string, string> = {
      Accept: 'text/html,application/json',
      Cookie: cookieHeader,
      Origin: YOUTUBE_ORIGIN,
      Referer: `${YOUTUBE_ORIGIN}/`,
      'User-Agent': DEFAULT_USER_AGENT,
    };

    const sapisidHash = buildSapisidHash(cookies);
    if (sapisidHash) {
      headers.Authorization = sapisidHash;
    }

    if (clientConfig) {
      headers['Content-Type'] = 'application/json';
      headers['X-YouTube-Client-Name'] = clientConfig.clientName === 'WEB' ? '1' : clientConfig.clientName;
      headers['X-YouTube-Client-Version'] = clientConfig.clientVersion;
    }

    return headers;
  }
}

function buildSessionMetadata({
  accountName,
  email,
  connectionStatus,
  hasActiveSession,
  sessionSource,
  health,
}: {
  accountName: string;
  email?: string;
  connectionStatus: SessionConnectionStatus;
  hasActiveSession: boolean;
  sessionSource: SessionMetadata['sessionSource'];
  health: SessionHealth;
}): SessionMetadata {
  return {
    hasActiveSession,
    accountName,
    email,
    initials: createInitials(accountName),
    sessionSource,
    connectionStatus,
    lastChecked: new Date().toISOString(),
    lastRefreshed: new Date().toISOString(),
    health,
  };
}

function unavailableHealth(): SessionHealth {
  return {
    sessionDataLoaded: false,
    signInCheckPassed: false,
    playlistAccessCheckPassed: false,
  };
}

function createInitials(accountName: string) {
  const parts = accountName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'YT';
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');
}

function buildCookieHeader(cookies: StoredCookie[]) {
  return cookies
    .filter((cookie) => cookie.domain.includes('youtube.com'))
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');
}

function hasAuthCookies(cookies: StoredCookie[]) {
  return cookies.some((cookie) => ['SAPISID', '__Secure-3PAPISID', 'SID', 'HSID', 'APISID'].includes(cookie.name));
}

function buildSapisidHash(cookies: StoredCookie[]) {
  const sapisid = cookies.find((cookie) => cookie.name === 'SAPISID')?.value
    ?? cookies.find((cookie) => cookie.name === '__Secure-3PAPISID')?.value
    ?? cookies.find((cookie) => cookie.name === 'APISID')?.value;

  if (!sapisid) return null;

  const timestamp = Math.floor(Date.now() / 1000);
  const input = `${timestamp} ${sapisid} ${YOUTUBE_ORIGIN}`;
  const hash = createHash('sha1').update(input).digest('hex');
  return `SAPISIDHASH ${timestamp}_${hash}`;
}

function extractBalancedJson(html: string, marker: string) {
  const markerIndex = html.indexOf(marker);
  if (markerIndex === -1) return null;

  const start = html.indexOf('{', markerIndex);
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < html.length; index += 1) {
    const char = html[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === '{') {
      depth += 1;
      continue;
    }
    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(start, index + 1)) as unknown;
        } catch {
          return null;
        }
      }
    }
  }

  return null;
}

function matchString(html: string, pattern: RegExp) {
  return pattern.exec(html)?.[1] ?? null;
}

function looksSignedOut(html: string) {
  return html.includes('Sign in') && html.includes('accounts.google.com');
}

function extractAccountName(node: unknown): string | null {
  const values = collectTextMatches(node, (text) => text.length > 0 && !text.startsWith('Your'));
  return values.find((value) => /channel|account/i.test(value) === false) ?? null;
}

function collectPlaylistItems(node: unknown) {
  const results = new Map<string, Playlist>();

  walk(node, (value) => {
    if (!value || typeof value !== 'object') return;
    const record = value as Record<string, unknown>;

    if (record.gridPlaylistRenderer && typeof record.gridPlaylistRenderer === 'object') {
      const playlist = mapGridPlaylist(record.gridPlaylistRenderer as Record<string, unknown>);
      if (playlist) results.set(playlist.playlistId, playlist);
    }
    if (record.playlistRenderer && typeof record.playlistRenderer === 'object') {
      const playlist = mapSimplePlaylist(record.playlistRenderer as Record<string, unknown>);
      if (playlist) results.set(playlist.playlistId, playlist);
    }
    if (record.lockupViewModel && typeof record.lockupViewModel === 'object') {
      const playlist = mapLockupPlaylist(record.lockupViewModel as Record<string, unknown>);
      if (playlist) results.set(playlist.playlistId, playlist);
    }
  });

  return [...results.values()];
}

function collectPlaylistVideoItems(node: unknown, playlistId: string) {
  const results: PlaylistVideo[] = [];

  walk(node, (value) => {
    if (!value || typeof value !== 'object') return;
    const record = value as Record<string, unknown>;
    if (record.playlistVideoRenderer && typeof record.playlistVideoRenderer === 'object') {
      const video = mapPlaylistVideo(record.playlistVideoRenderer as Record<string, unknown>, playlistId);
      if (video) results.push(video);
    }
  });

  return results;
}

function mapGridPlaylist(renderer: Record<string, unknown>): Playlist | null {
  const playlistId = toStringValue(renderer.playlistId);
  if (!playlistId) return null;

  return {
    playlistId,
    title: getText(renderer.title) || 'Untitled playlist',
    description: getText(renderer.description),
    videoCount: getCount(renderer.videoCountText) ?? getCount(renderer.thumbnailText) ?? 0,
    lastSyncedAt: new Date().toISOString(),
    thumbnailUrl: getThumbnailUrl(renderer.thumbnail),
    status: 'loaded',
  };
}

function mapSimplePlaylist(renderer: Record<string, unknown>): Playlist | null {
  const playlistId = toStringValue(renderer.playlistId);
  if (!playlistId) return null;

  return {
    playlistId,
    title: getText(renderer.title) || 'Untitled playlist',
    description: getText(renderer.descriptionSnippet),
    videoCount: getCount(renderer.videoCountText) ?? 0,
    lastSyncedAt: new Date().toISOString(),
    thumbnailUrl: getThumbnailUrl(renderer.thumbnails ?? renderer.thumbnail),
    status: 'loaded',
  };
}

function mapLockupPlaylist(renderer: Record<string, unknown>): Playlist | null {
  const playlistId =
    toStringValue(renderer.contentId) ??
    toStringValue((renderer.navigationEndpoint as Record<string, unknown> | undefined)?.browseEndpoint && (renderer.navigationEndpoint as Record<string, unknown>).browseEndpoint as Record<string, unknown>) ??
    null;
  if (!playlistId) return null;

  const metadata = renderer.metadata && typeof renderer.metadata === 'object'
    ? (renderer.metadata as Record<string, unknown>).lockupMetadataViewModel as Record<string, unknown> | undefined
    : undefined;

  return {
    playlistId,
    title: toStringValue(metadata?.title && typeof metadata.title === 'object' ? (metadata.title as Record<string, unknown>).content : undefined) || getText(renderer.title) || 'Untitled playlist',
    description: undefined,
    videoCount: getCount(metadata?.metadataRows) ?? 0,
    lastSyncedAt: new Date().toISOString(),
    thumbnailUrl: getThumbnailUrl(renderer.contentImage ?? renderer.thumbnail),
    status: 'loaded',
  };
}

function mapPlaylistVideo(renderer: Record<string, unknown>, playlistId: string): PlaylistVideo | null {
  const videoId =
    toStringValue(renderer.videoId) ??
    toStringValue((renderer.navigationEndpoint as Record<string, unknown> | undefined)?.watchEndpoint && ((renderer.navigationEndpoint as Record<string, unknown>).watchEndpoint as Record<string, unknown>).videoId) ??
    '';
  const playlistItemId =
    toStringValue(renderer.setVideoId) ??
    toStringValue((renderer.navigationEndpoint as Record<string, unknown> | undefined)?.watchEndpoint && ((renderer.navigationEndpoint as Record<string, unknown>).watchEndpoint as Record<string, unknown>).playlistId) ??
    videoId;

  if (!playlistItemId && !videoId) return null;

  const title = getText(renderer.title) || getFallbackUnavailableTitle(renderer);
  const channelTitle = getText(renderer.shortBylineText) || 'Unknown';
  const channelId = toStringValue(
    (renderer.shortBylineText as Record<string, unknown> | undefined)?.runs &&
      Array.isArray((renderer.shortBylineText as Record<string, unknown>).runs)
      ? ((((renderer.shortBylineText as Record<string, unknown>).runs as Array<Record<string, unknown>>)[0]?.navigationEndpoint as Record<string, unknown> | undefined)?.browseEndpoint as Record<string, unknown> | undefined)?.browseId
      : undefined,
  );
  const duration = getText(renderer.lengthText) || 'Unknown';
  const status = getVideoStatus(renderer, title);

  return {
    playlistId,
    playlistItemId: playlistItemId || videoId || `missing-${Date.now()}`,
    videoId: videoId || '',
    title,
    channelTitle,
    channelId: channelId || undefined,
    duration,
    addedAt: '',
    position: 0,
    status,
    thumbnailUrl: getThumbnailUrl(renderer.thumbnail),
    videoUrl: videoId ? `${YOUTUBE_ORIGIN}/watch?v=${encodeURIComponent(videoId)}&list=${encodeURIComponent(playlistId)}` : undefined,
  };
}

function getVideoStatus(renderer: Record<string, unknown>, title: string): PlaylistVideoStatus {
  const lowered = title.toLowerCase();
  if (renderer.isPlayable === false) {
    if (lowered.includes('private')) return 'private';
    if (lowered.includes('deleted')) return 'deleted';
    return 'unavailable';
  }
  if (lowered.includes('unlisted')) return 'unlisted';
  return 'public';
}

function getFallbackUnavailableTitle(renderer: Record<string, unknown>) {
  const text = getText(renderer.titleOverlay) || getText(renderer.thumbnailOverlays);
  return text || 'Unavailable video';
}

function extractContinuationTokens(node: unknown) {
  const tokens = new Set<string>();
  walk(node, (value) => {
    if (!value || typeof value !== 'object') return;
    const record = value as Record<string, unknown>;
    const token =
      toStringValue((record.continuationCommand as Record<string, unknown> | undefined)?.token) ??
      toStringValue(
        ((record.continuationEndpoint as Record<string, unknown> | undefined)?.continuationCommand as Record<string, unknown> | undefined)?.token,
      ) ??
      toStringValue(
        ((record.continuationItemRenderer as Record<string, unknown> | undefined)?.continuationEndpoint as Record<string, unknown> | undefined)?.continuationCommand &&
          (((record.continuationItemRenderer as Record<string, unknown>).continuationEndpoint as Record<string, unknown>).continuationCommand as Record<string, unknown>).token,
      );
    if (token) tokens.add(token);
  });
  return [...tokens];
}

function collectTextMatches(node: unknown, predicate: (text: string) => boolean) {
  const values = new Set<string>();
  walk(node, (value) => {
    if (typeof value === 'string' && predicate(value)) {
      values.add(value.trim());
    }
  });
  return [...values];
}

function walk(node: unknown, visitor: (node: unknown) => void) {
  visitor(node);
  if (Array.isArray(node)) {
    node.forEach((item) => walk(item, visitor));
    return;
  }
  if (node && typeof node === 'object') {
    Object.values(node as Record<string, unknown>).forEach((value) => walk(value, visitor));
  }
}

function getText(node: unknown): string {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map((item) => getText(item)).filter(Boolean).join(' ').trim();
  if (typeof node === 'object') {
    const record = node as Record<string, unknown>;
    if (typeof record.simpleText === 'string') return record.simpleText;
    if (typeof record.text === 'string') return record.text;
    if (typeof record.content === 'string') return record.content;
    if (Array.isArray(record.runs)) {
      return (record.runs as Array<Record<string, unknown>>)
        .map((run) => getText(run.text ?? run))
        .filter(Boolean)
        .join('')
        .trim();
    }
    if (Array.isArray(record.metadataParts)) {
      return getText(record.metadataParts);
    }
    if (Array.isArray(record.metadataRows)) {
      return getText(record.metadataRows);
    }
  }
  return '';
}

function getCount(node: unknown): number | null {
  const text = getText(node);
  const match = text.match(/(\d[\d,]*)/);
  return match ? Number(match[1].replace(/,/g, '')) : null;
}

function getThumbnailUrl(node: unknown): string | undefined {
  if (!node) return undefined;
  if (Array.isArray(node)) {
    return node.map(getThumbnailUrl).find(Boolean);
  }
  if (typeof node === 'object') {
    const record = node as Record<string, unknown>;
    if (Array.isArray(record.thumbnails)) {
      const thumbnails = record.thumbnails as Array<Record<string, unknown>>;
      return thumbnails[thumbnails.length - 1]?.url as string | undefined;
    }
    if (Array.isArray(record.sources)) {
      const sources = record.sources as Array<Record<string, unknown>>;
      return sources[sources.length - 1]?.url as string | undefined;
    }
    return Object.values(record).map(getThumbnailUrl).find(Boolean);
  }
  return undefined;
}

function toStringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}
