import { X } from 'lucide-react';
import { useEffect, useMemo, type CSSProperties } from 'react';
import {
  defaultChildOverlayVisuals,
  defaultOverlayVisuals,
  type ChildOverlayVisualSettings,
  type OverlayVisualSettings,
} from '@shared/settings';
import { useSettings } from '../../contexts/settingsContextValue';

export type OverlayTuningKind = 'main' | 'child';

export interface OverlayTuningPanelState {
  kind: OverlayTuningKind;
  x: number;
  y: number;
}

export function OverlayTuningPanel({
  panel,
  onClose,
}: {
  panel: OverlayTuningPanelState;
  onClose: () => void;
}) {
  const { settings, updateSetting } = useSettings();
  const isChild = panel.kind === 'child';
  const values = isChild ? settings.childOverlayVisuals : settings.overlayVisuals;
  const panelStyle = useMemo<CSSProperties>(
    () => ({
      left: Math.min(panel.x, window.innerWidth - 330),
      top: Math.min(panel.y, window.innerHeight - 470),
    }),
    [panel.x, panel.y],
  );

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  function updateMain<Key extends keyof OverlayVisualSettings>(key: Key, value: OverlayVisualSettings[Key]) {
    updateSetting('overlayVisuals', { ...settings.overlayVisuals, [key]: value });
  }

  function updateChild<Key extends keyof ChildOverlayVisualSettings>(key: Key, value: ChildOverlayVisualSettings[Key]) {
    updateSetting('childOverlayVisuals', { ...settings.childOverlayVisuals, [key]: value });
  }

  async function copyValues() {
    const text = JSON.stringify(values, null, 2);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.prompt('Copy overlay tuning values:', text);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[180]"
      onMouseDown={(event) => {
        event.stopPropagation();
        onClose();
      }}
    >
      <div
        className="fixed w-[310px] rounded-xl border border-white/[0.16] bg-[#06111f]/98 p-4 text-mist-100 shadow-[0_20px_70px_rgba(0,0,0,0.76)] backdrop-blur-xl"
        style={panelStyle}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-blue-100">
              {isChild ? 'Child Window Tuning' : 'Overlay Tuning'}
            </h3>
            <p className="mt-1 text-xs leading-5 text-mist-500">
              {isChild ? 'Manage Session child modals' : 'Settings and Manage Session'}
            </p>
          </div>
          <button
            aria-label="Close tuning panel"
            className="rounded-md p-1.5 text-mist-400 transition hover:bg-white/[0.08] hover:text-white"
            onClick={onClose}
            type="button"
          >
            <X size={17} />
          </button>
        </div>

        <div className="space-y-3">
          {isChild ? (
            <>
              <TuningSlider label="Child modal opacity" min={0.65} max={1} step={0.01} value={settings.childOverlayVisuals.childModalOpacity} onChange={(value) => updateChild('childModalOpacity', value)} />
              <TuningSlider label="Parent blur while child is open" min={0} max={18} step={1} suffix="px" value={settings.childOverlayVisuals.parentBlurPx} onChange={(value) => updateChild('parentBlurPx', value)} />
              <TuningSlider label="Parent dim while child is open" min={0} max={0.75} step={0.01} value={settings.childOverlayVisuals.parentDimOpacity} onChange={(value) => updateChild('parentDimOpacity', value)} />
              <TuningSlider label="Child modal shadow strength" min={0} max={2.5} step={0.05} value={settings.childOverlayVisuals.childModalShadowStrength} onChange={(value) => updateChild('childModalShadowStrength', value)} />
              <TuningSlider label="Child modal border brightness" min={0.04} max={0.42} step={0.01} value={settings.childOverlayVisuals.childModalBorderBrightness} onChange={(value) => updateChild('childModalBorderBrightness', value)} />
              <TuningSlider label="Child modal scale" min={0.95} max={1.05} step={0.005} value={settings.childOverlayVisuals.childModalScale} onChange={(value) => updateChild('childModalScale', value)} />
            </>
          ) : (
            <>
              <TuningSlider label="Background opacity" min={0.25} max={0.9} step={0.01} value={settings.overlayVisuals.backgroundOpacity} onChange={(value) => updateMain('backgroundOpacity', value)} />
              <TuningSlider label="Background blur" min={0} max={24} step={1} suffix="px" value={settings.overlayVisuals.backgroundBlurPx} onChange={(value) => updateMain('backgroundBlurPx', value)} />
              <TuningSlider label="Glow strength" min={0} max={2.5} step={0.05} value={settings.overlayVisuals.glowStrength} onChange={(value) => updateMain('glowStrength', value)} />
              <TuningSlider label="Glow spread" min={0.55} max={1.65} step={0.01} value={settings.overlayVisuals.glowSpread} onChange={(value) => updateMain('glowSpread', value)} />
              <TuningSlider label="Modal opacity" min={0.55} max={1} step={0.01} value={settings.overlayVisuals.modalOpacity} onChange={(value) => updateMain('modalOpacity', value)} />
              <TuningSlider label="Modal shadow strength" min={0} max={2.5} step={0.05} value={settings.overlayVisuals.modalShadowStrength} onChange={(value) => updateMain('modalShadowStrength', value)} />
              <TuningSlider label="Modal border brightness" min={0.04} max={0.38} step={0.01} value={settings.overlayVisuals.modalBorderBrightness} onChange={(value) => updateMain('modalBorderBrightness', value)} />
            </>
          )}
        </div>

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button className="rounded-md border border-white/[0.10] bg-white/[0.045] px-3 py-2 text-xs font-semibold text-mist-200 transition hover:bg-white/[0.08]" onClick={() => updateSetting(isChild ? 'childOverlayVisuals' : 'overlayVisuals', isChild ? defaultChildOverlayVisuals : defaultOverlayVisuals)} type="button">
            {isChild ? 'Reset child defaults' : 'Reset overlay defaults'}
          </button>
          <button className="rounded-md border border-white/[0.10] bg-white/[0.045] px-3 py-2 text-xs font-semibold text-mist-200 transition hover:bg-white/[0.08]" onClick={copyValues} type="button">
            Copy values
          </button>
          <button className="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-500" onClick={onClose} type="button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function TuningSlider({
  label,
  min,
  max,
  step,
  value,
  suffix = '',
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-3 text-xs text-mist-300">
        <span>{label}</span>
        <span className="font-semibold text-mist-100">{formatValue(value, suffix)}</span>
      </span>
      <input
        className="mt-1.5 w-full accent-blue-500"
        max={max}
        min={min}
        step={step}
        type="range"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function formatValue(value: number, suffix: string) {
  return `${Number.isInteger(value) ? value : value.toFixed(2)}${suffix}`;
}
