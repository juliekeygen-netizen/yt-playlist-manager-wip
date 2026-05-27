import { Copy, FolderInput, Trash2, X } from 'lucide-react';

export function SelectionActionBar({
  selectedCount,
  onClear,
  onCopy,
  onMove,
  onRemove,
}: {
  selectedCount: number;
  onClear: () => void;
  onCopy: () => void;
  onMove: () => void;
  onRemove: () => void;
}) {
  const hasSelection = selectedCount > 0;
  const disabledActionClass = hasSelection
    ? ''
    : 'cursor-not-allowed opacity-45 hover:bg-transparent hover:text-inherit';

  return (
    <section
      className={`mx-4 mb-0 flex h-11 shrink-0 items-center overflow-hidden rounded-md border border-white/[0.075] bg-white/[0.045] text-sm ${
        hasSelection ? 'text-mist-200' : 'text-mist-500'
      }`}
    >
      <div
        className={`flex h-full items-center gap-2 border-r border-white/[0.055] px-4 ${
          hasSelection ? 'text-blue-300' : 'text-mist-500'
        }`}
      >
        <span
          className={`h-4 w-4 rounded border ${
            hasSelection ? 'border-blue-400/70 bg-blue-500/20' : 'border-mist-600 bg-white/[0.025]'
          }`}
        />
        {selectedCount} selected
      </div>
      <button
        className={`flex h-full items-center gap-2 px-4 transition hover:bg-white/[0.06] hover:text-white ${disabledActionClass}`}
        disabled={!hasSelection}
        onClick={hasSelection ? onCopy : undefined}
      >
        <Copy size={17} />
        Copy
      </button>
      <button
        className={`flex h-full items-center gap-2 px-4 transition hover:bg-white/[0.06] hover:text-white ${disabledActionClass}`}
        disabled={!hasSelection}
        onClick={hasSelection ? onMove : undefined}
      >
        <FolderInput size={17} />
        Move
      </button>
      <button
        className={`flex h-full items-center gap-2 px-4 transition ${
          hasSelection ? 'text-red-300 hover:bg-red-500/10 hover:text-red-200' : disabledActionClass
        }`}
        disabled={!hasSelection}
        onClick={hasSelection ? onRemove : undefined}
      >
        <Trash2 size={17} />
        Remove
      </button>
      <button
        className={`ml-auto flex h-full items-center gap-2 px-4 transition hover:bg-white/[0.06] hover:text-white ${disabledActionClass}`}
        disabled={!hasSelection}
        onClick={hasSelection ? onClear : undefined}
      >
        <X size={17} />
        Clear selection
      </button>
    </section>
  );
}
