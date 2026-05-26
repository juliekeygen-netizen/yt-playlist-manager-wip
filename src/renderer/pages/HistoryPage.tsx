import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import {
  historyEvents,
  type HistoryEvent,
  type HistoryFilter,
  type HistoryRowsPerPage,
  type HistorySortKey,
  type HistoryState,
} from '@shared/historyMockData';
import type { SortDirection } from '@shared/playlistMockData';
import { toCompactHistoryRowsPerPage } from '@shared/settings';
import { AppDialog } from '../components/playlists/AppDialog';
import { ContextMenu, type ContextMenuState } from '../components/playlists/ContextMenu';
import { HistoryDetailPanel } from '../components/history/HistoryDetailPanel';
import { HistoryEventList, type HistoryEventSelectionModifiers } from '../components/history/HistoryEventList';
import type { HistorySelectionModifiers } from '../components/history/HistorySavedItemsTable';
import { getPrimaryActionLabel } from '../components/history/historyStyle';
import { HistoryToolbar } from '../components/history/HistoryToolbar';
import { useSettings } from '../contexts/settingsContextValue';

type HistoryActiveScope = 'none' | 'historyList' | 'historySavedVideos';
type HistoryDialog =
  | { type: 'clearOldHistory' }
  | { type: 'clearEvents'; eventIds: string[] }
  | { type: 'primaryAction'; eventId: string }
  | { type: 'removeSavedItems'; eventId: string; videoIds: string[] }
  | { type: 'notImplemented'; title: string; message: string };

const stateSortOrder: HistoryState[] = [
  'Undoable',
  'Recoverable',
  'Restored',
  'Expired',
  'Cleared',
];

