import type { AppResult, Playlist, PlaylistVideo, QueueOperation } from '../../shared/appTypes';

const notImplemented = <T>(feature: string): AppResult<T> => ({
  ok: false,
  error: `${feature} is not implemented yet.`,
  code: 'NOT_IMPLEMENTED',
});

export class YouTubeService {
  listPlaylists(): AppResult<Playlist[]> {
    return notImplemented('Listing real YouTube playlists');
  }

  getPlaylistVideos(): AppResult<PlaylistVideo[]> {
    return notImplemented('Loading real playlist videos');
  }

  checkSession(): AppResult<{ healthy: boolean }> {
    return notImplemented('Checking a real YouTube session');
  }

  exportPlaylistData(): AppResult<{ outputPath: string }> {
    return notImplemented('Exporting playlist data');
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
}
