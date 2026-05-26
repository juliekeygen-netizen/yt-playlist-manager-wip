import { Download, Info, MoreVertical } from 'lucide-react';
import type { HistoryEvent, HistoryRowsPerPage, HistorySavedVideo } from '@shared/historyMockData';
import type { HistorySelectionModifiers } from './HistorySavedItemsTable';
import { HistorySavedItemsTable } from './HistorySavedItemsTable';
import {
  getPrimaryActionIcon,
  getPrimaryActionLabel,
  historyIcons,
  historyStateClasses,
} from './historyStyle';

export function HistoryDetailPanel({
  event,
  videos,
  allSavedVideos,
  selectedSavedIds,
  rowsPerPage,
  rangeText,
  page,
  totalPages,
  onPrimaryAction,
  onExportBackup,
  onOpenEventContextMenu,
  onActivateSavedTable,
  onSelectSavedVideo,
  onToggleAllSaved,
  onRowsPerPageChange,
  onPreviousPage,
  onNextPage,
  onOpenSavedContextMenu,
}: {
  event: HistoryEvent | undefined;
  videos: HistorySavedVideo[];
  allSavedVideos: HistorySavedVideo[];
  selectedSavedIds: string[];
  rowsPerPage: HistoryRowsPerPage;
  rangeText: string;
  page: number;
  totalPages: number;
  onPrimaryAction: (id: string) => void;
  onExportBackup: (id: string) => void;
  onOpenEventContextMenu: (id: string, x: number, y: number) => void;
  onActivateSavedTable: () => void;
  onSelectSavedVideo: (id: string, modifiers: HistorySelectionModifiers, visibleIds: string[]) => void;
  onToggleAllSaved: () => void;
  onRowsPerPageChange: (value: HistoryRowsPerPage) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onOpenSavedContextMenu: (id: string, x: number, y: number) => void;
}) {
  if (!event) {
    return (
      <section className="panel flex min-h-0 min-w-0 flex-1 items-center justify-center rounded-lg px-8 text-center">
        <div>
          <h2 className="text-xl font-semibold text-mist-50">No history item selected</h2>
          <p className="mt-2 text-sm text-mist-400">Select a history item to view recovery details.</p>
        </div>
      </section>
    );
  }

  const Icon = historyIcons[event.type];
  const PrimaryIcon = getPrimaryActionIcon(event.type, event.state);
  const primaryLabel = getPrimaryActionLabel(event.type, event.state);
  const primaryDisabled = event.state === 'Restored' || event.state === 'Cleared' || event.state === 'Expired';
  const savedLabel =
    event.type === 'Deleted playlist'
      ? `${event.savedVideoCount} videos saved`
      : `${event.savedVideoCount} ${event.savedVideoCount === 1 ? 'item' : 'items'} saved`;

  return (
    <section className="panel flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg">
      <header className="flex shrink-0 items-start gap-5 p-4">
        <div className="flex h-[88px] w-[88px] items-center justify-center rounded-md border border-white/[0.08] bg-shell-950/45 text-mist-400">
          <Icon size={34} className={historyStateClasses[event.state]} />
        </div>
        <div className="min-w-0 pt-2">
          <h2 className="truncate text-2xl font-semibold tracking-[-0.025em] text-mist-50">
            {event.title}
          </h2>
          <p className="mt-2 truncate text-sm text-mist-400">
            {event.subtitle}
            <span className="px-2 text-mist-600">•</span>
            {event.timestampLabel}
          </p>
          <p className={`mt-3 text-sm font-semibold ${historyStateClasses[event.state]}`}>
            {event.state}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-md border border-white/[0.09] bg-white/[0.035] text-mist-400 transition hover:bg-white/[0.07] hover:text-mist-100"
            onClick={(mouseEvent) => onOpenEventContextMenu(event.id, mouseEvent.clientX, mouseEvent.clientY)}
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
          <span className="font-semibold">{savedLabel}</span>
        </div>
        <button
          className="ml-auto flex h-10 items-center gap-2 rounded-md bg-blue-600 px-5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-mist-500"
          disabled={primaryDisabled}
          onClick={primaryDisabled ? undefined : () => onPrimaryAction(event.id)}
        >
          <PrimaryIcon size={17} />
          {primaryLabel}
        </button>
        <button
          className="flex h-10 items-center gap-2 rounded-md border border-white/[0.09] bg-white/[0.035] px-5 text-mist-200 transition hover:bg-white/[0.07]"
          onClick={() => onExportBackup(event.id)}
        >
          <Download size={17} />
          Export backup
        </button>
      </section>

      <HistorySavedItemsTable
        videos={videos}
        allVideos={allSavedVideos}
        selectedIds={selectedSavedIds}
        rowsPerPage={rowsPerPage}
        rangeText={rangeText}
        page={page}
        totalPages={totalPages}
        onActivate={onActivateSavedTable}
        onSelectVideo={onSelectSavedVideo}
        onToggleAll={onToggleAllSaved}
        onRowsPerPageChange={onRowsPerPageChange}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
        onOpenContextMenu={onOpenSavedContextMenu}
      />

      <section className="mx-4 mb-3 flex shrink-0 items-center gap-3 rounded-lg border border-white/[0.075] bg-white/[0.035] px-4 py-3 text-sm text-mist-300">
        <Info size={18} className="shrink-0 text-blue-300" />
        <p>{event.note}</p>
      </section>
    </section>
  );
}
