import { writeFileSync } from 'node:fs';
import type { AppResult, Playlist, PlaylistVideo, QueueOperation } from '../../shared/appTypes';
import type { PlaylistExportRequest, PlaylistVideosRequest } from '../../shared/ipc';
import { SessionService } from './sessionService';
import { StorageService } from './storageService';
import { YouTubeClient } from './youtubeClient';

export class YouTubeService {
  private readonly playlistCache = new Map<string, Playlist>();
  private readonly playlistVideosCache = new Map<string, PlaylistVideo[]>();

  constructor(
    private readonly sessionService = new SessionService(),
    private readonly storageService = new StorageService(),
    private readonly youtubeClient = new YouTubeClient(),
  ) {}

  async listPlaylists(): Promise<AppResult<Playlist[]>> {
    const cookies = this.sessionService.getStoredCookies();
    const result = await this.youtubeClient.listPlaylists(cookies);
    if (result.ok) {
      this.playlistCache.clear();
      result.data.forEach((playlist) => this.playlistCache.set(playlist.playlistId, playlist));
      this.log(`Loaded ${result.data.length} playlists.`);
    } else {
      this.log(`Playlist list failed: ${result.error}`);
    }
    return result;
  }

  async getPlaylistVideos(request: PlaylistVideosRequest): Promise<AppResult<PlaylistVideo[]>> {
    const cookies = this.sessionService.getStoredCookies();
    const result = await this.youtubeClient.getPlaylistVideos(cookies, request.playlistId);
    if (result.ok) {
      this.playlistVideosCache.set(request.playlistId, result.data);
      this.log(`Loaded ${result.data.length} playlist videos for ${request.playlistId}.`);
    } else {
      this.log(`Playlist videos failed for ${request.playlistId}: ${result.error}`);
    }
    return result;
  }

  async refreshPlaylist(request: PlaylistVideosRequest): Promise<AppResult<Playlist>> {
    const playlistResult = await this.listPlaylists();
    if (!playlistResult.ok) return playlistResult;

    const videoResult = await this.getPlaylistVideos(request);
    if (!videoResult.ok) {
      const cached = this.playlistCache.get(request.playlistId);
      return cached
        ? { ok: true, data: cached }
        : { ok: false, error: videoResult.error, code: videoResult.code };
    }

    const refreshed = this.playlistCache.get(request.playlistId);
    return refreshed
      ? { ok: true, data: refreshed }
      : { ok: false, error: 'Playlist was refreshed but could not be found.', code: 'PLAYLIST_NOT_FOUND' };
  }

  async checkSession() {
    return this.sessionService.refresh();
  }

  async exportPlaylistData(request: PlaylistExportRequest): Promise<AppResult<{ outputPath: string }>> {
    const playlist =
      this.playlistCache.get(request.playlistId) ??
      (await this.listPlaylists()).ok
        ? this.playlistCache.get(request.playlistId)
        : undefined;
    if (!playlist) {
      return { ok: false, error: 'Playlist must be loaded before export.', code: 'PLAYLIST_NOT_LOADED' };
    }

    let videos = this.playlistVideosCache.get(request.playlistId);
    if (!videos) {
      const loadResult = await this.getPlaylistVideos({ playlistId: request.playlistId });
      if (!loadResult.ok) return loadResult;
      videos = loadResult.data;
    }

    const outputPathResult = request.outputPath
      ? { ok: true as const, data: request.outputPath }
      : this.storageService.getDefaultExportPath(`${playlist.title}.json`);
    if (!outputPathResult.ok) return outputPathResult;

    writeFileSync(
      outputPathResult.data,
      JSON.stringify(
        {
          playlistId: playlist.playlistId,
          playlistTitle: playlist.title,
          exportedAt: new Date().toISOString(),
          videos: videos.map((video) => ({
            playlistId: video.playlistId,
            playlistItemId: video.playlistItemId,
            videoId: video.videoId,
            title: video.title,
            channelTitle: video.channelTitle,
            duration: video.duration,
            status: video.status,
            position: video.position,
            thumbnailUrl: video.thumbnailUrl,
            videoUrl: video.videoUrl,
          })),
        },
        null,
        2,
      ),
      'utf8',
    );

    this.log(`Exported playlist ${request.playlistId} to ${outputPathResult.data}.`);
    return { ok: true, data: { outputPath: outputPathResult.data } };
  }

  copyVideos(): AppResult<QueueOperation> {
    return notImplemented('Copying videos');
  }

  moveVideos(): AppResult<QueueOperation> {
    return notImplemented('Moving videos');
  }

  removeVideos(): AppResult<QueueOperation> {
    return notImplemented('Removing videos');
  }

  deletePlaylist(): AppResult<QueueOperation> {
    return notImplemented('Deleting playlists');
  }

  reorderPlaylist(): AppResult<QueueOperation> {
    return notImplemented('Reordering playlists');
  }

  private log(message: string) {
    console.info(`[youtube] ${message}`);
    void this.storageService.appendLogLine(`[youtube] ${message}`);
  }
}

const notImplemented = <T>(feature: string): AppResult<T> => ({
  ok: false,
  error: `${feature} is not implemented yet.`,
  code: 'NOT_IMPLEMENTED',
});
