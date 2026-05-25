import { ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

export interface DropdownOption<T extends string | number> {
  label: string;
  value: T;
}

export function DropdownButton<T extends string | number>({
  label,
  options,
  value,
  onSelect,
  className = '',
  placement = 'bottom',
}: {
  label: string;
  options: DropdownOption<T>[];
  value: T;
  onSelect: (value: T) => void;
  className?: string;
  placement?: 'bottom' | 'top';
}) {
  const [open, setOpen] = useState(false);
  const dropdownId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOnOutsidePointer(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    function closeWhenAnotherOpens(event: Event) {
      const nextId = (event as CustomEvent<string>).detail;
      if (nextId !== dropdownId) {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);
    window.addEventListener('playlist-manager-dropdown-open', closeWhenAnotherOpens);

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('playlist-manager-dropdown-open', closeWhenAnotherOpens);
    };
  }, [dropdownId]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      data-dropdown-open={open ? 'true' : 'false'}
      data-dropdown-root
    >
      <button
        className="flex h-10 w-full items-center justify-between gap-3 rounded-md border border-white/[0.09] bg-white/[0.035] px-4 text-sm text-mist-200 transition hover:bg-white/[0.07]"
        onClick={() => {
          setOpen((current) => {
            const nextOpen = !current;
            if (nextOpen) {
              window.dispatchEvent(new CustomEvent('playlist-manager-dropdown-open', { detail: dropdownId }));
            }
            return nextOpen;
          });
        }}
      >
        <span className="truncate">{label}</span>
        <ChevronDown size={16} className="shrink-0 text-mist-500" />
      </button>
      {open && (
        <div
          className={`absolute right-0 z-50 min-w-full overflow-hidden rounded-md border border-white/[0.09] bg-shell-900/95 shadow-glow backdrop-blur-xl ${
            placement === 'top' ? 'bottom-11' : 'top-11'
          }`}
        >
          {options.map((option) => (
            <button
              key={option.value}
              className={`block w-full whitespace-nowrap px-4 py-2.5 text-left text-sm transition hover:bg-white/[0.06] ${
                option.value === value ? 'text-blue-300' : 'text-mist-200'
              }`}
              onClick={() => {
                onSelect(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
