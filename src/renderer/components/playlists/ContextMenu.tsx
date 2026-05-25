import { useEffect, useRef } from 'react';

export interface ContextMenuItem {
  label: string;
  destructive?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

export interface ContextMenuState {
  x: number;
  y: number;
  items: ContextMenuItem[];
}

export function ContextMenu({
  menu,
  onClose,
}: {
  menu: ContextMenuState | null;
  onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;

    function closeOnPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        onClose();
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('pointerdown', closeOnPointerDown);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnPointerDown);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [menu, onClose]);

  if (!menu) {
    return null;
  }

  const left = Math.min(menu.x, window.innerWidth - 210);
  const top = Math.min(menu.y, window.innerHeight - menu.items.length * 38 - 18);

  return (
    <div
      ref={menuRef}
      className="fixed z-[80] min-w-[190px] overflow-hidden rounded-lg border border-white/[0.10] bg-shell-900/95 p-1.5 shadow-glow backdrop-blur-xl"
      style={{ left: Math.max(8, left), top: Math.max(8, top) }}
    >
      {menu.items.map((item) => (
        <button
          key={item.label}
          className={`block w-full rounded-md px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-45 ${
            item.destructive
              ? 'text-red-300 hover:bg-red-500/12'
              : 'text-mist-200 hover:bg-white/[0.07] hover:text-white'
          }`}
          disabled={item.disabled}
          onClick={() => {
            if (item.disabled) return;
            item.onSelect();
            onClose();
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
