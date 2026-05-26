export function SettingsToggle({
  checked,
  disabled = false,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      aria-checked={checked}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition ${
        checked
          ? 'border-blue-300/40 bg-blue-500 shadow-[0_0_18px_rgba(59,130,246,0.35)]'
          : 'border-white/[0.12] bg-white/[0.08]'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-white/25'}`}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      role="switch"
      type="button"
    >
      <span
        className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow transition ${
          checked ? 'left-[22px]' : 'left-1'
        }`}
      />
    </button>
  );
}
