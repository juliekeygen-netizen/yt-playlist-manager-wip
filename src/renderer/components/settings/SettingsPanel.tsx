import type { ReactNode } from 'react';

export function SettingsPanel({ children }: { children: ReactNode }) {
  return (
    <div
      className="settings-panel-scroll min-w-0 flex-1 overflow-y-auto p-7"
      data-dropdown-scroll-container
    >
      {children}
    </div>
  );
}
