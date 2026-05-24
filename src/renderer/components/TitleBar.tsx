import { CircleHelp, Minus, Settings, Square, X } from 'lucide-react';

export function TitleBar() {
  return (
    <header className="drag-region flex h-14 shrink-0 items-center justify-between border-b border-white/[0.08] bg-shell-950/80 px-7 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-700 shadow-lg shadow-red-950/50">
          <span className="ml-0.5 h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-white" />
        </div>
        <span className="text-[17px] font-semibold tracking-[-0.01em] text-mist-50">
          YT Playlist Manager
        </span>
      </div>

      <div className="no-drag flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2 rounded-md border border-emerald-400/10 bg-emerald-400/10 px-3 py-1.5 text-emerald-300">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.65)]" />
          Session connected
        </div>
        <button className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-mist-200 transition hover:bg-white/7 hover:text-white">
          <Settings size={18} />
          Settings
        </button>
        <div className="h-6 w-px bg-white/10" />
        <button className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-mist-200 transition hover:bg-white/7 hover:text-white">
          <CircleHelp size={18} />
          Help
        </button>
        <div className="ml-4 flex items-center gap-2 text-mist-400">
          <button
            aria-label="Minimize window"
            className="rounded-md p-2 transition hover:bg-white/7 hover:text-white"
            onClick={() => window.windowControls?.minimize()}
          >
            <Minus size={18} />
          </button>
          <button
            aria-label="Maximize window"
            className="rounded-md p-2 transition hover:bg-white/7 hover:text-white"
            onClick={() => window.windowControls?.toggleMaximize()}
          >
            <Square size={15} />
          </button>
          <button
            aria-label="Close window"
            className="rounded-md p-2 transition hover:bg-red-500/20 hover:text-red-100"
            onClick={() => window.windowControls?.close()}
          >
            <X size={19} />
          </button>
        </div>
      </div>
    </header>
  );
}
