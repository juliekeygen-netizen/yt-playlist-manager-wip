import { Eye, Info, MoreVertical, Play, X } from 'lucide-react';
import type {
  QueueAffectedVideo,
  QueueOperation,
  QueueRowsPerPage,
} from '@shared/queueMockData';
import type { QueueSelectionModifiers } from './QueueOperationList';
import { QueueAffectedTable } from './QueueAffectedTable';
import { getOperationSubtitle, operationIcons, queueStatusClasses } from './queueStyle';

export function QueueDetailPanel({
  operation,
  videos,
  allAffectedVideos,
  selectedAffectedIds,
  rowsPerPage,
  rangeText,
  page,
  totalPages,
  onApplyOperation,
  onCancelOperation,
  onPreviewOperation,
  onOpenOperationContextMenu,
  onActivateAffectedTable,
  onSelectAffectedVideo,
  onToggleAllAffected,
  onRowsPerPageChange,
  onPreviousPage,
  onNextPage,
  onOpenAffectedContextMenu,
}: {
  operation: QueueOperation | undefined;
  videos: QueueAffectedVideo[];
  allAffectedVideos: QueueAffectedVideo[];
  selectedAffectedIds: string[];
  rowsPerPage: QueueRowsPerPage;
  rangeText: string;
  page: number;
  totalPages: number;
  onApplyOperation: (id: string) => void;
  onCancelOperation: (id: string) => void;
  onPreviewOperation: (id: string) => void;
  onOpenOperationContextMenu: (id: string, x: number, y: number) => void;
  onActivateAffectedTable: () => void;
  onSelectAffectedVideo: (id: string, modifiers: QueueSelectionModifiers, visibleIds: string[]) => void;
  onToggleAllAffected: () => void;
  onRowsPerPageChange: (value: QueueRowsPerPage) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onOpenAffectedContextMenu: (id: string, x: number, y: number) => void;
}) {
  if (!operation) {
    return (
      <section className="panel flex min-h-0 min-w-0 flex-1 items-center justify-center rounded-lg px-8 text-center">
        <div>
          <h2 className="text-xl font-semibold text-mist-50">No operation selected</h2>
          <p className="mt-2 text-sm text-mist-400">Select an operation to preview its details.</p>
        </div>
      </section>
    );
  }

  const Icon = operationIcons[operation.type];
  const applyDisabled = operation.status === 'Completed' || operation.status === 'Cancelled';
  const cancelDisabled = operation.status === 'Completed' || operation.status === 'Cancelled' || operation.status === 'Failed';

  return (
    <section className="panel flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg">
      <header className="flex shrink-0 items-start gap-5 p-4">
        <div className="flex h-[88px] w-[88px] items-center justify-center rounded-md border border-white/[0.08] bg-shell-950/45 text-mist-400">
          <Icon size={34} />
        </div>
        <div className="min-w-0 pt-2">
          <h2 className="truncate text-2xl font-semibold tracking-[-0.025em] text-mist-50">
            {operation.title}
          </h2>
          <p className="mt-2 truncate text-sm text-mist-400">
            Source: {operation.source}
            {(operation.target || operation.targetSummary) && (
              <>
                <span className="px-2 text-mist-600">•</span>
                Target: {operation.target ?? operation.targetSummary}
              </>
            )}
            <span className="px-2 text-mist-600">•</span>
            Created: {operation.createdAt}
          </p>
          <p className={`mt-3 text-sm font-semibold ${queueStatusClasses[operation.status]}`}>
            {operation.status}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            className="flex h-10 items-center gap-2 rounded-md border border-white/[0.09] bg-white/[0.035] px-4 text-sm text-mist-100 transition hover:bg-white/[0.07]"
            onClick={() => onPreviewOperation(operation.id)}
          >
            <Eye size={17} />
            Preview
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-md border border-white/[0.09] bg-white/[0.035] text-mist-400 transition hover:bg-white/[0.07] hover:text-mist-100"
            onClick={(event) => onOpenOperationContextMenu(operation.id, event.clientX, event.clientY)}
          >
            <MoreVertical size={19} />
          </button>
        </div>
      </header>

      <section className="mx-4 mb-3 flex h-[74px] shrink-0 items-center gap-3 rounded-lg border border-white/[0.075] bg-white/[0.04] px-4 text-sm text-mist-200">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-500/12 text-blue-300">
            <Info size={19} />
          </div>
          <span className="font-semibold">{allAffectedVideos.length} videos affected</span>
        </div>
        <button
          className="ml-auto flex h-10 items-center gap-2 rounded-md bg-blue-600 px-5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-mist-500"
          disabled={applyDisabled}
          onClick={applyDisabled ? undefined : () => onApplyOperation(operation.id)}
        >
          <Play size={17} />
          Apply operation
        </button>
        <button
          className="flex h-10 items-center gap-2 rounded-md border border-white/[0.09] bg-white/[0.035] px-5 text-mist-200 transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-45"
          disabled={cancelDisabled}
          onClick={cancelDisabled ? undefined : () => onCancelOperation(operation.id)}
        >
          <X size={17} />
          Cancel operation
        </button>
      </section>

      <QueueAffectedTable
        videos={videos}
        allVideos={allAffectedVideos}
        selectedIds={selectedAffectedIds}
        rowsPerPage={rowsPerPage}
        rangeText={rangeText}
        page={page}
        totalPages={totalPages}
        operationType={operation.type}
        onActivate={onActivateAffectedTable}
        onSelectVideo={onSelectAffectedVideo}
        onToggleAll={onToggleAllAffected}
        onRowsPerPageChange={onRowsPerPageChange}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
        onOpenContextMenu={onOpenAffectedContextMenu}
      />

      <section className="mx-4 mb-3 flex shrink-0 items-center gap-3 rounded-lg border border-white/[0.075] bg-white/[0.035] px-4 py-3 text-sm text-mist-300">
        <Info size={18} className="shrink-0 text-blue-300" />
        <p>{operation.error ?? operation.note ?? getOperationSubtitle(operation)}</p>
      </section>
    </section>
  );
}
