import { MoreVertical, Trash2 } from 'lucide-react';
import type { MouseEvent } from 'react';
import type { HistoryEvent } from '@shared/historyMockData';
import { historyIcons, historyStateClasses } from './historyStyle';

export function HistoryEventList({
  events,
  selectedEventId,
  selectedIds,
  clearDisabled,
  onActivate,
  onSelectEvent,
  onOpenContextMenu,
  onClearOldHistory,
}: {
  events: HistoryEvent[];
  selectedEventId: string | null;
  selectedIds: string[];
  clearDisabled: boolean;
  onActivate: () => void;
  onSelectEvent: (id: string, modifiers: HistoryEventSelectionModifiers, visibleIds: string[]) => void;
  onOpenContextMenu: (id: string, x: number, y: number) => void;
  onClearOldHistory: () => void;
}) {
  const visibleIds = events.map((event) => event.id);

  return (
    <section
      className="panel flex min-h-0 w-[360px] shrink-0 flex-col overflow-hidden rounded-lg"
      data-active-list-scope="historyList"
      onPointerDownCapture={onActivate}
    >
      <div className="video-table-scroll min-h-0 flex-1 overflow-y-auto">
        {events.length > 0 ? (
          events.map((event) => (
            <HistoryEventRow
              key={event.id}
              event={event}
              selected={event.id === selectedEventId}
              multiSelected={selectedIds.includes(event.id)}
              visibleIds={visibleIds}
              onSelectEvent={onSelectEvent}
              onOpenContextMenu={(mouseEvent) => onOpenContextMenu(event.id, mouseEvent.clientX, mouseEvent.clientY)}
            />
          ))
        ) : (
          <div className="flex h-full min-h-[260px] flex-col items-center justify-center px-6 text-center">
            <h3 className="text-lg font-semibold text-mist-50">No history found</h3>
            <p className="mt-2 text-sm text-mist-400">Try changing search or filters.</p>
          </div>
        )}
      </div>
      <footer className="flex h-12 shrink-0 items-center justify-between border-t border-white/[0.055] px-5 text-sm text-mist-400">
        <span>
          {events.length} {events.length === 1 ? 'item' : 'items'}
        </span>
        <button
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-mist-400 transition hover:bg-white/[0.07] hover:text-mist-100 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={clearDisabled}
          onClick={clearDisabled ? undefined : onClearOldHistory}
        >
          <Trash2 size={16} />
          Clear old history
        </button>
      </footer>
    </section>
  );
}

function HistoryEventRow({
  event,
  selected,
  multiSelected,
  visibleIds,
  onSelectEvent,
  onOpenContextMenu,
}: {
  event: HistoryEvent;
  selected: boolean;
  multiSelected: boolean;
  visibleIds: string[];
  onSelectEvent: (id: string, modifiers: HistoryEventSelectionModifiers, visibleIds: string[]) => void;
  onOpenContextMenu: (event: MouseEvent<HTMLElement>) => void;
}) {
  const Icon = historyIcons[event.type];

  return (
    <article
      className={`relative mx-2 my-1 grid min-h-[94px] cursor-default grid-cols-[66px_minmax(0,1fr)_28px] gap-4 overflow-hidden rounded-lg px-4 py-4 ${
        selected
          ? 'bg-blue-500/[0.025]'
          : multiSelected
            ? 'bg-blue-500/[0.07]'
            : 'border-b border-white/[0.045] hover:bg-white/[0.035]'
      }`}
      onClick={(mouseEvent) => onSelectEvent(event.id, getSelectionModifiers(mouseEvent), visibleIds)}
      onContextMenu={(mouseEvent) => {
        mouseEvent.preventDefault();
        onOpenContextMenu(mouseEvent);
      }}
    >
      {selected && (
        <>
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/25 via-blue-500/13 to-transparent" />
          <span className="pointer-events-none absolute left-0 top-2 h-[calc(100%-1rem)] w-[4px] rounded-r-full bg-blue-400" />
        </>
      )}
      <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-md border border-white/[0.08] bg-shell-950/45 text-mist-400">
        <Icon size={25} className={historyStateClasses[event.state]} />
      </div>
      <div className="relative z-10 min-w-0 self-center">
        <h3 className="truncate font-semibold text-mist-50">{event.title}</h3>
        <p className="mt-1 truncate text-sm text-mist-400">{event.subtitle}</p>
        <div className="mt-2 flex items-center gap-3 text-sm">
          <span className={`shrink-0 whitespace-nowrap font-semibold ${historyStateClasses[event.state]}`}>{event.state}</span>
          <span className="ml-auto truncate text-xs text-mist-400">{getListTimestamp(event.timestamp)}</span>
        </div>
      </div>
      <button
        className="relative z-10 place-self-center rounded-md p-1 text-mist-500 transition hover:bg-white/[0.07] hover:text-mist-100"
        onClick={(mouseEvent) => {
          mouseEvent.stopPropagation();
          onOpenContextMenu(mouseEvent);
        }}
      >
        <MoreVertical size={18} />
      </button>
    </article>
  );
}

export interface HistoryEventSelectionModifiers {
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  checkboxToggle?: boolean;
}

function getSelectionModifiers(event: MouseEvent<HTMLElement>): HistoryEventSelectionModifiers {
  return {
    shiftKey: event.shiftKey,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
  };
}

function getListTimestamp(timestamp: string) {
  if (timestamp.startsWith('Today,') || timestamp.startsWith('Yesterday,')) return timestamp;

  return timestamp.replace(/, \d{4},/, ',');
}
