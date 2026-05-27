import { Settings, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSettings } from '../../contexts/settingsContextValue';
import { buildOverlayBackdropStyle, buildOverlayGlowStyle, buildOverlayModalStyle } from '../../utils/overlayVisualStyles';
import { OverlayTuningPanel, type OverlayTuningPanelState } from './OverlayTuningPanel';
import { SettingsPanel } from './SettingsPanel';
import { SettingsSidebar } from './SettingsSidebar';
import { AboutSettings } from './tabs/AboutSettings';
import { AdvancedSettings } from './tabs/AdvancedSettings';
import { GeneralSettings } from './tabs/GeneralSettings';
import { QueueHistorySettings } from './tabs/QueueHistorySettings';
import { SafetyBackupsSettings } from './tabs/SafetyBackupsSettings';

type OverlayDialog =
  | { type: 'message'; title: string; description: string }
  | { type: 'resetMockData' }
  | { type: 'resetSettings' };

export function SettingsOverlay({
  onClose,
  onResetMockData,
}: {
  onClose: () => void;
  onResetMockData: () => void;
}) {
  const [dialog, setDialog] = useState<OverlayDialog | null>(null);
  const [tuningPanel, setTuningPanel] = useState<OverlayTuningPanelState | null>(null);
  const { activeSettingsTab, resetSettings, setActiveSettingsTab, settings } = useSettings();

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (dialog) {
          setDialog(null);
        } else if (tuningPanel) {
          setTuningPanel(null);
        } else {
          onClose();
        }
      }
    }

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [dialog, onClose, tuningPanel]);

  function showNotImplemented(title: string) {
    setDialog({
      type: 'message',
      title,
      description: 'This setting is present in the mock UI but is not wired to real app behavior yet.',
    });
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center px-5 py-7"
      style={buildOverlayBackdropStyle(settings.overlayVisuals)}
      onMouseDown={onClose}
     >
<div className="pointer-events-none absolute inset-0" style={buildOverlayGlowStyle(settings.overlayVisuals)} />
      <div
        className="relative z-10 flex h-[min(760px,calc(100vh-56px))] w-[min(940px,calc(100vw-56px))] flex-col overflow-hidden rounded-xl border"
        style={buildOverlayModalStyle(settings.overlayVisuals)}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header
          className="flex h-[70px] shrink-0 items-center justify-between border-b border-white/[0.08] px-7"
          onContextMenu={(event) => {
            if (!settings.enableOverlayVisualTuning) return;
            event.preventDefault();
            setTuningPanel({ kind: 'main', x: event.clientX, y: event.clientY });
          }}
        >
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
          <SettingsSidebar activeTab={activeSettingsTab} onSelectTab={setActiveSettingsTab} />
          <SettingsPanel>
            {activeSettingsTab === 'general' && <GeneralSettings />}
            {activeSettingsTab === 'queueHistory' && <QueueHistorySettings />}
            {activeSettingsTab === 'safetyBackups' && (
              <SafetyBackupsSettings onNotImplemented={showNotImplemented} />
            )}
            {activeSettingsTab === 'advanced' && (
              <AdvancedSettings
                onNotImplemented={showNotImplemented}
                onResetMockData={() => setDialog({ type: 'resetMockData' })}
                onResetSettings={() => setDialog({ type: 'resetSettings' })}
              />
            )}
            {activeSettingsTab === 'about' && <AboutSettings onNotImplemented={showNotImplemented} />}
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
                  {dialog.type === 'resetMockData'
                    ? 'Reset mock data?'
                    : dialog.type === 'resetSettings'
                      ? 'Reset settings?'
                      : dialog.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-mist-400">
                  {dialog.type === 'resetMockData'
                    ? 'This resets mock playlist and session state back to the default UI data. Your Settings values and visual tuning are preserved.'
                    : dialog.type === 'resetSettings'
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
              {dialog.type === 'resetMockData' || dialog.type === 'resetSettings' ? (
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
                      if (dialog.type === 'resetMockData') {
                        onResetMockData();
                      } else {
                        resetSettings();
                      }
                      setDialog(null);
                    }}
                    type="button"
                  >
                    {dialog.type === 'resetMockData' ? 'Reset mock data' : 'Reset settings'}
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
      {tuningPanel && <OverlayTuningPanel panel={tuningPanel} onClose={() => setTuningPanel(null)} />}
    </div>
  );
}
