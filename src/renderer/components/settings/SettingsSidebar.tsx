import { Braces, Clock3, Info, Settings, ShieldCheck } from 'lucide-react';
import type { SettingsTabId } from '@shared/settings';

const tabs: Array<{
  id: SettingsTabId;
  label: string;
  Icon: typeof Settings;
}> = [
  { id: 'general', label: 'General', Icon: Settings },
  { id: 'queueHistory', label: 'Queue & History', Icon: Clock3 },
  { id: 'safetyBackups', label: 'Safety & Backups', Icon: ShieldCheck },
  { id: 'advanced', label: 'Advanced', Icon: Braces },
  { id: 'about', label: 'About', Icon: Info },
];

export function SettingsSidebar({
  activeTab,
  onSelectTab,
}: {
  activeTab: SettingsTabId;
  onSelectTab: (tab: SettingsTabId) => void;
}) {
  return (
    <nav className="w-[230px] shrink-0 border-r border-white/[0.08] p-3">
      <div className="space-y-2">
        {tabs.map(({ id, label, Icon }) => {
          const active = id === activeTab;
          return (
            <button
              key={id}
              className={`relative flex h-12 w-full items-center gap-3 overflow-hidden rounded-lg px-4 text-left text-sm font-semibold transition ${
                active
                  ? 'text-mist-50'
                  : 'text-mist-400 hover:bg-white/[0.045] hover:text-mist-100'
              }`}
              onClick={() => onSelectTab(id)}
              type="button"
            >
              {active && (
                <>
                  <span className="pointer-events-none absolute inset-y-1 left-0 w-1 rounded-r-full bg-blue-400" />
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/28 via-blue-500/12 to-transparent" />
                </>
              )}
              <Icon className={`relative z-10 ${active ? 'text-sky-300' : 'text-mist-500'}`} size={20} />
              <span className="relative z-10">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
