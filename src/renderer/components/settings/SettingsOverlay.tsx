import { Settings, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { SettingsTabId } from '@shared/settings';
import { useSettings } from '../../contexts/settingsContextValue';
import { SettingsPanel } from './SettingsPanel';
import { SettingsSidebar } from './SettingsSidebar';
import { AboutSettings } from './tabs/AboutSettings';
import { AdvancedSettings } from './tabs/AdvancedSettings';
import { GeneralSettings } from './tabs/GeneralSettings';
import { QueueHistorySettings } from './tabs/QueueHistorySettings';
import { SafetyBackupsSettings } from './tabs/SafetyBackupsSettings';

type OverlayDialog =
  | { type: 'message'; title: string; description: string }
  | { type: 'resetSettings' };

export function SettingsOverlay({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<SettingsTabId>('general');
  const [dialog, setDialog] = useState<OverlayDialog | null>(null);
  const { resetSettings } = useSettings();

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (dialog) {
          setDialog(null);
        } else {
          onClose();
        }
      }
    }

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [dialog, onClose]);

  function showNotImplemented(title: string) {
    setDialog({
      type: 'message',
      title,
      description: 'This setting is present in the mock UI but is not wired to real app behavior yet.',
    });
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-shell-950/58 px-5 py-7 backdrop-blur-md"
      onMouseDown={onClose}
    >
      <div
        className="flex h-[min(760px,calc(100vh-56px))] w-[min(940px,calc(100vw-56px))] flex-col overflow-hidden rounded-xl border border-white/[0.13] bg-shell-900/88 shadow-[0_24px_90px_rgba(0,0,0,0.52),0_0_50px_rgba(59,130,246,0.10)] backdrop-blur-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex h-[70px] shrink-0 items-center justify-between border-b border-white/[0.08] px-7">
          <div className="flex items-center gap-3">
            <Settings size={22} className="text-mist-100" />
            <h2 className="text-xl font-bold tracking-[-0.025em] text-mist-50">Settings</h2>
          </div>
          <button
            aria-label="Close settings"
            className="rounded-lg p-2 text-mist-300 transition hover:bg-white/[0.07] hover:text-white"
            onClick={onClose}
            type="button"
          >
            <X size={22} />
          </button>
        </header>

        <div className="flex min-h-0 flex-1">
          <SettingsSidebar activeTab={activeTab} onSelectTab={setActiveTab} />
          <SettingsPanel>
            {activeTab === 'general' && <GeneralSettings />}
            {activeTab === 'queueHistory' && <QueueHistorySettings />}
            {activeTab === 'safetyBackups' && (
              <SafetyBackupsSettings onNotImplemented={showNotImplemented} />
            )}
            {activeTab === 'advanced' && (
              <AdvancedSettings
                onNotImplemented={showNotImplemented}
                onResetSettings={() => setDialog({ type: 'resetSettings' })}
              />
            )}
            {activeTab === 'about' && <AboutSettings onNotImplemented={showNotImplemented} />}
          </SettingsPanel>
        </div>
      </div>

      {dialog && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-shell-950/30 px-5 backdrop-blur-[2px]"
          onMouseDown={() => setDialog(null)}
        >
          <div
            className="w-full max-w-[420px] rounded-xl border border-white/[0.12] bg-shell-900/96 p-5 shadow-glow"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-mist-50">
                  {dialog.type === 'resetSettings' ? 'Reset settings?' : dialog.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-mist-400">
                  {dialog.type === 'resetSettings'
                    ? 'This resets the in-memory Settings panel values to their defaults. Mock playlist, queue, and history data are not reset yet.'
                    : dialog.description}
                </p>
              </div>
              <button
                aria-label="Close popup"
                className="rounded-md p-1.5 text-mist-500 transition hover:bg-white/[0.07] hover:text-mist-100"
                onClick={() => setDialog(null)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              {dialog.type === 'resetSettings' ? (
                <>
                  <button
                    className="rounded-md border border-white/[0.10] bg-white/[0.04] px-4 py-2 text-sm text-mist-200 transition hover:bg-white/[0.08]"
                    onClick={() => setDialog(null)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="rounded-md bg-red-500/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
                    onClick={() => {
                      resetSettings();
                      setDialog(null);
                    }}
                    type="button"
                  >
                    Reset settings
                  </button>
                </>
              ) : (
                <button
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                  onClick={() => setDialog(null)}
                  type="button"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
