import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import {
  initiallySelectedVideoIds,
  type PlaylistListRecord,
  type PlaylistSortKey,
  type PlaylistStatusFilter,
  type PlaylistVideo,
  type PlaylistViewRecord,
  playlistRecords,
  playlistVideosByPlaylistId,
  type RowsPerPage,
  selectedPlaylistId,
  type SortDirection,
  type TargetPlaylistStatusFilter,
  type VideoSortKey,
  type VideoStatusFilter,
} from '@shared/playlistMockData';
import { AppDialog } from '../components/playlists/AppDialog';
import { ContextMenu, type ContextMenuState } from '../components/playlists/ContextMenu';
import { EmptyPlaylistDetailPanel, PlaylistDetailPanel } from '../components/playlists/PlaylistDetailPanel';
import { ExportPlaylistPopup } from '../components/playlists/ExportPlaylistPopup';
import { PlaylistListPanel } from '../components/playlists/PlaylistListPanel';
import { PlaylistPageToolbar } from '../components/playlists/PlaylistPageToolbar';
import { PlaylistStatsPopup } from '../components/playlists/PlaylistStatsPopup';
import { TargetPlaylistPicker, type TargetPickerMode } from '../components/playlists/TargetPlaylistPicker';
import type { SelectionModifiers } from '../components/playlists/VideoTable';
import { useSettings } from '../contexts/settingsContextValue';

type WorkspaceMode = 'videos' | TargetPickerMode | 'removeConfirm';
type ActiveListScope = 'none' | 'playlistList' | 'videoTable' | TargetPickerMode;
type DialogState =
  | { type: 'renamePlaylist'; playlistId: string; value: string }
  | { type: 'duplicatePlaylist'; playlistId: string; value: string }
  | { type: 'deletePlaylists'; playlistIds: string[] }
  | { type: 'playlistSelectionList'; playlistIds: string[] }
  | { type: 'removeVideos'; videoIds: string[] }
  | { type: 'playlistStats'; playlistId: string }
  | { type: 'exportPlaylist'; playlistId: string }
  | { type: 'notImplemented'; title: string; message: string };

