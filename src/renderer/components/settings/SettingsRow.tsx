import type { ReactNode } from 'react';

export function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-mist-50">{title}</h3>
      <div className="overflow-visible rounded-lg border border-white/[0.08] bg-shell-950/28">
        {children}
      </div>
    </section>
  );
}

export function SettingsRow({
  label,
  description,
  control,
}: {
  label: string;
  description?: string;
  control: ReactNode;
}) {
  return (
    <div className="flex min-h-[48px] items-center justify-between gap-5 border-b border-white/[0.055] px-3 py-3 last:border-b-0">
      <div className="min-w-0">
        <div className="text-sm font-medium text-mist-100">{label}</div>
        {description && <div className="mt-1 text-xs leading-5 text-mist-500">{description}</div>}
      </div>
      <div className="w-[240px] shrink-0">{control}</div>
    </div>
  );
}

export function SettingsButton({
  children,
  danger = false,
  disabled = false,
  onClick,
}: {
  children: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`h-10 w-full rounded-md border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${
        danger
          ? 'border-red-300/20 bg-red-500/15 text-red-100 hover:bg-red-500/24'
          : 'border-white/[0.10] bg-white/[0.045] text-mist-100 hover:bg-white/[0.08]'
      }`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
