import { Download, FolderOpen, ListMusic } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PlaylistViewRecord } from '@shared/playlistMockData';
import { PopupModalFrame } from '../modals/PopupModalFrame';

export function ExportPlaylistPopup({
  playlist,
  onClose,
}: {
  playlist: PlaylistViewRecord;
  onClose: () => void;
}) {
  const [path, setPath] = useState(`C:\\Users\\Julie\\Documents\\Playlists\\${playlist.title}.json`);
  const [browsePending, setBrowsePending] = useState(false);

  useEffect(() => {
    setPath(`C:\\Users\\Julie\\Documents\\Playlists\\${playlist.title}.json`);
  }, [playlist.title]);

  async function chooseExportPath() {
    if (!window.ytpm?.storage.chooseExportPath) return;

    setBrowsePending(true);
    try {
      const result = await window.ytpm.storage.chooseExportPath({
        defaultFileName: `${playlist.title}.json`,
        defaultPath: path,
      });
      if (result.ok && result.data.filePath) {
        setPath(result.data.filePath);
      }
    } finally {
      setBrowsePending(false);
    }
  }

  return (
    <PopupModalFrame
      title="Export playlist"
      subtitle="Export this playlist as a JSON file."
      maxWidth="max-w-[680px]"
      icon={<div className="flex h-16 w-16 items-center justify-center rounded-full border border-blue-300/30 bg-blue-500/10 text-blue-300"><Download size={32} /></div>}
      footer={
        <div className="flex justify-end gap-3">
          <button className="rounded-lg border border-white/[0.10] bg-white/[0.045] px-5 py-2.5 text-sm font-semibold text-mist-200 transition hover:bg-white/[0.08]" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500" onClick={onClose} type="button">
            <Download size={17} />
            Export
          </button>
        </div>
      }
      onClose={onClose}
    >
      <label className="block text-sm text-mist-300">
        Playlist name
        <div className="mt-2 flex h-12 items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.035] px-4 text-mist-50">
          <ListMusic size={19} className="text-violet-300" />
          {playlist.title}
        </div>
      </label>

      <label className="mt-5 block text-sm text-mist-300">
        Output location
        <div className="mt-2 flex gap-3">
          <input
            className="h-12 min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-white/[0.035] px-4 text-mist-50 outline-none transition focus:border-blue-300/50"
            value={path}
            onChange={(event) => setPath(event.target.value)}
          />
          <button
            className="flex h-12 items-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.045] px-4 font-semibold text-mist-100 transition hover:bg-white/[0.08] disabled:cursor-wait disabled:opacity-70"
            disabled={browsePending}
            onClick={() => void chooseExportPath()}
            type="button"
          >
            <FolderOpen size={18} />
            {browsePending ? 'Opening…' : 'Browse'}
          </button>
        </div>
      </label>
      <p className="mt-3 text-sm text-mist-500">Choose where the exported JSON file will be saved.</p>
    </PopupModalFrame>
  );
}
