import { useEffect, useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import {
  queueOperations,
  type QueueOperation,
  type QueueRowsPerPage,
  type QueueSortKey,
  type QueueStatus,
  type QueueStatusFilter,
  type QueueTypeFilter,
} from '@shared/queueMockData';
import { AppDialog } from '../components/playlists/AppDialog';
import { ContextMenu, type ContextMenuState } from '../components/playlists/ContextMenu';
import { QueueDetailPanel } from '../components/queue/QueueDetailPanel';
import { QueueOperationList, type QueueSelectionModifiers } from '../components/queue/QueueOperationList';
import { QueueToolbar } from '../components/queue/QueueToolbar';

type QueueActiveScope = 'none' | 'queueList' | 'queueDetailVideos';
type QueueDialog =
  | { type: 'cancelOperations'; operationIds: string[] }
  | { type: 'removeOperations'; operationIds: string[] }
  | { type: 'clearCompleted' }
  | { type: 'removeAffected'; operationId: string; videoIds: string[] }
  | { type: 'notImplemented'; title: string; message: string };

const runnableStatuses: QueueStatus[] = ['Pending', 'Needs review', 'Failed'];
const cancellableStatuses: QueueStatus[] = ['Pending', 'Needs review', 'Running'];
const clearableStatuses: QueueStatus[] = ['Completed', 'Cancelled', 'Failed'];
const statusSortOrder: QueueStatus[] = [
  'Pending',
  'Needs review',
  'Running',
  'Failed',
  'Completed',
  'Cancelled',
];

export function QueuePage() {
  const [operations, setOperations] = useState<QueueOperation[]>(() => queueOperations);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<QueueStatusFilter>('All statuses');
  const [typeFilter, setTypeFilter] = useState<QueueTypeFilter>('All types');
  const [sortKey, setSortKey] = useState<QueueSortKey>('newest');
  const [detailOperationId, setDetailOperationId] = useState<string | null>(queueOperations[0]?.id ?? null);
  const [selectedOperationIds, setSelectedOperationIds] = useState<string[]>([]);
  const [operationAnchorId, setOperationAnchorId] = useState<string | null>(null);
  const [selectedAffectedIds, setSelectedAffectedIds] = useState<string[]>([]);
  const [affectedAnchorId, setAffectedAnchorId] = useState<string | null>(null);
  const [affectedRowsPerPage, setAffectedRowsPerPage] = useState<QueueRowsPerPage>(10);
  const [affectedPage, setAffectedPage] = useState(1);
  const [activeScope, setActiveScope] = useState<QueueActiveScope>('none');
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [dialog, setDialog] = useState<QueueDialog | null>(null);

  const visibleOperations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const filtered = operations.filter((operation) => {
      const searchable = [
        operation.title,
        operation.source,
        operation.target,
        operation.targetSummary,
        operation.status,
        operation.type,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = searchable.includes(normalizedSearch);
      const matchesStatus = statusFilter === 'All statuses' || operation.status === statusFilter;
      const matchesType = typeFilter === 'All types' || operation.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });

    return sortOperations(filtered, sortKey);
  }, [operations, search, sortKey, statusFilter, typeFilter]);

  const detailOperation = useMemo(
    () => operations.find((operation) => operation.id === detailOperationId),
    [detailOperationId, operations],
  );
  const affectedVideos = detailOperation?.affectedVideos ?? [];
  const affectedTotalPages =
    affectedRowsPerPage === 'All'
      ? 1
      : Math.max(1, Math.ceil(affectedVideos.length / affectedRowsPerPage));
  const currentAffectedPage = Math.min(affectedPage, affectedTotalPages);
  const paginatedAffectedVideos =
    affectedRowsPerPage === 'All'
      ? affectedVideos
      : affectedVideos.slice(
          (currentAffectedPage - 1) * affectedRowsPerPage,
          currentAffectedPage * affectedRowsPerPage,
        );
  const affectedRangeText = getRangeText(affectedVideos.length, currentAffectedPage, affectedRowsPerPage);
  const runnableVisibleCount = visibleOperations.filter((operation) =>
    runnableStatuses.includes(operation.status),
  ).length;
  const completedCount = operations.filter((operation) => operation.status === 'Completed').length;

  useEffect(() => {
    if (
      visibleOperations.length > 0 &&
      (!detailOperationId || !visibleOperations.some((operation) => operation.id === detailOperationId))
    ) {
      setDetailOperationId(visibleOperations[0].id);
      setSelectedAffectedIds([]);
      setAffectedPage(1);
    } else if (visibleOperations.length === 0) {
      setDetailOperationId(null);
      setSelectedAffectedIds([]);
    }
  }, [detailOperationId, visibleOperations]);

  useEffect(() => {
    if (affectedPage > affectedTotalPages) {
      setAffectedPage(affectedTotalPages);
    }
  }, [affectedPage, affectedTotalPages]);

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
    function handleQueueShortcuts(event: KeyboardEvent) {
      if (shouldIgnoreShortcutTarget(event.target)) return;

      const modifierPressed = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (document.querySelector('[data-dropdown-open="true"]')) {
        if (modifierPressed && key === 'a') {
          event.preventDefault();
        }
        return;
      }

      if (activeScope === 'queueList') {
        const visibleIds = visibleOperations.map((operation) => operation.id);
        if (modifierPressed && key === 'a') {
          event.preventDefault();
          setSelectedOperationIds(visibleIds);
          return;
        }
        if (modifierPressed && key === 'd') {
          event.preventDefault();
          setSelectedOperationIds([]);
          setOperationAnchorId(null);
          return;
        }
        if (modifierPressed && key === 'i') {
          event.preventDefault();
          invertSelection(visibleIds, setSelectedOperationIds);
        }
        return;
      }

      if (activeScope === 'queueDetailVideos') {
        const visibleIds = affectedVideos.map((video) => video.id);
        if (modifierPressed && key === 'a') {
          event.preventDefault();
          setSelectedAffectedIds(visibleIds);
          return;
        }
        if (modifierPressed && key === 'd') {
          event.preventDefault();
          setSelectedAffectedIds([]);
          setAffectedAnchorId(null);
          return;
        }
        if (modifierPressed && key === 'i') {
          event.preventDefault();
          invertSelection(visibleIds, setSelectedAffectedIds);
        }
        return;
      }

      if (modifierPressed && key === 'a') {
        event.preventDefault();
      }
    }

    document.addEventListener('keydown', handleQueueShortcuts);
    return () => document.removeEventListener('keydown', handleQueueShortcuts);
  });

  function selectOperationWithModifiers(
    operationId: string,
    modifiers: QueueSelectionModifiers,
    visibleIds: string[],
  ) {
    setActiveScope('queueList');
    setDetailOperationId(operationId);
    setSelectedAffectedIds([]);
    setAffectedPage(1);

    if (modifiers.shiftKey) {
      const rangeIds = getRangeIds(visibleIds, operationAnchorId, operationId);
      setSelectedOperationIds((current) =>
        modifiers.ctrlKey || modifiers.metaKey ? mergeUnique(current, rangeIds) : rangeIds,
      );
    } else if (modifiers.ctrlKey || modifiers.metaKey || modifiers.checkboxToggle) {
      setSelectedOperationIds((current) =>
        current.includes(operationId)
          ? current.filter((id) => id !== operationId)
          : [...current, operationId],
      );
    } else {
      setSelectedOperationIds((current) =>
        current.includes(operationId) ? current.filter((id) => id !== operationId) : [operationId],
      );
    }

    setOperationAnchorId(operationId);
  }

  function selectAffectedWithModifiers(
    videoId: string,
    modifiers: QueueSelectionModifiers,
    visibleIds: string[],
  ) {
    setActiveScope('queueDetailVideos');

    if (modifiers.shiftKey) {
      const rangeIds = getRangeIds(visibleIds, affectedAnchorId, videoId);
      setSelectedAffectedIds((current) =>
        modifiers.ctrlKey || modifiers.metaKey ? mergeUnique(current, rangeIds) : rangeIds,
      );
    } else if (modifiers.ctrlKey || modifiers.metaKey || modifiers.checkboxToggle) {
      setSelectedAffectedIds((current) =>
        current.includes(videoId) ? current.filter((id) => id !== videoId) : [...current, videoId],
      );
    } else {
      setSelectedAffectedIds((current) =>
        current.includes(videoId) ? current.filter((id) => id !== videoId) : [videoId],
      );
    }

    setAffectedAnchorId(videoId);
  }

  function toggleAllAffected() {
    const affectedIds = affectedVideos.map((video) => video.id);
    const allSelected = affectedIds.length > 0 && affectedIds.every((id) => selectedAffectedIds.includes(id));
    setSelectedAffectedIds(allSelected ? [] : affectedIds);
  }

  function applyOperations(operationIds: string[]) {
    const idSet = new Set(operationIds);
    setOperations((current) =>
      current.map((operation) =>
        idSet.has(operation.id) && runnableStatuses.includes(operation.status)
          ? { ...operation, status: 'Completed' }
          : operation,
      ),
    );
  }

  function retryOperations(operationIds: string[]) {
    const idSet = new Set(operationIds);
    setOperations((current) =>
      current.map((operation) =>
        idSet.has(operation.id) && operation.status === 'Failed'
          ? { ...operation, status: 'Pending', error: undefined }
          : operation,
      ),
    );
  }

  function cancelOperations(operationIds: string[]) {
    const idSet = new Set(operationIds);
    setOperations((current) =>
      current.map((operation) =>
        idSet.has(operation.id) && cancellableStatuses.includes(operation.status)
          ? { ...operation, status: 'Cancelled' }
          : operation,
      ),
    );
    setDialog(null);
  }

  function removeOperations(operationIds: string[]) {
    const idSet = new Set(operationIds);
    setOperations((current) => current.filter((operation) => !idSet.has(operation.id)));
    setSelectedOperationIds((current) => current.filter((id) => !idSet.has(id)));
    if (detailOperationId && idSet.has(detailOperationId)) {
      const nextOperation = visibleOperations.find((operation) => !idSet.has(operation.id));
      setDetailOperationId(nextOperation?.id ?? null);
      setSelectedAffectedIds([]);
    }
    setDialog(null);
  }

  function clearCompleted() {
    setOperations((current) => current.filter((operation) => operation.status !== 'Completed'));
    setSelectedOperationIds((current) =>
      current.filter((id) => operations.find((operation) => operation.id === id)?.status !== 'Completed'),
    );
    if (detailOperation?.status === 'Completed') {
      const nextOperation = visibleOperations.find((operation) => operation.status !== 'Completed');
      setDetailOperationId(nextOperation?.id ?? null);
      setSelectedAffectedIds([]);
    }
    setDialog(null);
  }

  function removeAffectedVideos(operationId: string, videoIds: string[]) {
    const idSet = new Set(videoIds);
    setOperations((current) =>
      current.map((operation) =>
        operation.id === operationId
          ? {
              ...operation,
              affectedVideos: operation.affectedVideos.filter((video) => !idSet.has(video.id)),
              title: operation.title.replace(/\d+ videos?/, `${Math.max(0, operation.affectedVideos.length - idSet.size)} videos`),
            }
          : operation,
      ),
    );
    setSelectedAffectedIds((current) => current.filter((id) => !idSet.has(id)));
    setDialog(null);
  }

  function runAllVisible() {
    applyOperations(visibleOperations.map((operation) => operation.id));
  }

  function getEffectiveOperationIds(operationId: string) {
    return selectedOperationIds.includes(operationId) ? selectedOperationIds : [operationId];
  }

  function getEffectiveAffectedIds(videoId: string) {
    return selectedAffectedIds.includes(videoId) ? selectedAffectedIds : [videoId];
  }

  function openOperationContextMenu(operationId: string, x: number, y: number) {
    const operation = operations.find((item) => item.id === operationId);
    const effectiveIds = getEffectiveOperationIds(operationId);
    const effectiveOperations = operations.filter((item) => effectiveIds.includes(item.id));
    const anyRunnable = effectiveOperations.some((item) => runnableStatuses.includes(item.status));
    const anyCancellable = effectiveOperations.some((item) => cancellableStatuses.includes(item.status));
    const anyFailed = effectiveOperations.some((item) => item.status === 'Failed');
    const clearableIds = effectiveOperations
      .filter((item) => clearableStatuses.includes(item.status))
      .map((item) => item.id);

    setContextMenu({
      x,
      y,
      items: [
        {
          label: 'Apply operation',
          disabled: !anyRunnable,
          onSelect: () => applyOperations(effectiveIds),
        },
        {
          label: 'Cancel operation',
          disabled: !anyCancellable,
          destructive: true,
          onSelect: () => setDialog({ type: 'cancelOperations', operationIds: effectiveIds }),
        },
        {
          label: 'Retry operation',
          disabled: !anyFailed,
          onSelect: () => retryOperations(effectiveIds),
        },
        {
          label: 'Clear from queue',
          disabled: clearableIds.length === 0,
          destructive: true,
          onSelect: () => setDialog({ type: 'removeOperations', operationIds: clearableIds }),
        },
      ],
    });

    if (operation) {
      setDetailOperationId(operation.id);
    }
  }

  function openAffectedContextMenu(videoId: string, x: number, y: number) {
    if (!detailOperation) return;
    const effectiveIds = getEffectiveAffectedIds(videoId);
    const video = detailOperation.affectedVideos.find((item) => item.id === videoId);

    setContextMenu({
      x,
      y,
      items: [
        {
          label: effectiveIds.length > 1 ? 'Apply selected items' : 'Apply this item',
          onSelect: () => showNotImplemented('Apply affected item'),
        },
        {
          label: effectiveIds.length > 1 ? 'Cancel selected items' : 'Cancel this item',
          onSelect: () => showNotImplemented('Cancel affected item'),
        },
        {
          label: 'Open video URL',
          onSelect: () => window.open(video?.url ?? `https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener,noreferrer'),
        },
        {
          label: 'Remove from operation',
          destructive: true,
          onSelect: () => setDialog({ type: 'removeAffected', operationId: detailOperation.id, videoIds: effectiveIds }),
        },
      ],
    });
  }

  function showNotImplemented(title: string) {
    setDialog({
      type: 'notImplemented',
      title,
      message: 'This action is part of the mock Queue UI and is not implemented yet.',
    });
  }

  function renderDialog() {
    if (!dialog) return null;

    if (dialog.type === 'cancelOperations') {
      const count = dialog.operationIds.length;
      return (
        <AppDialog
          title={`Cancel ${count} queued ${count === 1 ? 'operation' : 'operations'}?`}
          description="This only changes the mock queue status."
          actions={[
            { label: 'Keep', onClick: () => setDialog(null) },
            {
              label: count === 1 ? 'Cancel operation' : 'Cancel operations',
              variant: 'danger',
              onClick: () => cancelOperations(dialog.operationIds),
            },
          ]}
          onClose={() => setDialog(null)}
        />
      );
    }

    if (dialog.type === 'removeOperations') {
      const count = dialog.operationIds.length;
      return (
        <AppDialog
          title={`Clear ${count} ${count === 1 ? 'operation' : 'operations'} from queue?`}
          description="This clears the operation from the mock queue list."
          actions={[
            { label: 'Cancel', onClick: () => setDialog(null) },
            {
              label: 'Clear from queue',
              variant: 'danger',
              onClick: () => removeOperations(dialog.operationIds),
            },
          ]}
          onClose={() => setDialog(null)}
        />
      );
    }

    if (dialog.type === 'clearCompleted') {
      return (
        <AppDialog
          title="Clear completed operations?"
          description={`${completedCount} completed ${completedCount === 1 ? 'operation' : 'operations'} will be removed from the mock queue.`}
          actions={[
            { label: 'Cancel', onClick: () => setDialog(null) },
            { label: 'Clear completed', variant: 'danger', onClick: clearCompleted },
          ]}
          onClose={() => setDialog(null)}
        />
      );
    }

    if (dialog.type === 'removeAffected') {
      const count = dialog.videoIds.length;
      return (
        <AppDialog
          title={`Remove ${count} affected ${count === 1 ? 'item' : 'items'} from operation?`}
          description="This only changes the mock operation details."
          actions={[
            { label: 'Cancel', onClick: () => setDialog(null) },
            {
              label: 'Remove from operation',
              variant: 'danger',
              onClick: () => removeAffectedVideos(dialog.operationId, dialog.videoIds),
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
          <h1 className="text-[29px] font-bold tracking-[-0.035em] text-mist-50">Queue</h1>
          <p className="mt-1 text-[16px] text-mist-200">
            Review pending operations before applying changes.
          </p>
        </header>

        <QueueToolbar
          search={search}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          sortKey={sortKey}
          runAllDisabled={runnableVisibleCount === 0}
          onSearchChange={(value) => {
            setSearch(value);
            setSelectedOperationIds([]);
          }}
          onStatusFilterChange={(value) => {
            setStatusFilter(value);
            setSelectedOperationIds([]);
          }}
          onTypeFilterChange={(value) => {
            setTypeFilter(value);
            setSelectedOperationIds([]);
          }}
          onSortChange={setSortKey}
          onRunAll={runAllVisible}
        />

        <div className="grid min-h-0 flex-1 grid-cols-[360px_minmax(0,1fr)] gap-4">
          <QueueOperationList
            operations={visibleOperations}
            detailOperationId={detailOperationId}
            selectedIds={selectedOperationIds}
            clearCompletedDisabled={completedCount === 0}
            onActivate={() => setActiveScope('queueList')}
            onSelectOperation={selectOperationWithModifiers}
            onOpenContextMenu={openOperationContextMenu}
            onClearCompleted={() => setDialog({ type: 'clearCompleted' })}
          />
          <QueueDetailPanel
            operation={detailOperation}
            videos={paginatedAffectedVideos}
            allAffectedVideos={affectedVideos}
            selectedAffectedIds={selectedAffectedIds}
            rowsPerPage={affectedRowsPerPage}
            rangeText={affectedRangeText}
            page={currentAffectedPage}
            totalPages={affectedTotalPages}
            onApplyOperation={(id) => applyOperations([id])}
            onCancelOperation={(id) => setDialog({ type: 'cancelOperations', operationIds: [id] })}
            onOpenOperationContextMenu={openOperationContextMenu}
            onActivateAffectedTable={() => setActiveScope('queueDetailVideos')}
            onSelectAffectedVideo={selectAffectedWithModifiers}
            onToggleAllAffected={toggleAllAffected}
            onRowsPerPageChange={(value) => {
              setAffectedRowsPerPage(value);
              setAffectedPage(1);
            }}
            onPreviousPage={() => setAffectedPage((current) => Math.max(1, current - 1))}
            onNextPage={() => setAffectedPage((current) => Math.min(affectedTotalPages, current + 1))}
            onOpenAffectedContextMenu={openAffectedContextMenu}
          />
        </div>
      </div>
      <ContextMenu menu={contextMenu} onClose={() => setContextMenu(null)} />
      {renderDialog()}
    </>
  );
}

function sortOperations(operations: QueueOperation[], sortKey: QueueSortKey) {
  return [...operations].sort((a, b) => {
    if (sortKey === 'oldest') return a.createdOrder - b.createdOrder;
    if (sortKey === 'status') return statusSortOrder.indexOf(a.status) - statusSortOrder.indexOf(b.status);
    if (sortKey === 'type') return a.type.localeCompare(b.type);
    if (sortKey === 'source') return a.source.localeCompare(b.source);
    if (sortKey === 'target') return (a.target ?? a.targetSummary ?? '').localeCompare(b.target ?? b.targetSummary ?? '');
    return b.createdOrder - a.createdOrder;
  });
}

function mergeUnique(current: string[], next: string[]) {
  return Array.from(new Set([...current, ...next]));
}

function getRangeIds(orderedIds: string[], anchorId: string | null, clickedId: string) {
  const clickedIndex = orderedIds.indexOf(clickedId);
  const anchorIndex = anchorId ? orderedIds.indexOf(anchorId) : -1;

  if (clickedIndex === -1) return [];
  if (anchorIndex === -1) return [clickedId];

  const start = Math.min(anchorIndex, clickedIndex);
  const end = Math.max(anchorIndex, clickedIndex);
  return orderedIds.slice(start, end + 1);
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

function getRangeText(total: number, page: number, rowsPerPage: QueueRowsPerPage) {
  if (total === 0) return '0 of 0';
  if (rowsPerPage === 'All') return `1–${total} of ${total}`;

  const start = (page - 1) * rowsPerPage + 1;
  const end = Math.min(page * rowsPerPage, total);
  return `${start}–${end} of ${total}`;
}

function shouldIgnoreShortcutTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]'));
}
