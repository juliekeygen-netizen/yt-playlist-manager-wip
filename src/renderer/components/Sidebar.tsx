import { History, Home, ListMusic, RefreshCw, Settings, TimerReset } from 'lucide-react';

const navItems = [
  { label: 'Home', icon: Home, selected: true },
  { label: 'Playlists', icon: ListMusic },
  { label: 'Queue', icon: TimerReset },
  { label: 'History', icon: History },
  { label: 'Settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="flex w-[314px] shrink-0 flex-col border-r border-white/[0.08] bg-shell-950/55 px-4 py-5 backdrop-blur-2xl">
      <section className="panel flex items-center gap-4 rounded-lg p-4">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-violet-600 text-xl font-semibold text-white shadow-lg shadow-blue-950/40">
          TA
          <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-shell-900 bg-emerald-400 text-[10px] text-shell-950">
            ✓
          </span>
        </div>
        <div>
          <p className="font-semibold text-mist-50">YouTube session</p>
          <p className="text-sm font-semibold text-emerald-300">connected</p>
          <p className="mt-1 text-sm text-mist-400">Test account</p>
        </div>
      </section>

      <nav className="mt-7 space-y-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={`flex w-full items-center gap-5 rounded-lg px-5 py-3.5 text-left text-[16px] transition ${
                item.selected
                  ? 'bg-gradient-to-r from-blue-500/25 to-blue-500/8 text-white shadow-[inset_3px_0_0_rgba(96,165,250,1)]'
                  : 'text-mist-400 hover:bg-white/6 hover:text-mist-50'
              }`}
            >
              <Icon size={24} className={item.selected ? 'text-blue-300' : 'text-mist-400'} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-7">
        <section className="panel overflow-hidden rounded-lg">
          <div className="flex items-center justify-between border-b border-white/[0.055] px-4 py-3.5">
            <h2 className="text-sm font-semibold text-mist-50">Session Info</h2>
            <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.7)]" />
          </div>
          <div className="space-y-4 px-4 py-4 text-sm">
            <InfoRow label="Status" value="Connected" accent />
            <InfoRow label="Account" value="Test account" />
            <InfoRow label="Last refreshed" value="1 min ago" />
            <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-4 py-2.5 text-mist-50 transition hover:border-white/20 hover:bg-white/[0.08]">
              <RefreshCw size={16} />
              Refresh Session
            </button>
          </div>
        </section>

        <footer className="border-t border-white/[0.055] px-5 pt-5 text-sm text-mist-500">
          YT Playlist Manager&nbsp;&nbsp; v0.1.0
        </footer>
      </div>
    </aside>
  );
}

function InfoRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-mist-400">{label}</span>
      <span className={accent ? 'text-emerald-300' : 'text-mist-200'}>{value}</span>
    </div>
  );
}
