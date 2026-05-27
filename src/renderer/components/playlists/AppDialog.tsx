import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSettings } from '../../contexts/settingsContextValue';
import { buildPopupBackdropStyle, buildPopupModalStyle } from '../../utils/overlayVisualStyles';
import { OverlayTuningPanel, type OverlayTuningPanelState } from '../settings/OverlayTuningPanel';

export type DialogActionVariant = 'primary' | 'danger' | 'secondary';

export interface DialogAction {
  label: string;
  variant?: DialogActionVariant;
  disabled?: boolean;
  onClick: () => void;
}

export function AppDialog({
  title,
  description,
  inputLabel,
  inputValue,
  inputPlaceholder,
  actions,
  onInputChange,
  onClose,
  onSubmit,
}: {
  title: string;
  description?: string;
  inputLabel?: string;
  inputValue?: string;
  inputPlaceholder?: string;
  actions: DialogAction[];
  onInputChange?: (value: string) => void;
  onClose: () => void;
  onSubmit?: () => void;
}) {
  const { settings } = useSettings();
  const [tuningPanel, setTuningPanel] = useState<OverlayTuningPanelState | null>(null);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && tuningPanel) {
        setTuningPanel(null);
      } else if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose, tuningPanel]);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-5" style={buildPopupBackdropStyle(settings.popupVisuals)}>
      <form
        className="w-full max-w-[440px] rounded-xl border p-5"
        style={buildPopupModalStyle(settings.popupVisuals)}
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit?.();
        }}
      >
        <div
          className="flex items-start gap-4"
          onContextMenu={(event) => {
            if (!settings.enableOverlayVisualTuning) return;
            event.preventDefault();
            setTuningPanel({ kind: 'popup', x: event.clientX, y: event.clientY });
          }}
        >
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-mist-50">{title}</h2>
            {description && <p className="mt-2 whitespace-pre-line text-sm leading-6 text-mist-400">{description}</p>}
          </div>
          <button
            aria-label="Close popup"
            className="rounded-md p-1.5 text-mist-500 transition hover:bg-white/[0.07] hover:text-mist-100"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {inputLabel && (
          <label className="mt-5 block text-sm text-mist-300">
            {inputLabel}
            <input
              autoFocus
              className="mt-2 h-10 w-full rounded-md border border-white/[0.10] bg-shell-950/70 px-3 text-sm text-mist-50 outline-none transition placeholder:text-mist-600 focus:border-blue-400/60"
              placeholder={inputPlaceholder}
              value={inputValue ?? ''}
              onChange={(event) => onInputChange?.(event.target.value)}
            />
          </label>
        )}

        <div className="mt-6 flex justify-end gap-3">
          {actions.map((action) => (
            <button
              key={action.label}
              className={getActionClass(action.variant)}
              disabled={action.disabled}
              onClick={action.onClick}
              type="button"
            >
              {action.label}
            </button>
          ))}
        </div>
      </form>
      {tuningPanel && <OverlayTuningPanel panel={tuningPanel} onClose={() => setTuningPanel(null)} />}
    </div>
  );
}

function getActionClass(variant: DialogActionVariant = 'secondary') {
  if (variant === 'danger') {
    return 'rounded-md bg-red-500/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-45';
  }

  if (variant === 'primary') {
    return 'rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-45';
  }

  return 'rounded-md border border-white/[0.10] bg-white/[0.04] px-4 py-2 text-sm text-mist-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-45';
}