export function HistoryPage() {
  const { settings } = useSettings();
  const [events, setEvents] = useState<HistoryEvent[]>(() => historyEvents);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<HistoryFilter>('All history');
  const [sortKey, setSortKey] = useState<HistorySortKey>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedEventId, setSelectedEventId] = useState<string | null>('history-deleted-archive');
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<string[]>([]);
  const [historyAnchorId, setHistoryAnchorId] = useState<string | null>(null);
  const [selectedSavedIds, setSelectedSavedIds] = useState<string[]>([]);
  const [savedAnchorId, setSavedAnchorId] = useState<string | null>(null);
  const [savedRowsPerPage, setSavedRowsPerPage] = useState<HistoryRowsPerPage>(() =>
    toCompactHistoryRowsPerPage(settings.defaultRowsPerPage),
  );
  const [savedPage, setSavedPage] = useState(1);
  const [activeScope, setActiveScope] = useState<HistoryActiveScope>('none');
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [dialog, setDialog] = useState<HistoryDialog | null>(null);

  const visibleEvents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const filtered = events.filter((event) => {
      const searchable = [
        event.title,
        event.subtitle,
        event.source,
        event.target,
        event.targetSummary,
        event.playlistTitle,
        event.state,
        ...event.savedVideos.map((video) => video.title),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = searchable.includes(normalizedSearch);
      const matchesFilter = filter === 'All history' || event.state === filter;
      return matchesSearch && matchesFilter;
    });

    return sortEvents(filtered, sortKey, sortDirection);
  }, [events, filter, search, sortDirection, sortKey]);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId),
    [events, selectedEventId],
  );
  const savedVideos = useMemo(() => selectedEvent?.savedVideos ?? [], [selectedEvent]);
  const savedTotalPages =
    savedRowsPerPage === 'All'
      ? 1
      : Math.max(1, Math.ceil(savedVideos.length / savedRowsPerPage));
  const currentSavedPage = Math.min(savedPage, savedTotalPages);
  const paginatedSavedVideos =
    savedRowsPerPage === 'All'
      ? savedVideos
      : savedVideos.slice(
          (currentSavedPage - 1) * savedRowsPerPage,
          currentSavedPage * savedRowsPerPage,
        );
  const savedRangeText = getRangeText(savedVideos.length, currentSavedPage, savedRowsPerPage);
  const clearOldDisabled = !events.some((event) => event.state === 'Restored' || event.state === 'Cleared' || event.state === 'Expired');

  useEffect(() => {
    if (
      visibleEvents.length > 0 &&
      (!selectedEventId || !visibleEvents.some((event) => event.id === selectedEventId))
    ) {
      setSelectedEventId(visibleEvents[0].id);
      setSelectedSavedIds([]);
      setSavedPage(1);
    } else if (visibleEvents.length === 0) {
      setSelectedEventId(null);
      setSelectedSavedIds([]);
    }
  }, [selectedEventId, visibleEvents]);

  useEffect(() => {
    function clearScopeOnOutsidePointer(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest('[data-active-list-scope]')) {
        setActiveScope('none');
      }
    }

    document.addEventListener('pointerdown', clearScopeOnOutsidePointer, true);
    return () => document.removeEventListener('pointerdown', clearScopeOnOutsidePointer, true);
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) return;

      const ctrlOrMeta = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (document.querySelector('[data-dropdown-open="true"]')) {
        if (ctrlOrMeta && key === 'a') {
          event.preventDefault();
        }
        return;
      }

      if (activeScope === 'historyList') {
        const visibleIds = visibleEvents.map((event) => event.id);
        if (ctrlOrMeta && key === 'a') {
          event.preventDefault();
          setSelectedHistoryIds(visibleIds);
          return;
        }
        if (ctrlOrMeta && key === 'd') {
          event.preventDefault();
          setSelectedHistoryIds([]);
          setHistoryAnchorId(null);
          return;
        }
        if (ctrlOrMeta && key === 'i') {
          event.preventDefault();
          invertSelection(visibleIds, setSelectedHistoryIds);
        }
        return;
      }

      if (activeScope === 'historySavedVideos') {
        const visibleIds = savedVideos.map((video) => video.id);
        if (ctrlOrMeta && key === 'a') {
          event.preventDefault();
          setSelectedSavedIds(visibleIds);
          return;
        }
        if (ctrlOrMeta && key === 'd') {
          event.preventDefault();
          setSelectedSavedIds([]);
          setSavedAnchorId(null);
          return;
        }
        if (ctrlOrMeta && key === 'i') {
          event.preventDefault();
          invertSelection(visibleIds, setSelectedSavedIds);
        }
        return;
      }

      if (ctrlOrMeta && key === 'a') {
        event.preventDefault();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeScope, savedVideos, visibleEvents]);

  function selectEventWithModifiers(
    eventId: string,
    modifiers: HistoryEventSelectionModifiers,
    visibleIds: string[],
  ) {
    setActiveScope('historyList');
    setSelectedEventId(eventId);
    setSelectedSavedIds([]);
    setSavedPage(1);

    if (modifiers.shiftKey) {
      const rangeIds = getRangeIds(visibleIds, historyAnchorId, eventId);
      setSelectedHistoryIds((current) =>
        modifiers.ctrlKey || modifiers.metaKey ? mergeUnique(current, rangeIds) : rangeIds,
      );
    } else if (modifiers.ctrlKey || modifiers.metaKey || modifiers.checkboxToggle) {
      setSelectedHistoryIds((current) =>
        current.includes(eventId)
          ? current.filter((id) => id !== eventId)
          : [...current, eventId],
      );
    } else {
      setSelectedHistoryIds([eventId]);
    }

    setHistoryAnchorId(eventId);
  }

  function selectSavedWithModifiers(
    videoId: string,
    modifiers: HistorySelectionModifiers,
    visibleIds: string[],
  ) {
    setSelectedSavedIds((current) => {
      if (modifiers.shiftKey) {
        const rangeIds = getRangeIds(visibleIds, savedAnchorId, videoId);
        return mergeUnique(current, rangeIds);
      }

      if (modifiers.ctrlKey || modifiers.metaKey || modifiers.checkboxToggle) {
        return current.includes(videoId)
          ? current.filter((id) => id !== videoId)
          : [...current, videoId];
      }

      return [videoId];
    });
    setSavedAnchorId(videoId);
  }

  function toggleAllSaved() {
    const savedIds = savedVideos.map((video) => video.id);
    const allSelected = savedIds.length > 0 && savedIds.every((id) => selectedSavedIds.includes(id));
    setSelectedSavedIds(allSelected ? [] : savedIds);
  }

  function updateSort(nextSortKey: HistorySortKey) {
    if (nextSortKey === sortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(nextSortKey);
      setSortDirection(nextSortKey === 'date' ? 'desc' : 'asc');
    }
  }

  function markEventRestored(eventId: string) {
    setEvents((current) =>
      current.map((event) =>
        event.id === eventId
          ? {
              ...event,
              state: 'Restored',
              timestampLabel: `Restored: ${event.timestamp}`,
              note: 'This mock history item has been marked restored.',
            }
          : event,
      ),
    );
    setDialog(null);
  }

  function clearHistoryEvents(eventIds: string[]) {
    const idSet = new Set(eventIds);
    setEvents((current) => current.filter((event) => !idSet.has(event.id)));
    setSelectedHistoryIds((current) => current.filter((id) => !idSet.has(id)));
    if (selectedEventId && idSet.has(selectedEventId)) {
      const nextEvent = visibleEvents.find((event) => !idSet.has(event.id));
      setSelectedEventId(nextEvent?.id ?? null);
      setSelectedSavedIds([]);
    }
    setDialog(null);
  }

  function clearOldHistory() {
    setEvents((current) =>
      current.filter((event) => !['Restored', 'Cleared', 'Expired'].includes(event.state)),
    );
    setSelectedHistoryIds((current) =>
      current.filter((id) => !events.find((event) => event.id === id && ['Restored', 'Cleared', 'Expired'].includes(event.state))),
    );
    setSelectedSavedIds([]);
    setDialog(null);
  }

  function removeSavedItems(eventId: string, videoIds: string[]) {
    const idSet = new Set(videoIds);
    setEvents((current) =>
      current.map((event) =>
        event.id === eventId
          ? {
              ...event,
              savedVideos: event.savedVideos.filter((video) => !idSet.has(video.id)),
              savedVideoCount: Math.max(0, event.savedVideoCount - idSet.size),
            }
          : event,
      ),
    );
    setSelectedSavedIds((current) => current.filter((id) => !idSet.has(id)));
    setDialog(null);
  }

  function requestClearOldHistory() {
    if (settings.confirmDestructiveActions) {
      setDialog({ type: 'clearOldHistory' });
    } else {
      clearOldHistory();
    }
  }

  function requestClearHistoryEvents(eventIds: string[]) {
    if (settings.confirmDestructiveActions) {
      setDialog({ type: 'clearEvents', eventIds });
    } else {
      clearHistoryEvents(eventIds);
    }
  }

  function requestPrimaryAction(eventId: string) {
    if (settings.confirmBeforeRestoringBackups) {
      setDialog({ type: 'primaryAction', eventId });
    } else {
      markEventRestored(eventId);
    }
  }

  function requestRemoveSavedItems(eventId: string, videoIds: string[]) {
    if (settings.confirmDestructiveActions) {
      setDialog({ type: 'removeSavedItems', eventId, videoIds });
    } else {
      removeSavedItems(eventId, videoIds);
    }
  }

  function openEventContextMenu(eventId: string, x: number, y: number) {
    const event = events.find((item) => item.id === eventId);
    if (!event) return;
    const effectiveIds = selectedHistoryIds.includes(eventId) ? selectedHistoryIds : [eventId];
    const multiSelect = effectiveIds.length > 1;
    const primaryLabel = getPrimaryActionLabel(event.type, event.state);
    const primaryDisabled = event.state === 'Restored' || event.state === 'Cleared' || event.state === 'Expired';

    setContextMenu({
      x,
      y,
      items: multiSelect
        ? [
            {
              label: 'Clear from history',
              destructive: true,
              onSelect: () => requestClearHistoryEvents(effectiveIds),
            },
          ]
        : [
            {
              label: primaryLabel,
              disabled: primaryDisabled,
              onSelect: () => requestPrimaryAction(eventId),
            },
            {
              label: 'Clear from history',
              destructive: true,
              onSelect: () => requestClearHistoryEvents(effectiveIds),
            },
          ],
    });
  }

  function openSavedContextMenu(videoId: string, x: number, y: number) {
    if (!selectedEvent) return;
    const effectiveIds = selectedSavedIds.includes(videoId) ? selectedSavedIds : [videoId];
    const video = selectedEvent.savedVideos.find((item) => item.id === videoId);

    setContextMenu({
      x,
      y,
      items: [
        {
          label: 'Open video URL',
          onSelect: () => window.open(video?.url ?? `https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener,noreferrer'),
        },
        {
          label: effectiveIds.length > 1 ? 'Restore selected items' : 'Restore this item',
          onSelect: () => showNotImplemented('Restore saved item'),
        },
        {
          label: effectiveIds.length > 1 ? 'Remove selected from backup' : 'Remove from backup',
          destructive: true,
          onSelect: () => requestRemoveSavedItems(selectedEvent.id, effectiveIds),
        },
      ],
    });
  }

  function showNotImplemented(title: string) {
    setDialog({
      type: 'notImplemented',
      title,
      message: 'This action is part of the mock History UI and is not implemented yet.',
    });
  }

  function renderDialog() {
    if (!dialog) return null;

    if (dialog.type === 'clearOldHistory') {
      return (
        <AppDialog
          title="Clear old history?"
          description="Restored, cleared, and expired mock history entries will be removed. Recoverable backups will stay available."
          actions={[
            { label: 'Cancel', onClick: () => setDialog(null) },
            { label: 'Clear old history', variant: 'danger', onClick: clearOldHistory },
          ]}
          onClose={() => setDialog(null)}
        />
      );
    }

    if (dialog.type === 'clearEvents') {
      const count = dialog.eventIds.length;
      const eventTitle = count === 1
        ? events.find((event) => event.id === dialog.eventIds[0])?.title ?? 'this history item'
        : `${count} history items`;
      return (
        <AppDialog
          title={count === 1 ? `Clear "${eventTitle}" from history?` : `Clear ${eventTitle} from history?`}
          description="This removes the mock history record from the visible history list."
          actions={[
            { label: 'Cancel', onClick: () => setDialog(null) },
            { label: 'Clear from history', variant: 'danger', onClick: () => clearHistoryEvents(dialog.eventIds) },
          ]}
          onClose={() => setDialog(null)}
        />
      );
    }

    if (dialog.type === 'primaryAction') {
      const event = events.find((item) => item.id === dialog.eventId);
      const label = event ? getPrimaryActionLabel(event.type, event.state) : 'Apply recovery';
      return (
        <AppDialog
          title={`${label}?`}
          description="This only updates the mock history recovery state. No YouTube playlist changes will be made."
          actions={[
            { label: 'Cancel', onClick: () => setDialog(null) },
            { label, variant: 'primary', onClick: () => markEventRestored(dialog.eventId) },
          ]}
          onClose={() => setDialog(null)}
        />
      );
    }

    if (dialog.type === 'removeSavedItems') {
      const count = dialog.videoIds.length;
      return (
        <AppDialog
          title={`Remove ${count} saved ${count === 1 ? 'item' : 'items'} from backup?`}
          description="This only changes the mock local backup list."
          actions={[
            { label: 'Cancel', onClick: () => setDialog(null) },
            {
              label: 'Remove from backup',
              variant: 'danger',
              onClick: () => removeSavedItems(dialog.eventId, dialog.videoIds),
            },
          ]}
          onClose={() => setDialog(null)}
        />
      );
    }

    return (
      <AppDialog
        title={dialog.title}
        description={dialog.message}
        actions={[{ label: 'OK', variant: 'primary', onClick: () => setDialog(null) }]}
        onClose={() => setDialog(null)}
      />
    );
  }

  return (
    <>
      <div className="mx-auto flex h-full min-h-[820px] max-w-[1240px] flex-col gap-5">
        <header>
          <h1 className="text-[29px] font-bold tracking-[-0.035em] text-mist-50">History</h1>
          <p className="mt-1 text-[16px] text-mist-200">
            Review recent changes and recover deleted or undoable items.
          </p>
        </header>

        <HistoryToolbar
          search={search}
          filter={filter}
          sortKey={sortKey}
          sortDirection={sortDirection}
          clearDisabled={clearOldDisabled}
          onSearchChange={(value) => {
            setSearch(value);
            setSelectedSavedIds([]);
          }}
          onFilterChange={(value) => {
            setFilter(value);
            setSelectedSavedIds([]);
          }}
          onSortChange={updateSort}
          onClearOldHistory={requestClearOldHistory}
        />

        <div className="grid min-h-0 flex-1 grid-cols-[360px_minmax(0,1fr)] gap-4">
          <HistoryEventList
            events={visibleEvents}
            selectedEventId={selectedEventId}
            selectedIds={selectedHistoryIds}
            clearDisabled={clearOldDisabled}
            onActivate={() => setActiveScope('historyList')}
            onSelectEvent={selectEventWithModifiers}
            onOpenContextMenu={openEventContextMenu}
            onClearOldHistory={requestClearOldHistory}
          />
          <HistoryDetailPanel
            event={selectedEvent}
            videos={paginatedSavedVideos}
            allSavedVideos={savedVideos}
            selectedSavedIds={selectedSavedIds}
            rowsPerPage={savedRowsPerPage}
            rangeText={savedRangeText}
            page={currentSavedPage}
            totalPages={savedTotalPages}
            onPrimaryAction={requestPrimaryAction}
            onExportBackup={() => showNotImplemented('Export backup')}
            onOpenEventContextMenu={openEventContextMenu}
            onActivateSavedTable={() => setActiveScope('historySavedVideos')}
            onSelectSavedVideo={selectSavedWithModifiers}
            onToggleAllSaved={toggleAllSaved}
            onRowsPerPageChange={(value) => {
              setSavedRowsPerPage(value);
              setSavedPage(1);
            }}
            onPreviousPage={() => setSavedPage((current) => Math.max(1, current - 1))}
            onNextPage={() => setSavedPage((current) => Math.min(savedTotalPages, current + 1))}
            onOpenSavedContextMenu={openSavedContextMenu}
          />
        </div>
      </div>
      <ContextMenu menu={contextMenu} onClose={() => setContextMenu(null)} />
      {renderDialog()}
    </>
  );
}

function sortEvents(events: HistoryEvent[], sortKey: HistorySortKey, direction: SortDirection) {
  const directionMultiplier = direction === 'asc' ? 1 : -1;

  return [...events].sort((a, b) => {
    if (sortKey === 'playlistTitle') return a.playlistTitle.localeCompare(b.playlistTitle) * directionMultiplier;
    if (sortKey === 'recoveryState') {
      return (stateSortOrder.indexOf(a.state) - stateSortOrder.indexOf(b.state)) * directionMultiplier;
    }
    return (a.createdOrder - b.createdOrder) * directionMultiplier;
  });
}

function getRangeText(total: number, page: number, rowsPerPage: HistoryRowsPerPage) {
  if (total === 0) return '0 of 0';
  if (rowsPerPage === 'All') return `1-${total} of ${total}`;
  const start = (page - 1) * rowsPerPage + 1;
  const end = Math.min(total, page * rowsPerPage);
  return `${start}-${end} of ${total}`;
}

function getRangeIds(orderedIds: string[], anchorId: string | null, clickedId: string) {
  if (!anchorId) return [clickedId];
  const anchorIndex = orderedIds.indexOf(anchorId);
  const clickedIndex = orderedIds.indexOf(clickedId);
  if (anchorIndex === -1 || clickedIndex === -1) return [clickedId];
  const start = Math.min(anchorIndex, clickedIndex);
  const end = Math.max(anchorIndex, clickedIndex);
  return orderedIds.slice(start, end + 1);
}

function mergeUnique(current: string[], next: string[]) {
  return Array.from(new Set([...current, ...next]));
}

function invertSelection(
  visibleIds: string[],
  setSelected: Dispatch<SetStateAction<string[]>>,
) {
  const visibleSet = new Set(visibleIds);
  setSelected((current) => {
    const currentSet = new Set(current);
    return [
      ...current.filter((id) => !visibleSet.has(id)),
      ...visibleIds.filter((id) => !currentSet.has(id)),
    ];
  });
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || target.isContentEditable;
}
