import { ChevronDown } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useRef, useState, type WheelEvent } from 'react';
import { useSettings } from '../../contexts/settingsContextValue';

export interface DropdownOption<T extends string | number> {
  label: string;
  value: T;
  disabled?: boolean;
}

export function DropdownButton<T extends string | number>({
  label,
  options,
  value,
  onSelect,
  className = '',
  placement = 'bottom',
  variant = 'default',
}: {
  label: string;
  options: DropdownOption<T>[];
  value: T;
  onSelect: (value: T) => void;
  className?: string;
  placement?: 'bottom' | 'top';
  variant?: 'default' | 'settings';
}) {
  const [open, setOpen] = useState(false);
  const dropdownId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();

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

  useLayoutEffect(() => {
    if (!open) return;

    const frameId = requestAnimationFrame(() => {
      const menu = menuRef.current;
      const scrollContainer = containerRef.current?.closest('[data-dropdown-scroll-container]');
      if (!menu || !(scrollContainer instanceof HTMLElement)) return;

      const menuRect = menu.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();
      const padding = 10;

      if (menuRect.bottom > containerRect.bottom - padding) {
        scrollContainer.scrollBy({
          top: menuRect.bottom - containerRect.bottom + padding,
          behavior: 'smooth',
        });
      } else if (menuRect.top < containerRect.top + padding) {
        scrollContainer.scrollBy({
          top: menuRect.top - containerRect.top - padding,
          behavior: 'smooth',
        });
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [open]);

  function selectByWheel(event: WheelEvent<HTMLDivElement>) {
    if (!settings.enableDropdownHoverScroll) return;
    if (Math.abs(event.deltaY) < 1) return;

    event.preventDefault();
    event.stopPropagation();

    const selectableOptions = options.filter((option) => !option.disabled);
    if (selectableOptions.length < 2) return;

    const direction = event.deltaY > 0 ? 1 : -1;
    const currentIndex = selectableOptions.findIndex((option) => Object.is(option.value, value));
    const fallbackIndex = direction > 0 ? 0 : selectableOptions.length - 1;
    const nextIndex =
      currentIndex === -1
        ? fallbackIndex
        : (currentIndex + direction + selectableOptions.length) % selectableOptions.length;
    const nextOption = selectableOptions[nextIndex];

    if (!Object.is(nextOption.value, value)) {
      onSelect(nextOption.value);
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      data-dropdown-open={open ? 'true' : 'false'}
      data-dropdown-root
      onWheelCapture={selectByWheel}
    >
      <button
        className={`flex h-10 w-full items-center justify-between gap-3 rounded-md border px-4 text-sm text-mist-200 transition ${
          variant === 'settings'
            ? 'border-white/[0.10] bg-shell-800/55 hover:bg-shell-800/75'
            : 'border-white/[0.09] bg-white/[0.035] hover:bg-white/[0.07]'
        }`}
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
          ref={menuRef}
          className={`absolute right-0 z-50 min-w-full overflow-hidden rounded-md border shadow-glow backdrop-blur-xl ${
            variant === 'settings'
              ? 'border-white/[0.11] bg-shell-800/96'
              : 'border-white/[0.09] bg-shell-900/95'
          } ${
            placement === 'top' ? 'bottom-11' : 'top-11'
          }`}
        >
          {options.map((option) => (
            <button
              key={option.value}
              className={`block w-full whitespace-nowrap px-4 py-2.5 text-left text-sm transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-45 ${
                option.value === value ? 'text-blue-300' : 'text-mist-200'
              }`}
              disabled={option.disabled}
              onClick={() => {
                if (option.disabled) return;
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
