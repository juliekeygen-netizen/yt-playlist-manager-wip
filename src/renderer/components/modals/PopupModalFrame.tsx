import { X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useSettings } from '../../contexts/settingsContextValue';
import {
  buildOverlayBackdropStyle,
  buildOverlayGlowStyle,
  buildOverlayModalStyle,
  buildPopupBackdropStyle,
  buildPopupModalStyle,
} from '../../utils/overlayVisualStyles';
import { OverlayTuningPanel, type OverlayTuningPanelState } from '../settings/OverlayTuningPanel';

export function PopupModalFrame({
  title,
  subtitle,
  icon,
  maxWidth = 'max-w-[620px]',
  children,
  footer,
  tuningGroup = 'popup',
  onClose,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  maxWidth?: string;
  children: ReactNode;
  footer?: ReactNode;
  tuningGroup?: 'main' | 'popup';
  onClose: () => void;
}) {
  const { settings } = useSettings();
  const [tuningPanel, setTuningPanel] = useState<OverlayTuningPanelState | null>(null);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      if (tuningPanel) {
        setTuningPanel(null);
      } else {
        onClose();
      }
    }

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose, tuningPanel]);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center px-5"
      style={tuningGroup === 'main' ? buildOverlayBackdropStyle(settings.overlayVisuals) : buildPopupBackdropStyle(settings.popupVisuals)}
      onMouseDown={onClose}
    >
      {tuningGroup === 'main' && (
        <div className="pointer-events-none absolute inset-0" style={buildOverlayGlowStyle(settings.overlayVisuals)} />
      )}
      <section
        className={`relative z-10 w-full ${maxWidth} overflow-hidden rounded-xl border`}
        style={tuningGroup === 'main' ? buildOverlayModalStyle(settings.overlayVisuals) : buildPopupModalStyle(settings.popupVisuals)}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header
          className="flex items-start gap-4 border-b border-white/[0.08] p-5"
          onContextMenu={(event) => {
            if (!settings.enableOverlayVisualTuning) return;
            event.preventDefault();
            setTuningPanel({ kind: tuningGroup, x: event.clientX, y: event.clientY });
          }}
        >
          {icon}
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold tracking-[-0.035em] text-mist-50">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-mist-300">{subtitle}</p>}
          </div>
          <button
            aria-label={`Close ${title}`}
            className="rounded-lg p-2 text-mist-400 transition hover:bg-white/[0.07] hover:text-white"
            onClick={onClose}
            type="button"
          >
            <X size={22} />
          </button>
        </header>
        <div className="p-5">{children}</div>
        {footer && <footer className="border-t border-white/[0.08] p-5">{footer}</footer>}
      </section>
      {tuningPanel && <OverlayTuningPanel panel={tuningPanel} onClose={() => setTuningPanel(null)} />}
    </div>
  );
}
