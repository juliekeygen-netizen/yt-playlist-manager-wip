import { MoreVertical, Trash2 } from 'lucide-react';
import type { MouseEvent } from 'react';
import type { QueueOperation } from '@shared/queueMockData';
import { getOperationSubtitle, operationIcons, queueStatusClasses } from './queueStyle';

export function QueueOperationList({
  operations,
  detailOperationId,
  selectedIds,
  clearCompletedDisabled,
  onActivate,
  onSelectOperation,
  onOpenContextMenu,
  onClearCompleted,
}: {
  operations: QueueOperation[];
  detailOperationId: string | null;
  selectedIds: string[];
  clearCompletedDisabled: boolean;
  onActivate: () => void;
  onSelectOperation: (id: string, modifiers: QueueSelectionModifiers, visibleIds: string[]) => void;
  onOpenContextMenu: (id: string, x: number, y: number) => void;
  onClearCompleted: () => void;
}) {
  const visibleIds = operations.map((operation) => operation.id);

  return (
    <section
      className="panel flex min-h-0 w-[360px] shrink-0 flex-col overflow-hidden rounded-lg"
      data-active-list-scope="queueList"
      onPointerDownCapture={onActivate}
    >
      <div className="video-table-scroll min-h-0 flex-1 overflow-y-auto">
        {operations.length > 0 ? (
          operations.map((operation) => (
            <QueueOperationRow
              key={operation.id}
              operation={operation}
              selected={operation.id === detailOperationId}
              multiSelected={selectedIds.includes(operation.id)}
              visibleIds={visibleIds}
              onOpenContextMenu={(event) => onOpenContextMenu(operation.id, event.clientX, event.clientY)}
              onSelectOperation={onSelectOperation}
            />
          ))
        ) : (
          <div className="flex h-full min-h-[260px] flex-col items-center justify-center px-6 text-center">
            <h3 className="text-lg font-semibold text-mist-50">No operations found</h3>
            <p className="mt-2 text-sm text-mist-400">Try changing search or filters.</p>
          </div>
        )}
      </div>
      <footer className="flex h-12 shrink-0 items-center justify-between border-t border-white/[0.055] px-5 text-sm text-mist-400">
        <span>
          {operations.length} {operations.length === 1 ? 'operation' : 'operations'}
        </span>
        <button
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-mist-400 transition hover:bg-white/[0.07] hover:text-mist-100 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={clearCompletedDisabled}
          onClick={clearCompletedDisabled ? undefined : onClearCompleted}
        >
          <Trash2 size={16} />
          Clear completed
        </button>
      </footer>
    </section>
  );
}

function QueueOperationRow({
  operation,
  selected,
  multiSelected,
  visibleIds,
  onSelectOperation,
  onOpenContextMenu,
}: {
  operation: QueueOperation;
  selected: boolean;
  multiSelected: boolean;
  visibleIds: string[];
  onSelectOperation: (id: string, modifiers: QueueSelectionModifiers, visibleIds: string[]) => void;
  onOpenContextMenu: (event: MouseEvent<HTMLElement>) => void;
}) {
  const Icon = operationIcons[operation.type];

  return (
    <article
      className={`relative mx-2 my-1 grid min-h-[94px] cursor-default grid-cols-[66px_minmax(0,1fr)_28px] gap-4 overflow-hidden rounded-lg px-4 py-4 ${
        selected ? 'bg-blue-500/[0.025]' : 'border-b border-white/[0.045] hover:bg-white/[0.035]'
      } ${multiSelected && !selected ? 'bg-blue-500/[0.045]' : ''}`}
      onClick={(event) => onSelectOperation(operation.id, getSelectionModifiers(event), visibleIds)}
      onContextMenu={(event) => {
        event.preventDefault();
        onOpenContextMenu(event);
      }}
    >
      {selected && (
        <>
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/25 via-blue-500/13 to-transparent" />
          <span className="pointer-events-none absolute left-0 top-2 h-[calc(100%-1rem)] w-[4px] rounded-r-full bg-blue-400" />
        </>
      )}
      <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-md border border-white/[0.08] bg-shell-950/45 text-mist-400">
        <Icon size={25} />
      </div>
      <div className="relative z-10 min-w-0 self-center">
        <h3 className="truncate font-semibold text-mist-50">{operation.title}</h3>
        <p className="mt-1 truncate text-sm text-mist-400">
          {getOperationSubtitle(operation)}
        </p>
        <p className={`mt-2 text-sm font-semibold ${queueStatusClasses[operation.status]}`}>
          {operation.status}
        </p>
      </div>
      <button
        className="relative z-10 self-center rounded-md p-1 text-mist-500 transition hover:bg-white/[0.07] hover:text-mist-100"
        onClick={(event) => {
          event.stopPropagation();
          onOpenContextMenu(event);
        }}
      >
        <MoreVertical size={18} />
      </button>
    </article>
  );
}

export interface QueueSelectionModifiers {
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  checkboxToggle?: boolean;
}

function getSelectionModifiers(event: MouseEvent<HTMLElement>): QueueSelectionModifiers {
  return {
    shiftKey: event.shiftKey,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
  };
}
