import { CircleHelp, Minus, Settings, X } from 'lucide-react';
import type { CSSProperties } from 'react';

export function TitleBar({ onOpenSettings }: { onOpenSettings: () => void }) {
  const noDragStyle = { WebkitAppRegion: 'no-drag', appRegion: 'no-drag' } as CSSProperties & {
    appRegion: string;
  };
  const dragStyle = { WebkitAppRegion: 'drag', appRegion: 'drag' } as CSSProperties & {
    appRegion: string;
  };
  const runWindowControl = async (action: 'minimize' | 'close') => {
    const controls = window.windowControls;

    if (!controls?.ready) {
      console.warn(`Window controls bridge is unavailable; cannot ${action} window.`);
      return;
    }

    try {
      const ready = await controls.ping();
      if (!ready) {
        console.warn(`Window controls bridge responded, but no BrowserWindow was resolved for ${action}.`);
        return;
      }
      const success = await controls[action]();
      if (!success) {
        console.warn(`Window ${action} IPC returned false.`);
      }
    } catch (error) {
      console.warn(`Window ${action} IPC failed.`, error);
    }
  };

  return (
    <header
      className="drag-region flex h-14 shrink-0 items-center justify-between border-b border-white/[0.08] bg-shell-950/80 px-7 backdrop-blur-xl"
      style={dragStyle}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-700 shadow-lg shadow-red-950/50">
          <span className="ml-0.5 h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-white" />
        </div>
        <span className="text-[17px] font-semibold tracking-[-0.01em] text-mist-50">
          YT Playlist Manager
        </span>
      </div>

      <div className="no-drag flex items-center gap-4 text-sm" style={noDragStyle}>
        <button
          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-mist-200 transition hover:bg-white/7 hover:text-white"
          onClick={onOpenSettings}
          type="button"
        >
          <Settings size={18} />
          Settings
        </button>
        <div className="h-6 w-px bg-white/10" />
        <button className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-mist-200 transition hover:bg-white/7 hover:text-white">
          <CircleHelp size={18} />
          Help
        </button>
        <div className="no-drag ml-4 flex items-center gap-1 text-mist-400" style={noDragStyle}>
          <button
            aria-label="Minimize window"
            className="no-drag rounded-md p-2 transition hover:bg-white/7 hover:text-white"
            onClick={() => void runWindowControl('minimize')}
            onMouseDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            style={noDragStyle}
            type="button"
          >
            <Minus size={18} />
          </button>
          <button
            aria-label="Close window"
            className="no-drag rounded-md p-2 transition hover:bg-red-500/20 hover:text-red-100"
            onClick={() => void runWindowControl('close')}
            onMouseDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            style={noDragStyle}
            type="button"
          >
            <X size={19} />
          </button>
        </div>
      </div>
    </header>
  );
}