export function PlaylistsPage() {
  const { settings } = useSettings();
  const [playlistRows, setPlaylistRows] = useState<PlaylistListRecord[]>(() => playlistRecords);
  const [activePlaylistId, setActivePlaylistId] = useState(selectedPlaylistId);
  const [videosByPlaylistId, setVideosByPlaylistId] = useState<Record<string, PlaylistVideo[]>>(
    () => playlistVideosByPlaylistId,
  );
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>(initiallySelectedVideoIds);
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<string[]>([selectedPlaylistId]);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('videos');
  const [playlistSearch, setPlaylistSearch] = useState('');
  const [playlistStatusFilter, setPlaylistStatusFilter] = useState<PlaylistStatusFilter>('All statuses');
  const [playlistSortKey, setPlaylistSortKey] = useState<PlaylistSortKey>(settings.defaultPlaylistSort);
  const [playlistSortDirection, setPlaylistSortDirection] = useState<SortDirection>(
    settings.defaultPlaylistSort === 'playlistName' ? 'asc' : 'desc',
  );
  const [videoSearch, setVideoSearch] = useState('');
  const [videoStatusFilter, setVideoStatusFilter] = useState<VideoStatusFilter>('All statuses');
  const [videoSortKey, setVideoSortKey] = useState<VideoSortKey>(settings.defaultVideoSort);
  const [videoSortDirection, setVideoSortDirection] = useState<SortDirection>(
    settings.defaultVideoSort === 'dateAdded' || settings.defaultVideoSort === 'manual' ? 'desc' : 'asc',
  );
  const [rowsPerPage, setRowsPerPage] = useState<RowsPerPage>(settings.defaultRowsPerPage);
  const [page, setPage] = useState(1);
  const [targetSearch, setTargetSearch] = useState('');
  const [targetStatusFilter, setTargetStatusFilter] =
    useState<TargetPlaylistStatusFilter>('All playlist statuses');
  const [targetSortKey, setTargetSortKey] = useState<PlaylistSortKey>('playlistName');
  const [targetSortDirection, setTargetSortDirection] = useState<SortDirection>('asc');
  const [selectedTargetPlaylistIds, setSelectedTargetPlaylistIds] = useState<string[]>([]);
  const [activeListScope, setActiveListScope] = useState<ActiveListScope>('none');
  const [playlistSelectionAnchorId, setPlaylistSelectionAnchorId] = useState<string | null>(selectedPlaylistId);
  const [videoSelectionAnchorId, setVideoSelectionAnchorId] = useState<string | null>(null);
  const [targetSelectionAnchorId, setTargetSelectionAnchorId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [manualVideoOrderByPlaylistId, setManualVideoOrderByPlaylistId] = useState<Record<string, string[]>>(
    () =>
      Object.fromEntries(
        Object.entries(playlistVideosByPlaylistId).map(([playlistId, videos]) => [
          playlistId,
          videos.map((video) => video.id),
        ]),
      ),
  );

  const playlistsWithCounts = useMemo<PlaylistViewRecord[]>(
    () =>
      playlistRows.map((playlist, originalIndex) => {
        const videos = videosByPlaylistId[playlist.id] ?? [];
        return {
          ...playlist,
          originalIndex,
          videoCount: videos.length,
          totalDurationSeconds: videos.reduce((total, video) => total + parseDuration(video.duration), 0),
        };
      }),
    [playlistRows, videosByPlaylistId],
  );

  const visiblePlaylists = useMemo(() => {
    const search = playlistSearch.trim().toLowerCase();
    const filtered = playlistsWithCounts.filter((playlist) => {
      const matchesSearch = playlist.title.toLowerCase().startsWith(search);
      const matchesStatus = playlistStatusFilter === 'All statuses' || playlist.status === playlistStatusFilter;
      return matchesSearch && matchesStatus;
    });

    return sortPlaylists(filtered, playlistSortKey, playlistSortDirection);
  }, [playlistSearch, playlistSortDirection, playlistSortKey, playlistStatusFilter, playlistsWithCounts]);

  const selectedPlaylist = useMemo(
    () => visiblePlaylists.find((playlist) => playlist.id === activePlaylistId) ?? visiblePlaylists[0],
    [activePlaylistId, visiblePlaylists],
  );
  const selectedVideos = useMemo(
    () => (selectedPlaylist ? videosByPlaylistId[selectedPlaylist.id] ?? [] : []),
    [selectedPlaylist, videosByPlaylistId],
  );
  const selectedVideoObjects = useMemo(
    () => selectedVideos.filter((video) => selectedVideoIds.includes(video.id)),
    [selectedVideoIds, selectedVideos],
  );
  const manualOrderForSelectedPlaylist = useMemo(
    () =>
      selectedPlaylist
        ? manualVideoOrderByPlaylistId[selectedPlaylist.id] ?? selectedVideos.map((video) => video.id)
        : [],
    [manualVideoOrderByPlaylistId, selectedPlaylist, selectedVideos],
  );
  const manuallyOrderedSelectedVideos = useMemo(
    () => applyManualOrder(selectedVideos, manualOrderForSelectedPlaylist),
    [manualOrderForSelectedPlaylist, selectedVideos],
  );

  const filteredVideos = useMemo(() => {
    const search = videoSearch.trim().toLowerCase();
    const filtered = manuallyOrderedSelectedVideos.filter((video) => {
      const matchesSearch = video.title.toLowerCase().startsWith(search);
      const matchesStatus = videoStatusFilter === 'All statuses' || video.status === videoStatusFilter;
      return matchesSearch && matchesStatus;
    });

    return sortVideos(filtered, videoSortKey, videoSortDirection);
  }, [manuallyOrderedSelectedVideos, videoSearch, videoSortDirection, videoSortKey, videoStatusFilter]);

  const totalPages =
    rowsPerPage === 'All' ? 1 : Math.max(1, Math.ceil(filteredVideos.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const paginatedVideos =
    rowsPerPage === 'All'
      ? filteredVideos
      : filteredVideos.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const rangeText = getRangeText(filteredVideos.length, currentPage, rowsPerPage);
  const targetPlaylists = useMemo(() => {
    const search = targetSearch.trim().toLowerCase();
    const filtered = playlistsWithCounts.filter((playlist) => {
      const matchesSearch = playlist.title.toLowerCase().startsWith(search);
      const matchesStatus =
        targetStatusFilter === 'All playlist statuses' || playlist.status === targetStatusFilter;
      return matchesSearch && matchesStatus;
    });

    return sortPlaylists(filtered, targetSortKey, targetSortDirection);
  }, [playlistsWithCounts, targetSearch, targetSortDirection, targetSortKey, targetStatusFilter]);

  useEffect(() => {
    if (visiblePlaylists.length > 0 && !visiblePlaylists.some((playlist) => playlist.id === activePlaylistId)) {
      setActivePlaylistId(visiblePlaylists[0].id);
      setSelectedPlaylistIds([visiblePlaylists[0].id]);
      setPlaylistSelectionAnchorId(visiblePlaylists[0].id);
      setSelectedVideoIds([]);
      setPage(1);
    }
  }, [activePlaylistId, visiblePlaylists]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    function clearScopeOnOutsidePointer(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest('[data-active-list-scope]')) {
        setActiveListScope('none');
      }
    }

    document.addEventListener('pointerdown', clearScopeOnOutsidePointer, true);
    return () => document.removeEventListener('pointerdown', clearScopeOnOutsidePointer, true);
  });

  useEffect(() => {
    function handleSelectionShortcut(event: KeyboardEvent) {
      if (shouldIgnoreShortcutTarget(event.target)) return;

      const modifierPressed = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (document.querySelector('[data-dropdown-open="true"]')) {
        if (modifierPressed && key === 'a') {
          event.preventDefault();
        }
        return;
      }

      if (activeListScope === 'videoTable') {
        if (modifierPressed && key === 'a') {
          event.preventDefault();
          selectAllFilteredVideos();
          return;
        }
        if (modifierPressed && key === 'd') {
          event.preventDefault();
          clearVideoSelection();
          return;
        }
        if (modifierPressed && key === 'i') {
          event.preventDefault();
          invertFilteredVideoSelection();
        }
        return;
      }

      if (activeListScope === 'playlistList') {
        const visibleIds = visiblePlaylists.map((playlist) => playlist.id);
        if (modifierPressed && key === 'a') {
          event.preventDefault();
          setSelectedPlaylistIds(visibleIds);
          return;
        }
        if (modifierPressed && key === 'd') {
          event.preventDefault();
          setSelectedPlaylistIds([]);
          setPlaylistSelectionAnchorId(null);
          return;
        }
        if (modifierPressed && key === 'i') {
          event.preventDefault();
          invertSelection(visibleIds, setSelectedPlaylistIds);
        }
        return;
      }

      if (modifierPressed && key === 'a') {
        event.preventDefault();
        return;
      }

      if (activeListScope === 'copyTarget' || activeListScope === 'moveTarget') {
        if (event.key === 'Escape') {
          event.preventDefault();
          cancelWorkflow();
          return;
        }
        if (modifierPressed && key === 'd') {
          event.preventDefault();
          clearTargetSelection();
        }
      }
    }

    document.addEventListener('keydown', handleSelectionShortcut);
    return () => document.removeEventListener('keydown', handleSelectionShortcut);
  });

  function selectPlaylistWithModifiers(
    playlistId: string,
    modifiers: SelectionModifiers,
    visiblePlaylistIds: string[],
  ) {
    cancelWorkflow();
    setActiveListScope('playlistList');
    setActivePlaylistId(playlistId);
    setSelectedVideoIds([]);
    setVideoSelectionAnchorId(null);
    setTargetSelectionAnchorId(null);
    setPage(1);

    if (modifiers.shiftKey) {
      const rangeIds = getRangeIds(visiblePlaylistIds, playlistSelectionAnchorId, playlistId);
      setSelectedPlaylistIds((current) =>
        modifiers.ctrlKey || modifiers.metaKey ? mergeUnique(current, rangeIds) : rangeIds,
      );
    } else if (modifiers.ctrlKey || modifiers.metaKey || modifiers.checkboxToggle) {
      setSelectedPlaylistIds((current) =>
        current.includes(playlistId) ? current.filter((id) => id !== playlistId) : [...current, playlistId],
      );
    } else {
      setSelectedPlaylistIds([playlistId]);
    }

    setPlaylistSelectionAnchorId(playlistId);
  }

  function toggleAllFilteredVideos() {
    const filteredIds = filteredVideos.map((video) => video.id);
    const allFilteredSelected =
      filteredIds.length > 0 && filteredIds.every((videoId) => selectedVideoIds.includes(videoId));

    if (allFilteredSelected) {
      setSelectedVideoIds((current) => current.filter((videoId) => !filteredIds.includes(videoId)));
    } else {
      setSelectedVideoIds((current) => Array.from(new Set([...current, ...filteredIds])));
    }
  }

  function selectAllFilteredVideos() {
    const filteredIds = filteredVideos.map((video) => video.id);
    setSelectedVideoIds((current) => Array.from(new Set([...current, ...filteredIds])));
  }

  function clearVideoSelection() {
    setSelectedVideoIds([]);
    setVideoSelectionAnchorId(null);
  }

  function invertFilteredVideoSelection() {
    const filteredIds = filteredVideos.map((video) => video.id);
    const filteredSet = new Set(filteredIds);

    setSelectedVideoIds((current) => {
      const currentSet = new Set(current);
      const outsideFiltered = current.filter((videoId) => !filteredSet.has(videoId));
      const invertedFiltered = filteredIds.filter((videoId) => !currentSet.has(videoId));
      return [...outsideFiltered, ...invertedFiltered];
    });
  }

  function selectVideoWithModifiers(
    videoId: string,
    modifiers: SelectionModifiers,
    visibleVideoIds: string[],
  ) {
    setActiveListScope('videoTable');

    if (modifiers.shiftKey) {
      const rangeIds = getRangeIds(visibleVideoIds, videoSelectionAnchorId, videoId);
      setSelectedVideoIds((current) =>
        modifiers.ctrlKey || modifiers.metaKey ? mergeUnique(current, rangeIds) : rangeIds,
      );
    } else if (modifiers.ctrlKey || modifiers.metaKey || modifiers.checkboxToggle) {
      setSelectedVideoIds((current) =>
        current.includes(videoId) ? current.filter((id) => id !== videoId) : [...current, videoId],
      );
    } else {
      setSelectedVideoIds([videoId]);
    }

    setVideoSelectionAnchorId(videoId);
  }

  function updatePlaylistSort(nextSortKey: PlaylistSortKey) {
    if (nextSortKey === playlistSortKey) {
      setPlaylistSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setPlaylistSortKey(nextSortKey);
      setPlaylistSortDirection(nextSortKey === 'playlistName' ? 'asc' : 'desc');
    }
  }

  function updateTargetSort(nextSortKey: PlaylistSortKey) {
    if (nextSortKey === targetSortKey) {
      setTargetSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setTargetSortKey(nextSortKey);
      setTargetSortDirection(nextSortKey === 'playlistName' ? 'asc' : 'desc');
    }
  }

  function updateVideoSort(nextSortKey: VideoSortKey) {
    if (nextSortKey === videoSortKey && nextSortKey !== 'manual') {
      setVideoSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setVideoSortKey(nextSortKey);
      setVideoSortDirection(nextSortKey === 'dateAdded' || nextSortKey === 'manual' ? 'desc' : 'asc');
    }
    setPage(1);
  }

  function updateRowsPerPage(value: RowsPerPage) {
    setRowsPerPage(value);
    setPage(1);
  }

  function openTargetPicker(mode: TargetPickerMode) {
    if (selectedVideoIds.length === 0) return;
    beginTargetPicker(mode);
  }

  function beginTargetPicker(mode: TargetPickerMode) {
    setWorkspaceMode(mode);
    setActiveListScope(mode);
    setSelectedTargetPlaylistIds([]);
    setTargetSelectionAnchorId(null);
    setTargetSearch('');
    setTargetStatusFilter('All playlist statuses');
    setTargetSortKey('playlistName');
    setTargetSortDirection('asc');
  }

  function openContextVideoWorkflow(mode: TargetPickerMode, videoId: string) {
    const effectiveIds = selectedVideoIds.includes(videoId) ? selectedVideoIds : [videoId];
    setSelectedVideoIds(effectiveIds);
    setVideoSelectionAnchorId(videoId);
    beginTargetPicker(mode);
  }

  function cancelWorkflow() {
    setWorkspaceMode('videos');
    setSelectedTargetPlaylistIds([]);
    setTargetSelectionAnchorId(null);
    setActiveListScope('none');
  }

  function clearTargetSelection() {
    setSelectedTargetPlaylistIds([]);
    setTargetSelectionAnchorId(null);
  }

  function selectTargetPlaylist(
    playlistId: string,
    modifiers: SelectionModifiers,
    visibleTargetIds: string[],
  ) {
    const nextScope = workspaceMode === 'moveTarget' ? 'moveTarget' : 'copyTarget';
    setActiveListScope(nextScope);

    setSelectedTargetPlaylistIds((current) => {
      if (workspaceMode === 'moveTarget') {
        return [playlistId];
      }

      if (modifiers.shiftKey) {
        const rangeIds = getRangeIds(visibleTargetIds, targetSelectionAnchorId, playlistId);
        return modifiers.ctrlKey || modifiers.metaKey ? mergeUnique(current, rangeIds) : rangeIds;
      }

      if (modifiers.ctrlKey || modifiers.metaKey || modifiers.checkboxToggle) {
        return current.includes(playlistId)
          ? current.filter((id) => id !== playlistId)
          : [...current, playlistId];
      }

      return [playlistId];
    });
    setTargetSelectionAnchorId(playlistId);
  }

  function copySelectedVideos() {
    if (selectedTargetPlaylistIds.length === 0) return;

    setVideosByPlaylistId((current) => {
      const next = { ...current };
      for (const targetId of selectedTargetPlaylistIds) {
        const targetVideos = next[targetId] ?? [];
        const targetIds = new Set(targetVideos.map((video) => video.id));
        const videosToAdd = selectedVideoObjects.filter((video) => !targetIds.has(video.id));
        next[targetId] = [...targetVideos, ...videosToAdd];
      }
      return next;
    });

    setManualVideoOrderByPlaylistId((current) => {
      const next = { ...current };
      for (const targetId of selectedTargetPlaylistIds) {
        const existing = next[targetId] ?? (videosByPlaylistId[targetId] ?? []).map((video) => video.id);
        const existingSet = new Set(existing);
        next[targetId] = [
          ...existing,
          ...selectedVideoObjects.map((video) => video.id).filter((id) => !existingSet.has(id)),
        ];
      }
      return next;
    });

    setSelectedVideoIds([]);
    cancelWorkflow();
  }

  function moveSelectedVideos() {
    const targetId = selectedTargetPlaylistIds[0];
    if (!selectedPlaylist || !targetId) return;
    const selectedSet = new Set(selectedVideoIds);

    setVideosByPlaylistId((current) => {
      const sourceVideos = current[selectedPlaylist.id] ?? [];
      const targetVideos = current[targetId] ?? [];
      const targetIds = new Set(targetVideos.map((video) => video.id));
      const videosToMove = selectedVideoObjects.filter((video) => !targetIds.has(video.id));

      return {
        ...current,
        [selectedPlaylist.id]: sourceVideos.filter((video) => !selectedSet.has(video.id)),
        [targetId]: [...targetVideos, ...videosToMove],
      };
    });

    setManualVideoOrderByPlaylistId((current) => {
      const sourceOrder = current[selectedPlaylist.id] ?? selectedVideos.map((video) => video.id);
      const targetOrder = current[targetId] ?? (videosByPlaylistId[targetId] ?? []).map((video) => video.id);
      const targetSet = new Set(targetOrder);

      return {
        ...current,
        [selectedPlaylist.id]: sourceOrder.filter((videoId) => !selectedSet.has(videoId)),
        [targetId]: [
          ...targetOrder,
          ...selectedVideoObjects.map((video) => video.id).filter((videoId) => !targetSet.has(videoId)),
        ],
      };
    });

    setSelectedVideoIds([]);
    cancelWorkflow();
  }

  function removeSelectedVideos() {
    removeVideoIds(selectedVideoIds);
  }

  function requestRemoveVideos(videoIds: string[]) {
    if (videoIds.length === 0) return;
    if (settings.confirmDestructiveActions) {
      setDialog({ type: 'removeVideos', videoIds });
    } else {
      removeVideoIds(videoIds);
    }
  }

  function requestDeletePlaylists(playlistIds: string[]) {
    if (playlistIds.length === 0) return;
    if (settings.confirmDestructiveActions) {
      setDialog({ type: 'deletePlaylists', playlistIds });
    } else {
      deletePlaylists(playlistIds);
    }
  }

  function removeVideoIds(videoIds: string[]) {
    if (!selectedPlaylist || videoIds.length === 0) return;
    const selectedSet = new Set(videoIds);

    setVideosByPlaylistId((current) => ({
      ...current,
      [selectedPlaylist.id]: (current[selectedPlaylist.id] ?? []).filter((video) => !selectedSet.has(video.id)),
    }));
    setManualVideoOrderByPlaylistId((current) => ({
      ...current,
      [selectedPlaylist.id]: (current[selectedPlaylist.id] ?? selectedVideos.map((video) => video.id)).filter(
        (videoId) => !selectedSet.has(videoId),
      ),
    }));
    setSelectedVideoIds([]);
    setVideoSelectionAnchorId(null);
    cancelWorkflow();
  }

  function renamePlaylist(playlistId: string, title: string) {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    setPlaylistRows((current) =>
      current.map((playlist) =>
        playlist.id === playlistId ? { ...playlist, title: trimmedTitle } : playlist,
      ),
    );
    setDialog(null);
  }

  function duplicatePlaylist(playlistId: string, title: string) {
    const source = playlistRows.find((playlist) => playlist.id === playlistId);
    const trimmedTitle = title.trim();
    if (!source || !trimmedTitle) return;

    const duplicateId = `${playlistId}-copy-${Date.now()}`;
    const copiedVideos = (videosByPlaylistId[playlistId] ?? []).map((video) => ({ ...video }));

    setPlaylistRows((current) => [
      ...current,
      {
        ...source,
        id: duplicateId,
        title: trimmedTitle,
        videoCount: copiedVideos.length,
        lastSynced: 'Just now',
        pinned: false,
      },
    ]);
    setVideosByPlaylistId((current) => ({
      ...current,
      [duplicateId]: copiedVideos,
    }));
    setManualVideoOrderByPlaylistId((current) => ({
      ...current,
      [duplicateId]: copiedVideos.map((video) => video.id),
    }));
    setDialog(null);
  }

  function deletePlaylists(playlistIds: string[]) {
    const idSet = new Set(playlistIds);
    const remainingPlaylists = playlistRows.filter((playlist) => !idSet.has(playlist.id));
    setPlaylistRows(remainingPlaylists);
    setVideosByPlaylistId((current) => {
      const next = { ...current };
      for (const playlistId of playlistIds) {
        delete next[playlistId];
      }
      return next;
    });
    setManualVideoOrderByPlaylistId((current) => {
      const next = { ...current };
      for (const playlistId of playlistIds) {
        delete next[playlistId];
      }
      return next;
    });
    setSelectedPlaylistIds((current) => current.filter((playlistId) => !idSet.has(playlistId)));
    if (idSet.has(activePlaylistId)) {
      const nextPlaylistId = remainingPlaylists[0]?.id ?? '';
      setActivePlaylistId(nextPlaylistId);
      setSelectedPlaylistIds(nextPlaylistId ? [nextPlaylistId] : []);
      setPlaylistSelectionAnchorId(nextPlaylistId || null);
      setSelectedVideoIds([]);
      cancelWorkflow();
    }
    setDialog(null);
  }

  function togglePinnedPlaylist(playlistId: string) {
    setPlaylistRows((current) =>
      current.map((playlist) =>
        playlist.id === playlistId ? { ...playlist, pinned: !playlist.pinned } : playlist,
      ),
    );
  }

  function pinPlaylists(playlistIds: string[]) {
    const idSet = new Set(playlistIds);
    setPlaylistRows((current) =>
      current.map((playlist) => (idSet.has(playlist.id) ? { ...playlist, pinned: true } : playlist)),
    );
  }

  function getEffectiveVideoIds(videoId: string) {
    return selectedVideoIds.includes(videoId) ? selectedVideoIds : [videoId];
  }

  function openVideoUrl(videoId: string) {
    const video = selectedVideos.find((item) => item.id === videoId);
    const url = video?.url ?? `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function showNotImplemented(title: string) {
    setDialog({
      type: 'notImplemented',
      title,
      message: 'This action is part of the mock UI shell and is not implemented yet.',
    });
  }

  function openPlaylistContextMenu(playlistId: string, x: number, y: number) {
    const effectivePlaylistIds = selectedPlaylistIds.includes(playlistId) ? selectedPlaylistIds : [playlistId];
    const multiSelect = effectivePlaylistIds.length > 1;

    setContextMenu({
      x,
      y,
      items: multiSelect
        ? [
            {
              label: 'Pin',
              onSelect: () => pinPlaylists(effectivePlaylistIds),
            },
            {
              label: 'Delete',
              destructive: true,
              onSelect: () => requestDeletePlaylists(effectivePlaylistIds),
            },
            { label: 'Export', disabled: true, onSelect: () => showNotImplemented('Export playlists') },
          ]
        : [
            {
              label: 'Rename',
              onSelect: () => {
                const playlist = playlistRows.find((item) => item.id === playlistId);
                if (playlist) {
                  setDialog({ type: 'renamePlaylist', playlistId, value: playlist.title });
                }
              },
            },
            {
              label: 'Pin',
              onSelect: () => togglePinnedPlaylist(playlistId),
            },
            {
              label: 'Duplicate',
              onSelect: () => {
                const playlist = playlistRows.find((item) => item.id === playlistId);
                if (playlist) {
                  setDialog({
                    type: 'duplicatePlaylist',
                    playlistId,
                    value: `${playlist.title} Copy`,
                  });
                }
              },
            },
            {
              label: 'Delete',
              destructive: true,
              onSelect: () => requestDeletePlaylists([playlistId]),
            },
            { label: 'Export', onSelect: () => setDialog({ type: 'exportPlaylist', playlistId }) },
            { label: 'Stats', onSelect: () => setDialog({ type: 'playlistStats', playlistId }) },
          ],
    });
  }
  function openVideoContextMenu(videoId: string, x: number, y: number) {
    setContextMenu({
      x,
      y,
      items: [
        { label: 'Open video URL', onSelect: () => openVideoUrl(videoId) },
        { label: 'Copy', onSelect: () => openContextVideoWorkflow('copyTarget', videoId) },
        { label: 'Move', onSelect: () => openContextVideoWorkflow('moveTarget', videoId) },
        {
          label: 'Remove',
          destructive: true,
          onSelect: () => requestRemoveVideos(getEffectiveVideoIds(videoId)),
        },
        { label: 'Export', disabled: true, onSelect: () => showNotImplemented('Export video') },
        { label: 'Stats', disabled: true, onSelect: () => showNotImplemented('Video stats') },
      ],
    });
  }

  function reorderVisibleVideos(draggedVideoId: string, targetVideoId: string | null) {
    if (!selectedPlaylist) return;

    setManualVideoOrderByPlaylistId((current) => {
      const existingOrder = current[selectedPlaylist.id] ?? selectedVideos.map((video) => video.id);
      const visiblePageIds = paginatedVideos.map((video) => video.id);
      const reorderedVisibleIds = targetVideoId
        ? moveItemBefore(visiblePageIds, draggedVideoId, targetVideoId)
        : moveItemToEnd(visiblePageIds, draggedVideoId);
      const visibleSet = new Set(visiblePageIds);
      let replacementIndex = 0;

      return {
        ...current,
        [selectedPlaylist.id]: existingOrder.map((videoId) => {
          if (!visibleSet.has(videoId)) {
            return videoId;
          }
          const replacement = reorderedVisibleIds[replacementIndex] ?? videoId;
          replacementIndex += 1;
          return replacement;
        }),
      };
    });
  }

  function renderDialog() {
    if (!dialog) return null;

    if (dialog.type === 'renamePlaylist') {
      return (
        <AppDialog
          title="Rename playlist"
          description="Update the mock playlist title."
          inputLabel="Playlist name"
          inputValue={dialog.value}
          actions={[
            { label: 'Cancel', onClick: () => setDialog(null) },
            {
              label: 'Save name',
              variant: 'primary',
              disabled: dialog.value.trim().length === 0,
              onClick: () => renamePlaylist(dialog.playlistId, dialog.value),
            },
          ]}
          onClose={() => setDialog(null)}
          onInputChange={(value) => setDialog({ ...dialog, value })}
          onSubmit={() => {
            if (dialog.value.trim().length > 0) {
              renamePlaylist(dialog.playlistId, dialog.value);
            }
          }}
        />
      );
    }

    if (dialog.type === 'duplicatePlaylist') {
      return (
        <AppDialog
          title="Duplicate playlist"
          description="Create a mock copy with its own video list."
          inputLabel="New playlist name"
          inputValue={dialog.value}
          actions={[
            { label: 'Cancel', onClick: () => setDialog(null) },
            {
              label: 'Duplicate',
              variant: 'primary',
              disabled: dialog.value.trim().length === 0,
              onClick: () => duplicatePlaylist(dialog.playlistId, dialog.value),
            },
          ]}
          onClose={() => setDialog(null)}
          onInputChange={(value) => setDialog({ ...dialog, value })}
          onSubmit={() => {
            if (dialog.value.trim().length > 0) {
              duplicatePlaylist(dialog.playlistId, dialog.value);
            }
          }}
        />
      );
    }

    if (dialog.type === 'deletePlaylists') {
      const count = dialog.playlistIds.length;
      const playlistTitle =
        count === 1
          ? playlistRows.find((playlist) => playlist.id === dialog.playlistIds[0])?.title ?? 'this playlist'
          : null;
      return (
        <AppDialog
          title={
            count === 1
              ? `Delete playlist "${playlistTitle}"?`
              : `Delete ${count} playlists?`
          }
          description={
            count === 1
              ? 'This only deletes the playlist from the mock UI state.'
              : 'This only deletes these playlists from the mock UI state.'
          }
          actions={[
            ...(count > 1
              ? [
                  {
                    label: 'List of playlists',
                    onClick: () => setDialog({ type: 'playlistSelectionList', playlistIds: dialog.playlistIds }),
                  },
                ]
              : []),
            { label: 'Cancel', onClick: () => setDialog(null) },
            {
              label: count === 1 ? 'Delete playlist' : 'Delete playlists',
              variant: 'danger',
              onClick: () => deletePlaylists(dialog.playlistIds),
            },
          ]}
          onClose={() => setDialog(null)}
        />
      );
    }

    if (dialog.type === 'playlistSelectionList') {
      const selectedTitles = playlistRows
        .filter((playlist) => dialog.playlistIds.includes(playlist.id))
        .map((playlist) => playlist.title);
      return (
        <AppDialog
          title="Selected playlists"
          description={selectedTitles.map((title) => `• ${title}`).join('\n')}
          actions={[{ label: 'Close', variant: 'primary', onClick: () => setDialog(null) }]}
          onClose={() => setDialog(null)}
        />
      );
    }

    if (dialog.type === 'removeVideos') {
      const count = dialog.videoIds.length;
      const video = selectedVideos.find((item) => item.id === dialog.videoIds[0]);
      const title =
        count === 1 && video
          ? `Remove "${video.title}" from ${selectedPlaylist?.title ?? 'playlist'}?`
          : `Remove ${count} ${count === 1 ? 'video' : 'videos'} from ${selectedPlaylist?.title ?? 'playlist'}?`;
      return (
        <AppDialog
          title={title}
          description="This only changes the mock playlist data in this UI shell."
          actions={[
            { label: 'Cancel', onClick: () => setDialog(null) },
            {
              label: 'Remove from playlist',
              variant: 'danger',
              onClick: () => {
                removeVideoIds(dialog.videoIds);
                setDialog(null);
              },
            },
          ]}
          onClose={() => setDialog(null)}
        />
      );
    }

    if (dialog.type === 'playlistStats' || dialog.type === 'exportPlaylist') {
      const playlist = playlistsWithCounts.find((item) => item.id === dialog.playlistId);
      if (!playlist) return null;
      const videos = videosByPlaylistId[playlist.id] ?? [];
      return dialog.type === 'playlistStats' ? (
        <PlaylistStatsPopup playlist={playlist} videos={videos} onClose={() => setDialog(null)} />
      ) : (
        <ExportPlaylistPopup playlist={playlist} onClose={() => setDialog(null)} />
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
        <h1 className="text-[29px] font-bold tracking-[-0.035em] text-mist-50">Playlists</h1>
        <p className="mt-1 text-[16px] text-mist-200">
          Browse, search, and manage your YouTube playlists.
        </p>
      </header>

      <PlaylistPageToolbar
        search={playlistSearch}
        statusFilter={playlistStatusFilter}
        sortKey={playlistSortKey}
        sortDirection={playlistSortDirection}
        onSearchChange={(value) => {
          setPlaylistSearch(value);
          setPage(1);
        }}
        onStatusFilterChange={(value) => {
          setPlaylistStatusFilter(value);
          setPage(1);
        }}
        onSortSelect={updatePlaylistSort}
      />

      <div className="grid min-h-0 flex-1 grid-cols-[360px_minmax(0,1fr)] gap-4">
        <PlaylistListPanel
          playlists={visiblePlaylists}
          selectedId={selectedPlaylist?.id ?? ''}
          selectedIds={selectedPlaylistIds}
          onActivate={() => setActiveListScope('playlistList')}
          onSelect={selectPlaylistWithModifiers}
          onOpenContextMenu={openPlaylistContextMenu}
        />
        {selectedPlaylist && (workspaceMode === 'copyTarget' || workspaceMode === 'moveTarget') ? (
          <TargetPlaylistPicker
            mode={workspaceMode}
            sourcePlaylist={selectedPlaylist}
            playlists={targetPlaylists}
            playlistVideosByPlaylistId={videosByPlaylistId}
            selectedVideoIds={selectedVideoIds}
            selectedTargetIds={selectedTargetPlaylistIds}
            search={targetSearch}
            statusFilter={targetStatusFilter}
            sortKey={targetSortKey}
            sortDirection={targetSortDirection}
            onSearchChange={setTargetSearch}
            onStatusFilterChange={setTargetStatusFilter}
            onSortSelect={updateTargetSort}
            onActivate={() => setActiveListScope(workspaceMode)}
            onSelectTarget={selectTargetPlaylist}
            onOpenPlaylistContextMenu={openPlaylistContextMenu}
            onConfirm={workspaceMode === 'copyTarget' ? copySelectedVideos : moveSelectedVideos}
            onCancel={cancelWorkflow}
          />
        ) : selectedPlaylist ? (
          <PlaylistDetailPanel
            playlist={selectedPlaylist}
            totalPlaylistVideos={selectedVideos.length}
            videos={paginatedVideos}
            filteredVideos={filteredVideos}
            totalFilteredVideos={filteredVideos.length}
            rowsPerPage={rowsPerPage}
            rangeText={rangeText}
            page={currentPage}
            totalPages={totalPages}
            videoSearch={videoSearch}
            videoStatusFilter={videoStatusFilter}
            videoSortKey={videoSortKey}
            videoSortDirection={videoSortDirection}
            selectedVideoIds={selectedVideoIds}
            onVideoSearchChange={(value) => {
              setVideoSearch(value);
              setPage(1);
            }}
            onVideoStatusFilterChange={(value) => {
              setVideoStatusFilter(value);
              setPage(1);
            }}
            onVideoSortSelect={updateVideoSort}
            onActivateVideoTable={() => setActiveListScope('videoTable')}
            onSelectVideo={selectVideoWithModifiers}
            onOpenVideoContextMenu={openVideoContextMenu}
            onOpenPlaylistContextMenu={openPlaylistContextMenu}
            onToggleAllFiltered={toggleAllFilteredVideos}
            onRowsPerPageChange={updateRowsPerPage}
            onPreviousPage={() => setPage((current) => Math.max(1, current - 1))}
            onNextPage={() => setPage((current) => Math.min(totalPages, current + 1))}
            manualSortActive={videoSortKey === 'manual'}
            onReorderVisibleVideos={reorderVisibleVideos}
            onCopySelected={() => openTargetPicker('copyTarget')}
            onMoveSelected={() => openTargetPicker('moveTarget')}
            onRemoveSelected={() => requestRemoveVideos(selectedVideoIds)}
            onClearSelection={() => setSelectedVideoIds([])}
            removeConfirmActive={workspaceMode === 'removeConfirm'}
            onConfirmRemove={removeSelectedVideos}
            onCancelRemove={cancelWorkflow}
          />
        ) : (
          <EmptyPlaylistDetailPanel />
        )}
      </div>
    </div>
    <ContextMenu menu={contextMenu} onClose={() => setContextMenu(null)} />
    {renderDialog()}
    </>
  );
}

function sortVideos(videos: PlaylistVideo[], sortKey: VideoSortKey, direction: SortDirection) {
  const directionMultiplier = direction === 'asc' ? 1 : -1;
  const statusOrder = ['Deleted', 'Private', 'Public', 'Unavailable', 'Unlisted'];

  return [...videos].sort((a, b) => {
    if (sortKey === 'manual') {
      return 0;
    }
    if (sortKey === 'videoTitle') {
      return a.title.localeCompare(b.title) * directionMultiplier;
    }
    if (sortKey === 'channel') {
      return a.channel.localeCompare(b.channel) * directionMultiplier;
    }
    if (sortKey === 'duration') {
      return (parseDuration(a.duration) - parseDuration(b.duration)) * directionMultiplier;
    }
    if (sortKey === 'status') {
      return (statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)) * directionMultiplier;
    }
    return (Date.parse(a.dateAdded) - Date.parse(b.dateAdded)) * directionMultiplier;
  });
}

function sortPlaylists(
  playlists: PlaylistViewRecord[],
  sortKey: PlaylistSortKey,
  direction: SortDirection,
) {
  const directionMultiplier = direction === 'asc' ? 1 : -1;

  return [...playlists].sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1;
    }
    if (sortKey === 'playlistName') {
      return a.title.localeCompare(b.title) * directionMultiplier;
    }
    if (sortKey === 'videoCount') {
      return (a.videoCount - b.videoCount) * directionMultiplier;
    }
    if (sortKey === 'totalDuration') {
      return (a.totalDurationSeconds - b.totalDurationSeconds) * directionMultiplier;
    }
    return (a.originalIndex - b.originalIndex) * directionMultiplier;
  });
}

function applyManualOrder(videos: PlaylistVideo[], manualOrder: string[]) {
  const videoById = new Map(videos.map((video) => [video.id, video]));
  const orderedVideos = manualOrder
    .map((videoId) => videoById.get(videoId))
    .filter((video): video is PlaylistVideo => Boolean(video));
  const orderedIds = new Set(orderedVideos.map((video) => video.id));
  return [...orderedVideos, ...videos.filter((video) => !orderedIds.has(video.id))];
}

function moveItemBefore(items: string[], draggedId: string, targetId: string) {
  if (draggedId === targetId) {
    return items;
  }

  const withoutDragged = items.filter((item) => item !== draggedId);
  const targetIndex = withoutDragged.indexOf(targetId);

  if (targetIndex === -1) {
    return items;
  }

  return [
    ...withoutDragged.slice(0, targetIndex),
    draggedId,
    ...withoutDragged.slice(targetIndex),
  ];
}

function moveItemToEnd(items: string[], draggedId: string) {
  if (!items.includes(draggedId)) {
    return items;
  }

  return [...items.filter((item) => item !== draggedId), draggedId];
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

function getRangeIds(orderedIds: string[], anchorId: string | null, clickedId: string) {
  const clickedIndex = orderedIds.indexOf(clickedId);
  const anchorIndex = anchorId ? orderedIds.indexOf(anchorId) : -1;

  if (clickedIndex === -1) {
    return [];
  }
  if (anchorIndex === -1) {
    return [clickedId];
  }

  const start = Math.min(anchorIndex, clickedIndex);
  const end = Math.max(anchorIndex, clickedIndex);
  return orderedIds.slice(start, end + 1);
}

function shouldIgnoreShortcutTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]'));
}

function parseDuration(duration: string) {
  return duration
    .split(':')
    .map(Number)
    .reduce((total, part) => total * 60 + part, 0);
}

function getRangeText(total: number, page: number, rowsPerPage: RowsPerPage) {
  if (total === 0) {
    return '0 of 0';
  }
  if (rowsPerPage === 'All') {
    return `1–${total} of ${total}`;
  }

  const start = (page - 1) * rowsPerPage + 1;
  const end = Math.min(page * rowsPerPage, total);
  return `${start}–${end} of ${total}`;
}
